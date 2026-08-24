import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Branch,
  User,
  UserRole,
  Owner,
  Patient,
  PatientProblem,
  VitalSigns,
  Consultation,
  Hospitalization,
  SurgeryRecord,
  LaboratoryOrder,
  LabResultItem,
  PaymentMethod,
  InvoiceType,
  ImagingStudy,
  VaccinationRecord,
  Product,
  InventoryMovement,
  Appointment,
  TriageEntry,
  TriagePriority,
  Invoice,
  Estimate,
  CashRegisterSession,
  ClinicalDocument,
  AuditLog,
  HospitalPriority,
  PatientAlert,
  RegulatoryRule,
  ControlledDrugItem,
  ControlledDrugMovement,
  PathologicalWasteRecord,
  Prescription,
  AntimicrobialRecord,
  ClinicalAmendment,
  ClinicalEvolutionEntry,
  ClinicalEncounter,
  ClinicalProcedure,
  EncounterConsumptionItem,
  ServicePriceItem,
  MedicationSchedule,
  FinancialMovement,
  AccountDebt,
  FinancialPaymentMethod,
  FinancialMovementStatus,
  PaymentInstallment,
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_USERS,
  INITIAL_OWNERS,
  INITIAL_PATIENTS,
  INITIAL_PROBLEMS,
  INITIAL_VITALS,
  INITIAL_CONSULTATIONS,
  INITIAL_HOSPITALIZATIONS,
  INITIAL_SURGERIES,
  INITIAL_PRODUCTS,
  INITIAL_LAB_ORDERS,
  INITIAL_IMAGING,
  INITIAL_VACCINATIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_TRIAGE,
  INITIAL_INVOICES,
  INITIAL_ESTIMATES,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_CASH_SESSION,
  INITIAL_REGULATORY_RULES,
  INITIAL_CONTROLLED_DRUGS,
  INITIAL_CONTROLLED_MOVEMENTS,
  INITIAL_PATHOLOGICAL_WASTE,
  INITIAL_PRESCRIPTIONS,
  INITIAL_ANTIMICROBIAL_RECORDS,
  INITIAL_CLINICAL_EVOLUTIONS,
  INITIAL_ENCOUNTERS,
  INITIAL_PROCEDURES,
  INITIAL_ENCOUNTER_CONSUMPTIONS,
  INITIAL_SERVICE_PRICES,
} from '../mockData';
import { ToastMessage } from '../components/ToastNotification';
import { MedicalPrintData } from '../components/MedicalPrintModal';
import { checkSupabaseConnection } from '../lib/supabase';
import {
  fetchInitialDataFromSupabase,
  seedInitialDataToSupabase,
  syncPatientToSupabase,
  syncOwnerToSupabase,
  wipeRemoteSupabaseData,
  syncVitalSignsToSupabase,
  syncProblemToSupabase,
  syncConsultationToSupabase,
  syncHospitalizationToSupabase,
  syncSurgeryToSupabase,
  syncLabOrderToSupabase,
  syncImagingToSupabase,
  syncVaccinationToSupabase,
  syncProductToSupabase,
  syncAppointmentToSupabase,
  syncTriageToSupabase,
  syncInvoiceToSupabase,
  syncDocumentToSupabase,
  syncClinicalEvolutionToSupabase,
  syncAuditLogToSupabase,
} from '../lib/supabaseSync';
import { hasViewPermission, getDefaultViewForRole, SystemView } from '../utils/rbac';

interface VetContextType {
  // Navigation & State
  activeView: string;
  setActiveView: (view: string) => void;
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
  selectedOwnerId: string | null;
  setSelectedOwnerId: (id: string | null) => void;
  activePatientTab: string;
  setActivePatientTab: (tab: string) => void;

  // Active Environment
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeBranch: Branch;
  setActiveBranch: (branch: Branch) => void;
  users: User[];
  branches: Branch[];

  // Data Collections
  owners: Owner[];
  patients: Patient[];
  problems: PatientProblem[];
  vitals: VitalSigns[];
  consultations: Consultation[];
  hospitalizations: Hospitalization[];
  surgeries: SurgeryRecord[];
  labOrders: LaboratoryOrder[];
  imagingStudies: ImagingStudy[];
  vaccinations: VaccinationRecord[];
  products: Product[];
  inventoryMovements: InventoryMovement[];
  appointments: Appointment[];
  triageList: TriageEntry[];
  invoices: Invoice[];
  estimates: Estimate[];
  cashSession: CashRegisterSession;
  documents: ClinicalDocument[];
  auditLogs: AuditLog[];
  regulatoryRules: RegulatoryRule[];
  controlledDrugs: ControlledDrugItem[];
  controlledMovements: ControlledDrugMovement[];
  pathologicalWaste: PathologicalWasteRecord[];
  prescriptions: Prescription[];
  antimicrobialRecords: AntimicrobialRecord[];
  clinicalEvolutions: ClinicalEvolutionEntry[];

  // GESTIÓN ECONÓMICA
  financialMovements: FinancialMovement[];
  accountDebts: AccountDebt[];
  incomeCategories: string[];
  expenseCategories: string[];
  addFinancialMovement: (data: Omit<FinancialMovement, 'id' | 'createdAt' | 'createdBy'>) => FinancialMovement;
  voidFinancialMovement: (id: string, reason: string) => void;
  addAccountDebt: (data: Omit<AccountDebt, 'id' | 'balance' | 'paidAmount' | 'payments' | 'createdAt' | 'createdBy'>) => AccountDebt;
  registerDebtPayment: (debtId: string, amount: number, paymentMethod: FinancialPaymentMethod, notes?: string) => void;
  addCustomCategory: (type: 'INGRESO' | 'GASTO', category: string) => void;

  // Clinical Evolution Actions
  addClinicalEvolution: (entry: Omit<ClinicalEvolutionEntry, 'id' | 'createdAt' | 'status'>) => ClinicalEvolutionEntry;
  signClinicalEvolution: (id: string) => void;
  addEvolutionAddendum: (id: string, content: string, reason: string) => void;

  // Regulatory & Controlled Drugs & Waste Actions
  addRegulatoryRule: (rule: Omit<RegulatoryRule, 'id' | 'lastReviewedAt'>) => void;
  updateRegulatoryRuleStatus: (id: string, status: RegulatoryRule['status']) => void;
  addControlledMovement: (mov: ControlledDrugMovement) => void;
  addPathologicalWaste: (rec: PathologicalWasteRecord) => void;
  addPrescription: (rx: Prescription) => void;
  addClinicalAmendment: (consultationId: string, amendment: Omit<ClinicalAmendment, 'id' | 'amendedAt'>) => void;

  // Patient & Owner Actions
  addOwner: (owner: Omit<Owner, 'id' | 'createdAt' | 'balance'>) => Owner;
  updateOwner: (id: string, data: Partial<Owner>) => void;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt' | 'clinicalRecordNumber'>) => Patient;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addPatientAlert: (patientId: string, alert: { type: PatientAlert; description: string }) => void;
  removePatientAlert: (patientId: string, alertIndex: number) => void;
  recordPatientWeight: (patientId: string, newWeight: number, recordedBy?: string) => void;
  addProblem: (problem: Omit<PatientProblem, 'id'>) => void;
  updateProblemStatus: (problemId: string, status: PatientProblem['status']) => void;

  // Clinical Actions
  addVitalSigns: (vitals: Omit<VitalSigns, 'id' | 'recordedAt' | 'recordedBy'>) => void;
  addConsultation: (consultation: Omit<Consultation, 'id' | 'dateTime' | 'vetId' | 'vetName' | 'branchId'>) => Consultation;
  
  // Hospitalization Actions
  admitPatientToHospital: (data: {
    patientId: string;
    sector: Hospitalization['sector'];
    kennelNumber: string;
    primaryDiagnosis: string;
    priority: HospitalPriority;
    fluidTherapy?: Hospitalization['fluidTherapy'];
    feeding?: Hospitalization['feeding'];
  }) => Hospitalization;
  updateHospitalPriority: (hospitalizationId: string, priority: HospitalPriority) => void;
  updateFluidTherapy: (hospitalizationId: string, fluid: Hospitalization['fluidTherapy']) => void;
  addHospitalMedication: (patientId: string, med: Partial<MedicationSchedule>) => void;
  administerMedication: (hospitalizationId: string, medicationScheduleId: string, notes?: string) => { success: boolean; message: string };
  addHourlySheetEntry: (hospitalizationId: string, entry: Omit<Hospitalization['hourlySheet'][0], 'id' | 'timestamp' | 'staffName'>) => void;
  dischargeHospitalPatient: (hospitalizationId: string, summary: string) => void;

  // Lab & Imaging & Vaccines
  addSurgery: (surgery: Omit<SurgeryRecord, 'id'>) => SurgeryRecord;
  updateSurgeryStatus: (id: string, status: SurgeryRecord['status']) => void;
  addLabOrder: (order: Omit<LaboratoryOrder, 'id' | 'orderNumber' | 'requestedAt' | 'status'>) => void;
  updateLabResults: (orderId: string, results: LaboratoryOrder['results'], conclusions: string) => void;
  updateLabOrderStatus: (orderId: string, status: LaboratoryOrder['status']) => void;
  addImagingStudy: (study: Omit<ImagingStudy, 'id' | 'studyNumber' | 'date' | 'status'>) => void;
  updateImagingStudy: (studyId: string, updates: Partial<ImagingStudy>) => void;
  addVaccination: (vac: Omit<VaccinationRecord, 'id' | 'administeredDate' | 'administeredBy' | 'vetLicense'>) => void;

  // Inventory & Pharmacy
  addProduct: (product: Omit<Product, 'id' | 'branchId'>) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  updateProductStock: (productId: string, quantityChange: number, type: InventoryMovement['type'], reason: string) => void;

  // Appointments & Triage
  addAppointment: (apt: Omit<Appointment, 'id' | 'branchId'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addTriageEntry: (triage: Omit<TriageEntry, 'id' | 'arrivedAt' | 'waitTimeMinutes' | 'status'>) => void;
  updateTriageStatus: (id: string, status: TriageEntry['status']) => void;
  updateTriagePriority: (id: string, priority: TriagePriority) => void;

  // Billing & Cash
  createInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'date' | 'caeNumber' | 'caeExpirationDate' | 'branchId'>) => Invoice;
  createEstimate: (est: Omit<Estimate, 'id' | 'estimateNumber' | 'date' | 'status'>) => Estimate;
  convertEstimateToInvoice: (estimateId: string, paymentMethod: Invoice['paymentMethod']) => Invoice | null;

  // Documents & Consents
  addDocument: (doc: Omit<ClinicalDocument, 'id' | 'createdAt'>) => void;
  signDocument: (docId: string, signerName: string, signerDni: string, signatureDataUrl: string) => void;

  // Audit
  logAudit: (action: string, entity: string, entityId: string, details: string, prev?: string, next?: string) => void;
  clearAllDataToCleanProduction: () => void;
  // Clinical Encounter & Operational Hub
  encounters: ClinicalEncounter[];
  activeEncounterId: string | null;
  setActiveEncounterId: (id: string | null) => void;
  procedures: ClinicalProcedure[];
  encounterConsumptions: EncounterConsumptionItem[];
  servicePrices: ServicePriceItem[];
  startEncounter: (data: Omit<ClinicalEncounter, 'id' | 'status' | 'admittedAt'>) => ClinicalEncounter;
  closeEncounter: (encounterId: string, dischargeData: { finalDiagnosis: string; dischargeNotes: string; dischargeMedications?: string; nextFollowUpDate?: string }) => void;
  updateEncounter: (encounterId: string, partial: Partial<ClinicalEncounter>) => void;
  addProcedure: (proc: Omit<ClinicalProcedure, 'id' | 'createdAt' | 'isPerformed'>) => ClinicalProcedure;
  performProcedure: (procedureId: string, performedBy?: string, notes?: string) => void;
  addEncounterLabOrder: (order: Omit<LaboratoryOrder, 'id' | 'orderNumber' | 'requestedAt' | 'status' | 'results'>, price?: number) => LaboratoryOrder;
  performLabOrder: (orderId: string, results: LabResultItem[], diagnosticReport: string, conclusions: string, attachedPdfUrl?: string) => void;
  addEncounterImagingStudy: (study: Omit<ImagingStudy, 'id' | 'studyNumber' | 'date' | 'status'>, price?: number) => ImagingStudy;
  performImagingStudy: (studyId: string, report: string, conclusion: string, images?: { id: string; url: string; caption: string }[]) => void;
  getEncounterConsumptions: (encounterId: string) => EncounterConsumptionItem[];
  getEncounterPreInvoice: (encounterId: string) => { items: { id: string; concept: string; quantity: number; unitPrice: number; subtotal: number; sourceType: string }[]; totalAmount: number };
  billEncounter: (encounterId: string, paymentMethod: PaymentMethod, invoiceType?: InvoiceType, discountAmount?: number) => Invoice;
  updateServicePrice: (id: string, newPrice: number) => void;


