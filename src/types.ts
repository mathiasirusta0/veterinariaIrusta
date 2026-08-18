// VET SYSTEM - Tipos de Datos y Modelos Hospitalarios Veterinarios

export type UserRole =
  | 'SUPERADMIN'
  | 'ADMINISTRADOR'
  | 'VETERINARIO'
  | 'ASISTENTE'
  | 'ENFERMERIA'
  | 'RECEPCION'
  | 'FARMACIA'
  | 'CAJA';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  licenseNumber?: string; // Matrícula profesional
  branchId: string;
  avatar?: string;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  cuit: string;
  taxCondition: string; // ej: Responsable Inscripto
}

export interface Owner {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  cuit?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
  balance: number; // Cuenta corriente (saldo positivo o deuda negativa)
  createdAt: string;
}

export type Species = 'CANINO' | 'FELINO' | 'EQUINO' | 'BOVINO' | 'AVE' | 'EXOTICO';
export type Sex = 'MACHO' | 'HEMBRA';
export type ReproductiveStatus = 'ENTERO' | 'CASTRADO' | 'GESTANTE' | 'LACTANTE';
export type PatientStatus = 'ACTIVO' | 'INTERNADO' | 'EN_CONSULTA' | 'EN_CIRUGIA' | 'FALLECIDO';

export type PatientAlert =
  | 'ALERGIA'
  | 'CARDIOPATIA'
  | 'MEDICACION_CRONICA'
  | 'AISLAMIENTO'
  | 'AGRESIVO'
  | 'RIESGO_ANESTESICO'
  | 'EPILEPTICO'
  | 'DIABETICO'
  | 'RENAL';

export interface Patient {
  id: string;
  clinicalRecordNumber: string; // Nº Historia Clínica ej: HC-2024-0042
  name: string;
  species: Species;
  breed: string;
  sex: Sex;
  reproductiveStatus: ReproductiveStatus;
  birthDate: string;
  calculatedAge: string;
  weight: number; // kg
  color: string;
  microchip?: string;
  photoUrl?: string;
  ownerId: string;
  primaryVetId?: string;
  status: PatientStatus;
  alerts: {
    type: PatientAlert;
    description: string;
  }[];
  branchId: string;
  createdAt: string;
}

export type ProblemStatus = 'ACTIVO' | 'CRONICO' | 'CONTROLADO' | 'RESUELTO';

export interface PatientProblem {
  id: string;
  patientId: string;
  title: string;
  description?: string;
  status: ProblemStatus;
  onsetDate: string;
  resolvedDate?: string;
  vetName: string;
}

export interface VitalSigns {
  id: string;
  patientId: string;
  recordedAt: string; // ISO
  recordedBy: string; // User Name
  weight?: number; // kg
  temperature?: number; // °C ej: 38.5
  heartRate?: number; // lpm
  respiratoryRate?: number; // rpm
  systolicBP?: number; // mmHg
  diastolicBP?: number; // mmHg
  meanBP?: number; // mmHg
  spo2?: number; // %
  bloodGlucose?: number; // mg/dL
  mucousMembranes?: 'ROSADAS' | 'PALIDAS' | 'CONGESTIVAS' | 'CIANOTICAS' | 'ICTERICAS';
  capillaryRefillTime?: number; // segundos (TLLC)
  hydrationStatus?: 'NORMAL' | 'DESHIDRATACION_5' | 'DESHIDRATACION_8' | 'DESHIDRATACION_10' | 'DESHIDRATACION_MAS_10';
  consciousnessLevel?: 'ALERTA' | 'DEPRIMIDO' | 'ESTUPOR' | 'COMA';
  painScale?: number; // 0 - 10
  bodyConditionScore?: '1/9' | '2/9' | '3/9' | '4/9' | '5/9' | '6/9' | '7/9' | '8/9' | '9/9';
  notes?: string;
}

export interface PhysicalExamSystems {
  general: string;
  skinAndCoat: string;
  eyes: string;
  ears: string;
  oralCavity: string;
  lymphNodes: string;
  cardiovascular: string;
  respiratory: string;
  digestive: string;
  urinary: string;
  reproductive: string;
  musculoskeletal: string;
  neurological: string;
  isNormalPresetApplied?: boolean;
}

