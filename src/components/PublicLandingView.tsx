import React, { useState } from 'react';
import {
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  MessageCircle,
  Building2,
  Lock,
  ChevronRight,
  Compass,
  X,
  Send,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface PublicLandingViewProps {
  onOpenLogin?: () => void;
  onGoToLogin?: () => void;
}

export const WHATSAPP_NUMBER = '5492942477136';
export const WHATSAPP_DISPLAY = '+54 9 2942 47-7136';

export const WA_TURNO_MSG = 'Hola Veterinaria Irusta, quisiera solicitar un turno o consulta médica para mi mascota.';
export const WA_GUARDIA_MSG = 'Hola Veterinaria Irusta, tengo una urgencia veterinaria y necesito atención médica de guardia inmediata.';
export const WA_CAMPO_MSG = 'Hola Veterinaria Irusta, quisiera coordinar una visita a campo o consulta para equinos / animales de producción.';
export const WA_CONSULTA_MSG = 'Hola Veterinaria Irusta, quisiera hacer una consulta sobre sus servicios veterinarios.';

export const getWhatsAppLink = (message: string = WA_TURNO_MSG) => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({ onOpenLogin, onGoToLogin }) => {
  const [showWaModal, setShowWaModal] = useState(false);

  const handleOpenLogin = () => {
    triggerHaptic('light');
    if (onOpenLogin) handleOpenLogin();
    if (onGoToLogin) onGoToLogin();
  };

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-[#1C2B1D] font-sans antialiased selection:bg-[#5F7359] selection:text-white relative">
      {/* 🌾 TOP BANNER VINTAGE */}
      <div className="bg-[#5F7359] text-[#F9F8F5] py-2 px-4 sm:px-8 text-xs tracking-wide font-medium flex flex-wrap items-center justify-between gap-2 border-b border-[#4D5E48]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
          <span className="font-serif italic font-semibold">Guardia Veterinaria & Emergencias Médicas 24 Horas</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden sm:inline opacity-90">Río Cuarto • Buenos Aires</span>
          <a
            href={getWhatsAppLink(WA_GUARDIA_MSG)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-amber-200 hover:text-white underline font-bold transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp Guardia: {WHATSAPP_DISPLAY}</span>
          </a>
        </div>
      </div>

      {/* 🏛️ HEADER INSTITUCIONAL ELEGANTE */}
      <header className="sticky top-0 z-40 bg-[#F9F8F5]/95 backdrop-blur-md border-b border-[#E8E3D9] px-4 sm:px-8 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-[#5F7359] text-white flex items-center justify-center text-xl shadow-xs border-2 border-[#4D5E48]">
              🐴
            </div>
            <div>
              <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#8C6B43] block">
                Tradición & Medicina de Vanguardia
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-[#1C2B1D]">
                Veterinaria <span className="text-[#5F7359]">Irusta</span>
              </h1>
            </div>
          </div>

          {/* Quick Nav */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-[#556956] tracking-wider uppercase">
            <a href="#servicios" className="hover:text-[#1C2B1D] transition-colors">Especialidades</a>
            <a href="#equipo" className="hover:text-[#1C2B1D] transition-colors">Dirección Médica</a>
            <a href="#sedes" className="hover:text-[#1C2B1D] transition-colors">Sedes & Contacto</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2.5">
            <a
              href={getWhatsAppLink(WA_TURNO_MSG)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all border border-emerald-800"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Pedir Turno</span>
            </a>

            {/* CTA System Access */}
            <button
              onClick={() => {
                triggerHaptic('medium');
                handleOpenLogin();
              }}
              className="px-4 py-2 bg-[#5F7359] hover:bg-[#4D5E48] active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer border border-[#4D5E48]"
            >
              <Lock className="w-3.5 h-3.5 text-amber-200" />
              <span>Acceso al Sistema</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 HERO SECTION: VINTAGE CAMPO PREMIUM */}
      <section className="relative px-4 sm:px-8 pt-10 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Copy Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#EFECE3] text-[#6E502B] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#E0D9C8]">
              <Sparkles className="w-3.5 h-3.5 text-[#8C6B43]" />
              <span>Medicina Veterinaria de Excelencia • Río Cuarto & CABA</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-[#162217] leading-[1.12]">
              Clínica Veterinaria para Grandes y Pequeños Animales
            </h2>

            <p className="text-base sm:text-lg text-[#4A5D4B] font-medium leading-relaxed max-w-2xl">
              Medicina de alta complejidad a campo y hospital de urgencias 24 horas. Cuidado experto y compasivo para equinos, animales de producción y pequeños animales.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  handleOpenLogin();
                }}
                className="px-6 py-3.5 bg-[#5F7359] hover:bg-[#4D5E48] active:scale-98 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer border border-[#4D5E48]"
              >
                <span>Ingresar al Sistema Hospitalario</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowWaModal(true)}
                className="px-5 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer border border-emerald-800 active:scale-98"
              >
                <MessageCircle className="w-4 h-4 text-emerald-200" />
                <span>Solicitar Turno / Consulta (WhatsApp)</span>
              </button>
            </div>

            {/* Quick Access Badges for WhatsApp */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-[#6E502B]">Contacto Inmediato:</span>
              <a
                href={getWhatsAppLink(WA_TURNO_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-[11px] rounded-xl transition-colors shadow-2xs flex items-center gap-1"
              >
                <span>🩺 Turno Clínico</span>
              </a>
              <a
                href={getWhatsAppLink(WA_GUARDIA_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-red-50 hover:bg-red-100 border border-red-200 text-red-900 font-bold text-[11px] rounded-xl transition-colors shadow-2xs flex items-center gap-1"
              >
                <span>🚨 Urgencia 24hs</span>
              </a>
              <a
                href={getWhatsAppLink(WA_CAMPO_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-[#EFECE3] hover:bg-[#E2DDD0] border border-[#DDD7C8] text-[#5F7359] font-bold text-[11px] rounded-xl transition-colors shadow-2xs flex items-center gap-1"
              >
                <span>🐴 Equinos & Campo</span>
              </a>
            </div>

            {/* Heritage Highlights */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#E8E3D9]">
              <div>
                <span className="text-2xl font-black font-serif text-[#1C2B1D] block">+15.000</span>
                <span className="text-[11px] text-[#6E502B] font-semibold uppercase tracking-wider">Atenciones Médicas</span>
              </div>
              <div>
                <span className="text-2xl font-black font-serif text-[#1C2B1D] block">24 / 7</span>
                <span className="text-[11px] text-[#6E502B] font-semibold uppercase tracking-wider">Guardia Ininterrumpida</span>
              </div>
              <div>
                <span className="text-2xl font-black font-serif text-[#1C2B1D] block">100%</span>
                <span className="text-[11px] text-[#6E502B] font-semibold uppercase tracking-wider">Cuidado a Campo y Hospital</span>
              </div>
            </div>
          </div>

          {/* Gallery Column: Warm Rustic Elegance */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
              <img
                src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80"
                alt="Caballos al atardecer en el campo - Veterinaria Irusta"
                className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-200">Especialidad en Equinos & Campo</span>
                <h3 className="text-lg font-serif font-bold">Clínica, Traumatología & Rendimiento Deportivo</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="relative rounded-2xl overflow-hidden shadow-md border-3 border-white group">
                <img
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80"
                  alt="Perros en consulta veterinaria"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                  <span className="text-[10px] font-bold">Pequeños Animales</span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-md border-3 border-white group">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=80"
                  alt="Quirófano e imágenes veterinarias"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                  <span className="text-[10px] font-bold">Quirófano & UCI 24hs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌿 3 GRANDES PILARES DE ATENCIÓN */}
      <section id="servicios" className="py-14 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6B43]">Nuestros 3 Pilares Médicos</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#162217]">Cuidado Integral para Todo Tipo de Animales</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pilar 1: Grandes Animales */}
          <div className="bg-white rounded-3xl p-7 border border-[#E8E3D9] shadow-sm hover:border-[#5F7359] transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFECE3] text-[#5F7359] flex items-center justify-center text-2xl border border-[#DDD7C8]">
              🐴
            </div>
            <h3 className="text-xl font-serif font-bold text-[#162217]">Grandes Animales & Equinos</h3>
            <p className="text-xs text-[#556956] leading-relaxed">
              Atención a campo para caballos de deporte, polo y producción. Diagnóstico de claudicaciones, ecografía musculoesquelética, cirugía de cólicos, odontología y manejo reproductivo.
            </p>
            <div className="pt-2 border-t border-[#F3EFEA] text-xs text-[#5F7359] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Traslado e internación en boxes UCI</span>
            </div>
          </div>

          {/* Pilar 2: Pequeños Animales */}
          <div className="bg-white rounded-3xl p-7 border border-[#E8E3D9] shadow-sm hover:border-[#5F7359] transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFECE3] text-[#5F7359] flex items-center justify-center text-2xl border border-[#DDD7C8]">
              🐕
            </div>
            <h3 className="text-xl font-serif font-bold text-[#162217]">Pequeños Animales</h3>
            <p className="text-xs text-[#556956] leading-relaxed">
              Consultorios equipados para caninos y felinos. Planes de vacunación oficial, dermatología, cardiología, diagnóstico por imágenes y medicina preventiva personalizada.
            </p>
            <div className="pt-2 border-t border-[#F3EFEA] text-xs text-[#5F7359] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Caniles climatizados y cuidados intensivos</span>
            </div>
          </div>

          {/* Pilar 3: Hospital & Urgencias */}
          <div className="bg-white rounded-3xl p-7 border border-[#E8E3D9] shadow-sm hover:border-[#5F7359] transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#EFECE3] text-[#5F7359] flex items-center justify-center text-2xl border border-[#DDD7C8]">
              🏥
            </div>
            <h3 className="text-xl font-serif font-bold text-[#162217]">Hospital & Cirugía 24hs</h3>
            <p className="text-xs text-[#556956] leading-relaxed">
              Quirófano de urgencia con anestesia inhalatoria, radiología digital directa, ecografía Doppler y laboratorio bioquímico in situ con resultados en 20 minutos.
            </p>
            <div className="pt-2 border-t border-[#F3EFEA] text-xs text-[#5F7359] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Monitoreo multiparamétrico continuo</span>
            </div>
          </div>
        </div>
      </section>

      {/* 👨‍⚕️ DIRECCIÓN MÉDICA: DR. DIEGO IRUSTA */}
      <section id="equipo" className="bg-[#EFECE3] py-14 px-4 sm:px-8 border-y border-[#DDD7C8]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4">
            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80"
                alt="Dr. Diego Iván Irusta - Dirección Médica"
                className="w-full h-72 object-cover"
              />
              <div className="p-4 bg-white">
                <h4 className="text-base font-serif font-bold text-[#162217]">Dr. Diego Iván Irusta</h4>
                <p className="text-xs text-[#8C6B43] font-bold">Director Médico • M.P. 502</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8C6B43]">Compromiso & Tradición Médica</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#162217]">
              "Unimos la pasión del campo con la más alta rigurosidad hospitalaria"
            </h2>
            <p className="text-sm text-[#4A5D4B] leading-relaxed">
              En Veterinaria Irusta acompañamos a cada criador, propietario y familia con diagnósticos precisos, tecnología de avanzada y una atención compasiva e ininterrumpida las 24 horas del día.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  handleOpenLogin();
                }}
                className="px-5 py-3 bg-[#5F7359] hover:bg-[#4D5E48] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer border border-[#4D5E48]"
              >
                <span>Acceder a Historias Clínicas en VET SYSTEM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={getWhatsAppLink(WA_CONSULTA_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span>Contactar a Dirección Médica</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 📍 SEDES & CONTACTO */}
      <section id="sedes" className="py-14 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E8E3D9] shadow-xs space-y-3">
            <h3 className="text-base font-serif font-bold text-[#162217]">Sede Matriz Río Cuarto (Córdoba)</h3>
            <p className="text-xs text-[#556956]">Atención a campo, boxes de internación y clínica general.</p>
            <div className="space-y-1.5 text-xs text-[#4A5D4B] pt-2 border-t border-[#F3EFEA]">
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#5F7359]" /> <span>Río Cuarto, Córdoba (CP 5800)</span></div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <a href={getWhatsAppLink(WA_TURNO_MSG)} target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-bold hover:underline">
                  WhatsApp Central: {WHATSAPP_DISPLAY}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E8E3D9] shadow-xs space-y-3">
            <h3 className="text-base font-serif font-bold text-[#162217]">Hospital Central 24hs (Buenos Aires)</h3>
            <p className="text-xs text-[#556956]">Centro de alta complejidad, quirófano de urgencias y UCI continua.</p>
            <div className="space-y-1.5 text-xs text-[#4A5D4B] pt-2 border-t border-[#F3EFEA]">
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#5F7359]" /> <span>Av. Corrientes 4550, CABA / Av. Maipú 2140, Olivos</span></div>
              <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#5F7359]" /> <span>Guardia Médica 24 Horas Activa</span></div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <a href={getWhatsAppLink(WA_GUARDIA_MSG)} target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-bold hover:underline">
                  Línea de Urgencias: {WHATSAPP_DISPLAY}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📜 FOOTER VINTAGE */}
      <footer className="bg-[#1C2B1D] text-[#F9F8F5] py-10 px-4 sm:px-8 border-t border-[#121D13]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xl">🐴</span>
              <span className="text-base font-serif font-bold text-white">Veterinaria Irusta</span>
            </div>
            <p className="text-xs text-slate-300">
              Clínica Veterinaria para Grandes y Pequeños Animales • Río Cuarto & Buenos Aires
            </p>
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 text-xs text-emerald-400 font-bold">
              <MessageCircle className="w-3.5 h-3.5" />
              <a href={getWhatsAppLink(WA_TURNO_MSG)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                WhatsApp Oficial: {WHATSAPP_DISPLAY}
              </a>
            </div>
          </div>

          <button
            onClick={() => {
              triggerHaptic('medium');
              handleOpenLogin();
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Portal de Profesionales (Login)</span>
          </button>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-white/10 text-center text-[11px] text-slate-400">
          © 2026 Veterinaria Irusta • VET SYSTEM — Todos los derechos reservados.
        </div>
      </footer>

      {/* 💬 BOTÓN FLOTANTE WHATSAPP 24HS (ESQUINA INFERIOR DERECHA) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* Popover / Menú Rápido */}
        {showWaModal && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xl w-80 sm:w-96 space-y-3.5 animate-scale-up border-t-4 border-t-emerald-600">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs">
                  💬
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">Veterinaria Irusta</h4>
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>WhatsApp Oficial en Línea</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWaModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Seleccione la opción para enviar un mensaje directo a nuestro equipo con el texto preparado:
            </p>

            <div className="space-y-2">
              <a
                href={getWhatsAppLink(WA_TURNO_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-2 text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-2xs border border-emerald-100 font-bold">
                    🩺
                  </div>
                  <div>
                    <strong className="text-xs font-black text-slate-900 block group-hover:text-emerald-950">
                      Solicitar Turno / Consulta
                    </strong>
                    <span className="text-[10px] text-slate-500">Para caninos, felinos y chequeos generales</span>
                  </div>
                </div>
                <Send className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a
                href={getWhatsAppLink(WA_GUARDIA_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-2xl bg-red-50/60 hover:bg-red-100/80 border border-red-200 hover:border-red-300 transition-all flex items-center justify-between gap-2 text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white text-red-700 flex items-center justify-center shadow-2xs border border-red-200 font-bold">
                    🚨
                  </div>
                  <div>
                    <strong className="text-xs font-black text-red-950 block">
                      Guardia & Urgencias 24hs
                    </strong>
                    <span className="text-[10px] text-red-700 font-medium">Atención médica prioritaria inmediata</span>
                  </div>
                </div>
                <Send className="w-3.5 h-3.5 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a
                href={getWhatsAppLink(WA_CAMPO_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-2xl bg-amber-50/60 hover:bg-amber-100/80 border border-amber-200 hover:border-amber-300 transition-all flex items-center justify-between gap-2 text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white text-amber-800 flex items-center justify-center shadow-2xs border border-amber-200 font-bold">
                    🐴
                  </div>
                  <div>
                    <strong className="text-xs font-black text-amber-950 block">
                      Equinos & Visitas a Campo
                    </strong>
                    <span className="text-[10px] text-amber-800 font-medium">Caballos deportivos, polo y producción</span>
                  </div>
                </div>
                <Send className="w-3.5 h-3.5 text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a
                href={getWhatsAppLink(WA_CONSULTA_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-2.5 rounded-xl text-center text-xs font-bold text-slate-600 hover:text-emerald-800 hover:bg-slate-100 transition-colors block"
              >
                💬 Escribir mensaje libre por WhatsApp
              </a>
            </div>

            <div className="text-center pt-1 border-t border-slate-100">
              <span className="text-[10px] font-mono font-bold text-slate-500">
                Número Directo: {WHATSAPP_DISPLAY}
              </span>
            </div>
          </div>
        )}

        {/* Botón Principal Flotante */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('medium');
            setShowWaModal(!showWaModal);
          }}
          className="px-5 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-full shadow-2xl flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 border-2 border-white cursor-pointer group"
          title="Abrir opciones de WhatsApp"
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-emerald-600 animate-ping" />
          </div>
          <span className="font-sans tracking-wide">WhatsApp Guardia & Turnos</span>
        </button>
      </div>
    </div>
  );
};
