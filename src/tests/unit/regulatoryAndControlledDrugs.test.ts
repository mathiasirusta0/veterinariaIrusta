import { describe, it, expect } from 'vitest';
import { TEST_REGULATORY_RULES, TEST_CONTROLLED_MOVEMENTS } from '../fixtures/testData';

describe('Marco Regulatorio de Córdoba & Leyes Nacionales', () => {
  it('debe contener las normas fundamentales de ejercicio profesional de Córdoba (Ley 11.076 / 5.142)', () => {
    const cordobaRule = TEST_REGULATORY_RULES.find((r) => r.lawNumber?.includes('11.076') || r.lawTitle.includes('11.076'));
    expect(cordobaRule).toBeDefined();
    expect(cordobaRule?.organism).toBe('COLEGIO_VETERINARIO_CORDOBA');
  });

  it('debe incluir normativa de SENASA para Receta Veterinaria Electrónica (RVE)', () => {
    const senasaRule = TEST_REGULATORY_RULES.find((r) => r.organism === 'SENASA');
    expect(senasaRule).toBeDefined();
    expect(senasaRule?.status).toBe('VIGENTE');
  });

  it('debe incluir regulación de Residuos Patológicos Ley 24.051 y Ordenanza de Río Cuarto', () => {
    const wasteRule = TEST_REGULATORY_RULES.find((r) => r.affectedModule === 'RESIDUOS_PATOLOGICOS');
    expect(wasteRule).toBeDefined();
    expect(wasteRule?.municipality).toBe('Río Cuarto');
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
