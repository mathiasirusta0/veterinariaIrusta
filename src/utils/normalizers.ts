// VET SYSTEM — Módulo de Normalización Universal y Sanitización de Datos
import {
  Patient,
  Owner,
  Product,
  Invoice,
  LaboratoryOrder,
  SurgeryRecord,
  Hospitalization,
  Appointment,
  TriageEntry,
  VitalSigns,
  Species,
  Sex,
  ReproductiveStatus,
  PatientStatus,
  PatientAlert,
  ARCA_FISCAL_ENABLED,
} from '../types';

/**
 * Garantiza una cadena de texto segura, trimmed y sin riesgo de null/undefined.
 */
export function safeString(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val.trim();
  return String(val).trim();
}

/**
 * Garantiza un número válido, sin NaN ni Infinity.
 */
export function safeNumber(val: unknown, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') {
    return Number.isFinite(val) ? val : fallback;
  }
  const parsed = Number(val);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Garantiza un array iterable, devolviendo [] si es null/undefined.
 */
export function safeArray<T>(val: unknown): T[] {
  if (!val || !Array.isArray(val)) return [];
  return val as T[];
}

/**
 * Garantiza un booleano seguro.
 */
export function safeBoolean(val: unknown, fallback = false): boolean {
  if (typeof val === 'boolean') return val;
  if (val === 'true' || val === 1 || val === '1') return true;
  if (val === 'false' || val === 0 || val === '0') return false;
  return fallback;
}

/**
 * Normaliza pacientes asegurando alertas válidas, especies en mayúsculas y pesos > 0.
 */
export function normalizePatient(raw: any): Patient {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `pat-fallback-${Date.now()}`,
      clinicalRecordNumber: 'HC-SIN-NUMERO',
      name: 'Paciente sin registrar',
      species: 'CANINO',
      breed: 'Mestizo',
      sex: 'MACHO',
      reproductiveStatus: 'ENTERO',
      birthDate: new Date().toISOString().split('T')[0],
      calculatedAge: 'Desconocida',
      weight: 1.0,
      color: 'Estándar',
      ownerId: 'own-01',
      status: 'ACTIVO',
      alerts: [],
      branchId: 'branch-01',
      createdAt: new Date().toISOString(),
    };
  }

  // Normalizar Especie
  const rawSpecies = safeString(raw.species || raw.species_type).toUpperCase();
  let species: Species = 'CANINO';
  if (rawSpecies.includes('FEL') || rawSpecies.includes('GATO')) species = 'FELINO';
  else if (rawSpecies.includes('EXO') || rawSpecies.includes('AVE') || rawSpecies.includes('REPT')) species = 'EXOTICO';
  else if (rawSpecies.includes('EQU')) species = 'EQUINO';
  else if (rawSpecies.includes('BOV')) species = 'BOVINO';

  // Normalizar Sexo
  const rawSex = safeString(raw.sex || raw.gender).toUpperCase();
  const sex: Sex = rawSex.includes('H') || rawSex.includes('FEM') ? 'HEMBRA' : 'MACHO';

  // Normalizar Estado Reproductivo
  const rawRepro = safeString(raw.reproductiveStatus || raw.reproductive_status).toUpperCase();
  let reproductiveStatus: ReproductiveStatus = 'ENTERO';
  if (rawRepro.includes('CAST') || rawRepro.includes('ESTERIL')) reproductiveStatus = 'CASTRADO';
  else if (rawRepro.includes('GEST')) reproductiveStatus = 'GESTANTE';
  else if (rawRepro.includes('LACT')) reproductiveStatus = 'LACTANTE';

  // Normalizar Alertas
  const rawAlerts = safeArray(raw.alerts);
  const alerts: { type: PatientAlert; description: string }[] = rawAlerts.map((al: any) => {
    if (typeof al === 'string') {
      const type: PatientAlert = al.toLowerCase().includes('cardio')
        ? 'CARDIOPATIA'
        : al.toLowerCase().includes('medic')
        ? 'MEDICACION_CRONICA'
        : al.toLowerCase().includes('aisla')
        ? 'AISLAMIENTO'
        : al.toLowerCase().includes('agre')
        ? 'AGRESIVO'
        : al.toLowerCase().includes('anest')
        ? 'RIESGO_ANESTESICO'
        : 'ALERGIA';
      return { type, description: al };
    }
    return {
      type: (safeString(al?.type, 'ALERGIA').toUpperCase() as PatientAlert) || 'ALERGIA',
      description: safeString(al?.description || al?.title || al?.name, 'Alerta médica registrada'),
    };
  });

  return {
    id: safeString(raw.id, `pat-${Date.now()}`),
    clinicalRecordNumber: safeString(raw.clinicalRecordNumber || raw.clinical_record_number, 'HC-SN'),
    name: safeString(raw.name, 'Sin Nombre'),
    species,
    breed: safeString(raw.breed, 'Mestizo'),
    sex,
    reproductiveStatus,
    birthDate: safeString(raw.birthDate || raw.birth_date, '2022-01-01'),
    calculatedAge: safeString(raw.calculatedAge || raw.calculated_age, '1 año'),
    weight: Math.max(0.1, safeNumber(raw.weight, 1.0)),
    color: safeString(raw.color, 'No especificado'),
    microchip: raw.microchip ? safeString(raw.microchip) : undefined,
    photoUrl: raw.photoUrl || raw.photo_url || undefined,
    ownerId: safeString(raw.ownerId || raw.owner_id, 'own-01'),
    primaryVetId: raw.primaryVetId || raw.primary_vet_id || undefined,
    status: (safeString(raw.status, 'ACTIVO').toUpperCase() as PatientStatus) || 'ACTIVO',
    alerts,
    branchId: safeString(raw.branchId || raw.branch_id, 'branch-01'),
    createdAt: safeString(raw.createdAt || raw.created_at, new Date().toISOString()),
  };
}

