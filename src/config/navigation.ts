// VET SYSTEM — Configuración Centralizada de Navegación en 4 Áreas Clínicas y Administrativas

import {
  PawPrint,
  Stethoscope,
  BedDouble,
  Clock,
  Calendar,
  Scissors,
  Activity,
  FlaskConical,
  Scan,
  Syringe,
  Boxes,
  TrendingUp,
  FileText,
  ShieldCheck,
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
  { id: 'GUARDIA_INTERNACION', label: 'GUARDIA E INTERNACIÓN' },
  { id: 'SERVICIOS_CLINICOS', label: 'SERVICIOS CLÍNICOS' },
  { id: 'ADMINISTRACION', label: 'ADMINISTRACIÓN' },
] as const;

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  // A. ATENCIÓN CLÍNICA
  {
    id: 'PACIENTES',
    label: 'Pacientes & Tutores',
    shortLabel: 'Pacientes',
    description: 'Directorio de pacientes, tutores y expediente clínico 360°',
    icon: PawPrint,
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

  // B. GUARDIA E INTERNACIÓN
  {
    id: 'INTERNACION',
    label: 'Internación & Atención',
    shortLabel: 'Internación',
    description: 'Centro operativo de atención ambulatoria, internación y monitoreo',
    icon: BedDouble,
    group: 'GUARDIA_INTERNACION',
    badgeColor: 'bg-teal-500',
  },
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
    label: 'Signos Vitales',
    shortLabel: 'Vitals',
    description: 'Registro histórico y curvas hemodinámicas de monitoreo',
    icon: Activity,
    group: 'GUARDIA_INTERNACION',
  },

  // C. SERVICIOS CLÍNICOS
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
    label: 'Finanzas',
    shortLabel: 'Finanzas',
    description: 'Caja, facturación ARCA, movimientos, cuentas a cobrar/pagar y resultados',
    icon: TrendingUp,
    group: 'ADMINISTRACION',
  },
  {
    id: 'DOCUMENTOS',
    label: 'Documentos',
    shortLabel: 'Documentos',
    description: 'Consentimientos informados, actas y certificados legales con firma SHA-256',
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
];

export const getNavLabel = (viewId: SystemView): string => {
  const item = NAVIGATION_ITEMS.find((n) => n.id === viewId);
  return item?.label || viewId;
};

export const getNavShortLabel = (viewId: SystemView): string => {
  const item = NAVIGATION_ITEMS.find((n) => n.id === viewId);
  return item?.shortLabel || item?.label || viewId;
};
