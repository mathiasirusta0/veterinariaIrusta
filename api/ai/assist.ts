import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  authorizeClinicalAi,
  ClinicalAiError,
  enforceClinicalAiRateLimit,
  generateClinicalAssistance,
} from '../../server/clinicalAi';

interface ApiRequest extends IncomingMessage {
  body?: unknown;
}

export default async function handler(req: ApiRequest, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Allow', 'POST');
    return res.end(JSON.stringify({ success: false, error: 'Método no permitido.' }));
  }

  try {
    const userId = await authorizeClinicalAi(req.headers.authorization);
    enforceClinicalAiRateLimit(userId);
    const text = await generateClinicalAssistance(req.body);
    res.statusCode = 200;
    return res.end(JSON.stringify({ success: true, text }));
  } catch (error) {
    const statusCode = error instanceof ClinicalAiError ? error.statusCode : 502;
    const message = error instanceof ClinicalAiError ? error.message : 'No fue posible generar la asistencia clínica.';
    if (!(error instanceof ClinicalAiError)) console.error('[AI] Error del proveedor:', error);
    res.statusCode = statusCode;
    return res.end(JSON.stringify({ success: false, error: message }));
  }
}
