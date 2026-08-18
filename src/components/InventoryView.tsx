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
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const InventoryView: React.FC = () => {
  const { products, updateProductStock, setQuickModal, activeBranch } = useVet();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODOS');
  const [stockModalProduct, setStockModalProduct] = useState<any | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [stockReason, setStockReason] = useState('Ajuste de inventario');

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.commercialName.toLowerCase().includes(q) ||
      p.activeIngredient.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'TODOS' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct || stockAdjustment === 0) return;
    updateProductStock(
      stockModalProduct.id,
      stockAdjustment,
      stockAdjustment > 0 ? 'COMPRA_INGRESO' : 'AJUSTE_MANUAL',
      stockReason
    );
    setStockModalProduct(null);
    setStockAdjustment(0);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase text-slate-500">Sucursal: {activeBranch.name}</span>
            {lowStockCount > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 animate-pulse">
                ⚠️ {lowStockCount} Productos con Stock Crítico
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-600" />
            <span>Farmacia, Medicamentos & Stock</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Control de insumos, lotes, vencimientos, trazabilidad y consumo automático en internación
          </p>
        </div>

        <button
          onClick={() => setQuickModal('NUEVO_PRODUCTO')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto / Fármaco</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre comercial, principio activo, código de barra..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="TODOS">Todas las Categorías</option>
          <option value="FARMACO">Fármaco / Medicamento</option>
          <option value="VACUNA">Vacuna / Biológico</option>
          <option value="DESCARTABLE">Descartable / Insumo</option>
          <option value="ALIMENTO">Alimento / Nutrición</option>
          <option value="ESTUDIO">Estudio / Servicio</option>
        </select>
      </div>

      {/* Table of Products */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-700">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3">Código</th>
                <th className="p-3">Nombre Comercial & Principio Activo</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Lote & Vencimiento</th>
                <th className="p-3">Stock Actual</th>
                <th className="p-3">Precio Venta</th>
                <th className="p-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((prod) => {
                const isCriticalStock = prod.currentStock <= prod.minStock;

                return (
                  <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{prod.code}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900 text-sm">{prod.commercialName}</div>
                      <div className="text-slate-500 text-xs">
                        {prod.activeIngredient} • {prod.concentration}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {prod.category}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      <div>Lote: {prod.currentBatch}</div>
                      <div className="text-slate-400 text-[11px]">Vence: {prod.expirationDate}</div>
                    </td>
                    <td className="p-3">
                      <div
                        className={`text-sm font-black ${
                          isCriticalStock ? 'text-red-600' : 'text-teal-700'
                        }`}
                      >
                        {prod.currentStock} {prod.unit}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Mín: {prod.minStock} {prod.unit}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-900 text-sm font-mono">
                      ${prod.salePrice.toLocaleString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setStockModalProduct(prod)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
                      >
                        Ajustar Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Ajuste de Stock: {stockModalProduct.commercialName}
            </h3>

            <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p>
                Stock actual:{' '}
                <span className="font-bold text-slate-900">
                  {stockModalProduct.currentStock} {stockModalProduct.unit}
                </span>
              </p>
              <p>
                Stock mínimo:{' '}
                <span className="font-bold text-slate-500">
                  {stockModalProduct.minStock} {stockModalProduct.unit}
                </span>
              </p>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 block font-bold mb-1">
                  Cantidad a sumar (+) o restar (-):
                </label>
                <input
                  type="number"
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(Number(e.target.value))}
                  placeholder="ej: +10 o -2"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Motivo del Movimiento:</label>
                <input
                  type="text"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  placeholder="ej: Ingreso de proveedor, Ajuste por rotura, etc."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-sm"
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
