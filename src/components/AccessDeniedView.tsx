import React from 'react';
import { ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { useVet } from '../context/VetContext';

interface AccessDeniedViewProps {
  attemptedView?: string;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({ attemptedView = 'este módulo' }) => {
  const { currentUser, setActiveView } = useVet();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full text-center shadow-lg space-y-4 animate-in zoom-in-95">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-200">
          <ShieldAlert className="w-8 h-8 animate-bounce" />
        </div>

        <div>
          <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
            Control de Seguridad & RBAC
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2">Acceso No Autorizado</h2>
          <p className="text-xs text-slate-500 mt-1">
            Tu rol actual (<strong className="text-slate-800">{currentUser?.role || 'INVITADO'}</strong>) no posee permisos para acceder a <strong>{attemptedView}</strong>.
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2">
          <button
            onClick={() => setActiveView('DASHBOARD')}
            className="relative group overflow-hidden rounded-2xl p-[1.5px] font-bold text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/45 transition-all duration-300 active:scale-95"
            title="Ingresar al panel principal del programa"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600 rounded-2xl animate-gradient-x"></span>
            <span className="relative flex items-center gap-2 px-5 py-2.5 bg-slate-900 rounded-[14px] transition-all duration-300 group-hover:bg-opacity-0">
              <Sparkles className="w-4 h-4 text-emerald-400 group-hover:text-white transition-colors animate-pulse" />
              <span className="text-xs font-bold tracking-wide">Acceso al programa</span>
              <ArrowRight className="w-3.5 h-3.5 text-teal-400 group-hover:translate-x-1 group-hover:text-white transition-all" />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
