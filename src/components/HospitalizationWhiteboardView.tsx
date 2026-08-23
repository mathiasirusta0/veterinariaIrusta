import React, { useState, useEffect } from 'react';
import {
  BedDouble,
  AlertTriangle,
  Clock,
  Droplet,
  Pill,
  Plus,
  Sparkles,
  CheckCircle2,
  Filter,
  User,
  Heart,
  ArrowRight,
  ShieldAlert,
  Send,
  Printer,
  Radio,
  Calculator,
  Tv,
  X,
  Activity,
  Layers,
  Calendar,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Hospitalization, HospitalPriority } from '../types';
import { formatDate, formatDateTime, formatTime, formatWeight } from '../utils/formatters';

export const HospitalizationWhiteboardView: React.FC = () => {
  const {
    hospitalizations,
    patients,
    owners,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    administerMedication,
    dischargeHospitalPatient,
    updateHospitalPriority,
    callAiAssistant,
    openMonitor,
    openCalculators,
    openPrintModal,
    showToast,
  } = useVet();

  const [sectorFilter, setSectorFilter] = useState('TODOS');
  const [priorityFilter, setPriorityFilter] = useState('TODOS');
  const [administerMsg, setAdministerMsg] = useState<{ id: string; text: string; success: boolean } | null>(null);

  // TV Fullscreen Hospital Board Mode
  const [isTvMode, setIsTvMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('es-AR'));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('es-AR'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // AI Handover State
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverLoading, setHandoverLoading] = useState(false);
  const [handoverText, setHandoverText] = useState<string | null>(null);

  // Fluid Balance & Diuresis Modal State
  const [fluidBalanceHosp, setFluidBalanceHosp] = useState<Hospitalization | null>(null);
  const [fluidHours, setFluidHours] = useState<number>(12);
  const [fluidInfusedMl, setFluidInfusedMl] = useState<number>(600);
  const [oralWaterMl, setOralWaterMl] = useState<number>(50);
  const [urineMl, setUrineMl] = useState<number>(420);
  const [vomitDrainMl, setVomitDrainMl] = useState<number>(30);

  // Catheter / Device Tracking Modal State
  const [deviceHosp, setDeviceHosp] = useState<Hospitalization | null>(null);
  const [catheterSite, setCatheterSite] = useState('Vena Cefálica Derecha');
  const [catheterGauge, setCatheterGauge] = useState('22G (Azul)');
  const [catheterDate, setCatheterDate] = useState(new Date().toISOString().split('T')[0]);

  const activeHospital = hospitalizations.filter((h) => {
    const isAct = h.status === 'ACTIVA';
    const matchesSector = sectorFilter === 'TODOS' || h.sector === sectorFilter;
    const matchesPriority = priorityFilter === 'TODOS' || h.priority === priorityFilter;
    return isAct && matchesSector && matchesPriority;
  });

  const handleAdminister = (hospitalizationId: string, medicationId: string) => {
    const res = administerMedication(hospitalizationId, medicationId);
    setAdministerMsg({ id: medicationId, text: res.message, success: res.success });
    setTimeout(() => setAdministerMsg(null), 5000);
  };

  const handleGenerateHandover = async () => {
    setShowHandoverModal(true);
    setHandoverLoading(true);

    const activeList = hospitalizations
      .filter((h) => h.status === 'ACTIVA')
      .map((h) => {
        const p = patients.find((pat) => pat.id === h.patientId);
        return {
          canil: h.kennelNumber,
          sector: h.sector,
          paciente: p?.name,
          especie: p?.species,
          prioridad: h.priority,
          diagnostico: h.primaryDiagnosis,
          fluidos: h.fluidTherapy?.isActive ? `${h.fluidTherapy.rateMlPerHour} ml/h` : 'Detenida',
          medicacionPendiente: (h.medications || [])
            .filter((m) => m.status !== 'REALIZADA')
            .map((m) => `${m.drugName} a las ${m.scheduledTime}`)
            .join(', '),
        };
      });

    const res = await callAiAssistant(
      'handover_summary',
      'Generar pase de guardia para el equipo veterinario entrante',
      {
        patients: activeList,
      }
    );

    setHandoverLoading(false);
    if (res.success) {
      setHandoverText(res.text);
    }
  };

  // Fluid balance calculations
  const patientForFluid = fluidBalanceHosp ? patients.find((p) => p.id === fluidBalanceHosp.patientId) : null;
  const patientWeight = patientForFluid?.weight || 10;
  const totalInputs = fluidInfusedMl + oralWaterMl;
  const totalOutputs = urineMl + vomitDrainMl;
  const netFluidBalance = totalInputs - totalOutputs;
  const diuresisRateMlKgH =
    patientWeight > 0 && fluidHours > 0 ? (urineMl / (patientWeight * fluidHours)).toFixed(2) : '0';

  return (
    <div className="space-y-6 pb-12">
      {/* 🖥️ TV FULLSCREEN HOSPITAL BOARD MODE OVERLAY */}
      {isTvMode && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white p-6 overflow-y-auto flex flex-col justify-between">
          {/* TV Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-500 flex items-center justify-center font-black text-2xl text-slate-950 shadow-lg shadow-teal-500/30">
                V
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                  <span>HOSPITAL BOARD — SALA DE INTERNACIÓN & UCI</span>
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                </h1>
                <p className="text-xs text-teal-400 font-mono">
                  Monitoreo Operativo en Tiempo Real 24hs • {activeHospital.length} Pacientes Internados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <div className="text-right">
                <div className="text-3xl font-black font-mono text-emerald-400">{currentTime}</div>
                <div className="text-xs text-slate-400">Guardia Hospitalaria Activa</div>
              </div>
              <button
                onClick={() => setIsTvMode(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-700 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                <span>Salir de Modo TV</span>
              </button>
            </div>
          </div>

          {/* TV Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-6 flex-1">
            {activeHospital.map((hosp) => {
              const patient = patients.find((p) => p.id === hosp.patientId);
              if (!patient) return null;

              const isCritical = hosp.priority === 'CRITICO';
              const nextPendingMed = (hosp.medications || []).find((m) => m.status !== 'REALIZADA');

              return (
                <div
                  key={hosp.id}
                  className={`bg-slate-900 border-2 rounded-3xl p-6 shadow-2xl flex flex-col justify-between ${
                    isCritical
                      ? 'border-red-500 shadow-red-500/10'
                      : hosp.priority === 'PRIORITARIO'
                      ? 'border-orange-500 shadow-orange-500/10'
                      : 'border-teal-500/60 shadow-teal-500/10'
                  }`}
                >
                  <div>
                    {/* Top Row: Kennel & Priority */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-black font-mono bg-teal-500/20 text-teal-300 px-3.5 py-1 rounded-xl border border-teal-500/30">
                        {hosp.kennelNumber} ({hosp.sector})
                      </span>
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          isCritical
                            ? 'bg-red-500 text-white animate-pulse'
                            : hosp.priority === 'PRIORITARIO'
                            ? 'bg-orange-500 text-white'
                            : 'bg-teal-600 text-white'
                        }`}
                      >
                        {hosp.priority}
                      </span>
                    </div>

                    {/* Patient Name & Bio */}
                    <h2 className="text-2xl font-black text-white">{patient.name}</h2>
                    <p className="text-sm text-slate-400 font-medium">
                      {patient.species} • {patient.breed} • <span className="text-teal-300 font-bold">{patient.weight} kg</span>
                    </p>

                    {/* Diagnosis */}
                    <div className="my-4 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                        Diagnóstico:
                      </span>
                      <p className="text-sm font-bold text-slate-200">{hosp.primaryDiagnosis}</p>
                    </div>

                    {/* Fluid Therapy in TV */}
                    <div className="grid grid-cols-2 gap-3 text-xs font-mono mb-4">
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Fluidoterapia:</span>
                        {hosp.fluidTherapy?.isActive ? (
                          <span className="text-emerald-400 font-bold text-base block">
                            {hosp.fluidTherapy.rateMlPerHour} ml/h
                          </span>
                        ) : (
                          <span className="text-slate-500">Detenida</span>
                        )}
                      </div>
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">Ronda Signos:</span>
                        <span className="text-amber-400 font-bold text-base block">
                          {hosp.nextVitalsTime || '14:00'} hs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Next Medication */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Próximo Fármaco:</span>
                      <span className="font-bold text-white">
                        {nextPendingMed ? `${nextPendingMed.drugName} (${nextPendingMed.dose})` : 'Sin pendientes'}
                      </span>
                    </div>
                    {nextPendingMed && (
                      <span className="font-mono font-black text-amber-400 text-sm bg-slate-900 px-2 py-1 rounded-lg">
                        {nextPendingMed.scheduledTime} hs
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* TV Footer */}
          <div className="text-center text-xs text-slate-500 border-t border-slate-900 pt-3">
            VET SYSTEM 3.5 • Presione el botón superior o ESC para volver a la interfaz clínica completa.
          </div>
        </div>
      )}

      {/* Standard Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Pizarra Whiteboard Hospitalaria ({activeHospital.length} Pacientes)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Internación & Monitoreo Intensivo (UCI)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Control de fluidoterapia, balance hídrico, ronda horaria de fármacos, catéteres y pase de guardia
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsTvMode(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-400 border border-slate-800 text-xs font-bold shadow-md transition-all active:scale-95"
            title="Abrir vista de pantalla completa para monitor de internación"
          >
            <Tv className="w-4 h-4 text-teal-400" />
            <span>MODO TV GUARDIA</span>
          </button>

          <button
            onClick={() => openMonitor()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-emerald-400 border border-slate-800 text-xs font-bold shadow-sm transition-all"
            title="Abrir telemetría multiparamétrica de UCI"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Telemetría UCI</span>
          </button>

          <button
            onClick={() => openCalculators()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs transition-all"
            title="Calculadora de infusión y fluidoterapia"
          >
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span>Calculadora Dosis/Fluidos</span>
          </button>

          <button
            onClick={handleGenerateHandover}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all"
            title="Generar pase de guardia estructurado con IA"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Pase de Guardia (IA)</span>
          </button>

          <button
            onClick={() => setQuickModal('NUEVO_INGRESO_HOSPITAL')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Ingresar Paciente</span>
          </button>
        </div>
      </div>

      {/* Sector & Priority Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Sector:</span>
          {['TODOS', 'UCI', 'CANINOS', 'FELINOS', 'AISLAMIENTO_INFECCIOSOS'].map((sec) => (
            <button
              key={sec}
              onClick={() => setSectorFilter(sec)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                sectorFilter === sec
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Prioridad:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="TODOS">Todas las Prioridades</option>
            <option value="CRITICO">Crítico</option>
            <option value="PRIORITARIO">Prioritario</option>
            <option value="ESTABLE">Estable</option>
          </select>
        </div>
      </div>

      {/* Feedback Alert if Medication was administered */}
      {administerMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-bold animate-fade-in ${
            administerMsg.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{administerMsg.text}</span>
          </div>
          <button onClick={() => setAdministerMsg(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Grid of Hospitalized Patients Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {activeHospital.map((hosp) => {
          const patient = patients.find((p) => p.id === hosp.patientId) || patients[0];
          const isCritical = hosp.priority === 'CRITICO';

          return (
            <div
              key={hosp.id}
              className={`rounded-2xl border bg-white p-5 transition-all shadow-sm flex flex-col justify-between ${
                isCritical
                  ? 'border-l-4 border-l-red-500 border-slate-200'
                  : hosp.priority === 'PRIORITARIO'
                  ? 'border-l-4 border-l-orange-500 border-slate-200'
                  : 'border-l-4 border-l-teal-500 border-slate-200'
              }`}
            >
              <div>
                {/* Header: Photo, Name, Breed, Kennel and Priority */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={patient.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                      alt={patient.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{patient.name || 'Paciente Internado'}</h3>
                        <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                          {hosp.kennelNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {[patient.species, patient.breed, formatWeight(patient.weight)].filter(Boolean).join(' • ')}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Ingreso: {formatDate(hosp.admittedAt)} • Vet:{' '}
                        {hosp.vetInChargeName || 'Dr. Guardia'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <select
                      value={hosp.priority}
                      onChange={(e) =>
                        updateHospitalPriority(hosp.id, e.target.value as HospitalPriority)
                      }
                      className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase cursor-pointer focus:outline-none ${
                        isCritical
                          ? 'bg-red-500 text-white'
                          : hosp.priority === 'PRIORITARIO'
                          ? 'bg-orange-500 text-white'
                          : 'bg-teal-600 text-white'
                      }`}
                    >
                      <option value="ESTABLE">Estable</option>
                      <option value="PRIORITARIO">Prioritario</option>
                      <option value="CRITICO">Crítico</option>
                    </select>

                    <button
                      onClick={() => {
                        setSelectedPatientId(patient.id);
                        setActivePatientTab('INTERNACION');
                        setActiveView('PACIENTES');
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200/80 transition-colors"
                      title="Ver Ficha Clínica 360°"
                    >
                      <span>Ficha 360°</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Primary Diagnosis */}
                <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
                    Diagnóstico Principal:
                  </span>
                  <span className="text-slate-800 font-semibold">{hosp.primaryDiagnosis}</span>
                </div>

                {/* Fluidotherapy & Round Intervals & Quick Tools */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase mb-1">
                        <Droplet className="w-3.5 h-3.5 text-cyan-600" />
                        <span>Fluidoterapia</span>
                      </div>
                      {hosp.fluidTherapy?.isActive ? (
                        <div>
                          <span className="font-bold text-slate-900 block">
                            {hosp.fluidTherapy.solutionType}
                          </span>
                          <span className="text-[11px] text-teal-700 font-bold">
                            {hosp.fluidTherapy.rateMlPerHour} ml/h ({hosp.fluidTherapy.pumpNumber || 'Bomba'})
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-semibold">Sin infusión activa</span>
                      )}
                    </div>

                    <button
                      onClick={() => setFluidBalanceHosp(hosp)}
                      className="mt-2 text-[10px] font-bold text-teal-700 hover:text-teal-900 underline text-left flex items-center gap-1"
                    >
                      <span>📊 Balance Hídrico & Diuresis</span>
                    </button>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase mb-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>Ronda Horaria</span>
                      </div>
                      <span className="font-bold text-slate-900 block">
                        Cada {hosp.intervalHours || 2} horas
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Próx. Signos: <strong>{hosp.nextVitalsTime || '14:00'} hs</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => setDeviceHosp(hosp)}
                      className="mt-2 text-[10px] font-bold text-slate-600 hover:text-slate-900 underline text-left flex items-center gap-1"
                    >
                      <span>💉 Control Catéter IV / Sonda</span>
                    </button>
                  </div>
                </div>

                {/* Scheduled Medications Section */}
                <div className="space-y-2 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Esquema Horario de Medicación:
                  </span>

                  <div className="space-y-1.5">
                    {(hosp.medications || []).map((med) => {
                      const isOverdue = med.status === 'ATRASADA';
                      const isDone = med.status === 'REALIZADA';

                      return (
                        <div
                          key={med.id}
                          className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                            isDone
                              ? 'bg-slate-50 text-slate-400 border-slate-100'
                              : isOverdue
                              ? 'bg-red-50 text-red-900 border-red-200'
                              : 'bg-white text-slate-800 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono font-bold text-[11px] px-1.5 py-0.5 rounded ${
                                isDone
                                  ? 'bg-slate-200 text-slate-500'
                                  : isOverdue
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {med.scheduledTime}
                            </span>
                            <span className="font-bold">{med.drugName}</span>
                            <span className="text-[11px] text-slate-500">
                              ({med.dose} - {med.route})
                            </span>
                          </div>

                          <div>
                            {isDone ? (
                              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aplicado ({med.administeredAt})</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAdminister(hosp.id, med.id)}
                                className={`px-3 py-1 rounded-lg font-bold text-xs shadow-2xs transition-all active:scale-95 ${
                                  isOverdue
                                    ? 'bg-red-600 hover:bg-red-500 text-white'
                                    : 'bg-teal-600 hover:bg-teal-500 text-white'
                                }`}
                              >
                                Administrar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedPatientId(patient.id);
                    setActivePatientTab('INTERNACION');
                    setActiveView('PACIENTES');
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition-colors"
                >
                  Abrir Ficha Clínica
                </button>
                <button
                  onClick={() => dischargeHospitalPatient(hosp.id, 'Alta médica hospitalaria programada.')}
                  className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-xs transition-colors"
                >
                  Dar de Alta
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📊 MODAL DE BALANCE HÍDRICO & DIURESIS HORARIA */}
      {fluidBalanceHosp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-xl w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-cyan-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Balance Hídrico & Diuresis — {patientForFluid?.name} ({patientWeight} kg)
                </h3>
              </div>
              <button
                onClick={() => setFluidBalanceHosp(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Horas del Turno Evaluadas:</label>
                  <input
                    type="number"
                    value={fluidHours}
                    onChange={(e) => setFluidHours(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-cyan-800 block mb-1">Fluidos IV Infundidos (ml):</label>
                  <input
                    type="number"
                    value={fluidInfusedMl}
                    onChange={(e) => setFluidInfusedMl(Number(e.target.value))}
                    className="w-full bg-cyan-50 border border-cyan-200 rounded-xl p-2 font-mono font-bold text-cyan-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Agua / Sonda (ml):</label>
                  <input
                    type="number"
                    value={oralWaterMl}
                    onChange={(e) => setOralWaterMl(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-amber-700 block mb-1">Orina Medida (ml):</label>
                  <input
                    type="number"
                    value={urineMl}
                    onChange={(e) => setUrineMl(Number(e.target.value))}
                    className="w-full bg-amber-50 border border-amber-200 rounded-xl p-2 font-mono font-bold text-amber-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-red-700 block mb-1">Vómitos/Drenaje (ml):</label>
                  <input
                    type="number"
                    value={vomitDrainMl}
                    onChange={(e) => setVomitDrainMl(Number(e.target.value))}
                    className="w-full bg-red-50 border border-red-200 rounded-xl p-2 font-mono font-bold text-red-900"
                  />
                </div>
              </div>

              {/* Calculations Output Box */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Total Ingresos:</span>
                  <span className="font-bold text-cyan-300">+{totalInputs} ml</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Total Egresos:</span>
                  <span className="font-bold text-amber-300">-{totalOutputs} ml</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5 text-sm">
                  <span className="text-slate-300">Balance Hídrico Neto ({fluidHours}h):</span>
                  <span className={`font-bold ${netFluidBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {netFluidBalance > 0 ? `+${netFluidBalance}` : netFluidBalance} ml
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-between bg-slate-800 p-3 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">
                      Tasa de Diuresis Estimada:
                    </span>
                    <span className="text-xl font-black text-amber-300">{diuresisRateMlKgH} ml/kg/h</span>
                  </div>
                  <div className="text-right text-[11px] font-sans">
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        Number(diuresisRateMlKgH) >= 1.0 && Number(diuresisRateMlKgH) <= 2.5
                          ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                          : Number(diuresisRateMlKgH) < 1.0
                          ? 'bg-red-900/80 text-red-300 border border-red-700'
                          : 'bg-cyan-900/80 text-cyan-300 border border-cyan-700'
                      }`}
                    >
                      {Number(diuresisRateMlKgH) >= 1.0 && Number(diuresisRateMlKgH) <= 2.5
                        ? '✅ Normodiuresis'
                        : Number(diuresisRateMlKgH) < 0.2
                        ? '🚨 Anuria Crítica'
                        : Number(diuresisRateMlKgH) < 1.0
                        ? '⚠️ Oliguria'
                        : '🔵 Poliuria'}
                    </span>
                    <span className="text-slate-400 block text-[9px] mt-0.5">Ref: 1.0 - 2.0 ml/kg/h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  showToast('success', 'Balance Registrado', `Balance ${netFluidBalance > 0 ? `+${netFluidBalance}` : netFluidBalance} ml (${diuresisRateMlKgH} ml/kg/h) guardado en la ficha.`);
                  setFluidBalanceHosp(null);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs shadow-md"
              >
                Guardar Registro de Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 💉 MODAL DE CONTROL DE CATÉTERES & DISPOSITIVOS INVASIVOS */}
      {deviceHosp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Control de Catéteres & Sondas</h3>
              </div>
              <button
                onClick={() => setDeviceHosp(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Vía / Ubicación Anatómica:</label>
                <select
                  value={catheterSite}
                  onChange={(e) => setCatheterSite(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold"
                >
                  <option value="Vena Cefálica Derecha">Vena Cefálica Derecha (Miembro anterior derecho)</option>
                  <option value="Vena Cefálica Izquierda">Vena Cefálica Izquierda (Miembro anterior izquierdo)</option>
                  <option value="Vena Safena Lateral">Vena Safena Lateral (Canino)</option>
                  <option value="Vena Safena Medial / Femoral">Vena Safena Medial (Felino)</option>
                  <option value="Vena Yugular Central">Vena Yugular (Acceso Central)</option>
                  <option value="Sonda Urinaria Foley / Tomcat">Sonda Urinaria (Cateterismo vesical)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Calibre del Catéter:</label>
                  <select
                    value={catheterGauge}
                    onChange={(e) => setCatheterGauge(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold"
                  >
                    <option value="20G (Rosa - Caninos medianos/grandes)">20G (Rosa)</option>
                    <option value="22G (Azul - Caninos pequeños/gatos)">22G (Azul)</option>
                    <option value="24G (Amarillo - Cachorros/gatitos)">24G (Amarillo)</option>
                    <option value="18G (Verde - Cirugía/Transfusión)">18G (Verde)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha de Colocación:</label>
                  <input
                    type="date"
                    value={catheterDate}
                    onChange={(e) => setCatheterDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-2xl space-y-1">
                <span className="font-bold block text-[11px]">Protocolo de Mantenimiento Hospitalario:</span>
                <p className="text-[10px] leading-relaxed">
                  • Verificar permeabilidad y ausencia de flebitis/edema cada 12 horas.<br/>
                  • Recambio obligatorio de vía venosa periférica a las <strong>72 horas</strong> de permanencia.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  showToast('success', 'Catéter Registrado', `${catheterSite} (${catheterGauge}) registrado correctamente.`);
                  setDeviceHosp(null);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs shadow-md"
              >
                Guardar Registro de Catéter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Handover Modal */}
      {showHandoverModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Pase de Guardia Inteligente (IA Generative)
                </h3>
              </div>
              <button
                onClick={() => setShowHandoverModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {handoverLoading ? (
                <div className="py-12 text-center text-slate-500 space-y-2">
                  <Sparkles className="w-8 h-8 text-teal-600 animate-spin mx-auto" />
                  <p className="text-xs font-semibold">
                    Generando resumen clínico del pase de guardia con Gemini IA...
                  </p>
                </div>
              ) : (
                <div className="prose prose-sm text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap font-mono">
                  {handoverText}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Resumen clínico estructurado de {activeHospital.length} pacientes internados
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(handoverText || '');
                  showToast('success', 'Copiado', 'Pase de guardia copiado al portapapeles.');
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition-colors"
              >
                Copiar Pase de Guardia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
