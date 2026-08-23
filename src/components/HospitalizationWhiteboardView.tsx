import React, { useState } from 'react';
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
  Activity,
  Layers,
  Calendar,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Hospitalization, HospitalPriority } from '../types';
import { formatDate, formatDateTime, formatTime, formatWeight } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { EmptyState } from './ui';

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
  const [speciesFilter, setSpeciesFilter] = useState('TODAS');
  const [interventionHosp, setInterventionHosp] = useState<Hospitalization | null>(null);
  const [interventionTab, setInterventionTab] = useState<'RESUMEN' | 'EVOLUCION' | 'PLAN' | 'RESULTADOS'>('RESUMEN');
  const [showIndicateModal, setShowIndicateModal] = useState(false);
  const [indicationType, setIndicationType] = useState<'MEDICACION' | 'FLUIDOS' | 'ESTUDIO' | 'PROCEDIMIENTO' | 'MONITOREO'>('MEDICACION');
  const [newIndicationDrug, setNewIndicationDrug] = useState('');
  const [newIndicationDose, setNewIndicationDose] = useState('');
  const [newIndicationFreq, setNewIndicationFreq] = useState('Cada 12 horas');
  const [newIndicationRoute, setNewIndicationRoute] = useState('IV');
  const [newIndicationTarget, setNewIndicationTarget] = useState('');

  const [priorityFilter, setPriorityFilter] = useState('TODOS');
  const [administerMsg, setAdministerMsg] = useState<{ id: string; text: string; success: boolean } | null>(null);

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
    const pat = patients.find((p) => p.id === h.patientId);
    const matchesSector = sectorFilter === 'TODOS' || h.sector === sectorFilter || (sectorFilter === 'UCI' && h.sector?.includes('UCI'));
    const matchesPriority = priorityFilter === 'TODOS' || h.priority === priorityFilter;
    const matchesSpecies = speciesFilter === 'TODAS' || pat?.species?.toUpperCase() === speciesFilter.toUpperCase();
    return isAct && matchesSector && matchesPriority && matchesSpecies;
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
    <div className="space-y-4 pb-12 w-full max-w-full">
      {/* 🏥 Encabezado Principal Compacto & Profesional */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full max-w-full transition-all">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-bold text-teal-800 uppercase tracking-wider">
              {activeHospital.length} {activeHospital.length === 1 ? 'Paciente en Sala' : 'Pacientes en Sala'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-words whitespace-normal leading-tight">
            Internación & Monitoreo Intensivo
          </h1>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
            Control de fluidoterapia, balance hídrico, ronda horaria de fármacos, catéteres y pase de guardia
          </p>
        </div>

        {/* Acciones Clínicas: 2 columnas en mobile/tablet, flex en desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2 sm:gap-2.5 flex-shrink-0 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              openMonitor();
            }}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-1.5 touch-manipulation"
            title="Abrir telemetría multiparamétrica de UCI"
          >
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse flex-shrink-0" />
            <span>Telemetría</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              openCalculators();
            }}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-1.5 touch-manipulation"
            title="Calculadora de infusión y fluidoterapia"
          >
            <Calculator className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>Dosis / Fluidos</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              handleGenerateHandover();
            }}
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-50/80 hover:bg-teal-100 text-teal-800 border border-teal-200 shadow-2xs transition-all active:scale-95 flex items-center justify-center gap-1.5 touch-manipulation"
            title="Generar pase de guardia estructurado con IA"
          >
            <Sparkles className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>Pase Guardia (IA)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              setQuickModal('NUEVO_INGRESO_HOSPITAL');
            }}
            className="min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 touch-manipulation sm:col-span-2 lg:col-span-1"
            title="Registrar nuevo ingreso a internación"
          >
            <Plus className="w-4 h-4 stroke-[3] flex-shrink-0" />
            <span>+ Ingresar Paciente</span>
          </button>
        </div>
      </div>

      {/* Clean Assistance Sector & Species Filter Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-3 text-xs">
        {/* Row 1: Clinical Assistance Sectors */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-slate-400 uppercase text-[10px] mr-1">Sector Asistencial:</span>
            {[
              { id: 'TODOS', label: 'Todos los Sectores' },
              { id: 'UCI', label: '🚨 Cuidados Intensivos (UCI)' },
              { id: 'INTERNACION_GENERAL', label: '🏥 Internación General' },
              { id: 'AISLAMIENTO_INFECCIOSOS', label: '🛡️ Aislamiento Infeccioso' },
              { id: 'RECUPERACION_QUIRURGICA', label: '✂️ Recuperación Quirúrgica' },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setSectorFilter(sec.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  sectorFilter === sec.id
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400 uppercase text-[10px]">Prioridad:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-bold focus:ring-2 focus:ring-teal-500"
            >
              <option value="TODOS">Todas las Prioridades</option>
              <option value="CRITICO">🚨 Crítico</option>
              <option value="PRIORITARIO">⚠️ Prioritario</option>
              <option value="ESTABLE">✓ Estable</option>
            </select>
          </div>
        </div>

        {/* Row 2: Species Filter (Separated from Clinical Sectors) */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <span className="font-bold text-slate-400 uppercase text-[10px]">Filtrar Especie:</span>
          {['TODAS', 'CANINO', 'FELINO', 'EXOTICO'].map((sp) => (
            <button
              key={sp}
              onClick={() => setSpeciesFilter(sp)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                speciesFilter === sp
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-500 hover:text-slate-800'
              }`}
            >
              {sp === 'TODAS' ? 'Todas las especies' : sp === 'CANINO' ? '🐶 Caninos' : sp === 'FELINO' ? '🐱 Felinos' : '🦜 Exóticos'}
            </button>
          ))}
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
      {activeHospital.length === 0 ? (
        <EmptyState
          icon={BedDouble}
          title="No hay pacientes internados"
          description={
            sectorFilter !== 'TODOS' || priorityFilter !== 'TODOS' || speciesFilter !== 'TODAS'
              ? 'No se encontraron pacientes internados con los filtros de sector o prioridad seleccionados.'
              : 'Actualmente no hay pacientes en las salas de internación o UCI del hospital.'
          }
          actionLabel="Ingresar Paciente a Internación"
          onAction={() => setQuickModal('NUEVO_INGRESO_HOSPITAL')}
        />
      ) : (
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

              {/* Bottom Card Actions — Single Primary Action & Contextual Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  onClick={() => {
                    setSelectedPatientId(patient.id);
                    setInterventionHosp(hosp);
                    setInterventionTab('RESUMEN');
                  }}
                  className="flex-1 py-2 px-4 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs transition-all shadow-sm shadow-teal-600/20 active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>Abrir Intervención</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setSelectedPatientId(patient.id);
                    setActivePatientTab('RESUMEN');
                    setActiveView('PACIENTES');
                  }}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all"
                  title="Abrir Ficha 360° Completa"
                >
                  Ficha 360°
                </button>

                <button
                  onClick={() => dischargeHospitalPatient(hosp.id, 'Alta médica hospitalaria programada.')}
                  className="py-2 px-3 bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-slate-500 font-bold rounded-xl text-xs transition-all"
                  title="Dar de alta al paciente"
                >
                  Alta
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

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

      {/* 🏥 ESPACIO DE INTERVENCIÓN RÁPIDA DEL PACIENTE (MODAL WORKSPACE) */}
      {interventionHosp && (() => {
        const patient = patients.find((p) => p.id === interventionHosp.patientId) || patients[0];
        const isCritical = interventionHosp.priority === 'CRITICO';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden text-left">
              {/* Persistent Header */}
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
                        {interventionHosp.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">
                      {patient.species} • {patient.breed} • {formatWeight(patient.weight)} • <span className="text-teal-400 font-bold">Canil {interventionHosp.kennelNumber} ({interventionHosp.sector})</span>
                    </p>
                  </div>
                </div>

                {/* 3 Main Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedPatientId(patient.id);
                      setActivePatientTab('HISTORIA');
                      setActiveView('PACIENTES');
                    }}
                    className="px-3.5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Evolucionar</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPatientId(patient.id);
                      setActivePatientTab('SIGNOS');
                      setActiveView('PACIENTES');
                    }}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-teal-300 font-bold text-xs rounded-xl transition-all border border-slate-700 flex items-center gap-1.5"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Registrar Signos</span>
                  </button>
                  <button
                    onClick={() => setShowIndicateModal(true)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Pill className="w-3.5 h-3.5" />
                    <span>+ Indicar</span>
                  </button>
                  <button
                    onClick={() => setInterventionHosp(null)}
                    className="text-slate-400 hover:text-white p-2 text-lg font-bold ml-2"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Workspace Navigation Tabs */}
              <div className="px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 flex items-center gap-2 flex-shrink-0">
                {[
                  { id: 'RESUMEN', label: '1. Resumen Clínico' },
                  { id: 'PLAN', label: '2. Plan de Intervención & Fármacos' },
                  { id: 'EVOLUCION', label: '3. Línea de Evolución' },
                  { id: 'RESULTADOS', label: '4. Estudios & Lab' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setInterventionTab(tab.id as any)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      interventionTab === tab.id
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
                {interventionTab === 'RESUMEN' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Diagnosis & Fluid Status */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="font-bold text-teal-900 text-xs uppercase tracking-wider block">
                        Diagnóstico & Fluidoterapia
                      </span>
                      <p className="text-sm font-bold text-slate-800">{interventionHosp.primaryDiagnosis}</p>
                      {interventionHosp.fluidTherapy?.isActive && (
                        <div className="p-3 bg-teal-100/60 rounded-xl text-xs text-teal-950 font-medium space-y-1">
                          <div className="font-bold">💧 Solución: {interventionHosp.fluidTherapy.solutionType}</div>
                          <div>Tasa: <span className="font-black font-mono">{interventionHosp.fluidTherapy.rateMlPerHour} ml/h</span> ({interventionHosp.fluidTherapy.dropsPerMinute} gtt/min)</div>
                        </div>
                      )}
                    </div>

                    {/* Next Meds Queue */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <span className="font-bold text-indigo-900 text-xs uppercase tracking-wider block">
                        Medicaciones Próximas en Ronda
                      </span>
                      <div className="space-y-2">
                        {(interventionHosp.medications || []).map((med) => (
                          <div key={med.id} className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-slate-900">{med.drugName} ({med.dose})</div>
                              <div className="text-[10px] text-slate-500 font-mono">⏰ {med.scheduledTime} hs • Vía {med.route}</div>
                            </div>
                            <button
                              onClick={() => handleAdminister(interventionHosp.id, med.id)}
                              className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold text-[11px]"
                            >
                              ✓ Administrar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {interventionTab === 'PLAN' && (
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Plan Farmacológico y Terapéutico Activo</h4>
                      <button
                        onClick={() => setShowIndicateModal(true)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs"
                      >
                        + Nueva Indicación
                      </button>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                      {(interventionHosp.medications || []).map((med) => (
                        <div key={med.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">💊 {med.drugName}</div>
                            <div className="text-slate-500 text-xs mt-0.5">Dosis: {med.dose} • Vía: {med.route} • Frecuencia: {med.frequency}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold text-slate-700">{med.scheduledTime} hs</span>
                            <button
                              onClick={() => handleAdminister(interventionHosp.id, med.id)}
                              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold"
                            >
                              ✓ Registrar Aplicación
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {interventionTab === 'EVOLUCION' && (
                  <div className="text-center py-8 text-slate-500 text-xs space-y-3">
                    <p>Las evoluciones del paciente están sincronizadas con su ficha médica.</p>
                    <button
                      onClick={() => {
                        setSelectedPatientId(patient.id);
                        setActivePatientTab('HISTORIA');
                        setActiveView('PACIENTES');
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs"
                    >
                      Abrir Ficha de Evolución Completa →
                    </button>
                  </div>
                )}

                {interventionTab === 'RESULTADOS' && (
                  <div className="text-center py-8 text-slate-500 text-xs space-y-3">
                    <p>Órdenes de laboratorio e informes radiológicos vinculados al paciente.</p>
                    <button
                      onClick={() => {
                        setSelectedPatientId(patient.id);
                        setActivePatientTab('LABORATORIO');
                        setActiveView('PACIENTES');
                      }}
                      className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs"
                    >
                      Ver Resultados de Laboratorio e Imágenes →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL: INDICAR TRATAMIENTO O ESTUDIO */}
      {showIndicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-left text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900">+ Indicar al Plan Terapéutico</h3>
              <button onClick={() => setShowIndicateModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Tipo de Indicación</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['MEDICACION', 'FLUIDOS', 'ESTUDIO'].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setIndicationType(t as any)}
                      className={`py-1.5 px-2 rounded-lg font-bold text-center ${
                        indicationType === t
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {t === 'MEDICACION' ? '💊 Medicación' : t === 'FLUIDOS' ? '💧 Fluidos' : '🧪 Estudio'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Fármaco / Procedimiento / Estudio</label>
                <input
                  type="text"
                  value={newIndicationDrug}
                  onChange={(e) => setNewIndicationDrug(e.target.value)}
                  placeholder="ej: Maropitant 10mg/ml, Ringer Lactato, Hemograma..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dosis / Volumen</label>
                  <input
                    type="text"
                    value={newIndicationDose}
                    onChange={(e) => setNewIndicationDose(e.target.value)}
                    placeholder="ej: 1.2 ml (1mg/kg)"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vía de Aplicación</label>
                  <select
                    value={newIndicationRoute}
                    onChange={(e) => setNewIndicationRoute(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  >
                    <option value="IV">Intravenosa (IV)</option>
                    <option value="SC">Subcutánea (SC)</option>
                    <option value="IM">Intramuscular (IM)</option>
                    <option value="PO">Oral (PO)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowIndicateModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('success', 'Indicación Guardada', `${newIndicationDrug || 'Fármaco'} agregado al plan terapéutico.`);
                  setShowIndicateModal(false);
                  setNewIndicationDrug('');
                  setNewIndicationDose('');
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-md shadow-indigo-600/20"
              >
                ✓ Guardar Indicación
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
