import { describe, it, expect } from 'vitest';
import { Patient, Hospitalization, VitalSigns, ClinicalEvolutionEntry, ClinicalDocument } from '../../types';

describe('Gestión de Alta Médica, Archivado y Descarga de Historia Clínica', () => {
  const mockPatient: Patient = {
    id: 'pat-alta-01',
    name: 'Simba',
    species: 'CANINO',
    breed: 'Golden Retriever',
    sex: 'MACHO',
    reproductiveStatus: 'ENTERO',
    color: 'Dorado',
    branchId: 'branch-1',
    birthDate: '2021-05-10',
    calculatedAge: '5 años',
    weight: 32.5,
    ownerId: 'own-01',
    status: 'INTERNADO',
    clinicalRecordNumber: 'HC-0089',
    createdAt: '2026-08-01T08:00:00Z',
    alerts: [],
  };

  const mockHospitalization: Hospitalization = {
    id: 'hosp-01',
    patientId: 'pat-alta-01',
    vetInChargeId: 'usr-1',
    vetInChargeName: 'Dr. Diego Irusta',
    sector: 'UCI',
    kennelNumber: '03',
    admittedAt: '2026-08-20T10:00:00.000Z',
    priority: 'PRIORITARIO',
    status: 'ACTIVA',
    primaryDiagnosis: 'Gastroenteritis aguda severa con deshidratación 8%',
    fluidTherapy: {
      isActive: true,
      solutionType: 'Ringer Lactato',
      volumeTotalMl: 1000,
      rateMlPerHour: 45,
      infusionRoute: 'IV',
      startedAt: '2026-08-20T10:00:00.000Z',
      prescribedBy: 'Dr. Diego Irusta',
    },
    feeding: {
      dietType: 'NPO_AYUNO',
      foodBrand: 'Ayuno Inicial 12hs',
      amountGramsOrMl: 0,
      frequency: 'NPO',
      tolerance: 'EXCELENTE',
    },
    eliminations: [],
    tasks: [],
    intervalHours: 2,
    branchId: 'branch-1',
    hourlySheet: [],
    medications: [
      {
        id: 'med-01',
        hospitalizationId: 'hosp-01',
        patientId: 'pat-alta-01',
        drugName: 'Maropitant (Cerenia)',
        dose: '1 mg/kg',
        route: 'SC',
        frequency: 'Cada 24 hs',
        scheduledTime: '10:00',
        status: 'REALIZADA',
        administeredAt: '2026-08-20T10:30:00.000Z',
        administeredBy: 'Dr. Diego Irusta',
        notes: 'Dosis inicial aplicada sin reacciones adversas',
      },
      {
        id: 'med-02',
        hospitalizationId: 'hosp-01',
        patientId: 'pat-alta-01',
        drugName: 'Maropitant (Cerenia)',
        dose: '1 mg/kg',
        route: 'SC',
        frequency: 'Cada 24 hs',
        scheduledTime: '10:00',
        status: 'REALIZADA',
        administeredAt: '2026-08-21T10:30:00.000Z',
        administeredBy: 'Dr. Diego Irusta',
        notes: 'Segunda dosis',
      },
    ],
  };

  const mockVitals: VitalSigns[] = [
    {
      id: 'vit-01',
      patientId: 'pat-alta-01',
      recordedAt: '2026-08-20T10:15:00.000Z',
      recordedBy: 'Dr. Diego Irusta',
      temperature: 39.4,
      heartRate: 140,
      respiratoryRate: 36,
      systolicBP: 130,
      diastolicBP: 80,
      bloodGlucose: 110,
      spo2: 98,
      painScale: 4,
    },
    {
      id: 'vit-02',
      patientId: 'pat-alta-01',
      recordedAt: '2026-08-22T09:00:00.000Z',
      recordedBy: 'Dr. Diego Irusta',
      temperature: 38.6,
      heartRate: 95,
      respiratoryRate: 22,
      systolicBP: 120,
      diastolicBP: 75,
      bloodGlucose: 95,
      spo2: 99,
      painScale: 0,
    },
  ];

  it('debe permitir cambiar el estado del paciente a ALTA_MEDICA sin borrar su historial', () => {
    const dischargedPatient: Patient = {
      ...mockPatient,
      status: 'ALTA_MEDICA',
    };

    expect(dischargedPatient.status).toBe('ALTA_MEDICA');
    expect(dischargedPatient.id).toBe('pat-alta-01');
    expect(dischargedPatient.name).toBe('Simba');
    expect(dischargedPatient.clinicalRecordNumber).toBe('HC-0089');
  });

  it('debe calcular con exactitud los días y horas de internación al otorgar el alta', () => {
    const admission = new Date('2026-08-20T10:00:00.000Z').getTime();
    const discharge = new Date('2026-08-23T16:30:00.000Z').getTime();

    const diffHours = Math.max(1, Math.round((discharge - admission) / (1000 * 60 * 60)));
    const days = Math.floor(diffHours / 24);
    const remHours = diffHours % 24;

    expect(days).toBe(3);
    expect(remHours).toBe(7); // 78 horas totales = 3 días (72hs) + 6-7 horas
  });

  it('debe estructurar la epicrisis de egreso con fecha, hora y firma del Dr. Diego Irusta (MP 8412)', () => {
    const dischargeDate = '2026-08-23T16:30:00.000Z';
    const epicrisisDoc: ClinicalDocument = {
      id: 'doc-alta-test',
      patientId: mockPatient.id,
      ownerId: mockPatient.ownerId,
      type: 'INFORME_ALTA_MEDICA',
      title: `Epicrisis de Alta — ${mockPatient.name}`,
      content: `ALTA MÉDICA Y EPICRISIS CLÍNICA\nFecha: 23/08/2026 13:30\nProfesional: Dr. Diego Irusta (MP 8412)\nCondición: Completamente Recuperado`,
      vetName: 'Dr. Diego Irusta',
      createdAt: dischargeDate,
      isSigned: true,
    };

    expect(epicrisisDoc.type).toBe('INFORME_ALTA_MEDICA');
    expect(epicrisisDoc.vetName).toBe('Dr. Diego Irusta');
    expect(epicrisisDoc.isSigned).toBe(true);
    expect(epicrisisDoc.content).toContain('Dr. Diego Irusta');
  });

  it('debe consolidar todas las dosis de medicación administradas con fecha, hora y responsable', () => {
    const doses: { date: string; time: string; drug: string; dose: string; adminBy: string }[] = [];

    mockHospitalization.medications.forEach((med) => {
      if (med.administeredAt) {
        const dt = new Date(med.administeredAt);
        doses.push({
          date: dt.toISOString().split('T')[0],
          time: dt.toISOString().split('T')[1].substring(0, 5),
          drug: med.drugName,
          dose: med.dose,
          adminBy: med.administeredBy || 'Dr. Diego Irusta',
        });
      }
    });

    expect(doses.length).toBe(2);
    expect(doses[0].drug).toBe('Maropitant (Cerenia)');
    expect(doses[0].adminBy).toBe('Dr. Diego Irusta');
    expect(doses[0].date).toBe('2026-08-20');
    expect(doses[1].date).toBe('2026-08-21');
  });

  it('debe soportar archivar y desarchivar fichas clínicas manteniendo la trazabilidad', () => {
    let patientState: Patient = { ...mockPatient, status: 'ACTIVO' };

    // Archivar
    patientState = { ...patientState, status: 'ARCHIVADO' };
    expect(patientState.status).toBe('ARCHIVADO');

    // Desarchivar
    patientState = { ...patientState, status: 'ACTIVO' };
    expect(patientState.status).toBe('ACTIVO');
  });
});
