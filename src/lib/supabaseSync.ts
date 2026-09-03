import { supabase, checkSupabaseConnection } from './supabase';
import {
  Owner,
  Patient,
  VitalSigns,
  PatientProblem,
  Consultation,
  Hospitalization,
  SurgeryRecord,
  Product,
  Invoice,
  ClinicalDocument,
  AuditLog,
  Appointment,
  TriageEntry,
  LaboratoryOrder,
  ImagingStudy,
  VaccinationRecord,
  Estimate,
  FluidTherapy,
  Prescription,
} from '../types';

export { checkSupabaseConnection };

// =========================================================================
// DURABLE OFFLINE SYNC QUEUE & STATUS TRACKER
// =========================================================================
export interface QueuedSyncItem {
  id: string;
  table: string;
  payload: any;
  queuedAt: string;
  retryCount: number;
  lastError?: string;
}

const SYNC_QUEUE_KEY = 'vet_offline_sync_queue_v1';

export function getSyncQueue(): QueuedSyncItem[] {
  return [];
}

export function addToSyncQueue(table: string, payload: any, errorMsg?: string) {
  // Desactivado según directiva de seguridad y persistencia server-side hasta outbox formal.
  console.warn(`[SupabaseSync] Persistencia offline en cola desactivada para ${table}. Motivo: ${errorMsg || 'Sin conexión o fallo de red'}`);
}

export function clearFromSyncQueue(table: string, id: string) {
  // No-op
}

export function notifySyncStatus() {
  if (typeof window !== 'undefined') {
    const count = getSyncQueue().length;
    window.dispatchEvent(new CustomEvent('vet:sync_status_changed', { detail: { pendingCount: count } }));
  }
}

export async function processSyncQueue(): Promise<{ processed: number; failed: number }> {
  const queue = getSyncQueue();
  if (queue.length === 0) return { processed: 0, failed: 0 };

  let processed = 0;
  let failed = 0;
  const remaining: QueuedSyncItem[] = [];

  for (const item of queue) {
    try {
      const { error } = await supabase.from(item.table).upsert(item.payload);
      if (!error) {
        processed++;
      } else {
        failed++;
        remaining.push({ ...item, retryCount: item.retryCount + 1, lastError: error.message });
      }
    } catch (err: any) {
      failed++;
      remaining.push({ ...item, retryCount: item.retryCount + 1, lastError: err?.message || 'Network error' });
    }
  }

  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));
  notifySyncStatus();
  return { processed, failed };
}


// Normalizer helpers to map snake_case to camelCase safely
function normalizeOwner(raw: any): Owner {
  return {
    id: raw.id,
    firstName: raw.first_name || raw.firstName || '',
    lastName: raw.last_name || raw.lastName || '',
    dni: raw.dni || '',
    cuit: raw.cuit,
    phone: raw.phone || '',
    whatsapp: raw.whatsapp || raw.phone || '',
    email: raw.email || '',
    address: raw.address || '',
    city: raw.city || 'Las Lajas',
    province: raw.province || 'Neuquén',
    postalCode: raw.postal_code || raw.postalCode || '8347',
    notes: raw.notes || '',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    balance: typeof raw.balance === 'number' ? raw.balance : 0,
  };
}

function normalizePatient(raw: any): Patient {
  return {
    id: raw.id,
    ownerId: raw.owner_id || raw.ownerId || '',
    name: raw.name || '',
    species: raw.species || 'CANINO',
    breed: raw.breed || '',
    sex: raw.sex || 'MACHO',
    reproductiveStatus: raw.reproductive_status || raw.reproductiveStatus || 'ENTERO',
    birthDate: raw.birth_date || raw.birthDate || '',
    calculatedAge: raw.calculated_age || raw.calculatedAge || '',
    weight: typeof raw.weight === 'number' ? raw.weight : 0,
    color: raw.color || '',
    microchip: raw.microchip || '',
    photoUrl: raw.photo_url || raw.photoUrl || '',
    clinicalRecordNumber: raw.clinical_record_number || raw.clinicalRecordNumber || '',
    status: raw.status || 'ACTIVO',
    alerts: Array.isArray(raw.alerts) ? raw.alerts : [],
    branchId: raw.branch_id || raw.branchId || 'branch-1',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

function normalizeFluidTherapy(ft: any): FluidTherapy {
  if (!ft) {
    return {
      isActive: false,
      solutionType: 'Ringer Lactato',
      volumeTotalMl: 500,
      rateMlPerHour: 0,
      infusionRoute: 'IV',
      startedAt: new Date().toISOString(),
      prescribedBy: 'Dr. Diego Iván Irusta',
    };
  }
  return {
    isActive: typeof ft.isActive === 'boolean' ? ft.isActive : !!ft.is_active,
    solutionType: ft.solutionType || ft.solution_type || ft.solution || 'Ringer Lactato',
    volumeTotalMl: typeof ft.volumeTotalMl === 'number' ? ft.volumeTotalMl : (typeof ft.volume_total_ml === 'number' ? ft.volume_total_ml : 500),
    rateMlPerHour: typeof ft.rateMlPerHour === 'number' ? ft.rateMlPerHour : (typeof ft.rate_ml_per_hour === 'number' ? ft.rate_ml_per_hour : 0),
    dropsPerMinute: ft.dropsPerMinute || ft.drops_per_minute,
    infusionRoute: ft.infusionRoute || ft.infusion_route || 'IV',
    startedAt: ft.startedAt || ft.started_at || new Date().toISOString(),
    pumpNumber: ft.pumpNumber || ft.pump_number || 'Bomba 01',
    additives: ft.additives,
    prescribedBy: ft.prescribedBy || ft.prescribed_by || 'Dr. Diego Iván Irusta',
  };
}

function normalizeHospitalization(raw: any): Hospitalization {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    vetInChargeId: raw.vet_in_charge_id || raw.vetInChargeId || '',
    vetInChargeName: raw.vet_in_charge_name || raw.vetInChargeName || 'Dr. Diego Iván Irusta',
    sector: raw.sector || 'UCI',
    kennelNumber: raw.kennel_number || raw.kennelNumber || '01',
    admittedAt: raw.admitted_at || raw.admittedAt || new Date().toISOString(),
    dischargedAt: raw.discharged_at || raw.dischargedAt,
    primaryDiagnosis: raw.primary_diagnosis || raw.primaryDiagnosis || 'Evaluación clínica',
    priority: raw.priority || 'NORMAL',
    fluidTherapy: normalizeFluidTherapy(raw.fluid_therapy || raw.fluidTherapy),
    feeding: raw.feeding || { dietType: 'NPO_AYUNO', foodBrand: 'N/A', amountGramsOrMl: 0, frequency: 'N/A', tolerance: 'EXCELENTE' },
    eliminations: Array.isArray(raw.eliminations) ? raw.eliminations : [],
    medications: Array.isArray(raw.medications) ? raw.medications : [],
    tasks: Array.isArray(raw.tasks) ? raw.tasks : [],
    hourlySheet: Array.isArray(raw.hourly_sheet || raw.hourlySheet) ? (raw.hourly_sheet || raw.hourlySheet) : [],
    intervalHours: raw.interval_hours || raw.intervalHours || 2,
    nextVitalsTime: raw.next_vitals_time || raw.nextVitalsTime || '14:00',
    status: raw.status || 'ACTIVA',
    dischargeSummary: raw.discharge_summary || raw.dischargeSummary,
    branchId: raw.branch_id || raw.branchId || 'branch-1',
  };
}

function normalizeConsultation(raw: any): Consultation {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    vetId: raw.vet_id || raw.vetId || '',
    vetName: raw.vet_name || raw.vetName || 'Dr. Diego Iván Irusta',
    vetLicense: raw.vet_license || raw.vetLicense,
    branchId: raw.branch_id || raw.branchId || 'branch-1',
    dateTime: raw.date_time || raw.dateTime || new Date().toISOString(),
    reason: raw.reason || '',
    anamnesis: raw.anamnesis || '',
    vitalSigns: raw.vital_signs || raw.vitalSigns || {},
    physicalExam: raw.physical_exam || raw.physicalExam || {},
    soap: raw.soap || { subjective: '', objective: '', assessment: '', plan: '' },
    diagnoses: Array.isArray(raw.diagnoses) ? raw.diagnoses : [],
    differentialDiagnoses: Array.isArray(raw.differential_diagnoses || raw.differentialDiagnoses) ? (raw.differential_diagnoses || raw.differentialDiagnoses) : [],
    treatmentPlan: raw.treatment_plan || raw.treatmentPlan || '',
    prescriptions: Array.isArray(raw.prescriptions) ? raw.prescriptions : [],
    orderedStudies: Array.isArray(raw.ordered_studies || raw.orderedStudies) ? (raw.ordered_studies || raw.orderedStudies) : [],
    requiresHospitalization: !!raw.requires_hospitalization || !!raw.requiresHospitalization,
    status: raw.status || 'FINALIZADA',
    amendments: Array.isArray(raw.amendments) ? raw.amendments : [],
  };
}

