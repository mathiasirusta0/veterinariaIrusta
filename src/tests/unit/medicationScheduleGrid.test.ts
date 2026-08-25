import { describe, it, expect } from 'vitest';
import {
  computeIntervalHours,
  computeDoseTimes,
  computeInitialDoseSlots,
  getShiftFromTime,
  formatDoseSlotLabel,
} from '../../utils/medicationScheduleHelper';

describe('Medication Schedule Grid & Shift Slots', () => {
  it('calculates correct interval hours from frequency strings', () => {
    expect(computeIntervalHours('Cada 6 hs (4 tomas/día)')).toBe(6);
    expect(computeIntervalHours('Cada 8 hs (3 tomas/día)')).toBe(8);
    expect(computeIntervalHours('Cada 12 hs (2 tomas/día)')).toBe(12);
    expect(computeIntervalHours('Cada 24 hs (1 toma/día)')).toBe(24);
    expect(computeIntervalHours('Dosis única / Urgencia')).toBe(0);
  });

  it('calculates exact 24h dose round times for every 8 hours', () => {
    const times8h = computeDoseTimes('08:00', 'Cada 8 hs');
    expect(times8h).toEqual(['08:00', '16:00', '00:00']);
  });

  it('calculates exact 24h dose round times for every 12 hours', () => {
    const times12h = computeDoseTimes('08:00', 'Cada 12 hs');
    expect(times12h).toEqual(['08:00', '20:00']);
  });

  it('calculates exact 24h dose round times for every 6 hours', () => {
    const times6h = computeDoseTimes('06:00', 'Cada 6 hs');
    expect(times6h).toEqual(['06:00', '12:00', '18:00', '00:00']);
  });

  it('calculates exact dose round times for once-daily (24h)', () => {
    const times24h = computeDoseTimes('09:00', 'Cada 24 hs');
    expect(times24h).toEqual(['09:00']);
  });

  it('initializes dose slots with PENDIENTE state for all rounds', () => {
    const slots = computeInitialDoseSlots('08:00', 'Cada 8 hs');
    expect(slots.length).toBe(3);
    expect(slots[0]).toEqual({ time: '08:00', status: 'PENDIENTE' });
    expect(slots[1]).toEqual({ time: '16:00', status: 'PENDIENTE' });
    expect(slots[2]).toEqual({ time: '00:00', status: 'PENDIENTE' });
  });

  it('correctly maps round hours to hospital shifts', () => {
    expect(getShiftFromTime('08:00')).toBe('MAÑANA');
    expect(getShiftFromTime('12:00')).toBe('MAÑANA');
    expect(getShiftFromTime('16:00')).toBe('TARDE');
    expect(getShiftFromTime('20:00')).toBe('TARDE');
    expect(getShiftFromTime('00:00')).toBe('NOCHE');
    expect(getShiftFromTime('02:00')).toBe('NOCHE');
  });

  it('formats user-friendly dose slot labels with shift descriptor', () => {
    expect(formatDoseSlotLabel('08:00')).toBe('08:00 hs (Mañana)');
    expect(formatDoseSlotLabel('16:00')).toBe('16:00 hs (Tarde)');
    expect(formatDoseSlotLabel('00:00')).toBe('00:00 hs (Noche/Guardia)');
  });
});
