import React, { useState } from 'react';
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
  Search,
  MessageCircle,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const SurgeriesView: React.FC = () => {
  const {
    surgeries,
    patients,
    owners,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openMonitor,
    openCalculators,
    openAnesthesiaChart,
    openWhatsAppHub,
    showToast,
  } = useVet();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [showChecklistModal, setShowChecklistModal] = useState<string | null>(null);
  const [checklistState, setChecklistState] = useState({
    patientIdentity: true,
    siteMarked: true,
    anesthesiaMachineChecked: true,
    pulseOximeterOn: true,
    knownAllergiesReviewed: true,
    difficultAirwayRisk: false,
    bloodLossRiskReviewed: true,
    sterileIndicatorsChecked: true,
    antibioticProphylaxisGiven: true,
  });

  const filteredSurgeries = surgeries.filter((surg) => {
    const q = search.toLowerCase();
    const patient = patients.find((p) => p.id === surg.patientId);
    const petName = patient?.name.toLowerCase() || '';
    const proc = surg.procedureName.toLowerCase();
    const surgeon = surg.surgeonName.toLowerCase();
    const anest = surg.anesthetistName.toLowerCase();

    const matchesSearch =
      petName.includes(q) || proc.includes(q) || surgeon.includes(q) || anest.includes(q);

    const matchesStatus = statusFilter === 'TODOS' || surg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Centro Quirúrgico & Anestesiología
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Scissors className="w-6 h-6 text-teal-600" />
            <span>Quirófano, Cirugías & Protocolos Anestésicos</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Monitoreo pre, intra y posquirúrgico con registro anestésico ASA y lista de verificación quirúrgica
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openMonitor()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-950 hover:bg-slate-900 text-emerald-400 border border-slate-800 text-xs font-bold rounded-2xl shadow-sm transition-all"
            title="Abrir telemetría de monitoreo anestésico"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Monitor Quirúrgico</span>
          </button>

          <button
            onClick={() => openCalculators()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-2xl shadow-2xs transition-all"
            title="Calculadora anestésica y dosis"
          >
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span>Calculadora Dosis</span>
          </button>

          <button
            onClick={() => openAnesthesiaChart()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl shadow-sm transition-all"
            title="Abrir hoja de registro y monitoreo anestésico intraoperatorio"
          >
            <span>🫁</span>
            <span>Hoja Anestésica en Vivo</span>
          </button>

          <button
            onClick={() => setQuickModal('NUEVA_CIRUGIA')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-2xl shadow-md shadow-teal-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Programar Cirugía</span>
          </button>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cirugía, paciente, cirujano o anestesista..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="font-bold text-slate-500 uppercase text-[10px]">Estado:</span>
          {['TODOS', 'PROGRAMADA', 'EN_CURSO', 'REALIZADA', 'COMPLETADA'].map((st) => (
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

      {/* Surgeries List */}
      <div className="space-y-4">
        {filteredSurgeries.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm">
            <Scissors className="w-12 h-12 mx-auto mb-2 text-slate-400 opacity-60" />
            <h3 className="font-bold text-sm text-slate-800">No se encontraron cirugías registradas</h3>
            <p className="text-xs text-slate-400 mt-1">Intentá con otros términos de búsqueda o programá una nueva cirugía.</p>
          </div>
        ) : (
          filteredSurgeries.map((surg) => {
            const patient = patients.find((p) => p.id === surg.patientId);
            const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;

            return (
              <div
                key={surg.id}
                className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{surg.procedureName}</h3>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                        {surg.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Paciente: <span className="text-slate-900 font-bold">{patient?.name}</span> ({patient?.species} • {patient?.weight} kg) • Fecha:{' '}
                      <span className="text-slate-700 font-semibold">{surg.date} a las {surg.startTime} hs</span>
                    </p>
                  </div>

                  <div className="text-right flex flex-col sm:items-end">
                    <span className="text-xs text-slate-700 font-semibold block">
                      Cirujano: <span className="text-slate-900 font-bold">{surg.surgeonName}</span>
                    </span>
                    <span className="text-xs text-slate-500 block">
                      Anestesista: <span className="text-slate-700 font-medium">{surg.anesthetistName}</span>
                    </span>
                  </div>
                </div>

                {/* Anesthesia & ASA assessment */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Clasificación ASA:</span>
                    <span className="font-black text-amber-800 text-sm">
                      Grado {surg.preOpAssessment?.asaGrade || (surg as any).asaGrade || 'II'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {surg.preOpAssessment?.fastingHours || 8}h ayuno sólido • {surg.preOpAssessment?.waterFastingHours || 2}h líquidos
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Protocolo Inducción:</span>
                    <span className="text-slate-800 font-semibold">
                      {surg.anesthesiaProtocol?.induction || 'Propofol 4 mg/kg + Fentanilo 3 ug/kg'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase text-[10px] block">Mantenimiento:</span>
                    <span className="text-slate-800 font-semibold">
                      {surg.anesthesiaProtocol?.maintenance || 'Isoflurano 1.5% + O2 100% (1.5 L/min)'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Técnica Quirúrgica & Hallazgos:
                  </span>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {surg.surgicalTechnique || 'Procedimiento ejecutado sin incidentes según técnica reglada.'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <span className="text-slate-500">
                    Posoperatorio: <span className="text-slate-800 font-medium">{surg.postOpOrders || 'Analgesia multimodal + monitoreo de recuperación.'}</span>
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setShowChecklistModal(surg.id)}
                      className="flex items-center gap-1 text-slate-700 hover:bg-slate-100 font-bold bg-white px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
                      title="Lista de verificación de seguridad quirúrgica OMS"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Checklist OMS</span>
                    </button>

                    {owner && (
                      <button
                        onClick={() =>
                          openWhatsAppHub({
                            patientName: patient?.name || 'Mascota',
                            species: patient?.species || 'Canino',
                            ownerName: `${owner.firstName} ${owner.lastName}`,
                            ownerPhone: owner.phone,
                            diagnosis: `Cirugía: ${surg.procedureName} - Estado: ${surg.status}`,
                          })
                        }
                        className="flex items-center gap-1 text-emerald-700 hover:bg-emerald-50 font-bold bg-white px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Avisar a Tutor</span>
                      </button>
                    )}

                    <button
                      onClick={() => openAnesthesiaChart(surg.patientId, surg.procedureName)}
                      className="flex items-center gap-1 text-emerald-800 hover:bg-emerald-100 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                    >
                      <span>🫁</span>
                      <span>Hoja Anestésica</span>
                    </button>

                    {patient && (
                      <button
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setActivePatientTab('CIRUGIAS');
                          setActiveView('PACIENTES');
                        }}
                        className="text-white bg-teal-600 hover:bg-teal-500 font-bold px-3 py-1.5 rounded-xl transition-colors shadow-2xs"
                      >
                        Ficha 360° →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Checklist Modal */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Checklist de Seguridad Quirúrgica</h3>
              </div>
              <button
                onClick={() => setShowChecklistModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <span className="text-[10px] uppercase font-bold text-teal-700 block">1. Sign In (Antes de la inducción anestésica):</span>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={checklistState.patientIdentity}
                  onChange={(e) => setChecklistState({ ...checklistState, patientIdentity: e.target.checked })}
                  className="rounded text-teal-600"
                />
                <span>Identidad del paciente y procedimiento confirmados con el tutor</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={checklistState.knownAllergiesReviewed}
                  onChange={(e) => setChecklistState({ ...checklistState, knownAllergiesReviewed: e.target.checked })}
                  className="rounded text-teal-600"
                />
                <span>Alergias conocidas revisadas y verificadas</span>
              </label>

              <span className="text-[10px] uppercase font-bold text-teal-700 block pt-2">2. Time Out (Antes de la incisión quirúrgica):</span>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={checklistState.sterileIndicatorsChecked}
                  onChange={(e) => setChecklistState({ ...checklistState, sterileIndicatorsChecked: e.target.checked })}
                  className="rounded text-teal-600"
                />
                <span>Esterilidad de campos e instrumental quirúrgico comprobada</span>
              </label>
              <label className="flex items-center gap-2 text-slate-700">
                <input
                  type="checkbox"
                  checked={checklistState.antibioticProphylaxisGiven}
                  onChange={(e) => setChecklistState({ ...checklistState, antibioticProphylaxisGiven: e.target.checked })}
                  className="rounded text-teal-600"
                />
                <span>Profilaxis antibiótica administrada dentro de los 60 min previos</span>
              </label>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  showToast('success', 'Checklist Confirmado', 'Lista de verificación quirúrgica validada correctamente.');
                  setShowChecklistModal(null);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Validar Lista de Seguridad
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
