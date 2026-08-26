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
  ChevronDown,
  Compass,
  X,
  Send,
  Calendar,
  AlertCircle,
  Award,
  Activity,
  Scissors,
  BedDouble,
  Microscope,
  Pill,
  Star,
  HelpCircle,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface PublicLandingViewProps {
  onOpenLogin?: () => void;
  onGoToLogin?: () => void;
}

export const WHATSAPP_NUMBER = '5492942477136';
export const WHATSAPP_DISPLAY = '+54 9 2942 47-7136';

export const WA_TURNO_MSG = 'Hola Veterinaria Ranquel, quisiera solicitar un turno o consulta médica para mi mascota.';
export const WA_GUARDIA_MSG = 'Hola Veterinaria Ranquel, tengo una urgencia veterinaria y necesito atención médica de guardia inmediata.';
export const WA_CAMPO_MSG = 'Hola Veterinaria Ranquel, quisiera coordinar una visita a campo o consulta para equinos / animales de producción.';
export const WA_CONSULTA_MSG = 'Hola Veterinaria Ranquel, quisiera hacer una consulta sobre sus servicios veterinarios.';

export const getWhatsAppLink = (message: string = WA_TURNO_MSG) => {
  return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
};

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({ onOpenLogin, onGoToLogin }) => {
  const [showWaModal, setShowWaModal] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleOpenLogin = () => {
    triggerHaptic('medium');
    if (onOpenLogin) onOpenLogin();
    if (onGoToLogin) onGoToLogin();
  };

  const toggleFaq = (index: number) => {
    triggerHaptic('light');
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: '¿Cómo puedo agendar un turno o consulta programada?',
      a: 'Puedes solicitar tu turno directamente a través de nuestro botón de WhatsApp oficial seleccionando la opción "Turno Clínico", o comunicándote al +54 9 2942 47-7136. Nuestro equipo coordinará el día y horario más conveniente.',
    },
    {
      q: '¿Cómo funciona la Guardia de Emergencias Médicas 24 Horas?',
      a: 'Contamos con médico veterinario activo y quirófano de urgencias disponible las 24 horas, los 365 días del año. Ante una urgencia o descompensación, puedes acudir de inmediato a nuestra clínica o contactar a la línea prioritaria de guardia por WhatsApp.',
    },
    {
      q: '¿Realizan atención y visitas a campo para equinos y hacienda?',
      a: 'Sí, disponemos de unidades móviles equipadas con ecografía musculoesquelética portátil, radiología digital, instrumental quirúrgico y odontológico para brindar atención a campo en cabañas de polo, haras, centros hípicos y establecimientos rurales.',
    },
    {
      q: '¿Qué equipamiento poseen para cirugías y cuidados críticos (UCI)?',
      a: 'Disponemos de quirófano de alta complejidad con máquina de anestesia inhalatoria, monitoreo multiparamétrico continuo (ECG, capnografía, presión arterial, oximetría), electrobisturí, boxes equinos acondicionados y caniles climatizados para internación con oxigenoterapia y fluidoterapia continua.',
    },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] w-full max-w-full overflow-x-hidden overflow-y-auto bg-[#FDF8F9] text-[#26141A] font-sans antialiased selection:bg-[#7E3A4D] selection:text-white relative">
      {/* TOP BANNER DE GUARDIA 24HS */}
      <div className="bg-[#2C161D] text-[#FDF8F9] py-2 px-4 sm:px-8 text-xs tracking-wide font-medium flex flex-wrap items-center justify-between gap-2 border-b border-[#1E0D13]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-xs" />
          <span className="font-serif italic font-semibold text-[#FDF0F3]">Guardia Veterinaria & Emergencias Médicas 24 Horas Activa</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden sm:inline text-rose-100/90">Río Cuarto, Córdoba • Buenos Aires</span>
          <a
            href={getWhatsAppLink(WA_GUARDIA_MSG)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-rose-200 hover:text-white font-bold transition-colors underline"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>WhatsApp Guardia: {WHATSAPP_DISPLAY}</span>
          </a>
        </div>
      </div>

      {/* HEADER INSTITUCIONAL ELEGANTE */}
      <header className="sticky top-0 z-40 bg-[#FDF8F9]/95 backdrop-blur-md border-b border-[#EEDCE2] px-4 sm:px-8 py-3.5 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#7E3A4D] text-white flex items-center justify-center text-xl shadow-md border-2 border-[#5C2433]">
              🐴
            </div>
            <div>
              <span className="text-[10px] tracking-[0.22em] uppercase font-black text-[#94465B] block">
                Grandes y Pequeños Animales
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-[#26141A]">
                Veterinaria <span className="text-[#7E3A4D]">Ranquel</span>
              </h1>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-[#6B4D56] tracking-wider uppercase">
            <a href="#especialidades" className="hover:text-[#7E3A4D] transition-colors">Especialidades</a>
            <a href="#equinos" className="hover:text-[#7E3A4D] transition-colors">Equinos & Campo</a>
            <a href="#hospital" className="hover:text-[#7E3A4D] transition-colors">Hospital & UCI</a>
            <a href="#direccion" className="hover:text-[#7E3A4D] transition-colors">Dirección Médica</a>
            <a href="#faq" className="hover:text-[#7E3A4D] transition-colors">Preguntas</a>
            <a href="#sedes" className="hover:text-[#7E3A4D] transition-colors">Sedes</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            <a
              href={getWhatsAppLink(WA_TURNO_MSG)}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all border border-emerald-800 active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Pedir Turno</span>
            </a>

            <button
              onClick={handleOpenLogin}
              className="px-4 py-2 bg-[#7E3A4D] hover:bg-[#682E3E] active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer border border-[#5C2433]"
            >
              <Lock className="w-3.5 h-3.5 text-rose-200" />
              <span>Acceso al Sistema</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative px-4 sm:px-8 pt-10 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Main Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#F9F0F3] text-[#7E3A4D] px-4 py-1.5 rounded-full text-xs font-bold border border-[#EEDCE2]">
              <Sparkles className="w-3.5 h-3.5 text-[#94465B]" />
              <span>Centro Médico Veterinario de Excelencia • Río Cuarto & CABA</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-[#26141A] leading-[1.12]">
              Clínica Veterinaria Ranquel
            </h2>

            <p className="text-base sm:text-lg text-[#5A3F47] font-medium leading-relaxed max-w-2xl">
              Medicina de alta complejidad para <strong>Grandes y Pequeños Animales</strong>. Especialistas en clínica y cirugía equina a campo, cuidados críticos 24 horas, diagnóstico por imágenes y atención compasiva para cada paciente.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={handleOpenLogin}
                className="px-6 py-3.5 bg-[#7E3A4D] hover:bg-[#682E3E] active:scale-95 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer border border-[#5C2433]"
              >
                <span>Ingresar al Sistema Hospitalario</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowWaModal(true)}
                className="px-5 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer border border-emerald-800 active:scale-95"
              >
                <MessageCircle className="w-4 h-4 text-emerald-200" />
                <span>Solicitar Turno / Consulta (WhatsApp)</span>
              </button>
            </div>

            {/* Quick Access Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-[#6B4D56]">Atención Rápida:</span>
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
                className="px-3 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 font-bold text-[11px] rounded-xl transition-colors shadow-2xs flex items-center gap-1"
              >
                <span>🚨 Urgencia 24hs</span>
              </a>
              <a
                href={getWhatsAppLink(WA_CAMPO_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-[#F9F0F3] hover:bg-[#F3E3E7] border border-[#EEDCE2] text-[#7E3A4D] font-bold text-[11px] rounded-xl transition-colors shadow-2xs flex items-center gap-1"
              >
                <span>🐴 Equinos & Campo</span>
              </a>
            </div>

            {/* Stats Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#EEDCE2]">
              <div>
                <span className="text-2xl sm:text-3xl font-black font-serif text-[#26141A] block">+15.000</span>
                <span className="text-[11px] text-[#7E3A4D] font-bold uppercase tracking-wider">Atenciones Médicas</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-serif text-[#26141A] block">24 / 7</span>
                <span className="text-[11px] text-[#7E3A4D] font-bold uppercase tracking-wider">Guardia Médica Activa</span>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black font-serif text-[#26141A] block">100%</span>
                <span className="text-[11px] text-[#7E3A4D] font-bold uppercase tracking-wider">Equipamiento Propio</span>
              </div>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white group">
              <img
                src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80"
                alt="Caballos en el campo - Veterinaria Ranquel"
                className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0F]/80 via-[#1A0A0F]/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-200">Especialidad en Equinos & Producción</span>
                <h3 className="text-lg font-serif font-bold text-[#FDF8F9]">Medicina Deportiva, Claudicaciones & Cirugía a Campo</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div className="relative rounded-2xl overflow-hidden shadow-md border-3 border-white group">
                <img
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80"
                  alt="Perros en consulta médica - Veterinaria Ranquel"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0F]/75 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                  <span className="text-[11px] font-bold text-[#FDF8F9]">Pequeños Animales</span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-md border-3 border-white group">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=80"
                  alt="Quirófano e imágenes - Veterinaria Ranquel"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0F]/75 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                  <span className="text-[11px] font-bold text-[#FDF8F9]">Quirófano & UCI 24hs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS & ESPECIALIDADES CLÍNICAS */}
      <section id="especialidades" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#94465B]">Excelencia Médica Multidisciplinaria</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#26141A]">Servicios y Especialidades de Veterinaria Ranquel</h2>
          <p className="text-xs sm:text-sm text-[#6B4D56] font-medium">Infraestructura hospitalaria de avanzada y atención médica integral para cada necesidad.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-7 border border-[#EEDCE2] shadow-xs hover:border-[#7E3A4D] hover:shadow-md transition-all space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F9F0F3] text-[#7E3A4D] flex items-center justify-center text-2xl border border-[#EEDCE2]">
              🐴
            </div>
            <h3 className="text-lg font-serif font-bold text-[#26141A]">Grandes Animales & Equinos</h3>
            <p className="text-xs text-[#5A3F47] leading-relaxed">
              Atención a campo para caballos de polo, salto, carrera y trabajo. Diagnóstico de claudicaciones, ecografía musculoesquelética, cirugía de cólicos, odontología y manejo reproductivo.
            </p>
            <div className="pt-2 border-t border-[#F9F0F3] text-xs text-[#7E3A4D] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Traslado e internación en boxes UCI</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-7 border border-[#EEDCE2] shadow-xs hover:border-[#7E3A4D] hover:shadow-md transition-all space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F9F0F3] text-[#7E3A4D] flex items-center justify-center text-2xl border border-[#EEDCE2]">
              🐕
            </div>
            <h3 className="text-lg font-serif font-bold text-[#26141A]">Clínica de Pequeños Animales</h3>
            <p className="text-xs text-[#5A3F47] leading-relaxed">
              Consultorios equipados para caninos y felinos. Planes de vacunación oficial, desparasitación, dermatología, cardiología, gastroenterología y medicina preventiva integral.
            </p>
            <div className="pt-2 border-t border-[#F9F0F3] text-xs text-[#7E3A4D] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Caniles climatizados y cuidados intensivos</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-7 border border-[#EEDCE2] shadow-xs hover:border-[#7E3A4D] hover:shadow-md transition-all space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F9F0F3] text-[#7E3A4D] flex items-center justify-center text-2xl border border-[#EEDCE2]">
              ✂️
            </div>
            <h3 className="text-lg font-serif font-bold text-[#26141A]">Quirófano & Cirugía Compleja</h3>
            <p className="text-xs text-[#5A3F47] leading-relaxed">
              Cirugía general, traumatología y ortopedia, tejidos blandos y urgencias. Anestesia inhalatoria con monitoreo multiparamétrico y recuperación supervisada.
            </p>
            <div className="pt-2 border-t border-[#F9F0F3] text-xs text-[#7E3A4D] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Monitoreo multiparamétrico continuo</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-7 border border-[#EEDCE2] shadow-xs hover:border-[#7E3A4D] hover:shadow-md transition-all space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F9F0F3] text-[#7E3A4D] flex items-center justify-center text-2xl border border-[#EEDCE2]">
              🛏️
            </div>
            <h3 className="text-lg font-serif font-bold text-[#26141A]">Internación & Guardia UCI 24hs</h3>
            <p className="text-xs text-[#5A3F47] leading-relaxed">
              Atención médica continua y monitoreo intensivo las 24 horas. Terapia de fluidos endovenosa, oxigenoterapia, analgesia multimodal y cuidados postquirúrgicos.
            </p>
            <div className="pt-2 border-t border-[#F9F0F3] text-xs text-[#7E3A4D] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Presencia médica ininterrumpida</span>
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white rounded-3xl p-7 border border-[#EEDCE2] shadow-xs hover:border-[#7E3A4D] hover:shadow-md transition-all space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F9F0F3] text-[#7E3A4D] flex items-center justify-center text-2xl border border-[#EEDCE2]">
              🔬
            </div>
            <h3 className="text-lg font-serif font-bold text-[#26141A]">Imágenes & Laboratorio Propio</h3>
            <p className="text-xs text-[#5A3F47] leading-relaxed">
              Radiología digital directa de alta definición, ecografía Doppler color y análisis bioquímicos de urgencia con resultados en minutos para diagnóstico certero.
            </p>
            <div className="pt-2 border-t border-[#F9F0F3] text-xs text-[#7E3A4D] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Informes digitales inmediatos</span>
            </div>
          </div>

          {/* Card 6 */}
          <div className="bg-white rounded-3xl p-7 border border-[#EEDCE2] shadow-xs hover:border-[#7E3A4D] hover:shadow-md transition-all space-y-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#F9F0F3] text-[#7E3A4D] flex items-center justify-center text-2xl border border-[#EEDCE2]">
              💊
            </div>
            <h3 className="text-lg font-serif font-bold text-[#26141A]">Farmacia Veterinaria Oficial</h3>
            <p className="text-xs text-[#5A3F47] leading-relaxed">
              Dispensación de medicamentos veterinarios, biológicos bajo cadena de frío, psicotrópicos controlados, antiparasitarios y alimentos terapéuticos formulados.
            </p>
            <div className="pt-2 border-t border-[#F9F0F3] text-xs text-[#7E3A4D] font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trazabilidad y seguridad farmacológica</span>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECCIÓN MÉDICA: DR. DIEGO IRUSTA */}
      <section id="direccion" className="bg-[#F6E8ED] py-16 px-4 sm:px-8 border-y border-[#EEDCE2]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4">
            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80"
                alt="Dr. Diego Iván Irusta - Dirección Médica Veterinaria Ranquel"
                className="w-full h-80 object-cover"
              />
              <div className="p-4 bg-white">
                <h4 className="text-base font-serif font-bold text-[#26141A]">Dr. Diego Iván Irusta</h4>
                <p className="text-xs text-[#94465B] font-bold">Director Médico • Matrícula Profesional: M.P. 502</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#94465B]">Compromiso & Tradición Médica</span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#26141A] leading-snug">
              "En Veterinaria Ranquel unimos la pasión y la experiencia del campo con la más alta rigurosidad hospitalaria"
            </h2>
            <p className="text-sm text-[#5A3F47] leading-relaxed">
              Acompañamos a cada criador, propietario y familia con diagnósticos precisos, tecnología de avanzada y una atención médica compasiva e ininterrumpida las 24 horas del día.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={handleOpenLogin}
                className="px-5 py-3 bg-[#7E3A4D] hover:bg-[#682E3E] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer border border-[#5C2433] active:scale-95"
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

      {/* PREGUNTAS FRECUENTES (FAQ) */}
      <section id="faq" className="py-16 px-4 sm:px-8 max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#94465B]">Respuestas a tus Consultas</span>
          <h2 className="text-3xl font-serif font-black text-[#26141A]">Preguntas Frecuentes</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#EEDCE2] overflow-hidden shadow-2xs transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 font-bold text-xs sm:text-sm text-[#26141A] cursor-pointer hover:bg-[#FDF8F9] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={'w-4 h-4 text-[#7E3A4D] transition-transform duration-200 ' + (isOpen ? 'rotate-180' : '')} />
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-[#5A3F47] leading-relaxed border-t border-[#F9F0F3] animate-in fade-in-50">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SEDES & CONTACTO */}
      <section id="sedes" className="py-14 px-4 sm:px-8 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#EEDCE2] shadow-xs space-y-3">
            <h3 className="text-base font-serif font-bold text-[#26141A]">Sede Matriz Río Cuarto (Córdoba)</h3>
            <p className="text-xs text-[#6B4D56]">Atención médica a campo, boxes de internación y clínica general.</p>
            <div className="space-y-1.5 text-xs text-[#5A3F47] pt-2 border-t border-[#F9F0F3]">
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#7E3A4D]" /> <span>Río Cuarto, Córdoba (CP 5800)</span></div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <a href={getWhatsAppLink(WA_TURNO_MSG)} target="_blank" rel="noopener noreferrer" className="text-emerald-800 font-bold hover:underline">
                  WhatsApp Central: {WHATSAPP_DISPLAY}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#EEDCE2] shadow-xs space-y-3">
            <h3 className="text-base font-serif font-bold text-[#26141A]">Hospital Central 24hs (Buenos Aires)</h3>
            <p className="text-xs text-[#6B4D56]">Centro de alta complejidad, quirófano de urgencias y UCI continua.</p>
            <div className="space-y-1.5 text-xs text-[#5A3F47] pt-2 border-t border-[#F9F0F3]">
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#7E3A4D]" /> <span>Av. Corrientes 4550, CABA / Av. Maipú 2140, Olivos</span></div>
              <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#7E3A4D]" /> <span>Guardia Médica 24 Horas Activa</span></div>
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

      {/* FOOTER INSTITUCIONAL */}
      <footer className="bg-[#2C161D] text-[#FDF8F9] py-10 px-4 sm:px-8 border-t border-[#1E0D13]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xl">🐴</span>
              <span className="text-base font-serif font-bold text-white">Veterinaria Ranquel</span>
            </div>
            <p className="text-xs text-rose-200/80">
              Clínica Veterinaria para Grandes y Pequeños Animales • Río Cuarto & Buenos Aires
            </p>
            <p className="text-[11px] text-[#E8A5B8] font-mono">
              Dirección Médica: Dr. Diego Iván Irusta (M.P. 502)
            </p>
            <div className="pt-1 flex items-center justify-center sm:justify-start gap-2 text-xs text-emerald-400 font-bold">
              <MessageCircle className="w-3.5 h-3.5" />
              <a href={getWhatsAppLink(WA_TURNO_MSG)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                WhatsApp Oficial: {WHATSAPP_DISPLAY}
              </a>
            </div>
          </div>

          <button
            onClick={handleOpenLogin}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Portal de Profesionales (Login)</span>
          </button>
        </div>
        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-white/10 text-center text-[11px] text-rose-200/60">
          © 2026 Veterinaria Ranquel • VET SYSTEM — Todos los derechos reservados.
        </div>
      </footer>

      {/* BOTÓN FLOTANTE WHATSAPP 24HS */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {showWaModal && (
          <div className="bg-white rounded-3xl p-5 border border-[#EEDCE2] shadow-2xl w-80 sm:w-96 space-y-3.5 animate-scale-up border-t-4 border-t-emerald-600">
            <div className="flex items-start justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs">
                  💬
                </div>
                <div>
                  <h4 className="text-sm font-black text-[#26141A]">Veterinaria Ranquel</h4>
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

            <p className="text-xs text-[#5A3F47] font-medium">
              Seleccione la opción para enviar un mensaje directo a nuestro equipo con el texto preparado:
            </p>

            <div className="space-y-2">
              <a
                href={getWhatsAppLink(WA_TURNO_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-2xl bg-[#FDF8F9] hover:bg-emerald-50 border border-[#EEDCE2] hover:border-emerald-300 transition-all flex items-center justify-between gap-2 text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-2xs border border-emerald-100 font-bold">
                    🩺
                  </div>
                  <div>
                    <strong className="text-xs font-black text-[#26141A] block group-hover:text-emerald-950">
                      Solicitar Turno / Consulta
                    </strong>
                    <span className="text-[10px] text-[#8A5E6A]">Para caninos, felinos y chequeos generales</span>
                  </div>
                </div>
                <Send className="w-3.5 h-3.5 text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a
                href={getWhatsAppLink(WA_GUARDIA_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-2xl bg-rose-50/70 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 transition-all flex items-center justify-between gap-2 text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white text-rose-700 flex items-center justify-center shadow-2xs border border-rose-200 font-bold">
                    🚨
                  </div>
                  <div>
                    <strong className="text-xs font-black text-rose-950 block">
                      Guardia & Urgencias 24hs
                    </strong>
                    <span className="text-[10px] text-rose-700 font-medium">Atención médica prioritaria inmediata</span>
                  </div>
                </div>
                <Send className="w-3.5 h-3.5 text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a
                href={getWhatsAppLink(WA_CAMPO_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-3 rounded-2xl bg-[#F9F0F3] hover:bg-[#F3E3E7] border border-[#EEDCE2] hover:border-rose-300 transition-all flex items-center justify-between gap-2 text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white text-[#7E3A4D] flex items-center justify-center shadow-2xs border border-[#EEDCE2] font-bold">
                    🐴
                  </div>
                  <div>
                    <strong className="text-xs font-black text-[#26141A] block">
                      Equinos & Visitas a Campo
                    </strong>
                    <span className="text-[10px] text-[#7E3A4D] font-medium">Caballos deportivos, polo y producción</span>
                  </div>
                </div>
                <Send className="w-3.5 h-3.5 text-[#7E3A4D] opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a
                href={getWhatsAppLink(WA_CONSULTA_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-2.5 rounded-xl text-center text-xs font-bold text-[#6B4D56] hover:text-emerald-800 hover:bg-[#F9F0F3] transition-colors block"
              >
                💬 Escribir mensaje libre por WhatsApp
              </a>
            </div>

            <div className="text-center pt-1 border-t border-rose-100">
              <span className="text-[10px] font-mono font-bold text-[#8A5E6A]">
                Número Directo: {WHATSAPP_DISPLAY}
              </span>
            </div>
          </div>
        )}

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
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-400 border-2 border-emerald-600 animate-ping" />
          </div>
          <span className="font-sans tracking-wide">WhatsApp Guardia & Turnos</span>
        </button>
      </div>
    </div>
  );
};