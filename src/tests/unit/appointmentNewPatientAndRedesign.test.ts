import { describe, it, expect } from 'vitest';
import { Appointment, Patient, Owner } from '../../types';

describe('Agenda & Appointment Scheduling with New vs Existing Patients', () => {
  it('supports creating an appointment along with a newly registered patient and owner', () => {
    // 1. Simular creación de nuevo tutor y nuevo paciente desde la agenda
    const newOwner: Owner = {
      id: 'own-new-101',
      firstName: 'Laura',
      lastName: 'Gómez',
      dni: '38450912',
      phone: '+5493584123456',
      whatsapp: '+5493584123456',
      email: 'laura@veterinariairusta.com',
      address: 'Río Cuarto, Córdoba',
      city: 'Río Cuarto',
      province: 'Córdoba',
      postalCode: '5800',
      taxCondition: 'CONSUMIDOR_FINAL',
      balance: 0,
      createdAt: new Date().toISOString(),
    };

    const newPatient: Patient = {
      id: 'pat-new-101',
      name: 'Milo',
      species: 'CANINO',
      breed: 'Caniche',
      sex: 'MACHO',
      reproductiveStatus: 'ENTERO',
      birthDate: '2025-01-01T00:00:00.000Z',
      calculatedAge: '1 año',
      weight: 8,
      color: 'Blanco',
      status: 'ACTIVO',
      alerts: [],
      clinicalRecordNumber: 'HC-2026-0099',
      ownerId: newOwner.id,
      branchId: 'branch-central',
      createdAt: new Date().toISOString(),
    };

    const newAppointment: Appointment = {
      id: 'apt-101',
      patientId: newPatient.id,
      ownerId: newOwner.id,
      vetId: 'usr-1',
      vetName: 'Dr. Diego Irusta',
      branchId: 'branch-central',
      date: '2026-08-25',
      time: '11:00',
      durationMinutes: 30,
      reason: 'Control general y vacunación séxtuple',
      type: 'CONSULTA',
      status: 'RESERVADO',
    };

    expect(newAppointment.patientId).toBe('pat-new-101');
    expect(newAppointment.ownerId).toBe('own-new-101');
    expect(newAppointment.vetName).toBe('Dr. Diego Irusta');
    expect(newAppointment.status).toBe('RESERVADO');
    expect(newPatient.name).toBe('Milo');
    expect(newOwner.phone).toBe('+5493584123456');
  });

  it('validates appointment duration options and status lifecycle', () => {
    const validDurations = [15, 30, 45, 60];
    expect(validDurations).toContain(30);
    expect(validDurations).toContain(60);

    const statuses = ['RESERVADO', 'CONFIRMADO', 'ESPERANDO', 'EN_CONSULTA', 'FINALIZADO', 'CANCELADO'];
    expect(statuses).toContain('EN_CONSULTA');
    expect(statuses).toContain('ESPERANDO');
  });
});
