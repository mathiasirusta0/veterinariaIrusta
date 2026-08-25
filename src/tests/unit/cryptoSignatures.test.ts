import { describe, it, expect } from 'vitest';
import { calculateDocumentSha256 } from '../../utils/crypto';

describe('Real SHA-256 Cryptographic Digital Signatures', () => {
  it('should generate a 64-character hexadecimal SHA-256 hash', async () => {
    const docData = {
      documentId: 'doc-101',
      title: 'Consentimiento Informado para Anestesia General',
      content: 'Autorizo al equipo de Veterinaria Irusta a realizar el procedimiento.',
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
});
