import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  QrCode,
  CheckCircle2,
  Printer,
  DollarSign,
  FileCheck,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Trash2,
  Calendar,
  Wallet,
  CreditCard,
  Building,
  Settings,
  ShieldCheck,
  Coins,
  Send,
  Download,
  Search,
  Filter,
  Lock,
  Unlock,
  AlertTriangle,
  RefreshCw,
  FileText,
  Smartphone,
  Landmark,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Invoice, Estimate } from '../types';
import { formatDate, formatDateTime, formatCurrency, formatInvoiceNumber } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { InvoiceMobileCard } from './InvoiceMobileCard';
import { PageHeader, StatCard, EmptyState, StatusBadge } from './ui';

export interface CashExpense {
  id: string;
  timestamp: string;
  category: 'FARMACIA_INSUMOS' | 'HONORARIOS_PROFESIONALES' | 'MANTENIMIENTO' | 'LIMPIEZA' | 'RETIRO_BANCO' | 'VARIOS';
  description: string;
  amount: number;
  paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO' | 'DEBITO';
  registeredBy: string;
  receiptNumber?: string;
}

export interface FiscalConfig {
  cuit: string;
  businessName: string;
  fantasyName: string;
  taxCondition: string;
  fiscalAddress: string;
  iibb: string;
  startDate: string;
  pointOfSaleMain: number;
  pointOfSaleTickets: number;
  pointOfSaleGuard: number;
  environment: 'PRODUCCION' | 'HOMOLOGACION';
  certStatus: string;
  certExpiration: string;
  defaultPaymentDiscountCash: number;
  creditCardSurcharges: { [installments: number]: number };
  cbuAlias: string;
  cbuNumber: string;
  autoCAE: boolean;
}

const DEFAULT_FISCAL_CONFIG: FiscalConfig = {
  cuit: '30-71829384-8',
  businessName: 'Veterinaria Irusta S.R.L.',
  fantasyName: 'Hospital Veterinario Irusta',
  taxCondition: 'IVA Responsable Inscripto',
  fiscalAddress: 'Av. San Martín 1420, Río Cuarto, Córdoba',
  iibb: '904-812391-2 (Convenio Multilateral)',
  startDate: '01/03/2018',
  pointOfSaleMain: 1,
  pointOfSaleTickets: 2,
  pointOfSaleGuard: 3,
  environment: 'PRODUCCION',
  certStatus: 'Válido y Verificado por ARCA / AFIP',
  certExpiration: '15/12/2028',
  defaultPaymentDiscountCash: 10,
  creditCardSurcharges: { 1: 0, 3: 15, 6: 25 },
  cbuAlias: 'VETERINARIA.IRUSTA.MP',
  cbuNumber: '0000003100012839482912',
  autoCAE: true,
};

