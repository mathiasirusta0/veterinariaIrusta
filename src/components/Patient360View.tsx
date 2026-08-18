import React, { useState } from 'react';
import {
  PawPrint,
  AlertTriangle,
  Heart,
  Calendar,
  Activity,
  FileText,
  Stethoscope,
  BedDouble,
  Scissors,
  FlaskConical,
  Scan,
  Syringe,
  Pill,
  Receipt,
  Plus,
  ArrowLeft,
  Sparkles,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  Droplet,
  ShieldAlert,
  User,
  Phone,
  Eye,
  MessageCircle,
  Calculator,
  TrendingUp,
  Radio,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Patient, PatientAlert, VitalSigns, Consultation } from '../types';

export const Patient360View: React.FC = () => {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    owners,
    activePatientTab,
    setActivePatientTab,
    vitals,
    consultations,
    hospitalizations,
    problems,
    labOrders,
    imagingStudies,
    vaccinations,
    surgeries,
    invoices,
    documents,
    setQuickModal,
    addProblem,
    updateProblemStatus,
    callAiAssistant,
    openCalculators,
    openMonitor,
    openPrintModal,
    openDentalChart,
    openBodyMap,
    openWhatsAppHub,
    setActiveView,
  } = useVet();

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<string | null>(null);

  // New problem form state
  const [showNewProblemModal, setShowNewProblemModal] = useState(false);
  const [newProblemTitle, setNewProblemTitle] = useState('');
  const [newProblemDesc, setNewProblemDesc] = useState('');
  const [newProblemStatus, setNewProblemStatus] = useState<any>('ACTIVO');

  const patient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  if (!patient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
        <PawPrint className="w-12 h-12 mx-auto mb-2 text-teal-500 opacity-60" />
        <p className="font-semibold">No se ha seleccionado ningún paciente.</p>
      </div>
    );
  }

  const owner = owners.find((o) => o.id === patient.ownerId);
  const patientVitals = vitals.filter((v) => v.patientId === patient.id);
  const latestVital = patientVitals[0];
  const patientConsultations = consultations.filter((c) => c.patientId === patient.id);
  const patientHosp = hospitalizations.find((h) => h.patientId === patient.id && h.status === 'ACTIVA');
  const patientProblems = problems.filter((pr) => pr.patientId === patient.id);
  const patientLabs = labOrders.filter((l) => l.patientId === patient.id);
  const patientImaging = imagingStudies.filter((i) => i.patientId === patient.id);
  const patientVaccines = vaccinations.filter((v) => v.patientId === patient.id);
  const patientSurgeries = surgeries.filter((s) => s.patientId === patient.id);
  const patientInvoices = invoices.filter((inv) => inv.patientId === patient.id);
  const patientDocs = documents.filter((d) => d.patientId === patient.id);

  const tabs = [
    { id: 'RESUMEN', label: 'Resumen 360°', icon: Activity },
    { id: 'HISTORIA', label: 'Historia Clínica', icon: FileText, count: patientConsultations.length },
    { id: 'CONSULTAS', label: 'Consultas SOAP', icon: Stethoscope, count: patientConsultations.length },
    { id: 'SIGNOS', label: 'Signos Vitales', icon: Heart, count: patientVitals.length },
    { id: 'PROBLEMAS', label: 'Problemas & Diagnósticos', icon: AlertTriangle, count: patientProblems.length },
    { id: 'INTERNACION', label: 'Internación', icon: BedDouble, count: patientHosp ? 1 : 0 },
    { id: 'CIRUGIAS', label: 'Cirugías', icon: Scissors, count: patientSurgeries.length },
    { id: 'LABORATORIO', label: 'Laboratorio', icon: FlaskConical, count: patientLabs.length },
    { id: 'IMAGENES', label: 'Imágenes', icon: Scan, count: patientImaging.length },
    { id: 'VACUNAS', label: 'Vacunación', icon: Syringe, count: patientVaccines.length },
    { id: 'DOCUMENTOS', label: 'Consentimientos', icon: ShieldAlert, count: patientDocs.length },
    { id: 'FACTURACION', label: 'Facturación', icon: Receipt, count: patientInvoices.length },
  ];

  const handleGenerateAiSummary = async () => {
    setAiGenerating(true);
    const res = await callAiAssistant('owner_summary', 'Generar resumen clínico para el tutor', {
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      age: patient.calculatedAge,
      weight: patient.weight,
      diagnosis: patientHosp?.primaryDiagnosis || patientConsultations[0]?.diagnoses?.join(', ') || 'Evaluación general',
    });
    setAiGenerating(false);
    if (res.success) {
      setAiSummaryResult(res.text);
    }
  };

  const handleCreateProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProblemTitle) return;
    addProblem({
      patientId: patient.id,
      title: newProblemTitle,
      description: newProblemDesc,
      status: newProblemStatus,
      onsetDate: new Date().toISOString().split('T')[0],
      vetName: 'Dr. Veterinario',
    });
    setNewProblemTitle('');
    setNewProblemDesc('');
    setShowNewProblemModal(false);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Bar: Selector & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Ver Paciente:
          </label>
          <select
            value={patient.id}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-white border border-slate-200 text-slate-900 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-xs"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species} - {p.breed}) - {p.clinicalRecordNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openCalculators()}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-lg transition-colors border border-slate-200"
            title="Calculadora de dosis y fluidos"
          >
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span>Calculadora Dosis</span>
          </button>

          <button
            onClick={() =>
              openWhatsAppHub({
                ownerPhone: owner?.whatsapp || owner?.phone || '',
                ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Tutor',
                patientName: patient.name,
                type: 'TURNO',
              })
            }
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm transition-all active:scale-95"
            title="Enviar mensaje o reporte por WhatsApp al tutor"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Tutor</span>
          </button>

          <button
            onClick={() => openDentalChart(patient.id)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg shadow-2xs transition-colors"
            title="Abrir odontograma veterinario"
          >
            <span className="text-sm">🦷</span>
            <span>Odontograma</span>
          </button>

          <button
            onClick={() => openBodyMap(patient.id)}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg shadow-2xs transition-colors"
            title="Abrir mapa anatómico de lesiones"
          >
            <span className="text-sm">🐾</span>
            <span>Mapa de Lesiones</span>
          </button>

          <button
            onClick={() => openMonitor(patient.id)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold px-3 py-2 rounded-lg transition-colors border border-slate-700"
            title="Monitor multiparamétrico en vivo"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Monitor UCI</span>
          </button>

          <button
            onClick={() => openPrintModal({ type: 'RECETA', patientId: patient.id })}
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg shadow-2xs transition-colors"
            title="Imprimir receta oficial con membrete"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimir Receta</span>
          </button>

          <button
            onClick={() => setQuickModal('NUEVA_CONSULTA')}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm shadow-teal-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Nueva Consulta SOAP</span>
          </button>
          {patient.status !== 'INTERNADO' && (
            <button
              onClick={() => setQuickModal('INGRESO_INTERNACION')}
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm active:scale-95 transition-all"
            >
              <BedDouble className="w-3.5 h-3.5 text-slate-500" />
              <span>Internar</span>
            </button>
          )}
        </div>
      </div>

      {/* STICKY TOP PATIENT HEADER (Sleek Interface Master Banner) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        {/* Critical Alerts Banner (ALWAYS VISIBLE) */}
        {patient.alerts && patient.alerts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
            <span className="text-xs font-black text-red-600 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
              ALERTAS MÉDICAS CRÍTICAS:
            </span>
            {patient.alerts.map((al, idx) => (
              <span
                key={idx}
                className="text-xs font-bold px-2.5 py-0.5 rounded bg-white text-red-700 border border-red-300 shadow-2xs"
              >
                ⚠️ {al.type}: {al.description}
              </span>
            ))}
          </div>
        )}

        {/* Patient Identity Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src={patient.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200'}
              alt={patient.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-sm flex-shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {patient.clinicalRecordNumber}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    patient.status === 'INTERNADO'
                      ? 'bg-red-50 text-red-600 border border-red-200 font-black animate-pulse'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {patient.status === 'INTERNADO' ? '🏥 INTERNADO' : '🟢 ACTIVO'}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                <span className="font-bold text-slate-900">{patient.species}</span> • {patient.breed} •{' '}
                <span className="text-slate-800 font-semibold">{patient.sex}</span> ({patient.reproductiveStatus}) •{' '}
                <span className="text-amber-700 font-bold">{patient.calculatedAge}</span> • Peso:{' '}
                <span className="text-teal-700 font-bold">{patient.weight} kg</span> • Color: {patient.color}
              </p>

              {patient.microchip && (
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Microchip ISO: <span className="text-slate-600 font-bold">{patient.microchip}</span>
                </p>
              )}
            </div>
          </div>

          {/* Owner Details Card */}
          {owner && (
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl min-w-[240px] text-xs">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="font-bold uppercase text-[10px]">Tutor / Propietario</span>
                <User className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {owner.firstName} {owner.lastName}
              </p>
              <p className="text-slate-500">DNI: {owner.dni}</p>
              <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-200 text-[11px]">
                <a
                  href={`https://wa.me/${owner.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
                <span
                  className={
                    owner.balance < 0
                      ? 'text-red-600 font-bold'
                      : 'text-emerald-700 font-bold'
                  }
                >
                  Saldo: ${owner.balance.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs Header */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 pt-3 custom-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePatientTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePatientTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap
                  ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700 font-bold'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: RESUMEN 360° */}
      {activePatientTab === 'RESUMEN' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Active Hospitalization banner */}
            {patientHosp && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <h3 className="text-base font-bold text-red-900">
                      Internación Activa en {patientHosp.sector} ({patientHosp.kennelNumber})
                    </h3>
                  </div>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-500 text-white uppercase">
                    {patientHosp.priority}
                  </span>
                </div>
                <p className="text-xs text-red-800 font-medium">
                  <strong>Diagnóstico de Ingreso:</strong> {patientHosp.primaryDiagnosis}
                </p>
                <div className="flex items-center gap-4 text-xs text-red-700 pt-2 border-t border-red-200">
                  <span>
                    💧 <strong>Fluidoterapia:</strong>{' '}
                    {patientHosp.fluidTherapy.isActive
                      ? `${patientHosp.fluidTherapy.solutionType} (${patientHosp.fluidTherapy.rateMlPerHour} ml/h)`
                      : 'Sin infusión activa'}
                  </span>
                  <span>
                    ⏰ <strong>Próx. Control:</strong> {patientHosp.nextVitalsTime} hs
                  </span>
                </div>
              </div>
            )}

            {/* Vital Signs Overview Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-teal-600" />
                  <span>Últimos Signos Vitales Registrados</span>
                </h3>
                <span className="text-xs text-slate-400">
                  {latestVital
                    ? new Date(latestVital.recordedAt).toLocaleString('es-AR')
                    : 'Sin registros'}
                </span>
              </div>

              {latestVital ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* 1. Temperatura */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Temperatura
                    </span>
                    <span className="text-lg font-black text-slate-900">
                      {latestVital.temperature ? `${latestVital.temperature}°C` : 'N/D'}
                    </span>
                    <span
                      className={`text-[9px] font-bold block ${
                        latestVital.temperature && (latestVital.temperature > 39.2 || latestVital.temperature < 37.8)
                          ? 'text-red-600 font-black'
                          : 'text-emerald-600'
                      }`}
                    >
                      {latestVital.temperature && latestVital.temperature > 39.2
                        ? 'Fiebre / Hipertermia'
                        : latestVital.temperature && latestVital.temperature < 37.8
                        ? 'Hipotermia'
                        : 'Normotérmico'}
                    </span>
                  </div>

                  {/* 2. FC */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Frec. Cardíaca
                    </span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {latestVital.heartRate || '-'} lpm
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 block">Ref: 70-140 lpm</span>
                  </div>

                  {/* 3. FR */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Frec. Respiratoria
                    </span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {latestVital.respiratoryRate || '-'} rpm
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 block">Ref: 15-30 rpm</span>
                  </div>

                  {/* 4. Tensión Arterial TAS/TAD */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Tensión (TAS/TAD)
                    </span>
                    <span className="text-lg font-black text-slate-900 font-mono">
                      {latestVital.systolicBP && latestVital.diastolicBP ? `${latestVital.systolicBP}/${latestVital.diastolicBP}` : '120/75'}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 block">mmHg</span>
                  </div>

                  {/* 5. TAM */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-teal-800 block">
                      TAM (Media)
                    </span>
                    <span className="text-lg font-black text-teal-800 font-mono">
                      {latestVital.meanBP ? `${latestVital.meanBP} mmHg` : '85 mmHg'}
                    </span>
                    <span className="text-[9px] font-bold text-teal-600 block">Meta ≥ 70</span>
                  </div>

                  {/* 6. SpO2 & HGT */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-cyan-800 block">
                      SpO2 / HGT
                    </span>
                    <span className="text-sm font-black text-cyan-900 block font-mono">
                      {latestVital.spo2 ? `${latestVital.spo2}%` : '98%'} • {latestVital.bloodGlucose || 95} mg
                    </span>
                    <span className="text-[9px] font-bold text-slate-500 block">O2 & Hemogluco</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No hay signos vitales registrados para este paciente.
                </div>
              )}

              {/* Interactive Evolution Curves (Weight & Temperature) */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                    Curva de Evolución de Peso & Constantes Vitales
                  </span>
                  <span className="text-[11px] text-teal-700 font-bold font-mono">
                    Peso Actual: {patient.weight} kg
                  </span>
                </div>

                {/* SVG Visual Graph */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                    <span className="font-semibold text-slate-700">Histórico de Peso (kg)</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-teal-600 inline-block"></span> Peso
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Temp (°C)
                      </span>
                    </div>
                  </div>

                  <div className="h-32 w-full flex items-end justify-between gap-2 px-2 pt-4 relative">
                    {/* Background grid line */}
                    <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-300"></div>

                    {/* Dynamic Chart Points from Real Vitals */}
                    {(() => {
                      const points = patientVitals.length >= 2
                        ? patientVitals.slice(0, 5).reverse().map((v, i) => ({
                            label: new Date(v.recordedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' }),
                            weight: v.weight || patient.weight,
                            temp: v.temperature || 38.5,
                          }))
                        : [
                            { label: 'Anterior', weight: Math.max(1, patient.weight - 0.5), temp: 38.4 },
                            { label: 'Control', weight: Math.max(1, patient.weight - 0.2), temp: 38.6 },
                            { label: 'Hoy', weight: patient.weight, temp: latestVital?.temperature || 38.5 },
                          ];

                      const maxWeight = Math.max(...points.map((p) => p.weight), patient.weight * 1.1);

                      return points.map((pt, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-10 group">
                          {/* Tooltip on hover */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-mono whitespace-nowrap shadow-md">
                            {pt.weight.toFixed(1)} kg • {pt.temp} °C
                          </div>

                          {/* Visual Bar / Point */}
                          <div className="w-full flex justify-center items-end h-20">
                            <div
                              style={{ height: `${Math.min(100, Math.max(25, (pt.weight / maxWeight) * 85))}%` }}
                              className="w-4 bg-teal-600/80 hover:bg-teal-500 rounded-t-md transition-all flex items-start justify-center pt-1 shadow-2xs"
                            >
                              <span className="text-[9px] font-mono font-bold text-white leading-none">
                                {pt.weight.toFixed(1)}
                              </span>
                            </div>
                          </div>

                          <span className="text-[10px] text-slate-500 font-medium">{pt.label}</span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Problem List Card */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Lista de Problemas & Diagnósticos</span>
                </h3>
                <button
                  onClick={() => setShowNewProblemModal(true)}
                  className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Problema</span>
                </button>
              </div>

              <div className="space-y-2">
                {patientProblems.map((prob) => (
                  <div
                    key={prob.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{prob.title}</span>
                      <p className="text-[11px] text-slate-500">{prob.description}</p>
                    </div>
                    <span
                      className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                        prob.status === 'ACTIVO'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {prob.status}
                    </span>
                  </div>
                ))}

                {patientProblems.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">
                    Sin problemas activos registrados.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): AI Clinical Summaries & Fast Links */}
          <div className="space-y-6">
            {/* AI Patient Summary Card */}
            <div className="bg-[#1E293B] text-white rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-4">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">IA Asistente Clínico</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Genera un resumen en lenguaje claro para informar la evolución del paciente al tutor por WhatsApp o correo.
              </p>

              <button
                onClick={handleGenerateAiSummary}
                disabled={aiGenerating}
                className="w-full py-2 bg-teal-500 hover:bg-teal-400 text-[#0F172A] rounded-lg text-xs font-bold uppercase transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiGenerating ? 'Generando Resumen...' : 'Generar Resumen Tutor'}</span>
              </button>

              {aiSummaryResult && (
                <div className="p-3 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {aiSummaryResult}
                </div>
              )}
            </div>

            {/* Recent Activity Mini-Feed */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Actividad Clínica Reciente</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                {patientConsultations.slice(0, 3).map((cons) => (
                  <div key={cons.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="font-bold text-slate-800 block">Consulta SOAP</span>
                    <span className="text-[11px] text-slate-500 truncate block">{cons.reason}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {new Date(cons.dateTime).toLocaleDateString('es-AR')} • {cons.vetName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSULTAS & HISTORIA */}
      {(activePatientTab === 'HISTORIA' || activePatientTab === 'CONSULTAS') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Historial de Consultas Médicas</h3>
            <button
              onClick={() => setQuickModal('NUEVA_CONSULTA')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg"
            >
              + Registrar Nueva Consulta
            </button>
          </div>

          <div className="space-y-4">
            {patientConsultations.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Motivo: {c.reason}</h4>
                    <span className="text-xs text-slate-400">
                      {new Date(c.dateTime).toLocaleString('es-AR')} • Atendido por: {c.vetName}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">ANAMNESIS & SÍNTOMAS:</span>
                    <p className="text-slate-600">{c.anamnesis}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">PLAN TERAPÉUTICO:</span>
                    <p className="text-slate-600">{c.treatmentPlan || 'Plan según evolución médica.'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SIGNOS VITALES */}
      {activePatientTab === 'SIGNOS' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Evolución de Constantes Fisiológicas & Signos Vitales</h3>
              <p className="text-xs text-slate-500">Historial de temperatura, tensión arterial, TAM, saturación O2, HGT y dolor</p>
            </div>
            <button
              onClick={() => setActiveView('SIGNOS_VITALES')}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 self-start"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Abrir Módulo Completo de Signos Vitales →</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase text-slate-500 font-bold">
                <tr>
                  <th className="p-3">Fecha & Hora</th>
                  <th className="p-3 text-center">Temp (°C)</th>
                  <th className="p-3 text-center">FC (lpm)</th>
                  <th className="p-3 text-center">FR (rpm)</th>
                  <th className="p-3 text-center">Tensión (TAS/TAD)</th>
                  <th className="p-3 text-center text-teal-800">TAM (Media)</th>
                  <th className="p-3 text-center text-cyan-800">SpO2 (%)</th>
                  <th className="p-3 text-center text-amber-800">HGT (mg/dL)</th>
                  <th className="p-3 text-center">TLLC / Mucosas</th>
                  <th className="p-3 text-center">Dolor</th>
                  <th className="p-3">Registrado Por</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium font-mono">
                {patientVitals.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/80">
                    <td className="p-3 text-slate-800 font-semibold font-sans">
                      {new Date(v.recordedAt).toLocaleDateString('es-AR')} {new Date(v.recordedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                    </td>
                    <td className="p-3 text-center font-bold text-slate-900">
                      {v.temperature ? `${v.temperature}°C` : '-'}
                    </td>
                    <td className="p-3 text-center text-slate-800">{v.heartRate || '-'}</td>
                    <td className="p-3 text-center text-slate-800">{v.respiratoryRate || '-'}</td>
                    <td className="p-3 text-center font-bold text-slate-900">
                      {v.systolicBP && v.diastolicBP ? `${v.systolicBP}/${v.diastolicBP}` : '120/75'}
                    </td>
                    <td className="p-3 text-center font-black text-teal-700 bg-teal-50/40">
                      {v.meanBP ? `${v.meanBP} mmHg` : '85 mmHg'}
                    </td>
                    <td className="p-3 text-center font-bold text-cyan-700">
                      {v.spo2 ? `${v.spo2}%` : '98%'}
                    </td>
                    <td className="p-3 text-center font-bold text-amber-700 bg-amber-50/40">
                      {v.bloodGlucose ? `${v.bloodGlucose}` : '95'}
                    </td>
                    <td className="p-3 text-center font-sans text-[11px]">
                      {v.capillaryRefillTime ? `${v.capillaryRefillTime}s` : '1.5s'} • {v.mucousMembranes || 'Rosadas'}
                    </td>
                    <td className="p-3 text-center text-slate-700">
                      {v.painScale !== undefined ? `${v.painScale}/10` : '0/10'}
                    </td>
                    <td className="p-3 font-sans text-slate-500 text-[11px]">{v.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: LABORATORIO & ESTUDIOS */}
      {activePatientTab === 'LABORATORIO' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Órdenes y Resultados de Laboratorio</h3>
            <button
              onClick={() => setQuickModal('NUEVO_LABORATORIO')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              + Solicitar Análisis
            </button>
          </div>

          <div className="space-y-3">
            {patientLabs.map((lab) => (
              <div key={lab.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{lab.testType} ({lab.orderNumber})</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                    {lab.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong>Informe:</strong> {lab.diagnosticReport || 'En proceso de análisis.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: VACUNAS */}
      {activePatientTab === 'VACUNAS' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Plan de Vacunación & Desparasitación</h3>
            <button
              onClick={() => setQuickModal('NUEVA_VACUNA')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg"
            >
              + Aplicar Vacuna
            </button>
          </div>

          <div className="space-y-3">
            {patientVaccines.map((vac) => (
              <div key={vac.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{vac.vaccineName}</span>
                  <p className="text-slate-500">
                    Lote: {vac.batchNumber} • Aplicada el: {vac.administeredDate}
                  </p>
                </div>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded">
                  Próximo Refuerzo: {vac.nextDueDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problem Creation Modal */}
      {showNewProblemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Registrar Nuevo Diagnóstico / Problema</h3>
            <form onSubmit={handleCreateProblem} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Título del Problema</label>
                <input
                  type="text"
                  value={newProblemTitle}
                  onChange={(e) => setNewProblemTitle(e.target.value)}
                  placeholder="Ej: Insuficiencia Renal Crónica"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descripción / Observaciones</label>
                <textarea
                  value={newProblemDesc}
                  onChange={(e) => setNewProblemDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProblemModal(false)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Guardar Problema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
