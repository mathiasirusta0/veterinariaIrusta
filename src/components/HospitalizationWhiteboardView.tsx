import React, { useState, useMemo } from 'react';
import {
  BedDouble,
  Activity,
  FileText,
  FlaskConical,
  Scan,
  Pill,
  Scissors,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Plus,
  ArrowRight,
  ShieldCheck,
  Printer,
  Sparkles,
  Phone,
  MessageCircle,
  TrendingUp,
  X,
  Check,
  Layers,
  ChevronRight,
  Droplet,
  Heart,
  Scale,
  Calendar,
  DollarSign,
  AlertCircle,
  Eye,
  FileCheck2,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import {
  ClinicalEncounter,
  Hospitalization,
  Patient,
  Owner,
  LabTestType,
  ImageModality,
  PaymentMethod,
  InvoiceType,
  LabResultItem,
  VitalSigns,
} from '../types';
import { formatDate, formatDateTime, formatTime, formatWeight } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { EmptyState, PageHeader } from './ui';

export const HospitalizationWhiteboardView: React.FC = () => {
  const {
    patients,
    owners,
    hospitalizations,
    encounters,
    activeEncounterId,
    setActiveEncounterId,
    procedures,
    encounterConsumptions,
    servicePrices,
    labOrders,
    imagingStudies,
    clinicalEvolutions,
    vitals,
    currentUser,
    startEncounter,
    closeEncounter,
    addProcedure,
    performProcedure,
    addEncounterLabOrder,
    performLabOrder,
    addEncounterImagingStudy,
    performImagingStudy,
    administerMedication,
    addHospitalMedication,
    getEncounterPreInvoice,
    billEncounter,
    addClinicalEvolution,
    addVitalSigns,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    openPrintModal,
    openCalculators,
    openMonitor,
    openWhatsAppHub,
    showToast,
  } = useVet();

  // Selected encounter for detail operative view (default to activeEncounterId or first active)
  const [selectedEncId, setSelectedEncId] = useState<string | null>(activeEncounterId || null);
  const [activeTab, setActiveTab] = useState<
    'RESUMEN' | 'SIGNOS' | 'EVOLUCION' | 'LABORATORIO' | 'IMAGENES' | 'MEDICACION' | 'PROCEDIMIENTOS' | 'CONSUMOS' | 'ALTA'
  >('RESUMEN');

  // Filter for dashboard
  const [typeFilter, setTypeFilter] = useState<'TODOS' | 'AMBULATORIA' | 'INTERNACION'>('TODOS');
  const [statusFilter, setStatusFilter] = useState<'EN_CURSO' | 'ALTA_MEDICA' | 'TODOS'>('EN_CURSO');

  // Modal / Form states
  const [showNewEncounterModal, setShowNewEncounterModal] = useState(false);
  const [newEncPatientId, setNewEncPatientId] = useState('');
  const [newEncType, setNewEncType] = useState<'AMBULATORIA' | 'INTERNACION'>('AMBULATORIA');
  const [newEncReason, setNewEncReason] = useState('');
  const [newEncDiag, setNewEncDiag] = useState('');
  const [newEncSector, setNewEncSector] = useState('Caniles Generales');
  const [newEncPriority, setNewEncPriority] = useState<'ESTABLE' | 'PRIORITARIO' | 'URGENTE' | 'CRITICO'>('PRIORITARIO');

  // Vitals form
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [vitTemp, setVitTemp] = useState<number>(38.5);
  const [vitFC, setVitFC] = useState<number>(110);
  const [vitFR, setVitFR] = useState<number>(24);
  const [vitPAS, setVitPAS] = useState<number>(120);
  const [vitPAD, setVitPAD] = useState<number>(80);
  const [vitSpo2, setVitSpo2] = useState<number>(98);
  const [vitGlucose, setVitGlucose] = useState<number>(105);
  const [vitWeight, setVitWeight] = useState<number>(15);
  const [vitPain, setVitPain] = useState<number>(0);
  const [vitNotes, setVitNotes] = useState('');

  // Evolution form
  const [showEvolutionModal, setShowEvolutionModal] = useState(false);
  const [evoGeneralState, setEvoGeneralState] = useState('Alerta, responsivo a estímulos');
  const [evoFindings, setEvoFindings] = useState('');
  const [evoTreatmentResponse, setEvoTreatmentResponse] = useState('Buena respuesta al tratamiento instaurado');
  const [evoPlan, setEvoPlan] = useState('');

  // Lab modal
  const [showLabModal, setShowLabModal] = useState(false);
  const [labType, setLabType] = useState<LabTestType>('HEMOGRAMA_COMPLETO');
  const [labNotes, setLabNotes] = useState('');
  const [selectedLabForPerform, setSelectedLabForPerform] = useState<string | null>(null);
  const [labResultReport, setLabResultReport] = useState('');
  const [labResultConclusion, setLabResultConclusion] = useState('');
  const [labHcto, setLabHcto] = useState('42');
  const [labWbc, setLabWbc] = useState('9500');
  const [labUrea, setLabUrea] = useState('38');
  const [labCreat, setLabCreat] = useState('1.1');

  // Imaging modal
  const [showImgModal, setShowImgModal] = useState(false);
  const [imgModality, setImgModality] = useState<ImageModality>('RADIOGRAFIA');
  const [imgRegion, setImgRegion] = useState('Abdomen Lateral / VD');
  const [selectedImgForPerform, setSelectedImgForPerform] = useState<string | null>(null);
  const [imgReport, setImgReport] = useState('');
  const [imgConclusion, setImgConclusion] = useState('');

  // Medication form
  const [showMedModal, setShowMedModal] = useState(false);
  const [medName, setMedName] = useState('');
  const [medDose, setMedDose] = useState('');
  const [medRoute, setMedRoute] = useState('IV');
  const [medFreq, setMedFreq] = useState('Cada 12 horas');

  // Procedure form
  const [showProcModal, setShowProcModal] = useState(false);
  const [procName, setProcName] = useState('Colocación de Vía Endovenosa');
  const [procPrice, setProcPrice] = useState<number>(7500);

  // Billing Modal
  const [showBillModal, setShowBillModal] = useState(false);
  const [billPayMethod, setBillPayMethod] = useState<PaymentMethod>('EFECTIVO');
  const [billInvType, setBillInvType] = useState<InvoiceType>('FACTURA_B');
  const [billDiscount, setBillDiscount] = useState<number>(0);

  // Discharge modal
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [dischFinalDiag, setDischFinalDiag] = useState('');
  const [dischNotes, setDischNotes] = useState('');
  const [dischMeds, setDischMeds] = useState('');
  const [dischNextDate, setDischNextDate] = useState('');

  // List of active encounters and hospitalizations
  const activeEncountersList = useMemo(() => {
    return encounters.filter((e) => {
      const matchType = typeFilter === 'TODOS' || e.type === typeFilter;
      const matchStatus = statusFilter === 'TODOS' || e.status === statusFilter;
      return matchType && matchStatus;
    });
  }, [encounters, typeFilter, statusFilter]);

  // Selected encounter data
  const currentEncounter = useMemo(() => {
    if (!selectedEncId) return null;
    return encounters.find((e) => e.id === selectedEncId) || null;
  }, [encounters, selectedEncId]);

  const currentPatient = useMemo(() => {
    if (!currentEncounter) return null;
    return patients.find((p) => p.id === currentEncounter.patientId) || null;
  }, [patients, currentEncounter]);

  const currentOwner = useMemo(() => {
    if (!currentPatient) return null;
    return owners.find((o) => o.id === currentPatient.ownerId) || null;
  }, [owners, currentPatient]);

  const currentHosp = useMemo(() => {
    if (!currentPatient) return null;
    return hospitalizations.find((h) => h.patientId === currentPatient.id && h.status === 'ACTIVA') || null;
  }, [hospitalizations, currentPatient]);

  // Encounter related collections
  const encounterVitals = useMemo(() => {
    if (!currentPatient) return [];
    return vitals.filter((v) => v.patientId === currentPatient.id);
  }, [vitals, currentPatient]);

  const encounterEvolutions = useMemo(() => {
    if (!currentPatient) return [];
    return clinicalEvolutions.filter((e) => e.patientId === currentPatient.id);
  }, [clinicalEvolutions, currentPatient]);

  const encounterLabs = useMemo(() => {
    if (!currentPatient) return [];
    return labOrders.filter((l) => l.patientId === currentPatient.id);
  }, [labOrders, currentPatient]);

  const encounterImgs = useMemo(() => {
    if (!currentPatient) return [];
    return imagingStudies.filter((img) => img.patientId === currentPatient.id);
  }, [imagingStudies, currentPatient]);

  const encounterProceduresList = useMemo(() => {
    if (!currentEncounter) return [];
    return procedures.filter((p) => p.patientId === currentEncounter.patientId || p.encounterId === currentEncounter.id);
  }, [procedures, currentEncounter]);

  const preInvoiceData = useMemo(() => {
    if (!currentEncounter) return { items: [], totalAmount: 0 };
    return getEncounterPreInvoice(currentEncounter.id);
  }, [encounterConsumptions, currentEncounter, getEncounterPreInvoice]);

  // Handlers
  const handleOpenEncounter = (encId: string) => {
    triggerHaptic('light');
    setSelectedEncId(encId);
    setActiveEncounterId(encId);
    const enc = encounters.find((e) => e.id === encId);
    if (enc) setSelectedPatientId(enc.patientId);
  };

  const handleStartNewEncounterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEncPatientId) {
      showToast('warning', 'Seleccione un Paciente', 'Debe seleccionar un paciente para iniciar la atención.');
      return;
    }
    const created = startEncounter({
      patientId: newEncPatientId,
      type: newEncType,
      vetInChargeId: currentUser.id,
      vetInChargeName: currentUser.name,
      reason: newEncReason || 'Atención médica',
      initialDiagnosis: newEncDiag || 'En evaluación clínica',
      sector: newEncType === 'INTERNACION' ? newEncSector : undefined,
      priority: newEncPriority,
    });
    setSelectedEncId(created.id);
    setShowNewEncounterModal(false);
  };

  const handleAddVitalsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;
    addVitalSigns({
      patientId: currentPatient.id,
      temperature: vitTemp,
      heartRate: vitFC,
      respiratoryRate: vitFR,
      systolicBP: vitPAS,
      diastolicBP: vitPAD,
      spo2: vitSpo2,
      bloodGlucose: vitGlucose,
      weight: vitWeight,
      painScale: vitPain,
      notes: vitNotes,
    });
    setShowVitalsModal(false);
    showToast('success', 'Signos Vitales Registrados', 'Control guardado exitosamente.');
  };

  const handleAddEvolutionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;
    addClinicalEvolution({
      patientId: currentPatient.id,
      authorName: currentUser.name,
      authorRole: currentUser.role as any,
      authorLicense: currentUser.licenseNumber,
      dateTime: new Date().toISOString(),
      type: 'MEDICA',
      objectiveSummary: evoGeneralState,
      assessment: evoFindings,
      plan: evoPlan,
      nursingNotes: evoTreatmentResponse,
    });
    setShowEvolutionModal(false);
    showToast('success', 'Evolución Clínica Guardada', 'La nota médica fue firmada e incorporada al historial.');
  };

  const handleRequestLabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;
    addEncounterLabOrder({
      patientId: currentPatient.id,
      testType: labType,
      requestedBy: currentUser.name,
      diagnosticReport: labNotes,
      conclusions: '',
    });
    setShowLabModal(false);
  };

  const handlePerformLabSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLabForPerform) return;
    const items: LabResultItem[] = [
      { parameter: 'Hematocrito', value: labHcto, unit: '%', referenceRange: '37 - 55', isAbnormal: Number(labHcto) < 37 },
      { parameter: 'Leucocitos Totales', value: labWbc, unit: '/uL', referenceRange: '6000 - 17000', isAbnormal: false },
      { parameter: 'Urea Sérica', value: labUrea, unit: 'mg/dL', referenceRange: '20 - 50', isAbnormal: false },
      { parameter: 'Creatinina', value: labCreat, unit: 'mg/dL', referenceRange: '0.5 - 1.5', isAbnormal: false },
    ];
    performLabOrder(selectedLabForPerform, items, labResultReport || 'Parámetros bioquímicos evaluados sin alteraciones severas.', labResultConclusion || 'Perfil dentro de rangos esperados.');
    setSelectedLabForPerform(null);
  };

  const handleRequestImgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;
    addEncounterImagingStudy({
      patientId: currentPatient.id,
      modality: imgModality,
      region: imgRegion,
      requestedBy: currentUser.name,
      performedBy: currentUser.name,
      report: '',
      conclusion: '',
      images: [],
    });
    setShowImgModal(false);
  };

  const handlePerformImgSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImgForPerform) return;
    performImagingStudy(
      selectedImgForPerform,
      imgReport || 'Estudio completado. Estructuras anatómicas visualizadas sin lesiones expansivas ni cuerpos extraños radiopacos.',
      imgConclusion || 'Estudio sin hallazgos patológicos agudos.'
    );
    setSelectedImgForPerform(null);
  };

  const handleAddMedicationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;
    if (currentHosp) {
      addHospitalMedication(currentHosp.id, {
        patientId: currentPatient.id,
        drugName: medName,
        dose: medDose,
        route: medRoute,
        frequency: medFreq,
        scheduledTime: new Date().toISOString().slice(11, 16),
        notes: 'Indicación en atención',
      });
    } else {
      // Ambulatory medication indication
      showToast('success', 'Medicación Indicada', medName + ' (' + medDose + ') indicada.');
    }
    setShowMedModal(false);
  };

  const handleAddProcedureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEncounter) return;
    addProcedure({
      encounterId: currentEncounter.id,
      patientId: currentEncounter.patientId,
      procedureName: procName,
      category: 'ENFERMERIA',
      price: procPrice,
      isBillable: true,
    });
    setShowProcModal(false);
  };

  const handleBillEncounterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEncounter) return;
    billEncounter(currentEncounter.id, billPayMethod, billInvType, billDiscount);
    setShowBillModal(false);
  };

  const handleDischargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEncounter) return;
    closeEncounter(currentEncounter.id, {
      finalDiagnosis: dischFinalDiag || currentEncounter.initialDiagnosis,
      dischargeNotes: dischNotes || 'Paciente en condiciones de egreso con tratamiento domiciliario.',
      dischargeMedications: dischMeds,
      nextFollowUpDate: dischNextDate,
    });
    setShowDischargeModal(false);
  };

  return (
    <div className="space-y-6 pb-16 w-full max-w-full">
      {/* 1. Header principal */}
      <PageHeader
        category="Centro Clínico de Atención & Internación"
        title="Internación & Atención Operativa"
        description="Gestión integral en una sola pantalla: Signos, Evolución, Laboratorio, Imágenes, Medicación, Procedimientos y Facturación"
        icon={BedDouble}
        actions={[
          {
            label: '+ Iniciar Atención / Internar',
            icon: Plus,
            onClick: () => setShowNewEncounterModal(true),
            variant: 'primary',
          },
        ]}
      />

      {/* 2. Selector de Paciente en Atención / Dashboard */}
      {!selectedEncId ? (
        <div className="space-y-5">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Filtrar por tipo:</span>
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                {(['TODOS', 'AMBULATORIA', 'INTERNACION'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      typeFilter === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {t === 'TODOS' ? 'Todos' : t === 'AMBULATORIA' ? 'Ambulatorios' : 'Internados'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Estado:</span>
              <div className="flex bg-slate-100 p-1 rounded-2xl">
                {(['EN_CURSO', 'ALTA_MEDICA', 'TODOS'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      statusFilter === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    {st === 'EN_CURSO' ? 'En Curso' : st === 'ALTA_MEDICA' ? 'Altas' : 'Histórico'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Encounters Grid */}
          {activeEncountersList.length === 0 ? (
            <EmptyState
              icon={BedDouble}
              title="No hay pacientes en atención activa"
              description="Hacé clic en '+ Iniciar Atención / Internar' para abrir un episodio clínico ambulatorio o ingresar a internación."
              actionLabel="+ Iniciar Atención"
              onAction={() => setShowNewEncounterModal(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeEncountersList.map((enc) => {
                const pat = patients.find((p) => p.id === enc.patientId);
                const isInterned = enc.type === 'INTERNACION';
                const encConsumptions = encounterConsumptions.filter((c) => c.encounterId === enc.id && c.status !== 'ANULADO');
                const totalCost = encConsumptions.reduce((s, c) => s + c.subtotal, 0);

                return (
                  <div
                    key={enc.id}
                    onClick={() => handleOpenEncounter(enc.id)}
                    className="bg-white border border-slate-200 hover:border-teal-500 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-xl font-bold">
                            {pat?.species === 'FELINO' ? '🐈' : pat?.species === 'EQUINO' ? '🐎' : '🐕'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                                {pat?.name || 'Paciente'}
                              </h3>
                              <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200">
                                {pat?.clinicalRecordNumber || 'HC-0000'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {pat?.species} • {pat?.breed}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${
                            isInterned
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-teal-50 text-teal-800 border-teal-200'
                          }`}
                        >
                          {isInterned ? `Internado (${enc.sector || 'Canil'})` : 'Ambulatorio'}
                        </span>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1 text-xs">
                        <p className="text-slate-700">
                          <strong className="text-slate-900">Motivo:</strong> {enc.reason}
                        </p>
                        <p className="text-slate-600">
                          <strong className="text-slate-900">Diagnóstico:</strong> {enc.initialDiagnosis}
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          <strong>Ingreso:</strong> {formatDateTime(enc.admittedAt)} • {enc.vetInChargeName}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-xs font-mono font-bold text-slate-700">
                        Cuenta: <span className="text-teal-800 font-black">${totalCost.toLocaleString('es-AR')}</span>
                      </div>

                      <button
                        type="button"
                        className="px-4 py-2 bg-teal-600 group-hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
                      >
                        <span>Abrir Atención</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* 3. PANTALLA OPERATIVA DEL PACIENTE SELECCIONADO */
        <div className="space-y-6 animate-fade-in">
          {/* Top Patient Care Banner */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-3xl font-bold flex-shrink-0 shadow-2xs">
                {currentPatient?.species === 'FELINO' ? '🐈' : currentPatient?.species === 'EQUINO' ? '🐎' : '🐕'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-2xl font-black text-slate-900">{currentPatient?.name}</h2>
                  <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                    {currentPatient?.clinicalRecordNumber}
                  </span>
                  <span
                    className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full border ${
                      currentEncounter?.type === 'INTERNACION'
                        ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                        : 'bg-teal-50 text-teal-800 border-teal-200'
                    }`}
                  >
                    {currentEncounter?.type === 'INTERNACION' ? `Internado: ${currentEncounter.sector || 'Canil'}` : 'Atención Ambulatoria'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  {currentPatient?.species} • {currentPatient?.breed} • {currentPatient?.sex} • {currentPatient?.calculatedAge} • Peso:{' '}
                  <strong className="text-slate-900 font-mono">{formatWeight(currentPatient?.weight || 0)}</strong>
                </p>
                <p className="text-xs text-slate-500">
                  <strong>Tutor / Responsable:</strong> {currentOwner ? `${currentOwner.firstName} ${currentOwner.lastName} (${currentOwner.phone})` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSelectedPatientId(currentPatient?.id || null);
                  setActiveView('PACIENTES');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4 text-teal-600" />
                <span>Ver Ficha 360°</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedEncId(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <X className="w-4 h-4" />
                <span>Volver a Lista</span>
              </button>
              <button
                type="button"
                onClick={() => setShowDischargeModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Alta / Cierre</span>
              </button>
            </div>
          </div>

          {/* Quick Floating Action Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setShowVitalsModal(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
            >
              <Activity className="w-3.5 h-3.5 text-teal-600" />
              <span>+ Signos</span>
            </button>
            <button
              onClick={() => setShowEvolutionModal(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>+ Evolución</span>
            </button>
            <button
              onClick={() => setShowLabModal(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
            >
              <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
              <span>+ Laboratorio</span>
            </button>
            <button
              onClick={() => setShowImgModal(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
            >
              <Scan className="w-3.5 h-3.5 text-teal-600" />
              <span>+ Imagen</span>
            </button>
            <button
              onClick={() => setShowMedModal(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
            >
              <Pill className="w-3.5 h-3.5 text-teal-600" />
              <span>+ Medicación</span>
            </button>
            <button
              onClick={() => setShowProcModal(true)}
              className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 flex items-center gap-1.5 whitespace-nowrap shadow-2xs"
            >
              <Scissors className="w-3.5 h-3.5 text-teal-600" />
              <span>+ Procedimiento</span>
            </button>
          </div>

          {/* 9 Tabs Navigation Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
            {[
              { id: 'RESUMEN', label: 'Resumen', icon: Layers },
              { id: 'SIGNOS', label: `Signos (${encounterVitals.length})`, icon: Activity },
              { id: 'EVOLUCION', label: `Evolución (${encounterEvolutions.length})`, icon: FileText },
              { id: 'LABORATORIO', label: `Laboratorio (${encounterLabs.length})`, icon: FlaskConical },
              { id: 'IMAGENES', label: `Imágenes (${encounterImgs.length})`, icon: Scan },
              { id: 'MEDICACION', label: 'Medicación', icon: Pill },
              { id: 'PROCEDIMIENTOS', label: `Procedimientos (${encounterProceduresList.length})`, icon: Scissors },
              { id: 'CONSUMOS', label: `Cuenta ($${preInvoiceData.totalAmount.toLocaleString('es-AR')})`, icon: Receipt },
              { id: 'ALTA', label: 'Alta Médica', icon: FileCheck2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: RESUMEN */}
          {activeTab === 'RESUMEN' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-5">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <span>Motivo de Ingreso & Diagnóstico Inicial</span>
                  </h3>
                  <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {currentEncounter?.reason}
                  </p>
                  <div className="p-3 bg-teal-50/60 border border-teal-200 rounded-2xl text-xs text-teal-900">
                    <strong>Diagnóstico Presuntivo:</strong> {currentEncounter?.initialDiagnosis}
                  </div>
                </div>

                {/* Últimos Signos Registrados */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-teal-600" />
                      <span>Último Control de Constantes Vitales</span>
                    </h3>
                    <button
                      onClick={() => setShowVitalsModal(true)}
                      className="text-xs font-bold text-teal-700 hover:underline"
                    >
                      + Nuevo Control
                    </button>
                  </div>
                  {encounterVitals.length === 0 ? (
                    <p className="text-xs text-slate-400 p-4 text-center">No hay signos vitales registrados aún.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Temperatura</span>
                        <strong className="text-lg font-black text-slate-900 font-mono">{encounterVitals[0].temperature}°C</strong>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Frec. Cardíaca</span>
                        <strong className="text-lg font-black text-slate-900 font-mono">{encounterVitals[0].heartRate} lpm</strong>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Frec. Resp.</span>
                        <strong className="text-lg font-black text-slate-900 font-mono">{encounterVitals[0].respiratoryRate} rpm</strong>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-bold">Presión Arterial</span>
                        <strong className="text-lg font-black text-slate-900 font-mono">
                          {encounterVitals[0].systolicBP || 120}/{encounterVitals[0].diastolicBP || 80}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar Resumen Cuenta en Vivo */}
              <div className="space-y-5">
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-teal-600" />
                    <span>Consumos & Prefacturación</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    {preInvoiceData.items.map((it) => (
                      <div key={it.id} className="flex items-center justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-700 font-medium truncate max-w-[180px]">{it.concept}</span>
                        <span className="font-mono font-bold text-slate-900">${it.subtotal.toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-sm">
                    <span className="font-black text-slate-900">Total Acumulado:</span>
                    <strong className="text-lg font-mono font-black text-teal-700">
                      ${preInvoiceData.totalAmount.toLocaleString('es-AR')}
                    </strong>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowBillModal(true)}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Revisar & Facturar Cuenta</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIGNOS VITALES */}
          {activeTab === 'SIGNOS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Controles Sucesivos de Signos Vitales</h3>
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Registrar Control</span>
                </button>
              </div>

              {encounterVitals.length === 0 ? (
                <EmptyState
                  icon={Activity}
                  title="No hay controles de signos registrados"
                  description="Registrá el primer control de temperatura, FC, FR, presión y glucemia."
                  actionLabel="+ Registrar Signos"
                  onAction={() => setShowVitalsModal(true)}
                />
              ) : (
                <div className="space-y-3">
                  {encounterVitals.map((v, idx) => (
                    <div key={v.id || idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 font-bold flex items-center justify-center font-mono">
                          #{encounterVitals.length - idx}
                        </span>
                        <div>
                          <strong className="text-slate-900 font-bold">{formatDateTime(v.recordedAt)}</strong>
                          <p className="text-slate-500 text-[11px]">{v.recordedBy || currentUser.name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center font-mono">
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase">T°</span>
                          <strong className="text-slate-900">{v.temperature}°C</strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase">FC</span>
                          <strong className="text-slate-900">{v.heartRate} lpm</strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase">FR</span>
                          <strong className="text-slate-900">{v.respiratoryRate} rpm</strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase">PA</span>
                          <strong className="text-slate-900">{v.systolicBP || 120}/{v.diastolicBP || 80}</strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase">SpO2</span>
                          <strong className="text-slate-900">{v.spo2 || 98}%</strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase">Glucemia</span>
                          <strong className="text-slate-900">{v.bloodGlucose || 100} mg/dL</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EVOLUCION */}
          {activeTab === 'EVOLUCION' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900">Evoluciones Médicas & Registro Cronológico</h3>
                <button
                  type="button"
                  onClick={() => setShowEvolutionModal(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Nueva Evolución</span>
                </button>
              </div>

              {encounterEvolutions.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No hay evoluciones clínicas registradas"
                  description="Cargá notas de evolución, respuesta al tratamiento y plan médico para el paciente."
                  actionLabel="+ Cargar Evolución"
                  onAction={() => setShowEvolutionModal(true)}
                />
              ) : (
                <div className="space-y-3">
                  {encounterEvolutions.map((evo) => (
                    <div key={evo.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs font-black text-slate-900">{evo.authorName}</strong>
                          <span className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full font-bold border border-teal-200">
                            {evo.authorRole}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">{formatDateTime(evo.dateTime)}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Estado General:</span>
                          <p className="text-slate-800">{evo.objectiveSummary || 'Sin observaciones'}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Hallazgos / Cambios:</span>
                          <p className="text-slate-800">{evo.assessment || 'Sin cambios agudos'}</p>
                        </div>
                      </div>

                      {evo.plan && (
                        <div className="p-3 bg-teal-50/50 border border-teal-200/80 rounded-2xl text-xs text-teal-950">
                          <strong>Plan & Pendientes:</strong> {evo.plan}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: LABORATORIO */}
          {activeTab === 'LABORATORIO' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Estudios de Laboratorio</h3>
                  <p className="text-xs text-slate-500">
                    Solo los estudios con resultados confirmados (<strong className="text-slate-900">☑ Realizado</strong>) se cobran en la cuenta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLabModal(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Solicitar Laboratorio</span>
                </button>
              </div>

              {encounterLabs.length === 0 ? (
                <EmptyState
                  icon={FlaskConical}
                  title="No hay estudios de laboratorio cargados"
                  description="Solicitá hemogramas, bioquímicas, uranálisis o cultivos para este paciente."
                  actionLabel="+ Solicitar Estudio"
                  onAction={() => setShowLabModal(true)}
                />
              ) : (
                <div className="space-y-3">
                  {encounterLabs.map((lab) => {
                    const isDone = lab.status === 'FINALIZADO';
                    return (
                      <div key={lab.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">🧪</span>
                            <div>
                              <strong className="text-sm font-black text-slate-900">
                                {lab.testType.replace(/_/g, ' ')}
                              </strong>
                              <p className="text-xs text-slate-500">
                                {lab.orderNumber} • Solicitado por: {lab.requestedBy} ({formatDateTime(lab.requestedAt)})
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${
                              isDone ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {isDone ? '☑ Realizado & Facturable' : '⏳ Solicitado (No facturado)'}
                          </span>
                        </div>

                        {isDone ? (
                          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                              {lab.results.map((r, idx) => (
                                <div key={idx} className="bg-white p-2 rounded-xl border border-slate-200 text-center">
                                  <span className="text-[10px] text-slate-400 block font-sans">{r.parameter}</span>
                                  <strong className="text-slate-900">{r.value} {r.unit}</strong>
                                </div>
                              ))}
                            </div>
                            <p className="text-slate-700"><strong>Informe:</strong> {lab.diagnosticReport}</p>
                          </div>
                        ) : (
                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedLabForPerform(lab.id)}
                              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>☑ Cargar Resultados & Marcar Realizado</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: IMAGENES */}
          {activeTab === 'IMAGENES' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Diagnóstico por Imágenes</h3>
                  <p className="text-xs text-slate-500">
                    Radiografías, ecografías y tomografías. Solo los estudios realizados generan cargo en cuenta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowImgModal(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Solicitar Imagen</span>
                </button>
              </div>

              {encounterImgs.length === 0 ? (
                <EmptyState
                  icon={Scan}
                  title="No hay estudios de imagen registrados"
                  description="Solicitá radiografías, ecografías o resonancias para este episodio."
                  actionLabel="+ Solicitar Imagen"
                  onAction={() => setShowImgModal(true)}
                />
              ) : (
                <div className="space-y-3">
                  {encounterImgs.map((img) => {
                    const isDone = img.status === 'INFORMADO';
                    return (
                      <div key={img.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg">📷</span>
                            <div>
                              <strong className="text-sm font-black text-slate-900">
                                {img.modality} — {img.region}
                              </strong>
                              <p className="text-xs text-slate-500">
                                {img.studyNumber} • {img.date} • Solicitado por: {img.requestedBy}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${
                              isDone ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {isDone ? '☑ Estudio Realizado' : '⏳ Pendiente de Realización'}
                          </span>
                        </div>

                        {isDone ? (
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-1">
                            <p className="text-slate-800"><strong>Hallazgos / Informe:</strong> {img.report}</p>
                            <p className="text-slate-600"><strong>Conclusión:</strong> {img.conclusion}</p>
                          </div>
                        ) : (
                          <div className="pt-2 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedImgForPerform(img.id)}
                              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>☑ Cargar Informe & Marcar Realizado</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: MEDICACION INDICADA VS APLICADA */}
          {activeTab === 'MEDICACION' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Plan de Medicación & Aplicación</h3>
                  <p className="text-xs text-slate-500">
                    La indicación médica no factura por sí sola. Al marcar <strong className="text-slate-900">☑ Aplicada</strong> se descuenta stock y se genera el cargo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMedModal(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Indicar Fármaco</span>
                </button>
              </div>

              {(!currentHosp?.medications || currentHosp.medications.length === 0) ? (
                <EmptyState
                  icon={Pill}
                  title="No hay medicamentos indicados para este paciente"
                  description="Indicá antibióticos, analgésicos o protectores para el tratamiento."
                  actionLabel="+ Indicar Medicamento"
                  onAction={() => setShowMedModal(true)}
                />
              ) : (
                <div className="space-y-3">
                  {currentHosp.medications.map((med) => {
                    const isApplied = med.status === 'REALIZADA';
                    return (
                      <div
                        key={med.id}
                        className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
                          isApplied ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <strong className="text-sm font-black text-slate-900">{med.drugName}</strong>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                              {med.dose} • Vía {med.route}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Frecuencia: {med.frequency} • Horario programado: <span className="font-mono font-bold text-slate-800">{med.scheduledTime}</span>
                          </p>
                          {isApplied && (
                            <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aplicada por {med.administeredBy} a las {formatTime(med.administeredAt || '')}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          {isApplied ? (
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                              <Check className="w-4 h-4" />
                              <span>☑ Dosis Aplicada</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                if (currentHosp) {
                                  administerMedication(currentHosp.id, med.id);
                                }
                              }}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>☑ Aplicar Dosis Ahora</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PROCEDIMIENTOS */}
          {activeTab === 'PROCEDIMIENTOS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Procedimientos Clínicos</h3>
                  <p className="text-xs text-slate-500">Catéteres, curaciones, vendajes, sondajes y oxigenoterapia.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProcModal(true)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Indicar Procedimiento</span>
                </button>
              </div>

              {encounterProceduresList.length === 0 ? (
                <EmptyState
                  icon={Scissors}
                  title="No hay procedimientos indicados"
                  description="Registrá catéteres, sondajes o curaciones realizadas."
                  actionLabel="+ Indicar Procedimiento"
                  onAction={() => setShowProcModal(true)}
                />
              ) : (
                <div className="space-y-3">
                  {encounterProceduresList.map((proc) => (
                    <div
                      key={proc.id}
                      className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        proc.isPerformed ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'
                      }`}
                    >
                      <div>
                        <strong className="text-sm font-black text-slate-900 block">{proc.procedureName}</strong>
                        <span className="text-xs text-slate-500 font-mono">
                          Precio: ${proc.price.toLocaleString('es-AR')} • {proc.category}
                        </span>
                        {proc.isPerformed && (
                          <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                            Realizado por {proc.performedBy} el {formatDateTime(proc.performedAt || '')}
                          </p>
                        )}
                      </div>

                      <div>
                        {proc.isPerformed ? (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
                            <Check className="w-4 h-4" />
                            <span>☑ Realizado</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => performProcedure(proc.id)}
                            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>☑ Marcar Realizado</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: CONSUMOS & PREFACTURACIÓN */}
          {activeTab === 'CONSUMOS' && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-teal-600" />
                      <span>Detalle Real de Consumos del Paciente</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Solo lo efectivamente realizado/aplicado entra a la prefacturación. Podés revisar antes de emitir la factura final.
                    </p>
                  </div>
                  <strong className="text-xl font-mono font-black text-teal-700">
                    ${preInvoiceData.totalAmount.toLocaleString('es-AR')}
                  </strong>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Concepto Realizado</th>
                        <th className="p-3">Tipo</th>
                        <th className="p-3 text-center">Cant.</th>
                        <th className="p-3 text-right">Precio Unit.</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {preInvoiceData.items.map((it) => (
                        <tr key={it.id} className="hover:bg-slate-50">
                          <td className="p-3 font-sans font-bold text-slate-900">{it.concept}</td>
                          <td className="p-3">
                            <span className="text-[10px] font-sans bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">
                              {it.sourceType}
                            </span>
                          </td>
                          <td className="p-3 text-center">{it.quantity}</td>
                          <td className="p-3 text-right">${it.unitPrice.toLocaleString('es-AR')}</td>
                          <td className="p-3 text-right font-black text-teal-800">${it.subtotal.toLocaleString('es-AR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    Cliente a facturar: <strong className="text-slate-900">{currentOwner ? `${currentOwner.firstName} ${currentOwner.lastName} (${currentOwner.dni})` : 'Consumidor Final'}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBillModal(true)}
                    className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-2xl text-xs shadow-md transition-all flex items-center gap-2"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Emitir Comprobante / Facturar</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: ALTA MEDICA */}
          {activeTab === 'ALTA' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-emerald-600" />
                <span>Resumen de Cierre de Atención / Alta Médica</span>
              </h3>
              <p className="text-xs text-slate-600">
                Al confirmar el alta médica, se emitirá el resumen final y el paciente quedará en estado ACTIVO disponible para su control en Ficha 360°.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Diagnóstico Final:</span>
                  <input
                    type="text"
                    value={dischFinalDiag}
                    onChange={(e) => setDischFinalDiag(e.target.value)}
                    placeholder="ej: Gastroenteritis aguda resuelta, alta médica"
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  />
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Próximo Control:</span>
                  <input
                    type="date"
                    value={dischNextDate}
                    onChange={(e) => setDischNextDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Medicación Domiciliaria & Indicaciones:</span>
                <textarea
                  rows={3}
                  value={dischMeds}
                  onChange={(e) => setDischMeds(e.target.value)}
                  placeholder="ej: Probióticos 1 sobre diario x 5 días. Dieta blanda. Reconsultar ante vómitos."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={handleDischargeSubmit}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl text-xs shadow-md transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirmar Alta Médica</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Modal Nuevo Episodio / Atención */}
      {showNewEncounterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleStartNewEncounterSubmit} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-teal-600" />
                <span>+ Iniciar Atención / Internar Paciente</span>
              </h3>
              <button type="button" onClick={() => setShowNewEncounterModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Seleccionar Paciente:</label>
                <select
                  value={newEncPatientId}
                  onChange={(e) => setNewEncPatientId(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                >
                  <option value="">-- Seleccionar Paciente --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} - {p.breed}) [{p.clinicalRecordNumber}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Modalidad:</label>
                  <select
                    value={newEncType}
                    onChange={(e) => setNewEncType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="AMBULATORIA">Atención Ambulatoria (Día)</option>
                    <option value="INTERNACION">Internación (Canil / UCI)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Prioridad:</label>
                  <select
                    value={newEncPriority}
                    onChange={(e) => setNewEncPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="ESTABLE">Estable</option>
                    <option value="PRIORITARIO">Prioritario</option>
                    <option value="URGENTE">Urgente</option>
                    <option value="CRITICO">Crítico / UCI</option>
                  </select>
                </div>
              </div>

              {newEncType === 'INTERNACION' && (
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Sector / Canil:</label>
                  <input
                    type="text"
                    value={newEncSector}
                    onChange={(e) => setNewEncSector(e.target.value)}
                    placeholder="ej: Caniles Generales #02, UCI Canil 01"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-700 font-bold block mb-1">Motivo de Atención:</label>
                <input
                  type="text"
                  value={newEncReason}
                  onChange={(e) => setNewEncReason(e.target.value)}
                  placeholder="ej: Decaimiento, vómitos, control postquirúrgico"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Diagnóstico Presuntivo Inicial:</label>
                <input
                  type="text"
                  value={newEncDiag}
                  onChange={(e) => setNewEncDiag(e.target.value)}
                  placeholder="ej: Gastroenteritis aguda"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowNewEncounterModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md"
              >
                Iniciar Atención
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 2. Modal Signos Vitales */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddVitalsSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-teal-600" />
                <span>+ Registrar Control de Signos Vitales</span>
              </h3>
              <button type="button" onClick={() => setShowVitalsModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Temperatura (°C):</label>
                <input
                  type="number"
                  step="0.1"
                  value={vitTemp}
                  onChange={(e) => setVitTemp(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Frec. Cardíaca (lpm):</label>
                <input
                  type="number"
                  value={vitFC}
                  onChange={(e) => setVitFC(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Frec. Resp. (rpm):</label>
                <input
                  type="number"
                  value={vitFR}
                  onChange={(e) => setVitFR(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">SpO2 (%):</label>
                <input
                  type="number"
                  value={vitSpo2}
                  onChange={(e) => setVitSpo2(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Presión Sistólica:</label>
                <input
                  type="number"
                  value={vitPAS}
                  onChange={(e) => setVitPAS(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Glucemia (mg/dL):</label>
                <input
                  type="number"
                  value={vitGlucose}
                  onChange={(e) => setVitGlucose(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowVitalsModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md"
              >
                Guardar Control
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Modal Evolución */}
      {showEvolutionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddEvolutionSubmit} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>+ Nueva Evolución Clínica</span>
              </h3>
              <button type="button" onClick={() => setShowEvolutionModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Estado General / Hallazgos Ficos:</label>
                <textarea
                  rows={2}
                  value={evoGeneralState}
                  onChange={(e) => setEvoGeneralState(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Respuesta al Tratamiento:</label>
                <textarea
                  rows={2}
                  value={evoTreatmentResponse}
                  onChange={(e) => setEvoTreatmentResponse(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Plan Terapéutico & Pendientes:</label>
                <textarea
                  rows={2}
                  value={evoPlan}
                  onChange={(e) => setEvoPlan(e.target.value)}
                  placeholder="ej: Mantener fluidos a 60ml/h, control de glucemia a las 16hs"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowEvolutionModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md"
              >
                Firmar & Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. Modal Solicitar Laboratorio */}
      {showLabModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleRequestLabSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-teal-600" />
                <span>+ Solicitar Estudio de Laboratorio</span>
              </h3>
              <button type="button" onClick={() => setShowLabModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Tipo de Estudio:</label>
                <select
                  value={labType}
                  onChange={(e) => setLabType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                >
                  <option value="HEMOGRAMA_COMPLETO">Hemograma Completo</option>
                  <option value="PERFIL_BIOQUIMICO_RENAL_HEPATICO">Perfil Renal & Hepático</option>
                  <option value="URANALISIS">Uranálisis Completo</option>
                  <option value="COPROPARASITOLOGICO">Coproparasitológico</option>
                  <option value="CULTIVO_ANTIBIOGRAMA">Cultivo & Antibiograma</option>
                  <option value="OTROS">Otro Estudio Especial</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Observaciones / Sospecha Clínica:</label>
                <textarea
                  rows={2}
                  value={labNotes}
                  onChange={(e) => setLabNotes(e.target.value)}
                  placeholder="ej: Control de anemia y función renal preanestésica"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLabModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md"
              >
                Crear Orden de Laboratorio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 5. Modal Cargar Resultados Lab */}
      {selectedLabForPerform && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handlePerformLabSubmit} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>☑ Cargar Resultados & Marcar Realizado</span>
              </h3>
              <button type="button" onClick={() => setSelectedLabForPerform(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Hematocrito (%):</label>
                <input
                  type="text"
                  value={labHcto}
                  onChange={(e) => setLabHcto(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Leucocitos (/uL):</label>
                <input
                  type="text"
                  value={labWbc}
                  onChange={(e) => setLabWbc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Urea (mg/dL):</label>
                <input
                  type="text"
                  value={labUrea}
                  onChange={(e) => setLabUrea(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Creatinina (mg/dL):</label>
                <input
                  type="text"
                  value={labCreat}
                  onChange={(e) => setLabCreat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Informe Diagnóstico:</label>
              <textarea
                rows={2}
                value={labResultReport}
                onChange={(e) => setLabResultReport(e.target.value)}
                placeholder="ej: Hematocrito en rango normal, serie blanca normocítica."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedLabForPerform(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md"
              >
                Confirmar Realización & Facturar Cargo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. Modal Solicitar Imagen */}
      {showImgModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleRequestImgSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Scan className="w-5 h-5 text-teal-600" />
                <span>+ Solicitar Diagnóstico por Imágenes</span>
              </h3>
              <button type="button" onClick={() => setShowImgModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Modalidad:</label>
                  <select
                    value={imgModality}
                    onChange={(e) => setImgModality(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="RADIOGRAFIA">Radiografía</option>
                    <option value="ECOGRAFIA">Ecografía</option>
                    <option value="TOMOGRAFIA">Tomografía</option>
                    <option value="RESONANCIA">Resonancia</option>
                    <option value="ENDOSCOPIA">Endoscopía</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Región Anatómica:</label>
                  <input
                    type="text"
                    value={imgRegion}
                    onChange={(e) => setImgRegion(e.target.value)}
                    placeholder="ej: Abdomen, Tórax LL/VD, Miembro anterior"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowImgModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md"
              >
                Crear Solicitud de Imagen
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 7. Modal Cargar Informe Imagen */}
      {selectedImgForPerform && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handlePerformImgSubmit} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>☑ Cargar Informe de Imagen & Marcar Realizado</span>
              </h3>
              <button type="button" onClick={() => setSelectedImgForPerform(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Informe Detallado de Hallazgos:</label>
                <textarea
                  rows={3}
                  value={imgReport}
                  onChange={(e) => setImgReport(e.target.value)}
                  placeholder="ej: Silueta cardíaca normal, parénquima pulmonar sin infiltrados, asas intestinales sin signos de oclusión."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Conclusión Diagnóstica:</label>
                <input
                  type="text"
                  value={imgConclusion}
                  onChange={(e) => setImgConclusion(e.target.value)}
                  placeholder="ej: Estudio radiológico sin particularidades agudas"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedImgForPerform(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs shadow-md"
              >
                Confirmar Realización & Facturar Cargo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 8. Modal Indicar Medicamento */}
      {showMedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddMedicationSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Pill className="w-5 h-5 text-teal-600" />
                <span>+ Indicar Medicamento</span>
              </h3>
              <button type="button" onClick={() => setShowMedModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Nombre Comercial / Fármaco:</label>
                <input
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="ej: Meloxicam 0.5%, Tramadol, Ranitidina"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Dosis:</label>
                  <input
                    type="text"
                    value={medDose}
                    onChange={(e) => setMedDose(e.target.value)}
                    placeholder="ej: 0.2 mg/kg (0.6 ml)"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Vía:</label>
                  <select
                    value={medRoute}
                    onChange={(e) => setMedRoute(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                  >
                    <option value="IV">IV (Endovenosa)</option>
                    <option value="SC">SC (Subcutánea)</option>
                    <option value="IM">IM (Intramuscular)</option>
                    <option value="ORAL">Oral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Frecuencia:</label>
                <input
                  type="text"
                  value={medFreq}
                  onChange={(e) => setMedFreq(e.target.value)}
                  placeholder="ej: Cada 12 horas, Cada 24 hs"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowMedModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md"
              >
                Guardar Indicación
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 9. Modal Indicar Procedimiento */}
      {showProcModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleAddProcedureSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Scissors className="w-5 h-5 text-teal-600" />
                <span>+ Indicar Procedimiento Clínico</span>
              </h3>
              <button type="button" onClick={() => setShowProcModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Procedimiento:</label>
                <input
                  type="text"
                  value={procName}
                  onChange={(e) => setProcName(e.target.value)}
                  placeholder="ej: Colocación de Vía Endovenosa, Sondaje, Curación"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Precio ($):</label>
                <input
                  type="number"
                  value={procPrice}
                  onChange={(e) => setProcPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowProcModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md"
              >
                Guardar Procedimiento
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 10. Modal Facturación y Comprobante */}
      {showBillModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleBillEncounterSubmit} className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-600" />
                <span>Confirmar Emisión de Factura / Comprobante</span>
              </h3>
              <button type="button" onClick={() => setShowBillModal(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Subtotal de Consumos Realizados:</span>
                <strong className="text-slate-900 font-mono">${preInvoiceData.totalAmount.toLocaleString('es-AR')}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Descuento Autorizado ($):</span>
                <input
                  type="number"
                  min="0"
                  max={preInvoiceData.totalAmount}
                  value={billDiscount}
                  onChange={(e) => setBillDiscount(Number(e.target.value))}
                  className="w-28 bg-white border border-slate-200 rounded-lg p-1 text-right font-mono font-bold"
                />
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                <span className="font-black text-slate-900">Total a Cobrar:</span>
                <strong className="text-base font-mono font-black text-teal-800">
                  ${Math.max(0, preInvoiceData.totalAmount - billDiscount).toLocaleString('es-AR')}
                </strong>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Medio de Pago:</label>
                <select
                  value={billPayMethod}
                  onChange={(e) => setBillPayMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                >
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  <option value="TARJETA_DEBITO">Tarjeta de Débito</option>
                  <option value="TARJETA_CREDITO">Tarjeta de Crédito</option>
                  <option value="MERCADOPAGO_QR">Mercado Pago QR</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Tipo de Factura:</label>
                <select
                  value={billInvType}
                  onChange={(e) => setBillInvType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-bold"
                >
                  <option value="FACTURA_B">Factura B (Consumidor Final)</option>
                  <option value="FACTURA_A">Factura A (Resp. Inscripto)</option>
                  <option value="RECIBO_X">Recibo X (Interno)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBillModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-md"
              >
                Emitir Factura con CAE
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
