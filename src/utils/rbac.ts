// VET SYSTEM — Matriz de Control de Acceso Basado en Roles (RBAC)
import { UserRole } from '../types';

export type SystemView =
  | 'DASHBOARD'
  | 'PACIENTES'
  | 'PROPIETARIOS'
  | 'AGENDA'
  | 'SALA_ESPERA'
  | 'CONSULTAS'
  | 'SIGNOS_VITALES'
  | 'INTERNACION'
  | 'CIRUGIAS'
  | 'LABORATORIO'
  | 'IMAGENES'
  | 'VACUNAS'
  | 'INVENTARIO'
  | 'CAJA_FACTURACION'
  | 'DOCUMENTOS'
  | 'ASISTENTE_IA'
  | 'CONFIGURACION';

// Matriz de permisos por Rol
export const ROLE_PERMISSIONS: Record<UserRole, SystemView[]> = {
  SUPERADMIN: [
    'DASHBOARD',
    'PACIENTES',
    'PROPIETARIOS',
    'AGENDA',
    'SALA_ESPERA',
    'CONSULTAS',
    'SIGNOS_VITALES',
    'INTERNACION',
    'CIRUGIAS',
    'LABORATORIO',
    'IMAGENES',
    'VACUNAS',
    'INVENTARIO',
    'CAJA_FACTURACION',
    'DOCUMENTOS',
    'ASISTENTE_IA',
    'CONFIGURACION',
  ],
  ADMINISTRADOR: [
    'DASHBOARD',
    'PACIENTES',
    'PROPIETARIOS',
    'AGENDA',
    'SALA_ESPERA',
    'CONSULTAS',
    'SIGNOS_VITALES',
    'INTERNACION',
    'CIRUGIAS',
    'LABORATORIO',
    'IMAGENES',
    'VACUNAS',
    'INVENTARIO',
    'CAJA_FACTURACION',
    'DOCUMENTOS',
    'ASISTENTE_IA',
    'CONFIGURACION',
  ],
  VETERINARIO: [
    'DASHBOARD',
    'PACIENTES',
    'PROPIETARIOS',
    'AGENDA',
    'SALA_ESPERA',
    'CONSULTAS',
    'SIGNOS_VITALES',
    'INTERNACION',
    'CIRUGIAS',
    'LABORATORIO',
    'IMAGENES',
    'VACUNAS',
    'INVENTARIO',
    'DOCUMENTOS',
    'ASISTENTE_IA',
  ],
  ENFERMERIA: [
    'DASHBOARD',
    'PACIENTES',
    'AGENDA',
    'SALA_ESPERA',
    'SIGNOS_VITALES',
    'INTERNACION',
    'CIRUGIAS',
    'VACUNAS',
    'INVENTARIO',
  ],
  ASISTENTE: [
    'DASHBOARD',
    'PACIENTES',
    'PROPIETARIOS',
    'AGENDA',
    'SALA_ESPERA',
    'SIGNOS_VITALES',
    'INTERNACION',
    'VACUNAS',
  ],
  RECEPCION: [
    'DASHBOARD',
    'PACIENTES',
    'PROPIETARIOS',
    'AGENDA',
    'SALA_ESPERA',
    'DOCUMENTOS',
  ],
  CAJA: [
    'DASHBOARD',
    'PROPIETARIOS',
    'CAJA_FACTURACION',
    'DOCUMENTOS',
  ],
  FARMACIA: [
    'DASHBOARD',
    'INVENTARIO',
    'PACIENTES',
    'CAJA_FACTURACION',
  ],
};

/**
 * Verifica si un rol tiene permiso para acceder a una vista.
 */
export function hasViewPermission(role: UserRole | undefined, view: SystemView): boolean {
  if (!role) return false;
  const allowedViews = ROLE_PERMISSIONS[role] || [];
  return allowedViews.includes(view);
}

/**
 * Retorna la vista inicial por defecto adecuada según el rol.
 */
export function getDefaultViewForRole(role: UserRole | undefined): SystemView {
  switch (role) {
    case 'CAJA':
      return 'CAJA_FACTURACION';
    case 'FARMACIA':
      return 'INVENTARIO';
    case 'RECEPCION':
      return 'AGENDA';
    case 'ENFERMERIA':
      return 'INTERNACION';
    default:
      return 'DASHBOARD';
  }
}
