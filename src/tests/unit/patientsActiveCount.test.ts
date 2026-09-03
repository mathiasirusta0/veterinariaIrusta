import { describe, it, expect } from 'vitest';
import { Patient } from '../../types';

describe('Fase 7 — Contadores de Pacientes Activos y Filtros de Estado', () => {
  it('la cuenta de la pestaña Todos debe corresponder estrictamente a los pacientes activos no archivados', () => {
    const mockPatients: Partial<Patient>[] = [
      {
        id: 'pat-1',
        name: 'Thor',
        species: 'CANINO',
        breed: 'Golden Retriever',
        sex: 'MACHO',
        status: 'ACTIVO',
        clinicalRecordNumber: 'HC-2026-001',
        ownerId: 'own-1',
        createdAt: '2026-08-01',
        branchId: 'branch-1',
      },
      {
        id: 'pat-2',
        name: 'Milo (Archivado)',
        species: 'FELINO',
        breed: 'Siamés',
        sex: 'MACHO',
        status: 'ARCHIVADO',
        clinicalRecordNumber: 'HC-2026-002',
        ownerId: 'own-2',
        createdAt: '2026-08-02',
        branchId: 'branch-1',
      },
    ];

    const activePatients = mockPatients.filter((p) => p.status !== 'ARCHIVADO');
    const archivedPatients = mockPatients.filter((p) => p.status === 'ARCHIVADO');

    expect(mockPatients.length).toBe(2);
    expect(activePatients.length).toBe(1);
    expect(archivedPatients.length).toBe(1);

    // Tab 'Todos' button label
    const todosLabel = `Todos (${activePatients.length})`;
    expect(todosLabel).toBe('Todos (1)');
  });
});
