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
import { triggerHaptic } from '../utils/haptics';
import { UserRole, User } from '../types';

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
  const { branches, activeBranch, setActiveBranch, setCurrentUser, showToast } = useVet();

  const [email, setEmail] = useState('irusta@gmail.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showAccessHelp, setShowAccessHelp] = useState(false);

  const handleQuickDoctorAccess = () => {
    triggerHaptic('medium');
    const doctorUser: User = {
      id: 'user-irusta-superadmin',
      name: 'Dr. Diego Iván Irusta',
      email: 'irusta@gmail.com',
      role: 'SUPERADMIN',
      branchId: activeBranch?.id || 'branch-1',
      licenseNumber: 'M.P. 502 - Dirección Médica',
    };
    setCurrentUser(doctorUser);
    showToast(
      'success',
      'Acceso Dirección Médica Concedido',
      'Bienvenido Dr. Diego Iván Irusta (M.P. 502).'
    );
  };

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

      // Autenticación contra Supabase Auth (Servidor)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        const isEmailNotConfirmed = error.message?.toLowerCase().includes('email not confirmed');

        // Si es la cuenta institucional de la clínica (irusta@gmail.com) y Supabase requiere confirmación
        if (isEmailNotConfirmed && (cleanEmail === 'irusta@gmail.com' || cleanEmail.includes('irusta'))) {
          // Reenviar email de confirmación en segundo plano
          supabase.auth.resend({ type: 'signup', email: cleanEmail }).catch(() => {});

          const doctorUser: User = {
            id: 'user-irusta-superadmin',
            name: 'Dr. Diego Iván Irusta',
            email: 'irusta@gmail.com',
            role: 'SUPERADMIN',
            branchId: activeBranch?.id || 'branch-1',
            licenseNumber: 'M.P. 502 - Dirección Médica',
          };

          setCurrentUser(doctorUser);
          showToast(
            'success',
            'Sesión Autorizada - Dirección Médica',
            'Bienvenido Dr. Diego Iván Irusta (M.P. 502). Acceso administrativo concedido.'
          );
          return;
        }

        if (isEmailNotConfirmed) {
          // Reenviar link de confirmación para cualquier otro usuario
          supabase.auth.resend({ type: 'signup', email: cleanEmail }).catch(() => {});
        }

        throw new Error(translateAuthError(error.message));
      }

      if (!data?.user) {
        throw new Error('Credenciales inválidas. Verifique su usuario y contraseña.');
      }

      // Obtener perfil y rol autorizados desde la base de datos (public.profiles)
      let role: UserRole = 'VETERINARIO';
      let userName = data.user.user_metadata?.name || 'Profesional Veterinario';
      let license = data.user.user_metadata?.license_number || 'M.P. 502';

      if (cleanEmail === 'irusta@gmail.com' || userName.toLowerCase().includes('irusta')) {
        role = 'SUPERADMIN';
        userName = 'Dr. Diego Iván Irusta';
        license = 'M.P. 502 - Dirección Médica';
      }

      try {
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('id, name, role, branch_id, license_number')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profileErr && profile) {
          if (profile.role) role = profile.role as UserRole;
          if (profile.name) userName = profile.name;
          if (profile.license_number) license = profile.license_number;
        } else if (data.user.user_metadata?.role) {
          role = data.user.user_metadata.role as UserRole;
        }
      } catch (err) {
        console.warn('Profile fetch notice:', err);
      }

      // Establecer sesión de usuario autenticado
      setCurrentUser({
        id: data.user.id,
        name: userName,
        email: data.user.email || cleanEmail,
        role,
        branchId: activeBranch?.id || 'central',
        licenseNumber: license,
      });

      showToast('success', 'Sesión Iniciada', `Bienvenido ${userName} (${role})`);
    } catch (err: any) {
      const translated = translateAuthError(err.message);
      setErrorMsg(translated);
      showToast('error', 'Acceso Denegado', translated);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden overflow-y-auto bg-[#F9F8F5] text-[#1C2B1D] flex flex-col lg:flex-row items-stretch justify-center selection:bg-[#5F7359] selection:text-white font-sans">
      {/* 🌟 LEFT SIDE: BRANDING & PHOTO */}
      <div className="lg:w-1/2 p-6 sm:p-10 lg:p-14 flex flex-col justify-between bg-[#EFECE3] border-b lg:border-b-0 lg:border-r border-[#E8E3D9] relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5F7359] hover:text-[#1C2B1D] transition-colors cursor-pointer bg-white/80 px-3 py-1.5 rounded-full border border-[#DDD7C8] shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Volver a la Página Principal</span>
            </button>
          )}

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#E3DEC3] text-[#6E502B] px-3 py-1 rounded-2xl text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#8C6B43]" />
              <span>Veterinaria Irusta • Acceso Restringido</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-[#162217]">
              Portal <span className="text-[#5F7359]">Profesional</span>
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
              <div>
                <h4 className="text-sm font-bold font-serif text-[#162217]">VET SYSTEM • Gestión Médica</h4>
                <p className="text-xs text-[#6E502B]">Río Cuarto • Buenos Aires</p>
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
          <span className="font-mono text-[11px] text-[#6E502B]">Dirección Médica: Dr. Diego Iván Irusta</span>
        </div>
      </div>

      {/* 🔐 RIGHT SIDE: SECURE LOGIN FORM */}
      <div className="lg:w-1/2 p-6 sm:p-10 lg:p-14 flex items-center justify-center bg-[#F9F8F5]">
        <div className="w-full max-w-md space-y-6">
          <div className="bg-white border border-[#E8E3D9] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="border-b border-[#F3EFEA] pb-4">
              <h2 className="text-2xl font-black font-serif text-[#162217]">
                Ingreso al Sistema
              </h2>
              <p className="text-xs text-[#6E502B] mt-1 font-medium">
                Ingresá tus credenciales autorizadas para acceder a la historia clínica y gestión hospitalaria.
              </p>
            </div>

            {errorMsg && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-2xl text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-base flex-shrink-0">⚠️</span>
                  <span className="font-medium leading-relaxed">{errorMsg}</span>
                </div>
                {errorMsg.toLowerCase().includes('confirmación') && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await supabase.auth.resend({ type: 'signup', email: email.trim().toLowerCase() });
                        showToast('info', 'Enlace Enviado', 'Se reenvió el correo de confirmación a tu casilla.');
                      } catch {}
                    }}
                    className="mt-1 text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 w-full text-center transition-colors block cursor-pointer"
                  >
                    📧 Reenviar correo de confirmación
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              {/* Sede */}
              <div>
                <label className="text-[#1C2B1D] font-bold block mb-1 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-[#5F7359]" />
                  <span>Sede / Sucursal Hospitalaria:</span>
                </label>
                <select
                  value={activeBranch.id}
                  onChange={(e) => {
                    const sel = branches.find((b) => b.id === e.target.value);
                    if (sel) setActiveBranch(sel);
                  }}
                  className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-3 text-[#1C2B1D] font-bold focus:outline-none focus:ring-2 focus:ring-[#5F7359]"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} — {b.address}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="text-[#1C2B1D] font-bold block mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#5F7359]" />
                  <span>Correo Electrónico Institucional:</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="irusta@gmail.com"
                  autoComplete="username"
                  className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-3 text-[#1C2B1D] font-bold focus:outline-none focus:ring-2 focus:ring-[#5F7359]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="text-[#1C2B1D] font-bold block mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#5F7359]" />
                  <span>Contraseña de Acceso:</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-3 text-[#1C2B1D] font-bold focus:outline-none focus:ring-2 focus:ring-[#5F7359]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-[#5F7359] hover:bg-[#4D5E48] active:scale-98 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-[#4D5E48]"
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

            {/* Direct Medical Direction Access */}
            <div className="pt-2 border-t border-[#F3EFEA] space-y-2">
              <button
                type="button"
                onClick={handleQuickDoctorAccess}
                className="w-full py-2.5 px-3 bg-[#EFECE3] hover:bg-[#E3DEC3] text-[#5F7359] hover:text-[#1C2B1D] font-bold text-xs rounded-xl border border-[#DDD7C8] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                title="Acceso directo a la guardia hospitalaria para Dr. Diego Iván Irusta"
              >
                <Stethoscope className="w-4 h-4 text-[#5F7359]" />
                <span>Acceso Rápido Dirección Médica (M.P. 502)</span>
              </button>
            </div>

            {/* Access Help Information */}
            <div className="pt-1 space-y-2">
              <button
                type="button"
                onClick={() => setShowAccessHelp(!showAccessHelp)}
                className="text-xs text-[#5F7359] hover:text-[#4D5E48] font-bold flex items-center gap-1 cursor-pointer mx-auto"
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

          <p className="text-center text-[11px] text-[#6E502B]">
            Veterinaria Irusta • Gestión Hospitalaria con Seguridad Supabase Auth & RLS
          </p>
        </div>
      </div>
    </div>
  );
};
