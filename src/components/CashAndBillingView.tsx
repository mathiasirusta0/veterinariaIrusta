import React, { useState } from 'react';
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
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Invoice, Estimate } from '../types';
import { formatDate, formatDateTime, formatCurrency, formatInvoiceNumber } from '../utils/formatters';

export interface CashExpense {
  id: string;
  timestamp: string;
  category: 'FARMACIA_INSUMOS' | 'HONORARIOS_PROFESIONALES' | 'MANTENIMIENTO' | 'LIMPIEZA' | 'VARIOS';
  description: string;
  amount: number;
  paymentMethod: 'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO';
  registeredBy: string;
  receiptNumber?: string;
}

export const CashAndBillingView: React.FC = () => {
  const {
    invoices,
    estimates,
    cashSession,
    convertEstimateToInvoice,
    setQuickModal,
    openPrintModal,
    showToast,
    logAudit,
  } = useVet();

  const [activeTab, setActiveTab] = useState<'FACTURAS' | 'PRESUPUESTOS' | 'CAJA' | 'EGRESOS'>('FACTURAS');

  // Expenses State
  const [expenses, setExpenses] = useState<CashExpense[]>([
    {
      id: 'exp-1',
      timestamp: '2026-08-18 11:30',
      category: 'FARMACIA_INSUMOS',
      description: 'Compra de urgencia de agujas 21G y sueros fisiológicos',
      amount: 14500,
      paymentMethod: 'EFECTIVO',
      registeredBy: 'Dra. Valentina Rossi',
      receiptNumber: 'TKT-9912',
    },
    {
      id: 'exp-2',
      timestamp: '2026-08-18 14:15',
      category: 'HONORARIOS_PROFESIONALES',
      description: 'Honorario ecografista externo por 2 estudios de urgencia',
      amount: 32000,
      paymentMethod: 'TRANSFERENCIA',
      registeredBy: 'Dr. Martín López',
      receiptNumber: 'FAC-0002-0041',
    },
  ]);

  // New Expense Form State
  const [expCategory, setExpCategory] = useState<CashExpense['category']>('FARMACIA_INSUMOS');
  const [expDesc, setExpDesc] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expMethod, setExpMethod] = useState<CashExpense['paymentMethod']>('EFECTIVO');
  const [expReceipt, setExpReceipt] = useState('');

  const totalInvoiced = invoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalExpenses = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Breakdown by payment method
  const revenueCash = invoices.filter((i) => i.paymentMethod === 'EFECTIVO').reduce((a, b) => a + (b.totalAmount || 0), 0);
  const revenueDebit = invoices.filter((i) => i.paymentMethod === 'DEBITO' || (i.paymentMethod as string) === 'TARJETA_DEBITO').reduce((a, b) => a + (b.totalAmount || 0), 0);
  const revenueCredit = invoices.filter((i) => i.paymentMethod === 'CREDITO' || (i.paymentMethod as string) === 'TARJETA_CREDITO').reduce((a, b) => a + (b.totalAmount || 0), 0);
  const revenueTransfer = invoices.filter((i) => i.paymentMethod === 'TRANSFERENCIA').reduce((a, b) => a + (b.totalAmount || 0), 0);
  const revenueMP = invoices.filter((i) => i.paymentMethod === 'MERCADOPAGO' || (i.paymentMethod as string) === 'MERCADOPAGO_QR').reduce((a, b) => a + (b.totalAmount || 0), 0);

  const expensesCash = expenses.filter((e) => e.paymentMethod === 'EFECTIVO').reduce((a, b) => a + (b.amount || 0), 0);
  const netCashInDrawer = (cashSession?.initialCash || 0) + revenueCash - expensesCash;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expAmount);
    if (!expDesc || isNaN(amountNum) || amountNum <= 0) {
      showToast('error', 'Error en Egreso', 'Por favor ingresá una descripción y monto válido.');
      return;
    }

    const newExp: CashExpense = {
      id: `exp-${Date.now()}`,
      timestamp: new Date().toLocaleString('es-AR'),
      category: expCategory,
      description: expDesc,
      amount: amountNum,
      paymentMethod: expMethod,
      registeredBy: 'Dra. Valentina Rossi',
      receiptNumber: expReceipt || `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    setExpenses((prev) => [newExp, ...prev]);
    setExpDesc('');
    setExpAmount('');
    setExpReceipt('');
    showToast('success', 'Egreso Registrado', `Se registró un egreso de $${amountNum.toLocaleString('es-AR')} en caja.`);
    logAudit('REGISTRO_EGRESO_CAJA', 'CashSession', cashSession.id, `Egreso de $${amountNum} (${expCategory}): ${expDesc}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              AFIP / ARCA Facturación Electrónica Homologada
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-600" />
            <span>Caja, Facturación Electrónica & Egresos</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Emisión de Facturas A/B/C con CAE y código QR fiscal, egresos operativos, presupuestos y balance de caja
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('EGRESOS')}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition-colors"
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Registrar Egreso</span>
          </button>
          <button
            onClick={() => setQuickModal('NUEVO_PRESUPUESTO')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Presupuesto</span>
          </button>
          <button
            onClick={() => setQuickModal('NUEVA_FACTURA')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Emitir Factura AFIP</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('FACTURAS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'FACTURAS'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Facturación Emitida ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('PRESUPUESTOS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'PRESUPUESTOS'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Presupuestos ({estimates.length})
        </button>
        <button
          onClick={() => setActiveTab('EGRESOS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'EGRESOS'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Egresos & Gastos ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab('CAJA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'CAJA'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          Arqueo & Balance de Caja
        </button>
      </div>

      {/* 1. FACTURAS */}
      {activeTab === 'FACTURAS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Facturado</span>
              <span className="text-xl font-black text-slate-900 font-mono">
                ${totalInvoiced.toLocaleString('es-AR')}
              </span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Facturas Electrónicas</span>
              <span className="text-xl font-black text-teal-700 font-mono">{invoices.length}</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Efectivo Ingresado</span>
              <span className="text-xl font-black text-emerald-700 font-mono">${revenueCash.toLocaleString('es-AR')}</span>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Medios Digitales (MP / Tarjetas)</span>
              <span className="text-xl font-black text-blue-700 font-mono">
                ${(revenueDebit + revenueCredit + revenueTransfer + revenueMP).toLocaleString('es-AR')}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="p-3.5">Comprobante</th>
                  <th className="p-3.5">Fecha & Hora</th>
                  <th className="p-3.5">Tutor / Cliente</th>
                  <th className="p-3.5">Detalle</th>
                  <th className="p-3.5">Pago</th>
                  <th className="p-3.5 text-right">Total</th>
                  <th className="p-3.5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold font-mono text-slate-900">
                      {formatInvoiceNumber(inv.type || (inv as any).invoiceType, inv.pointOfSale, inv.invoiceNumber)}
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono">
                      {formatDate(inv.date || (inv as any).issuedAt)}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{inv.customerName || (inv as any).clientName || 'Consumidor Final'}</td>
                    <td className="p-3.5 text-slate-600">
                      {(inv.items || []).map((i) => `${i.quantity}x ${i.description}`).join(', ')}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                        {inv.paymentMethod || 'EFECTIVO'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-slate-900 text-sm">
                      ${(inv.totalAmount ?? (inv as any).total ?? 0).toLocaleString('es-AR')}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => openPrintModal({ type: 'FACTURA', invoiceId: inv.id })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-slate-100 transition-colors"
                        title="Imprimir Comprobante Fiscal con QR AFIP"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. PRESUPUESTOS */}
      {activeTab === 'PRESUPUESTOS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {estimates.map((est) => (
              <div
                key={est.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm hover:border-teal-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 font-bold block">
                        PRESUPUESTO #{est.id.slice(-4).toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{est.clientName}</h4>
                    </div>

                    <span className="text-base font-black text-slate-900 font-mono">
                      ${(est.totalAmount || 0).toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div className="space-y-1.5 py-3 text-xs">
                    {(est.items || []).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100"
                      >
                        <span>{item.quantity}x {item.description}</span>
                        <span className="font-mono font-bold text-slate-900">${(item.subtotal || 0).toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>

                  {est.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      "{est.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">Válido hasta: {est.expirationDate}</span>

                  {est.status !== 'ACEPTADO' && (
                    <button
                      onClick={() => convertEstimateToInvoice(est.id, 'EFECTIVO')}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-sm transition-transform active:scale-95 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Convertir a Factura</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. EGRESOS */}
      {activeTab === 'EGRESOS' && (
        <div className="space-y-6">
          {/* New Expense Form */}
          <form onSubmit={handleAddExpense} className="bg-white border border-rose-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              <h3 className="text-sm font-bold text-slate-900">Registrar Nuevo Egreso / Gasto Operativo</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Categoría de Gasto:</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                >
                  <option value="FARMACIA_INSUMOS">Farmacia & Descartables</option>
                  <option value="HONORARIOS_PROFESIONALES">Honorarios Médicos / Cirujano</option>
                  <option value="MANTENIMIENTO">Mantenimiento & Equipamiento</option>
                  <option value="LIMPIEZA">Limpieza & Aseo Hospitalario</option>
                  <option value="VARIOS">Gastos Varios / Menores</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-slate-700 block mb-1">Descripción / Concepto:</label>
                <input
                  type="text"
                  placeholder="ej: Compra de sueros Ringer y jeringas de urgencia"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Monto ($ ARS):</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold font-mono text-slate-900 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Medio de Pago:</label>
                <select
                  value={expMethod}
                  onChange={(e) => setExpMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-900"
                >
                  <option value="EFECTIVO">Efectivo de Caja</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="MERCADOPAGO">MercadoPago</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">N° Comprobante / Ticket:</label>
                <input
                  type="text"
                  placeholder="ej: TKT-10492"
                  value={expReceipt}
                  onChange={(e) => setExpReceipt(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-900 font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-sm text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar Egreso</span>
                </button>
              </div>
            </div>
          </form>

          {/* Expenses Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold">
                  <th className="p-3.5">Fecha & Hora</th>
                  <th className="p-3.5">Categoría</th>
                  <th className="p-3.5">Concepto</th>
                  <th className="p-3.5">Comprobante</th>
                  <th className="p-3.5">Medio</th>
                  <th className="p-3.5 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-mono text-slate-500">{exp.timestamp}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-bold text-[10px] border border-rose-200">
                        {exp.category ? exp.category.replace('_', ' ') : 'General'}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{exp.description}</td>
                    <td className="p-3.5 font-mono text-slate-500">{exp.receiptNumber || '-'}</td>
                    <td className="p-3.5 font-mono">{exp.paymentMethod}</td>
                    <td className="p-3.5 text-right font-mono font-black text-rose-700 text-sm">
                      -${exp.amount.toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ARQUEO & BALANCE DE CAJA */}
      {activeTab === 'CAJA' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Balance de Turno & Arqueo Z</h3>
              <p className="text-xs text-slate-500">
                Apertura: {formatDateTime(cashSession.openedAt)} • Responsable: {cashSession.openedBy || 'Personal de Caja'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Cierre Z</span>
              </button>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                CAJA ABIERTA
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Saldo Inicial (Fondo de Caja):</span>
              <div className="text-xl font-black text-slate-900 font-mono">
                ${cashSession.initialCash.toLocaleString('es-AR')}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-emerald-700 font-bold uppercase text-[10px]">Total Facturado:</span>
              <div className="text-xl font-black text-emerald-700 font-mono">
                +${totalInvoiced.toLocaleString('es-AR')}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-rose-700 font-bold uppercase text-[10px]">Total Egresos:</span>
              <div className="text-xl font-black text-rose-700 font-mono">
                -${totalExpenses.toLocaleString('es-AR')}
              </div>
            </div>
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-200 space-y-1">
              <span className="text-teal-800 font-bold uppercase text-[10px]">Efectivo Neto Físico en Gaveta:</span>
              <div className="text-xl font-black text-teal-800 font-mono">
                ${netCashInDrawer.toLocaleString('es-AR')}
              </div>
            </div>
          </div>

          {/* Breakdown by Payment Channel */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Discriminación por Medio de Cobro / Canal:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block">💵 Efectivo</span>
                <span className="font-mono font-bold text-slate-900 text-sm">${revenueCash.toLocaleString('es-AR')}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block">💳 Débito</span>
                <span className="font-mono font-bold text-slate-900 text-sm">${revenueDebit.toLocaleString('es-AR')}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block">💳 Crédito</span>
                <span className="font-mono font-bold text-slate-900 text-sm">${revenueCredit.toLocaleString('es-AR')}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block">🏦 Transferencias</span>
                <span className="font-mono font-bold text-slate-900 text-sm">${revenueTransfer.toLocaleString('es-AR')}</span>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-medium block">📱 MercadoPago</span>
                <span className="font-mono font-bold text-slate-900 text-sm">${revenueMP.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