function normalizeSurgery(raw: any): SurgeryRecord {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    procedureName: raw.procedure_name || raw.procedureName || '',
    surgeonName: raw.surgeon_name || raw.surgeonName || 'Dr. Diego Iván Irusta',
    assistantName: raw.assistant_name || raw.assistantName,
    anesthetistName: raw.anesthetist_name || raw.anesthetistName || 'Dr. Anestesista',
    branchId: raw.branch_id || raw.branchId || 'branch-1',
    date: raw.date || new Date().toISOString().split('T')[0],
    startTime: raw.start_time || raw.startTime || '09:00',
    endTime: raw.end_time || raw.endTime,
    preOpAssessment: raw.pre_op_assessment || raw.preOpAssessment || {
      asaGrade: raw.asa_grade || 'II',
      fastingHours: 8,
      labReviewed: true,
      risksAlerts: '',
    },
    anesthesiaProtocol: raw.anesthesia_protocol || raw.anesthesiaProtocol || {
      premedication: '',
      induction: '',
      maintenance: '',
      analgesia: '',
      monitoringPoints: [],
      milestones: { inductionTime: '', intubationTime: '', incisionTime: '', sutureTime: '', extubationTime: '', recoveryTime: '' },
    },
    surgicalTechnique: raw.surgical_technique || raw.surgicalTechnique || '',
    findings: raw.findings || '',
    complications: raw.complications,
    materialsUsed: Array.isArray(raw.materials_used || raw.materialsUsed) ? (raw.materials_used || raw.materialsUsed) : [],
    postOpOrders: raw.post_op_orders || raw.postOpOrders || { analgesia: '', antibiotics: '', monitoringInstructions: '', fluidTherapy: '' },
    status: raw.status || 'PROGRAMADA',
  };
}

function normalizeInvoice(raw: any): Invoice {
  return {
    id: raw.id,
    invoiceNumber: raw.invoice_number || raw.invoiceNumber || 'REC-0001-00000001',
    type: raw.type === 'PRESUPUESTO' ? 'PRESUPUESTO' : (raw.type === 'COMPROBANTE_INTERNO' ? 'COMPROBANTE_INTERNO' : 'RECIBO_X'),
    pointOfSale: raw.point_of_sale || raw.pointOfSale || 1,
    date: raw.date || raw.date_time || raw.dateTime || new Date().toISOString().split('T')[0],
    ownerId: raw.owner_id || raw.ownerId || '',
    patientId: raw.patient_id || raw.patientId,
    customerName: raw.customer_name || raw.customerName || 'Consumidor Final',
    customerDniCuit: raw.customer_dni_cuit || raw.customerDniCuit || '0',
    customerTaxCondition: raw.customer_tax_condition || raw.customerTaxCondition || 'Consumidor Final',
    items: Array.isArray(raw.items) ? raw.items : [],
    totalAmount: typeof raw.total_amount === 'number' ? raw.total_amount : (typeof raw.totalAmount === 'number' ? raw.totalAmount : 0),
    paymentMethod: raw.payment_method || raw.paymentMethod || 'TRANSFERENCIA',
    status: raw.status === 'ANULADO' ? 'ANULADO' : 'EMITIDO',
    voidedAt: raw.voided_at || raw.voidedAt || undefined,
    voidedBy: raw.voided_by || raw.voidedBy || undefined,
    voidReason: raw.void_reason || raw.voidReason || undefined,
    isFiscal: false,
    branchId: raw.branch_id || raw.branchId || 'branch-1',
  };
}

