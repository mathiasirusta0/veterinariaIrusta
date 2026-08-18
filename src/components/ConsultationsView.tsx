import React from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  PawPrint,
  Clock,
  Sparkles,
  Printer,
  Heart,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const ConsultationsView: React.FC = () => {
  const {
    consultations,
    patients,
    owners,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openPrintModal,
  } = useVet();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <span>Consultas Médicas & Evaluaciones SOAP</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Registro estructurado SOAP, examen físico con presets, signos vitales y recetas
          </p>
        </div>

        <button
          onClick={() => setQuickModal('NUEVA_CONSULTA')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Iniciar Nueva Consulta SOAP</span>
        </button>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {consultations.map((cons) => {
          const patient = patients.find((p) => p.id === cons.patientId);
          const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;

          return (
            <div
              key={cons.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={patient?.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                    alt={patient?.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{patient?.name || 'Paciente'}</h3>
                      <span className="text-xs text-slate-500 font-mono">({patient?.clinicalRecordNumber})</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {cons.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">
                      Tutor: {owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'} • Profesional:{' '}
                      <span className="text-slate-700 font-semibold">{cons.vetName}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-1">
                  <span className="text-xs font-mono text-teal-700 font-bold block">
                    {new Date(cons.dateTime).toLocaleString('es-AR')}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        openPrintModal({
                          type: 'RECETA',
                          consultationId: cons.id,
                          patientId: cons.patientId,
                        })
                      }
                      className="text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 bg-slate-100 px-2 py-1 rounded"
                    >
                      <Printer className="w-3 h-3 text-slate-500" />
                      <span>Imprimir Receta</span>
                    </button>
                    <button
                      onClick={() => {
                        if (patient) {
                          setSelectedPatientId(patient.id);
                          setActivePatientTab('HISTORIA');
                          setActiveView('PACIENTES');
                        }
                      }}
                      className="text-xs text-teal-600 hover:text-teal-700 font-bold"
                    >
                      Ficha 360° →
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Motivo de Consulta & Anamnesis:
                </span>
                <p className="text-xs font-bold text-slate-900 mb-1">{cons.reason}</p>
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {cons.anamnesis}
                </p>
              </div>

              {/* SOAP Details */}
              {cons.soap && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="space-y-1">
                    <span className="text-teal-700 font-black text-[11px] block">S — SUBJETIVO</span>
                    <p className="text-slate-700">{cons.soap.subjective}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-teal-700 font-black text-[11px] block">O — OBJETIVO</span>
                    <p className="text-slate-700">{cons.soap.objective}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-teal-700 font-black text-[11px] block">A — EVALUACIÓN / DIAGNÓSTICOS</span>
                    <p className="text-slate-700">{cons.soap.assessment}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-teal-700 font-black text-[11px] block">P — PLAN TERAPÉUTICO</span>
                    <p className="text-slate-700">{cons.soap.plan}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