  // AI Assistant helper

  // Quick Open Modals
  quickModal: string | null;
  setQuickModal: (modal: string | null) => void;
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;

  // Advanced Clinical Tools & Modals
  isCalculatorsOpen: boolean;
  setIsCalculatorsOpen: (open: boolean) => void;
  openCalculators: () => void;
  isPrintModalOpen: boolean;
  printData: MedicalPrintData | null;
  openPrintModal: (data: MedicalPrintData) => void;
  closePrintModal: () => void;
  isMonitorOpen: boolean;
  monitorPatientId: string | null;
  openMonitor: (patientId?: string) => void;
  closeMonitor: () => void;

  // Next-Gen Modals (VET SYSTEM 3.0)
  isDentalChartOpen: boolean;
  dentalPatientId: string | null;
  openDentalChart: (patientId?: string) => void;
  closeDentalChart: () => void;

  isBodyMapOpen: boolean;
  bodyMapPatientId: string | null;
  openBodyMap: (patientId?: string) => void;
  closeBodyMap: () => void;

  isAnesthesiaChartOpen: boolean;
  anesthesiaPatientId: string | null;
  anesthesiaSurgeryName: string;
  openAnesthesiaChart: (patientId?: string, surgeryName?: string) => void;
  closeAnesthesiaChart: () => void;

  isWhatsAppHubOpen: boolean;
  whatsAppData: any | null;
  openWhatsAppHub: (data?: any) => void;
  closeWhatsAppHub: () => void;

  isImagingAnnotatorOpen: boolean;
  imagingAnnotatorData: any | null;
  openImagingAnnotator: (data?: any) => void;
  closeImagingAnnotator: () => void;

  // Toast System
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
  dismissToast: (id: string) => void;

  // Supabase Cloud State
  isCloudConnected: boolean;
  cloudSyncStatus: 'CONECTADO' | 'SINCRONIZANDO' | 'OFFLINE_LOCAL';
}

const VetContext = createContext<VetContextType | undefined>(undefined);


const INITIAL_FINANCIAL_MOVEMENTS: FinancialMovement[] = [];

const INITIAL_ACCOUNT_DEBTS: AccountDebt[] = [];


const CURRENT_DATA_VERSION = 'v2026_clean_production_v2';

// Automatic purge on startup to clear any legacy demo data from browser storage
if (typeof window !== 'undefined') {
  try {
    const currentVer = localStorage.getItem('vetsys_version_flag');
    if (currentVer !== CURRENT_DATA_VERSION) {
      const keysToPurge = [
        'vetsys_owners',
        'vetsys_patients',
        'vetsys_problems',
        'vetsys_vitals',
        'vetsys_consultations',
        'vetsys_hospitalizations',
        'vetsys_surgeries',
        'vetsys_labOrders',
        'vetsys_imaging',
        'vetsys_vaccinations',
        'vetsys_appointments',
        'vetsys_triage',
        'vetsys_invoices',
        'vetsys_estimates',
        'vetsys_documents',
        'vetsys_financial_movements',
        'vetsys_account_debts',
        'vetsys_controlled_movements',
        'vetsys_pathological_waste',
        'vetsys_prescriptions',
        'vetsys_antimicrobial_records',
        'vetsys_clinical_evolutions',
        'vetsys_cash_expenses',
      ];
      keysToPurge.forEach((k) => localStorage.setItem(k, JSON.stringify([])));
      localStorage.setItem('vetsys_version_flag', CURRENT_DATA_VERSION);
    }
  } catch {}
}

