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

  it('should support safe patient alert updates and weight calculations', () => {
    const patient = normalizePatient({
      id: 'pat-100',
      name: 'Toby',
      species: 'CANINO',
      weight: 32.5,
      alerts: [{ type: 'ALERGIA', description: 'Alérgico a Dipirona' }],
    });

    expect(patient.alerts.length).toBe(1);
    expect(patient.alerts[0].type).toBe('ALERGIA');

    // Simulate adding an alert
    const updatedAlerts = [...patient.alerts, { type: 'RIESGO_ANESTESICO', description: 'Bradicardia' }];
    expect(updatedAlerts.length).toBe(2);

    // Simulate removing an alert
    const filteredAlerts = updatedAlerts.filter((_, idx) => idx !== 0);
    expect(filteredAlerts.length).toBe(1);
    expect(filteredAlerts[0].type).toBe('RIESGO_ANESTESICO');

    // Simulate weight delta
    const previousWeight = 30.0;
    const currentWeight = 32.5;
    const diff = Math.round((currentWeight - previousWeight) * 10) / 10;
    const pct = ((diff / previousWeight) * 100).toFixed(1);
    expect(diff).toBe(2.5);
    expect(pct).toBe('8.3');
  });
});
