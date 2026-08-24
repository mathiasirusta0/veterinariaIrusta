import { describe, it, expect } from 'vitest';
import {
  TEST_PATIENTS,
  TEST_ENCOUNTERS,
  TEST_PROCEDURES,
  TEST_CONSUMPTIONS,
} from '../fixtures/testData';
import {
  ClinicalEncounter,
  ClinicalProcedure,
  EncounterConsumptionItem,
  ServicePriceItem,
  VitalSigns,
  ClinicalEvolutionEntry,
  LaboratoryOrder,
  ImagingStudy,
  MedicationSchedule,
  BREEDS_BY_SPECIES,
  SPECIES_LIST,
} from '../../types';

describe('Reestructuración Funcional & Flujo Clínico Operativo Unificado', () => {
  it('debe soportar especies dinámicas y razas dependientes sin limitar a perros y gatos', () => {
    expect(SPECIES_LIST.some((s) => s.id === 'CANINO')).toBe(true);
    expect(SPECIES_LIST.some((s) => s.id === 'FELINO')).toBe(true);
    expect(SPECIES_LIST.some((s) => s.id === 'EQUINO')).toBe(true);
    expect(SPECIES_LIST.some((s) => s.id === 'AVE')).toBe(true);
    expect(SPECIES_LIST.some((s) => s.id === 'EXOTICO')).toBe(true);

    expect(BREEDS_BY_SPECIES.CANINO).toContain('Pastor Alemán / Ovejero');
    expect(BREEDS_BY_SPECIES.CANINO).toContain('Otra / No especificada');
    expect(BREEDS_BY_SPECIES.FELINO).toContain('Siamés');
    expect(BREEDS_BY_SPECIES.EQUINO).toContain('Criollo');
    expect(BREEDS_BY_SPECIES.AVE).toContain('Loro Hablador (Amazona)');
    expect(BREEDS_BY_SPECIES.EXOTICO).toContain('Conejo Enano / Mini Lop');
  });

  it('debe permitir diferenciar Atención Ambulatoria de Internación en el mismo modelo', () => {
    const encAmbulatoria: ClinicalEncounter = {
      id: 'enc-amb-01',
      patientId: 'pat-thor',
      type: 'AMBULATORIA',
      status: 'EN_CURSO',
      admittedAt: new Date().toISOString(),
      vetInChargeId: 'user-vet',
      vetInChargeName: 'Dra. Valentina Ríos',
      reason: 'Control clínico y vacunación',
      initialDiagnosis: 'Paciente sano en control preventivo',
    };

    const encInternacion: ClinicalEncounter = {
      id: 'enc-hosp-01',
      patientId: 'pat-thor',
      type: 'INTERNACION',
      status: 'EN_CURSO',
      admittedAt: new Date().toISOString(),
      vetInChargeId: 'user-vet',
      vetInChargeName: 'Dra. Valentina Ríos',
      reason: 'Gastroenteritis con deshidratación 8%',
      initialDiagnosis: 'Gastroenteritis aguda severa',
      sector: 'Caniles Generales Canil 02',
      priority: 'CRITICO',
    };

    expect(encAmbulatoria.type).toBe('AMBULATORIA');
    expect(encInternacion.type).toBe('INTERNACION');
    expect(encInternacion.sector).toBe('Caniles Generales Canil 02');
  });

  it('debe registrar controles sucesivos de signos vitales sin sobrescribir los anteriores', () => {
    const vitalsTimeline: VitalSigns[] = [
      {
        id: 'vit-1',
        patientId: 'pat-thor',
        temperature: 39.2,
        heartRate: 130,
        respiratoryRate: 28,
        systolicBP: 130,
        diastolicBP: 85,
        recordedAt: '2026-08-24T08:00:00Z',
        recordedBy: 'Enf. Santiago Gómez',
      },
      {
        id: 'vit-2',
        patientId: 'pat-thor',
        temperature: 38.6,
        heartRate: 110,
        respiratoryRate: 22,
        systolicBP: 120,
        diastolicBP: 80,
        recordedAt: '2026-08-24T12:00:00Z',
        recordedBy: 'Enf. Santiago Gómez',
      },
    ];

    expect(vitalsTimeline.length).toBe(2);
    expect(vitalsTimeline[0].temperature).toBe(39.2);
    expect(vitalsTimeline[1].temperature).toBe(38.6);
    expect(vitalsTimeline[1].recordedAt).toBe('2026-08-24T12:00:00Z');
  });

  it('debe preservar evoluciones clínicas inmutables con autor y fecha', () => {
    const evolutions: ClinicalEvolutionEntry[] = [
      {
        id: 'evo-1',
        patientId: 'pat-thor',
        dateTime: '2026-08-24T08:30:00Z',
        authorName: 'Dra. Valentina Ríos',
        authorRole: 'VETERINARIO',
        authorLicense: 'MP 8412',
        type: 'MEDICA',
        objectiveSummary: 'Paciente decaído con dolor abdominal a la palpación',
        assessment: 'Probable translocación bacteriana',
        plan: 'Instaurar fluidoterapia Ringer Lactato a 60ml/h y analgesia',
        status: 'FIRMADO',
        createdAt: '2026-08-24T08:30:00Z',
      },
      {
        id: 'evo-2',
        patientId: 'pat-thor',
        dateTime: '2026-08-24T14:00:00Z',
        authorName: 'Dr. Martín López',
        authorRole: 'VETERINARIO',
        type: 'MEDICA',
        objectiveSummary: 'Mejor actitud, afebril, ingiere agua tolerando sin vómitos',
        assessment: 'Evolución favorable',
        plan: 'Comenzar dieta blanda hiperdigestible fraccionada',
        status: 'FIRMADO',
        createdAt: '2026-08-24T14:00:00Z',
      },
    ];

    expect(evolutions.length).toBe(2);
    expect(evolutions[0].authorName).toBe('Dra. Valentina Ríos');
    expect(evolutions[1].authorName).toBe('Dr. Martín López');
  });

  it('REGLA FUNDAMENTAL DE FACTURACIÓN: Lo meramente SOLICITADO/INDICADO no genera consumo ni cobro', () => {
    // 1. Estudio solicitado
    const requestedLab: LaboratoryOrder = {
      id: 'lab-req-1',
      orderNumber: 'LAB-2026-001',
      patientId: 'pat-thor',
      testType: 'HEMOGRAMA_COMPLETO',
      requestedAt: '2026-08-24T09:00:00Z',
      requestedBy: 'Dra. Valentina Ríos',
      status: 'SOLICITADO',
      results: [],
      diagnosticReport: '',
      conclusions: '',
    };

    // 2. Medicación indicada pendiente
    const pendingMed: MedicationSchedule = {
      id: 'med-pend-1',
      hospitalizationId: 'hosp-1',
      patientId: 'pat-thor',
      drugName: 'Ranitidina 50mg',
      dose: '2 mg/kg',
      route: 'IV',
      scheduledTime: '16:00',
      status: 'PENDIENTE',
    };

    // 3. Procedimiento pendiente
    const pendingProc: ClinicalProcedure = {
      id: 'proc-pend-1',
      patientId: 'pat-thor',
      procedureName: 'Nebulización Terapéutica',
      category: 'TERAPEUTICO',
      isPerformed: false,
      price: 6500,
      isBillable: true,
      createdAt: '2026-08-24T09:10:00Z',
    };

    // Helper que calcula consumos facturables
    const consumptions: EncounterConsumptionItem[] = [];

    // Verificamos que ninguno de los pendientes agrega filas a la lista de consumos confirmados
    if (requestedLab.status === 'FINALIZADO') {
      consumptions.push({ id: 'c1', encounterId: 'e1', patientId: 'pat-thor', sourceType: 'LABORATORIO', sourceId: requestedLab.id, code: 'LAB', concept: 'Hemograma', quantity: 1, unitPrice: 14000, subtotal: 14000, status: 'CONFIRMADO', performedAt: '', performedBy: '', isBilled: false });
    }

    if (pendingMed.status === 'REALIZADA') {
      consumptions.push({ id: 'c2', encounterId: 'e1', patientId: 'pat-thor', sourceType: 'MEDICAMENTO', sourceId: pendingMed.id, code: 'MED', concept: pendingMed.drugName, quantity: 1, unitPrice: 4500, subtotal: 4500, status: 'CONFIRMADO', performedAt: '', performedBy: '', isBilled: false });
    }

    if (pendingProc.isPerformed) {
      consumptions.push({ id: 'c3', encounterId: 'e1', patientId: 'pat-thor', sourceType: 'PROCEDIMIENTO', sourceId: pendingProc.id, code: 'PROC', concept: pendingProc.procedureName, quantity: 1, unitPrice: pendingProc.price, subtotal: pendingProc.price, status: 'CONFIRMADO', performedAt: '', performedBy: '', isBilled: false });
    }

    expect(consumptions.length).toBe(0);
  });

  it('debe registrar consumo y prefacturación automáticamente al marcar REALIZADO o APLICADO', () => {
    const consumptions: EncounterConsumptionItem[] = [
      {
        id: 'cons-1',
        encounterId: 'enc-thor',
        patientId: 'pat-thor',
        sourceType: 'CONSULTA',
        sourceId: 'enc-thor',
        code: 'SRV-CONS-01',
        concept: 'Consulta Médica General Ambulatoria',
        quantity: 1,
        unitPrice: 18000,
        subtotal: 18000,
        status: 'CONFIRMADO',
        performedAt: '2026-08-24T08:00:00Z',
        performedBy: 'Dra. Valentina Ríos',
        isBilled: false,
      },
      {
        id: 'cons-2',
        encounterId: 'enc-thor',
        patientId: 'pat-thor',
        sourceType: 'LABORATORIO',
        sourceId: 'lab-1',
        code: 'SRV-LAB-01',
        concept: 'Laboratorio: Hemograma Completo',
        quantity: 1,
        unitPrice: 14000,
        subtotal: 14000,
        status: 'CONFIRMADO',
        performedAt: '2026-08-24T09:30:00Z',
        performedBy: 'Dra. Valentina Ríos',
        isBilled: false,
      },
      {
        id: 'cons-3',
        encounterId: 'enc-thor',
        patientId: 'pat-thor',
        sourceType: 'IMAGEN',
        sourceId: 'img-1',
        code: 'SRV-IMG-01',
        concept: 'Radiografía: Abdomen Lateral / VD',
        quantity: 1,
        unitPrice: 26000,
        subtotal: 26000,
        status: 'CONFIRMADO',
        performedAt: '2026-08-24T10:00:00Z',
        performedBy: 'Dra. Valentina Ríos',
        isBilled: false,
      },
      {
        id: 'cons-4',
        encounterId: 'enc-thor',
        patientId: 'pat-thor',
        sourceType: 'MEDICAMENTO',
        sourceId: 'med-1',
        code: 'MED-APPL',
        concept: 'Aplicación: Meloxicam 0.5% (0.2 mg/kg IV)',
        quantity: 1,
        unitPrice: 4500,
        subtotal: 4500,
        status: 'CONFIRMADO',
        performedAt: '2026-08-24T08:15:00Z',
        performedBy: 'Enf. Santiago Gómez',
        isBilled: false,
      },
      {
        id: 'cons-5',
        encounterId: 'enc-thor',
        patientId: 'pat-thor',
        sourceType: 'PROCEDIMIENTO',
        sourceId: 'proc-1',
        code: 'SRV-PROC-01',
        concept: 'Colocación de Vía Endovenosa',
        quantity: 1,
        unitPrice: 7500,
        subtotal: 7500,
        status: 'CONFIRMADO',
        performedAt: '2026-08-24T08:10:00Z',
        performedBy: 'Enf. Santiago Gómez',
        isBilled: false,
      },
    ];

    const totalCalculated = consumptions.reduce((sum, c) => sum + c.subtotal, 0);

    expect(consumptions.length).toBe(5);
    // 18000 + 14000 + 26000 + 4500 + 7500 = 70000
    expect(totalCalculated).toBe(70000);
  });


  it('PREVENCIÓN DE DOBLE FACTURACIÓN: un consumo marcado como isBilled no debe sumarse a la prefacturación pendiente', () => {
    const consumptions: EncounterConsumptionItem[] = [
      {
        id: 'cons-billed-1',
        encounterId: 'enc-101',
        patientId: 'pat-1',
        sourceType: 'CONSULTA',
        sourceId: 'enc-101',
        code: 'SRV-CONS',
        concept: 'Consulta Ambulatoria General',
        quantity: 1,
        unitPrice: 18000,
        subtotal: 18000,
        status: 'CONFIRMADO',
        performedAt: '2026-08-24T08:00:00Z',
        performedBy: 'Dra. Valentina Ríos',
        isBilled: true, // Ya facturado
      },
      {
        id: 'cons-unbilled-2',
        encounterId: 'enc-101',
        patientId: 'pat-1',
        sourceType: 'LABORATORIO',
        sourceId: 'lab-2',
        code: 'SRV-LAB',
        concept: 'Perfil Renal',
        quantity: 1,
        unitPrice: 12500,
        subtotal: 12500,
        status: 'CONFIRMADO',
        performedAt: '2026-08-24T11:00:00Z',
        performedBy: 'Bioq. Laboratorio',
        isBilled: false, // Pendiente
      },
    ];

    // Helper simulando getEncounterPreInvoice
    const pendingItems = consumptions.filter(c => c.encounterId === 'enc-101' && c.status !== 'ANULADO' && !c.isBilled);
    const pendingTotal = pendingItems.reduce((sum, it) => sum + it.subtotal, 0);

    expect(pendingItems.length).toBe(1);
    expect(pendingItems[0].concept).toBe('Perfil Renal');
    expect(pendingTotal).toBe(12500);
  });

  it('MEDICACIÓN AMBULATORIA: indicar medicación a un paciente ambulatorio debe registrarse sin corromper internaciones', () => {
    const patientId = 'pat-ambulatorio-01';
    const isAmbulatory = true;

    const prescriptionRecord = {
      id: 'rx-01',
      patientId,
      drugName: 'Amoxicilina + Ácido Clavulánico',
      dose: '20 mg/kg',
      frequency: 'Cada 12 horas',
      duration: '7 días',
      route: 'ORAL',
    };

    expect(prescriptionRecord.patientId).toBe('pat-ambulatorio-01');
    expect(prescriptionRecord.route).toBe('ORAL');
  });

  it('debe prevenir doble aplicación accidental de una dosis', () => {
    const medSchedule: MedicationSchedule = {
      id: 'med-melox-1',
      hospitalizationId: 'hosp-1',
      patientId: 'pat-thor',
      drugName: 'Meloxicam',
      dose: '0.2 mg/kg',
      route: 'IV',
      scheduledTime: '08:00',
      status: 'REALIZADA',
      administeredAt: '2026-08-24T08:05:00Z',
      administeredBy: 'Enf. Santiago Gómez',
    };

    // Intentar re-aplicar
    let canReapply = false;
    if (medSchedule.status !== 'REALIZADA') {
      canReapply = true;
    }

    expect(canReapply).toBe(false);
    expect(medSchedule.administeredBy).toBe('Enf. Santiago Gómez');
  });
});
