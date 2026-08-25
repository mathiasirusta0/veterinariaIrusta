import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplet,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Clock,
  Printer,
  Sparkles,
  TrendingUp,
  User,
  ShieldAlert,
  HelpCircle,
  Eye,
  Radio,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { VitalSigns, Patient } from '../types';
import { formatDate, formatTime, formatDateTime, formatWeight } from '../utils/formatters';

// Physiological normal reference ranges by species
export const SPECIES_RANGES = {
  Canino: {
    heartRate: { min: 70, max: 140, unit: 'lpm', label: '70 - 140 lpm (hasta 180 en cachorros/toy)' },
    respiratoryRate: { min: 15, max: 30, unit: 'rpm', label: '15 - 30 rpm' },
    temperature: { min: 37.8, max: 39.2, unit: '°C', label: '37.8 - 39.2 °C' },
    systolicBP: { min: 110, max: 140, unit: 'mmHg', label: '110 - 140 mmHg' },
    diastolicBP: { min: 60, max: 90, unit: 'mmHg', label: '60 - 90 mmHg' },
    meanBP: { min: 75, max: 100, unit: 'mmHg', label: '75 - 100 mmHg' },
    spo2: { min: 95, max: 100, unit: '%', label: '95 - 100%' },
    bloodGlucose: { min: 70, max: 130, unit: 'mg/dL', label: '70 - 130 mg/dL' },
  },
  Felino: {
    heartRate: { min: 140, max: 220, unit: 'lpm', label: '140 - 220 lpm' },
    respiratoryRate: { min: 20, max: 40, unit: 'rpm', label: '20 - 40 rpm' },
    temperature: { min: 38.0, max: 39.2, unit: '°C', label: '38.0 - 39.2 °C' },
    systolicBP: { min: 120, max: 150, unit: 'mmHg', label: '120 - 150 mmHg' },
    diastolicBP: { min: 70, max: 100, unit: 'mmHg', label: '70 - 100 mmHg' },
    meanBP: { min: 80, max: 110, unit: 'mmHg', label: '80 - 110 mmHg' },
    spo2: { min: 95, max: 100, unit: '%', label: '95 - 100%' },
    bloodGlucose: { min: 70, max: 150, unit: 'mg/dL', label: '70 - 150 mg/dL' },
  },
  Equino: {
    heartRate: { min: 28, max: 44, unit: 'lpm', label: '28 - 44 lpm' },
    respiratoryRate: { min: 8, max: 16, unit: 'rpm', label: '8 - 16 rpm' },
    temperature: { min: 37.0, max: 38.5, unit: '°C', label: '37.0 - 38.5 °C' },
    systolicBP: { min: 100, max: 135, unit: 'mmHg', label: '100 - 135 mmHg' },
    diastolicBP: { min: 60, max: 85, unit: 'mmHg', label: '60 - 85 mmHg' },
    meanBP: { min: 70, max: 95, unit: 'mmHg', label: '70 - 95 mmHg' },
    spo2: { min: 95, max: 100, unit: '%', label: '95 - 100%' },
    bloodGlucose: { min: 70, max: 120, unit: 'mg/dL', label: '70 - 120 mg/dL' },
  },
  Bovino: {
    heartRate: { min: 55, max: 80, unit: 'lpm', label: '55 - 80 lpm' },
    respiratoryRate: { min: 12, max: 30, unit: 'rpm', label: '12 - 30 rpm' },
    temperature: { min: 38.0, max: 39.3, unit: '°C', label: '38.0 - 39.3 °C' },
    systolicBP: { min: 110, max: 145, unit: 'mmHg', label: '110 - 145 mmHg' },
    diastolicBP: { min: 65, max: 95, unit: 'mmHg', label: '65 - 95 mmHg' },
    meanBP: { min: 75, max: 105, unit: 'mmHg', label: '75 - 105 mmHg' },
    spo2: { min: 95, max: 100, unit: '%', label: '95 - 100%' },
    bloodGlucose: { min: 45, max: 75, unit: 'mg/dL', label: '45 - 75 mg/dL' },
  },
  Exótico: {
    heartRate: { min: 120, max: 300, unit: 'lpm', label: '120 - 300 lpm (según especie)' },
    respiratoryRate: { min: 30, max: 60, unit: 'rpm', label: '30 - 60 rpm' },
    temperature: { min: 38.5, max: 40.0, unit: '°C', label: '38.5 - 40.0 °C' },
    systolicBP: { min: 90, max: 140, unit: 'mmHg', label: '90 - 140 mmHg' },
    diastolicBP: { min: 50, max: 90, unit: 'mmHg', label: '50 - 90 mmHg' },
    meanBP: { min: 65, max: 95, unit: 'mmHg', label: '65 - 95 mmHg' },
    spo2: { min: 95, max: 100, unit: '%', label: '95 - 100%' },
    bloodGlucose: { min: 75, max: 140, unit: 'mg/dL', label: '75 - 140 mg/dL' },
  },
};

