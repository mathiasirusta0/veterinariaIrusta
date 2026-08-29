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
 * Obtiene y valida el perfil profesional autenticado exclusivamente desde public.profiles.
 * Rechaza de forma estricta (fail-closed) cualquier cuenta sin perfil habilitado o con rol inválido.
 */
export async function getVerifiedAppUser(authUser: SupabaseAuthUser): Promise<User> {
  if (!authUser || !authUser.id) {
    throw new Error('Sesión de usuario no válida.');
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, name, email, role, branch_id, license_number, active')
    .eq('id', authUser.id)
    .maybeSingle();

  if (error) {
    throw new Error('Error de comunicación con el servidor al verificar el perfil.');
  }

  if (!profile) {
    throw new Error('La cuenta autenticada no posee un perfil profesional habilitado en el sistema. Contacte a Dirección Médica.');
  }

  if (profile.active === false) {
    throw new Error('La cuenta profesional se encuentra deshabilitada.');
  }

  if (!isValidUserRole(profile.role)) {
    throw new Error('El rol asignado a este perfil profesional no es válido y fue bloqueado por seguridad.');
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
