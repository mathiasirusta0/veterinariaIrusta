import React from 'react';
import {
  LayoutDashboard,
  PawPrint,
  Users,
  CalendarDays,
  Clock,
  Stethoscope,
  BedDouble,
  Scissors,
  FlaskConical,
  Scan,
  Syringe,
  Boxes,
  Receipt,
  FileText,
  Sparkles,
  ShieldCheck,
  Building2,
  Calculator,
  Radio,
  Activity,
  X,
  Scale,
  Lock,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

import { hasViewPermission, SystemView } from '../utils/rbac';

export const Sidebar: React.FC<{ isOpenMobile?: boolean; onCloseMobile?: () => void }> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const {
    activeView,
    setActiveView,
    hospitalizations,
    triageList,
    appointments,
    labOrders,
    products,
    currentUser,
    activeBranch,
    openCalculators,
    openMonitor,
    openWhatsAppHub,
    openDentalChart,
    openBodyMap,
  } = useVet();

  const activeHospitalCount = hospitalizations.filter((h) => h.status === 'ACTIVA').length;
  const waitingTriageCount = triageList.filter((t) => t.status === 'EN_ESPERA').length;
  const todayAppointments = appointments.filter(
    (a) => a.date === new Date().toISOString().split('T')[0] && a.status !== 'CANCELADO'
  ).length;
  const pendingLabsCount = labOrders.filter((l) => l.status === 'SOLICITADO' || l.status === 'EN_PROCESO').length;
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

interface SidebarNavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
  badgeColor?: string;
}

interface SidebarNavGroup {
  group: string;
  items: SidebarNavItem[];
}

  const rawNavGroups: SidebarNavGroup[] = [
    {
      group: 'CLÍNICA Y ATENCIÓN',
      items: [
        { id: 'DASHBOARD', label: 'Inicio', icon: LayoutDashboard },
        { id: 'PACIENTES', label: 'Pacientes', icon: PawPrint },
        { id: 'PROPIETARIOS', label: 'Propietarios', icon: Users },
        { id: 'AGENDA', label: 'Agenda', icon: CalendarDays, badge: todayAppointments },
        { id: 'SALA_ESPERA', label: 'Sala de Espera', icon: Clock, badge: waitingTriageCount, badgeColor: 'bg-amber-500' },
        { id: 'CONSULTAS', label: 'Consultas & SOAP', icon: Stethoscope },
        { id: 'SIGNOS_VITALES', label: 'Signos Vitales', icon: Activity },
        { id: 'RECETAS_OFICIALES', label: 'Recetario SENASA', icon: FileText },
      ],
    },
    {
      group: 'HOSPITAL & CIRUGÍAS',
      items: [
        { id: 'INTERNACION', label: 'Internación UCI', icon: BedDouble, badge: activeHospitalCount, badgeColor: 'bg-red-500' },
        { id: 'CIRUGIAS', label: 'Cirugías & Anestesia', icon: Scissors },
        { id: 'LABORATORIO', label: 'Laboratorio', icon: FlaskConical, badge: pendingLabsCount, badgeColor: 'bg-purple-500' },
        { id: 'IMAGENES', label: 'Imágenes RX / Eco', icon: Scan },
        { id: 'VACUNAS', label: 'Vacunación', icon: Syringe },
      ],
    },
    {
      group: 'FARMACIA & INVENTARIO',
      items: [
        { id: 'INVENTARIO', label: 'Farmacia & Stock', icon: Boxes, badge: lowStockCount, badgeColor: 'bg-red-500' },
      ],
    },
    {
      group: 'GESTIÓN & SISTEMA',
      items: [
        { id: 'CAJA_FACTURACION', label: 'Caja & Facturas ARCA', icon: Receipt },
        { id: 'DOCUMENTOS', label: 'Documentos & Consentimientos', icon: FileCheck },
        { id: 'CENTRO_QA', label: 'Centro de Pruebas QA', icon: FlaskConical },
        { id: 'ASISTENTE_IA', label: 'Asistente IA', icon: Sparkles, badgeColor: 'bg-teal-500' },
        { id: 'CONFIGURACION', label: 'Configuración', icon: ShieldCheck },
      ],
    },
  ];

  // Filtrar grupos y elementos según los permisos del rol actual
  const navGroups = rawNavGroups
    .map((grp) => ({
      ...grp,
      items: grp.items.filter((it) => hasViewPermission(currentUser?.role, it.id as SystemView)),
    }))
    .filter((grp) => grp.items.length > 0);

  const handleSelect = (id: string) => {
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
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#0F172A] text-white flex flex-col h-full border-r border-slate-800 transition-transform duration-200 ease-in-out
          md:translate-x-0 md:static md:z-0
          ${isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-xl flex items-center justify-center font-black text-lg text-slate-900 shadow-sm shadow-teal-500/30">
              V
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-white">VET SYSTEM</span>
              <span className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">
                Hospital Veterinario
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-4 px-3 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 mb-1.5">
                {group.group}
              </h4>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeView === item.id ||
                  (item.id === 'DASHBOARD' && activeView === 'INICIO');

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-all group rounded-xl
                      ${
                        isActive
                          ? 'bg-teal-500/15 text-teal-400 border-l-4 border-teal-500 rounded-r-xl font-bold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${
                          item.badgeColor || 'bg-slate-700'
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

          {/* Clinical Tools Fast Access */}
          <div className="pt-2 border-t border-slate-800 space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 mb-1.5">
              HERRAMIENTAS CLÍNICAS
            </h4>
            <button
              onClick={() => {
                openCalculators();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Calculator className="w-4 h-4 text-teal-400 group-hover:text-white" />
                <span>Calculadora Dosis/Fluidos</span>
              </div>
            </button>

            <button
              onClick={() => {
                openMonitor();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-emerald-400 group-hover:text-white" />
                <span>Monitor UCI en Vivo</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </button>

            <button
              onClick={() => {
                openDentalChart();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <span>🦷</span>
                <span>Odontograma Triadan</span>
              </div>
            </button>

            <button
              onClick={() => {
                openBodyMap();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <span>🐾</span>
                <span>Mapa de Lesiones</span>
              </div>
            </button>
          </div>
        </nav>

        {/* Footer: Active User & Hospital Mode */}
        <div className="p-3.5 border-t border-slate-800 bg-[#0B1120] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-full bg-teal-600/30 border border-teal-500/50 flex items-center justify-center font-bold text-teal-400 text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate">
              <span className="font-bold text-slate-200 block truncate">{currentUser.name}</span>
              <span className="text-[10px] text-teal-400 font-mono block">{currentUser.role}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
