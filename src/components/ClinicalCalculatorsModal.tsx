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
  AlertTriangle,
  AlertCircle,
  Copy,
  BookOpen,
  Search,
  ShieldAlert,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export interface VademecumDrug {
  name: string;
  brandNames: string;
  category: string;
  species: 'Canino y Felino' | 'Canino' | 'Felino' | 'Exóticos';
  doseRangeCanine: string;
  doseRangeFeline: string;
  defaultDoseMgKg: number;
  concentrationMgMl: number;
  routes: string;
  frequency: string;
  indications: string;
  contraindications: string;
  warnings: string;
}

export const VADEMECUM_DATABASE: VademecumDrug[] = [
  {
    name: 'Maropitant',
    brandNames: 'Cerenia, Vomend, Vetemetic',
    category: 'Antiemético (Antagonista NK-1)',
    species: 'Canino y Felino',
    doseRangeCanine: '1.0 mg/kg SC / IV lento (24h) o 2.0 mg/kg Oral (24h)',
    doseRangeFeline: '1.0 mg/kg SC / IV lento (24h)',
    defaultDoseMgKg: 1.0,
    concentrationMgMl: 10,
    routes: 'SC, IV lento, Oral',
    frequency: 'Cada 24 horas (máx 5 días consecutivos)',
    indications: 'Tratamiento y prevención del vómito agudo, náuseas y mareo por movimiento. Efecto analgésico visceral coadyuvante.',
    contraindications: 'No usar en cachorros menores de 8 semanas. Precaución en disfunción hepática severa.',
    warnings: 'La inyección SC fría reduce el dolor en la aplicación.',
  },
  {
    name: 'Meloxicam',
    brandNames: 'Metacam, Meloxivet, Meloxidyl',
    category: 'AINE (Inhibidor preferencial COX-2)',
    species: 'Canino y Felino',
    doseRangeCanine: 'Inicio: 0.2 mg/kg SC/Oral Día 1. Mant: 0.1 mg/kg Oral cada 24h',
    doseRangeFeline: 'Inicio: 0.1 mg/kg SC Día 1. Mant: 0.05 mg/kg Oral cada 24-48h',
    defaultDoseMgKg: 0.2,
    concentrationMgMl: 5,
    routes: 'SC, Oral',
    frequency: 'Cada 24 horas con alimento',
    indications: 'Alivio de la inflamación y dolor en trastornos osteomusculares agudos y crónicos, postquirúrgico.',
    contraindications: 'Gastroenteritis ulcerosa, insuficiencia renal/hepática severa, deshidratación, hipovolemia, shock.',
    warnings: 'NUNCA asociar con corticoides ni con otros AINEs (riesgo de úlcera y perforación gástrica).',
  },
  {
    name: 'Tramadol',
    brandNames: 'Tramavet, Nobligan, Algesic',
    category: 'Analgésico Opioide Atípico',
    species: 'Canino y Felino',
    doseRangeCanine: '2.0 - 5.0 mg/kg IV / SC / Oral cada 8-12 hs',
    doseRangeFeline: '1.0 - 2.0 mg/kg SC / Oral cada 12 hs (sabor amargo)',
    defaultDoseMgKg: 3.0,
    concentrationMgMl: 50,
    routes: 'IV lento, SC, IM, Oral',
    frequency: 'Cada 8 a 12 horas',
    indications: 'Dolor moderado a severo visceral, articular o posquirúrgico.',
    contraindications: 'Epilepsia no controlada, uso concurrente con ISRS o IMAO (síndrome serotoninérgico).',
    warnings: 'Administrar IV muy lentamente para evitar náuseas o excitación.',
  },
  {
    name: 'Metoclopramida',
    brandNames: 'Reliverán, Pileran, Novomit',
    category: 'Procinético / Antiemético Dopaminérgico',
    species: 'Canino y Felino',
    doseRangeCanine: '0.2 - 0.5 mg/kg SC / IM / IV lento cada 8 hs o CRI 1-2 mg/kg/día',
    doseRangeFeline: '0.2 - 0.5 mg/kg SC / IV cada 8 hs',
    defaultDoseMgKg: 0.5,
    concentrationMgMl: 5,
    routes: 'SC, IM, IV lento, Oral',
    frequency: 'Cada 8 horas (30 min antes de la ingesta)',
    indications: 'Gastroparesia, reflujo gastroesofágico, íleo postoperatorio, náuseas.',
    contraindications: 'Obstrucción mecánica gastrointestinal, hemorragia o perforación digestiva.',
    warnings: 'Puede causar extrapiramidalismo o temblores transitorios.',
  },
  {
    name: 'Omeprazol',
    brandNames: 'Gastroprotect, Losec, Omevet',
    category: 'Inhibidor de la Bomba de Protones (IBP)',
    species: 'Canino y Felino',
    doseRangeCanine: '0.5 - 1.0 mg/kg IV lento / Oral cada 12-24 hs',
    doseRangeFeline: '0.5 - 1.0 mg/kg IV lento / Oral cada 12-24 hs',
    defaultDoseMgKg: 1.0,
    concentrationMgMl: 4,
    routes: 'IV lento (reconstituido), Oral',
    frequency: 'Cada 12 a 24 horas',
    indications: 'Úlceras gástricas y duodenales, esofagitis por reflujo, profilaxis con AINEs.',
    contraindications: 'Hipersensibilidad a benzimidazoles.',
    warnings: 'Reducir gradualmente tras tratamientos prolongados para evitar hipersecreción ácida de rebote.',
  },
  {
    name: 'Amoxicilina + Ácido Clavulánico',
    brandNames: 'Synulox, Clavamox, Augmentin Vet',
    category: 'Antibiótico Betalactámico + Inhibidor Beta-lactamasas',
    species: 'Canino y Felino',
    doseRangeCanine: '12.5 - 20.0 mg/kg Oral / SC cada 12 hs',
    doseRangeFeline: '12.5 - 20.0 mg/kg Oral / SC cada 12 hs',
    defaultDoseMgKg: 20.0,
    concentrationMgMl: 50,
    routes: 'Oral, SC',
    frequency: 'Cada 12 horas con alimento',
    indications: 'Infecciones de piel (piodermias), periodontales, respiratorias y urinarias.',
    contraindications: 'Hipersensibilidad a penicilinas y betalactámicos. No usar en conejos/cobayos.',
    warnings: 'Agitar bien las suspensiones antes de dosificar.',
  },
  {
    name: 'Enrofloxacina',
    brandNames: 'Baytril, Floxacin, Enrovet',
    category: 'Antibiótico Fluoroquinolona bactericida',
    species: 'Canino y Felino',
    doseRangeCanine: '5.0 - 10.0 mg/kg SC / Oral cada 24 hs',
    doseRangeFeline: 'Máximo 5.0 mg/kg Oral / SC cada 24 hs (Riesgo retinopatía)',
    defaultDoseMgKg: 5.0,
    concentrationMgMl: 50,
    routes: 'SC, IM, Oral',
    frequency: 'Cada 24 horas',
    indications: 'Infecciones bacterianas complejas por Gram negativos, urinarias profundas y otitis.',
    contraindications: 'Cachorros en fase de crecimiento rápido (daño articular en cartílago). Felinos a dosis > 5 mg/kg.',
    warnings: 'En gatos, dosis superiores a 5 mg/kg/día pueden causar ceguera retiniana irreversible.',
  },
  {
    name: 'Dipirona (Metamizol)',
    brandNames: 'Novalgina, Dipirona 50%, Algifen',
    category: 'Analgésico / Antipirético / Espasmolítico',
    species: 'Canino',
    doseRangeCanine: '20.0 - 30.0 mg/kg IV lento / SC cada 8-12 hs',
    doseRangeFeline: 'Uso restringido o desaconsejado (máx 10 mg/kg dosis única con extrema precaución)',
    defaultDoseMgKg: 25.0,
    concentrationMgMl: 500,
    routes: 'IV lento, SC, IM',
    frequency: 'Cada 8 a 12 horas',
    indications: 'Fiebre refractaria, dolor tipo cólico abdominal, analgesia visceral.',
    contraindications: 'Hipotensión, deshidratación, alergia conocida a pirazolonas, coagulopatías.',
    warnings: 'Inyección IV rápida puede desencadenar colapso e hipotensión severa. Administrar lento.',
  },
  {
    name: 'Pimobendan',
    brandNames: 'Vetmedin, Cardisure, Pimocard',
    category: 'Inodilatador Cardíaco (Sensibilizador de Calcio + PDE-3)',
    species: 'Canino y Felino',
    doseRangeCanine: '0.25 - 0.3 mg/kg Oral cada 12 hs (1 hora antes de comer)',
    doseRangeFeline: '0.15 - 0.3 mg/kg Oral cada 12 hs',
    defaultDoseMgKg: 0.25,
    concentrationMgMl: 1.25,
    routes: 'Oral, IV (Vetmedin inyectable)',
    frequency: 'Cada 12 horas (estrictamente en ayunas, 1h antes del alimento)',
    indications: 'Enfermedad Degenerativa Valvular Mitral (Estadios B2, C y D), Cardiomiopatía Dilatada.',
    contraindications: 'Estenosis aórtica, miocardiopatía hipertrófica obstructiva u obstrucción mecánica de eyección.',
    warnings: 'La presencia de alimento en el estómago disminuye sensiblemente su biodisponibilidad.',
  },
  {
    name: 'Propofol',
    brandNames: 'Diprivan, Propovet, PropoFlo',
    category: 'Anestésico General Intravenoso Ultra-corto',
    species: 'Canino y Felino',
    doseRangeCanine: 'Sin premedicación: 4-6 mg/kg IV. Premedicado: 2-4 mg/kg IV a efecto',
    doseRangeFeline: 'Sin premedicación: 4-6 mg/kg IV. Premedicado: 2-4 mg/kg IV a efecto',
    defaultDoseMgKg: 4.0,
    concentrationMgMl: 10,
    routes: 'IV lento a efecto estricto',
    frequency: 'Bolo único de inducción o CRI para mantenimiento',
    indications: 'Inducción anestésica rápida para intubación endotraqueal y procedimientos breves.',
    contraindications: 'Hipersensibilidad al propofol. Hipovolemia severa.',
    warnings: 'Puede causar apnea transitoria e hipotensión por vasodilatación. Administrar con oxígeno y monitoreo.',
  },
  {
    name: 'Adrenalina / Epinefrina',
    brandNames: 'Adrenalina 1:1000',
    category: 'Vasopresor / Estimulante Adrenérgico de Emergencia (RCP)',
    species: 'Canino y Felino',
    doseRangeCanine: 'Dosis baja RCP: 0.01 mg/kg IV/IO. Dosis alta RCP: 0.1 mg/kg IV/IO',
    doseRangeFeline: '0.01 mg/kg IV/IO cada 3-5 minutos de parada cardiorrespiratoria',
    defaultDoseMgKg: 0.01,
    concentrationMgMl: 1.0,
    routes: 'IV, Intraósea, Intratraqueal (al doble de dosis)',
    frequency: 'Cada 3 a 5 minutos durante maniobras de RCP',
    indications: 'Paro cardiorrespiratorio (asistolia, AESP), anafilaxia severa.',
    contraindications: 'Ninguna en situación de paro cardiorrespiratorio.',
    warnings: 'En anafilaxia usar vía IM a 0.01 mg/kg antes de que se produzca colapso vascular.',
  },
];

