import { describe, it, expect } from 'vitest';
import { NAVIGATION_ITEMS, getNavLabel, getNavShortLabel } from '../../config/navigation';
import { formatCurrency, formatAlertLabel, maskPhoneNumber, maskDni, formatOwnerBalance } from '../../utils/formatters';

describe('Simplificación de Nombres de Navegación & UX (Fase 1)', () => {
  it('debe contener los nombres visibles oficiales simplificados en 4 áreas clínicas y administrativas', () => {
    expect(getNavLabel('PACIENTES')).toBe('Pacientes & Tutores');
    expect(getNavLabel('AGENDA')).toBe('Agenda de Turnos');
    expect(getNavLabel('CIRUGIAS')).toBe('Cirugía & Quirófano');
    expect(getNavLabel('VACUNAS')).toBe('Plan de Vacunación');
    expect(getNavLabel('INVENTARIO')).toBe('Farmacia & Stock');
    expect(getNavLabel('CAJA_FACTURACION')).toBe('Finanzas');
    expect(getNavLabel('DOCUMENTOS')).toBe('Documentos');
  });

  it('no debe incluir la vista ASISTENTE_IA, CONSULTAS ni INTERNACION en la configuración de navegación', () => {
    const aiItem = NAVIGATION_ITEMS.find((n) => (n.id as string) === 'ASISTENTE_IA');
    expect(aiItem).toBeUndefined();
    const consultasItem = NAVIGATION_ITEMS.find((n) => (n.id as string) === 'CONSULTAS');
    expect(consultasItem).toBeUndefined();
    const internacionItem = NAVIGATION_ITEMS.find((n) => (n.id as string) === 'INTERNACION');
    expect(internacionItem).toBeUndefined();
  });

  it('debe formatear enums técnicos de alertas médicas a texto legible en español', () => {
    expect(formatAlertLabel('CONDICION_CRONICA')).toBe('Condición crónica');
    expect(formatAlertLabel('MEDICACION_CRONICA')).toBe('Medicación crónica');
    expect(formatAlertLabel('RIESGO_ANESTESICO')).toBe('Riesgo anestésico');
    expect(formatAlertLabel('ALERGIA')).toBe('Alergia');
    expect(formatAlertLabel('CARDIOPATIA')).toBe('Cardiopatía');
    expect(formatAlertLabel('RENAL')).toBe('Patología renal');
    expect(formatAlertLabel('AGRESIVO')).toBe('Manejo cuidadoso / Agresivo');
    expect(formatAlertLabel('AISLAMIENTO')).toBe('Aislamiento infeccioso');
  });

  it('debe prevenir estrictamente errores de formato monetario como $-15.000 o $$15.000', () => {
    expect(formatCurrency(15000)).toBe('$15.000,00');
    expect(formatCurrency(-15000)).toBe('-$15.000,00');
    expect(formatCurrency(0)).toBe('$0,00');
    expect(formatCurrency(-15000)).not.toContain('$-');
    expect(formatCurrency(15000)).not.toContain('$$');
  });

  it('debe formatear el saldo de tutores con semántica clara', () => {
    expect(formatOwnerBalance(0).label).toBe('Al día');
    expect(formatOwnerBalance(-12500).label).toBe('Debe $12.500');
    expect(formatOwnerBalance(5000).label).toBe('Saldo a favor $5.000');
  });

  it('debe enmascarar datos personales (PII) cuando el usuario no tiene permisos', () => {
    expect(maskPhoneNumber('+54 9 11 5482-1190', false)).toBe('+54 ***-**90');
    expect(maskDni('32.458.912', false)).toBe('32.***.912');
  });
});
