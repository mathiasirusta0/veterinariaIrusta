import { describe, it, expect } from 'vitest';
import { FinancialMovement, AccountDebt, PaymentInstallment } from '../../types';

describe('Unified Finances & Accounting Principles Unit Tests', () => {
  it('should accurately calculate operating result (Ingresos - Gastos)', () => {
    const movements: FinancialMovement[] = [
      {
        id: 'mov-1',
        date: '2026-08-24',
        type: 'INGRESO',
        category: 'Consultas',
        concept: 'Consulta Médica General',
        amount: 25000,
        paymentMethod: 'EFECTIVO',
        status: 'COBRADO',
        createdAt: '2026-08-24T10:00:00Z',
        createdBy: 'Dr. Diego Iván Irusta',
      },
      {
        id: 'mov-2',
        date: '2026-08-24',
        type: 'INGRESO',
        category: 'Cirugía',
        concept: 'Cirugía Traumatológica',
        amount: 150000,
        paymentMethod: 'TRANSFERENCIA',
        status: 'COBRADO',
        createdAt: '2026-08-24T11:00:00Z',
        createdBy: 'Dr. Diego Iván Irusta',
      },
      {
        id: 'mov-3',
        date: '2026-08-24',
        type: 'GASTO',
        category: 'Insumos',
        concept: 'Compra de Sueros y Descartables',
        amount: 45000,
        paymentMethod: 'TRANSFERENCIA',
        status: 'PAGADO',
        createdAt: '2026-08-24T12:00:00Z',
        createdBy: 'Dr. Diego Iván Irusta',
      },
    ];

    const totalIncome = movements
      .filter((m) => !m.isVoided && m.type === 'INGRESO')
      .reduce((acc, m) => acc + m.amount, 0);

    const totalExpense = movements
      .filter((m) => !m.isVoided && m.type === 'GASTO')
      .reduce((acc, m) => acc + m.amount, 0);

    const operatingResult = totalIncome - totalExpense;

    expect(totalIncome).toBe(175000);
    expect(totalExpense).toBe(45000);
    expect(operatingResult).toBe(130000);
  });

  it('should handle partial debt payments cumulatively without overwriting past history', () => {
    let debt: AccountDebt = {
      id: 'debt-1',
      branchId: 'branch-1',
      type: 'COBRAR',
      entityName: 'Juan Pérez',
      concept: 'Saldo de Internación y Cirugía',
      totalAmount: 100000,
      paidAmount: 0,
      balance: 100000,
      issueDate: '2026-08-20',
      dueDate: '2026-09-05',
      status: 'PENDIENTE',
      payments: [],
      createdAt: '2026-08-20T10:00:00Z',
      createdBy: 'Superadmin',
    };

    // First partial payment: $40,000
    const payment1: PaymentInstallment = {
      id: 'pay-1',
      date: '2026-08-21',
      amount: 40000,
      paymentMethod: 'TRANSFERENCIA',
      notes: 'Transferencia bancaria primera cuota',
      registeredBy: 'Superadmin',
    };

    debt = {
      ...debt,
      paidAmount: debt.paidAmount + payment1.amount,
      balance: Math.max(0, debt.totalAmount - (debt.paidAmount + payment1.amount)),
      status: 'PARCIAL',
      payments: [...debt.payments, payment1],
    };

    expect(debt.paidAmount).toBe(40000);
    expect(debt.balance).toBe(60000);
    expect(debt.status).toBe('PARCIAL');
    expect(debt.payments.length).toBe(1);

    // Second partial payment: $60,000 (completes the debt)
    const payment2: PaymentInstallment = {
      id: 'pay-2',
      date: '2026-08-24',
      amount: 60000,
      paymentMethod: 'EFECTIVO',
      notes: 'Pago final en efectivo',
      registeredBy: 'Superadmin',
    };

    debt = {
      ...debt,
      paidAmount: debt.paidAmount + payment2.amount,
      balance: Math.max(0, debt.totalAmount - (debt.paidAmount + payment2.amount)),
      status: 'PAGADA',
      payments: [...debt.payments, payment2],
    };

    expect(debt.paidAmount).toBe(100000);
    expect(debt.balance).toBe(0);
    expect(debt.status).toBe('PAGADA');
    expect(debt.payments.length).toBe(2);
  });

  it('should strictly prevent overpayments exceeding the remaining balance', () => {
    const debt: AccountDebt = {
      id: 'debt-2',
      branchId: 'branch-1',
      type: 'COBRAR',
      entityName: 'Lucía Méndez',
      concept: 'Tratamiento Quimioterapia',
      totalAmount: 50000,
      paidAmount: 30000,
      balance: 20000,
      issueDate: '2026-08-10',
      dueDate: '2026-08-30',
      status: 'PARCIAL',
      payments: [],
      createdAt: '2026-08-10T10:00:00Z',
      createdBy: 'Superadmin',
    };

    const attemptPayment = (amount: number): boolean => {
      if (amount > debt.balance) {
        return false; // Rejected
      }
      return true; // Accepted
    };

    expect(attemptPayment(25000)).toBe(false);
    expect(attemptPayment(20000)).toBe(true);
    expect(attemptPayment(10000)).toBe(true);
  });

  it('should void a movement non-destructively and exclude it from operational results', () => {
    const movements: FinancialMovement[] = [
      {
        id: 'mov-1',
        date: '2026-08-24',
        type: 'INGRESO',
        category: 'Consultas',
        concept: 'Cobro duplicado por error',
        amount: 25000,
        paymentMethod: 'EFECTIVO',
        status: 'COBRADO',
        createdAt: '2026-08-24T10:00:00Z',
        createdBy: 'Dr. Diego Iván Irusta',
      },
    ];

    // Void movement
    const voidedMovements = movements.map((m) =>
      m.id === 'mov-1'
        ? {
            ...m,
            isVoided: true,
            voidReason: 'Error de tipeo en importe',
            status: 'ANULADO' as const,
          }
        : m
    );

    const nonVoidedIncome = voidedMovements
      .filter((m) => !m.isVoided && m.type === 'INGRESO')
      .reduce((acc, m) => acc + m.amount, 0);

    expect(voidedMovements[0].isVoided).toBe(true);
    expect(voidedMovements[0].voidReason).toBe('Error de tipeo en importe');
    expect(nonVoidedIncome).toBe(0);
  });
});
