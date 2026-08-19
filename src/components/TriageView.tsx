import React, { useState } from 'react';
import {
  Clock,
  Plus,
  AlertTriangle,
  Heart,
  Stethoscope,
  BedDouble,
  User,
  PawPrint,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const TriageView: React.FC = () => {
  const {
    triageList,
    patients,
    owners,
    updateTriageStatus,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
  } = useVet();

  const [filterPriority, setFilterPriority] = useState('TODAS');

  const filtered = triageList.filter((t) => {
    const isWaiting = t.status === 'EN_ESPERA';
    const matchesPriority = filterPriority === 'TODAS' || t.priority === filterPriority;
    return isWaiting && matchesPriority;
  });

  const handleCallPatient = (triageId: string, patientId: string) => {
    updateTriageStatus(triageId, 'LLAMADO');
    setSelectedPatientId(patientId);
    setActivePatientTab('CONSULTAS');
    setActiveView('PACIENTES');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Sala de Espera en Vivo ({filtered.length} Pacientes)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Recepción, Espera & Triage Clínico
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Clasificación Manchester/Veterinaria por nivel de urgencia con cronómetro de espera
          </p>
        </div>

        <button
          onClick={() => setQuickModal('NUEVO_TRIAGE')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Ingresar a Sala de Espera</span>
        </button>
      </div>

      {/* Priority Legend Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border-l-4 border-l-red-500 border border-slate-200 p-3.5 rounded-xl shadow-xs flex items-center gap-3">
          <span className="text-xl">🔴</span>
          <div>
            <div className="text-xs font-black text-red-600">NIVEL 1: CRÍTICO</div>
            <p className="text-[10px] text-slate-500">Atención inmediata (0 min)</p>
          </div>
        </div>
        <div className="bg-white border-l-4 border-l-orange-500 border border-slate-200 p-3.5 rounded-xl shadow-xs flex items-center gap-3">
          <span className="text-xl">🟠</span>
          <div>
            <div className="text-xs font-black text-orange-600">NIVEL 2: PRIORITARIO</div>
            <p className="text-[10px] text-slate-500">Atención en &lt; 15 min</p>
          </div>
        </div>
        <div className="bg-white border-l-4 border-l-teal-500 border border-slate-200 p-3.5 rounded-xl shadow-xs flex items-center gap-3">
          <span className="text-xl">🟢</span>
          <div>
            <div className="text-xs font-black text-teal-700">NIVEL 3: NORMAL</div>
            <p className="text-[10px] text-slate-500">Atención en &lt; 45 min</p>
          </div>
        </div>
        <div className="bg-white border-l-4 border-l-blue-500 border border-slate-200 p-3.5 rounded-xl shadow-xs flex items-center gap-3">
          <span className="text-xl">🔵</span>
          <div>
            <div className="text-xs font-black text-blue-700">NIVEL 4: NO URGENTE</div>
            <p className="text-[10px] text-slate-500">Vacunas / Controles</p>
          </div>
        </div>
      </div>

      {/* Triage Live Queue */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto opacity-80" />
            <h3 className="text-base font-bold text-slate-900">No hay pacientes esperando en sala.</h3>
            <p className="text-xs text-slate-500">
              Todos los pacientes han sido atendidos o derivados a internación / quirófano.
            </p>
          </div>
        ) : (
          filtered.map((entry) => {
            const patient = patients.find((p) => p.id === entry.patientId);
            const owner = owners.find((o) => o.id === entry.ownerId);

            const isCritical = entry.priority === 'CRITICO';

            return (
              <div
                key={entry.id}
                className={`p-4 sm:p-5 rounded-2xl border bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm transition-all ${
                  isCritical
                    ? 'border-l-4 border-l-red-500 border-slate-200'
                    : entry.priority === 'PRIORITARIO'
                    ? 'border-l-4 border-l-orange-500 border-slate-200'
                    : 'border-l-4 border-l-teal-500 border-slate-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <img
                    src={patient?.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                    alt={patient?.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-slate-900">{patient?.name}</h3>
                      <span className="text-xs text-slate-500 font-medium">
                        ({patient?.species} - {patient?.breed})
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          entry.priority === 'CRITICO'
                            ? 'bg-red-500 text-white animate-pulse'
                            : entry.priority === 'PRIORITARIO'
                            ? 'bg-orange-500 text-white'
                            : 'bg-teal-600 text-white'
                        }`}
                      >
                        {entry.priority}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-semibold mb-1">
                      Motivo de consulta: <span className="text-slate-900 italic">"{entry.chiefComplaint}"</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span>Tutor: {owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'}</span>
                      <span>•</span>
                      <span>
                        Llegada:{' '}
                        {new Date(entry.arrivedAt).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        hs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">
                      Tiempo en espera
                    </span>
                    <span className="font-mono text-base font-black text-amber-600">
                      ⏱️ {Math.max(1, Math.floor((Date.now() - new Date(entry.arrivedAt).getTime()) / 60000))} min
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (patient) handleCallPatient(entry.id, patient.id);
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20 active:scale-95 transition-all"
                  >
                    Llamar a Consulta
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
