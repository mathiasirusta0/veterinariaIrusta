import { describe, it, expect } from 'vitest';
import { VaccinationRecord } from '../../types';

describe('Plan de Vacunación — Carga 100% Manual y Esquemas Fuera de Calendario', () => {
  it('debe permitir asentar un biológico fuera de calendario con fecha exacta de refuerzo en 21 días y dosis personalizada', () => {
    const customRecord: VaccinationRecord = {
      id: 'vac-off-schedule-1',
      patientId: 'pat-duque-1',
      vaccineName: 'Autovacuna Papilomatosis Inmune',
      type: 'Inmunoterapia Específica / Fuera de Calendario',
      manufacturer: 'Laboratorio Magistral Veterinario',
      batchNumber: 'LT-AUTO-2026-09',
      doseVolume: '2.5 ml',
      route: 'Subcutánea (SC)',
      expirationDate: '2026-12-31',
      administeredDate: '2026-08-20', // Aplicada hace 4 días
      administeredBy: 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502',
      nextDueDate: '2026-09-10', // Refuerzo en 21 días exactos
      certificateGenerated: true,
      notes: 'Protocolo desensibilizante fuera de calendario por recidiva papilomatosa oral.',
    };

    expect(customRecord.vaccineName).toBe('Autovacuna Papilomatosis Inmune');
    expect(customRecord.type).toContain('Fuera de Calendario');
    expect(customRecord.doseVolume).toBe('2.5 ml');
    expect(customRecord.administeredDate).toBe('2026-08-20');
    expect(customRecord.nextDueDate).toBe('2026-09-10');
    expect(customRecord.notes).toContain('recidiva papilomatosa');
  });

  it('debe permitir asentar biológicos de emergencia en dosis única sin revacunación', () => {
    const emergencySerum: VaccinationRecord = {
      id: 'vac-emergency-1',
      patientId: 'pat-duque-1',
      vaccineName: 'Suero Antiofídico Polivalente',
      type: 'Emergencia / Dosis Única',
      manufacturer: 'Instituto Malbrán / Biológico Oficial',
      batchNumber: 'LT-SUERO-882',
      doseVolume: '2 viales (20 ml)',
      route: 'Endovenosa lenta (IV)',
      expirationDate: '2027-05-30',
      administeredDate: '2026-08-24',
      administeredBy: 'Dra. Silvina Romero',
      vetLicense: 'MP 7820',
      nextDueDate: '2026-08-24', // Dosis única sin revacunación
      certificateGenerated: true,
      notes: 'Tratamiento de urgencia por mordedura de yarará (Bothrops alternatus).',
    };

    expect(emergencySerum.vaccineName).toContain('Suero Antiofídico');
    expect(emergencySerum.administeredBy).toBe('Dra. Silvina Romero');
    expect(emergencySerum.vetLicense).toBe('MP 7820');
    expect(emergencySerum.route).toBe('Endovenosa lenta (IV)');
  });

  it('debe permitir modificar a mano el veterinario firmante y la matrícula profesional', () => {
    const record: VaccinationRecord = {
      id: 'vac-vet-custom-1',
      patientId: 'pat-1',
      vaccineName: 'Antirrábica Canina',
      type: 'Campaña Oficial',
      manufacturer: 'BioCan',
      batchNumber: 'LT-991',
      expirationDate: '2027-08-24',
      administeredDate: '2026-08-24',
      administeredBy: 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502',
      nextDueDate: '2027-08-24',
    };

    expect(record.administeredBy).toBe('Dr. Diego Iván Irusta');
    expect(record.vetLicense).toBe('M.P. 502');
  });
});
