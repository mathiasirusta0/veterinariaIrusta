// VET SYSTEM - Tipos de Datos y Modelos Hospitalarios Veterinarios
// Conforme a Ley Provincial Córdoba Nº 11.076 / 5.142, CMVC, SENASA, Ley 25.326, Ley 25.506, Ley 24.051, ARCA

export type UserRole =
  | 'SUPERADMIN'
  | 'ADMINISTRADOR'
  | 'DIRECTOR_MEDICO'
  | 'VETERINARIO'
  | 'ESPECIALISTA'
  | 'ENFERMERIA'
  | 'ASISTENTE'
  | 'RECEPCION'
  | 'FARMACIA'
  | 'LABORATORIO'
  | 'CAJA'
  | 'AUDITOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  dni?: string;
  cuit?: string;
  licenseNumber?: string; // Matrícula profesional (ej: M.P. 502)
  licenseJurisdiction?: string; // ej: Colegio Médico Veterinario de Córdoba (CMVC)
  licenseCategory?: string; // ej: Clínica & Cirugía Menores, Especialista
  licenseValidUntil?: string; // ISO date
  isLicenseVerified?: boolean;
  digitalSignatureHash?: string;
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
  provincialLicenseNumber?: string;
  municipalRegistrationNumber?: string;
}

export interface Owner {
  isArchived?: boolean;
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
  secondaryContactName?: string;
  secondaryContactPhone?: string;
  authorizedPersons?: string[]; // Personas autorizadas para retirar o consentir
  taxCondition?: string; // Consumidor Final, Resp. Inscripto, Monotributo
  privacyConsentSigned?: boolean; // Consentimiento Ley 25.326
  communicationsConsentSigned?: boolean;
  notes?: string;
  balance: number; // Cuenta corriente (saldo positivo o deuda negativa)
  createdAt: string;
}

export type Species = 'CANINO' | 'FELINO' | 'EQUINO' | 'ASNAL' | 'MULAR' | 'BOVINO' | 'OVINO' | 'CAPRINO' | 'PORCINO' | 'AVE' | 'EXOTICO';
export type Sex = 'MACHO' | 'HEMBRA';
export type ReproductiveStatus = 'ENTERO' | 'CASTRADO' | 'GESTANTE' | 'LACTANTE';
export type PatientStatus = 'ACTIVO' | 'INTERNADO' | 'EN_CONSULTA' | 'EN_CIRUGIA' | 'ALTA_MEDICA' | 'ARCHIVADO' | 'FALLECIDO' | 'DERIVADO';

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
  clinicalRecordNumber: string; // Nº Historia Clínica ej: HC-10042
  name: string;
  species: Species;
  breed: string;
  sex: Sex;
  reproductiveStatus: ReproductiveStatus;
  birthDate: string;
  calculatedAge: string;
  weight: number; // kg
  bodyConditionScore?: string; // 1/9 a 9/9
  color: string;
  particularMarks?: string; // Señas particulares
  microchip?: string; // 15 dígitos ISO
  tattooNumber?: string;
  officialIdSenasa?: string; // Caravana / RFID oficial SENASA
  renspa?: string; // Registro Nacional Sanitario de Productores Agropecuarios
  equinePassport?: string; // Pasaporte oficial equino
  originBreeder?: string;
  photoUrl?: string;
  ownerId: string;
  primaryVetId?: string;
  status: PatientStatus;
  alerts: {
    type: PatientAlert;
    description: string;
  }[];
  isProductionAnimal?: boolean;
  withdrawalPeriodDays?: number; // Período de carencia/retiro en días (SENASA)
  withdrawalEndDate?: string; // Fecha fin de carencia
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
  isArchived?: boolean;
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

export interface ClinicalAmendment {
  id: string;
  consultationId: string;
  amendedAt: string; // ISO
  amendedBy: string;
  vetLicense: string;
  fieldAmended: string;
  previousValue: string;
  newValue: string;
  justificationReason: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  vetId: string;
  vetName: string;
  vetLicense?: string;
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
  amendments?: ClinicalAmendment[];
  digitalSignatureHash?: string;
  isClosed?: boolean;
  status: 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA';
}

