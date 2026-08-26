import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  X,
  Droplet,
  Pill,
  Sliders,
  Star,
  Copy,
  Trash2,
  Save,
  MessageCircle,
  Zap,
  FileText,
  Info,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { triggerHaptic } from '../utils/haptics';

export interface VademecumDrug {
  id?: string;
  name: string;
  brandNames: string;
  category: string;
  species: 'Canino y Felino' | 'Canino' | 'Felino' | 'Equino' | 'Bovino' | 'Equino y Bovino' | 'Exóticos';
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
    name: 'Flunixin Meglumina',
    brandNames: 'Banamine, Flunimax, Finadyne, Megluvet',
    category: 'AINE Antiendotóxico / Analgésico Visceral',
    species: 'Equino y Bovino',
    doseRangeCanine: 'Equino: 1.1 mg/kg IV/IM cada 24h. Bovino: 1.1 - 2.2 mg/kg IV cada 24h',
    doseRangeFeline: '1.1 mg/kg IV cada 24h',
    defaultDoseMgKg: 1.1,
    concentrationMgMl: 50,
    routes: 'IV lento (preferente en equino), IM',
    frequency: 'Cada 24 horas (máx 5 días consecutivos)',
    indications: 'Cólico equino, dolor visceral agudo, endotoxemia, miositis, afecciones inflamatorias agudas musculoesqueléticas.',
    contraindications: 'Insuficiencia renal, deshidratación grave, úlcera gástrica, inyección intraarterial.',
    warnings: 'En cólico equino aplicar siempre IV lenta. Evitar inyección IM por riesgo de miositis por clostridios.',
  },
  {
    name: 'Fenilbutazona',
    brandNames: 'Butazolidina, Butasol, Fenilvet 20%',
    category: 'AINE Músculo-esquelético Equino',
    species: 'Equino',
    doseRangeCanine: 'Inicio: 4.4 mg/kg IV lento Día 1. Mant: 2.2 mg/kg IV/Oral cada 12-24h',
    doseRangeFeline: '2.2 mg/kg IV lento',
    defaultDoseMgKg: 4.4,
    concentrationMgMl: 200,
    routes: 'IV lento estricto, Oral',
    frequency: 'Cada 12 a 24 horas con alimento',
    indications: 'Laminitis aguda y crónica, artritis, osteoartritis, tendinitis, dolor musculoesquelético equino severo.',
    contraindications: 'PROHIBIDA vía IM o SC (necrosis tisular grave). No administrar en equinos destinados a consumo humano.',
    warnings: 'Inyección estrictamente endovenosa con verificación previa de flujo venoso por aguja.',
  },
  {
    name: 'Xilacina 10% (Grandes Animales)',
    brandNames: 'Rompun 10%, Sedazine 10%, Xila-100',
    category: 'Sedante / Analgésico Agonista Alfa-2 Adrenérgico',
    species: 'Equino y Bovino',
    doseRangeCanine: 'Equino: 0.5 - 1.1 mg/kg IV / 1.0 - 2.0 mg/kg IM. Bovino: 0.05 - 0.1 mg/kg IV/IM',
    doseRangeFeline: '0.5 - 1.1 mg/kg IV',
    defaultDoseMgKg: 1.0,
    concentrationMgMl: 100,
    routes: 'IV lenta, IM',
    frequency: 'Dosis única para sedación, premedicación quirúrgica o manejo de cólico',
    indications: 'Sedación profunda, relajación muscular y analgesia en procedimientos clínicos, cólicos y premedicación anestésica.',
    contraindications: 'Cardiopatías descompensadas, tercer trimestre de gestación en bovinos (efecto oxitócico / aborto).',
    warnings: 'Los bovinos son 10 veces más sensibles que los equinos (usar 1/10 de la dosis equina). Reversible con Yohimbina / Atipamezol.',
  },
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
    name: 'Cefazolina',
    brandNames: 'Cefacidal, Cefamed, Cefazol',
    category: 'Antibiótico Cefalosporina de 1ra Generación',
    species: 'Canino y Felino',
    doseRangeCanine: '20 - 30 mg/kg IV lento cada 8 hs',
    doseRangeFeline: '20 - 30 mg/kg IV lento cada 8 hs',
    defaultDoseMgKg: 25.0,
    concentrationMgMl: 100,
    routes: 'IV lento, IM, SC',
    frequency: 'Cada 8 horas',
    indications: 'Profilaxis quirúrgica pre y postoperatoria, infecciones cutáneas y tejidos blandos.',
    contraindications: 'Hipersensibilidad a cefalosporinas o betalactámicos.',
    warnings: 'Administrar IV lento diluido en solución fisiológica.',
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
  const { patients, showToast, openWhatsAppHub } = useVet();

  // Custom Drugs State persisted in localStorage
  const [customDrugs, setCustomDrugs] = useState<VademecumDrug[]>(() => {
    try {
      const saved = localStorage.getItem('vet_custom_vademecum_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('vet_custom_vademecum_v1', JSON.stringify(customDrugs));
    } catch {
      // ignore
    }
  }, [customDrugs]);

  const allDrugs = useMemo(() => {
    return [...customDrugs, ...VADEMECUM_DATABASE];
  }, [customDrugs]);

  const [currentPatientId, setCurrentPatientId] = useState<string>(initialPatientId || patients[0]?.id || '');
  const activePatient = useMemo(() => patients.find((p) => p.id === currentPatientId) || patients[0], [patients, currentPatientId]);
  const [weightKg, setWeightKg] = useState<number>(activePatient ? activePatient.weight || 10.0 : 10.0);
  const [species, setSpecies] = useState<'Canino' | 'Felino' | 'Equino' | 'Bovino'>(
    activePatient?.species === 'FELINO' ? 'Felino' : activePatient?.species === 'EQUINO' ? 'Equino' : activePatient?.species === 'BOVINO' ? 'Bovino' : 'Canino'
  );

  const handlePatientSelect = (patId: string) => {
    triggerHaptic('light');
    setCurrentPatientId(patId);
    const p = patients.find((pat) => pat.id === patId);
    if (p) {
      setWeightKg(p.weight || 10.0);
      if (p.species === 'FELINO') setSpecies('Felino');
      else if (p.species === 'EQUINO') setSpecies('Equino');
      else if (p.species === 'BOVINO') setSpecies('Bovino');
      else setSpecies('Canino');
    }
  };

  const [mode, setMode] = useState<'DIRECT' | 'CRI'>('DIRECT');

  const [drugName, setDrugName] = useState('Tramadol');
  const [brandNames, setBrandNames] = useState('Tramavet, Nobligan, Algesic');
  const [category, setCategory] = useState('Analgésico Opioide Atípico');
  const [doseRange, setDoseRange] = useState('2.0 - 5.0 mg/kg IV / SC / Oral cada 8-12 hs');
  const [warnings, setWarnings] = useState('Administrar IV muy lentamente para evitar náuseas o excitación.');
  const [indications, setIndications] = useState('Dolor moderado a severo visceral, articular o posquirúrgico.');

  const [doseValue, setDoseValue] = useState<number>(3.0);
  const [doseUnit, setDoseUnit] = useState<'mg/kg' | 'mcg/kg' | 'UI/kg' | 'ml/kg' | 'mg_fijo'>('mg/kg');
  const [concValue, setConcValue] = useState<number>(50);
  const [concType, setConcType] = useState<'mg/ml' | 'percentage' | 'tablet_mg'>('mg/ml');
  const [route, setRoute] = useState('IV Lento');
  const [frequency, setFrequency] = useState('Cada 8 horas');
  const [dilution, setDilution] = useState('Diluir en 10 ml de Solución Fisiológica 0.9% / Infundir en 15 minutos');

  const [criDoseValue, setCriDoseValue] = useState<number>(4.0);
  const [criDoseUnit, setCriDoseUnit] = useState<'mcg/kg/min' | 'mg/kg/h' | 'mg/kg/day' | 'mcg/kg/h'>('mcg/kg/min');
  const [criConcMgMl, setCriConcMgMl] = useState<number>(50);
  const [criBagVolumeMl, setCriBagVolumeMl] = useState<number>(500);
  const [criInfusionRateMlH, setCriInfusionRateMlH] = useState<number>(20);
  const [criVehicle, setCriVehicle] = useState('Solución Fisiológica 0.9%');

  const QUICK_PRESETS = [
    { name: 'Tramadol', dose: 3.0, conc: 50, route: 'IV Lento', freq: 'Cada 8 horas', cat: 'Analgésico Opioide' },
    { name: 'Meloxicam', dose: 0.2, conc: 5, route: 'SC / Oral', freq: 'Cada 24 horas', cat: 'AINE COX-2' },
    { name: 'Cefazolina', dose: 25.0, conc: 100, route: 'IV Lento', freq: 'Cada 8 horas', cat: 'Antibiótico Profiláctico' },
    { name: 'Maropitant', dose: 1.0, conc: 10, route: 'SC / IV Lento', freq: 'Cada 24 horas', cat: 'Antiemético NK-1' },
    { name: 'Dipirona', dose: 25.0, conc: 500, route: 'IV Lento / SC', freq: 'Cada 8 horas', cat: 'Analgésico / Antipirético' },
    { name: 'Metoclopramida', dose: 0.5, conc: 5, route: 'SC / IV Lento', freq: 'Cada 8 horas', cat: 'Procinético' },
    { name: 'Dexametasona', dose: 0.2, conc: 2, route: 'IV / SC', freq: 'Cada 24 horas', cat: 'Corticoide' },
    { name: 'Furosemida', dose: 2.0, conc: 50, route: 'IV / SC', freq: 'Cada 8-12 horas', cat: 'Diurético' },
    { name: 'Adrenalina RCP', dose: 0.01, conc: 1, route: 'IV / IO / IT', freq: 'Cada 3-5 min en RCP', cat: 'Emergencia RCP' },
    { name: 'Atropina', dose: 0.04, conc: 1, route: 'IV / SC', freq: 'Dosis única', cat: 'Anticolinérgico' },
    { name: 'Flunixin Meglumina', dose: 1.1, conc: 50, route: 'IV Lento', freq: 'Cada 24 horas', cat: 'AINE Equino/Bovino' },
    { name: 'Xilacina 10%', dose: 1.0, conc: 100, route: 'IV Lento', freq: 'Dosis única', cat: 'Sedante Alfa-2' },
  ];

  const handleSelectQuickPreset = (preset: typeof QUICK_PRESETS[0]) => {
    triggerHaptic('light');
    setDrugName(preset.name);
    setCategory(preset.cat);
    setDoseValue(preset.dose);
    setDoseUnit('mg/kg');
    setConcValue(preset.conc);
    setConcType('mg/ml');
    setRoute(preset.route);
    setFrequency(preset.freq);

    const found = allDrugs.find((d) => d.name.toLowerCase().includes(preset.name.toLowerCase()));
    if (found) {
      setBrandNames(found.brandNames || '');
      setDoseRange(species === 'Felino' ? found.doseRangeFeline : found.doseRangeCanine);
      setWarnings(found.warnings || '');
      setIndications(found.indications || '');
    }
  };

  const handleSelectFromVademecum = (drug: VademecumDrug) => {
    triggerHaptic('light');
    setDrugName(drug.name);
    setBrandNames(drug.brandNames || '');
    setCategory(drug.category || 'Terapéutico');
    setDoseValue(drug.defaultDoseMgKg || 10);
    setDoseUnit('mg/kg');
    setConcValue(drug.concentrationMgMl || 50);
    setConcType('mg/ml');
    setRoute(drug.routes?.split(',')[0] || 'IV Lento');
    setFrequency(drug.frequency || 'Cada 12 horas');
    setDoseRange(species === 'Felino' ? drug.doseRangeFeline : drug.doseRangeCanine);
    setWarnings(drug.warnings || '');
    setIndications(drug.indications || '');
  };

  const [showSavedList, setShowSavedList] = useState(false);

  const effectiveConcMgMl = useMemo(() => {
    if (concType === 'percentage') return concValue * 10;
    if (concType === 'tablet_mg') return concValue || 1;
    return concValue || 1;
  }, [concValue, concType]);

  const directCalculations = useMemo(() => {
    const w = Number(weightKg) || 1;
    let totalDose = 0;
    let unitLabel = 'mg';

    if (doseUnit === 'mg/kg') {
      totalDose = w * doseValue;
      unitLabel = 'mg';
    } else if (doseUnit === 'mcg/kg') {
      totalDose = w * doseValue;
      unitLabel = 'mcg';
    } else if (doseUnit === 'UI/kg') {
      totalDose = w * doseValue;
      unitLabel = 'UI';
    } else if (doseUnit === 'ml/kg') {
      totalDose = w * doseValue;
      unitLabel = 'ml';
    } else if (doseUnit === 'mg_fijo') {
      totalDose = doseValue;
      unitLabel = 'mg';
    }

    let volumeMl = 0;
    let tabletCount = 0;

    if (doseUnit === 'ml/kg') {
      volumeMl = totalDose;
    } else if (concType === 'tablet_mg') {
      tabletCount = totalDose / (concValue || 1);
      volumeMl = 0;
    } else if (doseUnit === 'mcg/kg') {
      volumeMl = (totalDose / 1000) / effectiveConcMgMl;
    } else if (doseUnit === 'UI/kg') {
      volumeMl = totalDose / effectiveConcMgMl;
    } else {
      volumeMl = totalDose / effectiveConcMgMl;
    }

    const dropsMacro = Math.round(volumeMl * 20);
    const dropsMicro = Math.round(volumeMl * 60);

    return {
      totalDose,
      unitLabel,
      volumeMl,
      tabletCount,
      dropsMacro,
      dropsMicro,
    };
  }, [weightKg, doseValue, doseUnit, concValue, concType, effectiveConcMgMl]);

  const criCalculations = useMemo(() => {
    const w = Number(weightKg) || 1;
    let mgPerHour = 0;

    if (criDoseUnit === 'mcg/kg/min') {
      mgPerHour = (criDoseValue * w * 60) / 1000;
    } else if (criDoseUnit === 'mg/kg/h') {
      mgPerHour = criDoseValue * w;
    } else if (criDoseUnit === 'mg/kg/day') {
      mgPerHour = (criDoseValue * w) / 24;
    } else if (criDoseUnit === 'mcg/kg/h') {
      mgPerHour = (criDoseValue * w) / 1000;
    }

    const bagVol = Number(criBagVolumeMl) || 500;
    const rateMlH = Number(criInfusionRateMlH) || 20;
    const hoursSachet = rateMlH > 0 ? bagVol / rateMlH : 24;
    const totalMgInBag = mgPerHour * hoursSachet;
    const conc = Number(criConcMgMl) || 50;
    const drugVolumeToAddMl = conc > 0 ? totalMgInBag / conc : 0;
    const dropsPerMin = Math.round((rateMlH * 20) / 60);

    return {
      mgPerHour,
      hoursSachet,
      totalMgInBag,
      drugVolumeToAddMl,
      dropsPerMin,
    };
  }, [weightKg, criDoseValue, criDoseUnit, criBagVolumeMl, criInfusionRateMlH, criConcMgMl]);

  const indicationText = useMemo(() => {
    const patName = activePatient?.name || 'Paciente';
    const dateStr = new Date().toLocaleDateString('es-AR');
    const timeStr = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    if (mode === 'DIRECT') {
      return [
        '📋 PROTOCOLO DE INDICACIÓN MÉDICA — CLÍNICA VETERINARIA IRUSTA',
        'Paciente: ' + patName + ' (' + species + ' • ' + weightKg + ' kg) | Emisión: ' + dateStr + ' ' + timeStr + ' hs',
        '--------------------------------------------------',
        '• Medicación: ' + drugName + ' (' + concValue + ' ' + (concType === 'percentage' ? '%' : concType === 'tablet_mg' ? 'mg/comp' : 'mg/ml') + ')',
        '• Dosis Prescrita: ' + doseValue + ' ' + doseUnit,
        '• Dosis Total Calculada: ' + directCalculations.totalDose.toFixed(2) + ' ' + directCalculations.unitLabel,
        '• ' + (concType === 'tablet_mg' ? 'Cantidad a Administrar: ' + directCalculations.tabletCount.toFixed(1) + ' comprimido(s)' : 'Volumen a Administrar: ' + directCalculations.volumeMl.toFixed(2) + ' ml (~' + directCalculations.dropsMacro + ' gotas)'),
        '• Vía de Administración: ' + route,
        '• Frecuencia / Intervalo: ' + frequency,
        dilution ? '• Indicaciones / Dilución: ' + dilution : '',
        '--------------------------------------------------',
        'Dirección Médica: Dr. Diego Iván Irusta — Matrícula: M.P. 502',
      ].filter(Boolean).join('\n');
    }

    return [
      '💧 PROTOCOLO DE INFUSIÓN CONTINUA (CRI) — CLÍNICA VETERINARIA IRUSTA',
      'Paciente: ' + patName + ' (' + species + ' • ' + weightKg + ' kg) | Emisión: ' + dateStr + ' ' + timeStr + ' hs',
      '--------------------------------------------------',
      '• Fármaco / Principio Activo: ' + drugName + ' (Conc: ' + criConcMgMl + ' mg/ml)',
      '• Tasa Prescrita: ' + criDoseValue + ' ' + criDoseUnit + ' (Entrega al paciente: ' + criCalculations.mgPerHour.toFixed(2) + ' mg/hora)',
      '• Preparación en Sachet: Adicionar ' + criCalculations.drugVolumeToAddMl.toFixed(2) + ' ml (' + criCalculations.totalMgInBag.toFixed(2) + ' mg de fármaco) en Sachet de ' + criBagVolumeMl + ' ml de ' + criVehicle,
      '• Ritmo de Bomba / Infusión: ' + criInfusionRateMlH + ' ml/hora (~' + criCalculations.dropsPerMin + ' gotas/minuto en macrogotero)',
      '• Duración Estimada del Sachet: ' + criCalculations.hoursSachet.toFixed(1) + ' horas',
      '--------------------------------------------------',
      'Dirección Médica: Dr. Diego Iván Irusta — Matrícula: M.P. 502',
    ].join('\n');
  }, [
    mode,
    activePatient,
    species,
    weightKg,
    drugName,
    concValue,
    concType,
    doseValue,
    doseUnit,
    directCalculations,
    route,
    frequency,
    dilution,
    criDoseValue,
    criDoseUnit,
    criConcMgMl,
    criCalculations,
    criBagVolumeMl,
    criVehicle,
    criInfusionRateMlH,
  ]);

  const handleCopyIndication = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(indicationText);
    showToast('success', 'Indicación Copiada', 'Texto de indicación formal copiado al portapapeles.');
  };

  const handleSaveCustomFormula = () => {
    triggerHaptic('medium');
    const newFormula: VademecumDrug = {
      id: 'custom-' + Date.now(),
      name: drugName.trim() || 'Fórmula Personalizada',
      brandNames: brandNames || 'Formulación Institucional',
      category: category || 'Protocolo Personalizado',
      species: species === 'Felino' ? 'Felino' : species === 'Equino' || species === 'Bovino' ? 'Equino y Bovino' : 'Canino y Felino',
      doseRangeCanine: doseValue + ' ' + doseUnit + ' (' + frequency + ')',
      doseRangeFeline: doseValue + ' ' + doseUnit + ' (' + frequency + ')',
      defaultDoseMgKg: doseUnit === 'mg/kg' ? doseValue : 1.0,
      concentrationMgMl: effectiveConcMgMl,
      routes: route,
      frequency: frequency,
      indications: indications || 'Protocolo terapéutico institucional.',
      contraindications: 'Según criterio médico veterinario.',
      warnings: warnings || dilution || 'Uso hospitalario supervisado.',
      isCustom: true,
    };

    setCustomDrugs((prev) => [newFormula, ...prev]);
    showToast('success', 'Protocolo Guardado', '"' + newFormula.name + '" añadido a los protocolos de la clínica.');
  };

  const handleDeleteCustomFormula = (id?: string) => {
    triggerHaptic('light');
    if (!id) return;
    setCustomDrugs((prev) => prev.filter((d) => d.id !== id));
    showToast('info', 'Fórmula Eliminada', 'Protocolo removido del vademécum personalizado.');
  };

  const handleShareWhatsApp = () => {
    triggerHaptic('light');
    if (activePatient?.ownerId) {
      openWhatsAppHub({
        patientId: activePatient.id,
        ownerId: activePatient.ownerId,
        patientName: activePatient.name,
        ownerName: 'Tutor',
        ownerPhone: '',
        type: 'INTERNACION',
        details: {
          supplyName: 'Indicación Médica de ' + drugName,
          supplyAmount: 0,
        },
      });
    } else {
      navigator.clipboard.writeText(indicationText);
      showToast('info', 'Texto Copiado', 'Pegá la indicación directamente en WhatsApp.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#F9F8F5] text-[#1C2B1D] rounded-3xl shadow-2xl max-w-6xl w-full max-h-[96vh] flex flex-col overflow-hidden border border-[#E8E3D9]">
        
        {/* 🌟 1. INSTITUTIONAL HEADER & CONTEXT BAR */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E8E3D9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-xs">
              <Calculator className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black font-serif text-slate-900">
                  Calculadora Farmacológica & Protocolos Médicos
                </h3>
                <span className="text-[10px] font-bold bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full border border-teal-200">
                  MÓDULO UNIFICADO
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Cálculo de dosis, fórmulas libres, infusiones continuas (CRI) e indicaciones institucionales
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSavedList(!showSavedList)}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 text-amber-600" />
              <span>Mis Protocolos ({customDrugs.length})</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 🌟 2. PATIENT CONTEXT & QUICK SELECTION BAR */}
        <div className="p-3.5 sm:p-4 bg-[#EFECE3] border-b border-[#E8E3D9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Patient Context Dropdown */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-[#DDD7C8] shadow-2xs">
              <span className="text-xs font-bold text-slate-500">Paciente:</span>
              <select
                value={currentPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="text-xs font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species} • {p.breed || 'Mestizo'}) — {p.weight} kg
                  </option>
                ))}
              </select>
            </div>

            {/* Editable Working Weight */}
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-[#DDD7C8] shadow-2xs">
              <span className="text-xs font-bold text-slate-500">Peso de Trabajo:</span>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                className="w-16 text-xs font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200 text-center focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
              <span className="text-xs font-bold text-slate-700">kg</span>
            </div>

            {/* Species Selector */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-[#DDD7C8]">
              {(['Canino', 'Felino', 'Equino', 'Bovino'] as const).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setSpecies(sp);
                  }}
                  className={'px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ' + (
                    species === sp
                      ? 'bg-teal-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  )}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-2xl border border-slate-300">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setMode('DIRECT');
              }}
              className={'px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ' + (
                mode === 'DIRECT'
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white/60'
              )}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>Dosis Directa / Bolo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setMode('CRI');
              }}
              className={'px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ' + (
                mode === 'CRI'
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white/60'
              )}
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>Infusión Continua (CRI)</span>
            </button>
          </div>
        </div>

        {/* 🌟 3. QUICK HOSPITAL PROTOCOLS CHIPS */}
        <div className="px-4 py-2 bg-white border-b border-[#E8E3D9] flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Fórmulas Rápidas:</span>
          </span>
          {QUICK_PRESETS.map((qp) => (
            <button
              key={qp.name}
              type="button"
              onClick={() => handleSelectQuickPreset(qp)}
              className={'px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex-shrink-0 cursor-pointer border ' + (
                drugName.toLowerCase() === qp.name.toLowerCase()
                  ? 'bg-teal-700 text-white border-teal-800 shadow-2xs'
                  : 'bg-[#F9F8F5] text-slate-700 border-[#DDD7C8] hover:bg-teal-50 hover:text-teal-900'
              )}
            >
              {qp.name} ({qp.dose} mg/kg)
            </button>
          ))}
        </div>

        {/* 🌟 4. MAIN WORKSTATION (2 COLUMNS) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT COLUMN: FORMULA & DRUG PARAMETERS (7 COLS) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-[#E8E3D9] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-700" />
                  <h4 className="text-sm font-black font-serif text-slate-900">
                    {mode === 'DIRECT' ? 'Parámetros del Fármaco & Dosis Directa' : 'Parámetros de Infusión Continua (CRI / Suero)'}
                  </h4>
                </div>

                {/* Vademecum Autocomplete / Search */}
                <div className="relative">
                  <select
                    onChange={(e) => {
                      const sel = allDrugs.find((d) => d.name === e.target.value);
                      if (sel) handleSelectFromVademecum(sel);
                    }}
                    className="text-xs bg-teal-50 text-teal-900 font-bold px-2.5 py-1 rounded-xl border border-teal-200 focus:outline-none cursor-pointer"
                  >
                    <option value="">🔍 Vademécum ({allDrugs.length} fármacos)...</option>
                    {allDrugs.map((d) => (
                      <option key={d.name} value={d.name}>
                        {d.name} — {d.category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fármaco Nombre & Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Nombre del Medicamento / Fórmula:
                  </label>
                  <input
                    type="text"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    placeholder="Ej: Tramadol, Cefazolina, Enrofloxacina..."
                    className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Categoría / Presentación Comercial:
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ej: Analgésico Opioide / Ampollas 50mg"
                    className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* === MODE: DIRECT DOSE === */}
              {mode === 'DIRECT' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Dosis Prescrita */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Dosis Prescrita & Unidad:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={doseValue}
                          onChange={(e) => setDoseValue(parseFloat(e.target.value) || 0)}
                          className="w-1/2 bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                        <select
                          value={doseUnit}
                          onChange={(e) => setDoseUnit(e.target.value as any)}
                          className="w-1/2 bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
                        >
                          <option value="mg/kg">mg/kg</option>
                          <option value="mcg/kg">mcg/kg</option>
                          <option value="UI/kg">UI/kg</option>
                          <option value="ml/kg">ml/kg</option>
                          <option value="mg_fijo">Dosis Fija (mg)</option>
                        </select>
                      </div>
                    </div>

                    {/* Concentración */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Concentración del Fármaco:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={concValue}
                          onChange={(e) => setConcValue(parseFloat(e.target.value) || 0)}
                          className="w-1/2 bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                        <select
                          value={concType}
                          onChange={(e) => setConcType(e.target.value as any)}
                          className="w-1/2 bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
                        >
                          <option value="mg/ml">mg/ml (Líquido)</option>
                          <option value="percentage">% Porcentaje</option>
                          <option value="tablet_mg">mg / Comprimido</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Vía de Administración */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Vía de Administración:
                      </label>
                      <input
                        type="text"
                        value={route}
                        onChange={(e) => setRoute(e.target.value)}
                        placeholder="IV Lento, SC, IM, Oral, IO..."
                        className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>

                    {/* Frecuencia / Intervalo */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Frecuencia / Intervalo:
                      </label>
                      <input
                        type="text"
                        value={frequency}
                        onChange={(e) => setFrequency(e.target.value)}
                        placeholder="Cada 8 horas, Cada 12 horas, Cada 24 horas..."
                        className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  {/* Dilución / Notas */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Dilución / Instrucción Específica para Enfermería:
                    </label>
                    <input
                      type="text"
                      value={dilution}
                      onChange={(e) => setDilution(e.target.value)}
                      placeholder="Ej: Diluir en 10 ml de Solución Fisiológica 0.9% / Administrar en 15 minutos"
                      className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                    />
                  </div>
                </div>
              )}

              {/* === MODE: CONTINUOUS RATE INFUSION (CRI) === */}
              {mode === 'CRI' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Tasa Prescrita */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Tasa de Dosis CRI:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={criDoseValue}
                          onChange={(e) => setCriDoseValue(parseFloat(e.target.value) || 0)}
                          className="w-1/2 bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                        <select
                          value={criDoseUnit}
                          onChange={(e) => setCriDoseUnit(e.target.value as any)}
                          className="w-1/2 bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
                        >
                          <option value="mcg/kg/min">mcg/kg/min</option>
                          <option value="mg/kg/h">mg/kg/hora</option>
                          <option value="mg/kg/day">mg/kg/día</option>
                          <option value="mcg/kg/h">mcg/kg/hora</option>
                        </select>
                      </div>
                    </div>

                    {/* Concentración Ampolla */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Concentración de la Ampolla (mg/ml):
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={criConcMgMl}
                        onChange={(e) => setCriConcMgMl(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Volumen del Sachet */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Volumen del Sachet / Guía:
                      </label>
                      <div className="flex gap-1.5">
                        {[250, 500, 1000, 50].map((vol) => (
                          <button
                            key={vol}
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setCriBagVolumeMl(vol);
                            }}
                            className={'flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ' + (
                              criBagVolumeMl === vol
                                ? 'bg-teal-800 text-white border-teal-900 shadow-2xs'
                                : 'bg-[#FAF8F5] text-slate-700 border-[#DDD7C8] hover:bg-teal-50'
                            )}
                          >
                            {vol === 50 ? '50 ml (Bomba)' : vol + ' ml'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ritmo de Infusión */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Ritmo de Infusión de Bomba (ml/h):
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        value={criInfusionRateMlH}
                        onChange={(e) => setCriInfusionRateMlH(parseFloat(e.target.value) || 1)}
                        className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-black text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  {/* Vehículo */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Solución Vehículo / Fluido Portador:
                    </label>
                    <select
                      value={criVehicle}
                      onChange={(e) => setCriVehicle(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 cursor-pointer"
                    >
                      <option value="Solución Fisiológica 0.9%">Solución Fisiológica 0.9% (Cloruro de Sodio)</option>
                      <option value="Ringer Lactato">Solución Ringer Lactato</option>
                      <option value="Dextrosa 5%">Solución Dextrosa al 5% en Agua</option>
                      <option value="Solución Glucosalina">Solución Glucosalina Isotónica</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Rango de Dosis y Advertencias Clínicas */}
            {(doseRange || warnings || indications) && (
              <div className="bg-amber-50/80 p-4 rounded-3xl border border-amber-200/80 space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 font-bold text-amber-950">
                  <Info className="w-4 h-4 text-amber-700" />
                  <span>Referencia Terapéutica Institucional:</span>
                </div>
                {doseRange && (
                  <p>
                    <strong className="text-amber-950">Rango Clínico:</strong> {doseRange}
                  </p>
                )}
                {indications && (
                  <p>
                    <strong className="text-amber-950">Indicación:</strong> {indications}
                  </p>
                )}
                {warnings && (
                  <p className="text-rose-900 bg-rose-50 p-2 rounded-xl border border-rose-200 text-[11px]">
                    ⚠️ <strong>Precaución Médica:</strong> {warnings}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: LIVE RESULT & INSTITUTIONAL MEDICAL INDICATION (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Live Calculation Display Card */}
            <div className="bg-gradient-to-br from-teal-900 via-slate-900 to-[#1e3a1f] text-white p-5 rounded-3xl shadow-xl space-y-4 border border-teal-700">
              <div className="flex items-center justify-between border-b border-teal-700/50 pb-3">
                <span className="text-xs uppercase font-bold tracking-wider text-teal-200">
                  Resultado para {activePatient?.name || 'Paciente'} ({weightKg} kg)
                </span>
                <span className="text-[10px] bg-teal-800/80 px-2 py-0.5 rounded-full border border-teal-600 font-bold">
                  {mode === 'DIRECT' ? 'Dosis Directa' : 'Infusión CRI'}
                </span>
              </div>

              {mode === 'DIRECT' ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xs border border-white/10">
                      <span className="text-[10px] text-teal-200 block font-bold">1. Dosis Total Calculada:</span>
                      <div className="text-xl font-black text-amber-300 mt-0.5">
                        {directCalculations.totalDose.toFixed(2)} <span className="text-xs font-normal text-white">{directCalculations.unitLabel}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-500/20 p-3 rounded-2xl backdrop-blur-xs border border-emerald-400/30">
                      <span className="text-[10px] text-emerald-200 block font-bold">2. Volumen a Administrar:</span>
                      <div className="text-2xl font-black text-emerald-300 mt-0.5">
                        {concType === 'tablet_mg' ? (
                          <>
                            {directCalculations.tabletCount.toFixed(1)} <span className="text-xs font-normal text-white">comp.</span>
                          </>
                        ) : (
                          <>
                            {directCalculations.volumeMl.toFixed(2)} <span className="text-xs font-normal text-white">ml</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {concType !== 'tablet_mg' && (
                    <div className="bg-white/5 px-3 py-2 rounded-xl text-[11px] text-slate-300 flex items-center justify-between border border-white/5">
                      <span>Equivalencia en Gotas:</span>
                      <span className="font-bold text-amber-200">~{directCalculations.dropsMacro} gotas (20 gts/ml) / ~{directCalculations.dropsMicro} microgotas</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-500/20 p-3.5 rounded-2xl border border-emerald-400/30">
                    <span className="text-[10px] text-emerald-200 block font-bold">Adicionar al Sachet de {criBagVolumeMl} ml:</span>
                    <div className="text-2xl font-black text-emerald-300 mt-0.5">
                      {criCalculations.drugVolumeToAddMl.toFixed(2)} ml <span className="text-xs font-normal text-white">({criCalculations.totalMgInBag.toFixed(2)} mg de fármaco)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-teal-200 block">Ritmo de Bomba:</span>
                      <strong className="text-amber-300 text-sm">{criInfusionRateMlH} ml/h</strong>
                      <span className="text-[10px] text-slate-300 block">~{criCalculations.dropsPerMin} gotas/min</span>
                    </div>

                    <div className="bg-white/10 p-2.5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-teal-200 block">Duración del Sachet:</span>
                      <strong className="text-white text-sm">{criCalculations.hoursSachet.toFixed(1)} horas</strong>
                      <span className="text-[10px] text-slate-300 block">Sachet {criBagVolumeMl} ml</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Formatted Institutional Indication Box */}
            <div className="bg-white p-4 rounded-3xl border border-[#E8E3D9] shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-teal-700" />
                  <span>Protocolo de Indicación Médica</span>
                </span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  M.P. 502
                </span>
              </div>

              <textarea
                readOnly
                rows={7}
                value={indicationText}
                className="w-full font-mono text-[10.5px] p-3 bg-[#F9F8F5] border border-[#DDD7C8] rounded-2xl text-slate-800 focus:outline-none resize-none leading-relaxed"
              />

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleCopyIndication}
                  className="w-full py-2.5 bg-teal-800 hover:bg-teal-900 active:scale-98 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Indicación Médica</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleSaveCustomFormula}
                    className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Guardar Protocolo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareWhatsApp}
                    className="py-2 bg-[#EFECE3] hover:bg-[#E3DEC3] text-slate-800 border border-[#DDD7C8] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 5. SAVED CUSTOM PROTOCOLS DRAWER (IF OPEN) */}
        {showSavedList && (
          <div className="p-4 bg-amber-50/90 border-t border-amber-200 animate-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-600" />
                <span>Protocolos & Fórmulas Guardadas en la Clínica ({customDrugs.length})</span>
              </h5>
              <button
                type="button"
                onClick={() => setShowSavedList(false)}
                className="text-xs text-amber-800 hover:underline font-bold"
              >
                Ocultar
              </button>
            </div>

            {customDrugs.length === 0 ? (
              <p className="text-xs text-amber-800 italic">
                No has guardado fórmulas personalizadas aún. Hacé clic en "Guardar Protocolo" para registrarlas.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-40 overflow-y-auto">
                {customDrugs.map((cd) => (
                  <div
                    key={cd.id || cd.name}
                    className="bg-white p-2.5 rounded-2xl border border-amber-200 shadow-2xs flex items-center justify-between gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectFromVademecum(cd);
                        setShowSavedList(false);
                      }}
                      className="text-left flex-1 cursor-pointer"
                    >
                      <strong className="text-xs text-slate-900 block font-bold">{cd.name}</strong>
                      <span className="text-[10px] text-slate-500">{cd.doseRangeCanine || cd.defaultDoseMgKg + ' mg/kg'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCustomFormula(cd.id)}
                      className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar fórmula"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🌟 6. FOOTER */}
        <div className="p-3.5 bg-white border-t border-[#E8E3D9] flex items-center justify-between text-xs text-slate-500">
          <span>Clínica Veterinaria Irusta • Módulo de Cálculo Farmacológico & Protocolos Institucionales</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#EFECE3] hover:bg-[#E3DEC3] text-slate-800 font-bold rounded-xl cursor-pointer border border-[#DDD7C8] transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
