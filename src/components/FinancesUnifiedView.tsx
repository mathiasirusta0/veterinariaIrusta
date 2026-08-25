import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  MessageCircle,
  BedDouble,
  Stethoscope,
  Sparkles,
  FileCheck,
  Receipt,
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
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import {
  FinancialMovement,
  AccountDebt,
  FinancialPaymentMethod,
  FinancialMovementStatus,
  Invoice,
  Estimate,
} from '../types';
import { formatCurrency, formatDate, formatDateTime, formatInvoiceNumber, maskDni } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, StatusBadge } from './ui';

export const FinancesUnifiedView: React.FC = () => {
  const {
    financialMovements,
    accountDebts,
    invoices,
    estimates,
    cashSession,
    incomeCategories,
    expenseCategories,
    currentUser,
    activeBranch,
    owners,
    patients,
    hospitalizations,
    openWhatsAppHub,
    addFinancialMovement,
    voidFinancialMovement,
    addAccountDebt,
    registerDebtPayment,
    addCustomCategory,
    createInvoice,
    createEstimate,
    convertEstimateToInvoice,
    openPrintModal,
    showToast,
  } = useVet();

  // Primary Tabs under Administration -> Finances
  const [activeTab, setActiveTab] = useState<
    'CAJA_TPV' | 'MOVIMIENTOS' | 'COBRAR' | 'PAGAR' | 'RESULTADOS' | 'REPORTES' | 'FISCAL'
  >('CAJA_TPV');

  // Sub-tabs in Caja & TPV
  const [cajaSubTab, setCajaSubTab] = useState<'ARQUEO' | 'COMPROBANTES' | 'PRESUPUESTOS'>('ARQUEO');

  // Search and Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('TODAS');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('TODOS');
  const [dateRange, setDateRange] = useState<'HOY' | 'SEMANA' | 'MES' | 'ANIO' | 'TODO'>('MES');

  // Modals state
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showDebtModal, setShowDebtModal] = useState<'COBRAR' | 'PAGAR' | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<AccountDebt | null>(null);
  const [showVoidModal, setShowVoidModal] = useState<FinancialMovement | null>(null);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);

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
  const [debtOwnerId, setDebtOwnerId] = useState('');
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

  // 100% MANUAL LIQUIDATION & PAYMENT RECEIPT STATE
  const [showPatientLiquidationModal, setShowPatientLiquidationModal] = useState(false);
  const [liqPatientId, setLiqPatientId] = useState(patients[0]?.id || '');
  const [liqItems, setLiqItems] = useState<
    Array<{
      id: string;
      category: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }>
  >([
    {
      id: 'item-1',
      category: 'INTERNACION',
      description: 'Día de Internación / Canil con Monitoreo Clínico',
      quantity: 1,
      unitPrice: 25000,
    },
    {
      id: 'item-2',
      category: 'MEDICACION',
      description: 'Plan de Fluidoterapia + Protector Gástrico + Antibioticoterapia',
      quantity: 1,
      unitPrice: 18000,
    },
  ]);
  const [liqDiscount, setLiqDiscount] = useState<number | ''>('');
  const [liqPaymentMethod, setLiqPaymentMethod] = useState<FinancialPaymentMethod>('TRANSFERENCIA');
  const [liqNotes, setLiqNotes] = useState('');

  // Official Receipt Modal State (Non-fiscal Recibo X of Veterinaria Irusta)
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<{
    receiptNumber: string;
    date: string;
    time: string;
    patientName: string;
    species: string;
    breed: string;
    hc: string;
    weight?: number;
    ownerName: string;
    ownerPhone: string;
    ownerDni?: string;
    items: Array<{ description: string; category: string; quantity: number; unitPrice: number; subtotal: number }>;
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: FinancialPaymentMethod;
    vetInCharge: string;
    vetLicense: string;
    notes?: string;
  } | null>(null);

  // Expanded Debt Rows for payment history
  const [expandedDebtIds, setExpandedDebtIds] = useState<Record<string, boolean>>({});

  const toggleExpandDebt = (id: string) => {
    setExpandedDebtIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to add a new manual line item to liquidation
  const handleAddLiqItem = () => {
    triggerHaptic('light');
    setLiqItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        category: 'HONORARIOS',
        description: '',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const handleRemoveLiqItem = (id: string) => {
    triggerHaptic('light');
    setLiqItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleUpdateLiqItem = (id: string, field: string, value: any) => {
    setLiqItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Helper to import inpatient charges automatically
  const handleImportInpatientCharges = (patId: string) => {
    triggerHaptic('medium');
    const hosp =
      hospitalizations.find((h) => h.patientId === patId && h.status === 'ACTIVA') ||
      hospitalizations.find((h) => h.patientId === patId);

    if (!hosp) {
      showToast(
        'info',
        'Sin Internación Activa',
        'No se encontró registro de internación activa para este paciente. Puede cargar los conceptos manualmente.'
      );
      return;
    }

    const admRaw = (hosp as any).admittedAt || (hosp as any).admissionDate || new Date().toISOString();
    const admDate = new Date(admRaw);
    const now = new Date();
    const days = Math.max(1, Math.ceil((now.getTime() - admDate.getTime()) / (1000 * 60 * 60 * 24)));

    const imported: Array<{ id: string; category: string; description: string; quantity: number; unitPrice: number }> = [];

    // 1. Kennel / Hospitalization
    const isUCI = hosp.sector === 'UCI' || (hosp.sector as any) === 'UCI_CRITICOS';
    imported.push({
      id: `imp-${Date.now()}-1`,
      category: 'INTERNACION',
      description: `Internación en ${isUCI ? 'Terapia Intensiva / UCI' : 'Caniles Generales'} (${hosp.kennelNumber}) - ${days} día${days > 1 ? 's' : ''}`,
      quantity: days,
      unitPrice: isUCI ? 35000 : 25000,
    });

    // 2. Fluidotherapy
    const fluidSol = (hosp as any).fluidTherapy?.solutionType || (hosp as any).fluidType;
    const fluidRate = (hosp as any).fluidTherapy?.rateMlPerHour || (hosp as any).fluidRateMlH;
    if (fluidSol) {
      imported.push({
        id: `imp-${Date.now()}-2`,
        category: 'FLUIDOTERAPIA',
        description: `Plan de Fluidoterapia (${fluidSol}${fluidRate ? ` a ${fluidRate} ml/h` : ''})`,
        quantity: days,
        unitPrice: 12000,
      });
    }

    // 3. Medications administered
    if (hosp.medications && hosp.medications.length > 0) {
      hosp.medications.forEach((med: any, idx: number) => {
        const mName = med.name || med.medicationName || 'Fármaco';
        const mDose = med.dose || '';
        const mRoute = med.route || '';
        imported.push({
          id: `imp-${Date.now()}-med-${idx}`,
          category: 'MEDICACION',
          description: `Fármaco: ${mName} ${mDose ? `(${mDose} ${mRoute})` : ''}`.trim(),
          quantity: 1,
          unitPrice: 8500,
        });
      });
    }

    // 4. Hourly sheet tasks if any
    const sheets = (hosp as any).hourlySheet || (hosp as any).hourlySheets || [];
    if (sheets.length > 0) {
      const distinctMeds = new Set<string>();
      sheets.forEach((s: any) => {
        if (s.medicationAdministered) distinctMeds.add(s.medicationAdministered);
      });
      distinctMeds.forEach((m, idx) => {
        if (!imported.some((i) => i.description.includes(m))) {
          imported.push({
            id: `imp-${Date.now()}-sheet-${idx}`,
            category: 'MEDICACION',
            description: `Medicación horaria aplicada: ${m}`,
            quantity: 1,
            unitPrice: 6500,
          });
        }
      });
    }

    setLiqItems(imported);
    showToast(
      'success',
      'Consumos Importados',
      `Se cargaron ${imported.length} conceptos de la internación activa para revisar y facturar.`
    );
  };

  // Emit official payment receipt
  const handleEmitReceipt = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    const patient = patients.find((p) => p.id === liqPatientId);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : owners[0];

    const subtotal = liqItems.reduce(
      (acc, item) => acc + (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
      0
    );
    const discountVal = Number(liqDiscount) || 0;
    const total = Math.max(0, subtotal - discountVal);

    if (total <= 0) {
      showToast('error', 'Monto Inválido', 'El total a liquidar debe ser superior a $0.');
      return;
    }

    const receiptNum = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    // 1. Add financial movement (Income)
    addFinancialMovement({
      type: 'INGRESO',
      category: 'Internación & Prestaciones Médicas',
      concept: `Liquidación de prestaciones - ${patient?.name || 'Paciente'} (${patient?.clinicalRecordNumber || 'HC'})`,
      amount: total,
      date: dateStr,
      paymentMethod: liqPaymentMethod,
      clientName: owner ? `${owner.firstName} ${owner.lastName}` : 'Tutor Responsable',
      status: 'COBRADO',
      notes: `Comprobante Nº ${receiptNum}. Detalle: ${liqItems.length} ítems liquidados. ${liqNotes}`,
      branchId: activeBranch?.id || 'branch-central',
    });

    // 2. Add Invoice / Recibo X to state
    createInvoice({
      patientId: patient?.id,
      customerId: owner?.id || 'own-gen',
      customerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Consumidor Final',
      customerDni: owner?.dni,
      customerAddress: owner?.address || 'Río Cuarto, Córdoba',
      customerTaxCondition: owner?.taxCondition || 'CONSUMIDOR_FINAL',
      type: 'X',
      pointOfSale: 1,
      invoiceNumber: Math.floor(1000 + Math.random() * 9000),
      date: dateStr,
      items: liqItems.map((item) => ({
        description: item.description || 'Prestación veterinaria',
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      })),
      subtotal,
      vatAmount: 0,
      totalAmount: total,
      paymentMethod: liqPaymentMethod,
      isPaid: true,
      branchId: activeBranch?.id || 'branch-central',
    });

    // 3. Set Receipt object for instant preview / print / PDF / WhatsApp
    const receiptData = {
      receiptNumber: receiptNum,
      date: formatDate(dateStr),
      time: timeStr,
      patientName: patient?.name || 'Paciente',
      species: patient?.species || 'Canino',
      breed: patient?.breed || 'Mestizo',
      hc: patient?.clinicalRecordNumber || 'HC-2026-0001',
      weight: patient?.weight,
      ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Tutor Responsable',
      ownerPhone: owner?.phone || owner?.whatsapp || '',
      ownerDni: owner?.dni,
      items: liqItems.map((item) => ({
        description: item.description || 'Prestación veterinaria',
        category: item.category,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      })),
      subtotal,
      discount: discountVal,
      total,
      paymentMethod: liqPaymentMethod,
      vetInCharge: 'Dr. Diego Irusta',
      vetLicense: 'MP 8412',
      notes: liqNotes,
    };

    setCurrentReceipt(receiptData);
    setShowPatientLiquidationModal(false);
    setShowReceiptModal(true);

    showToast(
      'success',
      'Comprobante de Pago Emitido',
      `Comprobante ${receiptNum} generado por ${formatCurrency(total)}.`
    );
  };

  const handleSendReceiptWhatsApp = (rec: typeof currentReceipt) => {
    if (!rec) return;
    triggerHaptic('light');

    const patient = patients.find((p) => p.clinicalRecordNumber === rec.hc || p.name === rec.patientName);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;

    openWhatsAppHub({
      patientId: patient?.id,
      ownerId: owner?.id,
      patientName: rec.patientName,
      ownerName: rec.ownerName,
      ownerPhone: rec.ownerPhone,
      type: 'FACTURA',
      details: {
        invoiceNumber: rec.receiptNumber,
        total: formatCurrency(rec.total),
        paymentMethod: rec.paymentMethod,
        date: rec.date,
        itemsCount: rec.items.length,
      },
    });
  };

  // Date range filter calculations for movements & KPIs
  const isDateInSelectedRange = (dateStr: string) => {
    if (dateRange === 'TODO') return true;
    const d = new Date(dateStr);
    const now = new Date();

    if (dateRange === 'HOY') {
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    }
    if (dateRange === 'SEMANA') {
      const diffTime = Math.abs(now.getTime() - d.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (dateRange === 'MES') {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    if (dateRange === 'ANIO') {
      return d.getFullYear() === now.getFullYear();
    }
    return true;
  };

  // Filtered movements for current branch & date range
  const branchMovements = useMemo(() => {
    return financialMovements.filter((m) => {
      const matchBranch = !m.branchId || m.branchId === activeBranch.id;
      const matchRange = isDateInSelectedRange(m.date);
      return matchBranch && matchRange;
    });
  }, [financialMovements, activeBranch.id, dateRange]);

  // Executive Metrics
  const metrics = useMemo(() => {
    const nonVoided = branchMovements.filter((m) => !m.isVoided);

    const totalIncome = nonVoided
      .filter((m) => m.type === 'INGRESO')
      .reduce((acc, m) => acc + m.amount, 0);

    const totalExpense = nonVoided
      .filter((m) => m.type === 'GASTO')
      .reduce((acc, m) => acc + m.amount, 0);

    const operatingResult = totalIncome - totalExpense;

    const totalReceivable = accountDebts
      .filter((d) => (!d.branchId || d.branchId === activeBranch.id) && d.type === 'COBRAR' && d.status !== 'PAGADA')
      .reduce((acc, d) => acc + d.balance, 0);

    const totalPayable = accountDebts
      .filter((d) => (!d.branchId || d.branchId === activeBranch.id) && d.type === 'PAGAR' && d.status !== 'PAGADA')
      .reduce((acc, d) => acc + d.balance, 0);

    const availableCash = (cashSession?.initialCash || 0) + totalIncome - totalExpense;
    const projectedPosition = availableCash + totalReceivable - totalPayable;

    return {
      totalIncome,
      totalExpense,
      operatingResult,
      totalReceivable,
      totalPayable,
      availableCash,
      projectedPosition,
    };
  }, [branchMovements, accountDebts, activeBranch.id, cashSession]);

  // Expenses breakdown by category
  const expenseByCategory = useMemo(() => {
    const nonVoided = branchMovements.filter((m) => !m.isVoided && m.type === 'GASTO');
    const map: Record<string, number> = {};
    nonVoided.forEach((m) => {
      map[m.category] = (map[m.category] || 0) + m.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [branchMovements]);

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
      branchId: activeBranch.id,
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
      branchId: activeBranch.id,
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
      ownerId: debtOwnerId || undefined,
      concept: debtConcept,
      totalAmount: Number(debtTotalAmount),
      issueDate: formDate,
      dueDate: debtDueDate,
      status: 'PENDIENTE',
      notes: debtNotes || undefined,
      branchId: activeBranch.id,
    });

    showToast(
      'success',
      showDebtModal === 'COBRAR' ? 'Cuenta a Cobrar Registrada' : 'Cuenta a Pagar Registrada',
      `Deuda por ${formatCurrency(debtTotalAmount)} generada para ${debtEntityName}.`
    );
    setShowDebtModal(null);
    setDebtEntityName('');
    setDebtOwnerId('');
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
      ...branchMovements.map((m) => [
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
    link.setAttribute('download', `reporte_financiero_${activeBranch.name.replace(/\s+/g, '_')}_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Archivo CSV Exportado', 'Los registros financieros se descargaron correctamente.');
  };

  return (
    <div className="space-y-6 pb-20 w-full max-w-full">
      {/* 1. Header with Fast 1-Tap Action Buttons */}
      <PageHeader
        category="Administración & Finanzas Unificadas"
        title="Finanzas"
        description="Módulo integral de caja, facturación electrónica ARCA, transacciones, cuentas a cobrar/pagar y resultados operativos"
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
          { id: 'CAJA_TPV', label: 'Caja & Facturación', icon: Receipt },
          { id: 'MOVIMIENTOS', label: 'Movimientos', icon: FileText, count: branchMovements.filter((m) => !m.isVoided).length },
          { id: 'COBRAR', label: 'Cuentas a Cobrar', icon: DollarSign, count: accountDebts.filter((d) => (!d.branchId || d.branchId === activeBranch.id) && d.type === 'COBRAR' && d.status !== 'PAGADA').length },
          { id: 'PAGAR', label: 'Cuentas a Pagar', icon: Building, count: accountDebts.filter((d) => (!d.branchId || d.branchId === activeBranch.id) && d.type === 'PAGAR' && d.status !== 'PAGADA').length },
          { id: 'RESULTADOS', label: 'Resultados', icon: TrendingUp },
          { id: 'REPORTES', label: 'Reportes & PDF', icon: Download },
          { id: 'FISCAL', label: 'Configuración Fiscal', icon: ShieldCheck },
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

      {/* 3. Global Period Filter Bar (Recalculates all KPIs) */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold uppercase text-slate-400 text-[10px] tracking-wider">Período de Análisis:</span>
          <div className="flex items-center gap-1">
            {(['HOY', 'SEMANA', 'MES', 'ANIO', 'TODO'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setDateRange(r);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  dateRange === r
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
          <Building className="w-3.5 h-3.5 text-teal-600" />
          <span>Sede: <strong>{activeBranch.name}</strong></span>
        </div>
      </div>

      {/* 4. 6 Essential Real KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. INGRESOS */}
        <div className="bg-white border border-emerald-200/80 rounded-3xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-800">
              Ingresos ({dateRange})
            </span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-black text-emerald-950 font-mono tracking-tight">
              {formatCurrency(metrics.totalIncome)}
            </h3>
            <span className="text-[11px] text-emerald-700 font-medium">Cobros de caja y facturación</span>
          </div>
        </div>

        {/* 2. GASTOS */}
        <div className="bg-white border border-rose-200/80 rounded-3xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-wider text-rose-800">
              Gastos ({dateRange})
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

        {/* 3. RESULTADO OPERATIVO */}
        <div className={`bg-white border rounded-3xl p-4 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between ${
          metrics.operatingResult >= 0 ? 'border-teal-200/80' : 'border-amber-300 bg-amber-50/20'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-wider text-teal-800">
              Resultado Operativo
            </span>
            <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
              metrics.operatingResult >= 0 ? 'text-teal-950' : 'text-amber-900'
            }`}>
              {formatCurrency(metrics.operatingResult)}
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
            <span className="text-[11px] text-amber-700 font-medium">Saldos de tutores</span>
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
            <span className="text-[11px] text-slate-500 font-medium">Proveedores e insumos</span>
          </div>
        </div>

        {/* 6. POSICIÓN PROYECTADA */}
        <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-md flex flex-col justify-between border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-wider text-teal-400">
              Posición Proyectada
            </span>
            <div className="w-7 h-7 rounded-xl bg-slate-800 text-teal-300 flex items-center justify-center font-bold">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
              {formatCurrency(metrics.projectedPosition)}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Caja + A Cobrar - A Pagar</span>
          </div>
        </div>
      </div>

      {/* 5. TAB: CAJA & FACTURACIÓN */}
      {activeTab === 'CAJA_TPV' && (
        <div className="space-y-6 animate-fade-in">
          {/* Subtabs for Caja */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
            {[
              { id: 'ARQUEO', label: 'Arqueo Z & Balance de Gaveta', icon: Wallet },
              { id: 'COMPROBANTES', label: 'Comprobantes Emitidos', icon: Receipt, count: invoices.length },
              { id: 'PRESUPUESTOS', label: 'Presupuestos Clínicos', icon: FileText, count: estimates.length },
            ].map((st) => {
              const Icon = st.icon;
              const isSelected = cajaSubTab === st.id;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setCajaSubTab(st.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{st.label}</span>
                  {st.count !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-current font-mono">
                      {st.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Subtab: Arqueo Z */}
          {cajaSubTab === 'ARQUEO' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Estado de Caja de Turno</h3>
                    <p className="text-xs text-slate-500">
                      Apertura: {formatDateTime(cashSession?.openedAt)} • Responsable: {cashSession?.openedBy || currentUser.name}
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
                    Caja Abierta & Operativa
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-sans font-bold">Fondo Inicial:</span>
                    <strong className="text-slate-900 text-base">{formatCurrency(cashSession?.initialCash || 50000)}</strong>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 block font-sans font-bold">Ingresos Efectivo:</span>
                    <strong className="text-emerald-800 text-base">+{formatCurrency(metrics.totalIncome)}</strong>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                    <span className="text-[10px] text-rose-700 block font-sans font-bold">Egresos Efectivo:</span>
                    <strong className="text-rose-800 text-base">-{formatCurrency(metrics.totalExpense)}</strong>
                  </div>
                  <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200">
                    <span className="text-[10px] text-teal-800 block font-sans font-bold">Teórico en Gaveta:</span>
                    <strong className="text-teal-900 text-base">{formatCurrency(metrics.availableCash)}</strong>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-0.5 text-xs">
                    <strong className="text-slate-800 block">Cierre de Turno & Reporte X/Z</strong>
                    <p className="text-slate-500 text-[11px]">
                      Imprime el balance discriminado de efectivo, tarjetas y transferencias.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      openPrintModal({
                        documentType: 'INFORME_ALTA_MEDICA',
                        title: 'Arqueo de Caja & Cierre Z',
                        patientName: activeBranch.name,
                        ownerName: currentUser.name,
                        date: new Date().toISOString(),
                        content: `ARQUEO Z DE CAJA:\n\nFondo Inicial: ${formatCurrency(cashSession?.initialCash || 50000)}\nIngresos Totales: ${formatCurrency(metrics.totalIncome)}\nEgresos Totales: ${formatCurrency(metrics.totalExpense)}\nEfectivo Teórico en Gaveta: ${formatCurrency(metrics.availableCash)}`,
                      });
                    }}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Reporte X</span>
                  </button>
                </div>
              </div>

              {/* Fiscal AFIP / ARCA Status Box */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 rounded-3xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-teal-400" />
                      <h4 className="font-black text-sm text-white">Facturación Electrónica ARCA</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase bg-teal-500/20 text-teal-300 border border-teal-400/30 px-2 py-0.5 rounded-full">
                      Homologación / Demo
                    </span>
                  </div>

                  <div className="space-y-2.5 mt-3 text-xs">
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Punto de venta web-service sincronizado. Todas las facturas autorizadas generan automáticamente su ingreso financiero sin duplicación.
                    </p>
                    <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700 space-y-1 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Punto de Venta:</span>
                        <span className="text-white font-bold">0001 (Sede Central)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ambiente:</span>
                        <span className="text-teal-300 font-bold">Homologación Segura</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('FISCAL')}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Ver Configuración Fiscal</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Subtab: Comprobantes & Recibos de Pago */}
          {cajaSubTab === 'COMPROBANTES' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Comprobantes de Pago & Recibos Emitidos ({invoices.length})
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Recibos oficiales no fiscales de Veterinaria Irusta emitidos a tutores
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    setShowPatientLiquidationModal(true);
                  }}
                  className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>+ Liquidar y Emitir Comprobante</span>
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-black tracking-wider text-slate-500">
                    <tr>
                      <th className="p-3.5">Nº Comprobante</th>
                      <th className="p-3.5">Fecha</th>
                      <th className="p-3.5">Cliente / Tutor</th>
                      <th className="p-3.5">Medio de Pago</th>
                      <th className="p-3.5">Tipo de Comprobante</th>
                      <th className="p-3.5 text-right">Importe Total</th>
                      <th className="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {invoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-6 text-center text-slate-400">
                          No hay comprobantes emitidos. Utilice el botón superior para liquidar una atención.
                        </td>
                      </tr>
                    ) : (
                      invoices.map((inv) => {
                        const pat = patients.find((p) => p.id === inv.patientId);
                        return (
                          <tr key={inv.id} className="hover:bg-slate-50/50">
                            <td className="p-3.5 font-mono font-bold text-slate-900">
                              {inv.type === 'X'
                                ? `REC-2026-${String(inv.invoiceNumber).padStart(4, '0')}`
                                : formatInvoiceNumber(inv.type, inv.pointOfSale, inv.invoiceNumber)}
                            </td>
                            <td className="p-3.5 text-slate-500">{inv.date}</td>
                            <td className="p-3.5">
                              <strong className="text-slate-800 block">{inv.customerName}</strong>
                              {pat && (
                                <span className="text-[10px] text-teal-700 font-medium">
                                  🐾 {pat.name} ({pat.clinicalRecordNumber})
                                </span>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-600 font-mono">{inv.paymentMethod}</td>
                            <td className="p-3.5">
                              <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full font-mono">
                                🧾 Recibo X Oficial
                              </span>
                            </td>
                            <td className="p-3.5 text-right font-mono font-black text-sm text-emerald-700">
                              {formatCurrency(inv.totalAmount)}
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    triggerHaptic('light');
                                    setCurrentReceipt({
                                      receiptNumber: `REC-2026-${String(inv.invoiceNumber).padStart(4, '0')}`,
                                      date: formatDate(inv.date),
                                      time: '12:00',
                                      patientName: pat?.name || 'Paciente',
                                      species: pat?.species || 'Canino',
                                      breed: pat?.breed || 'Mestizo',
                                      hc: pat?.clinicalRecordNumber || 'HC-2026',
                                      weight: pat?.weight,
                                      ownerName: inv.customerName,
                                      ownerPhone: '+54 9 2942 47-7136',
                                      ownerDni: inv.customerDni,
                                      items: (inv.items || []).map((it) => ({
                                        description: it.description,
                                        category: 'PRESTACION',
                                        quantity: it.quantity,
                                        unitPrice: it.unitPrice,
                                        subtotal: it.subtotal,
                                      })),
                                      subtotal: inv.subtotal || inv.totalAmount,
                                      discount: 0,
                                      total: inv.totalAmount,
                                      paymentMethod: inv.paymentMethod as any,
                                      vetInCharge: 'Dr. Diego Irusta',
                                      vetLicense: 'MP 8412',
                                      notes: 'Comprobante emitido por Veterinaria Irusta.',
                                    });
                                    setShowReceiptModal(true);
                                  }}
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                                  title="Ver e Imprimir Comprobante"
                                >
                                  <Printer className="w-3 h-3" />
                                  <span>Ver / Imprimir</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB: MOVIMIENTOS ECONÓMICOS CRONOLÓGICOS */}
      {activeTab === 'MOVIMIENTOS' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
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
                  {branchMovements
                    .filter((m) => {
                      const q = searchTerm.toLowerCase();
                      return (
                        !q ||
                        m.concept.toLowerCase().includes(q) ||
                        (m.clientName && m.clientName.toLowerCase().includes(q)) ||
                        (m.supplierName && m.supplierName.toLowerCase().includes(q))
                      );
                    })
                    .map((m) => (
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
                              title="Anular movimiento"
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

      {/* 7. TAB: CUENTAS A COBRAR & CUENTAS A PAGAR */}
      {(activeTab === 'COBRAR' || activeTab === 'PAGAR') && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {activeTab === 'COBRAR' ? 'Cuentas Corrientes a Cobrar (Clientes)' : 'Cuentas a Pagar (Proveedores)'}
              </h3>
              <p className="text-slate-500 text-[11px]">
                Control de saldos pendientes con prevención de sobrepagos e historial inmutable de abonos
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
              .filter((d) => (!d.branchId || d.branchId === activeBranch.id) && d.type === (activeTab === 'COBRAR' ? 'COBRAR' : 'PAGAR'))
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

      {/* 8. TAB: RESULTADOS & RENTABILIDAD */}
      {activeTab === 'RESULTADOS' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Análisis de Resultados Operativos & Margen</h3>
              <p className="text-xs text-slate-500">
                Resultado real para la sede {activeBranch.name} en el período seleccionado ({dateRange})
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl">
                <span className="text-xs font-bold text-emerald-800 block uppercase">1. Ingresos Totales</span>
                <strong className="text-2xl font-black text-emerald-950 font-mono block mt-2">
                  {formatCurrency(metrics.totalIncome)}
                </strong>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl">
                <span className="text-xs font-bold text-rose-800 block uppercase">2. Gastos Operativos</span>
                <strong className="text-2xl font-black text-rose-950 font-mono block mt-2">
                  {formatCurrency(metrics.totalExpense)}
                </strong>
              </div>

              <div className="bg-teal-900 text-white border border-teal-800 p-5 rounded-3xl">
                <span className="text-xs font-bold text-teal-300 block uppercase">3. Resultado Operativo Neto</span>
                <strong className="text-2xl font-black text-white font-mono block mt-2">
                  {formatCurrency(metrics.operatingResult)}
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. TAB: REPORTES & PDF */}
      {activeTab === 'REPORTES' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Emisión de Informes Contables & Balances</h3>
                <p className="text-xs text-slate-500">
                  Exportación en formato PDF A4 y CSV para análisis externo
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
                      title: `Reporte Financiero - ${activeBranch.name} (${dateRange})`,
                      patientName: activeBranch.name,
                      ownerName: currentUser.name,
                      date: new Date().toISOString(),
                      content: `REPORTE FINANCIERO Y RESULTADOS:\n\nSede: ${activeBranch.name}\nPeríodo: ${dateRange}\n\nTotal Ingresos: ${formatCurrency(metrics.totalIncome)}\nTotal Gastos: ${formatCurrency(metrics.totalExpense)}\nResultado Operativo: ${formatCurrency(metrics.operatingResult)}\nCuentas a Cobrar: ${formatCurrency(metrics.totalReceivable)}\nCuentas a Pagar: ${formatCurrency(metrics.totalPayable)}\nPosición Proyectada: ${formatCurrency(metrics.projectedPosition)}`,
                    });
                  }}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir PDF A4</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 10. TAB: CONFIGURACIÓN FISCAL */}
      {activeTab === 'FISCAL' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Parámetros Fiscales & Punto de Venta ARCA (AFIP)</h3>
              <p className="text-xs text-slate-500">
                Configuración de facturación electrónica y certificados fiscales digitales
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <strong className="text-slate-800 block text-xs">Datos Impositivos del Hospital:</strong>
                <p className="text-slate-600"><strong>Razón Social:</strong> Veterinaria Irusta SRL</p>
                <p className="text-slate-600"><strong>CUIT:</strong> 30-71458920-4</p>
                <p className="text-slate-600"><strong>Condición IVA:</strong> Responsable Inscripto</p>
                <p className="text-slate-600"><strong>Punto de Venta Web-Service:</strong> 0001</p>
              </div>

              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-2 text-teal-900">
                <strong className="block text-xs font-black">Certificados & Modo de Facturación:</strong>
                <p className="text-xs">
                  Ambiente actual: <span className="font-bold bg-teal-200/80 px-2 py-0.5 rounded">Homologación / Testing</span>
                </p>
                <p className="text-[11px] text-teal-800 leading-relaxed">
                  Para conectar con ARCA en Producción, los certificados (.crt y .key) se autentican en backend seguro sin exponer claves privadas en el navegador.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 11. MODALS: INCOME & EXPENSE */}
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

      {/* 12. MODAL: DEBT (COBRAR / PAGAR) */}
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

      {/* 13. MODAL: PARTIAL PAYMENT */}
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

      {/* 14. MODAL: VOID MOVEMENT */}
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

      {/* 15. MODAL: LIQUIDACIÓN MANUAL DE ATENCIÓN / INTERNACIÓN */}
      {showPatientLiquidationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center font-bold">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Liquidar Prestaciones de Paciente & Emitir Recibo de Pago
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Carga manual de internación, medicación, descartables y honorarios con emisión inmediata de PDF
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPatientLiquidationModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEmitReceipt} className="space-y-4 text-xs">
              {/* SELECCIÓN DE PACIENTE Y TUTOR */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-slate-800 font-black uppercase text-[11px] tracking-wider block">
                    🐾 Seleccionar Paciente a Liquidar:
                  </label>
                  <button
                    type="button"
                    onClick={() => handleImportInpatientCharges(liqPatientId)}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 transition-all self-start sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>⚡ Importar Consumos de Internación</span>
                  </button>
                </div>

                <select
                  value={liqPatientId}
                  onChange={(e) => setLiqPatientId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 shadow-2xs text-xs"
                >
                  {patients.map((p) => {
                    const own = owners.find((o) => o.id === p.ownerId);
                    const isInterned = p.status === 'INTERNADO';
                    return (
                      <option key={p.id} value={p.id}>
                        {isInterned ? '🏥 [INTERNADO] ' : '🟢 '}
                        {p.name} ({p.species} • {p.breed}) — Tutor: {own ? `${own.firstName} ${own.lastName}` : 'N/A'} ({p.clinicalRecordNumber})
                      </option>
                    );
                  })}
                </select>

                {(() => {
                  const selPat = patients.find((p) => p.id === liqPatientId);
                  const selOwn = selPat ? owners.find((o) => o.id === selPat.ownerId) : null;
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-600 font-medium">
                      <div>Especie: <strong className="text-slate-900">{selPat?.species || '-'}</strong></div>
                      <div>Peso: <strong className="text-slate-900">{selPat?.weight ? `${selPat.weight} kg` : '-'}</strong></div>
                      <div>Tutor: <strong className="text-slate-900">{selOwn ? `${selOwn.firstName} ${selOwn.lastName}` : '-'}</strong></div>
                      <div>Tel: <strong className="text-slate-900">{selOwn?.phone || selOwn?.whatsapp || '-'}</strong></div>
                    </div>
                  );
                })()}
              </div>

              {/* TABLA DE CONCEPTOS 100% MANUAL */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="font-black text-slate-900 text-xs uppercase tracking-wider">
                    Detalle de Prestaciones, Fármacos & Insumos ({liqItems.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddLiqItem}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-teal-800 border border-slate-300 rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar Concepto</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {liqItems.map((item, index) => {
                    const lineSubtotal = (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0);
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/90 text-xs"
                      >
                        <div className="sm:col-span-3">
                          <select
                            value={item.category}
                            onChange={(e) => handleUpdateLiqItem(item.id, 'category', e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800 text-[11px]"
                          >
                            <option value="INTERNACION">🏨 Internación / Canil</option>
                            <option value="MEDICACION">💊 Fármacos / Medicación</option>
                            <option value="FLUIDOTERAPIA">💧 Sueros / Vías</option>
                            <option value="CONSULTA">🩺 Consulta / Guardia</option>
                            <option value="CIRUGIA">✂️ Cirugía / Procedimiento</option>
                            <option value="ESTUDIOS">🔬 Estudios / Laboratorio</option>
                            <option value="DESCARTABLES">📦 Insumos Descartables</option>
                            <option value="HONORARIOS">👨‍⚕️ Honorarios / Otros</option>
                          </select>
                        </div>

                        <div className="sm:col-span-4">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleUpdateLiqItem(item.id, 'description', e.target.value)}
                            placeholder="Descripción del concepto o medicación..."
                            required
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-900 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-1">
                          <label className="text-[10px] text-slate-400 font-bold sm:hidden">Cant:</label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateLiqItem(item.id, 'quantity', Number(e.target.value) || 1)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-center text-slate-900 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2 flex items-center gap-1">
                          <label className="text-[10px] text-slate-400 font-bold sm:hidden">Precio $:</label>
                          <input
                            type="number"
                            step="100"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateLiqItem(item.id, 'unitPrice', Number(e.target.value) || 0)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-black text-right text-slate-900 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-1 flex items-center justify-between sm:justify-end gap-2">
                          <span className="font-mono font-bold text-teal-800 text-[11px] sm:hidden">
                            {formatCurrency(lineSubtotal)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveLiqItem(item.id)}
                            disabled={liqItems.length <= 1}
                            className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold flex items-center justify-center cursor-pointer disabled:opacity-30"
                            title="Eliminar fila"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* MEDIO DE PAGO, DESCUENTO Y TOTAL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="space-y-3">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Medio de Pago:</label>
                    <select
                      value={liqPaymentMethod}
                      onChange={(e) => setLiqPaymentMethod(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 shadow-2xs"
                    >
                      <option value="TRANSFERENCIA">🏦 Transferencia Bancaria (Alias Dr. Diego Irusta)</option>
                      <option value="EFECTIVO">💵 Efectivo en Caja</option>
                      <option value="MERCADOPAGO_QR">📱 Mercado Pago / QR</option>
                      <option value="TARJETA_DEBITO">💳 Tarjeta de Débito</option>
                      <option value="TARJETA_CREDITO">💳 Tarjeta de Crédito</option>
                      <option value="CUENTA_CORRIENTE">⏳ Cuenta Corriente (A Pagar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Observaciones / Notas:</label>
                    <input
                      type="text"
                      value={liqNotes}
                      onChange={(e) => setLiqNotes(e.target.value)}
                      placeholder="Ej: Alta médica con evolución favorable / Tratamiento ambulatorio"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  {(() => {
                    const subtotal = liqItems.reduce(
                      (acc, item) => acc + (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
                      0
                    );
                    const discountVal = Number(liqDiscount) || 0;
                    const total = Math.max(0, subtotal - discountVal);

                    return (
                      <>
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>Subtotal de Prestaciones:</span>
                          <span className="font-mono font-bold">{formatCurrency(subtotal)}</span>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <span className="text-slate-600 font-medium">Descuento / Bonificación ($):</span>
                          <input
                            type="number"
                            min="0"
                            value={liqDiscount}
                            onChange={(e) => setLiqDiscount(e.target.value ? Number(e.target.value) : '')}
                            placeholder="0"
                            className="w-28 bg-slate-50 border border-slate-300 rounded-lg p-1.5 text-right font-mono font-bold text-slate-900"
                          />
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t-2 border-slate-200 text-sm">
                          <span className="font-black text-slate-900">Total a Liquidar:</span>
                          <strong className="text-xl font-black font-mono text-teal-800">
                            {formatCurrency(total)}
                          </strong>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPatientLiquidationModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Emitir Comprobante de Pago</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 16. MODAL: COMPROBANTE OFICIAL DE PAGO & RECIBO X (IMPRESIÓN / PDF / WHATSAPP) */}
      {showReceiptModal && currentReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Comprobante de Pago & Recibo Oficial</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* DOCUMENTO MEMBRETADO IMPRIMIBLE */}
            <div className="bg-slate-50/90 p-5 rounded-3xl border border-slate-200 space-y-3.5 text-xs text-slate-800 print:bg-white print:p-0 print:border-none">
              {/* Membrete Oficial */}
              <div className="text-center pb-3 border-b-2 border-slate-200">
                <span className="font-extrabold text-teal-800 uppercase tracking-widest text-[11px] block">
                  VETERINARIA IRUSTA — CENTRO HOSPITALARIO VETERINARIO
                </span>
                <h4 className="font-black text-slate-900 text-sm mt-0.5 uppercase tracking-wide">
                  COMPROBANTE DE PAGO & RENDICIÓN DE PRESTACIONES
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  Río Cuarto, Córdoba • Tel/WhatsApp: +54 9 2942 47-7136 • Dirección Médica: Dr. Diego Irusta (MP 8412)
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-teal-100/70 text-teal-900 font-mono font-black text-xs rounded-full border border-teal-300">
                  Nº {currentReceipt.receiptNumber} • Fecha: {currentReceipt.date} {currentReceipt.time}
                </div>
              </div>

              {/* Paciente y Tutor */}
              <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Paciente:</span>
                  <strong className="text-slate-900 text-sm block">{currentReceipt.patientName}</strong>
                  <span className="text-[11px] text-slate-500">
                    {currentReceipt.species} • {currentReceipt.breed} {currentReceipt.weight ? `(${currentReceipt.weight} kg)` : ''}
                  </span>
                  <span className="text-[10px] text-teal-800 font-mono font-bold block mt-0.5">
                    HC: {currentReceipt.hc}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tutor Responsable:</span>
                  <strong className="text-slate-800 block text-xs">{currentReceipt.ownerName}</strong>
                  <span className="text-[11px] text-slate-500 block">
                    Tel: {currentReceipt.ownerPhone || 'N/A'} {currentReceipt.ownerDni ? `• DNI: ${currentReceipt.ownerDni}` : ''}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Medio de Pago: <strong className="text-slate-700 uppercase">{currentReceipt.paymentMethod}</strong>
                  </span>
                </div>
              </div>

              {/* Detalle de Conceptos */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Concepto / Prestación</th>
                      <th className="p-2.5 text-center">Cant.</th>
                      <th className="p-2.5 text-right">P. Unit</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {currentReceipt.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 text-slate-800 font-semibold">{it.description}</td>
                        <td className="p-2.5 text-center font-mono font-bold text-slate-600">{it.quantity}</td>
                        <td className="p-2.5 text-right font-mono text-slate-600">{formatCurrency(it.unitPrice)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(it.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-teal-50/70 border-t-2 border-teal-200 font-bold">
                    {currentReceipt.discount > 0 && (
                      <tr>
                        <td colSpan={3} className="p-2 text-right text-slate-600 text-[11px]">
                          Bonificación / Descuento:
                        </td>
                        <td className="p-2 text-right font-mono text-rose-700 text-xs">
                          -{formatCurrency(currentReceipt.discount)}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan={3} className="p-3 text-right text-slate-900 font-black text-sm">
                        TOTAL ABONADO:
                      </td>
                      <td className="p-3 text-right font-mono font-black text-base text-teal-900">
                        {formatCurrency(currentReceipt.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {currentReceipt.notes && (
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-400 text-[10px] block">Observaciones:</span>
                  <p>{currentReceipt.notes}</p>
                </div>
              )}

              {/* Pie con Sello y Firma */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-[11px] text-slate-600">
                <div>
                  <p className="font-black text-slate-900">{currentReceipt.vetInCharge}</p>
                  <p className="font-mono text-slate-500">Médico Veterinario • Matrícula {currentReceipt.vetLicense}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-mono bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PAGO VERIFICADO</span>
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendReceiptWhatsApp(currentReceipt)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Enviar comprobante por WhatsApp al tutor"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
