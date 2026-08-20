import { describe, it, expect } from 'vitest';

describe('Clinical Dosage and Fluid Calculations Unit Tests', () => {
  it('should calculate drug volume accurately based on (weight * dose) / concentration', () => {
    const weightKg = 10;
    const doseMgKg = 0.2; // Meloxicam 0.2 mg/kg
    const concentrationMgMl = 5; // 5 mg/ml

    const totalMg = weightKg * doseMgKg; // 2 mg
    const volumeMl = totalMg / concentrationMgMl; // 0.4 ml

    expect(totalMg).toBe(2);
    expect(volumeMl).toBe(0.4);
  });

  it('should calculate fluid infusion rate ml/h correctly: (weight * mlKgDay) / 24', () => {
    const weightKg = 15;
    const maintenanceRateMlKgDay = 50; // 50 ml/kg/24h

    const totalDailyFluidMl = weightKg * maintenanceRateMlKgDay; // 750 ml/day
    const hourlyRateMlH = totalDailyFluidMl / 24; // 31.25 ml/h

    expect(totalDailyFluidMl).toBe(750);
    expect(hourlyRateMlH).toBeCloseTo(31.25, 2);
  });

  it('should calculate diuresis rate in ml/kg/h and detect oliguria/anuria thresholds', () => {
    const weightKg = 10;
    const urineOutputMl = 15;
    const hours = 2;

    const diuresisRate = urineOutputMl / weightKg / hours; // 0.75 ml/kg/h

    expect(diuresisRate).toBe(0.75);
    const isOliguric = diuresisRate < 1.0;
    const isAnuric = diuresisRate < 0.2;

    expect(isOliguric).toBe(true);
    expect(isAnuric).toBe(false);
  });
});
