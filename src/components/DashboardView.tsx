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
  Sparkles,
  CheckCircle2,
  Activity,
  Droplet,
  Calculator,
  Radio,
  TrendingUp,
  DollarSign,
  PieChart,
  Percent,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const DashboardView: React.FC = () => {
  const {
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
    openMonitor,
  } = useVet();

  // Metrics
  const activeHospital = hospitalizations.filter((h) => h.status === 'ACTIVA');
  const criticalPatients = activeHospital.filter(
    (h) => h.priority === 'CRITICO' || h.priority === 'PRIORITARIO'
  );

  let upcomingMedsCount = 0;
  let overdueMedsCount = 0;
  activeHospital.forEach((h) => {
    h.medications.forEach((m) => {
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
          <button
            onClick={() => openCalculators()}
            className="bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 px-3.5 py-2.5 rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
            title="Calculadora médica y dosis"
          >
            <Calculator className="w-4 h-4 text-teal-600" />
            <span>CALCULADORA DOSIS</span>
          </button>
          <button
            onClick={() => openMonitor()}
            className="bg-slate-900 border border-slate-700 text-emerald-400 hover:bg-slate-800 px-3.5 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            title="Monitor multiparamétrico en vivo"
          >
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>TELEMETRÍA UCI</span>
          </button>
          <button
            onClick={() => setQuickModal('NUEVA_CONSULTA')}
            className="bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-md shadow-teal-600/20 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ NUEVA CONSULTA</span>
          </button>
          <button
            onClick={() => setQuickModal('INGRESO_INTERNACION')}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
          >
            <BedDouble className="w-4 h-4 text-slate-500" />
            <span>INTERNAR</span>
          </button>
        </div>
      </div>

      {/* 4 Sleek Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pacientes Críticos */}
        <div
          onClick={() => setActiveView('INTERNACION')}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Pacientes Críticos
          </span>
          <span className="text-3xl font-black text-slate-900">
            {String(criticalPatients.length).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-red-500 font-bold mt-2 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {criticalPatients.length > 0
              ? 'REQUIEREN ATENCIÓN INMEDIATA'
              : 'ESTABLES EN UCI'}
          </span>
        </div>

        {/* Card 2: Tratamientos Atrasados */}
        <div
          onClick={() => setActiveView('INTERNACION')}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-orange-500 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Tratamientos Atrasados
          </span>
          <span className="text-3xl font-black text-slate-900">
            {String(overdueMedsCount).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-orange-600 font-bold mt-2 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {overdueMedsCount > 0 ? `${overdueMedsCount} PENDIENTES DE APLICACIÓN` : 'RONDA AL DÍA'}
          </span>
        </div>

        {/* Card 3: Internados */}
        <div
          onClick={() => setActiveView('INTERNACION')}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-teal-500 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Internados en Canil/UCI
          </span>
          <span className="text-3xl font-black text-slate-900">
            {String(activeHospital.length).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-teal-600 font-bold mt-2 flex items-center gap-1">
            <BedDouble className="w-3 h-3" />
            OCUPACIÓN: {Math.round((activeHospital.length / 12) * 100)}% (Capacidad 12)
          </span>
        </div>

        {/* Card 4: Turnos de Hoy */}
        <div
          onClick={() => setActiveView('AGENDA')}
          className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-blue-500 flex flex-col justify-between cursor-pointer hover:shadow-md transition-shadow"
        >
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Turnos de Hoy
          </span>
          <span className="text-3xl font-black text-slate-900">
            {String(todayAppointments.length).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-blue-600 font-bold mt-2 flex items-center gap-1">
            <CalendarDays className="w-3 h-3" />
            {waitingTriage.length} EN SALA DE ESPERA
          </span>
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
          onClick={() => setActiveView('SALA_ESPERA')}
          className="bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between text-left transition-colors shadow-xs"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{waitingTriage.length} Pacientes</div>
              <div className="text-[10px] text-slate-400">Triage / Espera</div>
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

      {/* Main Section: 8-col Whiteboard Table + 4-col Schedule & AI widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Whiteboard Hospitalization Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          {/* Card Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <BedDouble className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-900 text-sm">
                Whiteboard de Internación (UCI / Hospital)
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded text-slate-600">
                {activeHospital.length} PACIENTES ACTIVOS
              </span>
              <button
                onClick={() => setActiveView('INTERNACION')}
                className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1 ml-2"
              >
                <span>Ver Pizarra</span>
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
                {activeHospital.map((hosp) => {
                  const patient = patients.find((p) => p.id === hosp.patientId);
                  if (!patient) return null;

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
                              {hosp.fluidTherapy.isActive && (
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

                      {/* Next Action */}
                      <td className="px-4 py-3.5">
                        {nextMed ? (
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-xs">
                              💊 {nextMed.drugName}
                            </span>
                            <span
                              className={`text-[10px] font-bold ${
                                nextMed.status === 'ATRASADA' ? 'text-red-500' : 'text-slate-400'
                              }`}
                            >
                              {nextMed.status === 'ATRASADA'
                                ? `Atrasado (${nextMed.scheduledTime} hs)`
                                : `${nextMed.scheduledTime} hs`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Sin pendientes</span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => openPatientDetail(patient.id, 'INTERNACION')}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded text-xs transition-colors"
                        >
                          FICHA
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Appointments & Sleek AI Assistant Card */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Appointments Widget */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-teal-600" />
                <span>Turnos Próximos</span>
              </h3>
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
                <div className="text-center py-6 text-slate-400 text-xs">
                  No hay más turnos agendados para hoy.
                </div>
              )}
            </div>
          </div>

          {/* Sleek Dark IA Assistant Feature Card */}
          <div className="bg-[#1E293B] rounded-2xl shadow-lg p-5 flex flex-col relative overflow-hidden text-white">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <h3 className="text-white text-sm font-bold">IA Clinical Assistant</h3>
            </div>
            <p className="text-slate-300 text-xs mb-4 italic leading-relaxed">
              "Toby (Canil UCI-02) presenta fiebre persistente y diarrea con sangre. Sugiero
              reevaluar ritmo de fluidoterapia y verificar compatibilidad antibiótica."
            </p>
            <button
              onClick={() => setActiveView('ASISTENTE_IA')}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-[#0F172A] rounded-lg text-xs font-bold transition-all uppercase tracking-wide shadow-sm"
            >
              Consultar Asistente IA
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Hospital Analytics & Clinical Activity Grid */}
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
              <span className="text-teal-700 font-bold font-mono">75% Global</span>
            </div>

            <div className="space-y-2">
              {[
                { sector: 'UCI Críticos (4 caniles)', occupied: 3, total: 4, percent: 75, color: 'bg-red-500' },
                { sector: 'Canil General (8 caniles)', occupied: 6, total: 8, percent: 75, color: 'bg-teal-600' },
                { sector: 'Gaterío Felinos (4 caniles)', occupied: 2, total: 4, percent: 50, color: 'bg-purple-600' },
                { sector: 'Aislamiento (2 caniles)', occupied: 1, total: 2, percent: 50, color: 'bg-amber-500' },
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
              ))}
            </div>
          </div>

          {/* Sector 2: Facturación por Servicio */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Ingresos por Especialidad
              </span>
              <span className="text-emerald-700 font-bold font-mono">$1.280.000</span>
            </div>

            <div className="space-y-2">
              {[
                { cat: 'Consultas & Urgencias', amount: '$450.000', percent: 35, color: 'bg-teal-600' },
                { cat: 'Cirugías & Anestesia', amount: '$380.000', percent: 30, color: 'bg-indigo-600' },
                { cat: 'Internación & UCI', amount: '$260.000', percent: 20, color: 'bg-red-600' },
                { cat: 'Farmacia & Laboratorio', amount: '$190.000', percent: 15, color: 'bg-emerald-600' },
              ].map((c, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-700 font-medium">{c.cat}</span>
                    <span className="font-mono font-bold text-slate-900">{c.amount} ({c.percent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${c.percent}%` }}
                      className={`h-full ${c.color} rounded-full transition-all`}
                    ></div>
                  </div>
                </div>
              ))}
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
    </div>
  );
};
