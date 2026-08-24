// VET SYSTEM — Matriz de Control de Acceso Basado en Roles (RBAC)
import { UserRole } from '../types';

export type SystemView =
  | 'OPERACION'
  | 'DASHBOARD'
  | 'ATENCION'
  | 'HOSPITAL'
  | 'GESTION'
  | 'PACIENTES'
  | 'PROPIETARIOS'
  | 'AGENDA'
  | 'SALA_ESPERA'
  | 'CONSULTAS'
  | 'SIGNOS_VITALES'
  | 'RECETAS_OFICIALES'
  | 'INTERNACION'
  | 'CIRUGIAS'
  | 'LABORATORIO'
  | 'IMAGENES'
  | 'VACUNAS'
  | 'INVENTARIO'
  | 'CAJA_FACTURACION'
  | 'GESTION_ECONOMICA'
  | 'DOCUMENTOS'
  | 'CENTRO_QA'
  | 'CONFIGURACION';

// Matriz de permisos por Rol
export const ROLE_PERMISSIONS: Record<UserRole, SystemView[]> = {
  SUPERADMIN: [
    'OPERACION',
    'DASHBOARD',
    'ATENCION',
    'HOSPITAL',
    'GESTION',
    'PACIENTES',
    'PROPIETARIOS',
    'AGENDA',
    'SALA_ESPERA',
    'CONSULTAS',
    'SIGNOS_VITALES',
    'RECETAS_OFICIALES',
    'INTERNACION',
    'CIRUGIAS',
    'LABORATORIO',
    'IMAGENES',
    'VACUNAS',
    'INVENTARIO',
    'CAJA_FACTURACION',
    'GESTION_ECONOMICA',
    'DOCUMENTOS',
    'CENTRO_QA',
    'CONFIGURACION',
  ],
  ADMINISTRADOR: [
    'OPERACION',
    'DASHBOARD',
    'ATENCION',
    'HOSPITAL',
    'GESTION',
    'PACIENTES',
    'PROPIETARIOS',
    'AGENDA',
    'SALA_ESPERA',
    'CONSULTAS',
    'SIGNOS_VITALES',
    'RECETAS_OFICIALES',
    'INTERNACION',
    'CIRUGIAS',
    'LABORATORIO',
    'IMAGENES',
    'VACUNAS',
    'INVENTARIO',
    'CAJA_FACTURACION',
    'DOCUMENTOS',
    'CENTRO_QA',
    'CONFIGURACION',
  ],
  DIRECTOR_MEDICO: [
    'OPERACION',
    'DASHBOARD',
    'ATENCION',
    'HOSPITAL',
    'GESTION',
    'PACIENTES',
    'PROPIETARIOS',
    'AGENDA',
    'SALA_ESPERA',
    'CONSULTAS',
    'SIGNOS_VITALES',
    'RECETAS_OFICIALES',
    'INTERNACION',
    'CIRUGIAS',
    'LABORATORIO',
    'IMAGENES',
    'VACUNAS',
    'INVENTARIO',
    'CAJA_FACTURACION',
    'DOCUMENTOS',
    'CENTRO_QA',
    'CONFIGURACION',
  ],
  VETERINARIO: [
    'OPERACION',
    'DASHBOARD',
    'ATENCION',
    'HOSPITAL',
    'GESTION',
    'PACIENTES',
    'PROPIETARIOS',
    'AGENDA',
    'SALA_ESPERA',
    'CONSULTAS',
    'SIGNOS_VITALES',
    'RECETAS_OFICIALES',
    'INTERNACION',
    'CIRUGIAS',
    'LABORATORIO',
    'IMAGENES',
    'VACUNAS',
    'INVENTARIO',
    'CAJA_FACTURACION',
    'DOCUMENTOS',
  ],
  ESPECIALISTA: [
    'DASHBOARD',
    'PACIENTES',
    'PROPIETARIOS',
    'AGENDA',
    'SALA_ESPERA',
    'CONSULTAS',
    'SIGNOS_VITALES',
    'RECETAS_OFICIALES',
    'INTERNACION',
    'CIRUGIAS',
    'LABORATORIO',
    'IMAGENES',
    'CAJA_FACTURACION',
    'DOCUMENTOS',
  ],
  AUDITOR: [
    'DASHBOARD',
    'PACIENTES',
    'PROPIETARIOS',
    'CONSULTAS',
    'RECETAS_OFICIALES',
    'CAJA_FACTURACION',
    'DOCUMENTOS',
    'CENTRO_QA',
    'CONFIGURACION',
  ],
  ENFERMERIA: [
    'DASHBOARD',
    'ATENCION',
    'HOSPITAL',
    'GESTION',
    'PACIENTES',
    'AGENDA',
    'SALA_ESPERA',
    'SIGNOS_VITALES',
    'INTERNACION',
    'CIRUGIAS',
    'VACUNAS',
    'INVENTARIO',
    'CAJA_FACTURACION',
  ],
  ASISTENTE: [
    'DASHBOARD',
    'ATENCION',
    'HOSPITAL',
    'PACIENTES',
    'PROPIETARIOS',
    'AGENDA',
    'SALA_ESPERA',
    'SIGNOS_VITALES',
    'INTERNACION',
    'VACUNAS',
    'CAJA_FACTURACION',
  ],
  RECEPCION: [
    'DASHBOARD',
    'ATENCION',
    'GESTION',
    'PACIENTES',
    'PROPIETARIOS',
    'AGENDA',
    'SALA_ESPERA',
    'CAJA_FACTURACION',
    'DOCUMENTOS',
  ],
  CAJA: [
    'DASHBOARD',
    'GESTION',
    'PROPIETARIOS',
    'CAJA_FACTURACION',
    'DOCUMENTOS',
  ],
  FARMACIA: [
    'DASHBOARD',
    'INVENTARIO',
    'RECETAS_OFICIALES',
    'PACIENTES',
    'CAJA_FACTURACION',
  ],
  LABORATORIO: [
    'DASHBOARD',
    'LABORATORIO',
    'PACIENTES',
    'IMAGENES',
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

export const QUICK_ACTION_VIEW_MAP: Record<string, SystemView> = {
  NUEVA_CONSULTA: 'CONSULTAS',
  NUEVO_PACIENTE: 'PACIENTES',
  NUEVO_PROPIETARIO: 'PROPIETARIOS',
  NUEVO_TURNO: 'AGENDA',
  NUEVO_TRIAGE: 'SALA_ESPERA',
  INGRESO_INTERNACION: 'INTERNACION',
  NUEVA_CIRUGIA: 'CIRUGIAS',
  NUEVO_LAB: 'LABORATORIO',
  NUEVA_IMAGEN: 'IMAGENES',
  NUEVA_VACUNA: 'VACUNAS',
  NUEVA_FACTURA: 'CAJA_FACTURACION',
  NUEVO_CONSENTIMIENTO: 'DOCUMENTOS',
  NUEVO_PRODUCTO: 'INVENTARIO',
  NUEVO_PRESUPUESTO: 'CAJA_FACTURACION',
};

/**
 * Verifica si un rol tiene permiso para ejecutar una acción rápida en el modal.
 */
export function hasQuickActionPermission(role: UserRole | undefined, actionId: string): boolean {
  if (!role) return false;
  if (role === 'SUPERADMIN' || role === 'ADMINISTRADOR') return true;
  const targetView = QUICK_ACTION_VIEW_MAP[actionId];
  if (!targetView) return true;
  return hasViewPermission(role, targetView);
}