/**
 * Normaliza tutores/propietarios.
 */
export function normalizeOwner(raw: any): Owner {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `own-fallback-${Date.now()}`,
      firstName: 'Tutor',
      lastName: 'Sin Registrar',
      dni: '00000000',
      phone: '0000000000',
      whatsapp: '0000000000',
      email: 'tutor@ejemplo.com',
      address: 'S/D',
      city: 'Buenos Aires',
      province: 'Buenos Aires',
      postalCode: '1000',
      balance: 0,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: safeString(raw.id, `own-${Date.now()}`),
    firstName: safeString(raw.firstName || raw.first_name, 'Tutor'),
    lastName: safeString(raw.lastName || raw.last_name, 'Registrado'),
    dni: safeString(raw.dni, '00000000'),
    cuit: raw.cuit ? safeString(raw.cuit) : undefined,
    phone: safeString(raw.phone, '0000000000'),
    whatsapp: safeString(raw.whatsapp || raw.phone, '0000000000'),
    email: safeString(raw.email, 'tutor@ejemplo.com'),
    address: safeString(raw.address, 'S/D'),
    city: safeString(raw.city, 'Buenos Aires'),
    province: safeString(raw.province, 'Buenos Aires'),
    postalCode: safeString(raw.postalCode || raw.postal_code, '1000'),
    notes: raw.notes ? safeString(raw.notes) : undefined,
    balance: safeNumber(raw.balance, 0),
    createdAt: safeString(raw.createdAt || raw.created_at, new Date().toISOString()),
  };
}

/**
 * Normaliza productos de inventario/farmacia.
 */
export function normalizeProduct(raw: any): Product {
  return {
    id: safeString(raw?.id, `prod-${Date.now()}`),
    code: safeString(raw?.code, 'SIN-CODIGO'),
    commercialName: safeString(raw?.commercialName || raw?.commercial_name, 'Producto sin nombre'),
    activeIngredient: safeString(raw?.activeIngredient || raw?.active_ingredient, 'N/A'),
    category: raw?.category || 'MEDICAMENTO',
    concentration: safeString(raw?.concentration, '100 mg/ml'),
    presentation: safeString(raw?.presentation || raw?.presentationUnit || raw?.presentation_unit, 'Unidad'),
    laboratory: safeString(raw?.laboratory || raw?.supplier, 'Laboratorio General'),
    currentStock: Math.max(0, safeNumber(raw?.currentStock || raw?.current_stock, 0)),
    minStock: Math.max(0, safeNumber(raw?.minStock || raw?.min_stock, 5)),
    costPrice: Math.max(0, safeNumber(raw?.costPrice || raw?.cost_price, 0)),
    salePrice: Math.max(0, safeNumber(raw?.salePrice || raw?.sale_price, 0)),
    expirationDate: safeString(raw?.expirationDate || raw?.expiration_date, '2026-12-31'),
    currentBatch: safeString(raw?.currentBatch || raw?.batchNumber || raw?.batch_number, 'L-001'),
    supplier: safeString(raw?.supplier || raw?.laboratory, 'Distribuidora Veterinaria'),
    branchId: safeString(raw?.branchId || raw?.branch_id, 'branch-01'),
  };
}

/**
 * Normaliza comprobantes y facturas.
 */
export function normalizeInvoice(raw: any): Invoice {
  return {
    id: safeString(raw?.id, `inv-${Date.now()}`),
    invoiceNumber: safeString(raw?.invoiceNumber || raw?.invoice_number, 'REC-0001-00000001'),
    pointOfSale: safeNumber(raw?.pointOfSale || raw?.point_of_sale, 1),
    type: raw?.type === 'PRESUPUESTO' ? 'PRESUPUESTO' : (raw?.type === 'COMPROBANTE_INTERNO' ? 'COMPROBANTE_INTERNO' : 'RECIBO_X'),
    customerName: safeString(raw?.customerName || raw?.customer_name || raw?.clientName, 'Consumidor Final'),
    customerDniCuit: safeString(raw?.customerDniCuit || raw?.customer_dni_cuit, '00000000'),
    customerTaxCondition: safeString(raw?.customerTaxCondition, 'Consumidor Final'),
    ownerId: safeString(raw?.ownerId || raw?.owner_id, 'own-01'),
    patientId: raw?.patientId || raw?.patient_id || undefined,
    date: safeString(raw?.date || raw?.issuedAt || raw?.issued_at, new Date().toISOString().split('T')[0]),
    items: safeArray(raw?.items).map((it: any, idx: number) => ({
      id: safeString(it?.id, `item-${idx}`),
      description: safeString(it?.description, 'Concepto médico / Insumo'),
      quantity: Math.max(1, safeNumber(it?.quantity, 1)),
      unitPrice: Math.max(0, safeNumber(it?.unitPrice || it?.unit_price, 0)),
      subtotal: Math.max(0, safeNumber(it?.subtotal, 0)),
    })),
    totalAmount: Math.max(0, safeNumber(raw?.totalAmount || raw?.total, 0)),
    paymentMethod: raw?.paymentMethod || 'EFECTIVO',
    status: raw?.status === 'ANULADO' ? 'ANULADO' : 'EMITIDO',
    voidedAt: raw?.voidedAt || raw?.voided_at || undefined,
    voidedBy: raw?.voidedBy || raw?.voided_by || undefined,
    voidReason: raw?.voidReason || raw?.void_reason || undefined,
    isFiscal: false,
    branchId: safeString(raw?.branchId || raw?.branch_id, 'branch-01'),
    notes: safeString(raw?.notes, ''),
  };
}
