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
 * Formatea valores de moneda en pesos argentinos ($12.500,00).
 */
export function formatCurrency(amount: unknown, fallback = '$0,00'): string {
  if (amount === null || amount === undefined) return fallback;
  const num = typeof amount === 'number' ? amount : Number(amount);
  if (isNaN(num)) return fallback;
  return `$${num.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
 * Evita números negativos ambiguos (ej: '$-15.000' -> 'Debe $15.000').
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

  if (num < 0) {
    const debt = Math.abs(num);
    return {
      label: `Debe $${debt.toLocaleString('es-AR')}`,
      amountFormatted: `$${debt.toLocaleString('es-AR')}`,
      isDebt: true,
      isCredit: false,
      isSettled: false,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-bold',
    };
  }

  return {
    label: `Saldo a favor $${num.toLocaleString('es-AR')}`,
    amountFormatted: `$${num.toLocaleString('es-AR')}`,
    isDebt: false,
    isCredit: true,
    isSettled: false,
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200 font-bold',
  };
}

/**
 * Formatea una fecha de vencimiento farmacológico (ej: "2027-04-15" -> "04/2027").
 */
export function formatExpirationDate(val: unknown, fallback = 'S/V'): string {
  if (!val) return fallback;
  if (typeof val === 'string' && /^\d{2}\/\d{4}$/.test(val)) return val;
  try {
    const d = new Date(val as string | number | Date);
    if (isNaN(d.getTime())) return String(val);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${month}/${year}`;
  } catch {
    return String(val) || fallback;
  }
}

