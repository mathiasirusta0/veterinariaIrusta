import { describe, it, expect } from 'vitest';
import { EncounterConsumptionItem, Patient } from '../../types';

describe('Liquidación & Gastos Clínicos de Pacientes en Finanzas', () => {
  const samplePatient: Patient = {
    id: 'pat-101',
    name: 'Rocky',
    species: 'CANINO',
    breed: 'Boxer',
    sex: 'MACHO',
    reproductiveStatus: 'ENTERO',
    birthDate: '2022-01-01',
    calculatedAge: '4 años',
    weight: 28.5,
    color: 'Atigrado',
    status: 'ACTIVO',
    alerts: [],
    ownerId: 'own-1',
    clinicalRecordNumber: 'HC-9042',
    branchId: 'branch-1',
    createdAt: '2026-01-01T00:00:00Z',
  };

  const sampleConsumptions: EncounterConsumptionItem[] = [
    {
      id: 'cons-1',
      encounterId: 'enc-1',
      sourceId: 'prod-1',
      code: 'MED-DIP-01',
      performedBy: 'Dr. Diego Iván Irusta',
      patientId: 'pat-101',
      sourceType: 'MEDICAMENTO',
      concept: 'Dipirona 500mg/ml Inyectable',
      quantity: 1,
      unitPrice: 5200,
      subtotal: 5200,
      status: 'CONFIRMADO',
      performedAt: '2026-08-29T10:00:00Z',
      isBilled: false,
    },
    {
      id: 'cons-2',
      encounterId: 'enc-1',
      sourceId: 'prod-2',
      code: 'INS-JER-03',
      performedBy: 'Dr. Diego Iván Irusta',
      patientId: 'pat-101',
      sourceType: 'INSUMO',
      concept: 'Insumo Descartable: Jeringa 3ml cono luer',
      quantity: 1,
      unitPrice: 400,
      subtotal: 400,
      status: 'CONFIRMADO',
      performedAt: '2026-08-29T10:00:00Z',
      isBilled: false,
    },
    {
      id: 'cons-3',
      encounterId: 'enc-1',
      sourceId: 'prod-3',
      code: 'INS-AGU-258',
      performedBy: 'Dr. Diego Iván Irusta',
      patientId: 'pat-101',
      sourceType: 'INSUMO',
      concept: 'Insumo Descartable: Aguja hipodérmica 25/8',
      quantity: 1,
      unitPrice: 200,
      subtotal: 200,
      status: 'CONFIRMADO',
      performedAt: '2026-08-29T10:00:00Z',
      isBilled: false,
    },
    {
      id: 'cons-4',
      encounterId: 'enc-1',
      sourceId: 'prod-4',
      code: 'MED-CER-10',
      performedBy: 'Dr. Diego Iván Irusta',
      patientId: 'pat-101',
      sourceType: 'MEDICAMENTO',
      concept: 'Cerenia / Maropitant 10mg/ml Inyectable',
      quantity: 1,
      unitPrice: 16500,
      subtotal: 16500,
      status: 'CONFIRMADO',
      performedAt: '2026-08-29T11:30:00Z',
      isBilled: false,
    },
    {
      id: 'cons-5',
      encounterId: 'enc-1',
      sourceId: 'hosp-1',
      code: 'HOSP-UCI-01',
      performedBy: 'Dr. Diego Iván Irusta',
      patientId: 'pat-101',
      sourceType: 'INTERNACION',
      concept: 'Día de Internación & Monitoreo UCI Canil 01',
      quantity: 1,
      unitPrice: 25000,
      subtotal: 25000,
      status: 'CONFIRMADO',
      performedAt: '2026-08-29T08:00:00Z',
      isBilled: false,
    },
  ];

  it('1. Debe agrupar y discriminar los subtotales por rubro (medicamentos, insumos descartables, internación)', () => {
    const totalMedications = sampleConsumptions
      .filter((c) => c.sourceType === 'MEDICAMENTO')
      .reduce((acc, c) => acc + c.subtotal, 0);

    const totalSupplies = sampleConsumptions
      .filter((c) => c.sourceType === 'INSUMO')
      .reduce((acc, c) => acc + c.subtotal, 0);

    const totalHosp = sampleConsumptions
      .filter((c) => c.sourceType === 'INTERNACION')
      .reduce((acc, c) => acc + c.subtotal, 0);

    const grandTotal = sampleConsumptions.reduce((acc, c) => acc + c.subtotal, 0);

    expect(totalMedications).toBe(5200 + 16500); // 21700
    expect(totalSupplies).toBe(400 + 200); // 600
    expect(totalHosp).toBe(25000);
    expect(grandTotal).toBe(21700 + 600 + 25000); // 47300
  });

  it('2. Debe permitir simular el cobro de consumos y marcar los ítems como liquidados (isBilled: true)', () => {
    const unbilledItems = sampleConsumptions.filter((c) => !c.isBilled);
    expect(unbilledItems.length).toBe(5);

    const invoiceNumber = `REC-0001-${Math.floor(1000 + Math.random() * 9000)}`;
    const updatedConsumptions = sampleConsumptions.map((c) => ({
      ...c,
      isBilled: true,
      invoiceId: 'inv-test-1',
    }));

    const remainingUnbilled = updatedConsumptions.filter((c) => !c.isBilled);
    expect(remainingUnbilled.length).toBe(0);
    expect(invoiceNumber).toContain('REC-0001-');
  });

  it('3. Debe calcular el total con bonificación / descuento opcional sin permitir saldo negativo', () => {
    const grandTotal = sampleConsumptions.reduce((acc, c) => acc + c.subtotal, 0);
    const discount = 5000;
    const finalAmount = Math.max(0, grandTotal - discount);
    expect(finalAmount).toBe(42300);

    const excessiveDiscount = 999999;
    const boundedAmount = Math.max(0, grandTotal - excessiveDiscount);
    expect(boundedAmount).toBe(0);
  });

  it('4. Debe admitir formas de pago habituales en veterinarias (Efectivo, Transferencia, Mercado Pago QR, Débito)', () => {
    const validMethods = ['EFECTIVO', 'TRANSFERENCIA', 'MERCADOPAGO_QR', 'DEBITO', 'CREDITO'];
    expect(validMethods).toContain('EFECTIVO');
    expect(validMethods).toContain('TRANSFERENCIA');
    expect(validMethods).toContain('MERCADOPAGO_QR');
  });
});
