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
      aria-label="Navegación principal móvil y tablet"
      className="md:hidden fixed-viewport-bottom bg-white border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] select-none safe-bottom h-[64px] sm:h-[70px] max-h-[85px]"
    >
      <div className="w-full max-w-screen-xl mx-auto grid grid-cols-5 h-full items-center px-1">
        {/* Slot 1: Pacientes */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setSelectedPatientId(null);
            setActiveView('PACIENTES');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 h-full w-full py-1 rounded-xl transition-all active:scale-95 touch-manipulation min-h-[48px] ${
            isPatientsActive
              ? 'text-teal-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Ir a Directorio de Pacientes"
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

        {/* Slot 2: Caja & ARCA */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveView('CAJA_FACTURACION');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 h-full w-full py-1 rounded-xl transition-all active:scale-95 touch-manipulation min-h-[48px] ${
            isBillingActive
              ? 'text-teal-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Ir a Caja y Facturación"
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

        {/* Slot 3: Botón Central "+" Matemáticamente Centrado en la Columna 3 */}
        <div className="flex items-center justify-center h-full w-full">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              setQuickModal('QUICK_ACTIONS');
            }}
            className="btn-physical btn-physical-teal w-[54px] h-[54px] sm:w-[60px] sm:h-[60px] -mt-5 rounded-full border-4 border-white text-white shadow-xl active:scale-90 flex items-center justify-center transition-transform min-w-[48px] min-h-[48px] z-10"
            title="Acción rápida de urgencia o consulta clínica"
            aria-label="Nueva acción clínica rápida"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
        </div>

        {/* Slot 4: Farmacia */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            setActiveView('INVENTARIO');
          }}
          className={`flex flex-col items-center justify-center gap-0.5 h-full w-full py-1 rounded-xl transition-all active:scale-95 touch-manipulation min-h-[48px] ${
            isPharmacyActive
              ? 'text-teal-700 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Ir a Farmacia e Inventario"
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

        {/* Slot 5: Menú */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenMobileMenu();
          }}
          className="flex flex-col items-center justify-center gap-0.5 h-full w-full py-1 rounded-xl text-slate-500 hover:text-slate-900 active:scale-95 touch-manipulation transition-all min-h-[48px]"
          title="Abrir menú de navegación"
          aria-label="Abrir menú de navegación"
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
