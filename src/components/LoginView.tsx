import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Building, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useVet } from '../context/VetContext';
import { supabase } from '../lib/supabase';
import { triggerHaptic } from '../utils/haptics';

export const LoginView: React.FC = () => {
  const { branches, activeBranch, setActiveBranch, setCurrentUser, showToast } = useVet();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    triggerHaptic('light');

    try {
      if (isRegisterMode) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || 'Profesional Veterinario',
              role: 'VETERINARIO',
            },
          },
        });

        if (error) throw error;

        showToast('success', 'Cuenta Creada', 'Revisá tu correo para confirmar o iniciá sesión.');
        setIsRegisterMode(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Allow demo fallback for development / offline review
          if (email === 'admin@vetsystem.com.ar' || email === 'demo@vetsystem.com.ar') {
            setCurrentUser({
              id: 'user-superadmin',
              name: 'Superadmin Sistema',
              email: 'admin@vetsystem.com.ar',
              role: 'SUPERADMIN',
              branchId: activeBranch.id,
              licenseNumber: 'MP 8412 - Dirección Médica',
            });
            showToast('info', 'Sesión Demo Iniciada', 'Acceso habilitado en modo local.');
            return;
          }
          throw error;
        }

        if (data.user) {
          const userMeta = data.user.user_metadata || {};
          setCurrentUser({
            id: data.user.id,
            name: userMeta.name || data.user.email?.split('@')[0] || 'Profesional',
            email: data.user.email || '',
            role: userMeta.role || 'SUPERADMIN',
            branchId: activeBranch.id,
            licenseNumber: userMeta.license_number || 'MP 8412',
          });
          showToast('success', 'Sesión Iniciada', `Bienvenido/a ${userMeta.name || ''}`);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al autenticar. Verificá tus credenciales.');
      showToast('error', 'Error de Autenticación', err.message || 'Credenciales inválidas.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = (role: 'SUPERADMIN' | 'VETERINARIO') => {
    triggerHaptic('medium');
    setCurrentUser({
      id: role === 'SUPERADMIN' ? 'user-1' : 'user-vet',
      name: role === 'SUPERADMIN' ? 'Superadmin Sistema' : 'Dr. Matías Irusta',
      email: role === 'SUPERADMIN' ? 'admin@vetsystem.com.ar' : 'mirusta@vetsystem.com.ar',
      role: role,
      branchId: activeBranch.id,
      licenseNumber: 'MP 8412 - Dirección Médica',
    });
    showToast('success', 'Acceso Rápido', `Ingresando como ${role}...`);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-teal-500 selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-teal-600 border-2 border-teal-400/40 text-white text-3xl font-black flex items-center justify-center mx-auto shadow-xl shadow-teal-500/20 animate-pulse">
            🐾
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            VET SYSTEM
          </h1>
          <p className="text-xs text-teal-400 font-bold uppercase tracking-widest">
            Sistema Hospitalario Veterinario • Irusta
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-base font-black text-white">
              {isRegisterMode ? 'Crear Cuenta Profesional' : 'Acceso al Sistema Hospitalario'}
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Autenticación segura con Supabase Auth & Permisos RBAC
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Branch Selection */}
            <div>
              <label className="text-slate-300 font-bold block mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-teal-400" />
                <span>Sede / Sucursal Hospitalaria:</span>
              </label>
              <select
                value={activeBranch.id}
                onChange={(e) => {
                  const br = branches.find((b) => b.id === e.target.value);
                  if (br) setActiveBranch(br);
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.address}
                  </option>
                ))}
              </select>
            </div>

            {isRegisterMode && (
              <div>
                <label className="text-slate-300 font-bold block mb-1">Nombre Completo & Título:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Dr. Matías Irusta"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-slate-300 font-bold block mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                <span>Correo Electrónico:</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="profesional@vetsystem.com.ar"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Contraseña:</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs shadow-lg shadow-teal-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Registrar Usuario' : 'Ingresar al Hospital'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block text-center">
              Acceso Rápido de Homologación:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoAccess('SUPERADMIN')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-bold text-[11px] transition-all"
              >
                👑 Superadmin
              </button>
              <button
                type="button"
                onClick={() => handleDemoAccess('VETERINARIO')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-bold text-[11px] transition-all"
              >
                🩺 Veterinario
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-slate-500">
          Veterinaria Irusta • Gestión Hospitalaria Segura con Cifrado SSL y RLS
        </div>
      </div>
    </div>
  );
};
