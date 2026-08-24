import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Plus,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  FileText,
  Download,
  Printer,
  ChevronRight,
  ChevronDown,
  X,
  CreditCard,
  Building,
  User,
  PieChart,
  BarChart3,
  Wallet,
  ShieldCheck,
  Ban,
  Tag,
  Share2,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import {
  FinancialMovement,
  AccountDebt,
  FinancialPaymentMethod,
  FinancialMovementStatus,
} from '../types';
import { formatCurrency, formatDate, formatDateTime, maskDni } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, StatusBadge } from './ui';

export const EconomicManagementView: React.FC = () => {
  const {
    financialMovements,
    accountDebts,
    incomeCategories,
    expenseCategories,
    currentUser,
    owners,
    addFinancialMovement,
    voidFinancialMovement,
    addAccountDebt,
    registerDebtPayment,
    addCustomCategory,
    openPrintModal,
    showToast,
  } = useVet();

  // Navigation Tab inside Economic Management
  const [activeTab, setActiveTab] = useState<
    'RESUMEN' | 'INGRESOS' | 'GASTOS' | 'COBRAR' | 'PAGAR' | 'MOVIMIENTOS' | 'GANANCIAS' | 'REPORTES'
  >('RESUMEN');

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('TODAS');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('TODOS');
  const [filterStatus, setFilterStatus] = useState('TODOS');
  const [dateRange, setDateRange] = useState<'HOY' | 'SEMANA' | 'MES' | 'ANIO' | 'TODO'>('MES');

  // Modals state
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState<'COBRAR' | 'PAGAR' | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<AccountDebt | null>(null);
  const [showVoidModal, setShowVoidModal] = useState<FinancialMovement | null>(null);

  // Forms state: Income / Expense
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formConcept, setFormConcept] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formNewCategory, setFormNewCategory] = useState('');
  const [formAmount, setFormAmount] = useState<number | ''>('');
  const [formClientOrSupplier, setFormClientOrSupplier] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<FinancialPaymentMethod>('TRANSFERENCIA');
  const [formStatus, setFormStatus] = useState<FinancialMovementStatus>('COBRADO');
  const [formNotes, setFormNotes] = useState('');

  // Forms state: Debt (Cobrar / Pagar)
  const [debtEntityName, setDebtEntityName] = useState('');
  const [debtConcept, setDebtConcept] = useState('');
  const [debtTotalAmount, setDebtTotalAmount] = useState<number | ''>('');
  const [debtDueDate, setDebtDueDate] = useState(
    new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [debtNotes, setDebtNotes] = useState('');

  // Forms state: Partial Payment
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<FinancialPaymentMethod>('TRANSFERENCIA');
  const [payNotes, setPayNotes] = useState('');

  // Void Reason
  const [voidReason, setVoidReason] = useState('');

  // Expanded Debt Rows for payment history
  const [expandedDebtIds, setExpandedDebtIds] = useState<Record<string, boolean>>({});

  const toggleExpandDebt = (id: string) => {
    setExpandedDebtIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // KPI Calculations
  const metrics = useMemo(() => {
    const nonVoidedMovements = financialMovements.filter((m) => !m.isVoided);

    const totalIncome = nonVoidedMovements
      .filter((m) => m.type === 'INGRESO')
      .reduce((acc, m) => acc + m.amount, 0);

    const totalExpense = nonVoidedMovements
      .filter((m) => m.type === 'GASTO')
      .reduce((acc, m) => acc + m.amount, 0);

    const netProfit = totalIncome - totalExpense;

    const totalReceivable = accountDebts
      .filter((d) => d.type === 'COBRAR' && d.status !== 'PAGADA')
      .reduce((acc, d) => acc + d.balance, 0);

    const totalPayable = accountDebts
      .filter((d) => d.type === 'PAGAR' && d.status !== 'PAGADA')
      .reduce((acc, d) => acc + d.balance, 0);

    const overdueReceivables = accountDebts.filter(
      (d) => d.type === 'COBRAR' && (d.status === 'VENCIDA' || (d.status !== 'PAGADA' && new Date(d.dueDate) < new Date()))
    );

    const overduePayables = accountDebts.filter(
      (d) => d.type === 'PAGAR' && (d.status === 'VENCIDA' || (d.status !== 'PAGADA' && new Date(d.dueDate) < new Date()))
    );

    return {
      totalIncome,
      totalExpense,
      netProfit,
      totalReceivable,
      totalPayable,
      availableBalance: totalIncome - totalExpense,
      overdueReceivablesCount: overdueReceivables.length,
      overduePayablesCount: overduePayables.length,
    };
  }, [financialMovements, accountDebts]);

  // Expenses breakdown by category
  const expenseByCategory = useMemo(() => {
    const nonVoided = financialMovements.filter((m) => !m.isVoided && m.type === 'GASTO');
    const map: Record<string, number> = {};
    nonVoided.forEach((m) => {
      map[m.category] = (map[m.category] || 0) + m.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [financialMovements]);

  // Handlers for Submitting Forms
  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConcept || !formAmount || formAmount <= 0) {
      showToast('error', 'Campos Incompletos', 'Ingresá un concepto y un importe válido.');
      return;
    }

    const cat = formNewCategory.trim() || formCategory || 'Consultas';
    if (formNewCategory.trim()) {
      addCustomCategory('INGRESO', formNewCategory.trim());
    }

    addFinancialMovement({
      date: formDate,
      type: 'INGRESO',
      category: cat,
      concept: formConcept,
      amount: Number(formAmount),
      paymentMethod: formPaymentMethod,
      status: formStatus,
      clientName: formClientOrSupplier || undefined,
      notes: formNotes || undefined,
    });

    showToast('success', 'Ingreso Registrado', `Se registró ${formatCurrency(formAmount)} por "${formConcept}".`);
    setShowIncomeModal(false);
    resetForm();
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formConcept || !formAmount || formAmount <= 0) {
      showToast('error', 'Campos Incompletos', 'Ingresá un concepto y un importe válido.');
      return;
    }

    const cat = formNewCategory.trim() || formCategory || 'Insumos';
    if (formNewCategory.trim()) {
      addCustomCategory('GASTO', formNewCategory.trim());
    }

    addFinancialMovement({
      date: formDate,
      type: 'GASTO',
      category: cat,
      concept: formConcept,
      amount: Number(formAmount),
      paymentMethod: formPaymentMethod,
      status: 'PAGADO',
      supplierName: formClientOrSupplier || undefined,
      notes: formNotes || undefined,
    });

    showToast('success', 'Gasto Registrado', `Se registró el gasto de ${formatCurrency(formAmount)}.`);
    setShowExpenseModal(false);
    resetForm();
  };

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtEntityName || !debtConcept || !debtTotalAmount || debtTotalAmount <= 0) {
      showToast('error', 'Campos Incompletos', 'Completá el titular, concepto e importe total.');
      return;
    }

    addAccountDebt({
      type: showDebtModal === 'COBRAR' ? 'COBRAR' : 'PAGAR',
      entityName: debtEntityName,
      concept: debtConcept,
      totalAmount: Number(debtTotalAmount),
      issueDate: formDate,
      dueDate: debtDueDate,
      status: 'PENDIENTE',
      notes: debtNotes || undefined,
    });

    showToast(
      'success',
      showDebtModal === 'COBRAR' ? 'Cuenta a Cobrar Registrada' : 'Cuenta a Pagar Registrada',
      `Deuda por ${formatCurrency(debtTotalAmount)} generada para ${debtEntityName}.`
    );
    setShowDebtModal(null);
    setDebtEntityName('');
    setDebtConcept('');
    setDebtTotalAmount('');
    setDebtNotes('');
  };

  const handleSavePartialPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPaymentModal || !payAmount || payAmount <= 0) return;

    if (Number(payAmount) > showPaymentModal.balance) {
      showToast('error', 'Importe Excesivo', 'El monto a pagar no puede superar el saldo pendiente.');
      return;
    }

    registerDebtPayment(showPaymentModal.id, Number(payAmount), payMethod, payNotes);
    showToast('success', 'Pago Registrado', `Se registraron ${formatCurrency(payAmount)} para "${showPaymentModal.entityName}".`);
    setShowPaymentModal(null);
    setPayAmount('');
    setPayNotes('');
  };

  const handleConfirmVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showVoidModal || !voidReason.trim()) {
      showToast('error', 'Motivo Requerido', 'Indicá el motivo de anulación del movimiento.');
      return;
    }

    voidFinancialMovement(showVoidModal.id, voidReason);
    showToast('info', 'Movimiento Anulado', 'El movimiento ha sido anulado y preservado en auditoría.');
    setShowVoidModal(null);
    setVoidReason('');
  };

  const resetForm = () => {
    setFormConcept('');
    setFormCategory('');
    setFormNewCategory('');
    setFormAmount('');
    setFormClientOrSupplier('');
    setFormNotes('');
  };

  // Export to CSV Function
  const exportToCSV = () => {
    const rows = [
      ['Fecha', 'Tipo', 'Categoría', 'Concepto', 'Cliente/Proveedor', 'Importe', 'Medio de Pago', 'Estado'],
      ...financialMovements.map((m) => [
        m.date,
        m.type,
        m.category,
        `"${m.concept.replace(/"/g, '""')}"`,
        `"${(m.clientName || m.supplierName || 'S/D').replace(/"/g, '""')}"`,
        m.amount,
        m.paymentMethod,
        m.status,
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_economico_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Archivo CSV Exportado', 'Los registros se descargaron correctamente.');
  };

  return (
    <div className="space-y-6 pb-20 w-full max-w-full">
      {/* 1. Header with Fast 1-Tap Action Buttons */}
      <PageHeader
        category="Control Económico & Finanzas Simples"
        title="Gestión Económica"
        description="Panel unificado de ingresos, gastos, deudas a cobrar/pagar y balances en tiempo real sin complejidad contable"
        icon={TrendingUp}
        actions={[
          {
            label: '+ Ingreso',
            icon: ArrowUpRight,
            onClick: () => {
              triggerHaptic('light');
              setFormCategory(incomeCategories[0]);
              setShowIncomeModal(true);
            },
            variant: 'primary',
          },
          {
            label: '+ Gasto',
            icon: ArrowDownRight,
            onClick: () => {
              triggerHaptic('light');
              setFormCategory(expenseCategories[0]);
              setShowExpenseModal(true);
            },
            variant: 'secondary',
          },
          {
            label: '+ Deuda',
            icon: Clock,
            onClick: () => {
              triggerHaptic('light');
              setShowDebtModal('COBRAR');
            },
            variant: 'secondary',
          },
        ]}
      />

      {/* 2. Primary Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-1 sm:gap-2 overflow-x-auto bg-white p-1.5 rounded-2xl shadow-2xs">
        {[
          { id: 'RESUMEN', label: 'Dashboard', icon: BarChart3 },
          { id: 'INGRESOS', label: 'Ingresos', icon: ArrowUpRight, count: financialMovements.filter((m) => m.type === 'INGRESO' && !m.isVoided).length },
          { id: 'GASTOS', label: 'Gastos', icon: ArrowDownRight, count: financialMovements.filter((m) => m.type === 'GASTO' && !m.isVoided).length },
          { id: 'COBRAR', label: 'Cuentas a Cobrar', icon: DollarSign, count: accountDebts.filter((d) => d.type === 'COBRAR' && d.status !== 'PAGADA').length },
          { id: 'PAGAR', label: 'Cuentas a Pagar', icon: Building, count: accountDebts.filter((d) => d.type === 'PAGAR' && d.status !== 'PAGADA').length },
          { id: 'MOVIMIENTOS', label: 'Movimientos', icon: FileText },
          { id: 'GANANCIAS', label: 'Ganancias', icon: TrendingUp },
          { id: 'REPORTES', label: 'Reportes & PDF', icon: Download },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setActiveTab(t.id as any);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
              {t.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: DASHBOARD RESUMEN EJECUTIVO */}
      {activeTab === 'RESUMEN' && (
        <div className="space-y-6 animate-fade-in">
          {/* 6 Essential KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            {/* 1. INGRESOS */}
            <div className="bg-white border border-emerald-200/80 rounded-3xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800">
                  Ingresos del Mes
                </span>
                <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl sm:text-2xl font-black text-emerald-950 font-mono tracking-tight">
                  {formatCurrency(metrics.totalIncome)}
                </h3>
                <span className="text-[11px] text-emerald-700 font-medium">Cobros recibidos</span>
              </div>
            </div>

            {/* 2. GASTOS */}
            <div className="bg-white border border-rose-200/80 rounded-3xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-rose-800">
                  Gastos del Mes
                </span>
                <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl sm:text-2xl font-black text-rose-950 font-mono tracking-tight">
                  {formatCurrency(metrics.totalExpense)}
                </h3>
                <span className="text-[11px] text-rose-700 font-medium">Egresos operativos</span>
              </div>
            </div>

            {/* 3. GANANCIA NETA */}
            <div className={`bg-white border rounded-3xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between ${
              metrics.netProfit >= 0 ? 'border-teal-200/80' : 'border-amber-300 bg-amber-50/20'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-teal-800">
                  Ganancia Neta
                </span>
                <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                  metrics.netProfit >= 0 ? 'text-teal-950' : 'text-amber-900'
                }`}>
                  {formatCurrency(metrics.netProfit)}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Ingresos menos Gastos</span>
              </div>
            </div>

            {/* 4. DEUDAS A COBRAR */}
            <div className="bg-white border border-amber-200/80 rounded-3xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-amber-800">
                  Cuentas a Cobrar
                </span>
                <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-mono tracking-tight">
                  {formatCurrency(metrics.totalReceivable)}
                </h3>
                <span className="text-[11px] text-amber-700 font-medium">Pendiente de clientes</span>
              </div>
            </div>

            {/* 5. DEUDAS A PAGAR */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-600">
                  Cuentas a Pagar
                </span>
                <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Building className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {formatCurrency(metrics.totalPayable)}
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Compromisos pendientes</span>
              </div>
            </div>

            {/* 6. SALDO DISPONIBLE */}
            <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-md flex flex-col justify-between border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black tracking-wider text-teal-400">
                  Saldo Actual
                </span>
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-teal-300 flex items-center justify-center font-bold">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                  {formatCurrency(metrics.availableBalance)}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">Posición económica neta</span>
              </div>
            </div>
          </div>

          {/* Overdue Alerts Banner if any */}
          {(metrics.overdueReceivablesCount > 0 || metrics.overduePayablesCount > 0) && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <div>
                  <strong className="text-amber-900 font-black block">Alertas de Vencimiento de Cuentas:</strong>
                  <span className="text-amber-800">
                    Tenés <strong>{metrics.overdueReceivablesCount} cuentas por cobrar</strong> y{' '}
                    <strong>{metrics.overduePayablesCount} cuentas por pagar</strong> que requieren seguimiento.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('COBRAR')}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl shadow-xs transition-all text-xs flex-shrink-0"
              >
                Revisar Deudas →
              </button>
            </div>
          )}

          {/* Charts and Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart: Ingresos vs Gastos */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-teal-600" />
                  <span>Comparativa: Ingresos vs Gastos</span>
                </h4>
                <span className="text-xs text-slate-500 font-mono">Mes Actual</span>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-emerald-800">Ingresos Totales</span>
                    <span className="text-emerald-800 font-mono">{formatCurrency(metrics.totalIncome)}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (metrics.totalIncome / (metrics.totalIncome + metrics.totalExpense || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-rose-800">Gastos Totales</span>
                    <span className="text-rose-800 font-mono">{formatCurrency(metrics.totalExpense)}</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          100,
                          (metrics.totalExpense / (metrics.totalIncome + metrics.totalExpense || 1)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Margen Neto Operativo:</span>
                  <strong className={`font-mono text-sm ${metrics.netProfit >= 0 ? 'text-teal-700' : 'text-rose-700'}`}>
                    {metrics.totalIncome > 0 ? `${((metrics.netProfit / metrics.totalIncome) * 100).toFixed(1)}%` : '0%'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Expenses Distribution */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-rose-600" />
                  <span>Distribución de Gastos por Categoría</span>
                </h4>
                <span className="text-xs text-slate-500 font-mono">{expenseByCategory.length} categorías</span>
              </div>

              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {expenseByCategory.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No hay gastos registrados aún.</p>
                ) : (
                  expenseByCategory.map(([cat, amt]) => {
                    const pct = metrics.totalExpense > 0 ? (amt / metrics.totalExpense) * 100 : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-700">{cat}</span>
                          <span className="font-mono text-slate-900 font-bold">
                            {formatCurrency(amt)} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500/80 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Quick Recent Movements List */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-black text-slate-900 text-sm">Últimos Movimientos Económicos</h4>
              <button
                type="button"
                onClick={() => setActiveTab('MOVIMIENTOS')}
                className="text-xs font-bold text-teal-700 hover:underline"
              >
                Ver todos ({financialMovements.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {financialMovements.slice(0, 6).map((m) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-2 text-xs ${
                    m.isVoided
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : m.type === 'INGRESO'
                      ? 'bg-emerald-50/40 border-emerald-200/80'
                      : 'bg-rose-50/40 border-rose-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        m.type === 'INGRESO' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {m.type === 'INGRESO' ? '🟢 Ingreso' : '🔴 Gasto'} • {m.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{m.date}</span>
                  </div>

                  <div>
                    <strong className="text-slate-900 block font-bold text-xs line-clamp-1">{m.concept}</strong>
                    <span className="text-slate-500 text-[11px]">
                      {m.clientName ? `Cliente: ${m.clientName}` : m.supplierName ? `Proveedor: ${m.supplierName}` : 'General'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200/60 pt-1.5">
                    <span className="text-[10px] font-bold text-slate-500">{m.paymentMethod}</span>
                    <strong
                      className={`text-sm font-mono font-black ${
                        m.type === 'INGRESO' ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {m.type === 'INGRESO' ? '+' : '-'}{formatCurrency(m.amount)}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2 & 3: INGRESOS & GASTOS TABLES / MOBILE CARDS */}
      {(activeTab === 'INGRESOS' || activeTab === 'GASTOS') && (
        <div className="space-y-4 animate-fade-in">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por concepto o titular..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="TODAS">Todas las Categorías</option>
                {(activeTab === 'INGRESOS' ? incomeCategories : expenseCategories).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => (activeTab === 'INGRESOS' ? setShowIncomeModal(true) : setShowExpenseModal(true))}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-sm transition-all whitespace-nowrap"
              >
                + Registrar {activeTab === 'INGRESOS' ? 'Ingreso' : 'Gasto'}
              </button>
            </div>
          </div>

          {/* List of items */}
          {financialMovements
            .filter((m) => m.type === (activeTab === 'INGRESOS' ? 'INGRESO' : 'GASTO'))
            .filter((m) => {
              const q = searchTerm.toLowerCase();
              const matchQ =
                !q ||
                m.concept.toLowerCase().includes(q) ||
                (m.clientName && m.clientName.toLowerCase().includes(q)) ||
                (m.supplierName && m.supplierName.toLowerCase().includes(q));
              const matchCat = filterCategory === 'TODAS' || m.category === filterCategory;
              return matchQ && matchCat;
            }).length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title={`No hay ${activeTab === 'INGRESOS' ? 'ingresos' : 'gastos'} registrados`}
              description="Registrá un nuevo movimiento haciendo clic en el botón superior."
              actionLabel={`+ Registrar ${activeTab === 'INGRESOS' ? 'Ingreso' : 'Gasto'}`}
              onAction={() => (activeTab === 'INGRESOS' ? setShowIncomeModal(true) : setShowExpenseModal(true))}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {financialMovements
                .filter((m) => m.type === (activeTab === 'INGRESOS' ? 'INGRESO' : 'GASTO'))
                .filter((m) => {
                  const q = searchTerm.toLowerCase();
                  const matchQ =
                    !q ||
                    m.concept.toLowerCase().includes(q) ||
                    (m.clientName && m.clientName.toLowerCase().includes(q)) ||
                    (m.supplierName && m.supplierName.toLowerCase().includes(q));
                  const matchCat = filterCategory === 'TODAS' || m.category === filterCategory;
                  return matchQ && matchCat;
                })
                .map((m) => (
                  <div
                    key={m.id}
                    className={`bg-white border rounded-3xl p-4 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-3 ${
                      m.isVoided ? 'opacity-50 border-slate-300' : 'border-slate-200 hover:border-teal-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                          {m.category}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">{m.date}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">{m.concept}</h4>
                      {m.description && <p className="text-[11px] text-slate-500 mt-1">{m.description}</p>}
                      <p className="text-xs text-slate-600 font-medium mt-1">
                        {m.clientName ? `👤 Cliente: ${m.clientName}` : m.supplierName ? `🏢 Proveedor: ${m.supplierName}` : 'S/D'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-slate-400 block">{m.paymentMethod}</span>
                        <strong
                          className={`text-base font-black font-mono ${
                            m.type === 'INGRESO' ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        >
                          {m.type === 'INGRESO' ? '+' : '-'}{formatCurrency(m.amount)}
                        </strong>
                      </div>

                      {!m.isVoided && (
                        <button
                          type="button"
                          onClick={() => setShowVoidModal(m)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-[11px] flex items-center gap-1 font-bold"
                          title="Anular movimiento"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Anular</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 4 & 5: CUENTAS A COBRAR & CUENTAS A PAGAR */}
      {(activeTab === 'COBRAR' || activeTab === 'PAGAR') && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {activeTab === 'COBRAR' ? 'Cuentas a Cobrar (Clientes)' : 'Cuentas a Pagar (Proveedores)'}
              </h3>
              <p className="text-slate-500 text-[11px]">
                Control de saldos pendientes, vencimientos y registro de pagos parciales sucesivos
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDebtModal(activeTab === 'COBRAR' ? 'COBRAR' : 'PAGAR')}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-sm transition-all"
            >
              + Nueva Cuenta a {activeTab === 'COBRAR' ? 'Cobrar' : 'Pagar'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accountDebts
              .filter((d) => d.type === (activeTab === 'COBRAR' ? 'COBRAR' : 'PAGAR'))
              .map((debt) => {
                const isExpanded = expandedDebtIds[debt.id];
                const pct = debt.totalAmount > 0 ? (debt.paidAmount / debt.totalAmount) * 100 : 0;
                const isOverdue = debt.status === 'VENCIDA' || (debt.status !== 'PAGADA' && new Date(debt.dueDate) < new Date());

                return (
                  <div
                    key={debt.id}
                    className={`bg-white border rounded-3xl p-5 shadow-xs space-y-3 transition-all flex flex-col justify-between ${
                      debt.status === 'PAGADA'
                        ? 'border-emerald-200 bg-emerald-50/20'
                        : isOverdue
                        ? 'border-amber-300 bg-amber-50/20'
                        : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 border-b border-slate-100 pb-2">
                        <div>
                          <strong className="text-base font-black text-slate-900">{debt.entityName}</strong>
                          <p className="text-xs text-slate-500 font-medium">{debt.concept}</p>
                        </div>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                            debt.status === 'PAGADA'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : isOverdue
                              ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                              : debt.status === 'PARCIAL'
                              ? 'bg-purple-100 text-purple-800 border-purple-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {debt.status === 'PAGADA'
                            ? '✅ Cancelada'
                            : isOverdue
                            ? '⚠️ Vencida'
                            : debt.status === 'PARCIAL'
                            ? '⏳ Pago Parcial'
                            : '⏳ Pendiente'}
                        </span>
                      </div>

                      {/* Amounts & Progress */}
                      <div className="space-y-2 my-3">
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 block font-bold">Total</span>
                            <strong className="text-slate-900 font-mono">{formatCurrency(debt.totalAmount)}</strong>
                          </div>
                          <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                            <span className="text-[10px] text-emerald-700 block font-bold">Pagado</span>
                            <strong className="text-emerald-800 font-mono">{formatCurrency(debt.paidAmount)}</strong>
                          </div>
                          <div className="bg-rose-50 p-2 rounded-xl border border-rose-100">
                            <span className="text-[10px] text-rose-700 block font-bold">Saldo</span>
                            <strong className="text-rose-800 font-mono">{formatCurrency(debt.balance)}</strong>
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                        <span>Emisión: {debt.issueDate}</span>
                        <span>Vence: <strong className={isOverdue ? 'text-amber-700' : 'text-slate-800'}>{debt.dueDate}</strong></span>
                      </div>
                    </div>

                    {/* Footer & Actions */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleExpandDebt(debt.id)}
                          className="text-xs font-bold text-teal-700 hover:underline flex items-center gap-1"
                        >
                          <span>Historial de Pagos ({debt.payments.length})</span>
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>

                        {debt.status !== 'PAGADA' && (
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setPayAmount(debt.balance);
                              setShowPaymentModal(debt);
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-2xs transition-all flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>+ Registrar Pago</span>
                          </button>
                        )}
                      </div>

                      {/* Payment History Expandable */}
                      {isExpanded && (
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
                          <strong className="text-slate-800 text-[11px] block">Pagos Registrados:</strong>
                          {debt.payments.length === 0 ? (
                            <p className="text-slate-400 text-[11px]">No se han registrado pagos parciales aún.</p>
                          ) : (
                            debt.payments.map((p) => (
                              <div key={p.id} className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                                <div>
                                  <strong className="text-emerald-700 font-mono">{formatCurrency(p.amount)}</strong>
                                  <span className="text-slate-500 block">{p.paymentMethod} • {p.date}</span>
                                </div>
                                <span className="text-slate-400 text-[10px]">Por: {p.registeredBy}</span>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 6. TAB 6: MOVIMIENTOS ECONÓMICOS CRONOLÓGICOS */}
      {activeTab === 'MOVIMIENTOS' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar movimiento..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportToCSV}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black tracking-wider text-slate-500">
                  <tr>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Concepto</th>
                    <th className="p-3.5">Titular / Entidad</th>
                    <th className="p-3.5">Medio de Pago</th>
                    <th className="p-3.5 text-right">Importe</th>
                    <th className="p-3.5 text-center">Estado</th>
                    <th className="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {financialMovements.map((m) => (
                    <tr key={m.id} className={m.isVoided ? 'bg-slate-50/60 opacity-50' : 'hover:bg-slate-50/50'}>
                      <td className="p-3.5 font-mono text-slate-500 whitespace-nowrap">{m.date}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            m.type === 'INGRESO' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {m.type === 'INGRESO' ? '🟢 Ingreso' : '🔴 Gasto'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <strong className="text-slate-900 block">{m.concept}</strong>
                        <span className="text-slate-400 text-[10px]">{m.category}</span>
                      </td>
                      <td className="p-3.5 text-slate-700">{m.clientName || m.supplierName || 'General'}</td>
                      <td className="p-3.5 text-slate-600 font-mono text-[11px]">{m.paymentMethod}</td>
                      <td className="p-3.5 text-right font-mono font-black text-sm">
                        <span className={m.type === 'INGRESO' ? 'text-emerald-700' : 'text-rose-700'}>
                          {m.type === 'INGRESO' ? '+' : '-'}{formatCurrency(m.amount)}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            m.isVoided
                              ? 'bg-rose-100 text-rose-800'
                              : m.status === 'COBRADO' || m.status === 'PAGADO'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {m.isVoided ? 'ANULADO' : m.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {!m.isVoided && (
                          <button
                            type="button"
                            onClick={() => setShowVoidModal(m)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Anular"
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB 7: GANANCIAS */}
      {activeTab === 'GANANCIAS' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">Análisis de Rentabilidad y Ganancia Neta</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Cálculo automático de ingresos brutos menos egresos operativos
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {(['HOY', 'SEMANA', 'MES', 'ANIO', 'TODO'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setDateRange(r)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                      dateRange === r ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl">
                <span className="text-xs font-bold text-emerald-800 block uppercase">1. Total Ingresos Brutos</span>
                <strong className="text-2xl font-black text-emerald-950 font-mono block mt-2">
                  {formatCurrency(metrics.totalIncome)}
                </strong>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl">
                <span className="text-xs font-bold text-rose-800 block uppercase">2. Total Gastos Operativos</span>
                <strong className="text-2xl font-black text-rose-950 font-mono block mt-2">
                  {formatCurrency(metrics.totalExpense)}
                </strong>
              </div>

              <div className="bg-teal-900 text-white border border-teal-800 p-5 rounded-3xl">
                <span className="text-xs font-bold text-teal-300 block uppercase">3. Ganancia Neta Final</span>
                <strong className="text-2xl font-black text-white font-mono block mt-2">
                  {formatCurrency(metrics.netProfit)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. TAB 8: REPORTES */}
      {activeTab === 'REPORTES' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Emisión de Informes Económicos</h3>
                <p className="text-xs text-slate-500 font-medium">
                  Generación de balances en formato PDF A4 y exportación a Excel / CSV
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Exportar CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openPrintModal({
                      documentType: 'INFORME_ALTA_MEDICA',
                      title: 'Reporte Económico & Balance Financiero',
                      patientName: 'Veterinaria Irusta',
                      ownerName: currentUser.name,
                      date: new Date().toISOString(),
                      content: `REPORTE ECONÓMICO MENSUAL:\n\nTotal Ingresos: ${formatCurrency(metrics.totalIncome)}\nTotal Gastos: ${formatCurrency(metrics.totalExpense)}\nGanancia Neta: ${formatCurrency(metrics.netProfit)}\nCuentas a Cobrar: ${formatCurrency(metrics.totalReceivable)}\nCuentas a Pagar: ${formatCurrency(metrics.totalPayable)}\nSaldo Disponible: ${formatCurrency(metrics.availableBalance)}`,
                    });
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Descargar / Imprimir PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODALS: INCOME & EXPENSE */}
      {(showIncomeModal || showExpenseModal) && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {showIncomeModal ? '🟢 Registrar Nuevo Ingreso' : '🔴 Registrar Nuevo Gasto'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowIncomeModal(false);
                  setShowExpenseModal(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={showIncomeModal ? handleSaveIncome : handleSaveExpense} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Fecha:</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Importe ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Ej: 35000"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-black text-slate-900 text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Concepto del Movimiento:</label>
                <input
                  type="text"
                  value={formConcept}
                  onChange={(e) => setFormConcept(e.target.value)}
                  placeholder="Ej: Consulta clínica + Vacunación / Compra descartables"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Categoría:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    {(showIncomeModal ? incomeCategories : expenseCategories).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Medio de Pago:</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                    <option value="MERCADOPAGO_QR">Mercado Pago / QR</option>
                    <option value="TARJETA_DEBITO">Tarjeta Débito</option>
                    <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  {showIncomeModal ? 'Cliente / Tutor (Opcional):' : 'Proveedor (Opcional):'}
                </label>
                <input
                  type="text"
                  value={formClientOrSupplier}
                  onChange={(e) => setFormClientOrSupplier(e.target.value)}
                  placeholder={showIncomeModal ? 'Ej: Juan Pérez' : 'Ej: Droguería Sur'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Observaciones:</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Detalles adicionales del movimiento..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowIncomeModal(false);
                    setShowExpenseModal(false);
                  }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md"
                >
                  Guardar {showIncomeModal ? 'Ingreso' : 'Gasto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 10. MODAL: DEBT (COBRAR / PAGAR) */}
      {showDebtModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                {showDebtModal === 'COBRAR' ? '🟡 Nueva Cuenta a Cobrar' : '🔴 Nueva Cuenta a Pagar'}
              </h3>
              <button
                type="button"
                onClick={() => setShowDebtModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDebt} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  {showDebtModal === 'COBRAR' ? 'Nombre del Cliente / Tutor:' : 'Nombre del Proveedor:'}
                </label>
                <input
                  type="text"
                  value={debtEntityName}
                  onChange={(e) => setDebtEntityName(e.target.value)}
                  placeholder={showDebtModal === 'COBRAR' ? 'Ej: Juan Pérez' : 'Ej: Equipamiento Médico Vet'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Concepto de la Deuda:</label>
                <input
                  type="text"
                  value={debtConcept}
                  onChange={(e) => setDebtConcept(e.target.value)}
                  placeholder="Ej: Saldo de cirugía / Factura insumos"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Importe Total ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={debtTotalAmount}
                    onChange={(e) => setDebtTotalAmount(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-black text-slate-900 text-base"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Fecha de Vencimiento:</label>
                  <input
                    type="date"
                    value={debtDueDate}
                    onChange={(e) => setDebtDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Observaciones / Condiciones:</label>
                <textarea
                  value={debtNotes}
                  onChange={(e) => setDebtNotes(e.target.value)}
                  rows={2}
                  placeholder="Acuerdos de pago, cuotas..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDebtModal(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md"
                >
                  Guardar Deuda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. MODAL: PARTIAL PAYMENT */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Registrar Pago a Cuenta</h3>
              <button
                type="button"
                onClick={() => setShowPaymentModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePartialPayment} className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-500 block text-[11px]">Titular: <strong>{showPaymentModal.entityName}</strong></span>
                <span className="text-slate-500 block text-[11px]">Concepto: {showPaymentModal.concept}</span>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-mono">
                  <span className="text-slate-600 font-bold">Saldo Pendiente:</span>
                  <strong className="text-rose-700 text-sm">{formatCurrency(showPaymentModal.balance)}</strong>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Monto a Pagar ($):</label>
                <input
                  type="number"
                  step="0.01"
                  max={showPaymentModal.balance}
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-black text-slate-900 text-base"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Medio de Pago:</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                >
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="MERCADOPAGO_QR">Mercado Pago / QR</option>
                  <option value="TARJETA_DEBITO">Tarjeta Débito</option>
                  <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Nota o Comprobante:</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="Ej: Transferencia nº 89412"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md"
                >
                  Confirmar Pago
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 12. MODAL: VOID MOVEMENT */}
      {showVoidModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-black text-slate-900">Anular Movimiento Financiero</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Estás seguro de anular el movimiento <strong>"{showVoidModal.concept}"</strong> por{' '}
              <strong className="font-mono">{formatCurrency(showVoidModal.amount)}</strong>? El movimiento no será borrado físicamente sino preservado con marca de auditoría.
            </p>

            <form onSubmit={handleConfirmVoid} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Motivo de Anulación (Requerido):</label>
                <input
                  type="text"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Ej: Error en carga de monto / Duplicado"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowVoidModal(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-md"
                >
                  Confirmar Anulación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
