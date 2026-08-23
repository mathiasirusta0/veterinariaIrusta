import React from 'react';
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
  Sparkles,
  ShieldCheck,
  X,
  LucideIcon,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { hasViewPermission, SystemView } from '../utils/rbac';
import { triggerHaptic } from '../utils/haptics';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface SidebarNavItem {
  id: SystemView;
  label: string;
  icon: LucideIcon;
  badge?: number;
  badgeColor?: string;
}

interface SidebarNavGroup {
  group: string;
  items: SidebarNavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const {
    activeView,
    setActiveView,
    currentUser,
    patients,
    products,
    hospitalizations,
    triageList,
    setSelectedPatientId,
  } = useVet();

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;
  const activeHospitalCount = hospitalizations.filter((h) => h.status === 'ACTIVA').length;
  const waitingTriageCount = triageList.filter((t) => t.status === 'EN_ESPERA').length;

  const rawNavGroups: SidebarNavGroup[] = [
    {
      group: 'ÁREA CLÍNICA',
      items: [
        { id: 'PACIENTES', label: 'Pacientes & Ficha 360°', icon: PawPrint, badge: patients.length },
        { id: 'CONSULTAS', label: 'Consultas Médicas SOAP', icon: Stethoscope },
        {
          id: 'INTERNACION',
          label: 'Internación & UCI',
          icon: BedDouble,
          badge: activeHospitalCount > 0 ? activeHospitalCount : undefined,
          badgeColor: 'bg-rose-500',
        },
        {
          id: 'SALA_ESPERA',
          label: 'Triage & Espera',
          icon: Clock,
          badge: waitingTriageCount > 0 ? waitingTriageCount : undefined,
          badgeColor: 'bg-amber-500',
        },
        { id: 'AGENDA', label: 'Agenda de Turnos', icon: Calendar },
        { id: 'CIRUGIAS', label: 'Quirófano & Cirugías', icon: Scissors },
        { id: 'RECETAS_OFICIALES', label: 'Recetario SENASA', icon: FileCheck },
      ],
    },
    {
      group: 'SERVICIOS & DIAGNÓSTICO',
      items: [
        { id: 'LABORATORIO', label: 'Laboratorio Clínico', icon: FlaskConical },
        { id: 'IMAGENES', label: 'Diagnóstico por Imágenes', icon: Scan },
        { id: 'VACUNAS', label: 'Plan de Vacunación', icon: Syringe },
      ],
    },
    {
      group: 'FARMACIA & INSUMOS',
      items: [
        {
          id: 'INVENTARIO',
          label: 'Farmacia & Stock',
          icon: Boxes,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeColor: 'bg-amber-500',
        },
      ],
    },
    {
      group: 'ADMINISTRACIÓN & GESTIÓN',
      items: [
        { id: 'CAJA_FACTURACION', label: 'Caja & Facturación (ARCA)', icon: Receipt },
        { id: 'PROPIETARIOS', label: 'Directorio de Tutores', icon: Users },
        { id: 'DOCUMENTOS', label: 'Documentos & Consent.', icon: FileText },
        { id: 'ASISTENTE_IA', label: 'Asistente Clínico IA', icon: Sparkles },
        { id: 'CONFIGURACION', label: 'Configuración & Auditoría', icon: ShieldCheck },
      ],
    },
  ];

  // Filtrar grupos según permisos RBAC del usuario activo
  const navGroups = rawNavGroups
    .map((grp) => ({
      ...grp,
      items: grp.items.filter((it) => hasViewPermission(currentUser?.role, it.id)),
    }))
    .filter((grp) => grp.items.length > 0);

  const handleSelect = (id: SystemView) => {
    triggerHaptic('light');
    if (id === 'PACIENTES') {
      setSelectedPatientId(null);
    }
    setActiveView(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-xs transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white text-slate-800 flex flex-col h-full border-r border-slate-200/90 transition-transform duration-200 ease-in-out shadow-xl md:shadow-none
          md:translate-x-0 md:static md:z-0
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/70">
          <div
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => handleSelect('PACIENTES')}
          >
            <div className="w-9 h-9 bg-teal-600 group-hover:bg-teal-700 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md shadow-teal-600/20 transition-colors">
              V
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-900 leading-tight">
                VET SYSTEM
              </span>
              <span className="text-[10px] text-teal-700 font-bold tracking-wider uppercase">
                Hospital Veterinario
              </span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-5 px-3 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                {group.group}
              </h4>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeView === item.id ||
                  (item.id === 'PACIENTES' &&
                    (activeView === 'DASHBOARD' ||
                      activeView === 'INICIO' ||
                      activeView === 'OPERACION'));

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-2.5 text-xs transition-all duration-150 group rounded-xl border select-none
                      ${
                        isActive
                          ? 'bg-teal-50/90 text-teal-950 border-teal-200 font-black shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-teal-700' : 'text-slate-400 group-hover:text-teal-600'
                        }`}
                      />
                      <span className="truncate text-xs tracking-tight">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono flex-shrink-0 ${
                          isActive
                            ? 'bg-teal-600 text-white'
                            : item.badgeColor
                            ? `${item.badgeColor} text-white`
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer: User Identity */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center font-black text-teal-800 text-xs shadow-2xs flex-shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate min-w-0">
              <span className="font-bold text-slate-900 block truncate text-xs">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-teal-800 font-mono block uppercase font-bold truncate">
                {currentUser.role}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
