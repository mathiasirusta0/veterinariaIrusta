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
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { InventoryMovement } from '../types';

export const InventoryView: React.FC = () => {
  const { products, updateProductStock, setQuickModal, activeBranch, showToast } = useVet();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODOS');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  // Stock Adjustment Modal
  const [stockModalProduct, setStockModalProduct] = useState<any | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [stockReason, setStockReason] = useState('Ingreso de compra a proveedor');

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.commercialName.toLowerCase().includes(q) ||
      p.activeIngredient.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'TODOS' || p.category === categoryFilter;
    const matchesCritical = filterCriticalOnly ? p.currentStock <= p.minStock : true;
    return matchesSearch && matchesCategory && matchesCritical;
  });

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;
  const totalStockUnits = products.reduce((acc, p) => acc + p.currentStock, 0);
  const totalStockValuation = products.reduce((acc, p) => acc + p.currentStock * p.salePrice, 0);

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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Farmacia Hospitalaria & Logística
            </span>
            {lowStockCount > 0 && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 animate-pulse">
                ⚠️ {lowStockCount} Productos con Stock Crítico
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-6 h-6 text-teal-600" />
            <span>Farmacia, Medicamentos & Stock</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Control de insumos, lotes, vencimientos, trazabilidad y consumo automático en internación
          </p>
        </div>

        <button
          onClick={() => setQuickModal('NUEVO_PRODUCTO')}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto / Fármaco</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Productos en Catálogo</span>
            <span className="text-xl font-black text-slate-900 font-mono">{products.length} ({totalStockUnits} uds)</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Valoración de Stock (Venta)</span>
            <span className="text-xl font-black text-emerald-700 font-mono">${totalStockValuation.toLocaleString('es-AR')}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${lowStockCount > 0 ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Alertas de Reposición</span>
            <span className={`text-xl font-black font-mono ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-900'}`}>{lowStockCount} críticos</span>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre comercial, principio activo, código de barra..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="TODOS">Todas las Categorías</option>
          <option value="FARMACO">Fármaco / Medicamento</option>
          <option value="VACUNA">Vacuna / Biológico</option>
          <option value="DESCARTABLE">Descartable / Insumo</option>
          <option value="ALIMENTO">Alimento / Nutrición</option>
          <option value="ESTUDIO">Estudio / Servicio</option>
        </select>

        <button
          onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            filterCriticalOnly
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          ⚠️ Solo Stock Crítico ({lowStockCount})
        </button>
      </div>

      {/* Table of Products */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Código</th>
                <th className="p-3.5">Nombre Comercial & Principio Activo</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Lote & Vencimiento</th>
                <th className="p-3.5">Stock Actual</th>
                <th className="p-3.5">Precio Venta</th>
                <th className="p-3.5 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => {
                const isCritical = prod.currentStock <= prod.minStock;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] font-bold text-slate-500">{prod.code}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block text-xs">{prod.commercialName}</span>
                      <span className="text-[11px] text-teal-700 font-semibold">{prod.activeIngredient}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <span className="text-slate-700 block font-bold">Lote: {prod.batchNumber || 'N/A'}</span>
                      <span className="text-slate-400 text-[10px]">Vence: {prod.expirationDate || 'N/A'}</span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className={`text-sm font-black ${isCritical ? 'text-red-600 font-black animate-pulse' : 'text-slate-900'}`}>
                          {prod.currentStock} {prod.presentationUnit}
                        </span>
                        <span className="text-[10px] text-slate-400">(Mín: {prod.minStock})</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">${prod.salePrice.toLocaleString('es-AR')}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setStockModalProduct(prod)}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl text-xs transition-colors border border-teal-200"
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

      {/* Stock Adjustment Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{stockModalProduct.commercialName}</h3>
                <span className="text-xs text-teal-700 font-mono">Stock actual: {stockModalProduct.currentStock} {stockModalProduct.presentationUnit}</span>
              </div>
              <button
                onClick={() => setStockModalProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
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
                  Nuevo stock resultante: <strong>{stockModalProduct.currentStock + stockAdjustment} {stockModalProduct.presentationUnit}</strong>
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
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md"
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
