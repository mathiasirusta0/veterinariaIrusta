import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  PawPrint,
  Clock,
  Sparkles,
  Printer,
  Heart,
  MessageCircle,
  Filter,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { formatDateTime } from '../utils/formatters';

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
    openWhatsAppHub,
  } = useVet();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'TODOS' | 'FINALIZADA' | 'EN_CURSO'>('TODOS');

  const filteredConsultations = consultations.filter((cons) => {
    const q = search.toLowerCase();
    const patient = patients.find((p) => p.id === cons.patientId);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
    const petName = patient?.name?.toLowerCase() || '';
    const ownerName = owner ? `${owner.firstName} ${owner.lastName}`.toLowerCase() : '';
    const reason = cons.reason?.toLowerCase() || '';
    const diag = (cons.diagnoses || []).join(' ').toLowerCase();

    const matchesSearch =
      petName.includes(q) ||
      ownerName.includes(q) ||
      reason.includes(q) ||
      diag.includes(q) ||
      (cons.vetName || '').toLowerCase().includes(q);

    const matchesStatus =
      filterStatus === 'TODOS' ? true : cons.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Atención Clínica Ambulatoria & Urgencias
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-teal-600" />
            <span>Consultas Médicas & Evaluaciones SOAP</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Registro estructurado SOAP, examen físico por 12 sistemas, recetas digitales y envío a tutores
          </p>
        </div>

        <button
          onClick={() => setQuickModal('NUEVA_CONSULTA')}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Iniciar Consulta SOAP</span>
        </button>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por paciente, tutor, motivo, diagnóstico o veterinario..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Estado:</span>
          {(['TODOS', 'FINALIZADA', 'EN_CURSO'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                filterStatus === st
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'TODOS' ? 'Todas' : st === 'FINALIZADA' ? 'Finalizadas' : 'En Curso'}
            </button>
          ))}
        </div>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {filteredConsultations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm">
            <Stethoscope className="w-12 h-12 mx-auto mb-2 text-slate-400 opacity-60" />
            <h3 className="font-bold text-sm text-slate-800">No se encontraron consultas</h3>
            <p className="text-xs text-slate-400 mt-1">Intentá con otros términos de búsqueda o iniciá una nueva consulta.</p>
          </div>
        ) : (
          filteredConsultations.map((cons) => {
            const patient = patients.find((p) => p.id === cons.patientId);
            const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;

            return (
              <div
                key={cons.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={patient?.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                      alt={patient?.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{patient?.name || 'Paciente Registrado'}</h3>
                        <span className="text-xs text-slate-500 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                          {patient?.clinicalRecordNumber || 'HC-0000'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cons.status === 'FINALIZADA'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {cons.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Tutor: <span className="font-bold text-slate-700">{owner ? `${owner.firstName} ${owner.lastName}` : (patient ? 'Tutor registrado' : 'Tutor general')}</span> • Profesional:{' '}
                        <span className="text-teal-800 font-bold">{cons.vetName || 'Dr. Médico Veterinario'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center sm:justify-end gap-2">
                    <span className="text-xs font-mono text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                      {formatDateTime(cons.dateTime)}
                    </span>

                    {owner && (
                      <button
                        onClick={() =>
                          openWhatsAppHub({
                            patientName: patient?.name || 'Mascota',
                            species: patient?.species || 'Canino',
                            ownerName: `${owner.firstName} ${owner.lastName}`,
                            ownerPhone: owner.phone,
                            diagnosis: (cons.diagnoses || []).join(', ') || cons.reason,
                          })
                        }
                        className="text-xs text-emerald-700 hover:bg-emerald-50 border border-emerald-200 font-bold flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-xl transition-colors"
                        title="Enviar resumen por WhatsApp al tutor"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp Tutor</span>
                      </button>
                    )}

                    <button
                      onClick={() =>
                        openPrintModal({
                          type: 'RECETA',
                          consultationId: cons.id,
                          patientId: cons.patientId,
                        })
                      }
                      className="text-xs text-slate-700 hover:bg-slate-100 font-bold flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-colors"
                      title="Imprimir receta médica"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Imprimir Receta</span>
                    </button>

                    <button
                      onClick={() => {
                        if (patient) {
                          setSelectedPatientId(patient.id);
                          setActivePatientTab('CONSULTAS');
                          setActiveView('PACIENTES');
                        }
                      }}
                      className="text-xs text-white bg-teal-600 hover:bg-teal-500 font-bold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                    >
                      Ficha 360° →
                    </button>
                  </div>
                </div>

                {/* Reason & Anamnesis */}
                <div className="space-y-1 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Motivo de Consulta:
                  </span>
                  <p className="font-bold text-slate-900">{cons.reason}</p>
                  <p className="text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {cons.anamnesis}
                  </p>
                </div>

                {/* SOAP Structured Box */}
                {cons.soap && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div className="space-y-1">
                      <span className="text-teal-800 font-black text-[11px] block">S — SUBJETIVO</span>
                      <p className="text-slate-700 leading-relaxed">{cons.soap.subjective}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-teal-800 font-black text-[11px] block">O — OBJETIVO</span>
                      <p className="text-slate-700 leading-relaxed">{cons.soap.objective}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-teal-800 font-black text-[11px] block">A — EVALUACIÓN & DIAGNÓSTICO</span>
                      <p className="text-slate-700 leading-relaxed">{cons.soap.assessment}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-teal-800 font-black text-[11px] block">P — PLAN TERAPÉUTICO</span>
                      <p className="text-slate-700 leading-relaxed">{cons.soap.plan}</p>
                    </div>
                  </div>
                )}

                {/* Diagnoses Pills */}
                {cons.diagnoses && cons.diagnoses.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Diagnósticos:</span>
                    {cons.diagnoses.map((d, i) => (
                      <span key={i} className="px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg font-bold">
                        {d}
                      </span>
                    ))}
                  </div>
                )}

                {/* Audited Amendments Block */}
                {cons.amendments && cons.amendments.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Enmiendas Clínicas Auditadas (Inalterabilidad Deontológica CMVC)
                    </span>
                    {cons.amendments.map((amd) => (
                      <div key={amd.id} className="bg-white p-2.5 rounded-xl border border-amber-200/60 text-slate-700 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                          <span>{amd.amendedBy} ({amd.vetLicense})</span>
                          <span>{formatDateTime(amd.amendedAt)}</span>
                        </div>
                        <p className="font-bold text-slate-900">Campo: {amd.fieldAmended}</p>
                        <p className="text-[11px] text-slate-600"><strong className="text-slate-700">Corrección:</strong> {amd.newValue}</p>
                        <p className="text-[10px] italic text-amber-800"><strong className="not-italic font-bold">Justificación:</strong> {amd.justificationReason}</p>
                      </div>
                    ))}
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
