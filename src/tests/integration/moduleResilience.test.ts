import { describe, it, expect } from 'vitest';
import {
  normalizePatient,
  normalizeProduct,
  normalizeInvoice,
  normalizeOwner,
} from '../../utils/normalizers';
import { formatDate, formatTime, formatWeight, formatTemperature, formatCurrency } from '../../utils/formatters';

describe('System Resilience Against Malformed & Null Payloads', () => {
  it('should normalize completely empty database row objects without throwing', () => {
    const emptyRow = {};
    const patient = normalizePatient(emptyRow);
    const product = normalizeProduct(emptyRow);
    const invoice = normalizeInvoice(emptyRow);
    const owner = normalizeOwner(emptyRow);

    expect(patient).toBeDefined();
    expect(product).toBeDefined();
    expect(invoice).toBeDefined();
    expect(owner).toBeDefined();

    // Verify formatters do not crash with empty object values
    expect(formatDate(patient.birthDate)).toBeDefined();
    expect(formatTime(invoice.date)).toBeDefined();
    expect(formatWeight(patient.weight)).toBe('1.0 kg');
    expect(formatTemperature(null)).toBe('-- °C');
    expect(formatCurrency(invoice.totalAmount)).toBe('$0,00');
  });

  it('should handle corrupt arrays and non-string alerts gracefully', () => {
    const corruptedPatient = {
      id: 'pat-corrupt-1',
      name: 'Simón',
      species: 'CANINO',
      alerts: [null, undefined, 12345, { invalid: true }],
    };

    const normalized = normalizePatient(corruptedPatient);
    expect(normalized.alerts.length).toBe(4);
    expect(normalized.alerts.every((a) => typeof a.type === 'string' && typeof a.description === 'string')).toBe(true);
  });
});
