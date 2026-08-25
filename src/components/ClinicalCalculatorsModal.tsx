import React, { useState, useMemo, useEffect } from 'react';
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
  Plus,
  Trash2,
  Save,
  Star,
  Sliders,
  ArrowRight,
  Info,
  Check,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { triggerHaptic } from '../utils/haptics';

export interface VademecumDrug {
  id?: string;
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
  isCustom?: boolean;
  createdBy?: string;
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
    frequency: 'Cada 12 a 24 horas en ayunas',
    indications: 'Esofagitis, gastritis erosiva, úlceras pépticas, prevención en uso de AINEs en riesgo.',
    contraindications: 'Hipersensibilidad a benzimidazoles.',
    warnings: 'Administrar preferentemente 30-45 minutos antes de la comida matutina.',
  },
  {
    name: 'Ranitidina',
    brandNames: 'Zantac, Taural, Gastrid',
    category: 'Antagonista de Receptores H2',
    species: 'Canino y Felino',
    doseRangeCanine: '1.0 - 2.0 mg/kg IV lento / SC / Oral cada 8-12 hs',
    doseRangeFeline: '1.0 - 2.0 mg/kg IV lento / SC / Oral cada 8-12 hs',
    defaultDoseMgKg: 2.0,
    concentrationMgMl: 25,
    routes: 'IV lento, SC, IM, Oral',
    frequency: 'Cada 8 a 12 horas',
    indications: 'Hiperacidez gástrica, coadyuvante en gastritis y esofagitis leve.',
    contraindications: 'Insuficiencia renal avanzada (ajustar dosis).',
    warnings: 'La inyección IV rápida puede causar arritmias y bradicardia transitoria.',
  },
  {
    name: 'Dipirona / Metamizol',
    brandNames: 'Novalgina, Algesona, Difebar',
    category: 'Analgésico / Antipirético / Antiespasmódico',
    species: 'Canino y Felino',
    doseRangeCanine: '20 - 25 mg/kg IV lento / SC / IM cada 8 hs',
    doseRangeFeline: '10 - 15 mg/kg SC / Oral cada 12-24 hs (máx 48 hs)',
    defaultDoseMgKg: 25.0,
    concentrationMgMl: 500,
    routes: 'IV lento, SC, IM, Oral',
    frequency: 'Cada 8 horas (Canino) / Cada 12-24 horas (Felino)',
    indications: 'Dolor espasmódico visceral (cólicos gastrointestinales/urinarios), fiebre refractaria, dolor postoperatorio agudo.',
    contraindications: 'Hipotensión, deshidratación severa, alergia conocida a dipirona.',
    warnings: 'IV SIEMPRE MUY LENTO para evitar shock hipotensivo y colapso circulatorio. En felinos vigilar signos de hipersalivación.',
  },
  {
    name: 'Dexametasona',
    brandNames: 'Decadron, Dexavet, Corsona',
    category: 'Glucocorticoide de Alta Potencia',
    species: 'Canino y Felino',
    doseRangeCanine: 'Antiinflamatorio: 0.1 - 0.2 mg/kg. Inmunosupresor / Shock: 0.5 - 1.0 mg/kg IV/IM',
    doseRangeFeline: 'Antiinflamatorio: 0.1 - 0.2 mg/kg. Inmunosupresor: 0.5 - 1.0 mg/kg IV/IM',
    defaultDoseMgKg: 0.2,
    concentrationMgMl: 2,
    routes: 'IV, IM, SC',
    frequency: 'Cada 24 horas o dosis única en agudo',
    indications: 'Shock anafiláctico, edema de glotis, reacciones alérgicas agudas, trauma espinal, enfermedades autoinmunes.',
    contraindications: 'Úlceras corneales o gastrointestinales, infecciones micóticas sistémicas, diabetes mellitus.',
    warnings: 'No combinar con AINEs bajo ningún concepto. En shock utilizar la concentración de 4 mg/ml.',
  },
  {
    name: 'Ceftriaxona',
    brandNames: 'Acantex, Cefatral, Biotaxon',
    category: 'Antibiótico Cefalosporina de 3ra Generación',
    species: 'Canino y Felino',
    doseRangeCanine: '20 - 50 mg/kg IV lento / IM cada 12-24 hs',
    doseRangeFeline: '20 - 50 mg/kg IV lento / IM cada 12-24 hs',
    defaultDoseMgKg: 25.0,
    concentrationMgMl: 100,
    routes: 'IV lento (diluido en 15 min), IM (con lidocaína)',
    frequency: 'Cada 12 a 24 horas',
    indications: 'Infecciones bacterianas graves, sepsis, peritonitis, meningitis, infecciones urinarias complicadas.',
    contraindications: 'Hipersensibilidad a betalactámicos/cefalosporinas.',
    warnings: 'Reconstituir 1g en 10ml de agua para inyección o solución salina (100 mg/ml).',
  },
  {
    name: 'Enrofloxacina',
    brandNames: 'Baytril, Floxacin, Enrovet',
    category: 'Antibiótico Fluoroquinolona',
    species: 'Canino y Felino',
    doseRangeCanine: '5.0 - 10.0 mg/kg SC / Oral cada 24 hs',
    doseRangeFeline: '5.0 mg/kg SC / Oral cada 24 hs (máximo estricto)',
    defaultDoseMgKg: 5.0,
    concentrationMgMl: 50,
    routes: 'SC (diluido), Oral, IM',
    frequency: 'Cada 24 horas',
    indications: 'Piodermias profundas, infecciones urinarias, respiratorias y gastrointestinales por Gram negativos.',
    contraindications: 'Cachorros en crecimiento (daño en cartílago articular). Dosis >5 mg/kg en gatos (riesgo de ceguera por retinopatía).',
    warnings: 'En gatos NUNCA superar 5 mg/kg/día por riesgo irreversible de degeneración retiniana.',
  },
  {
    name: 'Ampicilina + Sulbactam',
    brandNames: 'Unasyna, Trifamox, Aminoxidin',
    category: 'Antibiótico Betalactámico + Inhibidor Beta-lactamasas',
    species: 'Canino y Felino',
    doseRangeCanine: '20 - 30 mg/kg IV lento / SC / IM cada 8 hs',
    doseRangeFeline: '20 - 30 mg/kg IV lento / SC / IM cada 8 hs',
    defaultDoseMgKg: 25.0,
    concentrationMgMl: 150,
    routes: 'IV lento, IM, SC',
    frequency: 'Cada 8 horas',
    indications: 'Neumonía bacteriana, peritonitis, heridas contaminadas, profilaxis quirúrgica.',
    contraindications: 'Alergia a penicilinas.',
    warnings: 'Administrar IV en al menos 5-10 minutos para evitar náuseas.',
  },
  {
    name: 'Furosemida',
    brandNames: 'Lasix, Furovet, Diurivet',
    category: 'Diurético de Asa de Henle',
    species: 'Canino y Felino',
    doseRangeCanine: 'Emergencia EAP: 2.0 - 4.0 mg/kg IV cada 1-2 hs. Mant: 1.0 - 2.0 mg/kg cada 8-12 hs',
    doseRangeFeline: 'Emergencia EAP: 1.0 - 2.0 mg/kg IV/IM. Mant: 1.0 mg/kg cada 12-24 hs',
    defaultDoseMgKg: 2.0,
    concentrationMgMl: 50,
    routes: 'IV, IM, SC, Oral',
    frequency: 'Cada 8 a 12 horas (o bolo repetido en crisis)',
    indications: 'Edema agudo de pulmón cardiogénico, insuficiencia cardíaca congestiva descompensada, ascitis.',
    contraindications: 'Anuria por fallo renal obstructivo, deshidratación severa, hipovolemia, hipopotasemia grave.',
    warnings: 'Monitorear electrolitos plasmáticos (K+, Na+) y función renal (Urea/Creatinina).',
  },
];

