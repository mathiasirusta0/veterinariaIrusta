import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://vgsrmfedfyvcjoexeolt.supabase.co';

const supabaseAnonKey =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc3JtZmVkZnl2Y2pvZXhlb2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODI4MTEsImV4cCI6MjEwMjY1ODgxMX0.YOaesivsxsKI3-uUECrow4EG56ZYSq2XpZ1opgzCg0A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Checks connectivity with Supabase project
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from('patients').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, it's still reachable
      if (error.code === '42P01' || error.message.includes('relation') || error.message.includes('does not exist')) {
        return {
          connected: true,
          message: 'Conectado a Supabase (Esquema pendiente de creación en SQL Editor).',
        };
      }
      return { connected: false, message: error.message };
    }
    return { connected: true, message: 'Conectado exitosamente a Supabase Cloud.' };
  } catch (err: any) {
    return { connected: false, message: err.message || 'Error de conexión' };
  }
}
