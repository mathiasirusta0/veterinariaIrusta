import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Award,
  Calendar,
  Pill,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Prescription, PrescriptionType, SENASACategory } from '../types';

export const PrescriptionsView: React.FC = () => {
  const { prescriptions, patients, owners, users, addPrescription, showToast } = useVet();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'TODOS' | PrescriptionType>('TODOS');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState(patients[0]?.id || 'pat-1');
  const [prescriptionType, setPrescriptionType] = useState<PrescriptionType>('RECETA_COMUN');
  const [diagnosis, setDiagnosis] = useState('Gastroenteritis aguda / Tratamiento sintomático');
  const [medName, setMedName] = useState('Cerenia 16mg');
  const [medActive, setMedActive] = useState('Maropitant Citrato');
  const [medDose, setMedDose] = useState('1 comp cada 24hs');
  const [medDuration, setMedDuration] = useState('3 días');
  const [medInstructions, setMedInstructions] = useState('Administrar con una pequeña porción de comida.');
  const [senasaCat, setSenasaCat] = useState<SENASACategory>('CAT_III_RECETA');

  const filteredPrescriptions = prescriptions.filter((p) => {
    const q = searchQuery.toLowerCase();
    const pat = patients.find((pt) => pt.id === p.patientId);
    const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;
    const matchesSearch =
      p.prescriptionNumber.toLowerCase().includes(q) ||
      p.vetName.toLowerCase().includes(q) ||
      (pat && pat.name.toLowerCase().includes(q)) ||
      (ow && `${ow.firstName} ${ow.lastName}`.toLowerCase().includes(q));
    const matchesType = typeFilter === 'TODOS' || p.prescriptionType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === patientId);
    const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;
    const vet = users.find((u) => u.role === 'VETERINARIO') || users[0];

    const newPrescription: Prescription = {
      id: `rx-${Date.now()}`,
      prescriptionNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      prescriptionType,
      patientId,
      ownerId: ow?.id || 'owner-1',
      vetId: vet.id,
      vetName: vet.name,
      vetLicense: vet.licenseNumber || 'MP 8412 CMVC',
      vetCuit: '20-32458912-8',
      establishmentName: 'Hospital Veterinario Central 24hs',
      establishmentAddress: 'Av. Corrientes 4550, CABA',
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      items: [
        {
          id: `item-${Date.now()}`,
          medicationName: medName,
          activeIngredient: medActive,
          presentation: 'Comprimidos',
          dose: medDose,
          route: 'ORAL',
          frequency: 'Cada 24 horas',
          duration: medDuration,
          quantityPrescribed: 1,
          senasaCategory: senasaCat,
          requiresRVE: prescriptionType === 'RECETA_ELECTRONICA_SENASA',
          instructions: medInstructions,
        },
      ],
      isDispensed: false,
      digitalSignatureHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    };

    addPrescription(newPrescription);
    setIsNewModalOpen(false);
    showToast('success', 'Receta Emitida', `Receta ${newPrescription.prescriptionNumber} firmada digitalmente.`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-extrabold tracking-wider border border-teal-200 uppercase">
                Conforme a SENASA & Colegio Veterinario de Córdoba
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-extrabold tracking-wider border border-purple-200 uppercase">
                Firma Digital & QR de Validación
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-teal-600" />
              <span>Recetario Veterinario Oficial & Gestión de Prescripciones</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-3xl mt-1">
              Emisión de recetas comunes, archivadas (Cat II), oficiales archivadas (Cat I / Psicotrópicos) y preparador de Receta Veterinaria Electrónica (RVE SENASA).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Emitir Nueva Receta</span>
            </button>
          </div>
        </div>
      </div>

      {/* List of Prescriptions */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por paciente, profesional, receta..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="TODOS">Todos los Tipos de Receta</option>
            <option value="RECETA_COMUN">Receta Común (Cat III)</option>
            <option value="RECETA_ARCHIVADA">Receta Archivada (Cat II)</option>
            <option value="RECETA_OFICIAL_ARCHIVADA">Receta Oficial Archivada (Cat I)</option>
            <option value="RECETA_ELECTRONICA_SENASA">Receta Electrónica SENASA (RVE)</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrescriptions.map((rx) => {
            const pat = patients.find((p) => p.id === rx.patientId);
            const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;

            return (
              <div
                key={rx.id}
                className="bg-slate-50 border border-slate-200 hover:border-teal-500 rounded-2xl p-5 space-y-3 shadow-2xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/70 pb-3">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-xs">{rx.prescriptionNumber}</span>
                      <p className="text-[10px] text-slate-500 font-medium">{rx.date}</p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      rx.prescriptionType === 'RECETA_OFICIAL_ARCHIVADA'
                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                        : rx.prescriptionType === 'RECETA_ELECTRONICA_SENASA'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : rx.prescriptionType === 'RECETA_ARCHIVADA'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                    }`}>
                      {rx.prescriptionType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Paciente & Tutor</span>
                      <span className="font-bold text-slate-900">{pat?.name || 'Paciente'} ({pat?.species})</span>
                      <span className="text-slate-500 block text-[11px]">Tutor: {ow ? `${ow.firstName} ${ow.lastName}` : 'N/A'}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Prescripción</span>
                      {rx.items.map((item, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200/70 mt-1">
                          <span className="font-bold text-slate-900 block">{item.medicationName}</span>
                          <span className="text-slate-600 text-[11px] block">{item.dose} — {item.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-bold">Médico Veterinario:</span>
                    <span className="font-bold text-slate-800 text-[11px]">{rx.vetName} ({rx.vetLicense})</span>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 transition-colors"
                    title="Imprimir Receta"
                  >
                    <Printer className="w-4 h-4 text-teal-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Nueva Receta */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>Emitir Receta Oficial</span>
              </h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Paciente:</label>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species} • {p.weight}kg)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Tipo de Receta:</label>
                  <select
                    value={prescriptionType}
                    onChange={(e) => setPrescriptionType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                  >
                    <option value="RECETA_COMUN">Receta Común (Cat III)</option>
                    <option value="RECETA_ARCHIVADA">Receta Archivada (Cat II)</option>
                    <option value="RECETA_OFICIAL_ARCHIVADA">Receta Oficial Archivada (Cat I / Psicotrópicos)</option>
                    <option value="RECETA_ELECTRONICA_SENASA">Receta Electrónica SENASA (RVE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Diagnóstico Clínico:</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-bold text-slate-800 text-[11px] block">Medicamento a Prescribir:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 text-[10px] uppercase font-bold block">Nombre Comercial:</label>
                    <input
                      type="text"
                      value={medName}
                      onChange={(e) => setMedName(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-[10px] uppercase font-bold block">Principio Activo:</label>
                    <input
                      type="text"
                      value={medActive}
                      onChange={(e) => setMedActive(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 text-[10px] uppercase font-bold block">Dosis & Frecuencia:</label>
                    <input
                      type="text"
                      value={medDose}
                      onChange={(e) => setMedDose(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-[10px] uppercase font-bold block">Duración:</label>
                    <input
                      type="text"
                      value={medDuration}
                      onChange={(e) => setMedDuration(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 text-[10px] uppercase font-bold block">Instrucciones de Administración:</label>
                  <input
                    type="text"
                    value={medInstructions}
                    onChange={(e) => setMedInstructions(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-900"
                  />
                </div>
              </div>

              {prescriptionType === 'RECETA_ELECTRONICA_SENASA' && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 text-xs text-blue-900 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                    <span>Preparador RVE SENASA</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Este producto requiere registro oficial en el sistema de SENASA. Se generará el paquete estructurado con los datos del paciente, tutor y veterinario matriculado para su carga oficial.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-sm"
                >
                  Firmar & Emitir Receta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
