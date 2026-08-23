
import React, { useState } from 'react';
import {
  Clock,
  Plus,
  AlertTriangle,
  Heart,
  Stethoscope,
  BedDouble,
  User,
  PawPrint,
  CheckCircle2,
  Filter,
  Volume2,
  MessageCircle,
  Phone,
  DoorOpen,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { TriagePriority, TriageEntry } from '../types';
import { formatTime, calculateWaitMinutes, formatWeight } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, SearchInput, FilterBar } from './ui';

export const TriageView: React.FC = () => {
  const {
    triageList,
    patients,
    owners,
    updateTriageStatus,
    updateTriagePriority,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openWhatsAppHub,
    showToast,
  } = useVet();

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('TODAS');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const activeQueue = triageList.filter((t) => {
    const isWaiting = t.status === 'EN_ESPERA' || t.status === 'LLAMADO';
    const matchesPriority = filterPriority === 'TODAS' || t.priority === filterPriority;
    const pat = patients.find((p) => p.id === t.patientId);
    const own = owners.find((o) => o.id === t.ownerId);
    const q = search.toLowerCase();

    const matchesSearch =
      (pat?.name || '').toLowerCase().includes(q) ||
      (pat?.clinicalRecordNumber || '').toLowerCase().includes(q) ||
      (own?.firstName || '').toLowerCase().includes(q) ||
      (own?.lastName || '').toLowerCase().includes(q) ||
      (t.chiefComplaint || '').toLowerCase().includes(q) ||
      (t.assignedRoom || '').toLowerCase().includes(q);

    return isWaiting && matchesPriority && matchesSearch;
  });

  // Voice Announcement System
  const handleVoiceCall = (entry: TriageEntry, patientName: string, room: string) => {
    triggerHaptic('medium');
    setSpeakingId(entry.id);

    const announcement = `Atención por favor. Paciente ${patientName}, pasar a ${room || 'Consultorio uno'}.`;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(announcement);
      utterance.lang = 'es-AR';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setSpeakingId(null), 2500);
    }

    updateTriageStatus(entry.id, 'LLAMADO');
    showToast('info', 'Llamado por Pantalla y Voz', `Se llamó a ${patientName} para ingresar a ${room || 'Consultorio 1'}.`);
  };

  const handleStartConsultation = (triageId: string, patientId: string) => {
    triggerHaptic('medium');
    updateTriageStatus(triageId, 'ATENDIDO');
    setSelectedPatientId(patientId);
    setActivePatientTab('HISTORIA');
    setActiveView('PACIENTES');
  };

  const handleDeriveHospitalization = (triageId: string, patientId: string) => {
    triggerHaptic('medium');
    updateTriageStatus(triageId, 'DERIVADO_INTERNACION');
    setSelectedPatientId(patientId);
    setQuickModal('NUEVA_INTERNACION');
  };

  const handleCancelTriage = (triageId: string, patientName: string) => {
    triggerHaptic('light');
    updateTriageStatus(triageId, 'CANCELADO' as any);
    showToast('info', 'Ingreso Cancelado', `Se canceló la espera de ${patientName}.`);
  };

  const priorityMeta: Record<string, { label: string; sub: string; color: string; badge: string; emoji: string; border: string }> = {
    CRITICO: {
      label: 'Nivel 1: Reanimación (Rojo)',
      sub: 'Atención inmediata (0 min)',
      color: 'text-red-700 bg-red-50 border-red-300',
      badge: 'bg-red-600 text-white animate-pulse',
      emoji: '🔴',
      border: 'border-l-4 border-l-red-500',
    },
    URGENTE: {
      label: 'Nivel 2: Emergencia (Naranja)',
      sub: 'Atención en < 15 min',
      color: 'text-orange-700 bg-orange-50 border-orange-300',
      badge: 'bg-orange-600 text-white',
      emoji: '🟠',
      border: 'border-l-4 border-l-orange-500',
    },
    PRIORITARIO: {
      label: 'Nivel 3: Urgencia (Amarillo)',
      sub: 'Atención en < 30 min',
      color: 'text-amber-700 bg-amber-50 border-amber-300',
      badge: 'bg-amber-500 text-white',
      emoji: '🟡',
      border: 'border-l-4 border-l-amber-500',
    },
    NORMAL: {
      label: 'Nivel 4: Prioritario (Verde)',
      sub: 'Atención en < 60 min',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
      badge: 'bg-teal-600 text-white',
      emoji: '🟢',
      border: 'border-l-4 border-l-teal-500',
    },
    NO_URGENTE: {
      label: 'Nivel 5: No Urgente (Azul)',
      sub: 'Vacunas / Controles',
      color: 'text-blue-700 bg-blue-50 border-blue-300',
      badge: 'bg-blue-600 text-white',
      emoji: '🔵',
      border: 'border-l-4 border-l-blue-500',
    },
  };

  const priorityFilterOptions = [
    { id: 'TODAS', label: 'Todos', badge: triageList.filter((t) => t.status === 'EN_ESPERA' || t.status === 'LLAMADO').length },
    { id: 'CRITICO', label: '🔴 Reanimación', badge: triageList.filter((t) => (t.status === 'EN_ESPERA' || t.status === 'LLAMADO') && t.priority === 'CRITICO').length },
    { id: 'URGENTE', label: '🟠 Emergencia', badge: triageList.filter((t) => (t.status === 'EN_ESPERA' || t.status === 'LLAMADO') && t.priority === 'URGENTE').length },
    { id: 'PRIORITARIO', label: '🟡 Urgencia', badge: triageList.filter((t) => (t.status === 'EN_ESPERA' || t.status === 'LLAMADO') && t.priority === 'PRIORITARIO').length },
    { id: 'NORMAL', label: '🟢 Prioritario', badge: triageList.filter((t) => (t.status === 'EN_ESPERA' || t.status === 'LLAMADO') && t.priority === 'NORMAL').length },
  ];

  return (
    <div className="space-y-5 pb-12 w-full max-w-full">
      {/* 1. Header */}
      <PageHeader
        category="Recepción, Admisión & Guardia"
        title="Sala de Espera & Triage Clínico"
        description="Clasificación Manchester y Veterinary Triage Index por nivel de gravedad, cronómetro en tiempo real y asignación de consultorios"
        icon={AlertTriangle}
        actions={[
          {
            label: 'Ingresar a Sala de Espera',
            icon: Plus,
            onClick: () => setQuickModal('NUEVO_TRIAGE'),
            variant: 'primary',
          },
        ]}
      />

      {/* 2. Priority Scale Visual Legend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 w-full">
        {Object.entries(priorityMeta).map(([key, meta]) => (
          <div
            key={key}
            onClick={() => setFilterPriority(filterPriority === key ? 'TODAS' : key)}
            className={`p-3 rounded-2xl border bg-white shadow-2xs cursor-pointer transition-all hover:border-teal-500/60 ${
              filterPriority === key ? 'ring-2 ring-teal-500 bg-teal-50/20' : 'border-slate-200/90'
            } ${meta.border}`}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{meta.emoji}</span>
              <span className="text-[11px] font-black text-slate-900 truncate">{meta.label.split(':')[1]?.trim() || meta.label}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">{meta.sub}</p>
          </div>
        ))}
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs space-y-3 w-full max-w-full">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por paciente, HC, tutor, motivo de consulta o consultorio..."
        />
        <FilterBar
          options={priorityFilterOptions}
          activeId={filterPriority}
          onSelect={setFilterPriority}
          label="Nivel Triage"
        />
      </div>

      {/* 4. Triage Live Queue */}
      <div className="space-y-3.5 w-full">
        {activeQueue.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No hay pacientes en sala de espera"
            description={
              search || filterPriority !== 'TODAS'
                ? 'No hay pacientes que coincidan con la búsqueda o filtro seleccionado.'
                : 'Todos los pacientes han sido atendidos o derivados a sus respectivos servicios clínicos.'
            }
            actionLabel="Ingresar Paciente a Sala"
            onAction={() => setQuickModal('NUEVO_TRIAGE')}
          />
        ) : (
          activeQueue.map((entry) => {
            const patient = patients.find((p) => p.id === entry.patientId);
            const owner = owners.find((o) => o.id === entry.ownerId);
            const meta = priorityMeta[entry.priority] || priorityMeta.NORMAL;
            const waitMinutes = calculateWaitMinutes(entry.arrivedAt);
            const isSpeaking = speakingId === entry.id;
            const roomName = entry.assignedRoom || 'Consultorio 1';

            const waitBadgeColor =
              waitMinutes > 45
                ? 'bg-rose-50 text-rose-700 border-rose-200 font-black animate-pulse'
                : waitMinutes > 20
                ? 'bg-amber-50 text-amber-700 border-amber-200 font-bold'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';

            return (
              <div
                key={entry.id}
                className={`bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full ${meta.border} ${
                  entry.status === 'LLAMADO' ? 'ring-2 ring-teal-500 bg-teal-50/20' : 'border-slate-200/90'
                }`}
              >
                {/* Left: Patient Identity & Chief Complaint */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="relative flex-shrink-0">
                    <img
                      src={patient?.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                      alt={patient?.name || 'Paciente'}
                      className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                      referrerPolicy="no-referrer"
                    />
                    <span className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full p-0.5 shadow-2xs border border-slate-100">
                      {patient?.species === 'Canino' ? '🐕' : patient?.species === 'Felino' ? '🐈' : '🦜'}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {patient?.name || 'Paciente en Espera'}
                      </h3>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 border border-slate-200">
                        {patient?.clinicalRecordNumber || 'HC-0000'}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${meta.badge}`}>
                        {meta.emoji} {entry.priority}
                      </span>
                      {entry.status === 'LLAMADO' && (
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-300 animate-pulse">
                          📢 LLAMADO A {roomName.toUpperCase()}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 font-medium truncate">
                      {[patient?.species, patient?.breed, patient?.calculatedAge, patient?.weight ? formatWeight(patient.weight) : null].filter(Boolean).join(' • ')}
                    </p>

                    {/* Motivo de consulta */}
                    <div className="bg-slate-50/90 border border-slate-200/80 p-2.5 rounded-xl text-xs space-y-1">
                      <p className="text-slate-800 font-semibold leading-relaxed">
                        <strong className="text-slate-500 text-[10px] uppercase block tracking-wider font-bold">Motivo de Ingreso / Síntomas:</strong>
                        "{entry.chiefComplaint || 'Consulta general de guardia'}"
                      </p>
                      {entry.initialTemp && (
                        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-600 pt-1 border-t border-slate-200/60">
                          <span>🌡️ Temp: <strong>{entry.initialTemp}°C</strong></span>
                          {entry.initialHeartRate && <span>❤️ FC: <strong>{entry.initialHeartRate} lpm</strong></span>}
                          {entry.initialMucous && <span>👅 Mucosas: <strong>{entry.initialMucous}</strong></span>}
                        </div>
                      )}
                    </div>

                    {/* Tutor & Assigned Room / Vet */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                      <span className="font-semibold text-slate-800">
                        Tutor: {owner ? `${owner.firstName} ${owner.lastName}` : 'Tutor registrado'}
                      </span>
                      {owner?.phone && (
                        <span className="font-mono text-slate-500 text-[11px]">({owner.phone})</span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1 font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200 text-[11px]">
                        <DoorOpen className="w-3 h-3 text-teal-600" />
                        <span>{roomName}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Timer & Interactive Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 flex-shrink-0">
                  {/* Wait Timer */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Espera:</span>
                    <span className={`text-xs px-2.5 py-1 rounded-xl border font-mono ${waitBadgeColor}`}>
                      ⏱️ {waitMinutes} min (Llegó {formatTime(entry.arrivedAt)})
                    </span>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {/* Voice Call Button */}
                    <button
                      type="button"
                      disabled={isSpeaking}
                      onClick={() => handleVoiceCall(entry, patient?.name || 'Paciente', roomName)}
                      className={`min-h-[40px] px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation ${
                        isSpeaking
                          ? 'bg-amber-500 text-white animate-bounce'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                      }`}
                      title="Llamar al paciente por altavoz y pantalla"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                      <span>{isSpeaking ? 'Llamando...' : 'Llamar Voz'}</span>
                    </button>

                    {/* Change Priority Selector */}
                    <select
                      value={entry.priority}
                      onChange={(e) => updateTriagePriority(entry.id, e.target.value as TriagePriority)}
                      className="min-h-[40px] px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                      title="Reclasificar nivel de urgencia"
                    >
                      <option value="CRITICO">🔴 Reanimación</option>
                      <option value="URGENTE">🟠 Emergencia</option>
                      <option value="PRIORITARIO">🟡 Urgencia</option>
                      <option value="NORMAL">🟢 Prioritario</option>
                      <option value="NO_URGENTE">🔵 No urgente</option>
                    </select>

                    {/* Derive to Hospitalization */}
                    <button
                      type="button"
                      onClick={() => {
                        if (patient) handleDeriveHospitalization(entry.id, patient.id);
                      }}
                      className="min-h-[40px] px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-xl border border-red-200 flex items-center gap-1 transition-all active:scale-95 touch-manipulation"
                      title="Derivar inmediatamente a internación o shock room"
                    >
                      <BedDouble className="w-3.5 h-3.5 text-red-600" />
                      <span>Internar</span>
                    </button>

                    {/* Pass to Consultation */}
                    <button
                      type="button"
                      onClick={() => {
                        if (patient) handleStartConsultation(entry.id, patient.id);
                      }}
                      className="min-h-[40px] px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                      title="Ingresar a consulta médica SOAP"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Atender</span>
                    </button>

                    {/* Cancel button */}
                    <button
                      type="button"
                      onClick={() => handleCancelTriage(entry.id, patient?.name || 'Paciente')}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                      title="Cancelar ingreso a sala"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