function normalizeVitalSigns(raw: any): VitalSigns {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    recordedAt: raw.recorded_at || raw.recordedAt || new Date().toISOString(),
    recordedBy: raw.recorded_by || raw.recordedBy || 'Dr. Diego Iván Irusta',
    temperature: typeof raw.temperature === 'number' ? raw.temperature : (raw.temperature ? parseFloat(raw.temperature) : undefined),
    heartRate: typeof raw.heart_rate === 'number' ? raw.heart_rate : (typeof raw.heartRate === 'number' ? raw.heartRate : undefined),
    respiratoryRate: typeof raw.respiratory_rate === 'number' ? raw.respiratory_rate : (typeof raw.respiratoryRate === 'number' ? raw.respiratoryRate : undefined),
    systolicBP: typeof raw.systolic_bp === 'number' ? raw.systolic_bp : (typeof raw.systolicBP === 'number' ? raw.systolicBP : undefined),
    diastolicBP: typeof raw.diastolic_bp === 'number' ? raw.diastolic_bp : (typeof raw.diastolicBP === 'number' ? raw.diastolicBP : undefined),
    meanBP: typeof raw.mean_bp === 'number' ? raw.mean_bp : (typeof raw.meanBP === 'number' ? raw.meanBP : undefined),
    capillaryRefillTime: typeof raw.capillary_refill_time_seconds === 'number' ? raw.capillary_refill_time_seconds : (typeof raw.capillaryRefillTime === 'number' ? raw.capillaryRefillTime : undefined),
    mucousMembranes: raw.mucous_membranes || raw.mucousMembranes,
    weight: typeof raw.weight === 'number' ? raw.weight : (raw.weight ? parseFloat(raw.weight) : undefined),
    bloodGlucose: typeof raw.glycemia === 'number' ? raw.glycemia : (typeof raw.blood_glucose === 'number' ? raw.blood_glucose : (typeof raw.bloodGlucose === 'number' ? raw.bloodGlucose : undefined)),
    spo2: typeof raw.oxygen_saturation === 'number' ? raw.oxygen_saturation : (typeof raw.spo2 === 'number' ? raw.spo2 : undefined),
    painScale: typeof raw.pain_score_glasgow === 'number' ? raw.pain_score_glasgow : (typeof raw.painScale === 'number' ? raw.painScale : undefined),
    notes: raw.notes || '',
  };
}

function normalizeProblem(raw: any): PatientProblem {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    title: raw.title || '',
    description: raw.description || '',
    status: raw.status || 'ACTIVO',
    onsetDate: raw.onset_date || raw.onsetDate || new Date().toISOString().split('T')[0],
    resolvedDate: raw.resolved_date || raw.resolvedDate,
    vetName: raw.vet_name || raw.vetName || 'Dr. Diego Iván Irusta',
  };
}

function normalizeLabOrder(raw: any): LaboratoryOrder {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    orderNumber: raw.order_number || raw.orderNumber || 'LAB-001',
    testType: raw.test_type || raw.testType || 'HEMOGRAMA_COMPLETO',
    requestedBy: raw.requested_by || raw.requestedBy || 'Dr. Diego Iván Irusta',
    requestedAt: raw.requested_at || raw.requestedAt || new Date().toISOString(),
    resultsReadyAt: raw.results_ready_at || raw.resultsReadyAt,
    status: raw.status || 'SOLICITADO',
    results: Array.isArray(raw.results) ? raw.results : [],
    diagnosticReport: raw.conclusions || raw.diagnosticReport || raw.diagnostic_report || '',
    conclusions: raw.conclusions || '',
  };
}

function normalizeImaging(raw: any): ImagingStudy {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    studyNumber: raw.study_number || raw.studyNumber || 'IMG-001',
    modality: raw.modality || 'RADIOGRAFIA',
    region: raw.region || '',
    requestedBy: raw.requested_by || raw.requestedBy || 'Dr. Diego Iván Irusta',
    performedBy: raw.reported_by || raw.performedBy || 'Dr. Especialista',
    date: raw.date || new Date().toISOString(),
    report: raw.findings || raw.report || '',
    conclusion: raw.diagnosis || raw.conclusion || '',
    images: Array.isArray(raw.image_urls) ? raw.image_urls.map((url: string, i: number) => ({ id: `img-${i}`, url, caption: `Captura ${i + 1}` })) : (Array.isArray(raw.images) ? raw.images : []),
    status: raw.status || 'INFORMADO',
  };
}

function normalizeVaccination(raw: any): VaccinationRecord {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    vaccineName: raw.vaccine_name || raw.vaccineName || 'Vacuna',
    manufacturer: raw.manufacturer || 'Laboratorio',
    batchNumber: raw.batch_number || raw.batchNumber || 'LOTE-001',
    expirationDate: raw.expiration_date || raw.expirationDate || new Date().toISOString().split('T')[0],
    administeredDate: raw.administered_date || raw.administeredDate || new Date().toISOString().split('T')[0],
    nextDueDate: raw.next_due_date || raw.nextDueDate || new Date().toISOString().split('T')[0],
    administeredBy: raw.administered_by || raw.administeredBy || 'Dr. Diego Iván Irusta',
    vetLicense: raw.vet_license || raw.vetLicense || 'M.P. 502',
    certificateGenerated: !!raw.certificate_generated || !!raw.certificateGenerated,
  };
}

function normalizeProduct(raw: any): Product {
  return {
    id: raw.id,
    code: raw.code || 'PRD-001',
    commercialName: raw.commercial_name || raw.commercialName || 'Producto',
    activeIngredient: raw.generic_name || raw.activeIngredient || '',
    category: raw.category || 'MEDICAMENTO',
    presentation: raw.presentation || '',
    concentration: raw.concentration || '',
    laboratory: raw.laboratory || 'Laboratorio',
    currentStock: typeof raw.current_stock === 'number' ? raw.current_stock : (typeof raw.currentStock === 'number' ? raw.currentStock : 0),
    minStock: typeof raw.min_stock === 'number' ? raw.min_stock : (typeof raw.minStock === 'number' ? raw.minStock : 5),
    costPrice: typeof raw.cost_price === 'number' ? raw.cost_price : (typeof raw.costPrice === 'number' ? raw.costPrice : 0),
    salePrice: typeof raw.sale_price === 'number' ? raw.sale_price : (typeof raw.salePrice === 'number' ? raw.salePrice : 0),
    currentBatch: raw.current_batch || raw.currentBatch || 'LOTE-1',
    expirationDate: raw.expiration_date || raw.expirationDate || new Date().toISOString().split('T')[0],
    supplier: raw.supplier || 'Droguería',
    requiresPrescription: !!raw.requires_prescription || !!raw.requiresPrescription,
    branchId: raw.branch_id || raw.branchId || 'branch-1',
  };
}

function normalizeAppointment(raw: any): Appointment {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    ownerId: raw.owner_id || raw.ownerId || '',
    vetId: raw.vet_id || raw.vetId || 'usr-1',
    vetName: raw.vet_name || raw.vetName || 'Dr. Diego Iván Irusta',
    branchId: raw.branch_id || raw.branchId || 'branch-1',
    date: raw.date ? String(raw.date).split('T')[0] : new Date().toISOString().split('T')[0],
    time: raw.time || '10:00',
    durationMinutes: raw.duration_minutes || raw.durationMinutes || 30,
    type: raw.type || 'CONSULTA_GENERAL',
    reason: raw.reason || '',
    status: raw.status || 'RESERVADO',
    notes: raw.notes || '',
  };
}

