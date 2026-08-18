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
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Appointment } from '../types';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    patients,
    owners,
    users,
    updateAppointmentStatus,
    setQuickModal,
    setSelectedPatientId,
    setActiveView,
  } = useVet();

  const [viewMode, setViewMode] = useState<'HOY' | 'TODOS' | 'FECHA'>('HOY');
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterVet, setFilterVet] = useState('TODOS');

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredAppointments = appointments.filter((a) => {
    const matchesDate =
      viewMode === 'TODOS'
        ? true
        : viewMode === 'HOY'
        ? a.date === todayStr
        : a.date === filterDate;
    const matchesVet = filterVet === 'TODOS' || a.vetId === filterVet;
    return matchesDate && matchesVet;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-teal-600" />
            <span>Agenda Médica & Turnos</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Control de citas, consultas programadas, cirugías y vacunaciones
          </p>
        </div>

        <button
          onClick={() => setQuickModal('NUEVO_TURNO')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Agendar Turno</span>
        </button>
      </div>

      {/* Date & Vet Filter */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setViewMode('HOY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'HOY'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Turnos de Hoy
          </button>
          <button
            onClick={() => setViewMode('TODOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'TODOS'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos los Turnos ({appointments.length})
          </button>
          <div className="flex items-center gap-2 ml-1">
            <label className="text-xs font-bold uppercase text-slate-500">Fecha:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => {
                setFilterDate(e.target.value);
                setViewMode('FECHA');
              }}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-bold uppercase text-slate-500">Veterinario:</label>
          <select
            value={filterVet}
            onChange={(e) => setFilterVet(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="TODOS">Todos los Profesionales</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* List of appointments */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-sm">
            No hay turnos agendados para la fecha seleccionada.
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const patient = patients.find((p) => p.id === apt.patientId);
            const owner = owners.find((o) => o.id === apt.ownerId);

            return (
              <div
                key={apt.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-teal-500/50 transition-all shadow-sm"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-teal-600 mb-0.5" />
                    <span className="text-sm font-black text-slate-900 font-mono">{apt.time}</span>
                    <span className="text-[9px] text-slate-400 font-bold">{apt.durationMinutes}m</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-bold text-slate-900">{patient?.name || 'Paciente'}</h4>
                      <span className="text-xs text-slate-500">({patient?.species})</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {apt.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">Motivo: {apt.reason}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Tutor: {owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'} • Tel: {owner?.phone} • Profesional:{' '}
                      <span className="text-slate-700 font-semibold">{apt.vetName}</span>
                    </p>
                  </div>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <select
                    value={apt.status}
                    onChange={(e) =>
                      updateAppointmentStatus(apt.id, e.target.value as Appointment['status'])
                    }
                    className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="RESERVADO">RESERVADO</option>
                    <option value="CONFIRMADO">CONFIRMADO</option>
                    <option value="ESPERANDO">ESPERANDO EN SALA</option>
                    <option value="EN_CONSULTA">EN CONSULTA</option>
                    <option value="FINALIZADO">FINALIZADO</option>
                    <option value="CANCELADO">CANCELADO</option>
                  </select>

                  <button
                    onClick={() => {
                      if (patient) {
                        setSelectedPatientId(patient.id);
                        setActiveView('PACIENTES');
                      }
                    }}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors"
                  >
                    Ver Ficha
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
