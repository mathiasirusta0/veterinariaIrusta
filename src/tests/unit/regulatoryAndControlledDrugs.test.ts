import { describe, it, expect } from 'vitest';
import { TEST_REGULATORY_RULES, TEST_CONTROLLED_MOVEMENTS } from '../fixtures/testData';

describe('Marco Regulatorio de Neuquén & Leyes Nacionales', () => {
  it('debe contener las normas fundamentales de ejercicio profesional de Neuquén (CMVN)', () => {
    const neuquenRule = TEST_REGULATORY_RULES.find((r) => r.organism === 'COLEGIO_MEDICO_VETERINARIO_NEUQUEN');
    expect(neuquenRule).toBeDefined();
    expect(neuquenRule?.province).toBe('Neuquén');
    expect(neuquenRule?.municipality).toBe('Las Lajas');
  });

  it('debe incluir normativa de SENASA para Receta Veterinaria Electrónica (RVE)', () => {
    const senasaRule = TEST_REGULATORY_RULES.find((r) => r.organism === 'SENASA');
    expect(senasaRule).toBeDefined();
    expect(senasaRule?.status).toBe('VIGENTE');
  });

  it('debe incluir regulación de Residuos Patológicos Ley Provincial 1.875 y Ley 24.051 en Las Lajas', () => {
    const wasteRule = TEST_REGULATORY_RULES.find((r) => r.affectedModule === 'RESIDUOS_PATOLOGICOS');
    expect(wasteRule).toBeDefined();
    expect(wasteRule?.municipality).toBe('Las Lajas');
  });

  it('debe cumplir con la Ley 25.326 de Protección de Datos Personales', () => {
    const privacyRule = TEST_REGULATORY_RULES.find((r) => r.affectedModule === 'PROTECCION_DATOS');
    expect(privacyRule).toBeDefined();
    expect(privacyRule?.lawNumber).toContain('25.326');
  });
});

describe('Control de Psicotrópicos & Libro Digital de Ketamina (Leyes 17.818 / 19.303)', () => {
  it('debe mantener saldo matemático exacto entre ingresos y egresos clínicos de Ketamina', () => {
    const ketaminaMovements = TEST_CONTROLLED_MOVEMENTS.filter((m) => m.drugName.includes('Ketamina'));
    expect(ketaminaMovements.length).toBeGreaterThanOrEqual(3);

    const initialPurchase = ketaminaMovements.find((m) => m.movementType === 'INGRESO_COMPRA')?.quantity || 0;
    const totalDischarged = ketaminaMovements
      .filter((m) => m.movementType === 'EGRESO_CLINICO')
      .reduce((sum, m) => sum + m.quantity, 0);

    expect(initialPurchase).toBe(10);
    expect(totalDischarged).toBe(2);
    expect(initialPurchase - totalDischarged).toBe(8);
  });
});
