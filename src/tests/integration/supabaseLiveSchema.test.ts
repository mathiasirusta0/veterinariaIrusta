import { describe, it, expect } from 'vitest';
import { supabase, checkSupabaseConnection } from '../../lib/supabase';

describe('Supabase Live Schema & Connectivity Verification', () => {
  it('debe conectar exitosamente con el proyecto de Supabase', async () => {
    const conn = await checkSupabaseConnection();
    expect(conn.connected).toBe(true);
    expect(conn.message).toContain('Conectado');
  });

  it('debe verificar la existencia y operatividad de todas las 22 tablas del sistema en Supabase Cloud', async () => {
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
});
