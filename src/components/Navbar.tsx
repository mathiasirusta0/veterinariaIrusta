import React from 'react';
import {
  Search,
  Plus,
  Building2,
  AlertTriangle,
  Bell,
  Command,
  User,
  Cloud,
  Menu,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { triggerHaptic } from '../utils/haptics';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu }) => {
  const {
    activeBranch,
    setActiveBranch,
    branches,
    currentUser,
    setCurrentUser,
    users,
    hospitalizations,
    setIsGlobalSearchOpen,
    setQuickModal,
    setActiveView,
    isCloudConnected,
  } = useVet();

  const criticalCount = hospitalizations.filter(
    (h) => h.status === 'ACTIVA' && (h.priority === 'CRITICO' || h.priority === 'PRIORITARIO')
  ).length;

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs transition-all w-full max-w-full">
      {/* Left: Mobile Menu Trigger & Sleek Global Search Bar */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 max-w-lg">
        {onToggleMobileMenu && (
          <button
            onClick={() => {
              triggerHaptic('light');
              onToggleMobileMenu();
            }}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => {
            triggerHaptic('light');
            setIsGlobalSearchOpen(true);
          }}
          className="relative flex-1 min-w-0 flex items-center bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 hover:border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-500 transition-all shadow-2xs group"
        >
          <Search className="w-4 h-4 text-slate-400 mr-1.5 flex-shrink-0 group-hover:text-teal-600 transition-colors" />
          <span className="truncate font-medium text-slate-600 text-left">Buscar paciente, tutor, microchip, DNI...</span>
          <span className="hidden md:flex items-center gap-1 ml-auto text-[10px] text-slate-500 border border-slate-300 bg-white px-2 py-0.5 rounded-md font-mono font-semibold shadow-2xs flex-shrink-0">
            <Command className="w-2.5 h-2.5" /> K
          </span>
        </button>
      </div>

      {/* Right: Cloud Status, Branch, Role, Notifications & Primary Action */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0 ml-2">
        {/* Supabase Cloud Live Indicator */}
        <div
          title={isCloudConnected ? 'Conectado a Supabase Cloud (PostgreSQL)' : 'Modo Local'}
          className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
            isCloudConnected
              ? 'bg-emerald-50/80 text-emerald-800 border-emerald-200 shadow-2xs'
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <Cloud className="w-3.5 h-3.5 text-emerald-600" />
          <span>{isCloudConnected ? 'Supabase Cloud' : 'Local'}</span>
        </div>

        {/* Critical Alerts Pill */}
        {criticalCount > 0 && (
          <button
            onClick={() => {
              triggerHaptic('medium');
              setActiveView('INTERNACION');
            }}
            className="flex items-center gap-1 p-2 sm:px-3 sm:py-1.5 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-black transition-all shadow-2xs animate-pulse flex-shrink-0"
            title={`${criticalCount} paciente(s) en estado crítico`}
          >
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="hidden sm:inline">{criticalCount} Crítico{criticalCount > 1 ? 's' : ''}</span>
            <span className="sm:hidden text-[11px] font-black">{criticalCount}</span>
          </button>
        )}

        {/* Branch Selector */}
        <div className="hidden xl:flex items-center gap-2 text-slate-700 bg-slate-50/90 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:border-slate-300 transition-all">
          <Building2 className="w-3.5 h-3.5 text-teal-600" />
          <select
            value={activeBranch.id}
            onChange={(e) => {
              const b = branches.find((br) => br.id === e.target.value);
              if (b) setActiveBranch(b);
            }}
            className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer pr-1"
          >
            {branches.map((br) => (
              <option key={br.id} value={br.id}>
                {br.name}
              </option>
            ))}
          </select>
        </div>

        {/* User Role Badge / Switcher */}
        <div className="hidden sm:flex items-center gap-2 bg-slate-50/90 border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs hover:border-slate-300 transition-all">
          <div className="w-5 h-5 rounded-full bg-teal-600 text-white font-black text-[10px] flex items-center justify-center">
            {currentUser.name.charAt(0)}
          </div>
          {users.length > 1 ? (
            <select
              value={currentUser.id}
              onChange={(e) => {
                const u = users.find((usr) => usr.id === e.target.value);
                if (u) setCurrentUser(u);
              }}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          ) : (
            <span className="text-xs font-bold text-slate-700">
              {currentUser.name} <span className="text-[10px] text-teal-600 font-extrabold uppercase">({currentUser.role})</span>
            </span>
          )}
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => {
            triggerHaptic('light');
            setActiveView('INTERNACION');
          }}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
          title="Sala de espera y notificaciones"
        >
          <Bell className="w-4 h-4" />
          {criticalCount > 0 && (
            <span className="absolute 1.5 top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>

        {/* Primary Action Button: + Nueva Consulta (Visible on tablets and desktop >= sm) */}
        <button
          onClick={() => {
            triggerHaptic('medium');
            setQuickModal('NUEVA_CONSULTA');
          }}
          className="hidden sm:flex btn-physical btn-physical-teal items-center gap-1.5 px-3.5 py-2 text-white rounded-xl text-xs font-black shadow-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="tracking-wide">Nueva Consulta</span>
        </button>
      </div>
    </header>
  );
};
