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
 * El rol operativo se obtiene exclusivamente de public.profiles. Los metadatos
 * editables del usuario y localStorage nunca son fuentes de autorización.
 */
export async function getVerifiedAppUser(authUser: SupabaseAuthUser): Promise<User> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, branch_id, license_number, active')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    throw new Error('No se pudo validar el perfil profesional. Intente nuevamente.');
  }
  if (!profile) {
    throw new Error('La cuenta no posee un perfil profesional habilitado. Contacte a Dirección Médica.');
  }
  if (profile.active === false) {
    throw new Error('La cuenta profesional está deshabilitada. Contacte a Dirección Médica.');
  }
  if (!isValidUserRole(profile.role)) {
    throw new Error('El perfil posee un rol inválido y fue bloqueado por seguridad.');
  }
  if (!profile.branch_id && profile.role !== 'SUPERADMIN') {
    throw new Error('El perfil no tiene una sede asignada. Contacte a Dirección Médica.');
  }

  return {
    id: authUser.id,
    name: String(profile.name || 'Profesional'),
    email: String(profile.email || authUser.email || ''),
    role: profile.role,
    branchId: String(profile.branch_id || 'branch-1'),
    licenseNumber: profile.license_number || undefined,
  };
}
