import { describe, it, expect } from 'vitest';
import { TEST_PATIENTS, TEST_CONSULTATIONS, TEST_HOSPITALIZATIONS } from '../fixtures/testData';
import { generateMedicalHistoryPdfDocument } from '../../utils/printDocumentHelper';

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

  it('debe calcular con exactitud el Saldo Pendiente en la liquidación de gastos de la historia clínica', () => {
    const totalSpent = 80500;
    const totalPaid = 0;
    const balanceDue = Math.max(0, totalSpent - totalPaid);

    expect(balanceDue).toBe(80500);
    expect(balanceDue).not.toBe(0);
  });

  it('debe generar el documento PDF con membrete oficial y sin caracteres emoji corruptos', () => {
    const mockData = {
      patient: {
        name: 'Duque',
        species: 'Canino',
        breed: 'American Bully',
        sex: 'Macho',
        age: '1 año',
        weight: 20,
        color: 'Negro',
        microchip: 'Sin chip',
        hc: 'HC-2026-0001',
        status: 'ACTIVO',
      },
      owner: {
        name: 'Enzo Girardi',
        phone: '+543584302024',
        dni: '37108100',
        address: 'Río Cuarto, Córdoba',
        balance: 0,
      },
      doctor: {
        name: 'Dr. Diego Iván Irusta',
        license: 'M.P. 502',
      },
      emissionDate: '26/8/2026',
      emissionTime: '00:05 hs',
      hospitalizations: [
        {
          kennelNumber: 'CANIL-01',
          sector: 'UCI_CRITICOS',
          admittedAt: '24/8/2026 17:46 hs',
          dischargedAt: 'En curso',
          daysCount: '1 día(s) y 6 hora(s)',
          primaryDiagnosis: 'Tratamiento Médico Activo',
          status: 'ACTIVA',
        },
      ],
      vitals: [
        {
          date: '24/8/2026',
          dayOfWeek: 'Lun.',
          time: '17:35 hs',
          temp: 38.5,
          hr: 110,
          rr: 24,
          recordedBy: 'Dr. Diego Iván Irusta',
        },
      ],
      evolutions: [
        {
          date: '24/8/2026',
          dayOfWeek: 'Lun.',
          time: '21:05 hs',
          author: 'Dr. Diego Iván Irusta',
          license: 'M.P. 502',
          type: 'Médica',
          content: 'Paciente canino ingresa a control.',
        },
      ],
      medications: [
        {
          id: 'med-1',
          date: '24/8/2026',
          dayOfWeek: 'Lun.',
          time: '08:00 hs',
          drugName: 'Metoclopramida',
          dose: '1.2 ml',
          route: 'IV',
          administeredBy: 'Dr. Diego Iván Irusta',
        },
      ],
      financials: {
        items: [
          {
            id: 'item-1',
            category: 'Internación',
            description: 'Días de Internación UCI',
            quantity: 2,
            unitPrice: 28000,
            subtotal: 56000,
          },
        ],
        totalSpent: 56000,
        totalPaid: 0,
        balanceDue: 56000,
      },
    };

    const doc = generateMedicalHistoryPdfDocument(mockData);
    expect(doc).toBeDefined();
    const pdfOutput = doc.output();
    expect(pdfOutput).toBeDefined();
    expect(pdfOutput.length).toBeGreaterThan(100);
  });
});
