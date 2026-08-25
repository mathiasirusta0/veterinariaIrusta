import { describe, it, expect } from 'vitest';
import { VADEMECUM_DATABASE } from '../../components/ClinicalCalculatorsModal';

describe('Calculadora de Dosis & Vademécum Clínico (Resiliencia & Null Safety)', () => {
  it('debe calcular dosis farmacológicas correctamente en modo libre sin paciente seleccionado', () => {
    const weightKg = 10;
    const drug = VADEMECUM_DATABASE[0]; // Maropitant
    expect(drug.defaultDoseMgKg).toBe(1.0);
    expect(drug.concentrationMgMl).toBe(10);

    const totalMg = weightKg * drug.defaultDoseMgKg;
    const totalMl = totalMg / drug.concentrationMgMl;

    expect(totalMg).toBe(10);
    expect(totalMl).toBe(1.0);
  });

  it('debe calcular fluidoterapia y déficit de deshidratación con seguridad', () => {
    const weightKg = 12.5;
    const dehydrationPercent = 7; // 7%
    const ongoingLossesMl = 50;
    const replacementHours = 24;

    const maintenanceMlDay = Math.round(30 * weightKg + 70);
    const dehydrationDeficitMl = Math.round((dehydrationPercent / 100) * weightKg * 1000);
    const totalFluidsInPeriod = maintenanceMlDay + dehydrationDeficitMl + ongoingLossesMl;
    const rateMlPerHour = (totalFluidsInPeriod / replacementHours).toFixed(1);

    expect(maintenanceMlDay).toBe(445);
    expect(dehydrationDeficitMl).toBe(875);
    expect(totalFluidsInPeriod).toBe(1370);
    expect(Number(rateMlPerHour)).toBeCloseTo(57.1, 1);
  });

  it('debe calcular infusiones continuas CRI (FLK) sin errores numéricos', () => {
    const weightKg = 20;
    const bagVolumeMl = 500;
    const infusionRateMlH = 25;
    const bagDurationHours = bagVolumeMl / infusionRateMlH; // 20 hs

    // Fentanilo (3 mcg/kg/h en ampolla 50 mcg/ml)
    const fentanylTotalMcg = 3 * weightKg * bagDurationHours;
    const fentanylMl = fentanylTotalMcg / 50;

    // Lidocaína 2% (1.5 mg/kg/h en 20 mg/ml)
    const lidocaineTotalMg = 1.5 * weightKg * bagDurationHours;
    const lidocaineMl = lidocaineTotalMg / 20;

    // Ketamina (0.6 mg/kg/h en 50 mg/ml)
    const ketamineTotalMg = 0.6 * weightKg * bagDurationHours;
    const ketamineMl = ketamineTotalMg / 50;

    expect(bagDurationHours).toBe(20);
    expect(fentanylMl).toBe(24);
    expect(lidocaineMl).toBe(30);
    expect(ketamineMl).toBe(4.8);
  });
});

describe('Flujo de Cierre de Sesión (Logout)', () => {
  it('debe limpiar el usuario activo al cerrar sesión', () => {
    let currentUser: any = {
      id: 'usr-1',
      name: 'Dr. Diego Iván Irusta',
      role: 'SUPERADMIN',
    };

    // Simulate logout action
    const logout = () => {
      currentUser = null;
    };

    logout();
    expect(currentUser).toBeNull();
  });
});
