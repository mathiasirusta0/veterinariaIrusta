import React, { useState } from 'react';
import {
  Syringe,
  Plus,
  Printer,
  Calendar,
  ShieldCheck,
  PawPrint,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  MessageCircle,
  Clock,
  Sparkles,
  QrCode,
  Award,
  FileCheck,
  User,
  ExternalLink,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { VaccinationRecord, Patient, Species } from '../types';
import { formatDate, formatWeight } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, SearchInput, FilterBar } from './ui';

interface VaccinePreset {
  name: string;
  species: Species;
  categoryLabel: string;
  type: string;
  manufacturer: string;
  durationMonths: number;
  notes: string;
}

const MILITARY_AND_CLINICAL_PRESETS: VaccinePreset[] = [
  // ÉQUIDOS (CABALLOS, BURROS, MULAS)
  {
    name: 'Toxoide Tetánico Equino (Tétanos)',
    species: 'EQUINO',
    categoryLabel: '🐎 Équidos (Caballo / Burro / Mula)',
    type: 'Plan Sanitario Militar Obligatorio',
    manufacturer: 'Laboratorio Biológico Equino',
    durationMonths: 12,
    notes: 'Inmunización contra Clostridium tetani. Vital en animales de caballería, trabajo y herrado.',
  },
  {
    name: 'Influenza Equina Bivalente (Gripe)',
    species: 'EQUINO',
    categoryLabel: '🐎 Équidos (Caballo / Burro / Mula)',
    type: 'Sanidad Operativa / Tropilla',
    manufacturer: 'BioEquus / Boehringer',
    durationMonths: 6,
    notes: 'Cepa A/Equi 1 y A/Equi 2. Refuerzo semestral para tropillas en actividad y traslado.',
  },
  {
    name: 'Adenitis Equina / Papera (Streptococcus equi)',
    species: 'EQUINO',
    categoryLabel: '🐎 Équidos (Caballo / Burro / Mula)',
    type: 'Prevención de Papera Equina',
    manufacturer: 'Biogénesis Bagó',
    durationMonths: 12,
    notes: 'Prevención de adenitis en potrillos y équidos de escuadrón.',
  },
  {
    name: 'Encefalomielitis Equina (Oeste / Este)',
    species: 'EQUINO',
    categoryLabel: '🐎 Équidos (SENASA Obligatorio)',
    type: 'Vacunación Oficial Obligatoria SENASA',
    manufacturer: 'Laboratorio Rosenbusch',
    durationMonths: 12,
    notes: 'Obligatoria para movimiento de animales y tránsito federal.',
  },
  {
    name: 'Desparasitación Estratégica Équidos (Ivermectina + Praziquantel)',
    species: 'EQUINO',
    categoryLabel: '🐎 Équidos (Control Antiparasitario)',
    type: 'Plan Antiparasitario de Tropa',
    manufacturer: 'Zoetis Equine',
    durationMonths: 4,
    notes: 'Control de grandes y pequeños estróngilos, ascárides y tenias.',
  },
  {
    name: 'Control AIE / Test de Coggins Negativo',
    species: 'EQUINO',
    categoryLabel: '🐎 Équidos (Certificación Sanitaria)',
    type: 'Libreta Sanitaria / Certificado AIE',
    manufacturer: 'Laboratorio de Red Oficial SENASA',
    durationMonths: 6,
    notes: 'Diagnóstico serológico de Anemia Infecciosa Equina. Validez 60 a 180 días según destino.',
  },

  // CANINOS (K9 TÁCTICOS Y COMPAÑÍA)
  {
    name: 'Séxtuple / Óctuple Canina K9',
    species: 'CANINO',
    categoryLabel: '🐕 Canino K9 / Patrulla',
    type: 'Inmunización Completa Táctica',
    manufacturer: 'Nobivac / Zoetis Vanguard',
    durationMonths: 12,
    notes: 'Parvovirus, Moquillo, Hepatitis, Leptospira 4 serovares, Parainfluenza.',
  },
  {
    name: 'Antirrábica Obligatoria (Cepa Pasteur)',
    species: 'CANINO',
    categoryLabel: '🐕 / 🐎 Vacuna Antirrábica',
    type: 'Vacunación Obligatoria por Ley',
    manufacturer: 'Laboratorio Pasteur / Nobivac Rabies',
    durationMonths: 12,
    notes: 'Obligatoria nacional con emisión de certificado oficial y número de oblea.',
  },
  {
    name: 'Tos de las Perreras (Bordetella bronchiseptica)',
    species: 'CANINO',
    categoryLabel: '🐕 Canino K9 (Acuartelamiento)',
    type: 'Complejo Respiratorio Infeccioso',
    manufacturer: 'Nobivac KC / Bronchicine',
    durationMonths: 12,
    notes: 'Fundamental para perros en caniles grupales, patrulla o adiestramiento.',
  },

  // FELINOS
  {
    name: 'Triple Felina + Leucemia (FeLV)',
    species: 'FELINO',
    categoryLabel: '🐈 Felino',
    type: 'Inmunización Felina Completa',
    manufacturer: 'Felocell / Purevax',
    durationMonths: 12,
    notes: 'Rinotraqueítis, Calicivirus, Panleucopenia y Leucemia viral felina.',
  },
];