export const CashAndBillingView: React.FC = () => {
  const {
    invoices,
    estimates,
    cashSession,
    currentUser,
    owners,
    patients,
    updateOwner,
    convertEstimateToInvoice,
    setQuickModal,
    openPrintModal,
    openWhatsAppHub,
    showToast,
    logAudit,
  } = useVet();

  const [activeTab, setActiveTab] = useState<'FACTURAS' | 'PRESUPUESTOS' | 'CUENTAS_CORRIENTES' | 'EGRESOS' | 'CAJA' | 'CONFIGURACION_FISCAL'>('FACTURAS');

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [filterMethod, setFilterMethod] = useState<string>('TODOS');

  // Expenses State
  const [expenses, setExpenses] = useState<CashExpense[]>(() => {
    const saved = localStorage.getItem('vetsys_cash_expenses');
    return saved ? JSON.parse(saved) : [
      {
        id: 'exp-1',
        timestamp: '2026-08-23 09:30',
        category: 'FARMACIA_INSUMOS',
        description: 'Compra de urgencia de agujas 21G y sueros fisiológicos 500ml',
        amount: 18500,
        paymentMethod: 'EFECTIVO',
        registeredBy: 'Dra. Valentina Rossi',
        receiptNumber: 'TKT-9912',
      },
      {
        id: 'exp-2',
        timestamp: '2026-08-23 11:15',
        category: 'HONORARIOS_PROFESIONALES',
        description: 'Honorario ecografista especialista externo por 2 estudios de urgencia',
        amount: 35000,
        paymentMethod: 'TRANSFERENCIA',
        registeredBy: 'Dr. Martín López',
        receiptNumber: 'FAC-0002-0041',
      },
    ];
  });

  // Fiscal Configuration State
  const [fiscalConfig, setFiscalConfig] = useState<FiscalConfig>(() => {
    const saved = localStorage.getItem('vetsys_fiscal_config');
    return saved ? JSON.parse(saved) : DEFAULT_FISCAL_CONFIG;
  });

  // Cash Session State
  const [sessionActive, setSessionActive] = useState<boolean>(!cashSession.isClosed);
  const [initialCashAmount, setInitialCashAmount] = useState<number>(cashSession.initialCash || 50000);
  const [shiftName, setShiftName] = useState<string>('Turno Mañana');

  // Cuentas Corrientes States
  const [selectedOwnerForPayment, setSelectedOwnerForPayment] = useState<any | null>(null);
  const [paymentOnAccountAmount, setPaymentOnAccountAmount] = useState<string>('');
  const [paymentOnAccountMethod, setPaymentOnAccountMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO_QR' | 'TARJETA_DEBITO'>('EFECTIVO');
  const [paymentOnAccountNotes, setPaymentOnAccountNotes] = useState<string>('Cobro a cuenta corriente');
  const [ccFilter, setCcFilter] = useState<'TODOS' | 'DEUDORES' | 'AL_DIA'>('TODOS');

  // Billete Physical Count State (Blind Cash Drawer Count)
  const [billCounts, setBillCounts] = useState<{ [denom: number]: number }>({
    20000: 0,
    10000: 0,
    2000: 0,
    1000: 0,
    500: 0,
    200: 0,
    100: 0,
  });

  // New Expense Form State
  const [expCategory, setExpCategory] = useState<CashExpense['category']>('FARMACIA_INSUMOS');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expMethod, setExpMethod] = useState<CashExpense['paymentMethod']>('EFECTIVO');
  const [expReceipt, setExpReceipt] = useState('');

  // Persist Expenses
  useEffect(() => {
    localStorage.setItem('vetsys_cash_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Financial Calculations
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerDniCuit.includes(searchTerm) ||
      inv.items.some((it) => it.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'TODOS' || inv.type === filterType;
    const matchesMethod = filterMethod === 'TODOS' || inv.paymentMethod === filterMethod;
    return matchesSearch && matchesType && matchesMethod;
  });

  const totalInvoiced = invoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalInvoicedWithCAE = invoices.filter((i) => i.type !== 'RECIBO_X').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalInvoicedTickets = invoices.filter((i) => i.type === 'RECIBO_X').reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Breakdown by Payment Method
  const revenueCash = invoices.filter((i) => i.paymentMethod === 'EFECTIVO').reduce((a, b) => a + (b.totalAmount || 0), 0);
  const revenueDebit = invoices.filter((i) => i.paymentMethod === 'TARJETA_DEBITO' || (i.paymentMethod as string) === 'DEBITO').reduce((a, b) => a + (b.totalAmount || 0), 0);
  const revenueCredit = invoices.filter((i) => i.paymentMethod === 'TARJETA_CREDITO' || (i.paymentMethod as string) === 'CREDITO').reduce((a, b) => a + (b.totalAmount || 0), 0);
  const revenueTransfer = invoices.filter((i) => i.paymentMethod === 'TRANSFERENCIA').reduce((a, b) => a + (b.totalAmount || 0), 0);
  const revenueMP = invoices.filter((i) => i.paymentMethod === 'MERCADOPAGO_QR' || (i.paymentMethod as string) === 'MERCADOPAGO').reduce((a, b) => a + (b.totalAmount || 0), 0);

  const expensesCash = expenses.filter((e) => e.paymentMethod === 'EFECTIVO').reduce((a, b) => a + (b.amount || 0), 0);
  const theoreticalCashInDrawer = initialCashAmount + revenueCash - expensesCash;

  // Physical Counted Cash
  const physicalCashCounted = Object.entries(billCounts).reduce((total, [denom, count]) => total + Number(denom) * (Number(count) || 0), 0);
  const cashDifference = physicalCashCounted > 0 ? physicalCashCounted - theoreticalCashInDrawer : 0;

  // Handlers
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (!expDesc || isNaN(amountNum) || amountNum <= 0) {
      showToast('error', 'Error en Egreso', 'Por favor ingresá una descripción y monto válido.');
      return;
    }

    const newExp: CashExpense = {
      id: `exp-${Date.now()}`,
      timestamp: new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }),
      category: expCategory,
      description: expDesc,
      amount: amountNum,
      paymentMethod: expMethod,
      registeredBy: currentUser.name || 'Personal de Caja',
      receiptNumber: expReceipt || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setExpenses((prev) => [newExp, ...prev]);
    setExpDesc('');
    setExpAmount('');
    setExpReceipt('');
    showToast('success', 'Egreso Registrado', `Se registró egreso de ${formatCurrency(amountNum)} en caja.`);
    logAudit('REGISTRO_EGRESO_CAJA', 'CashSession', cashSession.id, `Egreso de $${amountNum} (${expCategory}): ${expDesc}`);
  };

  const handleSaveFiscalConfig = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('vetsys_fiscal_config', JSON.stringify(fiscalConfig));
    showToast('success', 'Configuración Fiscal Guardada', 'Los parámetros de ARCA / AFIP y medios de cobro se actualizaron correctamente.');
    logAudit('ACTUALIZACION_CONFIG_FISCAL', 'FiscalConfig', fiscalConfig.cuit, 'Actualización de parámetros ARCA y puntos de venta.');
  };

  const handleOpenCashSession = () => {
    triggerHaptic('medium');
    setSessionActive(true);
    showToast('success', 'Caja Abierta', `Se inició una nueva sesión de caja (${shiftName}) con fondo de ${formatCurrency(initialCashAmount)}.`);
    logAudit('APERTURA_CAJA', 'CashSession', `session-${Date.now()}`, `Apertura de turno: ${shiftName} con fondo de $${initialCashAmount}`);
  };

  const handleCloseCashSession = () => {
    triggerHaptic('medium');
    setSessionActive(false);
    showToast('info', 'Arqueo Z Finalizado', `Cierre de caja completado. Efectivo físico verificado: ${formatCurrency(physicalCashCounted || theoreticalCashInDrawer)}.`);
    logAudit('CIERRE_CAJA_Z', 'CashSession', cashSession.id, `Cierre Z realizado. Total facturado: $${totalInvoiced}. Efectivo en caja: $${theoreticalCashInDrawer}`);
  };

  const handlePrintInvoice = (inv: Invoice) => {
    triggerHaptic('light');
    openPrintModal({
      documentType: inv.type === 'RECIBO_X' ? 'TICKET_GASTOS' : 'FACTURA_ELECTRONICA',
      title: `${inv.type === 'RECIBO_X' ? 'Ticket de Gasto Mostrador' : 'Factura ARCA'} #${inv.invoiceNumber}`,
      patientName: inv.customerName,
      patientSpecies: 'Clínica',
      patientBreed: 'General',
      ownerName: inv.customerName,
      ownerPhone: inv.customerDniCuit,
      vetName: currentUser.name,
      vetLicense: 'MP-8941',
      date: inv.date,
      headerData: {
        'Tipo Comprobante': inv.type.replace('_', ' '),
        'Punto de Venta': `PV ${inv.pointOfSale.toString().padStart(4, '0')}`,
        'Nº Comprobante': inv.invoiceNumber,
        'CAE ARCA': inv.caeNumber || 'Ticket Interno',
        'Vto. CAE': inv.caeExpirationDate || 'N/A',
        'Medio de Cobro': inv.paymentMethod.replace('_', ' '),
      },
      contentSections: [
        {
          heading: 'Detalle de Prestaciones, Insumos & Medicamentos',
          body: inv.items.map((it) => `• ${it.description} (x${it.quantity}) — Unit: ${formatCurrency(it.unitPrice)} | Subtotal: ${formatCurrency(it.subtotal)}`).join('\n'),
        },
        {
          heading: 'Resumen Liquidación Fiscal',
          body: `Subtotal Neto: ${formatCurrency(inv.totalAmount * 0.79)}\nIVA Débito Fiscal (21%): ${formatCurrency(inv.totalAmount * 0.21)}\nTOTAL ABONADO: ${formatCurrency(inv.totalAmount)}`,
        },
      ],
      qrValue: `https://www.afip.gob.ar/fe/qr/?p=${btoa(JSON.stringify({ ver: 1, fecha: inv.date, cuit: fiscalConfig.cuit, ptoVta: inv.pointOfSale, tipoCmp: inv.type, nroCmp: inv.invoiceNumber, importe: inv.totalAmount, cae: inv.caeNumber }))}`,
      footerNotice: inv.type === 'RECIBO_X' ? 'Documento no válido como factura fiscal. Comprobante de uso interno y control de gastos.' : 'Comprobante Oficial Autorizado Electrónicamente por ARCA (Agencia de Recaudación y Control Aduanero - AFIP).',
    });
  };

  return (
    <div className="space-y-5 pb-2 w-full max-w-full">
      {/* Top Header */}
      <PageHeader
        category="ARCA (AFIP) Facturación Electrónica Homologada & Ticket Común"
        title="Caja, Facturación ARCA & Finanzas"
        description="Emisión de Facturas Oficiales A/B/C con CAE, Tickets Mostrador (Recibo X), Arqueo Z con conteo ciego y configuración fiscal."
        icon={Receipt}
        badge={
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
            {fiscalConfig.businessName}
          </span>
        }
        actions={[
          {
            label: 'Registrar Egreso',
            icon: TrendingDown,
            onClick: () => setActiveTab('EGRESOS'),
            variant: 'secondary',
          },
          {
            label: 'Nuevo Presupuesto',
            icon: Plus,
            onClick: () => setQuickModal('NUEVO_PRESUPUESTO'),
            variant: 'secondary',
          },
          {
            label: 'Emitir Comprobante',
            icon: Plus,
            onClick: () => setQuickModal('NUEVA_FACTURA'),
            variant: 'primary',
          },
        ]}
      />

      {/* Top 5 Navigation Subtabs */}
      <div className="w-full max-w-full overflow-x-auto no-scrollbar scroll-smooth snap-x touch-pan-x min-w-0">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl w-fit border border-slate-200 text-xs">
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('FACTURAS');
            }}
            className={`flex-shrink-0 snap-start px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'FACTURAS'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 text-teal-600" />
            <span>Comprobantes Emitidos ({invoices.length})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('CUENTAS_CORRIENTES');
            }}
            className={`flex-shrink-0 snap-start px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'CUENTAS_CORRIENTES'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4 text-teal-600" />
            <span>Cuentas Corrientes ({owners.filter(o => (o.balance || 0) < 0).length} deudas)</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('PRESUPUESTOS');
            }}
            className={`flex-shrink-0 snap-start px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'PRESUPUESTOS'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Presupuestos ({estimates.length})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('EGRESOS');
            }}
            className={`flex-shrink-0 snap-start px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'EGRESOS'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingDown className="w-4 h-4 text-rose-600" />
            <span>Gastos & Egresos ({expenses.length})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('CAJA');
            }}
            className={`flex-shrink-0 snap-start px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'CAJA'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-600" />
            <span>Arqueo Z & Balance</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('CONFIGURACION_FISCAL');
            }}
            className={`flex-shrink-0 snap-start px-3.5 py-2 rounded-xl font-black transition-all flex items-center gap-1.5 ${
              activeTab === 'CONFIGURACION_FISCAL'
                ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-700" />
            <span>Configuración Fiscal & ARCA</span>
          </button>
        </div>
      </div>

      {/* 1. FACTURAS & COMPROBANTES EMITIDOS */}
      {activeTab === 'FACTURAS' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Summary KPIs (Fluid Responsive Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 text-xs w-full max-w-full">
            <StatCard
              title="Total Facturado Global"
              value={formatCurrency(totalInvoiced)}
              subtitle="Facturas A, B, C y Tickets"
              icon={Receipt}
              variant="slate"
            />

            <StatCard
              title="Facturación ARCA (CAE)"
              value={formatCurrency(totalInvoicedWithCAE)}
              subtitle="Comprobantes oficiales AFIP"
              icon={Building}
              variant="emerald"
            />

            <StatCard
              title="Tickets Mostrador (Recibo X)"
              value={formatCurrency(totalInvoicedTickets)}
              subtitle="Gastos internos sin ARCA"
              icon={Receipt}
              variant="amber"
            />

            <StatCard
              title="Efectivo en Caja"
              value={formatCurrency(theoreticalCashInDrawer)}
              subtitle="Fondo + Cobros - Egresos"
              icon={DollarSign}
              variant="teal"
            />
          </div>

          {/* Search and Filters (Fluid Stacked / Grid for Mobile) */}
          <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-sm space-y-2.5 w-full max-w-full">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por cliente, Nº factura, CUIT/DNI..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[40px]"
              >
                <option value="TODOS">Todos los Tipos de Comprobante</option>
                <option value="FACTURA_B">Factura B (Consumidor Final)</option>
                <option value="FACTURA_A">Factura A (Resp. Inscripto)</option>
                <option value="FACTURA_C">Factura C (Monotributo)</option>
                <option value="RECIBO_X">Ticket Común (Recibo X)</option>
              </select>

              <select
                value={filterMethod}
                onChange={(e) => setFilterMethod(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[40px]"
              >
                <option value="TODOS">Todos los Medios de Cobro</option>
                <option value="EFECTIVO">💵 Efectivo</option>
                <option value="TARJETA_DEBITO">💳 Débito</option>
                <option value="TARJETA_CREDITO">💳 Crédito</option>
                <option value="TRANSFERENCIA">🏦 Transferencia</option>
                <option value="MERCADOPAGO_QR">📱 MercadoPago</option>
              </select>
            </div>
          </div>

          {/* THREE-TIER INVOICES PRESENTATION */}

          {/* 1. MÓVIL (< md / < 768px): Cards Nativas de Facturación */}
          <div className="block md:hidden space-y-3 w-full max-w-full">
            {filteredInvoices.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No se encontraron comprobantes"
                description={
                  searchTerm || filterType !== 'TODOS' || filterMethod !== 'TODOS'
                    ? 'No hay comprobantes que coincidan con la búsqueda o filtros seleccionados.'
                    : 'Aún no se han emitido facturas ni tickets en la sesión actual.'
                }
                actionLabel="Emitir Primer Comprobante"
                onAction={() => setQuickModal('NUEVA_FACTURA')}
              />
            ) : (
              filteredInvoices.map((inv) => (
                <InvoiceMobileCard
                  key={inv.id}
                  invoice={inv}
                  onPrint={handlePrintInvoice}
                  onWhatsApp={(i) => {
                    triggerHaptic('light');
                    openWhatsAppHub({
                      patientName: i.customerName,
                      ownerName: i.customerName,
                      ownerPhone: i.customerDniCuit || '',
                      type: 'FACTURA_COMPROBANTE',
                      details: {
                        invoiceNumber: i.invoiceNumber,
                        totalAmount: formatCurrency(i.totalAmount),
                        paymentMethod: i.paymentMethod,
                        caeNumber: i.caeNumber || 'N/A',
                      },
                    });
                  }}
                />
              ))
            )}
          </div>

          {/* 2. TABLET & DESKTOP (>= md / >= 768px): Tabla Completa */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left min-w-[700px]">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Nº Comprobante</th>
                    <th className="p-3.5">Tipo & Estado</th>
                    <th className="p-3.5">Cliente / Tutor</th>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Medio de Cobro</th>
                    <th className="p-3.5 text-right">Total ($ ARS)</th>
                    <th className="p-3.5 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="p-3.5">
                        {inv.type === 'RECIBO_X' ? (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                            📄 Ticket Común
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                              🧾 {inv.type.replace('_', ' ')}
                            </span>
                            <span className="block text-[9px] font-mono text-slate-400">
                              CAE: {inv.caeNumber}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{inv.customerName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">DNI/CUIT: {inv.customerDniCuit}</div>
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">{formatDate(inv.date)}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700 font-semibold text-[11px]">
                          {inv.paymentMethod === 'EFECTIVO' ? '💵 Efectivo' :
                           inv.paymentMethod === 'TARJETA_DEBITO' || (inv.paymentMethod as string) === 'DEBITO' ? '💳 Débito' :
                           inv.paymentMethod === 'TARJETA_CREDITO' || (inv.paymentMethod as string) === 'CREDITO' ? '💳 Crédito' :
                           inv.paymentMethod === 'TRANSFERENCIA' ? '🏦 Transferencia' : '📱 MercadoPago'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-mono font-black text-slate-900 text-sm">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handlePrintInvoice(inv)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                            title="Reimprimir Comprobante Oficial (Térmico 80mm o A4)"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              triggerHaptic('light');
                              showToast('info', 'Enviado por WhatsApp', `Comprobante ${inv.invoiceNumber} enviado al tutor.`);
                            }}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            title="Enviar Comprobante por WhatsApp"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRESUPUESTOS & PLANES DE TRATAMIENTO */}
      {activeTab === 'PRESUPUESTOS' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Planes Terapéuticos y Presupuestos Emitidos</h3>
            <button
              onClick={() => {
                triggerHaptic('medium');
                setQuickModal('NUEVO_PRESUPUESTO');
              }}
              className="btn-physical btn-physical-teal flex items-center gap-1.5 px-3.5 py-2 text-white text-xs font-black shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nuevo Presupuesto</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estimates.map((est) => (
              <div key={est.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 border border-slate-200">
                      {est.estimateNumber}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">Presupuesto Clínico / Quirúrgico</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    est.status === 'ACEPTADO' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    est.status === 'ENVIADO' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {est.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 border-t border-slate-100 pt-2">
                  {est.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between">
                      <span className="truncate max-w-[200px]">{it.description} (x{it.quantity})</span>
                      <span className="font-mono font-bold text-slate-900">{formatCurrency(it.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Total Presupuestado:</span>
                  <span className="text-base font-black text-teal-800 font-mono">{formatCurrency(est.totalAmount)}</span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      triggerHaptic('medium');
                      const inv = convertEstimateToInvoice(est.id, 'EFECTIVO');
                      if (inv) {
                        showToast('success', 'Presupuesto Facturado', `Se emitió la factura ${inv.invoiceNumber} por ${formatCurrency(inv.totalAmount)}.`);
                        setActiveTab('FACTURAS');
                      }
                    }}
                    className="flex-1 btn-physical btn-physical-teal py-2 text-xs font-black text-white flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Cobrar & Facturar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. EGRESOS & GASTOS OPERATIVOS */}
      {activeTab === 'EGRESOS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-150">
          {/* New Expense Form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 h-fit">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>Registrar Salida de Dinero / Gasto</span>
            </h3>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Categoría del Gasto:</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value="FARMACIA_INSUMOS">💊 Compra Urgente Farmacia / Insumos</option>
                  <option value="HONORARIOS_PROFESIONALES">👨‍⚕️ Honorarios Profesionales / Especialistas</option>
                  <option value="MANTENIMIENTO">🔧 Mantenimiento & Infraestructura</option>
                  <option value="LIMPIEZA">🧹 Limpieza, Desinfección & Descartables</option>
                  <option value="RETIRO_BANCO">🏦 Retiro de Caja / Remesa a Banco</option>
                  <option value="VARIOS">📦 Gastos Generales / Varios</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Monto ($ ARS):</label>
                <input
                  type="number"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="ej: 15000"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Descripción del Concepto:</label>
                <textarea
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="ej: Agujas descartables 21G y gasas estériles compradas en farmacia de turno..."
                  rows={2}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Medio de Pago:</label>
                  <select
                    value={expMethod}
                    onChange={(e) => setExpMethod(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="EFECTIVO">💵 Efectivo Caja</option>
                    <option value="TRANSFERENCIA">🏦 Transferencia</option>
                    <option value="DEBITO">💳 Débito</option>
                    <option value="MERCADOPAGO">📱 MercadoPago</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Nº Comprobante:</label>
                  <input
                    type="text"
                    value={expReceipt}
                    onChange={(e) => setExpReceipt(e.target.value)}
                    placeholder="ej: TKT-1829"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-physical btn-physical-rose py-2.5 text-white font-black text-xs shadow-md shadow-rose-600/20 active:scale-95 transition-all mt-2"
              >
                + Confirmar Egreso de Caja
              </button>
            </form>
          </div>

          {/* Expenses History Table */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Historial de Salidas & Egresos de Caja</h3>
              <span className="text-xs font-black text-rose-700 font-mono">Total Egresos: -{formatCurrency(totalExpenses)}</span>
            </div>

            <div className="overflow-x-auto w-full flex-1">
              <table className="w-full text-xs text-left min-w-[550px]">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Fecha / Hora</th>
                    <th className="p-3">Categoría</th>
                    <th className="p-3">Concepto</th>
                    <th className="p-3">Medio</th>
                    <th className="p-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono text-slate-600">{exp.timestamp}</td>
                      <td className="p-3 font-bold text-slate-800 text-[11px]">{exp.category.replace('_', ' ')}</td>
                      <td className="p-3 text-slate-600 max-w-[200px] truncate">{exp.description}</td>
                      <td className="p-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">
                          {exp.paymentMethod}
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-black text-rose-700 text-sm">
                        -{formatCurrency(exp.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. ARQUEO Z & BALANCE DE TURNO */}
      {activeTab === 'CAJA' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Status Header */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  sessionActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {sessionActive ? '● CAJA ABIERTA & OPERATIVA' : '○ CAJA CERRADA'}
                </span>
                <span className="text-xs font-bold text-slate-600 font-mono">
                  {shiftName}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Apertura: {formatDateTime(cashSession.openedAt)} • Responsable: {currentUser.name || 'Personal de Caja'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Reporte X</span>
              </button>

              {sessionActive ? (
                <button
                  onClick={handleCloseCashSession}
                  className="btn-physical btn-physical-rose px-4 py-2 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Cerrar Caja & Arqueo Z</span>
                </button>
              ) : (
                <button
                  onClick={handleOpenCashSession}
                  className="btn-physical btn-physical-teal px-4 py-2 text-white text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Abrir Nuevo Turno</span>
                </button>
              )}
            </div>
          </div>

          {/* Core Balance Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Saldo Inicial (Fondo):</span>
              <div className="text-xl font-black text-slate-900 font-mono">
                {formatCurrency(initialCashAmount)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-emerald-700 font-bold uppercase text-[10px]">Ingresos en Efectivo:</span>
              <div className="text-xl font-black text-emerald-700 font-mono">
                +{formatCurrency(revenueCash)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1 shadow-2xs">
              <span className="text-rose-700 font-bold uppercase text-[10px]">Egresos en Efectivo:</span>
              <div className="text-xl font-black text-rose-700 font-mono">
                -{formatCurrency(expensesCash)}
              </div>
            </div>

            <div className="bg-teal-50/90 p-4 rounded-2xl border border-teal-200 space-y-1 shadow-2xs">
              <span className="text-teal-800 font-bold uppercase text-[10px]">Efectivo Teórico en Gaveta:</span>
              <div className="text-xl font-black text-teal-800 font-mono">
                {formatCurrency(theoreticalCashInDrawer)}
              </div>
            </div>
          </div>

          {/* Breakdown by Digital Channels */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Discriminación por Medio de Cobro Digital / Bancario:
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block">💵 Efectivo</span>
                <span className="font-mono font-black text-slate-900 text-sm">{formatCurrency(revenueCash)}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block">💳 Débito</span>
                <span className="font-mono font-black text-slate-900 text-sm">{formatCurrency(revenueDebit)}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block">💳 Crédito</span>
                <span className="font-mono font-black text-slate-900 text-sm">{formatCurrency(revenueCredit)}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block">🏦 Transferencias</span>
                <span className="font-mono font-black text-slate-900 text-sm">{formatCurrency(revenueTransfer)}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-medium block">📱 MercadoPago</span>
                <span className="font-mono font-black text-slate-900 text-sm">{formatCurrency(revenueMP)}</span>
              </div>
            </div>
          </div>

          {/* Physical Cash Drawer Count Module (Arqueo Ciego de Billetes) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>Conteo Físico de Billetes (Arqueo Ciego en Gaveta)</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Ingresá la cantidad de billetes por cada denominación para cotejar con el saldo teórico de la caja.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Contado Físico:</span>
                <span className="text-base font-black text-slate-900 font-mono">{formatCurrency(physicalCashCounted)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs">
              {[20000, 10000, 2000, 1000, 500, 200, 100].map((denom) => (
                <div key={denom} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1">
                  <span className="font-mono font-bold text-slate-700 text-[11px] block">${denom.toLocaleString('es-AR')}</span>
                  <input
                    type="number"
                    min="0"
                    value={billCounts[denom] || ''}
                    onChange={(e) => {
                      const count = parseInt(e.target.value) || 0;
                      setBillCounts((prev) => ({ ...prev, [denom]: count }));
                    }}
                    placeholder="0"
                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-center font-mono font-bold text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono block text-center">
                    = {formatCurrency((billCounts[denom] || 0) * denom)}
                  </span>
                </div>
              ))}
            </div>

            {/* Reconciliation Difference Alert */}
            {physicalCashCounted > 0 && (
              <div className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                cashDifference === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : cashDifference > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bold">
                    {cashDifference === 0
                      ? '✅ Caja Cuadrada Perfecta (Diferencia $0,00)'
                      : cashDifference > 0
                      ? `ℹ️ Sobrante de Caja: +${formatCurrency(cashDifference)}`
                      : `⚠️ Faltante de Caja: ${formatCurrency(cashDifference)}`}
                  </span>
                </div>
                <span className="font-mono font-bold">
                  Teórico: {formatCurrency(theoreticalCashInDrawer)} vs Físico: {formatCurrency(physicalCashCounted)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. CONFIGURACIÓN FISCAL ARCA (AFIP) */}
      {activeTab === 'CONFIGURACION_FISCAL' && (
        <form onSubmit={handleSaveFiscalConfig} className="space-y-6 animate-in fade-in duration-150 text-xs">
          {/* Card 1: Fiscal Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Building className="w-4 h-4 text-teal-600" />
              <span>Datos Fiscales de la Empresa / Clínica Veterinaria</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">CUIT Emisor (ARCA/AFIP):</label>
                <input
                  type="text"
                  value={fiscalConfig.cuit}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, cuit: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Razón Social:</label>
                <input
                  type="text"
                  value={fiscalConfig.businessName}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, businessName: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Nombre de Fantasía:</label>
                <input
                  type="text"
                  value={fiscalConfig.fantasyName}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, fantasyName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Condición Fiscal ante el IVA:</label>
                <select
                  value={fiscalConfig.taxCondition}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, taxCondition: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="IVA Responsable Inscripto">IVA Responsable Inscripto</option>
                  <option value="Monotributo">Responsable Monotributo</option>
                  <option value="IVA Exento">IVA Exento</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Ingresos Brutos (IIBB):</label>
                <input
                  type="text"
                  value={fiscalConfig.iibb}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, iibb: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Inicio de Actividades:</label>
                <input
                  type="text"
                  value={fiscalConfig.startDate}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, startDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Domicilio Fiscal Comercial:</label>
              <input
                type="text"
                value={fiscalConfig.fiscalAddress}
                onChange={(e) => setFiscalConfig({ ...fiscalConfig, fiscalAddress: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          {/* Card 2: Points of Sale & Web Services */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Puntos de Venta (PV) & Facturación Electrónica ARCA Web Services</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <label className="text-slate-700 block font-bold text-[11px]">PV 1 — Web Services ARCA (A/B/C):</label>
                <input
                  type="number"
                  value={fiscalConfig.pointOfSaleMain}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, pointOfSaleMain: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400">Emisión online con CAE</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <label className="text-slate-700 block font-bold text-[11px]">PV 2 — Mostrador (Recibo X / Tickets):</label>
                <input
                  type="number"
                  value={fiscalConfig.pointOfSaleTickets}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, pointOfSaleTickets: parseInt(e.target.value) || 2 })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400">Control interno sin ARCA</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <label className="text-slate-700 block font-bold text-[11px]">PV 3 — Urgencias / Guardia 24hs:</label>
                <input
                  type="number"
                  value={fiscalConfig.pointOfSaleGuard}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, pointOfSaleGuard: parseInt(e.target.value) || 3 })}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400">Internación y guardia</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Ambiente de Conexión:</label>
                <select
                  value={fiscalConfig.environment}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, environment: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-900"
                >
                  <option value="PRODUCCION">🟢 Producción Oficial ARCA (AFIP)</option>
                  <option value="HOMOLOGACION">🟡 Testing / Homologación (Ambiente de Pruebas)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Certificado Digital X.509:</label>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center justify-between text-emerald-800 font-bold">
                  <span>✅ {fiscalConfig.certStatus}</span>
                  <span className="text-[10px] font-mono">Vence: {fiscalConfig.certExpiration}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Payment Accounts & Discounts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Landmark className="w-4 h-4 text-teal-600" />
              <span>Cuentas de Cobro Digital, CBU, Alias & Descuentos</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Alias CBU / MP para Transferencias:</label>
                <input
                  type="text"
                  value={fiscalConfig.cbuAlias}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, cbuAlias: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">CBU / CVU Bancario (22 dígitos):</label>
                <input
                  type="text"
                  value={fiscalConfig.cbuNumber}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, cbuNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Descuento Pago en Efectivo (%):</label>
                <input
                  type="number"
                  value={fiscalConfig.defaultPaymentDiscountCash}
                  onChange={(e) => setFiscalConfig({ ...fiscalConfig, defaultPaymentDiscountCash: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-mono font-bold text-teal-800"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="submit"
              className="btn-physical btn-physical-teal px-6 py-3 text-white font-black text-xs shadow-md shadow-teal-600/20 active:scale-95 transition-all"
            >
              💾 Guardar Configuración de Caja & Fiscal
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
