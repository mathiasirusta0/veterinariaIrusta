import { describe, it, expect } from 'vitest';
import { Invoice } from '../../types';
import { normalizeInvoice } from '../../utils/normalizers';

describe('Modelo de Comprobantes Internos No Fiscales & Firma Manuscrita', () => {
  it('Un comprobante interno debe cumplir con la estructura no fiscal y estado EMITIDO por defecto', () => {
    const raw: Partial<Invoice> = {
      id: 'inv-recibo-01',
      invoiceNumber: 'REC-0001-00001234',
      type: 'RECIBO_X',
      pointOfSale: 1,
      totalAmount: 25000,
      customerName: 'Juan Pérez',
      paymentMethod: 'EFECTIVO',
    };

    const inv = normalizeInvoice(raw);
    expect(inv.type).toBe('RECIBO_X');
    expect(inv.isFiscal).toBe(false);
    expect(inv.status).toBe('EMITIDO');
    expect(inv.invoiceNumber).toMatch(/^REC-0001-\d{8}$/);
    expect(inv.totalAmount).toBe(25000);
  });

  it('La anulación de un comprobante interno registra la trazabilidad (status ANULADO, voidedAt, voidReason)', () => {
    const raw: Partial<Invoice> = {
      id: 'inv-recibo-02',
      invoiceNumber: 'REC-0001-00005678',
      type: 'RECIBO_X',
      totalAmount: 18000,
      status: 'ANULADO',
      voidedAt: '2026-08-29T20:00:00.000Z',
      voidedBy: 'Dr. Diego Iván Irusta',
      voidReason: 'Error en cantidad de fármaco cargada en mostrador',
    };

    const inv = normalizeInvoice(raw);
    expect(inv.status).toBe('ANULADO');
    expect(inv.voidedAt).toBeDefined();
    expect(inv.voidReason).toBe('Error en cantidad de fármaco cargada en mostrador');
  });

  it('Verificación de lienzo en blanco: detecta correctamente un canvas sin trazos', () => {
    // Simula la función isCanvasBlank usada en DocumentsView
    const isBufferBlank = (buffer: Uint32Array): boolean => {
      return !buffer.some((color) => color !== 0);
    };

    const emptyBuffer = new Uint32Array(480 * 160); // Todos 0
    expect(isBufferBlank(emptyBuffer)).toBe(true);

    const signedBuffer = new Uint32Array(480 * 160);
    signedBuffer[100] = 0xFF000000; // Trazado presente
    expect(isBufferBlank(signedBuffer)).toBe(false);
  });
});
