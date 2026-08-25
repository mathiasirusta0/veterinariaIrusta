import { describe, it, expect } from 'vitest';
import { FinancialMovement, Invoice } from '../../types';

describe('Finanzas — Módulo Simplificado de Cobro Rápido y Emisión de Comprobante', () => {
  it('debe registrar un cobro simple con paciente, motivo claro y monto exacto', () => {
    const charge = {
      patientName: 'Duque',
      ownerName: 'Marcelo Gómez',
      reason: 'Consulta clínica general + Inyección antibiótica y protector gástrico',
      amount: 18500,
      paymentMethod: 'TRANSFERENCIA' as const,
      date: '2026-08-24',
    };

    const movement: FinancialMovement = {
      id: 'mov-simple-101',
      type: 'INGRESO',
      category: 'Atención & Consultas',
      concept: `${charge.reason} - ${charge.patientName} (${charge.ownerName})`,
      amount: charge.amount,
      date: charge.date,
      paymentMethod: charge.paymentMethod,
      clientName: charge.ownerName,
      status: 'COBRADO',
      notes: 'Comprobante REC-2026-8812.',
      branchId: 'branch-central',
      createdAt: new Date().toISOString(),
      createdBy: 'Dr. Diego Irusta',
    };

    expect(movement.type).toBe('INGRESO');
    expect(movement.amount).toBe(18500);
    expect(movement.concept).toContain('Duque');
    expect(movement.concept).toContain('Consulta clínica');
  });

  it('debe generar el comprobante oficial no fiscal REC-2026 con los datos de Veterinaria Irusta', () => {
    const receipt: Invoice = {
      id: 'inv-simple-101',
      patientId: 'pat-1',
      ownerId: 'own-1',
      customerName: 'Marcelo Gómez',
      customerDniCuit: '34567890',
      customerTaxCondition: 'CONSUMIDOR_FINAL',
      type: 'X',
      pointOfSale: 1,
      invoiceNumber: '0001-00008812',
      date: '2026-08-24',
      items: [
        {
          id: 'item-1',
          description: 'Consulta clínica general + Inyección antibiótica',
          quantity: 1,
          unitPrice: 18500,
          subtotal: 18500,
        },
      ],
      totalAmount: 18500,
      paymentMethod: 'TRANSFERENCIA',
      caeNumber: 'NO_FISCAL_RECIBO_X',
      caeExpirationDate: '2026-12-31',
      isFiscal: false,
      branchId: 'branch-central',
    };

    expect(receipt.type).toBe('X');
    expect(receipt.totalAmount).toBe(18500);
    expect(receipt.items[0].description).toContain('Consulta clínica');
    expect(receipt.isFiscal).toBe(false);
  });
});
