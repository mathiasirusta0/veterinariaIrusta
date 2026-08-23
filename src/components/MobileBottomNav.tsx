import React from 'react';
import {
  PawPrint,
  Receipt,
  Plus,
  Boxes,
  Menu,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { triggerHaptic } from '../utils/haptics';

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMobileMenu }) => {
  const {
    activeView,
    setActiveView,
    setSelectedPatientId,
    setQuickModal,
  } = useVet();

  const isPatientsActive = activeView === 'PACIENTES';
  const isBillingActive = activeView === 'CAJA_FACTURACION' || activeView === 'CAJA_FACTURAS';
  const isPharmacyActive = activeView === 'INVENTARIO' || activeView === 'FARMACIA';

  return (
    <nav
      aria-label="Navegación principal móvil"
      className="md:hidden fixed-viewport-bottom bg-white border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] select-none safe-bottom"
    >
      <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between px-1.5 sm:px-3 h-[64px] sm:h-[70px]">
        {/* 1. Pacientes */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setSelectedPatientId(null);
            setActiveView('PACIENTES');
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
            isPatientsActive
              ? 'text-teal-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              isPatientsActive ? 'bg-teal-50 text-teal-700' : 'text-slate-500'
            }`}
          >
            <PawPrint className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold tracking-tight truncate max-w-[64px]">
            Pacientes
          </span>
        </button>

        {/* 2. Caja & ARCA */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveView('CAJA_FACTURACION');
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
            isBillingActive
              ? 'text-teal-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              isBillingActive ? 'bg-teal-50 text-teal-700' : 'text-slate-500'
            }`}
          >
            <Receipt className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold tracking-tight truncate max-w-[64px]">
            Caja
          </span>
        </button>

        {/* 3. Botón Central "+" Dinámico & Destacado */}
        <div className="flex-1 flex items-center justify-center h-full px-1">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              setQuickModal('QUICK_ACTIONS');
            }}
            className="btn-physical btn-physical-teal w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] -mt-5 rounded-full border-4 border-white text-white shadow-lg active:scale-90 flex items-center justify-center transition-transform"
            title="Acción rápida de urgencia o consulta"
            aria-label="Nueva acción rápida"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* 4. Farmacia */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveView('INVENTARIO');
          }}
          className={`flex-1 flex flex-col items-center justify-center gap-0.5 h-full py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
            isPharmacyActive
              ? 'text-teal-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div
            className={`p-1 rounded-xl transition-colors ${
              isPharmacyActive ? 'bg-teal-50 text-teal-700' : 'text-slate-500'
            }`}
          >
            <Boxes className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold tracking-tight truncate max-w-[64px]">
            Farmacia
          </span>
        </button>

        {/* 5. Menú */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenMobileMenu();
          }}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full py-1 rounded-xl text-slate-500 hover:text-slate-900 active:scale-95 touch-manipulation transition-all"
          title="Abrir menú de navegación"
        >
          <div className="p-1 rounded-xl text-slate-500">
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-[10px] sm:text-xs font-bold tracking-tight truncate max-w-[64px]">
            Menú
          </span>
        </button>
      </div>
    </nav>
  );
};
