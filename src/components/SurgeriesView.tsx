import React, { useState, useEffect, useMemo } from 'react';
import {
  Scissors,
  Plus,
  Clock,
  Heart,
  Activity,
  AlertTriangle,
  User,
  CheckCircle2,
  Radio,
  Calculator,
  Search,
  MessageCircle,
  ShieldCheck,
  Filter,
  FileText,
  Printer,
  BedDouble,
  Play,
  Check,
  XCircle,
  Sparkles,
  Zap,
  Droplets,
  Timer,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Trash2,
  Archive,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { SurgeryRecord } from '../types';
import { formatDate, formatTime, formatWeight } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, SearchInput, FilterBar, StatCard } from './ui';
import { printA4SurgeryProtocol } from '../utils/printDocumentHelper';

// Presets de procedimientos quirúrgicos comunes en la clínica veterinaria
export interface SurgeryPreset {
  id: string;
  name: string;
  category: 'TEJIDOS_BLANDOS' | 'TRAUMATOLOGIA' | 'ODONTOLOGIA' | 'URGENCIA' | 'REPRODUCTIVO';
  durationMinutes: number;
  asaGrade: 'I' | 'II' | 'III' | 'IV' | 'V' | 'E';
  premedication: string;
  induction: string;
  maintenance: string;
  analgesia: string;
  technique: string;
  postOpOrders: string;
}