function normalizeTriage(raw: any): TriageEntry {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    ownerId: raw.owner_id || raw.ownerId || '',
    arrivedAt: raw.arrived_at || raw.arrivedAt || new Date().toISOString(),
    waitTimeMinutes: raw.wait_time_minutes || raw.waitTimeMinutes || 0,
    priority: raw.priority || 'NORMAL',
    chiefComplaint: raw.chief_complaint || raw.chiefComplaint || '',
    assignedVetId: raw.assigned_vet_id || raw.assignedVetId,
    assignedRoom: raw.assigned_consulting_room || raw.assignedRoom,
    status: raw.status || 'EN_ESPERA',
  };
}


function normalizePrescription(raw: any): Prescription {
  return {
    id: raw.id,
    prescriptionNumber: raw.prescription_number || raw.prescriptionNumber || 'RX-001',
    prescriptionType: raw.prescription_type || raw.prescriptionType || 'RECETA_COMUN',
    patientId: raw.patient_id || raw.patientId || '',
    ownerId: raw.owner_id || raw.ownerId || '',
    vetId: raw.vet_id || raw.vetId || '',
    vetName: raw.vet_name || raw.vetName || 'Dr. Diego Iván Irusta',
    vetLicense: raw.vet_license || raw.vetLicense || 'M.P. 502',
    date: raw.date || new Date().toISOString().split('T')[0],
    diagnosis: raw.diagnosis,
    items: Array.isArray(raw.items) ? raw.items : [],
    notes: raw.notes,
    isDispensed: typeof raw.is_dispensed === 'boolean' ? raw.is_dispensed : !!raw.isDispensed,
    dispensedAt: raw.dispensed_at || raw.dispensedAt,
    digitalSignatureHash: raw.digital_signature_hash || raw.digitalSignatureHash,
  };
}

function normalizeDocument(raw: any): ClinicalDocument {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    ownerId: raw.owner_id || raw.ownerId || '',
    type: raw.type || 'CONSENTIMIENTO_INTERNACION',
    title: raw.title || 'Documento Clínico',
    content: raw.content || '',
    vetName: raw.vet_name || raw.vetName || 'Dr. Diego Iván Irusta',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    signedByOwnerName: raw.signed_by || raw.signedByOwnerName,
    isSigned: raw.status === 'FIRMADO' || !!raw.isSigned,
  };
}

/**
 * Fetch full initial hospital dataset from Supabase Cloud with comprehensive normalization
 */
export async function fetchInitialDataFromSupabase() {
  try {
    const isConn = await checkSupabaseConnection();
    if (!isConn.connected) return null;

    const [
      ownersRes,
      patientsRes,
      vitalsRes,
      problemsRes,
      consultationsRes,
      hospitalizationsRes,
      surgeriesRes,
      productsRes,
      invoicesRes,
      documentsRes,
      auditLogsRes,
      appointmentsRes,
      triageRes,
      labsRes,
      imagingRes,
      vaccinationsRes,
      estimatesRes,
      prescriptionsRes,
      encountersRes,
      proceduresRes,
      consumptionsRes,
      financialRes,
      debtsRes,
    ] = await Promise.all([
      supabase.from('owners').select('*'),
      supabase.from('patients').select('*'),
      supabase.from('vital_signs').select('*'),
      supabase.from('patient_problems').select('*'),
      supabase.from('consultations').select('*'),
      supabase.from('hospitalizations').select('*'),
      supabase.from('surgeries').select('*'),
      supabase.from('products').select('*'),
      supabase.from('invoices').select('*'),
      supabase.from('clinical_documents').select('*'),
      supabase.from('audit_logs').select('*').order('timestamp', { ascending: false }).limit(100),
      supabase.from('appointments').select('*'),
      supabase.from('triage_entries').select('*'),
      supabase.from('laboratory_orders').select('*'),
      supabase.from('imaging_studies').select('*'),
      supabase.from('vaccinations').select('*'),
      supabase.from('estimates').select('*'),
      supabase.from('prescriptions').select('*'),
      supabase.from('encounters').select('*'),
      supabase.from('procedures').select('*'),
      supabase.from('encounter_consumptions').select('*'),
      supabase.from('financial_transactions').select('*'),
      supabase.from('account_debts').select('*'),
    ]);

    return {
      owners: Array.isArray(ownersRes.data) ? ownersRes.data.map(normalizeOwner) : [],
      patients: Array.isArray(patientsRes.data) ? patientsRes.data.map(normalizePatient) : [],
      vitals: Array.isArray(vitalsRes.data) ? vitalsRes.data.map(normalizeVitalSigns) : [],
      problems: Array.isArray(problemsRes.data) ? problemsRes.data.map(normalizeProblem) : [],
      consultations: Array.isArray(consultationsRes.data) ? consultationsRes.data.map(normalizeConsultation) : [],
      hospitalizations: Array.isArray(hospitalizationsRes.data) ? hospitalizationsRes.data.map(normalizeHospitalization) : [],
      surgeries: Array.isArray(surgeriesRes.data) ? surgeriesRes.data.map(normalizeSurgery) : [],
      products: Array.isArray(productsRes.data) ? productsRes.data.map(normalizeProduct) : [],
      invoices: Array.isArray(invoicesRes.data) ? invoicesRes.data.map(normalizeInvoice) : [],
      documents: Array.isArray(documentsRes.data) ? documentsRes.data.map(normalizeDocument) : [],
      auditLogs: Array.isArray(auditLogsRes.data) ? (auditLogsRes.data as AuditLog[]) : [],
      appointments: Array.isArray(appointmentsRes.data) ? appointmentsRes.data.map(normalizeAppointment) : [],
      triageList: Array.isArray(triageRes.data) ? triageRes.data.map(normalizeTriage) : [],
      labOrders: Array.isArray(labsRes.data) ? labsRes.data.map(normalizeLabOrder) : [],
      imagingStudies: Array.isArray(imagingRes.data) ? imagingRes.data.map(normalizeImaging) : [],
      vaccinations: Array.isArray(vaccinationsRes.data) ? vaccinationsRes.data.map(normalizeVaccination) : [],
      estimates: Array.isArray(estimatesRes.data) ? (estimatesRes.data as Estimate[]) : [],
      prescriptions: Array.isArray(prescriptionsRes.data) ? prescriptionsRes.data.map(normalizePrescription) : [],
      encounters: Array.isArray(encountersRes.data) ? encountersRes.data.map(normalizeEncounter) : [],
      procedures: Array.isArray(proceduresRes.data) ? proceduresRes.data.map(normalizeProcedure) : [],
      encounterConsumptions: Array.isArray(consumptionsRes.data) ? consumptionsRes.data.map(normalizeEncounterConsumption) : [],
      financialMovements: Array.isArray(financialRes.data) ? financialRes.data.map(normalizeFinancialMovement) : [],
      accountDebts: Array.isArray(debtsRes.data) ? debtsRes.data.map(normalizeAccountDebt) : [],
    };
  } catch (error) {
    console.warn('Supabase fetch notice:', error);
    return null;
  }
}
export async function seedInitialDataToSupabase(data: {
  owners?: Owner[];
  patients?: Patient[];
  vitals?: VitalSigns[];
  problems?: PatientProblem[];
  hospitalizations?: Hospitalization[];
  products?: Product[];
}) {
  try {
    // Only seed base product catalog if empty, never fake clinical patients
    if (data.products && data.products.length > 0) {
      for (const prod of data.products) await syncProductToSupabase(prod);
    }
  } catch (err) {
    console.warn('Silent fallback: Product catalog sync.');
  }
}

