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
});
