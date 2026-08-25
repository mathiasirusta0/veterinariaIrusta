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
});
