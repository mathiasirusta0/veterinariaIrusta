import React from 'react';
import {
  PawPrint,
  Boxes,
  ShieldCheck,
  Receipt,
  X,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { hasViewPermission, SystemView } from '../utils/rbac';
import { triggerHaptic } from '../utils/haptics';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

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

export const Sidebar: React.FC<SidebarProps> = ({ isOpenMobile, onCloseMobile }) => {
  const {
    activeView,
    setActiveView,
    currentUser,
    patients,
    products,
    setSelectedPatientId,
  } = useVet();

  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

  const rawNavGroups: SidebarNavGroup[] = [
    {
      group: 'PROGRAMA PRINCIPAL',
      items: [
        { id: 'PACIENTES', label: 'Pacientes & Ficha', icon: PawPrint, badge: patients.length },
        { id: 'CAJA_FACTURACION', label: 'Caja & Facturación (ARCA)', icon: Receipt },
        { id: 'INVENTARIO', label: 'Farmacia & Stock', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : undefined, badgeColor: 'bg-amber-500' },
        { id: 'CONFIGURACION', label: 'Administración', icon: ShieldCheck },
      ],
    },
  ];

  // Filtrar grupos según permisos RBAC
  const navGroups = rawNavGroups
    .map((grp) => ({
      ...grp,
      items: grp.items.filter((it) => hasViewPermission(currentUser?.role, it.id as SystemView)),
    }))
    .filter((grp) => grp.items.length > 0);

  const handleSelect = (id: string) => {
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
          className="fixed inset-0 bg-slate-950/75 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white text-slate-800 flex flex-col h-full border-r border-slate-200/90 transition-transform duration-200 ease-in-out shadow-lg md:shadow-none
          md:translate-x-0 md:static md:z-0
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand Header */}
        <div className="p-5 flex items-center justify-between border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3.5 cursor-pointer" onClick={() => handleSelect('PACIENTES')}>
            <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center font-black text-lg text-white shadow-md shadow-teal-600/20">
              V
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-slate-900">VET SYSTEM</span>
              <span className="text-[10px] text-teal-700 font-bold tracking-wider uppercase">
                Hospital Veterinario
              </span>
            </div>
          </div>

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-6 overflow-y-auto space-y-6 px-4 custom-scrollbar">
          {navGroups.map((group) => (
            <div key={group.group} className="space-y-2">
              <h4 className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                {group.group}
              </h4>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id || (item.id === 'PACIENTES' && (activeView === 'DASHBOARD' || activeView === 'INICIO' || activeView === 'OPERACION'));

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 text-xs transition-all duration-150 group rounded-xl border
                      ${
                        isActive
                          ? 'bg-teal-50 text-teal-950 border-teal-200 font-black shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold border-transparent'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 transition-colors ${
                          isActive ? 'text-teal-700' : 'text-slate-400 group-hover:text-teal-600'
                        }`}
                      />
                      <span className="truncate text-sm tracking-tight">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono ${
                          isActive
                            ? 'bg-teal-600 text-white'
                            : item.badgeColor ? `${item.badgeColor} text-white` : 'bg-slate-100 text-slate-700 border border-slate-200'
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
        <div className="p-4 border-t border-slate-100 bg-slate-50/80 text-xs flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center font-black text-teal-800 text-sm shadow-2xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="truncate">
              <span className="font-black text-slate-900 block truncate">{currentUser.name}</span>
              <span className="text-[10px] text-teal-800 font-mono block uppercase font-bold">{currentUser.role}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