export const VetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<string>('PACIENTES');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null); // Default select Toby
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [activePatientTab, setActivePatientTab] = useState<string>('SIGNOS');

  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [activeBranch, setActiveBranch] = useState<Branch>(INITIAL_BRANCHES[0]);

  const [users] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default Dr. Martín López

  // Main collections with local storage initialization
  const [owners, setOwners] = useState<Owner[]>(() => {
    const saved = localStorage.getItem('vetsys_owners');
    return saved ? JSON.parse(saved) : INITIAL_OWNERS;
  });

  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('vetsys_patients');
    return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
  });

  const [problems, setProblems] = useState<PatientProblem[]>(() => {
    const saved = localStorage.getItem('vetsys_problems');
    return saved ? JSON.parse(saved) : INITIAL_PROBLEMS;
  });

  const [vitals, setVitals] = useState<VitalSigns[]>(() => {
    const saved = localStorage.getItem('vetsys_vitals');
    return saved ? JSON.parse(saved) : INITIAL_VITALS;
  });

  const [consultations, setConsultations] = useState<Consultation[]>(() => {
    const saved = localStorage.getItem('vetsys_consultations');
    return saved ? JSON.parse(saved) : INITIAL_CONSULTATIONS;
  });

  const [hospitalizations, setHospitalizations] = useState<Hospitalization[]>(() => {
    const saved = localStorage.getItem('vetsys_hospitalizations');
    return saved ? JSON.parse(saved) : INITIAL_HOSPITALIZATIONS;
  });

  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>(() => {
    const saved = localStorage.getItem('vetsys_surgeries');
    return saved ? JSON.parse(saved) : INITIAL_SURGERIES;
  });

  const [labOrders, setLabOrders] = useState<LaboratoryOrder[]>(() => {
    const saved = localStorage.getItem('vetsys_labOrders');
    return saved ? JSON.parse(saved) : INITIAL_LAB_ORDERS;
  });

  const [imagingStudies, setImagingStudies] = useState<ImagingStudy[]>(() => {
    const saved = localStorage.getItem('vetsys_imaging');
    return saved ? JSON.parse(saved) : INITIAL_IMAGING;
  });

  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(() => {
    const saved = localStorage.getItem('vetsys_vaccinations');
    return saved ? JSON.parse(saved) : INITIAL_VACCINATIONS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('vetsys_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [inventoryMovements, setInventoryMovements] = useState<InventoryMovement[]>([]);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('vetsys_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [triageList, setTriageList] = useState<TriageEntry[]>(() => {
    const saved = localStorage.getItem('vetsys_triage');
    return saved ? JSON.parse(saved) : INITIAL_TRIAGE;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('vetsys_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [estimates, setEstimates] = useState<Estimate[]>(() => {
    const saved = localStorage.getItem('vetsys_estimates');
    return saved ? JSON.parse(saved) : INITIAL_ESTIMATES;
  });

  const [cashSession] = useState<CashRegisterSession>(INITIAL_CASH_SESSION);

  const [encounters, setEncounters] = useState<ClinicalEncounter[]>(() => {
    const saved = localStorage.getItem('vetsys_encounters');
    return saved ? JSON.parse(saved) : INITIAL_ENCOUNTERS;
  });
  const [activeEncounterId, setActiveEncounterId] = useState<string | null>(null);

  const [procedures, setProcedures] = useState<ClinicalProcedure[]>(() => {
    const saved = localStorage.getItem('vetsys_procedures');
    return saved ? JSON.parse(saved) : INITIAL_PROCEDURES;
  });

  const [encounterConsumptions, setEncounterConsumptions] = useState<EncounterConsumptionItem[]>(() => {
    const saved = localStorage.getItem('vetsys_encounter_consumptions');
    return saved ? JSON.parse(saved) : INITIAL_ENCOUNTER_CONSUMPTIONS;
  });

  const [servicePrices, setServicePrices] = useState<ServicePriceItem[]>(() => {
    const saved = localStorage.getItem('vetsys_service_prices');
    return saved ? JSON.parse(saved) : INITIAL_SERVICE_PRICES;
  });


  const [financialMovements, setFinancialMovements] = useState<FinancialMovement[]>(() => {
    const saved = localStorage.getItem('vetsys_financial_movements');
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_MOVEMENTS;
  });

  const [accountDebts, setAccountDebts] = useState<AccountDebt[]>(() => {
    const saved = localStorage.getItem('vetsys_account_debts');
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNT_DEBTS;
  });

  const [incomeCategories, setIncomeCategories] = useState<string[]>([
    'Consultas',
    'Cirugías',
    'Internación & UCI',
    'Farmacia & Ventas',
    'Laboratorio',
    'Diagnóstico por Imágenes',
    'Vacunación',
    'Peluquería & Estética',
    'Otros Ingresos',
  ]);

  const [expenseCategories, setExpenseCategories] = useState<string[]>([
    'Insumos',
    'Medicamentos & Droguería',
    'Alquiler',
    'Servicios',
    'Sueldos & Honorarios',
    'Mantenimiento',
    'Transporte',
    'Impuestos & Tasas',
    'Otros Gastos',
  ]);

  // Persist financial states
  useEffect(() => {
    localStorage.setItem('vetsys_financial_movements', JSON.stringify(financialMovements));
  }, [financialMovements]);

  useEffect(() => {
    localStorage.setItem('vetsys_account_debts', JSON.stringify(accountDebts));
  }, [accountDebts]);

  const [documents, setDocuments] = useState<ClinicalDocument[]>(() => {
    const saved = localStorage.getItem('vetsys_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('vetsys_auditLogs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [regulatoryRules, setRegulatoryRules] = useState<RegulatoryRule[]>(() => {
    const saved = localStorage.getItem('vetsys_regulatory_rules');
    return saved ? JSON.parse(saved) : INITIAL_REGULATORY_RULES;
  });

  const [controlledDrugs, setControlledDrugs] = useState<ControlledDrugItem[]>(() => {
    const saved = localStorage.getItem('vetsys_controlled_drugs');
    return saved ? JSON.parse(saved) : INITIAL_CONTROLLED_DRUGS;
  });

  const [controlledMovements, setControlledMovements] = useState<ControlledDrugMovement[]>(() => {
    const saved = localStorage.getItem('vetsys_controlled_movements');
    return saved ? JSON.parse(saved) : INITIAL_CONTROLLED_MOVEMENTS;
  });

  const [pathologicalWaste, setPathologicalWaste] = useState<PathologicalWasteRecord[]>(() => {
    const saved = localStorage.getItem('vetsys_pathological_waste');
    return saved ? JSON.parse(saved) : INITIAL_PATHOLOGICAL_WASTE;
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    const saved = localStorage.getItem('vetsys_prescriptions');
    return saved ? JSON.parse(saved) : INITIAL_PRESCRIPTIONS;
  });

  const [antimicrobialRecords, setAntimicrobialRecords] = useState<AntimicrobialRecord[]>(() => {
    const saved = localStorage.getItem('vetsys_antimicrobial_records');
    return saved ? JSON.parse(saved) : INITIAL_ANTIMICROBIAL_RECORDS;
  });

  const [clinicalEvolutions, setClinicalEvolutions] = useState<ClinicalEvolutionEntry[]>(() => {
    const saved = localStorage.getItem('vetsys_clinical_evolutions');
    return saved ? JSON.parse(saved) : INITIAL_CLINICAL_EVOLUTIONS;
  });

  // Regulatory & Controlled Drugs & Waste Handlers
  const addRegulatoryRule = (ruleData: Omit<RegulatoryRule, 'id' | 'lastReviewedAt'>) => {
    const newRule: RegulatoryRule = {
      ...ruleData,
      id: `reg-${Date.now()}`,
      lastReviewedAt: new Date().toISOString().split('T')[0],
    };
    setRegulatoryRules((prev) => [newRule, ...prev]);
  };

  const updateRegulatoryRuleStatus = (id: string, status: RegulatoryRule['status']) => {
    setRegulatoryRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status, lastReviewedAt: new Date().toISOString().split('T')[0] } : r))
    );
  };

  const addControlledMovement = (mov: ControlledDrugMovement) => {
    setControlledMovements((prev) => [mov, ...prev]);
    setControlledDrugs((prev) =>
      prev.map((d) => (d.id === mov.drugId ? { ...d, currentStock: mov.balanceAfter } : d))
    );
  };

  const addPathologicalWaste = (rec: PathologicalWasteRecord) => {
    setPathologicalWaste((prev) => [rec, ...prev]);
  };

  const addPrescription = (rx: Prescription) => {
    setPrescriptions((prev) => [rx, ...prev]);
  };

  const addClinicalAmendment = (
    consultationId: string,
    amendmentData: Omit<ClinicalAmendment, 'id' | 'amendedAt'>
  ) => {
    const newAmendment: ClinicalAmendment = {
      ...amendmentData,
      id: `amd-${Date.now()}`,
      consultationId,
      amendedAt: new Date().toISOString(),
    };
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === consultationId
          ? {
              ...c,
              amendments: [...(c.amendments || []), newAmendment],
            }
          : c
      )
    );
  };

  const [quickModal, setQuickModal] = useState<string | null>(null);
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);

  // New Clinical Tools & Telemetry Modals State
  const [isCalculatorsOpen, setIsCalculatorsOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [printData, setPrintData] = useState<MedicalPrintData | null>(null);
  const [isMonitorOpen, setIsMonitorOpen] = useState<boolean>(false);
  const [monitorPatientId, setMonitorPatientId] = useState<string | null>(null);

  // Toast Notification State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openCalculators = () => setIsCalculatorsOpen(true);
  const openPrintModal = (data: MedicalPrintData) => {
    setPrintData(data);
    setIsPrintModalOpen(true);
  };
  const closePrintModal = () => {
    setIsPrintModalOpen(false);
    setPrintData(null);
  };

  const openMonitor = (patientId?: string) => {
    if (patientId) setMonitorPatientId(patientId);
    else if (selectedPatientId) setMonitorPatientId(selectedPatientId);
    setIsMonitorOpen(true);
  };
  const closeMonitor = () => {
    setIsMonitorOpen(false);
    setMonitorPatientId(null);
  };

  // Next-Gen Modals State (VET SYSTEM 3.0)
  const [isDentalChartOpen, setIsDentalChartOpen] = useState<boolean>(false);
  const [dentalPatientId, setDentalPatientId] = useState<string | null>(null);
  const openDentalChart = (patientId?: string) => {
    setDentalPatientId(patientId || selectedPatientId || 'pat-1');
    setIsDentalChartOpen(true);
  };
  const closeDentalChart = () => {
    setIsDentalChartOpen(false);
    setDentalPatientId(null);
  };

  const [isBodyMapOpen, setIsBodyMapOpen] = useState<boolean>(false);
  const [bodyMapPatientId, setBodyMapPatientId] = useState<string | null>(null);
  const openBodyMap = (patientId?: string) => {
    setBodyMapPatientId(patientId || selectedPatientId || 'pat-1');
    setIsBodyMapOpen(true);
  };
  const closeBodyMap = () => {
    setIsBodyMapOpen(false);
    setBodyMapPatientId(null);
  };

  const [isAnesthesiaChartOpen, setIsAnesthesiaChartOpen] = useState<boolean>(false);
  const [anesthesiaPatientId, setAnesthesiaPatientId] = useState<string | null>(null);
  const [anesthesiaSurgeryName, setAnesthesiaSurgeryName] = useState<string>('Cirugía Quirúrgica');
  const openAnesthesiaChart = (patientId?: string, surgeryName?: string) => {
    setAnesthesiaPatientId(patientId || selectedPatientId || 'pat-1');
    if (surgeryName) setAnesthesiaSurgeryName(surgeryName);
    setIsAnesthesiaChartOpen(true);
  };
  const closeAnesthesiaChart = () => {
    setIsAnesthesiaChartOpen(false);
    setAnesthesiaPatientId(null);
  };

  const [isWhatsAppHubOpen, setIsWhatsAppHubOpen] = useState<boolean>(false);
  const [whatsAppData, setWhatsAppData] = useState<any | null>(null);
  const openWhatsAppHub = (data?: any) => {
    if (data) setWhatsAppData(data);
    setIsWhatsAppHubOpen(true);
  };
  const closeWhatsAppHub = () => {
    setIsWhatsAppHubOpen(false);
    setWhatsAppData(null);
  };

  const [isImagingAnnotatorOpen, setIsImagingAnnotatorOpen] = useState<boolean>(false);
  const [imagingAnnotatorData, setImagingAnnotatorData] = useState<any | null>(null);
  const openImagingAnnotator = (data?: any) => {
    if (data) setImagingAnnotatorData(data);
    setIsImagingAnnotatorOpen(true);
  };
  const closeImagingAnnotator = () => {
    setIsImagingAnnotatorOpen(false);
    setImagingAnnotatorData(null);
  };

  const closeAllModals = () => {
    setQuickModal(null);
    setIsCalculatorsOpen(false);
    setIsMonitorOpen(false);
    setIsPrintModalOpen(false);
    setIsDentalChartOpen(false);
    setIsBodyMapOpen(false);
    setIsAnesthesiaChartOpen(false);
    setIsWhatsAppHubOpen(false);
    setIsImagingAnnotatorOpen(false);
    setIsGlobalSearchOpen(false);
  };

  const switchCurrentUser = (newUser: User) => {
    setCurrentUser(newUser);
    closeAllModals();

    // Re-evaluar permisos para la vista activa
    let viewKey: SystemView = 'DASHBOARD';
    if (activeView === 'PACIENTES') viewKey = 'PACIENTES';
    else if (activeView === 'PROPIETARIOS') viewKey = 'PROPIETARIOS';
    else if (activeView === 'INTERNACION') viewKey = 'INTERNACION';
    else if (activeView === 'SALA_ESPERA') viewKey = 'INTERNACION';
    else if (activeView === 'AGENDA') viewKey = 'AGENDA';
    else if (activeView === 'CONSULTAS') viewKey = 'CONSULTAS';
    else if (activeView === 'SIGNOS_VITALES') viewKey = 'SIGNOS_VITALES';
    else if (activeView === 'CIRUGIAS') viewKey = 'CIRUGIAS';
    else if (activeView === 'LABORATORIO') viewKey = 'LABORATORIO';
    else if (activeView === 'IMAGENES') viewKey = 'IMAGENES';
    else if (activeView === 'VACUNAS') viewKey = 'VACUNAS';
    else if (activeView === 'INVENTARIO') viewKey = 'INVENTARIO';
    else if (activeView === 'CAJA_FACTURACION' || activeView === 'CAJA_FACTURAS' || activeView === 'CAJA') viewKey = 'CAJA_FACTURACION';
    else if (activeView === 'DOCUMENTOS') viewKey = 'DOCUMENTOS';
    else if (activeView === 'CONFIGURACION') viewKey = 'CONFIGURACION';

    if (!hasViewPermission(newUser.role, viewKey)) {
      const defaultView = getDefaultViewForRole(newUser.role);
      setActiveView(defaultView);
    }
  };

  const switchActiveBranch = (newBranch: Branch) => {
    setActiveBranch(newBranch);
    closeAllModals();
  };

  // Supabase Cloud State
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'CONECTADO' | 'SINCRONIZANDO' | 'OFFLINE_LOCAL'>('SINCRONIZANDO');

  // Initialize Supabase Cloud Connection & Sync
  useEffect(() => {
    let isMounted = true;
    async function initCloud() {
      try {
        const conn = await checkSupabaseConnection();
        if (isMounted) {
          setIsCloudConnected(conn.connected);
          if (conn.connected) {
            setCloudSyncStatus('CONECTADO');
            const cloudData = await fetchInitialDataFromSupabase();
            if (cloudData && isMounted) {
              if (cloudData.owners && cloudData.owners.length > 0) {
                setOwners((prev) => {
                  const cloudIds = new Set(cloudData.owners!.map((o) => o.id));
                  const localOnly = prev.filter((o) => !cloudIds.has(o.id));
                  return [...cloudData.owners!, ...localOnly];
                });
              }
              if (cloudData.patients && cloudData.patients.length > 0) {
                setPatients((prev) => {
                  const cloudIds = new Set(cloudData.patients!.map((p) => p.id));
                  const localOnly = prev.filter((p) => !cloudIds.has(p.id));
                  return [...cloudData.patients!, ...localOnly];
                });
              }
              if (cloudData.vitals && cloudData.vitals.length > 0) {
                setVitals((prev) => {
                  const cloudIds = new Set(cloudData.vitals!.map((v) => v.id));
                  const localOnly = prev.filter((v) => !cloudIds.has(v.id));
                  return [...cloudData.vitals!, ...localOnly];
                });
              }
              if (cloudData.problems && cloudData.problems.length > 0) {
                setProblems((prev) => {
                  const cloudIds = new Set(cloudData.problems!.map((pr) => pr.id));
                  const localOnly = prev.filter((pr) => !cloudIds.has(pr.id));
                  return [...cloudData.problems!, ...localOnly];
                });
              }
              if (cloudData.consultations && cloudData.consultations.length > 0) {
                setConsultations((prev) => {
                  const cloudIds = new Set(cloudData.consultations!.map((c) => c.id));
                  const localOnly = prev.filter((c) => !cloudIds.has(c.id));
                  return [...cloudData.consultations!, ...localOnly];
                });
              }
              if (cloudData.hospitalizations && cloudData.hospitalizations.length > 0) {
                setHospitalizations((prev) => {
                  const cloudIds = new Set(cloudData.hospitalizations!.map((h) => h.id));
                  const localOnly = prev.filter((h) => !cloudIds.has(h.id));
                  return [...cloudData.hospitalizations!, ...localOnly];
                });
              }
              if (cloudData.surgeries && cloudData.surgeries.length > 0) {
                setSurgeries((prev) => {
                  const cloudIds = new Set(cloudData.surgeries!.map((s) => s.id));
                  const localOnly = prev.filter((s) => !cloudIds.has(s.id));
                  return [...cloudData.surgeries!, ...localOnly];
                });
              }
              if (cloudData.products && cloudData.products.length > 0) {
                setProducts((prev) => {
                  const cloudIds = new Set(cloudData.products!.map((p) => p.id));
                  const localOnly = prev.filter((p) => !cloudIds.has(p.id));
                  return [...cloudData.products!, ...localOnly];
                });
              }
              if (cloudData.invoices && cloudData.invoices.length > 0) {
                setInvoices((prev) => {
                  const cloudIds = new Set(cloudData.invoices!.map((i) => i.id));
                  const localOnly = prev.filter((i) => !cloudIds.has(i.id));
                  return [...cloudData.invoices!, ...localOnly];
                });
              }
              if (cloudData.labOrders && cloudData.labOrders.length > 0) {
                setLabOrders((prev) => {
                  const cloudIds = new Set(cloudData.labOrders!.map((l) => l.id));
                  const localOnly = prev.filter((l) => !cloudIds.has(l.id));
                  return [...cloudData.labOrders!, ...localOnly];
                });
              }
              if (cloudData.imagingStudies && cloudData.imagingStudies.length > 0) {
                setImagingStudies((prev) => {
                  const cloudIds = new Set(cloudData.imagingStudies!.map((img) => img.id));
                  const localOnly = prev.filter((img) => !cloudIds.has(img.id));
                  return [...cloudData.imagingStudies!, ...localOnly];
                });
              }
              if (cloudData.vaccinations && cloudData.vaccinations.length > 0) {
                setVaccinations((prev) => {
                  const cloudIds = new Set(cloudData.vaccinations!.map((vac) => vac.id));
                  const localOnly = prev.filter((vac) => !cloudIds.has(vac.id));
                  return [...cloudData.vaccinations!, ...localOnly];
                });
              }
              if (cloudData.appointments && cloudData.appointments.length > 0) {
                setAppointments((prev) => {
                  const cloudIds = new Set(cloudData.appointments!.map((a) => a.id));
                  const localOnly = prev.filter((a) => !cloudIds.has(a.id));
                  return [...cloudData.appointments!, ...localOnly];
                });
              }
              if (cloudData.triageList && cloudData.triageList.length > 0) {
                setTriageList((prev) => {
                  const cloudIds = new Set(cloudData.triageList!.map((t) => t.id));
                  const localOnly = prev.filter((t) => !cloudIds.has(t.id));
                  return [...cloudData.triageList!, ...localOnly];
                });
              }
              if (cloudData.documents && cloudData.documents.length > 0) {
                setDocuments((prev) => {
                  const cloudIds = new Set(cloudData.documents!.map((d) => d.id));
                  const localOnly = prev.filter((d) => !cloudIds.has(d.id));
                  return [...cloudData.documents!, ...localOnly];
                });

                // Extract clinical evolution notes from cloud documents
                const cloudEvolutions: ClinicalEvolutionEntry[] = [];
                for (const doc of cloudData.documents) {
                  if (doc.type === ('EVOLUCION_CLINICA' as any)) {
                    try {
                      const parsed = JSON.parse(doc.content);
                      if (parsed && parsed.id && parsed.patientId) {
                        cloudEvolutions.push(parsed);
                      }
                    } catch {
                      cloudEvolutions.push({
                        id: doc.id,
                        patientId: doc.patientId,
                        authorName: doc.vetName || 'Dr. Veterinario',
                        authorRole: 'VETERINARIO',
                        dateTime: doc.createdAt,
                        createdAt: doc.createdAt,
                        type: 'MEDICA',
                        objectiveSummary: doc.title,
                        plan: doc.content,
                        status: 'FIRMADO',
                      });
                    }
                  }
                }
                if (cloudEvolutions.length > 0) {
                  setClinicalEvolutions((prev) => {
                    const cloudIds = new Set(cloudEvolutions.map((e) => e.id));
                    const localOnly = prev.filter((e) => !cloudIds.has(e.id));
                    return [...cloudEvolutions, ...localOnly];
                  });
                }
              }
              if (cloudData.estimates && cloudData.estimates.length > 0) {
                setEstimates((prev) => {
                  const cloudIds = new Set(cloudData.estimates!.map((e) => e.id));
                  const localOnly = prev.filter((e) => !cloudIds.has(e.id));
                  return [...cloudData.estimates!, ...localOnly];
                });
              }
              if (cloudData.auditLogs && cloudData.auditLogs.length > 0) {
                setAuditLogs((prev) => {
                  const cloudIds = new Set(cloudData.auditLogs!.map((a) => a.id));
                  const localOnly = prev.filter((a) => !cloudIds.has(a.id));
                  return [...cloudData.auditLogs!, ...localOnly];
                });
              }

              // Auto-seed if remote tables are newly initialized
              if (!cloudData.patients || cloudData.patients.length === 0) {
                seedInitialDataToSupabase({
                  owners,
                  patients,
                  vitals,
                  problems,
                  hospitalizations,
                  products,
                });
              }
            }
          } else {
            setCloudSyncStatus('OFFLINE_LOCAL');
          }
        }
      } catch (err) {
        if (isMounted) setCloudSyncStatus('OFFLINE_LOCAL');
      }
    }
    initCloud();
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('vetsys_owners', JSON.stringify(owners));
  }, [owners]);
  useEffect(() => {
    localStorage.setItem('vetsys_patients', JSON.stringify(patients));
  }, [patients]);
  useEffect(() => {
    localStorage.setItem('vetsys_problems', JSON.stringify(problems));
  }, [problems]);
  useEffect(() => {
    localStorage.setItem('vetsys_vitals', JSON.stringify(vitals));
  }, [vitals]);
  useEffect(() => {
    localStorage.setItem('vetsys_consultations', JSON.stringify(consultations));
  }, [consultations]);
  useEffect(() => {
    localStorage.setItem('vetsys_hospitalizations', JSON.stringify(hospitalizations));
  }, [hospitalizations]);
  useEffect(() => {
    localStorage.setItem('vetsys_surgeries', JSON.stringify(surgeries));
  }, [surgeries]);
  useEffect(() => {
    localStorage.setItem('vetsys_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem('vetsys_appointments', JSON.stringify(appointments));
  }, [appointments]);
  useEffect(() => {
    localStorage.setItem('vetsys_triage', JSON.stringify(triageList));
  }, [triageList]);
  useEffect(() => {
    localStorage.setItem('vetsys_invoices', JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem('vetsys_estimates', JSON.stringify(estimates));
  }, [estimates]);
  useEffect(() => {
    localStorage.setItem('vetsys_documents', JSON.stringify(documents));
  }, [documents]);
  useEffect(() => {
    localStorage.setItem('vetsys_labOrders', JSON.stringify(labOrders));
  }, [labOrders]);
  useEffect(() => {
    localStorage.setItem('vetsys_imaging', JSON.stringify(imagingStudies));
  }, [imagingStudies]);
  useEffect(() => {
    localStorage.setItem('vetsys_vaccinations', JSON.stringify(vaccinations));
  }, [vaccinations]);
  useEffect(() => {
    localStorage.setItem('vetsys_clinical_evolutions', JSON.stringify(clinicalEvolutions));
  }, [clinicalEvolutions]);
  useEffect(() => {
    localStorage.setItem('vetsys_auditLogs', JSON.stringify(auditLogs));
    localStorage.setItem('vetsys_regulatory_rules', JSON.stringify(regulatoryRules));
    localStorage.setItem('vetsys_controlled_drugs', JSON.stringify(controlledDrugs));
    localStorage.setItem('vetsys_controlled_movements', JSON.stringify(controlledMovements));
    localStorage.setItem('vetsys_pathological_waste', JSON.stringify(pathologicalWaste));
    localStorage.setItem('vetsys_prescriptions', JSON.stringify(prescriptions));

  useEffect(() => {
    localStorage.setItem('vetsys_encounters', JSON.stringify(encounters));
  }, [encounters]);

  useEffect(() => {
    localStorage.setItem('vetsys_procedures', JSON.stringify(procedures));
  }, [procedures]);

  useEffect(() => {
    localStorage.setItem('vetsys_encounter_consumptions', JSON.stringify(encounterConsumptions));
  }, [encounterConsumptions]);

  useEffect(() => {
    localStorage.setItem('vetsys_service_prices', JSON.stringify(servicePrices));
  }, [servicePrices]);

    localStorage.setItem('vetsys_antimicrobial_records', JSON.stringify(antimicrobialRecords));
  }, [regulatoryRules, controlledDrugs, controlledMovements, pathologicalWaste, prescriptions, antimicrobialRecords, auditLogs]);

  // Audit Logger helper

  const clearAllDataToCleanProduction = async () => {
    try {
      await wipeRemoteSupabaseData();
    } catch {}

    const storageKeys = [
      'vetsys_owners',
      'vetsys_patients',
      'vetsys_problems',
      'vetsys_vitals',
      'vetsys_consultations',
      'vetsys_hospitalizations',
      'vetsys_surgeries',
      'vetsys_labOrders',
      'vetsys_imaging',
      'vetsys_vaccinations',
      'vetsys_appointments',
      'vetsys_triage',
      'vetsys_invoices',
      'vetsys_estimates',
      'vetsys_documents',
      'vetsys_financial_movements',
      'vetsys_account_debts',
      'vetsys_controlled_movements',
      'vetsys_pathological_waste',
      'vetsys_prescriptions',
      'vetsys_antimicrobial_records',
      'vetsys_clinical_evolutions',
      'vetsys_cash_expenses',
      'vetsys_auditLogs',
    ];
    storageKeys.forEach((k) => {
      try {
        localStorage.setItem(k, JSON.stringify([]));
      } catch {}
    });
    localStorage.setItem('vetsys_version_flag', CURRENT_DATA_VERSION);

    setOwners([]);
    setPatients([]);
    setProblems([]);
    setVitals([]);
    setConsultations([]);
    setHospitalizations([]);
    setSurgeries([]);
    setLabOrders([]);
    setImagingStudies([]);
    setVaccinations([]);
    setAppointments([]);
    setTriageList([]);
    setInvoices([]);
    setEstimates([]);
    setDocuments([]);
    setFinancialMovements([]);
    setAccountDebts([]);
    setControlledMovements([]);
    setPathologicalWaste([]);
    setPrescriptions([]);
    setAntimicrobialRecords([]);
    setClinicalEvolutions([]);
    setEncounters([]);
    setProcedures([]);
    setEncounterConsumptions([]);
    setActiveEncounterId(null);
    setSelectedPatientId(null);

    logAudit('SISTEMA_REINICIADO_PRODUCCION', 'System', 'ROOT', 'Base de datos limpiada para inicio de operaciones reales');
    showToast('success', 'Base de Datos Limpia', 'El sistema está 100% listo para uso real.');
  };

  const logAudit = (action: string, entity: string, entityId: string, details: string, prev?: string, next?: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entity,
      entityId,
      details,
      previousValue: prev,
      newValue: next,
    };
    setAuditLogs((prevLogs) => [newLog, ...prevLogs]);
    syncAuditLogToSupabase(newLog);
  };

  // Owner methods
  const addOwner = (data: Omit<Owner, 'id' | 'createdAt' | 'balance'>): Owner => {
    const newOwner: Owner = {
      ...data,
      id: `owner-${Date.now()}`,
      createdAt: new Date().toISOString(),
      balance: 0,
    };
    setOwners((prev) => [newOwner, ...prev]);
    syncOwnerToSupabase(newOwner);
    logAudit('CREAR_PROPIETARIO', 'Owner', newOwner.id, `Alta de propietario: ${newOwner.firstName} ${newOwner.lastName} (DNI ${newOwner.dni})`);
    return newOwner;
  };

  const updateOwner = (id: string, data: Partial<Owner>) => {
    setOwners((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const updated = { ...o, ...data };
          syncOwnerToSupabase(updated);
          logAudit('EDITAR_PROPIETARIO', 'Owner', id, `Modificación de datos de propietario ${o.firstName} ${o.lastName}`);
          return updated;
        }
        return o;
      })
    );
  };

  // Patient methods
  const addPatient = (data: Omit<Patient, 'id' | 'createdAt' | 'clinicalRecordNumber'>): Patient => {
    const year = new Date().getFullYear();
    const count = patients.length + 1;
    const clinicalRecordNumber = `HC-${year}-${count.toString().padStart(4, '0')}`;

    const newPatient: Patient = {
      ...data,
      id: `pat-${Date.now()}`,
      clinicalRecordNumber,
      createdAt: new Date().toISOString(),
    };
    setPatients((prev) => [newPatient, ...prev]);
    syncPatientToSupabase(newPatient);
    logAudit('CREAR_PACIENTE', 'Patient', newPatient.id, `Alta de paciente: ${newPatient.name} (${newPatient.species} - ${newPatient.breed}) - HC: ${clinicalRecordNumber}`);
    return newPatient;
  };

  const updatePatient = (id: string, data: Partial<Patient>) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...data };
          syncPatientToSupabase(updated);
          logAudit('EDITAR_PACIENTE', 'Patient', id, `Actualización de ficha médica de ${p.name}`);
          return updated;
        }
        return p;
      })
    );
  };

  const deletePatient = (id: string) => {
    const p = patients.find((pat) => pat.id === id);
    setPatients((prev) => prev.filter((pat) => pat.id !== id));
    logAudit('ELIMINAR_PACIENTE', 'Patient', id, `Eliminación de paciente: ${p?.name || id}`);
    if (selectedPatientId === id) {
      setSelectedPatientId(patients.find((pat) => pat.id !== id)?.id || null);
    }
  };

  const addPatientAlert = (patientId: string, alert: { type: PatientAlert; description: string }) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const currentAlerts = p.alerts || [];
          const updatedAlerts = [...currentAlerts, alert];
          const updated = { ...p, alerts: updatedAlerts };
          syncPatientToSupabase(updated);
          logAudit('AGREGAR_ALERTA', 'Patient', patientId, `Alerta añadida a ${p.name}: ${alert.type} - ${alert.description}`);
          return updated;
        }
        return p;
      })
    );
  };

  const removePatientAlert = (patientId: string, alertIndex: number) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const updatedAlerts = (p.alerts || []).filter((_, idx) => idx !== alertIndex);
          const updated = { ...p, alerts: updatedAlerts };
          syncPatientToSupabase(updated);
          logAudit('REMOVER_ALERTA', 'Patient', patientId, `Alerta removida de ${p.name} (índice ${alertIndex})`);
          return updated;
        }
        return p;
      })
    );
  };

  const recordPatientWeight = (patientId: string, newWeight: number, recordedBy?: string) => {
    const validWeight = Math.max(0.1, Math.min(250, Number(newWeight) || 1));
    const now = new Date().toISOString();
    const staff = recordedBy || currentUser?.name || 'Dr. Veterinario';

    // 1. Update patient weight in patient record
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id === patientId) {
          const updated = { ...p, weight: validWeight };
          syncPatientToSupabase(updated);
          return updated;
        }
        return p;
      })
    );

    // 2. Add vital sign entry for longitudinal weight tracking
    const newVital: VitalSigns = {
      id: `vit-${Date.now()}`,
      patientId,
      recordedAt: now,
      recordedBy: staff,
      weight: validWeight,
    };
    setVitals((prev) => [newVital, ...prev]);
    syncVitalSignsToSupabase(newVital);
    logAudit('REGISTRO_PESO', 'Patient', patientId, `Control de peso: ${validWeight} kg por ${staff}`);
  };

  const addProblem = (data: Omit<PatientProblem, 'id'>) => {
    const newProb: PatientProblem = {
      ...data,
      id: `prob-${Date.now()}`,
    };
    setProblems((prev) => [newProb, ...prev]);
    syncProblemToSupabase(newProb);
    logAudit('REGISTRAR_PROBLEMA', 'PatientProblem', newProb.id, `Nuevo problema clínico: ${newProb.title} para paciente ID ${newProb.patientId}`);
  };

  const updateProblemStatus = (problemId: string, status: PatientProblem['status']) => {
    setProblems((prev) =>
      prev.map((pr) => {
        if (pr.id === problemId) {
          const updated: PatientProblem = {
            ...pr,
            status,
            resolvedDate: status === 'RESUELTO' ? new Date().toISOString().split('T')[0] : pr.resolvedDate,
          };
          syncProblemToSupabase(updated);
          logAudit('ESTADO_PROBLEMA', 'PatientProblem', problemId, `Cambio de estado en problema ${pr.title} -> ${status}`);
          return updated;
        }
        return pr;
      })
    );
  };

  // Vitals
  const addVitalSigns = (data: Omit<VitalSigns, 'id' | 'recordedAt' | 'recordedBy'>) => {
    const newVital: VitalSigns = {
      ...data,
      id: `vit-${Date.now()}`,
      recordedAt: new Date().toISOString(),
      recordedBy: currentUser.name,
    };
    setVitals((prev) => [newVital, ...prev]);
    syncVitalSignsToSupabase(newVital);
    
    // Also update patient weight if provided
    if (data.weight) {
      updatePatient(data.patientId, { weight: data.weight });
    }

    logAudit('REGISTRO_SIGNOS_VITALES', 'VitalSigns', newVital.id, `Signos vitales registrados: T=${data.temperature}°C, FC=${data.heartRate}, FR=${data.respiratoryRate}, PA=${data.systolicBP}/${data.diastolicBP}`);
  };

  // Consultations
  const addConsultation = (data: Omit<Consultation, 'id' | 'dateTime' | 'vetId' | 'vetName' | 'branchId'>): Consultation => {
    const newCons: Consultation = {
      ...data,
      id: `cons-${Date.now()}`,
      dateTime: new Date().toISOString(),
      vetId: currentUser.id,
      vetName: currentUser.name,
      branchId: activeBranch.id,
    };

    setConsultations((prev) => [newCons, ...prev]);

    // Save vital signs recorded during consultation
    if (data.vitalSigns) {
      addVitalSigns({
        ...data.vitalSigns,
        patientId: data.patientId,
      });
    }

    // If requires hospitalization, trigger workflow
    if (data.requiresHospitalization) {
      updatePatient(data.patientId, { status: 'INTERNADO' });
      showToast('warning', 'Internación Requerida', `El paciente ha sido derivado a internación inmediata.`);
    } else {
      showToast('success', 'Consulta Finalizada', `Consulta SOAP guardada exitosamente.`);
    }

    syncConsultationToSupabase(newCons);
    logAudit('CONSULTA_SOAP', 'Consultation', newCons.id, `Consulta completada para paciente ID ${data.patientId} - Motivo: ${data.reason}`);
    return newCons;
  };

  // Hospitalization
  const admitPatientToHospital = (data: {
    patientId: string;
    sector: Hospitalization['sector'];
    kennelNumber: string;
    primaryDiagnosis: string;
    priority: HospitalPriority;
    fluidTherapy?: Hospitalization['fluidTherapy'];
    feeding?: Hospitalization['feeding'];
  }): Hospitalization => {
    const newHosp: Hospitalization = {
      id: `hosp-${Date.now()}`,
      patientId: data.patientId,
      vetInChargeId: currentUser.id,
      vetInChargeName: currentUser.name,
      sector: data.sector,
      kennelNumber: data.kennelNumber,
      admittedAt: new Date().toISOString(),
      primaryDiagnosis: data.primaryDiagnosis,
      priority: data.priority,
      fluidTherapy: data.fluidTherapy || {
        isActive: false,
        solutionType: 'Sin fluidos activos',
        volumeTotalMl: 0,
        rateMlPerHour: 0,
        infusionRoute: 'IV',
        startedAt: new Date().toISOString(),
        prescribedBy: currentUser.name,
      },
      feeding: data.feeding || {
        dietType: 'ORAL',
        foodBrand: 'Dieta estándar',
        amountGramsOrMl: 100,
        frequency: 'Cada 12 horas',
        tolerance: 'EXCELENTE',
      },
      eliminations: [],
      medications: [],
      tasks: [],
      hourlySheet: [],
      intervalHours: 2,
      status: 'ACTIVA',
      branchId: activeBranch.id,
    };

    setHospitalizations((prev) => [newHosp, ...prev]);
    updatePatient(data.patientId, { status: 'INTERNADO' });
    syncHospitalizationToSupabase(newHosp);
    showToast('success', 'Paciente Internado', `Ingresado a ${data.sector} (Canil ${data.kennelNumber}) - Prioridad ${data.priority}`);
    logAudit('INGRESO_INTERNACION', 'Hospitalization', newHosp.id, `Ingreso a internación (${data.sector} - Canil ${data.kennelNumber}) - Prioridad: ${data.priority}`);
    return newHosp;
  };
  const addHospitalization = admitPatientToHospital;

  // CLINICAL ENCOUNTER METHODS
  const startEncounter = (data: Omit<ClinicalEncounter, 'id' | 'status' | 'admittedAt'>): ClinicalEncounter => {
    const newEnc: ClinicalEncounter = {
      ...data,
      id: 'enc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      status: 'EN_CURSO',
      admittedAt: new Date().toISOString(),
      branchId: data.branchId || activeBranch.id,
    };

    setEncounters((prev) => [newEnc, ...prev]);
    setActiveEncounterId(newEnc.id);
    setSelectedPatientId(newEnc.patientId);

    // If internación, also register hospitalization
    if (newEnc.type === 'INTERNACION') {
      const hosp = addHospitalization({
        patientId: newEnc.patientId,
        sector: (newEnc.sector as any) || 'UCI',
        kennelNumber: newEnc.kennelNumber || 'CANIL-01',
        primaryDiagnosis: newEnc.initialDiagnosis || newEnc.reason,
        priority: newEnc.priority || 'PRIORITARIO',
        fluidTherapy: {
          isActive: false,
          solutionType: 'Ringer Lactato',
          volumeTotalMl: 0,
          rateMlPerHour: 0,
          infusionRoute: 'IV',
          startedAt: new Date().toISOString(),
          prescribedBy: currentUser.name,
        },
        feeding: {
          dietType: 'ORAL',
          foodBrand: 'Alimento Balanceado',
          amountGramsOrMl: 100,
          frequency: 'Cada 12 horas',
          tolerance: 'EXCELENTE',
        },
      });

      // Register initial admission consumption
      const priceItem = servicePrices.find((p) => p.category === 'INTERNACION') || { price: 35000, code: 'SRV-HOSP-01', name: 'Día de Internación' };
      const consumption: EncounterConsumptionItem = {
        id: 'cons-' + Date.now() + '-hosp',
        encounterId: newEnc.id,
        patientId: newEnc.patientId,
        sourceType: 'INTERNACION',
        sourceId: hosp.id,
        code: priceItem.code,
        concept: priceItem.name,
        quantity: 1,
        unitPrice: priceItem.price,
        subtotal: priceItem.price,
        status: 'CONFIRMADO',
        performedAt: new Date().toISOString(),
        performedBy: currentUser.name,
        isBilled: false,
      };
      setEncounterConsumptions((prev) => [consumption, ...prev]);
    } else {
      // Ambulatory consultation consumption
      const priceItem = servicePrices.find((p) => p.category === 'CONSULTA') || { price: 18000, code: 'SRV-CONS-01', name: 'Consulta Médica General' };
      const consumption: EncounterConsumptionItem = {
        id: 'cons-' + Date.now() + '-cons',
        encounterId: newEnc.id,
        patientId: newEnc.patientId,
        sourceType: 'CONSULTA',
        sourceId: newEnc.id,
        code: priceItem.code,
        concept: priceItem.name,
        quantity: 1,
        unitPrice: priceItem.price,
        subtotal: priceItem.price,
        status: 'CONFIRMADO',
        performedAt: new Date().toISOString(),
        performedBy: currentUser.name,
        isBilled: false,
      };
      setEncounterConsumptions((prev) => [consumption, ...prev]);
    }

    logAudit('INICIAR_ATENCION', 'ClinicalEncounter', newEnc.id, `Atención ${newEnc.type} iniciada para paciente ${newEnc.patientId}`);
    showToast('success', 'Atención Iniciada', `Episodio ${newEnc.type.toLowerCase()} abierto exitosamente.`);
    return newEnc;
  };

  const closeEncounter = (
    encounterId: string,
    dischargeData: { finalDiagnosis: string; dischargeNotes: string; dischargeMedications?: string; nextFollowUpDate?: string }
  ) => {
    setEncounters((prev) =>
      prev.map((e) => {
        if (e.id !== encounterId) return e;
        return {
          ...e,
          status: 'ALTA_MEDICA',
          closedAt: new Date().toISOString(),
          finalDiagnosis: dischargeData.finalDiagnosis,
          dischargeNotes: dischargeData.dischargeNotes,
          dischargeMedications: dischargeData.dischargeMedications,
          nextFollowUpDate: dischargeData.nextFollowUpDate,
        };
      })
    );

    // Also close linked active hospitalization if exists
    const enc = encounters.find((e) => e.id === encounterId);
    if (enc && enc.patientId) {
      const activeHosp = hospitalizations.find((h) => h.patientId === enc.patientId && h.status === 'ACTIVA');
      if (activeHosp) {
        dischargeHospitalPatient(activeHosp.id, dischargeData.dischargeNotes);
      }
    }

    logAudit('ALTA_ATENCION', 'ClinicalEncounter', encounterId, `Alta médica emitida con diagnóstico: ${dischargeData.finalDiagnosis}`);
    showToast('success', 'Alta Médica Registrada', 'La atención ha sido cerrada y guardada en el historial.');
  };

  const updateEncounter = (encounterId: string, partial: Partial<ClinicalEncounter>) => {
    setEncounters((prev) => prev.map((e) => (e.id === encounterId ? { ...e, ...partial } : e)));
  };

  // PROCEDURES
  const addProcedure = (proc: Omit<ClinicalProcedure, 'id' | 'createdAt' | 'isPerformed'>): ClinicalProcedure => {
    const priceItem = servicePrices.find((p) => p.name.toLowerCase() === proc.procedureName.toLowerCase()) || { price: proc.price || 7500 };
    const newProc: ClinicalProcedure = {
      ...proc,
      id: 'proc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      price: proc.price || priceItem.price,
      isBillable: proc.isBillable ?? true,
      isPerformed: false,
      createdAt: new Date().toISOString(),
    };
    setProcedures((prev) => [newProc, ...prev]);
    logAudit('PROCEDIMIENTO_INDICADO', 'ClinicalProcedure', newProc.id, `Procedimiento ${newProc.procedureName} indicado para paciente ${newProc.patientId}`);
    return newProc;
  };

  const performProcedure = (procedureId: string, performedBy?: string, notes?: string) => {
    setProcedures((prev) =>
      prev.map((p) => {
        if (p.id !== procedureId) return p;
        if (p.isPerformed) {
          showToast('warning', 'Procedimiento Ya Realizado', 'Este procedimiento ya fue confirmado previamente.');
          return p;
        }

        const performer = performedBy || currentUser.name;
        const performedTime = new Date().toISOString();

        // Create billable consumption automatically upon performance
        if (p.isBillable && p.price > 0) {
          const consumption: EncounterConsumptionItem = {
            id: 'cons-' + Date.now() + '-proc',
            encounterId: p.encounterId || activeEncounterId || 'enc-general',
            patientId: p.patientId,
            sourceType: 'PROCEDIMIENTO',
            sourceId: p.id,
            code: 'SRV-PROC',
            concept: p.procedureName,
            quantity: 1,
            unitPrice: p.price,
            subtotal: p.price,
            status: 'CONFIRMADO',
            performedAt: performedTime,
            performedBy: performer,
            isBilled: false,
          };
          setEncounterConsumptions((cPrev) => [consumption, ...cPrev]);
        }

        logAudit('PROCEDIMIENTO_REALIZADO', 'ClinicalProcedure', p.id, `Procedimiento ${p.procedureName} realizado por ${performer}`);
        showToast('success', 'Procedimiento Realizado', `${p.procedureName} completado.`);

        return {
          ...p,
          isPerformed: true,
          performedAt: performedTime,
          performedBy: performer,
          notes: notes || p.notes,
        };
      })
    );
  };

  // ENCOUNTER LAB ORDERS WITH CONSUMPTION INTEGRATION
  const addEncounterLabOrder = (
    order: Omit<LaboratoryOrder, 'id' | 'orderNumber' | 'requestedAt' | 'status' | 'results'>,
    price?: number
  ): LaboratoryOrder => {
    const priceItem = servicePrices.find((p) => p.name.includes(order.testType) || p.category === 'LABORATORIO') || { price: price || 14000 };
    const newOrder: LaboratoryOrder = {
      ...order,
      id: 'lab-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      orderNumber: 'LAB-' + (labOrders.length + 101).toString(),
      requestedAt: new Date().toISOString(),
      status: 'SOLICITADO',
      results: [],
      diagnosticReport: '',
      conclusions: '',
    };

    setLabOrders((prev) => [newOrder, ...prev]);
    logAudit('LAB_ORDEN_SOLICITADA', 'LaboratoryOrder', newOrder.id, `Estudio ${newOrder.testType} solicitado por ${newOrder.requestedBy}`);
    showToast('info', 'Estudio de Laboratorio Solicitado', `Orden ${newOrder.orderNumber} creada. Pendiente de toma de muestra y realización.`);
    return newOrder;
  };

  const performLabOrder = (
    orderId: string,
    results: LabResultItem[],
    diagnosticReport: string,
    conclusions: string,
    attachedPdfUrl?: string
  ) => {
    setLabOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        if (o.status === 'FINALIZADO') {
          showToast('warning', 'Laboratorio Ya Finalizado', 'Los resultados de esta orden ya fueron cargados.');
          return o;
        }

        const priceItem = servicePrices.find((p) => p.category === 'LABORATORIO') || { price: 14000, code: 'SRV-LAB' };
        const consumption: EncounterConsumptionItem = {
          id: 'cons-' + Date.now() + '-lab',
          encounterId: activeEncounterId || 'enc-general',
          patientId: o.patientId,
          sourceType: 'LABORATORIO',
          sourceId: o.id,
          code: priceItem.code,
          concept: `Laboratorio: ${o.testType.replace(/_/g, ' ')}`,
          quantity: 1,
          unitPrice: priceItem.price,
          subtotal: priceItem.price,
          status: 'CONFIRMADO',
          performedAt: new Date().toISOString(),
          performedBy: currentUser.name,
          isBilled: false,
        };
        setEncounterConsumptions((cPrev) => [consumption, ...cPrev]);

        logAudit('LAB_ORDEN_REALIZADA', 'LaboratoryOrder', o.id, `Resultados cargados para ${o.orderNumber} por ${currentUser.name}`);
        showToast('success', 'Laboratorio Realizado', `Resultados de ${o.orderNumber} registrados y consumo cargado a prefacturación.`);

        return {
          ...o,
          status: 'FINALIZADO' as const,
          results,
          diagnosticReport,
          conclusions,
          resultsReadyAt: new Date().toISOString(),
          attachedPdfUrl,
        };
      })
    );
  };

  // ENCOUNTER IMAGING WITH CONSUMPTION INTEGRATION
  const addEncounterImagingStudy = (
    study: Omit<ImagingStudy, 'id' | 'studyNumber' | 'date' | 'status'>,
    price?: number
  ): ImagingStudy => {
    const newStudy: ImagingStudy = {
      ...study,
      id: 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      studyNumber: 'IMG-' + (imagingStudies.length + 101).toString(),
      date: new Date().toISOString().split('T')[0],
      status: 'SOLICITADO',
      report: '',
      conclusion: '',
      images: [],
    };

    setImagingStudies((prev) => [newStudy, ...prev]);
    logAudit('IMAGEN_SOLICITADA', 'ImagingStudy', newStudy.id, `Estudio ${newStudy.modality} en ${newStudy.region} solicitado por ${newStudy.requestedBy}`);
    showToast('info', 'Estudio de Imagen Solicitado', `${newStudy.modality} solicitada. Pendiente de realización.`);
    return newStudy;
  };

  const performImagingStudy = (
    studyId: string,
    report: string,
    conclusion: string,
    images?: { id: string; url: string; caption: string }[]
  ) => {
    setImagingStudies((prev) =>
      prev.map((s) => {
        if (s.id !== studyId) return s;
        if (s.status === 'INFORMADO') {
          showToast('warning', 'Estudio Ya Informado', 'Este estudio ya fue completado.');
          return s;
        }

        const priceItem = servicePrices.find((p) => p.name.includes(s.modality) || p.category === 'IMAGENES') || { price: 26000, code: 'SRV-IMG' };
        const consumption: EncounterConsumptionItem = {
          id: 'cons-' + Date.now() + '-img',
          encounterId: activeEncounterId || 'enc-general',
          patientId: s.patientId,
          sourceType: 'IMAGEN',
          sourceId: s.id,
          code: priceItem.code,
          concept: `${s.modality}: ${s.region}`,
          quantity: 1,
          unitPrice: priceItem.price,
          subtotal: priceItem.price,
          status: 'CONFIRMADO',
          performedAt: new Date().toISOString(),
          performedBy: currentUser.name,
          isBilled: false,
        };
        setEncounterConsumptions((cPrev) => [consumption, ...cPrev]);

        logAudit('IMAGEN_REALIZADA', 'ImagingStudy', s.id, `Informe cargado para ${s.studyNumber} (${s.modality}) por ${currentUser.name}`);
        showToast('success', 'Estudio de Imagen Realizado', `Informe de ${s.modality} guardado y consumo cargado a prefacturación.`);

        return {
          ...s,
          status: 'INFORMADO' as const,
          report,
          conclusion,
          performedBy: currentUser.name,
          images: images || s.images,
        };
      })
    );
  };

  // CONSUMPTIONS & PRE-INVOICE CALCULATION
  const getEncounterConsumptions = (encounterId: string): EncounterConsumptionItem[] => {
    return encounterConsumptions.filter((c) => c.encounterId === encounterId && c.status !== 'ANULADO');
  };

  const getEncounterPreInvoice = (encounterId: string) => {
    const list = getEncounterConsumptions(encounterId);
    const items = list.map((c) => ({
      id: c.id,
      concept: c.concept,
      quantity: c.quantity,
      unitPrice: c.unitPrice,
      subtotal: c.subtotal,
      sourceType: c.sourceType,
    }));
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    return { items, totalAmount };
  };

  const billEncounter = (
    encounterId: string,
    paymentMethod: PaymentMethod,
    invoiceType: InvoiceType = 'FACTURA_B',
    discountAmount: number = 0
  ): Invoice => {
    const enc = encounters.find((e) => e.id === encounterId);
    const pat = patients.find((p) => p.id === enc?.patientId);
    const own = owners.find((o) => o.id === pat?.ownerId);
    const { items, totalAmount } = getEncounterPreInvoice(encounterId);

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    const invoiceItems = items.map((it, idx) => ({
      id: 'inv-it-' + Date.now() + '-' + idx,
      description: it.concept,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      subtotal: it.subtotal,
    }));

    const newInvoice: Invoice = {
      id: 'inv-' + Date.now(),
      invoiceNumber: '0001-' + (invoices.length + 1).toString().padStart(8, '0'),
      type: invoiceType,
      pointOfSale: 1,
      date: new Date().toISOString().split('T')[0],
      ownerId: own?.id || 'owner-general',
      patientId: pat?.id,
      customerName: own ? `${own.firstName} ${own.lastName}` : 'Consumidor Final',
      customerDniCuit: own?.dni || own?.cuit || '00.000.000',
      customerTaxCondition: own?.taxCondition || 'Consumidor Final',
      items: invoiceItems,
      totalAmount: finalAmount,
      paymentMethod,
      caeNumber: '7' + Math.floor(10000000000000 + Math.random() * 90000000000000).toString(),
      caeExpirationDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      branchId: activeBranch.id,
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Mark all encounter consumptions as billed
    setEncounterConsumptions((prev) =>
      prev.map((c) => (c.encounterId === encounterId ? { ...c, isBilled: true, invoiceId: newInvoice.id } : c))
    );

    // Register financial movement
    addFinancialMovement({
      date: new Date().toISOString().split('T')[0],
      type: 'INGRESO',
      category: enc?.type === 'INTERNACION' ? 'Internación' : 'Consultas & Tratamientos',
      concept: `Cobro Factura ${newInvoice.invoiceNumber} - Atención de ${pat?.name || 'Paciente'}`,
      description: items.map((i) => i.concept).join(', '),
      amount: finalAmount,
      paymentMethod: paymentMethod as any,
      status: 'COBRADO',
      clientId: own?.id,
      clientName: own ? `${own.firstName} ${own.lastName}` : undefined,
    });

    logAudit('FACTURACION_ATENCION', 'Invoice', newInvoice.id, `Factura ${newInvoice.invoiceNumber} generada por ${finalAmount} para atención ${encounterId}`);
    showToast('success', 'Facturación Confirmada', `Comprobante ${newInvoice.invoiceNumber} generado por ${finalAmount.toLocaleString('es-AR')}.`);
    return newInvoice;
  };

  const updateServicePrice = (id: string, newPrice: number) => {
    setServicePrices((prev) => prev.map((sp) => (sp.id === id ? { ...sp, price: newPrice } : sp)));
    logAudit('PRECIO_SERVICIO_ACTUALIZADO', 'ServicePrice', id, `Precio actualizado a ${newPrice}`);
  };


  const updateHospitalPriority = (hospitalizationId: string, priority: HospitalPriority) => {
    setHospitalizations((prev) =>
      prev.map((h) => {
        if (h.id === hospitalizationId) {
          logAudit('CAMBIO_PRIORIDAD_HOSP', 'Hospitalization', hospitalizationId, `Prioridad cambiada a: ${priority}`);
          return { ...h, priority };
        }
        return h;
      })
    );
  };

  const updateFluidTherapy = (hospitalizationId: string, fluid: Hospitalization['fluidTherapy']) => {
    setHospitalizations((prev) =>
      prev.map((h) => {
        if (h.id === hospitalizationId) {
          logAudit('ACTUALIZACION_FLUIDOS', 'Hospitalization', hospitalizationId, `Fluidoterapia ${fluid.isActive ? 'ACTIVA' : 'DETENIDA'}: ${fluid.solutionType} a ${fluid.rateMlPerHour} ml/h`);
          return { ...h, fluidTherapy: fluid };
        }
        return h;
      })
    );
  };

  const addHospitalMedication = (patientId: string, med: Partial<MedicationSchedule>) => {
    const newMed: MedicationSchedule = {
      id: `med-${Date.now()}`,
      patientId,
      hospitalizationId: '',
      drugName: med.drugName || 'Fármaco',
      dose: med.dose || '1 ml',
      route: med.route || 'IV',
      frequency: med.frequency || 'Cada 8 hs',
      scheduledTime: med.scheduledTime || '08:00',
      status: 'PENDIENTE',
      notes: med.notes || '',
      productId: med.productId,
      ...med,
    };

    setHospitalizations((prev) => {
      const exists = prev.some((h) => h.patientId === patientId && h.status === 'ACTIVA');
      if (exists) {
        return prev.map((h) => {
          if (h.patientId === patientId && h.status === 'ACTIVA') {
            const updated = {
              ...h,
              medications: [...(h.medications || []), newMed],
            };
            syncHospitalizationToSupabase(updated);
            return updated;
          }
          return h;
        });
      } else {
        const newHosp: Hospitalization = {
          id: `hosp-${Date.now()}`,
          patientId,
          vetInChargeId: currentUser.id,
          vetInChargeName: currentUser.name,
          sector: 'UCI',
          kennelNumber: '01',
          admittedAt: new Date().toISOString(),
          primaryDiagnosis: 'Seguimiento Terapéutico',
          priority: 'ESTABLE',
          fluidTherapy: {
            isActive: false,
            solutionType: 'RINGER_LACTATO',
            volumeTotalMl: 500,
            rateMlPerHour: 0,
            infusionRoute: 'IV',
            startedAt: new Date().toISOString(),
            prescribedBy: currentUser.name,
          },
          feeding: {
            dietType: 'ORAL',
            foodBrand: 'Dieta estándar',
            amountGramsOrMl: 100,
            frequency: 'Cada 12 horas',
            tolerance: 'EXCELENTE',
          },
          eliminations: [],
          medications: [newMed],
          tasks: [],
          hourlySheet: [],
          intervalHours: 2,
          status: 'ACTIVA',
          branchId: activeBranch.id,
        };
        syncHospitalizationToSupabase(newHosp);
        return [newHosp, ...prev];
      }
    });

    logAudit('INDICACION_MEDICACION', 'Hospitalization', patientId, `Indicación de ${newMed.drugName} (${newMed.dose}) por ${currentUser.name}`);
  };

  const administerMedication = (hospitalizationId: string, medicationScheduleId: string, notes?: string) => {
    let result = { success: false, message: '' };

    setHospitalizations((prev) =>
      prev.map((h) => {
        if (h.id === hospitalizationId) {
          const med = h.medications.find((m) => m.id === medicationScheduleId);
          if (!med) {
            result = { success: false, message: 'Medicamento no encontrado' };
            return h;
          }

          if (med.status === 'REALIZADA') {
            result = {
              success: false,
              message: `⚠️ ADVERTENCIA: Esta medicación ya fue administrada previamente a las ${med.administeredAt?.slice(11, 16)} por ${med.administeredBy}.`,
            };
            showToast('warning', 'Medicación Ya Aplicada', `Ya fue registrada por ${med.administeredBy}`);
            return h;
          }

          // Mark as done
          const updatedMeds = h.medications.map((m) => {
            if (m.id === medicationScheduleId) {
              return {
                ...m,
                status: 'REALIZADA' as const,
                administeredAt: new Date().toISOString(),
                administeredBy: currentUser.name,
                notes: notes || m.notes,
              };
            }
            return m;
          });

          // Deduct stock if productId linked
          if (med.productId) {
            updateProductStock(med.productId, -1, 'USO_INTERNACION', `Uso internación: ${med.drugName} en paciente`);
          }

          // Register billable consumption for pre-invoicing
          const prod = products.find((p) => p.id === med.productId || p.commercialName.toLowerCase().includes(med.drugName.toLowerCase()));
          const unitPrice = prod?.salePrice || 4500;
          const consumption: EncounterConsumptionItem = {
            id: 'cons-' + Date.now() + '-med',
            encounterId: activeEncounterId || hospitalizationId,
            patientId: h.patientId,
            sourceType: 'MEDICAMENTO',
            sourceId: med.id,
            code: prod?.code || 'MED-APPL',
            concept: `Aplicación: ${med.drugName} (${med.dose} ${med.route})`,
            quantity: 1,
            unitPrice,
            subtotal: unitPrice,
            status: 'CONFIRMADO',
            performedAt: new Date().toISOString(),
            performedBy: currentUser.name,
            isBilled: false,
          };
          setEncounterConsumptions((cPrev) => [consumption, ...cPrev]);

          logAudit(
            'ADMINISTRACION_MEDICACION',
            'Hospitalization',
            hospitalizationId,
            `Administración de ${med.drugName} (${med.dose} ${med.route}) por ${currentUser.name}`
          );

          result = { success: true, message: `✅ Medicación ${med.drugName} administrada correctamente.` };
          showToast('success', 'Medicación Administrada', `${med.drugName} (${med.dose}) aplicada y cargada a cuenta.`);
          const updatedHosp = { ...h, medications: updatedMeds };
          syncHospitalizationToSupabase(updatedHosp);
          return updatedHosp;
        }
        return h;
      })
    );

    return result;
  };

  const addHourlySheetEntry = (
    hospitalizationId: string,
    entry: Omit<Hospitalization['hourlySheet'][0], 'id' | 'timestamp' | 'staffName'>
  ) => {
    const timeNow = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    const newEntry = {
      ...entry,
      id: `sheet-${Date.now()}`,
      timestamp: timeNow,
      staffName: currentUser.name,
    };

    setHospitalizations((prev) =>
      prev.map((h) => {
        if (h.id === hospitalizationId) {
          const updated = { ...h, hourlySheet: [newEntry, ...h.hourlySheet] };
          syncHospitalizationToSupabase(updated);
          return updated;
        }
        return h;
      })
    );

    logAudit('REGISTRO_HOJA_INTERNACION', 'Hospitalization', hospitalizationId, `Ronda horaria (${timeNow}) registrada por ${currentUser.name}`);
  };


  const dischargeHospitalPatient = (hospitalizationId: string, summary: string) => {
    setHospitalizations((prev) =>
      prev.map((h) => {
        if (h.id === hospitalizationId) {
          updatePatient(h.patientId, { status: 'ACTIVO' });
          logAudit('ALTA_MEDICA_INTERNACION', 'Hospitalization', hospitalizationId, `Alta médica otorgada. Resumen: ${summary}`);
          const updated: Hospitalization = {
            ...h,
            status: 'ALTA_MEDICA',
            dischargedAt: new Date().toISOString(),
            dischargeSummary: summary,
          };
          syncHospitalizationToSupabase(updated);
          return updated;
        }
        return h;
      })
    );
  };

  // Lab & Imaging & Vaccines
  const addSurgery = (data: Omit<SurgeryRecord, 'id'>): SurgeryRecord => {
    const newSurgery: SurgeryRecord = {
      ...data,
      id: `surg-${Date.now()}`,
    };
    setSurgeries((prev) => [newSurgery, ...prev]);
    syncSurgeryToSupabase(newSurgery);
    showToast('success', 'Cirugía Programada', `${newSurgery.procedureName} agendada para el ${newSurgery.date}`);
    logAudit('PROGRAMAR_CIRUGIA', 'SurgeryRecord', newSurgery.id, `Cirugía programada: ${newSurgery.procedureName} para paciente ID ${newSurgery.patientId} el ${newSurgery.date} a las ${newSurgery.startTime} hs`);
    return newSurgery;
  };

  const updateSurgeryStatus = (id: string, status: SurgeryRecord['status']) => {
    setSurgeries((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, status };
          syncSurgeryToSupabase(updated);
          return updated;
        }
        return s;
      })
    );
    showToast('info', 'Estado Quirúrgico Actualizado', `Cirugía actualizada a: ${status}`);
    logAudit('ACTUALIZAR_CIRUGIA', 'SurgeryRecord', id, `Estado quirúrgico modificado a ${status}`);
  };

  const addLabOrder = (data: Omit<LaboratoryOrder, 'id' | 'orderNumber' | 'requestedAt' | 'status'>) => {
    const newOrder: LaboratoryOrder = {
      ...data,
      id: `lab-${Date.now()}`,
      orderNumber: `LAB-${new Date().getFullYear()}-${(labOrders.length + 1).toString().padStart(4, '0')}`,
      requestedAt: new Date().toISOString(),
      status: 'SOLICITADO',
    };
    setLabOrders((prev) => [newOrder, ...prev]);
    syncLabOrderToSupabase(newOrder);
    showToast('info', 'Análisis Solicitado', `Orden ${newOrder.orderNumber} enviada a laboratorio.`);
    logAudit('ORDEN_LABORATORIO', 'LaboratoryOrder', newOrder.id, `Solicitud de ${newOrder.testType} para paciente ID ${newOrder.patientId}`);
  };

  const updateLabResults = (orderId: string, results: LaboratoryOrder['results'], conclusions: string) => {
    setLabOrders((prev) =>
      prev.map((lo) => {
        if (lo.id === orderId) {
          const updated: LaboratoryOrder = {
            ...lo,
            results,
            conclusions,
            status: 'FINALIZADO',
            resultsReadyAt: new Date().toISOString(),
          };
          syncLabOrderToSupabase(updated);
          logAudit('RESULTADOS_LABORATORIO', 'LaboratoryOrder', orderId, `Carga de resultados y conclusión para ${lo.testType}`);
          return updated;
        }
        return lo;
      })
    );
  };

  const updateLabOrderStatus = (orderId: string, status: LaboratoryOrder['status']) => {
    setLabOrders((prev) =>
      prev.map((lo) => {
        if (lo.id === orderId) {
          const updated: LaboratoryOrder = { ...lo, status };
          if (status === 'MUESTRA_OBTENIDA') updated.sampleCollectedAt = new Date().toISOString();
          if (status === 'FINALIZADO') updated.resultsReadyAt = new Date().toISOString();
          syncLabOrderToSupabase(updated);
          logAudit('ESTADO_LABORATORIO', 'LaboratoryOrder', orderId, `Estado de orden de laboratorio cambiado a ${status}`);
          return updated;
        }
        return lo;
      })
    );
    showToast('info', 'Estado Actualizado', `Orden de laboratorio: ${status}`);
  };

  const addImagingStudy = (data: Omit<ImagingStudy, 'id' | 'studyNumber' | 'date' | 'status'>) => {
    const newStudy: ImagingStudy = {
      ...data,
      id: `img-${Date.now()}`,
      studyNumber: `IMG-${new Date().getFullYear()}-${(imagingStudies.length + 1).toString().padStart(4, '0')}`,
      date: new Date().toISOString(),
      status: 'INFORMADO',
    };
    setImagingStudies((prev) => [newStudy, ...prev]);
    syncImagingToSupabase(newStudy);
    showToast('success', 'Estudio Registrado', `Informe de ${newStudy.modality} guardado.`);
    logAudit('ESTUDIO_IMAGEN', 'ImagingStudy', newStudy.id, `Estudio de ${newStudy.modality} (${newStudy.region}) registrado`);
  };

  const updateImagingStudy = (studyId: string, updates: Partial<ImagingStudy>) => {
    setImagingStudies((prev) =>
      prev.map((is) => {
        if (is.id === studyId) {
          const updated = { ...is, ...updates };
          syncImagingToSupabase(updated);
          logAudit('ACTUALIZAR_IMAGEN', 'ImagingStudy', studyId, `Estudio de ${is.modality} actualizado`);
          return updated;
        }
        return is;
      })
    );
    showToast('info', 'Estudio Actualizado', 'Informe de imagenología actualizado correctamente.');
  };

  const addVaccination = (data: Omit<VaccinationRecord, 'id' | 'administeredDate' | 'administeredBy' | 'vetLicense'>) => {
    const newVac: VaccinationRecord = {
      ...data,
      id: `vac-${Date.now()}`,
      administeredDate: new Date().toISOString().split('T')[0],
      administeredBy: currentUser.name,
      vetLicense: currentUser.licenseNumber || 'MP-VET',
      certificateGenerated: true,
    };
    setVaccinations((prev) => [newVac, ...prev]);
    syncVaccinationToSupabase(newVac);
    showToast('success', 'Vacuna Registrada', `${newVac.vaccineName} aplicada (Lote ${newVac.batchNumber}).`);
    logAudit('VACUNACION', 'VaccinationRecord', newVac.id, `Vacuna ${newVac.vaccineName} (Lote: ${newVac.batchNumber}) aplicada a paciente ID ${newVac.patientId}`);
  };

  // Pharmacy & Inventory
  const addProduct = (data: Omit<Product, 'id' | 'branchId'>) => {
    const newProd: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      branchId: activeBranch.id,
    };
    setProducts((prev) => [newProd, ...prev]);
    syncProductToSupabase(newProd);
    showToast('success', 'Producto Registrado', `${newProd.commercialName} ingresado a farmacia.`);
    logAudit('CREAR_PRODUCTO', 'Product', newProd.id, `Alta de producto farmacia: ${newProd.commercialName} (${newProd.code})`);
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          const updated = { ...prod, ...updates };
          syncProductToSupabase(updated);
          logAudit('ACTUALIZAR_PRODUCTO', 'Product', productId, `Fármaco/Insumo ${prod.commercialName} actualizado`);
          return updated;
        }
        return prod;
      })
    );
    showToast('info', 'Producto Actualizado', 'Los datos del fármaco fueron actualizados.');
  };

  const updateProductStock = (productId: string, quantityChange: number, type: InventoryMovement['type'], reason: string) => {
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === productId) {
          const previousStock = prod.currentStock;
          const newStock = Math.max(0, previousStock + quantityChange);

          const movement: InventoryMovement = {
            id: `mov-${Date.now()}`,
            productId,
            productName: prod.commercialName,
            type,
            quantity: quantityChange,
            previousStock,
            newStock,
            batch: prod.currentBatch,
            reason,
            performedBy: currentUser.name,
            timestamp: new Date().toISOString(),
          };
          setInventoryMovements((m) => [movement, ...m]);
          showToast('info', 'Stock Actualizado', `${prod.commercialName}: ${quantityChange > 0 ? '+' : ''}${quantityChange} (${newStock} unid.)`);
          logAudit('MOVIMIENTO_STOCK', 'Product', productId, `${type}: ${quantityChange > 0 ? '+' : ''}${quantityChange} unid. (${prod.commercialName}) -> Stock final: ${newStock}`);
          const updatedProd = { ...prod, currentStock: newStock };
          syncProductToSupabase(updatedProd);
          return updatedProd;
        }
        return prod;
      })
    );
  };

  // Appointments & Triage
  const addAppointment = (data: Omit<Appointment, 'id' | 'branchId'>) => {
    const newApt: Appointment = {
      ...data,
      id: `app-${Date.now()}`,
      branchId: activeBranch.id,
    };
    setAppointments((prev) => [newApt, ...prev]);
    syncAppointmentToSupabase(newApt);
    showToast('success', 'Turno Agendado', `Cita para ${newApt.date} a las ${newApt.time} hs.`);
    logAudit('NUEVO_TURNO', 'Appointment', newApt.id, `Turno agendado: ${newApt.type} para fecha ${newApt.date} ${newApt.time}`);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, status };
          syncAppointmentToSupabase(updated);
          logAudit('ESTADO_TURNO', 'Appointment', id, `Turno ${a.date} ${a.time} cambiado a: ${status}`);
          return updated;
        }
        return a;
      })
    );
  };

  const addTriageEntry = (data: Omit<TriageEntry, 'id' | 'arrivedAt' | 'waitTimeMinutes' | 'status'>) => {
    const newEntry: TriageEntry = {
      ...data,
      id: `triage-${Date.now()}`,
      arrivedAt: new Date().toISOString(),
      waitTimeMinutes: 0,
      status: 'EN_ESPERA',
    };
    setTriageList((prev) => [newEntry, ...prev]);
    syncTriageToSupabase(newEntry);
    showToast('warning', 'Ingreso a Sala de Espera', `Triage: ${data.priority}`);
    logAudit('INGRESO_TRIAGE', 'TriageEntry', newEntry.id, `Paciente ingresado a sala de espera. Triage: ${data.priority} - Motivo: ${data.chiefComplaint}`);
  };

  const updateTriageStatus = (id: string, status: TriageEntry['status']) => {
    setTriageList((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, status };
          syncTriageToSupabase(updated);
          logAudit('ESTADO_TRIAGE', 'TriageEntry', id, `Sala de espera: estado actualizado a ${status}`);
          return updated;
        }
        return t;
      })
    );
  };

  const updateTriagePriority = (id: string, priority: TriagePriority) => {
    setTriageList((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, priority };
          syncTriageToSupabase(updated);
          logAudit('RECLASIFICACION_TRIAGE', 'TriageEntry', id, `Triage reclasificado a: ${priority}`);
          return updated;
        }
        return t;
      })
    );
    showToast('info', 'Triage Reclasificado', `El paciente fue reclasificado a prioridad ${priority}.`);
  };

  // Invoices & Estimates
  const createInvoice = (data: Omit<Invoice, 'id' | 'invoiceNumber' | 'date' | 'caeNumber' | 'caeExpirationDate' | 'branchId'>): Invoice => {
    const invNumber = `0001-${(invoices.length + 100).toString().padStart(8, '0')}`;
    const cae = Math.floor(10000000000000 + Math.random() * 90000000000000).toString();
    const exp = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const newInv: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      invoiceNumber: invNumber,
      date: new Date().toISOString().split('T')[0],
      caeNumber: cae,
      caeExpirationDate: exp,
      branchId: activeBranch.id,
    };
    setInvoices((prev) => [newInv, ...prev]);
    syncInvoiceToSupabase(newInv);
    showToast('success', 'Factura AFIP Emitida', `Comprobante ${newInv.invoiceNumber} ($${newInv.totalAmount.toLocaleString()}) autorizado con CAE.`);
    logAudit('EMISION_FACTURA', 'Invoice', newInv.id, `Factura emitida ${newInv.type} ${invNumber} por $${newInv.totalAmount.toLocaleString()} a ${newInv.customerName}`);
    return newInv;
  };

  const createEstimate = (data: Omit<Estimate, 'id' | 'estimateNumber' | 'date' | 'status'>): Estimate => {
    const estNumber = `PRES-${new Date().getFullYear()}-${(estimates.length + 1).toString().padStart(3, '0')}`;
    const newEst: Estimate = {
      ...data,
      id: `est-${Date.now()}`,
      estimateNumber: estNumber,
      date: new Date().toISOString().split('T')[0],
      status: 'BORRADOR',
    };
    setEstimates((prev) => [newEst, ...prev]);
    logAudit('CREAR_PRESUPUESTO', 'Estimate', newEst.id, `Presupuesto creado ${estNumber} por $${newEst.totalAmount.toLocaleString()}`);
    return newEst;
  };

  const convertEstimateToInvoice = (estimateId: string, paymentMethod: Invoice['paymentMethod']): Invoice | null => {
    const est = estimates.find((e) => e.id === estimateId);
    if (!est) return null;

    const owner = owners.find((o) => o.id === est.ownerId);
    const invoice = createInvoice({
      type: 'FACTURA_B',
      pointOfSale: 1,
      ownerId: est.ownerId,
      patientId: est.patientId,
      customerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Cliente Mostrador',
      customerDniCuit: owner?.dni || '00.000.000',
      customerTaxCondition: 'Consumidor Final',
      items: est.items,
      totalAmount: est.totalAmount,
      paymentMethod,
    });

    setEstimates((prev) =>
      prev.map((e) => (e.id === estimateId ? { ...e, status: 'ACEPTADO' } : e))
    );

    logAudit('CONVERTIR_PRESUPUESTO_FACTURA', 'Estimate', estimateId, `Presupuesto ${est.estimateNumber} convertido a Factura ${invoice.invoiceNumber}`);
    return invoice;
  };

  // Financial Actions
  const addFinancialMovement = (data: Omit<FinancialMovement, 'id' | 'createdAt' | 'createdBy'>): FinancialMovement => {
    const newMov: FinancialMovement = {
      ...data,
      id: 'fin-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      branchId: activeBranch.id,
    };
    setFinancialMovements((prev) => [newMov, ...prev]);
    logAudit('MOVIMIENTO_FINANCIERO_CREADO', 'FinancialMovement', newMov.id, `${newMov.type}: ${newMov.concept} por ${newMov.amount}`);
    return newMov;
  };

  const voidFinancialMovement = (id: string, reason: string) => {
    setFinancialMovements((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              isVoided: true,
              voidReason: reason,
              status: 'ANULADO',
            }
          : m
      )
    );
    logAudit('MOVIMIENTO_FINANCIERO_ANULADO', 'FinancialMovement', id, `Movimiento ${id} anulado por motivo: ${reason}`);
  };

  const addAccountDebt = (data: Omit<AccountDebt, 'id' | 'balance' | 'paidAmount' | 'payments' | 'createdAt' | 'createdBy'>): AccountDebt => {
    const newDebt: AccountDebt = {
      ...data,
      id: 'deb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      paidAmount: 0,
      balance: data.totalAmount,
      payments: [],
      createdAt: new Date().toISOString(),
      createdBy: currentUser.name,
      branchId: activeBranch.id,
    };
    setAccountDebts((prev) => [newDebt, ...prev]);
    logAudit('CUENTA_DEUDA_CREADA', 'AccountDebt', newDebt.id, `Deuda a ${newDebt.type}: ${newDebt.entityName} por ${newDebt.totalAmount}`);
    return newDebt;
  };

  const registerDebtPayment = (debtId: string, amount: number, paymentMethod: FinancialPaymentMethod, notes?: string) => {
    setAccountDebts((prev) =>
      prev.map((d) => {
        if (d.id !== debtId) return d;
        const payment: PaymentInstallment = {
          id: 'pay-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          date: new Date().toISOString().split('T')[0],
          amount,
          paymentMethod,
          notes: notes || 'Pago registrado',
          registeredBy: currentUser.name,
        };
        const newPaid = d.paidAmount + amount;
        const newBalance = Math.max(0, d.totalAmount - newPaid);
        const newStatus = newBalance === 0 ? 'PAGADA' : 'PARCIAL';

        // Auto-create financial movement for the payment
        addFinancialMovement({
          date: new Date().toISOString().split('T')[0],
          type: d.type === 'COBRAR' ? 'INGRESO' : 'GASTO',
          category: d.type === 'COBRAR' ? 'Cobro de Cuentas Pendientes' : 'Pago de Proveedores',
          concept: `Pago ${d.type === 'COBRAR' ? 'recibido de' : 'realizado a'} ${d.entityName}`,
          description: `Abono de deuda: ${d.concept}. Saldo restante: ${newBalance}`,
          amount,
          paymentMethod,
          status: d.type === 'COBRAR' ? 'COBRADO' : 'PAGADO',
          clientName: d.type === 'COBRAR' ? d.entityName : undefined,
          supplierName: d.type === 'PAGAR' ? d.entityName : undefined,
          notes,
        });

        return {
          ...d,
          paidAmount: newPaid,
          balance: newBalance,
          status: newStatus,
          payments: [...d.payments, payment],
        };
      })
    );
  };

  const addCustomCategory = (type: 'INGRESO' | 'GASTO', category: string) => {
    const trimmed = category.trim();
    if (!trimmed) return;
    if (type === 'INGRESO') {
      setIncomeCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    } else {
      setExpenseCategories((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    }
  };

  // Documents & Consents
  const addDocument = (data: Omit<ClinicalDocument, 'id' | 'createdAt'>) => {
    const newDoc: ClinicalDocument = {
      ...data,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    syncDocumentToSupabase(newDoc);
    logAudit('DOCUMENTO_CLINICO', 'ClinicalDocument', newDoc.id, `Documento generado: ${newDoc.title}`);
  };

  const signDocument = (docId: string, signerName: string, signerDni: string, signatureDataUrl: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          const updated: ClinicalDocument = {
            ...d,
            signedByOwnerName: signerName,
            signedByOwnerDni: signerDni,
            signatureDataUrl,
            isSigned: true,
          };
          syncDocumentToSupabase(updated);
          logAudit('FIRMA_DIGITAL_CONSENTIMIENTO', 'ClinicalDocument', docId, `Consentimiento "${d.title}" firmado digitalmente por ${signerName} (DNI ${signerDni})`);
          return updated;
        }
        return d;
      })
    );
  };

  const addClinicalEvolution = (entry: Omit<ClinicalEvolutionEntry, 'id' | 'createdAt' | 'status'>): ClinicalEvolutionEntry => {
    const newEntry: ClinicalEvolutionEntry = {
      ...entry,
      id: 'evo-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      createdAt: new Date().toISOString(),
      status: 'BORRADOR',
    };
    setClinicalEvolutions((prev) => [newEntry, ...prev]);
    logAudit('EVOLUCION_CLINICA_CREAR', 'ClinicalEvolution', newEntry.id, `Evolución ${newEntry.type} creada para paciente ${newEntry.patientId}`);
    return newEntry;
  };

  const signClinicalEvolution = (id: string, vetLicense: string) => {
    setClinicalEvolutions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'FIRMADA', vetLicense, signedAt: new Date().toISOString() } : e))
    );
    logAudit('EVOLUCION_CLINICA_FIRMAR', 'ClinicalEvolution', id, `Evolución ${id} firmada con matrícula ${vetLicense}`);
  };

  const addEvolutionAddendum = (evolutionId: string, addendum: { content: string; justificationReason: string; authorName: string }) => {
    setClinicalEvolutions((prev) =>
      prev.map((e) => {
        if (e.id !== evolutionId) return e;
        const newAddendum = {
          id: 'add-' + Date.now(),
          addedAt: new Date().toISOString(),
          authorName: addendum.authorName,
          content: addendum.content,
          justificationReason: addendum.justificationReason,
        };
        return {
          ...e,
          addenda: [...(e.addenda || []), newAddendum],
        };
      })
    );
    logAudit('EVOLUCION_CLINICA_ADDENDUM', 'ClinicalEvolution', evolutionId, `Addendum agregado a evolución ${evolutionId}`);
  };

  return (
    <VetContext.Provider
      value={{
        activeView,
        setActiveView,
        selectedPatientId,
        setSelectedPatientId,
        selectedOwnerId,
        setSelectedOwnerId,
        activePatientTab,
        setActivePatientTab,

        currentUser,
        setCurrentUser: switchCurrentUser,
        activeBranch,
        setActiveBranch: switchActiveBranch,
        users,
        branches,

        owners,
        patients,
        problems,
        vitals,
        consultations,
        hospitalizations,
        surgeries,
        labOrders,
        imagingStudies,
        vaccinations,
        products,
        inventoryMovements,
        appointments,
        triageList,
        invoices,
        estimates,
        cashSession,
        financialMovements,
        accountDebts,
        incomeCategories,
        expenseCategories,
        addFinancialMovement,
        voidFinancialMovement,
        addAccountDebt,
        registerDebtPayment,
        addCustomCategory,
        documents,
        auditLogs,
        regulatoryRules,
        controlledDrugs,
        controlledMovements,
        pathologicalWaste,
        prescriptions,
        antimicrobialRecords,
    clinicalEvolutions,
    addClinicalEvolution,
    signClinicalEvolution,
    addEvolutionAddendum,

        addRegulatoryRule,
        updateRegulatoryRuleStatus,
        addControlledMovement,
        addPathologicalWaste,
        addPrescription,
        addClinicalAmendment,

        addOwner,
        updateOwner,
        addPatient,
        updatePatient,
        deletePatient,
        addPatientAlert,
        removePatientAlert,
        recordPatientWeight,
        addProblem,
        updateProblemStatus,

        addVitalSigns,
        addConsultation,

        admitPatientToHospital,
        updateHospitalPriority,
        updateFluidTherapy,
        addHospitalMedication,
        administerMedication,
        addHourlySheetEntry,
        dischargeHospitalPatient,

        addSurgery,
        updateSurgeryStatus,
        addLabOrder,
        updateLabResults,
        updateLabOrderStatus,
        addImagingStudy,
        updateImagingStudy,
        addVaccination,

        addProduct,
        updateProduct,
        updateProductStock,

        addAppointment,
        updateAppointmentStatus,
        addTriageEntry,
        updateTriageStatus,
        updateTriagePriority,

        createInvoice,
        createEstimate,
        convertEstimateToInvoice,

        addDocument,
        signDocument,

        logAudit,
        clearAllDataToCleanProduction,

        encounters,
        activeEncounterId,
        setActiveEncounterId,
        procedures,
        encounterConsumptions,
        servicePrices,
        startEncounter,
        closeEncounter,
        updateEncounter,
        addProcedure,
        performProcedure,
        addEncounterLabOrder,
        performLabOrder,
        addEncounterImagingStudy,
        performImagingStudy,
        getEncounterConsumptions,
        getEncounterPreInvoice,
        billEncounter,
        updateServicePrice,


        quickModal,
        setQuickModal,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,

        // Advanced Clinical Tools & Modals
        isCalculatorsOpen,
        setIsCalculatorsOpen,
        openCalculators,
        isPrintModalOpen,
        printData,
        openPrintModal,
        closePrintModal,
        isMonitorOpen,
        monitorPatientId,
        openMonitor,
        closeMonitor,

        // Next-Gen Modals (VET SYSTEM 3.0)
        isDentalChartOpen,
        dentalPatientId,
        openDentalChart,
        closeDentalChart,

        isBodyMapOpen,
        bodyMapPatientId,
        openBodyMap,
        closeBodyMap,

        isAnesthesiaChartOpen,
        anesthesiaPatientId,
        anesthesiaSurgeryName,
        openAnesthesiaChart,
        closeAnesthesiaChart,

        isWhatsAppHubOpen,
        whatsAppData,
        openWhatsAppHub,
        closeWhatsAppHub,

        isImagingAnnotatorOpen,
        imagingAnnotatorData,
        openImagingAnnotator,
        closeImagingAnnotator,

        // Toast System
        toasts,
        showToast,
        dismissToast,

        // Supabase Cloud State
        isCloudConnected,
        cloudSyncStatus,
      }}
    >
      {children}
    </VetContext.Provider>
  );
};

export const useVet = () => {
  const context = useContext(VetContext);
  if (!context) {
    throw new Error('useVet debe ser usado dentro de un VetProvider');
  }
  return context;
};
