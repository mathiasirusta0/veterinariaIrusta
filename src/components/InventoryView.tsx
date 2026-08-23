import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  Pill,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Building2,
  DollarSign,
  Package,
  Filter,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Product, InventoryMovement } from '../types';
import { formatExpirationDate } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PharmacyMobileCard } from './PharmacyMobileCard';

export const InventoryView: React.FC = () => {
  const { products, updateProductStock, setQuickModal, activeBranch, showToast } = useVet();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODOS');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  // Stock Adjustment Modal
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [stockReason, setStockReason] = useState('Ingreso de compra a proveedor');

  const filtered = products.filter((p) => {
    const q = (search || '').toLowerCase().trim();
    const name = (p.commercialName || '').toLowerCase();
    const active = (p.activeIngredient || '').toLowerCase();
    const code = (p.code || '').toLowerCase();
    const batch = ((p.currentBatch || (p as any).batchNumber || '') as string).toLowerCase();
    const matchesSearch = !q || name.includes(q) || active.includes(q) || code.includes(q) || batch.includes(q);
    const matchesCategory =
      categoryFilter === 'TODOS' ||
      p.category === categoryFilter ||
      (categoryFilter === 'FARMACO' && (p.category === 'MEDICAMENTO' || p.category === 'FARMACO')) ||
      (categoryFilter === 'MEDICAMENTO' && (p.category === 'MEDICAMENTO' || p.category === 'FARMACO'));
    const matchesCritical = filterCriticalOnly ? (p.currentStock ?? 0) <= (p.minStock ?? 0) : true;
    return matchesSearch && matchesCategory && matchesCritical;
  });

  const lowStockCount = products.filter((p) => (p.currentStock || 0) <= (p.minStock || 0)).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
  const totalStockValuation = products.reduce((acc, p) => acc + (p.currentStock || 0) * (p.salePrice || 0), 0);

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct || stockAdjustment === 0) return;
    updateProductStock(
      stockModalProduct.id,
      stockAdjustment,
      stockAdjustment > 0 ? 'COMPRA_INGRESO' : 'AJUSTE_MANUAL',
      stockReason
    );
    showToast(
      'success',
      'Stock Actualizado',
      `${stockModalProduct.commercialName}: ${stockAdjustment > 0 ? `+${stockAdjustment}` : stockAdjustment} unidades.`
    );
    setStockModalProduct(null);
    setStockAdjustment(0);
  };

  return (
    <div className="space-y-5 pb-2 w-full max-w-full">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-4 sm:p-5 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Farmacia Hospitalaria & Logística
            </span>
            {lowStockCount > 0 && (
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 animate-pulse">
                ⚠️ {lowStockCount} Stock Crítico
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-teal-600 flex-shrink-0" />
            <span>Farmacia, Medicamentos & Stock</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Control de insumos, lotes, vencimientos, trazabilidad y consumo automático en internación
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            setQuickModal('NUEVO_PRODUCTO');
          }}
          className="btn-physical btn-physical-teal flex items-center justify-center gap-2 px-4 py-2.5 text-white text-xs font-black rounded-2xl shadow-md shadow-teal-600/20 active:scale-95 transition-all w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>+ Nuevo Producto / Fármaco</span>
        </button>
      </div>

      {/* 2. Metrics Bar (Fluid Responsive Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-700 font-bold flex-shrink-0">
            <Package className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">Total en Catálogo</span>
            <span className="text-lg sm:text-xl font-black text-slate-900 font-mono block">
              {products.length} ({totalStockUnits} uds)
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">Valoración Stock</span>
            <span className="text-lg sm:text-xl font-black text-emerald-700 font-mono block">
              ${totalStockValuation.toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold flex-shrink-0 ${lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">Alertas de Reposición</span>
            <span className={`text-lg sm:text-xl font-black font-mono block ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>
              {lowStockCount} críticos
            </span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-sm space-y-3 w-full max-w-full">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar medicamento, código o lote..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          />
        </div>

        {/* Filter Chips / Categories */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'MEDICAMENTO', label: '💊 Medicamentos' },
            { id: 'VACUNA', label: '💉 Biológicos' },
            { id: 'DESCARTABLE', label: '📦 Descartables' },
            { id: 'ALIMENTO', label: '🥩 Nutrición' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setCategoryFilter(cat.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs touch-manipulation min-h-[32px] ${
                categoryFilter === cat.id
                  ? 'bg-teal-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setFilterCriticalOnly(!filterCriticalOnly);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all touch-manipulation min-h-[32px] flex items-center gap-1 ${
              filterCriticalOnly
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            }`}
          >
            <span>⚠️ Stock Crítico ({lowStockCount})</span>
          </button>
        </div>
      </div>

      {/* 4. THREE-TIER RESPONSIVE PRESENTATION */}

      {/* TIER 1: MÓVIL (< md / < 768px) — Cards Responsivas */}
      <div className="block md:hidden space-y-3 w-full max-w-full">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs">
            No se encontraron medicamentos o insumos que coincidan con la búsqueda.
          </div>
        ) : (
          filtered.map((prod) => (
            <PharmacyMobileCard
              key={prod.id}
              product={prod}
              onAdjustStock={(p) => setStockModalProduct(p)}
            />
          ))
        )}
      </div>

      {/* TIER 2 & 3: TABLET & DESKTOP (>= md / >= 768px) — Tabla Responsive */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-xs text-left text-slate-700 min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Código</th>
                <th className="p-3.5">Producto & Principio Activo</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Lote & Vencimiento</th>
                <th className="p-3.5">Stock Actual</th>
                <th className="p-3.5">Precio Venta</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => {
                const isCritical = (prod.currentStock ?? 0) <= (prod.minStock ?? 0);
                const isOutOfStock = (prod.currentStock ?? 0) <= 0;
                const expirationFormatted = formatExpirationDate(prod.expirationDate);

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] font-bold text-slate-600 whitespace-nowrap">
                      {prod.code}
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block text-xs">{prod.commercialName}</span>
                      <span className="text-[11px] text-teal-700 font-semibold">{prod.activeIngredient}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 uppercase whitespace-nowrap">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <span className="text-slate-700 block font-bold whitespace-nowrap">
                        Lote: {prod.currentBatch || (prod as any).batchNumber || 'N/A'}
                      </span>
                      <span className="text-slate-500 text-[10px] whitespace-nowrap">
                        Vence: {expirationFormatted}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span
                          className={`text-sm font-black ${
                            isOutOfStock
                              ? 'text-rose-700'
                              : isCritical
                              ? 'text-amber-700 animate-pulse'
                              : 'text-slate-900'
                          }`}
                        >
                          {prod.currentStock ?? 0} {prod.presentation || (prod as any).presentationUnit || 'uds'}
                        </span>
                        <span className="text-[10px] text-slate-400">(Mín: {prod.minStock ?? 0})</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                      ${(prod.salePrice ?? 0).toLocaleString('es-AR')}
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('medium');
                          setStockModalProduct(prod);
                        }}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl text-xs transition-colors border border-teal-200 whitespace-nowrap"
                      >
                        Ajustar / Reponer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Stock Adjustment Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{stockModalProduct.commercialName}</h3>
                <span className="text-xs text-teal-700 font-mono">
                  Stock actual: {stockModalProduct.currentStock} {stockModalProduct.presentation}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStockModalProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Cantidad a ingresar (+) o egresar (-):
                </label>
                <input
                  type="number"
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(Number(e.target.value))}
                  placeholder="Ej: 20 para ingresar, -5 para merma"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 text-base"
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Nuevo stock resultante:{' '}
                  <strong>
                    {(stockModalProduct.currentStock || 0) + stockAdjustment} {stockModalProduct.presentation}
                  </strong>
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo del Ajuste:</label>
                <input
                  type="text"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold text-slate-900"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-physical btn-physical-teal px-4 py-2 text-white font-black rounded-xl shadow-md"
                >
                  Confirmar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
