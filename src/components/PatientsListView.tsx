import React, { useState } from 'react';
import {
  PawPrint,
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
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Patient } from '../types';
import { formatWeight } from '../utils/formatters';

export const PatientsListView: React.FC = () => {
  const {
    patients,
    owners,
    hospitalizations,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openWhatsAppHub,
    openDentalChart,
    openBodyMap,
    showToast,
  } = useVet();

  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Filter logic
  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    const owner = owners.find((o) => o.id === p.ownerId);
    const ownerName = owner ? `${owner.firstName} ${owner.lastName}`.toLowerCase() : '';
    const ownerPhone = owner?.phone || '';

    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.clinicalRecordNumber.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q) ||
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
    } else if (statusFilter === 'ALERGIAS') {
      matchesStatus = !!(p.alerts && p.alerts.length > 0);
    } else if (statusFilter !== 'TODOS') {
      matchesStatus = p.status === statusFilter;
    }

    return matchesSearch && matchesSpecies && matchesStatus;
  });

  const handleOpenPatient = (id: string, tab = 'RESUMEN') => {
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

  // Counts for fast badges
  const canineCount = patients.filter((p) => p.species?.toUpperCase() === 'CANINO').length;
  const felineCount = patients.filter((p) => p.species?.toUpperCase() === 'FELINO').length;
  const exoticCount = patients.filter((p) => p.species?.toUpperCase() === 'EXOTICO' || p.species?.toUpperCase() === 'EXÓTICO').length;
  const internedCount = patients.filter((p) => p.status === 'INTERNADO' || hospitalizations.some((h) => h.patientId === p.id && h.status === 'ACTIVA')).length;
  const allergicCount = patients.filter((p) => p.alerts && p.alerts.length > 0).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Gestión Clínica & Registro Hospitalario
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PawPrint className="w-6 h-6 text-teal-600" />
            <span>Directorio de Pacientes</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Fichas clínicas completas, microchips ISO, trazabilidad de tutores y alertas médicas en tiempo real
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl shadow-2xs transition-all"
            title="Exportar censo de pacientes a archivo Excel / CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Exportar Censo</span>
          </button>

          <button
            onClick={() => setQuickModal('NUEVO_PACIENTE')}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs by Status */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          onClick={() => { setStatusFilter('TODOS'); setSpeciesFilter('TODOS'); }}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            statusFilter === 'TODOS' && speciesFilter === 'TODOS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Todos ({patients.length})
        </button>

        <button
          onClick={() => { setSpeciesFilter('Canino'); setStatusFilter('TODOS'); }}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
            speciesFilter === 'Canino'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🐕 Caninos ({canineCount})
        </button>

        <button
          onClick={() => { setSpeciesFilter('Felino'); setStatusFilter('TODOS'); }}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
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
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
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
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
            statusFilter === 'INTERNADO'
              ? 'bg-red-600 text-white shadow-xs'
              : 'bg-white text-red-600 border border-red-200 hover:bg-red-50'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>Internados ({internedCount})</span>
        </button>

        <button
          onClick={() => { setStatusFilter('ALERGIAS'); setSpeciesFilter('TODOS'); }}
          className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
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
      <div className="bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, historia clínica, raza, microchip ISO, tutor o teléfono..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto flex-shrink-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'GRID' ? 'bg-white text-teal-700 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vista en Tarjetas"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
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
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
          <PawPrint className="w-12 h-12 mx-auto text-slate-300 mb-2" />
          <p className="font-bold text-slate-700 text-sm">No se encontraron pacientes con los filtros seleccionados</p>
          <p className="text-xs">
            Probá ajustando los términos de búsqueda o registrá un nuevo paciente.
          </p>
        </div>
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
                          ⚠️ {al.type}: {al.description}
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
        /* TABLE MODE */
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
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
                        <span className="text-[11px] text-slate-500">{patient.breed}</span>
                      </td>

                      {/* Sex & Age */}
                      <td className="p-3.5">
                        <span className="text-slate-800 block">{patient.sex}</span>
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
                        <span className="text-[11px] font-mono text-slate-500">{owner?.phone}</span>
                      </td>

                      {/* Alerts */}
                      <td className="p-3.5">
                        {hasCriticalAlerts ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 block truncate max-w-[150px]">
                            ⚠️ {patient.alerts[0].type}
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
                            onClick={() => handleOpenPatient(patient.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700 font-bold rounded-lg text-xs transition-colors"
                          >
                            Ver Ficha →
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
      )}
    </div>
  );
};