// RECETARIO Y SENASA
export type SENASACategory =
  | 'CAT_I_OFICIAL_ARCHIVADA' // Psicotrópicos, Ketamina, Estupefacientes
  | 'CAT_II_ARCHIVADA' // Antibióticos restringidos, etc.
  | 'CAT_III_RECETA' // Venta bajo receta veterinaria
  | 'VENTA_LIBRE';

export interface PrescriptionItem {
  id: string;
  medicationName: string;
  activeIngredient?: string;
  presentation: string; // ej: Comprimidos 500mg, Frasco ampolla
  concentration?: string;
  dose: string; // ej: 1 comp / 10 mg/kg
  route: 'ORAL' | 'IV' | 'IM' | 'SC' | 'TOPICA' | 'OFTALMICA' | 'OTICA' | 'INHALATORIA' | 'EPIDURAL';
  frequency: string; // ej: Cada 12 horas
  duration: string; // ej: Durante 7 días
  quantityPrescribed?: number;
  senasaCategory?: SENASACategory;
  requiresRVE?: boolean; // Requiere Receta Veterinaria Electrónica SENASA
  instructions: string;
}

export type PrescriptionType =
  | 'RECETA_COMUN'
  | 'RECETA_ARCHIVADA'
  | 'RECETA_OFICIAL_ARCHIVADA'
  | 'RECETA_ELECTRONICA_SENASA';

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  prescriptionType: PrescriptionType;
  patientId: string;
  ownerId: string;
  vetId: string;
  vetName: string;
  vetLicense: string;
  vetCuit?: string;
  establishmentName?: string;
  establishmentAddress?: string;
  date: string;
  diagnosis?: string;
  senasaRveIdentifier?: string; // Código oficial RVE si aplica
  rveCertificateUrl?: string;
  items: PrescriptionItem[];
  notes?: string;
  isDispensed?: boolean;
  dispensedAt?: string;
  dispensedBy?: string;
  dispensationBatch?: string;
  pdfGenerated?: boolean;
  digitalSignatureHash?: string;

  // Datos para pacientes y tutores externos / no registrados previamente:
  isExternalPatient?: boolean;
  patientName?: string;
  patientSpecies?: string;
  patientBreed?: string;
  patientWeight?: string;
  patientAge?: string;
  patientHc?: string;
  ownerName?: string;
  ownerDni?: string; // No obligatorio
  ownerPhone?: string;
  ownerAddress?: string;
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
  | 'PENDIENTE'
  | 'REALIZADA'
  | 'ATRASADA'
  | 'OMITIDA'
  | 'REPROGRAMADA'
  | 'SUSPENDIDA';

export interface MedicationDoseSlot {
  time: string; // ej: "08:00", "16:00", "24:00"
  status: MedicationAdminStatus;
  administeredAt?: string;
  administeredBy?: string;
  notes?: string;
}

export interface MedicationSchedule {
  id: string;
  hospitalizationId: string;
  patientId: string;
  drugName: string;
  dose: string;
  route: string;
  frequency?: string; // ej: "Cada 8 hs"
  frequencyHours?: number; // ej: 8, 12, 24
  scheduledTime: string; // ej: "14:00" o ISO
  status: MedicationAdminStatus;
  administeredAt?: string;
  administeredBy?: string;
  notes?: string;
  productId?: string; // Vinculación a inventario para descuento automático
  doseTimes?: string[];
  doseSlots?: MedicationDoseSlot[];
  administeredDoses?: { administeredAt: string; administeredBy: string; notes?: string }[];
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
  isArchived?: boolean;
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
  isArchived?: boolean;
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
  isArchived?: boolean;
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
  isArchived?: boolean;
  id: string;
  patientId: string;
  vaccineName: string; // ej: Toxoide Tetánico Equino, Adenitis, Influenza, Antirrábica, Séxtuple
  type?: string; // ej: 'Plan Sanitario Militar', 'Vacunación Obligatoria SENASA', 'Desparasitación'
  manufacturer: string;
  batchNumber: string;
  expirationDate: string;
  administeredDate: string;
  administeredBy: string;
  vetLicense: string;
  nextDueDate: string;
  doseVolume?: string; // ej: '1 ml', '0.5 ml', '1 dosis', '1 comprimido'
  route?: string; // ej: 'Subcutánea (SC)', 'Intramuscular (IM)', 'Intranasal (IN)', 'Oral', 'Tópica'
  certificateGenerated?: boolean;
  regimentUnit?: string;
  notes?: string;
}