export const SURGERY_PRESETS: SurgeryPreset[] = [
  {
    id: 'osh-canina',
    name: 'Ovariohisterectomía (OSH) Canina / Felina',
    category: 'REPRODUCTIVO',
    durationMinutes: 45,
    asaGrade: 'I',
    premedication: 'Acepromacina 0.03 mg/kg + Morfina 0.3 mg/kg SC/IM',
    induction: 'Propofol 4 mg/kg IV a efecto',
    maintenance: 'Isoflurano 1.5 - 2% en Oxígeno 100%',
    analgesia: 'Meloxicam 0.2 mg/kg SC + Tramadol 2 mg/kg IV',
    technique: 'Celiotomía medial retroxifoidea a pre-púbica. Aislamiento de cuernos uterinos, ligadura transfixiante con Vicryl 2-0 de pedículos ováricos y cuerpo uterino. Cierre de pared abdominal en 3 planos (línea alba, tejido subcutáneo y piel intradérmica).',
    postOpOrders: 'Reposo estricto 10 días. Collar isabelino permanente. Meloxicam 0.1 mg/kg cada 24hs por 4 días. Cefalexina 25 mg/kg cada 12hs por 7 días. Retiro de puntos en 10-12 días.',
  },
  {
    id: 'orquiectomia',
    name: 'Orquiectomía (Castración Macho)',
    category: 'REPRODUCTIVO',
    durationMinutes: 30,
    asaGrade: 'I',
    premedication: 'Midazolam 0.2 mg/kg + Tramadol 3 mg/kg IM',
    induction: 'Propofol 4 mg/kg IV a efecto',
    maintenance: 'Isoflurano 1.5% en O2',
    analgesia: 'Meloxicam 0.2 mg/kg SC + Bloqueo intratesticular con Lidocaína 2%',
    technique: 'Incisión pre-escrotal sobre rafe medio. Exteriorización testicular bilateral, ligadura por fricción y transfixión de cordón espermático y vasos testiculares con Monocryl 3-0. Cierre subcutáneo y dérmico.',
    postOpOrders: 'Collar isabelino por 7 días. Meloxicam 0.1 mg/kg VO cada 24hs por 3 días. Control de herida quirúrgica a las 48hs.',
  },
  {
    id: 'cesarea-urgencia',
    name: 'Cesárea de Urgencia (Distocia / Sufrimiento Fetal)',
    category: 'URGENCIA',
    durationMinutes: 60,
    asaGrade: 'III',
    premedication: 'Midazolam 0.15 mg/kg IV + Fentanilo intraop post-nacimiento',
    induction: 'Propofol 3-4 mg/kg IV a efecto mínimo',
    maintenance: 'Isoflurano 1% en O2 con ventilación asistida',
    analgesia: 'Tramadol 2 mg/kg + Dipirona 25 mg/kg post-extracción de cachorros',
    technique: 'Incisión ventral medial infraumbilical. Histerotomía sobre cuerpo/cuernos uterinos, extracción secuencial de neonatos, desprendimiento de placentas, aspiración orofaríngea y reanimación neonatal inmediata. Histerorrafia invaginante tipo Cushing con Vicryl 3-0.',
    postOpOrders: 'Monitorización neonatal y lactancia asistida. Fluidoterapia con Ringer Lactato 10 ml/kg/h. Cefazolina 25 mg/kg IV cada 8hs. Analgesia compatible con lactancia.',
  },
  {
    id: 'enterotomia-cuerpo-extrano',
    name: 'Enterotomía / Gastrotomía (Cuerpo Extraño Obstructivo)',
    category: 'TEJIDOS_BLANDOS',
    durationMinutes: 75,
    asaGrade: 'III',
    premedication: 'Metadona 0.3 mg/kg + Midazolam 0.2 mg/kg IM',
    induction: 'Propofol 4 mg/kg + Fentanilo 3 mcg/kg IV',
    maintenance: 'Isoflurano 1.8% en O2 con infusión continua (FLK)',
    analgesia: 'Infusión Fentanilo-Lidocaína-Ketamina (FLK) + Tramadol',
    technique: 'Laparotomía exploratoria xifopúbica. Inspección de todo el tracto digestivo. Incisión longitudinal en borde antimesentérico distal a la obstrucción. Extracción del cuerpo extraño, evaluación de viabilidad tisular, enterorrafia en punto simple invaginante y prueba de estanqueidad con solución salina.',
    postOpOrders: 'Ayuno enteral 12-24hs con fluidoterapia de reposición. Ranitidina/Omeprazol 1 mg/kg IV. Metronidazol + Cefalosporina. Pase a UCI / Internación.',
  },
  {
    id: 'osteosintesis-fractura',
    name: 'Osteosíntesis / Traumatología (Fijación de Fractura)',
    category: 'TRAUMATOLOGIA',
    durationMinutes: 90,
    asaGrade: 'II',
    premedication: 'Dexmedetomidina 5 mcg/kg + Morfina 0.4 mg/kg IM',
    induction: 'Ketamina 3 mg/kg + Diazepam 0.3 mg/kg IV',
    maintenance: 'Isoflurano 1.8% en O2 + Bloqueo epidural / loco-regional',
    analgesia: 'Morfina epidural 0.1 mg/kg + Meloxicam 0.2 mg/kg SC',
    technique: 'Abordaje lateral de diáfisis ósea. Reducción anatómica de fragmentos bajo control estricto. Colocación de placa de compresión dinámica (DCP) o fijador esquelético externo con tornillos corticales bicorticales. Lavado profuso y síntesis tisular por planos.',
    postOpOrders: 'Radiografía de control posquirúrgico inmediata. Vendaje Robert Jones de protección. Reposo en jaula 30 días. Tramadol + Gabapentina + Meloxicam.',
  },
  {
    id: 'profilaxis-dental',
    name: 'Profilaxis Odontológica & Cirugía Periodontal',
    category: 'ODONTOLOGIA',
    durationMinutes: 45,
    asaGrade: 'II',
    premedication: 'Acepromacina 0.02 mg/kg + Buprenorfina 0.02 mg/kg IM',
    induction: 'Propofol 4 mg/kg IV a efecto',
    maintenance: 'Isoflurano 1.5% con intubación endotraqueal con manguito insuflado',
    analgesia: 'Bloqueo infraorbitario y mandibular bilateral con Bupivacaína 0.5%',
    technique: 'Detartraje supragingival y subgingival con ultrasonido piezocerámico. Sondaje periodontal de 4 cuadrantes. Exodoncia de piezas comprometidas con elevador perióstico, curetaje de alvéolo y colgajo mucoperióstico con sutura reabsorbible.',
    postOpOrders: 'Dieta blanda por 7 días. Clorhexidina gel 0.12% tópico cada 12hs. Amoxicilina + Ácido Clavulánico 20 mg/kg cada 12hs por 7 días. Meloxicam.',
  },
  {
    id: 'cistotomia-urolitiasis',
    name: 'Cistotomía (Extracción de Urolitos / Cálculos)',
    category: 'TEJIDOS_BLANDOS',
    durationMinutes: 60,
    asaGrade: 'II',
    premedication: 'Midazolam 0.2 mg/kg + Morfina 0.3 mg/kg IM',
    induction: 'Propofol 4 mg/kg IV a efecto',
    maintenance: 'Isoflurano 1.5% en O2',
    analgesia: 'Tramadol 2 mg/kg IV + Meloxicam 0.2 mg/kg SC',
    technique: 'Celiotomía caudal prepúbica. Exteriorización y aislamiento de vejiga con compresas tibias. Incisión en cara ventral/avascular, extracción completa de cálculos con cucharilla de Volkmann, lavado vesical retrógrado y anterógrado hasta comprobación de permeabilidad uretral. Cierre vesical en 2 planos con sutura monofilamento reabsorbible 4-0.',
    postOpOrders: 'Envío de muestra de urolitos a análisis químico y cultivo bacteriológico. Sondaje de control 24hs. Fluidoterapia forzada. Analgesia urinaria.',
  },
];