export interface SoapNote {
  id: string;
  consultationId: string;
  patientId: string;
  subjective: string; // Motivo de consulta y anamnesis
  objective: string; // Hallazgos físicos y signos
  assessment: string; // Evaluación y diagnósticos diferenciales
  plan: string; // Plan terapéutico, estudios y recomendaciones
  createdAt: string;
  vetName: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  vetId: string;
  vetName: string;
  branchId: string;
  dateTime: string;
  reason: string;
  anamnesis: string;
  vitalSigns: VitalSigns;
  physicalExam: PhysicalExamSystems;
  soap: SoapNote;
  diagnoses: string[];
  differentialDiagnoses: string[];
  treatmentPlan: string;
  prescriptions: PrescriptionItem[];
  orderedStudies: string[];
  followUpDate?: string;
  requiresHospitalization?: boolean;
  status: 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA';
}

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  presentation: string; // ej: Comprimidos 500mg, Jarabe, Gotas
  dose: string; // ej: 1 comp
  route: 'ORAL' | 'IV' | 'IM' | 'SC' | 'TOPICA' | 'OFTALMICA' | 'OTICA';
  frequency: string; // ej: Cada 12 horas
  duration: string; // ej: Durante 7 días
  instructions: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  ownerId: string;
  vetName: string;
  vetLicense: string;
  date: string;
  items: PrescriptionItem[];
  notes?: string;
  pdfGenerated?: boolean;
}

// HOSPITALIZACIÓN E INTERNACIÓN
export type HospitalPriority =
  | 'ESTABLE'
  | 'OBSERVACION'
  | 'PRIORITARIO'
  | 'CRITICO'
  | 'AISLAMIENTO'
  | 'PREQUIRURGICO'
  | 'POSQUIRURGICO'
  | 'ALTA_PENDIENTE';

export type Sector = 'UCI' | 'CANINOS' | 'FELINOS' | 'AISLAMIENTO_INFECCIOSOS' | 'OBSERVACION' | 'QUIRURGICO';

export interface FluidTherapy {
  isActive: boolean;
  solutionType: string; // ej: Ringer Lactato, Fisiológico 0.9%, Dextrosa 5%
  volumeTotalMl: number;
  rateMlPerHour: number;
  dropsPerMinute?: number;
  infusionRoute: 'IV' | 'SC' | 'IO';
  startedAt: string;
  pumpNumber?: string;
  additives?: string; // ej: KCl 20 mEq/L, Metoclopramida
  prescribedBy: string;
}

export interface FeedingRecord {
  dietType: 'ORAL' | 'SONDA_NASOESOFAGICA' | 'SONDA_ESOFAGOSTOMIA' | 'ASISTIDA' | 'NPO_AYUNO';
  foodBrand: string;
  amountGramsOrMl: number;
  frequency: string;
  tolerance: 'EXCELENTE' | 'PARCIAL' | 'RECHAZO' | 'EMESIS';
  lastOfferedAt?: string;
}

export interface EliminationRecord {
  id: string;
  timestamp: string;
  type: 'MICCION' | 'DEFECACION' | 'VOMITO' | 'DIARREA' | 'DRENAJE';
  amount: 'ESCASA' | 'MODERADA' | 'ABUNDANTE';
  aspect: string; // ej: Orina clara, heces pastosas, vómito bilioso
  registeredBy: string;
  notes?: string;
}

export type MedicationAdminStatus =
  | 'PROGRAMADA'
  | 'PROXIMA'
  | 'REALIZADA'
  | 'ATRASADA'
  | 'OMITIDA'
  | 'REPROGRAMADA'
  | 'SUSPENDIDA';

export interface MedicationSchedule {
  id: string;
  hospitalizationId: string;
  patientId: string;
  drugName: string;
  dose: string;
  route: string;
  frequencyHours: number; // ej: 8, 12, 24
  scheduledTime: string; // ej: "14:00" o ISO
  status: MedicationAdminStatus;
  administeredAt?: string;
  administeredBy?: string;
  notes?: string;
  productId?: string; // Vinculación a inventario para descuento automático
}

