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
} from '../types';

export { checkSupabaseConnection };

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
    city: raw.city || 'Río Cuarto',
    province: raw.province || 'Córdoba',
    postalCode: raw.postal_code || raw.postalCode || '5800',
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
      prescribedBy: 'Dr. Veterinario',
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
    prescribedBy: ft.prescribedBy || ft.prescribed_by || 'Dr. Veterinario',
  };
}

function normalizeHospitalization(raw: any): Hospitalization {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    vetInChargeId: raw.vet_in_charge_id || raw.vetInChargeId || '',
    vetInChargeName: raw.vet_in_charge_name || raw.vetInChargeName || 'Dr. Veterinario',
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
    vetName: raw.vet_name || raw.vetName || 'Dr. Veterinario',
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
    surgeonName: raw.surgeon_name || raw.surgeonName || 'Dr. Veterinario',
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
    invoiceNumber: raw.invoice_number || raw.invoiceNumber || '0001-00000001',
    type: raw.type || 'FACTURA_B',
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
    caeNumber: raw.cae_number || raw.caeNumber || '74129841928412',
    caeExpirationDate: raw.cae_expiration_date || raw.cae_expiration || raw.caeExpirationDate || raw.caeExpiration || new Date().toISOString().split('T')[0],
    qrFiscalData: raw.qr_fiscal_data || raw.qr_code_data || raw.qrFiscalData,
    branchId: raw.branch_id || raw.branchId || 'branch-1',
  };
}

/**
 * Fetch full initial hospital dataset from Supabase Cloud with comprehensive normalization
 */
export async function fetchInitialDataFromSupabase() {
  try {
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
    ]);

    return {
      owners: Array.isArray(ownersRes.data) ? ownersRes.data.map(normalizeOwner) : null,
      patients: Array.isArray(patientsRes.data) ? patientsRes.data.map(normalizePatient) : null,
      vitals: (vitalsRes.data as VitalSigns[]) || null,
      problems: (problemsRes.data as PatientProblem[]) || null,
      consultations: Array.isArray(consultationsRes.data) ? consultationsRes.data.map(normalizeConsultation) : null,
      hospitalizations: Array.isArray(hospitalizationsRes.data) ? hospitalizationsRes.data.map(normalizeHospitalization) : null,
      surgeries: Array.isArray(surgeriesRes.data) ? surgeriesRes.data.map(normalizeSurgery) : null,
      products: (productsRes.data as Product[]) || null,
      invoices: Array.isArray(invoicesRes.data) ? invoicesRes.data.map(normalizeInvoice) : null,
      documents: (documentsRes.data as ClinicalDocument[]) || null,
      auditLogs: (auditLogsRes.data as AuditLog[]) || null,
      appointments: (appointmentsRes.data as Appointment[]) || null,
      triageList: (triageRes.data as TriageEntry[]) || null,
      labOrders: (labsRes.data as LaboratoryOrder[]) || null,
      imagingStudies: (imagingRes.data as ImagingStudy[]) || null,
      vaccinations: (vaccinationsRes.data as VaccinationRecord[]) || null,
      estimates: (estimatesRes.data as Estimate[]) || null,
    };
  } catch (error) {
    console.warn('Supabase fetch failed, continuing with local storage cache:', error);
    return null;
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
    console.warn('Offline: patient cached locally');
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
    console.warn('Offline: consultation cached locally');
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
    console.warn('Offline: hospitalization cached locally');
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
      surgeon_name: surg.surgeonName || 'Dr. Veterinario',
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
    console.warn('Offline: surgery cached locally');
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
      cae_number: inv.caeNumber,
      cae_expiration_date: inv.caeExpirationDate,
      qr_fiscal_data: inv.qrFiscalData,
      branch_id: inv.branchId,
    });
    if (error) console.error('Error syncing invoice to Supabase:', error);
  } catch (err) {
    console.warn('Offline: invoice cached locally');
  }
}

/**
 * Sync single vital signs entry to Supabase
 */
export async function syncVitalSignsToSupabase(vital: VitalSigns) {
  try {
    const { error } = await supabase.from('vital_signs').upsert({
      id: vital.id,
      patient_id: vital.patientId,
      recorded_at: vital.recordedAt,
      temperature: vital.temperature,
      heart_rate: vital.heartRate,
      respiratory_rate: vital.respiratoryRate,
      systolic_bp: vital.systolicBP,
      diastolic_bp: vital.diastolicBP,
      mean_bp: vital.meanBP,
      capillary_refill_time_seconds: vital.capillaryRefillTime,
      mucous_membranes: vital.mucousMembranes,
      weight: vital.weight,
      glycemia: vital.bloodGlucose,
      oxygen_saturation: vital.spo2,
      pain_score_glasgow: vital.painScale,
      recorded_by: vital.recordedBy,
      notes: vital.notes,
    });
    if (error) console.error('Error syncing vital signs to Supabase:', error);
  } catch (err) {
    console.warn('Offline: vital signs cached locally');
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
    console.warn('Offline: owner cached locally');
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
    console.warn('Offline: problem cached locally');
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
    console.warn('Offline: vaccination cached locally');
  }
}

/**
 * Sync single product to Supabase
 */
export async function syncProductToSupabase(prod: Product) {
  try {
    const { error } = await supabase.from('products').upsert({
      id: prod.id,
      branch_id: prod.branchId,
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
    });
    if (error) console.error('Error syncing product to Supabase:', error);
  } catch (err) {
    console.warn('Offline: product cached locally');
  }
}

/**
 * Sync single appointment to Supabase
 */
export async function syncAppointmentToSupabase(apt: Appointment) {
  try {
    const { error } = await supabase.from('appointments').upsert({
      id: apt.id,
      branch_id: apt.branchId,
      patient_id: apt.patientId,
      owner_id: apt.ownerId,
      vet_id: apt.vetId,
      date: apt.date,
      time: apt.time,
      type: apt.type,
      reason: apt.reason,
      status: apt.status,
      notes: apt.notes,
    });
    if (error) console.error('Error syncing appointment to Supabase:', error);
  } catch (err) {
    console.warn('Offline: appointment cached locally');
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
    console.warn('Offline: triage cached locally');
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
      type: doc.type,
      title: doc.title,
      content: doc.content,
      created_at: doc.createdAt,
      signed_by: doc.signedByOwnerName,
      status: doc.isSigned ? 'FIRMADO' : 'PENDIENTE',
    });
    if (error) console.error('Error syncing document to Supabase:', error);
  } catch (err) {
    console.warn('Offline: document cached locally');
  }
}

/**
 * Sync single clinical evolution note to Supabase (stored under clinical_documents)
 */
export async function syncClinicalEvolutionToSupabase(evo: any) {
  try {
    const { error } = await supabase.from('clinical_documents').upsert({
      id: evo.id,
      patient_id: evo.patientId,
      type: 'EVOLUCION_CLINICA',
      title: `Evolución Médica ${evo.type || 'CLINICA'} - ${evo.authorName || 'Profesional'}`,
      content: JSON.stringify(evo),
      status: evo.status || 'FIRMADO',
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
