import React from 'react';
import {
  Scissors,
  Plus,
  Clock,
  Heart,
  Activity,
  AlertTriangle,
  User,
  CheckCircle2,
  Radio,
  Calculator,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const SurgeriesView: React.FC = () => {
  const {
    surgeries,
    patients,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openMonitor,
    openCalculators,
  } = useVet();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Scissors className="w-5 h-5 text-teal-600" />
            <span>Quirófano, Cirugías & Protocolos Anestésicos</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Monitoreo pre, intra y posquirúrgico con registro anestésico ASA
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openMonitor()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-emerald-400 border border-slate-800 text-xs font-bold rounded-lg shadow-sm transition-all"
            title="Abrir telemetría de monitoreo anestésico"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Monitor Quirúrgico</span>
          </button>

          <button
            onClick={() => openCalculators()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-lg shadow-2xs transition-all"
            title="Calculadora anestésica y dosis"
          >
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span>Calculadora Dosis</span>
          </button>

          <button
            onClick={() => setQuickModal('NUEVA_CIRUGIA')}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Programar Cirugía</span>
          </button>
        </div>
      </div>

      {/* Surgeries List */}
      <div className="space-y-4">
        {surgeries.map((surg) => {
          const patient = patients.find((p) => p.id === surg.patientId);

          return (
            <div
              key={surg.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{surg.procedureName}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {surg.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paciente: <span className="text-slate-900 font-bold">{patient?.name}</span> ({patient?.species}) • Fecha:{' '}
                    <span className="text-slate-700 font-semibold">{surg.date} a las {surg.startTime} hs</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-700 font-semibold block">
                    Cirujano: {surg.surgeonName}
                  </span>
                  <span className="text-xs text-slate-400 block">
                    Anestesista: {surg.anesthetistName}
                  </span>
                </div>
              </div>

              {/* Anesthesia & ASA assessment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Riesgo ASA:</span>
                  <span className="font-extrabold text-amber-700">Grado {surg.preOpAssessment.asaGrade}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Inducción:</span>
                  <span className="text-slate-700 font-semibold">{surg.anesthesiaProtocol.induction}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Mantenimiento:</span>
                  <span className="text-slate-700 font-semibold">{surg.anesthesiaProtocol.maintenance}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Técnica Quirúrgica & Hallazgos:
                </span>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {surg.surgicalTechnique}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <span className="text-slate-500">
                  Posoperatorio: <span className="text-slate-800 font-medium">{surg.postOpInstructions}</span>
                </span>
                {patient && (
                  <button
                    onClick={() => {
                      setSelectedPatientId(patient.id);
                      setActivePatientTab('CIRUGIAS');
                      setActiveView('PACIENTES');
                    }}
                    className="text-teal-600 hover:text-teal-700 font-bold"
                  >
                    Ver en Ficha 360° →
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
