import { describe, it, expect } from 'vitest';
import {
  INITIAL_REGULATORY_RULES,
  INITIAL_CONTROLLED_DRUGS,
  INITIAL_CONTROLLED_MOVEMENTS,
  INITIAL_PATHOLOGICAL_WASTE,
  INITIAL_PRESCRIPTIONS,
} from '../../mockData';
import { RegulatoryRule, ControlledDrugMovement, ClinicalAmendment } from '../../types';

describe('Marco Regulatorio de Córdoba & Leyes Nacionales', () => {
  it('debe contener las normas fundamentales de ejercicio profesional de Córdoba (Ley 11.076 / 5.142)', () => {
    const cordobaRule = INITIAL_REGULATORY_RULES.find((r) => r.lawNumber.includes('11.076'));
    expect(cordobaRule).toBeDefined();
    expect(cordobaRule?.organism).toBe('COLEGIO_VETERINARIO_CORDOBA');
    expect(cordobaRule?.isMandatory).toBe(true);
    expect(cordobaRule?.status).toBe('VIGENTE');
  });

  it('debe incluir normativa de SENASA para Receta Veterinaria Electrónica (RVE)', () => {
    const senasaRule = INITIAL_REGULATORY_RULES.find((r) => r.organism === 'SENASA' && r.affectedModule === 'RECETARIO_SENASA');
    expect(senasaRule).toBeDefined();
    expect(senasaRule?.status).toBe('VIGENTE');
  });

  it('debe incluir regulación de Residuos Patológicos Ley 24.051 y Ordenanza de Río Cuarto', () => {
    const wasteRule = INITIAL_REGULATORY_RULES.find((r) => r.affectedModule === 'RESIDUOS_PATOLOGICOS');
    expect(wasteRule).toBeDefined();
    expect(wasteRule?.municipality).toBe('Río Cuarto');
  });

  it('debe cumplir con la Ley 25.326 de Protección de Datos Personales', () => {
    const privacyRule = INITIAL_REGULATORY_RULES.find((r) => r.affectedModule === 'PROTECCION_DATOS');
    expect(privacyRule).toBeDefined();
    expect(privacyRule?.lawNumber).toContain('25.326');
  });
});

describe('Control de Psicotrópicos & Libro Digital de Ketamina (Leyes 17.818 / 19.303)', () => {
  it('debe mantener saldo matemático exacto entre ingresos y egresos clínicos de Ketamina', () => {
    const ketaminaDrug = INITIAL_CONTROLLED_DRUGS.find((d) => d.commercialName.includes('Ketamina'));
    expect(ketaminaDrug).toBeDefined();

    const ketaminaMovements = INITIAL_CONTROLLED_MOVEMENTS.filter((m) => m.drugId === ketaminaDrug?.id);
    expect(ketaminaMovements.length).toBeGreaterThanOrEqual(3);

    // Initial purchase: +10, then -1, -1, -2 -> balance 6
    const totalNetChange = ketaminaMovements.reduce((acc, m) => acc + m.quantity, 0);
    expect(totalNetChange).toBe(6);
    expect(ketaminaDrug?.currentStock).toBe(6);
  });

  it('los egresos clínicos deben contener DNI del tutor, matrícula profesional y folio oficial', () => {
    const clinicalExits = INITIAL_CONTROLLED_MOVEMENTS.filter((m) => m.movementType === 'EGRESO_CLINICO');
    for (const mov of clinicalExits) {
      expect(mov.patientName).toBeTruthy();
      expect(mov.ownerDni).toBeTruthy();
      expect(mov.vetLicense).toContain('CMVC');
      expect(mov.officialRecipeFolio).toBeTruthy();
    }
  });
});

describe('Trazabilidad de Residuos Patológicos (Ley 24.051)', () => {
  it('todos los registros deben poseer manifiesto oficial y sector generador', () => {
    for (const rec of INITIAL_PATHOLOGICAL_WASTE) {
      expect(rec.manifestNumber).toMatch(/^MAN-2026-/);
      expect(rec.weightKg).toBeGreaterThan(0);
      expect(['QUIROFANO', 'UCI_INTERNACION', 'LABORATORIO', 'CONSULTORIOS']).toContain(rec.generatingSector);
      expect(rec.municipalGeneratorRegistry).toContain('Río Cuarto');
    }
  });
});

describe('Enmiendas e Inmutabilidad Clínica', () => {
  it('una enmienda clínica debe preservar el dato anterior, nuevo y justificación médica', () => {
    const sampleAmendment: ClinicalAmendment = {
      id: 'amd-01',
      consultationId: 'cons-1',
      amendedAt: new Date().toISOString(),
      amendedBy: 'Dr. Martín López',
      vetLicense: 'MP 8412 CMVC',
      fieldAmended: 'treatmentPlan',
      previousValue: 'Tramadol 2 mg/kg',
      newValue: 'Tramadol 2 mg/kg + Dipirona descartada por antecedente alérgico',
      justificationReason: 'Corrección preventiva por alerta médica confirmada.',
    };

    expect(sampleAmendment.previousValue).not.toBe(sampleAmendment.newValue);
    expect(sampleAmendment.justificationReason.length).toBeGreaterThan(10);
    expect(sampleAmendment.vetLicense).toBeTruthy();
  });
});
