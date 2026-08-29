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
  FileText,
  Info,
  Plus,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { triggerHaptic } from '../utils/haptics';

export interface AuthorizedProtocol {
  id: string;
  name: string;
  drugName: string;
  category: string;
  species: 'Canino' | 'Felino' | 'Equino' | 'Bovino' | 'Todas';
  doseValue: number;
  doseUnit: 'mg/kg' | 'mcg/kg' | 'UI/kg' | 'ml/kg' | 'mg_fijo';
  concValue: number;
  concType: 'mg/ml' | 'percentage' | 'tablet_mg';
  route: string;
  frequency: string;
  dilution?: string;
  notes?: string;
  authorVet?: string;
  createdAt: string;
}

// For backwards-compatibility with tests
export interface VademecumDrug {
  id?: string;
  name: string;
  brandNames?: string;
  category: string;
  species?: string;
  doseRangeCanine?: string;
  doseRangeFeline?: string;
  defaultDoseMgKg: number;
  concentrationMgMl: number;
  routes?: string;
  frequency?: string;
  indications?: string;
  contraindications?: string;
  warnings?: string;
  isCustom?: boolean;
  createdBy?: string;
}

export const VADEMECUM_DATABASE: VademecumDrug[] = [];

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
  const { patients, showToast, openWhatsAppHub, currentUser } = useVet();

  // Authorized Medical Protocols (Saved exclusively by the Veterinarian)
  const [authorizedProtocols, setAuthorizedProtocols] = useState<AuthorizedProtocol[]>(() => {
    try {
      const saved = localStorage.getItem('vet_authorized_protocols_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('vet_authorized_protocols_v1', JSON.stringify(authorizedProtocols));
    } catch {
      // ignore
    }
  }, [authorizedProtocols]);

  const [currentPatientId, setCurrentPatientId] = useState<string>(initialPatientId || patients[0]?.id || '');
  const activePatient = useMemo(
    () => patients.find((p) => p.id === currentPatientId) || patients[0],
    [patients, currentPatientId]
  );
  const [weightKg, setWeightKg] = useState<number>(activePatient ? activePatient.weight || 10.0 : 10.0);
  const [species, setSpecies] = useState<'Canino' | 'Felino' | 'Equino' | 'Bovino'>(
    activePatient?.species === 'FELINO'
      ? 'Felino'
      : activePatient?.species === 'EQUINO'
      ? 'Equino'
      : activePatient?.species === 'BOVINO'
      ? 'Bovino'
      : 'Canino'
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

  // Manual Form Parameters - Clean and direct
  const [drugName, setDrugName] = useState('');
  const [category, setCategory] = useState('');
  const [doseValue, setDoseValue] = useState<number>(0);
  const [doseUnit, setDoseUnit] = useState<'mg/kg' | 'mcg/kg' | 'UI/kg' | 'ml/kg' | 'mg_fijo'>('mg/kg');
  const [concValue, setConcValue] = useState<number>(0);
  const [concType, setConcType] = useState<'mg/ml' | 'percentage' | 'tablet_mg'>('mg/ml');
  const [route, setRoute] = useState('IV Lento');
  const [frequency, setFrequency] = useState('Cada 12 horas');
  const [dilution, setDilution] = useState('');

  // Continuous Rate Infusion (CRI) Parameters
  const [criDoseValue, setCriDoseValue] = useState<number>(0);
  const [criDoseUnit, setCriDoseUnit] = useState<'mcg/kg/min' | 'mg/kg/h' | 'mg/kg/day' | 'mcg/kg/h'>('mcg/kg/min');
  const [criConcMgMl, setCriConcMgMl] = useState<number>(0);
  const [criBagVolumeMl, setCriBagVolumeMl] = useState<number>(500);
  const [criInfusionRateMlH, setCriInfusionRateMlH] = useState<number>(20);
  const [criVehicle, setCriVehicle] = useState('Solución Fisiológica 0.9%');

  // Drawer / Modal for Authorized Protocols
  const [showSavedList, setShowSavedList] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newProtocolName, setNewProtocolName] = useState('');
  const [newProtocolNotes, setNewProtocolNotes] = useState('');

  // Effective Concentration in mg/ml
  const effectiveConcMgMl = useMemo(() => {
    if (concType === 'percentage') return concValue * 10;
    if (concType === 'tablet_mg') return concValue || 1;
    return concValue || 1;
  }, [concValue, concType]);

  // Live Direct Dose Calculation
  const directCalculations = useMemo(() => {
    const w = Number(weightKg) || 1;
    let totalDose = 0;
    let unitLabel = 'mg';

    if (doseUnit === 'mg/kg') {
      totalDose = w * (doseValue || 0);
      unitLabel = 'mg';
    } else if (doseUnit === 'mcg/kg') {
      totalDose = w * (doseValue || 0);
      unitLabel = 'mcg';
    } else if (doseUnit === 'UI/kg') {
      totalDose = w * (doseValue || 0);
      unitLabel = 'UI';
    } else if (doseUnit === 'ml/kg') {
      totalDose = w * (doseValue || 0);
      unitLabel = 'ml';
    } else if (doseUnit === 'mg_fijo') {
      totalDose = doseValue || 0;
      unitLabel = 'mg';
    }

    let volumeMl = 0;
    let tabletCount = 0;

    if (doseUnit === 'ml/kg') {
      volumeMl = totalDose;
    } else if (concType === 'tablet_mg') {
      tabletCount = totalDose > 0 && concValue > 0 ? totalDose / concValue : 0;
      volumeMl = 0;
    } else if (doseUnit === 'mcg/kg') {
      volumeMl = effectiveConcMgMl > 0 ? totalDose / 1000 / effectiveConcMgMl : 0;
    } else if (doseUnit === 'UI/kg') {
      volumeMl = effectiveConcMgMl > 0 ? totalDose / effectiveConcMgMl : 0;
    } else {
      volumeMl = effectiveConcMgMl > 0 ? totalDose / effectiveConcMgMl : 0;
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

  // Live CRI Calculation
  const criCalculations = useMemo(() => {
    const w = Number(weightKg) || 1;
    let mgPerHour = 0;

    if (criDoseUnit === 'mcg/kg/min') {
      mgPerHour = ((criDoseValue || 0) * w * 60) / 1000;
    } else if (criDoseUnit === 'mg/kg/h') {
      mgPerHour = (criDoseValue || 0) * w;
    } else if (criDoseUnit === 'mg/kg/day') {
      mgPerHour = ((criDoseValue || 0) * w) / 24;
    } else if (criDoseUnit === 'mcg/kg/h') {
      mgPerHour = ((criDoseValue || 0) * w) / 1000;
    }

    const bagVol = Number(criBagVolumeMl) || 500;
    const rateMlH = Number(criInfusionRateMlH) || 20;
    const hoursSachet = rateMlH > 0 ? bagVol / rateMlH : 24;
    const totalMgInBag = mgPerHour * hoursSachet;
    const conc = Number(criConcMgMl) || 0;
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

  // Formatted Institutional Medical Indication Text
  const indicationText = useMemo(() => {
    const patName = activePatient?.name || 'Paciente';
    const dateStr = new Date().toLocaleDateString('es-AR');
    const timeStr = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    if (mode === 'DIRECT') {
      const concText =
        concValue > 0
          ? ' (' +
            concValue +
            ' ' +
            (concType === 'percentage'
              ? '%'
              : concType === 'tablet_mg'
              ? 'mg/comp'
              : 'mg/ml') +
            ')'
          : '';

      return [
        '📋 PROTOCOLO DE INDICACIÓN MÉDICA — CLÍNICA VETERINARIA RANQUEL',
        'Paciente: ' + patName + ' (' + species + ' • ' + weightKg + ' kg) | Emisión: ' + dateStr + ' ' + timeStr + ' hs',
        '--------------------------------------------------',
        '• Medicación: ' + (drugName || 'Fármaco Prescrito') + concText,
        '• Dosis Prescrita: ' + doseValue + ' ' + doseUnit,
        '• Dosis Total Calculada: ' + directCalculations.totalDose.toFixed(2) + ' ' + directCalculations.unitLabel,
        '• ' +
          (concType === 'tablet_mg'
            ? 'Cantidad a Administrar: ' + directCalculations.tabletCount.toFixed(1) + ' comprimido(s)'
            : 'Volumen a Administrar: ' +
              directCalculations.volumeMl.toFixed(2) +
              ' ml (~' +
              directCalculations.dropsMacro +
              ' gotas)'),
        '• Vía de Administración: ' + route,
        '• Frecuencia / Intervalo: ' + frequency,
        dilution ? '• Indicaciones / Dilución: ' + dilution : '',
        '--------------------------------------------------',
        'Dirección Médica: Dr. Diego Iván Irusta — Matrícula: M.P. 502',
      ]
        .filter(Boolean)
        .join('\n');
    }

    return [
      '💧 PROTOCOLO DE INFUSIÓN CONTINUA (CRI) — CLÍNICA VETERINARIA RANQUEL',
      'Paciente: ' + patName + ' (' + species + ' • ' + weightKg + ' kg) | Emisión: ' + dateStr + ' ' + timeStr + ' hs',
      '--------------------------------------------------',
      '• Fármaco / Principio Activo: ' + (drugName || 'Fármaco CRI') + ' (Conc: ' + criConcMgMl + ' mg/ml)',
      '• Tasa Prescrita: ' +
        criDoseValue +
        ' ' +
        criDoseUnit +
        ' (Entrega al paciente: ' +
        criCalculations.mgPerHour.toFixed(2) +
        ' mg/hora)',
      '• Preparación en Sachet: Adicionar ' +
        criCalculations.drugVolumeToAddMl.toFixed(2) +
        ' ml (' +
        criCalculations.totalMgInBag.toFixed(2) +
        ' mg de fármaco) en Sachet de ' +
        criBagVolumeMl +
        ' ml de ' +
        criVehicle,
      '• Ritmo de Bomba / Infusión: ' +
        criInfusionRateMlH +
        ' ml/hora (~' +
        criCalculations.dropsPerMin +
        ' gotas/minuto en macrogotero)',
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

  // Copy Indication to Clipboard
  const handleCopyIndication = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(indicationText);
    showToast('success', 'Indicación Copiada', 'Texto de indicación legal copiado al portapapeles.');
  };

  // Open Save Protocol Modal
  const handleOpenSaveModal = () => {
    if (!drugName.trim()) {
      showToast('error', 'Fármaco Requerido', 'Por favor ingresá el nombre del medicamento antes de guardar el protocolo.');
      return;
    }
    setNewProtocolName(drugName.trim() + ' (' + doseValue + ' ' + doseUnit + ')');
    setNewProtocolNotes(dilution || '');
    setShowSaveModal(true);
  };

  // Confirm Save Authorized Protocol
  const handleConfirmSaveProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProtocolName.trim()) return;
    triggerHaptic('medium');

    const newProt: AuthorizedProtocol = {
      id: 'proto-' + Date.now(),
      name: newProtocolName.trim(),
      drugName: drugName.trim(),
      category: category.trim() || 'Protocolo Clínico',
      species: species,
      doseValue: Number(doseValue) || 0,
      doseUnit: doseUnit,
      concValue: Number(concValue) || 0,
      concType: concType,
      route: route.trim() || 'IV Lento',
      frequency: frequency.trim() || 'Cada 12 horas',
      dilution: dilution.trim(),
      notes: newProtocolNotes.trim(),
      authorVet: currentUser?.name || 'Dr. Diego Iván Irusta',
      createdAt: new Date().toISOString(),
    };

    setAuthorizedProtocols((prev) => [newProt, ...prev]);
    setShowSaveModal(false);
    showToast(
      'success',
      'Protocolo Autorizado Guardado',
      '"' + newProt.name + '" ha sido registrado en los protocolos de la clínica.'
    );
  };

  // Load an Authorized Protocol into the Calculator
  const handleLoadProtocol = (proto: AuthorizedProtocol) => {
    triggerHaptic('medium');
    setDrugName(proto.drugName);
    setCategory(proto.category);
    setDoseValue(proto.doseValue);
    setDoseUnit(proto.doseUnit);
    setConcValue(proto.concValue);
    setConcType(proto.concType);
    setRoute(proto.route);
    setFrequency(proto.frequency);
    setDilution(proto.dilution || '');
    setShowSavedList(false);
    showToast('info', 'Protocolo Cargado', 'Parámetros de "' + proto.name + '" cargados a la estación.');
  };

  // Delete an Authorized Protocol
  const handleDeleteProtocol = (id: string) => {
    triggerHaptic('light');
    setAuthorizedProtocols((prev) => prev.filter((p) => p.id !== id));
    showToast('info', 'Protocolo Eliminado', 'El protocolo fue removido de la clínica.');
  };

  // Share via WhatsApp Hub
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
          supplyName: 'Indicación Médica: ' + (drugName || 'Fármaco'),
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
                  CARGA MANUAL DIRECTA
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Cálculo de dosis, fórmulas libres, infusiones continuas (CRI) y protocolos autorizados por el médico
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSavedList(!showSavedList)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 text-amber-600" />
              <span>Mis Protocolos Autorizados ({authorizedProtocols.length})</span>
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

        {/* 🌟 2. PATIENT CONTEXT & CLEAN SELECTION BAR */}
        <div className="p-3.5 sm:p-4 bg-[#EFECE3] border-b border-[#E8E3D9] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Patient Context Dropdown */}
            <div role="dialog" aria-modal="true" className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-[#DDD7C8] shadow-2xs">
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
                  className={
                    'px-2.5 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ' +
                    (species === sp
                      ? 'bg-teal-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100')
                  }
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
              className={
                'px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ' +
                (mode === 'DIRECT'
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white/60')
              }
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
              className={
                'px-3.5 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ' +
                (mode === 'CRI'
                  ? 'bg-teal-800 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-white/60')
              }
            >
              <Droplet className="w-3.5 h-3.5" />
              <span>Infusión Continua (CRI)</span>
            </button>
          </div>
        </div>

        {/* 🌟 3. MAIN WORKSTATION (2 COLUMNS) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* LEFT COLUMN: MANUAL FORMULA & DRUG PARAMETERS (7 COLS) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-[#E8E3D9] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-teal-700" />
                  <h4 className="text-sm font-black font-serif text-slate-900">
                    {mode === 'DIRECT'
                      ? 'Parámetros del Fármaco & Dosis Directa'
                      : 'Parámetros de Infusión Continua (CRI / Suero)'}
                  </h4>
                </div>

                {/* Dropdown of Authorized Protocols if any exist */}
                {authorizedProtocols.length > 0 && (
                  <div>
                    <select
                      onChange={(e) => {
                        const proto = authorizedProtocols.find((p) => p.id === e.target.value);
                        if (proto) handleLoadProtocol(proto);
                      }}
                      className="text-xs bg-amber-50 text-amber-900 font-bold px-2.5 py-1 rounded-xl border border-amber-200 focus:outline-none cursor-pointer"
                    >
                      <option value="">⭐ Cargar Protocolo Autorizado ({authorizedProtocols.length})...</option>
                      {authorizedProtocols.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.species})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Fármaco Nombre & Categoría */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Nombre del Medicamento / Fórmula: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={drugName}
                    onChange={(e) => setDrugName(e.target.value)}
                    placeholder="Ej: Enrofloxacina, Meloxicam, Cefazolina, Tramadol..."
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
                    placeholder="Ej: Antibiótico Fluoroquinolona / Frasco 50ml"
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
                        Dosis Prescrita & Unidad: <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={doseValue || ''}
                          onChange={(e) => setDoseValue(parseFloat(e.target.value) || 0)}
                          placeholder="Ej: 5.0"
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
                        Concentración del Fármaco: <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={concValue || ''}
                          onChange={(e) => setConcValue(parseFloat(e.target.value) || 0)}
                          placeholder="Ej: 50"
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
                        placeholder="IV Lento, SC, IM, Oral, IO, Epidural..."
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
                        placeholder="Cada 8 horas, Cada 12 horas, Cada 24 horas, Bolo único..."
                        className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  {/* Dilución / Notas */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Dilución / Instrucción Específica para Enfermería / Internación:
                    </label>
                    <input
                      type="text"
                      value={dilution}
                      onChange={(e) => setDilution(e.target.value)}
                      placeholder="Ej: Diluir en 10 ml de Solución Fisiológica 0.9% / Infundir lentamente en 15 minutos"
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
                        Tasa de Dosis CRI: <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={criDoseValue || ''}
                          onChange={(e) => setCriDoseValue(parseFloat(e.target.value) || 0)}
                          placeholder="Ej: 4.0"
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
                        Concentración de la Ampolla (mg/ml): <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={criConcMgMl || ''}
                        onChange={(e) => setCriConcMgMl(parseFloat(e.target.value) || 0)}
                        placeholder="Ej: 50"
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
                            className={
                              'flex-1 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ' +
                              (criBagVolumeMl === vol
                                ? 'bg-teal-800 text-white border-teal-900 shadow-2xs'
                                : 'bg-[#FAF8F5] text-slate-700 border-[#DDD7C8] hover:bg-teal-50')
                            }
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

              {/* Bottom Action inside left panel: Save as Authorized Protocol */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  ¿Fórmula de uso frecuente? Guardala en los protocolos oficiales de la clínica.
                </span>

                <button
                  type="button"
                  onClick={handleOpenSaveModal}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                >
                  <Star className="w-3.5 h-3.5 text-amber-600" />
                  <span>Guardar como Mi Protocolo Autorizado</span>
                </button>
              </div>
            </div>
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
                        {directCalculations.totalDose.toFixed(2)}{' '}
                        <span className="text-xs font-normal text-white">{directCalculations.unitLabel}</span>
                      </div>
                    </div>

                    <div className="bg-emerald-500/20 p-3 rounded-2xl backdrop-blur-xs border border-emerald-400/30">
                      <span className="text-[10px] text-emerald-200 block font-bold">2. Volumen a Administrar:</span>
                      <div className="text-2xl font-black text-emerald-300 mt-0.5">
                        {concType === 'tablet_mg' ? (
                          <>
                            {directCalculations.tabletCount.toFixed(1)}{' '}
                            <span className="text-xs font-normal text-white">comp.</span>
                          </>
                        ) : (
                          <>
                            {directCalculations.volumeMl.toFixed(2)}{' '}
                            <span className="text-xs font-normal text-white">ml</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {concType !== 'tablet_mg' && (
                    <div className="bg-white/5 px-3 py-2 rounded-xl text-[11px] text-slate-300 flex items-center justify-between border border-white/5">
                      <span>Equivalencia en Gotas:</span>
                      <span className="font-bold text-amber-200">
                        ~{directCalculations.dropsMacro} gotas (20 gts/ml) / ~{directCalculations.dropsMicro} microgotas
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-500/20 p-3.5 rounded-2xl border border-emerald-400/30">
                    <span className="text-[10px] text-emerald-200 block font-bold">
                      Adicionar al Sachet de {criBagVolumeMl} ml:
                    </span>
                    <div className="text-2xl font-black text-emerald-300 mt-0.5">
                      {criCalculations.drugVolumeToAddMl.toFixed(2)} ml{' '}
                      <span className="text-xs font-normal text-white">
                        ({criCalculations.totalMgInBag.toFixed(2)} mg de fármaco)
                      </span>
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
                  <span>Protocolo de Indicación Médica Legal</span>
                </span>
                <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  Dr. Diego Iván Irusta — M.P. 502
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
                    onClick={handleOpenSaveModal}
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

        {/* 🌟 4. SAVED CUSTOM PROTOCOLS DRAWER (IF OPEN) */}
        {showSavedList && (
          <div className="p-4 bg-amber-50/95 border-t border-amber-200 animate-in slide-in-from-bottom-5 duration-200 max-h-56 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-600" />
                <span>Mis Protocolos Clínicos Autorizados ({authorizedProtocols.length})</span>
              </h5>
              <button
                type="button"
                onClick={() => setShowSavedList(false)}
                className="text-xs text-amber-800 hover:underline font-bold cursor-pointer"
              >
                Cerrar Panel
              </button>
            </div>

            {authorizedProtocols.length === 0 ? (
              <div className="text-center py-4 bg-white/60 rounded-2xl border border-amber-200 text-xs text-amber-900 italic">
                No hay protocolos clínicos guardados aún. Podés cargar los datos de cualquier fármaco o fórmula en la calculadora y hacer clic en <strong>"Guardar como Mi Protocolo Autorizado"</strong> para tenerlos disponibles permanentemente.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {authorizedProtocols.map((proto) => (
                  <div
                    key={proto.id}
                    className="bg-white p-3 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <strong className="text-xs text-slate-900 font-bold truncate block">{proto.name}</strong>
                        <span className="text-[9px] bg-teal-50 text-teal-800 px-1.5 py-0.2 rounded font-bold border border-teal-200">
                          {proto.species}
                        </span>
                      </div>
                      <span className="text-[11px] text-teal-700 font-bold block mt-0.5">
                        {proto.drugName} • {proto.doseValue} {proto.doseUnit}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        Vía: {proto.route} | {proto.frequency}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                      <button
                        type="button"
                        onClick={() => handleLoadProtocol(proto)}
                        className="px-3 py-1 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-lg cursor-pointer shadow-2xs flex-1 text-center"
                      >
                        Cargar en Calculadora
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProtocol(proto.id)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar protocolo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 🌟 5. SAVE PROTOCOL MODAL */}
        {showSaveModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  <h4 className="font-black font-serif text-slate-900 text-base">
                    Guardar como Protocolo Autorizado
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleConfirmSaveProtocol} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Protocolo Clínico:</label>
                  <input
                    type="text"
                    required
                    value={newProtocolName}
                    onChange={(e) => setNewProtocolName(e.target.value)}
                    placeholder="Ej: Protocolo Sedación Canina Dr. Irusta, Analgesia Felina..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div className="p-3 bg-teal-50/70 rounded-2xl border border-teal-200 space-y-1">
                  <span className="text-[10px] font-bold text-teal-900 uppercase block">Resumen de Parámetros:</span>
                  <div className="text-xs text-teal-950">
                    <strong>{drugName}</strong>: {doseValue} {doseUnit} | Conc: {concValue} ({concType}) | Vía: {route} | {frequency}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Notas / Instrucciones Médicas Adicionales:</label>
                  <textarea
                    rows={2}
                    value={newProtocolNotes}
                    onChange={(e) => setNewProtocolNotes(e.target.value)}
                    placeholder="Observaciones de administración, contraindicaciones, etc."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-teal-600 resize-none"
                  />
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Guardar Protocolo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 🌟 6. FOOTER */}
        <div className="p-3.5 bg-white border-t border-[#E8E3D9] flex items-center justify-between text-xs text-slate-500">
          <span>Clínica Veterinaria Ranquel • Módulo de Cálculo Farmacológico & Protocolos Institucionales</span>
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
