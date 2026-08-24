import { describe, it, expect } from 'vitest';
import { supabase, checkSupabaseConnection } from '../../lib/supabase';

describe('Supabase Live Schema & Connectivity Verification', () => {
  it('debe conectar exitosamente con el proyecto de Supabase', async () => {
    const conn = await checkSupabaseConnection();
    expect(conn.connected).toBe(true);
  });

  it('debe verificar la existencia y operatividad de todas las tablas requeridas', async () => {
    const tables = [
      'profiles',
      'owners',
      'patients',
      'vital_signs',
      'patient_problems',
      'encounters',
      'procedures',
      'encounter_consumptions',
      'consultations',
      'hospitalizations',
      'surgeries',
      'products',
      'financial_transactions',
      'invoices',
      'prescriptions',
      'account_debts',
      'clinical_documents',
      'audit_logs',
    ];

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    }
  });
});
