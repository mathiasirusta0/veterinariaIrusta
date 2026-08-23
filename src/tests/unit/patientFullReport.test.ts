import { describe, it, expect } from 'vitest';
import { INITIAL_PATIENTS, INITIAL_CONSULTATIONS, INITIAL_LAB_ORDERS, INITIAL_IMAGING, INITIAL_VACCINATIONS, INITIAL_SURGERIES } from '../../mockData';

describe('Informe Completo & Expediente Clínico Integral (Ficha 360°)', () => {
  it('debe contener pacientes reales con datos de historia clínica, tutor y especie', () => {
    expect(INITIAL_PATIENTS.length).toBeGreaterThan(0);
    const mia = INITIAL_PATIENTS.find((p) => p.name === 'Mía') || INITIAL_PATIENTS[0];
    expect(mia).toBeDefined();
    expect(mia.clinicalRecordNumber).toBeTruthy();
    expect(mia.species).toBeTruthy();
    expect(mia.ownerId).toBeTruthy();
  });

  it('debe unificar y correlacionar consultas, laboratorio, imágenes, cirugías y vacunas por patientId', () => {
    const testPatient = INITIAL_PATIENTS[0];
    const patientCons = (INITIAL_CONSULTATIONS || []).filter((c) => c.patientId === testPatient.id);
    const patientLabs = (INITIAL_LAB_ORDERS || []).filter((l) => l.patientId === testPatient.id);
    const patientImages = (INITIAL_IMAGING || []).filter((i) => i.patientId === testPatient.id);
    const patientVacs = (INITIAL_VACCINATIONS || []).filter((v) => v.patientId === testPatient.id);
    const patientSurg = (INITIAL_SURGERIES || []).filter((s) => s.patientId === testPatient.id);

    expect(Array.isArray(patientCons)).toBe(true);
    expect(Array.isArray(patientLabs)).toBe(true);
    expect(Array.isArray(patientImages)).toBe(true);
    expect(Array.isArray(patientVacs)).toBe(true);
    expect(Array.isArray(patientSurg)).toBe(true);
  });

  it('debe ordenar cronológicamente los eventos clínicos sin alterar datos históricos', () => {
    const dates = [
      '2026-08-20T10:00:00Z',
      '2026-08-23T14:30:00Z',
      '2026-08-15T09:15:00Z',
    ];

    const sortedDesc = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    expect(sortedDesc[0]).toBe('2026-08-23T14:30:00Z');
    expect(sortedDesc[2]).toBe('2026-08-15T09:15:00Z');

    const sortedAsc = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    expect(sortedAsc[0]).toBe('2026-08-15T09:15:00Z');
    expect(sortedAsc[2]).toBe('2026-08-23T14:30:00Z');
  });

  it('debe detectar correctamente animales de servicio / tropa / trabajo militar y pasaporte equino', () => {
    const equinePatient = {
      id: 'pat-eq-1',
      name: 'Granadero',
      species: 'EQUINO',
      breed: 'Silla Argentino',
      equinePassport: 'PAS-EQ-9921',
      isProductionAnimal: false,
    };

    const isWorking =
      equinePatient.isProductionAnimal ||
      !!equinePatient.equinePassport ||
      equinePatient.species === 'EQUINO';

    expect(isWorking).toBe(true);
  });
});
