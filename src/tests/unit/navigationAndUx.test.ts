import { describe, it, expect } from 'vitest';
import { NAVIGATION_ITEMS, getNavLabel, getNavShortLabel } from '../../config/navigation';
import { formatCurrency, formatAlertLabel, maskPhoneNumber, maskDni, formatOwnerBalance } from '../../utils/formatters';

describe('Simplificación de Nombres de Navegación & UX (Fase 1)', () => {
  it('debe contener los nombres visibles oficiales simplificados', () => {
    expect(getNavLabel('PACIENTES')).toBe('Pacientes');
    expect(getNavLabel('CONSULTAS')).toBe('Consultas Médicas');
    expect(getNavLabel('INTERNACION')).toBe('Internación');
    expect(getNavLabel('SALA_ESPERA')).toBe('Triage');
    expect(getNavLabel('AGENDA')).toBe('Agenda de Turnos');
    expect(getNavLabel('CIRUGIAS')).toBe('Cirugías');
    expect(getNavLabel('RECETAS_OFICIALES')).toBe('Recetario');
    expect(getNavLabel('LABORATORIO')).toBe('Laboratorio');
    expect(getNavLabel('IMAGENES')).toBe('Diagnóstico por Imágenes');
    expect(getNavLabel('VACUNAS')).toBe('Plan de Vacunación');
    expect(getNavLabel('INVENTARIO')).toBe('Farmacia');
    expect(getNavLabel('CAJA_FACTURACION')).toBe('Caja');
    expect(getNavLabel('PROPIETARIOS')).toBe('Directorio de Tutores');
    expect(getNavLabel('DOCUMENTOS')).toBe('Documentos');
  });

  it('no debe incluir la vista ASISTENTE_IA en la configuración de navegación', () => {
    const aiItem = NAVIGATION_ITEMS.find((n) => (n.id as string) === 'ASISTENTE_IA');
    expect(aiItem).toBeUndefined();
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
    const debt = formatOwnerBalance(-15000);
    expect(debt.label).toBe('Debe $15.000');
    expect(debt.amountFormatted).toBe('-$15.000');
    expect(debt.isDebt).toBe(true);

    const credit = formatOwnerBalance(5000);
    expect(credit.label).toBe('Saldo a favor $5.000');
    expect(credit.isCredit).toBe(true);

    const settled = formatOwnerBalance(0);
    expect(settled.label).toBe('Al día');
    expect(settled.isSettled).toBe(true);
  });

  it('debe enmascarar datos personales (PII) cuando el usuario no tiene permisos', () => {
    const phone = '11 6789-1234';
    expect(maskPhoneNumber(phone, true)).toBe('11 6789-1234');
    expect(maskPhoneNumber(phone, false)).toContain('***');

    const dni = '38123456';
    expect(maskDni(dni, true)).toBe('38123456');
    expect(maskDni(dni, false)).toContain('***');
  });
});