/**
 * Sync single patient to Supabase
 */
export async function syncPatientToSupabase(patient: Patient) {
  try {
    const { error } = await supabase.from('patients').upsert({
      id: patient.id,
      owner_id: patient.ownerId,
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      sex: patient.sex,
      reproductive_status: patient.reproductiveStatus,
      birth_date: patient.birthDate,
      calculated_age: patient.calculatedAge,
      weight: patient.weight,
      color: patient.color,
      microchip: patient.microchip,
      photo_url: patient.photoUrl,
      clinical_record_number: patient.clinicalRecordNumber,
      status: patient.status,
      alerts: patient.alerts,
    });
    if (error) console.error('Error syncing patient to Supabase:', error);
  } catch (err) {
    addToSyncQueue('patient', arguments[0], 'Conexión offline o fallo de red temporal');
  }
}

/**
 * Sync consultation to Supabase
 */
export async function syncConsultationToSupabase(cons: Consultation) {
  try {
    const { error } = await supabase.from('consultations').upsert({
      id: cons.id,
      patient_id: cons.patientId,
      vet_id: cons.vetId,
      vet_name: cons.vetName,
      branch_id: cons.branchId,
      date_time: cons.dateTime,
      reason: cons.reason,
      anamnesis: cons.anamnesis,
      soap: cons.soap,
      physical_exam: cons.physicalExam,
      diagnoses: cons.diagnoses,
      prescriptions: cons.prescriptions,
      requires_hospitalization: cons.requiresHospitalization,
    });
    if (error) console.error('Error syncing consultation to Supabase:', error);
  } catch (err) {
    addToSyncQueue('consultation', arguments[0], 'Conexión offline o fallo de red temporal');
  }
}

/**
 * Sync hospitalization to Supabase
 */
export async function syncHospitalizationToSupabase(hosp: Hospitalization) {
  try {
    const { error } = await supabase.from('hospitalizations').upsert({
      id: hosp.id,
      patient_id: hosp.patientId,
      vet_in_charge_id: hosp.vetInChargeId,
      vet_in_charge_name: hosp.vetInChargeName,
      sector: hosp.sector,
      kennel_number: hosp.kennelNumber,
      admitted_at: hosp.admittedAt,
      discharged_at: hosp.dischargedAt,
      primary_diagnosis: hosp.primaryDiagnosis,
      priority: hosp.priority,
      fluid_therapy: hosp.fluidTherapy,
      feeding: hosp.feeding,
      eliminations: hosp.eliminations,
      medications: hosp.medications,
      tasks: hosp.tasks,
      hourly_sheet: hosp.hourlySheet,
      interval_hours: hosp.intervalHours,
      next_vitals_time: hosp.nextVitalsTime,
      status: hosp.status,
      discharge_summary: hosp.dischargeSummary,
      branch_id: hosp.branchId,
    });
    if (error) console.error('Error syncing hospitalization to Supabase:', error);
  } catch (err) {
    addToSyncQueue('hospitalization', arguments[0], 'Conexión offline o fallo de red temporal');
  }
}

/**
 * Sync surgery to Supabase
 */
export async function syncSurgeryToSupabase(surg: SurgeryRecord) {
  try {
    const { error } = await supabase.from('surgeries').upsert({
      id: surg.id,
      patient_id: surg.patientId,
      procedure_name: surg.procedureName,
      surgeon_name: surg.surgeonName || 'Dr. Diego Iván Irusta',
      anesthetist_name: surg.anesthetistName,
      date: surg.date,
      start_time: surg.startTime,
      end_time: surg.endTime,
      asa_grade: surg.preOpAssessment?.asaGrade || (surg as any).asaGrade || 'II',
      status: surg.status,
      pre_op_assessment: surg.preOpAssessment,
      anesthesia_protocol: surg.anesthesiaProtocol,
      surgical_technique: surg.surgicalTechnique,
    });
    if (error) console.error('Error syncing surgery to Supabase:', error);
  } catch (err) {
    addToSyncQueue('surgery', arguments[0], 'Conexión offline o fallo de red temporal');
  }
}

/**
 * Sync invoice to Supabase
 */
export async function syncInvoiceToSupabase(inv: Invoice) {
  try {
    const { error } = await supabase.from('invoices').upsert({
      id: inv.id,
      patient_id: inv.patientId,
      owner_id: inv.ownerId,
      invoice_number: inv.invoiceNumber,
      type: inv.type,
      point_of_sale: inv.pointOfSale,
      date: inv.date,
      customer_name: inv.customerName,
      customer_dni_cuit: inv.customerDniCuit,
      customer_tax_condition: inv.customerTaxCondition,
      items: inv.items,
      total_amount: inv.totalAmount,
      payment_method: inv.paymentMethod,
      branch_id: inv.branchId,
    });
    if (error) console.error('Error syncing internal receipt to Supabase:', error);
  } catch (err) {
    console.error('Offline or connection error syncing internal receipt:', err);
  }
}

/**
 * Sync single vital signs entry to Supabase
 */
