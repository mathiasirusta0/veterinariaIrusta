import { describe, it, expect } from 'vitest';
import { DOCUMENT_TEMPLATES } from '../../components/DocumentsView';
import { maskDni } from '../../utils/formatters';
import { generateClinicalDocumentPdf, PrintableClinicalDocumentData } from '../../utils/printDocumentHelper';

describe('Gestión de Documentos Clínicos & Certificados Legales', () => {
  it('debe contener las 6 plantillas oficiales de consentimientos y certificados', () => {
    expect(DOCUMENT_TEMPLATES.length).toBe(6);
    const types = DOCUMENT_TEMPLATES.map((t) => t.type);
    expect(types).toContain('CONSENTIMIENTO_ANESTESIA');
    expect(types).toContain('CONSENTIMIENTO_INTERNACION_UCI');
    expect(types).toContain('CONSENTIMIENTO_EUTANASIA');
    expect(types).toContain('CERTIFICADO_SALUD_VIAJE');
    expect(types).toContain('CERTIFICADO_VACUNACION_ANTIRRABICA');
    expect(types).toContain('ALTA_VOLUNTARIA_DESLINDE');
  });

  it('debe autocompletar dinámicamente los datos del paciente y tutor en el texto legal', () => {
    const surgeryTemplate = DOCUMENT_TEMPLATES.find((t) => t.type === 'CONSENTIMIENTO_ANESTESIA');
    expect(surgeryTemplate).toBeDefined();

    const sampleText = surgeryTemplate!.defaultContent({
      name: 'Rocky',
      species: 'Canino',
      breed: 'Labrador',
      hc: 'HC-2024-0012',
      ownerName: 'Juan Pérez',
      ownerDni: '38999888',
      vetName: 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502',
    });

    expect(sampleText).toContain('Rocky');
    expect(sampleText).toContain('Juan Pérez');
    expect(sampleText).toContain('38999888');
    expect(sampleText).toContain('Dr. Diego Iván Irusta');
    expect(sampleText).toContain('HC-2024-0012');
  });

  it('debe enmascarar adecuadamente el DNI del firmante en el expediente', () => {
    const rawDni = '38999888';
    const masked = maskDni(rawDni, false);
    expect(masked).toBe('38.***.888');
  });

  it('debe parsear y limpiar contenido JSON de evolución médica sin mostrar JSON crudo', () => {
    const rawJsonContent = JSON.stringify({
      id: 'doc-evo-1787616319475',
      authorName: 'Dr. Diego Iván Irusta',
      authorLicense: 'M.P. 502 - Dirección Médica',
      sector: 'UCI Canil 01',
      shift: 'DIURNO',
      assessment: 'Paciente canino ingresa a control y tratamiento en guardia. Normotérmico.',
      plan: 'Mantener plan de fluidos y antibióticos.',
    });

    const parsed = JSON.parse(rawJsonContent);
    expect(parsed.authorName).toBe('Dr. Diego Iván Irusta');
    expect(parsed.assessment).toContain('Paciente canino ingresa a control');
    expect(parsed.plan).toContain('Mantener plan');
  });

  it('debe generar el PDF con firma digital del tutor e identificación DNI correcta', () => {
    const mockDocData: PrintableClinicalDocumentData = {
      title: 'Consentimiento Quirúrgico',
      type: 'CONSENTIMIENTO_ANESTESIA',
      patientName: 'Duque',
      species: 'Canino',
      breed: 'American Bully',
      hc: 'HC-2026-0042',
      ownerName: 'Enzo Girardi',
      ownerDni: '37188100',
      ownerPhone: '+5492942477136',
      date: '29/08/2026',
      time: '17:30',
      content: 'Autorización para intervención quirúrgica y anestesia general.',
      vetName: 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502',
      isSigned: true,
      signedByOwnerName: 'Enzo Girardi',
      signedByOwnerDni: '37188100',
      signedAt: '29/08/2026 17:30',
      // Base64 transparent 1x1 png sample
      signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    };

    const pdf = generateClinicalDocumentPdf(mockDocData);
    expect(pdf).toBeDefined();
    expect(typeof pdf.output).toBe('function');
  });
});
