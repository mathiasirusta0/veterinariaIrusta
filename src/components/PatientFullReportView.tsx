import React, { useState, useMemo } from 'react';
import {
  FileText,
  Heart,
  Pill,
  Sparkles,
  FlaskConical,
  Scan,
  Scissors,
  BedDouble,
  Syringe,
  AlertTriangle,
  User,
  Phone,
  Printer,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageCircle,
  Copy,
  Scale,
  Award,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Activity,
  Layers,
  MapPin,
  X,
  Plus,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import {
  Patient,
  Owner,
  Consultation,
  SoapNote,
  Hospitalization,
  LaboratoryOrder,
  ImagingStudy,
  VaccinationRecord,
  SurgeryRecord,
  Prescription,
  ClinicalDocument,
  VitalSigns,
  PatientProblem,
  ClinicalEvolutionEntry,
} from '../types';
import { formatDate, formatDateTime, formatWeight, formatCurrency } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { EmptyState, StatusBadge } from './ui';

export interface PatientFullReportViewProps {
  patient: Patient;
  owner?: Owner | null;
}

interface TimelineEvent {
  id: string;
  date: string;
  type:
    | 'CONSULTA'
    | 'SOAP'
    | 'INTERNACION'
    | 'ALTA'
    | 'CIRUGIA'
    | 'LABORATORIO'
    | 'IMAGEN'
    | 'VACUNA'
    | 'MEDICACION'
    | 'PESO'
    | 'DOCUMENTO'
    | 'DIAGNOSTICO';
  title: string;
  subtitle?: string;
  author?: string;
  details?: React.ReactNode;
  rawText?: string;
  badge?: { label: string; bg: string };
  isCritical?: boolean;
}

export const PatientFullReportView: React.FC<PatientFullReportViewProps> = ({ patient, owner }) => {
  const {
    vitals,
    consultations,
    hospitalizations,
    problems,
    labOrders,
    imagingStudies,
    vaccinations,
    surgeries,
    prescriptions,
    documents,
    clinicalEvolutions,
    openPrintModal,
    openWhatsAppHub,
    openImagingAnnotator,
    showToast,
  } = useVet();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('TODOS');
  const [sortAscending, setSortAscending] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Accordion Expand States
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    RESUMEN: true,
    CRONOLOGIA: true,
    CONSULTAS: true,
    SOAP: true,
    DIAGNOSTICOS: true,
    SIGNOS: true,
    PESO: true,
    MEDICACION: true,
    VACUNAS: true,
    LABORATORIO: true,
    IMAGENES: true,
    CIRUGIAS: true,
    INTERNACIONES: true,
    DOCUMENTOS: true,
    SERVICIO: true,
  });

  // Modal Short Summary State
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const toggleSection = (section: string) => {
    triggerHaptic('light');
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollToSection = (sectionId: string) => {
    triggerHaptic('light');
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Patient specific dataset
  const patientVitals = useMemo(() => vitals.filter((v) => v.patientId === patient.id), [vitals, patient.id]);
  const patientConsultations = useMemo(() => consultations.filter((c) => c.patientId === patient.id), [consultations, patient.id]);
  const patientHospitalizations = useMemo(() => hospitalizations.filter((h) => h.patientId === patient.id), [hospitalizations, patient.id]);
  const patientProblems = useMemo(() => problems.filter((pr) => pr.patientId === patient.id), [problems, patient.id]);
  const patientLabs = useMemo(() => labOrders.filter((l) => l.patientId === patient.id), [labOrders, patient.id]);
  const patientImaging = useMemo(() => imagingStudies.filter((i) => i.patientId === patient.id), [imagingStudies, patient.id]);
  const patientVaccinations = useMemo(() => vaccinations.filter((v) => v.patientId === patient.id), [vaccinations, patient.id]);
  const patientSurgeries = useMemo(() => surgeries.filter((s) => s.patientId === patient.id), [surgeries, patient.id]);
  const patientPrescriptions = useMemo(() => prescriptions.filter((p) => p.patientId === patient.id), [prescriptions, patient.id]);
  const patientDocuments = useMemo(() => documents.filter((d) => d.patientId === patient.id), [documents, patient.id]);
  const patientEvolutions = useMemo(() => clinicalEvolutions.filter((e) => e.patientId === patient.id), [clinicalEvolutions, patient.id]);

  const activeHospitalization = patientHospitalizations.find((h) => h.status === 'INTERNADO');

  // Unified Chronological Timeline Builder
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // 1. Consultas
    patientConsultations.forEach((c) => {
      events.push({
        id: 'cons-' + c.id,
        date: c.dateTime,
        type: 'CONSULTA',
        title: 'Consulta Clínica: ' + (c.reason || 'Atención General'),
        subtitle: c.diagnoses && c.diagnoses.length > 0 ? 'Diagnósticos: ' + c.diagnoses.join(', ') : 'Examen clínico',
        author: c.vetName,
        badge: { label: 'Consulta', bg: 'bg-teal-50 text-teal-800 border-teal-200' },
        rawText: (c.reason + ' ' + (c.diagnoses || []).join(' ') + ' ' + (c.treatmentPlan || '') + ' ' + (c.anamnesis || '')).toLowerCase(),
        details: (
          <div className="space-y-1.5 text-xs text-slate-700">
            {c.anamnesis && <p><strong>Anamnesis:</strong> {c.anamnesis}</p>}
            {c.treatmentPlan && <p><strong>Plan Terapéutico:</strong> {c.treatmentPlan}</p>}
            {c.followUpDate && <p className="text-teal-700 font-semibold">📅 Próximo control: {formatDate(c.followUpDate)}</p>}
          </div>
        ),
      });
    });

    // 2. SOAP & Clinical Evolutions
    patientEvolutions.forEach((e) => {
      events.push({
        id: 'evo-' + e.id,
        date: e.dateTime,
        type: 'SOAP',
        title: 'Evolución ' + (e.type || 'Médica') + (e.sector ? ' (' + e.sector + ')' : ''),
        subtitle: e.assessment || e.subjective || 'Nota clínica de evolución',
        author: e.authorName + (e.authorRole ? ' • ' + e.authorRole : ''),
        badge: { label: 'SOAP', bg: 'bg-blue-50 text-blue-800 border-blue-200' },
        rawText: (e.subjective + ' ' + e.objective + ' ' + e.assessment + ' ' + e.plan + ' ' + (e.treatmentsApplied || '')).toLowerCase(),
        details: (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            {e.subjective && <div><span className="font-bold text-slate-500 uppercase text-[10px]">S (Subjetivo):</span><p>{e.subjective}</p></div>}
            {e.objective && <div><span className="font-bold text-slate-500 uppercase text-[10px]">O (Objetivo):</span><p>{e.objective}</p></div>}
            {e.assessment && <div><span className="font-bold text-slate-500 uppercase text-[10px]">A (Evaluación):</span><p>{e.assessment}</p></div>}
            {e.plan && <div><span className="font-bold text-slate-500 uppercase text-[10px]">P (Plan):</span><p>{e.plan}</p></div>}
          </div>
        ),
      });
    });

    // 3. Hospitalizaciones (Ingresos y Altas)
    patientHospitalizations.forEach((h) => {
      events.push({
        id: 'hosp-in-' + h.id,
        date: h.admittedAt,
        type: 'INTERNACION',
        title: 'Ingreso a Internación / UCI (' + h.sector + ')',
        subtitle: 'Motivo: ' + (h.reasonForAdmission || h.primaryDiagnosis || 'Monitoreo intensivo'),
        author: h.assignedDoctor,
        badge: { label: 'Internación', bg: 'bg-purple-50 text-purple-800 border-purple-200' },
        rawText: (h.reasonForAdmission + ' ' + h.primaryDiagnosis + ' ' + h.sector).toLowerCase(),
        details: (
          <div className="text-xs text-slate-700 space-y-1">
            <p><strong>Diagnóstico Principal:</strong> {h.primaryDiagnosis}</p>
            <p><strong>Sector / Canil:</strong> {h.sector} (Prioridad: {h.priority})</p>
          </div>
        ),
      });

      if (h.dischargedAt) {
        events.push({
          id: 'hosp-out-' + h.id,
          date: h.dischargedAt,
          type: 'ALTA',
          title: 'Alta Hospitalaria (' + h.sector + ')',
          subtitle: h.dischargeReport?.dischargeDiagnosis || 'Evolución favorable',
          author: h.assignedDoctor,
          badge: { label: 'Alta', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
          rawText: (h.dischargeReport?.dischargeDiagnosis || 'alta').toLowerCase(),
          details: h.dischargeReport?.homeCareInstructions ? (
            <p className="text-xs text-slate-700"><strong>Indicaciones al Alta:</strong> {h.dischargeReport.homeCareInstructions}</p>
          ) : undefined,
        });
      }
    });

    // 4. Cirugías
    patientSurgeries.forEach((s) => {
      events.push({
        id: 'surg-' + s.id,
        date: s.date,
        type: 'CIRUGIA',
        title: 'Cirugía / Procedimiento: ' + s.procedureName,
        subtitle: 'Cirujano: ' + s.surgeonName + (s.asaScore ? ' • Riesgo ASA ' + s.asaScore : ''),
        author: s.surgeonName,
        badge: { label: 'Quirófano', bg: 'bg-pink-50 text-pink-800 border-pink-200' },
        rawText: (s.procedureName + ' ' + (s.preOpDiagnosis || '') + ' ' + (s.surgicalDescription || '')).toLowerCase(),
        details: (
          <div className="text-xs text-slate-700 space-y-1">
            <p><strong>Diagnóstico Pre/Post:</strong> {s.preOpDiagnosis} ➔ {s.postOpDiagnosis || s.preOpDiagnosis}</p>
            {s.anesthetistName && <p><strong>Anestesista:</strong> {s.anesthetistName}</p>}
            {s.surgicalDescription && <p><strong>Técnica Quirúrgica:</strong> {s.surgicalDescription}</p>}
          </div>
        ),
      });
    });

    // 5. Laboratorio
    patientLabs.forEach((l) => {
      const hasAbnormal = l.results?.some((r) => r.isAbnormal);
      events.push({
        id: 'lab-' + l.id,
        date: l.requestedAt,
        type: 'LABORATORIO',
        title: 'Laboratorio: ' + l.testType.replace(/_/g, ' '),
        subtitle: l.conclusions || (hasAbnormal ? '⚠️ Resultados alterados detectados' : 'Estudio procesado'),
        author: l.requestedBy,
        badge: { label: 'Laboratorio', bg: hasAbnormal ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-teal-50 text-teal-800 border-teal-200' },
        isCritical: hasAbnormal,
        rawText: (l.testType + ' ' + (l.conclusions || '') + ' ' + (l.results || []).map((r) => r.parameter + ' ' + r.value).join(' ')).toLowerCase(),
        details: (
          <div className="space-y-1.5 text-xs">
            {l.conclusions && <p className="text-slate-800 font-semibold"><strong>Conclusión:</strong> {l.conclusions}</p>}
            {l.results && l.results.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {l.results.map((r, i) => (
                  <span key={i} className={'px-2 py-0.5 rounded text-[11px] font-mono ' + (r.isAbnormal ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-slate-100 text-slate-700')}>
                    {r.parameter}: {r.value} {r.unit} {r.isAbnormal && '⚠️'}
                  </span>
                ))}
              </div>
            )}
          </div>
        ),
      });
    });

    // 6. Diagnóstico por Imágenes
    patientImaging.forEach((im) => {
      events.push({
        id: 'img-' + im.id,
        date: im.date,
        type: 'IMAGEN',
        title: 'Estudio de Imagen: ' + im.modality + ' (' + im.region + ')',
        subtitle: im.conclusion || im.report || 'Estudio imagenológico',
        author: im.performedBy,
        badge: { label: 'Imágenes', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
        rawText: (im.modality + ' ' + im.region + ' ' + (im.report || '') + ' ' + (im.conclusion || '')).toLowerCase(),
        details: (
          <div className="text-xs text-slate-700 space-y-1">
            {im.report && <p><strong>Hallazgos:</strong> {im.report}</p>}
            {im.conclusion && <p className="text-indigo-950 font-bold"><strong>Conclusión:</strong> {im.conclusion}</p>}
          </div>
        ),
      });
    });

    // 7. Vacunación & Inmunizaciones
    patientVaccinations.forEach((v) => {
      events.push({
        id: 'vac-' + v.id,
        date: v.administeredDate,
        type: 'VACUNA',
        title: 'Vacunación / Biológico: ' + v.vaccineName,
        subtitle: 'Lote: ' + v.batchNumber + ' (' + v.manufacturer + ') • Próximo refuerzo: ' + formatDate(v.nextDueDate),
        author: v.administeredBy,
        badge: { label: 'Vacuna', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
        rawText: (v.vaccineName + ' ' + v.batchNumber + ' ' + v.manufacturer + ' ' + (v.type || '')).toLowerCase(),
        details: (
          <p className="text-xs text-slate-700">
            <strong>Laboratorio:</strong> {v.manufacturer} • <strong>Lote:</strong> {v.batchNumber} • <strong>Próx. Dosis:</strong> {formatDate(v.nextDueDate)}
          </p>
        ),
      });
    });

    // 8. Medicación & Prescripciones
    patientPrescriptions.forEach((p) => {
      events.push({
        id: 'presc-' + p.id,
        date: p.date,
        type: 'MEDICACION',
        title: 'Receta / Prescripción #' + p.prescriptionNumber,
        subtitle: p.items.map((it) => it.drugName + ' (' + it.dose + ')').join(', '),
        author: p.vetName,
        badge: { label: 'Receta', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
        rawText: (p.prescriptionNumber + ' ' + (p.diagnosis || '') + ' ' + p.items.map((it) => it.drugName + ' ' + it.instructions).join(' ')).toLowerCase(),
        details: (
          <div className="space-y-1 text-xs">
            {p.diagnosis && <p><strong>Diagnóstico:</strong> {p.diagnosis}</p>}
            <ul className="list-disc list-inside text-slate-700 pl-1">
              {p.items.map((it, idx) => (
                <li key={idx}><strong>{it.drugName}:</strong> {it.dose} vía {it.route} ({it.frequency}) x {it.duration}</li>
              ))}
            </ul>
          </div>
        ),
      });
    });

    // 9. Documentos & Consentimientos
    patientDocuments.forEach((doc) => {
      events.push({
        id: 'doc-' + doc.id,
        date: doc.createdAt,
        type: 'DOCUMENTO',
        title: 'Documento Clínico: ' + doc.title,
        subtitle: doc.isSigned ? '✅ Firmado digitalmente por ' + (doc.signedByOwnerName || 'Tutor') : 'Emitido / Sin firmar',
        author: doc.vetName,
        badge: { label: 'Documento', bg: 'bg-slate-100 text-slate-800 border-slate-200' },
        rawText: (doc.title + ' ' + doc.type + ' ' + (doc.signedByOwnerName || '')).toLowerCase(),
      });
    });

    return events;
  }, [
    patientConsultations,
    patientEvolutions,
    patientHospitalizations,
    patientSurgeries,
    patientLabs,
    patientImaging,
    patientVaccinations,
    patientPrescriptions,
    patientDocuments,
  ]);

  // Filtered & Sorted Timeline
  const filteredTimeline = useMemo(() => {
    return timelineEvents
      .filter((ev) => {
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch = !q || (ev.rawText && ev.rawText.includes(q)) || ev.title.toLowerCase().includes(q) || (ev.subtitle && ev.subtitle.toLowerCase().includes(q));
        const matchesType = eventTypeFilter === 'TODOS' || ev.type === eventTypeFilter;

        let matchesDate = true;
        if (dateFrom) matchesDate = matchesDate && new Date(ev.date) >= new Date(dateFrom);
        if (dateTo) matchesDate = matchesDate && new Date(ev.date) <= new Date(dateTo + 'T23:59:59');

        return matchesSearch && matchesType && matchesDate;
      })
      .sort((a, b) => {
        const tA = new Date(a.date).getTime();
        const tB = new Date(b.date).getTime();
        return sortAscending ? tA - tB : tB - tA;
      });
  }, [timelineEvents, searchTerm, eventTypeFilter, sortAscending, dateFrom, dateTo]);

  // Last known biometrics
  const latestVital = patientVitals[0];
  const activeProblems = patientProblems.filter((p) => p.status === 'ACTIVO' || p.status === 'CRONICO');
  const resolvedProblems = patientProblems.filter((p) => p.status === 'RESUELTO' || p.status === 'CONTROLADO');

  const handlePrintFullReport = () => {
    triggerHaptic('medium');
    window.print();
  };

  const handleSendWhatsAppSummary = () => {
    triggerHaptic('light');
    if (!owner) {
      showToast('error', 'Sin Tutor', 'No hay un tutor registrado para este paciente.');
      return;
    }

    const lastDiag = activeProblems.map((p) => p.title).join(', ') || 'Control preventivo';
    openWhatsAppHub({
      patientName: patient.name,
      ownerName: owner.firstName + ' ' + owner.lastName,
      ownerPhone: owner.phone || owner.whatsapp || '',
      type: 'RESUMEN_CLINICO',
      details: {
        hc: patient.clinicalRecordNumber,
        species: patient.species + ' ' + patient.breed,
        diagnosis: lastDiag,
        status: patient.status,
        lastWeight: formatWeight(patient.weight),
      },
    });
  };

  const isWorkingAnimal =
    patient.isProductionAnimal ||
    patient.equinePassport ||
    patient.species === 'EQUINO' ||
    (patient.species as any) === 'ASNAL' ||
    (patient.species as any) === 'MULAR' ||
    (patient.particularMarks && patient.particularMarks.toLowerCase().includes('k9')) ||
    (patient.particularMarks && patient.particularMarks.toLowerCase().includes('ejercito'));

  return (
    <div className="space-y-6 pb-20 w-full max-w-full print:p-0 print:space-y-4">
      {/* 1. TOP ACTION RIBBON (Hidden on print) */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-800 block">
            EXPEDIENTE CLÍNICO INTEGRAL & HISTORIAL 360°
          </span>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>Informe Completo: {patient.name} ({patient.clinicalRecordNumber})</span>
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Generate Short Summary Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setShowSummaryModal(true);
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            title="Ver resumen ejecutivo corto"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Resumen Ejecutivo</span>
          </button>

          {/* WhatsApp Button */}
          {owner && (
            <button
              type="button"
              onClick={handleSendWhatsAppSummary}
              className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
              title="Enviar resumen al tutor por WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>
          )}

          {/* Print / Download PDF */}
          <button
            type="button"
            onClick={handlePrintFullReport}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition-all active:scale-95 flex items-center gap-1.5"
            title="Imprimir / Guardar como PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>

      {/* 2. QUICK JUMP STICKY NAV BAR (Hidden on print) */}
      <div className="sticky top-2 z-20 bg-white/95 backdrop-blur-md border border-slate-200 p-2.5 rounded-2xl shadow-xs print:hidden">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 flex-wrap">
          <span className="text-[10px] uppercase text-slate-400 font-extrabold px-1">Secciones:</span>
          {[
            { id: 'sec-resumen', label: 'Resumen', icon: '📊' },
            { id: 'sec-alertas', label: 'Alertas', icon: '⚠️' },
            { id: 'sec-cronologia', label: 'Línea de Tiempo', icon: '⏳' },
            { id: 'sec-consultas', label: 'Consultas (' + patientConsultations.length + ')', icon: '🩺' },
            { id: 'sec-soap', label: 'SOAP (' + patientEvolutions.length + ')', icon: '📝' },
            { id: 'sec-diagnosticos', label: 'Diagnósticos (' + patientProblems.length + ')', icon: '🎯' },
            { id: 'sec-vitals', label: 'Signos Vitales', icon: '❤️' },
            { id: 'sec-peso', label: 'Peso', icon: '⚖️' },
            { id: 'sec-medicacion', label: 'Medicación', icon: '💊' },
            { id: 'sec-vacunas', label: 'Vacunas (' + patientVaccinations.length + ')', icon: '💉' },
            { id: 'sec-laboratorio', label: 'Laboratorio (' + patientLabs.length + ')', icon: '🧪' },
            { id: 'sec-imagenes', label: 'Imágenes (' + patientImaging.length + ')', icon: '📷' },
            { id: 'sec-cirugias', label: 'Cirugías (' + patientSurgeries.length + ')', icon: '✂️' },
            { id: 'sec-internaciones', label: 'Internación (' + patientHospitalizations.length + ')', icon: '🏥' },
            { id: 'sec-documentos', label: 'Documentos (' + patientDocuments.length + ')', icon: '📄' },
            ...(isWorkingAnimal ? [{ id: 'sec-servicio', label: 'Actividad / Tropa', icon: '🎖️' }] : []),
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollToSection(item.id)}
              className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-900 rounded-xl text-[11px] transition-colors flex items-center gap-1 border border-slate-200/60 active:scale-95 cursor-pointer shadow-2xs"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. PATIENT IDENTITY HEADER CARD */}
      <div id="sec-resumen" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-2xl flex-shrink-0 font-bold text-teal-800 shadow-2xs overflow-hidden">
              {patient.photoUrl ? (
                <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" />
              ) : (
                <span>{patient.species === 'EQUINO' ? '🐎' : (patient.species as any) === 'ASNAL' ? '🫏' : (patient.species as any) === 'MULAR' ? '🐴' : patient.species === 'FELINO' ? '🐈' : '🐕'}</span>
              )}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{patient.name}</h1>
                <span className="font-mono font-black text-xs text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                  {patient.clinicalRecordNumber}
                </span>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {patient.status}
                </span>
                {activeHospitalization && (
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase bg-purple-100 text-purple-900 border border-purple-300 animate-pulse">
                    🏥 INTERNADO ({activeHospitalization.sector})
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-slate-700">
                {patient.species} • {patient.breed} • {patient.sex} ({patient.reproductiveStatus}) • {patient.calculatedAge || 'Edad no informada'}
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-mono pt-0.5">
                <span>⚖️ Peso: <strong>{formatWeight(patient.weight)}</strong></span>
                <span>🎨 Pelaje: {patient.color || 'No especificado'}</span>
                {patient.microchip && <span>🆔 Microchip: {patient.microchip}</span>}
                {patient.equinePassport && <span>📖 Pasaporte: {patient.equinePassport}</span>}
              </div>
            </div>
          </div>

          {/* Owner Details Card */}
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs space-y-1 md:max-w-xs w-full flex-shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tutor / Responsable:</span>
            <p className="font-bold text-slate-900 text-sm">
              {owner ? owner.firstName + ' ' + owner.lastName : 'Sin tutor registrado'}
            </p>
            {owner && (
              <>
                <p className="text-slate-600 font-mono text-[11px]">DNI/CUIT: {owner.dni || owner.cuit || 'N/D'}</p>
                <p className="text-slate-600">📞 {owner.phone || owner.whatsapp || 'Sin teléfono'}</p>
                {owner.address && <p className="text-slate-500 truncate">📍 {owner.address}, {owner.city}</p>}
                <p className="text-[11px] font-mono pt-1 border-t border-slate-200">
                  Cuenta Corriente:{' '}
                  <strong className={(owner.balance || 0) < 0 ? 'text-rose-600 font-black' : 'text-emerald-700 font-black'}>
                    {formatCurrency(owner.balance || 0)}
                  </strong>
                </p>
              </>
            )}
          </div>
        </div>

        {/* 4. CLINICAL ALERTS */}
        <div id="sec-alertas" className="space-y-2">
          <span className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider block">
            ALERTAS CLÍNICAS & CONDICIONES CRÍTICAS:
          </span>
          {patient.alerts && patient.alerts.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.alerts.map((al, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                  <span><strong>{al.type}:</strong> {al.description}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Sin alertas clínicas restrictivas registradas. Paciente con condición de base evaluada.</span>
            </div>
          )}
        </div>

        {/* 5. CURRENT CLINICAL STATUS SNAPSHOT */}
        <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs">
          <span className="text-[11px] font-extrabold uppercase text-slate-600 tracking-wider block">
            ESTADO CLÍNICO ACTUAL EN TIEMPO REAL:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Diagnósticos Activos:</span>
              <p className="font-bold text-slate-900 truncate">
                {activeProblems.map((p) => p.title).join(', ') || 'Ninguno activo'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Última Consulta:</span>
              <p className="font-bold text-slate-900 truncate">
                {patientConsultations[0] ? formatDate(patientConsultations[0].dateTime) + ' (' + patientConsultations[0].reason + ')' : 'Sin consultas previas'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Últimos Signos Vitales:</span>
              <p className="font-bold text-slate-900 font-mono">
                {latestVital ? 'T: ' + latestVital.temperature + '°C • FC: ' + latestVital.heartRate + ' • FR: ' + latestVital.respiratoryRate : 'No registrados'}
              </p>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Estado de Internación:</span>
              <p className="font-bold text-slate-900">
                {activeHospitalization ? '🏥 ' + activeHospitalization.sector : 'Ambulatorio'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 6. UNIFIED CHRONOLOGICAL TIMELINE (CRONOLOGÍA CLÍNICA) */}
      <div id="sec-cronologia" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>Cronología Clínica Unificada ({filteredTimeline.length} eventos)</span>
            </h3>
            <p className="text-xs text-slate-500">Historial completo e inmutable ordenado cronológicamente</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {/* Sort Toggle */}
            <button
              type="button"
              onClick={() => setSortAscending(!sortAscending)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortAscending ? 'Más Antiguo Primero' : 'Más Reciente Primero'}</span>
            </button>
          </div>
        </div>

        {/* Timeline Search & Event Filter Bar (Hidden on print) */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2.5 print:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar dentro del historial (diagnósticos, fármacos, analitos, notas...)..."
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Type Filter Chips */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {[
              { id: 'TODOS', label: 'Todos' },
              { id: 'CONSULTA', label: '🩺 Consultas' },
              { id: 'SOAP', label: '📝 SOAP' },
              { id: 'INTERNACION', label: '🏥 Internación' },
              { id: 'CIRUGIA', label: '✂️ Cirugías' },
              { id: 'LABORATORIO', label: '🧪 Laboratorio' },
              { id: 'IMAGEN', label: '📷 Imágenes' },
              { id: 'VACUNA', label: '💉 Vacunas' },
              { id: 'MEDICACION', label: '💊 Recetas' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setEventTypeFilter(f.id)}
                className={'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all ' +
                  (eventTypeFilter === f.id
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100')}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Events List */}
        {filteredTimeline.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No se encontraron eventos en la línea de tiempo"
            description="No hay registros clínicos que coincidan con la búsqueda o filtro aplicado."
          />
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-4 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {filteredTimeline.map((ev) => (
              <div key={ev.id} className="relative group">
                {/* Timeline Dot */}
                <div
                  className={'absolute -left-6 sm:-left-8 top-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ' +
                    (ev.isCritical
                      ? 'bg-rose-500 text-white border-rose-200 ring-4 ring-rose-100 animate-pulse'
                      : 'bg-white text-teal-700 border-teal-500 ring-2 ring-slate-100')}
                >
                  {ev.type === 'CONSULTA'
                    ? '🩺'
                    : ev.type === 'SOAP'
                    ? '📝'
                    : ev.type === 'INTERNACION'
                    ? '🏥'
                    : ev.type === 'CIRUGIA'
                    ? '✂️'
                    : ev.type === 'LABORATORIO'
                    ? '🧪'
                    : ev.type === 'IMAGEN'
                    ? '📷'
                    : ev.type === 'VACUNA'
                    ? '💉'
                    : ev.type === 'MEDICACION'
                    ? '💊'
                    : '📌'}
                </div>

                {/* Event Card */}
                <div className="bg-slate-50/90 hover:bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 transition-all shadow-2xs space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ev.badge && (
                        <span className={'text-[9px] font-black uppercase px-2 py-0.2 rounded-md border ' + ev.badge.bg}>
                          {ev.badge.label}
                        </span>
                      )}
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">{ev.title}</h4>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 font-semibold whitespace-nowrap">
                      📅 {formatDateTime(ev.date)}
                    </span>
                  </div>

                  {ev.subtitle && <p className="text-xs text-slate-600 font-medium">{ev.subtitle}</p>}
                  {ev.details && <div className="pt-1">{ev.details}</div>}

                  {ev.author && (
                    <div className="text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200/60">
                      Profesional: <strong className="text-slate-600">{ev.author}</strong>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 7. SECCIÓN: HISTORIA CLÍNICA (CONSULTAS DETALLADAS) */}
      <div id="sec-consultas" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div
          onClick={() => toggleSection('CONSULTAS')}
          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-3"
        >
          <div className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-black text-slate-900">
              Historia Clínica & Consultas ({patientConsultations.length})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700">
            {expandedSections.CONSULTAS ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.CONSULTAS && (
          <div className="space-y-3">
            {patientConsultations.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No existen consultas médicas registradas para este paciente.</p>
            ) : (
              patientConsultations.map((c) => (
                <div key={c.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-200/80 pb-2">
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{c.reason || 'Consulta Médica'}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        📅 {formatDateTime(c.dateTime)} • Dr/a: {c.vetName} ({c.vetLicense || 'MP-VET'})
                      </span>
                    </div>
                    {c.diagnoses && c.diagnoses.length > 0 && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-teal-100 text-teal-800 font-bold text-[11px]">
                        {c.diagnoses.join(', ')}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-700">
                    {c.anamnesis && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Anamnesis:</span>
                        <p>{c.anamnesis}</p>
                      </div>
                    )}
                    {c.treatmentPlan && (
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Plan de Tratamiento:</span>
                        <p>{c.treatmentPlan}</p>
                      </div>
                    )}
                  </div>

                  {c.prescriptions && c.prescriptions.length > 0 && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[10px] font-bold text-teal-800 uppercase block">Medicaciones Prescriptas:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-800">
                        {c.prescriptions.map((pr, idx) => (
                          <li key={idx}><strong>{pr.drugName}:</strong> {pr.dose} vía {pr.route} ({pr.frequency})</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 8. SECCIÓN: EVOLUCIONES SOAP */}
      <div id="sec-soap" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div
          onClick={() => toggleSection('SOAP')}
          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-3"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-black text-slate-900">
              Evoluciones Clínicas SOAP ({patientEvolutions.length})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700">
            {expandedSections.SOAP ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.SOAP && (
          <div className="space-y-3">
            {patientEvolutions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No existen evoluciones SOAP registradas.</p>
            ) : (
              patientEvolutions.map((evo) => (
                <div key={evo.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="font-bold text-slate-900">
                      Evolución {evo.type} • {evo.authorName} ({evo.authorRole})
                    </span>
                    <span className="font-mono text-slate-500 text-[11px]">{formatDateTime(evo.dateTime)}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-400 text-[10px] block">S (Subjetivo)</span>
                      <p className="text-slate-800 mt-0.5">{evo.subjective || 'Sin datos'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-400 text-[10px] block">O (Objetivo)</span>
                      <p className="text-slate-800 mt-0.5">{evo.objective || 'Sin datos'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-400 text-[10px] block">A (Evaluación)</span>
                      <p className="text-slate-800 mt-0.5">{evo.assessment || 'Sin datos'}</p>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-400 text-[10px] block">P (Plan)</span>
                      <p className="text-slate-800 mt-0.5">{evo.plan || 'Sin datos'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 9. SECCIÓN: DIAGNÓSTICOS & PROBLEMAS */}
      <div id="sec-diagnosticos" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div
          onClick={() => toggleSection('DIAGNOSTICOS')}
          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-3"
        >
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-black text-slate-900">
              Diagnósticos & Lista de Problemas ({patientProblems.length})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700">
            {expandedSections.DIAGNOSTICOS ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.DIAGNOSTICOS && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Activos */}
            <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-black text-rose-800 uppercase tracking-wider block">
                🔴 Diagnósticos Activos ({activeProblems.length}):
              </span>
              {activeProblems.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay diagnósticos activos.</p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {activeProblems.map((p) => (
                    <li key={p.id} className="bg-white p-2.5 rounded-xl border border-rose-200 text-slate-900 font-bold shadow-2xs">
                      {p.title}
                      {p.description && <span className="block font-normal text-slate-600 text-[11px] mt-0.5">{p.description}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Resueltos / Históricos */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <span className="text-xs font-black text-slate-700 uppercase tracking-wider block">
                🟢 Históricos / Resueltos ({resolvedProblems.length}):
              </span>
              {resolvedProblems.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay diagnósticos resueltos registrados.</p>
              ) : (
                <ul className="space-y-1.5 text-xs">
                  {resolvedProblems.map((p) => (
                    <li key={p.id} className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700">
                      <strong>{p.title}</strong>
                      <span className="text-[10px] text-emerald-700 font-bold ml-1.5">✓ RESUELTO</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 10. SECCIÓN: SIGNOS VITALES & BIOMETRÍA */}
      <div id="sec-vitals" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div
          onClick={() => toggleSection('SIGNOS')}
          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-3"
        >
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-black text-slate-900">
              Signos Vitales & Monitoreo ({patientVitals.length})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700">
            {expandedSections.SIGNOS ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.SIGNOS && (
          <div className="overflow-x-auto w-full">
            {patientVitals.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No existen controles de signos vitales cargados.</p>
            ) : (
              <table className="w-full text-xs text-left min-w-[700px]">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Fecha / Hora</th>
                    <th className="p-2.5">T° (°C)</th>
                    <th className="p-2.5">FC (lpm)</th>
                    <th className="p-2.5">FR (rpm)</th>
                    <th className="p-2.5">PA (mmHg)</th>
                    <th className="p-2.5">SpO2 (%)</th>
                    <th className="p-2.5">Glucemia</th>
                    <th className="p-2.5">Mucosas</th>
                    <th className="p-2.5 text-right">Profesional</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {patientVitals.map((v, i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-bold text-slate-800">{formatDateTime(v.recordedAt)}</td>
                      <td className="p-2.5">{v.temperature ? v.temperature + '°C' : '-'}</td>
                      <td className="p-2.5">{v.heartRate || '-'}</td>
                      <td className="p-2.5">{v.respiratoryRate || '-'}</td>
                      <td className="p-2.5">{v.bloodPressureSystolic ? v.bloodPressureSystolic + '/' + v.bloodPressureDiastolic : '-'}</td>
                      <td className="p-2.5">{v.spO2 ? v.spO2 + '%' : '-'}</td>
                      <td className="p-2.5">{v.bloodGlucose ? v.bloodGlucose + ' mg/dL' : '-'}</td>
                      <td className="p-2.5 font-sans text-slate-700">{v.mucousMembranes || 'Normal'}</td>
                      <td className="p-2.5 text-right font-sans text-slate-600">{v.recordedBy || 'Guardia'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* 11. SECCIÓN: MEDICACIÓN & RECETAS */}
      <div id="sec-medicacion" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div
          onClick={() => toggleSection('MEDICACION')}
          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-3"
        >
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-black text-slate-900">
              Medicación Actual & Recetario ({patientPrescriptions.length})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700">
            {expandedSections.MEDICACION ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.MEDICACION && (
          <div className="space-y-3">
            {patientPrescriptions.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No existen recetas registradas.</p>
            ) : (
              patientPrescriptions.map((presc) => (
                <div key={presc.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <span className="font-bold text-slate-900 font-mono">Receta #{presc.prescriptionNumber}</span>
                    <span className="font-mono text-slate-500">{formatDate(presc.date)} • Dr/a: {presc.vetName}</span>
                  </div>
                  <div className="space-y-1.5">
                    {presc.items.map((it, idx) => (
                      <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                        <div>
                          <strong className="text-slate-900 text-sm block">{it.drugName}</strong>
                          <span className="text-slate-600">Dosis: {it.dose} • Vía: {it.route} • Frecuencia: {it.frequency} x {it.duration}</span>
                        </div>
                        {it.batchNumber && (
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded">
                            Lote: {it.batchNumber}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 12. SECCIÓN: VACUNACIÓN & PLANES SANITARIOS */}
      <div id="sec-vacunas" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div
          onClick={() => toggleSection('VACUNAS')}
          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-3"
        >
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-black text-slate-900">
              Vacunación, Inmunización & Libreta Oficial ({patientVaccinations.length})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700">
            {expandedSections.VACUNAS ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.VACUNAS && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {patientVaccinations.length === 0 ? (
              <p className="text-xs text-slate-400 italic col-span-full">No existen vacunas registradas.</p>
            ) : (
              patientVaccinations.map((vac) => {
                const isOverdue = new Date(vac.nextDueDate) < new Date();
                return (
                  <div key={vac.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 text-xs">
                    <div className="flex items-start justify-between gap-1">
                      <strong className="text-slate-900 font-bold text-sm block">{vac.vaccineName}</strong>
                      <span
                        className={'text-[9px] font-black px-2 py-0.2 rounded-full uppercase ' +
                          (isOverdue
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200')}
                      >
                        {isOverdue ? '⚠️ Vencida' : '✓ Vigente'}
                      </span>
                    </div>
                    <p className="text-slate-600">Fab: {vac.manufacturer} • Lote: <strong className="font-mono">{vac.batchNumber}</strong></p>
                    <p className="text-slate-500 font-mono text-[11px]">Aplicada: {formatDate(vac.administeredDate)}</p>
                    <p className="text-teal-900 font-bold font-mono text-[11px] pt-1 border-t border-slate-200">
                      Próx. Refuerzo: {formatDate(vac.nextDueDate)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 13. SECCIÓN: LABORATORIO CLÍNICO */}
      <div id="sec-laboratorio" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div
          onClick={() => toggleSection('LABORATORIO')}
          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-3"
        >
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-teal-600" />
            <h3 className="text-base font-black text-slate-900">
              Estudios de Laboratorio & Análisis ({patientLabs.length})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700">
            {expandedSections.LABORATORIO ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.LABORATORIO && (
          <div className="space-y-3">
            {patientLabs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No existen análisis de laboratorio registrados.</p>
            ) : (
              patientLabs.map((lab) => (
                <div key={lab.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div>
                      <strong className="text-slate-900 text-sm block">{lab.testType.replace(/_/g, ' ')}</strong>
                      <span className="font-mono text-slate-500 text-[11px]">{lab.orderNumber} • 📅 {formatDateTime(lab.requestedAt)}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                      {lab.status}
                    </span>
                  </div>

                  {lab.conclusions && (
                    <p className="text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200 font-medium">
                      <strong>Conclusión:</strong> {lab.conclusions}
                    </p>
                  )}

                  {lab.results && lab.results.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {lab.results.map((r, i) => (
                        <div key={i} className={'p-2 rounded-xl border ' + (r.isAbnormal ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-white border-slate-200 text-slate-800')}>
                          <span className="text-[10px] text-slate-500 block">{r.parameter}</span>
                          <strong className="font-mono text-xs">{r.value} {r.unit}</strong>
                          {r.isAbnormal && <span className="block text-[9px] font-black text-rose-700">⚠️ FUERA DE RANGO</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 14. SECCIÓN: DIAGNÓSTICO POR IMÁGENES */}
      <div id="sec-imagenes" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div
          onClick={() => toggleSection('IMAGENES')}
          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-3"
        >
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-black text-slate-900">
              Diagnóstico por Imágenes & Radiología ({patientImaging.length})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700">
            {expandedSections.IMAGENES ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.IMAGENES && (
          <div className="space-y-3">
            {patientImaging.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No existen estudios de imagen registrados.</p>
            ) : (
              patientImaging.map((img) => (
                <div key={img.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div>
                      <strong className="text-slate-900 text-sm block">{img.modality} — {img.region}</strong>
                      <span className="font-mono text-slate-500 text-[11px]">{img.studyNumber} • 📅 {formatDate(img.date)}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      {img.status}
                    </span>
                  </div>

                  {img.report && <p className="text-slate-700"><strong>Hallazgos:</strong> {img.report}</p>}
                  {img.conclusion && (
                    <p className="text-slate-900 font-bold bg-white p-2.5 rounded-xl border border-slate-200">
                      <strong>Conclusión:</strong> {img.conclusion}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 15. SECCIÓN: CIRUGÍAS & QUIRÓFANO */}
      <div id="sec-cirugias" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div
          onClick={() => toggleSection('CIRUGIAS')}
          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-3"
        >
          <div className="flex items-center gap-2">
            <Scissors className="w-5 h-5 text-pink-600" />
            <h3 className="text-base font-black text-slate-900">
              Cirugías & Procedimientos Quirúrgicos ({patientSurgeries.length})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700">
            {expandedSections.CIRUGIAS ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.CIRUGIAS && (
          <div className="space-y-3">
            {patientSurgeries.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No existen cirugías registradas.</p>
            ) : (
              patientSurgeries.map((surg) => (
                <div key={surg.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div>
                      <strong className="text-slate-900 text-sm block">{surg.procedureName}</strong>
                      <span className="font-mono text-slate-500 text-[11px]">{surg.surgeryNumber} • 📅 {formatDate(surg.date)}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-pink-100 text-pink-800">
                      Riesgo ASA {surg.asaScore || 'I'} • {surg.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    <p><strong>Cirujano:</strong> {surg.surgeonName}</p>
                    <p><strong>Anestesista:</strong> {surg.anesthetistName || 'No informado'}</p>
                    <p><strong>Diagnóstico:</strong> {surg.preOpDiagnosis}</p>
                    {surg.recoveryNotes && <p><strong>Recuperación:</strong> {surg.recoveryNotes}</p>}
                  </div>

                  {surg.surgicalDescription && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-800">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Parte Quirúrgico:</span>
                      <p>{surg.surgicalDescription}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 16. SECCIÓN: HISTORIAL DE INTERNACIONES & UCI */}
      <div id="sec-internaciones" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div
          onClick={() => toggleSection('INTERNACIONES')}
          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-3"
        >
          <div className="flex items-center gap-2">
            <BedDouble className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-black text-slate-900">
              Historial de Internaciones & UCI ({patientHospitalizations.length})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700">
            {expandedSections.INTERNACIONES ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.INTERNACIONES && (
          <div className="space-y-3">
            {patientHospitalizations.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No existen ingresos de internación registrados.</p>
            ) : (
              patientHospitalizations.map((hosp) => (
                <div key={hosp.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div>
                      <strong className="text-slate-900 text-sm block">Sector: {hosp.sector} (Prioridad: {hosp.priority})</strong>
                      <span className="font-mono text-slate-500 text-[11px]">
                        Ingreso: {formatDateTime(hosp.admittedAt)} {hosp.dischargedAt ? '• Alta: ' + formatDateTime(hosp.dischargedAt) : '• (ACTIVO)'}
                      </span>
                    </div>
                    <span className={'text-[10px] font-bold px-2 py-0.5 rounded ' + (hosp.status === 'INTERNADO' ? 'bg-purple-100 text-purple-900' : 'bg-emerald-100 text-emerald-900')}>
                      {hosp.status}
                    </span>
                  </div>

                  <p className="text-slate-700"><strong>Motivo:</strong> {hosp.reasonForAdmission || hosp.primaryDiagnosis}</p>
                  {hosp.assignedDoctor && <p className="text-slate-500"><strong>Médico a cargo:</strong> {hosp.assignedDoctor}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 17. SECCIÓN: DOCUMENTOS & CONSENTIMIENTOS */}
      <div id="sec-documentos" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div
          onClick={() => toggleSection('DOCUMENTOS')}
          className="flex items-center justify-between cursor-pointer select-none border-b border-slate-100 pb-3"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-black text-slate-900">
              Documentos Clínicos & Consentimientos Informados ({patientDocuments.length})
            </h3>
          </div>
          <button type="button" className="text-slate-400 hover:text-slate-700">
            {expandedSections.DOCUMENTOS ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expandedSections.DOCUMENTOS && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {patientDocuments.length === 0 ? (
              <p className="text-xs text-slate-400 italic col-span-full">No existen documentos adjuntos.</p>
            ) : (
              patientDocuments.map((doc) => (
                <div key={doc.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-1.5 text-xs flex flex-col justify-between">
                  <div>
                    <strong className="text-slate-900 font-bold block">{doc.title}</strong>
                    <span className="text-[10px] text-slate-500 font-mono">{formatDateTime(doc.createdAt)} • {doc.vetName}</span>
                    <p className="text-slate-600 line-clamp-2 mt-1">{doc.content}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className={'text-[10px] font-bold ' + (doc.isSigned ? 'text-emerald-700' : 'text-amber-700')}>
                      {doc.isSigned ? '✓ Firmado (' + doc.signedByOwnerName + ')' : '⏳ Pendiente de firma'}
                    </span>
                    <button
                      type="button"
                      onClick={() => openPrintModal({ documentType: doc.type, title: doc.title, patientName: patient.name, ownerName: owner?.firstName + ' ' + owner?.lastName, date: doc.createdAt })}
                      className="text-teal-700 font-bold hover:underline text-[11px]"
                    >
                      Ver / Imprimir →
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 18. SECCIÓN: ACTIVIDAD / SERVICIO (K9 / ÉQUIDOS MILITARES & TRABAJO) */}
      {isWorkingAnimal && (
        <div id="sec-servicio" className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Award className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-black text-slate-900">
              Sanidad de Tropa, Animales de Servicio & Trabajo Operativo
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Función / Especialidad:</span>
              <strong className="text-slate-900 text-sm">
                {patient.species === 'EQUINO' ? 'Caballería / Patrulla Montada' : 'K9 Detección & Seguridad'}
              </strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Identificación Oficial / Fuego:</span>
              <strong className="text-slate-900 font-mono text-sm">
                {patient.equinePassport || patient.microchip || patient.tattooNumber || patient.clinicalRecordNumber}
              </strong>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Aptitud Operativa:</span>
              <strong className="text-emerald-700 font-bold">
                ✓ APTO PARA EL SERVICIO
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* 19. MODAL RESUMEN EJECUTIVO CORTO */}
      {showSummaryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">Resumen Clínico Ejecutivo</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs text-slate-800 font-sans">
              <p><strong>Paciente:</strong> {patient.name} ({patient.clinicalRecordNumber}) • {patient.species} {patient.breed}</p>
              <p><strong>Tutor:</strong> {owner ? owner.firstName + ' ' + owner.lastName + ' (' + owner.phone + ')' : 'Sin tutor'}</p>
              <p><strong>Peso Actual:</strong> {formatWeight(patient.weight)}</p>
              <p><strong>Diagnósticos Activos:</strong> {activeProblems.map((p) => p.title).join(', ') || 'Sin patologías activas'}</p>
              <p><strong>Última Consulta:</strong> {patientConsultations[0] ? formatDate(patientConsultations[0].dateTime) + ' - ' + patientConsultations[0].reason : 'N/A'}</p>
              <p><strong>Últimos Signos Vitales:</strong> {latestVital ? 'T: ' + latestVital.temperature + '°C, FC: ' + latestVital.heartRate + ' lpm, FR: ' + latestVital.respiratoryRate + ' rpm' : 'No registrados'}</p>
              <p><strong>Vacunas:</strong> {patientVaccinations.length} registradas</p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `RESUMEN CLÍNICO - ${patient.name} (${patient.clinicalRecordNumber})\n` +
                    `Especie/Raza: ${patient.species} ${patient.breed} | Peso: ${formatWeight(patient.weight)}\n` +
                    `Tutor: ${owner?.firstName} ${owner?.lastName} (${owner?.phone})\n` +
                    `Diagnósticos: ${activeProblems.map(p => p.title).join(', ') || 'Evaluación normal'}\n` +
                    `Última Consulta: ${patientConsultations[0]?.reason || 'Control'}`
                  );
                  showToast('success', 'Copiado al Portapapeles', 'El resumen fue copiado exitosamente.');
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Texto</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md"
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