export const VaccinationView: React.FC = () => {
  const {
    vaccinations,
    patients,
    owners,
    addVaccination,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openWhatsAppHub,
    showToast,
  } = useVet();

  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('TODAS');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [selectedCertModal, setSelectedCertModal] = useState<VaccinationRecord | null>(null);

  // New Vaccination Form Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [formPatientId, setFormPatientId] = useState(patients[0]?.id || 'pat-1');
  const [formVaccineName, setFormVaccineName] = useState('Toxoide Tetánico Equino (Tétanos)');
  const [formType, setFormType] = useState('Plan Sanitario Militar Obligatorio');
  const [formManufacturer, setFormManufacturer] = useState('Laboratorio Biológico Equino');
  const [formBatchNumber, setFormBatchNumber] = useState('LT-EQ-' + Math.floor(1000 + Math.random() * 9000));
  const [formDurationMonths, setFormDurationMonths] = useState(12);
  const [formRegimentUnit, setFormRegimentUnit] = useState('Regimiento de Caballería / Escuadrón de Montaña');
  const [formNotes, setFormNotes] = useState('Animal inspeccionado clínicamente apto para vacunación sin fiebre.');

  const today = new Date();

  const filteredVaccinations = vaccinations.filter((vac) => {
    const q = (search || '').toLowerCase();
    const patient = patients.find((p) => p.id === vac.patientId);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
    const petName = (patient?.name || '').toLowerCase();
    const hc = (patient?.clinicalRecordNumber || '').toLowerCase();
    const passport = (patient?.equinePassport || '').toLowerCase();
    const chip = (patient?.microchip || '').toLowerCase();
    const vacName = (vac.vaccineName || '').toLowerCase();
    const batch = (vac.batchNumber || '').toLowerCase();
    const unit = (vac.regimentUnit || '').toLowerCase();
    const tutor = owner ? (owner.firstName + ' ' + owner.lastName).toLowerCase() : '';

    const matchesSearch =
      petName.includes(q) ||
      hc.includes(q) ||
      passport.includes(q) ||
      chip.includes(q) ||
      vacName.includes(q) ||
      batch.includes(q) ||
      unit.includes(q) ||
      tutor.includes(q);

    let matchesSpecies = true;
    if (speciesFilter !== 'TODAS') {
      if (speciesFilter === 'EQUIDOS') {
        matchesSpecies = patient?.species === 'EQUINO' || (patient?.species as any) === 'ASNAL' || (patient?.species as any) === 'MULAR';
      } else {
        matchesSpecies = patient?.species === speciesFilter;
      }
    }

    let matchesStatus = true;
    if (statusFilter !== 'TODOS') {
      const dueDate = new Date(vac.nextDueDate);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (statusFilter === 'VENCIDA') matchesStatus = diffDays < 0;
      else if (statusFilter === 'POR_VENCER') matchesStatus = diffDays >= 0 && diffDays <= 30;
      else if (statusFilter === 'VIGENTE') matchesStatus = diffDays > 30;
    }

    return matchesSearch && matchesSpecies && matchesStatus;
  });

  const handleApplyPreset = (preset: VaccinePreset) => {
    triggerHaptic('medium');
    setFormVaccineName(preset.name);
    setFormType(preset.type);
    setFormManufacturer(preset.manufacturer);
    setFormDurationMonths(preset.durationMonths);
    setFormNotes(preset.notes);
    showToast('info', 'Plantilla Aplicada', 'Biológico: ' + preset.name);
  };

  const handleSaveVaccination = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + Number(formDurationMonths));

    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 2);

    addVaccination({
      patientId: formPatientId,
      vaccineName: formVaccineName,
      type: formType,
      manufacturer: formManufacturer,
      batchNumber: formBatchNumber,
      expirationDate: expDate.toISOString().split('T')[0],
      nextDueDate: nextDate.toISOString().split('T')[0],
      certificateGenerated: true,
      regimentUnit: formRegimentUnit,
      notes: formNotes,
    });

    setIsNewModalOpen(false);
    showToast('success', 'Plan Sanitario Registrado', 'Inmunización registrada con vencimiento el ' + formatDate(nextDate.toISOString().split('T')[0]));
  };

  const handleSendWhatsApp = (vac: VaccinationRecord) => {
    triggerHaptic('light');
    const patient = patients.find((p) => p.id === vac.patientId);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
    if (!owner) return;

    openWhatsAppHub({
      patientName: patient?.name || 'su animal',
      ownerName: owner.firstName + ' ' + owner.lastName,
      ownerPhone: owner.phone || owner.whatsapp || '',
      type: 'VACUNACION_RECORDATORIO',
      details: {
        vaccineName: vac.vaccineName,
        administeredDate: formatDate(vac.administeredDate),
        nextDueDate: formatDate(vac.nextDueDate),
        batchNumber: vac.batchNumber,
      },
    });
  };

  const speciesFilterOptions = [
    { id: 'TODAS', label: 'Todas las Especies', badge: vaccinations.length },
    {
      id: 'EQUIDOS',
      label: '🐎 Équidos (Caballo/Burro/Mula)',
      badge: vaccinations.filter((v) => {
        const p = patients.find((pt) => pt.id === v.patientId);
        return p?.species === 'EQUINO' || (p?.species as any) === 'ASNAL' || (p?.species as any) === 'MULAR';
      }).length,
    },
    {
      id: 'CANINO',
      label: '🐕 Caninos K9 / Patrulla',
      badge: vaccinations.filter((v) => {
        const p = patients.find((pt) => pt.id === v.patientId);
        return p?.species === 'CANINO';
      }).length,
    },
    {
      id: 'FELINO',
      label: '🐈 Felinos',
      badge: vaccinations.filter((v) => {
        const p = patients.find((pt) => pt.id === v.patientId);
        return p?.species === 'FELINO';
      }).length,
    },
  ];

  const statusFilterOptions = [
    { id: 'TODOS', label: 'Todos los Estados' },
    { id: 'VIGENTE', label: '🟢 Vigentes (>30d)' },
    { id: 'POR_VENCER', label: '🟡 Por Vencer (<30d)' },
    { id: 'VENCIDA', label: '🔴 Vencidas / Alerta' },
  ];

  return (
    <div className="space-y-5 pb-16 w-full max-w-full">
      {/* 1. Header */}
      <PageHeader
        category="Sanidad Animal, Inmunización & Veterinaria Militar"
        title="Plan de Vacunación & Sanidad Oficial"
        description="Control de biológicos, lotes y vencimientos para Équidos (Caballos, Burros, Mulas), Caninos K9 y Pequeños Animales"
        icon={Syringe}
        actions={[
          {
            label: 'Registrar Inmunización',
            icon: Plus,
            onClick: () => setIsNewModalOpen(true),
            variant: 'primary',
          },
        ]}
      />

      {/* 2. Military & Veterinary Presets Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Planes Sanitarios Frecuentes (Équidos de Tropa / K9 Militar / Clínica):
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {MILITARY_AND_CLINICAL_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                handleApplyPreset(preset);
                setIsNewModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 hover:text-teal-900 border border-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-2xs"
            >
              <span>{preset.species === 'EQUINO' ? '🐎' : preset.species === 'CANINO' ? '🐕' : '🐈'}</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs space-y-3 w-full max-w-full">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por biológico, paciente, HC, pasaporte equino, lote o unidad..."
        />

        <FilterBar
          options={speciesFilterOptions}
          activeId={speciesFilter}
          onSelect={setSpeciesFilter}
          label="Especie / Categoría"
        />

        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-100">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Estado Sanitario:</span>
          {statusFilterOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStatusFilter(opt.id)}
              className={'px-2.5 py-1 rounded-lg font-bold text-xs transition-all ' +
                (statusFilter === opt.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Vaccinations List */}
      <div className="space-y-4 w-full">
        {filteredVaccinations.length === 0 ? (
          <EmptyState
            icon={Syringe}
            title="No se encontraron registros de vacunación"
            description={
              search || speciesFilter !== 'TODAS' || statusFilter !== 'TODOS'
                ? 'No hay biológicos que coincidan con la búsqueda o filtro seleccionado.'
                : 'No se han registrado aplicaciones biológicas en el sistema aún.'
            }
            actionLabel="Registrar Primera Inmunización"
            onAction={() => setIsNewModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVaccinations.map((vac) => {
              const patient = patients.find((p) => p.id === vac.patientId);
              const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;

              const dueDate = new Date(vac.nextDueDate);
              const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              const isOverdue = diffDays < 0;
              const isWarning = diffDays >= 0 && diffDays <= 30;

              const speciesEmoji =
                patient?.species === 'EQUINO'
                  ? '🐎 Caballo'
                  : (patient?.species as any) === 'ASNAL'
                  ? '🫏 Burro'
                  : (patient?.species as any) === 'MULAR'
                  ? '🐴 Mula'
                  : patient?.species === 'CANINO'
                  ? '🐕 Canino K9'
                  : '🐈 Felino';

              const cardBorder = isOverdue
                ? 'border-rose-300 ring-2 ring-rose-200/60 bg-rose-50/10'
                : isWarning
                ? 'border-amber-300 ring-2 ring-amber-200/50 bg-amber-50/10'
                : 'border-slate-200/90 hover:border-teal-500/60';

              const statusBadge = isOverdue ? (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                  ⚠️ VENCIDA ({Math.abs(diffDays)}d)
                </span>
              ) : isWarning ? (
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  ⏳ VENCE EN {diffDays} DÍAS
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ✓ VIGENTE ({diffDays}d)
                </span>
              );

              return (
                <div
                  key={vac.id}
                  className={'bg-white border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 ' + cardBorder}
                >
                  <div className="space-y-3">
                    {/* Header: Vaccine Name + Status */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {speciesEmoji}
                          </span>
                          {vac.type && (
                            <span className="text-[9px] font-bold text-teal-800 bg-teal-50 px-2 py-0.2 rounded border border-teal-200">
                              {vac.type}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-slate-900 leading-tight pt-1">
                          {vac.vaccineName}
                        </h3>
                      </div>
                      {statusBadge}
                    </div>

                    {/* Patient & Identity */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span
                          onClick={() => {
                            if (patient) {
                              setSelectedPatientId(patient.id);
                              setActivePatientTab('VACUNAS');
                              setActiveView('PACIENTES');
                            }
                          }}
                          className="font-bold text-slate-900 hover:text-teal-700 cursor-pointer text-sm"
                        >
                          {patient?.name || 'Animal / Tropa'}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                          {patient?.clinicalRecordNumber || 'HC-0000'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        {patient?.breed} {patient?.weight ? '• ' + formatWeight(patient.weight) : ''}
                        {patient?.equinePassport ? ' • Pasaporte: ' + patient.equinePassport : ''}
                        {patient?.microchip ? ' • Chip: ' + patient.microchip : ''}
                      </p>

                      <p className="text-[11px] text-slate-600">
                        Responsable / Tutor: <strong>{owner ? (owner.firstName + ' ' + owner.lastName) : 'Comando / Tropa'}</strong>
                      </p>

                      {vac.regimentUnit && (
                        <p className="text-[10px] text-slate-500 font-semibold">
                          Unidad: <span className="text-slate-800">{vac.regimentUnit}</span>
                        </p>
                      )}
                    </div>

                    {/* Bio Data: Batch + Manufacturer + Dates */}
                    <div className="bg-slate-50/90 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-bold uppercase text-[9px]">Lote & Fabricante:</span>
                        <span className="font-mono font-bold text-slate-800">{vac.batchNumber} ({vac.manufacturer})</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Aplicación:</span>
                        <span className="font-bold text-slate-900">{formatDate(vac.administeredDate)}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                        <span className="font-bold text-slate-700">Próximo Refuerzo:</span>
                        <span className={'font-mono font-black ' + (isOverdue ? 'text-rose-600' : 'text-slate-900')}>
                          {formatDate(vac.nextDueDate)}
                        </span>
                      </div>
                    </div>

                    {vac.notes && (
                      <p className="text-[10px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                        "{vac.notes}"
                      </p>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500 text-[10px] truncate block">
                      Vet: <strong>{vac.administeredBy}</strong> ({vac.vetLicense})
                    </span>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {owner && (
                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(vac)}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition-all active:scale-95"
                          title="Enviar aviso de vacunación por WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedCertModal(vac)}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl border border-teal-200 flex items-center gap-1 transition-all active:scale-95"
                        title="Ver Certificado Oficial de Vacunación"
                      >
                        <Award className="w-3.5 h-3.5 text-teal-600" />
                        <span>Certificado</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Modal Registrar Inmunización */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">Registrar Aplicación de Biológico</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVaccination} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Paciente / Animal:</label>
                <select
                  value={formPatientId}
                  onChange={(e) => setFormPatientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} • {p.breed} • {p.clinicalRecordNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Nombre del Biológico / Vacuna:</label>
                <input
                  type="text"
                  value={formVaccineName}
                  onChange={(e) => setFormVaccineName(e.target.value)}
                  required
                  placeholder="Ej: Toxoide Tetánico Equino, Adenitis, Séxtuple K9..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Categoría / Tipo de Plan:</label>
                  <input
                    type="text"
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    placeholder="Ej: Plan Sanitario Militar, SENASA..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Laboratorio Fabricante:</label>
                  <input
                    type="text"
                    value={formManufacturer}
                    onChange={(e) => setFormManufacturer(e.target.value)}
                    required
                    placeholder="Ej: Biogénesis Bagó, Zoetis, Rosenbusch..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Número de Lote:</label>
                  <input
                    type="text"
                    value={formBatchNumber}
                    onChange={(e) => setFormBatchNumber(e.target.value)}
                    required
                    placeholder="Ej: LT-8841-A"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Período de Validez (Meses):</label>
                  <select
                    value={formDurationMonths}
                    onChange={(e) => setFormDurationMonths(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value={3}>3 Meses (Desparasitación intensa)</option>
                    <option value={4}>4 Meses (Desparasitación estratégica)</option>
                    <option value={6}>6 Meses (Influenza equina tropa / AIE Coggins)</option>
                    <option value={12}>12 Meses / 1 Año (Tétanos, Séxtuple, Rabia)</option>
                    <option value={24}>24 Meses / 2 Años</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Unidad / Regimiento / Destino Sanitario:</label>
                <input
                  type="text"
                  value={formRegimentUnit}
                  onChange={(e) => setFormRegimentUnit(e.target.value)}
                  placeholder="Ej: Regimiento de Granaderos / Escuadrón K9 / Haras..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Observaciones Clínicas / Reacción:</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Observaciones de la aplicación..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
                >
                  Guardar & Emitir Certificado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Certificado Oficial de Vacunación & Aptitud */}
      {selectedCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">Certificado Oficial de Inmunización</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCertModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs text-slate-800">
              <div className="text-center pb-2 border-b border-slate-200">
                <span className="font-extrabold text-teal-800 uppercase tracking-widest text-[11px] block">
                  REPÚBLICA ARGENTINA — SANIDAD VETERINARIA MILITAR & OFICIAL
                </span>
                <h4 className="font-black text-slate-900 text-sm mt-0.5">
                  CERTIFICADO DE VACUNACIÓN & APTITUD SANITARIA
                </h4>
              </div>

              {(() => {
                const patient = patients.find((p) => p.id === selectedCertModal.patientId);
                const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;

                return (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Paciente / Animal:</span>
                        <strong className="text-slate-900 text-xs">{patient?.name}</strong> ({patient?.species})
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Raza / Pelaje:</span>
                        <span className="text-slate-800">{patient?.breed} • {patient?.color || 'Zaino'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Identificación Oficial:</span>
                        <span className="font-mono text-slate-800">{patient?.equinePassport || patient?.microchip || patient?.clinicalRecordNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Tutor / Regimiento:</span>
                        <span className="text-slate-800">{owner ? (owner.firstName + ' ' + owner.lastName) : selectedCertModal.regimentUnit || 'Comando Militar'}</span>
                      </div>
                    </div>

                    <div className="bg-teal-50/60 p-3 rounded-xl border border-teal-200 space-y-1">
                      <span className="text-[10px] font-bold text-teal-900 uppercase block">Biológico Administrado:</span>
                      <p className="text-sm font-bold text-teal-950">{selectedCertModal.vaccineName}</p>
                      <p className="text-[11px] text-teal-800">
                        Lote: <strong>{selectedCertModal.batchNumber}</strong> • Fab: {selectedCertModal.manufacturer}
                      </p>
                      <div className="flex justify-between pt-1 border-t border-teal-200/60 text-[11px]">
                        <span>Fecha de Aplicación: <strong>{formatDate(selectedCertModal.administeredDate)}</strong></span>
                        <span>Próximo Refuerzo: <strong>{formatDate(selectedCertModal.nextDueDate)}</strong></span>
                      </div>
                    </div>

                    <div className="pt-2 text-center text-[11px] text-slate-600 border-t border-slate-200">
                      <p className="font-bold text-slate-900">{selectedCertModal.administeredBy}</p>
                      <p className="font-mono text-slate-500">Médico Veterinario • Matrícula: {selectedCertModal.vetLicense}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Certificado</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCertModal(null)}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
