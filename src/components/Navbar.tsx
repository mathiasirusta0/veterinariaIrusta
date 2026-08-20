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
  ArrowRight,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

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
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile Menu Button & Global Search Bar */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-md">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Abrir menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={() => setIsGlobalSearchOpen(true)}
          className="relative w-full flex items-center bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 rounded-2xl px-3.5 py-2 text-xs text-slate-500 transition-all shadow-inner group"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2 group-hover:text-teal-600" />
          <span className="truncate">Buscar paciente, tutor, microchip, DNI...</span>
          <span className="hidden sm:inline-block ml-auto text-[10px] text-slate-400 border border-slate-300 bg-white px-1.5 py-0.5 rounded font-mono font-medium">
            CTRL + K
          </span>
        </button>
      </div>

      {/* Right: Branch Info, Cloud Status, Notifications, Role, and Action Buttons */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Supabase Cloud Live Indicator */}
        <div
          title={isCloudConnected ? 'Conectado a Supabase Cloud (PostgreSQL)' : 'Modo Local'}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
            isCloudConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <Cloud className={`w-3.5 h-3.5 ${isCloudConnected ? 'text-emerald-600' : 'text-amber-600 animate-pulse'}`} />
          <span>{isCloudConnected ? 'Supabase Cloud' : 'Local'}</span>
        </div>

        {/* Critical Alerts Banner Button */}
        {criticalCount > 0 && (
          <button
            onClick={() => setActiveView('INTERNACION')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold hover:bg-red-100 transition-colors animate-pulse"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">{criticalCount} Críticos</span>
            <span className="sm:hidden">{criticalCount}</span>
          </button>
        )}

        {/* Branch Selector */}
        <div className="hidden md:flex items-center gap-2 text-slate-700 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <select
            value={activeBranch.id}
            onChange={(e) => {
              const b = branches.find((br) => br.id === e.target.value);
              if (b) setActiveBranch(b);
            }}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            {branches.map((br) => (
              <option key={br.id} value={br.id}>
                {br.name}
              </option>
            ))}
          </select>
        </div>

        {/* User Role Switcher */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
          <User className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={currentUser.id}
            onChange={(e) => {
              const u = users.find((usr) => usr.id === e.target.value);
              if (u) setCurrentUser(u);
            }}
            className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => setActiveView('SALA_ESPERA')}
          className="relative p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
          title="Sala de espera y notificaciones"
        >
          <Bell className="w-5 h-5" />
          {criticalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
              {criticalCount}
            </span>
          )}
        </button>

        {/* Premium "Acceso al programa" Button */}
        <button
          onClick={() => setActiveView('DASHBOARD')}
          className="relative group overflow-hidden rounded-xl p-[1px] font-bold text-white shadow-md shadow-teal-600/20 hover:shadow-teal-500/35 transition-all duration-300 active:scale-95 flex items-center"
          title="Acceso al programa — Panel Central"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600 rounded-xl animate-gradient-x"></span>
          <span className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 bg-slate-900/90 rounded-[11px] transition-all duration-300 group-hover:bg-opacity-0">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white transition-colors animate-pulse" />
            <span className="text-xs font-bold tracking-tight whitespace-nowrap">Acceso al programa</span>
            <ArrowRight className="w-3 h-3 text-teal-400 group-hover:translate-x-0.5 group-hover:text-white transition-all hidden sm:inline" />
          </span>
        </button>

        {/* Action Button: + NUEVA ACCIÓN (Desktop only, mobile uses central floating FAB) */}
        <button
          onClick={() => setQuickModal('QUICK_ACTIONS')}
          className="hidden sm:flex bg-teal-600 hover:bg-teal-500 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all active:scale-95 items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ NUEVA ACCIÓN</span>
        </button>
      </div>
    </header>
  );
};
