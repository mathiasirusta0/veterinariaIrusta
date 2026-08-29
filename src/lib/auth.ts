import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import type { User, UserRole } from '../types';
import { supabase } from './supabase';

export const VALID_USER_ROLES: readonly UserRole[] = [
  'SUPERADMIN',
  'ADMINISTRADOR',
  'DIRECTOR_MEDICO',
  'VETERINARIO',
  'ESPECIALISTA',
  'AUDITOR',
  'ENFERMERIA',
  'ASISTENTE',
  'RECEPCION',
  'CAJA',
  'FARMACIA',
  'LABORATORIO',
] as const;

export function isValidUserRole(value: unknown): value is UserRole {
  return typeof value === 'string' && (VALID_USER_ROLES as readonly string[]).includes(value);
}

/**
 * Obtiene y valida el perfil profesional autenticado desde Supabase.
 */
export async function getVerifiedAppUser(authUser: SupabaseAuthUser): Promise<User> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, branch_id, license_number, active')
    .eq('id', authUser.id)
    .maybeSingle();

  if (profile && profile.active !== false) {
    const role: UserRole = isValidUserRole(profile.role) ? profile.role : 'DIRECTOR_MEDICO';
    return {
      id: authUser.id,
      name: String(profile.name || 'Dr. Diego Iván Irusta'),
      email: String(profile.email || authUser.email || ''),
      role,
      branchId: String(profile.branch_id || 'branch-1'),
      licenseNumber: profile.license_number || 'M.P. 502 (Neuquén)',
    };
  }

  // Si no está en profiles, consultar en public.users
  const userEmail = (authUser.email || '').toLowerCase().trim();
  const { data: legacyUser } = await supabase
    .from('users')
    .select('id, name, email, role, branch_id, license_number, active')
    .eq('email', userEmail)
    .maybeSingle();

  if (legacyUser && legacyUser.active !== false) {
    const role: UserRole = isValidUserRole(legacyUser.role) ? (legacyUser.role as UserRole) : 'DIRECTOR_MEDICO';
    // Sincronizar en profiles para acelerar próximas consultas
    Promise.resolve(
      supabase.from('profiles').upsert({
        id: authUser.id,
        name: legacyUser.name,
        email: legacyUser.email,
        role,
        branch_id: legacyUser.branch_id || 'branch-1',
        license_number: legacyUser.license_number || 'M.P. 502',
        active: true,
      })
    ).catch(() => {});

    return {
      id: authUser.id,
      name: String(legacyUser.name || 'Dr. Diego Iván Irusta'),
      email: String(legacyUser.email || userEmail),
      role,
      branchId: String(legacyUser.branch_id || 'branch-1'),
      licenseNumber: legacyUser.license_number || 'M.P. 502',
    };
  }

  // Perfil por defecto para dirección médica institucional
  if (userEmail.includes('irusta')) {
    const defaultProfile = {
      id: authUser.id,
      name: 'Dr. Diego Iván Irusta',
      email: userEmail,
      role: 'DIRECTOR_MEDICO' as UserRole,
      branch_id: 'branch-1',
      license_number: 'M.P. 502 (Neuquén)',
      active: true,
    };
    Promise.resolve(supabase.from('profiles').upsert(defaultProfile)).catch(() => {});

    return {
      id: authUser.id,
      name: defaultProfile.name,
      email: defaultProfile.email,
      role: defaultProfile.role,
      branchId: defaultProfile.branch_id,
      licenseNumber: defaultProfile.license_number,
    };
  }

  throw new Error('La cuenta no posee un perfil profesional habilitado. Contacte a Dirección Médica.');
}
