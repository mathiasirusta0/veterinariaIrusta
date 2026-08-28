import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Search,
  FileCheck,
  Building2,
  Truck,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Printer,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { PathologicalWasteRecord, PathologicalWasteType } from '../types';

export const PathologicalWasteView: React.FC = () => {
  const { pathologicalWaste, addPathologicalWaste, showToast } = useVet();

  const [searchQuery, setSearchQuery] = useState('');
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);

  // Form State
  const [formSector, setFormSector] = useState<'QUIROFANO' | 'UCI_INTERNACION' | 'LABORATORIO' | 'CONSULTORIOS'>('QUIROFANO');
  const [formWasteType, setFormWasteType] = useState<PathologicalWasteType>('BIOPATOGENICO_INFECCIOSO');
  const [formWeightKg, setFormWeightKg] = useState(3.5);
  const [formContainerType, setFormContainerType] = useState<'BOLSA_ROJA_REGISTRO' | 'DESCARTADOR_RIGIDO'>('BOLSA_ROJA_REGISTRO');
  const [formContainerCount, setFormContainerCount] = useState(1);
  const [formManifestNumber, setFormManifestNumber] = useState(`MAN-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [formTransportCompany, setFormTransportCompany] = useState('Servicios Ambientales Las Lajas S.A.');

  const totalKgStored = pathologicalWaste
    .filter((w) => w.status === 'ALMACENADO_TRANSITORIO')
    .reduce((acc, w) => acc + w.weightKg, 0);

  const totalKgDisposed = pathologicalWaste
    .filter((w) => w.status === 'DISPOSICION_FINAL_CERTIFICADA' || w.status === 'RETIRADO_EN_TRANSITO')
    .reduce((acc, w) => acc + w.weightKg, 0);

  const handleSaveWasteRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const newRec: PathologicalWasteRecord = {
      id: `pwr-${Date.now()}`,
      manifestNumber: formManifestNumber,
      date: new Date().toISOString().split('T')[0],
      generatingSector: formSector,
      wasteType: formWasteType,
      weightKg: Number(formWeightKg),
      containerType: formContainerType,
      containerCount: Number(formContainerCount),
      storageLocation: 'Depósito Transitorio Refrigerado (Sector Residuos)',
      transportCompany: formTransportCompany,
      municipalGeneratorRegistry: 'Registro Municipal Las Lajas Res. Nº 441/2020 - Generador Nº 8421',
      status: 'ALMACENADO_TRANSITORIO',
      registeredBy: 'Lic. Gonzalo Rossi',
      branchId: 'branch-1',
    };

    addPathologicalWaste(newRec);
    setIsNewRecordModalOpen(false);
    showToast('success', 'Residuo Registrado', `Se asentó el manifiesto ${formManifestNumber} (${formWeightKg} kg).`);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-extrabold tracking-wider border border-amber-200 uppercase">
                Ley Nacional Nº 24.051 & Ordenanza Las Lajas
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold tracking-wider border border-slate-200 uppercase">
                Generador Habilitado Nº 8421
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Trash2 className="w-6 h-6 text-amber-600" />
              <span>Gestión de Residuos Patológicos & Peligrosos</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-3xl mt-1">
              Registro obligatorio de generación, pesaje en origen, manifiestos de retiro y certificados de disposición final según la normativa ambiental de la Provincia de Córdoba y Municipalidad de Las Lajas.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsNewRecordModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md shadow-amber-600/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Pesaje / Bolsa</span>
            </button>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">En Depósito Transitorio</span>
            <span className="text-lg font-black text-amber-700 font-mono">{totalKgStored.toFixed(1)} kg</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Retirado & Disposición</span>
            <span className="text-lg font-black text-emerald-700 font-mono">{totalKgDisposed.toFixed(1)} kg</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Manifiestos Emitidos</span>
            <span className="text-lg font-black text-slate-900 font-mono">{pathologicalWaste.length} Registros</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Plazo Máx. Almacenamiento</span>
            <span className="text-xs font-bold text-teal-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              &lt; 30 días (Refrigerado)
            </span>
          </div>
        </div>
      </div>

      {/* Manifests Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por manifiesto, sector, tipo de residuo..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <th className="p-3">Nº Manifiesto</th>
                <th className="p-3">Fecha</th>
                <th className="p-3">Sector Generador</th>
                <th className="p-3">Tipo de Residuo</th>
                <th className="p-3 text-center">Peso (Kg)</th>
                <th className="p-3 text-center">Recipientes</th>
                <th className="p-3">Operador / Transporte</th>
                <th className="p-3">Certificado Disposición</th>
                <th className="p-3 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {pathologicalWaste.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 font-mono font-bold text-slate-900">{rec.manifestNumber}</td>
                  <td className="p-3 font-mono text-slate-500">{rec.date}</td>
                  <td className="p-3 font-bold text-slate-800">{rec.generatingSector.replace(/_/g, ' ')}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                      {rec.wasteType.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-center font-mono font-black text-amber-700">{rec.weightKg} kg</td>
                  <td className="p-3 text-center font-bold text-slate-700">
                    {rec.containerCount} ({rec.containerType === 'BOLSA_ROJA_REGISTRO' ? 'Bolsa Roja' : 'Descartador'})
                  </td>
                  <td className="p-3 text-slate-600">{rec.transportCompany || 'En Acopio'}</td>
                  <td className="p-3 font-mono text-[11px] text-slate-500">
                    {rec.disposalCertificateNumber || 'Pendiente Retiro'}
                  </td>
                  <td className="p-3 text-right">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      rec.status === 'DISPOSICION_FINAL_CERTIFICADA'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : rec.status === 'RETIRADO_EN_TRANSITO'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {rec.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Registro */}
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-amber-600" />
                <span>Registrar Residuo Patológico</span>
              </h3>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveWasteRecord} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Sector Generador:</label>
                <select
                  value={formSector}
                  onChange={(e) => setFormSector(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                >
                  <option value="QUIROFANO">Quirófano Central</option>
                  <option value="UCI_INTERNACION">UCI & Internación</option>
                  <option value="LABORATORIO">Laboratorio de Análisis</option>
                  <option value="CONSULTORIOS">Consultorios Clínicos</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Tipo de Residuo:</label>
                <select
                  value={formWasteType}
                  onChange={(e) => setFormWasteType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                >
                  <option value="BIOPATOGENICO_INFECCIOSO">Biopatogénico / Infeccioso (Bolsa Roja)</option>
                  <option value="CORTOPUNZANTE">Cortopunzante (Agujas, Hojas bisturí)</option>
                  <option value="ANATOMOPATOLOGICO">Anatomopatológico (Tejidos, Órganos)</option>
                  <option value="QUIMICO_FARMACEUTICO">Químico / Farmacéutico</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Peso (Kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formWeightKg}
                    onChange={(e) => setFormWeightKg(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Cant. Recipientes:</label>
                  <input
                    type="number"
                    min="1"
                    value={formContainerCount}
                    onChange={(e) => setFormContainerCount(Number(e.target.value))}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Nº Manifiesto Oficial:</label>
                <input
                  type="text"
                  value={formManifestNumber}
                  onChange={(e) => setFormManifestNumber(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-sm"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