export async function syncVitalSignsToSupabase(vital: VitalSigns) {
  const { error } = await supabase.from('vital_signs').upsert({
    id: vital.id,
    patient_id: vital.patientId,
    recorded_at: vital.recordedAt,
    temperature: vital.temperature ?? null,
    heart_rate: vital.heartRate ?? null,
    respiratory_rate: vital.respiratoryRate ?? null,
    systolic_bp: vital.systolicBP ?? null,
    diastolic_bp: vital.diastolicBP ?? null,
    mean_bp: vital.meanBP ?? null,
    capillary_refill_time_seconds: vital.capillaryRefillTime ?? null,
    mucous_membranes: vital.mucousMembranes ?? null,
    weight: vital.weight ?? null,
    glycemia: vital.bloodGlucose ?? null,
    oxygen_saturation: vital.spo2 ?? null,
    pain_score_glasgow: vital.painScale ?? null,
    recorded_by: vital.recordedBy ?? null,
    notes: vital.notes ?? null,
  });
  if (error) {
    console.error('Error syncing vital signs to Supabase:', error);
    throw new Error(error.message || 'Error al persistir signos vitales en el servidor.');
  }
}

/**
 * Sync single owner to Supabase
 */
export async function syncOwnerToSupabase(owner: Owner) {
  try {
    const { error } = await supabase.from('owners').upsert({
      id: owner.id,
      first_name: owner.firstName,
      last_name: owner.lastName,
      dni: owner.dni,
      phone: owner.phone,
      whatsapp: owner.whatsapp || owner.phone,
      email: owner.email,
      address: owner.address,
      city: owner.city,
      emergency_contact: owner.secondaryContactPhone || owner.secondaryContactName || '',
      notes: owner.notes,
      balance: owner.balance,
      created_at: owner.createdAt,
    });
    if (error) console.error('Error syncing owner to Supabase:', error);
  } catch (err) {
    addToSyncQueue('owner', arguments[0], 'Conexión offline o fallo de red temporal');
  }
}

/**
 * Sync single problem to Supabase
 */
export async function syncProblemToSupabase(problem: PatientProblem) {
  try {
    const { error } = await supabase.from('patient_problems').upsert({
      id: problem.id,
      patient_id: problem.patientId,
      title: problem.title,
      description: problem.description,
      status: problem.status,
      onset_date: problem.onsetDate,
      resolved_date: problem.resolvedDate,
      vet_name: problem.vetName,
      created_at: problem.onsetDate || new Date().toISOString(),
    });
    if (error) console.error('Error syncing problem to Supabase:', error);
  } catch (err) {
    addToSyncQueue('problem', arguments[0], 'Conexión offline o fallo de red temporal');
  }
}

/**
 * Sync single lab order to Supabase
 */
export async function syncLabOrderToSupabase(order: LaboratoryOrder) {
  try {
    const { error } = await supabase.from('laboratory_orders').upsert({
      id: order.id,
      patient_id: order.patientId,
      order_number: order.orderNumber,
      test_type: order.testType,
      requested_by: order.requestedBy,
      requested_at: order.requestedAt,
      results_ready_at: order.resultsReadyAt,
      status: order.status,
      results: order.results,
      conclusions: order.diagnosticReport || order.conclusions,
    });
    if (error) console.error('Error syncing lab order to Supabase:', error);
  } catch (err) {
    console.warn('Offline: lab order cached locally');
  }
}

/**
 * Sync single imaging study to Supabase
 */
export async function syncImagingToSupabase(study: ImagingStudy) {
  try {
    const { error } = await supabase.from('imaging_studies').upsert({
      id: study.id,
      patient_id: study.patientId,
      study_number: study.studyNumber,
      modality: study.modality,
      region: study.region,
      date: study.date,
      image_urls: study.images?.map((img) => img.url) || [],
      findings: study.report,
      diagnosis: study.conclusion,
      status: study.status,
      reported_by: study.performedBy || study.requestedBy,
    });
    if (error) console.error('Error syncing imaging study to Supabase:', error);
  } catch (err) {
    console.warn('Offline: imaging study cached locally');
  }
}

/**
 * Sync single vaccination to Supabase
 */
export async function syncVaccinationToSupabase(vac: VaccinationRecord) {
  try {
    const { error } = await supabase.from('vaccinations').upsert({
      id: vac.id,
      patient_id: vac.patientId,
      vaccine_name: vac.vaccineName,
      batch_number: vac.batchNumber,
      manufacturer: vac.manufacturer,
      expiration_date: vac.expirationDate,
      administered_date: vac.administeredDate,
      next_due_date: vac.nextDueDate,
      administered_by: vac.administeredBy,
      vet_license: vac.vetLicense,
      certificate_generated: vac.certificateGenerated,
      created_at: vac.administeredDate || new Date().toISOString(),
    });
    if (error) console.error('Error syncing vaccination to Supabase:', error);
  } catch (err) {
    addToSyncQueue('vaccination', arguments[0], 'Conexión offline o fallo de red temporal');
  }
}

/**
 * Sync single product to Supabase
 */
export async function syncProductToSupabase(prod: Product) {
  try {
    const payload: any = {
      id: prod.id,
      code: prod.code,
      commercial_name: prod.commercialName,
      generic_name: prod.activeIngredient,
      category: prod.category,
      presentation: prod.presentation,
      current_stock: prod.currentStock,
      min_stock: prod.minStock,
      unit: 'UNID',
      cost_price: prod.costPrice,
      sale_price: prod.salePrice,
      current_batch: prod.currentBatch,
      expiration_date: prod.expirationDate,
      requires_prescription: prod.requiresPrescription,
    };

    // Attach branch_id only if valid UUID/ID
    if (prod.branchId && !prod.branchId.startsWith('branch-')) {
      payload.branch_id = prod.branchId;
    }

    const { error } = await supabase.from('products').upsert(payload);
    if (error && error.code !== '23503') {
      console.warn('Sync notice (products):', error.message);
    }
  } catch (err) {
    addToSyncQueue('product', prod, 'Conexión offline o sincronización diferida');
  }
}

/**
 * Sync single appointment to Supabase
 */
export async function syncAppointmentToSupabase(apt: Appointment) {
  try {
    // Check if branch_id is valid, otherwise omit to avoid FK violation
    const payload: any = {
      id: apt.id,
      patient_id: apt.patientId || null,
      owner_id: apt.ownerId || null,
      vet_id: apt.vetId || null,
      vet_name: apt.vetName || 'Dr. Diego Iván Irusta',
      date: apt.date || new Date().toISOString().split('T')[0],
      time: apt.time || '10:00',
      duration_minutes: apt.durationMinutes || 30,
      type: apt.type || 'CONSULTA_GENERAL',
      reason: apt.reason || 'Consulta médica general',
      status: apt.status || 'RESERVADO',
    };
    
    // Only attach foreign keys if they are valid IDs
    if (apt.branchId && !apt.branchId.startsWith('branch-')) {
      payload.branch_id = apt.branchId;
    }

    const { error } = await supabase.from('appointments').upsert(payload);
    if (error) {
      // Fallback try without optional foreign keys if constraint fails
      const fallbackPayload = {
        id: apt.id,
        vet_name: apt.vetName || 'Dr. Diego Iván Irusta',
        date: apt.date || new Date().toISOString().split('T')[0],
        time: apt.time || '10:00',
        duration_minutes: apt.durationMinutes || 30,
        type: apt.type || 'CONSULTA_GENERAL',
        reason: apt.reason || 'Consulta médica general',
        status: apt.status || 'RESERVADO',
      };
      await supabase.from('appointments').upsert(fallbackPayload);
    }
  } catch (err) {
    addToSyncQueue('appointment', apt, 'Conexión offline o fallo de red temporal');
  }
}

