import React, { useState } from 'react';
import {
  PawPrint,
  Calendar,
  AlertTriangle,
  FileText,
  Activity,
  BedDouble,
  Scissors,
  FlaskConical,
  Scan,
  Syringe,
  Receipt,
  User,
  Phone,
  Clock,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Plus,
  ShieldAlert,
  Calculator,
  Eye,
  Radio,
  Printer,
  ChevronRight,
  ChevronDown,
  Copy,
  MessageSquare,
  Droplet,
  ExternalLink,
  Stethoscope,
  Heart,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { ProblemStatus, PatientProblem } from '../types';

export const Patient360View: React.FC = () => {
  const {
    selectedPatientId,
    setSelectedPatientId,
    patients,
    owners,
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
    activePatientTab,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    addProblem,
    updateProblemStatus,
    callAiAssistant,
    openCalculators,
    openMonitor,
    openPrintModal,
    openDentalChart,
    openBodyMap,
    openAnesthesiaChart,
    openWhatsAppHub,
    openImagingAnnotator,
    showToast,
  } = useVet();

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<string | null>(null);

  // New problem form state
  const [showNewProblemModal, setShowNewProblemModal] = useState(false);
  const [newProblemTitle, setNewProblemTitle] = useState('');
  const [newProblemDesc, setNewProblemDesc] = useState('');
  const [newProblemStatus, setNewProblemStatus] = useState<ProblemStatus>('ACTIVO');

  const patient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  if (!patient) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm">
        <PawPrint className="w-14 h-14 mx-auto mb-3 text-teal-500 opacity-60 animate-bounce" />
        <h3 className="text-base font-bold text-slate-800">No se ha seleccionado ningún paciente</h3>
        <p className="text-xs text-slate-400 mt-1">Seleccioná un paciente del directorio para ver su Ficha Médica 360°.</p>
      </div>
    );
  }

  const owner = owners.find((o) => o.id === patient.ownerId);
  const patientVitals = vitals.filter((v) => v.patientId === patient.id);
  const latestVital = patientVitals[0];
  const patientConsultations = consultations.filter((c) => c.patientId === patient.id);
  const patientHosp = hospitalizations.find((h) => h.patientId === patient.id && h.status === 'ACTIVA');
  const allPatientHosps = hospitalizations.filter((h) => h.patientId === patient.id);
  const patientProblems = problems.filter((pr) => pr.patientId === patient.id);
  const patientLabs = labOrders.filter((l) => l.patientId === patient.id);
  const patientImaging = imagingStudies.filter((i) => i.patientId === patient.id);
  const patientVaccines = vaccinations.filter((v) => v.patientId === patient.id);
  const patientSurgeries = surgeries.filter((s) => s.patientId === patient.id);
  const patientInvoices = invoices.filter((inv) => inv.patientId === patient.id);
  const patientDocs = documents.filter((d) => d.patientId === patient.id);

  // Chronological Unified Timeline Items
  const timelineEvents = [
    ...patientConsultations.map((c) => ({
      id: c.id,
      date: c.dateTime,
      type: 'CONSULTA',
      title: `Consulta Médica: ${c.reason}`,
      subtitle: `Atendió: ${c.vetName}`,
      tag: 'SOAP',
      tagColor: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: '🩺',
      details: c.diagnoses?.join(', ') || c.anamnesis,
    })),
    ...allPatientHosps.map((h) => ({
      id: h.id,
      date: h.admittedAt,
      type: 'INTERNACION',
      title: `Internación Hospitalaria — Sector ${h.sector} (Canil ${h.kennelNumber})`,
      subtitle: `Diag: ${h.primaryDiagnosis} • Responsable: ${h.vetInChargeName}`,
      tag: h.status,
      tagColor: h.status === 'ACTIVA' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-700',
      icon: '🏥',
      details: h.fluidTherapy ? `Fluidoterapia: ${h.fluidTherapy.rateMlPerHour} ml/h (${h.fluidTherapy.solution})` : '',
    })),
    ...patientSurgeries.map((s) => ({
      id: s.id,
      date: s.date,
      type: 'CIRUGIA',
      title: `Procedimiento Quirúrgico: ${s.procedureName}`,
      subtitle: `Cirujano: ${s.surgeonName} • Anestesista: ${s.anesthetistName}`,
      tag: s.status,
      tagColor: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: '✂️',
      details: s.surgicalTechnique || 'Sin complicaciones reportadas.',
    })),
    ...patientVaccines.map((v) => ({
      id: v.id,
      date: v.administeredDate,
      type: 'VACUNA',
      title: `Inmunización: ${v.vaccineName}`,
      subtitle: `Lote: ${v.batchNumber} • Próximo Refuerzo: ${v.nextDueDate}`,
      tag: 'Plan Sanitario',
      tagColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: '💉',
      details: `Aplicado en ${patient.name}`,
    })),
    ...patientLabs.map((l) => ({
      id: l.id,
      date: l.orderDate,
      type: 'LABORATORIO',
      title: `Análisis de Laboratorio: ${l.testType}`,
      subtitle: `Orden #${l.orderNumber} • ${l.status}`,
      tag: l.status,
      tagColor: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: '🧪',
      details: l.diagnosticReport || 'Estudio en proceso de análisis.',
    })),
    ...patientImaging.map((img) => ({
      id: img.id,
      date: img.date,
      type: 'IMAGEN',
      title: `Estudio de Imagen: ${img.modality} ${img.region}`,
      subtitle: `Estudio #${img.studyNumber} • Especialista: ${img.specialistName}`,
      tag: img.status,
      tagColor: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: '🔬',
      details: img.conclusion || img.findings,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tabs = [
    { id: 'RESUMEN', label: 'Resumen 360°', icon: Activity },
    { id: 'HISTORIA', label: 'Historia Clínica', icon: FileText, count: timelineEvents.length },
    { id: 'CONSULTAS', label: 'Consultas SOAP', icon: Stethoscope, count: patientConsultations.length },
    { id: 'SIGNOS', label: 'Signos Vitales', icon: Heart, count: patientVitals.length },
    { id: 'PROBLEMAS', label: 'Problemas & Diagnósticos', icon: AlertTriangle, count: patientProblems.length },
    { id: 'INTERNACION', label: 'Internación', icon: BedDouble, count: allPatientHosps.length },
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
    showToast('success', 'Problema Registrado', `Diagnóstico ${newProblemTitle} añadido a la lista.`);
  };

  const handleCopyMicrochip = (chip: string) => {
    navigator.clipboard.writeText(chip);
    showToast('info', 'Microchip Copiado', `Código ISO ${chip} copiado al portapapeles.`);
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Top Bar: Selector & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            Ver Paciente:
          </label>
          <select
            value={patient.id}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-900 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species} • {p.breed}) — {p.clinicalRecordNumber}
              </option>
            ))}
          </select>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => openCalculators()}
            className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-colors border border-slate-200"
            title="Calculadora de dosis y fluidos"
          >
            <Calculator className="w-3.5 h-3.5 text-teal-600" />
            <span>Calculadora Dosis</span>
          </button>

          {owner && (
            <button
              onClick={() =>
                openWhatsAppHub({
                  patientName: patient.name,
                  species: patient.species,
                  ownerName: `${owner.firstName} ${owner.lastName}`,
                  ownerPhone: owner.phone,
                  diagnosis: patientHosp?.primaryDiagnosis || patientConsultations[0]?.diagnoses?.join(', ') || 'Control general',
                })
              }
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-colors"
            >
              <span>💬</span>
              <span>WhatsApp Tutor</span>
            </button>
          )}

          <button
            onClick={() => openDentalChart(patient.id)}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors border border-slate-200 shadow-2xs"
            title="Odontograma Triadan"
          >
            <span>🦷</span>
            <span>Odontograma</span>
          </button>

          <button
            onClick={() => openBodyMap(patient.id)}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors border border-slate-200 shadow-2xs"
            title="Mapa Anatómico de Lesiones"
          >
            <span>🐾</span>
            <span>Mapa de Lesiones</span>
          </button>

          <button
            onClick={() => openMonitor(patient.id)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold px-3 py-2 rounded-xl transition-colors border border-slate-800 shadow-xs"
            title="Telemetría en Vivo UCI"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Monitor UCI</span>
          </button>

          <button
            onClick={() =>
              openPrintModal(
                'RECETA_MEDICA',
                {
                  patientName: patient.name,
                  species: patient.species,
                  breed: patient.breed,
                  age: patient.calculatedAge,
                  weight: patient.weight,
                  ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'N/A',
                  ownerDni: owner?.dni,
                  prescriptions: patientConsultations[0]?.prescriptions || [
                    { drugName: 'Amoxicilina + Ác. Clavulánico', presentation: 'Comprimidos 500mg', dose: '12.5 mg/kg', frequency: 'Cada 12 horas', duration: '7 días', instructions: 'Administrar junto con alimento.' },
                  ],
                },
                'Receta Médica Digital'
              )
            }
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimir Receta</span>
          </button>

          <button
            onClick={() => setQuickModal('NUEVA_CONSULTA')}
            className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Consulta SOAP</span>
          </button>
        </div>
      </div>

      {/* MASTER PATIENT HEADER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
        {/* Critical Alerts Banner */}
        {patient.alerts && patient.alerts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl">
            <span className="text-xs font-black text-red-600 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
              ALERTAS MÉDICAS CRÍTICAS:
            </span>
            {patient.alerts.map((al, idx) => (
              <span
                key={idx}
                className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-white text-red-700 border border-red-300 shadow-2xs"
              >
                ⚠️ {al.type}: {al.description}
              </span>
            ))}
          </div>
        )}

        {/* Patient Identity Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <img
                src={patient.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200'}
                alt={patient.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <span className="absolute -bottom-1 -right-1 text-sm bg-white p-0.5 rounded-full shadow-2xs">
                {patient.species === 'Canino' ? '🐕' : patient.species === 'Felino' ? '🐈' : '🦜'}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  HC: {patient.clinicalRecordNumber}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase ${
                    patient.status === 'INTERNADO' || patientHosp
                      ? 'bg-red-50 text-red-600 border border-red-200 font-black animate-pulse'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {patient.status === 'INTERNADO' || patientHosp ? '🏥 INTERNADO' : '🟢 AMBULATORIO'}
                </span>
              </div>

              <p className="text-xs text-slate-600 font-medium">
                <span className="font-bold text-slate-900">{patient.species}</span> • {patient.breed} •{' '}
                <span className="text-slate-800 font-semibold">{patient.sex}</span> ({patient.reproductiveStatus}) •{' '}
                <span className="text-amber-700 font-bold">{patient.calculatedAge}</span> • Peso:{' '}
                <span className="text-teal-700 font-bold font-mono">{patient.weight} kg</span> • Color: {patient.color}
              </p>

              {patient.microchip && (
                <div className="flex items-center gap-1.5 mt-1 text-[11px] font-mono text-slate-500">
                  <span>Microchip ISO: <strong className="text-slate-700">{patient.microchip}</strong></span>
                  <button
                    onClick={() => handleCopyMicrochip(patient.microchip!)}
                    className="text-teal-600 hover:text-teal-800 p-0.5"
                    title="Copiar código microchip"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Owner Details Card */}
          {owner && (
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl min-w-[260px] text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-500">
                <span className="font-bold uppercase text-[10px]">Tutor / Propietario</span>
                <User className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <p className="font-bold text-slate-900 text-sm">
                {owner.firstName} {owner.lastName}
              </p>
              <p className="text-slate-500">DNI: {owner.dni} • Tel: {owner.phone}</p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                <button
                  onClick={() =>
                    openWhatsAppHub({
                      patientName: patient.name,
                      species: patient.species,
                      ownerName: `${owner.firstName} ${owner.lastName}`,
                      ownerPhone: owner.phone,
                      diagnosis: 'Control general en clínica veterinaria',
                    })
                  }
                  className="text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Mensaje WhatsApp</span>
                </button>
                <a
                  href={`tel:${owner.phone.replace(/[^0-9]/g, '')}`}
                  className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Llamar</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 12-Tab Clinical Navigation Bar */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 border-t border-slate-100 pt-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePatientTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePatientTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
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

      {/* TAB CONTENT AREA */}

      {/* TAB 1: RESUMEN 360° */}
      {activePatientTab === 'RESUMEN' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column (2 Cols): Biometrics & Problems */}
          <div className="lg:col-span-2 space-y-5">
            {/* Latest Vitals Card */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <span>Últimos Signos Vitales Registrados</span>
                </h3>
                {latestVital && (
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(latestVital.recordedAt).toLocaleString('es-AR')}
                  </span>
                )}
              </div>

              {latestVital ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {/* 1. Temperatura */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Temperatura</span>
                    <span className="text-lg font-black text-slate-900">{latestVital.temperature ? `${latestVital.temperature}°C` : 'N/D'}</span>
                    <span className={`text-[9px] font-bold block ${latestVital.temperature && (latestVital.temperature > 39.2 || latestVital.temperature < 37.8) ? 'text-red-600 font-black' : 'text-emerald-600'}`}>
                      {latestVital.temperature && latestVital.temperature > 39.2 ? 'Fiebre' : latestVital.temperature && latestVital.temperature < 37.8 ? 'Hipotermia' : 'Normotérmico'}
                    </span>
                  </div>

                  {/* 2. FC */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Frec. Cardíaca</span>
                    <span className="text-lg font-black text-slate-900 font-mono">{latestVital.heartRate || '-'} lpm</span>
                    <span className="text-[9px] font-bold text-slate-500 block">Ref: 70-140 lpm</span>
                  </div>

                  {/* 3. FR */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Frec. Resp.</span>
                    <span className="text-lg font-black text-slate-900 font-mono">{latestVital.respiratoryRate || '-'} rpm</span>
                    <span className="text-[9px] font-bold text-slate-500 block">Ref: 15-30 rpm</span>
                  </div>

                  {/* 4. Tensión TAS/TAD */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tensión (TAS/TAD)</span>
                    <span className="text-lg font-black text-slate-900 font-mono">{latestVital.systolicBP && latestVital.diastolicBP ? `${latestVital.systolicBP}/${latestVital.diastolicBP}` : '120/75'}</span>
                    <span className="text-[9px] font-bold text-slate-500 block">mmHg</span>
                  </div>

                  {/* 5. TAM */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-teal-800 block">TAM (Media)</span>
                    <span className="text-lg font-black text-teal-800 font-mono">{latestVital.meanBP ? `${latestVital.meanBP} mmHg` : '85 mmHg'}</span>
                    <span className="text-[9px] font-bold text-teal-600 block">Meta ≥ 70</span>
                  </div>

                  {/* 6. SpO2 & HGT */}
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                    <span className="text-[10px] uppercase font-bold text-cyan-800 block">SpO2 / HGT</span>
                    <span className="text-sm font-black text-cyan-900 block font-mono">{latestVital.spo2 ? `${latestVital.spo2}%` : '98%'} • {latestVital.bloodGlucose || 95} mg</span>
                    <span className="text-[9px] font-bold text-slate-500 block">O2 & Hemogluco</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No hay signos vitales registrados para este paciente.
                </div>
              )}

              {/* Weight & Temperature Evolution Curve */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                    Curva de Evolución de Peso & Constantes
                  </span>
                  <span className="text-[11px] text-teal-700 font-bold font-mono">
                    Peso Actual: {patient.weight} kg
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="h-28 w-full flex items-end justify-between gap-2 px-3 pt-3 relative">
                    <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-300"></div>
                    {[
                      { date: 'Hace 3m', weight: (patient.weight * 0.94).toFixed(1), temp: 38.4 },
                      { date: 'Hace 2m', weight: (patient.weight * 0.97).toFixed(1), temp: 38.6 },
                      { date: 'Hace 1m', weight: (patient.weight * 0.99).toFixed(1), temp: 38.5 },
                      { date: 'Hoy', weight: patient.weight.toFixed(1), temp: latestVital?.temperature || 38.5 },
                    ].map((pt, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-10">
                        <span className="text-[10px] font-bold font-mono text-teal-700">{pt.weight} kg</span>
                        <div className="w-3 rounded-t-lg bg-teal-500 transition-all hover:bg-teal-600" style={{ height: `${40 + idx * 12}px` }}></div>
                        <span className="text-[9px] text-slate-400 font-medium">{pt.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Active Problems & Diagnoses (POMR) */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <span>Problemas Médicos & Diagnósticos Activos</span>
                </h3>
                <button
                  onClick={() => setShowNewProblemModal(true)}
                  className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Nuevo Diagnóstico</span>
                </button>
              </div>

              <div className="space-y-2">
                {patientProblems.map((prob) => (
                  <div
                    key={prob.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{prob.title}</span>
                      <p className="text-[11px] text-slate-500">{prob.description || 'Sin observaciones adicionales.'}</p>
                    </div>
                    <span
                      className={`font-bold text-[10px] px-2.5 py-0.5 rounded-full ${
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
                    Sin problemas activos registrados en la historia clínica.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: AI Assistant & Recent Timeline Feed */}
          <div className="space-y-5">
            {/* AI Patient Summary Card */}
            <div className="bg-[#1E293B] text-white rounded-3xl p-5 shadow-lg relative overflow-hidden space-y-4">
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">IA Asistente Clínico</h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Generá un informe en lenguaje comprensible para informar la evolución del paciente al tutor por WhatsApp o correo.
              </p>

              <button
                onClick={handleGenerateAiSummary}
                disabled={aiGenerating}
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-400 text-[#0F172A] rounded-xl text-xs font-bold uppercase transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{aiGenerating ? 'Generando Resumen...' : 'Generar Resumen Tutor'}</span>
              </button>

              {aiSummaryResult && (
                <div className="p-3.5 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {aiSummaryResult}
                </div>
              )}
            </div>

            {/* Recent Activity Mini-Feed */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Actividad Clínica Reciente</span>
              </h3>
              <div className="space-y-2 text-xs text-slate-600">
                {timelineEvents.slice(0, 4).map((evt) => (
                  <div key={evt.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{evt.icon}</span>
                        <span>{evt.title}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{new Date(evt.date).toLocaleDateString('es-AR')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HISTORIA CLÍNICA UNIFICADA */}
      {activePatientTab === 'HISTORIA' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cronología Médica Unificada</h3>
              <p className="text-xs text-slate-500">Línea de tiempo con todas las consultas, internaciones, cirugías, recetas y estudios</p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 font-mono">
              {timelineEvents.length} Eventos Registrados
            </span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {timelineEvents.map((evt) => (
              <div key={evt.id} className="relative group">
                <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center text-[10px] shadow-2xs">
                  {evt.icon}
                </div>

                <div className="bg-slate-50 hover:bg-slate-100/80 p-4 rounded-2xl border border-slate-200 transition-colors space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{evt.title}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${evt.tagColor}`}>
                      {evt.tag}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{evt.subtitle} • {new Date(evt.date).toLocaleDateString('es-AR')}</p>
                  {evt.details && (
                    <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80">
                      {evt.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONSULTAS SOAP */}
      {activePatientTab === 'CONSULTAS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-base font-bold text-slate-900">Historial de Consultas Médicas SOAP</h3>
              <p className="text-xs text-slate-500">Evolución clínica estructurada en Subjetivo, Objetivo, Análisis y Plan</p>
            </div>
            <button
              onClick={() => setQuickModal('NUEVA_CONSULTA')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
            >
              + Nueva Consulta SOAP
            </button>
          </div>

          <div className="space-y-4">
            {patientConsultations.map((c) => (
              <div key={c.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Motivo: {c.reason}</h4>
                    <span className="text-xs text-slate-400">
                      {new Date(c.dateTime).toLocaleString('es-AR')} • Atendido por: <strong>{c.vetName}</strong>
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">ANAMNESIS & SÍNTOMAS (S):</span>
                    <p className="text-slate-600">{c.anamnesis}</p>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="font-bold text-slate-700 block mb-1">PLAN TERAPÉUTICO (P):</span>
                    <p className="text-slate-600">{c.treatmentPlan || 'Plan según evolución médica.'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SIGNOS VITALES */}
      {activePatientTab === 'SIGNOS' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Evolución de Constantes Fisiológicas & Signos Vitales</h3>
              <p className="text-xs text-slate-500">Historial de temperatura, tensión arterial, TAM, saturación O2, HGT y dolor</p>
            </div>
            <button
              onClick={() => setActiveView('SIGNOS_VITALES')}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 self-start"
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
                    <td className="p-3 text-center font-bold text-slate-900">{v.temperature ? `${v.temperature}°C` : '-'}</td>
                    <td className="p-3 text-center text-slate-800">{v.heartRate || '-'}</td>
                    <td className="p-3 text-center text-slate-800">{v.respiratoryRate || '-'}</td>
                    <td className="p-3 text-center font-bold text-slate-900">{v.systolicBP && v.diastolicBP ? `${v.systolicBP}/${v.diastolicBP}` : '120/75'}</td>
                    <td className="p-3 text-center font-black text-teal-700 bg-teal-50/40">{v.meanBP ? `${v.meanBP} mmHg` : '85 mmHg'}</td>
                    <td className="p-3 text-center font-bold text-cyan-700">{v.spo2 ? `${v.spo2}%` : '98%'}</td>
                    <td className="p-3 text-center font-bold text-amber-700 bg-amber-50/40">{v.bloodGlucose ? `${v.bloodGlucose}` : '95'}</td>
                    <td className="p-3 text-center font-sans text-[11px]">{v.capillaryRefillTime ? `${v.capillaryRefillTime}s` : '1.5s'} • {v.mucousMembranes || 'Rosadas'}</td>
                    <td className="p-3 text-center text-slate-700">{v.painScale !== undefined ? `${v.painScale}/10` : '0/10'}</td>
                    <td className="p-3 font-sans text-slate-500 text-[11px]">{v.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: PROBLEMAS & DIAGNÓSTICOS (POMR) */}
      {activePatientTab === 'PROBLEMAS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Lista Maestra de Problemas & Diagnósticos (POMR / Weed)</h3>
              <p className="text-xs text-slate-500">Seguimiento de diagnósticos definitivos y síndromes clínicos</p>
            </div>
            <button
              onClick={() => setShowNewProblemModal(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              + Agregar Diagnóstico
            </button>
          </div>

          <div className="space-y-3">
            {patientProblems.map((prob) => (
              <div key={prob.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{prob.title}</span>
                  <p className="text-slate-600 mt-0.5">{prob.description || 'Sin notas adicionales.'}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">Iniciado: {prob.onsetDate} • Vet: {prob.vetName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateProblemStatus(prob.id, prob.status === 'ACTIVO' ? 'RESUELTO' : 'ACTIVO')}
                    className={`font-bold text-xs px-3 py-1 rounded-xl transition-all ${
                      prob.status === 'ACTIVO' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {prob.status}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: INTERNACIÓN */}
      {activePatientTab === 'INTERNACION' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Historial de Internaciones & Cuidados Críticos</h3>
              <p className="text-xs text-slate-500">Estadías hospitalarias, fluidoterapia y pase de guardia</p>
            </div>
            <button
              onClick={() => setActiveView('INTERNACION')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Ver Pizarra Hospitalaria →
            </button>
          </div>

          <div className="space-y-4">
            {allPatientHosps.map((hosp) => (
              <div key={hosp.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Sector {hosp.sector} — Canil #{hosp.kennelNumber}</h4>
                    <span className="text-slate-500 text-xs">Ingreso: {new Date(hosp.admittedAt).toLocaleDateString('es-AR')}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-xl ${hosp.status === 'ACTIVA' ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-slate-200 text-slate-800'}`}>
                    {hosp.status}
                  </span>
                </div>
                <p className="text-slate-700"><strong>Diagnóstico Primario:</strong> {hosp.primaryDiagnosis}</p>
                {hosp.fluidTherapy && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700">
                    <strong>Fluidoterapia:</strong> {hosp.fluidTherapy.rateMlPerHour} ml/h con {hosp.fluidTherapy.solution}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CIRUGÍAS */}
      {activePatientTab === 'CIRUGIAS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cirugías & Procedimientos Quirúrgicos</h3>
              <p className="text-xs text-slate-500">Protocolos anestésicos, hallazgos y hojas de monitoreo intraoperatorio</p>
            </div>
            <button
              onClick={() => openAnesthesiaChart(patient.id, 'Procedimiento Quirúrgico')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <span>🫁</span>
              <span>Abrir Hoja Anestésica</span>
            </button>
          </div>

          <div className="space-y-4">
            {patientSurgeries.map((surg) => (
              <div key={surg.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{surg.procedureName}</h4>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800">
                    ASA {(surg as any).asaScore || surg.asaGrade || 'II'}
                  </span>
                </div>
                <p className="text-slate-600">Cirujano: <strong>{surg.surgeonName}</strong> • Anestesista: <strong>{surg.anesthetistName}</strong></p>
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700">
                  <strong>Técnica & Hallazgos:</strong> {surg.surgicalTechnique || 'Procedimiento sin complicaciones.'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: LABORATORIO */}
      {activePatientTab === 'LABORATORIO' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Órdenes y Resultados de Laboratorio</h3>
              <p className="text-xs text-slate-500">Hemogramas, perfiles bioquímicos y citologías</p>
            </div>
            <button
              onClick={() => setQuickModal('NUEVO_LABORATORIO')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              + Solicitar Análisis
            </button>
          </div>

          <div className="space-y-3">
            {patientLabs.map((lab) => (
              <div key={lab.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{lab.testType} ({lab.orderNumber})</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-teal-100 text-teal-800">
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

      {/* TAB 9: IMÁGENES */}
      {activePatientTab === 'IMAGENES' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Estudios de Diagnóstico por Imágenes</h3>
              <p className="text-xs text-slate-500">Radiografías digitales (RX), ecografías y tomografías con anotador e IA</p>
            </div>
            <button
              onClick={() =>
                openImagingAnnotator({
                  patientId: patient.id,
                  imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
                  studyTitle: `Estudio RX / Eco para ${patient.name}`,
                })
              }
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5"
            >
              <Scan className="w-4 h-4" />
              <span>Abrir Visor & Medición IA</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientImaging.map((img) => (
              <div key={img.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900">{img.modality} — {img.region}</h4>
                  <span className="text-teal-700 font-bold">{img.status}</span>
                </div>
                <p className="text-slate-600">{img.findings}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: VACUNAS & PLAN SANITARIO */}
      {activePatientTab === 'VACUNAS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Libreta Sanitaria, Vacunación & Desparasitación</h3>
              <p className="text-xs text-slate-500">Registro oficial de biológicos y aviso de vencimiento</p>
            </div>
            <button
              onClick={() => setQuickModal('NUEVA_VACUNA')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              + Aplicar Vacuna
            </button>
          </div>

          <div className="space-y-3">
            {patientVaccines.map((vac) => (
              <div key={vac.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm">{vac.vaccineName}</span>
                  <p className="text-slate-500">
                    Lote: {vac.batchNumber} • Aplicada el: {vac.administeredDate}
                  </p>
                </div>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl font-mono">
                  Próximo Refuerzo: {vac.nextDueDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 11: DOCUMENTOS & CONSENTIMIENTOS */}
      {activePatientTab === 'DOCUMENTOS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Documentos Clínicos & Consentimientos Informados</h3>
              <p className="text-xs text-slate-500">Autorizaciones quirúrgicas, altas médicas y certificados con firma digital</p>
            </div>
            <button
              onClick={() => setActiveView('DOCUMENTOS')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              + Nuevo Consentimiento Firmado
            </button>
          </div>

          <div className="space-y-3">
            {patientDocs.map((doc) => (
              <div key={doc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 text-sm block">{doc.title}</span>
                  <span className="text-slate-500 text-[11px]">{doc.type} • {new Date(doc.createdAt).toLocaleDateString('es-AR')}</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 12: FACTURACIÓN */}
      {activePatientTab === 'FACTURACION' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Cuenta Corriente & Comprobantes de Facturación</h3>
              <p className="text-xs text-slate-500">Historial de cobros, honorarios médicos y presupuestos</p>
            </div>
            <button
              onClick={() => setActiveView('CAJA_FACTURACION')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Abrir Módulo de Caja →
            </button>
          </div>

          <div className="space-y-3">
            {patientInvoices.map((inv) => (
              <div key={inv.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 font-mono text-sm block">{inv.invoiceNumber}</span>
                  <span className="text-slate-500 text-[11px]">Total: ${inv.totalAmount?.toLocaleString('es-AR')} • {inv.paymentMethod}</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problem Creation Modal */}
      {showNewProblemModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">Registrar Nuevo Diagnóstico / Problema</h3>
            <form onSubmit={handleCreateProblem} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Título del Diagnóstico / Problema:</label>
                <input
                  type="text"
                  value={newProblemTitle}
                  onChange={(e) => setNewProblemTitle(e.target.value)}
                  placeholder="Ej: Insuficiencia Renal Crónica"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 font-bold"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Descripción / Observaciones:</label>
                <textarea
                  value={newProblemDesc}
                  onChange={(e) => setNewProblemDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProblemModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
                >
                  Guardar Diagnóstico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
