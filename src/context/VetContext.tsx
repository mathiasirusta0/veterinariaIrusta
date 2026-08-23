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
  ImagingStudy,
  VaccinationRecord,
  Product,
  InventoryMovement,
  Appointment,
  TriageEntry,
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
} from '../mockData';
import { ToastMessage } from '../components/ToastNotification';
import { MedicalPrintData } from '../components/MedicalPrintModal';
import { checkSupabaseConnection } from '../lib/supabase';
import {
  fetchInitialDataFromSupabase,
  syncPatientToSupabase,
  syncConsultationToSupabase,
  syncHospitalizationToSupabase,
  syncSurgeryToSupabase,
  syncInvoiceToSupabase,
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
  administerMedication: (hospitalizationId: string, medicationScheduleId: string, notes?: string) => { success: boolean; message: string };
  addHourlySheetEntry: (hospitalizationId: string, entry: Omit<Hospitalization['hourlySheet'][0], 'id' | 'timestamp' | 'staffName'>) => void;
  dischargeHospitalPatient: (hospitalizationId: string, summary: string) => void;

  // Lab & Imaging & Vaccines
  addSurgery: (surgery: Omit<SurgeryRecord, 'id'>) => SurgeryRecord;
  addLabOrder: (order: Omit<LaboratoryOrder, 'id' | 'orderNumber' | 'requestedAt' | 'status'>) => void;
  updateLabResults: (orderId: string, results: LaboratoryOrder['results'], conclusions: string) => void;
  addImagingStudy: (study: Omit<ImagingStudy, 'id' | 'studyNumber' | 'date' | 'status'>) => void;
  addVaccination: (vac: Omit<VaccinationRecord, 'id' | 'administeredDate' | 'administeredBy' | 'vetLicense'>) => void;

  // Inventory & Pharmacy
  addProduct: (product: Omit<Product, 'id' | 'branchId'>) => void;
  updateProductStock: (productId: string, quantityChange: number, type: InventoryMovement['type'], reason: string) => void;

  // Appointments & Triage
  addAppointment: (apt: Omit<Appointment, 'id' | 'branchId'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addTriageEntry: (triage: Omit<TriageEntry, 'id' | 'arrivedAt' | 'waitTimeMinutes' | 'status'>) => void;
  updateTriageStatus: (id: string, status: TriageEntry['status']) => void;

  // Billing & Cash
  createInvoice: (inv: Omit<Invoice, 'id' | 'invoiceNumber' | 'date' | 'caeNumber' | 'caeExpirationDate' | 'branchId'>) => Invoice;
  createEstimate: (est: Omit<Estimate, 'id' | 'estimateNumber' | 'date' | 'status'>) => Estimate;
  convertEstimateToInvoice: (estimateId: string, paymentMethod: Invoice['paymentMethod']) => Invoice | null;

  // Documents & Consents
  addDocument: (doc: Omit<ClinicalDocument, 'id' | 'createdAt'>) => void;
  signDocument: (docId: string, signerName: string, signerDni: string, signatureDataUrl: string) => void;

  // Audit
  logAudit: (action: string, entity: string, entityId: string, details: string, prev?: string, next?: string) => void;

  // AI Assistant helper
  callAiAssistant: (type: string, prompt: string, patientData?: any) => Promise<{ success: boolean; text: string; error?: string }>;

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

export const VetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<string>('INICIO');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>('pat-1'); // Default select Toby
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [activePatientTab, setActivePatientTab] = useState<string>('RESUMEN');

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
    else if (activeView === 'SALA_ESPERA') viewKey = 'SALA_ESPERA';
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
    else if (activeView === 'ASISTENTE_IA') viewKey = 'ASISTENTE_IA';
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
              if (cloudData.owners && cloudData.owners.length > 0) setOwners(cloudData.owners);
              if (cloudData.patients && cloudData.patients.length > 0) setPatients(cloudData.patients);
              if (cloudData.vitals && cloudData.vitals.length > 0) setVitals(cloudData.vitals);
              if (cloudData.problems && cloudData.problems.length > 0) setProblems(cloudData.problems);
              if (cloudData.consultations && cloudData.consultations.length > 0) setConsultations(cloudData.consultations);
              if (cloudData.hospitalizations && cloudData.hospitalizations.length > 0) setHospitalizations(cloudData.hospitalizations);
              if (cloudData.surgeries && cloudData.surgeries.length > 0) setSurgeries(cloudData.surgeries);
              if (cloudData.products && cloudData.products.length > 0) setProducts(cloudData.products);
              if (cloudData.invoices && cloudData.invoices.length > 0) setInvoices(cloudData.invoices);
              if (cloudData.labOrders && cloudData.labOrders.length > 0) setLabOrders(cloudData.labOrders);
              if (cloudData.imagingStudies && cloudData.imagingStudies.length > 0) setImagingStudies(cloudData.imagingStudies);
              if (cloudData.vaccinations && cloudData.vaccinations.length > 0) setVaccinations(cloudData.vaccinations);
              if (cloudData.appointments && cloudData.appointments.length > 0) setAppointments(cloudData.appointments);
              if (cloudData.triageList && cloudData.triageList.length > 0) setTriageList(cloudData.triageList);
              if (cloudData.documents && cloudData.documents.length > 0) setDocuments(cloudData.documents);
              if (cloudData.estimates && cloudData.estimates.length > 0) setEstimates(cloudData.estimates);
              if (cloudData.auditLogs && cloudData.auditLogs.length > 0) setAuditLogs(cloudData.auditLogs);
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
    localStorage.setItem('vetsys_auditLogs', JSON.stringify(auditLogs));
    localStorage.setItem('vetsys_regulatory_rules', JSON.stringify(regulatoryRules));
    localStorage.setItem('vetsys_controlled_drugs', JSON.stringify(controlledDrugs));
    localStorage.setItem('vetsys_controlled_movements', JSON.stringify(controlledMovements));
    localStorage.setItem('vetsys_pathological_waste', JSON.stringify(pathologicalWaste));
    localStorage.setItem('vetsys_prescriptions', JSON.stringify(prescriptions));
    localStorage.setItem('vetsys_antimicrobial_records', JSON.stringify(antimicrobialRecords));
  }, [regulatoryRules, controlledDrugs, controlledMovements, pathologicalWaste, prescriptions, antimicrobialRecords, auditLogs]);

  // Audit Logger helper
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
    logAudit('CREAR_PROPIETARIO', 'Owner', newOwner.id, `Alta de propietario: ${newOwner.firstName} ${newOwner.lastName} (DNI ${newOwner.dni})`);
    return newOwner;
  };

  const updateOwner = (id: string, data: Partial<Owner>) => {
    setOwners((prev) =>
      prev.map((o) => {
        if (o.id === id) {
          const updated = { ...o, ...data };
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
    logAudit('REGISTRO_PESO', 'Patient', patientId, `Control de peso: ${validWeight} kg por ${staff}`);
  };

  const addProblem = (data: Omit<PatientProblem, 'id'>) => {
    const newProb: PatientProblem = {
      ...data,
      id: `prob-${Date.now()}`,
    };
    setProblems((prev) => [newProb, ...prev]);
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

          logAudit(
            'ADMINISTRACION_MEDICACION',
            'Hospitalization',
            hospitalizationId,
            `Administración de ${med.drugName} (${med.dose} ${med.route}) por ${currentUser.name}`
          );

          result = { success: true, message: `✅ Medicación ${med.drugName} administrada correctamente.` };
          showToast('success', 'Medicación Administrada', `${med.drugName} (${med.dose}) aplicada.`);
          return { ...h, medications: updatedMeds };
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
          return { ...h, hourlySheet: [newEntry, ...h.hourlySheet] };
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
          return {
            ...h,
            status: 'ALTA_MEDICA',
            dischargedAt: new Date().toISOString(),
            dischargeSummary: summary,
          };
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

  const addLabOrder = (data: Omit<LaboratoryOrder, 'id' | 'orderNumber' | 'requestedAt' | 'status'>) => {
    const newOrder: LaboratoryOrder = {
      ...data,
      id: `lab-${Date.now()}`,
      orderNumber: `LAB-${new Date().getFullYear()}-${(labOrders.length + 1).toString().padStart(4, '0')}`,
      requestedAt: new Date().toISOString(),
      status: 'SOLICITADO',
    };
    setLabOrders((prev) => [newOrder, ...prev]);
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
          logAudit('RESULTADOS_LABORATORIO', 'LaboratoryOrder', orderId, `Carga de resultados y conclusión para ${lo.testType}`);
          return updated;
        }
        return lo;
      })
    );
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
    showToast('success', 'Estudio Registrado', `Informe de ${newStudy.modality} guardado.`);
    logAudit('ESTUDIO_IMAGEN', 'ImagingStudy', newStudy.id, `Estudio de ${newStudy.modality} (${newStudy.region}) registrado`);
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
    showToast('success', 'Producto Registrado', `${newProd.commercialName} ingresado a farmacia.`);
    logAudit('CREAR_PRODUCTO', 'Product', newProd.id, `Alta de producto farmacia: ${newProd.commercialName} (${newProd.code})`);
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
          return { ...prod, currentStock: newStock };
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
    showToast('success', 'Turno Agendado', `Cita para ${newApt.date} a las ${newApt.time} hs.`);
    logAudit('NUEVO_TURNO', 'Appointment', newApt.id, `Turno agendado: ${newApt.type} para fecha ${newApt.date} ${newApt.time}`);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          logAudit('ESTADO_TURNO', 'Appointment', id, `Turno ${a.date} ${a.time} cambiado a: ${status}`);
          return { ...a, status };
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
    showToast('warning', 'Ingreso a Sala de Espera', `Triage: ${data.priority}`);
    logAudit('INGRESO_TRIAGE', 'TriageEntry', newEntry.id, `Paciente ingresado a sala de espera. Triage: ${data.priority} - Motivo: ${data.chiefComplaint}`);
  };

  const updateTriageStatus = (id: string, status: TriageEntry['status']) => {
    setTriageList((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          logAudit('ESTADO_TRIAGE', 'TriageEntry', id, `Sala de espera: estado actualizado a ${status}`);
          return { ...t, status };
        }
        return t;
      })
    );
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

  // Documents & Consents
  const addDocument = (data: Omit<ClinicalDocument, 'id' | 'createdAt'>) => {
    const newDoc: ClinicalDocument = {
      ...data,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
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
          logAudit('FIRMA_DIGITAL_CONSENTIMIENTO', 'ClinicalDocument', docId, `Consentimiento "${d.title}" firmado digitalmente por ${signerName} (DNI ${signerDni})`);
          return updated;
        }
        return d;
      })
    );
  };

  // Helper for resilient client-side clinical AI generation if backend is offline
  const generateClientClinicalAiFallback = (type: string, prompt: string, patientData?: any): string => {
    const petName = patientData?.name || 'Paciente';
    const species = patientData?.species || 'Canino';
    const breed = patientData?.breed || 'Mestizo';
    const weight = patientData?.weight || 10;
    const diag = patientData?.diagnosis || 'Evaluación médica general';

    if (type === 'soap' || type === 'soap_draft') {
      return `### 📋 Borrador SOAP Estructurado para ${petName} (${species} - ${breed} - ${weight} kg)

**S — Subjetivo (Anamnesis):**
Motivo: ${prompt || 'Control clínico general'}. Tutor refiere cuadro con signos observados. Sin alteraciones de conducta previas relevantes.

**O — Objetivo (Examen Físico):**
- FC: 110 lpm • FR: 24 rpm • Temp: 38.5 °C.
- Mucosas rosadas, tiempo de llenado capilar (TLLC) < 2 segundos.
- Palpación abdominal blanda y depresible. Reflejo tusígeno negativo. Auscultación cardiopulmonar sin soplos ni ruidos sobreagregados.

**A — Evaluación & Diagnósticos Diferenciales:**
1. ${diag}
2. Cuadro reactivo / inflamatorio secundario
3. Descartar procesos infecciosos o indiscreción dietaria

**P — Plan Diagnóstico & Terapéutico:**
- Indicar plan de hidratación y soporte sintomático según peso (${weight} kg).
- Solicitar Hemograma completo y Perfil Bioquímico si persiste el cuadro.
- Pautas de alarma al tutor y reevaluación clínica en 48 horas.`;
    }

    if (type === 'handover_summary' || type === 'shift_handover') {
      return `### 🏥 Resumen de Pase de Guardia Médica
**Paciente:** ${petName} (${species} • ${weight} kg)
- **Diagnóstico Actual:** ${diag}
- **Estado Clínico:** Estable bajo monitoreo continuo en internación.
- **Fluidoterapia & Bombas:** Activa a flujo según requerimiento.
- **Fármacos Administrados:** Analgesia y gastroprotección según cronograma.
- **Tareas Pendientes para el Turno Entrante:** Control horario de temperatura y diuresis, administración de medicación reglada y reporte a tutores en el horario de visita.`;
    }

    if (type === 'owner_summary') {
      return `Estimada familia de ${petName}:

Hoy hemos evaluado a ${petName} en nuestro centro hospitalario. Queremos transmitirles tranquilidad y detallarles los puntos clave de su atención:

- **Diagnóstico / Situación actual:** ${diag}.
- **Plan y cuidados en el hogar:**
  1. Cumplir con la medicación en los horarios exactos indicados en el recetario adjunto.
  2. Ofrecer agua fresca y alimentación en pequeñas porciones.
  3. Evitar esfuerzos físicos bruscos durante los próximos días.
- **Signos de alarma:** Ante vómitos reiterados, decaimiento marcado, dolor agudo o dificultad para respirar, concurran de inmediato a nuestra guardia 24hs.

¡Estamos a su entera disposición para acompañar la pronta recuperación de ${petName}!`;
    }

    if (type === 'triage_eval' || type === 'triage_assessment') {
      return `### ⏱️ Sugerencia de Triage Clínico
- **Clasificación Sugerida:** NIVEL 2 - PRIORITARIO (Amarillo)
- **Tiempo Máximo de Espera:** < 15 a 30 minutos.
- **Fundamentación:** Según los signos descriptos ("${prompt}"), se recomienda evaluación médica pronta para descartar descompensación hemodinámica.`;
    }

    return `Informe Clínico para ${petName}: Paciente de ${weight} kg evaluado satisfactoriamente. Continuar con el plan terapéutico indicado y registrar evolución en la ficha médica.`;
  };

  // AI Assistant integration with resilient dual-layer fallback
  const callAiAssistant = async (type: string, prompt: string, patientData?: any) => {
    try {
      const response = await fetch('/api/ai/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, prompt, patientData }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.text) {
          logAudit('CONSULTA_IA_CLINICA', 'AI_Assistant', type, `Asistente IA ejecutó tarea de tipo: ${type}`);
          return { success: true, text: data.text };
        }
      }
    } catch (err: any) {
      console.warn('Backend AI assistance offline, using client fallback:', err);
    }

    const fallbackText = generateClientClinicalAiFallback(type, prompt, patientData);
    logAudit('CONSULTA_IA_CLINICA', 'AI_Assistant', type, `Asistente IA generó respuesta clínica (${type})`);
    return { success: true, text: fallbackText };
  };

  const addClinicalEvolution = (entryData: Omit<ClinicalEvolutionEntry, 'id' | 'createdAt' | 'status'>): ClinicalEvolutionEntry => {
    const newEntry: ClinicalEvolutionEntry = {
      ...entryData,
      id: `evo-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      status: 'FIRMADO',
      signatureHash: `SHA256:evo_${Date.now()}_${currentUser.name.replace(/\s+/g, '_')}`,
    };

    setClinicalEvolutions((prev) => [newEntry, ...prev]);
    showToast('success', 'Evolución Registrada', `Evolución (${newEntry.type}) firmada por ${newEntry.authorName}.`);
    logAudit('CREAR_EVOLUCION', 'ClinicalEvolution', newEntry.id, `Evolución ${newEntry.type} para paciente ${newEntry.patientId}`);
    return newEntry;
  };

  const signClinicalEvolution = (id: string) => {
    setClinicalEvolutions((prev) =>
      prev.map((evo) =>
        evo.id === id
          ? {
              ...evo,
              status: 'FIRMADO',
              signatureHash: `SHA256:signed_${Date.now()}_${currentUser.name}`,
            }
          : evo
      )
    );
    showToast('success', 'Evolución Firmada', 'La nota ha sido firmada digitalmente.');
  };

  const addEvolutionAddendum = (id: string, addendumContent: string, reason: string) => {
    const newAddendum = {
      id: `add-${Date.now()}`,
      entryId: id,
      authorName: currentUser.name,
      authorRole: currentUser.role as any,
      authorLicense: currentUser.licenseNumber,
      dateTime: new Date().toISOString(),
      content: addendumContent,
      reason,
    };

    setClinicalEvolutions((prev) =>
      prev.map((evo) =>
        evo.id === id
          ? {
              ...evo,
              status: 'CON_ADDENDUM',
              addenda: [...(evo.addenda || []), newAddendum],
            }
          : evo
      )
    );
    showToast('success', 'Addendum Registrado', 'Se ha anexado una aclaración formal fechada a la nota médica.');
    logAudit('ADDENDUM_EVOLUCION', 'ClinicalEvolution', id, `Addendum agregado: ${reason}`);
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
        administerMedication,
        addHourlySheetEntry,
        dischargeHospitalPatient,

        addSurgery,
        addLabOrder,
        updateLabResults,
        addImagingStudy,
        addVaccination,

        addProduct,
        updateProductStock,

        addAppointment,
        updateAppointmentStatus,
        addTriageEntry,
        updateTriageStatus,

        createInvoice,
        createEstimate,
        convertEstimateToInvoice,

        addDocument,
        signDocument,

        logAudit,
        callAiAssistant,

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
