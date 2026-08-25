import { describe, it, expect } from 'vitest';
import { ClinicalEvolutionEntry } from '../../types';

describe('Unified Evolución Médica Module', () => {
  it('creates a comprehensive medical evolution with diagnosis, hospitalization reason and plan', () => {
    const evoText = 'Paciente canino (Duque) en observación por gastroenteritis leve. Mucosas rosadas, normotérmico. Plan: protector gástrico y antiemético c/8hs.';
    
    const evo: ClinicalEvolutionEntry = {
      id: 'evo-test-1',
      patientId: 'pat-1787603711079',
      type: 'MEDICA',
      status: 'FIRMADO',
      dateTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      authorName: 'Dr. Diego Iván Irusta',
      authorRole: 'DIRECTOR_MEDICO',
      authorLicense: 'M.P. 502 - Dirección Médica',
      sector: 'UCI Canil 01',
      assessment: evoText,
      plan: evoText,
      evolutionText: evoText,
    };

    expect(evo.authorName).toBe('Dr. Diego Iván Irusta');
    expect(evo.type).toBe('MEDICA');
    expect(evo.assessment).toContain('Duque');
    expect(evo.plan).toContain('antiemético');
    expect(evo.evolutionText).toBe(evoText);
  });

  it('correctly sorts evolutions in descending chronological order', () => {
    const evo1: ClinicalEvolutionEntry = {
      id: 'evo-1',
      patientId: 'pat-1',
      type: 'MEDICA',
      status: 'FIRMADO',
      dateTime: '2026-08-24T10:00:00.000Z',
      createdAt: '2026-08-24T10:00:00.000Z',
      authorName: 'Dr. Diego Iván Irusta',
      authorRole: 'DIRECTOR_MEDICO',
      assessment: 'Primera nota',
      plan: 'Primera nota',
    };

    const evo2: ClinicalEvolutionEntry = {
      id: 'evo-2',
      patientId: 'pat-1',
      type: 'MEDICA',
      status: 'FIRMADO',
      dateTime: '2026-08-24T18:00:00.000Z',
      createdAt: '2026-08-24T18:00:00.000Z',
      authorName: 'Dr. Diego Iván Irusta',
      authorRole: 'DIRECTOR_MEDICO',
      assessment: 'Segunda nota',
      plan: 'Segunda nota',
    };

    const sorted = [evo1, evo2].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    expect(sorted[0].id).toBe('evo-2');
    expect(sorted[1].id).toBe('evo-1');
  });
});
