import {
  Branch,
  User,
  Owner,
  Patient,
  VitalSigns,
  Consultation,
  Hospitalization,
  SurgeryRecord,
  LaboratoryOrder,
  ImagingStudy,
  VaccinationRecord,
  Product,
  Appointment,
  TriageEntry,
  Invoice,
  Estimate,
  CashRegisterSession,
  ClinicalDocument,
  AuditLog,
  PatientProblem,
  RegulatoryRule,
  ControlledDrugItem,
  ControlledDrugMovement,
  PathologicalWasteRecord,
  Prescription,
  AntimicrobialRecord,
  ClinicalEvolutionEntry,
  ClinicalEncounter,
  ClinicalProcedure,
  EncounterConsumptionItem,
  ServicePriceItem,
} from './types';

// 1. SUCURSALES HOSPITALARIAS
export const INITIAL_BRANCHES: Branch[] = [
  {
    id: 'branch-1',
    name: 'Hospital Central 24 Horas',
    code: 'HC-01',
    address: 'Av. Corrientes 4550, CABA',
    phone: '+54 11 4862-9900',
    whatsapp: '+54 9 11 3822-9011',
    email: 'contacto@vetsystem.com.ar',
    cuit: '30-71458920-4',
    taxCondition: 'IVA Responsable Inscripto',
  },
  {
    id: 'branch-2',
    name: 'Clínica & Consultorios Norte',
    code: 'CN-02',
    address: 'Av. Maipú 2140, Olivos, Buenos Aires',
    phone: '+54 11 4791-3320',
    whatsapp: '+54 9 11 4455-8812',
    email: 'norte@vetsystem.com.ar',
    cuit: '30-71458920-4',
    taxCondition: 'IVA Responsable Inscripto',
  },
];

// 2. USUARIO MAESTRO SUPERADMIN
export const INITIAL_USERS: User[] = [
  {
    id: 'user-irusta-superadmin',
    name: 'Dr. Diego Irusta',
    email: 'irusta@gmail.com',
    role: 'SUPERADMIN',
    licenseNumber: 'MP 8412 - Dirección Médica',
    branchId: 'branch-1',
  },
];

