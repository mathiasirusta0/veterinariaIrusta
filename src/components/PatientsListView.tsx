import React, { useState } from 'react';
import {
  PawPrint,
  Search,
  Plus,
  ArrowRight,
  User,
  AlertTriangle,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const PatientsListView: React.FC = () => {
  const {
    patients,
    owners,
    setSelectedPatientId,
    setActivePatientTab,
    setQuickModal,
  } = useVet();

  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('TODOS');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.clinicalRecordNumber.toLowerCase().includes(q) ||
      p.breed.toLowerCase().includes(q) ||
      (p.microchip && p.microchip.includes(q));

    const matchesSpecies = speciesFilter === 'TODOS' || p.species === speciesFilter;
    const matchesStatus = statusFilter === 'TODOS' || p.status === statusFilter;

    return matchesSearch && matchesSpecies && matchesStatus;
  });

  const handleOpenPatient = (id: string, tab = 'RESUMEN') => {
    setSelectedPatientId(id);
    setActivePatientTab(tab);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PawPrint className="w-6 h-6 text-teal-600" />
            <span>Directorio de Pacientes</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Fichas clínicas completas con trazabilidad y alertas médicas en tiempo real
          </p>
        </div>

        <button
          onClick={() => setQuickModal('NUEVO_PACIENTE')}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold shadow-md shadow-teal-600/20 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Paciente</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, historia clínica, raza, microchip..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="TODOS">Todas las Especies</option>
            <option value="Canino">Canino</option>
            <option value="Felino">Felino</option>
            <option value="Exótico">Exótico</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="TODOS">Todos los Estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INTERNADO">Internado</option>
            <option value="FALLECIDO">Fallecido</option>
          </select>
        </div>
      </div>

      {/* Grid of Patients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map((patient) => {
          const owner = owners.find((o) => o.id === patient.ownerId);
          const hasCriticalAlerts = patient.alerts && patient.alerts.length > 0;

          return (
            <div
              key={patient.id}
              onClick={() => handleOpenPatient(patient.id)}
              className="bg-white border border-slate-200 hover:border-teal-500/60 rounded-2xl p-5 transition-all hover:shadow-md cursor-pointer flex flex-col justify-between group shadow-sm"
            >
              <div>
                {/* Header photo & badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={patient.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100'}
                      alt={patient.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 group-hover:border-teal-500 transition-colors"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {patient.name}
                        </h3>
                        <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                          {patient.clinicalRecordNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {patient.species} • {patient.breed}
                      </p>
                      <p className="text-xs text-slate-700 font-semibold mt-0.5">
                        {patient.sex} • {patient.calculatedAge} • {patient.weight} kg
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      patient.status === 'INTERNADO'
                        ? 'bg-red-50 text-red-600 border border-red-200 font-black animate-pulse'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>

                {/* Alerts Pill */}
                {hasCriticalAlerts && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {patient.alerts.map((al, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200"
                      >
                        ⚠️ {al.type}
                      </span>
                    ))}
                  </div>
                )}

                {/* Owner info */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                    Tutor Responsable:
                  </span>
                  <div className="flex items-center justify-between text-slate-800 font-semibold">
                    <span>{owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{owner?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Action link */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-teal-600 font-bold">
                <span>Abrir Ficha 360°</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
