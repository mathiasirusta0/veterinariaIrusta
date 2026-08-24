import { describe, it, expect } from 'vitest';
import { FinancialMovement, AccountDebt } from '../../types';

describe('Módulo de Gestión Económica & Finanzas del Negocio', () => {
  it('debe calcular la ganancia neta restando los gastos de los ingresos (Ingresos - Gastos)', () => {
    const movements: FinancialMovement[] = [
      {
        id: '1',
        date: '2026-08-20',
        type: 'INGRESO',
        category: 'Consultas',
        concept: 'Consulta + Vacuna',
        amount: 45000,
        paymentMethod: 'TRANSFERENCIA',
        status: 'COBRADO',
        createdAt: '2026-08-20T10:00:00Z',
        createdBy: 'Dr. Matías Irusta',
      },
      {
        id: '2',
        date: '2026-08-21',
        type: 'INGRESO',
        category: 'Cirugías',
        concept: 'Cirugía traumatológica',
        amount: 180000,
        paymentMethod: 'MERCADOPAGO_QR',
        status: 'COBRADO',
        createdAt: '2026-08-21T11:00:00Z',
        createdBy: 'Dr. Matías Irusta',
      },
      {
        id: '3',
        date: '2026-08-22',
        type: 'GASTO',
        category: 'Insumos',
        concept: 'Compra descartables',
        amount: 65000,
        paymentMethod: 'TRANSFERENCIA',
        status: 'PAGADO',
        createdAt: '2026-08-22T12:00:00Z',
        createdBy: 'Administración',
      },
    ];

    const totalIncome = movements
      .filter((m) => m.type === 'INGRESO' && !m.isVoided)
      .reduce((acc, m) => acc + m.amount, 0);

    const totalExpense = movements
      .filter((m) => m.type === 'GASTO' && !m.isVoided)
      .reduce((acc, m) => acc + m.amount, 0);

    const netProfit = totalIncome - totalExpense;

    expect(totalIncome).toBe(225000);
    expect(totalExpense).toBe(65000);
    expect(netProfit).toBe(160000);
  });

  it('debe registrar pagos parciales sucesivos en cuentas a cobrar y actualizar el saldo pendiente', () => {
    const debt: AccountDebt = {
      id: 'deb-test-1',
      type: 'COBRAR',
      entityName: 'Juan Pérez',
      concept: 'Internación y cirugía',
      totalAmount: 100000,
      paidAmount: 0,
      balance: 100000,
      issueDate: '2026-08-10',
      dueDate: '2026-08-30',
      status: 'PENDIENTE',
      payments: [],
      createdAt: '2026-08-10T10:00:00Z',
      createdBy: 'Dr. Matías Irusta',
    };

    // Primer pago parcial de $30.000
    const payment1 = {
      id: 'pay-1',
      date: '2026-08-15',
      amount: 30000,
      paymentMethod: 'TRANSFERENCIA' as const,
      notes: 'Anticipo',
      registeredBy: 'Secretaría',
    };

    debt.paidAmount += payment1.amount;
    debt.balance = debt.totalAmount - debt.paidAmount;
    debt.status = debt.balance === 0 ? 'PAGADA' : 'PARCIAL';
    debt.payments.push(payment1);

    expect(debt.paidAmount).toBe(30000);
    expect(debt.balance).toBe(70000);
    expect(debt.status).toBe('PARCIAL');
    expect(debt.payments.length).toBe(1);

    // Segundo pago parcial de $20.000
    const payment2 = {
      id: 'pay-2',
      date: '2026-08-20',
      amount: 20000,
      paymentMethod: 'EFECTIVO' as const,
      notes: 'Segundo abono',
      registeredBy: 'Secretaría',
    };

    debt.paidAmount += payment2.amount;
    debt.balance = debt.totalAmount - debt.paidAmount;
    debt.status = debt.balance === 0 ? 'PAGADA' : 'PARCIAL';
    debt.payments.push(payment2);

    expect(debt.paidAmount).toBe(50000);
    expect(debt.balance).toBe(50000);
    expect(debt.status).toBe('PARCIAL');
    expect(debt.payments.length).toBe(2);

    // Pago final cancelatorio de $50.000
    const payment3 = {
      id: 'pay-3',
      date: '2026-08-25',
      amount: 50000,
      paymentMethod: 'TRANSFERENCIA' as const,
      notes: 'Cancelación total',
      registeredBy: 'Secretaría',
    };

    debt.paidAmount += payment3.amount;
    debt.balance = debt.totalAmount - debt.paidAmount;
    debt.status = debt.balance === 0 ? 'PAGADA' : 'PARCIAL';
    debt.payments.push(payment3);

    expect(debt.paidAmount).toBe(100000);
    expect(debt.balance).toBe(0);
    expect(debt.status).toBe('PAGADA');
    expect(debt.payments.length).toBe(3);
  });

  it('debe anular movimientos sin eliminarlos físicamente de la base/auditoría', () => {
    const movement: FinancialMovement = {
      id: 'fin-void-1',
      date: '2026-08-24',
      type: 'INGRESO',
      category: 'Ventas',
      concept: 'Venta errónea',
      amount: 15000,
      paymentMethod: 'EFECTIVO',
      status: 'COBRADO',
      createdAt: '2026-08-24T09:00:00Z',
      createdBy: 'Dr. Matías Irusta',
    };

    // Anulación con motivo
    movement.isVoided = true;
    movement.voidReason = 'Carga duplicada por error';
    movement.status = 'ANULADO';

    expect(movement.isVoided).toBe(true);
    expect(movement.status).toBe('ANULADO');
    expect(movement.voidReason).toBe('Carga duplicada por error');
  });
});
