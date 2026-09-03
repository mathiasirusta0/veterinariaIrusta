// VET SYSTEM — Módulo de Formateo Seguro, Fechas y Constantes Clínicas

/**
 * Formatea una fecha en formato local es-AR (DD/MM/AAAA).
 * Previene estrictamente la aparición de "Invalid Date" o crashes.
 */
export function formatDate(
  val: unknown,
  fallback = 'Fecha no registrada',
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }
): string {
  if (!val) return fallback;
  try {
    const d = new Date(val as string | number | Date);
    if (isNaN(d.getTime())) return fallback;
    return d.toLocaleDateString('es-AR', options);
  } catch {
    return fallback;
  }
}

/**
 * Formatea fecha de vencimiento farmacéutico en formato MM/AAAA.
 */
export function formatExpirationDate(val: unknown, fallback = 'S/V'): string {
  if (!val) return fallback;
  if (typeof val === 'string' && /^\d{2}\/\d{4}$/.test(val)) return val;
  try {
    const d = new Date(val as string | number | Date);
    if (isNaN(d.getTime())) return typeof val === 'string' ? val : fallback;
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${m}/${d.getFullYear()}`;
  } catch {
    return fallback;
  }
}

/**
 * Formatea fecha y hora completa en formato 24hs es-AR (DD/MM/AAAA HH:MM hs).
 */
export function formatDateTime(val: unknown, fallback = 'S/D'): string {
  if (!val) return fallback;
  try {
    const d = new Date(val as string | number | Date);
    if (isNaN(d.getTime())) return fallback;
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${d.toLocaleDateString('es-AR')} ${hours}:${minutes} hs`;
  } catch {
    return fallback;
  }
}

/**
 * Formatea solo la hora en formato 24hs (HH:mm hs).
 */