// FARMACIA, STOCK Y PSICOTRÓPICOS
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
  isArchived?: boolean;
  id: string;
  code: string;
  barcode?: string;
  commercialName: string;
  activeIngredient: string;
  category: 'MEDICAMENTO' | 'VACUNA' | 'DESCARTABLE' | 'ALIMENTO' | 'HIGIENE' | 'ACCESORIO' | 'PSICOTROPICO' | 'ESTUPEFACIENTE' | 'INSUMO_QUIRURGICO';
  senasaCategory?: SENASACategory;
  concentration: string;
  presentation: string;
  laboratory: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  minStock: number;
  currentBatch: string;
  expirationDate: string;
  supplier: string;
  location?: string; // ej: Estante A-2, Heladera #1, Caja de Seguridad Psicotrópicos
  isPsychotropic?: boolean; // Psicotrópico (Lista II / III / IV)
  isNarcotic?: boolean; // Estupefaciente (Lista I)
  requiresPrescription?: boolean;
  requiresOfficialArchive?: boolean;
  branchId: string;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  batch: string;
  patientId?: string;
  referenceId?: string;
  reason: string;
  performedBy: string;
  timestamp: string;
}

// CONTROL DE PSICOTRÓPICOS Y KETAMINA (Leyes 17.818 y 19.303)
export interface ControlledDrugItem {
  id: string;
  commercialName: string;
  activeIngredient: string; // ej: Ketamina Clorhidrato 50mg/ml, Fentanilo, Midazolam
  concentration: string;
  presentation: string;
  laboratory: string;
  senasaCategory: SENASACategory;
  currentStock: number;
  unit: string;
  minStock: number;
  lawClassification: 'LEY_17818_ESTUPEFACIENTES' | 'LEY_19303_PSICOTROPICOS' | 'KETAMINA_RESOLUCION_SENASA';
}

export interface ControlledDrugMovement {
  id: string;
  timestamp: string; // ISO
  movementType: 'INGRESO_COMPRA' | 'EGRESO_CLINICO' | 'AJUSTE_COMPENSATORIO';
  drugId: string;
  drugName: string;
  activeIngredient: string;
  batchNumber: string;
  quantity: number;
  balanceAfter: number;
  patientId?: string;
  patientName?: string;
  species?: Species;
  patientWeight?: number;
  ownerId?: string;
  ownerName?: string;
  ownerDni?: string;
  ownerAddress?: string;
  vetId: string;
  vetName: string;
  vetLicense: string;
  prescriptionNumber?: string;
  officialRecipeFolio?: string;
  supplierName?: string;
  invoiceNumber?: string;
  observations: string;
  registeredBy: string;
}

// GESTIÓN DE RESIDUOS PATOLÓGICOS Y PELIGROSOS (Ley 24.051 / Río Cuarto)
export type PathologicalWasteType =
  | 'BIOPATOGENICO_INFECCIOSO'
  | 'CORTOPUNZANTE'
  | 'ANATOMOPATOLOGICO'
  | 'QUIMICO_FARMACEUTICO';