export const VitalSignsView: React.FC = () => {
  const {
    vitals,
    patients,
    owners,
    currentUser,
    addVitalSigns,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    openCalculators,
    showToast,
    logAudit,
  } = useVet();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<'TODAS' | 'Canino' | 'Felino' | 'Equino' | 'Bovino' | 'Exótico'>('TODAS');
  const [filterAlertsOnly, setFilterAlertsOnly] = useState(false);
  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('TODOS');

  // Quick Logging Form State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [targetPatientId, setTargetPatientId] = useState(patients[0]?.id || '');
  const [regTemp, setRegTemp] = useState('38.5');
  const [regHR, setRegHR] = useState('110');
  const [regFR, setRegFR] = useState('22');
  const [regPAS, setRegPAS] = useState('125');
  const [regPAD, setRegPAD] = useState('75');
  const [regPAM, setRegPAM] = useState('85');
  const [regSpO2, setRegSpO2] = useState('98');
  const [regWeight, setRegWeight] = useState('12.5');
  const [regGlucose, setRegGlucose] = useState('95');
  const [regMucosas, setRegMucosas] = useState<VitalSigns['mucousMembranes']>('ROSADAS');
  const [regTLLC, setRegTLLC] = useState('1.5');
  const [regPain, setRegPain] = useState('1');
  const [regConsciousness, setRegConsciousness] = useState<VitalSigns['consciousnessLevel']>('ALERTA');
  const [regNotes, setRegNotes] = useState('Paciente en buen estado general, alerta y responsivo.');

  // Helper to evaluate if vital sign is out of bounds
  const getVitalAlerts = (v: VitalSigns, patientSpecies?: string) => {
    const spUpper = (patientSpecies || 'Canino').toUpperCase();
    const normalizedSpecies: 'Canino' | 'Felino' | 'Equino' | 'Bovino' | 'Exótico' =
      spUpper === 'FELINO' ? 'Felino' :
      spUpper === 'EQUINO' ? 'Equino' :
      spUpper === 'BOVINO' ? 'Bovino' :
      spUpper.startsWith('EX') ? 'Exótico' : 'Canino';
    const range = SPECIES_RANGES[normalizedSpecies] || SPECIES_RANGES.Canino;
    const alerts: { param: string; message: string; severity: 'HIGH' | 'MEDIUM' }[] = [];

    if (v.temperature !== undefined) {
      if (v.temperature > range.temperature.max) {
        alerts.push({ param: 'Temperatura', message: `Hipertermia / Fiebre (${v.temperature}°C)`, severity: 'HIGH' });
      } else if (v.temperature < range.temperature.min) {
        alerts.push({ param: 'Temperatura', message: `Hipotermia (${v.temperature}°C)`, severity: 'HIGH' });
      }
    }

    if (v.heartRate !== undefined) {
      if (v.heartRate > range.heartRate.max) {
        alerts.push({ param: 'Frec. Cardíaca', message: `Taquicardia (${v.heartRate} lpm)`, severity: 'MEDIUM' });
      } else if (v.heartRate < range.heartRate.min) {
        alerts.push({ param: 'Frec. Cardíaca', message: `Bradicardia (${v.heartRate} lpm)`, severity: 'HIGH' });
      }
    }

    if (v.respiratoryRate !== undefined) {
      if (v.respiratoryRate > range.respiratoryRate.max) {
        alerts.push({ param: 'Frec. Resp.', message: `Taquipnea (${v.respiratoryRate} rpm)`, severity: 'MEDIUM' });
      } else if (v.respiratoryRate < range.respiratoryRate.min) {
        alerts.push({ param: 'Frec. Resp.', message: `Bradipnea (${v.respiratoryRate} rpm)`, severity: 'HIGH' });
      }
    }

    if (v.spo2 !== undefined && v.spo2 < 95) {
      alerts.push({ param: 'SpO2', message: `Hipoxemia (${v.spo2}%)`, severity: 'HIGH' });
    }

    if (v.meanBP !== undefined && v.meanBP < 60) {
      alerts.push({ param: 'Presión Arterial', message: `Hipotensión Severa PAM (${v.meanBP} mmHg)`, severity: 'HIGH' });
    }

    if (v.capillaryRefillTime !== undefined && v.capillaryRefillTime > 2) {
      alerts.push({ param: 'TLLC', message: `TLLC prolongado (${v.capillaryRefillTime}s)`, severity: 'MEDIUM' });
    }

    if (v.mucousMembranes && v.mucousMembranes !== 'ROSADAS') {
      alerts.push({ param: 'Mucosas', message: `Mucosas ${v.mucousMembranes}`, severity: 'HIGH' });
    }

    if (v.painScale !== undefined && v.painScale >= 5) {
      alerts.push({ param: 'Dolor', message: `Dolor moderado a severo (Score ${v.painScale}/10)`, severity: 'MEDIUM' });
    }

    return alerts;
  };

  // Filtered Vitals
  const filteredVitals = vitals.filter((v) => {
    const patient = patients.find((p) => p.id === v.patientId);
    if (!patient) return false;

    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.notes && v.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSpecies = selectedSpecies === 'TODAS' || patient.species === selectedSpecies;
    const matchesPatient = selectedPatientFilter === 'TODOS' || patient.id === selectedPatientFilter;

    const alerts = getVitalAlerts(v, patient.species as any);
    const matchesAlerts = !filterAlertsOnly || alerts.length > 0;

    return matchesSearch && matchesSpecies && matchesPatient && matchesAlerts;
  });

  // Calculate high-priority abnormal counts
  const totalAlertsCount = vitals.filter((v) => {
    const patient = patients.find((p) => p.id === v.patientId);
    return getVitalAlerts(v, (patient?.species as any) || 'Canino').length > 0;
  }).length;

  const handleSaveVitalEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === targetPatientId) || patients[0];

    if (!patient) {
      showToast('error', 'Sin Paciente', 'Debe registrar al menos un paciente en el sistema antes de cargar signos vitales.');
      return;
    }

    const newRecord: Omit<VitalSigns, 'id'> = {
      patientId: patient.id,
      recordedAt: new Date().toISOString(),
      recordedBy: currentUser?.name || 'Dr. Diego Iván Irusta',
      weight: parseFloat(regWeight) || patient.weight || 10,
      temperature: parseFloat(regTemp) || 38.5,
      heartRate: parseInt(regHR) || 110,
      respiratoryRate: parseInt(regFR) || 22,
      systolicBP: parseInt(regPAS) || 125,
      diastolicBP: parseInt(regPAD) || 75,
      meanBP: parseInt(regPAM) || 85,
      spo2: parseInt(regSpO2) || 98,
      bloodGlucose: parseInt(regGlucose) || 95,
      mucousMembranes: regMucosas,
      capillaryRefillTime: parseFloat(regTLLC) || 1.5,
      painScale: parseInt(regPain) || 1,
      consciousnessLevel: regConsciousness,
      notes: regNotes,
    };

    addVitalSigns(newRecord);
    setIsRegisterModalOpen(false);
    showToast(
      'success',
      'Signos Vitales Registrados',
      `Constantes clínicas de ${patient.name} guardadas con éxito.`
    );
    logAudit(
      'REGISTRO_SIGNOS_VITALES',
      'VitalSigns',
      patient.id,
      `Signos vitales cargados: FC ${newRecord.heartRate}, Temp ${newRecord.temperature}°C, SpO2 ${newRecord.spo2}% para ${patient.name}`
    );
  };

  const handleViewPatientDetail = (patientId: string) => {
    setSelectedPatientId(patientId);
    setActivePatientTab('SIGNOS');
    setActiveView('PACIENTES');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"></span>
            <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
              Biometría & Monitoreo Fisiológico Animal
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            <span>Módulo de Signos Vitales & Constantes Fisiológicas</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Detección de patrones críticos, rangos por especie, triada clínica, oximetría y curvas de evolución
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">

          <button
            onClick={() => openCalculators()}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold rounded-lg shadow-2xs transition-all"
            title="Calculadora de infusión y fluidoterapia"
          >
            <Droplet className="w-3.5 h-3.5 text-teal-600" />
            <span>Calculadora Dosis</span>
          </button>

          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Signos Vitales</span>
          </button>
        </div>
      </div>

      {/* 5 Primary Vital Signs Physiological Cards (Dynamic with Reference Fallback) */}
      {(() => {
        const latestVital = filteredVitals[0] || vitals[0];
        const activeSpec = selectedSpecies !== 'TODAS' ? selectedSpecies : 'Canino';
        const specRanges = SPECIES_RANGES[activeSpec as keyof typeof SPECIES_RANGES] || SPECIES_RANGES.Canino;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5 text-xs w-full">
            {/* 1. Tensión Arterial TAS / TAD */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1.5 hover:border-teal-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-600" />
                  Presión Arterial
                </span>
              </div>
              <div className="text-lg font-black text-slate-900 font-mono">
                {latestVital?.systolicBP
                  ? `${latestVital.systolicBP}/${latestVital.diastolicBP || 80}`
                  : `${specRanges.systolicBP.min}-${specRanges.systolicBP.max}`}{' '}
                <span className="text-[11px] font-normal text-slate-400">mmHg</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded block truncate">
                {latestVital?.systolicBP ? 'Última Lectura TAS/TAD' : `Rango Ref. (${activeSpec})`}
              </span>
            </div>

            {/* 2. TAM (Tensión Arterial Media) */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1.5 hover:border-teal-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-600" />
                  TAM (Media)
                </span>
              </div>
              <div className="text-lg font-black text-rose-700 font-mono">
                {latestVital?.meanBP || specRanges.meanBP.min}{' '}
                <span className="text-[11px] font-normal text-slate-400">mmHg</span>
              </div>
              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded block truncate">
                {latestVital?.meanBP ? 'Medición Real' : `Meta: ${specRanges.meanBP.min} - ${specRanges.meanBP.max} mmHg`}
              </span>
            </div>

            {/* 3. Saturación de Oxígeno SpO2 */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1.5 hover:border-teal-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-cyan-600" />
                  Saturación O2
                </span>
              </div>
              <div className="text-lg font-black text-cyan-700 font-mono">
                {latestVital?.spo2 ? `${latestVital.spo2}%` : '≥ 95%'}{' '}
                <span className="text-[11px] font-normal text-slate-400">SpO2</span>
              </div>
              <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded block truncate">
                {latestVital?.spo2 ? (latestVital.spo2 >= 95 ? 'Normoxia' : 'Alerta O2') : 'Rango Fisiológico'}
              </span>
            </div>

            {/* 4. Temperatura */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1.5 hover:border-teal-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-teal-600" />
                  Temperatura
                </span>
              </div>
              <div className="text-lg font-black text-teal-800 font-mono">
                {latestVital?.temperature ? `${latestVital.temperature} °C` : `${specRanges.temperature.min} - ${specRanges.temperature.max} °C`}
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded block truncate">
                {latestVital?.temperature ? 'Último Registro' : `Ref. (${activeSpec})`}
              </span>
            </div>

            {/* 5. HGT (Hemoglucotest) */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1.5 hover:border-teal-500/50 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-amber-600" />
                  HGT (Glucemia)
                </span>
              </div>
              <div className="text-lg font-black text-amber-800 font-mono">
                {latestVital?.bloodGlucose ? latestVital.bloodGlucose : specRanges.bloodGlucose.min}{' '}
                <span className="text-[11px] font-normal text-slate-400">mg/dL</span>
              </div>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded block truncate">
                {latestVital?.bloodGlucose ? 'Medición Actual' : `Ref: ${specRanges.bloodGlucose.min} - ${specRanges.bloodGlucose.max} mg/dL`}
              </span>
            </div>
          </div>
        );
      })()}

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por paciente, raza o notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 w-56"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Especie:</span>
            {['TODAS', 'Canino', 'Felino', 'Equino', 'Bovino', 'Exótico'].map((spec) => (
              <button
                key={spec}
                onClick={() => setSelectedSpecies(spec as any)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedSpecies === spec
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {spec}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Paciente:</span>
            <select
              value={selectedPatientFilter}
              onChange={(e) => setSelectedPatientFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="TODOS">Todos los Pacientes</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species} - {p.breed})
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={() => setFilterAlertsOnly((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all border ${
            filterAlertsOnly
              ? 'bg-red-50 text-red-700 border-red-300 shadow-2xs'
              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
          }`}
        >
          <AlertTriangle className={`w-3.5 h-3.5 ${filterAlertsOnly ? 'text-red-600' : 'text-slate-400'}`} />
          <span>Solo con Alertas ({totalAlertsCount})</span>
        </button>
      </div>

      {/* Vitals Feed & Table View */}
      <div className="space-y-4">
        {filteredVitals.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-2">
            <Activity className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-slate-700 text-sm">No se encontraron registros de signos vitales</p>
            <p className="text-xs">
              Ajustá los filtros de búsqueda o hacé clic en "Registrar Signos Vitales" para cargar un nuevo control.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="p-3.5">Paciente</th>
                    <th className="p-3.5">Fecha & Hora</th>
                    <th className="p-3.5 text-center">F. Cardíaca</th>
                    <th className="p-3.5 text-center">F. Resp.</th>
                    <th className="p-3.5 text-center">Temp.</th>
                    <th className="p-3.5 text-center">Presión (PAM)</th>
                    <th className="p-3.5 text-center">SpO2</th>
                    <th className="p-3.5 text-center">TLLC / Mucosas</th>
                    <th className="p-3.5 text-center">Dolor</th>
                    <th className="p-3.5">Estado / Alertas</th>
                    <th className="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredVitals.map((v) => {
                    const patient = patients.find((p) => p.id === v.patientId);
                    if (!patient) return null;

                    const alerts = getVitalAlerts(v, patient.species as any);
                    const hasAlerts = alerts.length > 0;

                    return (
                      <tr
                        key={v.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          hasAlerts ? 'bg-red-50/20' : ''
                        }`}
                      >
                        {/* Patient */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                              {patient.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block">{patient.name}</span>
                              <span className="text-[10px] text-slate-400">
                                {patient.species} • {v.weight || patient.weight} kg
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Date & User */}
                        <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                          <div>{formatDate(v.recordedAt)}</div>
                          <div className="text-[10px] text-slate-400">
                            {formatTime(v.recordedAt)} hs
                          </div>
                        </td>

                        {/* Heart Rate */}
                        <td className="p-3.5 text-center font-mono">
                          <span
                            className={`font-black text-sm px-2 py-0.5 rounded ${
                              v.heartRate && (v.heartRate > 150 || v.heartRate < 60)
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-50 text-slate-900'
                            }`}
                          >
                            {v.heartRate || '-'}
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">lpm</span>
                        </td>

                        {/* Respiratory Rate */}
                        <td className="p-3.5 text-center font-mono">
                          <span
                            className={`font-bold px-2 py-0.5 rounded ${
                              v.respiratoryRate && (v.respiratoryRate > 35 || v.respiratoryRate < 12)
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-50 text-slate-800'
                            }`}
                          >
                            {v.respiratoryRate || '-'}
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">rpm</span>
                        </td>

                        {/* Temperature */}
                        <td className="p-3.5 text-center font-mono">
                          <span
                            className={`font-black text-sm px-2 py-0.5 rounded ${
                              v.temperature && (v.temperature > 39.2 || v.temperature < 37.8)
                                ? 'bg-red-100 text-red-800 font-black'
                                : 'bg-slate-50 text-teal-800 font-bold'
                            }`}
                          >
                            {v.temperature ? `${v.temperature} °C` : '-'}
                          </span>
                        </td>

                        {/* Blood Pressure */}
                        <td className="p-3.5 text-center font-mono">
                          <span className="font-bold text-slate-900 block">
                            {v.systolicBP && v.diastolicBP ? `${v.systolicBP}/${v.diastolicBP}` : '-'}
                          </span>
                          <span className="text-[10px] text-teal-700 font-semibold block">
                            PAM: {v.meanBP || '-'} mmHg
                          </span>
                        </td>

                        {/* SpO2 */}
                        <td className="p-3.5 text-center font-mono">
                          <span
                            className={`font-bold px-2 py-0.5 rounded ${
                              v.spo2 && v.spo2 < 95
                                ? 'bg-red-100 text-red-800 animate-pulse'
                                : 'bg-cyan-50 text-cyan-800'
                            }`}
                          >
                            {v.spo2 ? `${v.spo2}%` : '-'}
                          </span>
                        </td>

                        {/* TLLC & Mucosas */}
                        <td className="p-3.5 text-center">
                          <span className="text-[11px] font-bold block text-slate-800">
                            {v.capillaryRefillTime ? `${v.capillaryRefillTime}s` : '1.5s'}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.2 rounded inline-block ${
                              v.mucousMembranes === 'ROSADAS'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {v.mucousMembranes || 'Rosadas'}
                          </span>
                        </td>

                        {/* Pain Scale */}
                        <td className="p-3.5 text-center font-mono">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[11px] ${
                              v.painScale && v.painScale >= 5
                                ? 'bg-red-100 text-red-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {v.painScale !== undefined ? `${v.painScale}/10` : '0/10'}
                          </span>
                        </td>

                        {/* Alerts */}
                        <td className="p-3.5">
                          {hasAlerts ? (
                            <div className="space-y-1">
                              {alerts.map((al, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200 block truncate max-w-xs"
                                >
                                  ⚠️ {al.message}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                              Normofisiológico
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleViewPatientDetail(patient.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition-colors"
                          >
                            Ver Ficha →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Quick Register Modal */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Registrar Constantes Fisiológicas & Signos Vitales
                  </h2>
                  <p className="text-xs text-slate-400">
                    Carga rápida para consulta ambulatoria, internación o control prequirúrgico
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSaveVitalEntry} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
              {/* Patient Selector */}
              <div>
                <label className="font-bold text-slate-900 block mb-1">Paciente:</label>
                <select
                  value={targetPatientId}
                  onChange={(e) => {
                    setTargetPatientId(e.target.value);
                    const p = patients.find((pat) => pat.id === e.target.value);
                    if (p) setRegWeight(p.weight.toString());
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} • {p.breed} • {p.weight} kg)
                    </option>
                  ))}
                </select>
              </div>

              {/* Main Vitals Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Temp. (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={regTemp}
                    onChange={(e) => setRegTemp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">FC (lpm):</label>
                  <input
                    type="number"
                    value={regHR}
                    onChange={(e) => setRegHR(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">FR (rpm):</label>
                  <input
                    type="number"
                    value={regFR}
                    onChange={(e) => setRegFR(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SpO2 (%):</label>
                  <input
                    type="number"
                    value={regSpO2}
                    onChange={(e) => setRegSpO2(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Tensión Arterial (TAS/TAD/TAM), HGT, Peso */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">TAS (Sistólica):</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={regPAS}
                    onChange={(e) => {
                      setRegPAS(e.target.value);
                      const s = parseInt(e.target.value);
                      const d = parseInt(regPAD);
                      if (!isNaN(s) && !isNaN(d)) setRegPAM(Math.round(d + (s - d) / 3).toString());
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">TAD (Diastólica):</label>
                  <input
                    type="number"
                    placeholder="75"
                    value={regPAD}
                    onChange={(e) => {
                      setRegPAD(e.target.value);
                      const d = parseInt(e.target.value);
                      const s = parseInt(regPAS);
                      if (!isNaN(s) && !isNaN(d)) setRegPAM(Math.round(d + (s - d) / 3).toString());
                    }}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-teal-800">TAM (Media):</label>
                  <input
                    type="number"
                    placeholder="85"
                    value={regPAM}
                    onChange={(e) => setRegPAM(e.target.value)}
                    className="w-full bg-teal-50/50 border border-teal-500 rounded-lg p-2 font-bold font-mono text-slate-900 ring-1 ring-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-amber-800">HGT (mg/dL):</label>
                  <input
                    type="number"
                    placeholder="95"
                    value={regGlucose}
                    onChange={(e) => setRegGlucose(e.target.value)}
                    className="w-full bg-amber-50/40 border border-amber-400 rounded-lg p-2 font-bold font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peso (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={regWeight}
                    onChange={(e) => setRegWeight(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Mucosas, TLLC, Dolor, Conciencia */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Color Mucosas:</label>
                  <select
                    value={regMucosas}
                    onChange={(e) => setRegMucosas(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                  >
                    <option value="ROSADAS">Rosadas (Normal)</option>
                    <option value="PALIDAS">Pálidas (Anemia/Shock)</option>
                    <option value="CONGESTIVAS">Congestivas (Sepsis)</option>
                    <option value="CIANOTICAS">Cianóticas (Hipoxia)</option>
                    <option value="ICTERICAS">Ictéricas (Hepático)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">TLLC (segundos):</label>
                  <input
                    type="number"
                    step="0.5"
                    value={regTLLC}
                    onChange={(e) => setRegTLLC(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Escala de Dolor (0-10):</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={regPain}
                    onChange={(e) => setRegPain(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Conciencia:</label>
                  <select
                    value={regConsciousness}
                    onChange={(e) => setRegConsciousness(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-bold text-slate-900"
                  >
                    <option value="ALERTA">Alerta / Normal</option>
                    <option value="DEPRIMIDO">Deprimido</option>
                    <option value="ESTUPOR">Estupor</option>
                    <option value="COMA">Coma</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Observaciones Clínicas:</label>
                <textarea
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Constantes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
