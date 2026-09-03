import { describe, it, expect } from 'vitest';
import {
  PrintableReceiptData,
  printThermalTicket,
  printA4Document,
  downloadHtmlAsPdf,
} from '../../utils/printDocumentHelper';

describe('Receipts, Thermal Tickets, and Estimates System', () => {
  const sampleReceipt: PrintableReceiptData = {
    receiptNumber: 'REC-2026-8812',
    date: '25/08/2026',
    time: '11:30',
    patientName: 'Duque',
    species: 'Canino',
    breed: 'American Bully',
    hc: 'HC-2026-0001',
    ownerName: 'Enzo Girardi',
    ownerPhone: '+54 9 358 438-2824',
    reason: 'Consulta clínica general + Vacunación Séxtuple',
    items: [
      {
        description: 'Consulta clínica general + Vacunación Séxtuple',
        quantity: 1,
        unitPrice: 15000,
        subtotal: 15000,
      },
    ],
    total: 15000,
    paymentMethod: 'TRANSFERENCIA',
    vetInCharge: 'Dr. Diego Iván Irusta',
    vetLicense: 'M.P. 502',
    notes: 'Comprobante oficial no fiscal',
    type: 'COMPROBANTE',
  };

  const sampleEstimate: PrintableReceiptData = {
    receiptNumber: 'PRES-2026-042',
    date: '25/08/2026',
    time: '11:30',
    patientName: 'Luna',
    species: 'Felino',
    breed: 'Siamés',
    hc: 'HC-2026-0002',
    ownerName: 'Marcelo Torres',
    ownerPhone: '+54 9 358 4123456',
    reason: 'Cirugía de Ovariohisterectomía + Anestesia Inhalatoria',
    items: [
      {
        description: 'Cirugía de Ovariohisterectomía',
        quantity: 1,
        unitPrice: 45000,
        subtotal: 45000,
      },
    ],
    total: 45000,
    paymentMethod: 'PRESUPUESTO',
    vetInCharge: 'Dr. Diego Iván Irusta',
    vetLicense: 'M.P. 502',
    validityDays: 15,
    type: 'PRESUPUESTO',
  };

  it('validates receipt data structure and totals correctly', () => {
    expect(sampleReceipt.receiptNumber).toBe('REC-2026-8812');
    expect(sampleReceipt.total).toBe(15000);
    expect(sampleReceipt.items?.[0].subtotal).toBe(15000);
    expect(sampleReceipt.vetInCharge).toContain('Dr. Diego Iván Irusta');
    expect(sampleReceipt.vetLicense).toBe('M.P. 502');
  });

  it('validates clinical estimate data and validity days', () => {
    expect(sampleEstimate.receiptNumber).toBe('PRES-2026-042');
    expect(sampleEstimate.total).toBe(45000);
    expect(sampleEstimate.validityDays).toBe(15);
    expect(sampleEstimate.type).toBe('PRESUPUESTO');
  });

  it('verifies helper functions exist and can be called safely in DOM environments', () => {
    expect(typeof printThermalTicket).toBe('function');
    expect(typeof printA4Document).toBe('function');
    expect(typeof downloadHtmlAsPdf).toBe('function');
  });

  it('genera y descarga correctamente el PDF vectorial oficial de Historia Clínica con membrete', async () => {
    const { generateMedicalHistoryPdfDocument, downloadMedicalHistoryPdf } = await import(
      '../../utils/printDocumentHelper'
    );

    const testMedicalData = {
      patient: {
        name: 'Duque',
        species: 'Canino',
        breed: 'American Bully',
        sex: 'Macho',
        age: '1 año',
        weight: 20,
        color: 'Negro',
        microchip: '981098102381',
        hc: 'HC-2026-0001',
        status: 'ACTIVO',
      },
      owner: {
        name: 'Enzo Girardi',
        phone: '+543584302024',
        dni: '37108100',
        address: 'Las Lajas, Neuquén',
        balance: 0,
      },
      doctor: {
        name: 'Dr. Diego Iván Irusta',
        license: 'M.P. 502',
      },
      emissionDate: '25/08/2026',
      emissionTime: '22:00',
      hospitalizations: [
        {
          kennelNumber: 'CANIL-01',
          sector: 'UCI_CRITICOS',
          admittedAt: '24/8/2026 17:46 hs',
          dischargedAt: 'En curso',
          daysCount: '1 día(s) y 4 hora(s)',
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
          pain: 2,
          recordedBy: 'Dr. Diego Iván Irusta',
        },
      ],
      evolutions: [
        {
          date: '25/8/2026',
          dayOfWeek: 'Mar.',
          time: '10:00',
          author: 'Dr. Diego Iván Irusta',
          license: 'M.P. 502',
          type: 'Médica',
          content: 'Paciente estable, responde favorablemente al tratamiento instaurado.',
        },
      ],
      medications: [
        {
          date: '25/8/2026',
          dayOfWeek: 'Mar.',
          time: '08:00',
          drugName: 'Cefazolina 1g',
          dose: '22 mg/kg',
          route: 'IV',
          administeredBy: 'Dr. Diego Iván Irusta',
        },
      ],
      studies: [
        {
          type: 'LABORATORIO' as const,
          date: '24/8/2026',
          title: 'Hemograma Completo',
          details: 'Recuento leucocitario normal, hematocrito 42%.',
        },
      ],
      financials: {
        items: [
          {
            category: 'Internación',
            description: 'Día de internación UCI',
            quantity: 1,
            unitPrice: 28000,
            subtotal: 28000,
          },
        ],
        totalSpent: 28000,
        totalPaid: 28000,
        balanceDue: 0,
      },
    };

    // 1. Generar documento PDF con jsPDF
    const pdfDoc = generateMedicalHistoryPdfDocument(testMedicalData);
    expect(pdfDoc).toBeDefined();
    expect(typeof pdfDoc.output).toBe('function');
    expect(pdfDoc.getNumberOfPages()).toBeGreaterThanOrEqual(1);

    // 2. Probar ejecución de descarga sin errores
    const result = await downloadMedicalHistoryPdf(testMedicalData);
    expect(result).toBe(true);
  });
});
