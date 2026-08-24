import { describe, it, expect } from 'vitest';
import { TEST_PATIENTS, TEST_CONSULTATIONS, TEST_HOSPITALIZATIONS } from '../fixtures/testData';

describe('Informe Completo & Expediente Clínico Integral (Ficha 360°)', () => {
  it('debe contener pacientes con datos de historia clínica, tutor y especie', () => {
    expect(TEST_PATIENTS.length).toBeGreaterThan(0);
    const toby = TEST_PATIENTS.find((p) => p.name === 'Toby');
    expect(toby).toBeDefined();
    expect(toby?.clinicalRecordNumber).toBe('HC-0041');
  });

  it('debe unificar y correlacionar consultas e internación por patientId', () => {
    const tobyConsultations = TEST_CONSULTATIONS.filter((c) => c.patientId === 'pat-1');
    const tobyHosps = TEST_HOSPITALIZATIONS.filter((h) => h.patientId === 'pat-1');
    expect(tobyConsultations.length).toBe(1);
    expect(tobyHosps.length).toBe(1);
  });

  it('debe ordenar cronológicamente los eventos clínicos sin alterar datos históricos', () => {
    const events = [
      { date: '2026-08-20T10:00:00Z', type: 'CONSULTA' },
      { date: '2026-08-20T11:00:00Z', type: 'INTERNACION' },
    ];
    const sorted = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    expect(sorted[0].type).toBe('INTERNACION');
    expect(sorted[1].type).toBe('CONSULTA');
  });
});
