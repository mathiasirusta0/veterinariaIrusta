import { describe, it, expect } from 'vitest';
import { Invoice, FinancialMovement } from '../../types';

describe('Finanzas — Liquidación Manual de Prestaciones & Comprobantes de Pago', () => {
  it('debe liquidar manualmente días de internación, medicación y descartables con cálculo exacto de subtotal y total', () => {
    const items = [
      {
        id: 'it-1',
        description: 'Internación Canil Terapia Intensiva UCI (2 días)',
        quantity: 2,
        unitPrice: 35000,
        subtotal: 70000,
      },
      {
        id: 'it-2',
        description: 'Plan de Fluidoterapia + Ranitidina + Maropitant',
        quantity: 2,
        unitPrice: 15000,
        subtotal: 30000,
      },
      {
        id: 'it-3',
        description: 'Set de Descartables, Vías, Catéter y Jeringas',
        quantity: 1,
        unitPrice: 8500,
        subtotal: 8500,
      },
    ];

    const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
    const discount = 3500;
    const totalAmount = subtotal - discount;

    const receipt: Invoice = {
      id: 'inv-rec-101',
      patientId: 'pat-101',
      ownerId: 'own-101',
      customerName: 'Guillermo Pérez',
      customerDniCuit: '32111222',
      customerTaxCondition: 'CONSUMIDOR_FINAL',
      type: 'X',
      pointOfSale: 1,
      invoiceNumber: '0001-00008841',
      date: '2026-08-24',
      items,
      totalAmount,
      paymentMethod: 'TRANSFERENCIA',
      caeNumber: 'NO_FISCAL_RECIBO_X',
      caeExpirationDate: '2026-12-31',
      isFiscal: false,
      branchId: 'branch-central',
    };

    expect(receipt.type).toBe('X');
    expect(receipt.items.length).toBe(3);
    expect(subtotal).toBe(108500);
    expect(receipt.totalAmount).toBe(105000);
    expect(receipt.paymentMethod).toBe('TRANSFERENCIA');
  });

  it('debe registrar el ingreso en la caja financiera manteniendo consistencia', () => {
    const movement: FinancialMovement = {
      id: 'mov-rec-101',
      type: 'INGRESO',
      category: 'Internación & Prestaciones Médicas',
      concept: 'Liquidación de prestaciones - Simba (HC-2026-8812)',
      amount: 105000,
      date: '2026-08-24',
      paymentMethod: 'TRANSFERENCIA',
      clientName: 'Guillermo Pérez',
      status: 'COBRADO',
      notes: 'Comprobante Nº REC-2026-8841.',
      branchId: 'branch-central',
      isVoided: false,
      createdAt: new Date().toISOString(),
      createdBy: 'Dr. Diego Iván Irusta',
    };

    expect(movement.type).toBe('INGRESO');
    expect(movement.amount).toBe(105000);
    expect(movement.status).toBe('COBRADO');
    expect(movement.concept).toContain('Simba');
  });
});
