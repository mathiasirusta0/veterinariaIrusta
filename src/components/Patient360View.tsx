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
  Pill,
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
    administerMedication,
    updateOwner,
    addVitalSigns,
    addLabOrder,
  } = useVet();

  const patient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const owner = owners.find((o) => o.id === patient?.ownerId);

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

  // Quick Vitals direct capture state
  const [quickTemp, setQuickTemp] = useState<number>(38.5);
  const [quickHR, setQuickHR] = useState<number>(110);
  const [quickRR, setQuickRR] = useState<number>(24);
  const [quickTAS, setQuickTAS] = useState<number>(120);
  const [quickTAD, setQuickTAD] = useState<number>(75);
  const [quickSpO2, setQuickSpO2] = useState<number>(98);
  const [quickGlucose, setQuickGlucose] = useState<number>(105);
  const [quickWeightVal, setQuickWeightVal] = useState<number>(patient?.weight || 25);

  // New Medication Indication state
  const [newDrugName, setNewDrugName] = useState('');
  const [newDrugDose, setNewDrugDose] = useState('');
  const [newDrugRoute, setNewDrugRoute] = useState<'IV' | 'IM' | 'SC' | 'PO' | 'TOPICA'>('IV');
  const [newDrugFreq, setNewDrugFreq] = useState('Cada 8 hs');
  const [newDrugSchedule, setNewDrugSchedule] = useState('08:00');
  const [newDrugDuration, setNewDrugDuration] = useState('3 días');

  // Direct Tutor Edit state
  const [tutorFirstName, setTutorFirstName] = useState(owner?.firstName || '');
  const [tutorLastName, setTutorLastName] = useState(owner?.lastName || '');
  const [tutorDni, setTutorDni] = useState(owner?.dni || '');
  const [tutorPhone, setTutorPhone] = useState(owner?.phone || '');
  const [tutorEmail, setTutorEmail] = useState(owner?.email || '');
  const [tutorAddress, setTutorAddress] = useState(owner?.address || '');
  const [tutorTaxCondition, setTutorTaxCondition] = useState(owner?.taxCondition || 'Consumidor Final');

  // Direct Lab Order State
  const [newLabTestType, setNewLabTestType] = useState('Hemograma Completo');
  const [newLabReport, setNewLabReport] = useState('');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeightValue, setNewWeightValue] = useState<string>('');

  // Facturación ARCA vs Ticket Común Modal State
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [billingInvoiceType, setBillingInvoiceType] = useState<'TICKET_COMUN' | 'FACTURA_B' | 'FACTURA_A' | 'FACTURA_C'>('TICKET_COMUN');
  const [billingPaymentMethod, setBillingPaymentMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'MERCADOPAGO_QR' | 'TARJETA_DEBITO'>('EFECTIVO');
  const [billingItems, setBillingItems] = useState<{ id: string; desc: string; amount: number }[]>([
    { id: '1', desc: 'Atención Médica & Guardia Hospitalaria 24hs', amount: 15000 },
    { id: '2', desc: 'Fluidoterapia Ringer Lactato & Vía Endovenosa', amount: 8500 },
    { id: '3', desc: 'Fármacos & Insumos Descartables UCI (Maropitant, Jeringas)', amount: 6200 },
  ]);
  const [showTicketPreview, setShowTicketPreview] = useState(false);
  const [generatedTicketNumber, setGeneratedTicketNumber] = useState('');

  if (!patient) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 shadow-sm">
        <PawPrint className="w-14 h-14 mx-auto mb-3 text-teal-500 opacity-60 animate-bounce" />
        <h3 className="text-base font-bold text-slate-800">No se ha seleccionado ningún paciente</h3>
        <p className="text-xs text-slate-400 mt-1">Seleccioná un paciente del directorio para ver su Ficha Médica 360°.</p>
      </div>
    );
  }
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
    { id: 'SIGNOS', label: '1. Signos Vitales', icon: Heart, count: patientVitals.length },
    { id: 'RECETAS', label: '2. Medicación & Indicaciones', icon: Pill, count: (patientHosp?.medications?.length || 0) + patientPrescriptions.length },
    { id: 'HISTORIA', label: '3. Evolución Médica', icon: Sparkles, count: (clinicalEvolutions?.filter(e => e.patientId === patient.id).length || 0) + timelineEvents.length },
    { id: 'LABORATORIO', label: '4. Estudios & Laboratorio', icon: FlaskConical, count: patientLabs.length + patientImaging.length },
    { id: 'TUTOR', label: '5. Propietario / Tutor', icon: User, count: owner ? 1 : 0 },
    { id: 'FACTURACION', label: '6. Caja & Facturación ARCA', icon: Receipt, count: patientInvoices.length },
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

      {/* 1. ❤️ TAB: SIGNOS VITALES (CARGA DIRECTA + TABLA HISTÓRICA) */}
      {activePatientTab === 'SIGNOS' && (
        <div className="space-y-6 animate-fade-in">
          {/* Direct Capture Form Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  ❤️
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Registrar Nuevos Signos Vitales</h3>
                  <p className="text-xs text-slate-500">Carga directa de biometría clínica para {patient.name}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono">
                {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addVitalSigns({
                  patientId: patient.id,
                  temperature: Number(quickTemp),
                  heartRate: Number(quickHR),
                  respiratoryRate: Number(quickRR),
                  systolicBP: Number(quickTAS),
                  diastolicBP: Number(quickTAD),
                  spo2: Number(quickSpO2),
                  bloodGlucose: Number(quickGlucose),
                  weight: Number(quickWeightVal),
                  crtSeconds: 1.5,
                  mucousMembranes: 'ROSADAS',
                  painScore: 0,
                  recordedBy: currentUser.name,
                });
                recordPatientWeight(patient.id, Number(quickWeightVal));
                showToast('success', 'Signos Guardados', `Se registraron los signos vitales de ${patient.name} correctamente.`);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Temp (°C):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={quickTemp}
                    onChange={(e) => setQuickTemp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">FC (lpm):</label>
                  <input
                    type="number"
                    required
                    value={quickHR}
                    onChange={(e) => setQuickHR(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">FR (rpm):</label>
                  <input
                    type="number"
                    required
                    value={quickRR}
                    onChange={(e) => setQuickRR(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">TAS / TAD (mmHg):</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={quickTAS}
                      onChange={(e) => setQuickTAS(Number(e.target.value))}
                      className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                    />
                    <span className="text-slate-400 font-bold">/</span>
                    <input
                      type="number"
                      value={quickTAD}
                      onChange={(e) => setQuickTAD(Number(e.target.value))}
                      className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">SpO₂ (%):</label>
                  <input
                    type="number"
                    value={quickSpO2}
                    onChange={(e) => setQuickSpO2(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Glucemia (mg/dl):</label>
                  <input
                    type="number"
                    value={quickGlucose}
                    onChange={(e) => setQuickGlucose(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Peso (kg):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={quickWeightVal}
                    onChange={(e) => setQuickWeightVal(Number(e.target.value))}
                    className="w-full bg-teal-50 border border-teal-200 rounded-xl p-2.5 font-mono font-black text-teal-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-500">
                  Responsable: <strong className="text-slate-800">{currentUser.name}</strong>
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>✓ Guardar Signos Vitales</span>
                </button>
              </div>
            </form>
          </div>

          {/* Historical Vitals Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Historial Cronológico de Constantes</h3>
                <p className="text-xs text-slate-500">Evolución biométrica registrada en internación y consultas</p>
              </div>
              <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                {patientVitals.length} Registros
              </span>
            </div>

            {patientVitals.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                No hay signos vitales registrados para este paciente. Use el formulario superior para cargar el primer control.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Fecha / Hora</th>
                      <th className="p-3">Temperatura</th>
                      <th className="p-3">FC</th>
                      <th className="p-3">FR</th>
                      <th className="p-3">Tensión (TAS/TAD)</th>
                      <th className="p-3">SpO₂</th>
                      <th className="p-3">Glucemia</th>
                      <th className="p-3">Peso</th>
                      <th className="p-3">Registrado Por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patientVitals.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">{formatDateTime(v.recordedAt)}</td>
                        <td className="p-3">
                          <span className={`font-mono font-bold ${v.temperature && (v.temperature > 39.2 || v.temperature < 37.8) ? 'text-red-600 font-black' : 'text-slate-900'}`}>
                            {v.temperature ? `${v.temperature} °C` : '-'}
                          </span>
                        </td>
                        <td className="p-3 font-mono">{v.heartRate ? `${v.heartRate} lpm` : '-'}</td>
                        <td className="p-3 font-mono">{v.respiratoryRate ? `${v.respiratoryRate} rpm` : '-'}</td>
                        <td className="p-3 font-mono">{v.systolicBP && v.diastolicBP ? `${v.systolicBP}/${v.diastolicBP} mmHg` : '120/75'}</td>
                        <td className="p-3 font-mono">{v.spo2 ? `${v.spo2}%` : '-'}</td>
                        <td className="p-3 font-mono">{v.bloodGlucose ? `${v.bloodGlucose} mg/dl` : '-'}</td>
                        <td className="p-3 font-mono font-bold text-teal-800">{v.weight ? `${v.weight} kg` : '-'}</td>
                        <td className="p-3 text-slate-600">{v.recordedBy || 'Veterinario de Guardia'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. 💊 TAB: MEDICACIÓN & INDICACIONES (FORMULARIO + TABLA HORARIA CON CHECKLIST) */}
      {activePatientTab === 'RECETAS' && (
        <div className="space-y-6 animate-fade-in">
          {/* Form to Emit New Medical Indication */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  💊
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Indicar Nueva Medicación / Fármaco</h3>
                  <p className="text-xs text-slate-500">Plan terapéutico con frecuencia horaria para enfermería</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Guardia / Internación
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newDrugName || !newDrugDose) {
                  showToast('error', 'Campos Incompletos', 'Ingrese nombre del fármaco y dosis.');
                  return;
                }

                if (patientHosp) {
                  const newMedItem = {
                    id: `med-${Date.now()}`,
                    drugName: newDrugName,
                    dose: newDrugDose,
                    route: newDrugRoute,
                    frequency: newDrugFreq,
                    scheduledTime: newDrugSchedule,
                    status: 'PENDIENTE' as const,
                  };
                  patientHosp.medications = [...(patientHosp.medications || []), newMedItem];
                }

                showToast('success', 'Indicación Guardada', `${newDrugName} (${newDrugDose}) indicado c/${newDrugFreq}.`);
                setNewDrugName('');
                setNewDrugDose('');
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                <div className="lg:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Fármaco / Principio:</label>
                  <input
                    type="text"
                    required
                    value={newDrugName}
                    onChange={(e) => setNewDrugName(e.target.value)}
                    placeholder="ej: Maropitant, Tramadol, Cefalexina..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dosis Exacta:</label>
                  <input
                    type="text"
                    required
                    value={newDrugDose}
                    onChange={(e) => setNewDrugDose(e.target.value)}
                    placeholder="ej: 1.2 ml IV, 50 mg"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Vía de Aplicación:</label>
                  <select
                    value={newDrugRoute}
                    onChange={(e) => setNewDrugRoute(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="IV">Endovenosa (IV)</option>
                    <option value="IM">Intramuscular (IM)</option>
                    <option value="SC">Subcutánea (SC)</option>
                    <option value="PO">Oral (PO)</option>
                    <option value="TOPICA">Tópica</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Frecuencia Horaria:</label>
                  <select
                    value={newDrugFreq}
                    onChange={(e) => setNewDrugFreq(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="Cada 6 hs">Cada 6 hs (4 tomas/día)</option>
                    <option value="Cada 8 hs">Cada 8 hs (3 tomas/día)</option>
                    <option value="Cada 12 hs">Cada 12 hs (2 tomas/día)</option>
                    <option value="Cada 24 hs">Cada 24 hs (1 toma/día)</option>
                    <option value="Dosis única">Dosis única / Urgencia</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Horario Primera Toma:</label>
                  <input
                    type="time"
                    value={newDrugSchedule}
                    onChange={(e) => setNewDrugSchedule(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  Médico Prescriptor: <strong className="text-slate-800">{currentUser.name}</strong>
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Indicar Medicación</span>
                </button>
              </div>
            </form>
          </div>

          {/* TABLA HORARIA DE ADMINISTRACIÓN CON CHECKLIST PARA TILDAR */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Tabla Horaria de Administración & Checklist de Rondas</h3>
                <p className="text-xs text-slate-500">Tilde cada toma al aplicarla; el sistema registra automáticamente el profesional y la hora exacta.</p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                Trazabilidad 100%
              </span>
            </div>

            {(!patientHosp?.medications || patientHosp.medications.length === 0) ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                No hay fármacos hospitalarios activos en la ronda. Ingrese una indicación arriba para generar la tabla horaria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Horario Programado</th>
                      <th className="p-3">Fármaco & Concentración</th>
                      <th className="p-3">Dosis</th>
                      <th className="p-3">Vía</th>
                      <th className="p-3">Frecuencia</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Acción (Checklist)</th>
                      <th className="p-3">Realizado Por & Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patientHosp.medications.map((med) => {
                      const isDone = med.status === 'REALIZADA';
                      return (
                        <tr key={med.id} className={`transition-colors ${isDone ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}`}>
                          <td className="p-3 font-mono font-black text-slate-900 text-sm">⏰ {med.scheduledTime} hs</td>
                          <td className="p-3 font-bold text-slate-900">{med.drugName}</td>
                          <td className="p-3 font-mono font-bold text-teal-800">{med.dose}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full font-mono font-bold text-[10px] bg-slate-100 text-slate-800">
                              {med.route}
                            </span>
                          </td>
                          <td className="p-3 text-slate-600">{med.frequency}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                            }`}>
                              {isDone ? 'APLICADA ✓' : 'PENDIENTE ⏰'}
                            </span>
                          </td>
                          <td className="p-3">
                            {isDone ? (
                              <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                                <span>✓</span>
                                <span>Completada</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  if (patientHosp) {
                                    administerMedication(patientHosp.id, med.id);
                                  }
                                }}
                                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-2xs active:scale-95 transition-all flex items-center gap-1.5"
                              >
                                <span>✓ Tildar como Aplicada</span>
                              </button>
                            )}
                          </td>
                          <td className="p-3 text-slate-600">
                            {isDone ? (
                              <span className="font-bold text-slate-900">
                                {med.administeredBy || currentUser.name} ({med.administeredAt ? new Date(med.administeredAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : 'Hora registrada'})
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">— Pendiente en ronda —</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. 📝 TAB: EVOLUCIÓN MÉDICA (COMPOSITOR DIRECTO + CRONOLOGÍA FIRMADA) */}
      {activePatientTab === 'HISTORIA' && (
        <div className="space-y-6 animate-fade-in">
          {/* Direct Evolution Composer Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  📝
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Escribir Evolución Médica / Nota de Guardia</h3>
                  <p className="text-xs text-slate-500">Registro clínico directo con firma digital SHA-256</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-purple-800 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 font-mono">
                {currentUser.name} ({currentUser.role})
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!evoAssessment || !evoPlan) {
                  showToast('error', 'Campos Incompletos', 'Ingrese diagnóstico/evaluación y plan terapéutico.');
                  return;
                }

                addClinicalEvolution({
                  patientId: patient.id,
                  authorId: currentUser.id,
                  authorName: currentUser.name,
                  authorRole: currentUser.role as any,
                  authorLicense: 'MP-4120',
                  sector: evoSector,
                  shift: 'DIURNO',
                  evolutionType: evolutionType,
                  assessment: evoAssessment,
                  plan: evoPlan,
                  subjective: evoSubjective,
                  objective: evoObjective,
                  nextAction: evoNextAction,
                });

                showToast('success', 'Evolución Guardada', 'La nota médica fue firmada y archivada en la HC.');
                setEvoAssessment('');
                setEvoPlan('');
                setEvoSubjective('');
                setEvoObjective('');
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Evolución:</label>
                  <select
                    value={evolutionType}
                    onChange={(e) => setEvolutionType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="MEDICA">Evolución Médica (Veterinario)</option>
                    <option value="ENFERMERIA">Nota de Enfermería / Cuidados</option>
                    <option value="PASE_GUARDIA">Pase de Guardia 24hs</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Diagnóstico / Evaluación Clínica (A):</label>
                  <input
                    type="text"
                    required
                    value={evoAssessment}
                    onChange={(e) => setEvoAssessment(e.target.value)}
                    placeholder="ej: Paciente estable con mejoría en hidratación, sin nuevos episodios de vómito."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subjetivo & Observaciones (S):</label>
                  <textarea
                    rows={3}
                    value={evoSubjective}
                    onChange={(e) => setEvoSubjective(e.target.value)}
                    placeholder="Comportamiento, apetito, micción, estado de ánimo..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plan Terapéutico & Indicaciones (P):</label>
                  <textarea
                    rows={3}
                    required
                    value={evoPlan}
                    onChange={(e) => setEvoPlan(e.target.value)}
                    placeholder="Continuar fluidoterapia, administrar protector gástrico a las 16hs, evaluar alta..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Firma con Hash SHA-256 inmutable de auditoría
                </span>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>✓ Guardar y Firmar Evolución</span>
                </button>
              </div>
            </form>
          </div>

          {/* Timeline of Clinical Evolutions */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Historial Cronológico de Evoluciones</h3>
                <p className="text-xs text-slate-500">Notas de evolución médica y enfermería archivadas</p>
              </div>
              <span className="text-xs font-bold text-purple-800 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                {(clinicalEvolutions?.filter(e => e.patientId === patient.id).length || 0) + patientConsultations.length} Notas Firmadas
              </span>
            </div>

            <div className="space-y-3">
              {clinicalEvolutions?.filter(e => e.patientId === patient.id).map((evo) => (
                <div key={evo.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="font-black text-slate-900 text-sm">
                      {evo.evolutionType.replace('_', ' ')} • {evo.authorName} ({evo.authorRole})
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {formatDateTime(evo.createdAt)}
                    </span>
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Evaluación / Diagnóstico:</strong>
                    <p className="text-slate-700">{evo.assessment}</p>
                  </div>
                  <div>
                    <strong className="text-slate-800 block">Plan Terapéutico:</strong>
                    <p className="text-slate-700">{evo.plan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. 🧪 TAB: ESTUDIOS & LABORATORIO (SOLICITUD + RESULTADOS) */}
      {activePatientTab === 'LABORATORIO' && (
        <div className="space-y-6 animate-fade-in">
          {/* Direct Lab Order Form Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  🧪
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Solicitar / Cargar Estudio de Laboratorio</h3>
                  <p className="text-xs text-slate-500">Análisis bioquímicos, urianálisis y diagnóstico por imágenes</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                Bioquímica & Diagnóstico
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addLabOrder({
                  patientId: patient.id,
                  testType: newLabTestType as any,
                  status: 'LISTO',
                  results: { informe: newLabReport || 'Estudio completado satisfactoriamente.' },
                  diagnosticReport: newLabReport,
                });
                showToast('success', 'Estudio Cargado', `Se registró el estudio ${newLabTestType} para ${patient.name}.`);
                setNewLabReport('');
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Estudio / Análisis:</label>
                  <select
                    value={newLabTestType}
                    onChange={(e) => setNewLabTestType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                  >
                    <option value="HEMOGRAMA_COMPLETO">Hemograma Completo</option>
                    <option value="PERFIL_BIOQUIMICO">Perfil Bioquímico Sanguíneo</option>
                    <option value="URIANALISIS">Urianálisis & Sedimento</option>
                    <option value="ECOGRAFIA_ABDOMINAL">Ecografía Abdominal</option>
                    <option value="RADIOGRAFIA_DIGITAL">Radiografía Digital</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Informe / Resultados del Estudio:</label>
                  <input
                    type="text"
                    required
                    value={newLabReport}
                    onChange={(e) => setNewLabReport(e.target.value)}
                    placeholder="ej: Hematocrito 38%, Leucocitos 11.500/uL, Plaquetas normales. Sin signos de anemia."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>✓ Cargar Estudio / Resultado</span>
                </button>
              </div>
            </form>
          </div>

          {/* Labs & Imaging List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Estudios Informados & En Proceso</h3>
                <p className="text-xs text-slate-500">Historial completo de análisis de laboratorio e imágenes</p>
              </div>
              <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                {patientLabs.length + patientImaging.length} Estudios
              </span>
            </div>

            {patientLabs.length === 0 && patientImaging.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                No hay estudios registrados aún. Use el formulario superior para cargar el primer análisis.
              </div>
            ) : (
              <div className="space-y-3">
                {patientLabs.map((lab) => (
                  <div key={lab.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{lab.testType}</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {lab.status}
                      </span>
                    </div>
                    <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                      {lab.diagnosticReport || 'Estudio procesado sin anomalías.'}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      Fecha: {formatDate(lab.date)} • Solicitado en Sede Central
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. 👤 TAB: PROPIETARIO / TUTOR (EDICIÓN DIRECTA) */}
      {activePatientTab === 'TUTOR' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  👤
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Datos y Edición del Tutor / Propietario</h3>
                  <p className="text-xs text-slate-500">Modifique los datos de contacto y facturación del responsable</p>
                </div>
              </div>
              {owner && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openWhatsAppHub({
                        patientName: patient.name,
                        ownerName: `${owner.firstName} ${owner.lastName}`,
                        ownerPhone: owner.phone,
                        type: 'CONTROL_GENERAL',
                      })
                    }
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1.5"
                  >
                    <span>💬 WhatsApp</span>
                  </button>
                  <a
                    href={`tel:${(owner.phone || '').replace(/[^0-9]/g, '')}`}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <span>📞 Llamar</span>
                  </a>
                </div>
              )}
            </div>

            {owner ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateOwner(owner.id, {
                    firstName: tutorFirstName,
                    lastName: tutorLastName,
                    dni: tutorDni,
                    phone: tutorPhone,
                    email: tutorEmail,
                    address: tutorAddress,
                    taxCondition: tutorTaxCondition as any,
                  });
                  showToast('success', 'Tutor Actualizado', 'Los datos del propietario fueron guardados con éxito.');
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre:</label>
                    <input
                      type="text"
                      required
                      value={tutorFirstName}
                      onChange={(e) => setTutorFirstName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Apellido:</label>
                    <input
                      type="text"
                      required
                      value={tutorLastName}
                      onChange={(e) => setTutorLastName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">DNI / CUIT:</label>
                    <input
                      type="text"
                      required
                      value={tutorDni}
                      onChange={(e) => setTutorDni(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Teléfono / WhatsApp:</label>
                    <input
                      type="text"
                      required
                      value={tutorPhone}
                      onChange={(e) => setTutorPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Correo Electrónico:</label>
                    <input
                      type="email"
                      value={tutorEmail}
                      onChange={(e) => setTutorEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Dirección / Domicilio:</label>
                    <input
                      type="text"
                      value={tutorAddress}
                      onChange={(e) => setTutorAddress(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Condición Fiscal ARCA:</label>
                    <select
                      value={tutorTaxCondition}
                      onChange={(e) => setTutorTaxCondition(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900"
                    >
                      <option value="Consumidor Final">Consumidor Final</option>
                      <option value="Monotributo">Monotributo</option>
                      <option value="Responsable Inscripto">Responsable Inscripto</option>
                      <option value="Exento">Exento</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>💾 Guardar Cambios del Tutor</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-2">
                <p className="font-bold">⚠️ Este paciente no tiene un tutor asignado.</p>
                <button
                  onClick={() => setQuickModal('NUEVO_PROPIETARIO')}
                  className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold text-xs"
                >
                  + Dar de Alta Nuevo Tutor
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. 💳 TAB: CAJA & FACTURACIÓN ARCA */}
      {activePatientTab === 'FACTURACION' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  Facturación & Cobro Directo
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-1">
                  Caja del Paciente: {patient.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Tutor a Facturar: <span className="font-bold text-slate-700">{owner ? `${owner.firstName} ${owner.lastName}` : 'Consumidor Final'}</span> • DNI/CUIT: {owner?.dni || 'S/D'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Saldo Pendiente</span>
                  <span className="text-xl font-black font-mono text-slate-900">
                    $${owner ? Math.abs(owner.balance).toLocaleString('es-AR') : '0'}
                  </span>
                </div>
                <button
                  onClick={() => setShowBillingModal(true)}
                  className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white font-black text-xs rounded-2xl shadow-md shadow-teal-600/25 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  <span>💳 Facturar (ARCA o Ticket Común)</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Comprobantes Emitidos</h4>
              {patientInvoices.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-center text-xs text-slate-400">
                  No hay comprobantes facturados previos para este paciente.
                </div>
              ) : (
                patientInvoices.map((inv) => (
                  <div key={inv.id} className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 font-mono text-sm block">{inv.invoiceNumber}</span>
                      <span className="text-slate-500 text-[11px]">Total: $${inv.totalAmount?.toLocaleString('es-AR')} • Condición: {inv.paymentMethod}</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      ✓ PAGADO
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}


      {/* 💳 MODAL FACTURACIÓN ARCA VS TICKET COMÚN */}
      {showBillingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 text-left text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                  Caja & Facturación Hospitalaria
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Liquidación de Gastos: {patient.name}
                </h3>
              </div>
              <button onClick={() => setShowBillingModal(false)} className="text-slate-400 hover:text-slate-600 font-bold p-1 text-base">
                ✕
              </button>
            </div>

            {/* Selector: Factura ARCA vs Ticket Común */}
            <div className="space-y-2">
              <label className="font-bold text-slate-700 block">Tipo de Comprobante:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBillingInvoiceType('TICKET_COMUN')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    billingInvoiceType === 'TICKET_COMUN'
                      ? 'border-teal-500 bg-teal-50/50 text-teal-950 shadow-2xs font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-xs">
                    <span>📄 Ticket Común / Recibo X</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Comprobante no fiscal para control y liberación de gasto del tutor.</p>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingInvoiceType('FACTURA_B')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    billingInvoiceType !== 'TICKET_COMUN'
                      ? 'border-teal-500 bg-teal-50/50 text-teal-950 shadow-2xs font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 font-black text-xs">
                    <span>🧾 Factura Electrónica ARCA (AFIP)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Factura oficial A/B/C con CAE y código QR fiscal de AFIP.</p>
                </button>
              </div>

              {billingInvoiceType !== 'TICKET_COMUN' && (
                <div className="pt-2 flex items-center gap-2">
                  <span className="font-bold text-slate-600">Tipo de Factura Fiscal:</span>
                  {['FACTURA_B', 'FACTURA_A', 'FACTURA_C'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setBillingInvoiceType(t as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                        billingInvoiceType === t
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {t.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Tutor Information */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block">{owner ? `${owner.firstName} ${owner.lastName}` : 'Tutor Consumidor Final'}</span>
                <span className="text-slate-500 text-[11px]">DNI/CUIT: {owner?.dni || 'S/D'} • Teléfono: {owner?.phone || 'S/D'}</span>
              </div>
              <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                {owner?.taxCondition || 'Consumidor Final'}
              </span>
            </div>

            {/* Detailed Items Breakdown Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Desglose Detallado de Gastos:</span>
                <button
                  type="button"
                  onClick={() => {
                    const desc = prompt('Descripción del ítem/medicamento:');
                    const amt = prompt('Monto en $:');
                    if (desc && amt && !isNaN(Number(amt))) {
                      setBillingItems(prev => [...prev, { id: String(Date.now()), desc, amount: Number(amt) }]);
                    }
                  }}
                  className="text-teal-600 hover:text-teal-700 font-bold text-xs"
                >
                  + Agregar Ítem
                </button>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 bg-white">
                {billingItems.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                    <span className="text-slate-800 font-medium">{item.desc}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-mono text-slate-900">${item.amount.toLocaleString('es-AR')}</span>
                      <button
                        type="button"
                        onClick={() => setBillingItems(prev => prev.filter(i => i.id !== item.id))}
                        className="text-slate-300 hover:text-rose-600 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                <div className="p-3 bg-slate-50 flex items-center justify-between font-black text-sm">
                  <span className="text-slate-900">TOTAL A COBRAR:</span>
                  <span className="text-teal-800 font-mono text-base">
                    ${billingItems.reduce((sum, i) => sum + i.amount, 0).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Medio de Pago:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'EFECTIVO', label: '💵 Efectivo' },
                  { id: 'TRANSFERENCIA', label: '🏦 Transferencia' },
                  { id: 'MERCADOPAGO_QR', label: '📱 Mercado Pago / QR' },
                  { id: 'TARJETA_DEBITO', label: '💳 Tarjeta Débito' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setBillingPaymentMethod(m.id as any)}
                    className={`py-2 px-2 rounded-xl text-center font-bold text-xs border transition-all ${
                      billingPaymentMethod === m.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBillingModal(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const num = billingInvoiceType === 'TICKET_COMUN' ? `TKT-${Math.floor(1000 + Math.random() * 9000)}` : `0001-0000${Math.floor(1000 + Math.random() * 9000)}`;
                  setGeneratedTicketNumber(num);
                  setShowBillingModal(false);
                  setShowTicketPreview(true);
                  showToast('success', 'Cobro Registrado', `Comprobante ${num} generado exitosamente.`);
                }}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-black shadow-md shadow-teal-600/20"
              >
                ✓ Cobrar & Ver Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📄 MODAL VISTA PREVIA COMPLETA DEL TICKET / COMPROBANTE PARA EL PROPIETARIO */}
      {showTicketPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100 text-left text-xs font-mono">
            <div className="text-center border-b border-dashed border-slate-300 pb-4 space-y-1">
              <h2 className="font-black text-base tracking-tight text-slate-900">VET SYSTEM HOSPITAL VETERINARIO</h2>
              <p className="text-[11px] text-slate-500">Sede Central 24 Horas • CUIT 30-71234567-8</p>
              <p className="text-[10px] text-slate-400">Córdoba, Argentina • Tel: (0351) 480-1234</p>
              <div className="pt-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full font-bold text-xs">
                  {billingInvoiceType === 'TICKET_COMUN' ? '📄 TICKET DE GASTOS / RECIBO X' : `🧾 FACTURA ${billingInvoiceType.replace('FACTURA_', '')} (ARCA)`}
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1">N° {generatedTicketNumber}</p>
                <p className="text-[10px] text-slate-400">{new Date().toLocaleString('es-AR')}</p>
              </div>
            </div>

            {/* Patient & Owner Info */}
            <div className="border-b border-dashed border-slate-300 pb-3 space-y-1 text-[11px]">
              <div><strong>Paciente:</strong> {patient.name} ({patient.species} - {patient.breed})</div>
              <div><strong>HC:</strong> {patient.clinicalRecordNumber}</div>
              <div><strong>Tutor:</strong> {owner ? `${owner.firstName} ${owner.lastName}` : 'Consumidor Final'}</div>
              <div><strong>DNI/CUIT:</strong> {owner?.dni || 'S/D'}</div>
            </div>

            {/* Items */}
            <div className="border-b border-dashed border-slate-300 pb-3 space-y-1.5">
              <div className="font-bold text-[11px] text-slate-400 flex justify-between">
                <span>CONCEPTO</span>
                <span>IMPORTE</span>
              </div>
              {billingItems.map((it) => (
                <div key={it.id} className="flex justify-between text-slate-800 text-[11px]">
                  <span className="truncate pr-2">{it.desc}</span>
                  <span className="font-bold whitespace-nowrap">${it.amount.toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-b border-dashed border-slate-300 pb-3 flex justify-between items-center text-sm font-black">
              <span>TOTAL PAGADO:</span>
              <span className="text-base text-teal-800">
                ${billingItems.reduce((sum, i) => sum + i.amount, 0).toLocaleString('es-AR')}
              </span>
            </div>

            <div className="text-[10px] text-slate-500 space-y-0.5">
              <div><strong>Medio de Pago:</strong> {billingPaymentMethod}</div>
              {billingInvoiceType !== 'TICKET_COMUN' ? (
                <div className="text-emerald-700 font-bold">CAE: 74218942198421 • Vto CAE: {new Date().toLocaleDateString('es-AR')}</div>
              ) : (
                <div className="text-slate-400">Comprobante no fiscal de control interno. Gasto liberado.</div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ticket</span>
              </button>

              {owner && (
                <button
                  type="button"
                  onClick={() => {
                    openWhatsAppHub({
                      patientName: patient.name,
                      ownerName: `${owner.firstName} ${owner.lastName}`,
                      ownerPhone: owner.phone,
                      type: 'COBRO_INSUMO',
                      details: {
                        supplyName: `Ticket de Gastos y Factura N° ${generatedTicketNumber} de ${patient.name}`,
                        supplyAmount: billingItems.reduce((sum, i) => sum + i.amount, 0),
                      },
                    });
                    setShowTicketPreview(false);
                  }}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-1"
                  title="Enviar comprobante por WhatsApp"
                >
                  <span>💬 WhatsApp</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowTicketPreview(false)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
