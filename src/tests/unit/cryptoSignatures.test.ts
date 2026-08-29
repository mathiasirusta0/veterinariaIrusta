import { describe, it, expect } from 'vitest';
import {
  calculateDocumentSha256,
  calculatePrescriptionSha256,
  verifyDocumentIntegrity,
} from '../../utils/crypto';

describe('Real SHA-256 Cryptographic Digital Signatures', () => {
  it('should generate a 64-character hexadecimal SHA-256 hash for documents', async () => {
    const docData = {
      documentId: 'doc-101',
      title: 'Consentimiento Informado para Anestesia General',
      content: 'Autorizo al equipo de Veterinaria Ranquel a realizar el procedimiento.',
      signerName: 'Juan Pablo Pérez Rossi',
      signerDni: '32.458.912',
      timestamp: '2026-08-24T10:00:00Z',
    };

    const hash = await calculateDocumentSha256(docData);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64);
  });

  it('should produce identical hashes for identical payloads (determinism)', async () => {
    const docData = {
      documentId: 'doc-102',
      title: 'Certificado Oficial de Vacunación Antirrábica',
      content: 'Certifico la aplicación de vacuna antirrábica.',
      signerName: 'Dr. Diego Iván Irusta',
      signerDni: '28.912.450',
      timestamp: '2026-08-24T12:00:00Z',
    };

    const hash1 = await calculateDocumentSha256(docData);
    const hash2 = await calculateDocumentSha256(docData);

    expect(hash1).toBe(hash2);
  });

  it('should produce completely different hashes if content or signer changes (tamper-evident)', async () => {
    const originalDoc = {
      documentId: 'doc-103',
      title: 'Acta de Eutanasia Humanitaria',
      content: 'Autorizo el procedimiento compasivo.',
      signerName: 'Lucía Méndez',
      signerDni: '35.120.440',
      timestamp: '2026-08-24T14:00:00Z',
    };

    const tamperedDoc = {
      ...originalDoc,
      content: 'Modificación no autorizada de texto.',
    };

    const hashOriginal = await calculateDocumentSha256(originalDoc);
    const hashTampered = await calculateDocumentSha256(tamperedDoc);

    expect(hashOriginal).not.toBe(hashTampered);
  });

  it('should generate real SHA-256 for veterinary prescriptions without Math.random', async () => {
    const rxData = {
      prescriptionNumber: 'REC-2026-000001',
      patientId: 'pat-100',
      vetName: 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502 (Neuquén)',
      items: [
        { medicationName: 'Enrofloxacina 150mg', dosage: '1 comprimido', frequency: 'cada 24 horas', duration: '7 días' },
      ],
      date: '2026-08-28',
    };

    const rxHash1 = await calculatePrescriptionSha256(rxData);
    const rxHash2 = await calculatePrescriptionSha256(rxData);

    expect(rxHash1).toMatch(/^SHA256:[a-f0-9]{64}$/);
    expect(rxHash1).toBe(rxHash2);

    const tamperedRx = {
      ...rxData,
      items: [
        { medicationName: 'Enrofloxacina 200mg', dosage: '2 comprimidos', frequency: 'cada 12 horas', duration: '14 días' },
      ],
    };
    const rxHashTampered = await calculatePrescriptionSha256(tamperedRx);
    expect(rxHash1).not.toBe(rxHashTampered);
  });

  it('should verify document integrity correctly', async () => {
    const doc = {
      documentId: 'doc-valid',
      title: 'Certificado de Salud',
      content: 'Animal apto para traslado.',
      signerName: 'Dr. Diego Iván Irusta',
      signerDni: '20-31458920-4',
      timestamp: '2026-08-28T15:00:00Z',
    };

    const validHash = await calculateDocumentSha256(doc);
    const isValid = await verifyDocumentIntegrity(doc, validHash);
    expect(isValid).toBe(true);

    const isTamperedValid = await verifyDocumentIntegrity({ ...doc, content: 'Modificado' }, validHash);
    expect(isTamperedValid).toBe(false);
  });
});
