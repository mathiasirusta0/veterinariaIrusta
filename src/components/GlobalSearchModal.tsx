import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  PawPrint,
  User,
  Pill,
  Receipt,
  Sparkles,
  Calendar,
  FileText,
  Scissors,
  Syringe,
  Activity,
  MessageCircle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { triggerHaptic } from '../utils/haptics';
import { formatDate } from '../utils/formatters';

export type CategoryFilter = 'TODOS' | 'PACIENTES' | 'TUTORES' | 'TURNOS' | 'FARMACIA' | 'RECETAS' | 'ACCIONES';

// Normalizador insensible a acentos/tildes y mayúsculas
export const normalizeSearchText = (text: string): string => {
  return (text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

// Normalizador de números para DNI y Teléfonos
export const normalizeDigits = (text: string): string => {
  return (text || '').replace(/\D/g, '');
};

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setIsGlobalSearchOpen,
    patients,
    owners,
    products,
    appointments,
    prescriptions,
    setSelectedPatientId,
    setSelectedOwnerId,
    setActiveView,
    setActivePatientTab,
    setQuickModal,
    openWhatsAppHub,
  } = useVet();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('TODOS');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Atajo global Ctrl+K / Cmd+K y Escape
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

  // Autofoco y reseteo al abrir
  useEffect(() => {
    if (isGlobalSearchOpen) {
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQuery('');
      setSelectedCategory('TODOS');
      setSelectedIndex(0);
    }
  }, [isGlobalSearchOpen]);

  const q = normalizeSearchText(query);
  const qDigits = normalizeDigits(query);

  // Acciones Rápidas del Command Center
  const QUICK_ACTIONS = useMemo(() => [
    {
      id: 'cmd-paciente',
      type: 'ACTION' as const,
      label: 'Registrar Nuevo Paciente',
      description: 'Alta de ficha clínica, especie, raza y tutor',
      icon: PawPrint,
      badge: 'Ficha Clínica',
      action: () => {
        setQuickModal('NUEVO_PACIENTE');
        setIsGlobalSearchOpen(false);
      },
    },
    {
      id: 'cmd-tutor',
      type: 'ACTION' as const,
      label: 'Registrar Nuevo Tutor / Propietario',
      description: 'Alta de cliente, DNI, teléfono y cuenta corriente',
      icon: User,
      badge: 'Cliente',
      action: () => {
        setQuickModal('NUEVO_PROPIETARIO');
        setIsGlobalSearchOpen(false);
      },
    },
    {
      id: 'cmd-turno',
      type: 'ACTION' as const,
      label: 'Agendar Turno Médico / Cirugía',
      description: 'Cita en consultorio, quirófano o visita a domicilio',
      icon: Calendar,
      badge: 'Agenda',
      action: () => {
        setQuickModal('NUEVO_TURNO');
        setIsGlobalSearchOpen(false);
      },
    },
    {
      id: 'cmd-receta',
      type: 'ACTION' as const,
      label: 'Confeccionar Receta Médica Oficial',
      description: 'Prescripción digital con firma del Dr. Diego Iván Irusta',
      icon: FileText,
      badge: 'Farmacología',
      action: () => {
        setActiveView('RECETAS_OFICIALES');
        setIsGlobalSearchOpen(false);
      },
    },
    {
      id: 'cmd-vacuna',
      type: 'ACTION' as const,
      label: 'Registrar Vacuna / Inmunización',
      description: 'Calendario oficial, refuerzo o autovacuna',
      icon: Syringe,
      badge: 'Inmunizaciones',
      action: () => {
        setActiveView('VACUNAS');
        setIsGlobalSearchOpen(false);
      },
    },
    {
      id: 'cmd-cirugia',
      type: 'ACTION' as const,
      label: 'Programar Intervención Quirúrgica',
      description: 'Protocolo anestésico, clasificación ASA y quirófano',
      icon: Scissors,
      badge: 'Quirófano',
      action: () => {
        setQuickModal('NUEVA_CIRUGIA');
        setIsGlobalSearchOpen(false);
      },
    },
    {
      id: 'cmd-vitals',
      type: 'ACTION' as const,
      label: 'Biometría & Signos Vitales',
      description: 'Triada clínica, temperatura, curvas fisiológicas',
      icon: Activity,
      badge: 'Monitoreo',
      action: () => {
        setActiveView('SIGNOS_VITALES');
        setIsGlobalSearchOpen(false);
      },
    },
    {
      id: 'cmd-factura',
      type: 'ACTION' as const,
      label: 'Emitir Cobro / Comprobante de Caja',
      description: 'Presupuestos, comprobantes fiscales y recibos',
      icon: Receipt,
      badge: 'Finanzas',
      action: () => {
        setActiveView('CAJA_FACTURACION');
        setIsGlobalSearchOpen(false);
      },
    },
  ], [setActiveView, setIsGlobalSearchOpen, setQuickModal]);

  // Filtrado de Entidades con Normalización Inteligente
  const filteredPatients = useMemo(() => {
    if (!q) return (patients || []).slice(0, 5);
    return (patients || []).filter((p) => {
      const name = normalizeSearchText(p.name);
      const hc = normalizeSearchText(p.clinicalRecordNumber);
      const breed = normalizeSearchText(p.breed);
      const species = normalizeSearchText(p.species);
      const microchip = p.microchip ? normalizeDigits(p.microchip) : '';
      const owner = owners.find((o) => o.id === p.ownerId);
      const ownerName = owner ? normalizeSearchText(`${owner.firstName} ${owner.lastName}`) : '';
      
      return (
        name.includes(q) ||
        hc.includes(q) ||
        breed.includes(q) ||
        species.includes(q) ||
        ownerName.includes(q) ||
        (qDigits && microchip && microchip.includes(qDigits))
      );
    });
  }, [patients, owners, q, qDigits]);

  const filteredOwners = useMemo(() => {
    if (!q) return (owners || []).slice(0, 4);
    return (owners || []).filter((o) => {
      const fullName = normalizeSearchText(`${o.firstName || ''} ${o.lastName || ''}`);
      const email = normalizeSearchText(o.email);
      const address = normalizeSearchText(o.address);
      const dni = normalizeDigits(o.dni);
      const phone = normalizeDigits(o.phone);
      
      return (
        fullName.includes(q) ||
        email.includes(q) ||
        address.includes(q) ||
        (qDigits && dni && dni.includes(qDigits)) ||
        (qDigits && phone && phone.includes(qDigits))
      );
    });
  }, [owners, q, qDigits]);

  const filteredAppointments = useMemo(() => {
    if (!q) return [];
    return (appointments || []).filter((a) => {
      const patient = normalizeSearchText(a.patientName);
      const owner = normalizeSearchText(a.ownerName);
      const reason = normalizeSearchText(a.reason);
      const vet = normalizeSearchText(a.vetName);
      return patient.includes(q) || owner.includes(q) || reason.includes(q) || vet.includes(q);
    });
  }, [appointments, q]);

  const filteredProducts = useMemo(() => {
    if (!q) return [];
    return (products || []).filter((pr) => {
      const commercial = normalizeSearchText(pr.commercialName);
      const active = normalizeSearchText(pr.activeIngredient);
      const code = normalizeSearchText(pr.code);
      return commercial.includes(q) || active.includes(q) || code.includes(q);
    });
  }, [products, q]);

  const filteredPrescriptions = useMemo(() => {
    if (!q) return [];
    return (prescriptions || []).filter((rx) => {
      const num = normalizeSearchText(rx.prescriptionNumber);
      const diag = normalizeSearchText(rx.diagnosis);
      const patient = normalizeSearchText(rx.patientName);
      const owner = normalizeSearchText(rx.ownerName);
      const drugs = (rx.items || []).map((i) => normalizeSearchText(i.medicationName)).join(' ');
      return num.includes(q) || diag.includes(q) || patient.includes(q) || owner.includes(q) || drugs.includes(q);
    });
  }, [prescriptions, q]);

  const filteredActions = useMemo(() => {
    if (!q) return QUICK_ACTIONS;
    return QUICK_ACTIONS.filter((act) => {
      const label = normalizeSearchText(act.label);
      const desc = normalizeSearchText(act.description);
      const badge = normalizeSearchText(act.badge);
      return label.includes(q) || desc.includes(q) || badge.includes(q);
    });
  }, [QUICK_ACTIONS, q]);

  // Lista plana interactiva para navegación con flechas ↑ / ↓ y Enter
  interface FlatResultItem {
    id: string;
    type: 'PATIENT' | 'OWNER' | 'APPOINTMENT' | 'PRODUCT' | 'PRESCRIPTION' | 'ACTION';
    title: string;
    onSelect: () => void;
  }

  const flatItems: FlatResultItem[] = useMemo(() => {
    const list: FlatResultItem[] = [];

    if (selectedCategory === 'TODOS' || selectedCategory === 'ACCIONES') {
      filteredActions.forEach((act) => {
        list.push({ id: act.id, type: 'ACTION', title: act.label, onSelect: act.action });
      });
    }

    if (selectedCategory === 'TODOS' || selectedCategory === 'PACIENTES') {
      filteredPatients.forEach((p) => {
        list.push({
          id: `pat-${p.id}`,
          type: 'PATIENT',
          title: p.name,
          onSelect: () => {
            setSelectedPatientId(p.id);
            setActivePatientTab('RESUMEN');
            setActiveView('PACIENTES');
            setIsGlobalSearchOpen(false);
          },
        });
      });
    }

    if (selectedCategory === 'TODOS' || selectedCategory === 'TUTORES') {
      filteredOwners.forEach((o) => {
        list.push({
          id: `own-${o.id}`,
          type: 'OWNER',
          title: `${o.firstName} ${o.lastName}`,
          onSelect: () => {
            setSelectedOwnerId(o.id);
            setActiveView('PROPIETARIOS');
            setIsGlobalSearchOpen(false);
          },
        });
      });
    }

    if (selectedCategory === 'TODOS' || selectedCategory === 'TURNOS') {
      filteredAppointments.forEach((a) => {
        list.push({
          id: `apt-${a.id}`,
          type: 'APPOINTMENT',
          title: `Turno: ${a.patientName} - ${a.reason}`,
          onSelect: () => {
            setActiveView('AGENDA');
            setIsGlobalSearchOpen(false);
          },
        });
      });
    }

    if (selectedCategory === 'TODOS' || selectedCategory === 'FARMACIA') {
      filteredProducts.forEach((pr) => {
        list.push({
          id: `prod-${pr.id}`,
          type: 'PRODUCT',
          title: pr.commercialName,
          onSelect: () => {
            setActiveView('INVENTARIO');
            setIsGlobalSearchOpen(false);
          },
        });
      });
    }

    if (selectedCategory === 'TODOS' || selectedCategory === 'RECETAS') {
      filteredPrescriptions.forEach((rx) => {
        list.push({
          id: `rx-${rx.id}`,
          type: 'PRESCRIPTION',
          title: `Receta ${rx.prescriptionNumber}: ${rx.diagnosis}`,
          onSelect: () => {
            setActiveView('RECETAS_OFICIALES');
            setIsGlobalSearchOpen(false);
          },
        });
      });
    }

    return list;
  }, [
    selectedCategory,
    filteredActions,
    filteredPatients,
    filteredOwners,
    filteredAppointments,
    filteredProducts,
    filteredPrescriptions,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setIsGlobalSearchOpen,
    setSelectedOwnerId,
  ]);

  // Manejo de Teclado (Navegación con Flechas ↑ ↓ y Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        triggerHaptic('medium');
        flatItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const categories: CategoryFilter[] = ['TODOS', 'PACIENTES', 'TUTORES', 'TURNOS', 'FARMACIA', 'RECETAS', 'ACCIONES'];
      const currentIdx = categories.indexOf(selectedCategory);
      const nextIdx = e.shiftKey
        ? (currentIdx > 0 ? currentIdx - 1 : categories.length - 1)
        : (currentIdx < categories.length - 1 ? currentIdx + 1 : 0);
      setSelectedCategory(categories[nextIdx]);
      setSelectedIndex(0);
    }
  };

  const handleOpenPatientDirect = (patientId: string, tab = 'RESUMEN') => {
    triggerHaptic('light');
    setSelectedPatientId(patientId);
    setActivePatientTab(tab);
    setActiveView('PACIENTES');
    setIsGlobalSearchOpen(false);
  };

  const handleOpenOwnerDirect = (ownerId: string) => {
    triggerHaptic('light');
    setSelectedOwnerId(ownerId);
    setActiveView('PROPIETARIOS');
    setIsGlobalSearchOpen(false);
  };

  if (!isGlobalSearchOpen) return null;

  return (
    <div
      onClick={() => setIsGlobalSearchOpen(false)}
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-8 sm:pt-16 p-3 sm:p-4 animate-in fade-in duration-150"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscador Universal y Centro de Comandos"
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200/90 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[82vh] animate-in zoom-in-95 duration-150 selection:bg-teal-500 selection:text-white"
      >
        {/* Top Input Bar */}
        <div className="p-3.5 sm:p-4.5 border-b border-slate-200/80 flex items-center gap-3 bg-white relative">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center flex-shrink-0 text-teal-700">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Buscar por Nombre, HC, Tutor, DNI, Teléfono, Microchip, Fármaco, Turno..."
            className="w-full bg-transparent text-slate-900 text-sm sm:text-base font-semibold placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                inputRef.current?.focus();
              }}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsGlobalSearchOpen(false)}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-lg transition-colors border border-slate-200"
            title="Cerrar modal (Esc)"
          >
            ESC
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="px-3.5 py-2.5 bg-slate-50/90 border-b border-slate-200/70 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1 flex-shrink-0">
            <Filter className="w-3 h-3 text-slate-400" />
            Filtrar:
          </span>
          {[
            { id: 'TODOS', label: '🌟 Todos', count: flatItems.length },
            { id: 'PACIENTES', label: '🐾 Pacientes', count: filteredPatients.length },
            { id: 'TUTORES', label: '👤 Tutores', count: filteredOwners.length },
            { id: 'ACCIONES', label: '⚡ Comandos', count: filteredActions.length },
            ...(q ? [
              { id: 'TURNOS', label: '📅 Turnos', count: filteredAppointments.length },
              { id: 'FARMACIA', label: '💊 Farmacia', count: filteredProducts.length },
              { id: 'RECETAS', label: '℞ Recetas', count: filteredPrescriptions.length },
            ] : []),
          ].map((chip) => {
            const isSelected = selectedCategory === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedCategory(chip.id as CategoryFilter);
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-2xs font-black'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                <span>{chip.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {chip.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Results Area */}
        <div ref={resultsContainerRef} className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 custom-scrollbar bg-slate-50/50">
          {flatItems.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">No se encontraron resultados para "{query}"</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Verifica el nombre, DNI, teléfono o número de historia clínica e inténtalo nuevamente.
              </p>
            </div>
          ) : (
            <>
              {/* Quick Actions Group */}
              {(selectedCategory === 'TODOS' || selectedCategory === 'ACCIONES') && filteredActions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      Acciones Clínicas & Comandos Rápidos
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredActions.map((act) => {
                      const ActIcon = act.icon;
                      const flatIndex = flatItems.findIndex((item) => item.id === act.id);
                      const isHighlighted = selectedIndex === flatIndex;

                      return (
                        <button
                          key={act.id}
                          type="button"
                          onClick={() => {
                            triggerHaptic('medium');
                            act.action();
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all group cursor-pointer ${
                            isHighlighted
                              ? 'bg-teal-50/90 border-teal-500 shadow-sm ring-1 ring-teal-500'
                              : 'bg-white border-slate-200/80 hover:border-teal-400 hover:bg-slate-50 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-teal-700 flex-shrink-0 group-hover:scale-105 transition-transform">
                              <ActIcon className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate group-hover:text-teal-800">
                                {act.label}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">{act.description}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0 ml-1">
                            {act.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Patients Group */}
              {(selectedCategory === 'TODOS' || selectedCategory === 'PACIENTES') && filteredPatients.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <PawPrint className="w-3.5 h-3.5 text-teal-600" />
                      Pacientes Veterinarios ({filteredPatients.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {filteredPatients.map((p) => {
                      const owner = owners.find((o) => o.id === p.ownerId);
                      const flatIndex = flatItems.findIndex((item) => item.id === `pat-${p.id}`);
                      const isHighlighted = selectedIndex === flatIndex;

                      return (
                        <div
                          key={p.id}
                          onClick={() => handleOpenPatientDirect(p.id)}
                          className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer ${
                            isHighlighted
                              ? 'bg-teal-50/90 border-teal-500 shadow-sm ring-1 ring-teal-500'
                              : 'bg-white border-slate-200/80 hover:border-teal-400 hover:bg-slate-50/80 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={p.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                              alt={p.name}
                              className="w-11 h-11 rounded-2xl object-cover border border-slate-200 flex-shrink-0 shadow-2xs"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-black text-slate-900 group-hover:text-teal-800">
                                  {p.name}
                                </span>
                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                                  {p.clinicalRecordNumber}
                                </span>
                                {p.status === 'INTERNADO' && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200">
                                    🏥 Internado
                                  </span>
                                )}
                                {p.alerts && p.alerts.length > 0 && (
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
                                    ⚠️ {p.alerts.length} Alerta{p.alerts.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {p.species} • {p.breed || 'Mestizo'} • {p.calculatedAge || 'Edad N/R'} • Tutor:{' '}
                                <span className="text-slate-800 font-bold">
                                  {owner ? `${owner.firstName} ${owner.lastName}` : 'No asignado'}
                                </span>
                                {owner?.phone && (
                                  <span className="font-mono text-slate-500 text-[11px] ml-1">
                                    ({owner.phone})
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Direct Actions in Patient Card */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                            {owner?.phone && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openWhatsAppHub({
                                    patientName: p.name,
                                    ownerName: owner ? `${owner.firstName} ${owner.lastName}` : '',
                                    phone: owner.phone,
                                  });
                                  setIsGlobalSearchOpen(false);
                                }}
                                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all"
                                title="Enviar WhatsApp al tutor"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPatientDirect(p.id, 'SIGNOS');
                              }}
                              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                            >
                              <span>Ficha 360°</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Owners Group */}
              {(selectedCategory === 'TODOS' || selectedCategory === 'TUTORES') && filteredOwners.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      Tutores & Responsables ({filteredOwners.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {filteredOwners.map((o) => {
                      const linkedPets = patients.filter((p) => p.ownerId === o.id);
                      const flatIndex = flatItems.findIndex((item) => item.id === `own-${o.id}`);
                      const isHighlighted = selectedIndex === flatIndex;

                      return (
                        <div
                          key={o.id}
                          onClick={() => handleOpenOwnerDirect(o.id)}
                          className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group cursor-pointer ${
                            isHighlighted
                              ? 'bg-teal-50/90 border-teal-500 shadow-sm ring-1 ring-teal-500'
                              : 'bg-white border-slate-200/80 hover:border-teal-400 hover:bg-slate-50/80 shadow-2xs'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900 group-hover:text-teal-800">
                                {o.firstName} {o.lastName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                                DNI: {o.dni || 'S/D'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Tel: <span className="font-mono font-medium text-slate-800">{o.phone || 'No registrado'}</span> • Mascotas:{' '}
                              <span className="font-bold text-teal-700">
                                {linkedPets.map((pt) => pt.name).join(', ') || 'Sin mascotas registradas'}
                              </span>
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                            {o.phone && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openWhatsAppHub({
                                    patientName: linkedPets[0]?.name || 'Mascota',
                                    ownerName: `${o.firstName} ${o.lastName}`,
                                    phone: o.phone,
                                  });
                                  setIsGlobalSearchOpen(false);
                                }}
                                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all"
                                title="Enviar WhatsApp"
                              >
                                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenOwnerDirect(o.id);
                              }}
                              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                            >
                              <span>Ver Tutor</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Appointments Group */}
              {(selectedCategory === 'TODOS' || selectedCategory === 'TURNOS') && filteredAppointments.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      Agenda de Turnos & Citas ({filteredAppointments.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {filteredAppointments.map((a) => {
                      const flatIndex = flatItems.findIndex((item) => item.id === `apt-${a.id}`);
                      const isHighlighted = selectedIndex === flatIndex;

                      return (
                        <div
                          key={a.id}
                          onClick={() => {
                            setActiveView('AGENDA');
                            setIsGlobalSearchOpen(false);
                          }}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                            isHighlighted
                              ? 'bg-teal-50/90 border-teal-500 shadow-sm ring-1 ring-teal-500'
                              : 'bg-white border-slate-200/80 hover:border-teal-400 hover:bg-slate-50/80 shadow-2xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900">
                                {a.patientName}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                                {a.reason}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Fecha: <span className="font-bold text-slate-800">{formatDate(a.date)} a las {a.time} hs</span> • Tutor: {a.ownerName} • Vet: {a.vetName}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Products / Pharmacy Group */}
              {(selectedCategory === 'TODOS' || selectedCategory === 'FARMACIA') && filteredProducts.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <Pill className="w-3.5 h-3.5 text-teal-600" />
                      Farmacia & Medicamentos ({filteredProducts.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {filteredProducts.map((pr) => {
                      const flatIndex = flatItems.findIndex((item) => item.id === `prod-${pr.id}`);
                      const isHighlighted = selectedIndex === flatIndex;

                      return (
                        <div
                          key={pr.id}
                          onClick={() => {
                            setActiveView('INVENTARIO');
                            setIsGlobalSearchOpen(false);
                          }}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                            isHighlighted
                              ? 'bg-teal-50/90 border-teal-500 shadow-sm ring-1 ring-teal-500'
                              : 'bg-white border-slate-200/80 hover:border-teal-400 hover:bg-slate-50/80 shadow-2xs'
                          }`}
                        >
                          <div>
                            <span className="text-sm font-black text-slate-900 group-hover:text-teal-800">
                              {pr.commercialName}
                            </span>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {pr.activeIngredient} • Stock:{' '}
                              <span className={(pr.currentStock ?? 0) <= (pr.minStock ?? 0) ? 'text-rose-600 font-bold' : 'text-teal-700 font-bold'}>
                                {pr.currentStock ?? 0} unid.
                              </span>{' '}
                              • $${(pr.salePrice ?? 0).toLocaleString('es-AR')}
                            </p>
                          </div>
                          <span className="text-[10px] font-mono bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl text-slate-700 font-bold">
                            {pr.code}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Prescriptions Group */}
              {(selectedCategory === 'TODOS' || selectedCategory === 'RECETAS') && filteredPrescriptions.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 px-1">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      Recetas & Prescripciones ({filteredPrescriptions.length})
                    </span>
                  </div>
                  <div className="space-y-2">
                    {filteredPrescriptions.map((rx) => {
                      const flatIndex = flatItems.findIndex((item) => item.id === `rx-${rx.id}`);
                      const isHighlighted = selectedIndex === flatIndex;

                      return (
                        <div
                          key={rx.id}
                          onClick={() => {
                            setActiveView('RECETAS_OFICIALES');
                            setIsGlobalSearchOpen(false);
                          }}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                            isHighlighted
                              ? 'bg-teal-50/90 border-teal-500 shadow-sm ring-1 ring-teal-500'
                              : 'bg-white border-slate-200/80 hover:border-teal-400 hover:bg-slate-50/80 shadow-2xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-black text-slate-900">
                                {rx.diagnosis || 'Receta Médica Oficial'}
                              </span>
                              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                                {rx.prescriptionNumber}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Paciente: <span className="font-bold text-slate-800">{rx.patientName || 'Paciente'}</span> • Tutor: {rx.ownerName || 'Tutor'} • Fármacos: {(rx.items || []).map((i) => i.medicationName).join(', ')}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Spotlight Keyboard Navigation Footer */}
        <div className="px-4 py-2.5 bg-slate-100/90 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium select-none">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-[10px] shadow-2xs text-slate-700 font-bold">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-[10px] shadow-2xs text-slate-700 font-bold">
                ↓
              </kbd>
              <span>Navegar</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-[10px] shadow-2xs text-slate-700 font-bold">
                ↵
              </kbd>
              <span>Seleccionar</span>
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded-md font-mono text-[10px] shadow-2xs text-slate-700 font-bold">
                Tab
              </kbd>
              <span>Categoría</span>
            </span>
          </div>
          <span className="font-mono text-slate-400 text-[10px]">
            {flatItems.length} resultado{flatItems.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};