export const ClinicalCalculatorsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { patients, selectedPatientId, showToast } = useVet();

  const [activeTab, setActiveTab] = useState<'URGENCIA_RCP' | 'FARMACOS' | 'FLUIDOS' | 'CRI' | 'VADEMECUM'>('URGENCIA_RCP');

  // Selected patient for auto-weight
  const initialPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const [currentPatientId, setCurrentPatientId] = useState(initialPatient?.id || '');
  const activePat = patients.find((p) => p.id === currentPatientId) || initialPatient;

  const [weightKg, setWeightKg] = useState<number>(activePat?.weight || 10);

  // Tab 1: Drug Calculator State
  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number>(0);
  const [customDose, setCustomDose] = useState<number>(VADEMECUM_DATABASE[0].defaultDoseMgKg);
  const [customConcentration, setCustomConcentration] = useState<number>(VADEMECUM_DATABASE[0].concentrationMgMl);

  // Tab 2: Fluids Calculator State
  const [species, setSpecies] = useState<'Canino' | 'Felino'>('Canino');
  const [dehydrationPercent, setDehydrationPercent] = useState<number>(5); // 5%
  const [ongoingLossesMl, setOngoingLossesMl] = useState<number>(50);
  const [replacementHours, setReplacementHours] = useState<number>(24);
  const [dropperType, setDropperType] = useState<20 | 60>(20); // 20 gotas/ml macro, 60 micro

  // Tab 3: CRI (FLK) Calculator State
  const [bagVolumeMl, setBagVolumeMl] = useState<number>(500); // 500 ml ringer
  const [infusionRateMlH, setInfusionRateMlH] = useState<number>(30); // 30 ml/h
  const [fentanylDoseMcgKgH, setFentanylDoseMcgKgH] = useState<number>(3); // 3 mcg/kg/h
  const [lidocaineDoseMgKgH, setLidocaineDoseMgKgH] = useState<number>(1.5); // 1.5 mg/kg/h
  const [ketamineDoseMgKgH, setKetamineDoseMgKgH] = useState<number>(0.6); // 0.6 mg/kg/h

  // Tab 4: Vademecum Search Filter
  const [vademecumSearch, setVademecumSearch] = useState('');

  if (!isOpen) return null;

  const handlePatientSelect = (patId: string) => {
    setCurrentPatientId(patId);
    const p = patients.find((pat) => pat.id === patId);
    if (p) {
      setWeightKg(p.weight);
      if (p.species === 'FELINO') setSpecies('Felino');
      else setSpecies('Canino');
    }
  };

  const handleSelectPresetDrug = (idx: number) => {
    setSelectedDrugIndex(idx);
    const d = VADEMECUM_DATABASE[idx];
    setCustomDose(d.defaultDoseMgKg);
    setCustomConcentration(d.concentrationMgMl);
  };

  const selectDrugFromVademecum = (drugName: string) => {
    const idx = VADEMECUM_DATABASE.findIndex((d) => d.name === drugName);
    if (idx !== -1) {
      handleSelectPresetDrug(idx);
      setActiveTab('FARMACOS');
      showToast('success', 'Fármaco Cargado', `${drugName} listo para cálculo de dosis.`);
    }
  };

  // Calculations:
  // 1. Drug Dose
  const totalMgNeeded = customDose * (weightKg || 0);
  const totalMlToAdminister = customConcentration > 0 ? totalMgNeeded / customConcentration : 0;

  // 2. Fluid Therapy
  const maintenanceMlDay =
    species === 'Canino'
      ? Math.round(30 * (weightKg || 0) + 70) // regla alométrica estándar
      : Math.round(30 * (weightKg || 0) + 70);
  const dehydrationDeficitMl = Math.round(((dehydrationPercent || 0) / 100) * (weightKg || 0) * 1000);
  const totalFluidsInPeriod = maintenanceMlDay + dehydrationDeficitMl + (ongoingLossesMl || 0);
  const rateMlPerHour = replacementHours > 0 ? (totalFluidsInPeriod / replacementHours).toFixed(1) : '0';
  const dropsPerMinute = replacementHours > 0 ? Math.round((Number(rateMlPerHour) * dropperType) / 60) : 0;
  const dropsPerSecondInterval = dropsPerMinute > 0 ? (60 / dropsPerMinute).toFixed(1) : '0';

  // 3. CRI (FLK)
  const bagDurationHours = infusionRateMlH > 0 ? bagVolumeMl / infusionRateMlH : 0;
  const fentanylTotalMcg = fentanylDoseMcgKgH * (weightKg || 0) * bagDurationHours;
  const fentanylMlToAdd = fentanylTotalMcg / 50; // 50 mcg/ml
  const lidocaineTotalMg = lidocaineDoseMgKgH * (weightKg || 0) * bagDurationHours;
  const lidocaineMlToAdd = lidocaineTotalMg / 20; // 20 mg/ml
  const ketamineTotalMg = ketamineDoseMgKgH * (weightKg || 0) * bagDurationHours;
  const ketamineMlToAdd = ketamineTotalMg / 50; // 50 mg/ml

  // Drug Safety Check
  const currentDrug = VADEMECUM_DATABASE[selectedDrugIndex] || VADEMECUM_DATABASE[0];
  const patientAllergies = (activePat?.alerts || []).map((a: any) => {
    if (typeof a === 'string') return a;
    return `${a?.type || ''} ${a?.description || ''}`.trim();
  });
  const hasPotentialAllergyAlert = patientAllergies.some((al) => {
    const alLower = al.toLowerCase();
    const drugNameLower = (currentDrug.name || '').toLowerCase();
    const catLower = (currentDrug.category || '').toLowerCase();
    return (
      alLower.includes(drugNameLower) ||
      (drugNameLower.includes('dipirona') && alLower.includes('dipirona')) ||
      (catLower.includes('aine') && (alLower.includes('aine') || alLower.includes('antiinflamatorio'))) ||
      (catLower.includes('betalactámico') && (alLower.includes('penicilina') || alLower.includes('amoxicilina')))
    );
  });

  const filteredVademecum = VADEMECUM_DATABASE.filter((d) => {
    const q = vademecumSearch.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.brandNames.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.indications.toLowerCase().includes(q)
    );
  });

  const copyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('success', 'Copiado al Portapapeles', text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Calculadora Médica & Vademécum Clínico</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 uppercase tracking-wider">
                  Precisión Clínica 24/7
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Desglose explícito de fórmulas, seguridad farmacológica y protocolos CRI / fluidos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Patient Selection Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-teal-50/70 border-b border-teal-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-teal-900">Paciente en Contexto:</span>
            <select
              value={currentPatientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className="bg-white border border-teal-200 rounded-xl px-3 py-1 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species} - {p.breed}) — {p.weight} kg
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
              className="w-20 bg-white border border-slate-300 rounded-xl px-2 py-1 text-slate-900 font-mono font-black text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="font-bold text-slate-700">kg</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 px-4 sm:px-5 pt-3 gap-2 bg-white overflow-x-auto">
          <button
            onClick={() => setActiveTab('URGENCIA_RCP')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'URGENCIA_RCP'
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/30'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-900 border-b border-rose-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 animate-pulse text-white" />
            <span>🚑 Drogas de Urgencia & RCP</span>
          </button>
          <button
            onClick={() => setActiveTab('FARMACOS')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'FARMACOS'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Dosis de Fármacos & Fórmulas</span>
          </button>
          <button
            onClick={() => setActiveTab('FLUIDOS')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'FLUIDOS'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>Fluidoterapia Estructurada</span>
          </button>
          <button
            onClick={() => setActiveTab('CRI')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'CRI'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Infusión Continua (CRI FLK)</span>
          </button>
          <button
            onClick={() => setActiveTab('VADEMECUM')}
            className={`px-4 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'VADEMECUM'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Vademécum Clínico ({VADEMECUM_DATABASE.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar text-xs">
          {/* TAB 0: DROGAS DE URGENCIA, RCP Y SHOCK (ALTA PRIORIDAD CLÍNICA) */}
          {activeTab === 'URGENCIA_RCP' && (
            <div className="space-y-4 animate-fade-in">
              {/* Emergency Banner */}
              <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white p-4 rounded-3xl shadow-lg border border-rose-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-600/80 border border-rose-400/50 flex items-center justify-center text-2xl font-black shadow-inner flex-shrink-0 animate-pulse">
                    ⚡
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-black tracking-widest bg-rose-500/40 text-rose-200 px-2 py-0.5 rounded-full border border-rose-400/30">
                        Protocolo RECOVER / Guardia 24hs
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                      Cálculo Inmediato de Resucitación & Emergencias para {activePat.name} ({weightKg} kg)
                    </h3>
                    <p className="text-xs text-rose-200/90 font-medium">
                      Volúmenes exactos en ml calculados para administración IV/IO en shock-room
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      const summary = [
                        `🚨 PLAN DE URGENCIA / RCP - ${activePat.name} (${weightKg} kg):`,
                        `1. Adrenalina 1mg/ml (Dosis baja 0.01 mg/kg): ${(weightKg * 0.01).toFixed(2)} ml IV`,
                        `2. Atropina 1mg/ml (0.04 mg/kg): ${(weightKg * 0.04).toFixed(2)} ml IV`,
                        `3. Diazepam 5mg/ml (0.5 mg/kg): ${(weightKg * 0.1).toFixed(2)} ml IV`,
                        `4. Fentanilo 0.05mg/ml (0.005 mg/kg): ${(weightKg * 0.1).toFixed(2)} ml IV`,
                        `5. Bolo Shock Ringer Lactato: ${(weightKg * (species === 'Felino' ? 12 : 18)).toFixed(0)} ml en 15 min`,
                      ].join('\n');
                      copyResult(summary);
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 bg-white text-rose-900 hover:bg-rose-50 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 flex-shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Dosis de Urgencia</span>
                  </button>
                </div>
              </div>

              {/* Grid of Critical Emergency Drugs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {[
                  {
                    name: 'Adrenalina / Epinefrina',
                    doseText: '0.01 mg/kg (Dosis baja RCP)',
                    concText: '1 mg/ml (1:1000)',
                    volumeMl: (weightKg * 0.01).toFixed(2),
                    syringe: 'Jeringa 1 ml (Tuberculina)',
                    route: 'IV / IO / IT',
                    indication: 'Asistolia, AESP, Shock anafiláctico',
                    badge: 'PARO CARDIORRESPIRATORIO',
                    color: 'border-rose-300 bg-rose-50/60 text-rose-950',
                  },
                  {
                    name: 'Atropina Sulfato',
                    doseText: '0.04 mg/kg',
                    concText: '1 mg/ml',
                    volumeMl: (weightKg * 0.04).toFixed(2),
                    syringe: 'Jeringa 1 ml / 3 ml',
                    route: 'IV / IO / IM',
                    indication: 'Bradicardia severa por tono vagal',
                    badge: 'BRADICARDIA SEVERA',
                    color: 'border-amber-300 bg-amber-50/60 text-amber-950',
                  },
                  {
                    name: 'Diazepam',
                    doseText: '0.5 mg/kg IV (1.0 mg/kg Rectal)',
                    concText: '5 mg/ml',
                    volumeMl: (weightKg * 0.1).toFixed(2),
                    syringe: 'Jeringa 1 ml / 3 ml',
                    route: 'IV lento / Rectal',
                    indication: 'Status epiléptico, convulsiones activas',
                    badge: 'CONVULSIONES ACTIVAS',
                    color: 'border-purple-300 bg-purple-50/60 text-purple-950',
                  },
                  {
                    name: 'Midazolam',
                    doseText: '0.2 - 0.5 mg/kg',
                    concText: '5 mg/ml',
                    volumeMl: (weightKg * 0.06).toFixed(2),
                    syringe: 'Jeringa 1 ml (Tuberculina)',
                    route: 'IV / IM / Intranasal',
                    indication: 'Sedación de urgencia, fracturas, convulsión',
                    badge: 'SEDACIÓN / ANTICONVULSIVANTE',
                    color: 'border-indigo-300 bg-indigo-50/60 text-indigo-950',
                  },
                  {
                    name: 'Naloxona',
                    doseText: '0.04 mg/kg',
                    concText: '0.4 mg/ml',
                    volumeMl: (weightKg * 0.1).toFixed(2),
                    syringe: 'Jeringa 1 ml / 3 ml',
                    route: 'IV / IM / SC',
                    indication: 'Reversor de opioides / depresión respiratoria',
                    badge: 'REVERSOR OPIOIDE',
                    color: 'border-teal-300 bg-teal-50/60 text-teal-950',
                  },
                  {
                    name: 'Lidocaína 2% (sin epi)',
                    doseText: species === 'Felino' ? '0.25 mg/kg IV lento' : '2.0 mg/kg IV bolo lento',
                    concText: '20 mg/ml (2%)',
                    volumeMl: (weightKg * (species === 'Felino' ? 0.0125 : 0.1)).toFixed(2),
                    syringe: 'Jeringa 1 ml / 3 ml',
                    route: 'IV lento (monitoreo ECG)',
                    indication: 'Taquicardia ventricular / CVP frecuentes',
                    badge: 'ANTIARRÍTMICO VENTRICULAR',
                    color: 'border-blue-300 bg-blue-50/60 text-blue-950',
                  },
                  {
                    name: 'Dexametasona',
                    doseText: '0.5 - 1.0 mg/kg',
                    concText: '2 mg/ml (o 4 mg/ml)',
                    volumeMl: (weightKg * 0.25).toFixed(2),
                    syringe: 'Jeringa 1 ml / 3 ml',
                    route: 'IV / IM',
                    indication: 'Shock anafiláctico, edema de glotis, trauma',
                    badge: 'ANTIINFLAMATORIO SHOCK',
                    color: 'border-amber-300 bg-amber-50/60 text-amber-950',
                  },
                  {
                    name: 'Furosemida',
                    doseText: '2.0 - 4.0 mg/kg',
                    concText: '50 mg/ml',
                    volumeMl: (weightKg * 0.06).toFixed(2),
                    syringe: 'Jeringa 1 ml (Tuberculina)',
                    route: 'IV / IM',
                    indication: 'Edema agudo de pulmón cardiogénico',
                    badge: 'EMERGENCIA CARDIORESPIRATORIA',
                    color: 'border-sky-300 bg-sky-50/60 text-sky-950',
                  },
                  {
                    name: 'Dextrosa 50% (Glucosa)',
                    doseText: '1.0 ml/kg diluido 1:1 con NaCl',
                    concText: '50% (500 mg/ml)',
                    volumeMl: (weightKg * 1.0).toFixed(1),
                    syringe: 'Jeringa 5 ml / 10 ml',
                    route: 'IV lento diluido',
                    indication: 'Hipoglucemia severa, coma hipoglucémico',
                    badge: 'HIPOGLUCEMIA CRÍTICA',
                    color: 'border-emerald-300 bg-emerald-50/60 text-emerald-950',
                  },
                  {
                    name: 'Gluconato de Calcio 10%',
                    doseText: '0.5 - 1.0 ml/kg en 10-15 min',
                    concText: '100 mg/ml (10%)',
                    volumeMl: (weightKg * 0.75).toFixed(2),
                    syringe: 'Jeringa 5 ml / 10 ml',
                    route: 'IV muy lento (monitorear FC)',
                    indication: 'Cardioprotección hiperpotasemia / Hipocalcemia',
                    badge: 'OBSTRUCCIÓN URETRAL / ECLAMPSIA',
                    color: 'border-orange-300 bg-orange-50/60 text-orange-950',
                  },
                  {
                    name: 'Bolo de Shock Cristaloides',
                    doseText: species === 'Felino' ? '10 - 15 ml/kg en 15 min' : '15 - 20 ml/kg en 15 min',
                    concText: 'Ringer Lactato / Sol. Fisiológica',
                    volumeMl: (weightKg * (species === 'Felino' ? 12 : 18)).toFixed(0),
                    syringe: 'Bolsa 500ml / Guía Macrogotero',
                    route: 'IV rápida bajo presión',
                    indication: 'Shock hipovolémico / Trauma / Pérdida masiva',
                    badge: 'RESUCITACIÓN CON FLUIDOS',
                    color: 'border-teal-400 bg-teal-50/70 text-teal-950',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between space-y-2 ${item.color}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <strong className="text-sm font-black tracking-tight">{item.name}</strong>
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/80 border border-slate-200">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium opacity-90">{item.indication}</p>
                    </div>

                    <div className="bg-white/90 p-2.5 rounded-xl border border-slate-200/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Volumen Exacto:</span>
                        <span className="text-base font-black text-rose-700 font-mono">
                          {item.volumeMl} ml
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-600 font-mono flex justify-between border-t border-slate-100 pt-1">
                        <span>Dosis: {item.doseText}</span>
                        <span>Vía: {item.route}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-sans">
                        💉 Sugerido: <strong>{item.syringe}</strong> ({item.concText})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: FARMACOS CON FÓRMULA EXPLÍCITA Y SEGURIDAD */}
          {activeTab === 'FARMACOS' && (
            <div className="space-y-4">
              {/* Allergy Alert if triggered */}
              {hasPotentialAllergyAlert && (
                <div className="p-3.5 bg-red-50 border-2 border-red-500 text-red-900 rounded-2xl flex items-start gap-3 animate-pulse">
                  <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs">¡ADVERTENCIA DE SEGURIDAD FARMACOLÓGICA!</h5>
                    <p className="text-[11px] mt-0.5">
                      El paciente <strong>{activePat.name}</strong> tiene registrada la siguiente alerta:{' '}
                      <span className="font-bold underline">{patientAllergies.join(', ')}</span>. Verificar contraindicación médica antes de administrar.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Preset Drug Selector */}
                <div className="space-y-2">
                  <label className="text-slate-700 font-bold block">Fármaco Seleccionado:</label>
                  <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl p-1.5 bg-slate-50 space-y-1 custom-scrollbar">
                    {VADEMECUM_DATABASE.map((d, i) => (
                      <button
                        key={d.name}
                        onClick={() => handleSelectPresetDrug(i)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between ${
                          selectedDrugIndex === i
                            ? 'bg-teal-600 text-white font-bold shadow-xs'
                            : 'hover:bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className="text-xs">{d.name} <span className="text-[10px] opacity-80">({d.brandNames.split(',')[0]})</span></div>
                          <div className={`text-[10px] ${selectedDrugIndex === i ? 'text-teal-100' : 'text-slate-400'}`}>
                            {d.category} • {d.defaultDoseMgKg} mg/kg ({d.routes.split(',')[0]})
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
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center justify-between">
                    <span>Parámetros de Dosificación</span>
                    <span className="text-[10px] text-slate-400 font-mono">Dosis recomendada: {currentDrug.defaultDoseMgKg} mg/kg</span>
                  </h4>

                  <div>
                    <label className="text-slate-600 block mb-1">Dosis Prescrita (mg/kg):</label>
                    <input
                      type="number"
                      step="0.001"
                      value={customDose}
                      onChange={(e) => setCustomDose(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Concentración de la Presentación (mg/ml):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customConcentration}
                      onChange={(e) => setCustomConcentration(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-[11px] space-y-1">
                    <p><strong>Frecuencia:</strong> {currentDrug.frequency}</p>
                    <p><strong>Vías Habilitadas:</strong> {currentDrug.routes}</p>
                  </div>
                </div>
              </div>

              {/* Mathematical Formula Transparency Block */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📐</span>
                    <span>Desglose de la Fórmula Matemática (Transparencia Médica)</span>
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activePat.name} • {weightKg} kg
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-[10px] block mb-1">1. Dosis Total Requerida (mg):</span>
                    <div className="text-sm font-bold text-teal-300">
                      {weightKg} kg × {customDose} mg/kg = <span className="text-white text-base">{totalMgNeeded.toFixed(2)} mg</span>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-[10px] block mb-1">2. Volumen a Administrar (ml):</span>
                    <div className="text-sm font-bold text-emerald-300">
                      {totalMgNeeded.toFixed(2)} mg ÷ {customConcentration} mg/ml = <span className="text-white text-base">{totalMlToAdminister.toFixed(2)} ml</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-300 font-sans">
                    <strong>Resumen:</strong> Administrar <span className="font-bold text-emerald-400 font-mono text-sm">{totalMlToAdminister.toFixed(2)} ml</span> ({totalMgNeeded.toFixed(2)} mg) vía {currentDrug.routes.split(',')[0]} {currentDrug.frequency.toLowerCase()}.
                  </div>
                  <button
                    onClick={() =>
                      copyResult(
                        `Prescripción para ${activePat.name} (${weightKg} kg): ${currentDrug.name} ${totalMlToAdminister.toFixed(2)} ml (${totalMgNeeded.toFixed(2)} mg) vía ${currentDrug.routes.split(',')[0]} ${currentDrug.frequency}.`
                      )
                    }
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Prescripción</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLUIDOS */}
          {activeTab === 'FLUIDOS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">Evaluación de Deshidratación y Pérdidas</h4>

                  <div>
                    <label className="text-slate-600 block mb-1">Especie:</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSpecies('Canino')}
                        className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                          species === 'Canino' ? 'bg-teal-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                        }`}
                      >
                        🐶 Canino
                      </button>
                      <button
                        onClick={() => setSpecies('Felino')}
                        className={`flex-1 py-1.5 rounded-xl font-bold transition-all ${
                          species === 'Felino' ? 'bg-teal-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                        }`}
                      >
                        🐱 Felino
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Grado de Deshidratación:</span>
                      <span className="font-bold text-slate-900">{dehydrationPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="12"
                      step="1"
                      value={dehydrationPercent}
                      onChange={(e) => setDehydrationPercent(Number(e.target.value))}
                      className="w-full accent-teal-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0% (Normo)</span>
                      <span>5% (Leve)</span>
                      <span>8% (Mod)</span>
                      <span>12% (Severa/Shock)</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Pérdidas continuas estimadas (vómitos/diarrea en ml):</label>
                    <input
                      type="number"
                      value={ongoingLossesMl}
                      onChange={(e) => setOngoingLossesMl(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Tiempo de reposición del déficit (horas):</label>
                    <input
                      type="number"
                      value={replacementHours}
                      onChange={(e) => setReplacementHours(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                {/* Fluid Rate Calculations */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                      Plan de Infusión IV para {activePat.name} ({weightKg} kg)
                    </span>

                    <div className="space-y-2 mt-3 text-xs font-mono">
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">Mantenimiento (24h):</span>
                        <span className="font-bold text-teal-300">{maintenanceMlDay} ml</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">Déficit deshidratación ({dehydrationPercent}%):</span>
                        <span className="font-bold text-teal-300">{dehydrationDeficitMl} ml</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1">
                        <span className="text-slate-400">Pérdidas continuas estimadas:</span>
                        <span className="font-bold text-teal-300">{ongoingLossesMl} ml</span>
                      </div>
                      <div className="flex justify-between pt-1 text-sm font-bold text-white">
                        <span>Total Volumen ({replacementHours}h):</span>
                        <span>{totalFluidsInPeriod} ml</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700 text-center space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Velocidad en Bomba de Infusión:</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono">{rateMlPerHour} ml/h</div>
                    <div className="text-[11px] text-slate-300 font-mono">
                      Equivale a ~{dropsPerMinute} gotas/minuto (1 gota cada {dropsPerSecondInterval} seg en macrogotero 20gts/ml)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CRI */}
          {activeTab === 'CRI' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs">Parámetros del Sachet de Infusión Continua (FLK)</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block mb-1">Volumen del Sachet (ml):</label>
                    <input
                      type="number"
                      value={bagVolumeMl}
                      onChange={(e) => setBagVolumeMl(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Velocidad de Infusión (ml/h):</label>
                    <input
                      type="number"
                      value={infusionRateMlH}
                      onChange={(e) => setInfusionRateMlH(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="text-slate-600 block mb-1">Fentanilo (mcg/kg/h):</label>
                    <input
                      type="number"
                      step="0.5"
                      value={fentanylDoseMcgKgH}
                      onChange={(e) => setFentanylDoseMcgKgH(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Lidocaína 2% (mg/kg/h):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={lidocaineDoseMgKgH}
                      onChange={(e) => setLidocaineDoseMgKgH(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block mb-1">Ketamina 50mg/ml (mg/kg/h):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ketamineDoseMgKgH}
                      onChange={(e) => setKetamineDoseMgKgH(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* CRI Recipe Output */}
              <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-[10px] font-bold text-teal-400 uppercase">
                    Preparación del Sachet CRI para {activePat.name} ({weightKg} kg)
                  </span>
                  <span className="text-xs text-slate-400">Duración: {bagDurationHours.toFixed(1)} hs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Fentanilo (50 mcg/ml):</span>
                    <span className="text-base font-bold text-emerald-400">{fentanylMlToAdd.toFixed(2)} ml</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Lidocaína 2% (20 mg/ml):</span>
                    <span className="text-base font-bold text-emerald-400">{lidocaineMlToAdd.toFixed(2)} ml</span>
                  </div>
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Ketamina (50 mg/ml):</span>
                    <span className="text-base font-bold text-emerald-400">{ketamineMlToAdd.toFixed(2)} ml</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VADEMECUM INTERACTIVO */}
          {activeTab === 'VADEMECUM' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={vademecumSearch}
                  onChange={(e) => setVademecumSearch(e.target.value)}
                  placeholder="Buscar por principio activo, nombre comercial, indicación..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredVademecum.map((drug) => (
                  <div
                    key={drug.name}
                    className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-teal-500/50 transition-all shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{drug.name}</h4>
                        <span className="text-[11px] text-teal-700 font-semibold">{drug.brandNames}</span>
                      </div>
                      <button
                        onClick={() => selectDrugFromVademecum(drug.name)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Calcular Dosis</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px]">Dosis Caninos:</span>
                        <span className="text-slate-700 font-mono">{drug.doseRangeCanine}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block uppercase text-[9px]">Dosis Felinos:</span>
                        <span className="text-slate-700 font-mono">{drug.doseRangeFeline}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      <strong>Indicaciones:</strong> {drug.indications}
                    </p>
                    <p className="text-[11px] text-red-600 font-medium">
                      <strong>Contraindicaciones:</strong> {drug.contraindications}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
