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
  ShieldAlert,
  BookOpen,
  Printer,
  History,
  FileCheck,
  MapPin,
  Clock,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Product, InventoryMovement, SENASACategory } from '../types';
import { formatExpirationDate, formatDate, formatDateTime } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PharmacyMobileCard } from './PharmacyMobileCard';
import { PageHeader, StatCard, EmptyState, StatusBadge, SearchInput, FilterBar } from './ui';

export const InventoryView: React.FC = () => {
  const {
    products,
    inventoryMovements,
    updateProduct,
    updateProductStock,
    setQuickModal,
    activeBranch,
    showToast,
  } = useVet();

  const [activeTab, setActiveTab] = useState<'CATALOGO' | 'PSICOTROPICOS' | 'KARDEX'>('CATALOGO');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODOS');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  // Stock Adjustment Modal
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [stockReason, setStockReason] = useState('Ingreso de compra a proveedor');
  const [movementType, setMovementType] = useState<InventoryMovement['type']>('ENTRADA');

  // Edit Product Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editCostPrice, setEditCostPrice] = useState(0);
  const [editSalePrice, setEditSalePrice] = useState(0);
  const [editMinStock, setEditMinStock] = useState(5);
  const [editLocation, setEditLocation] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editExpDate, setEditExpDate] = useState('');

  const filtered = products.filter((p) => {
    const q = (search || '').toLowerCase().trim();
    const name = (p.commercialName || '').toLowerCase();
    const active = (p.activeIngredient || '').toLowerCase();
    const code = (p.code || '').toLowerCase();
    const batch = (p.currentBatch || '').toLowerCase();
    const lab = (p.laboratory || '').toLowerCase();
    const loc = (p.location || '').toLowerCase();

    const matchesSearch =
      !q ||
      name.includes(q) ||
      active.includes(q) ||
      code.includes(q) ||
      batch.includes(q) ||
      lab.includes(q) ||
      loc.includes(q);

    const matchesCategory =
      categoryFilter === 'TODOS' ||
      p.category === categoryFilter ||
      (categoryFilter === 'FARMACO' && (p.category === 'MEDICAMENTO' || p.category === 'PSICOTROPICO' || p.category === 'ESTUPEFACIENTE'));

    const isCritical = (p.currentStock ?? 0) <= (p.minStock ?? 0);
    const matchesCritical = filterCriticalOnly ? isCritical : true;

    return matchesSearch && matchesCategory && matchesCritical;
  });

  const psychotropicProducts = products.filter(
    (p) =>
      p.isPsychotropic ||
      p.isNarcotic ||
      p.category === 'PSICOTROPICO' ||
      p.category === 'ESTUPEFACIENTE' ||
      p.requiresOfficialArchive
  );

  // Helper FEFO Expiration Status
  const getExpirationStatus = (expDate?: string) => {
    if (!expDate) return { label: 'Sin vencimiento', color: 'bg-slate-100 text-slate-600', isExpiringSoon: false, isExpired: false };
    const exp = new Date(expDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.round((exp - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `VENCIDO (${Math.abs(diffDays)}d)`, color: 'bg-rose-100 text-rose-900 border border-rose-300 font-black', isExpiringSoon: true, isExpired: true };
    }
    if (diffDays <= 30) {
      return { label: `Vence en ${diffDays}d (Crítico)`, color: 'bg-rose-50 text-rose-800 border border-rose-200 font-bold', isExpiringSoon: true, isExpired: false };
    }
    if (diffDays <= 60) {
      return { label: `Vence en ${diffDays}d (FEFO)`, color: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold', isExpiringSoon: true, isExpired: false };
    }
    return { label: `Vence: ${expDate}`, color: 'bg-slate-50 text-slate-600 border border-slate-200', isExpiringSoon: false, isExpired: false };
  };

  const lowStockCount = products.filter((p) => (p.currentStock || 0) <= (p.minStock || 0)).length;
  const expiringSoonCount = products.filter((p) => getExpirationStatus(p.expirationDate).isExpiringSoon).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
  const totalCostValuation = products.reduce((acc, p) => acc + (p.currentStock || 0) * (p.costPrice || 0), 0);
  const totalSaleValuation = products.reduce((acc, p) => acc + (p.currentStock || 0) * (p.salePrice || 0), 0);

  const handleSaveStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalProduct || stockAdjustment === 0) return;
    triggerHaptic('medium');

    updateProductStock(
      stockModalProduct.id,
      stockAdjustment,
      movementType,
      stockReason
    );

    setStockModalProduct(null);
    setStockAdjustment(0);
  };

  const handleOpenEditProduct = (prod: Product) => {
    triggerHaptic('light');
    setEditingProduct(prod);
    setEditCostPrice(prod.costPrice || 0);
    setEditSalePrice(prod.salePrice || 0);
    setEditMinStock(prod.minStock || 5);
    setEditLocation(prod.location || '');
    setEditBatch(prod.currentBatch || '');
    setEditExpDate(prod.expirationDate || '');
  };

  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    triggerHaptic('medium');

    updateProduct(editingProduct.id, {
      costPrice: Number(editCostPrice),
      salePrice: Number(editSalePrice),
      minStock: Number(editMinStock),
      location: editLocation,
      currentBatch: editBatch,
      expirationDate: editExpDate,
    });

    setEditingProduct(null);
    showToast('success', 'Fármaco Actualizado', 'Modificaciones guardadas en ' + editingProduct.commercialName);
  };

  const categoryOptions = [
    { id: 'TODOS', label: 'Todos los Artículos', badge: products.length },
    { id: 'MEDICAMENTO', label: '💊 Medicamentos', badge: products.filter((p) => p.category === 'MEDICAMENTO').length },
    { id: 'VACUNA', label: '💉 Biológicos / Vacunas', badge: products.filter((p) => p.category === 'VACUNA').length },
    { id: 'PSICOTROPICO', label: '🔒 Psicotrópicos', badge: products.filter((p) => p.category === 'PSICOTROPICO' || p.isPsychotropic).length },
    { id: 'INSUMO_QUIRURGICO', label: '✂️ Insumos Quirúrgicos', badge: products.filter((p) => p.category === 'INSUMO_QUIRURGICO').length },
    { id: 'DESCARTABLE', label: '📦 Descartables', badge: products.filter((p) => p.category === 'DESCARTABLE').length },
    { id: 'ALIMENTO', label: '🥩 Dietas & Alimentos', badge: products.filter((p) => p.category === 'ALIMENTO').length },
  ];

  return (
    <div className="space-y-5 pb-16 w-full max-w-full">
      {/* 1. Header */}
      <PageHeader
        category="Farmacia Hospitalaria, Insumos & Trazabilidad SENASA"
        title="Farmacia, Medicamentos & Control de Stock"
        description="Inventario hospitalario, lotes, vencimientos, libro digital de psicotrópicos y kardex de movimientos"
        icon={Boxes}
        badge={
          lowStockCount > 0 ? (
            <StatusBadge label={'⚠️ ' + lowStockCount + ' Stock Crítico'} variant="danger" pulse />
          ) : undefined
        }
        actions={[
          {
            label: 'Nuevo Fármaco / Insumo',
            icon: Plus,
            onClick: () => setQuickModal('NUEVO_PRODUCTO'),
            variant: 'primary',
          },
        ]}
      />

      {/* 2. Top Navigation Tabs - Horizontally Scrollable on Mobile */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth border-b border-slate-200 pb-2.5 -mx-1 px-1 sm:mx-0 sm:px-0 w-full flex-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('CATALOGO')}
          className={'px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap min-h-[40px] touch-manipulation ' +
            (activeTab === 'CATALOGO'
              ? 'bg-teal-700 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50')}
        >
          <Package className="w-4 h-4" />
          <span>Inventario General ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('PSICOTROPICOS')}
          className={'px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap min-h-[40px] touch-manipulation ' +
            (activeTab === 'PSICOTROPICOS'
              ? 'bg-purple-700 text-white shadow-2xs'
              : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100')}
        >
          <ShieldAlert className="w-4 h-4 text-purple-500" />
          <span>Libro Psicotrópicos & Estupefacientes ({psychotropicProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('KARDEX')}
          className={'px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap min-h-[40px] touch-manipulation ' +
            (activeTab === 'KARDEX'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50')}
        >
          <History className="w-4 h-4" />
          <span>Kardex / Movimientos ({inventoryMovements.length})</span>
        </button>
      </div>

      {/* 3. Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
        <StatCard
          title="Total en Catálogo"
          value={products.length.toString()}
          subtitle={totalStockUnits + ' unidades físicas disponibles'}
          icon={Package}
          variant="teal"
        />

        <StatCard
          title="Valoración del Stock"
          value={'$' + totalSaleValuation.toLocaleString('es-AR')}
          subtitle={'Costo: $' + totalCostValuation.toLocaleString('es-AR') + ' | Margen activo'}
          icon={DollarSign}
          variant="emerald"
        />

        <StatCard
          title="Alertas de Reposición"
          value={lowStockCount + ' críticos'}
          subtitle={lowStockCount > 0 ? 'Requieren orden de compra urgente' : 'Nivel de existencias óptimo'}
          icon={AlertTriangle}
          variant={lowStockCount > 0 ? 'rose' : 'slate'}
        />

        <StatCard
          title="Control FEFO / Vencimientos"
          value={expiringSoonCount + ' lotes'}
          subtitle={expiringSoonCount > 0 ? 'Lotes por vencer (<60d) o vencidos' : 'Sin alertas de vencimiento'}
          icon={Clock}
          variant={expiringSoonCount > 0 ? 'amber' : 'slate'}
        />
      </div>

      {/* 4. Tab 1: Inventario General */}
      {activeTab === 'CATALOGO' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs space-y-3 w-full max-w-full">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por nombre comercial, principio activo, código, lote o laboratorio..."
            />

            <FilterBar
              options={categoryOptions}
              activeId={categoryFilter}
              onSelect={setCategoryFilter}
              label="Categoría de Farmacia"
            />

            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setFilterCriticalOnly(!filterCriticalOnly);
                }}
                className={'px-3 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[34px] flex items-center gap-1.5 ' +
                  (filterCriticalOnly
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100')}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Mostrar solo Stock Crítico ({lowStockCount})</span>
              </button>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden space-y-3 w-full max-w-full">
            {filtered.length === 0 ? (
              <EmptyState
                icon={Boxes}
                title="No se encontraron productos"
                description="No hay medicamentos ni insumos que coincidan con los filtros seleccionados."
                actionLabel="Registrar Nuevo Fármaco"
                onAction={() => setQuickModal('NUEVO_PRODUCTO')}
              />
            ) : (
              filtered.map((prod) => (
                <PharmacyMobileCard
                  key={prod.id}
                  product={prod}
                  onAdjustStock={(p) => {
                    setStockModalProduct(p);
                    setStockAdjustment(0);
                  }}
                  onEditProduct={handleOpenEditProduct}
                />
              ))
            )}
          </div>

          {/* Desktop / Tablet Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left text-slate-700 min-w-[750px]">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Código</th>
                    <th className="p-3.5">Producto & Principio Activo</th>
                    <th className="p-3.5">Categoría</th>
                    <th className="p-3.5">Ubicación / Lote</th>
                    <th className="p-3.5">Stock Actual</th>
                    <th className="p-3.5">Costo / Venta</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((prod) => {
                    const isCritical = (prod.currentStock ?? 0) <= (prod.minStock ?? 0);
                    const isOutOfStock = (prod.currentStock ?? 0) <= 0;
                    const expirationFormatted = formatExpirationDate(prod.expirationDate);
                    const isControlled = prod.isPsychotropic || prod.isNarcotic || prod.category === 'PSICOTROPICO' || prod.category === 'ESTUPEFACIENTE';

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-mono text-[11px] font-bold text-slate-600 whitespace-nowrap">
                          {prod.code}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-xs">{prod.commercialName}</span>
                            {isControlled && (
                              <span className="text-[9px] font-black bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded border border-purple-300">
                                🔒 CONTROLADO
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-teal-700 font-semibold block">{prod.activeIngredient} ({prod.concentration || 'Std'})</span>
                          <span className="text-[10px] text-slate-400 font-medium">Fab: {prod.laboratory || 'Laboratorio Vet'}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 uppercase whitespace-nowrap">
                            {prod.category}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <span className="text-slate-800 block font-bold whitespace-nowrap">
                            📍 {prod.location || 'Estante Principal'}
                          </span>
                          <span className="text-slate-500 text-[10px] whitespace-nowrap">
                            Lote: {prod.currentBatch || 'L-GEN'} • Vence: {expirationFormatted}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span
                              className={'text-sm font-black ' +
                                (isOutOfStock
                                  ? 'text-rose-700'
                                  : isCritical
                                  ? 'text-amber-700 animate-pulse'
                                  : 'text-slate-900')}
                            >
                              {prod.currentStock ?? 0} {prod.presentation || 'uds'}
                            </span>
                            <span className="text-[10px] text-slate-400">(Mín: {prod.minStock ?? 0})</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                          <span className="font-black text-slate-900 block">${(prod.salePrice ?? 0).toLocaleString('es-AR')}</span>
                          <span className="text-[10px] text-slate-400">Costo: ${(prod.costPrice ?? 0).toLocaleString('es-AR')}</span>
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Editar precios, ubicación o lote"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('medium');
                                setStockModalProduct(prod);
                                setStockAdjustment(0);
                              }}
                              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl text-xs transition-colors border border-teal-200"
                            >
                              Ajustar / Reponer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Libro de Psicotrópicos & Estupefacientes */}
      {activeTab === 'PSICOTROPICOS' && (
        <div className="space-y-4 bg-white border border-purple-200 rounded-3xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-700" />
                <h3 className="text-base font-black text-slate-900">
                  Libro Oficial de Psicotrópicos, Estupefacientes & Precursores (SENASA / Ley 17.818)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Control estricto de entrada, recetas archivadas, libro foliado y balance de sustancias controladas (Ketamina, Fentanilo, Tramadol, Diazepam, Euthanásicos).
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-purple-300"
            >
              <Printer className="w-4 h-4 text-purple-700" />
              <span>Imprimir Folio Oficial</span>
            </button>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-xs text-left text-slate-800">
              <thead className="bg-purple-50/80 text-purple-900 uppercase text-[10px] font-bold border-b border-purple-200">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Sustancia Controlada</th>
                  <th className="p-3">Concentración</th>
                  <th className="p-3">Lote Oficial</th>
                  <th className="p-3">Ubicación de Seguridad</th>
                  <th className="p-3">Existencia Física</th>
                  <th className="p-3 text-right">Auditoría</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-100 font-mono">
                {psychotropicProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-purple-50/40">
                    <td className="p-3 font-bold text-purple-900">{prod.code}</td>
                    <td className="p-3 font-sans">
                      <strong className="text-slate-900 block">{prod.commercialName}</strong>
                      <span className="text-purple-700 text-[11px] font-bold">{prod.activeIngredient}</span>
                    </td>
                    <td className="p-3">{prod.concentration || '100 mg/mL'}</td>
                    <td className="p-3 text-slate-700 font-bold">{prod.currentBatch || 'LT-SEG-01'}</td>
                    <td className="p-3 font-sans">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200 text-[11px]">
                        🔒 {prod.location || 'Caja Fuerte / Armario Clave'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="font-black text-sm text-purple-950 bg-purple-100 px-2 py-0.5 rounded">
                        {prod.currentStock} {prod.presentation || 'ampollas'}
                      </span>
                    </td>
                    <td className="p-3 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          setStockModalProduct(prod);
                          setStockAdjustment(0);
                          setStockReason('Dispensación con receta archivada');
                        }}
                        className="px-3 py-1 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-lg text-xs"
                      >
                        Registrar Acta
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Kardex & Historial de Movimientos */}
      {activeTab === 'KARDEX' && (
        <div className="space-y-4 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-black text-slate-900">
                Kardex Digital & Trazabilidad de Movimientos ({inventoryMovements.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">Registro inmutable de auditoría</span>
          </div>

          {inventoryMovements.length === 0 ? (
            <EmptyState
              icon={History}
              title="No hay movimientos registrados en el Kardex"
              description="A medida que se realicen compras, ventas, aplicaciones clínicas o mermas, se registrarán aquí."
            />
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left text-slate-800">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Fecha / Hora</th>
                    <th className="p-3">Producto</th>
                    <th className="p-3">Tipo de Operación</th>
                    <th className="p-3">Cantidad</th>
                    <th className="p-3">Stock Resultante</th>
                    <th className="p-3">Motivo / Referencia</th>
                    <th className="p-3 text-right">Operador</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {inventoryMovements.map((mov) => {
                    const isPositive = mov.quantity > 0;
                    return (
                      <tr key={mov.id} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap">
                          {formatDateTime(mov.timestamp)}
                        </td>
                        <td className="p-3 font-sans font-bold text-slate-900">{mov.productName}</td>
                        <td className="p-3 font-sans">
                          <span
                            className={'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ' +
                              (isPositive
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200')}
                          >
                            {mov.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-sm">
                          <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                            {isPositive ? '+' : ''}{mov.quantity}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 font-bold">{mov.newStock} uds</td>
                        <td className="p-3 font-sans text-slate-600 text-xs">{mov.reason}</td>
                        <td className="p-3 font-sans text-right text-slate-800 font-bold">{mov.performedBy}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 7. Stock Adjustment Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">{stockModalProduct.commercialName}</h3>
                <span className="text-xs text-teal-700 font-mono font-bold">
                  Stock actual: {stockModalProduct.currentStock} {stockModalProduct.presentation || 'uds'}
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
                <label className="font-bold text-slate-700 block mb-1">Tipo de Movimiento:</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                >
                  <option value="ENTRADA">📦 Entrada de Mercadería / Proveedor (+)</option>
                  <option value="VENTA">🛒 Venta en Mostrador (-)</option>
                  <option value="USO_CONSULTA">🩺 Uso en Consulta / Procedimiento (-)</option>
                  <option value="USO_INTERNACION">🏥 Consumo en Internación (-)</option>
                  <option value="CIRUGIA">✂️ Consumo en Quirófano (-)</option>
                  <option value="AJUSTE">🔄 Ajuste de Inventario / Conteo Físico</option>
                  <option value="VENCIMIENTO">⚠️ Merma por Vencimiento / Daño (-)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Cantidad a ingresar (+) o descontar (-):
                </label>
                <input
                  type="number"
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(Number(e.target.value))}
                  placeholder="Ej: 20 para ingresar, -5 para merma"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 text-base focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  Nuevo stock resultante:{' '}
                  <strong className="text-teal-900 font-mono text-sm">
                    {Math.max(0, (stockModalProduct.currentStock || 0) + Number(stockAdjustment))} {stockModalProduct.presentation || 'uds'}
                  </strong>
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo / Número de Factura o Receta:</label>
                <input
                  type="text"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-teal-500"
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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all"
                >
                  Confirmar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">{editingProduct.commercialName}</h3>
                <span className="text-xs text-slate-500 font-mono">{editingProduct.code}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Costo ($):</label>
                  <input
                    type="number"
                    value={editCostPrice}
                    onChange={(e) => setEditCostPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Venta ($):</label>
                  <input
                    type="number"
                    value={editSalePrice}
                    onChange={(e) => setEditSalePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Mínimo Alerta:</label>
                  <input
                    type="number"
                    value={editMinStock}
                    onChange={(e) => setEditMinStock(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ubicación Física:</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    placeholder="Ej: Estante B-4"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Lote Actual:</label>
                  <input
                    type="text"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha Vencimiento:</label>
                  <input
                    type="date"
                    value={editExpDate}
                    onChange={(e) => setEditExpDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