/**
 * Sync single triage entry to Supabase
 */
export async function syncTriageToSupabase(triage: TriageEntry) {
  try {
    const { error } = await supabase.from('triage_entries').upsert({
      id: triage.id,
      patient_id: triage.patientId,
      chief_complaint: triage.chiefComplaint,
      priority: triage.priority,
      arrived_at: triage.arrivedAt,
      assigned_consulting_room: triage.assignedRoom,
      assigned_vet_id: triage.assignedVetId,
      status: triage.status,
    });
    if (error) console.error('Error syncing triage to Supabase:', error);
  } catch (err) {
    addToSyncQueue('triage', arguments[0], 'Conexión offline o fallo de red temporal');
  }
}

/**
 * Sync single document to Supabase
 */
export async function syncDocumentToSupabase(doc: ClinicalDocument) {
  try {
    const { error } = await supabase.from('clinical_documents').upsert({
      id: doc.id,
      patient_id: doc.patientId,
      owner_id: doc.ownerId,
      type: doc.type,
      title: doc.title,
      content: doc.content,
      vet_name: doc.vetName || 'Dr. Diego Iván Irusta',
      created_at: doc.createdAt,
    });
    if (error) console.error('Error syncing document to Supabase:', error);
  } catch (err) {
    addToSyncQueue('document', arguments[0], 'Conexión offline o fallo de red temporal');
  }
}

/**
 * Sync single clinical evolution note to Supabase (stored under clinical_documents)
 */
export async function syncClinicalEvolutionToSupabase(evo: any) {
  try {
    let cleanContent = '';
    if (typeof evo.content === 'string' && evo.content.trim().length > 0 && !evo.content.startsWith('{')) {
      cleanContent = evo.content;
    } else {
      cleanContent = `EVOLUCIÓN MÉDICA INTEGRAL\nSector: ${evo.sector || 'UCI / Guardia'}\nTurno: ${evo.shift || 'General'}\nProfesional: ${evo.authorName || 'Dr. Diego Iván Irusta'} (${evo.authorLicense || 'M.P. 502'})\n\nEVALUACIÓN MÉDICA:\n${evo.assessment || 'Sin evaluación registrada'}\n\nPLAN TERAPÉUTICO & INDICACIONES:\n${evo.plan || 'Mantener indicaciones previas'}${evo.notes ? `\n\nOBSERVACIONES:\n${evo.notes}` : ''}`;
    }

    const { error } = await supabase.from('clinical_documents').upsert({
      id: evo.id,
      patient_id: evo.patientId,
      type: 'EVOLUCION_CLINICA',
      title: `Evolución Médica Integral - ${evo.authorName || 'Dr. Diego Iván Irusta'}`,
      content: cleanContent,
      created_at: evo.createdAt || new Date().toISOString(),
    });
    if (error) console.error('Error syncing clinical evolution to Supabase:', error);
  } catch (err) {
    console.warn('Offline: clinical evolution cached locally');
  }
}

/**
 * Sync audit log to Supabase
 */
export async function syncAuditLogToSupabase(log: AuditLog) {
  try {
    const { error } = await supabase.from('audit_logs').upsert({
      id: log.id,
      timestamp: log.timestamp,
      user_name: log.userName,
      user_role: log.userRole,
      action: log.action,
      entity: log.entity,
      entity_id: log.entityId,
      details: log.details,
      previous_value: log.previousValue,
      new_value: log.newValue,
    });
    if (error) console.error('Error syncing audit log to Supabase:', error);
  } catch (err) {
    console.warn('Offline: audit log cached locally');
  }
}


/**
 * Wipe all clinical and transactional demo records from Supabase tables
 */

/**
 * Normalizers and Sync Methods for Unified Clinical Encounters, Consumptions, and Finances
 */

export function normalizeEncounter(raw: any) {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    type: raw.type || 'AMBULATORIA',
    status: raw.status || 'EN_CURSO',
    admittedAt: raw.admitted_at || raw.admittedAt || new Date().toISOString(),
    dischargedAt: raw.discharged_at || raw.dischargedAt,
    vetInChargeId: raw.vet_in_charge_id || raw.vetInChargeId || '',
    vetInChargeName: raw.vet_in_charge_name || raw.vetInChargeName || 'Dr. Diego Iván Irusta',
    reason: raw.reason || '',
    initialDiagnosis: raw.initial_diagnosis || raw.initialDiagnosis || '',
    finalDiagnosis: raw.final_diagnosis || raw.finalDiagnosis,
    dischargeNotes: raw.discharge_notes || raw.dischargeNotes,
    dischargePrescription: raw.discharge_prescription || raw.dischargePrescription,
    followUpDate: raw.follow_up_date || raw.followUpDate,
    sector: raw.sector,
    kennelNumber: raw.kennel_number || raw.kennelNumber,
    priority: raw.priority,
    branchId: raw.branch_id || raw.branchId || 'branch-1',
  };
}

export async function syncEncounterToSupabase(enc: any) {
  try {
    const { error } = await supabase.from('encounters').upsert({
      id: enc.id,
      patient_id: enc.patientId,
      type: enc.type,
      status: enc.status,
      admitted_at: enc.admittedAt,
      discharged_at: enc.dischargedAt,
      vet_in_charge_id: enc.vetInChargeId,
      vet_in_charge_name: enc.vetInChargeName,
      reason: enc.reason,
      initial_diagnosis: enc.initialDiagnosis,
      final_diagnosis: enc.finalDiagnosis,
      discharge_notes: enc.dischargeNotes,
      discharge_prescription: enc.dischargePrescription,
      follow_up_date: enc.followUpDate,
      sector: enc.sector,
      kennel_number: enc.kennelNumber,
      priority: enc.priority,
      branch_id: enc.branchId,
    });
    if (error) console.warn('Supabase encounters table sync:', error.message);
  } catch (err) {
    addToSyncQueue('encounter', arguments[0], 'Conexión offline o fallo de red temporal');
  }
}

