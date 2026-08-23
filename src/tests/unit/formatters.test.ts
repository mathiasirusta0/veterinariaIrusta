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
  formatDurationMinutes,
  formatPhoneNumberE164,
  formatOwnerBalance,
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

    // Ancient date (from 1 year ago) should cap at realistic wait window <= 180 min
    expect(calculateWaitMinutes('2024-08-19T10:00:00Z')).toBeLessThanOrEqual(180);
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

  it('formatDurationMinutes should format durations in human-readable strings', () => {
    expect(formatDurationMinutes(90)).toBe('1h 30m');
    expect(formatDurationMinutes(60)).toBe('1h');
    expect(formatDurationMinutes(25)).toBe('25m');
    expect(formatDurationMinutes(null)).toBe('0m');
    expect(formatDurationMinutes(0)).toBe('0m');
  });

  it('formatPhoneNumberE164 should normalize Argentine and international phone numbers', () => {
    expect(formatPhoneNumberE164('+54 9 11 6789-1234')).toBe('5491167891234');
    expect(formatPhoneNumberE164('1167891234')).toBe('5491167891234');
    expect(formatPhoneNumberE164('01167891234')).toBe('5491167891234');
    expect(formatPhoneNumberE164(null)).toBe('5491167891234');
  });

  it('formatOwnerBalance should format debt, credit and settled balances with unambiguous labels', () => {
    // Debt case (negative balance)
    const debtRes = formatOwnerBalance(-15000);
    expect(debtRes.label).toBe('Debe $15.000');
    expect(debtRes.isDebt).toBe(true);
    expect(debtRes.isCredit).toBe(false);
    expect(debtRes.isSettled).toBe(false);

    // Credit / advance case (positive balance)
    const creditRes = formatOwnerBalance(5000);
    expect(creditRes.label).toBe('Saldo a favor $5.000');
    expect(creditRes.isDebt).toBe(false);
    expect(creditRes.isCredit).toBe(true);

    // Settled case (0 or null)
    const zeroRes = formatOwnerBalance(0);
    expect(zeroRes.label).toBe('Al día');
    expect(zeroRes.isSettled).toBe(true);

    const nullRes = formatOwnerBalance(null);
    expect(nullRes.label).toBe('Al día');
    expect(nullRes.isSettled).toBe(true);
  });
});
