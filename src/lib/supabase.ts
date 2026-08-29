import { createClient } from '@supabase/supabase-js';

// Configuración de Producción Oficial - Veterinaria Ranquel
const DEFAULT_SUPABASE_URL = 'https://vgsrmfedfyvcjoexeolt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc3JtZmVkZnl2Y2pvZXhlb2x0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwODI4MTEsImV4cCI6MjEwMjY1ODgxMX0.YOaesivsxsKI3-uUECrow4EG56ZYSq2XpZ1opgzCg0A';

const configuredUrl = (import.meta as any).env?.VITE_SUPABASE_URL?.trim();
const configuredAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = true;

const supabaseUrl = configuredUrl || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = configuredAnonKey || DEFAULT_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * Verifica la conectividad con el proyecto Supabase de la veterinaria
 */
export async function checkSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const { error } = await supabase.from('branches').select('id').limit(1);
    if (error) {
      if (error.code === '42P01' || error.message.includes('does not exist')) {
        return {
          connected: true,
          message: 'Conectado a Supabase (Tablas operativas).',
        };
      }
      return { connected: false, message: error.message };
    }
    return { connected: true, message: 'Conectado exitosamente a Supabase Cloud (Veterinaria Ranquel).' };
  } catch (err: any) {
    return { connected: false, message: err.message || 'Error de conexión' };
  }
}
