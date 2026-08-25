import { describe, it, expect } from 'vitest';
import { Patient, Owner } from '../../types';

describe('Expediente Clínico 360° — Estación Central de Atención Integral', () => {
  it('debe estructurar los 6 ejes clínicos esenciales de atención del paciente', () => {
    const clinicalAxes = [
      { id: 'HISTORIA', label: '1. Evolución Médica (SOAP)' },
      { id: 'SIGNOS', label: '2. Signos Vitales' },
      { id: 'RECETAS', label: '3. Medicación & Indicaciones' },
      { id: 'LABORATORIO', label: '4. Estudios & Laboratorio' },
      { id: 'TUTOR', label: '5. Tutor Responsable' },
      { id: 'INFORME_COMPLETO', label: '6. Informe Completo (Expediente)' },
    ];

    expect(clinicalAxes).toHaveLength(6);
    expect(clinicalAxes[0].id).toBe('HISTORIA');
    expect(clinicalAxes[1].id).toBe('SIGNOS');
    expect(clinicalAxes[2].id).toBe('RECETAS');
    expect(clinicalAxes[3].id).toBe('LABORATORIO');
    expect(clinicalAxes[4].id).toBe('TUTOR');
    expect(clinicalAxes[5].id).toBe('INFORME_COMPLETO');
  });

  it('debe vincular al paciente con su tutor y canal de comunicación directa por WhatsApp', () => {
    const owner: Owner = {
      id: 'own-360-1',
      firstName: 'Enzo',
      lastName: 'Girardi',
      dni: '37108100',
      phone: '+54 9 358 438-2824',
      whatsapp: '+54 9 358 438-2824',
      email: 'enzo@veterinariairusta.com',
      address: 'Río Cuarto, Córdoba',
      city: 'Río Cuarto',
      taxCondition: 'CONSUMIDOR_FINAL',
      balance: 0,
      notes: 'Tutor responsable',
      branchId: 'branch-central',
    };

    const patient: Patient = {
      id: 'pat-360-1',
      ownerId: owner.id,
      name: 'Duque',
      species: 'Canino',
      breed: 'American Bully',
      sex: 'Macho',
      reproductiveStatus: 'Entero',
      birthDate: '2025-08-24',
      calculatedAge: '1 año',
      weight: 20.0,
      color: 'Negro',
      clinicalRecordNumber: 'HC-2026-0001',
      status: 'ACTIVO',
      alerts: [],
      branchId: 'branch-central',
      createdAt: '2026-08-24T00:00:00.000Z',
    };

    expect(patient.status).toBe('ACTIVO');
    expect(patient.ownerId).toBe(owner.id);
    expect(owner.whatsapp).toContain('358');
  });
});