export interface HospitalizationTask {
  id: string;
  time: string;
  title: string;
  type: 'MEDICACION' | 'SIGNOS' | 'FLUIDOS' | 'ALIMENTACION' | 'CURACION' | 'ESTUDIO';
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface HospitalizationSheetEntry {
  id: string;
  timestamp: string; // Hora de la ronda (ej: 08:00, 10:00)
  temperature?: number;
  heartRate?: number;
  respiratoryRate?: number;
  bloodPressure?: string;
  spo2?: number;
  glucose?: number;
  painLevel?: number;
  fluidStatus?: string;
  medsAdministered?: string[];
  feeding?: string;
  eliminations?: string;
  observations: string;
  staffName: string;
}

export interface Hospitalization {
  id: string;
  patientId: string;
  vetInChargeId: string;
  vetInChargeName: string;
  sector: Sector;
  kennelNumber: string; // Canil ej: "UCI-02"
  admittedAt: string;
  dischargedAt?: string;
  primaryDiagnosis: string;
  priority: HospitalPriority;
  fluidTherapy: FluidTherapy;
  feeding: FeedingRecord;
  eliminations: EliminationRecord[];
  medications: MedicationSchedule[];
  tasks: HospitalizationTask[];
  hourlySheet: HospitalizationSheetEntry[];
  intervalHours: number; // 0.5, 1, 2, 4, 6, 8, 12
  nextMedicationTime?: string;
  nextVitalsTime?: string;
  status: 'ACTIVA' | 'ALTA_MEDICA' | 'TRASLADO' | 'DECESO';
  dischargeSummary?: string;
  branchId: string;
}

// CIRUGÍAS Y ANESTESIA
export interface AnesthesiaVitalPoint {
  time: string; // ej "10:15"
  heartRate: number;
  respiratoryRate: number;
  systolicBP: number;
  diastolicBP: number;
  spo2: number;
  etco2: number;
  temperature: number;
  isoOrSevoPercent: number;
  oxygenFlowLMin: number;
  fluidsGivenMl: number;
}

export interface SurgeryRecord {
  id: string;
  patientId: string;
  procedureName: string;
  surgeonName: string;
  assistantName?: string;
  anesthetistName: string;
  branchId: string;
  date: string;
  startTime: string;
  endTime?: string;
  preOpAssessment: {
    asaGrade: 'I' | 'II' | 'III' | 'IV' | 'V' | 'E';
    fastingHours: number;
    labReviewed: boolean;
    risksAlerts: string;
  };
  anesthesiaProtocol: {
    premedication: string;
    induction: string;
    maintenance: string;
    analgesia: string;
    monitoringPoints: AnesthesiaVitalPoint[];
    milestones: {
      inductionTime: string;
      intubationTime: string;
      incisionTime: string;
      sutureTime: string;
      extubationTime: string;
      recoveryTime: string;
    };
  };
  surgicalTechnique: string;
  findings: string;
  complications?: string;
  materialsUsed: { productId: string; name: string; quantity: number }[];
  postOpOrders: string;
  status: 'PROGRAMADA' | 'EN_CURSO' | 'FINALIZADA' | 'SUSPENDIDA';
}

// LABORATORIO
export type LabTestType =
  | 'HEMOGRAMA_COMPLETO'
  | 'PERFIL_BIOQUIMICO_RENAL_HEPATICO'
  | 'URANALISIS'
  | 'COPROPARASITOLOGICO'
  | 'CITOLOGIA'
  | 'PERFIL_TIROIDEO'
  | 'TEST_RAPIDO_VIRAL'
  | 'CULTIVO_ANTIBIOGRAMA'
  | 'OTROS';

export interface LabResultItem {
  parameter: string; // ej: Hematocrito, Leucocitos, Urea, Creatinina
  value: string | number;
  unit: string; // ej: %, /uL, mg/dL
  referenceRange: string; // ej: 37 - 55
  isAbnormal?: boolean;
}

export interface LaboratoryOrder {
  id: string;
  orderNumber: string;
  patientId: string;
  testType: LabTestType;
  requestedBy: string;
  requestedAt: string;
  sampleCollectedAt?: string;
  resultsReadyAt?: string;
  status: 'SOLICITADO' | 'MUESTRA_OBTENIDA' | 'EN_PROCESO' | 'FINALIZADO';
  results: LabResultItem[];
  diagnosticReport: string;
  conclusions: string;
  attachedPdfUrl?: string;
}

// IMÁGENES
export type ImageModality = 'RADIOGRAFIA' | 'ECOGRAFIA' | 'TOMOGRAFIA' | 'RESONANCIA' | 'ENDOSCOPIA' | 'FOTOGRAFIA_CLINICA';

export interface ImagingStudy {
  id: string;
  studyNumber: string;
  patientId: string;
  modality: ImageModality;
  region: string; // ej: Tórax lateral/VD, Abdomen completo
  requestedBy: string;
  performedBy: string;
  date: string;
  report: string;
  conclusion: string;
  images: { id: string; url: string; caption: string }[];
  status: 'SOLICITADO' | 'REALIZADO' | 'INFORMADO';
}

// VACUNAS
export interface VaccinationRecord {
  id: string;
  patientId: string;
  vaccineName: string; // ej: Séxtuple Canina, Antirrábica, Triple Felina
  manufacturer: string;
  batchNumber: string;
  expirationDate: string;
  administeredDate: string;
  administeredBy: string;
  vetLicense: string;
  nextDueDate: string;
  certificateGenerated?: boolean;
}

// FARMACIA E INVENTARIO
export type StockMovementType =
  | 'ENTRADA'
  | 'VENTA'
  | 'USO_CONSULTA'
  | 'USO_INTERNACION'
  | 'CIRUGIA'
  | 'AJUSTE'
  | 'DEVOLUCION'
  | 'VENCIMIENTO';

export interface Product {
  id: string;
  code: string;
  barcode?: string;
  commercialName: string;
  activeIngredient: string; // Principio activo
  category: 'MEDICAMENTO' | 'VACUNA' | 'DESCARTABLE' | 'ALIMENTO' | 'HIGIENE' | 'ACCESORIO';
  concentration: string; // ej: 100 mg/ml
  presentation: string; // ej: Frasco ampolla 50ml, Caja 20 comprimidos
  laboratory: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  currentBatch: string;
  expirationDate: string;
  supplier: string;
  branchId: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number; // positivo o negativo
  previousStock: number;
  newStock: number;
  batch: string;
  patientId?: string;
  referenceId?: string; // id de consulta, internación o factura
  reason: string;
  performedBy: string;
  timestamp: string;
}

// AGENDA Y SALA DE ESPERA / TRIAGE
export type AppointmentStatus =
  | 'RESERVADO'
  | 'CONFIRMADO'
  | 'ESPERANDO'
  | 'EN_CONSULTA'
  | 'FINALIZADO'
  | 'CANCELADO'
  | 'AUSENTE';

export type AppointmentType =
  | 'CONSULTA_GENERAL'
  | 'VACUNACION'
  | 'CONTROL'
  | 'CIRUGIA'
  | 'URGENCIA'
  | 'ESTUDIO_COMPLEMENTARIO'
  | 'PELUQUERIA_BANO';

export interface Appointment {
  id: string;
  patientId: string;
  ownerId: string;
  vetId: string;
  branchId: string;
  consultingRoom?: string; // Consultorio 1, 2, etc.
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  durationMinutes: number;
  type: AppointmentType;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
}

export type TriagePriority = 'NORMAL' | 'PRIORITARIO' | 'URGENTE' | 'CRITICO';

export interface TriageEntry {
  id: string;
  patientId: string;
  ownerId: string;
  arrivedAt: string; // ISO
  waitTimeMinutes: number;
  priority: TriagePriority;
  chiefComplaint: string;
  assignedVetId?: string;
  assignedRoom?: string;
  initialTemp?: number;
  initialHeartRate?: number;
  initialMucous?: string;
  status: 'EN_ESPERA' | 'LLAMADO' | 'ATENDIDO' | 'DERIVADO_INTERNACION';
}

// CAJA, FACTURACIÓN Y PRESUPUESTOS
export type InvoiceType = 'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C' | 'RECIBO_X';
export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'MERCADOPAGO_QR';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  productId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // 0001-00004921
  type: InvoiceType;
  pointOfSale: number; // ej: 1
  date: string;
  ownerId: string;
  patientId?: string;
  customerName: string;
  customerDniCuit: string;
  customerTaxCondition: string;
  items: InvoiceItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  caeNumber: string; // CAE simulado ARCA/AFIP
  caeExpirationDate: string;
  qrFiscalData?: string;
  branchId: string;
}

