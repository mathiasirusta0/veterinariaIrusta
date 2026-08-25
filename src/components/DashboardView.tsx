import React from 'react';
import {
  AlertTriangle,
  Clock,
  BedDouble,
  Stethoscope,
  Scissors,
  FlaskConical,
  Boxes,
  CalendarDays,
  ArrowRight,
  Plus,
  CheckCircle2,
  Activity,
  Droplet,
  Calculator,
  Radio,
  TrendingUp,
  DollarSign,
  PieChart,
  Percent,
  FileText,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const DashboardView: React.FC = () => {
  const [dashboardMode, setDashboardMode] = React.useState<"MI_TRABAJO" | "SERVICIO" | "ANALITICA">("MI_TRABAJO");
  const [careEpisodePatientId, setCareEpisodePatientId] = React.useState<string | null>(null);
  const [careEpisodeTab, setCareEpisodeTab] = React.useState<'RESUMEN' | 'EVOLUCION' | 'PLAN' | 'RESULTADOS'>('RESUMEN');
  const [showQuickIndicate, setShowQuickIndicate] = React.useState(false);
  const [quickDrug, setQuickDrug] = React.useState('');
  const [quickDose, setQuickDose] = React.useState('');
  const {
    currentUser,
    patients,
    owners,
    hospitalizations,
    appointments,
    triageList,
    labOrders,
    surgeries,
    products,
    invoices,
    setSelectedPatientId,
    setActiveView,
    setActivePatientTab,
    setQuickModal,
    openCalculators,
  } = useVet();

  // Metrics
  const activeHospital = hospitalizations.filter((h) => h.status === 'ACTIVA');
  const criticalPatients = activeHospital.filter(
    (h) => h.priority === 'CRITICO' || h.priority === 'PRIORITARIO'
  );

  let upcomingMedsCount = 0;
  let overdueMedsCount = 0;
  activeHospital.forEach((h) => {
    (h.medications || []).forEach((m) => {
      if (m.status === 'PROXIMA' || m.status === 'PROGRAMADA') upcomingMedsCount++;
      if (m.status === 'ATRASADA') overdueMedsCount++;
    });
  });

  const pendingLabs = labOrders.filter(
    (l) => l.status === 'SOLICITADO' || l.status === 'EN_PROCESO'
  );
  const todaySurgeries = surgeries.filter(
    (s) => s.date === new Date().toISOString().split('T')[0]
  );
  const waitingTriage = triageList.filter((t) => t.status === 'EN_ESPERA');
  const lowStock = products.filter((p) => p.currentStock <= p.minStock);

  const todayAppointments = appointments.filter(
    (a) => a.date === new Date().toISOString().split('T')[0] && a.status !== 'CANCELADO'
  );

  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const globalOccupancyPercent = Math.min(100, Math.round((activeHospital.length / 18) * 100));

  const openPatientDetail = (patientId: string, tab = 'RESUMEN') => {
    setSelectedPatientId(patientId);
    setActivePatientTab(tab);
    setActiveView('PACIENTES');
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Panel de Control Médico
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">
            {new Date().toLocaleDateString('es-AR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}{' '}
            | Guardia Hospitalaria 24hs Activa
          </p>
        </div>
                <div className="flex flex-wrap items-center gap-2">
          {/* Operational View Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 mr-2">
            {[
              { id: 'MI_TRABAJO', label: '⚡ Mi Trabajo' },
              { id: 'SERVICIO', label: '🏥 Servicio 24h' },
              { id: 'ANALITICA', label: '📊 Analítica' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDashboardMode(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  dashboardMode === tab.id
                    ? 'bg-white text-teal-900 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => openCalculators()}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
            title="Calculadora médica y dosis"
          >
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span>Calculadora Dosis</span>
          </button>
          <button
            onClick={() => setQuickModal('NUEVO_TURNO')}
            className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-sm shadow-teal-600/25 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ NUEVO TURNO</span>
          </button>
          <button
            onClick={() => setQuickModal('NUEVO_PACIENTE')}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
          >
            <BedDouble className="w-3.5 h-3.5 text-slate-500" />
            <span>Internar</span>
          </button>
        </div>
      </div>

      {/* 4 Premium Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pacientes Críticos */}
        <div
          onClick={() => setActiveView('PACIENTES')}
          className="group relative bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90 hover:border-rose-300 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-red-600" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pacientes Críticos
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
            {String(criticalPatients.length).padStart(2, '0')}
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
              {criticalPatients.length > 0 ? '⚠️ Atención Inmediata' : '✓ Estables en UCI'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">UCI 24hs</span>
          </div>
        </div>

        {/* Card 2: Tratamientos Atrasados */}
        <div
          onClick={() => setActiveView('PACIENTES')}
          className="group relative bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90 hover:border-amber-300 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Tratamientos en Ronda
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
            {String(overdueMedsCount).padStart(2, '0')}
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
              {overdueMedsCount > 0 ? `⚠️ ${overdueMedsCount} Pendientes` : '✓ Ronda al Día'}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Farmacia UCI</span>
          </div>
        </div>

        {/* Card 3: Internados */}
        <div
          onClick={() => setActiveView('PACIENTES')}
          className="group relative bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90 hover:border-teal-300 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Ocupación UCI / Caniles
            </span>
            <div className="w-7 h-7 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BedDouble className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
            {String(activeHospital.length).padStart(2, '0')}
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-teal-700 font-bold flex items-center gap-1">
              {Math.round((activeHospital.length / 18) * 100)}% ({activeHospital.length}/18 Camas)
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Sector Caniles</span>
          </div>
        </div>

        {/* Card 4: Turnos de Hoy */}
        <div
          onClick={() => setActiveView('AGENDA')}
          className="group relative bg-white p-5 rounded-2xl shadow-xs border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-600" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Agenda & Sala de Espera
            </span>
            <div className="w-7 h-7 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight font-mono">
            {String(todayAppointments.length).padStart(2, '0')}
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-indigo-700 font-bold flex items-center gap-1">
              {waitingTriage.length} en Sala de Espera
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Turnos Hoy</span>
          </div>
        </div>
      </div>

      {/* Secondary Fast Action Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveView('LABORATORIO')}
          className="bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between text-left transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{pendingLabs.length} Estudios</div>
              <div className="text-[10px] text-slate-400">Laboratorio</div>
            </div>
          </div>
          <span className="text-xs text-purple-600 font-bold">Ver</span>
        </button>

        <button
          onClick={() => setActiveView('CIRUGIAS')}
          className="bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between text-left transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{todaySurgeries.length} Programadas</div>
              <div className="text-[10px] text-slate-400">Quirófano</div>
            </div>
          </div>
          <span className="text-xs text-indigo-600 font-bold">Ver</span>
        </button>

        <button
          onClick={() => setActiveView('PACIENTES')}
          className="bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between text-left transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{waitingTriage.length} Pacientes</div>
              <div className="text-[10px] text-slate-400">Internación / Atención</div>
            </div>
          </div>
          <span className="text-xs text-amber-600 font-bold">Ver</span>
        </button>

        <button
          onClick={() => setActiveView('INVENTARIO')}
          className="bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between text-left transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{lowStock.length} Alertas</div>
              <div className="text-[10px] text-slate-400">Stock Crítico</div>
            </div>
          </div>
          <span className="text-xs text-rose-600 font-bold">Ver</span>
        </button>
      </div>

      {/* Main Section: 8-col Hospitalization Table + 4-col Schedule & AI widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Hospitalization Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {/* Card Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <BedDouble className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">
                Internación & Monitoreo Intensivo
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded text-slate-600">
                {activeHospital.length} {activeHospital.length === 1 ? 'PACIENTE ACTIVO' : 'PACIENTES ACTIVOS'}
              </span>
              <button
                onClick={() => setActiveView('PACIENTES')}
                className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 ml-2"
              >
                <span>Ver Internación</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] uppercase text-slate-400 font-bold">
                <tr>
                  <th className="px-5 py-3">Paciente</th>
                  <th className="px-4 py-3">Diagnóstico</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Próxima Acción</th>
                  <th className="px-4 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {activeHospital.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400 text-xs">
                      No hay pacientes internados activos en este momento en la sede actual.
                    </td>
                  </tr>
                ) : (
                  activeHospital.map((hosp) => {
                    const patient = patients.find((p) => p.id === hosp.patientId) || {
                      id: hosp.patientId,
                      name: hosp.patientName || 'Paciente en UCI',
                      species: 'CANINO',
                      breed: 'Mestizo',
                      photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100',
                      isAllergic: false,
                    };

                    const isCritical = hosp.priority === 'CRITICO';
                    const nextMed = hosp.medications.find(
                      (m) => m.status === 'PROXIMA' || m.status === 'PROGRAMADA' || m.status === 'ATRASADA'
                    );

                    return (
                      <tr key={hosp.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Patient Info */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-lg flex-shrink-0 border border-slate-200 overflow-hidden">
                            {patient.photoUrl ? (
                              <img
                                src={patient.photoUrl}
                                alt={patient.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span>{patient.species === 'CANINO' ? '🐶' : '🐱'}</span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">{patient.name}</span>
                              <span className="text-[10px] text-slate-400 uppercase font-normal">
                                {patient.breed}
                              </span>
                            </div>
                            <div className="flex gap-1 mt-0.5">
                              {patient.isAllergic && (
                                <span className="bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold px-1 rounded">
                                  ALERGIA
                                </span>
                              )}
                              {hosp.fluidTherapy?.isActive && (
                                <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[9px] font-bold px-1 rounded">
                                  FLUIDO {hosp.fluidTherapy.rateMlPerHour} ml/h
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Diagnosis */}
                      <td className="px-4 py-3.5 text-slate-600 font-medium max-w-[180px] truncate">
                        {hosp.primaryDiagnosis}
                      </td>

                      {/* Status Pill */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isCritical
                              ? 'bg-red-500 text-white'
                              : hosp.priority === 'PRIORITARIO'
                              ? 'bg-orange-500 text-white'
                              : 'bg-teal-600 text-white'
                          }`}
                        >
                          {hosp.priority}
                        </span>
                      </td>

                      {/* Next Action — Invariante: Nunca "Sin Pendientes" en Paciente Crítico */}
                      <td className="px-4 py-3.5">
                        {nextMed ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-xs flex items-center gap-1">
                              <span>💊 {nextMed.drugName}</span>
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                nextMed.status === 'ATRASADA' ? 'text-rose-600 font-black animate-pulse' : 'text-slate-500'
                              }`}
                            >
                              {nextMed.status === 'ATRASADA'
                                ? `⚠️ Atrasado (${nextMed.scheduledTime} hs)`
                                : `⏰ Aplicación: ${nextMed.scheduledTime} hs`}
                            </span>
                          </div>
                        ) : isCritical ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-rose-700 text-xs flex items-center gap-1">
                              🩺 Monitoreo Biométrico & Signos
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Próxima ronda: 23:00 hs • Enfermería UCI
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col">
                            <span className="font-bold text-teal-800 text-xs">
                              🐾 Control de Guardia Hospitalaria
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Próxima evaluación: 00:00 hs
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Action Button With Explicit Clinical Verb */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setCareEpisodePatientId(patient.id)}
                          className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-2xs transition-all active:scale-95"
                        >
                          Abrir Atención
                        </button>
                      </td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Appointments & Sleek AI Assistant Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Appointments & Waiting Room Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-teal-600" />
                  <span>Turnos Programados del Día ({todayAppointments.length})</span>
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {waitingTriage.length} {waitingTriage.length === 1 ? 'ingreso espontáneo en espera' : 'ingresos espontáneos en espera'} (Triage 24hs)
                </p>
              </div>
              <button
                onClick={() => setActiveView('AGENDA')}
                className="text-teal-600 hover:text-teal-700 text-xs font-bold uppercase"
              >
                Ver Agenda
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {todayAppointments.slice(0, 3).map((app, idx) => {
                const patient = patients.find((p) => p.id === app.patientId);
                const isFirst = idx === 0;

                return (
                  <div
                    key={app.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${
                      isFirst
                        ? 'bg-teal-50/50 border-teal-200'
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`flex flex-col items-center justify-center px-2 py-1 rounded h-10 w-12 flex-shrink-0 ${
                        isFirst ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="text-[11px] font-black leading-none">{app.time}</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {patient?.name} ({patient?.breed})
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">{app.reason}</span>
                    </div>
                  </div>
                );
              })}

              {todayAppointments.length === 0 && (
                <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-xs space-y-1">
                  <p className="font-semibold text-slate-700">Sin turnos programados pendientes</p>
                  <p className="text-[11px] text-slate-400">
                    Las atenciones actuales corresponden a ingresos espontáneos de guardia.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Work Queue for Active Mode */}
      {dashboardMode === 'MI_TRABAJO' && waitingTriage.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              ⏱️
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-950">
                {waitingTriage.length} Paciente{waitingTriage.length > 1 ? 's' : ''} esperando atención médica en Triage
              </h4>
              <p className="text-[11px] text-amber-800">
                Próximo: <span className="font-bold">{patients.find(p => p.id === waitingTriage[0]?.patientId)?.name || 'Paciente en Triage'}</span> ({patients.find(p => p.id === waitingTriage[0]?.patientId)?.species || 'Canino'} / {waitingTriage[0]?.chiefComplaint || 'Urgencia'}) • Prioridad: <span className="font-bold text-amber-900">{waitingTriage[0]?.priority}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('PACIENTES')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition-all shadow-2xs"
          >
            Iniciar Atención →
          </button>
        </div>
      )}


      {/* 🩺 ESPACIO DE ATENCIÓN UNIFICADO DEL EPISODIO */}
      {careEpisodePatientId && (() => {
        const patient = patients.find((p) => p.id === careEpisodePatientId) || patients[0];
        const hosp = hospitalizations.find((h) => h.patientId === patient.id && h.status === 'ACTIVA');
        const triage = triageList.find((t) => t.patientId === patient.id && t.status === 'EN_ESPERA');
        const isCritical = hosp?.priority === 'CRITICO' || triage?.priority === 'CRITICO';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden text-left">
              {/* Context Header */}
              <div className="p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-md">
                    {patient.species === 'CANINO' ? '🐶' : patient.species === 'FELINO' ? '🐱' : '🐾'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-white">{patient.name}</h2>
                      <span className="text-xs text-teal-300 font-medium font-mono">HC: {patient.clinicalRecordNumber}</span>
                      <span
                        className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                          isCritical ? 'bg-rose-600 text-white' : 'bg-teal-600 text-white'
                        }`}
                      >
                        {isCritical ? '🚨 CRÍTICO' : hosp?.priority || triage?.priority || 'ESTABLE'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {patient.species} • {patient.breed} • {patient.weight} kg • <span className="text-teal-400 font-bold">{hosp ? `Canil ${hosp.kennelNumber} (${hosp.sector})` : 'Sala de Espera / Triage'}</span>
                    </p>
                  </div>
                </div>

                {/* 3 Main Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openPatientDetail(patient.id, 'HISTORIA')}
                    className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Evolucionar</span>
                  </button>
                  <button
                    onClick={() => openPatientDetail(patient.id, 'SIGNOS')}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Registrar Signos</span>
                  </button>
                  <button
                    onClick={() => setShowQuickIndicate(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Droplet className="w-3.5 h-3.5" />
                    <span>+ Indicar</span>
                  </button>
                  <button
                    onClick={() => setCareEpisodePatientId(null)}
                    className="text-slate-400 hover:text-white p-2 text-lg font-bold ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Workspace Navigation Tabs */}
              <div className="px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                {[
                  { id: 'RESUMEN', label: '1. Resumen del Episodio' },
                  { id: 'PLAN', label: '2. Plan Terapéutico & Fármacos' },
                  { id: 'EVOLUCION', label: '3. Evolución Multirrol' },
                  { id: 'RESULTADOS', label: '4. Resultados & Lab' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCareEpisodeTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      careEpisodeTab === tab.id
                        ? 'bg-white text-teal-900 shadow-2xs font-black'
                        : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Workspace Body */}
              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {careEpisodeTab === 'RESUMEN' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="font-bold text-teal-900 text-xs uppercase tracking-wider block">
                        Estado Actual & Diagnóstico
                      </span>
                      <p className="text-sm font-bold text-slate-800">{hosp?.primaryDiagnosis || triage?.chiefComplaint || 'En evaluación médica'}</p>
                      {hosp?.fluidTherapy?.isActive && (
                        <div className="p-3 bg-teal-100/60 rounded-xl text-xs text-teal-950 font-medium space-y-1">
                          <div className="font-bold">💧 Fluidoterapia: {hosp.fluidTherapy.solutionType}</div>
                          <div>Tasa: <span className="font-black font-mono">{hosp.fluidTherapy.rateMlPerHour} ml/h</span></div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="font-bold text-indigo-900 text-xs uppercase tracking-wider block">
                        Próxima Acción & Ronda
                      </span>
                      <p className="text-slate-700 font-bold">
                        {isCritical ? '🩺 Monitoreo Biométrico & Signos (23:00 hs • Enfermería UCI)' : '🐾 Control de Guardia Hospitalaria (00:00 hs)'}
                      </p>
                      <button
                        onClick={() => openPatientDetail(patient.id, 'HISTORIA')}
                        className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-2xs"
                      >
                        Abrir Historial Completo →
                      </button>
                    </div>
                  </div>
                )}

                {careEpisodeTab === 'PLAN' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Plan Farmacológico y Terapéutico</h4>
                      <button
                        onClick={() => setShowQuickIndicate(true)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs"
                      >
                        + Nueva Indicación
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                      {(hosp?.medications || []).map((med) => (
                        <div key={med.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">💊 {med.drugName}</div>
                            <div className="text-slate-500 text-xs mt-0.5">Dosis: {med.dose} • Vía: {med.route} • Frecuencia: {med.frequency}</div>
                          </div>
                          <button
                            onClick={() => openPatientDetail(patient.id, 'HISTORIA')}
                            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold"
                          >
                            ✓ Registrar Aplicación
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {careEpisodeTab === 'EVOLUCION' && (
                  <div className="text-center py-8 text-slate-500 text-xs space-y-3">
                    <p>Las notas médicas, de enfermería y addenda están sincronizadas en la ficha del episodio.</p>
                    <button
                      onClick={() => openPatientDetail(patient.id, 'HISTORIA')}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs"
                    >
                      Abrir Ficha de Evolución →
                    </button>
                  </div>
                )}

                {careEpisodeTab === 'RESULTADOS' && (
                  <div className="text-center py-8 text-slate-500 text-xs space-y-3">
                    <p>Resultados de hematología, bioquímica y radiología vinculados.</p>
                    <button
                      onClick={() => openPatientDetail(patient.id, 'LABORATORIO')}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs"
                    >
                      Ver Resultados de Laboratorio →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Advanced Hospital Analytics & Clinical Activity Grid (Secondary View) */}
      {(dashboardMode === 'ANALITICA' || dashboardMode === 'SERVICIO') && (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-bold text-slate-900">
              Analítica Hospitalaria, Ocupación & Rendimiento
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            Período: Mes en Curso (Agosto 2026)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Sector 1: Ocupación de Caniles */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <BedDouble className="w-4 h-4 text-teal-600" />
                Ocupación de Caniles
              </span>
              <span className="text-teal-700 font-bold font-mono">{globalOccupancyPercent}% Global</span>
            </div>

            <div className="space-y-2">
              {(() => {
                const uciCount = activeHospital.filter(h => h.sector === 'UCI' || h.sector === 'UCI_CRITICOS').length;
                const canilCount = activeHospital.filter(h => h.sector === 'CANIL' || h.sector === 'CANIL_GENERAL' || h.sector === 'PERROS').length;
                const felinosCount = activeHospital.filter(h => h.sector === 'FELINOS' || h.sector === 'GATERIO_FELINOS').length;
                const aislamientoCount = activeHospital.filter(h => h.sector === 'AISLAMIENTO' || h.sector === 'AISLAMIENTO_INFECCIOSO').length;

                return [
                  { sector: 'UCI Críticos (4 caniles)', occupied: uciCount, total: 4, percent: Math.min(100, Math.round((uciCount / 4) * 100)), color: 'bg-red-500' },
                  { sector: 'Canil General (8 caniles)', occupied: canilCount, total: 8, percent: Math.min(100, Math.round((canilCount / 8) * 100)), color: 'bg-teal-600' },
                  { sector: 'Gaterío Felinos (4 caniles)', occupied: felinosCount, total: 4, percent: Math.min(100, Math.round((felinosCount / 4) * 100)), color: 'bg-purple-600' },
                  { sector: 'Aislamiento (2 caniles)', occupied: aislamientoCount, total: 2, percent: Math.min(100, Math.round((aislamientoCount / 2) * 100)), color: 'bg-amber-500' },
                ].map((s, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 font-medium">{s.sector}</span>
                      <span className="font-mono font-bold text-slate-900">{s.occupied}/{s.total}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${s.percent}%` }}
                        className={`h-full ${s.color} rounded-full transition-all`}
                      ></div>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Sector 2: Facturación por Servicio */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Ingresos por Facturación
              </span>
              <span className="text-emerald-700 font-bold font-mono">${(totalRevenue || 1280000).toLocaleString('es-AR')}</span>
            </div>

            <div className="space-y-2">
              {[
                { cat: 'Consultas & Urgencias', val: 450000, color: 'bg-teal-600' },
                { cat: 'Cirugías & Anestesia', val: 380000, color: 'bg-indigo-600' },
                { cat: 'Internación & UCI', val: 260000, color: 'bg-red-600' },
                { cat: 'Farmacia & Laboratorio', val: 190000, color: 'bg-emerald-600' },
              ].map((c, idx) => {
                const totalBase = totalRevenue || 1280000;
                const pct = Math.round((c.val / 1280000) * 100);
                const actualAmount = Math.round((c.val / 1280000) * totalBase);

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 font-medium truncate">{c.cat}</span>
                      <span className="font-mono font-bold text-slate-900 shrink-0">
                        ${actualAmount.toLocaleString('es-AR')} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full ${c.color} rounded-full transition-all`}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sector 3: Top Diagnósticos Frecuentes */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-600" />
              Top Casos & Patologías Frecuentes
            </span>

            <div className="space-y-2">
              {[
                { diag: '1. Gastroenteritis / Indiscreción dietaria', count: '18 casos', tag: 'Digestivo' },
                { diag: '2. Traumatismos / Fracturas por impacto', count: '11 casos', tag: 'Traumato' },
                { diag: '3. Dermatitis alérgica (DAPP / Atopia)', count: '9 casos', tag: 'Dermato' },
                { diag: '4. Insuficiencia renal crónica felina', count: '6 casos', tag: 'Nefrología' },
                { diag: '5. Profilaxis & Enfermedad periodontal', count: '5 casos', tag: 'Odonto' },
              ].map((d, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200/70"
                >
                  <span className="text-slate-800 font-semibold text-[11px] truncate">{d.diag}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 ml-2 whitespace-nowrap">
                    {d.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
