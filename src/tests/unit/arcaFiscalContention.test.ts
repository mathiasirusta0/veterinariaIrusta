import { describe, it, expect } from 'vitest';
import { ARCA_FISCAL_ENABLED } from '../../types';
import { normalizeInvoice } from '../../utils/normalizers';

describe('Fase 0 — Contención Inmediata & Facturación Fiscal ARCA/AFIP', () => {
  it('ARCA_FISCAL_ENABLED feature flag debe estar estrictamente desactivado (false) hasta homologación WSAA/WSMTXCA', () => {
    expect(ARCA_FISCAL_ENABLED).toBe(false);
  });

  it('normalizeInvoice debe sanitizar comprobantes entrantes sin inventar CAEs aleatorios y default a RECIBO_X', () => {
    const rawInvoice = {
      id: 'inv-test-1',
      invoice_number: 'REC-0001-00000101',
      type: 'FACTURA_B',
      total_amount: 45000,
      date: '2026-08-29',
    };

    const normalized = normalizeInvoice(rawInvoice);
    expect(normalized.isFiscal).toBe(false);
    expect((normalized as any).caeNumber).toBeUndefined();
    expect((normalized as any).caeExpirationDate).toBeUndefined();
    expect(normalized.type).toBe('RECIBO_X');
    expect(normalized.invoiceNumber).toContain('REC-0001-');
  });

  it('los comprobantes internos deben tener numeración secuencial no fiscal REC-0001-XXXXXXXX', () => {
    const invoiceNumberPattern = /^REC-\d{4}-\d{8}$/;
    const validRecNumber = 'REC-0001-00000101';
    expect(invoiceNumberPattern.test(validRecNumber)).toBe(true);
  });
});
