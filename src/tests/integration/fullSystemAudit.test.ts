// @vitest-environment jsdom
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '../../lib/supabase';
import { NAVIGATION_ITEMS } from '../../config/navigation';

describe('Auditoría Integral de Sistema - Veterinaria Ranquel', () => {
  beforeAll(async () => {
    await supabase.auth.signInWithPassword({
      email: 'irusta@gmail.com',
      password: 'admin1998',
    });
  });

  afterAll(async () => {
    await supabase.auth.signOut();
  });

  it('1. Debe verificar la conectividad y operatividad de todas las 22 tablas en Supabase Cloud', async () => {
    const all22Tables = [
      'branches',
      'users',
      'profiles',
      'owners',
      'patients',
      'vital_signs',
      'patient_problems',
      'consultations',
      'hospitalizations',
      'surgeries',
      'laboratory_orders',
      'imaging_studies',
      'vaccinations',
      'products',
      'inventory_movements',
      'appointments',
      'triage_entries',
      'invoices',
      'estimates',
      'clinical_documents',
      'audit_logs',
      'cash_sessions',
    ];

    const results = await Promise.all(
      all22Tables.map(async (table) => {
        const res = await supabase.from(table).select('*').limit(1);
        return { table, error: res.error, data: res.data };
      })
    );

    for (const r of results) {
      expect(r.error, `Error en tabla ${r.table}`).toBeNull();
      expect(Array.isArray(r.data)).toBe(true);
    }
  }, 20000);

  it('2. Debe comprobar la integridad de todos los módulos del menú de navegación', () => {
    expect(NAVIGATION_ITEMS.length).toBeGreaterThan(5);
    const hasPatients = NAVIGATION_ITEMS.some((i) => i.id === 'PACIENTES');
    const hasAgenda = NAVIGATION_ITEMS.some((i) => i.id === 'AGENDA');
    const hasVacunas = NAVIGATION_ITEMS.some((i) => i.id === 'VACUNAS');
    const hasCirugias = NAVIGATION_ITEMS.some((i) => i.id === 'CIRUGIAS');
    const hasCaja = NAVIGATION_ITEMS.some((i) => i.id === 'CAJA_FACTURACION');

    expect(hasPatients).toBe(true);
    expect(hasAgenda).toBe(true);
    expect(hasVacunas).toBe(true);
    expect(hasCirugias).toBe(true);
    expect(hasCaja).toBe(true);
  });
});
