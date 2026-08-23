import React from 'react';
import {
  Receipt,
  Printer,
  Send,
  FileCheck,
  CheckCircle2,
  Building,
  CreditCard,
} from 'lucide-react';
import { Invoice } from '../types';
import { formatDate, formatCurrency } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';

interface InvoiceMobileCardProps {
  invoice: Invoice;
  onPrint: (invoice: Invoice) => void;
  onWhatsApp: (invoice: Invoice) => void;
}

export const InvoiceMobileCard: React.FC<InvoiceMobileCardProps> = ({
  invoice,
  onPrint,
  onWhatsApp,
}) => {
  const isTicket = invoice.type === 'RECIBO_X';

  const paymentLabel =
    invoice.paymentMethod === 'EFECTIVO'
      ? '💵 Efectivo'
      : invoice.paymentMethod === 'TARJETA_DEBITO' || (invoice.paymentMethod as string) === 'DEBITO'
      ? '💳 Débito'
      : invoice.paymentMethod === 'TARJETA_CREDITO' || (invoice.paymentMethod as string) === 'CREDITO'
      ? '💳 Crédito'
      : invoice.paymentMethod === 'TRANSFERENCIA'
      ? '🏦 Transferencia'
      : '📱 MercadoPago';

  return (
    <article
      className="bg-white border border-slate-200/90 hover:border-teal-500/60 rounded-2xl p-4 shadow-xs space-y-3 transition-all w-full max-w-full min-w-0"
      aria-label={`Comprobante ${invoice.invoiceNumber}`}
    >
      {/* 1. Top Header: Type Badge, Invoice Number, Date */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                isTicket
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {isTicket ? '📄 TICKET COMÚN' : `🧾 ${invoice.type.replace('_', ' ')}`}
            </span>
            <span className="font-mono font-bold text-slate-900 text-xs">
              #{invoice.invoiceNumber}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
            Fecha: {formatDate(invoice.date)}
          </span>
        </div>

        <span className="text-base font-black text-slate-900 font-mono flex-shrink-0">
          {formatCurrency(invoice.totalAmount)}
        </span>
      </div>

      {/* 2. Client & Identification Box */}
      <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Cliente / Tutor:
          </span>
          <span className="bg-slate-200/70 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-700">
            {paymentLabel}
          </span>
        </div>

        <div className="font-bold text-slate-900 text-sm truncate">
          {invoice.customerName || 'Consumidor Final'}
        </div>

        <div className="text-slate-500 font-mono text-xs">
          DNI / CUIT: <strong className="text-slate-700">{invoice.customerDniCuit || 'N/D'}</strong>
        </div>

        {!isTicket && invoice.caeNumber && (
          <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>CAE ARCA: <strong className="text-emerald-700">{invoice.caeNumber}</strong></span>
            {invoice.caeExpirationDate && <span>Vto: {invoice.caeExpirationDate}</span>}
          </div>
        )}
      </div>

      {/* 3. Items list preview (collapsed/compact) */}
      {invoice.items && invoice.items.length > 0 && (
        <div className="space-y-0.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
            Detalle de Conceptos ({invoice.items.length}):
          </span>
          {invoice.items.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-[11px] truncate">
              <span className="truncate mr-2">• {item.description} (x{item.quantity})</span>
              <span className="font-mono text-slate-700 font-bold flex-shrink-0">{formatCurrency(item.subtotal)}</span>
            </div>
          ))}
          {invoice.items.length > 2 && (
            <span className="text-[10px] text-teal-700 font-bold block pt-0.5">
              +{invoice.items.length - 2} ítem(s) más...
            </span>
          )}
        </div>
      )}

      {/* 4. Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onPrint(invoice);
          }}
          className="flex-1 min-h-[44px] px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 touch-manipulation"
          title="Reimprimir Comprobante Oficial"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Imprimir / Ver</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onWhatsApp(invoice);
          }}
          className="flex-1 min-h-[44px] px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 touch-manipulation"
          title="Enviar Comprobante por WhatsApp"
        >
          <Send className="w-4 h-4 text-emerald-600" />
          <span>WhatsApp</span>
        </button>
      </div>
    </article>
  );
};