export interface PathologicalWasteRecord {
  id: string;
  manifestNumber: string; // Nº Manifiesto Oficial Ley 24.051
  date: string; // ISO
  generatingSector: 'QUIROFANO' | 'UCI_INTERNACION' | 'LABORATORIO' | 'CONSULTORIOS' | 'NECROPSIA';
  wasteType: PathologicalWasteType;
  weightKg: number;
  containerType: 'BOLSA_ROJA_REGISTRO' | 'DESCARTADOR_RIGIDO' | 'CONTENEDOR_ESPECIAL';
  containerCount: number;
  storageLocation: string;
  transportCompany?: string;
  transportDriver?: string;
  pickupDate?: string;
  finalDisposalFacility?: string;
  disposalCertificateNumber?: string;
  disposalCertificateDate?: string;
  municipalGeneratorRegistry: string; // ej: Registro Municipal Río Cuarto
  status: 'ALMACENADO_TRANSITORIO' | 'RETIRADO_EN_TRANSITO' | 'DISPOSICION_FINAL_CERTIFICADA';
  registeredBy: string;
  branchId: string;
}

// MOTOR DE CUMPLIMIENTO NORMATIVO
export type RegulatoryStatus = 'VIGENTE' | 'MODIFICADA' | 'DEROGADA' | 'EN_REVISION';

export interface RegulatoryRule {
  id: string;
  country: string;
  province: string;
  municipality: string;
  organism: 'COLEGIO_VETERINARIO_CORDOBA' | 'SENASA' | 'ARCA_AFIP' | 'GOBIERNO_CORDOBA' | 'MUNICIPALIDAD_RIO_CUARTO' | 'MINISTERIO_SALUD';
  lawTitle: string;
  lawNumber: string;
  articleSection: string;
  description: string;
  clinicalImpactSummary: string;
  affectedModule: 'EJERCICIO_PROFESIONAL' | 'RECETARIO_SENASA' | 'PSICOTROPICOS' | 'RESIDUOS_PATOLOGICOS' | 'PROTECCION_DATOS' | 'BIENESTAR_ANIMAL' | 'FACTURACION_ARCA';
  isMandatory: boolean;
  effectiveDate: string;
  expirationDate?: string;
  officialUrl?: string;
  version: string;
  lastReviewedAt: string;
  reviewedBy: string;
  status: RegulatoryStatus;
}

// GESTIÓN DE ANTIMICROBIANOS
export interface AntimicrobialRecord {
  id: string;
  patientId: string;
  patientName: string;
  species: Species;
  activeIngredient: string;
  commercialName: string;
  clinicalIndication: string;
  definitiveDiagnosis: string;
  cultureOrdered: boolean;
  cultureResultDate?: string;
  antibiogramReport?: string;
  sensitivityPattern?: string;
  startDate: string;
  plannedDurationDays: number;
  prescribingVetName: string;
  prescribingVetLicense: string;
  criticalAlertOverridden?: boolean;
  overrideJustification?: string;
  evolutionStatus: 'FAVORABLE' | 'SIN_RESPUESTA' | 'ROTACION_ANTIBIOTICA' | 'FINALIZADO';
}

// PROTOCOLO DE EUTANASIA
export interface EuthanasiaRecord {
  id: string;
  patientId: string;
  patientName: string;
  species: Species;
  ownerId: string;
  ownerName: string;
  ownerDni: string;
  vetId: string;
  vetName: string;
  vetLicense: string;
  date: string;
  clinicalIndication: string;
  informedConsentSigned: boolean;
  consentDocumentId: string;
  sedationPreMedication: string;
  euthanasicDrugName: string;
  drugBatch: string;
  drugQuantityMl: number;
  bodyDisposition: 'CREMACION_INDIVIDUAL' | 'CREMACION_COLECTIVA' | 'RETIRO_POR_TUTOR' | 'SERVICIO_MUNICIPAL';
  observations?: string;
  digitalSignatureHash: string;
}

