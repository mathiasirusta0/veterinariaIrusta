import React from 'react';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
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
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
