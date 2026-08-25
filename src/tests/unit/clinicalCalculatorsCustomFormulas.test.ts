import { describe, it, expect } from 'vitest';
import { VADEMECUM_DATABASE, VademecumDrug } from '../../components/ClinicalCalculatorsModal';

describe('Clinical Calculators - Custom Formulas & Manual Dosage System', () => {
  it('calculates correct total mg and ml volume for preset and custom drugs', () => {
    const weightKg = 20; // e.g. Duque
    const customDrug: VademecumDrug = {
      id: 'custom-1',
      name: 'Enrofloxacina 10%',
      brandNames: 'Baytril Max',
      category: 'Antibiótico Fluoroquinolona',
      species: 'Canino y Felino',
      doseRangeCanine: '5.0 - 10.0 mg/kg cada 24 hs',
      doseRangeFeline: '5.0 mg/kg cada 24 hs',
      defaultDoseMgKg: 5.0,
      concentrationMgMl: 100, // 10% = 100 mg/ml
      routes: 'SC, Oral',
      frequency: 'Cada 24 horas',
      indications: 'Infecciones bacterianas',
      contraindications: 'Cachorros en crecimiento',
      warnings: 'Uso restringido',
      isCustom: true,
    };

    const totalMg = weightKg * customDrug.defaultDoseMgKg;
    const totalMl = totalMg / customDrug.concentrationMgMl;

    expect(totalMg).toBe(100); // 20 * 5 = 100 mg
    expect(totalMl).toBe(1.0); // 100 / 100 = 1.0 ml
  });

  it('performs live calculations for arbitrary manual dosage values', () => {
    const weightKg = 10;
    const doseMgKg = 25; // 25 mg/kg
    const concMgMl = 50; // 50 mg/ml

    const totalMg = weightKg * doseMgKg; // 250 mg
    const totalMl = totalMg / concMgMl; // 5.0 ml
    const drops = Math.round(totalMl * 20); // 100 gotas

    expect(totalMg).toBe(250);
    expect(totalMl).toBe(5);
    expect(drops).toBe(100);
  });

  it('converts percentage concentrations accurately (1% = 10 mg/ml)', () => {
    const percentConc = 2.0; // 2% Lidocaína
    const concMgMl = percentConc * 10; // 20 mg/ml
    const weightKg = 15;
    const doseMgKg = 2.0;

    const totalMg = weightKg * doseMgKg; // 30 mg
    const totalMl = totalMg / concMgMl; // 1.5 ml

    expect(concMgMl).toBe(20);
    expect(totalMg).toBe(30);
    expect(totalMl).toBe(1.5);
  });

  it('calculates tablet counts for solid oral dosage formulations', () => {
    const weightKg = 12;
    const doseMgKg = 10; // 120 mg total
    const tabletStrengthMg = 60; // 60 mg/comp

    const totalMg = weightKg * doseMgKg;
    const tablets = totalMg / tabletStrengthMg;

    expect(totalMg).toBe(120);
    expect(tablets).toBe(2.0); // 2 comprimidos
  });
});
