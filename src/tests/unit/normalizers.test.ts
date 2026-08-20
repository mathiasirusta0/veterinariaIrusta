import { describe, it, expect } from 'vitest';
import {
  safeString,
  safeNumber,
  safeArray,
  safeBoolean,
  normalizePatient,
  normalizeOwner,
  normalizeProduct,
  normalizeInvoice,
} from '../../utils/normalizers';

describe('Universal Data Normalizers Unit Tests', () => {
  it('safeString should safely convert null/undefined/mixed types without throwing', () => {
    expect(safeString(null)).toBe('');
    expect(safeString(undefined)).toBe('');
    expect(safeString(123)).toBe('123');
    expect(safeString('  Toby  ')).toBe('Toby');
    expect(safeString(null, 'Default')).toBe('Default');
  });

  it('safeNumber should safely convert values and prevent NaN', () => {
    expect(safeNumber(null)).toBe(0);
    expect(safeNumber(undefined)).toBe(0);
    expect(safeNumber('12.5')).toBe(12.5);
    expect(safeNumber('abc', 10)).toBe(10);
    expect(safeNumber(NaN, 5)).toBe(5);
  });

  it('safeArray should always return an array', () => {
    expect(safeArray(null)).toEqual([]);
    expect(safeArray(undefined)).toEqual([]);
    expect(safeArray([1, 2])).toEqual([1, 2]);
  });

  it('safeBoolean should safely parse boolean values', () => {
    expect(safeBoolean(true)).toBe(true);
    expect(safeBoolean('true')).toBe(true);
    expect(safeBoolean(1)).toBe(true);
    expect(safeBoolean(false)).toBe(false);
    expect(safeBoolean('false')).toBe(false);
    expect(safeBoolean(null, true)).toBe(true);
  });

  it('normalizePatient should handle null/undefined and normalize alerts', () => {
    const corruptPatient = {
      id: null,
      name: '  Rocky  ',
      species: 'felino',
      weight: 'invalid_weight',
      alerts: ['Alergia a penicilina', { type: 'CARDIOPATIA', description: 'Soplo II/VI' }],
    };

    const normalized = normalizePatient(corruptPatient);
    expect(normalized.name).toBe('Rocky');
    expect(normalized.species).toBe('FELINO');
    expect(normalized.weight).toBe(1.0); // fallback weight >= 0.1
    expect(normalized.alerts.length).toBe(2);
    expect(normalized.alerts[0].type).toBe('ALERGIA');
    expect(normalized.alerts[1].type).toBe('CARDIOPATIA');
  });

  it('normalizeProduct should sanitize product catalog item', () => {
    const corruptProduct = {
      commercialName: null,
      activeIngredient: undefined,
      code: 'MED-01',
      currentStock: '15',
      salePrice: null,
    };

    const normalized = normalizeProduct(corruptProduct);
    expect(normalized.commercialName).toBe('Producto sin nombre');
    expect(normalized.activeIngredient).toBe('N/A');
    expect(normalized.code).toBe('MED-01');
    expect(normalized.currentStock).toBe(15);
    expect(normalized.salePrice).toBe(0);
  });
});
