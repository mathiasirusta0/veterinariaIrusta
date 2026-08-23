import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  PawPrint,
  User,
  Pill,
  Receipt,
  ArrowRight,
  Sparkles,
  BedDouble,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    patients,
    owners,
    products,
    invoices,
    setSelectedPatientId,
    setSelectedOwnerId,
    setActiveView,
    setActivePatientTab,
  } = useVet();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && isGlobalSearchOpen) {
        setIsGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGlobalSearchOpen, setIsGlobalSearchOpen]);

  useEffect(() => {
    if (isGlobalSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  if (!isGlobalSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredPatients = q
    ? patients.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.clinicalRecordNumber || '').toLowerCase().includes(q) ||
          (p.breed || '').toLowerCase().includes(q) ||
          (p.microchip && p.microchip.includes(q))
      )
    : patients.slice(0, 4);

  const filteredOwners = q
    ? owners.filter(
        (o) =>
          `${o.firstName || ''} ${o.lastName || ''}`.toLowerCase().includes(q) ||
          (o.dni || '').includes(q) ||
          (o.phone || '').includes(q) ||
          (o.email || '').toLowerCase().includes(q)
      )
    : owners.slice(0, 3);

  const filteredProducts = q
    ? products.filter(
        (pr) =>
          (pr.commercialName || '').toLowerCase().includes(q) ||
          (pr.activeIngredient || '').toLowerCase().includes(q) ||
          (pr.code || '').toLowerCase().includes(q)
      )
    : [];

  const filteredInvoices = q
    ? invoices.filter(
        (inv) =>
          (inv.invoiceNumber || '').toLowerCase().includes(q) ||
          (inv.customerName || '').toLowerCase().includes(q)
      )
    : [];

  const handleOpenPatient = (patientId: string, tab = 'RESUMEN') => {
    setSelectedPatientId(patientId);
    setActivePatientTab(tab);
    setActiveView('PACIENTES');
    setIsGlobalSearchOpen(false);
  };

  const handleOpenOwner = (ownerId: string) => {
    setSelectedOwnerId(ownerId);
    setActiveView('PROPIETARIOS');
    setIsGlobalSearchOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Search className="w-5 h-5 text-teal-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por Nombre, HC, Propietario, DNI, Microchip, Medicamento..."
            className="w-full bg-transparent text-slate-900 text-base focus:outline-none placeholder-slate-400 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-slate-400 hover:text-slate-700 p-1">
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsGlobalSearchOpen(false)}
            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-md transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
          {/* Patients */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              <span className="flex items-center gap-1.5">
                <PawPrint className="w-3.5 h-3.5 text-teal-600" />
                Pacientes {q && `(${filteredPatients.length})`}
              </span>
            </div>
            {filteredPatients.length === 0 ? (
              <p className="text-xs text-slate-400 py-1 italic">No se encontraron pacientes.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredPatients.map((p) => {
                  const owner = owners.find((o) => o.id === p.ownerId);
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleOpenPatient(p.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-teal-500/50 text-left transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 group-hover:text-teal-700">
                              {p.name}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                              {p.clinicalRecordNumber}
                            </span>
                            {p.status === 'INTERNADO' && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                                🏥 Internado
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {p.species} • {p.breed} • {p.calculatedAge} • Tutor:{' '}
                            <span className="text-slate-800 font-semibold">
                              {owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'}
                            </span>
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Owners */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-teal-600" />
                Propietarios / Tutores {q && `(${filteredOwners.length})`}
              </span>
            </div>
            {filteredOwners.length === 0 ? (
              <p className="text-xs text-slate-400 py-1 italic">No se encontraron propietarios.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredOwners.map((o) => {
                  const pets = patients.filter((p) => p.ownerId === o.id);
                  return (
                    <button
                      key={o.id}
                      onClick={() => handleOpenOwner(o.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 hover:border-teal-500/50 text-left transition-all group cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 group-hover:text-teal-700">
                            {o.firstName} {o.lastName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">DNI: {o.dni}</span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Tel: {o.phone} • Mascotas: {pets.map((pt) => pt.name).join(', ') || 'Ninguna'}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Products if query */}
          {q && filteredProducts.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <span className="flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-teal-600" />
                  Farmacia & Medicamentos ({filteredProducts.length})
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {filteredProducts.map((pr) => (
                  <div
                    key={pr.id}
                    onClick={() => {
                      setActiveView('FARMACIA');
                      setIsGlobalSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 cursor-pointer text-left"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-900">{pr.commercialName}</span>
                      <p className="text-xs text-slate-500">
                        {pr.activeIngredient} • Stock:{' '}
                        <span className={(pr.currentStock ?? 0) <= (pr.minStock ?? 0) ? 'text-red-600 font-bold' : 'text-teal-700 font-bold'}>
                          {pr.currentStock ?? 0} unid.
                        </span>{' '}
                        • ${(pr.salePrice ?? 0).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-800 font-bold">
                      {pr.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices if query */}
          {q && filteredInvoices.length > 0 && (
            <div>
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <span className="flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-teal-600" />
                  Comprobantes & Facturación ({filteredInvoices.length})
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {filteredInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setActiveView('CAJA_FACTURACION');
                      setIsGlobalSearchOpen(false);
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 cursor-pointer text-left"
                  >
                    <div>
                      <span className="text-sm font-bold text-slate-900">{inv.invoiceNumber}</span>
                      <p className="text-xs text-slate-500">
                        Cliente: {inv.customerName || 'Consumidor Final'} • Total: ${(inv.totalAmount ?? 0).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                      CAE: {inv.caeNumber.slice(0, 8)}...
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
