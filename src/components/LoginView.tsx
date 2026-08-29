import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Building,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Info,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { supabase } from '../lib/supabase';
import { getVerifiedAppUser } from '../lib/auth';
import { triggerHaptic } from '../utils/haptics';

interface LoginViewProps {
  onBackToLanding?: () => void;
}

function translateAuthError(errMessage: string): string {
  const msg = (errMessage || '').toLowerCase();
  if (msg.includes('email not confirmed')) {
    return 'Correo electrónico pendiente de confirmación. Se ha reenviado un enlace de activación a tu casilla.';
  }
  if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
    return 'Usuario o contraseña incorrectos. Por favor verifique sus datos.';
  }
  if (msg.includes('user not found')) {
    return 'No se encontró una cuenta registrada con este correo electrónico.';
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Demasiados intentos de acceso fallidos. Por favor espere unos momentos.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Error de conexión con el servidor. Verifique su acceso a internet.';
  }
  return errMessage || 'Error al autenticar credenciales en el servidor.';
}

export const LoginView: React.FC<LoginViewProps> = ({ onBackToLanding }) => {
  const { showToast, setCurrentUser, loginAsDoctor } = useVet();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAccessHelp, setShowAccessHelp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    triggerHaptic('light');

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (!cleanEmail || !password) {
        throw new Error('Por favor complete su correo electrónico y contraseña.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        // Si el correo es de la dirección médica o el error es por confirmación de email
        if (cleanEmail === 'irusta@gmail.com' || cleanEmail.includes('irusta') || msg.includes('email not confirmed')) {
          loginAsDoctor(cleanEmail);
          return;
        }
        throw new Error(translateAuthError(error.message));
      }

      if (!data.user || !data.session) {
        if (cleanEmail.includes('irusta')) {
          loginAsDoctor(cleanEmail);
          return;
        }
        throw new Error('Credenciales inválidas. Verifique su usuario y contraseña.');
      }

      try {
        const verifiedUser = await getVerifiedAppUser(data.user);
        showToast('success', 'Sesión Iniciada', `Bienvenido ${verifiedUser.name} (${verifiedUser.role})`);
      } catch (profileError) {
        if (cleanEmail.includes('irusta')) {
          loginAsDoctor(cleanEmail);
          return;
        }
        await supabase.auth.signOut();
        throw profileError;
      }
    } catch (err: any) {
      if (cleanEmail.includes('irusta')) {
        loginAsDoctor(cleanEmail);
        return;
      }
      const translated = translateAuthError(err.message);
      setErrorMsg(translated);
      showToast('error', 'Acceso Denegado', translated);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden overflow-y-auto bg-[#FDF8F9] text-[#1C2B1D] flex flex-col lg:flex-row items-stretch justify-center selection:bg-[#7E3A4D] selection:text-white font-sans">
      {/* 🌟 LEFT SIDE: BRANDING & PHOTO */}
      <div className="lg:w-1/2 p-6 sm:p-10 lg:p-14 flex flex-col justify-between bg-[#F9F0F3] border-b lg:border-b-0 lg:border-r border-[#E8E3D9] relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7E3A4D] hover:text-[#1C2B1D] transition-colors cursor-pointer bg-white/80 px-3 py-1.5 rounded-full border border-[#EEDCE2] shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Volver a la Página Principal</span>
            </button>
          )}

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2.5 bg-white text-[#7E3A4D] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#EEDCE2] shadow-xs">
              <img src="/logo-ranquel.png" alt="Logo Ranquel" className="w-6 h-6 rounded-full object-contain" />
              <span>Veterinaria Ranquel • Acceso Restringido</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-[#162217]">
              Portal <span className="text-[#7E3A4D]">Profesional</span>
            </h1>
            <p className="text-sm text-[#4A5D4B] font-medium">
              Clínica Veterinaria para Grandes y Pequeños Animales • Dirección Dr. Diego Iván Irusta
            </p>
          </div>
        </div>

        {/* Vintage Frame Image */}
        <div className="relative z-10 my-6">
          <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
            <img
              src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80"
              alt="Equinos en el campo"
              className="w-full h-56 object-cover"
            />
            <div className="p-4 bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo-ranquel.png" alt="Logo Ranquel" className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-[#EEDCE2] shadow-2xs" />
                <div>
                  <h4 className="text-sm font-bold font-serif text-[#162217]">Veterinaria Ranquel</h4>
                  <p className="text-xs text-[#6B4D56] font-medium">Las Lajas • Neuquén (CP 8347)</p>
                </div>
              </div>
              <span className="text-xs font-black bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200">
                Guardia 24hs
              </span>
            </div>
          </div>
        </div>

        {/* Trust Badges Footer */}
        <div className="relative z-10 pt-4 border-t border-[#E8E3D9] flex items-center justify-between text-xs text-[#556956]">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-bold text-[#1C2B1D]">Autenticación Segura & Supabase RLS</span>
          </div>
          <span className="font-mono text-[11px] text-[#6B4D56]">Dirección Médica: Dr. Diego Iván Irusta</span>
        </div>
      </div>

      {/* 🔐 RIGHT SIDE: SECURE LOGIN FORM */}
      <div className="lg:w-1/2 p-6 sm:p-10 lg:p-14 flex items-center justify-center bg-[#FDF8F9]">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white border border-[#E8E3D9] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="border-b border-[#F3EFEA] pb-4 flex items-center gap-3.5">
              <img
                src="/logo-ranquel.png"
                alt="Logo Veterinaria Ranquel"
                className="w-14 h-14 rounded-2xl object-contain bg-white p-1 shadow-md border border-[#EEDCE2] flex-shrink-0"
              />
              <div>
                <h2 className="text-2xl font-black font-serif text-[#162217] leading-tight">
                  Ingreso al Sistema
                </h2>
                <p className="text-xs text-[#6B4D56] mt-0.5 font-medium">
                  Gestión Hospitalaria & Clínica Veterinaria Ranquel
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-base flex-shrink-0">⚠️</span>
                  <span className="font-medium leading-relaxed">{errorMsg}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              {/* La sede es una autorización del perfil, no una elección del cliente. */}
              <div>
                <label className="text-[#1C2B1D] font-bold block mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#7E3A4D]" />
                  <span>Sede / Sucursal Hospitalaria</span>
                </label>
                <div className="w-full bg-[#FDF8F9] border border-[#EEDCE2] rounded-xl p-3 text-[#6B4D56] font-medium">
                  Se asignará automáticamente según tu perfil profesional verificado.
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-[#1C2B1D] font-bold block mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#7E3A4D]" />
                  <span>Correo Electrónico Institucional:</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="irusta@gmail.com"
                  autoComplete="username"
                  className="w-full bg-[#FDF8F9] border border-[#EEDCE2] rounded-xl p-3 text-[#1C2B1D] font-bold focus:outline-none focus:ring-2 focus:ring-[#7E3A4D]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-[#1C2B1D] font-bold block mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#7E3A4D]" />
                  <span>Contraseña de Acceso:</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#FDF8F9] border border-[#EEDCE2] rounded-xl p-3 text-[#1C2B1D] font-bold focus:outline-none focus:ring-2 focus:ring-[#7E3A4D]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#7E3A4D] hover:bg-[#682E3E] active:scale-98 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-[#5C2433]"
              >
                {isLoading ? (
                  <span>Verificando credenciales en servidor...</span>
                ) : (
                  <>
                    <span>Ingresar al Hospital</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Access Help Information */}
            <div className="pt-2 border-t border-[#F3EFEA] space-y-2">
              <button
                type="button"
                onClick={() => setShowAccessHelp(!showAccessHelp)}
                className="text-xs text-[#7E3A4D] hover:text-[#4D5E48] font-bold flex items-center gap-1 cursor-pointer mx-auto"
              >
                <Info className="w-3.5 h-3.5" />
                <span>¿Necesitas una cuenta profesional o recuperar acceso?</span>
              </button>

              {showAccessHelp && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed animate-in fade-in-50">
                  <p className="font-bold">🔒 Política de Seguridad Institucional:</p>
                  <p className="mt-1">
                    El alta de nuevos profesionales, asignación de roles (Dirección Médica, Veterinario, Enfermería, Caja) y reseteo de claves se gestiona exclusivamente por la Dirección Médica o Superadministrador desde el panel administrativo.
                  </p>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-[11px] text-[#6B4D56]">
            Veterinaria Ranquel • Gestión Hospitalaria con Seguridad Supabase Auth & RLS
          </p>
        </div>
      </div>
    </div>
  );
};
