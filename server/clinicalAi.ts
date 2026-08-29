import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_TASKS = ['soap_draft', 'shift_handover', 'owner_summary', 'triage_assessment'] as const;
type ClinicalAiTask = (typeof ALLOWED_TASKS)[number];

const CLINICAL_ROLES = new Set([
  'SUPERADMIN',
  'ADMINISTRADOR',
  'DIRECTOR_MEDICO',
  'VETERINARIO',
  'ESPECIALISTA',
  'ENFERMERIA',
]);

const requestBuckets = new Map<string, { count: number; resetAt: number }>();

export class ClinicalAiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number
  ) {
    super(message);
  }
}

function getBearerToken(authorizationHeader?: string): string {
  const match = authorizationHeader?.match(/^Bearer\s+(.+)$/i);
  if (!match?.[1]) throw new ClinicalAiError('Sesión requerida.', 401);
  return match[1];
}

export async function authorizeClinicalAi(authorizationHeader?: string): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new ClinicalAiError('Autenticación del servidor no configurada.', 503);
  }

  const token = getBearerToken(authorizationHeader);
  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await client.auth.getUser(token);
  if (authError || !authData.user) throw new ClinicalAiError('Sesión inválida o vencida.', 401);

  const { data: profile, error: profileError } = await client
    .from('profiles')
    .select('role, active')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (profileError || !profile || profile.active === false) {
    throw new ClinicalAiError('Perfil profesional no habilitado.', 403);
  }
  if (!CLINICAL_ROLES.has(profile.role)) {
    throw new ClinicalAiError('El rol actual no puede usar asistencia clínica.', 403);
  }

  return authData.user.id;
}

export function enforceClinicalAiRateLimit(userId: string): void {
  const now = Date.now();
  const current = requestBuckets.get(userId);
  if (!current || current.resetAt <= now) {
    requestBuckets.set(userId, { count: 1, resetAt: now + 5 * 60_000 });
    return;
  }
  if (current.count >= 20) {
    throw new ClinicalAiError('Límite temporal de solicitudes alcanzado. Intente más tarde.', 429);
  }
  current.count += 1;
}

function validateInput(body: unknown): { type: ClinicalAiTask; prompt: string; patientData: Record<string, unknown> } {
  if (!body || typeof body !== 'object') throw new ClinicalAiError('Solicitud inválida.', 400);
  const raw = body as Record<string, unknown>;
  const type = String(raw.type || '') as ClinicalAiTask;
  const prompt = String(raw.prompt || '').trim();
  const patientData = raw.patientData && typeof raw.patientData === 'object'
    ? (raw.patientData as Record<string, unknown>)
    : {};

  if (!ALLOWED_TASKS.includes(type)) throw new ClinicalAiError('Tipo de asistencia no permitido.', 400);
  if (!prompt || prompt.length > 5_000) throw new ClinicalAiError('El detalle debe tener entre 1 y 5.000 caracteres.', 400);
  if (JSON.stringify(patientData).length > 30_000) throw new ClinicalAiError('Los datos clínicos exceden el límite permitido.', 413);

  return { type, prompt, patientData };
}

export async function generateClinicalAssistance(body: unknown): Promise<string> {
  const { type, prompt, patientData } = validateInput(body);
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ClinicalAiError('La asistencia clínica no está configurada.', 503);

  const taskInstructions: Record<ClinicalAiTask, string> = {
    soap_draft: 'Generá un borrador SOAP, separando claramente datos aportados, inferencias y datos faltantes.',
    shift_handover: 'Generá un pase de guardia conciso con estado, alertas, medicación documentada, pendientes y tareas.',
    owner_summary: 'Redactá un resumen empático para el tutor usando solo los hechos aportados y señalando signos de alarma.',
    triage_assessment: 'Sugerí prioridad de triage con fundamento, datos faltantes y criterios explícitos de escalamiento.',
  };

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: `Datos clínicos estructurados: ${JSON.stringify(patientData)}\nSolicitud profesional: ${prompt}`,
    config: {
      systemInstruction: `Sos un asistente de documentación clínica veterinaria en español. ${taskInstructions[type]}
No inventes signos, resultados, diagnósticos, dosis ni tratamientos. Si falta información, indicalo expresamente.
No reemplazás el criterio del médico veterinario y toda salida debe ser revisada y firmada por un profesional.`,
      temperature: 0.2,
    },
  });

  const text = response.text?.trim();
  if (!text) throw new ClinicalAiError('El proveedor no devolvió contenido utilizable.', 502);
  return text;
}
