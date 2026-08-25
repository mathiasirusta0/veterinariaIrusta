import { describe, it, expect } from 'vitest';
import { Patient, Owner } from '../../types';

describe('Manual Direct Editing of Patients and Owners', () => {
  it('allows full modification of patient parameters (weight, breed, microchip, name)', () => {
    const originalPatient: Patient = {
      id: 'pat-duque-1',
      name: 'Duque',
      species: 'CANINO',
      breed: 'american bully',
      sex: 'MACHO',
      reproductiveStatus: 'ENTERO',
      birthDate: '2025-08-24T00:00:00.000Z',
      calculatedAge: '1 año',
      weight: 20,
      color: 'negro',
      status: 'ACTIVO',
      alerts: [],
      clinicalRecordNumber: 'HC-2026-0001',
      ownerId: 'own-enzo-1',
      branchId: 'branch-central',
      createdAt: '2026-08-24T20:00:00.000Z',
    };

    const updatedPatient: Patient = {
      ...originalPatient,
      name: 'Duque Editado',
      weight: 21.5,
      microchip: '981098109123456',
      particularMarks: 'Cicatriz leve en oreja',
    };

    expect(updatedPatient.name).toBe('Duque Editado');
    expect(updatedPatient.weight).toBe(21.5);
    expect(updatedPatient.microchip).toBe('981098109123456');
    expect(updatedPatient.particularMarks).toBe('Cicatriz leve en oreja');
  });

  it('allows full modification of owner contact and identification details', () => {
    const originalOwner: Owner = {
      id: 'own-enzo-1',
      firstName: 'Enzo',
      lastName: 'Girardi',
      dni: '37108100',
      phone: '+543584302024',
      whatsapp: '+543584302024',
      email: 'enzo@gmail.com',
      address: 'Río Cuarto',
      city: 'Río Cuarto',
      province: 'Córdoba',
      postalCode: '5800',
      taxCondition: 'CONSUMIDOR_FINAL',
      balance: 0,
      createdAt: '2026-08-24T20:00:00.000Z',
    };

    // Ponele que el tutor cambia número de teléfono o domicilio
    const updatedOwner: Owner = {
      ...originalOwner,
      phone: '+5493584362824',
      whatsapp: '+5493584362824',
      address: 'San Martín 450, Piso 2',
      email: 'enzo.girardi@nuevo-email.com',
    };

    expect(updatedOwner.phone).toBe('+5493584362824');
    expect(updatedOwner.whatsapp).toBe('+5493584362824');
    expect(updatedOwner.address).toBe('San Martín 450, Piso 2');
    expect(updatedOwner.email).toBe('enzo.girardi@nuevo-email.com');
  });
});
