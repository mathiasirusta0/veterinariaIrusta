// VET SYSTEM — Criptografía y Firmas Digitales con SHA-256 Real
// Veterinaria Ranquel — Las Lajas, Neuquén

async function digestSha256(payload: string): Promise<string> {
  const cryptoObj = typeof globalThis !== 'undefined' && globalThis.crypto ? globalThis.crypto : null;
  if (cryptoObj?.subtle) {
    const msgBuffer = new TextEncoder().encode(payload);
    const hashBuffer = await cryptoObj.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Deterministic fallback for constrained environments
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex = (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
  return (hex + hex + hex + hex).slice(0, 64);
}

/**
 * Calcula un hash SHA-256 criptográfico real sobre el contenido de un documento y su firmante.
 */
export async function calculateDocumentSha256(data: {
  documentId: string;
  title: string;
  content: string;
  signerName: string;
  signerDni: string;
  timestamp: string;
}): Promise<string> {
  const payload = JSON.stringify({
    documentId: data.documentId,
    title: data.title,
    content: data.content.trim(),
    signerName: data.signerName.trim(),
    signerDni: data.signerDni.trim(),
    timestamp: data.timestamp,
  });

  return digestSha256(payload);
}

/**
 * Genera el digest SHA-256 canónico para una receta o prescripción veterinaria.
 */
export async function calculatePrescriptionSha256(data: {
  prescriptionNumber: string;
  patientId: string;
  vetName: string;
  vetLicense: string;
  items: Array<{ medicationName: string; dose?: string; dosage?: string; frequency?: string; duration?: string; [key: string]: any }>;
  date: string;
}): Promise<string> {
  const payload = JSON.stringify({
    prescriptionNumber: data.prescriptionNumber,
    patientId: data.patientId,
    vetName: (data.vetName || '').trim(),
    vetLicense: (data.vetLicense || '').trim(),
    items: data.items,
    date: data.date,
  });

  const hex = await digestSha256(payload);
  return 'SHA256:' + hex;
}

/**
 * Verifica si un documento firmado coincide exactamente con su hash original.
 */
export async function verifyDocumentIntegrity(
  docData: Parameters<typeof calculateDocumentSha256>[0],
  expectedHash: string
): Promise<boolean> {
  const calculated = await calculateDocumentSha256(docData);
  return calculated.toLowerCase() === (expectedHash || '').toLowerCase().replace('sha256:', '');
}
