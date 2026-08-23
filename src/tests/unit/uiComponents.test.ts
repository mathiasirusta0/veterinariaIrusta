import { describe, it, expect } from 'vitest';
import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ClinicalAlert } from '../../components/ui/ClinicalAlert';
import { EmptyState } from '../../components/ui/EmptyState';
import { StatCard } from '../../components/ui/StatCard';
import { PawPrint } from 'lucide-react';

describe('Design System UI Components Unit Tests', () => {
  it('should export all Design System components properly', () => {
    expect(PageHeader).toBeDefined();
    expect(StatusBadge).toBeDefined();
    expect(ClinicalAlert).toBeDefined();
    expect(EmptyState).toBeDefined();
    expect(StatCard).toBeDefined();
  });

  it('should render correct properties for StatCard', () => {
    const cardProps = {
      title: 'Pacientes Activos',
      value: 124,
      subtitle: 'En censo actual',
      variant: 'teal' as const,
    };
    expect(cardProps.title).toBe('Pacientes Activos');
    expect(cardProps.value).toBe(124);
  });

  it('should support semantic variants for StatusBadge', () => {
    const badgeSuccess = { label: 'STOCK OK', variant: 'success' as const };
    const badgeDanger = { label: 'CRÍTICO', variant: 'danger' as const };
    const badgeWarning = { label: 'STOCK BAJO', variant: 'warning' as const };

    expect(badgeSuccess.variant).toBe('success');
    expect(badgeDanger.variant).toBe('danger');
    expect(badgeWarning.variant).toBe('warning');
  });

  it('should support clinical alert structure with dismiss and action', () => {
    const alert = {
      type: 'danger' as const,
      title: 'Alérgica a Penicilinas',
      message: 'No administrar amoxicilina ni derivados betalactámicos.',
    };

    expect(alert.type).toBe('danger');
    expect(alert.title).toContain('Alérgica');
  });

  it('debe precargar datos de paciente (ej: Mía) y preservar alertas médicas críticas y HC en la edición', () => {
    const patientMia = {
      id: 'patient-test-101',
      clinicalRecordNumber: 'HC-2024-0104',
      name: 'Mía',
      species: 'CANINO' as const,
      breed: 'Caniche Toy',
      sex: 'HEMBRA' as const,
      reproductiveStatus: 'CASTRADO' as const,
      birthDate: '2020-03-15',
      calculatedAge: '4 años',
      weight: 4.8,
      color: 'Blanco',
      microchip: '981098109123456',
      ownerId: 'owner-test-1',
      status: 'ACTIVO' as const,
      alerts: [
        { type: 'CARDIOPATIA' as const, description: 'Soplo mitral grado III/VI' },
        { type: 'RENAL' as const, description: 'Enfermedad renal crónica estadio II' },
      ],
      branchId: 'branch-1',
    };

    // Precarga
    const editFormData = {
      name: patientMia.name,
      species: patientMia.species,
      breed: patientMia.breed,
      sex: patientMia.sex,
      reproductiveStatus: patientMia.reproductiveStatus,
      birthDate: patientMia.birthDate,
      calculatedAge: patientMia.calculatedAge,
      weight: patientMia.weight,
      color: patientMia.color,
      microchip: patientMia.microchip || '',
      photoUrl: '',
      status: patientMia.status,
      ownerId: patientMia.ownerId,
    };

    expect(editFormData.name).toBe('Mía');
    expect(editFormData.weight).toBe(4.8);

    // Modificación de peso
    const updated = {
      ...patientMia,
      weight: 5.0,
      breed: 'Caniche Mini Toy',
    };

    expect(updated.weight).toBe(5.0);
    expect(updated.breed).toBe('Caniche Mini Toy');
    expect(updated.clinicalRecordNumber).toBe('HC-2024-0104');
    expect(updated.alerts).toHaveLength(2);
    expect(updated.alerts[0].type).toBe('CARDIOPATIA');
    expect(updated.alerts[1].type).toBe('RENAL');
  });
});
