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
        return { count: (patients || []).length, color: 'bg-slate-200 text-slate-700' };
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
          className="fixed inset-0 bg-slate-950/70 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-72 max-w-[85vw] bg-slate-900 text-slate-100 flex flex-col
          transition-transform duration-300 ease-in-out border-r border-slate-800
          ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          shadow-2xl md:shadow-none select-none
        `}
      >
        {/* Header / Brand Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-teal-500/20">
              🐾
            </div>
            <div>
              <h1 className="font-black text-white text-base tracking-tight leading-none">
                VET SYSTEM
              </h1>
              <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest mt-1">
                Hospital Veterinario
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={handleClose}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Cerrar menú lateral"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Item Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                {group.group}
              </span>

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                const badge = getBadgeForView(item.id);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`
                      w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all
                      active:scale-[0.98] text-left
                      ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-400'
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
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-teal-400 text-xs">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium truncate uppercase">
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
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-950/40 hover:bg-rose-600/90 border border-rose-900/50 hover:border-rose-500 transition-all cursor-pointer shadow-2xs active:scale-98"
            title="Cerrar sesión de forma segura"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