// BIENESTAR ANIMAL (Ley 14.346)
export interface AnimalWelfareReport {
  id: string;
  patientId: string;
  patientName: string;
  species: Species;
  reportDate: string;
  attendingVetName: string;
  attendingVetLicense: string;
  suspectedAbuseType: 'DESNUTRICION_EXTREMA' | 'TRAUMA_NO_ACCIDENTAL' | 'NEGLIGENCIA_ABANDONO' | 'CONDICIONES_INSALUBRES' | 'MUTILACION_NO_AUTORIZADA';
  bodyConditionScore: string;
  clinicalFindings: string;
  photographicEvidenceUrls: string[];
  actionTaken: 'INFORME_PERICIAL_ARCHIVADO' | 'DENUNCIA_AUTORIDADES_COMPETENTES' | 'SEGUIMIENTO_ESTRICTO';
  observations?: string;
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
  | 'CONSULTA'
  | 'CONSULTA_GENERAL'
  | 'VACUNACION'
  | 'CONTROL'
  | 'CIRUGIA'
  | 'URGENCIA'
  | 'ESTUDIO'
  | 'ESTUDIO_COMPLEMENTARIO'
  | 'PELUQUERIA_BANO';

export interface Appointment {
  isArchived?: boolean;
  id: string;
  patientId: string;
  ownerId: string;
  vetId: string;
  vetName?: string;
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
export type InvoiceType = 'FACTURA_A' | 'FACTURA_B' | 'FACTURA_C' | 'RECIBO_X' | 'X';
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
  isFiscal?: boolean;
  qrFiscalData?: string;
  isHomologationMode?: boolean;
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
  | 'CONSENTIMIENTO_INTERNACION_UCI'
  | 'CONSENTIMIENTO_CIRUGIA_ANESTESIA'
  | 'CONSENTIMIENTO_ANESTESIA'
  | 'CONSENTIMIENTO_EUTANASIA'
  | 'CERTIFICADO_VACUNACION_OFICIAL'
  | 'CERTIFICADO_VACUNACION_ANTIRRABICA'
  | 'CERTIFICADO_SALUD_VIAJE'
  | 'ALTA_VOLUNTARIA_DESLINDE'
  | 'PASE_DE_GUARDIA'
  | 'INFORME_ALTA_MEDICA'
  | 'TRATAMIENTO_DATOS_LEY_25326'
  | 'INFORME_DERIVACION_CLINICA';

export interface ClinicalDocument {
  isArchived?: boolean;
  id: string;
  type: DocumentType;
  title: string;
  patientId: string;
  patientName?: string;
  ownerId: string;
  ownerName?: string;
  ownerDni?: string;
  vetName: string;
  vetLicense?: string;
  createdAt: string;
  content: string;
  signedByOwnerName?: string;
  signedByOwnerDni?: string;
  signedAt?: string;
  signatureDataUrl?: string; // Firma digital en canvas
  isSigned: boolean;
  documentVersion?: string;
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
  ipAddress?: string;
  deviceInfo?: string;
}

// EVOLUCIÓN CLÍNICA UNIFICADA
export type EvolutionEntryType =
  | 'MEDICA'
  | 'ENFERMERIA'
  | 'AUXILIAR'
  | 'SIGNOS_VITALES'
  | 'TRATAMIENTO'
  | 'INTERNACION'
  | 'CIRUGIA'
  | 'LABORATORIO'
  | 'PASE_GUARDIA'
  | 'ALTA'
  | 'ADDENDUM';

export type EvolutionAuthorRole = 'VETERINARIO' | 'ENFERMERIA' | 'ASISTENTE' | 'DIRECTOR_MEDICO';
export type EvolutionStatus = 'BORRADOR' | 'FIRMADO' | 'CON_ADDENDUM' | 'ANULADO';

export interface EvolutionAddendum {
  id: string;
  entryId: string;
  authorName: string;
  authorRole: EvolutionAuthorRole;
  authorLicense?: string;
  dateTime: string;
  content: string;
  reason: string;
}

export interface ClinicalEvolutionEntry {
  id: string;
  patientId: string;
  hospitalizationId?: string;
  type: EvolutionEntryType;
  status: EvolutionStatus;
  dateTime: string; // Fecha y hora clínica
  createdAt: string; // Timestamp real de creación
  authorName: string;
  authorRole: EvolutionAuthorRole;
  authorLicense?: string; // Matrícula profesional si aplica
  branchId?: string;
  sector?: string;
  subjectiveSummary?: string;
  objectiveSummary?: string;
  assessment?: string;
  plan?: string;
  nursingNotes?: string;
  assistantNotes?: string;
  administeredTreatments?: string[];
  vitalSignsSnapshot?: {
    heartRate?: number;
    respiratoryRate?: number;
    temperature?: number;
    systolicBP?: number;
    diastolicBP?: number;
    spo2?: number;
    bloodGlucose?: number;
  };
  evolutionText?: string;
  nextAction?: string;
  nextActionDueDate?: string;
  nextActionAssignee?: string;
  isEscalated?: boolean;
  addenda?: EvolutionAddendum[];
  signatureHash?: string;
}


// GESTIÓN ECONÓMICA Y FINANZAS
export type FinancialPaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA_DEBITO' | 'TARJETA_CREDITO' | 'MERCADOPAGO_QR' | 'OTRO';
export type FinancialMovementStatus = 'COBRADO' | 'PAGADO' | 'PENDIENTE' | 'PARCIAL' | 'ANULADO';

export interface PaymentInstallment {
  id: string;
  date: string;
  amount: number;
  paymentMethod: FinancialPaymentMethod;
  notes?: string;
  registeredBy: string;
}

export interface FinancialMovement {
  id: string;
  date: string;
  type: 'INGRESO' | 'GASTO';
  category: string;
  concept: string;
  description?: string;
  amount: number;
  paymentMethod: FinancialPaymentMethod;
  status: FinancialMovementStatus;
  clientId?: string;
  clientName?: string;
  supplierName?: string;
  notes?: string;
  isVoided?: boolean;
  voidReason?: string;
  createdAt: string;
  createdBy: string;
  branchId?: string;
}

export interface AccountDebt {
  id: string;
  type: 'COBRAR' | 'PAGAR';
  entityName: string;
  entityId?: string;
  concept: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  issueDate: string;
  dueDate: string;
  status: 'PENDIENTE' | 'PARCIAL' | 'PAGADA' | 'VENCIDA';
  notes?: string;
  payments: PaymentInstallment[];
  createdAt: string;
  createdBy: string;
  branchId?: string;
}


// ==========================================
// MODELO DE ATENCIÓN OPERATIVA UNIFICADA & CONSUMOS
// ==========================================

export type EncounterType = 'AMBULATORIA' | 'INTERNACION';
export type EncounterStatus = 'EN_CURSO' | 'ALTA_MEDICA' | 'CERRADA';

export interface ClinicalEncounter {
  id: string;
  patientId: string;
  type: EncounterType;
  status: EncounterStatus;
  admittedAt: string;
  closedAt?: string;
  vetInChargeId: string;
  vetInChargeName: string;
  reason: string;
  initialDiagnosis: string;
  finalDiagnosis?: string;
  dischargeNotes?: string;
  dischargeMedications?: string;
  nextFollowUpDate?: string;
  sector?: string; // ej: "Consultorio 1", "Canil UCI-01", "Felinos Canil 3"
  kennelNumber?: string;
  priority?: HospitalPriority;
  notes?: string;
  branchId?: string;
}

export interface ClinicalProcedure {
  id: string;
  encounterId?: string;
  patientId: string;
  procedureName: string;
  category: 'ENFERMERIA' | 'QUIRURGICO' | 'TERAPEUTICO' | 'DIAGNOSTICO' | 'OTRO';
  scheduledAt?: string;
  performedAt?: string;
  performedBy?: string;
  isPerformed: boolean;
  notes?: string;
  price: number;
  isBillable: boolean;
  createdAt: string;
}

export interface EncounterConsumptionItem {
  id: string;
  encounterId: string;
  patientId: string;
  sourceType: 'CONSULTA' | 'INTERNACION' | 'LABORATORIO' | 'IMAGEN' | 'MEDICAMENTO' | 'PROCEDIMIENTO' | 'INSUMO';
  sourceId: string;
  code: string;
  concept: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  status: 'PENDIENTE' | 'CONFIRMADO' | 'ANULADO';
  performedAt: string;
  performedBy: string;
  isBilled: boolean;
  invoiceId?: string;
}

export interface ServicePriceItem {
  id: string;
  code: string;
  name: string;
  category: 'CONSULTA' | 'INTERNACION' | 'LABORATORIO' | 'IMAGENES' | 'PROCEDIMIENTO' | 'MEDICAMENTO' | 'CIRUGIA' | 'INSUMO' | 'OTRO';
  price: number;
  isBillable: boolean;
  description?: string;
}

// Catálogo de Razas Dinámicas por Especie
export const SPECIES_LIST: { id: Species; label: string; icon: string }[] = [
  { id: 'CANINO', label: 'Canino', icon: '🐕' },
  { id: 'FELINO', label: 'Felino', icon: '🐈' },
  { id: 'EQUINO', label: 'Equino', icon: '🐎' },
  { id: 'AVE', label: 'Ave', icon: '🦜' },
  { id: 'EXOTICO', label: 'Exótico (Conejo, Hurón, etc.)', icon: '🐇' },
  { id: 'BOVINO', label: 'Bovino', icon: '🐄' },
  { id: 'OVINO', label: 'Ovino', icon: '🐑' },
  { id: 'CAPRINO', label: 'Caprino', icon: '🐐' },
  { id: 'PORCINO', label: 'Porcino', icon: '🐖' },
  { id: 'ASNAL', label: 'Asnal / Mular', icon: '🫏' },
];

export const BREEDS_BY_SPECIES: Record<Species, string[]> = {
  CANINO: [
    'Labrador Retriever',
    'Pastor Alemán / Ovejero',
    'Caniche / Poodle',
    'Golden Retriever',
    'Bulldog Francés',
    'Bulldog Inglés',
    'Beagle',
    'Boxer',
    'Rottweiler',
    'Border Collie',
    'Yorkshire Terrier',
    'Dachshund / Salchicha',
    'Schnauzer Miniatura',
    'Pitbull / American Bully',
    'Dogo Argentino',
    'Mestizo / Cruza',
    'Otra / No especificada',
  ],
  FELINO: [
    'Siamés',
    'Persa',
    'Europeo Común / Doméstico',
    'Maine Coon',
    'Bengala',
    'Ragdoll',
    'Angora Turco',
    'Sphynx / Esfinge',
    'British Shorthair',
    'Azul Ruso',
    'Mestizo / Cruza',
    'Otra / No especificada',
  ],
  EQUINO: [
    'Criollo',
    'Pura Sangre de Carrera (PSC)',
    'Silla Argentino',
    'Cuarto de Milla',
    'Árabe',
    'Percherón',
    'Polo Argentino',
    'Mestizo / Cruza',
    'Otra / No especificada',
  ],
  AVE: [
    'Canario',
    'Periquito Australiano',
    'Loro Hablador (Amazona)',
    'Calopsita / Ninfa',
    'Cacatúa',
    'Guacamayo',
    'Agapornis / Inseparable',
    'Paloma Mensajera / Doméstica',
    'Otra / No especificada',
  ],
  EXOTICO: [
    'Conejo Enano / Mini Lop',
    'Cobayo / Cavia porcellus',
    'Hurón / Ferret',
    'Hámster Sirio / Ruso',
    'Chinchilla',
    'Erizo Africano',
    'Tortuga de Tierra / Agua',
    'Iguana / Dragón Barbudo',
    'Otra / No especificada',
  ],
  BOVINO: ['Holando Argentino', 'Aberdeen Angus', 'Hereford', 'Braford', 'Brangus', 'Criollo', 'Otra / No especificada'],
  OVINO: ['Corriedale', 'Merino', 'Pampinta', 'Hampshire Down', 'Romney Marsh', 'Criollo', 'Otra / No especificada'],
  CAPRINO: ['Saanen', 'Anglo Nubian', 'Boer', 'Criolla', 'Toggenburg', 'Otra / No especificada'],
  PORCINO: ['Landrace', 'Large White', 'Duroc Jersey', 'Hampshire', 'Pietrain', 'Otra / No especificada'],
  ASNAL: ['Asno Común', 'Burro Criollo', 'Mula / Mulo', 'Otra / No especificada'],
  MULAR: ['Mula / Mulo', 'Burro', 'Otra / No especificada'],
};
