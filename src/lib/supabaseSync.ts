import { supabase } from './supabase';
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
} from '../types';

/**
 * Fetch all remote data from Supabase Cloud
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
    ]);

    return {
      owners: (ownersRes.data as Owner[]) || null,
      patients: (patientsRes.data as Patient[]) || null,
      vitals: (vitalsRes.data as VitalSigns[]) || null,
      problems: (problemsRes.data as PatientProblem[]) || null,
      consultations: (consultationsRes.data as Consultation[]) || null,
      hospitalizations: (hospitalizationsRes.data as Hospitalization[]) || null,
      surgeries: (surgeriesRes.data as SurgeryRecord[]) || null,
      products: (productsRes.data as Product[]) || null,
      invoices: (invoicesRes.data as Invoice[]) || null,
      documents: (documentsRes.data as ClinicalDocument[]) || null,
      auditLogs: (auditLogsRes.data as AuditLog[]) || null,
      appointments: (appointmentsRes.data as Appointment[]) || null,
      triageList: (triageRes.data as TriageEntry[]) || null,
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
      requires_surgery: (cons as any).requiresSurgery,
      next_checkup_date: (cons as any).nextCheckupDate,
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
      surgeon_name: surgSurgeonToDb(surg.surgeonName),
      anesthetist_name: surg.anesthetistName,
      date: surg.date,
      start_time: surg.startTime,
      end_time: surg.endTime,
      estimated_duration_minutes: (surg as any).estimatedDurationMinutes,
      asa_grade: (surg as any).asaGrade || (surg as any).asaScore,
      status: surg.status,
      pre_op_assessment: surg.preOpAssessment,
      anesthesia_protocol: surg.anesthesiaProtocol,
      surgical_technique: surg.surgicalTechnique,
      intra_op_events: (surg as any).intraOpEvents,
      post_op_instructions: (surg as any).postOpInstructions || (surg as any).postOpOrders,
    });
    if (error) console.error('Error syncing surgery to Supabase:', error);
  } catch (err) {
    console.warn('Offline: surgery cached locally');
  }
}

function surgSurgeonToDb(name: string) {
  return name || 'Dr. Veterinario';
}

/**
 * Sync invoice to Supabase
 */
export async function syncInvoiceToSupabase(inv: Invoice) {
  try {
    const { error } = await supabase.from('invoices').upsert({
      id: inv.id,
      branch_id: inv.branchId,
      invoice_number: inv.invoiceNumber,
      type: inv.type,
      point_of_sale: inv.pointOfSale,
      date: inv.date,
      owner_id: inv.ownerId,
      patient_id: inv.patientId,
      customer_name: inv.customerName,
      customer_dni_cuit: inv.customerDniCuit,
      customer_tax_condition: inv.customerTaxCondition,
      items: inv.items,
      total_amount: inv.totalAmount,
      payment_method: inv.paymentMethod,
      cae_number: inv.caeNumber,
      cae_expiration_date: inv.caeExpirationDate,
    });
    if (error) console.error('Error syncing invoice to Supabase:', error);
  } catch (err) {
    console.warn('Offline: invoice cached locally');
  }
}

/**
 * Sync audit log to Supabase
 */
export async function syncAuditLogToSupabase(log: AuditLog) {
  try {
    const { error } = await supabase.from('audit_logs').insert({
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
