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
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Invoice, Estimate } from '../types';

export const CashAndBillingView: React.FC = () => {
  const {
    invoices,
    estimates,
    cashSession,
    convertEstimateToInvoice,
    setQuickModal,
    openPrintModal,
  } = useVet();

  const [activeTab, setActiveTab] = useState<'FACTURAS' | 'PRESUPUESTOS' | 'CAJA'>('FACTURAS');

  const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

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
            <span>Caja, Facturación Electrónica & Presupuestos</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Emisión de Facturas A/B/C con CAE y código QR fiscal, presupuestos y control de arqueo de caja
          </p>
        </div>

        <div className="flex items-center gap-2">
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
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('FACTURAS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'FACTURAS'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Comprobantes Emitidos ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('PRESUPUESTOS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'PRESUPUESTOS'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Presupuestos ({estimates.length})
        </button>
        <button
          onClick={() => setActiveTab('CAJA')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'CAJA'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Sesión de Caja Actual
        </button>
      </div>

      {/* 1. FACTURAS */}
      {activeTab === 'FACTURAS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900">{inv.type}</span>
                        <span className="font-mono text-teal-700 font-bold text-sm">
                          {inv.invoiceNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Cliente: <span className="text-slate-900 font-bold">{inv.customerName}</span> ({inv.customerDniCuit})
                      </p>
                    </div>

                    <span className="text-base font-black text-slate-900 font-mono">
                      ${inv.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5 py-3 text-xs">
                    {inv.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100"
                      >
                        <span>{item.quantity}x {item.description}</span>
                        <span className="font-mono font-bold text-slate-900">${item.subtotal.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Fiscal Details Box */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-[11px] font-mono">
                    <div>
                      <span className="text-slate-400 font-bold block">CAE AFIP:</span>
                      <span className="text-slate-800 font-bold">{inv.caeNumber}</span>
                      <span className="text-slate-400 block text-[10px]">Vto: {inv.caeExpirationDate}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-teal-700 font-bold">
                      <QrCode className="w-6 h-6" />
                      <span>QR Fiscal</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Pago: {inv.paymentMethod}</span>
                  <button
                    onClick={() =>
                      openPrintModal({
                        type: 'FACTURA',
                        invoiceId: inv.id,
                      })
                    }
                    className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Comprobante</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. PRESUPUESTOS */}
      {activeTab === 'PRESUPUESTOS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {estimates.map((est) => (
              <div
                key={est.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-amber-700 font-bold text-sm">
                          {est.estimateNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {est.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Fecha: {est.date}</p>
                    </div>

                    <span className="text-base font-black text-slate-900 font-mono">
                      ${est.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1.5 py-3 text-xs">
                    {est.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100"
                      >
                        <span>{item.quantity}x {item.description}</span>
                        <span className="font-mono font-bold text-slate-900">${item.subtotal.toLocaleString()}</span>
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

      {/* 3. CAJA */}
      {activeTab === 'CAJA' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Estado de Caja en Turno</h3>
              <p className="text-xs text-slate-500">
                Apertura: {new Date(cashSession.openedAt).toLocaleString('es-AR')} • Responsable: {cashSession.openedBy}
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              CAJA ABIERTA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Saldo Inicial:</span>
              <div className="text-xl font-black text-slate-900 font-mono">
                ${cashSession.initialCash.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Ingresos del Turno:</span>
              <div className="text-xl font-black text-teal-700 font-mono">
                ${totalInvoiced.toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Total Estimado en Caja:</span>
              <div className="text-xl font-black text-slate-900 font-mono">
                ${(cashSession.initialCash + totalInvoiced).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
