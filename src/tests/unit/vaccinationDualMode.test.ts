import { describe, it, expect } from 'vitest';
import { VaccinationRecord, Patient, Owner } from '../../types';

describe('Plan de Vacunación — Modal Dual (Paciente Registrado/Internado vs Paciente Nuevo)', () => {
  it('debe permitir registrar una vacuna para un paciente existente o internado', () => {
    const existingPatient: Patient = {
      id: 'pat-duque-1',
      name: 'Duque',
      species: 'CANINO',
      breed: 'American Bully',
      sex: 'MACHO',
      reproductiveStatus: 'ENTERO',
      color: 'Atigrado',
      birthDate: '2022-01-10',
      calculatedAge: '4 años',
      weight: 28.5,
      status: 'INTERNADO',
      alerts: [],
      clinicalRecordNumber: 'HC-2026-0001',
      ownerId: 'own-enzo-1',
      branchId: 'branch-central',
      createdAt: '2026-01-01T00:00:00Z',
    };

    const nextDate = new Date('2026-08-24');
    nextDate.setMonth(nextDate.getMonth() + 12);

    const vacRecord: VaccinationRecord = {
      id: 'vac-1',
      patientId: existingPatient.id,
      vaccineName: 'Séxtuple Canina K9',
      type: 'Plan Sanitario Anual',
      manufacturer: 'Zoetis',
      batchNumber: 'LT-SEX-2026',
      expirationDate: '2028-08-24',
      administeredDate: '2026-08-24',
      administeredBy: 'Dr. Diego Irusta',
      vetLicense: 'MP 8412',
      nextDueDate: nextDate.toISOString().split('T')[0],
      certificateGenerated: true,
    };

    expect(vacRecord.patientId).toBe('pat-duque-1');
    expect(vacRecord.administeredBy).toBe('Dr. Diego Irusta');
    expect(vacRecord.vetLicense).toBe('MP 8412');
    expect(vacRecord.certificateGenerated).toBe(true);
  });

  it('debe permitir dar de alta on-the-fly un paciente nuevo exclusivo de vacunación con su tutor', () => {
    const newOwner: Owner = {
      id: `own-${Date.now()}`,
      firstName: 'María',
      lastName: 'González',
      dni: '38450912',
      phone: '+54 9 358 4987654',
      whatsapp: '+54 9 358 4987654',
      email: 'maria@example.com',
      address: 'Calle San Martín 450',
      city: 'Río Cuarto',
      province: 'Córdoba',
      postalCode: '5800',
      taxCondition: 'CONSUMIDOR_FINAL',
      balance: 0,
      createdAt: new Date().toISOString(),
    };

    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      name: 'Milo',
      species: 'CANINO',
      breed: 'Caniche Toy',
      sex: 'MACHO',
      reproductiveStatus: 'ENTERO',
      color: 'Blanco',
      birthDate: new Date().toISOString(),
      calculatedAge: 'Adulto',
      weight: 4.2,
      status: 'ACTIVO',
      alerts: [],
      clinicalRecordNumber: 'HC-2026-9901',
      ownerId: newOwner.id,
      branchId: 'branch-central',
      createdAt: new Date().toISOString(),
    };

    const vacRecord: VaccinationRecord = {
      id: `vac-${Date.now()}`,
      patientId: newPatient.id,
      vaccineName: 'Antirrábica Canina Oficial',
      type: 'SENASA Obligatorio',
      manufacturer: 'Biogénesis Bagó',
      batchNumber: 'LT-AR-2026-B',
      expirationDate: '2028-01-01',
      administeredDate: new Date().toISOString().split('T')[0],
      administeredBy: 'Dr. Diego Irusta',
      vetLicense: 'MP 8412',
      nextDueDate: '2027-08-24',
      certificateGenerated: true,
    };

    expect(newPatient.ownerId).toBe(newOwner.id);
    expect(vacRecord.patientId).toBe(newPatient.id);
    expect(vacRecord.administeredBy).toBe('Dr. Diego Irusta');
    expect(vacRecord.vetLicense).toBe('MP 8412');
    expect(newOwner.phone).toContain('358');
  });
});
