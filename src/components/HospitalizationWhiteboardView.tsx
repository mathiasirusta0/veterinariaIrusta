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
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Hospitalization, HospitalPriority } from '../types';

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
  } = useVet();

  const [sectorFilter, setSectorFilter] = useState('TODOS');
  const [priorityFilter, setPriorityFilter] = useState('TODOS');
  const [administerMsg, setAdministerMsg] = useState<{ id: string; text: string; success: boolean } | null>(null);

  // AI Handover State
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [handoverLoading, setHandoverLoading] = useState(false);
  const [handoverText, setHandoverText] = useState<string | null>(null);

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
          fluidos: h.fluidTherapy.isActive ? `${h.fluidTherapy.rateMlPerHour} ml/h` : 'Detenida',
          medicacionPendiente: h.medications
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
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
            Control de fluidoterapia, ronda horaria de fármacos, tareas de enfermería y pase de guardia
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => openMonitor()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 hover:bg-slate-900 text-emerald-400 border border-slate-800 text-xs font-bold shadow-sm transition-all"
            title="Abrir telemetría multiparamétrica de UCI"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Telemetría UCI</span>
          </button>

          <button
            onClick={() => openCalculators()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold shadow-2xs transition-all"
            title="Calculadora de infusión y fluidoterapia"
          >
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span>Calculadora Dosis/Fluidos</span>
          </button>

          <button
            onClick={handleGenerateHandover}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E293B] hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Pase de Guardia IA</span>
          </button>

          <button
            onClick={() => setQuickModal('INGRESO_INTERNACION')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Internar Paciente</span>
          </button>
        </div>
      </div>

      {/* Sector & Priority Filter Bar */}
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-500 uppercase text-[11px] mr-1">Sector:</span>
          {['TODOS', 'UCI_CRITICOS', 'CANIL_GENERAL', 'FELINOS', 'AISLAMIENTO_INFECCIOSO'].map(
            (sec) => (
              <button
                key={sec}
                onClick={() => setSectorFilter(sec)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  sectorFilter === sec
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec === 'TODOS'
                  ? 'Todos los Sectores'
                  : sec === 'UCI_CRITICOS'
                  ? 'UCI Críticos'
                  : sec === 'CANIL_GENERAL'
                  ? 'Caniles'
                  : sec === 'FELINOS'
                  ? 'Gaterío'
                  : 'Aislamiento'}
              </button>
            )
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500 uppercase text-[11px]">Prioridad:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-700 focus:outline-none"
          >
            <option value="TODOS">Todas</option>
            <option value="CRITICO">🔴 Crítico</option>
            <option value="PRIORITARIO">🟠 Prioritario</option>
            <option value="ESTABLE">🟢 Estable</option>
            <option value="ALTA_MEDICA">⚪ En Observación</option>
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
          const patient = patients.find((p) => p.id === hosp.patientId);
          if (!patient) return null;

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
                        <h3 className="text-base font-bold text-slate-900">{patient.name}</h3>
                        <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                          {hosp.kennelNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {patient.species} • {patient.breed} • {patient.weight} kg
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Ingreso: {new Date(hosp.admittedAt).toLocaleDateString('es-AR')} • Vet:{' '}
                        {hosp.vetInChargeName}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
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
                      <option value="CRITICO">CRÍTICO</option>
                      <option value="PRIORITARIO">PRIORITARIO</option>
                      <option value="ESTABLE">ESTABLE</option>
                      <option value="ALTA_MEDICA">ALTA MÉDICA</option>
                    </select>
                  </div>
                </div>

                {/* Primary Diagnosis */}
                <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block mb-0.5">
                    Diagnóstico Principal:
                  </span>
                  <span className="text-slate-800 font-semibold">{hosp.primaryDiagnosis}</span>
                </div>

                {/* Fluidotherapy & Round Intervals */}
                <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase mb-1">
                      <Droplet className="w-3.5 h-3.5 text-cyan-600" />
                      <span>Fluidoterapia</span>
                    </div>
                    {hosp.fluidTherapy.isActive ? (
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

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase mb-1">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ronda Horaria</span>
                    </div>
                    <span className="font-bold text-slate-900 block">
                      Cada {hosp.intervalHours} horas
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Próx. Signos: <strong>{hosp.nextVitalsTime} hs</strong>
                    </span>
                  </div>
                </div>

                {/* Scheduled Medications Section */}
                <div className="space-y-2 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Esquema Horario de Medicación:
                  </span>

                  <div className="space-y-1.5">
                    {hosp.medications.map((med) => {
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
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {handoverText}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
              <span className="text-slate-400">Pase generado para el turno de guardia</span>
              <button
                onClick={() => setShowHandoverModal(false)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg font-bold"
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
