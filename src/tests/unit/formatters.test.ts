import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatTime,
  calculateWaitMinutes,
  formatCurrency,
  formatWeight,
  formatTemperature,
  formatInvoiceNumber,
} from '../../utils/formatters';

describe('Safe Formatters Unit Tests', () => {
  it('formatDate should never return "Invalid Date"', () => {
    expect(formatDate(null)).toBe('Fecha no registrada');
    expect(formatDate(undefined)).toBe('Fecha no registrada');
    expect(formatDate('invalid-date-string')).toBe('Fecha no registrada');
    expect(formatDate('2026-08-20T12:00:00Z')).toContain('2026');
  });

  it('formatDateTime and formatTime should format correctly without exceptions', () => {
    expect(formatDateTime(null)).toBe('S/D');
    expect(formatTime(null)).toBe('--:--');
    expect(formatTime('2026-08-20T14:30:00')).toContain('14:30');
  });

  it('calculateWaitMinutes should prevent negative values and invalid dates', () => {
    expect(calculateWaitMinutes(null)).toBe(0);
    expect(calculateWaitMinutes('invalid_date')).toBe(0);

    // 10 minutes ago
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(calculateWaitMinutes(tenMinAgo)).toBeGreaterThanOrEqual(10);

    // Future date should not return negative numbers
    const futureDate = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    expect(calculateWaitMinutes(futureDate)).toBe(0);
  });

  it('formatCurrency should render Argentine Pesos cleanly', () => {
    expect(formatCurrency(null)).toBe('$0,00');
    expect(formatCurrency(15000)).toContain('15.000');
    expect(formatCurrency('2500.50')).toContain('2.500,50');
  });

  it('formatTemperature should prevent "38.5° °C" duplication', () => {
    expect(formatTemperature(38.5)).toBe('38.5 °C');
    expect(formatTemperature(null)).toBe('-- °C');
    expect(formatTemperature('39.1')).toBe('39.1 °C');
  });

  it('formatWeight should format kilograms correctly', () => {
    expect(formatWeight(12.45)).toBe('12.5 kg');
    expect(formatWeight(null)).toBe('0.0 kg');
    expect(formatWeight(0)).toBe('0.0 kg');
  });

  it('formatInvoiceNumber should format standard AFIP point-of-sale invoice strings', () => {
    expect(formatInvoiceNumber('B', 2, 4921)).toBe('B-0002-00004921');
    expect(formatInvoiceNumber('A', null, null)).toBe('A-0001-00000001');
  });
});
