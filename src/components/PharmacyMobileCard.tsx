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
} from 'lucide-react';
import { Product } from '../types';
import { formatExpirationDate } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';

interface PharmacyMobileCardProps {
  product: Product;
  onAdjustStock: (product: Product) => void;
}

export const PharmacyMobileCard: React.FC<PharmacyMobileCardProps> = ({
  product,
  onAdjustStock,
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

  return (
    <article
      className="bg-white border border-slate-200/90 hover:border-teal-500/60 rounded-2xl p-4 shadow-xs space-y-3 transition-all w-full max-w-full min-w-0"
      aria-label={`Medicamento ${product.commercialName}`}
    >
      {/* 1. Header: Commercial Name, Active Ingredient & Category Badge */}
      <div className="flex items-start justify-between gap-2 min-w-0">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 tracking-tight break-words">
              {product.commercialName}
            </h3>
          </div>
          <p className="text-xs text-teal-700 font-semibold truncate mt-0.5">
            {product.activeIngredient || 'Fórmula / Insumo clínico'}
          </p>
          {product.laboratory && (
            <span className="text-[10px] text-slate-400 font-medium block">
              {product.laboratory}
            </span>
          )}
        </div>

        {/* Category Pill */}
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
          {product.category || 'FARMACO'}
        </span>
      </div>

      {/* 2. Status Badges Row (Stock and Expiration) */}
      <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
        {isOutOfStock ? (
          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
            🔴 SIN STOCK
          </span>
        ) : isCritical ? (
          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 animate-pulse">
            🟡 STOCK BAJO (Mín: {product.minStock})
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            🟢 STOCK OK
          </span>
        )}

        {isExpired ? (
          <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
            🔴 VENCIDO
          </span>
        ) : isNearExpiry ? (
          <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
            🟠 PRÓXIMO A VENCER
          </span>
        ) : null}
      </div>

      {/* 3. Technical 2-Column Grid (Código, Lote, Stock, Vence) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-50/90 p-3 rounded-xl border border-slate-100 text-xs">
        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
            Código:
          </span>
          <span className="font-mono font-bold text-slate-700 whitespace-nowrap block truncate">
            {product.code || 'FAR-000'}
          </span>
        </div>

        <div className="min-w-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
            Lote:
          </span>
          <span className="font-mono font-bold text-slate-700 whitespace-nowrap block truncate">
            {product.currentBatch || (product as any).batchNumber || 'N/A'}
          </span>
        </div>

        <div className="min-w-0 border-t border-slate-200/60 pt-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
            Stock Disponible:
          </span>
          <span
            className={`font-mono font-black text-sm block ${
              isCritical ? 'text-rose-700' : 'text-slate-900'
            }`}
          >
            {product.currentStock ?? 0}{' '}
            <span className="text-[11px] font-medium text-slate-500">
              {product.presentation || (product as any).presentationUnit || 'uds'}
            </span>
          </span>
        </div>

        <div className="min-w-0 border-t border-slate-200/60 pt-1.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">
            Vencimiento:
          </span>
          <span
            className={`font-mono font-bold text-xs block ${
              isExpired
                ? 'text-rose-700'
                : isNearExpiry
                ? 'text-amber-700'
                : 'text-slate-700'
            }`}
          >
            {expirationStr}
          </span>
        </div>
      </div>

      {/* 4. Action & Price Bar */}
      <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-100">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">
            Precio Venta:
          </span>
          <span className="font-mono font-black text-slate-900 text-sm">
            ${(product.salePrice ?? 0).toLocaleString('es-AR')}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            onAdjustStock(product);
          }}
          className="btn-physical btn-physical-teal px-3.5 py-2 text-white font-black text-xs rounded-xl min-h-[44px] flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
        >
          <Package className="w-3.5 h-3.5" />
          <span>Ajustar / Reponer</span>
        </button>
      </div>
    </article>
  );
};
