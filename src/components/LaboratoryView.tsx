import React from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const LaboratoryView: React.FC = () => {
  const { labOrders, patients, setSelectedPatientId, setActivePatientTab, setActiveView, setQuickModal } = useVet();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-teal-600" />
            <span>Laboratorio Clínico & Análisis</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Hemogramas, bioquímicas, ionogramas, coagulación y urinálisis con rangos de referencia
          </p>
        </div>

        <button
          onClick={() => setQuickModal('NUEVO_LAB')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Solicitar Análisis</span>
        </button>
      </div>

      {/* Lab Orders List */}
      <div className="space-y-4">
        {labOrders.map((lab) => {
          const patient = patients.find((p) => p.id === lab.patientId);

          return (
            <div
              key={lab.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{lab.testType.replace(/_/g, ' ')}</h3>
                    <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold">
                      {lab.orderNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {lab.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Paciente: <span className="text-slate-900 font-bold">{patient?.name}</span> ({patient?.species}) • Solicitado por:{' '}
                    <span className="text-slate-700 font-semibold">{lab.requestedBy}</span>
                  </p>
                </div>

                <span className="text-xs text-slate-500 font-mono">
                  {new Date(lab.requestedAt).toLocaleString('es-AR')}
                </span>
              </div>

              {/* Lab Results Table */}
              {lab.results && lab.results.length > 0 && (
                <div className="overflow-x-auto bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-2">Parámetro</th>
                        <th className="p-2">Valor</th>
                        <th className="p-2">Unidad</th>
                        <th className="p-2">Rango de Referencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {lab.results.map((r, idx) => (
                        <tr key={idx} className="hover:bg-slate-100/50">
                          <td className="p-2 font-semibold text-slate-900">{r.parameter}</td>
                          <td
                            className={`p-2 font-bold ${
                              r.isAbnormal ? 'text-red-600 font-black' : 'text-slate-800'
                            }`}
                          >
                            {r.value} {r.isAbnormal && '⚠️ (ALTERADO)'}
                          </td>
                          <td className="p-2 text-slate-600">{r.unit}</td>
                          <td className="p-2 text-slate-500">{r.referenceRange}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {lab.conclusions && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800">
                  <span className="font-bold text-slate-900 block mb-0.5">Conclusión del Bioquímico:</span>
                  <p className="text-slate-600">{lab.conclusions}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
