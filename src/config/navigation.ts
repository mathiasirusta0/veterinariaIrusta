// VET SYSTEM — Configuración Centralizada de Navegación y Nombres de Módulos

import {
  PawPrint,
  Stethoscope,
  BedDouble,
  Clock,
  Calendar,
  Scissors,
  FileCheck,
  FlaskConical,
  Scan,
  Syringe,
  Boxes,
  Receipt,
  Users,
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
  group: 'CLINICA' | 'DIAGNOSTICO' | 'FARMACIA' | 'ADMINISTRACION';
  allowedRoles?: UserRole[];
  badgeColor?: string;
}

export const NAV_GROUPS = [
  { id: 'CLINICA', label: 'ÁREA CLÍNICA' },
  { id: 'DIAGNOSTICO', label: 'SERVICIOS & DIAGNÓSTICO' },
  { id: 'FARMACIA', label: 'FARMACIA & INSUMOS' },
  { id: 'ADMINISTRACION', label: 'ADMINISTRACIÓN & GESTIÓN' },
] as const;

export const NAVIGATION_ITEMS: NavItemConfig[] = [
  // 1. ÁREA CLÍNICA
  {
    id: 'PACIENTES',
    label: 'Pacientes',
    shortLabel: 'Pacientes',
    description: 'Directorio de pacientes, fichas clínicas y expedientes 360°',
    icon: PawPrint,
    group: 'CLINICA',
  },
  {
    id: 'CONSULTAS',
    label: 'Consultas Médicas',
    shortLabel: 'Consultas',
    description: 'Atención ambulatoria, evoluciones SOAP y prescripciones',
    icon: Stethoscope,
    group: 'CLINICA',
  },
  {
    id: 'INTERNACION',
    label: 'Internación',
    shortLabel: 'Internación',
    description: 'Pizarra de hospitalización, UCI y monitoreo intensivo',
    icon: BedDouble,
    group: 'CLINICA',
    badgeColor: 'bg-rose-500',
  },
  {
    id: 'SALA_ESPERA',
    label: 'Triage',
    shortLabel: 'Triage',
    description: 'Recepción, clasificación por urgencia y sala de espera',
    icon: Clock,
    group: 'CLINICA',
    badgeColor: 'bg-amber-500',
  },
  {
    id: 'AGENDA',
    label: 'Agenda de Turnos',
    shortLabel: 'Agenda',
    description: 'Calendario de turnos médicos, cirugías y vacunaciones',
    icon: Calendar,
    group: 'CLINICA',
  },
  {
    id: 'CIRUGIAS',
    label: 'Cirugías',
    shortLabel: 'Cirugías',
    description: 'Programación de quirófano, protocolos anestésicos y partes quirúrgicos',
    icon: Scissors,
    group: 'CLINICA',
  },
  {
    id: 'RECETAS_OFICIALES',
    label: 'Recetario',
    shortLabel: 'Recetario',
    description: 'Prescripciones oficiales, controlados y certificados SENASA',
    icon: FileCheck,
    group: 'CLINICA',
  },

  // 2. SERVICIOS & DIAGNÓSTICO
  {
    id: 'LABORATORIO',
    label: 'Laboratorio',
    shortLabel: 'Laboratorio',
    description: 'Órdenes de laboratorio, análisis clínicos y resultados',
    icon: FlaskConical,
    group: 'DIAGNOSTICO',
  },
  {
    id: 'IMAGENES',
    label: 'Diagnóstico por Imágenes',
    shortLabel: 'Imágenes',
    description: 'Radiografías, ecografías Doppler, tomografías e informes',
    icon: Scan,
    group: 'DIAGNOSTICO',
  },
  {
    id: 'VACUNAS',
    label: 'Plan de Vacunación',
    shortLabel: 'Vacunas',
    description: 'Planes sanitarios, calendario de biológicos y libreta oficial',
    icon: Syringe,
    group: 'DIAGNOSTICO',
  },

  // 3. FARMACIA & INSUMOS
  {
    id: 'INVENTARIO',
    label: 'Farmacia',
    shortLabel: 'Farmacia',
    description: 'Control de stock, libro de psicotrópicos y kardex de movimientos',
    icon: Boxes,
    group: 'FARMACIA',
    badgeColor: 'bg-amber-500',
  },

  // 4. ADMINISTRACIÓN & GESTIÓN
  {
    id: 'CAJA_FACTURACION',
    label: 'Caja',
    shortLabel: 'Caja',
    description: 'Facturación electrónica ARCA/AFIP, cuentas corrientes y arqueo Z',
    icon: Receipt,
    group: 'ADMINISTRACION',
  },
  {
    id: 'PROPIETARIOS',
    label: 'Directorio de Tutores',
    shortLabel: 'Tutores',
    description: 'Base de datos de responsables, datos de contacto y cuentas corrientes',
    icon: Users,
    group: 'ADMINISTRACION',
  },
  {
    id: 'DOCUMENTOS',
    label: 'Documentos',
    shortLabel: 'Documentos',
    description: 'Consentimientos informados, certificados legales y actas firmadas',
    icon: FileText,
    group: 'ADMINISTRACION',
  },
  {
    id: 'CONFIGURACION',
    label: 'Configuración & Auditoría',
    shortLabel: 'Ajustes',
    description: 'Parámetros del hospital, sedes, permisos y registro de auditoría',
    icon: ShieldCheck,
    group: 'ADMINISTRACION',
  },
];

export function getNavLabel(viewId: SystemView): string {
  const item = NAVIGATION_ITEMS.find((n) => n.id === viewId);
  return item ? item.label : viewId;
}

export function getNavShortLabel(viewId: SystemView): string {
  const item = NAVIGATION_ITEMS.find((n) => n.id === viewId);
  return item ? (item.shortLabel || item.label) : viewId;
}
