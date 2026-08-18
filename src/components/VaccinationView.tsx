import React from 'react';
import {
  Syringe,
  Plus,
  Printer,
  Calendar,
  ShieldCheck,
  PawPrint,
  CheckCircle2,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const VaccinationView: React.FC = () => {
  const { vaccinations, patients, owners, setQuickModal, openPrintModal } = useVet();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Syringe className="w-5 h-5 text-teal-600" />
            <span>Plan de Vacunación & Libreta Sanitaria</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Registro oficial de biológicos, control de lotes, vencimientos y emisión de certificados
          </p>
        </div>

        <button
          onClick={() => setQuickModal('NUEVA_VACUNA')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Vacunación</span>
        </button>
      </div>

      {/* Vaccinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {vaccinations.map((vac) => {
          const patient = patients.find((p) => p.id === vac.patientId);
          const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;

          return (
            <div
              key={vac.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{vac.vaccineName}</h3>
                    <p className="text-xs text-teal-700 font-semibold">{vac.type}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    APLICADA
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-1.5 my-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Paciente:</span>
                    <span className="font-bold text-slate-900">{patient?.name} ({patient?.species})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Tutor:</span>
                    <span className="text-slate-700">{owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Lote:</span>
                    <span className="text-slate-700 font-bold">{vac.batchNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Laboratorio:</span>
                    <span className="text-slate-700">{vac.manufacturer}</span>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Fecha de Aplicación:</span>
                    <span className="font-bold text-slate-900">{vac.administeredDate}</span>
                  </div>
                  <div className="flex items-center justify-between text-amber-700 font-bold">
                    <span>Próxima Dosis / Refuerzo:</span>
                    <span>{vac.nextDueDate}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">{vac.administeredBy}</span>
                <button
                  onClick={() =>
                    openPrintModal({
                      type: 'VACUNACION',
                      vaccineId: vac.id,
                      patientId: vac.patientId,
                    })
                  }
                  className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir Certificado</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
