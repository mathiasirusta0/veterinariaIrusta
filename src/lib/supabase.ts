import { createClient } from '@supabase/supabase-js';

const configuredUrl = (import.meta as any).env?.VITE_SUPABASE_URL?.trim();
const configuredAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(configuredUrl && configuredAnonKey);

// Nunca conectar silenciosamente a un proyecto real si Vercel o el entorno
// local olvidan configurar variables. El placeholder solo permite que la UI
// arranque en modo local y checkSupabaseConnection informe el problema.
const supabaseUrl = configuredUrl || 'http://127.0.0.1:54321';
const supabaseAnonKey = configuredAnonKey || 'supabase-anon-key-not-configured';

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
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      message: 'Supabase no está configurado. Defina VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.',
    };
  }

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
