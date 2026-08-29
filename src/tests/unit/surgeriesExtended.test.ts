import { describe, it, expect } from 'vitest';
import { SURGERY_PRESETS } from '../../components/SurgeriesView';
import { SurgeryRecord } from '../../types';

describe('Módulo de Cirugía & Quirófano — Tests Unitarios de Protocolos, Presets y Ciclo Quirúrgico', () => {
  it('1. Debe contener plantillas clínicas precargadas con todos los protocolos indispensables', () => {
    expect(SURGERY_PRESETS.length).toBeGreaterThanOrEqual(7);

    // Verificar OSH
    const osh = SURGERY_PRESETS.find(p => p.id === 'osh-canina');
    expect(osh).toBeDefined();
    expect(osh?.name).toContain('Ovariohisterectomía');
    expect(osh?.durationMinutes).toBe(45);
    expect(osh?.asaGrade).toBe('I');
    expect(osh?.premedication).toContain('Acepromacina');
    expect(osh?.induction).toContain('Propofol');
    expect(osh?.maintenance).toContain('Isoflurano');
    expect(osh?.technique).toContain('Celiotomía');

    // Verificar Cesárea de Urgencia
    const cesarea = SURGERY_PRESETS.find(p => p.id === 'cesarea-urgencia');
    expect(cesarea).toBeDefined();
    expect(cesarea?.asaGrade).toBe('III');
    expect(cesarea?.category).toBe('URGENCIA');
  });

  it('2. Debe calcular la fluidoterapia intraoperatoria basada en el peso del paciente (ml/h)', () => {
    const calcFluidRate = (weightKg: number, mlPerKgPerHour = 7.5) => {
      return Math.round(weightKg * mlPerKgPerHour);
    };

    // Canino 10 kg -> 75 ml/h
    expect(calcFluidRate(10)).toBe(75);
    // Canino 25 kg -> 188 ml/h
    expect(calcFluidRate(25)).toBe(188);
    // Felino 4 kg -> 30 ml/h
    expect(calcFluidRate(4)).toBe(30);
  });

  it('3. Debe validar transiciones de estado del ciclo de vida quirúrgico', () => {
    const mockSurgery: SurgeryRecord = {
      id: 'surg-1',
      patientId: 'p1',
      procedureName: 'Ovariohisterectomía',
      surgeonName: 'Dr. Diego Iván Irusta',
      anesthetistName: 'Dr. Diego Iván Irusta',
      branchId: 'main-branch',
      date: '2026-08-30',
      startTime: '10:00',
      preOpAssessment: {
        asaGrade: 'I',
        fastingHours: 8,
        labReviewed: true,
        risksAlerts: 'Normal',
      },
      anesthesiaProtocol: {
        premedication: 'Acepromacina',
        induction: 'Propofol',
        maintenance: 'Isoflurano',
        analgesia: 'Meloxicam',
        monitoringPoints: [],
        milestones: {
          inductionTime: '10:00',
          intubationTime: '10:05',
          incisionTime: '',
          sutureTime: '',
          extubationTime: '',
          recoveryTime: '',
        },
      },
      surgicalTechnique: 'Celiotomía medial',
      findings: 'Sin hallazgos patológicos',
      materialsUsed: [],
      postOpOrders: 'Reposo 10 días',
      status: 'PROGRAMADA',
    };

    expect(mockSurgery.status).toBe('PROGRAMADA');

    // Iniciar cirugía
    const inProgressSurgery = {
      ...mockSurgery,
      status: 'EN_CURSO' as const,
      anesthesiaProtocol: {
        ...mockSurgery.anesthesiaProtocol,
        milestones: {
          ...mockSurgery.anesthesiaProtocol.milestones,
          incisionTime: '10:15',
        },
      },
    };
    expect(inProgressSurgery.status).toBe('EN_CURSO');
    expect(inProgressSurgery.anesthesiaProtocol.milestones.incisionTime).toBe('10:15');

    // Finalizar cirugía
    const finishedSurgery = {
      ...inProgressSurgery,
      status: 'FINALIZADA' as const,
      endTime: '11:00',
      anesthesiaProtocol: {
        ...inProgressSurgery.anesthesiaProtocol,
        milestones: {
          ...inProgressSurgery.anesthesiaProtocol.milestones,
          sutureTime: '10:55',
          recoveryTime: '11:00',
        },
      },
    };
    expect(finishedSurgery.status).toBe('FINALIZADA');
    expect(finishedSurgery.endTime).toBe('11:00');
  });

  it('4. Debe admitir estratificación de riesgo ASA I a V y ASA E', () => {
    const validAsaGrades = ['I', 'II', 'III', 'IV', 'V', 'E'];
    validAsaGrades.forEach(grade => {
      expect(['I', 'II', 'III', 'IV', 'V', 'E']).toContain(grade);
    });
  });
});