export type EstimateStatus = 'BORRADOR' | 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO' | 'VENCIDO';

export interface Estimate {
  id: string;
  estimateNumber: string;
  ownerId: string;
  patientId: string;
  date: string;
  validUntil: string;
  items: InvoiceItem[];
  totalAmount: number;
  notes?: string;
  status: EstimateStatus;
}

export interface CashRegisterSession {
  id: string;
  branchId: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  closedBy?: string;
  initialCash: number;
  totalIncomeCash: number;
  totalIncomeDigital: number;
  totalExpenses: number;
  finalCashBalance?: number;
  isClosed: boolean;
}

// DOCUMENTOS Y CONSENTIMIENTOS
export type DocumentType =
  | 'CONSENTIMIENTO_INTERNACION'
  | 'CONSENTIMIENTO_CIRUGIA_ANESTESIA'
  | 'CONSENTIMIENTO_EUTANASIA'
  | 'CERTIFICADO_SALUD_VIAJE'
  | 'PASE_DE_GUARDIA'
  | 'INFORME_ALTA_MEDICA';

export interface ClinicalDocument {
  id: string;
  type: DocumentType;
  title: string;
  patientId: string;
  ownerId: string;
  vetName: string;
  createdAt: string;
  content: string;
  signedByOwnerName?: string;
  signedByOwnerDni?: string;
  signatureDataUrl?: string; // Firma digital en canvas
  isSigned: boolean;
}

// AUDITORÍA Y TRAZABILIDAD
export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entity: string; // ej: "MEDICATION_ADMIN", "DIAGNOSIS_EDIT", "PATIENT_CREATE"
  entityId: string;
  details: string;
  previousValue?: string;
  newValue?: string;
}
