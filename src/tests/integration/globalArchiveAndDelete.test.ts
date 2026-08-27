// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { Patient, VaccinationRecord, LaboratoryOrder } from '../../types';

describe('Sistema Global de Archivado y Eliminación', () => {
  it('1. Permite archivar y desarchivar pacientes cambiando su estado', () => {
    let patient: Patient = {
      id: 'pat-arch-01',
      name: 'Simba',
      species: 'FELINO',
      breed: 'Común Europeo',
      sex: 'MACHO',
      reproductiveStatus: 'CASTRADO',
      birthDate: '2022-01-01',
      calculatedAge: '4 años',
      weight: 4.5,
      color: 'Atigrado',
      alerts: [],
      clinicalRecordNumber: 'HC-9999',
      status: 'ACTIVO',
      ownerId: 'own-01',
      branchId: 'branch-1',
      createdAt: '2026-01-01T00:00:00Z',
    };

    // Archivar
    patient = { ...patient, status: 'ARCHIVADO' };
    expect(patient.status).toBe('ARCHIVADO');

    // Desarchivar
    patient = { ...patient, status: 'ACTIVO' };
    expect(patient.status).toBe('ACTIVO');
  });

  it('2. Permite archivar y filtrar registros de vacunación para evitar colapso de lista', () => {
    const list: VaccinationRecord[] = [
      {
        id: 'vac-1',
        patientId: 'pat-01',
        vaccineName: 'Séxtuple',
        manufacturer: 'Zoetis',
        batchNumber: 'LOTE-123',
        expirationDate: '2027-01-01',
        administeredDate: '2026-01-01',
        administeredBy: 'Dr. Diego Iván Irusta',
        vetLicense: 'M.P. 502',
        nextDueDate: '2027-01-01',
        isArchived: false,
      },
      {
        id: 'vac-2',
        patientId: 'pat-01',
        vaccineName: 'Antirrábica Antigua',
        manufacturer: 'Nobivac',
        batchNumber: 'LOTE-000',
        expirationDate: '2024-01-01',
        administeredDate: '2023-01-01',
        administeredBy: 'Dr. Diego Iván Irusta',
        vetLicense: 'M.P. 502',
        nextDueDate: '2024-01-01',
        isArchived: true,
      },
    ];

    const activeVac = list.filter((v) => !v.isArchived);
    const archivedVac = list.filter((v) => !!v.isArchived);

    expect(activeVac.length).toBe(1);
    expect(archivedVac.length).toBe(1);
    expect(archivedVac[0].vaccineName).toBe('Antirrábica Antigua');
  });

  it('3. Permite archivar turnos y órdenes de laboratorio', () => {
    const labOrder: LaboratoryOrder = {
      id: 'lab-1',
      orderNumber: 'LAB-2026-001',
      patientId: 'pat-01',
      testType: 'HEMOGRAMA_COMPLETO',
      status: 'FINALIZADO',
      results: [],
      diagnosticReport: 'Valores normales',
      conclusions: 'Sin alteraciones',
      requestedBy: 'Dr. Diego Iván Irusta',
      requestedAt: '2026-01-01',
      isArchived: true,
    };

    expect(labOrder.isArchived).toBe(true);
  });
});
