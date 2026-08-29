import { PatientInformedConsentModal } from './PatientInformedConsentModal';
import React, { useState } from 'react';
import {
  RotateCcw,
  Archive,
  Trash2,
  PawPrint,
  Users,
  Mail,
  MapPin,
  MessageCircle,
  Search,
  Plus,
  ArrowRight,
  User,
  AlertTriangle,
  LayoutGrid,
  List,
  Download,
  Phone,
  MessageSquare,
  Stethoscope,
  Activity,
  BedDouble,
  Scissors,
  CheckCircle2,
  Copy,
  Filter,
  FileText,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Patient } from '../types';
import { formatWeight, formatOwnerBalance, formatAlertLabel, maskPhoneNumber } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PatientMobileCard } from './PatientMobileCard';
import { PatientDischargeModal } from './PatientDischargeModal';
import { PatientMedicalHistoryDownloadModal } from './PatientMedicalHistoryDownloadModal';
import { PageHeader, StatusBadge, EmptyState, SearchInput } from './ui';

export const PatientsListView: React.FC = () => {
  const {
    patients,
    owners,
    hospitalizations,
    currentUser,
    logAudit,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openWhatsAppHub,
    openDentalChart,
    openBodyMap,
    archivePatient,
    unarchivePatient,
    deletePatient,
    showToast,
  } = useVet();

  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('TABLE');
  const [sortBy, setSortBy] = useState<'NAME_ASC' | 'RECENT' | 'WEIGHT_DESC' | 'WEIGHT_ASC' | 'AGE_DESC'>('NAME_ASC');
  const [activeSubTab, setActiveSubTab] = useState<'PACIENTES' | 'TUTORES' | 'ARCHIVADOS'>('PACIENTES');
  const [dischargeModalPatient, setDischargeModalPatient] = useState<Patient | null>(null);
  const [historyDownloadModalPatient, setHistoryDownloadModalPatient] = useState<Patient | null>(null);
  const [selectedConsentPatient, setSelectedConsentPatient] = useState<Patient | null>(null);

  // Filter logic
  const filteredPatients = patients
    .filter((p) => {
      const q = search.toLowerCase();
      const owner = owners.find((o) => o.id === p.ownerId);
      const ownerName = owner ? `${owner.firstName} ${owner.lastName}`.toLowerCase() : '';
      const ownerPhone = owner?.phone || '';

      const matchesSearch =
        (p.name || '').toLowerCase().includes(q) ||
        (p.clinicalRecordNumber || '').toLowerCase().includes(q) ||
        (p.breed || '').toLowerCase().includes(q) ||
        (p.microchip && p.microchip.includes(q)) ||
        ownerName.includes(q) ||
        ownerPhone.includes(q);

      const matchesSpecies =
        speciesFilter === 'TODOS' ||
        p.species?.toUpperCase() === speciesFilter.toUpperCase() ||
        (speciesFilter.toUpperCase().startsWith('EX') && p.species?.toUpperCase().startsWith('EX'));
      
      let matchesStatus = true;
      if (statusFilter === 'INTERNADO') {
        matchesStatus = p.status === 'INTERNADO' || hospitalizations.some((h) => h.patientId === p.id && h.status === 'ACTIVA');
      } else if (statusFilter === 'ALTA_MEDICA') {
        matchesStatus = p.status === 'ALTA_MEDICA';
      } else if (statusFilter === 'ARCHIVADO') {
        matchesStatus = p.status === 'ARCHIVADO';
      } else if (statusFilter === 'ALERGIAS') {
        matchesStatus = !!(p.alerts && p.alerts.length > 0);
      } else if (statusFilter === 'TODOS') {
        // By default don't hide, or only show non-archived unless ARCHIVADO is selected
        matchesStatus = p.status !== 'ARCHIVADO';
      } else {
        matchesStatus = p.status === statusFilter;
      }

      return matchesSearch && matchesSpecies && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (sortBy === 'RECENT') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (sortBy === 'WEIGHT_DESC') return (b.weight || 0) - (a.weight || 0);
      if (sortBy === 'WEIGHT_ASC') return (a.weight || 0) - (b.weight || 0);
      if (sortBy === 'AGE_DESC') return new Date(a.birthDate || '2020-01-01').getTime() - new Date(b.birthDate || '2020-01-01').getTime();
      return 0;
    });

  const handleOpenPatient = (id: string, tab = 'SIGNOS') => {
    triggerHaptic('medium');
    setSelectedPatientId(id);
    setActivePatientTab(tab);
    setActiveView('PACIENTES');
  };

  const handleCopyMicrochip = (chip: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(chip);
    showToast('info', 'Microchip Copiado', `Código ISO ${chip} copiado al portapapeles.`);
  };

  const handleExportCSV = () => {
    const headers = ['ID Historia', 'Nombre', 'Especie', 'Raza', 'Sexo', 'Edad', 'Peso (kg)', 'Microchip', 'Estado', 'Tutor', 'Teléfono'];
    const rows = filteredPatients.map((p) => {
      const owner = owners.find((o) => o.id === p.ownerId);
      return [
        p.clinicalRecordNumber,
        `"${p.name}"`,
        p.species,
        `"${p.breed}"`,
        p.sex,
        `"${p.calculatedAge}"`,
        p.weight,
        p.microchip || '',
        p.status,
        owner ? `"${owner.firstName} ${owner.lastName}"` : 'N/A',
        owner ? `"${owner.phone}"` : 'N/A',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Censo_Pacientes_VETSYSTEM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('success', 'Censo Exportado', `${filteredPatients.length} pacientes exportados exitosamente.`);
  };

  // Active vs Archived patients
  const activePatients = patients.filter((p) => p.status !== 'ARCHIVADO' && !p.isArchived);
  const archivedPatients = patients.filter((p) => p.status === 'ARCHIVADO' || p.isArchived);

  // Counts for fast badges (active)
  const canineCount = activePatients.filter((p) => p.species?.toUpperCase() === 'CANINO').length;
  const felineCount = activePatients.filter((p) => p.species?.toUpperCase() === 'FELINO').length;
  const exoticCount = activePatients.filter((p) => p.species?.toUpperCase() === 'EXOTICO' || p.species?.toUpperCase() === 'EXÓTICO').length;
  const internedCount = activePatients.filter((p) => p.status === 'INTERNADO' || hospitalizations.some((h) => h.patientId === p.id && h.status === 'ACTIVA')).length;
  const allergicCount = activePatients.filter((p) => p.alerts && p.alerts.length > 0).length;

  return (
    <div className="space-y-3.5 pb-8 w-full max-w-full">
      {/* Top Module Subtabs: Pacientes vs Tutores vs Archivados */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl w-full sm:w-fit border border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('PACIENTES');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
            activeSubTab === 'PACIENTES'
              ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PawPrint className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>Pacientes Activos ({activePatients.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('TUTORES');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
            activeSubTab === 'TUTORES'
              ? 'bg-white text-teal-800 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>Tutores ({owners.length})</span>
        </button>
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveSubTab('ARCHIVADOS');
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 text-center cursor-pointer ${
            activeSubTab === 'ARCHIVADOS'
              ? 'bg-amber-800 text-white shadow-sm'
              : 'text-amber-900/80 hover:text-amber-950 hover:bg-amber-100/50'
          }`}
        >
          <Archive className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>Pacientes Archivados ({archivedPatients.length})</span>
        </button>
      </div>

      {activeSubTab === 'TUTORES' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Tutores */}
          <PageHeader
            category="Responsables Legales & Cuentas Corrientes"
            title="Directorio de Tutores & Propietarios"
            description="Control de responsables, vías de comunicación WhatsApp, pagos de insumos y saldos"
            icon={Users}
            actions={[
              {
                label: 'Nuevo Propietario',
                icon: Plus,
                onClick: () => setQuickModal('NUEVO_PROPIETARIO'),
                variant: 'primary',
              },
            ]}
          />

          {/* Search Tutores */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tutor por nombre, DNI, teléfono, email, dirección..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
          </div>

          {/* Owners Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {owners
              .filter((o) => {
                const q = (search || '').toLowerCase();
                return (
                  `${o.firstName || ''} ${o.lastName || ''}`.toLowerCase().includes(q) ||
                  (o.dni || '').includes(q) ||
                  (o.phone || '').includes(q) ||
                  (o.email || '').toLowerCase().includes(q)
                );
              })
              .map((owner) => {
                const linkedPets = patients.filter((p) => p.ownerId === owner.id);

                return (
                  <div
                    key={owner.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {[owner.firstName, owner.lastName].filter(Boolean).join(' ') || 'Tutor Registrado'}
                          </h3>
                          <p className="text-xs text-slate-500 font-mono">DNI: {owner.dni || 'S/D'}</p>
                        </div>
                        {(() => {
                          const ob = formatOwnerBalance(owner.balance);
                          return (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ob.badgeClass}`}>
                              {ob.label}
                            </span>
                          );
                        })()}
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{owner.phone || 'Teléfono no registrado'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{owner.email || 'Email no registrado'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{owner.address ? `${owner.address}, ${owner.city || 'Las Lajas'}` : 'Dirección no registrada'}</span>
                        </div>
                      </div>

                      {/* Linked Pets */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                          Mascotas Vinculadas ({linkedPets.length}):
                        </span>
                        {linkedPets.length === 0 ? (
                          <button
                            onClick={() => setQuickModal('NUEVO_PACIENTE')}
                            className="flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/80 px-2.5 py-1.5 rounded-lg border border-teal-200/80 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Registrar y Vincular Mascota</span>
                          </button>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {linkedPets.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => {
                                  setSelectedPatientId(p.id);
                                  setActivePatientTab('SIGNOS');
                                  setActiveView('PACIENTES');
                                }}
                                className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs font-semibold text-teal-800 border border-slate-200 hover:border-teal-400 transition-colors"
                              >
                                <PawPrint className="w-3 h-3 text-teal-600" />
                                <span>{p.name || 'Paciente'} ({p.species || 'Canino'})</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer buttons */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() =>
                          openWhatsAppHub({
                            ownerName: `${owner.firstName} ${owner.lastName}`,
                            ownerPhone: owner.phone || owner.whatsapp || '',
                            type: 'COBRO_INSUMO',
                            details: {
                              supplyName: 'Insumos médicos aplicados en clínica',
                              supplyAmount: owner.balance < 0 ? Math.abs(owner.balance) : 15000,
                            },
                          })
                        }
                        className="flex-1 py-2 text-center bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold rounded-lg border border-teal-200 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                        <span>Aviso WhatsApp / Cobro</span>
                      </button>

                      <a
                        href={`tel:${(owner.phone || '').replace(/[^0-9]/g, '')}`}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200"
                        title="Llamar al tutor"
                      >
                        <Phone className="w-3.5 h-3.5 text-teal-600" />
                      </a>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      
      {/* 📁 SUBTAB: PACIENTES ARCHIVADOS */}
      {activeSubTab === 'ARCHIVADOS' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <PageHeader
            category="Histórico Hospitalario & Depuración de Datos"
            title="Directorio de Pacientes Archivados"
            description="Pacientes inactivos o con alta médica. Podés restaurarlos al censo activo o eliminarlos definitivamente de Supabase para no ocupar espacio."
            icon={Archive}
          />

          {/* Search bar for archived */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex items-center gap-3">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar en pacientes archivados por nombre, historia clínica, tutor..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>

          {/* Archived Patients List */}
          {archivedPatients.filter((p) => {
            const q = search.toLowerCase();
            const owner = owners.find((o) => o.id === p.ownerId);
            const ownerName = owner ? `${owner.firstName} ${owner.lastName}`.toLowerCase() : '';
            return (
              (p.name || '').toLowerCase().includes(q) ||
              (p.clinicalRecordNumber || '').toLowerCase().includes(q) ||
              (p.breed || '').toLowerCase().includes(q) ||
              ownerName.includes(q)
            );
          }).length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-2 shadow-xs">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto text-amber-700 text-xl font-bold">
                📁
              </div>
              <h3 className="text-sm font-black text-slate-800">No hay pacientes archivados</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Los pacientes a los que se les otorgue Alta Médica o que sean archivados desde el censo activo aparecerán en esta sección.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {archivedPatients
                .filter((p) => {
                  const q = search.toLowerCase();
                  const owner = owners.find((o) => o.id === p.ownerId);
                  const ownerName = owner ? `${owner.firstName} ${owner.lastName}`.toLowerCase() : '';
                  return (
                    (p.name || '').toLowerCase().includes(q) ||
                    (p.clinicalRecordNumber || '').toLowerCase().includes(q) ||
                    (p.breed || '').toLowerCase().includes(q) ||
                    ownerName.includes(q)
                  );
                })
                .map((patient) => {
                  const owner = owners.find((o) => o.id === patient.ownerId);

                  return (
                    <div
                      key={patient.id}
                      className="bg-white border border-amber-200/80 rounded-3xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-400 transition-colors"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={patient.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                              alt={patient.name}
                              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-2xs grayscale"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-black text-slate-900">{patient.name}</h3>
                                <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                                  {patient.clinicalRecordNumber || 'HC-0000'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium">
                                {patient.species} • {patient.breed || 'Mestizo'}
                              </p>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                            Archivado
                          </span>
                        </div>

                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                          <p>
                            <strong>Tutor:</strong> {owner ? `${owner.firstName} ${owner.lastName}` : 'Sin tutor'} {owner?.phone ? `(${owner.phone})` : ''}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Peso registrado: <strong>{patient.weight || 0} kg</strong>
                          </p>
                        </div>
                      </div>

                      {/* Action buttons for archived */}
                      <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('medium');
                            unarchivePatient(patient.id);
                          }}
                          className="flex-1 min-h-[38px] px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black text-xs rounded-xl border border-emerald-300 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
                          title="Restaurar al censo de pacientes activos"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Restaurar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('heavy');
                            if (window.confirm(`¿Está seguro de ELIMINAR DEFINITIVAMENTE al paciente ${patient.name}? Se borrará de la base de datos de Supabase y se liberará espacio en el sistema.`)) {
                              deletePatient(patient.id);
                            }
                          }}
                          className="min-h-[38px] px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 font-black text-xs rounded-xl border border-rose-200 flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
                          title="Eliminar de Supabase definitivamente para liberar espacio"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'PACIENTES' && (
        <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        category="Gestión Clínica & Registro Hospitalario"
        title="Directorio de Pacientes"
        description="Fichas clínicas completas, microchips ISO, trazabilidad de tutores y alertas médicas en tiempo real"
        icon={PawPrint}
        actions={[
          {
            label: 'Exportar Censo',
            icon: Download,
            onClick: handleExportCSV,
            variant: 'secondary',
            title: 'Exportar censo de pacientes a archivo Excel / CSV',
          },
          {
            label: 'Nuevo Paciente',
            icon: Plus,
            onClick: () => setQuickModal('NUEVO_PACIENTE'),
            variant: 'primary',
          },
        ]}
      />

      {/* Quick Filter Tabs by Status (Swipeable on mobile) */}
      <div className="w-full max-w-full flex items-center gap-2 text-xs overflow-x-auto pb-1.5 no-scrollbar sm:flex-wrap snap-x touch-pan-x min-w-0">
        <button
          onClick={() => { setStatusFilter('TODOS'); setSpeciesFilter('TODOS'); }}
          className={`flex-shrink-0 snap-start px-3.5 py-1.5 rounded-xl font-bold transition-all active:scale-95 ${
            statusFilter === 'TODOS' && speciesFilter === 'TODOS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Todos ({patients.length})
        </button>

        <button
          onClick={() => { setSpeciesFilter('Canino'); setStatusFilter('TODOS'); }}
          className={`flex-shrink-0 snap-start px-3.5 py-1.5 rounded-xl font-bold transition-all active:scale-95 ${
            speciesFilter === 'Canino'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🐕 Caninos ({canineCount})
        </button>

        <button
          onClick={() => { setSpeciesFilter('Felino'); setStatusFilter('TODOS'); }}
          className={`flex-shrink-0 snap-start px-3.5 py-1.5 rounded-xl font-bold transition-all active:scale-95 ${
            speciesFilter === 'Felino'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🐈 Felinos ({felineCount})
        </button>

        {exoticCount > 0 && (
          <button
            onClick={() => { setSpeciesFilter('Exótico'); setStatusFilter('TODOS'); }}
            className={`flex-shrink-0 snap-start px-3.5 py-1.5 rounded-xl font-bold transition-all active:scale-95 ${
              speciesFilter === 'Exótico'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            🦜 Exóticos ({exoticCount})
          </button>
        )}

        <button
          onClick={() => { setStatusFilter('INTERNADO'); setSpeciesFilter('TODOS'); }}
          className={`flex-shrink-0 snap-start px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
            statusFilter === 'INTERNADO'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Internados ({internedCount})</span>
        </button>

        <button
          onClick={() => { setStatusFilter('ALTA_MEDICA'); setSpeciesFilter('TODOS'); }}
          className={`flex-shrink-0 snap-start px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
            statusFilter === 'ALTA_MEDICA'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Dados de Alta / Recuperados ({patients.filter((p) => p.status === 'ALTA_MEDICA').length})</span>
        </button>

        <button
          onClick={() => { setStatusFilter('ARCHIVADO'); setSpeciesFilter('TODOS'); }}
          className={`flex-shrink-0 snap-start px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
            statusFilter === 'ARCHIVADO'
              ? 'bg-[#8C6B43] text-white shadow-xs'
              : 'bg-white text-[#6E502B] border border-[#DDD7C8] hover:bg-[#FAF8F5]'
          }`}
        >
          <span>📁 Archivados ({patients.filter((p) => p.status === 'ARCHIVADO').length})</span>
        </button>

        <button
          onClick={() => { setStatusFilter('ALERGIAS'); setSpeciesFilter('TODOS'); }}
          className={`flex-shrink-0 snap-start px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
            statusFilter === 'ALERGIAS'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Con Alergias / Alertas ({allergicCount})</span>
        </button>
      </div>

      {/* Search & Layout Toggle Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs w-full max-w-full">
        <div className="flex-1 w-full">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre, historia clínica, raza, microchip ISO, tutor o teléfono..."
          />
        </div>

        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2 flex-shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-slate-400">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-bold text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              <option value="NAME_ASC">Nombre (A - Z)</option>
              <option value="RECENT">Más Recientes</option>
              <option value="WEIGHT_DESC">Mayor Peso</option>
              <option value="WEIGHT_ASC">Menor Peso</option>
              <option value="AGE_DESC">Mayor Edad</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => {
                triggerHaptic('light');
                setViewMode('GRID');
              }}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'GRID' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setViewMode('TABLE');
              }}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'TABLE' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en Tabla Clínica"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Patients Display */}
      {filteredPatients.length === 0 ? (
        <EmptyState
          icon={PawPrint}
          title="No se encontraron pacientes"
          description={
            search || speciesFilter !== 'TODOS' || statusFilter !== 'TODOS'
              ? 'No hay pacientes que coincidan con los términos de búsqueda o filtros seleccionados.'
              : 'Aún no hay pacientes registrados en el censo hospitalario.'
          }
          actionLabel="Registrar Nuevo Paciente"
          onAction={() => setQuickModal('NUEVO_PACIENTE')}
        />
      ) : viewMode === 'GRID' ? (
        /* GRID MODE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPatients.map((patient) => {
            const owner = owners.find((o) => o.id === patient.ownerId);
            const isInterned = patient.status === 'INTERNADO' || hospitalizations.some((h) => h.patientId === patient.id && h.status === 'ACTIVA');
            const hasCriticalAlerts = patient.alerts && patient.alerts.length > 0;

            return (
              <div
                key={patient.id}
                onClick={() => handleOpenPatient(patient.id)}
                className="bg-white border border-slate-200 hover:border-teal-500/60 rounded-3xl p-5 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between group shadow-2xs space-y-4"
              >
                <div>
                  {/* Header photo & badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={patient.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                          alt={patient.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 group-hover:border-teal-500 transition-colors shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute -bottom-1 -right-1 text-xs">
                          {patient.species === 'Canino' ? '🐕' : patient.species === 'Felino' ? '🐈' : '🦜'}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                            {patient.name || 'Paciente'}
                          </h3>
                          <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                            {patient.clinicalRecordNumber || 'HC-0000'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          {[patient.species, patient.breed].filter(Boolean).join(' • ') || 'Especie no especificada'}
                        </p>
                        <p className="text-xs text-slate-700 font-semibold mt-0.5">
                          {[
                            patient.sex,
                            patient.reproductiveStatus ? `(${patient.reproductiveStatus})` : null,
                            patient.calculatedAge,
                          ]
                            .filter(Boolean)
                            .join(' • ')}{' '}
                          • <span className="font-mono text-teal-800 font-bold">{formatWeight(patient.weight)}</span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isInterned
                          ? 'bg-red-50 text-red-600 border border-red-200 font-black animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isInterned ? 'INTERNADO' : patient.status}
                    </span>
                  </div>

                  {/* Microchip Badge if available */}
                  {patient.microchip && (
                    <div className="mb-2.5 flex items-center justify-between bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-[11px] font-mono text-slate-600">
                      <span className="text-[10px] text-slate-400 font-bold">CHIP ISO:</span>
                      <div className="flex items-center gap-1.5">
                        <span>{patient.microchip}</span>
                        <button
                          onClick={(e) => handleCopyMicrochip(patient.microchip!, e)}
                          className="text-teal-600 hover:text-teal-800 p-0.5 rounded"
                          title="Copiar código microchip"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Alerts Pill */}
                  {hasCriticalAlerts && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {patient.alerts.map((al, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200 truncate max-w-full"
                        >
                          ⚠️ {formatAlertLabel(al.type)}: {al.description}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Owner info */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs text-slate-500 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Tutor Responsable:
                      </span>
                      {owner && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openWhatsAppHub({
                              patientName: patient.name,
                              species: patient.species,
                              ownerName: `${owner.firstName} ${owner.lastName}`,
                              ownerPhone: owner.phone,
                              diagnosis: 'Control general en clínica veterinaria',
                            });
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors"
                        >
                          <span>💬</span>
                          <span>WhatsApp</span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-slate-800 font-semibold">
                      <span>{owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{owner?.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Card Fast Action Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPatient(patient.id, 'HISTORIA');
                      }}
                      className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold text-[10px] transition-colors border border-teal-200"
                      title="Ver Evolución Médica"
                    >
                      Evolución
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDentalChart(patient.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 transition-colors"
                      title="Abrir Odontograma Triadan"
                    >
                      🦷
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openBodyMap(patient.id);
                      }}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 transition-colors"
                      title="Abrir Mapa Corporal de Lesiones"
                    >
                      🐾
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenPatient(patient.id, 'SIGNOS');
                      }}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border border-slate-200 transition-colors"
                      title="Ver Signos Vitales"
                    >
                      <Activity className="w-3.5 h-3.5 text-teal-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedConsentPatient(patient);
                      }}
                      className="px-2 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-[10px] transition-colors border border-teal-300 flex items-center gap-1 shadow-2xs"
                      title="Generar y firmar consentimiento informado"
                    >
                      <FileText className="w-3 h-3 text-teal-700" />
                      <span>Consentimiento</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDischargeModalPatient(patient);
                      }}
                      className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[10px] transition-colors border border-emerald-300 flex items-center gap-1 shadow-2xs"
                      title="Dar de Alta Médica o Archivar"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Alta</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHistoryDownloadModalPatient(patient);
                      }}
                      className="px-2 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#EFECE3] text-[#1C2B1D] font-bold text-[10px] transition-colors border border-[#DDD7C8] flex items-center gap-1 shadow-2xs"
                      title="Descargar Historia Clínica Completa"
                    >
                      <FileText className="w-3 h-3 text-[#5F7359]" />
                      <span>HC</span>
                    </button>
                  </div>

                  <span className="font-bold text-teal-600 group-hover:text-teal-700 flex items-center gap-1">
                    <span>Ficha 360°</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE MODE (SMART RESPONSIVE: CARDS ON MOBILE < sm, CONDENSED/FULL TABLE ON >= sm) */
        <div className="space-y-3 w-full max-w-full">
          {/* 1. Mobile Patient Cards View (< sm / < 640px) */}
          <div className="block sm:hidden space-y-3 w-full">
            {filteredPatients.map((patient) => {
              const owner = owners.find((o) => o.id === patient.ownerId);
              const isInterned =
                patient.status === 'INTERNADO' ||
                hospitalizations.some((h) => h.patientId === patient.id && h.status === 'ACTIVA');

              return (
                <PatientMobileCard
                  key={patient.id}
                  patient={patient}
                  owner={owner}
                  isInterned={isInterned}
                  onOpenPatient={handleOpenPatient}
                  onOpenSOAP={(id) => {
                    handleOpenPatient(id, 'HISTORIA');
                  }}
                  onOpenDentalChart={openDentalChart}
                  onOpenBodyMap={openBodyMap}
                  onOpenWhatsApp={openWhatsAppHub}
                  onOpenDischarge={(p) => setDischargeModalPatient(p)}
                  onOpenHistory={(p) => setHistoryDownloadModalPatient(p)}
                />
              );
            })}
          </div>

          {/* 2. Desktop & Tablet Table (>= sm / >= 640px) */}
          <div className="hidden sm:block bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm w-full">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                  <tr>
                    <th className="p-3.5">Paciente & HC</th>
                    <th className="p-3.5">Especie / Raza</th>
                    <th className="p-3.5">Sexo & Edad</th>
                    <th className="p-3.5 text-center">Peso (kg)</th>
                    <th className="p-3.5">Microchip ISO</th>
                    <th className="p-3.5">Estado</th>
                    <th className="p-3.5">Tutor Responsable</th>
                    <th className="p-3.5">Alertas</th>
                    <th className="p-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredPatients.map((patient) => {
                    const owner = owners.find((o) => o.id === patient.ownerId);
                    const isInterned = patient.status === 'INTERNADO' || hospitalizations.some((h) => h.patientId === patient.id && h.status === 'ACTIVA');
                    const hasCriticalAlerts = patient.alerts && patient.alerts.length > 0;

                    return (
                      <tr
                        key={patient.id}
                        onClick={() => handleOpenPatient(patient.id)}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        {/* Patient & Avatar */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={patient.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                              alt={patient.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <span className="font-bold text-slate-900 block">{patient.name}</span>
                              <span className="text-[10px] font-mono text-teal-700">{patient.clinicalRecordNumber}</span>
                            </div>
                          </div>
                        </td>

                        {/* Species & Breed */}
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 block">{patient.species}</span>
                          <span className="text-[11px] text-slate-500">{[patient.breed, patient.color ? `(${patient.color})` : null].filter(Boolean).join(' ')}</span>
                        </td>

                        {/* Sex & Age */}
                        <td className="p-3.5">
                          <span className="text-slate-800 block">{patient.sex} {patient.reproductiveStatus ? `(${patient.reproductiveStatus})` : ''}</span>
                          <span className="text-[11px] text-slate-400">{patient.calculatedAge}</span>
                        </td>

                        {/* Weight */}
                        <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                          {patient.weight} kg
                        </td>

                        {/* Microchip */}
                        <td className="p-3.5 font-mono text-[11px] text-slate-600">
                          {patient.microchip ? (
                            <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {patient.microchip}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Sin Chip</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              isInterned
                                ? 'bg-red-50 text-red-600 border border-red-200 font-black animate-pulse'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isInterned ? 'INTERNADO' : patient.status}
                          </span>
                        </td>

                        {/* Owner */}
                        <td className="p-3.5">
                          <span className="font-bold text-slate-900 block">
                            {owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">{maskPhoneNumber(owner?.phone, currentUser?.role === 'SUPERADMIN' || currentUser?.role === 'VETERINARIO')}</span>
                        </td>

                        {/* Alerts */}
                        <td className="p-3.5">
                          {hasCriticalAlerts ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 block truncate max-w-[150px]">
                              ⚠️ {formatAlertLabel(patient.alerts[0].type)}
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600">Sin Alergias</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            {owner && (
                              <button
                                onClick={() =>
                                  openWhatsAppHub({
                                    patientName: patient.name,
                                    species: patient.species,
                                    ownerName: `${owner.firstName} ${owner.lastName}`,
                                    ownerPhone: owner.phone,
                                    diagnosis: 'Control general en clínica veterinaria',
                                  })
                                }
                                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                                title="Enviar WhatsApp al tutor"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedConsentPatient(patient)}
                              className="px-2.5 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-xs border border-teal-300 transition-colors flex items-center gap-1 shadow-2xs"
                              title="Generar, visualizar y firmar consentimiento informado oficial (Digital o Papel PDF)"
                            >
                              <FileText className="w-3.5 h-3.5 text-teal-700" />
                              <span>Consentimiento</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDischargeModalPatient(patient)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Dar de Alta Médica y Archivar"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Alta Médica</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Archivar la ficha de ${patient.name}? Pasará a Pacientes Archivados.`)) {
                                  archivePatient(patient.id);
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-200 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Archivar ficha del paciente"
                            >
                              <Archive className="w-3.5 h-3.5 text-amber-700" />
                              <span>Archivar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`¿Está seguro de eliminar definitivamente a ${patient.name}? Esta acción borrará al paciente de la base de datos.`)) {
                                  deletePatient(patient.id);
                                }
                              }}
                              className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Eliminar paciente de la base de datos"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            </button>
                            <button
                              onClick={() => setHistoryDownloadModalPatient(patient)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-[#EFECE3] text-[#1C2B1D] font-bold text-xs border border-[#DDD7C8] transition-colors flex items-center gap-1 shadow-2xs"
                              title="Descargar Historia Clínica Completa"
                            >
                              <FileText className="w-3.5 h-3.5 text-[#5F7359]" />
                              <span>Historia Clínica</span>
                            </button>
                            <button
                              onClick={() => handleOpenPatient(patient.id)}
                              className="px-3 py-1.5 bg-[#5F7359] hover:bg-[#4D5E48] text-white font-bold rounded-lg text-xs transition-colors shadow-2xs"
                            >
                              Ficha 360° →
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
      </div>
    )}

    {/* Modal de Consentimiento Informado Veterinario */}
    {selectedConsentPatient && (
      <PatientInformedConsentModal
        isOpen={!!selectedConsentPatient}
        onClose={() => setSelectedConsentPatient(null)}
        patient={selectedConsentPatient}
        owner={owners.find((o) => o.id === selectedConsentPatient.ownerId)}
      />
    )}

    {/* Modales de Alta Médica y Descarga de Historia Clínica */}
    <PatientDischargeModal
      isOpen={!!dischargeModalPatient}
      onClose={() => setDischargeModalPatient(null)}
      patient={dischargeModalPatient}
      owner={owners.find((o) => o.id === dischargeModalPatient?.ownerId)}
    />

    <PatientMedicalHistoryDownloadModal
      isOpen={!!historyDownloadModalPatient}
      onClose={() => setHistoryDownloadModalPatient(null)}
      patient={historyDownloadModalPatient}
      owner={owners.find((o) => o.id === historyDownloadModalPatient?.ownerId)}
    />
  </div>
);
};