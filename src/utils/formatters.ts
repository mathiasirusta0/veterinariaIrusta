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
    return Math.max(1, Math.floor(diffMs / 60000));
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
