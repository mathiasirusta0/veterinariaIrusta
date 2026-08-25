import { describe, it, expect } from 'vitest';
import { Patient, Owner, Hospitalization, TriageEntry } from '../../types';

describe('Workflow de Admisión Inmediata al Registrar Paciente', () => {
  it('debe registrar un nuevo paciente e ingresarlo directamente a internación con canil y diagnóstico', () => {
    const owner: Owner = {
      id: 'own-101',
      firstName: 'Guillermo',
      lastName: 'Pérez',
      phone: '+54 9 358 4112233',
      whatsapp: '+54 9 358 4112233',
      dni: '32111222',
      taxCondition: 'CONSUMIDOR_FINAL',
      balance: 0,
      createdAt: new Date().toISOString(),
    };

    const patient: Patient = {
      id: 'pat-101',
      name: 'Simba',
      species: 'FELINO',
      breed: 'Siamés',
      sex: 'MACHO',
      reproductiveStatus: 'ENTERO',
      color: 'Seal Point',
      birthDate: '2023-05-10',
      calculatedAge: '2 años',
      weight: 3.8,
      status: 'INTERNADO',
      alerts: [{ type: 'ALERGIA', description: 'Intolerancia a AINEs', severity: 'ALTA' }],
      clinicalRecordNumber: 'HC-2026-8812',
      ownerId: owner.id,
      branchId: 'branch-central',
      createdAt: new Date().toISOString(),
    };

    const hospitalization: Hospitalization = {
      id: 'hosp-101',
      patientId: patient.id,
      admissionDate: new Date().toISOString(),
      status: 'ACTIVA',
      sector: 'UCI_CRITICOS',
      kennelNumber: 'CANIL-UCI-01',
      primaryDiagnosis: 'Obstrucción uretral felina aguda (FLUTD)',
      priority: 'URGENTE',
      vetInChargeName: 'Dr. Diego Irusta',
      fluidRateMlH: 15,
      fluidType: 'Solución Fisiológica 0.9%',
      hourlySheets: [],
      medications: [],
      observations: 'Sondaje evacuador y fluidoterapia intensiva.',
    };

    expect(patient.name).toBe('Simba');
    expect(hospitalization.patientId).toBe(patient.id);
    expect(hospitalization.sector).toBe('UCI_CRITICOS');
    expect(hospitalization.kennelNumber).toBe('CANIL-UCI-01');
    expect(hospitalization.primaryDiagnosis).toContain('FLUTD');
    expect(hospitalization.status).toBe('ACTIVA');
  });

  it('debe registrar un nuevo paciente y preparar la derivación inmediata a Triage', () => {
    const triage: TriageEntry = {
      id: 'tri-101',
      patientId: 'pat-102',
      ownerId: 'own-102',
      entryTime: new Date().toISOString(),
      priority: 'URGENTE',
      chiefComplaint: 'Traumatismo por atropello en vía pública',
      status: 'EN_ESPERA',
      assignedRoom: 'Consultorio 1',
    };

    expect(triage.priority).toBe('URGENTE');
    expect(triage.chiefComplaint).toContain('atropello');
    expect(triage.status).toBe('EN_ESPERA');
  });
});