export function normalizeProcedure(raw: any) {
  return {
    id: raw.id,
    encounterId: raw.encounter_id || raw.encounterId,
    patientId: raw.patient_id || raw.patientId || '',
    procedureName: raw.procedure_name || raw.procedureName || '',
    category: raw.category || 'TERAPEUTICO',
    isPerformed: typeof raw.is_performed === 'boolean' ? raw.is_performed : !!raw.isPerformed,
    performedAt: raw.performed_at || raw.performedAt,
    performedBy: raw.performed_by || raw.performedBy,
    price: typeof raw.price === 'number' ? raw.price : 0,
    isBillable: typeof raw.is_billable === 'boolean' ? raw.is_billable : (typeof raw.isBillable === 'boolean' ? raw.isBillable : true),
    notes: raw.notes || '',
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

export async function syncProcedureToSupabase(proc: any) {
  try {
    const { error } = await supabase.from('procedures').upsert({
      id: proc.id,
      encounter_id: proc.encounterId,
      patient_id: proc.patientId,
      procedure_name: proc.procedureName,
      category: proc.category,
      is_performed: proc.isPerformed,
      performed_at: proc.performedAt,
      performed_by: proc.performedBy,
      price: proc.price,
      is_billable: proc.isBillable,
      notes: proc.notes,
      created_at: proc.createdAt,
    });
    if (error) console.warn('Supabase procedures table sync:', error.message);
  } catch (err) {
    addToSyncQueue('procedure', arguments[0], 'Conexión offline o fallo de red temporal');
  }
}

export function normalizeEncounterConsumption(raw: any) {
  return {
    id: raw.id,
    encounterId: raw.encounter_id || raw.encounterId || '',
    patientId: raw.patient_id || raw.patientId || '',
    sourceType: raw.source_type || raw.sourceType || 'PROCEDIMIENTO',
    sourceId: raw.source_id || raw.sourceId || '',
    code: raw.code || 'CONS',
    concept: raw.concept || '',
    quantity: typeof raw.quantity === 'number' ? raw.quantity : 1,
    unitPrice: typeof raw.unit_price === 'number' ? raw.unit_price : (typeof raw.unitPrice === 'number' ? raw.unitPrice : 0),
    subtotal: typeof raw.subtotal === 'number' ? raw.subtotal : 0,
    status: raw.status || 'CONFIRMADO',
    performedAt: raw.performed_at || raw.performedAt || new Date().toISOString(),
    performedBy: raw.performed_by || raw.performedBy || 'Personal Veterinario',
    isBilled: typeof raw.is_billed === 'boolean' ? raw.is_billed : !!raw.isBilled,
  };
}

export async function syncEncounterConsumptionToSupabase(cons: any) {
  try {
    const { error } = await supabase.from('encounter_consumptions').upsert({
      id: cons.id,
      encounter_id: cons.encounterId,
      patient_id: cons.patientId,
      source_type: cons.sourceType,
      source_id: cons.sourceId,
      code: cons.code,
      concept: cons.concept,
      quantity: cons.quantity,
      unit_price: cons.unitPrice,
      subtotal: cons.subtotal,
      status: cons.status,
      performed_at: cons.performedAt,
      performed_by: cons.performedBy,
      is_billed: cons.isBilled,
    });
    if (error) console.warn('Supabase encounter_consumptions sync:', error.message);
  } catch (err) {
    console.warn('Offline: encounter consumption cached locally');
  }
}

export function normalizeFinancialMovement(raw: any) {
  return {
    id: raw.id,
    date: raw.date || new Date().toISOString().split('T')[0],
    type: raw.type || 'INGRESO',
    category: raw.category || 'Consultas',
    concept: raw.concept || '',
    amount: typeof raw.amount === 'number' ? raw.amount : 0,
    paymentMethod: raw.payment_method || raw.paymentMethod || 'EFECTIVO',
    branchId: raw.branch_id || raw.branchId || 'branch-1',
    patientId: raw.patient_id || raw.patientId,
    ownerId: raw.owner_id || raw.ownerId,
    status: raw.status || 'CONFIRMADO',
    referenceId: raw.reference_id || raw.referenceId,
    notes: raw.notes,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

export async function syncFinancialMovementToSupabase(mov: any) {
  try {
    const { error } = await supabase.from('financial_transactions').upsert({
      id: mov.id,
      date: mov.date,
      type: mov.type,
      category: mov.category,
      concept: mov.concept,
      amount: mov.amount,
      payment_method: mov.paymentMethod,
      branch_id: mov.branchId,
      patient_id: mov.patientId,
      owner_id: mov.ownerId,
      status: mov.status,
      reference_id: mov.referenceId,
      notes: mov.notes,
      created_at: mov.createdAt,
    });
    if (error) console.warn('Supabase financial_transactions sync:', error.message);
  } catch (err) {
    console.warn('Offline: financial movement cached locally');
  }
}

export function normalizeAccountDebt(raw: any) {
  return {
    id: raw.id,
    type: raw.type || 'A_COBRAR',
    personName: raw.person_name || raw.personName || '',
    ownerId: raw.owner_id || raw.ownerId,
    concept: raw.concept || '',
    totalAmount: typeof raw.total_amount === 'number' ? raw.total_amount : (typeof raw.totalAmount === 'number' ? raw.totalAmount : 0),
    paidAmount: typeof raw.paid_amount === 'number' ? raw.paid_amount : (typeof raw.paidAmount === 'number' ? raw.paidAmount : 0),
    remainingAmount: typeof raw.remaining_amount === 'number' ? raw.remaining_amount : (typeof raw.remainingAmount === 'number' ? raw.remainingAmount : 0),
    issueDate: raw.issue_date || raw.issueDate || new Date().toISOString().split('T')[0],
    dueDate: raw.due_date || raw.dueDate || new Date().toISOString().split('T')[0],
    status: raw.status || 'PENDIENTE',
    branchId: raw.branch_id || raw.branchId || 'branch-1',
    payments: Array.isArray(raw.payments) ? raw.payments : [],
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
  };
}

export async function syncAccountDebtToSupabase(debt: any) {
  try {
    const { error } = await supabase.from('account_debts').upsert({
      id: debt.id,
      type: debt.type,
      person_name: debt.personName,
      owner_id: debt.ownerId,
      concept: debt.concept,
      total_amount: debt.totalAmount,
      paid_amount: debt.paidAmount,
      remaining_amount: debt.remainingAmount,
      issue_date: debt.issueDate,
      due_date: debt.dueDate,
      status: debt.status,
      branch_id: debt.branchId,
      payments: debt.payments,
      created_at: debt.createdAt,
    });
    if (error) console.warn('Supabase account_debts sync:', error.message);
  } catch (err) {
    console.warn('Offline: account debt cached locally');
  }
}
