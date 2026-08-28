import React from 'react';
import {
  X,
  LogOut,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { hasViewPermission, SystemView } from '../utils/rbac';
import { triggerHaptic } from '../utils/haptics';
import { NAVIGATION_ITEMS, NAV_GROUPS } from '../config/navigation';

interface SidebarProps {
  isOpenMobile?: boolean;
  isMobileMenuOpen?: boolean;
  onCloseMobile?: () => void;
  onCloseMobileMenu?: () => void;
}

// Pre-carga inteligente bajo demanda (On-Hover)
const PREFETCH_MAP: Record<string, () => Promise<any>> = {
  PACIENTES: () => import('./PatientsListView'),
  AGENDA: () => import('./AppointmentsView'),
  SIGNOS_VITALES: () => import('./VitalSignsView'),
  CIRUGIAS: () => import('./SurgeriesView'),
  LABORATORIO: () => import('./LaboratoryView'),
  IMAGENES: () => import('./ImagingView'),
  VACUNAS: () => import('./VaccinationView'),
  INVENTARIO: () => import('./InventoryView'),
  CAJA_FACTURACION: () => import('./FinancesUnifiedView'),
  DOCUMENTOS: () => import('./DocumentsView'),
  RECETAS_OFICIALES: () => import('./PrescriptionsView'),
  CONFIGURACION: () => import('./SettingsAndUsersView'),
  PROPIETARIOS: () => import('./OwnersView'),
  CENTRO_QA: () => import('./SystemQaTestCenterView'),
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpenMobile,
  isMobileMenuOpen,
  onCloseMobile,
  onCloseMobileMenu,
}) => {
  const isDrawerOpen = isMobileMenuOpen ?? isOpenMobile ?? false;
  const handleClose = onCloseMobileMenu ?? onCloseMobile ?? (() => {});

  const {
    activeView,
    setActiveView,
    currentUser,
    logout,
    patients,
    products,
    hospitalizations,
    triageList,
    setSelectedPatientId,
  } = useVet();

  const lowStockCount = (products || []).filter((p) => (p.currentStock ?? 0) <= (p.minStock ?? 0)).length;
  const activeHospitalCount = (hospitalizations || []).filter((h) => h.status === 'ACTIVA').length;
  const waitingTriageCount = (triageList || []).filter((t) => t.status === 'EN_ESPERA').length;

  const getBadgeForView = (viewId: SystemView) => {
    switch (viewId) {
      case 'PACIENTES':
        return { count: (patients || []).length, color: 'bg-slate-100 text-slate-700 border border-slate-200' };
      case 'INVENTARIO':
        return lowStockCount > 0 ? { count: lowStockCount, color: 'bg-amber-500 text-white' } : null;
      default:
        return null;
    }
  };

  const navGroups = (NAV_GROUPS || []).map((grp) => {
    const items = (NAVIGATION_ITEMS || []).filter(
      (item) => item.group === grp.id && hasViewPermission(currentUser?.role, item.id)
    );
    return {
      group: grp.label,
      items,
    };
  }).filter((grp) => grp.items && grp.items.length > 0);

  const handlePrefetch = (viewId: string) => {
    if (PREFETCH_MAP[viewId]) {
      PREFETCH_MAP[viewId]().catch(() => {});
    }
  };

  const handleSelect = (id: SystemView) => {
    triggerHaptic('light');
    if (id === 'PACIENTES') {
      setSelectedPatientId(null);
    }
    setActiveView(id);
    handleClose();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isDrawerOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar Container - Clean Light Medical Theme */}
      <aside
        className={`
          fixed md:sticky top-0 md:top-16 inset-y-0 left-0 z-50
          w-72 max-w-[85vw] h-full md:h-[calc(100vh-4rem)] md:h-[calc(100dvh-4rem)]
          bg-white text-slate-800 flex flex-col justify-between
          transition-transform duration-300 ease-in-out border-r border-slate-200/90
          ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          shadow-xl md:shadow-none select-none overflow-hidden flex-shrink-0
        `}
      >
        {/* Header / Brand Logo */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <img
              src="/logo-ranquel.png"
              alt="Veterinaria Ranquel"
              className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 shadow-2xs border border-slate-200 flex-shrink-0"
            />
            <div>
              <h1 className="font-black text-slate-900 text-base tracking-tight leading-none">
                VET SYSTEM
              </h1>
              <p className="text-[10px] text-teal-700 font-black uppercase tracking-widest mt-1">
                Hospital Veterinario
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={handleClose}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Cerrar menú lateral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Item Groups */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-200">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5">
                {group.group}
              </span>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const badge = getBadgeForView(item.id);

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? 'page' : undefined}
                    onMouseEnter={() => handlePrefetch(item.id)}
                    onFocus={() => handlePrefetch(item.id)}
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelect(item.id);
                    }}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold
                      transition-all duration-150 ease-out active:scale-[0.97] text-left cursor-pointer select-none
                      focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:outline-hidden
                      ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20 font-black'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-500'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {badge && badge.count > 0 && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          isActive ? 'bg-white/20 text-white' : badge.color
                        }`}
                      >
                        {badge.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer: User profile info & Logout */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 space-y-2 flex-shrink-0">
          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center font-black text-teal-800 text-xs shadow-2xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-500 font-bold truncate uppercase tracking-wider">
                {currentUser?.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={async () => {
              triggerHaptic('medium');
              if (onCloseMobile) onCloseMobile();
              await logout();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 transition-all cursor-pointer shadow-2xs active:scale-98"
            title="Cerrar sesión de forma segura"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
