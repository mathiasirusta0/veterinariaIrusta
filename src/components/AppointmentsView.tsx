import React, { useState, useMemo, useEffect } from 'react';
import {
  Trash2,
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
  Calendar as CalendarIcon,
  Layers,
  MapPin,
  Check,
  RotateCcw,
  DoorOpen,
  Search,
  Sparkles,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Appointment, AppointmentStatus, AppointmentType } from '../types';
import { formatDate, formatTime, formatDateTime, getTodayLocalDateString } from '../utils/formatters';
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
    archiveAppointment,
    deleteAppointment,
    showToast,
  } = useVet();

  // Mode defaults to 'TODOS' so all appointments are immediately visible without missing any date
  const [viewMode, setViewMode] = useState<'TODOS' | 'CALENDARIO' | 'HOY' | 'SEMANAL'>('TODOS');
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Deep-linking hash synchronization
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash.includes('agenda')) {
        const urlParams = new URLSearchParams(hash.split('?')[1] || '');
        const dateParam = urlParams.get('date');
        const viewParam = urlParams.get('view');
        if (dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
          setSelectedDate(dateParam);
        }
        if (viewParam && ['TODOS', 'CALENDARIO', 'HOY', 'SEMANAL'].includes(viewParam)) {
          setViewMode(viewParam as any);
        }
      }
    } catch {}
  }, []);
  const [filterVet, setFilterVet] = useState<string>('TODOS');
  const [filterStatus, setFilterStatus] = useState<string>('TODOS');
  const [filterType, setFilterType] = useState<string>('TODOS');
  const [search, setSearch] = useState<string>('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper date calculations
  const isDateInThisWeek = (dateStr: string) => {
    try {
      const today = new Date();
      const target = new Date(dateStr + 'T00:00:00');
      const startOfWeek = new Date(today);
      const day = today.getDay() || 7;
      startOfWeek.setDate(today.getDate() - day + 1);
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return target >= startOfWeek && target <= endOfWeek;
    } catch {
      return false;
    }
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const pat = patients.find((p) => p.id === a.patientId);
        const own = owners.find((o) => o.id === a.ownerId);
        const q = search.toLowerCase().trim();

        const matchesSearch =
          !q ||
          (pat?.name || '').toLowerCase().includes(q) ||
          (pat?.clinicalRecordNumber || '').toLowerCase().includes(q) ||
          (own?.firstName || '').toLowerCase().includes(q) ||
          (own?.lastName || '').toLowerCase().includes(q) ||
          (own?.phone || '').toLowerCase().includes(q) ||
          (own?.whatsapp || '').toLowerCase().includes(q) ||
          (a.reason || '').toLowerCase().includes(q) ||
          (a.vetName || '').toLowerCase().includes(q) ||
          (a.notes || '').toLowerCase().includes(q);

        const matchesVet = filterVet === 'TODOS' || a.vetId === filterVet;
        const matchesType = filterType === 'TODOS' || a.type === filterType;
        let matchesStatus = true;
        if (filterStatus === 'ARCHIVADOS') {
          matchesStatus = !!a.isArchived;
        } else {
          if (a.isArchived) return false;
          matchesStatus = filterStatus === 'TODOS' || a.status === filterStatus;
        }

        // If there is an active search query, match across ALL dates seamlessly
        if (q) {
          return matchesSearch && matchesVet && matchesStatus && matchesType;
        }

        let matchesDate = true;
        if (viewMode === 'HOY') {
          matchesDate = a.date === todayStr;
        } else if (viewMode === 'SEMANAL') {
          matchesDate = isDateInThisWeek(a.date);
        } else if (viewMode === 'CALENDARIO') {
          matchesDate = a.date === selectedDate;
        }

        return matchesSearch && matchesVet && matchesStatus && matchesType && matchesDate;
      })
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
  }, [appointments, patients, owners, search, filterVet, filterStatus, filterType, viewMode, selectedDate, todayStr]);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const groups: Record<string, Appointment[]> = {};
    filteredAppointments.forEach((apt) => {
      if (!groups[apt.date]) {
        groups[apt.date] = [];
      }
      groups[apt.date].push(apt);
    });
    return groups;
  }, [filteredAppointments]);

  // Calendar matrix calculations
  const calendarDays = useMemo(() => {
    const year = currentCalendarMonth.getFullYear();
    const month = currentCalendarMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Monday as 1st day (0 is Sun in JS, let's normalize: Mon=0, Sun=6)
    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay === -1) startDay = 6;

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; apts: Appointment[] }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const dateStr = prevDate.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNum,
        isCurrentMonth: false,
        apts: appointments.filter((a) => a.date === dateStr),
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const curDate = new Date(year, month, i);
      const dateStr = curDate.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: true,
        apts: appointments.filter((a) => a.date === dateStr),
      });
    }

    // Next month padding to complete 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      const dateStr = nextDate.toISOString().split('T')[0];
      days.push({
        dateStr,
        dayNum: i,
        isCurrentMonth: false,
        apts: appointments.filter((a) => a.date === dateStr),
      });
    }

    return days;
  }, [currentCalendarMonth, appointments]);

  // Actions
  const handleFinalizeAppointment = (apt: Appointment, patientName: string) => {
    triggerHaptic('success');
    updateAppointmentStatus(apt.id, 'FINALIZADO');
    showToast('success', 'Turno Finalizado con Éxito', `La atención de ${patientName} fue marcada como completada.`);
  };

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

    const formattedFullDate = formatDate(apt.date, 'Fecha no registrada', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    openWhatsAppHub({
      patientId: pat?.id,
      ownerId: own.id,
      patientName: pat?.name || 'su mascota',
      ownerName: `${own.firstName} ${own.lastName}`.trim(),
      ownerPhone: own.whatsapp || own.phone || '',
      type: 'TURNO',
      details: {
        date: formattedFullDate.charAt(0).toUpperCase() + formattedFullDate.slice(1),
        time: apt.time,
        vetName: apt.vetName || 'Dr. Diego Iván Irusta',
        supplyName: apt.reason || 'Consulta médica general',
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

  const totalAppointmentsCount = appointments.length;
  const todayAppointmentsCount = appointments.filter((a) => a.date === todayStr).length;
  const weekAppointmentsCount = appointments.filter((a) => isDateInThisWeek(a.date)).length;

  return (
    <div className="space-y-3.5 pb-10 w-full max-w-full">
      {/* 1. Header */}
      <PageHeader
        category="Agenda Médica, Quirófano & Citas"
        title="Agenda de Turnos & Consultorios"
        description="Planificación integral de turnos médicos, cirugías y visitas con vista de calendario y recordatorios por WhatsApp"
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

      {/* 2. Top View Mode Tabs & Stats */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 w-full">
        {/* View mode selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('TODOS');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'TODOS'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>🌟 Todos los Turnos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${viewMode === 'TODOS' ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-700'}`}>
              {totalAppointmentsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('CALENDARIO');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'CALENDARIO'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Vista Calendario</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('HOY');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'HOY'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📌 Hoy</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${viewMode === 'HOY' ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-700'}`}>
              {todayAppointmentsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setViewMode('SEMANAL');
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              viewMode === 'SEMANAL'
                ? 'bg-teal-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📆 Esta Semana</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${viewMode === 'SEMANAL' ? 'bg-teal-800 text-teal-100' : 'bg-slate-200 text-slate-700'}`}>
              {weekAppointmentsCount}
            </span>
          </button>
        </div>

        {/* Date Selector / Quick Jump */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Fecha seleccionada:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (viewMode === 'CALENDARIO' || viewMode === 'HOY') {
                  // Keep focused
                }
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:ring-2 focus:ring-teal-500 cursor-pointer"
            />
            {selectedDate === todayStr && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                HOY
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3. CALENDAR VIEW GRID MODE */}
      {viewMode === 'CALENDARIO' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-teal-700" />
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base capitalize">
                {currentCalendarMonth.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const m = new Date(currentCalendarMonth);
                  m.setMonth(m.getMonth() - 1);
                  setCurrentCalendarMonth(m);
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentCalendarMonth(new Date())}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Mes Actual
              </button>
              <button
                type="button"
                onClick={() => {
                  const m = new Date(currentCalendarMonth);
                  m.setMonth(m.getMonth() + 1);
                  setCurrentCalendarMonth(m);
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 py-1">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              const isToday = cell.dateStr === todayStr;
              const isSelected = cell.dateStr === selectedDate;
              const hasApts = cell.apts.length > 0;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDate(cell.dateStr);
                    triggerHaptic('light');
                  }}
                  className={`min-h-[90px] sm:min-h-[110px] p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/50 text-slate-300 border-slate-100'
                      : isSelected
                      ? 'bg-teal-50/40 border-teal-500 ring-2 ring-teal-500/20 text-slate-900 shadow-xs'
                      : isToday
                      ? 'bg-amber-50/40 border-amber-300 text-slate-900'
                      : 'bg-white border-slate-200/90 hover:border-teal-400 hover:bg-slate-50/80 text-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'bg-amber-500 text-white w-5 h-5 rounded-full flex items-center justify-center' : ''}`}>
                      {cell.dayNum}
                    </span>
                    {hasApts && (
                      <span className="text-[10px] font-black px-1.5 py-0.2 rounded-full bg-teal-100 text-teal-800">
                        {cell.apts.length} {cell.apts.length === 1 ? 'turno' : 'turnos'}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[65px] no-scrollbar">
                    {cell.apts.slice(0, 3).map((apt) => {
                      const p = patients.find((pat) => pat.id === apt.patientId);
                      return (
                        <div
                          key={apt.id}
                          className="text-[10px] leading-tight px-1.5 py-0.5 rounded bg-teal-50 text-teal-900 font-bold border border-teal-200/70 truncate flex items-center gap-1"
                          title={`${apt.time} - ${p?.name || 'Paciente'} (${apt.reason})`}
                        >
                          <span className="font-mono text-teal-700">{apt.time}</span>
                          <span className="truncate">🐾 {p?.name || 'Paciente'}</span>
                        </div>
                      );
                    })}
                    {cell.apts.length > 3 && (
                      <span className="text-[9px] text-teal-700 font-bold block text-center">
                        +{cell.apts.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs space-y-3 w-full max-w-full">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por paciente, HC, tutor, teléfono, motivo o profesional en todos los turnos..."
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

      {/* 5. Appointments List Grouped By Date */}
      <div className="space-y-6 w-full">
        {filteredAppointments.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No hay turnos registrados"
            description={
              search || filterVet !== 'TODOS' || filterType !== 'TODOS' || filterStatus !== 'TODOS'
                ? 'No se encontraron turnos con los filtros de búsqueda aplicados.'
                : 'Aún no hay turnos agendados en la clínica.'
            }
            actionLabel="Agendar Nuevo Turno"
            onAction={() => setQuickModal('NUEVO_TURNO')}
          />
        ) : (
          Object.keys(appointmentsByDate).map((dateKey) => {
            const dateApts = appointmentsByDate[dateKey];
            const isToday = dateKey === todayStr;

            return (
              <div key={dateKey} className="space-y-3">
                {/* Date Group Header */}
                <div className="flex items-center justify-between bg-slate-100/90 border border-slate-200/80 px-4 py-2.5 rounded-xl sticky top-2 z-10 backdrop-blur-xs shadow-2xs">
                  <div className="flex items-center gap-2">
                    <CalendarDays className={`w-4 h-4 ${isToday ? 'text-emerald-600' : 'text-teal-700'}`} />
                    <span className="font-extrabold text-xs text-slate-900 capitalize">
                      {formatDate(dateKey, 'Fecha no registrada', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        HOY
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {dateApts.length} {dateApts.length === 1 ? 'Turno' : 'Turnos'}
                  </span>
                </div>

                {/* Cards for this date */}
                <div className="space-y-3">
                  {dateApts.map((apt) => {
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
                          {/* Time & Date Badge */}
                          <div className="w-16 h-16 rounded-2xl bg-teal-50/90 border border-teal-200 flex flex-col items-center justify-center flex-shrink-0 shadow-2xs">
                            <Clock className="w-3.5 h-3.5 text-teal-700 mb-0.5" />
                            <span className="text-sm font-black text-slate-900 font-mono leading-none">{apt.time}</span>
                            <span className="text-[9px] text-teal-800 font-bold mt-0.5 font-mono">{formatDate(apt.date)}</span>
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
                              {(owner?.phone || owner?.whatsapp) && (
                                <span className="font-mono text-slate-600 font-semibold text-[11px]">
                                  ({owner.whatsapp || owner.phone})
                                </span>
                              )}
                              <span>•</span>
                              <span>
                                Profesional: <strong className="text-slate-800">{apt.vetName || 'Dr. Diego Iván Irusta'}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2 flex-wrap justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 flex-shrink-0">
                          {/* Delete Appointment Button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Está seguro de borrar el turno de ${patient?.name || 'la consulta'} (${apt.date} ${apt.time})? Esta acción no se puede deshacer.`)) {
                                deleteAppointment(apt.id);
                              }
                            }}
                            className="min-h-[40px] px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 font-bold text-xs rounded-xl border border-rose-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation cursor-pointer shadow-2xs"
                            title="Borrar este turno / consulta de la agenda definitivamente"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>Borrar</span>
                          </button>

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

                          {/* WhatsApp Reminder Button */}
                          {(owner?.phone || owner?.whatsapp) && (
                            <button
                              type="button"
                              onClick={() => handleSendWhatsAppReminder(apt)}
                              className="min-h-[40px] px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation shadow-2xs cursor-pointer"
                              title="Enviar recordatorio didáctico por WhatsApp al tutor"
                            >
                              <MessageCircle className="w-4 h-4 text-emerald-600" />
                              <span>Avisar por WhatsApp</span>
                            </button>
                          )}

                          {/* Pass to Triage */}
                          {apt.status !== 'ESPERANDO' && apt.status !== 'EN_CONSULTA' && apt.status !== 'FINALIZADO' && (
                            <button
                              type="button"
                              onClick={() => handlePassToTriage(apt, patient?.name || 'Paciente')}
                              className="min-h-[40px] px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs rounded-xl border border-amber-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation cursor-pointer"
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
                            className="min-h-[40px] px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-700/20 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation cursor-pointer"
                            title="Iniciar consulta médica SOAP"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            <span>Atender</span>
                          </button>

                          {/* Finalizar Turno / Dar Okay */}
                          {apt.status !== 'FINALIZADO' ? (
                            <button
                              type="button"
                              onClick={() => handleFinalizeAppointment(apt, patient?.name || 'el paciente')}
                              className="min-h-[40px] px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/25 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation cursor-pointer"
                              title="Dar el OK y finalizar el turno del paciente"
                            >
                              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                              <span>Finalizar Turno</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => updateAppointmentStatus(apt.id, 'CONFIRMADO')}
                              className="min-h-[40px] px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100 transition-colors"
                              title="Turno completado. Clic para reabrir si fue un error"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>✓ Finalizado</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
