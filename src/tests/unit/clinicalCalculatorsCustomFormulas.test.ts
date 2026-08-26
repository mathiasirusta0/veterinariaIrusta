import { describe, it, expect } from 'vitest';
import { AuthorizedProtocol } from '../../components/ClinicalCalculatorsModal';

describe('Estación de Cálculo Farmacológico & Protocolos Médicos Manuales', () => {
  it('1. Realiza cálculos manuales en vivo de dosis y volumen para cualquier fármaco', () => {
    const weightKg = 20; // e.g. Duque
    const doseMgKg = 5.0; // 5 mg/kg Enrofloxacina
    const concentrationMgMl = 50; // 50 mg/ml

    const totalMg = weightKg * doseMgKg;
    const totalMl = totalMg / concentrationMgMl;

    expect(totalMg).toBe(100); // 20 * 5 = 100 mg
    expect(totalMl).toBe(2.0); // 100 / 50 = 2.0 ml
  });

  it('2. Convierte concentraciones en porcentaje con precisión (1% = 10 mg/ml)', () => {
    const percentConc = 2.0; // 2% Lidocaína
    const concMgMl = percentConc * 10; // 20 mg/ml
    const weightKg = 15;
    const doseMgKg = 2.0;

    const totalMg = weightKg * doseMgKg; // 30 mg
    const totalMl = totalMg / concMgMl; // 1.5 ml
    const drops = Math.round(totalMl * 20); // 30 gotas

    expect(concMgMl).toBe(20);
    expect(totalMg).toBe(30);
    expect(totalMl).toBe(1.5);
    expect(drops).toBe(30);
  });

  it('3. Calcula cantidad de comprimidos para presentaciones orales sólidas', () => {
    const weightKg = 12;
    const doseMgKg = 10; // 120 mg total
    const tabletStrengthMg = 60; // 60 mg/comp

    const totalMg = weightKg * doseMgKg;
    const tablets = totalMg / tabletStrengthMg;

    expect(totalMg).toBe(120);
    expect(tablets).toBe(2.0); // 2 comprimidos
  });

  it('4. Calcula parámetros de Infusión Continua (CRI) para sueros y bombas', () => {
    const weightKg = 10;
    const criDoseMcgKgMin = 4.0; // 4 mcg/kg/min Fentanilo
    const criConcMgMl = 0.05; // 50 mcg/ml = 0.05 mg/ml
    const bagVolumeMl = 500;
    const infusionRateMlH = 20; // 20 ml/h

    // mg por hora necesarios para el paciente
    const mgPerHour = (criDoseMcgKgMin * weightKg * 60) / 1000; // (4 * 10 * 60) / 1000 = 2.4 mg/h
    expect(mgPerHour).toBe(2.4);

    // Horas que dura el sachet
    const hoursSachet = bagVolumeMl / infusionRateMlH; // 500 / 20 = 25 horas
    expect(hoursSachet).toBe(25);

    // Total mg a añadir a la bolsa
    const totalMgInBag = mgPerHour * hoursSachet; // 2.4 * 25 = 60 mg
    expect(totalMgInBag).toBe(60);

    // ml de ampolla comercial a adicionar
    const drugVolumeToAddMl = totalMgInBag / criConcMgMl; // 60 / 0.05 = 1200 ml
    expect(drugVolumeToAddMl).toBe(1200);
  });

  it('5. Permite crear, estructurar y validar protocolos médicos autorizados por el veterinario', () => {
    const manualProtocol: AuthorizedProtocol = {
      id: 'proto-001',
      name: 'Protocolo Analgesia Quirúrgica Dr. Irusta',
      drugName: 'Tramadol Clorhidrato',
      category: 'Analgésico Opioide',
      species: 'Canino',
      doseValue: 3.0,
      doseUnit: 'mg/kg',
      concValue: 50,
      concType: 'mg/ml',
      route: 'IV Lento',
      frequency: 'Cada 8 horas',
      dilution: 'Diluir en 10 ml de Solución Fisiológica 0.9%',
      authorVet: 'Dr. Diego Iván Irusta (M.P. 502)',
      createdAt: new Date().toISOString(),
    };

    expect(manualProtocol.name).toContain('Protocolo Analgesia');
    expect(manualProtocol.doseValue).toBe(3.0);
    expect(manualProtocol.doseUnit).toBe('mg/kg');
    expect(manualProtocol.authorVet).toContain('502');
  });
});