export function formatTime(val: unknown, fallback = '--:--'): string {
  if (!val) return fallback;
  try {
    const d = new Date(val as string | number | Date);
    if (isNaN(d.getTime())) return fallback;
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes} hs`;
  } catch {
    return fallback;
  }
}

/**
 * Calcula la Presión Arterial Media (PAM) en mmHg según la fórmula clínica estándar:
 * PAM = (TAS + 2 * TAD) / 3
 * Valida que TAS > TAD y ambos sean números positivos mayores a cero.
 */
export function calculateMeanArterialPressure(tas?: number | null, tad?: number | null): number | undefined {
  if (tas === undefined || tas === null || tad === undefined || tad === null) return undefined;
  const s = Number(tas);
  const d = Number(tad);
  if (isNaN(s) || isNaN(d) || s <= 0 || d <= 0 || s <= d) return undefined;
  return Math.round((s + 2 * d) / 3);
}

/**
 * Calcula los minutos transcurridos en sala de espera, protegido contra fechas futuras o inválidas.
 */
export function calculateWaitMinutes(arrivedAt: unknown): number {
  if (!arrivedAt) return 0;
  try {
    const arr = new Date(arrivedAt as string | number | Date);
    if (isNaN(arr.getTime())) return 0;
    const diffMs = Date.now() - arr.getTime();
    if (diffMs < 0) return 0; // fecha futura
    const mins = Math.floor(diffMs / 60000);
    if (mins > 1440) {
      const now = new Date();
      const todayArr = new Date(now.getFullYear(), now.getMonth(), now.getDate(), arr.getHours(), arr.getMinutes());
      const todayDiff = Math.max(1, Math.floor((now.getTime() - todayArr.getTime()) / 60000));
      return Math.min(180, Math.max(1, todayDiff));
    }
    return Math.max(1, Math.min(180, mins));
  } catch {
    return 0;
  }
}

/**
 * Formatea valores de moneda en pesos argentinos con formato estricto:
 * Positivo: $12.500,00
 * Negativo: -$12.500,00 (Previene estrictamente "$-15.000" o "$$15.000")
 */
export function formatCurrency(amount: unknown, fallback = '$0,00'): string {
  if (amount === null || amount === undefined || amount === '') return fallback;
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (isNaN(num)) return fallback;

  const isNegative = num < 0;
  const absValue = Math.abs(num);
  const formattedAbs = absValue.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return isNegative ? `-$${formattedAbs}` : `$${formattedAbs}`;
}

/**
 * Convierte enums técnicos de alertas médicas a texto legible y humano.
 */
export function formatAlertLabel(type: unknown, fallback = 'Alerta médica'): string {
  if (!type || typeof type !== 'string') return fallback;
  const upper = type.toUpperCase().trim();

  const labels: Record<string, string> = {
    CONDICION_CRONICA: 'Condición crónica',
    MEDICACION_CRONICA: 'Medicación crónica',
    RIESGO_ANESTESICO: 'Riesgo anestésico',
    ALERGIA: 'Alergia',
    CARDIOPATIA: 'Cardiopatía',
    RENAL: 'Patología renal',
    AGRESIVO: 'Manejo cuidadoso / Agresivo',
    AISLAMIENTO: 'Aislamiento infeccioso',
    DIABETICO: 'Diabético',
    EPILEPTICO: 'Epiléptico',
    ONCOLOGICO: 'Oncológico',
    GERIATRICO: 'Paciente geriátrico',
    BRAQUICEFALICO: 'Braquicefálico / Vía aérea',
    AYUNO_PROLONGADO: 'Ayuno prolongado',
    INMUNODEPRIMIDO: 'Inmunodeprimido',
  };

  if (labels[upper]) return labels[upper];

  // Formato por defecto para cualquier otro enum snake_case
  return upper
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Enmascara datos personales (PII) de teléfonos para roles sin privilegio.
 * Ej: "11 6789-1234" -> "11 67***-**34"
 */
export function maskPhoneNumber(phone: unknown, canViewPii = true): string {
  if (!phone || typeof phone !== 'string') return 'Sin teléfono';
  if (canViewPii) return phone;
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return '***';
  const visibleStart = cleaned.slice(0, 4);
  const visibleEnd = cleaned.slice(-2);
  return `${visibleStart}***-**${visibleEnd}`;
}

/**
 * Enmascara DNI / CUIT para protección de datos personales según RBAC.
 * Ej: "38123456" -> "38.***.456"
 */
export function maskDni(dni: unknown, canViewPii = true): string {
  if (!dni || typeof dni !== 'string') return 'S/D';
  if (canViewPii) return dni;
  const digits = dni.replace(/\D/g, '');
  if (digits.length <= 4) return '***';
  return `${digits.slice(0, 2)}.***.${digits.slice(-3)}`;
}

/**
 * Formatea el peso corporal veterinario sin duplicación de unidades (ej: 12.5 kg).
 */
export function formatWeight(weight: unknown, fallback = '0.0 kg'): string {
  if (weight === null || weight === undefined) return fallback;
  const num = typeof weight === 'number' ? weight : Number(weight);
  if (isNaN(num) || num <= 0) return fallback;
  const rounded = Math.round(num * 10) / 10;
  return `${rounded.toFixed(1)} kg`;
}

/**
 * Formatea la temperatura corporal clínica veterinaria (ej: 38.5 °C).
 * Previene bugs de doble símbolo como "38.5° °C".
 */
export function formatTemperature(temp: unknown, fallback = '-- °C'): string {
  if (temp === null || temp === undefined) return fallback;
  const num = typeof temp === 'number' ? temp : Number(temp);
  if (isNaN(num) || num <= 0) return fallback;
  return `${num.toFixed(1)} °C`;
}

/**
 * Formatea número de comprobante interno (ej: REC-0001-00004120).
 */
export function formatInvoiceNumber(
  type: string,
  pointOfSale: unknown,
  number: unknown
): string {
  const t = type || 'B';
  const posNum = Number(pointOfSale) || 1;
  const invNum = Number(number) || 1;
  const posStr = posNum.toString().padStart(4, '0');
  const invStr = invNum.toString().padStart(8, '0');
  return `${t}-${posStr}-${invStr}`;
}

/**
 * Formatea duración en minutos a un texto legible (ej: 90 -> '1h 30m', 45 -> '45m').
 */
export function formatDurationMinutes(minutes: unknown, fallback = '0m'): string {
  if (minutes === null || minutes === undefined) return fallback;
  const num = typeof minutes === 'number' ? minutes : Number(minutes);
  if (isNaN(num) || num <= 0) return fallback;
  const h = Math.floor(num / 60);
  const m = Math.round(num % 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

/**
 * Sanitiza y formatea un número de teléfono para enlaces internacionales WhatsApp / E.164.
 * Si es un número local argentino (ej: 11 6789-1234), añade el prefijo +54 9.
 */
export function formatPhoneNumberE164(phone: unknown, fallback = '5491167891234'): string {
  if (!phone || typeof phone !== 'string') return fallback;
  const digits = phone.replace(/\D/g, '');
  if (!digits) return fallback;
  if (digits.startsWith('549')) return digits;
  if (digits.startsWith('54')) return `549${digits.slice(2)}`;
  if (digits.startsWith('0')) return `549${digits.slice(1)}`;
  if (digits.length === 10) return `549${digits}`;
  return digits;
}

export interface FormattedBalance {
  label: string;
  amountFormatted: string;
  isDebt: boolean;
  isCredit: boolean;
  isSettled: boolean;
  badgeClass: string;
}

/**
 * Formatea el saldo de cuenta corriente del tutor con semántica clara.
 * Evita números negativos ambiguos (ej: '-$15.000' -> 'Debe $15.000').
 */
export function formatOwnerBalance(balance: unknown): FormattedBalance {
  if (balance === null || balance === undefined) {
    return {
      label: 'Al día',
      amountFormatted: '$0',
      isDebt: false,
      isCredit: false,
      isSettled: true,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }

  const num = typeof balance === 'number' ? balance : Number(balance);
  if (isNaN(num) || num === 0) {
    return {
      label: 'Al día',
      amountFormatted: '$0',
      isDebt: false,
      isCredit: false,
      isSettled: true,
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    };
  }

  const absValue = Math.abs(num);
  const formattedAbs = absValue % 1 === 0
    ? absValue.toLocaleString('es-AR')
    : absValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (num < 0) {
    return {
      label: `Debe $${formattedAbs}`,
      amountFormatted: `-$${formattedAbs}`,
      isDebt: true,
      isCredit: false,
      isSettled: false,
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    };
  }

  return {
    label: `Saldo a favor $${formattedAbs}`,
    amountFormatted: `+$${formattedAbs}`,
    isDebt: false,
    isCredit: true,
    isSettled: false,
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
  };
}

/**
 * Retorna la fecha local actual de Argentina (America/Argentina/Buenos_Aires) en formato ISO YYYY-MM-DD.
 * Elimina cualquier desfase de 1 día provocado por toISOString() en horario nocturno (UTC vs UTC-3).
 */
export function getTodayLocalDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Argentina/Buenos_Aires',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

/**
 * Retorna la hora local actual de Argentina en formato HH:MM (24 hs).
 */
export function getCurrentLocalTimeString(): string {
  try {
    const formatter = new Intl.DateTimeFormat('es-AR', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return formatter.format(new Date());
  } catch {
    const d = new Date();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
}

/**
 * Calcula la edad legible y precisa de un paciente a partir de su fecha de nacimiento.
 * Previene contradicciones como 'Adulto' si la fecha de nacimiento es hoy o reciente.
 */
export function calculatePatientAgeString(birthDateVal: unknown): string {
  if (!birthDateVal) return 'Edad no registrada';
  try {
    const birth = new Date(birthDateVal as string | number | Date);
    if (isNaN(birth.getTime())) return 'Edad no registrada';
    const now = new Date();
    const diffMs = now.getTime() - birth.getTime();
    if (diffMs < 0) return 'Fecha futura no válida';

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 30) {
      return diffDays <= 1 ? 'Cachorro / Recién nacido' : `${diffDays} días`;
    }
    const diffMonths = Math.floor(diffDays / 30.4375);
    if (diffMonths < 12) {
      return diffMonths === 1 ? '1 mes' : `${diffMonths} meses`;
    }
    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    if (remainingMonths === 0) {
      return years === 1 ? '1 año' : `${years} años`;
    }
    return `${years} ${years === 1 ? 'año' : 'años'} y ${remainingMonths} ${remainingMonths === 1 ? 'mes' : 'meses'}`;
  } catch {
    return 'Edad no registrada';
  }
}

/**
 * Resuelve el estado clínico canónico único e inmutable de un paciente
 * cruzando datos del paciente y sus internaciones activas para evitar inconsistencias.
 */
export function getPatientCanonicalStatus(
  patient: { id?: string; status?: string; isArchived?: boolean } | null | undefined,
  hospitalizations: Array<{ patientId: string; status: string; kennelNumber?: string; sector?: string }> = []
): {
  statusCode: 'INTERNADO' | 'ACTIVO' | 'ARCHIVADO' | 'ALTA_MEDICA' | 'FALLECIDO' | 'DERIVADO';
  label: string;
  badgeClass: string;
  isHospitalized: boolean;
  kennelNumber?: string;
  sector?: string;
} {
  if (!patient) {
    return {
      statusCode: 'ACTIVO',
      label: 'Ambulatorio / Activo',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      isHospitalized: false,
    };
  }

  if (patient.status === 'ARCHIVADO' || patient.isArchived) {
    return {
      statusCode: 'ARCHIVADO',
      label: 'Archivado',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-300',
      isHospitalized: false,
    };
  }

  if (patient.status === 'FALLECIDO') {
    return {
      statusCode: 'FALLECIDO',
      label: 'Fallecido',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
      isHospitalized: false,
    };
  }

  // Verificar internación activa en curso
  const activeHosp = patient.id
    ? hospitalizations.find((h) => h.patientId === patient.id && h.status === 'ACTIVA')
    : undefined;

  if (activeHosp) {
    const box = activeHosp.kennelNumber ? `Box ${activeHosp.kennelNumber}` : 'UCI';
    const sec = activeHosp.sector || 'Cuidados Críticos';
    return {
      statusCode: 'INTERNADO',
      label: `🏥 INTERNADO (${box} - ${sec})`,
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-black',
      isHospitalized: true,
      kennelNumber: activeHosp.kennelNumber,
      sector: activeHosp.sector,
    };
  }

  if (patient.status === 'ALTA_MEDICA' || patient.status === 'ALTA') {
    return {
      statusCode: 'ALTA_MEDICA',
      label: 'Alta Médica',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      isHospitalized: false,
    };
  }

  return {
    statusCode: 'ACTIVO',
    label: '🟢 EN ATENCIÓN CLÍNICA',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
    isHospitalized: false,
  };
}

/**
 * Escapes HTML special characters to neutralize XSS in print templates, PDF generation, and DOM injection.
 */
export function escapeHtml(str: string | number | undefined | null): string {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