// 3. COLECCIONES CLÍNICAS Y TRANSACCIONALES (LIMPIAS PARA USO REAL)
export const INITIAL_OWNERS: Owner[] = [];
export const INITIAL_PATIENTS: Patient[] = [];
export const INITIAL_PROBLEMS: PatientProblem[] = [];
export const INITIAL_VITALS: VitalSigns[] = [];
export const INITIAL_CONSULTATIONS: Consultation[] = [];
export const INITIAL_HOSPITALIZATIONS: Hospitalization[] = [];
export const INITIAL_SURGERIES: SurgeryRecord[] = [];
export const INITIAL_LABS: LaboratoryOrder[] = [];
export const INITIAL_LAB_ORDERS: LaboratoryOrder[] = [];
export const INITIAL_IMAGING: ImagingStudy[] = [];
export const INITIAL_VACCINES: VaccinationRecord[] = [];
export const INITIAL_VACCINATIONS: VaccinationRecord[] = [];
export const INITIAL_APPOINTMENTS: Appointment[] = [];
export const INITIAL_TRIAGE: TriageEntry[] = [];
export const INITIAL_INVOICES: Invoice[] = [];
export const INITIAL_ESTIMATES: Estimate[] = [];
export const INITIAL_DOCUMENTS: ClinicalDocument[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_CONTROLLED_MOVEMENTS: ControlledDrugMovement[] = [];
export const INITIAL_PATHOLOGICAL_WASTE: PathologicalWasteRecord[] = [];
export const INITIAL_PRESCRIPTIONS: Prescription[] = [];
export const INITIAL_ANTIMICROBIAL_RECORDS: AntimicrobialRecord[] = [];
export const INITIAL_CLINICAL_EVOLUTIONS: ClinicalEvolutionEntry[] = [];

// 3.1 ENCOUNTERS, PROCEDIMIENTOS Y CONSUMOS (LIMPIOS PARA USO REAL)
export const INITIAL_ENCOUNTERS: ClinicalEncounter[] = [];
export const INITIAL_PROCEDURES: ClinicalProcedure[] = [];
export const INITIAL_ENCOUNTER_CONSUMPTIONS: EncounterConsumptionItem[] = [];

// 3.2 CATÁLOGO CENTRAL DE PRECIOS DE SERVICIOS
export const INITIAL_SERVICE_PRICES: ServicePriceItem[] = [
  { id: 'srv-1', code: 'SRV-CONS-01', name: 'Consulta Médica General Ambulatoria', category: 'CONSULTA', price: 18000, isBillable: true },
  { id: 'srv-2', code: 'SRV-CONS-02', name: 'Consulta de Guardia / Urgencia', category: 'CONSULTA', price: 28000, isBillable: true },
  { id: 'srv-3', code: 'SRV-HOSP-01', name: 'Día de Internación General (Caniles)', category: 'INTERNACION', price: 35000, isBillable: true },
  { id: 'srv-4', code: 'SRV-HOSP-02', name: 'Día de Internación UCI / Cuidados Críticos', category: 'INTERNACION', price: 65000, isBillable: true },
  { id: 'srv-5', code: 'SRV-LAB-01', name: 'Hemograma Completo con Frotis', category: 'LABORATORIO', price: 14000, isBillable: true },
  { id: 'srv-6', code: 'SRV-LAB-02', name: 'Perfil Bioquímico Renal y Hepático', category: 'LABORATORIO', price: 22000, isBillable: true },
  { id: 'srv-7', code: 'SRV-LAB-03', name: 'Uranálisis Completo con Sedimento', category: 'LABORATORIO', price: 11000, isBillable: true },
  { id: 'srv-8', code: 'SRV-IMG-01', name: 'Radiografía Digital (2 Proyecciones)', category: 'IMAGENES', price: 26000, isBillable: true },
  { id: 'srv-9', code: 'SRV-IMG-02', name: 'Ecografía Abdominal Completa', category: 'IMAGENES', price: 29000, isBillable: true },
  { id: 'srv-10', code: 'SRV-IMG-03', name: 'Ecocardiograma Doppler Color', category: 'IMAGENES', price: 42000, isBillable: true },
  { id: 'srv-11', code: 'SRV-PROC-01', name: 'Colocación de Vía Endovenosa / Catéter', category: 'PROCEDIMIENTO', price: 7500, isBillable: true },
  { id: 'srv-12', code: 'SRV-PROC-02', name: 'Curación Simple / Vendaje', category: 'PROCEDIMIENTO', price: 9000, isBillable: true },
  { id: 'srv-13', code: 'SRV-PROC-03', name: 'Sondaje Uretral Evacuador', category: 'PROCEDIMIENTO', price: 18500, isBillable: true },
  { id: 'srv-14', code: 'SRV-PROC-04', name: 'Sesión de Oxigenoterapia (x hora)', category: 'PROCEDIMIENTO', price: 8000, isBillable: true },
  { id: 'srv-15', code: 'SRV-PROC-05', name: 'Nebulización Terapéutica', category: 'PROCEDIMIENTO', price: 6500, isBillable: true },
];


// 4. SESIÓN DE CAJA
export const INITIAL_CASH_SESSIONS: CashRegisterSession[] = [
  {
    id: 'session-1',
    branchId: 'branch-1',
    openedAt: new Date().toISOString(),
    openedBy: 'Superadmin Sistema',
    initialCash: 50000,
    totalIncomeCash: 0,
    totalIncomeDigital: 0,
    totalExpenses: 0,
    isClosed: false,
  },
];

export const INITIAL_CASH_SESSION: CashRegisterSession = INITIAL_CASH_SESSIONS[0];

// 5. CATÁLOGO BASE DE FARMACIA & INSUMOS
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    code: 'MED-001',
    commercialName: 'Amoxicilina + Ácido Clavulánico 500mg',
    activeIngredient: 'Amoxicilina / Clavulanato',
    category: 'MEDICAMENTO',
    concentration: '500mg',
    presentation: 'Comprimidos x 10',
    laboratory: 'Droguería Central',
    costPrice: 4500,
    salePrice: 9000,
    currentStock: 25,
    minStock: 5,
    currentBatch: 'L-2489',
    expirationDate: '2027-06-30',
    supplier: 'Distribuidora Farmavet',
    requiresPrescription: true,
    branchId: 'branch-1',
  },
  {
    id: 'prod-2',
    code: 'MED-002',
    commercialName: 'Meloxicam 0.5% Inyectable 20ml',
    activeIngredient: 'Meloxicam',
    category: 'MEDICAMENTO',
    concentration: '0.5%',
    presentation: 'Frasco ampolla 20ml',
    laboratory: 'Lab Vet',
    costPrice: 6200,
    salePrice: 12500,
    currentStock: 18,
    minStock: 4,
    currentBatch: 'MEL-901',
    expirationDate: '2026-11-30',
    supplier: 'Distribuidora Farmavet',
    requiresPrescription: true,
    branchId: 'branch-1',
  },
  {
    id: 'prod-3',
    code: 'MED-003',
    commercialName: 'Tramadol 50mg/ml Inyectable',
    activeIngredient: 'Clorhidrato de Tramadol',
    category: 'PSICOTROPICO',
    concentration: '50mg/ml',
    presentation: 'Ampolla 2ml',
    laboratory: 'PharmaVet',
    costPrice: 2800,
    salePrice: 5900,
    currentStock: 30,
    minStock: 10,
    currentBatch: 'TRA-441',
    expirationDate: '2027-01-15',
    supplier: 'Droguería Oficial',
    requiresPrescription: true,
    branchId: 'branch-1',
  },
  {
    id: 'prod-4',
    code: 'DES-001',
    commercialName: 'Solución Ringer Lactato 500ml',
    activeIngredient: 'Ringer Lactato',
    category: 'DESCARTABLE',
    concentration: '500ml',
    presentation: 'Sachet 500ml',
    laboratory: 'Baxter',
    costPrice: 1800,
    salePrice: 3900,
    currentStock: 45,
    minStock: 15,
    currentBatch: 'RN-8802',
    expirationDate: '2028-03-31',
    supplier: 'Insumos Médicos',
    requiresPrescription: false,
    branchId: 'branch-1',
  },
  {
    id: 'prod-5',
    code: 'VAC-001',
    commercialName: 'Vacuna Séxtuple Canina (DHPPi+L)',
    activeIngredient: 'Biológico Canino Múltiple',
    category: 'VACUNA',
    concentration: 'Monodosis',
    presentation: 'Dosis monodosis liofilizada + diluyente',
    laboratory: 'Zoetis',
    costPrice: 8500,
    salePrice: 18000,
    currentStock: 35,
    minStock: 10,
    currentBatch: 'V6-7781',
    expirationDate: '2026-10-31',
    supplier: 'Distribuidora Biológicos',
    requiresPrescription: true,
    branchId: 'branch-1',
  },
];

