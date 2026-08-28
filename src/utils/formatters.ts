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
 * Formatea solo la hora en formato 24hs (HH:MM hs).
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
 * Formatea número de comprobante fiscal AFIP (ej: B-0002-00004120).
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
