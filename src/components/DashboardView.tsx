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
  Scale,
  Lock,
  Trash2,
  FileText,
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
            OCUPACIÓN: {Math.round((activeHospital.length / 18) * 100)}% ({activeHospital.length}/18 camas)
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

      {/* Enterprise Regulatory, Controlled Drugs & QA Fast Strip */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-tight text-white flex items-center gap-2">
              <span>Marco Legal Córdoba & Trazabilidad SENASA</span>
              <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                100% Auditado
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Leyes 11.076 / 5.142 (CMVC), Psicotrópicos Leyes 17.818/19.303, Residuos Ley 24.051 y QA en vivo.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setActiveView('RECETAS_OFICIALES')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            <span>Recetas SENASA</span>
          </button>

          <button
            onClick={() => setActiveView('CONTROL_PSICOTROPICOS')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Psicotrópicos</span>
          </button>

          <button
            onClick={() => setActiveView('RESIDUOS_PATOLOGICOS')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Residuos</span>
          </button>

          <button
            onClick={() => setActiveView('CUMPLIMIENTO_NORMATIVO')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
          >
            <Scale className="w-3.5 h-3.5 text-teal-400" />
            <span>Normativa CMVC</span>
          </button>

          <button
            onClick={() => setActiveView('CENTRO_QA')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>QA en Vivo</span>
          </button>
        </div>
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
                {activeHospital.length} {activeHospital.length === 1 ? 'PACIENTE ACTIVO' : 'PACIENTES ACTIVOS'}
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

          {/* Sleek Dark IA Assistant Feature Card — Clinically Safe & Auditable */}
          <div className="bg-[#1E293B] rounded-2xl shadow-lg p-5 flex flex-col relative overflow-hidden text-white space-y-3">
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-white text-sm font-bold">Asistente Clínico IA (Gemini 3.7)</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono">
                91% Relevancia
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <p className="font-bold text-teal-300 text-[11px]">
                Sugerencia para: Toby (Canil UCI-02) • Canino / Golden Retriever (28 kg)
              </p>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Fiebre persistente + diarrea hemorrágica. Se sugiere reevaluar tasa de fluidoterapia de reemplazo y verificar compatibilidad antibiótica.
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-amber-400/30 text-[10px] text-amber-200/90 leading-tight">
              ⚠️ <strong>Borrador orientativo asistido:</strong> Requiere validación y prescripción médica por profesional matriculado (Ley 11.076 CMVC).
            </div>

            <button
              onClick={() => setActiveView('ASISTENTE_IA')}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-[#0F172A] rounded-xl text-xs font-bold transition-all uppercase tracking-wide shadow-sm active:scale-98"
            >
              Abrir Asistente IA →
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
    </div>
  );
};