// 6. REGLAS REGULATORIAS
export const INITIAL_REGULATORY_RULES: RegulatoryRule[] = [
  {
    id: 'rule-1',
    country: 'Argentina',
    province: 'Córdoba',
    municipality: 'Río Cuarto',
    organism: 'COLEGIO_VETERINARIO_CORDOBA',
    lawTitle: 'Ley 11.076 / 5.142 Ejercicio Profesional Veterinario Córdoba',
    lawNumber: 'Ley 11.076 / 5.142',
    articleSection: 'Art. 1 al 45',
    description: 'Obligación de matrícula profesional habilitante y dirección técnica.',
    clinicalImpactSummary: 'Firma y sello digital obligatorio en consultas.',
    affectedModule: 'EJERCICIO_PROFESIONAL',
    isMandatory: true,
    effectiveDate: '2020-01-01',
    version: '1.0',
    lastReviewedAt: '2026-01-01',
    reviewedBy: 'Dr. Diego Irusta',
    status: 'VIGENTE',
  },
  {
    id: 'rule-2',
    country: 'Argentina',
    province: 'Nacional',
    municipality: 'General',
    organism: 'SENASA',
    lawTitle: 'Receta Veterinaria Electrónica RVE SENASA',
    lawNumber: 'Res. SENASA 169/2021',
    articleSection: 'Art. 12',
    description: 'Prescripción digital de antimicrobianos y fármacos controlados.',
    clinicalImpactSummary: 'Emisión de duplicados y archivo digital oficial.',
    affectedModule: 'RECETARIO_SENASA',
    isMandatory: true,
    effectiveDate: '2021-06-01',
    version: '2.1',
    lastReviewedAt: '2026-01-01',
    reviewedBy: 'Dr. Diego Irusta',
    status: 'VIGENTE',
  },
  {
    id: 'rule-3',
    country: 'Argentina',
    province: 'Córdoba',
    municipality: 'Río Cuarto',
    organism: 'GOBIERNO_CORDOBA',
    lawTitle: 'Residuos Patológicos Ley 24.051 y Ordenanza Río Cuarto',
    lawNumber: 'Ley 24.051',
    articleSection: 'Capítulo IV',
    description: 'Segregación de residuos biopatogénicos en bolsa roja.',
    clinicalImpactSummary: 'Manifiesto de retiro y certificado de disposición final.',
    affectedModule: 'RESIDUOS_PATOLOGICOS',
    isMandatory: true,
    effectiveDate: '2018-01-01',
    version: '1.0',
    lastReviewedAt: '2026-01-01',
    reviewedBy: 'Dr. Diego Irusta',
    status: 'VIGENTE',
  },
  {
    id: 'rule-4',
    country: 'Argentina',
    province: 'Nacional',
    municipality: 'General',
    organism: 'MINISTERIO_SALUD',
    lawTitle: 'Ley 25.326 de Protección de Datos Personales',
    lawNumber: 'Ley 25.326',
    articleSection: 'Art. 5 y 9',
    description: 'Protección y enmascaramiento de datos personales de tutores.',
    clinicalImpactSummary: 'Control de acceso por roles RBAC.',
    affectedModule: 'PROTECCION_DATOS',
    isMandatory: true,
    effectiveDate: '2000-10-30',
    version: '1.0',
    lastReviewedAt: '2026-01-01',
    reviewedBy: 'Dr. Diego Irusta',
    status: 'VIGENTE',
  },
];

// 7. CATÁLOGO DE CONTROLADOS
export const INITIAL_CONTROLLED_DRUGS: ControlledDrugItem[] = [
  {
    id: 'ctrl-1',
    commercialName: 'Tramadol 50mg/ml Inyectable',
    activeIngredient: 'Clorhidrato de Tramadol',
    concentration: '50mg/ml',
    presentation: 'Ampolla 2ml',
    laboratory: 'PharmaVet',
    senasaCategory: 'CAT_I_OFICIAL_ARCHIVADA',
    currentStock: 30,
    unit: 'Ampolla',
    minStock: 10,
    lawClassification: 'LEY_19303_PSICOTROPICOS',
  },
  {
    id: 'ctrl-2',
    commercialName: 'Ketamina 10% 50ml',
    activeIngredient: 'Clorhidrato de Ketamina',
    concentration: '100mg/ml',
    presentation: 'Frasco 50ml',
    laboratory: 'Lab Vet',
    senasaCategory: 'CAT_I_OFICIAL_ARCHIVADA',
    currentStock: 10,
    unit: 'Frasco',
    minStock: 2,
    lawClassification: 'KETAMINA_RESOLUCION_SENASA',
  },
];
