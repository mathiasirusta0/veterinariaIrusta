import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3005;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiEnabled: !!process.env.GEMINI_API_KEY,
  });
});

// AI Assistance Endpoint for Clinical Veterinary Workflows
app.post('/api/ai/assist', async (req, res) => {
  const { prompt, type, patientData } = req.body;

  try {
    const ai = getGeminiClient();
    if (!ai) {
      // Return smart simulated clinical template if no API key is set yet
      return res.json({
        success: true,
        text: generateFallbackClinicalAI(type, prompt, patientData),
        simulated: true,
      });
    }

    let systemInstruction = `Sos el Asistente Clínico Inteligente de VET SYSTEM, un software hospitalario veterinario de élite en español.
Tus respuestas deben ser profesionales, rigurosas en terminología médica veterinaria, concisas, estructuradas y orientadas a la práctica clínica.
IMPORTANTE: Nunca emitas un diagnóstico definitivo ni prescribas sin aclarar que toda sugerencia requiere validación del médico veterinario a cargo.`;

    if (type === 'soap_draft') {
      systemInstruction += `\nGenerá un borrador de Consulta SOAP basado en los datos brindados (S - Subjetivo, O - Objetivo con examen físico y signos, A - Evaluación/Diagnósticos diferenciales, P - Plan terapéutico y estudios sugeridos). Formatealo claramente.`;
    } else if (type === 'shift_handover') {
      systemInstruction += `\nGenerá un Pase de Guardia Hospitalario conciso y estructurado para el cambio de turno veterinario (Estado del paciente, alertas críticas, medicaciones administradas vs pendientes, fluidoterapia, evolución y tareas clave para el próximo turno).`;
    } else if (type === 'owner_summary') {
      systemInstruction += `\nRedactá una explicación clara, empática y en lenguaje comprensible para los dueños de la mascota, resumiendo el diagnóstico, cuidados en casa, signos de alarma y próximas citas o medicamentos.`;
    } else if (type === 'triage_assessment') {
      systemInstruction += `\nAnalizá los signos y motivo de consulta y sugerí una clasificación de Triage (Normal, Prioritario, Urgente, Crítico) con fundamentación médica rápida.`;
    }

    const contents = `Tipo de tarea: ${type || 'consulta_clinica'}
Datos del Paciente: ${JSON.stringify(patientData || {})}
Solicitud/Detalle: ${prompt || 'Elaborar reporte clínico correspondiente'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    return res.json({
      success: true,
      text: response.text || 'Sin respuesta del modelo.',
    });
  } catch (error: any) {
    console.error('Error in /api/ai/assist:', error);
    // Graceful fallback so clinical UI is never blocked
    return res.json({
      success: true,
      text: generateFallbackClinicalAI(type, prompt, patientData),
      simulated: true,
      errorNotice: error?.message,
    });
  }
});

function generateFallbackClinicalAI(type?: string, prompt?: string, patientData?: any): string {
  const petName = patientData?.name || 'Paciente';
  const species = patientData?.species || 'Canino';
  const breed = patientData?.breed || 'Mestizo';

  switch (type) {
    case 'soap_draft':
      return `### 📋 Borrador SOAP Sugerido para ${petName} (${species} - ${breed})

**S - Subjetivo:**
Propietario refiere cuadro compatible con la consulta. Se observa decaimiento y síntomas informados.

**O - Objetivo:**
- Frecuencia Cardíaca y Respiratoria en rangos de evaluación.
- Mucosas normocoloreadas a levemente pálidas. TLLC: 2 segundos.
- Palpación abdominal: leve tensión epigástrica.

**A - Evaluación / Diagnósticos Diferenciales:**
1. Gastroenteritis aguda (infecciosa / dietaria).
2. Cuadro obstructivo por cuerpo extraño o indiscreción alimentaria.
3. Pancreatitis reactiva.

**P - Plan Terapéutico:**
- Realizar Hemograma completo + Bioquímica sanguínea + Ecografía abdominal.
- Instaurar fluidoterapia con Ringer Lactato / Cloruro de Sodio 0.9% según deshidratación.
- Terapia antiemética (Maropitant 1 mg/kg SC) y protector gástrico (Omeprazol / Ranitidina).
- Dieta blanda gastrointestinal post estabilización. Control en 24-48 hs.`;

    case 'shift_handover':
      return `### 🏥 Resumen para Pase de Guardia - ${petName}
- **Estado General:** Monitoreo activo en internación.
- **Fluidoterapia:** Ringer Lactato a flujo indicado. Bomba verificada.
- **Tratamientos Realizados:** Antibioticoterapia y analgésicos según protocolo.
- **Pendientes para Próximo Turno:** Control de signos vitales (temperatura + glucemia), administración de protector gástrico a las 20:00 hs y valoración de micción/defecación.
- **Alertas Clínicas:** Monitorear dolor abdominal y tolerancia a ingesta.`;

    case 'owner_summary':
      return `Estimada familia de ${petName}:
Hoy evaluamos a ${petName}. Se encuentra recibiendo atención médica y los cuidados necesarios para su pronta recuperación.
Le indicamos medicación específica para aliviar su malestar y proteger su sistema digestivo.

**Indicaciones en casa:**
1. Administrar los medicamentos en los horarios indicados en la receta.
2. Ofrecer agua fresca en pequeñas cantidades constantes y dieta suave recomendada.
3. Si observa vómitos persistentes, decaimiento marcado o falta de aire, comuníquese inmediatamente con nuestra guardia 24hs.`;

    case 'triage_assessment':
      return `### 🟡 Evaluación de Triage
- **Prioridad Sugerida:** PRIORITARIO (Amarillo)
- **Criterio:** El paciente presenta signos que requieren atención dentro de los próximos 30-45 minutos para evitar descompensación hemodinámica.`;

    default:
      return `Análisis veterinario para ${petName}: Se sugiere continuar con el plan terapéutico establecido, verificar balance hídrico y registrar evolución en la historia clínica.`;
  }
}

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏥 VET SYSTEM Backend & UI running on http://localhost:${PORT}`);
  });
}

startServer();
