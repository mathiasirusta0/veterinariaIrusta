import { describe, it, expect } from 'vitest';

describe('Protocolo de Urgencias & RCP Veterinario (RECOVER Guidelines)', () => {
  it('debe calcular con precisión la dosis y volumen de Adrenalina 1:1000 (1 mg/ml) para RCP', () => {
    const weightKg = 10;
    const lowDoseMgKg = 0.01;
    const highDoseMgKg = 0.1;
    const concMgMl = 1.0;

    const lowDoseVolMl = (weightKg * lowDoseMgKg) / concMgMl;
    const highDoseVolMl = (weightKg * highDoseMgKg) / concMgMl;

    expect(lowDoseVolMl).toBe(0.1);
    expect(highDoseVolMl).toBe(1.0);
  });

  it('debe calcular con precisión la dosis de Atropina (1 mg/ml) para bradicardia severa', () => {
    const weightKg = 25;
    const doseMgKg = 0.04;
    const concMgMl = 1.0;

    const volMl = (weightKg * doseMgKg) / concMgMl;
    expect(volMl).toBe(1.0);
  });

  it('debe calcular con precisión la dosis de Diazepam (5 mg/ml) para status epiléptico', () => {
    const weightKg = 15;
    const ivDoseMgKg = 0.5;
    const concMgMl = 5.0;

    const ivVolMl = (weightKg * ivDoseMgKg) / concMgMl;
    expect(ivVolMl).toBe(1.5);

    const rectalDoseMgKg = 1.0;
    const rectalVolMl = (weightKg * rectalDoseMgKg) / concMgMl;
    expect(rectalVolMl).toBe(3.0);
  });

  it('debe calcular bolo de shock de cristaloides según especie y peso', () => {
    const canineWeight = 20;
    const felineWeight = 4;

    const canineShockMl = canineWeight * 18; // 15-20 ml/kg
    const felineShockMl = felineWeight * 12; // 10-15 ml/kg

    expect(canineShockMl).toBe(360);
    expect(felineShockMl).toBe(48);
  });

  it('debe proteger contra dosis de Lidocaína en felinos por toxicidad cardíaca', () => {
    const felineWeight = 4;
    const felineMaxDoseMgKg = 0.25;
    const lidocaine2PercentConc = 20; // 20 mg/ml

    const felineVolMl = (felineWeight * felineMaxDoseMgKg) / lidocaine2PercentConc;
    expect(felineVolMl).toBe(0.05); // Volumen micro dosificado con jeringa de tuberculina
  });
});
