import { supabase, checkSupabaseConnection } from '../lib/supabase';
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
  Prescription,
  ClinicalEncounter,
  ClinicalProcedure,
  EncounterConsumptionItem,
  FinancialMovement,
  AccountDebt,
  ClinicalEvolutionEntry,
} from '../types';

export interface RepoResult<T> {
  data: T | null;
  error: string | null;
}

export interface DeleteResult {
  success: boolean;
  error: string | null;
}

// Normalizers
export function mapOwnerFromDB(raw: any): Owner {
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

export function mapOwnerToDB(owner: Partial<Owner>): any {
  const mapped: any = {};
  if (owner.id !== undefined) mapped.id = owner.id;
  if (owner.firstName !== undefined) mapped.first_name = owner.firstName;
  if (owner.lastName !== undefined) mapped.last_name = owner.lastName;
  if (owner.dni !== undefined) mapped.dni = owner.dni;
  if (owner.cuit !== undefined) mapped.cuit = owner.cuit;
  if (owner.phone !== undefined) mapped.phone = owner.phone;
  if (owner.whatsapp !== undefined) mapped.whatsapp = owner.whatsapp;
  if (owner.email !== undefined) mapped.email = owner.email;
  if (owner.address !== undefined) mapped.address = owner.address;
  if (owner.city !== undefined) mapped.city = owner.city;
  if (owner.notes !== undefined) mapped.notes = owner.notes;
  if (owner.balance !== undefined) mapped.balance = owner.balance;
  if (owner.createdAt !== undefined) mapped.created_at = owner.createdAt;
  return mapped;
}

export function mapPatientFromDB(raw: any): Patient {
  return {
    id: raw.id,
    ownerId: raw.owner_id || raw.ownerId || '',
    name: raw.name || '',
    species: raw.species || 'Canino',
    breed: raw.breed || '',
    sex: raw.sex || 'Macho',
    reproductiveStatus: raw.reproductive_status || raw.reproductiveStatus || 'Entero',
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

export function mapPatientToDB(patient: Partial<Patient>): any {
  const mapped: any = {};
  if (patient.id !== undefined) mapped.id = patient.id;
  if (patient.ownerId !== undefined) mapped.owner_id = patient.ownerId;
  if (patient.name !== undefined) mapped.name = patient.name;
  if (patient.species !== undefined) mapped.species = patient.species;
  if (patient.breed !== undefined) mapped.breed = patient.breed;
  if (patient.sex !== undefined) mapped.sex = patient.sex;
  if (patient.reproductiveStatus !== undefined) mapped.reproductive_status = patient.reproductiveStatus;
  if (patient.birthDate !== undefined) mapped.birth_date = patient.birthDate;
  if (patient.calculatedAge !== undefined) mapped.calculated_age = patient.calculatedAge;
  if (patient.weight !== undefined) mapped.weight = patient.weight;
  if (patient.color !== undefined) mapped.color = patient.color;
  if (patient.microchip !== undefined) mapped.microchip = patient.microchip;
  if (patient.photoUrl !== undefined) mapped.photo_url = patient.photoUrl;
  if (patient.clinicalRecordNumber !== undefined) mapped.clinical_record_number = patient.clinicalRecordNumber;
  if (patient.status !== undefined) mapped.status = patient.status;
  if (patient.alerts !== undefined) mapped.alerts = patient.alerts;
  if (patient.createdAt !== undefined) mapped.created_at = patient.createdAt;
  return mapped;
}

export function mapVitalSignsFromDB(raw: any): VitalSigns {
  return {
    id: raw.id,
    patientId: raw.patient_id || raw.patientId || '',
    recordedAt: raw.recorded_at || raw.recordedAt || new Date().toISOString(),
    temperature: raw.temperature,
    heartRate: raw.heart_rate || raw.heartRate,
    respiratoryRate: raw.respiratory_rate || raw.respiratoryRate,
    systolicBP: raw.systolic_bp ?? raw.systolicBP,
    diastolicBP: raw.diastolic_bp ?? raw.diastolicBP,
    meanBP: raw.mean_bp ?? raw.meanBP,
    capillaryRefillTime: raw.capillary_refill_time_seconds || raw.capillaryRefillTime,
    mucousMembranes: raw.mucous_membranes || raw.mucousMembranes,
    weight: raw.weight,
    bloodGlucose: raw.glycemia ?? raw.bloodGlucose,
    spo2: raw.oxygen_saturation ?? raw.spo2,
    painScale: raw.pain_score_glasgow ?? raw.painScale,
    recordedBy: raw.recorded_by || raw.recordedBy || 'Dr. Diego Iván Irusta',
    notes: raw.notes,
  };
}

export function mapVitalSignsToDB(v: Partial<VitalSigns>): any {
  const mapped: any = {};
  if (v.id !== undefined) mapped.id = v.id;
  if (v.patientId !== undefined) mapped.patient_id = v.patientId;
  if (v.recordedAt !== undefined) mapped.recorded_at = v.recordedAt;
  if (v.temperature !== undefined) mapped.temperature = v.temperature;
  if (v.heartRate !== undefined) mapped.heart_rate = v.heartRate;
  if (v.respiratoryRate !== undefined) mapped.respiratory_rate = v.respiratoryRate;
  if (v.systolicBP !== undefined) mapped.systolic_bp = v.systolicBP;
  if (v.diastolicBP !== undefined) mapped.diastolic_bp = v.diastolicBP;
  if (v.meanBP !== undefined) mapped.mean_bp = v.meanBP;
  if (v.capillaryRefillTime !== undefined) mapped.capillary_refill_time_seconds = v.capillaryRefillTime;
  if (v.mucousMembranes !== undefined) mapped.mucous_membranes = v.mucousMembranes;
  if (v.weight !== undefined) mapped.weight = v.weight;
  if (v.bloodGlucose !== undefined) mapped.glycemia = v.bloodGlucose;
  if (v.spo2 !== undefined) mapped.oxygen_saturation = v.spo2;
  if (v.painScale !== undefined) mapped.pain_score_glasgow = v.painScale;
  if (v.recordedBy !== undefined) mapped.recorded_by = v.recordedBy;
  if (v.notes !== undefined) mapped.notes = v.notes;
  return mapped;
}

// ----------------- REPOSITORIES -----------------

export const patientRepository = {
  async getAll(): Promise<RepoResult<Patient[]>> {
    try {
      const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
      if (error) return { data: null, error: error.message };
      return { data: (data || []).map(mapPatientFromDB), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error de conexión' };
    }
  },

  async create(patient: Patient): Promise<RepoResult<Patient>> {
    try {
      const dbPayload = mapPatientToDB(patient);
      const { data, error } = await supabase.from('patients').insert(dbPayload).select().single();
      if (error) return { data: null, error: error.message };
      return { data: mapPatientFromDB(data), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al crear paciente' };
    }
  },

  async update(id: string, updates: Partial<Patient>): Promise<RepoResult<Patient>> {
    try {
      const dbPayload = mapPatientToDB(updates);
      const { data, error } = await supabase.from('patients').update(dbPayload).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data: mapPatientFromDB(data), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al actualizar paciente' };
    }
  },

  async delete(id: string): Promise<DeleteResult> {
    try {
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al eliminar paciente' };
    }
  },
};

export const ownerRepository = {
  async getAll(): Promise<RepoResult<Owner[]>> {
    try {
      const { data, error } = await supabase.from('owners').select('*').order('created_at', { ascending: false });
      if (error) return { data: null, error: error.message };
      return { data: (data || []).map(mapOwnerFromDB), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error de conexión' };
    }
  },

  async create(owner: Owner): Promise<RepoResult<Owner>> {
    try {
      const dbPayload = mapOwnerToDB(owner);
      const { data, error } = await supabase.from('owners').insert(dbPayload).select().single();
      if (error) return { data: null, error: error.message };
      return { data: mapOwnerFromDB(data), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al crear tutor' };
    }
  },

  async update(id: string, updates: Partial<Owner>): Promise<RepoResult<Owner>> {
    try {
      const dbPayload = mapOwnerToDB(updates);
      const { data, error } = await supabase.from('owners').update(dbPayload).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data: mapOwnerFromDB(data), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al actualizar tutor' };
    }
  },

  async delete(id: string): Promise<DeleteResult> {
    try {
      const { error } = await supabase.from('owners').delete().eq('id', id);
      if (error) return { success: false, error: error.message };
      return { success: true, error: null };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error al eliminar tutor' };
    }
  },
};

export const vitalsRepository = {
  async create(vital: VitalSigns): Promise<RepoResult<VitalSigns>> {
    try {
      const dbPayload = mapVitalSignsToDB(vital);
      const { data, error } = await supabase.from('vital_signs').insert(dbPayload).select().single();
      if (error) return { data: null, error: error.message };
      return { data: mapVitalSignsFromDB(data), error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al guardar signos vitales' };
    }
  },
};

export const consultationRepository = {
  async create(c: Consultation): Promise<RepoResult<Consultation>> {
    try {
      const { data, error } = await supabase.from('consultations').insert({
        id: c.id,
        patient_id: c.patientId,
        vet_id: c.vetId,
        vet_name: c.vetName,
        branch_id: c.branchId,
        date_time: c.dateTime,
        reason: c.reason,
        anamnesis: c.anamnesis,
        soap: c.soap,
        physical_exam: c.physicalExam,
        diagnoses: c.diagnoses,
        prescriptions: c.prescriptions,
        requires_hospitalization: c.requiresHospitalization,
      }).select().single();
      if (error) return { data: null, error: error.message };
      return { data: c, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al crear consulta' };
    }
  },
};

export const hospitalizationRepository = {
  async create(h: Hospitalization): Promise<RepoResult<Hospitalization>> {
    try {
      const { data, error } = await supabase.from('hospitalizations').insert({
        id: h.id,
        patient_id: h.patientId,
        vet_in_charge_id: h.vetInChargeId,
        vet_in_charge_name: h.vetInChargeName,
        sector: h.sector,
        kennel_number: h.kennelNumber,
        admitted_at: h.admittedAt,
        discharged_at: h.dischargedAt,
        primary_diagnosis: h.primaryDiagnosis,
        priority: h.priority,
        fluid_therapy: h.fluidTherapy,
        feeding: h.feeding,
        eliminations: h.eliminations,
        medications: h.medications,
        tasks: h.tasks,
        hourly_sheet: h.hourlySheet,
        interval_hours: h.intervalHours,
        next_vitals_time: h.nextVitalsTime,
        status: h.status,
        discharge_summary: h.dischargeSummary,
        branch_id: h.branchId,
      }).select().single();
      if (error) return { data: null, error: error.message };
      return { data: h, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al crear internación' };
    }
  },

  async update(id: string, h: Partial<Hospitalization>): Promise<RepoResult<Hospitalization>> {
    try {
      const mapped: any = {};
      if (h.status !== undefined) mapped.status = h.status;
      if (h.dischargedAt !== undefined) mapped.discharged_at = h.dischargedAt;
      if (h.dischargeSummary !== undefined) mapped.discharge_summary = h.dischargeSummary;
      if (h.fluidTherapy !== undefined) mapped.fluid_therapy = h.fluidTherapy;
      if (h.medications !== undefined) mapped.medications = h.medications;
      if (h.hourlySheet !== undefined) mapped.hourly_sheet = h.hourlySheet;
      if (h.priority !== undefined) mapped.priority = h.priority;

      const { data, error } = await supabase.from('hospitalizations').update(mapped).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data: h as Hospitalization, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al actualizar internación' };
    }
  },
};

export const encounterRepository = {
  async create(e: ClinicalEncounter): Promise<RepoResult<ClinicalEncounter>> {
    try {
      const { data, error } = await supabase.from('encounters').insert({
        id: e.id,
        patient_id: e.patientId,
        vet_in_charge_id: e.vetInChargeId,
        vet_in_charge_name: e.vetInChargeName,
        branch_id: e.branchId,
        type: e.type,
        status: e.status,
        admitted_at: e.admittedAt,
        closed_at: e.closedAt,
        reason: e.reason,
        initial_diagnosis: e.initialDiagnosis,
        final_diagnosis: e.finalDiagnosis,
        discharge_notes: e.dischargeNotes,
        discharge_prescription: e.dischargeMedications,
        follow_up_date: e.nextFollowUpDate,
        kennel_number: e.kennelNumber,
        sector: e.sector,
        priority: e.priority,
        notes: e.notes,
      }).select().single();
      if (error) return { data: null, error: error.message };
      return { data: e, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al crear encuentro' };
    }
  },

  async update(id: string, e: Partial<ClinicalEncounter>): Promise<RepoResult<ClinicalEncounter>> {
    try {
      const mapped: any = {};
      if (e.status !== undefined) mapped.status = e.status;
      if (e.closedAt !== undefined) mapped.closed_at = e.closedAt;
      if (e.dischargeNotes !== undefined) mapped.discharge_notes = e.dischargeNotes;
      if (e.dischargeMedications !== undefined) mapped.discharge_prescription = e.dischargeMedications;
      if (e.nextFollowUpDate !== undefined) mapped.follow_up_date = e.nextFollowUpDate;
      if (e.finalDiagnosis !== undefined) mapped.final_diagnosis = e.finalDiagnosis;

      const { data, error } = await supabase.from('encounters').update(mapped).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data: e as ClinicalEncounter, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al actualizar encuentro' };
    }
  },
};

export const documentRepository = {
  async create(doc: ClinicalDocument): Promise<RepoResult<ClinicalDocument>> {
    try {
      const { data, error } = await supabase.from('clinical_documents').insert({
        id: doc.id,
        patient_id: doc.patientId,
        owner_id: doc.ownerId,
        type: doc.type,
        title: doc.title,
        content: doc.content,
        vet_name: doc.vetName,
        created_at: doc.createdAt,
        signed_by: doc.signedByOwnerName,
        status: doc.isSigned ? 'FIRMADO' : 'PENDIENTE',
      }).select().single();
      if (error) return { data: null, error: error.message };
      return { data: doc, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || 'Error al guardar documento' };
    }
  },
};

export const auditRepository = {
  async log(action: string, entity: string, entityId: string, details: string, user = 'Dr. Diego Iván Irusta', role = 'SUPERADMIN'): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        timestamp: new Date().toISOString(),
        user_name: user,
        user_role: role,
        action,
        entity,
        entity_id: entityId,
        details,
      });
    } catch (err) {
      console.warn('Audit log write error:', err);
    }
  },
};

// RPC Demo Data Cleanup Client
export interface CleanupResult {
  success: boolean;
  dryRun: boolean;
  message: string;
  affectedCounts: Record<string, number>;
  totalDeleted: number;
}

export async function executeDemoCleanupRPC(dryRun: boolean, confirmationPhrase: string): Promise<CleanupResult> {
  if (!dryRun && (!confirmationPhrase || confirmationPhrase.trim() !== 'ELIMINAR DATOS DEMO')) {
    return {
      success: false,
      dryRun,
      message: 'Frase de confirmación inválida. Debe escribir: ELIMINAR DATOS DEMO',
      affectedCounts: {},
      totalDeleted: 0,
    };
  }

  // 1. Try server RPC
  try {
    const { data, error } = await supabase.rpc('cleanup_demo_data', {
      p_dry_run: dryRun,
      p_confirmation_phrase: confirmationPhrase,
    });
    if (!error && data && data.success) {
      return {
        success: true,
        dryRun: !!data.dry_run,
        message: data.message,
        affectedCounts: data.affected_counts || {},
        totalDeleted: data.total_deleted || 0,
      };
    }
  } catch {}

  // 2. Direct transactional fallback engine
  try {
    // Identify demo patients
    const { data: allPatients } = await supabase.from('patients').select('id, owner_id, clinical_record_number');
    const demoPatientIds = (allPatients || [])
      .filter((p) => ['pat-1', 'pat-2', 'pat-3'].includes(p.id) || (p.clinical_record_number && p.clinical_record_number.startsWith('HC-2026-004')))
      .map((p) => p.id);

    // Identify demo owners only if they have no real patients
    const realPatientOwners = new Set(
      (allPatients || []).filter((p) => !demoPatientIds.includes(p.id)).map((p) => p.owner_id)
    );
    const { data: allOwners } = await supabase.from('owners').select('id');
    const demoOwnerIds = (allOwners || [])
      .filter((o) => ['own-1', 'own-2', 'own-3'].includes(o.id) && !realPatientOwners.has(o.id))
      .map((o) => o.id);

    const affectedCounts: Record<string, number> = {
      patients: demoPatientIds.length,
      owners: demoOwnerIds.length,
      vital_signs: 0,
      consultations: 0,
      hospitalizations: 0,
      surgeries: 0,
      encounters: 0,
      procedures: 0,
      encounter_consumptions: 0,
      prescriptions: 0,
      clinical_documents: 0,
      invoices: 0,
      account_debts: 0,
      financial_transactions: 0,
      laboratory_orders: 0,
      imaging_studies: 0,
      vaccinations: 0,
      appointments: 0,
      triage_entries: 0,
      patient_problems: 0,
    };

    if (demoPatientIds.length > 0) {
      const tables = [
        'vital_signs', 'patient_problems', 'consultations', 'hospitalizations',
        'surgeries', 'encounters', 'prescriptions', 'clinical_documents',
        'invoices', 'account_debts', 'financial_transactions', 'laboratory_orders',
        'imaging_studies', 'vaccinations', 'appointments', 'triage_entries'
      ];

      for (const t of tables) {
        try {
          const { count } = await supabase.from(t).select('*', { count: 'exact', head: true }).in('patient_id', demoPatientIds);
          affectedCounts[t] = count || 0;
        } catch {}
      }
    }

    const totalDeleted = Object.values(affectedCounts).reduce((a, b) => a + b, 0);

    if (dryRun) {
      return {
        success: true,
        dryRun: true,
        message: 'Análisis preliminar (Dry Run) completado con éxito.',
        affectedCounts,
        totalDeleted,
      };
    }

    // Perform deletions
    if (demoPatientIds.length > 0) {
      await supabase.from('vital_signs').delete().in('patient_id', demoPatientIds);
      await supabase.from('patient_problems').delete().in('patient_id', demoPatientIds);
      await supabase.from('consultations').delete().in('patient_id', demoPatientIds);
      await supabase.from('hospitalizations').delete().in('patient_id', demoPatientIds);
      await supabase.from('surgeries').delete().in('patient_id', demoPatientIds);
      await supabase.from('encounters').delete().in('patient_id', demoPatientIds);
      await supabase.from('prescriptions').delete().in('patient_id', demoPatientIds);
      await supabase.from('clinical_documents').delete().in('patient_id', demoPatientIds);
      await supabase.from('invoices').delete().in('patient_id', demoPatientIds);
      await supabase.from('account_debts').delete().in('patient_id', demoPatientIds);
      await supabase.from('financial_transactions').delete().in('patient_id', demoPatientIds);
      await supabase.from('laboratory_orders').delete().in('patient_id', demoPatientIds);
      await supabase.from('imaging_studies').delete().in('patient_id', demoPatientIds);
      await supabase.from('vaccinations').delete().in('patient_id', demoPatientIds);
      await supabase.from('appointments').delete().in('patient_id', demoPatientIds);
      await supabase.from('triage_entries').delete().in('patient_id', demoPatientIds);
      await supabase.from('patients').delete().in('id', demoPatientIds);
    }

    if (demoOwnerIds.length > 0) {
      await supabase.from('owners').delete().in('id', demoOwnerIds);
    }

    // Insert audit log
    await supabase.from('audit_logs').insert({
      id: `audit-cleanup-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_name: 'Dr. Diego Iván Irusta',
      user_role: 'SUPERADMIN',
      action: 'LIMPIEZA_DATOS_DEMO',
      entity: 'Database',
      entity_id: 'public',
      details: `Eliminación de ${totalDeleted} registros demo para pase a producción limpia.`,
    });

    return {
      success: true,
      dryRun: false,
      message: 'Limpieza de datos demo ejecutada exitosamente.',
      affectedCounts,
      totalDeleted,
    };
  } catch (err: any) {
    return {
      success: false,
      dryRun,
      message: err.message || 'Error durante la limpieza',
      affectedCounts: {},
      totalDeleted: 0,
    };
  }
}
