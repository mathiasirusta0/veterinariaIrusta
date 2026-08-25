import { MedicationDoseSlot } from '../types';

/**
 * Parses frequency string to extract interval hours
 */
export function computeIntervalHours(frequency?: string): number {
  if (!frequency) return 8;
  const lower = frequency.toLowerCase();
  if (lower.includes('única') || lower.includes('unica') || lower.includes('urgencia')) return 0;
  // Match 24hs before 4hs to avoid substring false positives
  if (lower.includes('24 hs') || lower.includes('24hs') || lower.includes('24 horas') || lower.includes('1 toma')) return 24;
  if (lower.includes('12 hs') || lower.includes('12hs') || lower.includes('12 horas') || lower.includes('2 tomas')) return 12;
  if (lower.includes('8 hs') || lower.includes('8hs') || lower.includes('8 horas') || lower.includes('3 tomas')) return 8;
  if (lower.includes('6 hs') || lower.includes('6hs') || lower.includes('6 horas') || lower.includes('4 tomas')) return 6;
  if (lower.includes('4 hs') || lower.includes('4hs') || lower.includes('4 horas')) return 4;
  if (lower.includes('2 hs') || lower.includes('2hs') || lower.includes('2 horas')) return 2;
  return 8;
}

/**
 * Calculates 24h dose round times from starting time and frequency
 */
export function computeDoseTimes(startTime: string = '08:00', frequency?: string): string[] {
  const interval = computeIntervalHours(frequency);
  
  if (interval === 0 || interval >= 24) {
    const cleanStart = (startTime || '08:00').trim();
    return [cleanStart.length === 5 ? cleanStart : '08:00'];
  }

  const parts = (startTime || '08:00').split(':');
  const startHour = parseInt(parts[0], 10) || 8;
  const startMin = parts[1] ? parseInt(parts[1], 10) || 0 : 0;
  const minStr = startMin.toString().padStart(2, '0');

  const dosesPerDay = Math.floor(24 / interval);
  const times: string[] = [];

  for (let i = 0; i < dosesPerDay; i++) {
    const rawHour = (startHour + i * interval) % 24;
    const hourStr = rawHour.toString().padStart(2, '0');
    times.push(`${hourStr}:${minStr}`);
  }

  return times;
}

/**
 * Creates initial dose slots in PENDIENTE state
 */
export function computeInitialDoseSlots(startTime: string = '08:00', frequency?: string): MedicationDoseSlot[] {
  const times = computeDoseTimes(startTime, frequency);
  return times.map((time) => ({
    time,
    status: 'PENDIENTE' as const,
  }));
}

/**
 * Identifies hospital shift for a given time
 */
export function getShiftFromTime(timeStr: string): 'MAÑANA' | 'TARDE' | 'NOCHE' {
  const hour = parseInt(timeStr.split(':')[0], 10) || 0;
  if (hour >= 6 && hour < 14) return 'MAÑANA';
  if (hour >= 14 && hour < 22) return 'TARDE';
  return 'NOCHE';
}

/**
 * Formats time with round descriptor (e.g. "08:00 hs (Mañana)")
 */
export function formatDoseSlotLabel(timeStr: string): string {
  const shift = getShiftFromTime(timeStr);
  const shiftName = shift === 'MAÑANA' ? 'Mañana' : shift === 'TARDE' ? 'Tarde' : 'Noche/Guardia';
  return `${timeStr} hs (${shiftName})`;
}
