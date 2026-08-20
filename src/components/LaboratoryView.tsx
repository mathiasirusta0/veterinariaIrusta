import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { formatDateTime } from '../utils/formatters';

export const LaboratoryView: React.FC = () => {
  const {
    labOrders,
    patients,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openPrintModal,
  } = useVet();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  const filteredOrders = labOrders.filter((lab) => {
    const q = search.toLowerCase();
    const patient = patients.find((p) => p.id === lab.patientId);
    const petName = patient?.name.toLowerCase() || '';
    const test = lab.testType.toLowerCase();
    const orderNum = lab.orderNumber.toLowerCase();
    const reqBy = lab.requestedBy.toLowerCase();

    const matchesSearch =
      petName.includes(q) || test.includes(q) || orderNum.includes(q) || reqBy.includes(q);

    const matchesStatus = statusFilter === 'TODOS' || lab.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const abnormalCount = labOrders.reduce(
    (acc, lab) => acc + (lab.results?.filter((r) => r.isAbnormal).length || 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Diagnóstico Laboratorial & Análisis Clínicos
            </span>
            {abnormalCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 animate-pulse">
                ⚠️ {abnormalCount} Valores Críticos Detectados
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-teal-600" />
            <span>Laboratorio Clínico & Análisis</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Hemogramas, bioquímicas, ionogramas, coagulación y urinálisis con rangos de referencia por especie
          </p>
        </div>

        <button
          onClick={() => setQuickModal('NUEVO_LAB')}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Solicitar Análisis</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por orden, estudio, paciente o solicitante..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Estado:</span>
          {['TODOS', 'SOLICITADO', 'EN_PROCESO', 'VALIDADO', 'FINALIZADO'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Lab Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm">
            <FlaskConical className="w-12 h-12 mx-auto mb-2 text-slate-400 opacity-60" />
            <h3 className="font-bold text-sm text-slate-800">No se encontraron órdenes de laboratorio</h3>
            <p className="text-xs text-slate-400 mt-1">Intentá con otros términos de búsqueda o creá una nueva solicitud.</p>
          </div>
        ) : (
          filteredOrders.map((lab) => {
            const patient = patients.find((p) => p.id === lab.patientId);

            return (
              <div
                key={lab.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{lab.testType.replace(/_/g, ' ')}</h3>
                      <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200 font-bold">
                        {lab.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          lab.status === 'VALIDADO' || lab.status === 'FINALIZADO'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {lab.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Paciente: <span className="text-slate-900 font-bold">{patient?.name || 'Paciente Registrado'}</span> ({patient?.species || 'Canino'} • {patient?.weight || 10} kg) • Solicitado por:{' '}
                      <span className="text-teal-800 font-bold">{lab.requestedBy || 'Dr. Médico Veterinario'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                      {formatDateTime(lab.requestedAt)}
                    </span>
                    {patient && (
                      <button
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setActivePatientTab('LABORATORIO');
                          setActiveView('PACIENTES');
                        }}
                        className="text-xs text-white bg-teal-600 hover:bg-teal-500 font-bold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                      >
                        Ficha 360° →
                      </button>
                    )}
                  </div>
                </div>

                {/* Lab Results Table */}
                {lab.results && lab.results.length > 0 && (
                  <div className="overflow-x-auto bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100/80 text-slate-500 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-2.5">Parámetro</th>
                          <th className="p-2.5">Valor Obtenido</th>
                          <th className="p-2.5">Unidad</th>
                          <th className="p-2.5">Rango de Referencia</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 font-mono">
                        {lab.results.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-100/50">
                            <td className="p-2.5 font-semibold text-slate-900 font-sans">{r.parameter}</td>
                            <td
                              className={`p-2.5 font-bold ${
                                r.isAbnormal ? 'text-red-600 font-black' : 'text-slate-800'
                              }`}
                            >
                              {r.value} {r.isAbnormal && '⚠️ (ALTERADO)'}
                            </td>
                            <td className="p-2.5 text-slate-600">{r.unit}</td>
                            <td className="p-2.5 text-slate-500">{r.referenceRange}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {lab.conclusions && (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800">
                    <span className="font-bold text-slate-900 block mb-0.5">Conclusión Diagnóstica Bioquímica:</span>
                    <p className="text-slate-600">{lab.conclusions}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
