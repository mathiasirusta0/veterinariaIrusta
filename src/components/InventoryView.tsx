import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  Pill,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Package,
  ShieldAlert,
  Printer,
  History,
  MapPin,
  Clock,
  Sparkles,
  Edit3,
  Trash2,
  CheckCircle2,
  TrendingUp,
  X,
  Layers,
  Scissors,
  Syringe,
  Utensils,
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
    addProduct,
    updateProduct,
    updateProductStock,
    deleteProduct,
    showToast,
  } = useVet();

  const [activeTab, setActiveTab] = useState<'CATALOGO' | 'PSICOTROPICOS' | 'KARDEX'>('CATALOGO');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('TODOS');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);

  // New Product Modal State
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdActiveIngredient, setNewProdActiveIngredient] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<Product['category']>('MEDICAMENTO');
  const [newProdConcentration, setNewProdConcentration] = useState('');
  const [newProdPresentation, setNewProdPresentation] = useState('Frasco / Unidad');
  const [newProdLaboratory, setNewProdLaboratory] = useState('');
  const [newProdSupplier, setNewProdSupplier] = useState('');
  const [newProdLocation, setNewProdLocation] = useState('Estante Principal');
  const [newProdBatch, setNewProdBatch] = useState('');
  const [newProdExpDate, setNewProdExpDate] = useState('');
  const [newProdStock, setNewProdStock] = useState<number>(10);
  const [newProdMinStock, setNewProdMinStock] = useState<number>(5);
  const [newProdCostPrice, setNewProdCostPrice] = useState<number>(0);
  const [newProdSalePrice, setNewProdSalePrice] = useState<number>(0);
  const [newProdIsPsychotropic, setNewProdIsPsychotropic] = useState(false);

  // Stock Adjustment Modal
  const [stockModalProduct, setStockModalProduct] = useState<Product | null>(null);
  const [stockAdjustment, setStockAdjustment] = useState<number>(0);
  const [stockReason, setStockReason] = useState('Ingreso de compra a proveedor');
  const [movementType, setMovementType] = useState<InventoryMovement['type']>('ENTRADA');

  // Edit Product Modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState('');
  const [editActiveIngredient, setEditActiveIngredient] = useState('');
  const [editCategory, setEditCategory] = useState<Product['category']>('MEDICAMENTO');
  const [editConcentration, setEditConcentration] = useState('');
  const [editPresentation, setEditPresentation] = useState('');
  const [editLaboratory, setEditLaboratory] = useState('');
  const [editSupplier, setEditSupplier] = useState('');
  const [editCostPrice, setEditCostPrice] = useState(0);
  const [editSalePrice, setEditSalePrice] = useState(0);
  const [editMinStock, setEditMinStock] = useState(5);
  const [editLocation, setEditLocation] = useState('');
  const [editBatch, setEditBatch] = useState('');
  const [editExpDate, setEditExpDate] = useState('');
  const [editIsPsychotropic, setEditIsPsychotropic] = useState(false);

  // Delete Confirmation Modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Filtering logic
  const filtered = products.filter((p) => {
    const q = (search || '').toLowerCase().trim();
    const name = (p.commercialName || '').toLowerCase();
    const active = (p.activeIngredient || '').toLowerCase();
    const code = (p.code || '').toLowerCase();
    const batch = (p.currentBatch || '').toLowerCase();
    const lab = (p.laboratory || '').toLowerCase();
    const loc = (p.location || '').toLowerCase();
    const sup = (p.supplier || '').toLowerCase();

    const matchesSearch =
      !q ||
      name.includes(q) ||
      active.includes(q) ||
      code.includes(q) ||
      batch.includes(q) ||
      lab.includes(q) ||
      loc.includes(q) ||
      sup.includes(q);

    const matchesCategory =
      categoryFilter === 'TODOS' ||
      p.category === categoryFilter ||
      (categoryFilter === 'FARMACO' &&
        (p.category === 'MEDICAMENTO' ||
          p.category === 'PSICOTROPICO' ||
          p.category === 'ESTUPEFACIENTE'));

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
    if (!expDate)
      return {
        label: 'Sin vencimiento',
        color: 'bg-slate-100 text-slate-600',
        isExpiringSoon: false,
        isExpired: false,
      };
    const exp = new Date(expDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.round((exp - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: `VENCIDO (${Math.abs(diffDays)}d)`,
        color: 'bg-rose-100 text-rose-900 border border-rose-300 font-black',
        isExpiringSoon: true,
        isExpired: true,
      };
    }
    if (diffDays <= 30) {
      return {
        label: `Vence en ${diffDays}d (Crítico)`,
        color: 'bg-rose-50 text-rose-800 border border-rose-200 font-bold',
        isExpiringSoon: true,
        isExpired: false,
      };
    }
    if (diffDays <= 60) {
      return {
        label: `Vence en ${diffDays}d (FEFO)`,
        color: 'bg-amber-50 text-amber-800 border border-amber-200 font-bold',
        isExpiringSoon: true,
        isExpired: false,
      };
    }
    return {
      label: `Vence: ${expDate}`,
      color: 'bg-slate-50 text-slate-600 border border-slate-200',
      isExpiringSoon: false,
      isExpired: false,
    };
  };

  const lowStockCount = products.filter(
    (p) => (p.currentStock || 0) <= (p.minStock || 0)
  ).length;
  const expiringSoonCount = products.filter(
    (p) => getExpirationStatus(p.expirationDate).isExpiringSoon
  ).length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
  const totalCostValuation = products.reduce(
    (acc, p) => acc + (p.currentStock || 0) * (p.costPrice || 0),
    0
  );
  const totalSaleValuation = products.reduce(
    (acc, p) => acc + (p.currentStock || 0) * (p.salePrice || 0),
    0
  );

  // Handle Create Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      showToast('error', 'Nombre Requerido', 'Por favor ingresá el nombre comercial del producto.');
      return;
    }
    triggerHaptic('medium');

    const prefixMap: Record<string, string> = {
      MEDICAMENTO: 'MED',
      VACUNA: 'VAC',
      INSUMO_QUIRURGICO: 'INS',
      DESCARTABLE: 'DES',
      PSICOTROPICO: 'PSI',
      ESTUPEFACIENTE: 'EST',
      ALIMENTO: 'ALI',
      HIGIENE: 'HIG',
      ACCESORIO: 'ACC',
    };
    const prefix = prefixMap[newProdCategory] || 'FAR';
    const code = `${prefix}-${Math.floor(Math.random() * 9000 + 1000)}`;

    addProduct({
      code,
      commercialName: newProdName.trim(),
      activeIngredient: newProdActiveIngredient.trim() || newProdName.trim(),
      category: newProdCategory,
      concentration: newProdConcentration.trim() || 'Estándar',
      presentation: newProdPresentation.trim() || 'Unidad',
      laboratory: newProdLaboratory.trim() || 'Laboratorio Veterinario',
      supplier: newProdSupplier.trim() || 'Droguería Veterinaria',
      location: newProdLocation.trim() || 'Estante Principal',
      currentBatch: newProdBatch.trim() || 'L-2026',
      expirationDate: newProdExpDate || '2027-12-31',
      currentStock: Number(newProdStock) || 0,
      minStock: Number(newProdMinStock) || 5,
      costPrice: Number(newProdCostPrice) || 0,
      salePrice: Number(newProdSalePrice) || 0,
      isPsychotropic: newProdIsPsychotropic || newProdCategory === 'PSICOTROPICO',
      isNarcotic: newProdCategory === 'ESTUPEFACIENTE',
    });

    // Reset Form
    setNewProdName('');
    setNewProdActiveIngredient('');
    setNewProdCategory('MEDICAMENTO');
    setNewProdConcentration('');
    setNewProdPresentation('Frasco / Unidad');
    setNewProdLaboratory('');
    setNewProdSupplier('');
    setNewProdLocation('Estante Principal');
    setNewProdBatch('');
    setNewProdExpDate('');
    setNewProdStock(10);
    setNewProdMinStock(5);
    setNewProdCostPrice(0);
    setNewProdSalePrice(0);
    setNewProdIsPsychotropic(false);
    setShowNewProductModal(false);
  };

  // Handle Save Stock Adjustment
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

  // Handle Quick Increment / Decrement Pills
  const handleQuickAdjust = (amount: number) => {
    triggerHaptic('light');
    setStockAdjustment((prev) => prev + amount);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (prod: Product) => {
    triggerHaptic('light');
    setEditingProduct(prod);
    setEditName(prod.commercialName || '');
    setEditActiveIngredient(prod.activeIngredient || '');
    setEditCategory(prod.category || 'MEDICAMENTO');
    setEditConcentration(prod.concentration || '');
    setEditPresentation(prod.presentation || '');
    setEditLaboratory(prod.laboratory || '');
    setEditSupplier(prod.supplier || '');
    setEditCostPrice(prod.costPrice || 0);
    setEditSalePrice(prod.salePrice || 0);
    setEditMinStock(prod.minStock || 5);
    setEditLocation(prod.location || '');
    setEditBatch(prod.currentBatch || '');
    setEditExpDate(prod.expirationDate || '');
    setEditIsPsychotropic(!!(prod.isPsychotropic || prod.category === 'PSICOTROPICO'));
  };

  // Save Edit Product
  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    triggerHaptic('medium');

    updateProduct(editingProduct.id, {
      commercialName: editName.trim() || editingProduct.commercialName,
      activeIngredient: editActiveIngredient.trim() || editingProduct.activeIngredient,
      category: editCategory,
      concentration: editConcentration.trim() || editingProduct.concentration,
      presentation: editPresentation.trim() || editingProduct.presentation,
      laboratory: editLaboratory.trim() || editingProduct.laboratory,
      supplier: editSupplier.trim() || editingProduct.supplier,
      costPrice: Number(editCostPrice),
      salePrice: Number(editSalePrice),
      minStock: Number(editMinStock),
      location: editLocation.trim(),
      currentBatch: editBatch.trim(),
      expirationDate: editExpDate,
      isPsychotropic: editIsPsychotropic || editCategory === 'PSICOTROPICO',
    });

    setEditingProduct(null);
    showToast('success', 'Fármaco Actualizado', 'Modificaciones guardadas en ' + editName);
  };

  // Confirm and Execute Delete Product
  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) return;
    triggerHaptic('medium');
    deleteProduct(productToDelete.id);
    setProductToDelete(null);
    if (editingProduct && editingProduct.id === productToDelete.id) {
      setEditingProduct(null);
    }
  };

  // Margin calculation helpers
  const calculateMargin = (cost: number, sale: number) => {
    if (!cost || cost <= 0) return null;
    return Math.round(((sale - cost) / cost) * 100);
  };

  const calculateProfit = (cost: number, sale: number) => {
    return Math.max(0, sale - cost);
  };

  const categoryOptions = [
    { id: 'TODOS', label: 'Todos los Artículos', badge: products.length },
    {
      id: 'MEDICAMENTO',
      label: '💊 Medicamentos',
      badge: products.filter((p) => p.category === 'MEDICAMENTO').length,
    },
    {
      id: 'INSUMO_QUIRURGICO',
      label: '✂️ Insumos Quirúrgicos',
      badge: products.filter((p) => p.category === 'INSUMO_QUIRURGICO').length,
    },
    {
      id: 'DESCARTABLE',
      label: '📦 Descartables',
      badge: products.filter((p) => p.category === 'DESCARTABLE').length,
    },
    {
      id: 'VACUNA',
      label: '💉 Biológicos / Vacunas',
      badge: products.filter((p) => p.category === 'VACUNA').length,
    },
    {
      id: 'PSICOTROPICO',
      label: '🔒 Psicotrópicos',
      badge: products.filter((p) => p.category === 'PSICOTROPICO' || p.isPsychotropic).length,
    },
    {
      id: 'ALIMENTO',
      label: '🥩 Dietas & Alimentos',
      badge: products.filter((p) => p.category === 'ALIMENTO').length,
    },
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
            label: '+ Nuevo Fármaco / Insumo',
            icon: Plus,
            onClick: () => {
              triggerHaptic('light');
              setShowNewProductModal(true);
            },
            variant: 'primary',
          },
        ]}
      />

      {/* 2. Top Navigation Tabs - Horizontally Scrollable on Mobile */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth border-b border-slate-200 pb-2.5 -mx-1 px-1 sm:mx-0 sm:px-0 w-full flex-nowrap">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('CATALOGO');
          }}
          className={
            'px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap min-h-[40px] touch-manipulation cursor-pointer ' +
            (activeTab === 'CATALOGO'
              ? 'bg-teal-800 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50')
          }
        >
          <Package className="w-4 h-4" />
          <span>Inventario General ({products.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('PSICOTROPICOS');
          }}
          className={
            'px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap min-h-[40px] touch-manipulation cursor-pointer ' +
            (activeTab === 'PSICOTROPICOS'
              ? 'bg-purple-800 text-white shadow-2xs'
              : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100')
          }
        >
          <ShieldAlert className="w-4 h-4 text-purple-600" />
          <span>Libro Psicotrópicos & Estupefacientes ({psychotropicProducts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveTab('KARDEX');
          }}
          className={
            'px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 flex-shrink-0 whitespace-nowrap min-h-[40px] touch-manipulation cursor-pointer ' +
            (activeTab === 'KARDEX'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50')
          }
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
          subtitle={
            lowStockCount > 0 ? 'Requieren orden de compra urgente' : 'Nivel de existencias óptimo'
          }
          icon={AlertTriangle}
          variant={lowStockCount > 0 ? 'rose' : 'slate'}
        />

        <StatCard
          title="Control FEFO / Vencimientos"
          value={expiringSoonCount + ' lotes'}
          subtitle={
            expiringSoonCount > 0 ? 'Lotes por vencer (<60d) o vencidos' : 'Sin alertas de vencimiento'
          }
          icon={Clock}
          variant={expiringSoonCount > 0 ? 'amber' : 'slate'}
        />
      </div>

      {/* 4. Tab 1: Inventario General */}
      {activeTab === 'CATALOGO' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-3xl shadow-xs space-y-3 w-full max-w-full">
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

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setFilterCriticalOnly(!filterCriticalOnly);
                }}
                className={
                  'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all min-h-[34px] flex items-center gap-1.5 cursor-pointer ' +
                  (filterCriticalOnly
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100')
                }
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Mostrar solo Stock Crítico ({lowStockCount})</span>
              </button>

              <span className="text-xs text-slate-500 font-medium">
                Mostrando <strong>{filtered.length}</strong> de <strong>{products.length}</strong> artículos
              </span>
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
                onAction={() => setShowNewProductModal(true)}
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
                  onDeleteProduct={(p) => setProductToDelete(p)}
                />
              ))
            )}
          </div>

          {/* Desktop / Tablet Table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-xs text-left text-slate-700 min-w-[780px]">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="p-3.5">Código</th>
                    <th className="p-3.5">Producto & Principio Activo</th>
                    <th className="p-3.5">Categoría</th>
                    <th className="p-3.5">Ubicación / Lote</th>
                    <th className="p-3.5">Stock Actual</th>
                    <th className="p-3.5">Precios (Costo / Venta)</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No se encontraron medicamentos o insumos con los filtros actuales.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((prod) => {
                      const isCritical = (prod.currentStock ?? 0) <= (prod.minStock ?? 0);
                      const isOutOfStock = (prod.currentStock ?? 0) <= 0;
                      const expirationFormatted = formatExpirationDate(prod.expirationDate);
                      const isControlled =
                        prod.isPsychotropic ||
                        prod.isNarcotic ||
                        prod.category === 'PSICOTROPICO' ||
                        prod.category === 'ESTUPEFACIENTE';

                      const margin = calculateMargin(prod.costPrice, prod.salePrice);

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-mono text-[11px] font-bold text-slate-600 whitespace-nowrap">
                            {prod.code}
                          </td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-900 text-xs">{prod.commercialName}</span>
                              {isControlled && (
                                <span className="text-[9px] font-black bg-purple-100 text-purple-900 px-1.5 py-0.2 rounded border border-purple-300">
                                  🔒 CONTROLADO
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-teal-800 font-semibold block">
                              {prod.activeIngredient} ({prod.concentration || 'Std'})
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                              Fab: {prod.laboratory || 'Laboratorio Vet'} {prod.supplier ? '• Prov: ' + prod.supplier : ''}
                            </span>
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
                                className={
                                  'text-sm font-black ' +
                                  (isOutOfStock
                                    ? 'text-rose-700'
                                    : isCritical
                                    ? 'text-amber-700 animate-pulse'
                                    : 'text-slate-900')
                                }
                              >
                                {prod.currentStock ?? 0}{' '}
                                <span className="text-[11px] font-normal text-slate-500">
                                  {prod.presentation || 'uds'}
                                </span>
                              </span>
                              <span className="text-[10px] text-slate-400">(Mín: {prod.minStock ?? 0})</span>
                            </div>
                            {isOutOfStock ? (
                              <span className="text-[9px] font-bold text-rose-600 block">🔴 Sin Stock</span>
                            ) : isCritical ? (
                              <span className="text-[9px] font-bold text-amber-600 block">⚠️ Stock Crítico</span>
                            ) : (
                              <span className="text-[9px] font-bold text-emerald-600 block">🟢 Existencia OK</span>
                            )}
                          </td>
                          <td className="p-3.5 font-mono text-xs whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div>
                                <span className="font-black text-slate-900 block text-sm">
                                  ${(prod.salePrice ?? 0).toLocaleString('es-AR')}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  Costo: ${(prod.costPrice ?? 0).toLocaleString('es-AR')}
                                </span>
                              </div>
                              {margin !== null && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  +{margin}%
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditProduct(prod)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Editar precios, stock mínimo, lote o datos"
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
                                className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold rounded-xl text-xs transition-colors border border-teal-200 cursor-pointer shadow-2xs"
                              >
                                Ajustar / Reponer
                              </button>
                              <button
                                type="button"
                                onClick={() => setProductToDelete(prod)}
                                className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Eliminar producto del catálogo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
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
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-purple-300 cursor-pointer shadow-2xs"
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
                        className="px-3 py-1 bg-purple-800 hover:bg-purple-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-2xs"
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
              <History className="w-5 h-5 text-teal-700" />
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
              description="A medida que se realicen compras, ventas, aplicaciones clínicas o mermas, se registrarán aquí automáticamente."
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
                            className={
                              'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ' +
                              (isPositive
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200')
                            }
                          >
                            {mov.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-sm">
                          <span className={isPositive ? 'text-emerald-700' : 'text-rose-700'}>
                            {isPositive ? '+' : ''}
                            {mov.quantity}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 font-bold">{mov.newStock} uds</td>
                        <td className="p-3 font-sans text-slate-600 text-xs">{mov.reason}</td>
                        <td className="p-3 font-sans text-right text-slate-800 font-bold">
                          {mov.performedBy}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 🌟 7. MODAL: ALTA DE NUEVO FÁRMACO / INSUMO */}
      {showNewProductModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 max-w-2xl w-full shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold">
                  <Package className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-black font-serif text-slate-900 text-base">
                    Alta de Producto, Medicamento o Insumo
                  </h3>
                  <span className="text-xs text-slate-500">
                    Registro de catálogo, precios de compra/venta y control de stock
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowNewProductModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              {/* Categoría & Nombre Comercial */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Artículo:</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-600 cursor-pointer"
                  >
                    <option value="MEDICAMENTO">💊 Medicamento / Fármaco</option>
                    <option value="INSUMO_QUIRURGICO">✂️ Insumo Quirúrgico</option>
                    <option value="DESCARTABLE">📦 Material Descartable</option>
                    <option value="VACUNA">💉 Biológico / Vacuna</option>
                    <option value="PSICOTROPICO">🔒 Psicotrópico (Lista II/III/IV)</option>
                    <option value="ESTUPEFACIENTE">🚨 Estupefaciente (Lista I)</option>
                    <option value="ALIMENTO">🥩 Alimento / Dieta Terapéutica</option>
                    <option value="HIGIENE">🧴 Higiene & Cuidados</option>
                    <option value="ACCESORIO">🏷️ Accesorio / Varios</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Nombre Comercial del Producto: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="Ej: Meloxivet Gotas, Catéter 22G, Tramadol 50mg..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Principio Activo & Concentración */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Principio Activo / Composición:</label>
                  <input
                    type="text"
                    value={newProdActiveIngredient}
                    onChange={(e) => setNewProdActiveIngredient(e.target.value)}
                    placeholder="Ej: Meloxicam, Cefazolina Sódica, Teflón..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Concentración / Dosis:</label>
                  <input
                    type="text"
                    value={newProdConcentration}
                    onChange={(e) => setNewProdConcentration(e.target.value)}
                    placeholder="Ej: 5 mg/ml, 10%, 500 mg, 22G x 1..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Presentación & Laboratorio */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Presentación / Envase:</label>
                  <input
                    type="text"
                    value={newProdPresentation}
                    onChange={(e) => setNewProdPresentation(e.target.value)}
                    placeholder="Ej: Frasco gotero 10ml, Caja x 30 comp, Unidad..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Laboratorio / Fabricante:</label>
                  <input
                    type="text"
                    value={newProdLaboratory}
                    onChange={(e) => setNewProdLaboratory(e.target.value)}
                    placeholder="Ej: Laboratorio Holliday, Brouwer, Zoetis..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Ubicación & Proveedor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ubicación Física en Clínica:</label>
                  <input
                    type="text"
                    value={newProdLocation}
                    onChange={(e) => setNewProdLocation(e.target.value)}
                    placeholder="Ej: Estante A-2, Heladera #1, Carro de Paro..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proveedor Habitual:</label>
                  <input
                    type="text"
                    value={newProdSupplier}
                    onChange={(e) => setNewProdSupplier(e.target.value)}
                    placeholder="Ej: Droguería Veterinaria Central..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* Lote & Fecha de Vencimiento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Número de Lote:</label>
                  <input
                    type="text"
                    value={newProdBatch}
                    onChange={(e) => setNewProdBatch(e.target.value)}
                    placeholder="Ej: L-2026-A1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha de Vencimiento:</label>
                  <input
                    type="date"
                    value={newProdExpDate}
                    onChange={(e) => setNewProdExpDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-teal-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Stock Inicial & Stock Mínimo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-teal-50/70 p-3 rounded-2xl border border-teal-200">
                  <label className="font-bold text-teal-950 block mb-1">Stock Inicial a Ingresar:</label>
                  <input
                    type="number"
                    min="0"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full bg-white border border-teal-300 rounded-xl p-2 font-mono font-black text-slate-900 text-sm focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
                  <label className="font-bold text-amber-950 block mb-1">Stock Mínimo de Alerta:</label>
                  <input
                    type="number"
                    min="1"
                    value={newProdMinStock}
                    onChange={(e) => setNewProdMinStock(Number(e.target.value))}
                    className="w-full bg-white border border-amber-300 rounded-xl p-2 font-mono font-black text-slate-900 text-sm focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              {/* 💰 Precios & Márgenes */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E8E3D9] space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Estructura de Precios & Valor del Producto:</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Precio Costo / Compra ($):</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={newProdCostPrice}
                      onChange={(e) => setNewProdCostPrice(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-black text-slate-900 text-sm focus:ring-2 focus:ring-teal-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Precio Venta al Público ($):</label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={newProdSalePrice}
                      onChange={(e) => setNewProdSalePrice(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-black text-emerald-800 text-sm focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {newProdCostPrice > 0 && newProdSalePrice > 0 && (
                  <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded-xl border border-emerald-200 font-bold">
                    <span>Margen Comercial Calculado:</span>
                    <span className="font-mono text-sm">
                      +{calculateMargin(newProdCostPrice, newProdSalePrice)}% (Ganancia: ${calculateProfit(newProdCostPrice, newProdSalePrice).toLocaleString('es-AR')})
                    </span>
                  </div>
                )}
              </div>

              {/* Checkbox Psicotrópico */}
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-2xl border border-purple-200">
                <input
                  type="checkbox"
                  id="chkPsychotropic"
                  checked={newProdIsPsychotropic}
                  onChange={(e) => setNewProdIsPsychotropic(e.target.checked)}
                  className="w-4 h-4 text-purple-700 rounded focus:ring-purple-500 cursor-pointer"
                />
                <label htmlFor="chkPsychotropic" className="text-xs font-bold text-purple-950 cursor-pointer">
                  🔒 Clasificar como Sustancia Controlada / Psicotrópico (Libro Ley 17.818 / SENASA)
                </label>
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 8. MODAL: AJUSTE / REPOSICIÓN DE STOCK */}
      {stockModalProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">{stockModalProduct.commercialName}</h3>
                <span className="text-xs text-teal-800 font-mono font-bold">
                  Stock actual: {stockModalProduct.currentStock} {stockModalProduct.presentation || 'uds'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStockModalProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo de Movimiento:</label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 cursor-pointer"
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

              {/* Botones de ajuste rápido */}
              <div>
                <label className="font-bold text-slate-600 block mb-1.5">Ajuste Rápido con 1 Clic:</label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[1, 5, 10, 50].map((amt) => (
                    <button
                      key={'plus-' + amt}
                      type="button"
                      onClick={() => handleQuickAdjust(amt)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      +{amt}
                    </button>
                  ))}
                  {[-1, -5, -10].map((amt) => (
                    <button
                      key={'minus-' + amt}
                      type="button"
                      onClick={() => handleQuickAdjust(amt)}
                      className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg font-bold text-xs cursor-pointer shadow-2xs"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Cantidad a ingresar (+) o descontar (-):
                </label>
                <input
                  type="number"
                  value={stockAdjustment}
                  onChange={(e) => setStockAdjustment(Number(e.target.value))}
                  placeholder="Ej: 20 para ingresar, -5 para descontar"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-black text-slate-900 text-base focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Visual Result */}
              <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 flex items-center justify-between">
                <span className="text-teal-900 font-medium text-xs">Nuevo Stock Resultante:</span>
                <strong className="text-teal-950 font-mono text-base font-black">
                  {Math.max(0, (stockModalProduct.currentStock || 0) + Number(stockAdjustment))}{' '}
                  {stockModalProduct.presentation || 'uds'}
                </strong>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo / Número de Factura o Receta:</label>
                <input
                  type="text"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  required
                  placeholder="Ej: Compra según factura A-0001, Dispensación ambulatoria..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-900 focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
                >
                  Confirmar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 9. MODAL: EDICIÓN INTEGRAL DE PRODUCTO & PRECIOS */}
      {editingProduct && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-lg w-full shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Modificar Fármaco & Precios</h3>
                <span className="text-xs text-slate-500 font-mono">{editingProduct.code}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Comercial:</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Principio Activo:</label>
                  <input
                    type="text"
                    value={editActiveIngredient}
                    onChange={(e) => setEditActiveIngredient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Concentración:</label>
                  <input
                    type="text"
                    value={editConcentration}
                    onChange={(e) => setEditConcentration(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Presentación:</label>
                  <input
                    type="text"
                    value={editPresentation}
                    onChange={(e) => setEditPresentation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Laboratorio:</label>
                  <input
                    type="text"
                    value={editLaboratory}
                    onChange={(e) => setEditLaboratory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* 💰 Precios de Costo y Venta */}
              <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-950 block">Precios & Valor Comercial:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Precio Costo ($):</label>
                    <input
                      type="number"
                      step="any"
                      value={editCostPrice}
                      onChange={(e) => setEditCostPrice(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900 text-sm focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Precio Venta ($):</label>
                    <input
                      type="number"
                      step="any"
                      value={editSalePrice}
                      onChange={(e) => setEditSalePrice(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-black text-emerald-800 text-sm focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                {editCostPrice > 0 && editSalePrice > 0 && (
                  <div className="text-[11px] font-bold text-emerald-800 flex justify-between">
                    <span>Margen de Ganancia:</span>
                    <span>+{calculateMargin(editCostPrice, editSalePrice)}%</span>
                  </div>
                )}
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-slate-900 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setProductToDelete(editingProduct)}
                  className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🌟 10. MODAL: CONFIRMACIÓN DE ELIMINACIÓN */}
      {productToDelete && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-sm w-full shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="font-black text-base text-slate-900">¿Eliminar Producto?</h4>
              <p className="text-xs text-slate-500 mt-1">
                ¿Estás seguro de eliminar <strong>"{productToDelete.commercialName}"</strong>? Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteProduct}
                className="py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