interface ClinicalCalculatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPatientId?: string;
}

export const ClinicalCalculatorsModal: React.FC<ClinicalCalculatorsModalProps> = ({
  isOpen,
  onClose,
  initialPatientId,
}) => {
  const { patients, showToast } = useVet();

  const [activeTab, setActiveTab] = useState<
    'URGENCIA_RCP' | 'FARMACOS' | 'MANUAL' | 'CUSTOM_FORMULAS' | 'FLUIDOS' | 'CRI' | 'VADEMECUM'
  >('URGENCIA_RCP');

  // Custom Drugs State persisted in localStorage
  const [customDrugs, setCustomDrugs] = useState<VademecumDrug[]>(() => {
    try {
      const saved = localStorage.getItem('vet_custom_vademecum_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading custom drugs:', e);
    }
    return [];
  });

  // Save to localStorage when customDrugs changes
  useEffect(() => {
    try {
      localStorage.setItem('vet_custom_vademecum_v1', JSON.stringify(customDrugs));
    } catch (e) {
      console.error('Error saving custom drugs:', e);
    }
  }, [customDrugs]);

  // Combined Active Drugs Database
  const allDrugs = useMemo(() => {
    return [...customDrugs, ...VADEMECUM_DATABASE];
  }, [customDrugs]);

  // Context Patient & Working Weight
  const [currentPatientId, setCurrentPatientId] = useState<string>(initialPatientId || patients[0]?.id || '');
  const initialPatient = patients.find((p) => p.id === currentPatientId);
  const [weightKg, setWeightKg] = useState<number>(initialPatient ? initialPatient.weight : 10.0);
  const [species, setSpecies] = useState<'Canino' | 'Felino'>('Canino');

  // TAB 1: Selected Preset Drug
  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number>(0);
  const [customDose, setCustomDose] = useState<number>(VADEMECUM_DATABASE[0].defaultDoseMgKg);
  const [customConcentration, setCustomConcentration] = useState<number>(VADEMECUM_DATABASE[0].concentrationMgMl);

  // TAB 2: Calculadora Manual Libre State
  const [manDrugName, setManDrugName] = useState('Medicación Manual / Fórmula Libre');
  const [manDoseValue, setManDoseValue] = useState<number>(10);
  const [manDoseUnit, setManDoseUnit] = useState<'mg/kg' | 'mcg/kg' | 'UI/kg' | 'ml/kg'>('mg/kg');
  const [manConcValue, setManConcValue] = useState<number>(50);
  const [manConcType, setManConcType] = useState<'mg/ml' | 'percentage' | 'tablet_mg'>('mg/ml');
  const [manRoute, setManRoute] = useState('IV Lento / SC');
  const [manFrequency, setManFrequency] = useState('Cada 12 horas');

  // TAB 3: Formulario Cargar Nueva Fórmula / Medicación
  const [newDrugName, setNewDrugName] = useState('');
  const [newBrandNames, setNewBrandNames] = useState('');
  const [newCategory, setNewCategory] = useState('Antibiótico / Terapéutico');
  const [newSpecies, setNewSpecies] = useState<'Canino y Felino' | 'Canino' | 'Felino' | 'Exóticos'>('Canino y Felino');
  const [newDefaultDose, setNewDefaultDose] = useState<number>(10);
  const [newDoseRange, setNewDoseRange] = useState('10 - 20 mg/kg cada 12 hs');
  const [newConcentration, setNewConcentration] = useState<number>(50);
  const [newRoutes, setNewRoutes] = useState('SC, IV lento, Oral');
  const [newFrequency, setNewFrequency] = useState('Cada 12 horas');
  const [newIndications, setNewIndications] = useState('');
  const [newWarnings, setNewWarnings] = useState('');

  // TAB: Fluidoterapia
  const [dehydrationPercent, setDehydrationPercent] = useState<number>(5);
  const [ongoingLossesMl, setOngoingLossesMl] = useState<number>(50);
  const [replacementHours, setReplacementHours] = useState<number>(24);
  const [dropperType, setDropperType] = useState<number>(20);

  // TAB: CRI (FLK)
  const [bagVolumeMl, setBagVolumeMl] = useState<number>(500);
  const [infusionRateMlH, setInfusionRateMlH] = useState<number>(20);
  const [fentanylDoseMcgKgH, setFentanylDoseMcgKgH] = useState<number>(4);
  const [lidocaineDoseMgKgH, setLidocaineDoseMgKgH] = useState<number>(1.5);
  const [ketamineDoseMgKgH, setKetamineDoseMgKgH] = useState<number>(0.6);

  // Vademécum Search
  const [vademecumSearch, setVademecumSearch] = useState('');

  const handlePatientSelect = (patId: string) => {
    triggerHaptic('light');
    setCurrentPatientId(patId);
    const p = patients.find((pat) => pat.id === patId);
    if (p) {
      setWeightKg(p.weight);
      if (p.species === 'FELINO') setSpecies('Felino');
      else setSpecies('Canino');
    }
  };

  const handleSelectPresetDrug = (idx: number) => {
    triggerHaptic('light');
    setSelectedDrugIndex(idx);
    const d = allDrugs[idx] || allDrugs[0];
    setCustomDose(d.defaultDoseMgKg);
    setCustomConcentration(d.concentrationMgMl);
  };

  const selectDrugFromVademecum = (drugName: string) => {
    triggerHaptic('light');
    const idx = allDrugs.findIndex((d) => d.name === drugName);
    if (idx !== -1) {
      handleSelectPresetDrug(idx);
      setActiveTab('FARMACOS');
      showToast('success', 'Fármaco Cargado', `${drugName} listo para cálculo de dosis.`);
    }
  };

  // Crear y Guardar Nuevo Fármaco Personalizado
  const handleSaveCustomDrug = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    if (!newDrugName.trim()) {
      showToast('error', 'Nombre Requerido', 'Por favor indique el nombre del fármaco o fórmula.');
      return;
    }

    const newDrug: VademecumDrug = {
      id: `custom-drug-${Date.now()}`,
      name: newDrugName.trim(),
      brandNames: newBrandNames.trim() || newDrugName.trim(),
      category: newCategory.trim() || 'Fórmula Personalizada',
      species: newSpecies,
      doseRangeCanine: newDoseRange.trim() || `${newDefaultDose} mg/kg`,
      doseRangeFeline: newDoseRange.trim() || `${newDefaultDose} mg/kg`,
      defaultDoseMgKg: Number(newDefaultDose) || 1,
      concentrationMgMl: Number(newConcentration) || 1,
      routes: newRoutes.trim() || 'Oral / SC',
      frequency: newFrequency.trim() || 'Cada 24 hs',
      indications: newIndications.trim() || 'Fórmula profesional personalizada.',
      contraindications: 'Evaluar según criterio médico.',
      warnings: newWarnings.trim() || 'Fórmula cargada por el equipo médico.',
      isCustom: true,
      createdBy: 'Profesional Veterinario',
    };

    setCustomDrugs((prev) => [newDrug, ...prev]);

    showToast('success', 'Fórmula Guardada', `${newDrug.name} se añadió a su vademécum activo.`);

    // Reset Form
    setNewDrugName('');
    setNewBrandNames('');
    setNewIndications('');
    setNewWarnings('');

    // Select the new drug and switch to calculation tab
    setSelectedDrugIndex(0);
    setCustomDose(newDrug.defaultDoseMgKg);
    setCustomConcentration(newDrug.concentrationMgMl);
    setActiveTab('FARMACOS');
  };

  const handleDeleteCustomDrug = (drugId?: string) => {
    if (!drugId) return;
    triggerHaptic('medium');
    setCustomDrugs((prev) => prev.filter((d) => d.id !== drugId));
    showToast('info', 'Fórmula Eliminada', 'Se removió la fórmula personalizada de su lista.');
  };

  // Prellenar Creador desde Calculadora Manual
  const handleTransferManualToCustomCreator = () => {
    triggerHaptic('light');
    setNewDrugName(manDrugName);
    setNewDefaultDose(manDoseValue);
    setNewConcentration(manEffectiveConcMgMl);
    setNewRoutes(manRoute);
    setNewFrequency(manFrequency);
    setActiveTab('CUSTOM_FORMULAS');
    showToast('info', 'Valores Transferidos', 'Complete los datos para guardar la fórmula.');
  };

  // Calculations:
  // 1. Preset Drug Dose
  const currentDrug = allDrugs[selectedDrugIndex] || allDrugs[0] || VADEMECUM_DATABASE[0];
  const totalMgNeeded = customDose * (weightKg || 0);
  const totalMlToAdminister = customConcentration > 0 ? totalMgNeeded / customConcentration : 0;

  // 2. Manual Calculator Calculations
  // Effective Concentration in mg/ml or mg/comp
  const manEffectiveConcMgMl = useMemo(() => {
    if (manConcType === 'percentage') {
      // 1% = 10 mg/ml (ej. 2% = 20 mg/ml, 10% = 100 mg/ml)
      return manConcValue * 10;
    }
    return manConcValue > 0 ? manConcValue : 1;
  }, [manConcValue, manConcType]);

  const manualTotalDose = useMemo(() => {
    return Number(manDoseValue) * (weightKg || 0);
  }, [manDoseValue, weightKg]);

  const manualTotalVolumeMl = useMemo(() => {
    if (manDoseUnit === 'ml/kg') {
      return Number(manDoseValue) * (weightKg || 0);
    }
    if (manConcType === 'tablet_mg') {
      return 0; // It's tablets
    }
    return manEffectiveConcMgMl > 0 ? manualTotalDose / manEffectiveConcMgMl : 0;
  }, [manDoseUnit, manDoseValue, weightKg, manConcType, manEffectiveConcMgMl, manualTotalDose]);

  const manualTotalTablets = useMemo(() => {
    if (manConcType === 'tablet_mg' && manConcValue > 0) {
      return manualTotalDose / manConcValue;
    }
    return 0;
  }, [manConcType, manConcValue, manualTotalDose]);

  const manualDrops = useMemo(() => {
    // 1 ml = ~20 gotas de solución oral
    return Math.round(manualTotalVolumeMl * 20);
  }, [manualTotalVolumeMl]);

  // 3. Fluid Therapy
  const maintenanceMlDay = Math.round(30 * (weightKg || 0) + 70);
  const dehydrationDeficitMl = Math.round(((dehydrationPercent || 0) / 100) * (weightKg || 0) * 1000);
  const totalFluidsInPeriod = maintenanceMlDay + dehydrationDeficitMl + (ongoingLossesMl || 0);
  const rateMlPerHour = replacementHours > 0 ? (totalFluidsInPeriod / replacementHours).toFixed(1) : '0';
  const dropsPerMinute = replacementHours > 0 ? Math.round((Number(rateMlPerHour) * dropperType) / 60) : 0;
  const dropsPerSecondInterval = dropsPerMinute > 0 ? (60 / dropsPerMinute).toFixed(1) : '0';

  // 4. CRI (FLK)
  const bagDurationHours = infusionRateMlH > 0 ? bagVolumeMl / infusionRateMlH : 0;
  const fentanylTotalMcg = fentanylDoseMcgKgH * (weightKg || 0) * bagDurationHours;
  const fentanylMlToAdd = fentanylTotalMcg / 50; // 50 mcg/ml
  const lidocaineTotalMg = lidocaineDoseMgKgH * (weightKg || 0) * bagDurationHours;
  const lidocaineMlToAdd = lidocaineTotalMg / 20; // 2% = 20 mg/ml
  const ketamineTotalMg = ketamineDoseMgKgH * (weightKg || 0) * bagDurationHours;
  const ketamineMlToAdd = ketamineTotalMg / 50; // 50 mg/ml

  // Allergy Check
  const currentPatient = patients.find((p) => p.id === currentPatientId);
  const patientName = currentPatient ? currentPatient.name : 'Paciente';
  const patientAllergies = (currentPatient?.alerts || []).filter((a) => {
    const al = a.toLowerCase();
    return al.includes('alerg') || al.includes('sensib') || al.includes('reac') || al.includes('intol');
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

  const filteredVademecum = allDrugs.filter((d) => {
    const q = vademecumSearch.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.brandNames.toLowerCase().includes(q) ||
      d.category.toLowerCase().includes(q) ||
      d.indications.toLowerCase().includes(q)
    );
  });

  const copyResult = (text: string) => {
    triggerHaptic('light');
    navigator.clipboard.writeText(text);
    showToast('success', 'Copiado al Portapapeles', text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] animate-in zoom-in-95 duration-150">
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
                Cálculo automático de dosis, carga manual de fórmulas y vademécum profesional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
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
              {patients.length === 0 ? (
                <option value="">Modo Libre (Sin paciente cargado)</option>
              ) : (
                patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species} - {p.breed}) — {p.weight} kg
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-xl border border-teal-200 shadow-2xs">
            <span className="font-bold text-slate-700">Peso de Trabajo:</span>
            <input
              type="number"
              step="0.05"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-20 bg-slate-50 border border-slate-300 rounded-lg px-2 py-0.5 text-slate-900 font-mono font-black text-sm text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <span className="font-bold text-slate-700">kg</span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 px-4 sm:px-5 pt-3 gap-2 bg-white overflow-x-auto custom-scrollbar">
          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('URGENCIA_RCP');
            }}
            className={`px-3.5 py-2 text-xs font-black rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'URGENCIA_RCP'
                ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-500/30'
                : 'text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-900 border-b border-rose-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 animate-pulse text-white" />
            <span>🚑 Drogas Urgencia & RCP</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('FARMACOS');
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'FARMACOS'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Pill className="w-4 h-4" />
            <span>Dosis de Fármacos ({allDrugs.length})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('MANUAL');
            }}
            className={`px-3.5 py-2 text-xs font-black rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'MANUAL'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>🧮 Calculadora Manual Libre</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('CUSTOM_FORMULAS');
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CUSTOM_FORMULAS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 bg-emerald-50/70 hover:bg-emerald-100'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>➕ Cargar Mis Fórmulas ({customDrugs.length})</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('FLUIDOS');
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'FLUIDOS'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>Fluidoterapia</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('CRI');
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'CRI'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>CRI (FLK)</span>
          </button>

          <button
            onClick={() => {
              triggerHaptic('light');
              setActiveTab('VADEMECUM');
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'VADEMECUM'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Vademécum</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 custom-scrollbar text-xs">
          {/* TAB 0: URGENCIA & RCP */}
          {activeTab === 'URGENCIA_RCP' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-gradient-to-r from-rose-900 via-rose-800 to-red-900 text-white rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0">
                    <Heart className="w-5 h-5 animate-ping" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-300">
                      Protocolo RECOVER / Guardia 24hs
                    </span>
                    <h4 className="font-black text-sm">
                      Cálculo Inmediato de Resucitación & Emergencias para {patientName} ({weightKg} kg)
                    </h4>
                    <p className="text-[11px] text-rose-200">
                      Volúmenes exactos en ml calculados para administración IV/IO en shock-room
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    copyResult(
                      `URGENCIAS (${patientName} ${weightKg}kg): Adrenalina ${(weightKg * 0.01).toFixed(2)}ml, Atropina ${(weightKg * 0.04).toFixed(2)}ml, Diazepam ${(weightKg * 0.1).toFixed(2)}ml, Naloxona ${(weightKg * 0.1).toFixed(2)}ml.`
                    )
                  }
                  className="px-3 py-2 bg-white text-rose-900 hover:bg-rose-100 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Dosis de Urgencia</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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

          {/* TAB 1: DOSIS DE FÁRMACOS & FÓRMULAS */}
          {activeTab === 'FARMACOS' && (
            <div className="space-y-4">
              {hasPotentialAllergyAlert && (
                <div className="p-3.5 bg-red-50 border-2 border-red-500 text-red-900 rounded-2xl flex items-start gap-3 animate-pulse">
                  <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-xs">¡ADVERTENCIA DE SEGURIDAD FARMACOLÓGICA!</h5>
                    <p className="text-[11px] mt-0.5">
                      El paciente <strong>{patientName}</strong> tiene registrada la siguiente alerta:{' '}
                      <span className="font-bold underline">{patientAllergies.join(', ')}</span>. Verificar contraindicación médica antes de administrar.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Drug Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-700 font-bold block">Fármaco Seleccionado:</label>
                    <span className="text-[10px] text-slate-500">{allDrugs.length} fármacos activos</span>
                  </div>

                  <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-2xl p-1.5 bg-slate-50 space-y-1 custom-scrollbar">
                    {allDrugs.map((d, i) => (
                      <button
                        key={d.id || d.name}
                        onClick={() => handleSelectPresetDrug(i)}
                        className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between cursor-pointer ${
                          selectedDrugIndex === i
                            ? 'bg-teal-600 text-white font-bold shadow-xs'
                            : 'hover:bg-slate-200/70 text-slate-700'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs flex items-center gap-1.5">
                            <span>{d.name}</span>
                            {d.isCustom && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 font-black text-[9px]">
                                🌟 Personalizado
                              </span>
                            )}
                          </div>
                          <div className={`text-[10px] ${selectedDrugIndex === i ? 'text-teal-100' : 'text-slate-400'}`}>
                            {d.category} • {d.defaultDoseMgKg} mg/kg
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
                    <span className="text-[10px] text-slate-400 font-mono">Dosis base: {currentDrug.defaultDoseMgKg} mg/kg</span>
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
                    {patientName} • {weightKg} kg
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
                        `Prescripción para ${patientName} (${weightKg} kg): ${currentDrug.name} ${totalMlToAdminister.toFixed(2)} ml (${totalMgNeeded.toFixed(2)} mg) vía ${currentDrug.routes.split(',')[0]} ${currentDrug.frequency}.`
                      )
                    }
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Prescripción</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CALCULADORA MANUAL LIBRE */}
          {activeTab === 'MANUAL' && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-950 text-white rounded-2xl shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    <h4 className="font-black text-sm text-indigo-200">Calculadora de Dosis Manual & Libre</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-800 px-2 py-0.5 rounded text-indigo-200">
                    Cálculo libre de cualquier fórmula
                  </span>
                </div>
                <p className="text-xs text-indigo-300">
                  Ingrese cualquier fórmula médica arbitraria sin restricciones. El sistema calculará al instante los mg, ml, gotas y comprimidos para {patientName} ({weightKg} kg).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Formulario Manual */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">Parámetros del Medicamento Manual</h4>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Nombre / Concepto del Fármaco:</label>
                    <input
                      type="text"
                      value={manDrugName}
                      onChange={(e) => setManDrugName(e.target.value)}
                      placeholder="Ej: Cefalexina Suspensión"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Dosis Prescrita:</label>
                      <input
                        type="number"
                        step="any"
                        value={manDoseValue}
                        onChange={(e) => setManDoseValue(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Unidad de Dosis:</label>
                      <select
                        value={manDoseUnit}
                        onChange={(e) => setManDoseUnit(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                      >
                        <option value="mg/kg">mg/kg</option>
                        <option value="mcg/kg">mcg/kg (μg/kg)</option>
                        <option value="UI/kg">UI/kg (Unidades Int.)</option>
                        <option value="ml/kg">ml/kg (Volumen directo)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Concentración:</label>
                      <input
                        type="number"
                        step="any"
                        value={manConcValue}
                        onChange={(e) => setManConcValue(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Tipo Concentración:</label>
                      <select
                        value={manConcType}
                        onChange={(e) => setManConcType(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                      >
                        <option value="mg/ml">mg/ml (Líquido)</option>
                        <option value="percentage">% Porcentaje (1% = 10mg/ml)</option>
                        <option value="tablet_mg">mg / comprimido (Sólido)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Vía de Adm.:</label>
                      <input
                        type="text"
                        value={manRoute}
                        onChange={(e) => setManRoute(e.target.value)}
                        placeholder="Ej: Oral, SC, IV"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Frecuencia:</label>
                      <input
                        type="text"
                        value={manFrequency}
                        onChange={(e) => setManFrequency(e.target.value)}
                        placeholder="Ej: Cada 12 horas"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Panel de Resultados Inmediatos */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide">
                        Resultado del Cálculo para {weightKg} kg
                      </span>
                      <span className="text-xs font-mono text-slate-400">{manDrugName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Dosis Total:</span>
                        <strong className="text-lg font-mono font-black text-indigo-300">
                          {manualTotalDose.toFixed(2)} {manDoseUnit.split('/')[0]}
                        </strong>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {weightKg} kg × {manDoseValue} {manDoseUnit}
                        </span>
                      </div>

                      <div className="bg-slate-800/90 p-3 rounded-xl border border-slate-700">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">2. Volumen / Dosis:</span>
                        {manConcType === 'tablet_mg' ? (
                          <strong className="text-lg font-mono font-black text-emerald-400">
                            {manualTotalTablets.toFixed(2)} comp.
                          </strong>
                        ) : (
                          <strong className="text-lg font-mono font-black text-emerald-400">
                            {manualTotalVolumeMl.toFixed(2)} ml
                          </strong>
                        )}
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {manConcType === 'percentage' ? `Conc: ${manEffectiveConcMgMl} mg/ml (${manConcValue}%)` : `Conc: ${manConcValue} ${manConcType}`}
                        </span>
                      </div>
                    </div>

                    {manConcType !== 'tablet_mg' && manualTotalVolumeMl > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 flex items-center justify-between">
                        <span>Equivalente en Gotas (Gotero 20 gts/ml):</span>
                        <strong className="font-mono text-teal-300 text-sm">~{manualDrops} gotas</strong>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() =>
                        copyResult(
                          `Indicación para ${patientName} (${weightKg} kg): ${manDrugName} ${
                            manConcType === 'tablet_mg'
                              ? `${manualTotalTablets.toFixed(2)} comprimido(s)`
                              : `${manualTotalVolumeMl.toFixed(2)} ml (~${manualDrops} gotas)`
                          } (${manualTotalDose.toFixed(2)} ${manDoseUnit.split('/')[0]}) vía ${manRoute} ${manFrequency}.`
                        )
                      }
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copiar Indicación Médica</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTransferManualToCustomCreator}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98 transition-all"
                    >
                      <Star className="w-4 h-4" />
                      <span>Guardar como Fórmula en el Vademécum</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CARGAR MIS FÓRMULAS & MEDICACIÓN PERSONALIZADA */}
          {activeTab === 'CUSTOM_FORMULAS' && (
            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl shadow-md space-y-1">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-300" />
                  <h4 className="font-black text-sm text-emerald-200">
                    Cargar Fórmulas & Medicamentos Propios del Profesional
                  </h4>
                </div>
                <p className="text-xs text-emerald-100">
                  Agregue sus protocolos, antibióticos, analgésicos o preparados magistrales. El sistema recordará sus fórmulas y calculará automáticamente las dosis para cualquier paciente o peso.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Formulario de Carga */}
                <form
                  onSubmit={handleSaveCustomDrug}
                  className="md:col-span-7 bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5 shadow-2xs"
                >
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5 border-b border-slate-200 pb-2">
                    <Plus className="w-4 h-4 text-emerald-600" />
                    <span>Datos de la Nueva Medicación / Fórmula</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Nombre del Principio / Fármaco *</label>
                      <input
                        type="text"
                        required
                        value={newDrugName}
                        onChange={(e) => setNewDrugName(e.target.value)}
                        placeholder="Ej: Ketamina 10% / Butorfanol"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Nombre Comercial / Laboratorio</label>
                      <input
                        type="text"
                        value={newBrandNames}
                        onChange={(e) => setNewBrandNames(e.target.value)}
                        placeholder="Ej: Ketavet, Holliday"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Categoría Farmacológica</label>
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Ej: Sedante / Analgésico"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Especie Destino</label>
                      <select
                        value={newSpecies}
                        onChange={(e) => setNewSpecies(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                      >
                        <option value="Canino y Felino">🐶🐱 Canino y Felino</option>
                        <option value="Canino">🐶 Solo Canino</option>
                        <option value="Felino">🐱 Solo Felino</option>
                        <option value="Exóticos">🦜 Exóticos</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
                    <div>
                      <label className="text-emerald-950 font-bold block mb-1">Dosis Estándar (mg/kg) *</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={newDefaultDose}
                        onChange={(e) => setNewDefaultDose(Number(e.target.value))}
                        placeholder="10"
                        className="w-full bg-white border border-emerald-300 rounded-xl p-2 font-mono font-black text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-emerald-950 font-bold block mb-1">Concentración (mg/ml) *</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={newConcentration}
                        onChange={(e) => setNewConcentration(Number(e.target.value))}
                        placeholder="50"
                        className="w-full bg-white border border-emerald-300 rounded-xl p-2 font-mono font-black text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Vías de Administración</label>
                      <input
                        type="text"
                        value={newRoutes}
                        onChange={(e) => setNewRoutes(e.target.value)}
                        placeholder="Ej: IV lento, SC, Oral"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">Frecuencia / Intervalo</label>
                      <input
                        type="text"
                        value={newFrequency}
                        onChange={(e) => setNewFrequency(e.target.value)}
                        placeholder="Ej: Cada 12 horas"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 font-medium text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Indicaciones & Notas de Uso</label>
                    <textarea
                      rows={2}
                      value={newIndications}
                      onChange={(e) => setNewIndications(e.target.value)}
                      placeholder="Ej: Inducción anestésica o manejo del dolor agudo"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-slate-900"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar Fórmula en Mi Vademécum</span>
                  </button>
                </form>

                {/* Lista de Fórmulas Propias */}
                <div className="md:col-span-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-800 text-xs">Mis Fórmulas Guardadas ({customDrugs.length})</h4>
                    <span className="text-[10px] text-slate-500">Guardado Permanente</span>
                  </div>

                  {customDrugs.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-2 text-slate-500">
                      <Pill className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="font-bold text-xs">Aún no tiene fórmulas personalizadas</p>
                      <p className="text-[11px]">
                        Utilice el formulario de la izquierda para registrar sus medicamentos y concentraciones habituales.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[440px] overflow-y-auto custom-scrollbar">
                      {customDrugs.map((d) => (
                        <div
                          key={d.id || d.name}
                          className="bg-white p-3 rounded-2xl border border-emerald-200/90 shadow-2xs space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <strong className="text-xs text-slate-900 block">{d.name}</strong>
                              <span className="text-[10px] text-slate-500 block">
                                {d.category} • {d.brandNames}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomDrug(d.id)}
                              className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                              title="Eliminar fórmula"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="bg-emerald-50/70 p-2 rounded-xl text-[11px] font-mono flex items-center justify-between text-emerald-950">
                            <span>Dosis: <strong>{d.defaultDoseMgKg} mg/kg</strong></span>
                            <span>Conc: <strong>{d.concentrationMgMl} mg/ml</strong></span>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <span className="text-slate-500 font-sans">{d.frequency}</span>
                            <button
                              type="button"
                              onClick={() => selectDrugFromVademecum(d.name)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                            >
                              <span>Calcular</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FLUIDOTERAPIA */}
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
                        className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                          species === 'Canino' ? 'bg-teal-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                        }`}
                      >
                        🐶 Canino
                      </button>
                      <button
                        onClick={() => setSpecies('Felino')}
                        className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
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
                      Plan de Infusión IV para {patientName} ({weightKg} kg)
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

          {/* TAB 5: CRI */}
          {activeTab === 'CRI' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs">Parámetros de la Solución de Infusión (FLK)</h4>

                  <div>
                    <label className="text-slate-600 block mb-1">Volumen de la Bolsa (ml):</label>
                    <select
                      value={bagVolumeMl}
                      onChange={(e) => setBagVolumeMl(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900"
                    >
                      <option value={250}>250 ml (NaCl / Ringer Lactato)</option>
                      <option value={500}>500 ml (NaCl / Ringer Lactato)</option>
                      <option value={1000}>1000 ml (NaCl / Ringer Lactato)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-600 block mb-1">Velocidad de Infusión Programada (ml/h):</label>
                    <input
                      type="number"
                      value={infusionRateMlH}
                      onChange={(e) => setInfusionRateMlH(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <h5 className="font-bold text-slate-700 text-xs">Dosis Deseadas de los Fármacos:</h5>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span>Fentanilo (mcg/kg/h):</span>
                        <input
                          type="number"
                          step="0.5"
                          value={fentanylDoseMcgKgH}
                          onChange={(e) => setFentanylDoseMcgKgH(Number(e.target.value))}
                          className="w-20 bg-white border border-slate-300 rounded-lg p-1 text-center font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span>Lidocaína 2% (mg/kg/h):</span>
                        <input
                          type="number"
                          step="0.1"
                          value={lidocaineDoseMgKgH}
                          onChange={(e) => setLidocaineDoseMgKgH(Number(e.target.value))}
                          className="w-20 bg-white border border-slate-300 rounded-lg p-1 text-center font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span>Ketamina 5% (mg/kg/h):</span>
                        <input
                          type="number"
                          step="0.1"
                          value={ketamineDoseMgKgH}
                          onChange={(e) => setKetamineDoseMgKgH(Number(e.target.value))}
                          className="w-20 bg-white border border-slate-300 rounded-lg p-1 text-center font-mono font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CRI Prep Sheet */}
                <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg space-y-3 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-400 tracking-wider">
                      Receta de Preparación en Bolsa para {patientName} ({weightKg} kg)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Duración estimada de la bolsa de {bagVolumeMl} ml a {infusionRateMlH} ml/h:{' '}
                      <strong className="text-teal-300">{bagDurationHours.toFixed(1)} horas</strong>
                    </p>

                    <div className="space-y-2 mt-4 text-xs font-mono">
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-300">1. Fentanilo (50 mcg/ml):</span>
                          <strong className="text-teal-300 text-sm">{fentanylMlToAdd.toFixed(2)} ml</strong>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Total: {fentanylTotalMcg.toFixed(1)} mcg a agregar a la bolsa
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-300">2. Lidocaína 2% (20 mg/ml):</span>
                          <strong className="text-teal-300 text-sm">{lidocaineMlToAdd.toFixed(2)} ml</strong>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Total: {lidocaineTotalMg.toFixed(1)} mg a agregar a la bolsa
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-300">3. Ketamina 5% (50 mg/ml):</span>
                          <strong className="text-teal-300 text-sm">{ketamineMlToAdd.toFixed(2)} ml</strong>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Total: {ketamineTotalMg.toFixed(1)} mg a agregar a la bolsa
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      copyResult(
                        `Receta CRI (FLK) para ${patientName} (${weightKg} kg): En bolsa de ${bagVolumeMl} ml a ${infusionRateMlH} ml/h agregar: Fentanilo ${fentanylMlToAdd.toFixed(2)} ml, Lidocaína 2% ${lidocaineMlToAdd.toFixed(2)} ml, Ketamina 5% ${ketamineMlToAdd.toFixed(2)} ml.`
                      )
                    }
                    className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Preparación de Bolsa</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: VADEMECUM COMPLETO */}
          {activeTab === 'VADEMECUM' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vademecumSearch}
                    onChange={(e) => setVademecumSearch(e.target.value)}
                    placeholder="Buscar fármaco, indicación o principio activo..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto custom-scrollbar">
                {filteredVademecum.map((drug) => (
                  <div
                    key={drug.id || drug.name}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-teal-300 shadow-2xs space-y-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-slate-900 text-sm">{drug.name}</h4>
                          {drug.isCustom && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 font-black text-[9px]">
                              🌟 Propio
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500">{drug.brandNames}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {drug.species}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                      <p>
                        <strong className="text-slate-700">Categoría:</strong> {drug.category}
                      </p>
                      <p>
                        <strong className="text-slate-700">Dosis Canino:</strong> {drug.doseRangeCanine}
                      </p>
                      <p>
                        <strong className="text-slate-700">Dosis Felino:</strong> {drug.doseRangeFeline}
                      </p>
                      <p>
                        <strong className="text-slate-700">Conc. Estándar:</strong> {drug.concentrationMgMl} mg/ml
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2">{drug.indications}</p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500">{drug.routes}</span>
                      <button
                        onClick={() => selectDrugFromVademecum(drug.name)}
                        className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <span>Calcular Dosis</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Veterinaria Irusta • Módulo de Cálculo Farmacológico Seguro</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
