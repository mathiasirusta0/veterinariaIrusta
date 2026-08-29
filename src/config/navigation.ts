// VET SYSTEM — Configuración Centralizada de Navegación en 4 Áreas Clínicas y Administrativas
// Veterinaria Ranquel — Las Lajas, Neuquén

import {
  PawPrint,
  Users,
  Calendar,
  Scissors,
  Activity,
  FlaskConical,
  Scan,
  Syringe,
  Boxes,
  TrendingUp,
  FileText,
  FileSignature,
  ShieldCheck,
  Cpu,
  LucideIcon,
} from 'lucide-react';
import { UserRole } from '../types';
import { SystemView } from '../utils/rbac';

export interface NavItemConfig {
  id: SystemView;
  label: string;
  shortLabel?: string;
  description: string;
  icon: LucideIcon;
  group: 'ATENCION_CLINICA' | 'GUARDIA_INTERNACION' | 'SERVICIOS_CLINICOS' | 'ADMINISTRACION';
  allowedRoles?: UserRole[];
  badgeColor?: string;
}

export const NAV_GROUPS = [
  { id: 'ATENCION_CLINICA', label: 'ATENCIÓN CLÍNICA' },
  { id: 'GUARDIA_INTERNACION', label: 'QUIRÓFANO & MONITOREO' },
  { id: 'SERVICIOS_CLINICOS', label: 'SERVICIOS CLÍNICOS' },
  { id: 'ADMINISTRACION', label: 'ADMINISTRACIÓN' },
] as const;

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  // A. ATENCIÓN CLÍNICA
  {
    id: 'PACIENTES',
    label: 'Pacientes & Expediente 360°',
    shortLabel: 'Pacientes',
    description: 'Directorio de pacientes y expediente clínico unificado',
    icon: PawPrint,
    group: 'ATENCION_CLINICA',
  },
  {
    id: 'PROPIETARIOS',
    label: 'Tutores & Propietarios',
    shortLabel: 'Tutores',
    description: 'Gestión de tutores, datos fiscales de contacto y cuenta corriente',
    icon: Users,
    group: 'ATENCION_CLINICA',
  },
  {
    id: 'AGENDA',
    label: 'Agenda de Turnos',
    shortLabel: 'Agenda',
    description: 'Calendario de turnos médicos, controles y procedimientos',
    icon: Calendar,
    group: 'ATENCION_CLINICA',
  },
  {
    id: 'VACUNAS',
    label: 'Plan de Vacunación',
    shortLabel: 'Vacunación',
    description: 'Calendario de biológicos y libreta sanitaria oficial',
    icon: Syringe,
    group: 'ATENCION_CLINICA',
  },

  // B. QUIRÓFANO & MONITOREO
  {
    id: 'CIRUGIAS',
    label: 'Cirugía & Quirófano',
    shortLabel: 'Cirugías',
    description: 'Programación de quirófano, anestesia y recuperación',
    icon: Scissors,
    group: 'GUARDIA_INTERNACION',
  },
  {
    id: 'SIGNOS_VITALES',
    label: 'Signos Vitales & Curvas',
    shortLabel: 'Vitals',
    description: 'Registro histórico y curvas hemodinámicas de monitoreo',
    icon: Activity,
    group: 'GUARDIA_INTERNACION',
  },

  // C. SERVICIOS CLÍNICOS
  {
    id: 'RECETAS_OFICIALES',
    label: 'Recetario & Prescripciones',
    shortLabel: 'Recetas',
    description: 'Emisión de recetas veterinarias con firma electrónica y hash SHA-256',
    icon: FileSignature,
    group: 'SERVICIOS_CLINICOS',
  },
  {
    id: 'LABORATORIO',
    label: 'Laboratorio Clínico',
    shortLabel: 'Laboratorio',
    description: 'Órdenes de bioquímica, hemograma, frotis y perfiles diagnósticos',
    icon: FlaskConical,
    group: 'SERVICIOS_CLINICOS',
  },
  {
    id: 'IMAGENES',
    label: 'Diagnóstico por Imágenes',
    shortLabel: 'Imágenes',
    description: 'Estudios de Rayos X, ecografía y visualizador con anotaciones',
    icon: Scan,
    group: 'SERVICIOS_CLINICOS',
  },
  {
    id: 'INVENTARIO',
    label: 'Farmacia & Stock',
    shortLabel: 'Farmacia',
    description: 'Control de stock de medicamentos, psicotrópicos e insumos',
    icon: Boxes,
    group: 'SERVICIOS_CLINICOS',
    badgeColor: 'bg-amber-500',
  },

  // D. ADMINISTRACIÓN
  {
    id: 'CAJA_FACTURACION',
    label: 'Finanzas & Facturación',
    shortLabel: 'Finanzas',
    description: 'Caja diaria, recibos de cobro, cuentas a cobrar/pagar y balances',
    icon: TrendingUp,
    group: 'ADMINISTRACION',
  },
  {
    id: 'DOCUMENTOS',
    label: 'Documentos & Consentimientos',
    shortLabel: 'Documentos',
    description: 'Consentimientos informados, actas y certificados con trazabilidad',
    icon: FileText,
    group: 'ADMINISTRACION',
  },
  {
    id: 'CONFIGURACION',
    label: 'Configuración & Auditoría',
    shortLabel: 'Configuración',
    description: 'Usuarios, roles RBAC, sedes hospitalarias y registros de auditoría',
    icon: ShieldCheck,
    group: 'ADMINISTRACION',
  },
  {
    id: 'CENTRO_QA',
    label: 'Centro QA & Diagnóstico',
    shortLabel: 'QA & Test',
    description: 'Suite de validación operativa, test de integridad y auditoría técnica',
    icon: Cpu,
    group: 'ADMINISTRACION',
    allowedRoles: ['SUPERADMIN', 'DIRECTOR_MEDICO', 'AUDITOR'],
  },
];

export const getNavLabel = (viewId: SystemView): string => {
  const item = NAVIGATION_ITEMS.find((n) => n.id === viewId);
  return item?.label || viewId;
};

export const getNavShortLabel = (viewId: SystemView): string => {
  const item = NAVIGATION_ITEMS.find((n) => n.id === viewId);
  return item?.shortLabel || item?.label || viewId;
};
