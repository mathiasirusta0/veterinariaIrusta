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
  Mail,
  MapPin,
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
  Edit3,
  Trash2,
  Scale,
  X,
  Check,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { ProblemStatus, PatientProblem, Species, Sex, ReproductiveStatus, PatientStatus, PatientAlert, Patient } from '../types';
import { formatDate, formatDateTime, formatTime, formatWeight } from '../utils/formatters';

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
    prescriptions,
    activePatientTab,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    updatePatient,
    addPatientAlert,
    removePatientAlert,
    recordPatientWeight,
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
    currentUser,
    clinicalEvolutions,
    addClinicalEvolution,
    addEvolutionAddendum,
  } = useVet();


  // Unified Clinical Evolution State
  const [showNewEvolutionModal, setShowNewEvolutionModal] = useState(false);
  const [evolutionType, setEvolutionType] = useState<'MEDICA' | 'ENFERMERIA' | 'AUXILIAR' | 'PASE_GUARDIA'>('MEDICA');
  const [evoSubjective, setEvoSubjective] = useState('');
  const [evoObjective, setEvoObjective] = useState('');
  const [evoAssessment, setEvoAssessment] = useState('');
  const [evoPlan, setEvoPlan] = useState('');
  const [evoNursingNotes, setEvoNursingNotes] = useState('');
  const [evoAssistantNotes, setEvoAssistantNotes] = useState('');
  const [evoTreatments, setEvoTreatments] = useState('');
  const [evoNextAction, setEvoNextAction] = useState('');
  const [evoNextDueDate, setEvoNextDueDate] = useState('');
  const [evoNextAssignee, setEvoNextAssignee] = useState('');
  const [evoSector, setEvoSector] = useState('UCI Canil 02');

  // Addendum Modal State
  const [showAddendumModal, setShowAddendumModal] = useState(false);
  const [selectedEvoForAddendum, setSelectedEvoForAddendum] = useState<string | null>(null);
  const [addendumContent, setAddendumContent] = useState('');
  const [addendumReason, setAddendumReason] = useState('');

  // Evolution Timeline Filter
  const [evolutionFilter, setEvolutionFilter] = useState<string>('TODOS');

  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<string | null>(null);

  // New problem form state
  const [showNewProblemModal, setShowNewProblemModal] = useState(false);
  const [newProblemTitle, setNewProblemTitle] = useState('');
  const [newProblemDesc, setNewProblemDesc] = useState('');
  const [newProblemStatus, setNewProblemStatus] = useState<ProblemStatus>('ACTIVO');

  // Edit Patient Modal State
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Patient>>({});

  // Manage Alerts Modal State
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [newAlertType, setNewAlertType] = useState<PatientAlert>('ALERGIA');
  const [newAlertDesc, setNewAlertDesc] = useState('');

  // Quick Weight Modal State
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeightValue, setNewWeightValue] = useState<string>('');

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
  const patientPrescriptions = prescriptions.filter((rx) => rx.patientId === patient.id);

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
    { id: 'TUTOR', label: 'Tutor Responsable', icon: User, count: owner ? 1 : 0 },
    { id: 'HISTORIA', label: 'Evolución Clínica & Historia', icon: Sparkles, count: (clinicalEvolutions?.filter(e => e.patientId === patient.id).length || 0) + timelineEvents.length },
    { id: 'CONSULTAS', label: 'Consultas SOAP', icon: Stethoscope, count: patientConsultations.length },
    { id: 'SIGNOS', label: 'Signos Vitales', icon: Heart, count: patientVitals.length },
    { id: 'PROBLEMAS', label: 'Problemas & Diagnósticos', icon: AlertTriangle, count: patientProblems.length },
    { id: 'INTERNACION', label: 'Internación', icon: BedDouble, count: allPatientHosps.length },
    { id: 'CIRUGIAS', label: 'Cirugías', icon: Scissors, count: patientSurgeries.length },
    { id: 'RECETAS', label: 'Recetas Oficiales', icon: FileText, count: patientPrescriptions.length },
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


  const handleCreateEvolution = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveRole = currentUser.role === 'ENFERMERIA' ? 'ENFERMERIA' : currentUser.role === 'ASISTENTE' ? 'ASISTENTE' : 'VETERINARIO';

    addClinicalEvolution({
      patientId: patient.id,
      hospitalizationId: patientHosp?.id,
      type: evolutionType,
      dateTime: new Date().toISOString(),
      authorName: currentUser.name,
      authorRole: effectiveRole as any,
      authorLicense: currentUser.licenseNumber,
      sector: evoSector,
      subjectiveSummary: evoSubjective,
      objectiveSummary: evoObjective,
      assessment: evoAssessment,
      plan: evoPlan,
      nursingNotes: evoNursingNotes,
      assistantNotes: evoAssistantNotes,
      administeredTreatments: evoTreatments ? evoTreatments.split(',').map(t => t.trim()) : undefined,
      vitalSignsSnapshot: latestVital ? {
        temperature: latestVital.temperature,
        heartRate: latestVital.heartRate,
        respiratoryRate: latestVital.respiratoryRate,
        systolicBP: latestVital.systolicBP,
        diastolicBP: latestVital.diastolicBP,
        spo2: latestVital.spo2,
        bloodGlucose: latestVital.bloodGlucose,
      } : undefined,
      nextAction: evoNextAction,
      nextActionDueDate: evoNextDueDate,
      nextActionAssignee: evoNextAssignee,
    });

    // Reset form
    setEvoSubjective('');
    setEvoObjective('');
    setEvoAssessment('');
    setEvoPlan('');
    setEvoNursingNotes('');
    setEvoAssistantNotes('');
    setEvoTreatments('');
    setEvoNextAction('');
    setEvoNextDueDate('');
    setEvoNextAssignee('');
    setShowNewEvolutionModal(false);
  };

  const handleCreateAddendum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvoForAddendum || !addendumContent || !addendumReason) return;

    addEvolutionAddendum(selectedEvoForAddendum, addendumContent, addendumReason);
    setAddendumContent('');
    setAddendumReason('');
    setSelectedEvoForAddendum(null);
    setShowAddendumModal(false);
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

  const handleOpenEditModal = () => {
    setEditFormData({
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      sex: patient.sex,
      reproductiveStatus: patient.reproductiveStatus,
      birthDate: patient.birthDate,
      calculatedAge: patient.calculatedAge,
      weight: patient.weight,
      color: patient.color,
      microchip: patient.microchip || '',
      photoUrl: patient.photoUrl || '',
      status: patient.status,
    });
    setShowEditPatientModal(true);
  };

  const handleSavePatientEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatient(patient.id, editFormData);
    setShowEditPatientModal(false);
    showToast('success', 'Ficha Actualizada', `Datos clínicos de ${editFormData.name || patient.name} guardados.`);
  };

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlertDesc.trim()) return;
    addPatientAlert(patient.id, { type: newAlertType, description: newAlertDesc.trim() });
    setNewAlertDesc('');
    showToast('success', 'Alerta Registrada', `Alerta de tipo ${newAlertType} añadida.`);
  };

  const handleRemoveAlert = (idx: number) => {
    removePatientAlert(patient.id, idx);
    showToast('info', 'Alerta Removida', 'La condición médica fue actualizada.');
  };

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeightValue);
    if (!w || isNaN(w) || w <= 0) return;
    recordPatientWeight(patient.id, w);
    setShowWeightModal(false);
    setNewWeightValue('');
    showToast('success', 'Peso Actualizado', `Nuevo peso registrado: ${w} kg.`);
  };

  // Weight progression calculation
  const vitalsWithWeight = patientVitals.filter((v) => v.weight && v.weight > 0);
  const previousVitalWithWeight = vitalsWithWeight.find((v) => v.id !== latestVital?.id && v.weight && Math.abs(v.weight - patient.weight) > 0.01);
  const weightDiff = previousVitalWithWeight?.weight ? Math.round((patient.weight - previousVitalWithWeight.weight) * 10) / 10 : null;
  const weightPercentChange = previousVitalWithWeight?.weight ? ((weightDiff! / previousVitalWithWeight.weight) * 100).toFixed(1) : null;

  return (
    <div className="space-y-5 pb-12">
      {/* Top Bar: Selector & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedPatientId(null)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            title="Volver a la lista de pacientes"
          >
            <span>←</span>
            <span>Volver al Directorio</span>
          </button>

          <label className="text-xs text-slate-500 font-bold uppercase tracking-wider hidden sm:inline-block">
            Paciente:
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
            onClick={() => openMonitor(patient.id)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-bold px-3 py-2 rounded-xl transition-colors border border-slate-800 shadow-xs"
            title="Telemetría en Vivo UCI"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Monitor UCI</span>
          </button>

          <button
            onClick={() =>
              openPrintModal({
                type: 'RECETA',
                patientId: patient.id,
                consultationId: patientConsultations[0]?.id,
              })
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
                {patient.species?.toUpperCase() === 'CANINO' ? '🐕' : patient.species?.toUpperCase() === 'FELINO' ? '🐈' : '🦜'}
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{patient.name || 'Paciente'}</h1>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                  HC: {patient.clinicalRecordNumber || 'HC-0000'}
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
                {[
                  patient.species,
                  patient.breed,
                  patient.sex,
                  patient.reproductiveStatus ? `(${patient.reproductiveStatus})` : null,
                  patient.calculatedAge,
                  patient.weight ? `Peso: ${formatWeight(patient.weight)}` : null,
                  patient.color ? `Color: ${patient.color}` : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </p>

              {/* Quick Patient Identity Badges & Actions */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {patient.microchip ? (
                  <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 text-[11px] font-mono text-slate-700">
                    <span>CHIP: <strong className="text-slate-900">{patient.microchip}</strong></span>
                    <button
                      onClick={() => handleCopyMicrochip(patient.microchip!)}
                      className="text-teal-600 hover:text-teal-800 p-0.5"
                      title="Copiar código microchip"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">Sin Microchip ISO</span>
                )}

                <button
                  onClick={handleOpenEditModal}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-[11px] font-bold transition-colors"
                  title="Editar datos del paciente"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Editar Ficha</span>
                </button>

                <button
                  onClick={() => setShowAlertsModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-bold transition-colors"
                  title="Gestionar condiciones médicas críticas y alergias"
                >
                  <AlertTriangle className="w-3 h-3" />
                  <span>Alertas ({patient.alerts?.length || 0})</span>
                </button>

                <button
                  onClick={() => {
                    setNewWeightValue(patient.weight ? patient.weight.toString() : '');
                    setShowWeightModal(true);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-[11px] font-bold transition-colors"
                  title="Registrar nuevo pesaje del paciente"
                >
                  <Scale className="w-3 h-3 text-teal-600" />
                  <span>Registrar Peso</span>
                </button>
              </div>
            </div>
          </div>

          {/* Owner Details Card & Immediate Actions */}
          {owner ? (
            <div className="bg-gradient-to-br from-slate-50 to-teal-50/40 border border-teal-200/80 p-4 rounded-3xl min-w-[290px] text-xs space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase text-[10px] text-teal-800 tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-teal-600" />
                  <span>Tutor a Cargo</span>
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    owner.balance < 0
                      ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  Saldo: ${owner.balance.toLocaleString('es-AR')}
                </span>
              </div>

              <div>
                <p className="font-black text-slate-900 text-sm">
                  {[owner.firstName, owner.lastName].filter(Boolean).join(' ') || 'Tutor Registrado'}
                </p>
                <p className="text-slate-500 font-mono text-[11px]">
                  DNI: {owner.dni || 'S/D'} • Tel: {owner.phone || 'S/D'}
                </p>
              </div>

              <div className="flex items-center gap-1.5 pt-2 border-t border-teal-100">
                <button
                  onClick={() =>
                    openWhatsAppHub({
                      patientName: patient.name,
                      ownerName: `${owner.firstName} ${owner.lastName}`,
                      ownerPhone: owner.phone || owner.whatsapp || '',
                      type: 'COBRO_INSUMO',
                      details: {
                        supplyName: 'Insumos médicos, medicación y atención hospitalaria de ' + patient.name,
                        supplyAmount: owner.balance < 0 ? Math.abs(owner.balance) : 15000,
                      },
                    })
                  }
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-1.5 px-2 rounded-xl text-[10px] transition-colors flex items-center justify-center gap-1 shadow-2xs"
                  title="Enviar aviso o cobro de insumos por WhatsApp"
                >
                  <span>💬</span>
                  <span>WhatsApp al Tutor</span>
                </button>

                <a
                  href={`tel:${(owner.phone || '').replace(/[^0-9]/g, '')}`}
                  className="bg-white hover:bg-slate-100 text-slate-700 font-bold py-1.5 px-2.5 rounded-xl border border-slate-200 text-[10px] transition-colors flex items-center gap-1"
                  title="Llamar directamente al tutor"
                >
                  <Phone className="w-3 h-3 text-teal-600" />
                  <span>Llamar</span>
                </a>

                <button
                  onClick={() => setActivePatientTab('TUTOR')}
                  className="bg-white hover:bg-teal-50 text-teal-700 font-bold py-1.5 px-2.5 rounded-xl border border-teal-200 text-[10px] transition-colors"
                  title="Ver ficha completa del tutor y cuenta corriente"
                >
                  Ver Ficha →
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-3xl text-xs space-y-1.5 min-w-[240px]">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">⚠️ Sin Tutor Asignado</span>
              <p className="text-slate-600 text-[11px]">Este paciente no tiene un tutor responsable vinculado.</p>
              <button
                onClick={() => setQuickModal('NUEVO_PROPIETARIO')}
                className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 rounded-xl text-[11px] transition-colors"
              >
                + Asignar Tutor Responsable
              </button>
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
                    {formatDateTime(latestVital.recordedAt)}
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
              ) : patient.status === 'INTERNADO' || patientHosp ? (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 text-left">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>Faltan signos vitales para esta internación</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    No se han registrado constantes biométricas recientes en la UCI. Registralos ahora para garantizar la seguridad clínica del paciente.
                  </p>
                  <button
                    onClick={() => setActivePatientTab('SIGNOS')}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-2xs"
                  >
                    + Registrar Signos Vitales
                  </button>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Todavía no hay signos vitales registrados para este paciente ambulatorio.
                </div>
              )}

              {/* Weight & Temperature Evolution Curve */}
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                      Control Ponderal & Evolución de Peso
                    </span>
                    <p className="text-[11px] text-slate-400">Seguimiento nutricional y cálculo de variaciones biométricas</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {weightDiff !== null && (
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                        weightDiff > 0
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : weightDiff < 0
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        <span>{weightDiff > 0 ? '▲ +' : '▼ '}{weightDiff} kg</span>
                        <span className="text-[10px] font-normal">({weightPercentChange}%)</span>
                      </span>
                    )}

                    <button
                      onClick={() => {
                        setNewWeightValue(patient.weight ? patient.weight.toString() : '');
                        setShowWeightModal(true);
                      }}
                      className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nuevo Pesaje</span>
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="h-28 w-full flex items-end justify-between gap-2 px-3 pt-3 relative">
                    <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-300"></div>
                    {[
                      { date: new Date(Date.now() - 90*24*60*60*1000).toLocaleDateString('es-AR') + ' · hace 3 meses', weight: (patient.weight * 0.94).toFixed(1), temp: 38.4 },
                      { date: new Date(Date.now() - 60*24*60*60*1000).toLocaleDateString('es-AR') + ' · hace 2 meses', weight: (patient.weight * 0.97).toFixed(1), temp: 38.6 },
                      { date: new Date(Date.now() - 30*24*60*60*1000).toLocaleDateString('es-AR') + ' · hace 1 mes', weight: (patient.weight * 0.99).toFixed(1), temp: 38.5 },
                      { date: new Date().toLocaleDateString('es-AR') + ' · hoy (actual)', weight: patient.weight.toFixed(1), temp: latestVital?.temperature || 38.5 },
                    ].map((pt, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1 z-10">
                        <span className={`text-[10px] font-bold font-mono ${idx === 3 ? 'text-teal-700 font-black' : 'text-slate-500'}`}>
                          {pt.weight} kg
                        </span>
                        <div
                          className={`w-3.5 rounded-t-lg transition-all hover:scale-110 ${
                            idx === 3 ? 'bg-teal-600' : 'bg-teal-400/60'
                          }`}
                          style={{ height: `${40 + idx * 14}px` }}
                        ></div>
                        <span className={`text-[9px] font-medium ${idx === 3 ? 'text-teal-800 font-bold' : 'text-slate-400'}`}>
                          {pt.date}
                        </span>
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
                  patient.status === 'INTERNADO' || patientHosp ? (
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                        <span>Revisar lista de problemas de internación</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        El paciente está internado pero no tiene diagnósticos activos vinculados en su ficha.
                      </p>
                      <button
                        onClick={() => setShowNewProblemModal(true)}
                        className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-[11px] font-bold"
                      >
                        + Vincular Diagnóstico / Problema
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 text-center py-4">
                      No hay diagnósticos ni problemas activos registrados.
                    </p>
                  )
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
                    <p className="text-[11px] text-slate-500">{formatDate(evt.date)}</p>
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
                  <p className="text-xs text-slate-500 font-medium">{evt.subtitle} • {formatDate(evt.date)}</p>
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
                      {formatDateTime(c.dateTime)} • Atendido por: <strong>{c.vetName || 'Dr. Médico Veterinario'}</strong>
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
                      {formatDateTime(v.recordedAt)}
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
                    <span className="text-slate-500 text-xs">Ingreso: {formatDate(hosp.admittedAt)}</span>
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

      {/* TAB: RECETAS OFICIALES SENASA */}
      {activePatientTab === 'RECETAS' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recetario Veterinario Oficial & SENASA</h3>
              <p className="text-xs text-slate-500">Prescripciones oficiales, archivo digital y validación con firma electrónica</p>
            </div>
            <button
              onClick={() => setActiveView('RECETAS_OFICIALES')}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-2xs"
            >
              + Emitir Nueva Receta
            </button>
          </div>

          {patientPrescriptions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
              No hay recetas oficiales registradas para este paciente.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patientPrescriptions.map((rx) => (
                <div key={rx.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <div>
                      <span className="font-mono font-bold text-slate-900 text-xs block">{rx.prescriptionNumber}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{formatDate(rx.date)}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 uppercase">
                      {rx.prescriptionType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Diagnóstico Clínico</span>
                    <p className="text-slate-900 font-bold">{rx.diagnosis}</p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Prescripción</span>
                    {rx.items.map((it, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-900 block">{it.medicationName}</span>
                        <span className="text-slate-600 text-[11px] block">{it.dose} — {it.duration}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-[11px]">
                    <span className="text-slate-600 font-medium">{rx.vetName} ({rx.vetLicense})</span>
                    <button
                      onClick={() => openPrintModal({ type: 'RECETA', patientId: patient.id })}
                      className="text-teal-600 font-bold hover:underline"
                    >
                      Imprimir Receta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  <span className="text-slate-500 text-[11px]">{doc.type} • {formatDate(doc.createdAt)}</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${
                  doc.isSigned
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200'
                }`}>
                  {doc.isSigned ? 'Firmado Digitalmente' : 'Pendiente de Firma'}
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

      
      {/* TAB: TUTOR RESPONSABLE & PAGOS DE INSUMOS */}
      {activePatientTab === 'TUTOR' && (
        <div className="space-y-6">
          {owner ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Owner Identity & Direct Actions */}
              <div className="lg:col-span-2 space-y-6">
                {/* Main Identity & Financial Card */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 uppercase tracking-wider">
                        Tutor Legal y Responsable
                      </span>
                      <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                        {[owner.firstName, owner.lastName].filter(Boolean).join(' ')}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono">
                        DNI: {owner.dni || 'S/D'} • CUIT: {owner.cuit || 'S/D'} • Condición: {owner.taxCondition || 'Consumidor Final'}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Cuenta Corriente</span>
                      <span
                        className={`text-lg font-black font-mono ${
                          owner.balance < 0 ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        ${owner.balance.toLocaleString('es-AR')}
                      </span>
                    </div>
                  </div>

                  {/* Contact Info & Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span><strong>Teléfono:</strong> {owner.phone || 'No registrado'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span><strong>Email:</strong> {owner.email || 'No registrado'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span><strong>Domicilio:</strong> {owner.address || 'S/D'}, {owner.city || 'Río Cuarto'} ({owner.postalCode || '5800'})</span>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Contactos de Emergencia</span>
                      <p className="text-xs text-slate-800 font-semibold">
                        {owner.secondaryContactName || 'No especificado'}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {owner.secondaryContactPhone ? `Tel: ${owner.secondaryContactPhone}` : 'Sin teléfono de respaldo'}
                      </p>
                    </div>
                  </div>

                  {/* Fast Action Communication Center for Consumables & Evolution */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Acciones Directas de Comunicación & Cobro de Insumos:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() =>
                          openWhatsAppHub({
                            patientName: patient.name,
                            ownerName: `${owner.firstName} ${owner.lastName}`,
                            ownerPhone: owner.phone || owner.whatsapp || '',
                            type: 'COBRO_INSUMO',
                            details: {
                              supplyName: 'Insumos médicos y medicación aplicada en atención de ' + patient.name,
                              supplyAmount: owner.balance < 0 ? Math.abs(owner.balance) : 18500,
                            },
                          })
                        }
                        className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 rounded-2xl text-left transition-all flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">Cobro de Insumos</span>
                          <span className="text-base">💳</span>
                        </div>
                        <p className="text-[11px] text-emerald-800/80">
                          Enviar detalle y link de pago por insumos aplicados.
                        </p>
                      </button>

                      <button
                        onClick={() =>
                          openWhatsAppHub({
                            patientName: patient.name,
                            ownerName: `${owner.firstName} ${owner.lastName}`,
                            ownerPhone: owner.phone || owner.whatsapp || '',
                            type: 'INTERNACION',
                            details: {
                              hospStatus: patientHosp?.status || 'ESTABLE',
                            },
                          })
                        }
                        className="p-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 rounded-2xl text-left transition-all flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">Parte de Internación</span>
                          <span className="text-base">🏥</span>
                        </div>
                        <p className="text-[11px] text-teal-800/80">
                          Reporte diario de fluidos, medicación y estado general.
                        </p>
                      </button>

                      <button
                        onClick={() =>
                          openWhatsAppHub({
                            patientName: patient.name,
                            ownerName: `${owner.firstName} ${owner.lastName}`,
                            ownerPhone: owner.phone || owner.whatsapp || '',
                            type: 'ALTA_MEDICA',
                          })
                        }
                        className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-2xl text-left transition-all flex flex-col justify-between gap-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">Aviso de Alta Médica</span>
                          <span className="text-base">🎉</span>
                        </div>
                        <p className="text-[11px] text-blue-800/80">
                          Notificar que el paciente está listo para ser retirado.
                        </p>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Patient Invoices & Consumables Table */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Comprobantes & Facturación de {patient.name}</h4>
                      <p className="text-xs text-slate-500">Historial de consumos, honorarios y pagos registrados</p>
                    </div>
                    <button
                      onClick={() => setQuickModal('NUEVA_FACTURA')}
                      className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
                    >
                      + Facturar Insumos
                    </button>
                  </div>

                  {patientInvoices.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-500 text-xs">
                      No hay comprobantes facturados aún para este paciente.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {patientInvoices.map((inv) => (
                        <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-900 font-mono text-sm block">{inv.invoiceNumber}</span>
                            <span className="text-slate-500 text-[11px]">
                              Fecha: {inv.date} • Medio: {inv.paymentMethod} • Detalle: {(inv.items || []).map((i) => `${i.quantity}x ${i.description}`).join(', ')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold font-mono text-slate-900 block">
                              ${inv.totalAmount?.toLocaleString('es-AR')}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Col: Other Pets & Legal Consents */}
              <div className="space-y-6">
                {/* Other Pets of Same Owner */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PawPrint className="w-4 h-4 text-teal-600" />
                    <span>Otras Mascotas a Cargo</span>
                  </h4>

                  <div className="space-y-2">
                    {patients
                      .filter((p) => p.ownerId === owner.id)
                      .map((pet) => {
                        const isCurrent = pet.id === patient.id;
                        return (
                          <button
                            key={pet.id}
                            onClick={() => {
                              setSelectedPatientId(pet.id);
                              setActivePatientTab('RESUMEN');
                            }}
                            className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                              isCurrent
                                ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-200'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">
                                {pet.species?.toUpperCase() === 'CANINO' ? '🐕' : '🐈'}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 text-xs block">{pet.name}</span>
                                <span className="text-[11px] text-slate-500">{pet.breed} • {pet.status}</span>
                              </div>
                            </div>
                            {isCurrent && (
                              <span className="text-[9px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full">
                                Actual
                              </span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Legal Consents & Authorized Persons */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-teal-600" />
                    <span>Personas Autorizadas & Legal</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                        Retiro de Mascota & Consentimientos:
                      </span>
                      {owner.authorizedPersons && owner.authorizedPersons.length > 0 ? (
                        <ul className="list-disc list-inside text-slate-700 space-y-0.5">
                          {owner.authorizedPersons.map((person, idx) => (
                            <li key={idx}>{person}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500 italic">Solo el titular responsable ({owner.firstName} {owner.lastName}) está autorizado.</p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Consentimiento Ley 25.326:</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                          ✓ Firmado
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Avisos Médicos por WhatsApp:</span>
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                          ✓ Habilitado
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
              <span className="text-4xl block">👤</span>
              <h3 className="text-base font-bold text-slate-900">Sin Tutor Vinculado</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Para gestionar la comunicación, avisos de insumos y cuenta corriente, asigná un tutor a {patient.name}.
              </p>
              <button
                onClick={() => setQuickModal('NUEVO_PROPIETARIO')}
                className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm"
              >
                + Registrar y Vincular Tutor
              </button>
            </div>
          )}
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

      {/* 1. EDIT PATIENT MODAL */}
      {showEditPatientModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-2xl w-full shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Editar Ficha Clínica del Paciente</h3>
                  <p className="text-xs text-slate-400">Actualizar datos biológicos, identificación y estado clínico</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditPatientModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatientEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre de la Mascota *</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Especie *</label>
                  <select
                    value={editFormData.species || 'CANINO'}
                    onChange={(e) => setEditFormData({ ...editFormData, species: e.target.value as Species })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="CANINO">🐕 Canino</option>
                    <option value="FELINO">🐈 Felino</option>
                    <option value="EXOTICO">🦜 Exótico / No Convencional</option>
                    <option value="EQUINO">🐎 Equino</option>
                    <option value="BOVINO">🐄 Bovino</option>
                    <option value="AVE">🕊️ Ave</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Raza</label>
                  <input
                    type="text"
                    value={editFormData.breed || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, breed: e.target.value })}
                    placeholder="Ej: Golden Retriever, Mestizo, Siamés"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sexo *</label>
                  <select
                    value={editFormData.sex || 'MACHO'}
                    onChange={(e) => setEditFormData({ ...editFormData, sex: e.target.value as Sex })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="MACHO">Macho</option>
                    <option value="HEMBRA">Hembra</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estado Reproductivo</label>
                  <select
                    value={editFormData.reproductiveStatus || 'CASTRADO'}
                    onChange={(e) => setEditFormData({ ...editFormData, reproductiveStatus: e.target.value as ReproductiveStatus })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="CASTRADO">Castrado / Esterilizado</option>
                    <option value="ENTERO">Entero</option>
                    <option value="GESTANTE">Gestante</option>
                    <option value="LACTANTE">Lactante</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peso Corporal (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="250"
                    value={editFormData.weight || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, weight: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={editFormData.birthDate || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, birthDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Color y Señas Particulares</label>
                  <input
                    type="text"
                    value={editFormData.color || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, color: e.target.value })}
                    placeholder="Ej: Dorado, Atigrado, Blanco con manchas"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Microchip ISO (15 dígitos)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={editFormData.microchip || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, microchip: e.target.value })}
                    placeholder="Ej: 981098123456789"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Estado Clínico del Paciente</label>
                  <select
                    value={editFormData.status || 'ACTIVO'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as PatientStatus })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="ACTIVO">🟢 Activo / Ambulatorio</option>
                    <option value="INTERNADO">🏥 Internado en UCI</option>
                    <option value="EN_CONSULTA">🩺 En Consulta</option>
                    <option value="EN_CIRUGIA">✂️ En Quirófano</option>
                    <option value="FALLECIDO">⚫ Fallecido / Óbito</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">URL de Foto de Perfil</label>
                <input
                  type="url"
                  value={editFormData.photoUrl || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-[11px] text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditPatientModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MANAGE MEDICAL ALERTS & ALLERGIES MODAL */}
      {showAlertsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Alertas Médicas & Alergias</h3>
                  <p className="text-xs text-slate-400">{patient.name} ({patient.species} - {patient.breed})</p>
                </div>
              </div>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of active alerts */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {patient.alerts && patient.alerts.length > 0 ? (
                patient.alerts.map((al, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-red-50/80 border border-red-200 text-xs"
                  >
                    <div>
                      <span className="font-black text-red-700 block uppercase text-[10px]">{al.type}</span>
                      <p className="text-slate-800 font-medium">{al.description}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveAlert(idx)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-100 transition-colors ml-2"
                      title="Eliminar alerta médica"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-xl text-xs">
                  No hay alertas médicas ni alergias registradas para este paciente.
                </div>
              )}
            </div>

            {/* Add new alert form */}
            <form onSubmit={handleAddAlert} className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <span className="font-bold text-slate-800 block text-xs">+ Agregar Nueva Alerta Clínica</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Tipo:</label>
                  <select
                    value={newAlertType}
                    onChange={(e) => setNewAlertType(e.target.value as PatientAlert)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-bold text-slate-900"
                  >
                    <option value="ALERGIA">⚠️ ALERGIA</option>
                    <option value="RIESGO_ANESTESICO">🫁 RIESGO ANESTÉSICO</option>
                    <option value="CARDIOPATIA">❤️ CARDIOPATÍA</option>
                    <option value="MEDICACION_CRONICA">💊 MEDICACIÓN CRÓNICA</option>
                    <option value="AISLAMIENTO">🛡️ AISLAMIENTO</option>
                    <option value="AGRESIVO">⚡ AGRESIVO / MANEJO</option>
                    <option value="EPILEPTICO">🧠 EPILÉPTICO</option>
                    <option value="DIABETICO">💉 DIABÉTICO</option>
                    <option value="RENAL">💧 INSUF. RENAL</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Detalle / Fármaco:</label>
                  <input
                    type="text"
                    value={newAlertDesc}
                    onChange={(e) => setNewAlertDesc(e.target.value)}
                    placeholder="Ej: Alérgico a Dipirona. Causa hipotensión."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAlertsModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-sm active:scale-95 transition-all"
                >
                  + Agregar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. RECORD WEIGHT MODAL */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Control Ponderal</h3>
                  <p className="text-xs text-slate-400">{patient.name} (Anterior: {formatWeight(patient.weight)})</p>
                </div>
              </div>
              <button
                onClick={() => setShowWeightModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeight} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nuevo Peso Registrado (kg):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="250"
                    value={newWeightValue}
                    onChange={(e) => setNewWeightValue(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono font-black text-xl text-center text-slate-900 focus:ring-2 focus:ring-teal-500"
                    required
                    autoFocus
                  />
                  <span className="font-black text-slate-700 text-sm">kg</span>
                </div>
              </div>

              {newWeightValue && parseFloat(newWeightValue) > 0 && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Variación:</span>
                  <span className={`font-bold font-mono ${
                    parseFloat(newWeightValue) > patient.weight
                      ? 'text-emerald-600'
                      : parseFloat(newWeightValue) < patient.weight
                      ? 'text-amber-600'
                      : 'text-slate-600'
                  }`}>
                    {parseFloat(newWeightValue) > patient.weight ? '+' : ''}
                    {(parseFloat(newWeightValue) - patient.weight).toFixed(1)} kg
                  </span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWeightModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
                >
                  Guardar Pesaje
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NUEVA EVOLUCIÓN CLÍNICA UNIFICADA */}
      {showNewEvolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Registrar Evolución Clínica</h3>
                <p className="text-xs text-slate-500">
                  Paciente: <span className="font-bold text-teal-700">{patient.name}</span> (HC: {patient.clinicalRecordNumber}) • Autor: {currentUser.name}
                </p>
              </div>
              <button onClick={() => setShowNewEvolutionModal(false)} className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvolution} className="space-y-4 text-xs">
              {/* Type Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Tipo de Evolución</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'MEDICA', label: 'Médica (SOAP)', roleReq: 'VET' },
                    { id: 'ENFERMERIA', label: 'Técnica / Cuidados', roleReq: 'ALL' },
                    { id: 'AUXILIAR', label: 'Auxiliar / Higiene', roleReq: 'ALL' },
                    { id: 'PASE_GUARDIA', label: 'Pase de Guardia', roleReq: 'ALL' },
                  ].map((t) => (
                    <button
                      type="button"
                      key={t.id}
                      onClick={() => setEvolutionType(t.id as any)}
                      className={`p-2.5 rounded-xl font-bold border text-center transition-all ${
                        evolutionType === t.id
                          ? 'bg-teal-700 text-white border-teal-700 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields by Type */}
              {evolutionType === 'MEDICA' ? (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subjetivo (Anamnesis / Estado general)</label>
                    <textarea
                      rows={2}
                      value={evoSubjective}
                      onChange={(e) => setEvoSubjective(e.target.value)}
                      placeholder="Evolución clínica de las últimas horas, apetito, actitud..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Objetivo (Hallazgos físicos relevantes)</label>
                    <textarea
                      rows={2}
                      value={evoObjective}
                      onChange={(e) => setEvoObjective(e.target.value)}
                      placeholder="Constantes, palpación abdominal, auscultación cardiopulmonar..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Evaluación Diagnóstica</label>
                    <input
                      type="text"
                      value={evoAssessment}
                      onChange={(e) => setEvoAssessment(e.target.value)}
                      placeholder="Diagnóstico presuntivo o definitivo..."
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Plan Terapéutico & Indicaciones</label>
                    <textarea
                      rows={2}
                      value={evoPlan}
                      onChange={(e) => setEvoPlan(e.target.value)}
                      placeholder="Fluidoterapia, antibióticos, dosis, horarios y estudios a solicitar..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                  </div>
                </div>
              ) : evolutionType === 'ENFERMERIA' ? (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cuidados Técnicos & Procedimientos Realizados</label>
                    <textarea
                      rows={3}
                      value={evoNursingNotes}
                      onChange={(e) => setEvoNursingNotes(e.target.value)}
                      placeholder="Administración de medicación, curación de vías, tolerancia digestiva..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Tratamientos Administrados (separados por coma)</label>
                    <input
                      type="text"
                      value={evoTreatments}
                      onChange={(e) => setEvoTreatments(e.target.value)}
                      placeholder="ej: Ringer Lactato 500ml, Maropitant 1.2ml IV, Omeprazol 20mg IV"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Observaciones de Auxiliar / Higiene / Alimentación</label>
                  <textarea
                    rows={4}
                    value={evoAssistantNotes}
                    onChange={(e) => setEvoAssistantNotes(e.target.value)}
                    placeholder="Higiene del canil, micción/defecación en paseo, consumo de agua o ración..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              {/* Next Action */}
              <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                <span className="font-bold text-indigo-950 uppercase text-[10px] block">
                  Próxima Acción / Plan de Turno
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={evoNextAction}
                    onChange={(e) => setEvoNextAction(e.target.value)}
                    placeholder="Tarea a realizar (ej: Control glucemia)"
                    className="p-2 bg-white border border-indigo-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    value={evoNextAssignee}
                    onChange={(e) => setEvoNextAssignee(e.target.value)}
                    placeholder="Responsable (ej: Enfermería)"
                    className="p-2 bg-white border border-indigo-200 rounded-lg text-xs"
                  />
                  <input
                    type="datetime-local"
                    value={evoNextDueDate}
                    onChange={(e) => setEvoNextDueDate(e.target.value)}
                    className="p-2 bg-white border border-indigo-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewEvolutionModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold shadow-md shadow-teal-600/20"
                >
                  ✓ Firmar y Guardar Evolución
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR ADDENDUM A NOTA FIRMADA */}
      {showAddendumModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Agregar Addendum Fechado</h3>
                <p className="text-xs text-slate-500">
                  Las notas firmadas son inmutables. El addendum se anexará con fecha, hora y autor.
                </p>
              </div>
              <button onClick={() => setShowAddendumModal(false)} className="text-slate-400 hover:text-slate-600 p-1 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAddendum} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo del Addendum</label>
                <input
                  type="text"
                  required
                  value={addendumReason}
                  onChange={(e) => setAddendumReason(e.target.value)}
                  placeholder="ej: Aclaración de dosis, resultado de laboratorio tardío..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Contenido de la Aclaración</label>
                <textarea
                  rows={4}
                  required
                  value={addendumContent}
                  onChange={(e) => setAddendumContent(e.target.value)}
                  placeholder="Escriba la aclaración médica o técnica a anexar..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddendumModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold"
                >
                  ✓ Anexar Addendum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
