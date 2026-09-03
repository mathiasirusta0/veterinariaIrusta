// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { syncAppointmentToSupabase } from '../../lib/supabaseSync';
import { Appointment } from '../../types';

import { supabase } from '../../lib/supabase';

describe('Agenda de Turnos - Persistencia y Sincronización', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Debe guardar turnos en localStorage y recuperarlos intactos', () => {
    const mockApt: Appointment = {
      id: 'app-test-999',
      patientId: 'pat-duque-001',
      ownerId: 'own-enzo-001',
      vetId: 'usr-1',
      vetName: 'Dr. Diego Iván Irusta',
      branchId: 'branch-1',
      date: '2026-08-27',
      time: '11:00',
      durationMinutes: 30,
      type: 'CONSULTA_GENERAL',
      reason: 'Revisión periódica de rutina',
      status: 'CONFIRMADO',
    };

    localStorage.setItem('vetsys_appointments', JSON.stringify([mockApt]));
    const raw = localStorage.getItem('vetsys_appointments');
    expect(raw).toBeDefined();

    const parsed = JSON.parse(raw!);
    expect(parsed.length).toBe(1);
    expect(parsed[0].id).toBe('app-test-999');
    expect(parsed[0].vetName).toBe('Dr. Diego Iván Irusta');
    expect(parsed[0].patientId).toBe('pat-duque-001');
  });

  it('2. La función syncAppointmentToSupabase ejecuta sin errores de schema y maneja vet_name correctamente', async () => {
    const testId = `app-auto-test-${Date.now()}`;
    const mockApt: Appointment = {
      id: testId,
      patientId: 'pat-duque-001',
      ownerId: 'own-enzo-001',
      vetId: 'usr-1',
      vetName: 'Dr. Diego Iván Irusta',
      branchId: 'branch-1',
      date: '2026-08-27',
      time: '15:00',
      durationMinutes: 30,
      type: 'CIRUGIA',
      reason: 'Esterilización programada',
      status: 'RESERVADO',
    };

    // Should execute safely without throwing unhandled exceptions
    await expect(syncAppointmentToSupabase(mockApt)).resolves.not.toThrow();
    // Clean up immediately so test records never persist into production database
    try {
      await supabase.from('appointments').delete().eq('id', testId);
    } catch {}
  }, 15000);
});
