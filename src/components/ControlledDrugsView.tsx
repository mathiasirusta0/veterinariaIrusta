import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  BookOpen,
  AlertTriangle,
  Lock,
  Printer,
  Calendar,
  User,
  PawPrint,
  FileSpreadsheet,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { ControlledDrugItem, ControlledDrugMovement } from '../types';

export const ControlledDrugsView: React.FC = () => {
  const {
    controlledDrugs,
    controlledMovements,
    patients,
    owners,
    users,
    addControlledMovement,
    showToast,
    logAudit,
  } = useVet();

  const [selectedTab, setSelectedTab] = useState<'LIBRO' | 'INVENTARIO'>('LIBRO');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewMovementModalOpen, setIsNewMovementModalOpen] = useState(false);

  // Form State for new clinical movement
  const [selectedDrugId, setSelectedDrugId] = useState(controlledDrugs[0]?.id || 'cd-1');
  const [movementType, setMovementType] = useState<'EGRESO_CLINICO' | 'INGRESO_COMPRA'>('EGRESO_CLINICO');
  const [targetPatientId, setTargetPatientId] = useState(patients[0]?.id || 'pat-1');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formBatch, setFormBatch] = useState('LT-KET-2025-01');
  const [formRecipeFolio, setFormRecipeFolio] = useState('FOLIO-2025-0042');
  const [formSupplier, setFormSupplier] = useState('');
  const [formInvoice, setFormInvoice] = useState('');
  const [formObservations, setFormObservations] = useState('Administración como inductor anestésico en quirófano.');

  const filteredMovements = controlledMovements.filter((m) => {
    const q = searchQuery.toLowerCase();
    return (
      m.drugName.toLowerCase().includes(q) ||
      m.activeIngredient.toLowerCase().includes(q) ||
      (m.patientName && m.patientName.toLowerCase().includes(q)) ||
      (m.ownerName && m.ownerName.toLowerCase().includes(q)) ||
      (m.vetName && m.vetName.toLowerCase().includes(q)) ||
      (m.batchNumber && m.batchNumber.toLowerCase().includes(q)) ||
      (m.officialRecipeFolio && m.officialRecipeFolio.toLowerCase().includes(q))
    );
  });

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const drug = controlledDrugs.find((d) => d.id === selectedDrugId);
    if (!drug) return;

    const patient = patients.find((p) => p.id === targetPatientId);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
    const vet = users.find((u) => u.role === 'VETERINARIO') || users[0];

    if (movementType === 'EGRESO_CLINICO' && drug.currentStock < formQuantity) {
      showToast('error', 'Saldo Insuficiente', 'No hay stock suficiente en el libro de psicotrópicos para este egreso.');
      return;
    }

    const qtyNumber = movementType === 'INGRESO_COMPRA' ? Math.abs(formQuantity) : -Math.abs(formQuantity);
    const newBalance = drug.currentStock + qtyNumber;

    const newMov: ControlledDrugMovement = {
      id: `cdm-${Date.now()}`,
      timestamp: new Date().toISOString(),
      movementType,
      drugId: drug.id,
      drugName: drug.commercialName,
      activeIngredient: drug.activeIngredient,
      batchNumber: formBatch,
      quantity: qtyNumber,
      balanceAfter: newBalance,
      patientId: movementType === 'EGRESO_CLINICO' ? patient?.id : undefined,
      patientName: movementType === 'EGRESO_CLINICO' ? patient?.name : undefined,
      species: movementType === 'EGRESO_CLINICO' ? patient?.species : undefined,
      patientWeight: movementType === 'EGRESO_CLINICO' ? patient?.weight : undefined,
      ownerId: movementType === 'EGRESO_CLINICO' ? owner?.id : undefined,
      ownerName: movementType === 'EGRESO_CLINICO' ? `${owner?.firstName} ${owner?.lastName}` : undefined,
      ownerDni: movementType === 'EGRESO_CLINICO' ? owner?.dni : undefined,
      ownerAddress: movementType === 'EGRESO_CLINICO' ? owner?.address : undefined,
      vetId: vet.id,
      vetName: vet.name,
      vetLicense: vet.licenseNumber || 'MP 8412 CMVC',
      officialRecipeFolio: formRecipeFolio,
      supplierName: movementType === 'INGRESO_COMPRA' ? formSupplier : undefined,
      invoiceNumber: movementType === 'INGRESO_COMPRA' ? formInvoice : undefined,
      observations: formObservations,
      registeredBy: vet.name,
    };

    addControlledMovement(newMov);
    setIsNewMovementModalOpen(false);
    showToast('success', 'Movimiento Registrado', `Se asentó ${movementType === 'INGRESO_COMPRA' ? 'el ingreso' : 'el egreso'} en el Libro Oficial de Psicotrópicos.`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 text-[10px] font-extrabold tracking-wider border border-rose-200 uppercase">
                Leyes Nacionales Nº 17.818 y 19.303
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold tracking-wider border border-slate-200 uppercase">
                Trazabilidad Inalterable
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Lock className="w-6 h-6 text-rose-600" />
              <span>Control de Psicotrópicos, Ketamina & Estupefacientes</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-3xl mt-1">
              Libro digital oficial con trazabilidad estricta de ingresos, consumos clínicos y saldos. Prohibición de eliminación física conforme a la normativa de SENASA y Ministerio de Salud.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsNewMovementModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Asentar Movimiento Oficial</span>
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Stock Ketamina</span>
            <span className="text-lg font-black text-rose-700 font-mono">
              {controlledDrugs.find((d) => d.commercialName.includes('Ketamina'))?.currentStock || 6} Frascos
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Movimientos en el Libro</span>
            <span className="text-lg font-black text-slate-900 font-mono">{controlledMovements.length} Asientos</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Recetas Archivadas</span>
            <span className="text-lg font-black text-teal-700 font-mono">
              {controlledMovements.filter((m) => m.officialRecipeFolio).length} Folios
            </span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Auditoría Colegial</span>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Libro Al Día (CMVC)
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-100">
          <button
            onClick={() => setSelectedTab('LIBRO')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedTab === 'LIBRO'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📖 Libro Digital de Movimientos
          </button>
          <button
            onClick={() => setSelectedTab('INVENTARIO')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedTab === 'INVENTARIO'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            🔒 Catálogo de Fármacos Controlados
          </button>
        </div>
      </div>

      {/* TAB 1: LIBRO DIGITAL DE MOVIMIENTOS */}
      {selectedTab === 'LIBRO' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por paciente, tutor, DNI, lote, folio..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
            </div>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Libro Oficial</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="p-3">Fecha & Hora</th>
                  <th className="p-3">Tipo Movimiento</th>
                  <th className="p-3">Fármaco & Principio Activo</th>
                  <th className="p-3">Lote</th>
                  <th className="p-3 text-center">Cant.</th>
                  <th className="p-3 text-center">Saldo</th>
                  <th className="p-3">Paciente / Tutor</th>
                  <th className="p-3">Veterinario & Matrícula</th>
                  <th className="p-3">Receta / Folio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredMovements.map((mov) => {
                  const isIngreso = mov.quantity > 0;
                  return (
                    <tr key={mov.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                        {mov.timestamp.replace('T', ' ').slice(0, 16)}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] ${
                          isIngreso
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {mov.movementType.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">
                        {mov.drugName}
                        <span className="block text-[10px] text-slate-400 font-medium">{mov.activeIngredient}</span>
                      </td>
                      <td className="p-3 font-mono text-slate-600 font-bold">{mov.batchNumber}</td>
                      <td className={`p-3 text-center font-mono font-black ${isIngreso ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isIngreso ? `+${mov.quantity}` : mov.quantity}
                      </td>
                      <td className="p-3 text-center font-mono font-black text-slate-900 bg-slate-50/50">
                        {mov.balanceAfter}
                      </td>
                      <td className="p-3">
                        {mov.patientName ? (
                          <div>
                            <span className="font-bold text-slate-900">{mov.patientName}</span>
                            <span className="text-[10px] text-slate-500 block">
                              Tutor: {mov.ownerName} (DNI {mov.ownerDni || 'N/A'})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Ingreso de Proveedor ({mov.supplierName || 'Distribuidora'})</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-900">{mov.vetName}</span>
                        <span className="text-[10px] font-mono text-teal-700 block font-bold">{mov.vetLicense}</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">
                        {mov.officialRecipeFolio || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTARIO DE PSICOTROPICOS */}
      {selectedTab === 'INVENTARIO' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {controlledDrugs.map((drug) => (
            <div
              key={drug.id}
              className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                    {drug.senasaCategory}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-1">{drug.commercialName}</h3>
                  <p className="text-xs text-teal-700 font-semibold">{drug.activeIngredient}</p>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 font-mono">{drug.currentStock}</span>
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">{drug.unit}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Presentación:</span>
                  <span className="font-semibold text-slate-800">{drug.presentation}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Laboratorio:</span>
                  <span className="font-semibold text-slate-800">{drug.laboratory}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Marco Normativo:</span>
                  <span className="font-mono font-bold text-slate-800 text-[10px]">{drug.lawClassification}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Stock Mínimo:</span>
                  <span className="font-bold text-rose-600">{drug.minStock} {drug.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Nuevo Movimiento */}
      {isNewMovementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-600" />
                <span>Asentar Movimiento en Libro Oficial</span>
              </h3>
              <button
                onClick={() => setIsNewMovementModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Tipo de Movimiento:</label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                  >
                    <option value="EGRESO_CLINICO">Egreso Clínico (Uso / Cirugía)</option>
                    <option value="INGRESO_COMPRA">Ingreso por Compra a Proveedor</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Fármaco Controlado:</label>
                  <select
                    value={selectedDrugId}
                    onChange={(e) => setSelectedDrugId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                  >
                    {controlledDrugs.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.commercialName} (Stock: {d.currentStock})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {movementType === 'EGRESO_CLINICO' && (
                <div className="space-y-3 bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                  <div>
                    <label className="text-rose-900 block font-bold mb-1">Paciente & Tutor Destinatario:</label>
                    <select
                      value={targetPatientId}
                      onChange={(e) => setTargetPatientId(e.target.value)}
                      className="w-full bg-white border border-rose-200 rounded-xl p-2 font-bold text-slate-900"
                    >
                      {patients.map((p) => {
                        const o = owners.find((ow) => ow.id === p.ownerId);
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.species} • {p.weight}kg) — Tutor: {o ? `${o.firstName} ${o.lastName}` : 'N/A'} (DNI: {o?.dni || 'N/A'})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="text-rose-900 block font-bold mb-1">Folio / Nº de Recetario Oficial:</label>
                    <input
                      type="text"
                      value={formRecipeFolio}
                      onChange={(e) => setFormRecipeFolio(e.target.value)}
                      required
                      placeholder="ej: FOLIO-2025-0042"
                      className="w-full bg-white border border-rose-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}

              {movementType === 'INGRESO_COMPRA' && (
                <div className="space-y-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 block font-bold mb-1">Proveedor Habilitado:</label>
                      <input
                        type="text"
                        value={formSupplier}
                        onChange={(e) => setFormSupplier(e.target.value)}
                        required
                        placeholder="ej: Droguería Veterinaria Central"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 block font-bold mb-1">Nº Factura de Compra:</label>
                      <input
                        type="text"
                        value={formInvoice}
                        onChange={(e) => setFormInvoice(e.target.value)}
                        required
                        placeholder="ej: 0001-00049102"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Cantidad:</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Nº de Lote:</label>
                  <input
                    type="text"
                    value={formBatch}
                    onChange={(e) => setFormBatch(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Observaciones & Justificación Clínica:</label>
                <textarea
                  rows={2}
                  value={formObservations}
                  onChange={(e) => setFormObservations(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewMovementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-sm"
                >
                  Registrar en Libro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