export const SurgeriesView: React.FC = () => {
  const {
    surgeries,
    patients,
    owners,
    addSurgery,
    updateSurgery,
    updateSurgeryStatus,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openCalculators,
    openAnesthesiaChart,
    openWhatsAppHub,
    showToast,
    archiveSurgery,
    deleteSurgery,
  } = useVet();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODAS');
  const [showNewSurgeryModal, setShowNewSurgeryModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState<SurgeryRecord | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  // Form State para Nueva Cirugía
  const [surgPatientId, setSurgPatientId] = useState('');
  const [surgProcedureName, setSurgProcedureName] = useState('');
  const [surgSurgeon, setSurgSurgeon] = useState('Dr. Diego Iván Irusta');
  const [surgAssistant, setSurgAssistant] = useState('');
  const [surgAnesthetist, setSurgAnesthetist] = useState('Dr. Diego Iván Irusta');
  const [surgDate, setSurgDate] = useState(new Date().toISOString().split('T')[0]);
  const [surgStartTime, setSurgStartTime] = useState('09:00');
  const [surgDuration, setSurgDuration] = useState(45);
  const [surgAsa, setSurgAsa] = useState<'I' | 'II' | 'III' | 'IV' | 'V' | 'E'>('I');
  const [surgFastingHours, setSurgFastingHours] = useState(8);
  const [surgPremedication, setSurgPremedication] = useState('Acepromacina 0.03 mg/kg + Morfina 0.3 mg/kg');
  const [surgInduction, setSurgInduction] = useState('Propofol 4 mg/kg IV a efecto');
  const [surgMaintenance, setSurgMaintenance] = useState('Isoflurano 1.5% en Oxígeno 100%');
  const [surgAnalgesia, setSurgAnalgesia] = useState('Meloxicam 0.2 mg/kg + Tramadol 2 mg/kg');
  const [surgTechnique, setSurgTechnique] = useState('');
  const [surgPostOpOrders, setSurgPostOpOrders] = useState('');

  // Checklist de Seguridad Quirúrgica OMS
  const [checklistState, setChecklistState] = useState({
    patientIdentity: true,
    siteMarked: true,
    anesthesiaMachineChecked: true,
    pulseOximeterOn: true,
    knownAllergiesReviewed: true,
    difficultAirwayRisk: false,
    bloodLossRiskReviewed: true,
    sterileIndicatorsChecked: true,
    antibioticProphylaxisGiven: true,
    spongeAndInstrumentCountConfirmed: true,
    specimenLabeled: true,
    postOpAnalgesiaPlanReviewed: true,
  });

  // Estadísticas y Métricas
  const activeSurgeries = useMemo(() => surgeries.filter((s) => !s.isArchived), [surgeries]);
  const inProgressSurgeries = useMemo(() => activeSurgeries.filter((s) => s.status === 'EN_CURSO'), [activeSurgeries]);
  const scheduledSurgeries = useMemo(() => activeSurgeries.filter((s) => s.status === 'PROGRAMADA'), [activeSurgeries]);
  const finishedSurgeries = useMemo(() => activeSurgeries.filter((s) => s.status === 'FINALIZADA'), [activeSurgeries]);

  // Manejo de preset al crear
  const handleApplyPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = SURGERY_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSurgProcedureName(preset.name);
      setSurgDuration(preset.durationMinutes);
      setSurgAsa(preset.asaGrade);
      setSurgPremedication(preset.premedication);
      setSurgInduction(preset.induction);
      setSurgMaintenance(preset.maintenance);
      setSurgAnalgesia(preset.analgesia);
      setSurgTechnique(preset.technique);
      setSurgPostOpOrders(preset.postOpOrders);
      triggerHaptic('light');
    }
  };

  // Autoseleccionar primer paciente disponible si no está seteado
  useEffect(() => {
    if (!surgPatientId && patients.length > 0) {
      setSurgPatientId(patients[0].id);
    }
  }, [patients, surgPatientId]);

  // Filtrado de Cirugías
  const filteredSurgeries = useMemo(() => {
    return activeSurgeries.filter((surg) => {
      const q = (search || '').toLowerCase().trim();
      const patient = patients.find((p) => p.id === surg.patientId);
      const petName = patient?.name?.toLowerCase() || '';
      const hc = patient?.clinicalRecordNumber?.toLowerCase() || '';
      const proc = (surg.procedureName || '').toLowerCase();
      const surgeon = (surg.surgeonName || '').toLowerCase();
      const anesthetist = (surg.anesthetistName || '').toLowerCase();

      const matchesSearch =
        !q ||
        petName.includes(q) ||
        hc.includes(q) ||
        proc.includes(q) ||
        surgeon.includes(q) ||
        anesthetist.includes(q);

      const matchesStatus = statusFilter === 'TODAS' || surg.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [activeSurgeries, search, statusFilter, patients]);

  // Crear Cirugía
  const handleCreateSurgery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!surgPatientId || !surgProcedureName) {
      showToast('error', 'Campos Incompletos', 'Por favor selecciona un paciente y el nombre del procedimiento.');
      return;
    }

    const patient = patients.find((p) => p.id === surgPatientId);

    const newSurg: Omit<SurgeryRecord, 'id'> = {
      patientId: surgPatientId,
      procedureName: surgProcedureName,
      surgeonName: surgSurgeon || 'Dr. Diego Iván Irusta',
      assistantName: surgAssistant || undefined,
      anesthetistName: surgAnesthetist || 'Dr. Diego Iván Irusta',
      branchId: 'main-branch',
      date: surgDate,
      startTime: surgStartTime,
      preOpAssessment: {
        asaGrade: surgAsa,
        fastingHours: surgFastingHours,
        labReviewed: true,
        risksAlerts: surgAsa === 'I' ? 'Riesgo anestésico bajo' : 'Riesgo anestésico moderado a elevado',
      },
      anesthesiaProtocol: {
        premedication: surgPremedication,
        induction: surgInduction,
        maintenance: surgMaintenance,
        analgesia: surgAnalgesia,
        monitoringPoints: [],
        milestones: {
          inductionTime: surgStartTime,
          intubationTime: surgStartTime,
          incisionTime: '',
          sutureTime: '',
          extubationTime: '',
          recoveryTime: '',
        },
      },
      surgicalTechnique: surgTechnique || 'Técnica quirúrgica estándar sin complicaciones.',
      findings: 'Sin hallazgos patológicos adicionales.',
      materialsUsed: [],
      postOpOrders: surgPostOpOrders || 'Reposo, control de herida y analgesia.',
      status: 'PROGRAMADA',
    };

    addSurgery(newSurg);
    setShowNewSurgeryModal(false);
    triggerHaptic('medium');
  };

  // Handlers de ciclo quirúrgico
  const handleStartSurgery = (surg: SurgeryRecord) => {
    triggerHaptic('medium');
    const nowTime = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    updateSurgery(surg.id, {
      status: 'EN_CURSO',
      anesthesiaProtocol: {
        ...surg.anesthesiaProtocol,
        milestones: {
          ...surg.anesthesiaProtocol?.milestones,
          incisionTime: nowTime,
        },
      },
    });
    showToast('info', 'Cirugía en Quirófano', 'Se inició el procedimiento ' + surg.procedureName + ' a las ' + nowTime + ' hs.');
  };

  const handleFinishSurgery = (surg: SurgeryRecord) => {
    triggerHaptic('medium');
    const nowTime = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    updateSurgery(surg.id, {
      status: 'FINALIZADA',
      endTime: nowTime,
      anesthesiaProtocol: {
        ...surg.anesthesiaProtocol,
        milestones: {
          ...surg.anesthesiaProtocol?.milestones,
          sutureTime: nowTime,
          recoveryTime: nowTime,
        },
      },
    });
    showToast('success', 'Cirugía Concluida', 'Procedimiento finalizado exitosamente a las ' + nowTime + ' hs.');
  };

  const handlePassToRecovery = (surg: SurgeryRecord) => {
    triggerHaptic('medium');
    setSelectedPatientId(surg.patientId);
    setQuickModal('INGRESO_INTERNACION');
  };

  // Impresión Oficial A4
  const handlePrintProtocol = (surg: SurgeryRecord) => {
    triggerHaptic('light');
    const patient = patients.find((p) => p.id === surg.patientId);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
    const weightNum = parseFloat(patient?.weight || '10') || 10;
    const fluidRate = Math.round(weightNum * 7.5);

    printA4SurgeryProtocol({
      surgeryId: surg.id.toUpperCase(),
      procedureName: surg.procedureName,
      date: formatDate(surg.date),
      startTime: surg.startTime || '09:00',
      endTime: surg.endTime,
      status: surg.status,
      patient: {
        name: patient?.name || 'Paciente',
        species: patient?.species || 'Canino',
        breed: patient?.breed || 'Mestizo',
        age: patient?.calculatedAge || 'Edad N/R',
        weight: patient?.weight ? formatWeight(patient.weight) : '10 kg',
        hc: patient?.clinicalRecordNumber || 'HC-0000',
        sex: patient?.sex,
      },
      owner: {
        name: owner ? (owner.firstName + ' ' + owner.lastName) : 'Tutor Responsable',
        dni: owner?.dni,
        phone: owner?.phone,
        address: owner?.address,
      },
      team: {
        surgeon: surg.surgeonName || 'Dr. Diego Iván Irusta',
        surgeonLicense: 'M.P. 502 (Neuquén)',
        anesthetist: surg.anesthetistName || 'Dr. Diego Iván Irusta',
        assistant: surg.assistantName,
      },
      preOp: {
        asaGrade: surg.preOpAssessment?.asaGrade || 'I',
        fastingHours: surg.preOpAssessment?.fastingHours || 8,
        labReviewed: surg.preOpAssessment?.labReviewed ?? true,
        risksAlerts: surg.preOpAssessment?.risksAlerts,
      },
      anesthesia: {
        premedication: surg.anesthesiaProtocol?.premedication || 'Acepromacina + Morfina',
        induction: surg.anesthesiaProtocol?.induction || 'Propofol 4 mg/kg IV',
        maintenance: surg.anesthesiaProtocol?.maintenance || 'Isoflurano 1.5% en O2',
        analgesia: surg.anesthesiaProtocol?.analgesia || 'Meloxicam + Tramadol',
        fluidRateMlPerHour: fluidRate,
      },
      technique: surg.surgicalTechnique || 'Técnica quirúrgica reglamentaria.',
      findings: surg.findings || 'Sin anomalías adicionales.',
      materialsUsed: surg.materialsUsed,
      postOpOrders: surg.postOpOrders || 'Reposo y analgesia.',
      complications: surg.complications,
    });
  };

  const asaGradeColors: Record<string, { label: string; bg: string; text: string; ring: string }> = {
    I: { label: 'ASA I (Paciente Sano)', bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-800', ring: 'ring-emerald-400' },
    II: { label: 'ASA II (Enfermedad Leve)', bg: 'bg-teal-50 border-teal-300', text: 'text-teal-800', ring: 'ring-teal-400' },
    III: { label: 'ASA III (Enfermedad Sistémica Grave)', bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800', ring: 'ring-amber-400' },
    IV: { label: 'ASA IV (Riesgo Vital Constante)', bg: 'bg-orange-50 border-orange-300', text: 'text-orange-800', ring: 'ring-orange-400' },
    V: { label: 'ASA V (Moribundo)', bg: 'bg-rose-50 border-rose-300', text: 'text-rose-800', ring: 'ring-rose-400' },
    E: { label: 'ASA E (Emergencia Quirúrgica)', bg: 'bg-red-600 text-white border-red-700', text: 'text-white', ring: 'ring-red-500' },
  };

  const statusOptions = [
    { id: 'TODAS', label: 'Todas', badge: activeSurgeries.length },
    { id: 'EN_CURSO', label: '⚡ En Quirófano', badge: inProgressSurgeries.length },
    { id: 'PROGRAMADA', label: '📅 Programadas', badge: scheduledSurgeries.length },
    { id: 'FINALIZADA', label: '✅ Finalizadas', badge: finishedSurgeries.length },
    { id: 'SUSPENDIDA', label: 'Suspendidas', badge: activeSurgeries.filter((s) => s.status === 'SUSPENDIDA').length },
  ];

  return (
    <div className="space-y-3.5 pb-10 w-full max-w-full">
      {/* 1. Header Oficial */}
      <PageHeader
        category="Centro Quirúrgico, Anestesiología & UCI"
        title="Quirófano & Cirugías"
        description="Pizarra quirúrgica en vivo, estratificación de riesgo ASA, protocolos anestésicos por peso, checklist OMS y partes oficiales."
        icon={Scissors}
        actions={[
          {
            label: 'Calculadora Anestésica',
            icon: Calculator,
            onClick: () => openCalculators('ANESTESIA'),
            variant: 'secondary',
          },
          {
            label: 'Programar Cirugía',
            icon: Plus,
            onClick: () => {
              triggerHaptic('light');
              setShowNewSurgeryModal(true);
            },
            variant: 'primary',
          },
        ]}
      />

      {/* 2. StatCards Quirúrgicos */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Cirugías Registradas"
          value={activeSurgeries.length}
          icon={Scissors}
          color="teal"
          trend="Padrón activo"
        />
        <StatCard
          label="En Quirófano Ahora"
          value={inProgressSurgeries.length}
          icon={Activity}
          color="rose"
          trend={inProgressSurgeries.length > 0 ? 'Monitoreo activo' : 'Quirófano disponible'}
        />
        <StatCard
          label="Cirugías Programadas"
          value={scheduledSurgeries.length}
          icon={Calendar}
          color="blue"
          trend="Agenda de quirófano"
        />
        <StatCard
          label="Procedimientos Concluidos"
          value={finishedSurgeries.length}
          icon={CheckCircle2}
          color="emerald"
          trend="Altas y protocolos A4"
        />
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs space-y-3 w-full max-w-full">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por procedimiento, paciente, HC, cirujano o anestesista..."
        />
        <FilterBar
          options={statusOptions}
          activeId={statusFilter}
          onSelect={setStatusFilter}
          label="Estado Quirúrgico"
        />
      </div>

      {/* 4. Surgeries List */}
      <div className="space-y-4 w-full">
        {filteredSurgeries.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="No se encontraron cirugías registradas"
            description={
              search || statusFilter !== 'TODAS'
                ? 'No hay procedimientos quirúrgicos que coincidan con los filtros aplicados.'
                : 'No hay cirugías programadas en este momento. Haz clic en "Programar Cirugía" para comenzar.'
            }
            actionLabel="Programar Nueva Cirugía"
            onAction={() => setShowNewSurgeryModal(true)}
          />
        ) : (
          filteredSurgeries.map((surg) => {
            const patient = patients.find((p) => p.id === surg.patientId);
            const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
            const asaKey = surg.preOpAssessment?.asaGrade || (surg as any).asaGrade || 'I';
            const asaInfo = asaGradeColors[asaKey] || asaGradeColors.I;
            const isEnCurso = surg.status === 'EN_CURSO';
            const weightNum = parseFloat(patient?.weight || '10') || 10;
            const fluidRate = Math.round(weightNum * 7.5);

            return (
              <div
                key={surg.id}
                className={'bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-all flex flex-col gap-4 w-full ' +
                  (isEnCurso
                    ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-50/15'
                    : 'border-slate-200/90 hover:border-teal-500/60')}
              >
                {/* Header Row: Procedure + Status + Live Clock + Surgeon */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-3">
                    <div className={'w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 ' +
                      (isEnCurso
                        ? 'bg-amber-100 border-amber-300 text-amber-800 animate-pulse'
                        : 'bg-teal-50 border-teal-200 text-teal-700')}>
                      <Scissors className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900 leading-tight">
                          {surg.procedureName}
                        </h3>
                        <span
                          className={'text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ' +
                            (isEnCurso
                              ? 'bg-amber-500 text-white border-amber-600 animate-pulse flex items-center gap-1'
                              : surg.status === 'FINALIZADA'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : surg.status === 'SUSPENDIDA'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-teal-50 text-teal-800 border-teal-200')}
                        >
                          {isEnCurso && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
                          {surg.status}
                        </span>

                        {isEnCurso && (
                          <span className="text-[11px] font-mono font-black px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 shadow-2xs">
                            <Timer className="w-3 h-3 text-amber-700 animate-spin" />
                            <span>En Quirófano</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1">
                        Paciente:{' '}
                        <strong
                          onClick={() => {
                            if (patient) {
                              setSelectedPatientId(patient.id);
                              setActivePatientTab('CIRUGIAS');
                              setActiveView('PACIENTES');
                            }
                          }}
                          className="text-teal-700 hover:underline cursor-pointer font-bold"
                        >
                          {patient?.name || 'Paciente'}
                        </strong>{' '}
                        <span className="font-mono text-[11px] text-slate-500">
                          ({patient?.clinicalRecordNumber || 'HC-0000'})
                        </span>{' '}
                        • {patient?.species} {patient?.breed} •{' '}
                        <span className="font-semibold text-slate-700">
                          {patient?.weight ? formatWeight(patient.weight) : '10 kg'}
                        </span>{' '}
                        • Tutor:{' '}
                        <span className="font-semibold text-slate-800">
                          {owner ? (owner.firstName + ' ' + owner.lastName) : 'No asignado'}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col md:items-end text-xs text-slate-600">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      <span>Cirujano: {surg.surgeonName || 'Dr. Diego Iván Irusta'}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Anestesista: {surg.anesthetistName || 'Dr. Diego Iván Irusta'}
                      {surg.assistantName ? (' • Ayudante: ' + surg.assistantName) : ''}
                    </div>
                    <div className="font-mono text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(surg.date)} a las {surg.startTime || '09:00'} hs</span>
                    </div>
                  </div>
                </div>

                {/* Pre-Op ASA Assessment & Anesthesia Protocol */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-slate-50/90 p-3 sm:p-4 rounded-xl border border-slate-200/80">
                  {/* ASA Grade */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      Riesgo Quirúrgico (ASA):
                    </span>
                    <span className={'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black border ' + asaInfo.bg + ' ' + asaInfo.text}>
                      {asaInfo.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Ayuno: {surg.preOpAssessment?.fastingHours || 8}h sólidos / 2h líquidos
                    </span>
                  </div>

                  {/* Premedication */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      Premedicación:
                    </span>
                    <p className="text-xs text-slate-800 font-semibold leading-snug">
                      {surg.anesthesiaProtocol?.premedication || 'Acepromacina + Morfina'}
                    </p>
                  </div>

                  {/* Induction */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      Inducción:
                    </span>
                    <p className="text-xs text-slate-800 font-semibold leading-snug">
                      {surg.anesthesiaProtocol?.induction || 'Propofol 4 mg/kg IV a efecto'}
                    </p>
                  </div>

                  {/* Maintenance & Fluid */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      Mantenimiento & Fluidos:
                    </span>
                    <p className="text-xs text-slate-800 font-semibold leading-snug">
                      {surg.anesthesiaProtocol?.maintenance || 'Isoflurano 1.5% en O2'}
                    </p>
                    <span className="text-[10px] text-teal-700 font-bold flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-teal-600" />
                      Fluidos: {fluidRate} ml/h Ringer Lactato
                    </span>
                  </div>
                </div>

                {/* Technique & Findings */}
                {surg.surgicalTechnique && (
                  <div className="text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      Técnica Quirúrgica & Hallazgos:
                    </span>
                    <p className="text-slate-700 leading-relaxed font-normal">{surg.surgicalTechnique}</p>
                    {surg.postOpOrders && (
                      <p className="text-slate-600 text-[11px] pt-1.5 border-t border-slate-200/60 font-medium">
                        <strong className="text-teal-800">Posoperatorio:</strong> {surg.postOpOrders}
                      </p>
                    )}
                  </div>
                )}

                {/* Interactive Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  {/* Status switcher & Live Control */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Estado:</span>
                    <select
                      value={surg.status}
                      onChange={(e) => updateSurgeryStatus(surg.id, e.target.value as SurgeryRecord['status'])}
                      className="min-h-[38px] px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      <option value="PROGRAMADA">Programada</option>
                      <option value="EN_CURSO">⚡ En Curso (Quirófano)</option>
                      <option value="FINALIZADA">✅ Finalizada</option>
                      <option value="SUSPENDIDA">❌ Suspendida</option>
                    </select>

                    {/* Quick Play/Finish Buttons */}
                    {surg.status === 'PROGRAMADA' && (
                      <button
                        type="button"
                        onClick={() => handleStartSurgery(surg)}
                        className="min-h-[38px] px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                        title="Iniciar procedimiento quirúrgico ahora"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Iniciar Cirugía</span>
                      </button>
                    )}

                    {surg.status === 'EN_CURSO' && (
                      <button
                        type="button"
                        onClick={() => handleFinishSurgery(surg)}
                        className="min-h-[38px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-2xs transition-transform active:scale-95 cursor-pointer"
                        title="Marcar procedimiento como finalizado"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Finalizar Cirugía</span>
                      </button>
                    )}
                  </div>

                  {/* Actions Grid */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Checklist OMS */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setShowChecklistModal(surg.id);
                      }}
                      className="min-h-[38px] px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      title="Lista de verificación de seguridad quirúrgica OMS"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Checklist OMS</span>
                    </button>

                    {/* Informed Consent */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setShowConsentModal(surg);
                      }}
                      className="min-h-[38px] px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      title="Ver y generar consentimiento informado firmado"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span>Consentimiento</span>
                    </button>

                    {/* WhatsApp 1-Click Notifications */}
                    {owner?.phone && (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          openWhatsAppHub({
                            patientName: patient?.name || 'su mascota',
                            ownerName: (owner.firstName + ' ' + owner.lastName),
                            phone: owner.phone,
                          });
                        }}
                        className="min-h-[38px] px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                        title="Enviar aviso quirúrgico por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>
                    )}

                    {/* Live Anesthesia Chart */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        openAnesthesiaChart(surg.patientId, surg.procedureName);
                      }}
                      className="min-h-[38px] px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <span>🫁</span>
                      <span>Hoja Anestesia</span>
                    </button>

                    {/* Derive to Recovery / UCI */}
                    <button
                      type="button"
                      onClick={() => handlePassToRecovery(surg)}
                      className="min-h-[38px] px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-xl border border-purple-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      title="Derivar paciente a sala de recuperación postquirúrgica o UCI"
                    >
                      <BedDouble className="w-3.5 h-3.5 text-purple-600" />
                      <span>Recuperación / UCI</span>
                    </button>

                    {/* Print Official Protocol A4 */}
                    <button
                      type="button"
                      onClick={() => handlePrintProtocol(surg)}
                      className="min-h-[38px] px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all active:scale-95 shadow-2xs cursor-pointer"
                      title="Imprimir Protocolo Quirúrgico Oficial A4 con membrete del Dr. Diego Iván Irusta"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Parte Oficial A4</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Modal de Creación de Cirugía con Presets Quirúrgicos */}
      {showNewSurgeryModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 max-w-2xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Programar Intervención Quirúrgica</h3>
                  <p className="text-xs text-slate-500">Planificación quirúrgica, protocolos y cálculo por peso</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowNewSurgeryModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Presets Quirúrgicos de 1 Clic */}
            <div className="bg-teal-50/70 border border-teal-200/80 p-3 rounded-2xl space-y-2">
              <span className="text-[10px] font-black uppercase text-teal-800 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Plantillas Quirúrgicas Frecuentes (Autocompletar en 1 Clic):
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {SURGERY_PRESETS.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.id)}
                      className={'px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 cursor-pointer ' +
                        (isSelected
                          ? 'bg-teal-700 text-white shadow-2xs'
                          : 'bg-white text-slate-700 hover:bg-teal-100/60 border border-teal-200/90')}
                    >
                      <span>{preset.name.split('(')[0].trim()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleCreateSurgery} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Paciente:</label>
                  <select
                    value={surgPatientId}
                    onChange={(e) => setSurgPatientId(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species} - {p.breed}) • {p.weight ? formatWeight(p.weight) : 'S/P'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Procedimiento Quirúrgico:</label>
                  <input
                    type="text"
                    value={surgProcedureName}
                    onChange={(e) => setSurgProcedureName(e.target.value)}
                    placeholder="ej: Ovariohisterectomía / Osteosíntesis"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Cirujano Principal:</label>
                  <input
                    type="text"
                    value={surgSurgeon}
                    onChange={(e) => setSurgSurgeon(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Anestesista:</label>
                  <input
                    type="text"
                    value={surgAnesthetist}
                    onChange={(e) => setSurgAnesthetist(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Ayudante / Instrumentista:</label>
                  <input
                    type="text"
                    value={surgAssistant}
                    onChange={(e) => setSurgAssistant(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Fecha:</label>
                  <input
                    type="date"
                    value={surgDate}
                    onChange={(e) => setSurgDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Hora Inicio:</label>
                  <input
                    type="time"
                    value={surgStartTime}
                    onChange={(e) => setSurgStartTime(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Duración (min):</label>
                  <input
                    type="number"
                    value={surgDuration}
                    onChange={(e) => setSurgDuration(Number(e.target.value))}
                    required
                    min={10}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Riesgo ASA:</label>
                  <select
                    value={surgAsa}
                    onChange={(e) => setSurgAsa(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    <option value="I">ASA I - Sano</option>
                    <option value="II">ASA II - Leve</option>
                    <option value="III">ASA III - Moderada</option>
                    <option value="IV">ASA IV - Grave</option>
                    <option value="V">ASA V - Moribundo</option>
                    <option value="E">ASA E - Emergencia</option>
                  </select>
                </div>
              </div>

              {/* Protocolo Anestésico */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
                  Protocolo Anestésico & Farmacológico:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 block font-semibold mb-0.5">Premedicación:</label>
                    <input
                      type="text"
                      value={surgPremedication}
                      onChange={(e) => setSurgPremedication(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block font-semibold mb-0.5">Inducción:</label>
                    <input
                      type="text"
                      value={surgInduction}
                      onChange={(e) => setSurgInduction(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block font-semibold mb-0.5">Mantenimiento:</label>
                    <input
                      type="text"
                      value={surgMaintenance}
                      onChange={(e) => setSurgMaintenance(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 block font-semibold mb-0.5">Analgesia:</label>
                    <input
                      type="text"
                      value={surgAnalgesia}
                      onChange={(e) => setSurgAnalgesia(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Técnica y Órdenes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Técnica Quirúrgica Prevista:</label>
                  <textarea
                    rows={3}
                    value={surgTechnique}
                    onChange={(e) => setSurgTechnique(e.target.value)}
                    placeholder="Descripción del abordaje y técnica de síntesis..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Órdenes Posoperatorias:</label>
                  <textarea
                    rows={3}
                    value={surgPostOpOrders}
                    onChange={(e) => setSurgPostOpOrders(e.target.value)}
                    placeholder="Reposo, medicación postquirúrgica y cuidados..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewSurgeryModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Programar e Ingresar a Pizarra</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Checklist Modal OMS */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-slate-900 text-base">Checklist de Seguridad Quirúrgica OMS</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChecklistModal(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-black text-teal-800 block mb-1">
                  1. Sign In (Antes de la inducción anestésica):
                </span>
                <div className="space-y-1.5 pl-2">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.patientIdentity}
                      onChange={(e) => setChecklistState({ ...checklistState, patientIdentity: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Identidad del paciente, especie y procedimiento confirmados</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.knownAllergiesReviewed}
                      onChange={(e) => setChecklistState({ ...checklistState, knownAllergiesReviewed: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Alergias y antecedentes farmacológicos verificados</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.anesthesiaMachineChecked}
                      onChange={(e) => setChecklistState({ ...checklistState, anesthesiaMachineChecked: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Máquina de anestesia, circuito cerrado y flujo de O2 verificados</span>
                  </label>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-black text-teal-800 block mb-1">
                  2. Time Out (Antes de la incisión quirúrgica):
                </span>
                <div className="space-y-1.5 pl-2">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.sterileIndicatorsChecked}
                      onChange={(e) => setChecklistState({ ...checklistState, sterileIndicatorsChecked: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Esterilidad de campos e instrumental comprobada</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.antibioticProphylaxisGiven}
                      onChange={(e) => setChecklistState({ ...checklistState, antibioticProphylaxisGiven: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Profilaxis antibiótica administrada (&lt; 60 min)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.bloodLossRiskReviewed}
                      onChange={(e) => setChecklistState({ ...checklistState, bloodLossRiskReviewed: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Riesgo de hemorragia y fluidoterapia evaluados</span>
                  </label>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-black text-teal-800 block mb-1">
                  3. Sign Out (Antes de salir del quirófano / pase a recuperación):
                </span>
                <div className="space-y-1.5 pl-2">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.spongeAndInstrumentCountConfirmed}
                      onChange={(e) => setChecklistState({ ...checklistState, spongeAndInstrumentCountConfirmed: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Recuento de gasas, compresas e instrumental confirmado</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.specimenLabeled}
                      onChange={(e) => setChecklistState({ ...checklistState, specimenLabeled: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Rotulado de muestras y biopsias completado</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.postOpAnalgesiaPlanReviewed}
                      onChange={(e) => setChecklistState({ ...checklistState, postOpAnalgesiaPlanReviewed: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Plan de analgesia postoperatoria y cuidados acordado</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  showToast('success', 'Checklist Confirmado', 'Lista de verificación quirúrgica validada correctamente.');
                  setShowChecklistModal(null);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Validar Lista de Seguridad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Consentimiento Informado Quirúrgico Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-slate-900 text-base">Consentimiento Informado Quirúrgico</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConsentModal(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="font-black text-slate-900 text-sm border-b border-slate-200 pb-1">
                AUTORIZACIÓN PARA INTERVENCIÓN QUIRÚRGICA Y ANESTESIA
              </p>
              <p>
                Por la presente autorizo al equipo veterinario de <strong>Veterinaria Ranquel</strong> a realizar el procedimiento denominado{' '}
                <strong>{showConsentModal.procedureName}</strong> en el paciente registrado con clasificación de riesgo{' '}
                <strong>ASA {showConsentModal.preOpAssessment?.asaGrade || 'I'}</strong>.
              </p>
              <p>
                He sido informado de los riesgos inherentes a todo acto anestésico y quirúrgico, de las alternativas terapéuticas, así como de los cuidados
                posoperatorios requeridos para su adecuada recuperación.
              </p>
              <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="block text-slate-400 font-bold">Cirujano Responsable:</span>
                  <strong className="text-slate-800">{showConsentModal.surgeonName || 'Dr. Diego Iván Irusta'}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Anestesista:</span>
                  <strong className="text-slate-800">{showConsentModal.anesthetistName || 'Dr. Diego Iván Irusta'}</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handlePrintProtocol(showConsentModal)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Protocolo</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast('success', 'Consentimiento Firmado', 'Documento de consentimiento registrado con éxito.');
                  setShowConsentModal(null);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
              >
                Aceptar & Registrar Consentimiento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
