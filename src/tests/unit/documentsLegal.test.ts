import { describe, it, expect } from 'vitest';
import { DOCUMENT_TEMPLATES } from '../../components/DocumentsView';
import { maskDni } from '../../utils/formatters';

describe('Gestión de Documentos Clínicos & Certificados Legales (Fase 16)', () => {
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
      vetName: 'Dr. Diego Irusta',
      vetLicense: 'MP-VET 8812',
    });

    expect(sampleText).toContain('Rocky');
    expect(sampleText).toContain('Juan Pérez');
    expect(sampleText).toContain('38999888');
    expect(sampleText).toContain('Dr. Diego Irusta');
    expect(sampleText).toContain('HC-2024-0012');
  });

  it('debe enmascarar adecuadamente el DNI del firmante en el expediente', () => {
    const rawDni = '38999888';
    const masked = maskDni(rawDni, false);
    expect(masked).toBe('38.***.888');
  });
});
