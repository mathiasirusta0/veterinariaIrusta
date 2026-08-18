import React, { useState } from 'react';
import {
  Calculator,
  X,
  Droplet,
  Pill,
  Activity,
  Heart,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

const PRESET_DRUGS = [
  // Gastro / Antieméticos
  { name: 'Maropitant (Cerenia)', category: 'Antiemético', doseMgKg: 1.0, concentrationMgMl: 10, route: 'SC', defaultFreq: 'Cada 24 hs' },
  { name: 'Metoclopramida', category: 'Procinético / Antiemético', doseMgKg: 0.5, concentrationMgMl: 5, route: 'SC / IV lento', defaultFreq: 'Cada 8 hs' },
  { name: 'Ranitidina', category: 'Protector Gástrico', doseMgKg: 2.0, concentrationMgMl: 25, route: 'IV / SC', defaultFreq: 'Cada 12 hs' },
  { name: 'Omeprazol', category: 'Inhibidor Bomba Protones', doseMgKg: 1.0, concentrationMgMl: 4, route: 'IV lento / Oral', defaultFreq: 'Cada 24 hs' },
  // Analgésicos & AINEs
  { name: 'Meloxicam (Dosis Inicio)', category: 'AINE Analgésico', doseMgKg: 0.2, concentrationMgMl: 5, route: 'SC / Oral', defaultFreq: 'Día 1 (Única)' },
  { name: 'Meloxicam (Mantenimiento)', category: 'AINE Analgésico', doseMgKg: 0.1, concentrationMgMl: 5, route: 'Oral', defaultFreq: 'Cada 24 hs' },
  { name: 'Tramadol', category: 'Analgésico Opioide', doseMgKg: 3.0, concentrationMgMl: 50, route: 'IV / SC', defaultFreq: 'Cada 8 hs' },
  { name: 'Dipirona (Metamizol)', category: 'Antipirético / Analgésico', doseMgKg: 25.0, concentrationMgMl: 500, route: 'IV / SC', defaultFreq: 'Cada 8-12 hs' },
  // Antibióticos
  { name: 'Cefalexina', category: 'Antibiótico Cefalosporina', doseMgKg: 30.0, concentrationMgMl: 50, route: 'Oral', defaultFreq: 'Cada 12 hs' },
  { name: 'Enrofloxacina', category: 'Antibiótico Fluoroquinolona', doseMgKg: 5.0, concentrationMgMl: 50, route: 'SC / Oral', defaultFreq: 'Cada 24 hs' },
  { name: 'Amoxicilina + Ác. Clavulánico', category: 'Antibiótico Amplio Espectro', doseMgKg: 20.0, concentrationMgMl: 50, route: 'Oral / SC', defaultFreq: 'Cada 12 hs' },
  { name: 'Metronidazol', category: 'Antibiótico / Antiparasitario', doseMgKg: 15.0, concentrationMgMl: 5, route: 'IV lento / Oral', defaultFreq: 'Cada 12 hs' },
  // Anestesia & Sedación
  { name: 'Propofol', category: 'Inductor Anestésico', doseMgKg: 4.0, concentrationMgMl: 10, route: 'IV a efecto', defaultFreq: 'Bolo de inducción' },
  { name: 'Midazolam', category: 'Benzodiacepina Sedante', doseMgKg: 0.25, concentrationMgMl: 5, route: 'IV / IM', defaultFreq: 'Premedicación' },
  { name: 'Ketamina (Inducción)', category: 'Anestésico Disociativo', doseMgKg: 5.0, concentrationMgMl: 50, route: 'IV / IM', defaultFreq: 'Inducción' },
  { name: 'Dexmedetomidina', category: 'Agonista Alfa-2 Sedante', doseMgKg: 0.005, concentrationMgMl: 0.5, route: 'IV / IM', defaultFreq: 'Sedación reversible' },
  // Urgencias & RCP
  { name: 'Adrenalina / Epinefrina (RCP)', category: 'Emergencia Vital', doseMgKg: 0.01, concentrationMgMl: 1, route: 'IV / IT', defaultFreq: 'Bolo RCP cada 4 min' },
  { name: 'Atropina', category: 'Anticolinérgico', doseMgKg: 0.03, concentrationMgMl: 1, route: 'IV / SC', defaultFreq: 'Bradicardia vagal' },
  { name: 'Dexametasona', category: 'Corticoide Rápido', doseMgKg: 0.3, concentrationMgMl: 4, route: 'IV / SC', defaultFreq: 'Shock / Inflamación aguda' },
];

export const ClinicalCalculatorsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { patients, selectedPatientId, showToast } = useVet();

  const [activeTab, setActiveTab] = useState<'FARMACOS' | 'FLUIDOS' | 'CRI'>('FARMACOS');

  // Selected patient for auto-weight
  const initialPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const [currentPatientId, setCurrentPatientId] = useState(initialPatient?.id || '');
  const activePat = patients.find((p) => p.id === currentPatientId) || initialPatient;

  const [weightKg, setWeightKg] = useState<number>(activePat?.weight || 10);

  // Tab 1: Drug Calculator State
  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number>(0);
  const [customDose, setCustomDose] = useState<number>(PRESET_DRUGS[0].doseMgKg);
  const [customConcentration, setCustomConcentration] = useState<number>(PRESET_DRUGS[0].concentrationMgMl);

  // Tab 2: Fluids Calculator State
  const [species, setSpecies] = useState<'Canino' | 'Felino'>('Canino');
  const [dehydrationPercent, setDehydrationPercent] = useState<number>(6); // 6%
  const [ongoingLossesMl, setOngoingLossesMl] = useState<number>(50);
  const [replacementHours, setReplacementHours] = useState<number>(24);
  const [dropperType, setDropperType] = useState<20 | 60>(20); // 20 gotas/ml macro, 60 micro

  // Tab 3: CRI (FLK) Calculator State
  const [bagVolumeMl, setBagVolumeMl] = useState<number>(500); // 500 ml ringer
  const [infusionRateMlH, setInfusionRateMlH] = useState<number>(30); // 30 ml/h
  const [fentanylDoseMcgKgH, setFentanylDoseMcgKgH] = useState<number>(3); // 3 mcg/kg/h
  const [lidocaineDoseMgKgH, setLidocaineDoseMgKgH] = useState<number>(1.5); // 1.5 mg/kg/h
  const [ketamineDoseMgKgH, setKetamineDoseMgKgH] = useState<number>(0.6); // 0.6 mg/kg/h

  if (!isOpen) return null;

  const handlePatientSelect = (patId: string) => {
    setCurrentPatientId(patId);
    const p = patients.find((pat) => pat.id === patId);
    if (p) {
      setWeightKg(p.weight);
      if (p.species === 'Felino') setSpecies('Felino');
      else setSpecies('Canino');
    }
  };

  const handleSelectPresetDrug = (idx: number) => {
    setSelectedDrugIndex(idx);
    const d = PRESET_DRUGS[idx];
    setCustomDose(d.doseMgKg);
    setCustomConcentration(d.concentrationMgMl);
  };

  // Calculations:
  // 1. Drug Dose
  const totalMgNeeded = customDose * weightKg;
  const totalMlToAdminister = customConcentration > 0 ? totalMgNeeded / customConcentration : 0;

  // 2. Fluid Therapy
  // Mantenimiento diario (fórmula estándar o alométrica)
  const maintenanceMlDay =
    species === 'Canino'
      ? Math.round(30 * weightKg + 70) // o 50 ml/kg
      : Math.round(30 * weightKg + 70); // o 40 ml/kg felino
  const dehydrationDeficitMl = Math.round((dehydrationPercent / 100) * weightKg * 1000);
  const totalFluidsInPeriod = maintenanceMlDay + dehydrationDeficitMl + ongoingLossesMl;
  const rateMlPerHour = replacementHours > 0 ? (totalFluidsInPeriod / replacementHours).toFixed(1) : '0';
  const dropsPerMinute = replacementHours > 0 ? Math.round((Number(rateMlPerHour) * dropperType) / 60) : 0;
  const dropsPerSecondInterval = dropsPerMinute > 0 ? (60 / dropsPerMinute).toFixed(1) : '0';

  // 3. CRI (FLK)
  // Duración del sachet a esta velocidad:
  const bagDurationHours = infusionRateMlH > 0 ? bagVolumeMl / infusionRateMlH : 0;
  // Fentanilo (Ampolla 0.05 mg/ml = 50 mcg/ml)
  const fentanylTotalMcg = fentanylDoseMcgKgH * weightKg * bagDurationHours;
  const fentanylMlToAdd = fentanylTotalMcg / 50; // 50 mcg/ml
  // Lidocaína (Ampolla 2% = 20 mg/ml)
  const lidocaineTotalMg = lidocaineDoseMgKgH * weightKg * bagDurationHours;
  const lidocaineMlToAdd = lidocaineTotalMg / 20; // 20 mg/ml
  // Ketamina (Ampolla 50 mg/ml o 100 mg/ml -> usamos 50 mg/ml)
  const ketamineTotalMg = ketamineDoseMgKgH * weightKg * bagDurationHours;
  const ketamineMlToAdd = ketamineTotalMg / 50; // 50 mg/ml

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast?.('success', 'Copiado al portapapeles', text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Calculadora Médica & Dosis Veterinarias</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 uppercase tracking-wider">
                  Precisión Clínica
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Cálculo de posología por kg, fluidoterapia con restitución y protocolos CRI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Selection Bar */}
        <div className="px-5 py-3 bg-teal-50/70 border-b border-teal-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-900">Paciente en Contexto:</span>
            <select
              value={currentPatientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className="bg-white border border-teal-200 rounded-lg px-2.5 py-1 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species} - {p.weight} kg)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Peso de Trabajo:</span>
            <input
              type="number"
              step="0.05"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-20 bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-900 font-mono font-black text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="font-bold text-slate-700">kg</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 px-5 pt-3 gap-2 bg-white">
          <button
            onClick={() => setActiveTab('FARMACOS')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'FARMACOS'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Dosis de Fármacos</span>
          </button>
          <button
            onClick={() => setActiveTab('FLUIDOS')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'FLUIDOS'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>Plan de Fluidoterapia</span>
          </button>
          <button
            onClick={() => setActiveTab('CRI')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'CRI'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Infusión Continua (CRI FLK)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
          {/* TAB 1: FARMACOS */}
          {activeTab === 'FARMACOS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Preset Drug Selector */}
                <div className="space-y-2">
                  <label className="text-slate-700 font-bold block">Seleccionar del Vademécum:</label>
                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-1.5 bg-slate-50 space-y-1 custom-scrollbar">
                    {PRESET_DRUGS.map((d, i) => (
                      <button
                        key={d.name}
                        onClick={() => handleSelectPresetDrug(i)}
                        className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between ${
                          selectedDrugIndex === i
                            ? 'bg-teal-600 text-white font-bold shadow-xs'
                            : 'hover:bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs">{d.name}</div>
                          <div className={`text-[10px] ${selectedDrugIndex === i ? 'text-teal-100' : 'text-slate-400'}`}>
                            {d.category} • {d.doseMgKg} mg/kg ({d.route})
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${selectedDrugIndex === i ? 'text-white' : 'text-teal-700'}`}>
                          {d.concentrationMgMl} mg/ml
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Fine-tune Parameters */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">Parámetros del Fármaco</h4>

                  <div>
                    <label className="text-slate-600 block mb-1">Dosis deseada (mg/kg):</label>
                    <input
                      type="number"
                      step="0.001"
                      value={customDose}
                      onChange={(e) => setCustomDose(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Concentración de la ampolla / jarabe (mg/ml):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customConcentration}
                      onChange={(e) => setCustomConcentration(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px]">
                    <span className="font-bold">Frecuencia sugerida:</span> {PRESET_DRUGS[selectedDrugIndex]?.defaultFreq} • Vía: {PRESET_DRUGS[selectedDrugIndex]?.route}
                  </div>
                </div>
              </div>

              {/* Drug Calculation Result Box */}
              <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">
                    Resultado Posológico para {activePat.name} ({weightKg} kg)
                  </span>
                  <button
                    onClick={() =>
                      copyResult(
                        `Prescripción: ${PRESET_DRUGS[selectedDrugIndex]?.name} -> Administrar ${totalMlToAdminister.toFixed(2)} ml (${totalMgNeeded.toFixed(2)} mg) ${PRESET_DRUGS[selectedDrugIndex]?.route} ${PRESET_DRUGS[selectedDrugIndex]?.defaultFreq}.`
                      )
                    }
                    className="flex items-center gap-1 text-[11px] font-bold text-teal-200 hover:text-white transition-colors bg-teal-700/50 px-2.5 py-1 rounded-lg"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Prescripción</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <span className="text-xs text-slate-300">Volumen exacto a inyectar / dosificar:</span>
                    <div className="text-3xl sm:text-4xl font-black text-teal-300 font-mono tracking-tight">
                      {totalMlToAdminister.toFixed(2)}{' '}
                      <span className="text-lg text-white font-sans font-bold">ml</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs border-t sm:border-t-0 sm:border-l border-slate-700/80 pt-2 sm:pt-0 sm:pl-4">
                    <p className="text-slate-300">
                      Masa activa requerida:{' '}
                      <span className="font-bold text-white font-mono">{totalMgNeeded.toFixed(2)} mg</span>
                    </p>
                    <p className="text-slate-300">
                      Vía & Protocolo:{' '}
                      <span className="font-bold text-teal-200">{PRESET_DRUGS[selectedDrugIndex]?.route}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLUIDOS */}
          {activeTab === 'FLUIDOS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="text-slate-600 block font-bold mb-1">Especie:</label>
                  <select
                    value={species}
                    onChange={(e) => setSpecies(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-900"
                  >
                    <option value="Canino">Canino (30xkg + 70)</option>
                    <option value="Felino">Felino (30xkg + 70)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block font-bold mb-1">Deshidratación (%):</label>
                  <select
                    value={dehydrationPercent}
                    onChange={(e) => setDehydrationPercent(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-900"
                  >
                    <option value="0">0% (Normohidratado)</option>
                    <option value="5">5% (Mucosas secas leve)</option>
                    <option value="6">6% (Pliegue cutáneo leve)</option>
                    <option value="8">8% (Pliegue evidente, TLLC &gt; 2s)</option>
                    <option value="10">10% (Ojos hundidos, shock leve)</option>
                    <option value="12">12% (Shock hipovolémico severo)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-600 block font-bold mb-1">Pérdidas continuas (ml):</label>
                  <input
                    type="number"
                    value={ongoingLossesMl}
                    onChange={(e) => setOngoingLossesMl(Number(e.target.value))}
                    placeholder="ej: vómitos, diarreas"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-slate-600 block font-bold mb-1">Tiempo de reposición:</label>
                  <select
                    value={replacementHours}
                    onChange={(e) => setReplacementHours(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-semibold text-slate-900"
                  >
                    <option value="24">En 24 Horas</option>
                    <option value="12">En 12 Horas (Rápido)</option>
                    <option value="6">En 6 Horas (Urgencia)</option>
                  </select>
                </div>
              </div>

              {/* Fluid breakdown cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">1. Mantenimiento:</span>
                  <div className="text-lg font-bold text-slate-900 font-mono">{maintenanceMlDay} ml / día</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">2. Déficit Deshidratación:</span>
                  <div className="text-lg font-bold text-amber-700 font-mono">{dehydrationDeficitMl} ml</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">3. Total a Infundir:</span>
                  <div className="text-lg font-bold text-teal-700 font-mono">{totalFluidsInPeriod} ml</div>
                </div>
              </div>

              {/* Pump Rate & Gravity Drops Output */}
              <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">
                    Ajuste de Bomba de Infusión & Goteo Gravitatorio
                  </span>
                  <button
                    onClick={() =>
                      copyResult(
                        `Plan de Fluidoterapia: ${totalFluidsInPeriod} ml en ${replacementHours}hs -> Bomba a ${rateMlPerHour} ml/h (${dropsPerMinute} gotas/min con macrogotero).`
                      )
                    }
                    className="flex items-center gap-1 text-[11px] font-bold text-teal-200 hover:text-white transition-colors bg-teal-700/50 px-2.5 py-1 rounded-lg"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Plan</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                    <span className="text-xs text-slate-300">Bomba de Infusión Continua:</span>
                    <div className="text-3xl sm:text-4xl font-black text-teal-300 font-mono tracking-tight mt-1">
                      {rateMlPerHour}{' '}
                      <span className="text-base text-white font-sans font-bold">ml / hora</span>
                    </div>
                  </div>

                  <div className="bg-white/10 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
                      <span>Gotero Gravitatorio:</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setDropperType(20)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            dropperType === 20 ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          Macro (20 g/ml)
                        </button>
                        <button
                          onClick={() => setDropperType(60)}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            dropperType === 60 ? 'bg-teal-500 text-white' : 'bg-slate-700 text-slate-300'
                          }`}
                        >
                          Micro (60 g/ml)
                        </button>
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                      {dropsPerMinute}{' '}
                      <span className="text-xs text-teal-300 font-sans font-bold">gotas/min</span>
                      <span className="text-xs text-slate-400 font-normal block font-sans">
                        (~ 1 gota cada {dropsPerSecondInterval} segundos)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CRI FLK */}
          {activeTab === 'CRI' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Volumen del Sachet de Fluidos (ml):</label>
                  <input
                    type="number"
                    value={bagVolumeMl}
                    onChange={(e) => setBagVolumeMl(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Velocidad fijada en bomba (ml/h):</label>
                  <input
                    type="number"
                    value={infusionRateMlH}
                    onChange={(e) => setInfusionRateMlH(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Doses of FLK */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200 space-y-1">
                  <span className="font-bold text-purple-900 block text-xs">Fentanilo (50 mcg/ml)</span>
                  <label className="text-[11px] text-purple-700 block">Dosis: mcg/kg/h</label>
                  <input
                    type="number"
                    step="0.5"
                    value={fentanylDoseMcgKgH}
                    onChange={(e) => setFentanylDoseMcgKgH(Number(e.target.value))}
                    className="w-full bg-white border border-purple-300 rounded-lg p-1.5 font-mono font-bold text-purple-900"
                  />
                </div>

                <div className="bg-sky-50/60 p-3.5 rounded-xl border border-sky-200 space-y-1">
                  <span className="font-bold text-sky-900 block text-xs">Lidocaína 2% (20 mg/ml)</span>
                  <label className="text-[11px] text-sky-700 block">Dosis: mg/kg/h</label>
                  <input
                    type="number"
                    step="0.1"
                    value={lidocaineDoseMgKgH}
                    onChange={(e) => setLidocaineDoseMgKgH(Number(e.target.value))}
                    className="w-full bg-white border border-sky-300 rounded-lg p-1.5 font-mono font-bold text-sky-900"
                  />
                </div>

                <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 space-y-1">
                  <span className="font-bold text-amber-900 block text-xs">Ketamina (50 mg/ml)</span>
                  <label className="text-[11px] text-amber-700 block">Dosis: mg/kg/h</label>
                  <input
                    type="number"
                    step="0.1"
                    value={ketamineDoseMgKgH}
                    onChange={(e) => setKetamineDoseMgKgH(Number(e.target.value))}
                    className="w-full bg-white border border-amber-300 rounded-lg p-1.5 font-mono font-bold text-amber-900"
                  />
                </div>
              </div>

              {/* CRI Recipe Result Box */}
              <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-teal-300 tracking-wider">
                    Receta de Mezcla para el Sachet de {bagVolumeMl} ml (Duración: {bagDurationHours.toFixed(1)} hs)
                  </span>
                  <button
                    onClick={() =>
                      copyResult(
                        `Receta CRI FLK en sachet de ${bagVolumeMl}ml a ${infusionRateMlH}ml/h: Agregar Fentanilo ${fentanylMlToAdd.toFixed(2)}ml + Lidocaína 2% ${lidocaineMlToAdd.toFixed(2)}ml + Ketamina 50mg/ml ${ketamineMlToAdd.toFixed(2)}ml.`
                      )
                    }
                    className="flex items-center gap-1 text-[11px] font-bold text-teal-200 hover:text-white transition-colors bg-teal-700/50 px-2.5 py-1 rounded-lg"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Mezcla</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-purple-300 uppercase font-bold block">Fentanilo a inyectar:</span>
                    <span className="text-2xl font-black text-white font-mono">{fentanylMlToAdd.toFixed(2)} ml</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-sky-300 uppercase font-bold block">Lidocaína 2% a inyectar:</span>
                    <span className="text-2xl font-black text-white font-mono">{lidocaineMlToAdd.toFixed(2)} ml</span>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                    <span className="text-[10px] text-amber-300 uppercase font-bold block">Ketamina 50mg/ml a inyectar:</span>
                    <span className="text-2xl font-black text-white font-mono">{ketamineMlToAdd.toFixed(2)} ml</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            ⚠️ <span className="font-semibold text-slate-600">Aviso:</span> Toda dosificación y velocidad de infusión debe ser supervisada por el veterinario tratante.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors"
          >
            Cerrar Calculadora
          </button>
        </div>
      </div>
    </div>
  );
};
