import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Clock,
  User,
  PawPrint,
  CheckCircle2,
  XCircle,
  Filter,
  MessageCircle,
  Stethoscope,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  MapPin,
  Check,
  RotateCcw,
  DoorOpen,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Appointment, AppointmentStatus, AppointmentType } from '../types';
import { formatDate, formatTime, formatDateTime } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, SearchInput, FilterBar } from './ui';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    patients,
    owners,
    users,
    updateAppointmentStatus,
    addTriageEntry,
    setQuickModal,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    openWhatsAppHub,
    showToast,
  } = useVet();

  const [viewMode, setViewMode] = useState<'DIARIO' | 'SEMANAL' | 'MENSUAL' | 'LISTA'>('DIARIO');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterVet, setFilterVet] = useState<string>('TODOS');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [search, setSearch] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments
    .filter((a) => {
      const pat = patients.find((p) => p.id === a.patientId);
      const own = owners.find((o) => o.id === a.ownerId);
      const q = search.toLowerCase();

      const matchesSearch =
        (pat?.name || '').toLowerCase().includes(q) ||
        (pat?.clinicalRecordNumber || '').toLowerCase().includes(q) ||
        (own?.firstName || '').toLowerCase().includes(q) ||
        (own?.lastName || '').toLowerCase().includes(q) ||
        (a.reason || '').toLowerCase().includes(q) ||
        (a.notes || '').toLowerCase().includes(q);

      const matchesVet = filterVet === 'TODOS' || a.vetId === filterVet;
      const matchesStatus = filterStatus === 'TODOS' || a.status === filterStatus;
      const matchesType = filterType === 'TODOS' || a.type === filterType;

      let matchesDate = true;
      if (viewMode === 'DIARIO') {
        matchesDate = a.date === selectedDate;
      }

      return matchesSearch && matchesVet && matchesStatus && matchesType && matchesDate;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

  // Actions
  const handlePassToConsultation = (apt: Appointment) => {
    triggerHaptic('medium');
    updateAppointmentStatus(apt.id, 'EN_CONSULTA');
    setSelectedPatientId(apt.patientId);
    setActivePatientTab('HISTORIA');
    setActiveView('PACIENTES');
  };

  const handlePassToTriage = (apt: Appointment, patientName: string) => {
    triggerHaptic('medium');
    updateAppointmentStatus(apt.id, 'ESPERANDO');
    addTriageEntry({
      patientId: apt.patientId,
      ownerId: apt.ownerId,
      priority: apt.type === 'CIRUGIA' || apt.type === 'URGENCIA' ? 'URGENTE' : 'NORMAL',
      chiefComplaint: apt.reason || 'Turno programado en agenda',
      assignedRoom: apt.consultingRoom || 'Consultorio 1',
    });
    showToast('success', 'Ingresado a Sala de Espera', patientName + ' ingresó a la sala de espera y triage.');
  };

  const handleSendWhatsAppReminder = (apt: Appointment) => {
    triggerHaptic('light');
    const pat = patients.find((p) => p.id === apt.patientId);
    const own = owners.find((o) => o.id === apt.ownerId);
    if (!own) return;

    openWhatsAppHub({
      patientId: pat?.id,
      ownerId: own.id,
      patientName: pat?.name || 'su mascota',
      ownerName: `${own.firstName} ${own.lastName}`,
      ownerPhone: own.whatsapp || own.phone || '',
      type: 'RECORDATORIO_TURNO',
      details: {
        supplyName: `Recordatorio de turno agendado el ${formatDate(apt.date)} a las ${apt.time} hs con ${(apt as any).vetName || 'Dr. Diego Irusta'}`,
      },
    });
  };

  const typeBadges: Record<string, { label: string; bg: string; icon: string }> = {
    CONSULTA: { label: 'Consulta Clínica', bg: 'bg-teal-50 text-teal-800 border-teal-200', icon: '🩺' },
    CONSULTA_GENERAL: { label: 'Consulta General', bg: 'bg-teal-50 text-teal-800 border-teal-200', icon: '🩺' },
    VACUNACION: { label: 'Vacunación', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: '💉' },
    CIRUGIA: { label: 'Cirugía / Quirófano', bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: '✂️' },
    CONTROL: { label: 'Control Post', bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: '🔍' },
    ESTUDIO: { label: 'Estudio / Lab / RX', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: '🔬' },
    ESTUDIO_COMPLEMENTARIO: { label: 'Ecografía / Rayos', bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: '🔬' },
    URGENCIA: { label: 'Guardia / Urgencia', bg: 'bg-red-50 text-red-700 border-red-200 font-black animate-pulse', icon: '🚨' },
    PELUQUERIA_BANO: { label: 'Peluquería / Baño', bg: 'bg-pink-50 text-pink-700 border-pink-200', icon: '🛁' },
  };

  const statusColors: Record<string, string> = {
    RESERVADO: 'bg-slate-100 text-slate-700 border-slate-200',
    CONFIRMADO: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    ESPERANDO: 'bg-amber-50 text-amber-700 border-amber-200 font-bold animate-pulse',
    EN_CONSULTA: 'bg-teal-50 text-teal-700 border-teal-200 font-bold',
    FINALIZADO: 'bg-blue-50 text-blue-700 border-blue-200',
    CANCELADO: 'bg-rose-50 text-rose-600 border-rose-200',
    AUSENTE: 'bg-gray-100 text-gray-500 border-gray-200',
  };

  // Date Navigation Helpers
  const changeDateByDays = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-5 pb-12 w-full max-w-full">
      {/* 1. Header */}
      <PageHeader
        category="Agenda Médica, Quirófano & Citas"
        title="Agenda de Turnos & Consultorios"
        description="Planificación de consultas, vacunaciones, cirugías, ecografías y visitas con recordatorios por WhatsApp"
        icon={CalendarDays}
        actions={[
          {
            label: 'Agendar Turno',
            icon: Plus,
            onClick: () => setQuickModal('NUEVO_TURNO'),
            variant: 'primary',
          },
        ]}
      />

      {/* 2. Top View Mode Tabs & Date Navigator */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 w-full">
        {/* View mode selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto no-scrollbar">
          {(['DIARIO', 'SEMANAL', 'MENSUAL', 'LISTA'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setViewMode(mode);
              }}
              className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial text-center ' +
                (viewMode === mode
                  ? 'bg-white text-teal-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900')
              }
            >
              {mode === 'DIARIO' ? 'Diario' : mode === 'SEMANAL' ? 'Semanal' : mode === 'MENSUAL' ? 'Mensual' : 'Todos'}
            </button>
          ))}
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={() => changeDateByDays(-1)}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
            title="Día anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 cursor-pointer"
            />
            {selectedDate === todayStr && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                HOY
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => changeDateByDays(1)}
            className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
            title="Día siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {selectedDate !== todayStr && (
            <button
              type="button"
              onClick={() => setSelectedDate(todayStr)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
            >
              Hoy
            </button>
          )}
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs space-y-3 w-full max-w-full">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por paciente, HC, tutor, motivo o profesional..."
        />

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Vet Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Profesional:</span>
            <select
              value={filterVet}
              onChange={(e) => setFilterVet(e.target.value)}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los Veterinarios</option>
              {users
                .filter((u) => u.role === 'VETERINARIO' || (u.role as string) === 'DIRECTOR_MEDICO')
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Tipo:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los Tipos</option>
              <option value="CONSULTA_GENERAL">Consulta General</option>
              <option value="VACUNACION">Vacunación</option>
              <option value="CIRUGIA">Cirugía</option>
              <option value="CONTROL">Control Post</option>
              <option value="ESTUDIO_COMPLEMENTARIO">Ecografía / Rayos</option>
              <option value="PELUQUERIA_BANO">Peluquería</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Estado:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="RESERVADO">Reservado</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="ESPERANDO">Esperando en Sala</option>
              <option value="EN_CONSULTA">En Consulta</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Appointments List / Cards */}
      <div className="space-y-3.5 w-full">
        {filteredAppointments.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No hay turnos registrados"
            description={
              search || filterVet !== 'TODOS' || filterType !== 'TODOS' || filterStatus !== 'TODOS'
                ? 'No se encontraron turnos con los filtros o fecha seleccionados.'
                : 'No hay turnos agendados para la fecha seleccionada.'
            }
            actionLabel="Agendar Nuevo Turno"
            onAction={() => setQuickModal('NUEVO_TURNO')}
          />
        ) : (
          filteredAppointments.map((apt) => {
            const patient = patients.find((p) => p.id === apt.patientId);
            const owner = owners.find((o) => o.id === apt.ownerId);
            const typeInfo = typeBadges[apt.type] || { label: apt.type, bg: 'bg-slate-100 text-slate-700', icon: '📅' };
            const statusClass = statusColors[apt.status] || 'bg-slate-100 text-slate-700';

            return (
              <div
                key={apt.id}
                className="bg-white border border-slate-200/90 hover:border-teal-500/60 rounded-2xl p-4 sm:p-5 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full"
              >
                {/* Left: Time badge + Patient & Owner Info */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Time Badge */}
                  <div className="w-14 h-14 rounded-2xl bg-teal-50/80 border border-teal-200/80 flex flex-col items-center justify-center flex-shrink-0 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-teal-700 mb-0.5" />
                    <span className="text-sm font-black text-slate-900 font-mono leading-none">{apt.time}</span>
                    <span className="text-[9px] text-teal-800 font-bold mt-0.5">{apt.durationMinutes || 30}m</span>
                  </div>

                  {/* Patient Identity */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3
                        onClick={() => {
                          if (patient) {
                            setSelectedPatientId(patient.id);
                            setActivePatientTab('SIGNOS');
                            setActiveView('PACIENTES');
                          }
                        }}
                        className="text-base font-bold text-slate-900 hover:text-teal-700 cursor-pointer transition-colors leading-tight"
                      >
                        {patient?.name || 'Paciente'}
                      </h3>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 border border-slate-200">
                        {patient?.clinicalRecordNumber || 'HC-0000'}
                      </span>
                      <span className={'text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ' + typeInfo.bg}>
                        {typeInfo.icon} {typeInfo.label}
                      </span>
                      <span className={'text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ' + statusClass}>
                        {apt.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">
                      Motivo: <strong className="text-slate-900">{apt.reason || 'Sin motivo detallado'}</strong>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                      <span>
                        Tutor: <strong className="text-slate-700">{owner ? (owner.firstName + ' ' + owner.lastName) : 'N/A'}</strong>
                      </span>
                      {owner?.phone && (
                        <span className="font-mono text-slate-500 text-[11px]">({owner.phone})</span>
                      )}
                      <span>•</span>
                      <span>
                        Profesional: <strong className="text-slate-800">{(apt as any).vetName || 'Dr. Veterinario'}</strong>
                      </span>
                      {apt.consultingRoom && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.2 rounded border border-teal-200 text-[11px]">
                            {apt.consultingRoom}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Fast Clinical Actions */}
                <div className="flex items-center gap-1.5 flex-wrap justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 flex-shrink-0">
                  {/* Status quick select */}
                  <select
                    value={apt.status}
                    onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as AppointmentStatus)}
                    className="min-h-[40px] px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                  >
                    <option value="RESERVADO">Reservado</option>
                    <option value="CONFIRMADO">Confirmado</option>
                    <option value="ESPERANDO">En Espera</option>
                    <option value="EN_CONSULTA">En Consulta</option>
                    <option value="FINALIZADO">Finalizado</option>
                    <option value="CANCELADO">Cancelado</option>
                    <option value="AUSENTE">Ausente</option>
                  </select>

                  {/* WhatsApp Reminder */}
                  {owner?.phone && (
                    <button
                      type="button"
                      onClick={() => handleSendWhatsAppReminder(apt)}
                      className="min-h-[40px] px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                      title="Enviar recordatorio de turno por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  )}

                  {/* Pass to Triage / Waiting Room */}
                  {apt.status !== 'ESPERANDO' && apt.status !== 'EN_CONSULTA' && apt.status !== 'FINALIZADO' && (
                    <button
                      type="button"
                      onClick={() => handlePassToTriage(apt, patient?.name || 'Paciente')}
                      className="min-h-[40px] px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                      title="Ingresar a sala de espera y triage"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>A Espera</span>
                    </button>
                  )}

                  {/* Pass to Consultation */}
                  <button
                    type="button"
                    onClick={() => handlePassToConsultation(apt)}
                    className="min-h-[40px] px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                    title="Iniciar consulta médica SOAP"
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Atender</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
