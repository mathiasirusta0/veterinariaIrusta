import React from 'react';
import {
  Package,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Layers,
  CheckCircle2,
  DollarSign,
  ShieldAlert,
  MapPin,
  FileText,
} from 'lucide-react';
import { Product } from '../types';
import { formatExpirationDate } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';

interface PharmacyMobileCardProps {
  product: Product;
  onAdjustStock: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
}

export const PharmacyMobileCard: React.FC<PharmacyMobileCardProps> = ({
  product,
  onAdjustStock,
  onEditProduct,
}) => {
  const isCritical = (product.currentStock ?? 0) <= (product.minStock ?? 0);
  const isOutOfStock = (product.currentStock ?? 0) <= 0;

  // Expiration calculation
  const expirationStr = formatExpirationDate(product.expirationDate);
  const isExpired = (() => {
    if (!product.expirationDate) return false;
    try {
      const exp = new Date(product.expirationDate);
      return !isNaN(exp.getTime()) && exp.getTime() < Date.now();
    } catch {
      return false;
    }
  })();

  const isNearExpiry = (() => {
    if (!product.expirationDate || isExpired) return false;
    try {
      const exp = new Date(product.expirationDate);
      const diffDays = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diffDays > 0 && diffDays <= 60;
    } catch {
      return false;
    }
  })();

  const isControlled = product.isPsychotropic || product.isNarcotic || product.category === 'PSICOTROPICO' || product.category === 'ESTUPEFACIENTE';

  return (
    <article
      className={'bg-white border rounded-2xl p-4 shadow-xs space-y-3 transition-all w-full max-w-full ' +
        (isOutOfStock
          ? 'border-rose-300 ring-2 ring-rose-200/50'
          : isCritical
          ? 'border-amber-300 ring-2 ring-amber-200/40'
          : 'border-slate-200/90 hover:border-teal-500/60')}
      aria-label={'Medicamento ' + product.commercialName}
    >
      {/* 1. Header: Commercial Name, Active Ingredient & Category Badge */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 tracking-tight break-words">
              {product.commercialName}
            </h3>
            {product.concentration && (
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                {product.concentration}
              </span>
            )}
          </div>
          <p className="text-xs text-teal-700 font-semibold truncate">
            {product.activeIngredient || 'Fórmula / Insumo clínico'}
          </p>
          {product.laboratory && (
            <span className="text-[10px] text-slate-400 font-medium block">
              Fab: {product.laboratory} {product.supplier ? '• Prov: ' + product.supplier : ''}
            </span>
          )}
        </div>

        {/* Category & Control Badges */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
            {product.category}
          </span>
          {isControlled && (
            <span className="text-[9px] font-black px-2 py-0.2 rounded-full uppercase bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
              <ShieldAlert className="w-2.5 h-2.5 text-purple-600" />
              <span>PSICOTRÓPICO</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Status Badges Row (Stock, Expiration, Location) */}
      <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
        {isOutOfStock ? (
          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            🔴 SIN STOCK
          </span>
        ) : isCritical ? (
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 animate-pulse">
            🟡 STOCK CRÍTICO (Mín: {product.minStock})
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            🟢 STOCK OK ({product.currentStock} uds)
          </span>
        )}

        {isExpired ? (
          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
            🔴 VENCIDO ({expirationStr})
          </span>
        ) : isNearExpiry ? (
          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
            🟠 VENCE PRONTO ({expirationStr})
          </span>
        ) : null}

        {product.location && (
          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
            <MapPin className="w-2.5 h-2.5 text-slate-500" />
            <span>{product.location}</span>
          </span>
        )}
      </div>

      {/* 3. Technical 2-Column Grid (Código, Lote, Stock, Precio) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50/90 p-3 rounded-xl border border-slate-100 text-xs">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
            Código / Lote:
          </span>
          <span className="font-mono font-bold text-slate-700 whitespace-nowrap block truncate">
            {product.code} • {product.currentBatch || 'L-GENERAL'}
          </span>
        </div>

        <div className="min-w-0 text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
            Precio Venta:
          </span>
          <span className="font-mono font-black text-sm text-slate-900 block">
            ${(product.salePrice ?? 0).toLocaleString('es-AR')}
          </span>
        </div>

        <div className="min-w-0 border-t border-slate-200/60 pt-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
            Stock Disponible:
          </span>
          <span
            className={'font-mono font-black text-sm block ' +
              (isCritical ? 'text-rose-700' : 'text-slate-900')}
          >
            {product.currentStock ?? 0}{' '}
            <span className="text-[11px] font-medium text-slate-500">
              {product.presentation || 'uds'}
            </span>
          </span>
        </div>

        <div className="min-w-0 border-t border-slate-200/60 pt-1.5 text-right">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
            Costo Unitario:
          </span>
          <span className="font-mono font-bold text-xs text-slate-600 block">
            ${(product.costPrice ?? 0).toLocaleString('es-AR')}
          </span>
        </div>
      </div>

      {/* 4. Action Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
        {onEditProduct && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onEditProduct(product);
            }}
            className="min-h-[38px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            Editar
          </button>
        )}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            onAdjustStock(product);
          }}
          className="min-h-[38px] px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all active:scale-95 flex items-center gap-1"
        >
          <span>Ajustar / Reponer</span>
        </button>
      </div>
    </article>
  );
};
