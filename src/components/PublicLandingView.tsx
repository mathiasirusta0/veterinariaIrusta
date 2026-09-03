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
  User,
  AlertTriangle,
  FileText,
  CreditCard,
  Truck,
  Heart,
  PawPrint,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface PublicLandingViewProps {
  onOpenLogin?: () => void;
  onGoToLogin?: () => void;
}

export const WHATSAPP_NUMBER = '5492942477136';
export const WHATSAPP_DISPLAY = '+54 9 2942 47-7136';
export const EMERGENCY_PHONE = '+5492942477136';

// Preformatted WhatsApp messages
export const WA_TURNO_MSG = 'Hola Veterinaria Ranquel, quisiera solicitar un turno para mi mascota/animal. Mi nombre es:';
export const WA_GUARDIA_MSG = '🚨 urgencia veterinaria: Tengo un paciente en situación crítica. Solicito asistencia inmediata.';
export const WA_CAMPO_MSG = 'Hola Dr. Irusta, solicito una visita a campo para equinos/grandes animales en la zona de:';
export const WA_CONSULTA_MSG = 'Hola Veterinaria Ranquel, quisiera realizar una consulta sobre:';
export const WA_EQUINOS_MSG = WA_CAMPO_MSG;
export const WA_CIRUGIA_MSG = 'Hola, quisiera realizar una consulta prequirúrgica / presupuesto de cirugía para:';

export const getWhatsAppLink = (message: string = WA_TURNO_MSG) => {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

// Real Animal Photography Assets
const ANIMAL_PHOTOS = {
  horseHero: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=800&auto=format&fit=crop&q=80',
  dogHero: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=800&auto=format&fit=crop&q=80',
  catHero: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80',
  horseField: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
  surgery: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800&auto=format&fit=crop&q=80',
  consultation: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&auto=format&fit=crop&q=80',
};

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  onOpenLogin,
  onGoToLogin,
}) => {
  const [showWaModal, setShowWaModal] = useState(false);
  const [waPetName, setWaPetName] = useState('');
  const [waSpecies, setWaSpecies] = useState('Canino');
  const [waReason, setWaReason] = useState('');
  const [waPreferredTime, setWaPreferredTime] = useState('Mañana');

  // Active Species Showcase Tab in Hero
  const [activeAnimalTab, setActiveAnimalTab] = useState<'PERROS' | 'GATOS' | 'CABALLOS'>('CABALLOS');

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleOpenLogin = () => {
    triggerHaptic('medium');
    if (onGoToLogin) onGoToLogin();
    else if (onOpenLogin) onOpenLogin();
  };

  const handleSendCustomWa = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    const fullMsg = `Hola Veterinaria Ranquel! Quisiera solicitar un turno.\n\n• Paciente: ${waPetName || 'Mascota'} (${waSpecies})\n• Motivo: ${waReason || 'Control de salud general'}\n• Horario de preferencia: ${waPreferredTime}`;
    window.open(getWhatsAppLink(fullMsg), '_blank');
    setShowWaModal(false);
  };

  const coreServices = [
    {
      icon: Stethoscope,
      title: 'Clínica de Pequeños Animales',
      subtitle: 'Caninos & Felinos',
      description: 'Consultas clínicas completas, controles pediátricos y geriátricos, chequeos de salud integral y seguimiento médico cercano.',
      badge: 'Atención con y sin turno',
      photo: ANIMAL_PHOTOS.dogHero,
      linkMsg: WA_TURNO_MSG,
    },
    {
      icon: Compass,
      title: 'Medicina Equina & Atención a Campo',
      subtitle: 'Estancias & Haras de Neuquén',
      description: 'Atención veterinaria integral a campo en Las Lajas, Zapala y zona rural. Evaluación y manejo de cólicos, odontología equina, traumatología y medicina preventiva.',
      badge: 'Servicio a Campo',
      photo: ANIMAL_PHOTOS.horseField,
      linkMsg: WA_EQUINOS_MSG,
    },
    {
      icon: Scissors,
      title: 'Cirugía General & Procedimientos',
      subtitle: 'Cirugías Programadas y Curaciones',
      description: 'Esterilizaciones y castraciones, resolución de heridas y suturas traumáticas, cirugía de tejidos blandos y manejo pre y posoperatorio seguro.',
      badge: 'Cirugía Veterinaria',
      photo: ANIMAL_PHOTOS.surgery,
      linkMsg: WA_CIRUGIA_MSG,
    },
    {
      icon: HeartPulse,
      title: 'Primera Intervención & Estabilización',
      subtitle: 'Atención de Urgencia Ambulatoria',
      description: 'Recepción y triage de urgencias, estabilización hemodinámica inicial, control del dolor, fluidoterapia de rescate y primeras curaciones.',
      badge: 'Urgencias & Primeros Auxilios',
      photo: ANIMAL_PHOTOS.catHero,
      linkMsg: WA_GUARDIA_MSG,
    },
    {
      icon: ShieldCheck,
      title: 'Medicina Preventiva & Inmunización',
      subtitle: 'Vacunación & Desparasitación',
      description: 'Planes de vacunación oficial para cachorros y adultos, desparasitaciones internas y externas periódicas y asesoramiento de nutrición clínica.',
      badge: 'Prevención Sanitaria',
      photo: ANIMAL_PHOTOS.consultation,
      linkMsg: WA_TURNO_MSG,
    },
    {
      icon: Pill,
      title: 'Farmacia Veterinaria & SENASA',
      subtitle: 'Fármacos & Prescripción Oficial',
      description: 'Dispensación responsable de tratamientos y prescripción bajo recetario oficial SENASA (Ley 27.233). Antibioticoterapia y analgésicos.',
      badge: 'Normativa Oficial SENASA',
      photo: ANIMAL_PHOTOS.horseHero,
      linkMsg: WA_TURNO_MSG,
    },
  ];

  const faqs = [
    {
      q: '¿Cómo solicito un turno en Veterinaria Ranquel?',
      a: 'Podés solicitar tu turno directamente por nuestro WhatsApp oficial (+54 9 2942 47-7136). Solo necesitás indicarnos tu nombre, el nombre de tu mascota/animal, especie y el motivo de consulta.',
    },
    {
      q: '¿Cómo debo proceder ante una urgencia veterinaria?',
      a: 'Ante una urgencia, te recomendamos llamar directamente al +54 9 2942 47-7136 antes de acudir a la clínica. De esta manera, el equipo médico puede preparar la sala de primera intervención y el equipamiento necesario para estabilizar y atender al paciente de inmediato.',
    },
    {
      q: '¿Qué áreas de cobertura tienen para atención equina y grandes animales?',
      a: 'El Dr. Diego Iván Irusta realiza visitas médicas a campo en Las Lajas, Zapala y zona centro/cordillera de Neuquén, asistiendo a establecimientos ganaderos, estancias y haras.',
    },
    {
      q: '¿Cuáles son los medios de pago aceptados y cómo se presupuestan las cirugías?',
      a: 'Aceptamos pagos en efectivo, transferencias bancarias y tarjetas. Para intervenciones quirúrgicas o tratamientos complejos, emitimos un presupuesto clínico detallado y oficial por escrito con validez de 15 días.',
    },
    {
      q: '¿Qué cuidados o preparación se requiere antes de una cirugía programada?',
      a: 'Generalmente se requiere ayuno sólido de 8 a 12 horas y ayuno líquido de 2 horas (según especie y edad), además de los estudios prequirúrgicos solicitados por el profesional en la consulta previa.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FCF8F9] text-[#26141A] font-sans antialiased selection:bg-[#E8A5B8] selection:text-[#26141A]">
      {/* 🚨 TOP EMERGENCY STRIP */}
      <div className="bg-[#7E3A4D] text-[#FFF5F7] px-4 py-2 text-xs font-semibold flex flex-wrap items-center justify-between gap-2 shadow-xs border-b border-[#632C3B]">
        <div className="flex items-center gap-2 max-w-full truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="font-bold tracking-wide uppercase text-[10px] sm:text-xs">
            Atención Médica Veterinaria por Consulta — Las Lajas, Neuquén
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <a
            href={`tel:${EMERGENCY_PHONE}`}
            className="flex items-center gap-1.5 bg-teal-800/90 hover:bg-teal-700 text-white font-bold px-2.5 py-0.5 rounded-lg border border-teal-600 transition-colors"
            title="Llamar para Consultas"
          >
            <Phone className="w-3 h-3 text-white" />
            <span>Consultas: {WHATSAPP_DISPLAY}</span>
          </a>
          <button
            onClick={handleOpenLogin}
            className="hidden md:flex items-center gap-1 text-[#F7D2DC] hover:text-white transition-colors cursor-pointer text-[11px]"
          >
            <Lock className="w-3 h-3" />
            <span>Acceso al Sistema Profesional</span>
          </button>
        </div>
      </div>

      {/* TOP NAVIGATION BAR */}
      <nav className="bg-[#FAF0F3]/95 backdrop-blur-md sticky top-0 z-40 border-b border-[#EEDCE2] px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <img
              src="/logo-ranquel.png"
              alt="Logo Veterinaria Ranquel"
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl object-contain bg-white p-1 border border-[#EEDCE2] shadow-xs group-hover:scale-105 transition-transform flex-shrink-0"
            />
            <div>
              <span className="font-display font-extrabold text-lg sm:text-xl text-[#26141A] tracking-tight block leading-tight">
                Veterinaria Ranquel
              </span>
              <span className="text-[10px] font-bold text-[#7E3A4D] tracking-wider uppercase block">
                Dr. Diego Iván Irusta • M.P. 502
              </span>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-xs font-bold text-[#5A3F47]">
            <a href="#servicios" className="hover:text-[#7E3A4D] transition-colors">Servicios</a>
            <a href="#urgencias" className="hover:text-[#7E3A4D] transition-colors">Urgencias</a>
            <a href="#equinos" className="hover:text-[#7E3A4D] transition-colors">Equinos & Campo</a>
            <a href="#direccion-medica" className="hover:text-[#7E3A4D] transition-colors">Dirección Médica</a>
            <a href="#sedes" className="hover:text-[#7E3A4D] transition-colors">Sede Las Lajas</a>
            <a href="#preguntas" className="hover:text-[#7E3A4D] transition-colors">Preguntas</a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={getWhatsAppLink(WA_TURNO_MSG)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Pedir Turno</span>
            </a>

            <a
              href={`tel:${EMERGENCY_PHONE}`}
              className="hidden sm:flex px-3.5 py-2 bg-[#7E3A4D] hover:bg-[#632C3B] text-white text-xs font-bold rounded-xl items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Phone className="w-3.5 h-3.5 text-rose-200" />
              <span>Contacto Telefónico</span>
            </a>

            <button
              onClick={handleOpenLogin}
              className="lg:hidden p-2 text-[#7E3A4D] hover:bg-[#F7EBEF] rounded-xl transition-colors cursor-pointer"
              title="Acceso al Portal Profesional"
              aria-label="Acceso al Portal Profesional"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION WITH REAL ANIMAL PHOTOGRAPHY SHOWCASE */}
      <section className="relative pt-10 pb-16 px-4 sm:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-[#F7EBEF] border border-[#EEDCE2] text-[#7E3A4D] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#7E3A4D]" />
              <span>Medicina Veterinaria en Las Lajas, Neuquén</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-[#26141A] tracking-tight leading-[1.12]">
              Veterinaria en Las Lajas para Pequeños Animales, Equinos y Atención a Campo
            </h1>

            <p className="text-sm sm:text-base text-[#6B4D56] max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Consultas clínicas, cirugía general, primera intervención de urgencia y planes sanitarios para pequeños y grandes animales. Atención médica integral con respaldo ético y profesional bajo la dirección médica del <strong>Dr. Diego Iván Irusta (M.P. 502)</strong>.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <a
                href={getWhatsAppLink(WA_TURNO_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Pedir Turno por WhatsApp</span>
              </a>

              <a
                href={`tel:${EMERGENCY_PHONE}`}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#7E3A4D] hover:bg-[#632C3B] text-white font-black text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#7E3A4D]/20 active:scale-95 transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-rose-200" />
                <span>Llamar para Consulta — Turnos</span>
              </a>
            </div>

            <p className="text-xs text-[#8C6D76] pt-1">
              📍 <strong>Casa 13, Barrio Militar de Oficiales</strong>, Las Lajas (Neuquén) • Tel/WhatsApp: <strong>{WHATSAPP_DISPLAY}</strong>
            </p>
          </div>

          {/* HERO VISUAL REAL ANIMAL PHOTO SHOWCASE */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-md bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#EEDCE2] shadow-xl space-y-4 relative">
              {/* Species Selector Tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#FAF0F3] rounded-2xl border border-[#EEDCE2]">
                <button
                  type="button"
                  onClick={() => setActiveAnimalTab('CABALLOS')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeAnimalTab === 'CABALLOS'
                      ? 'bg-[#7E3A4D] text-white shadow-xs'
                      : 'text-[#6B4D56] hover:text-[#26141A]'
                  }`}
                >
                  🐎 Caballos
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAnimalTab('PERROS')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeAnimalTab === 'PERROS'
                      ? 'bg-[#7E3A4D] text-white shadow-xs'
                      : 'text-[#6B4D56] hover:text-[#26141A]'
                  }`}
                >
                  🐕 Perros
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAnimalTab('GATOS')}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeAnimalTab === 'GATOS'
                      ? 'bg-[#7E3A4D] text-white shadow-xs'
                      : 'text-[#6B4D56] hover:text-[#26141A]'
                  }`}
                >
                  🐈 Gatos
                </button>
              </div>

              {/* Photo Display Card */}
              <div className="relative rounded-2xl overflow-hidden aspect-4/3 border border-[#EEDCE2] shadow-inner group">
                <img
                  src={
                    activeAnimalTab === 'CABALLOS'
                      ? ANIMAL_PHOTOS.horseHero
                      : activeAnimalTab === 'PERROS'
                      ? ANIMAL_PHOTOS.dogHero
                      : ANIMAL_PHOTOS.catHero
                  }
                  alt={
                    activeAnimalTab === 'CABALLOS'
                      ? 'Medicina Equina en Las Lajas'
                      : activeAnimalTab === 'PERROS'
                      ? 'Atención canina integral'
                      : 'Cuidado felino especializado'
                  }
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md inline-block w-max mb-1">
                    {activeAnimalTab === 'CABALLOS'
                      ? 'Atención a Campo & Estancias'
                      : activeAnimalTab === 'PERROS'
                      ? 'Pequeños Animales & Cirugía'
                      : 'Medicina Felina Preventiva'}
                  </span>
                  <h3 className="font-display font-bold text-base text-white">
                    {activeAnimalTab === 'CABALLOS'
                      ? 'Medicina Veterinaria Equina & Haras'
                      : activeAnimalTab === 'PERROS'
                      ? 'Clínica, Vacunación y Cirugías Caninas'
                      : 'Salud, Inmunización y Cuidados Felinos'}
                  </h3>
                </div>
              </div>

              {/* Clinic Badge Summary */}
              <div className="space-y-2 text-xs text-[#5A3F47] pt-1">
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF0F3] border border-[#EEDCE2]">
                  <span className="font-bold">📍 Sede Central:</span>
                  <span className="text-right text-[#7E3A4D] font-bold">Casa 13, B° Militar, Las Lajas</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#FAF0F3] border border-[#EEDCE2]">
                  <span className="font-bold">👨‍⚕️ Dirección Médica:</span>
                  <span className="text-right text-slate-800 font-bold">Dr. Diego Iván Irusta (M.P. 502)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowWaModal(true)}
                className="w-full py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-black rounded-xl text-xs border border-emerald-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📅 Formulario Rápido de Solicitud de Turno</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* VERIFIABLE TRUST BANNER */}
      <section className="bg-white border-y border-[#EEDCE2] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-display font-black text-[#7E3A4D]">M.P. 502</span>
            <p className="text-xs font-bold text-[#26141A]">Matrícula Profesional</p>
            <p className="text-[11px] text-[#8C6D76]">Colegio Médico Veterinario</p>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-display font-black text-[#7E3A4D]">Las Lajas</span>
            <p className="text-xs font-bold text-[#26141A]">Sede & Atención a Campo</p>
            <p className="text-[11px] text-[#8C6D76]">Neuquén y zona rural</p>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-display font-black text-[#7E3A4D]">Por Consulta</span>
            <p className="text-xs font-bold text-[#26141A]">Atención Personalizada</p>
            <p className="text-[11px] text-[#8C6D76]">Turnos y coordinación previa</p>
          </div>
          <div className="space-y-1">
            <span className="text-xl sm:text-2xl font-display font-black text-[#7E3A4D]">Grandes & Pequeños</span>
            <p className="text-xs font-bold text-[#26141A]">Especialidades Clínicas</p>
            <p className="text-[11px] text-[#8C6D76]">Caninos, felinos y equinos</p>
          </div>
        </div>
      </section>

      {/* 🩺 ATENCIÓN POR CONSULTA Y COORDINACIÓN PREVIA */}
      <section id="consultas" className="py-14 px-4 sm:px-8 max-w-7xl mx-auto space-y-6 scroll-mt-20">
        <div className="bg-gradient-to-br from-teal-50/80 to-slate-50 rounded-3xl p-6 sm:p-8 border-2 border-teal-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-teal-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center text-xl font-bold shadow-md">
                🩺
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest block">
                  Atención Médica Veterinaria
                </span>
                <h2 className="text-xl sm:text-2xl font-display font-bold text-[#26141A]">
                  Protocolo de Atención por Consulta y Turno Previo
                </h2>
              </div>
            </div>

            <a
              href={`tel:${EMERGENCY_PHONE}`}
              className="px-5 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-teal-700/20 active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Llamar para Consulta ({WHATSAPP_DISPLAY})</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-teal-100 space-y-2 shadow-2xs">
              <span className="font-bold text-teal-800 text-sm">1. Coordinar antes de concurrir</span>
              <p className="text-[#6B4D56] leading-relaxed">
                Comunicate telefónicamente o por WhatsApp para describir brevemente el motivo de atención de tu mascota y acordar el turno en consultorio.
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-teal-100 space-y-2 shadow-2xs">
              <span className="font-bold text-teal-800 text-sm">2. Traslado seguro</span>
              <p className="text-[#6B4D56] leading-relaxed">
                Mantené al animal en un ambiente templado y sin movimientos bruscos. Si sufrió un traumatismo, trasladalo sobre una superficie plana o manta firme.
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-teal-100 space-y-2 shadow-2xs">
              <span className="font-bold text-teal-800 text-sm">3. No automedicar</span>
              <p className="text-[#6B4D56] leading-relaxed">
                Nunca administres analgésicos humanos (como ibuprofeno o paracetamol), ya que resultan altamente tóxicos y potencialmente letales para caninos y felinos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS CLÍNICOS ILUSTRADOS CON FOTOS REALES */}
      <section id="servicios" className="py-14 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 scroll-mt-20">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold text-[#7E3A4D] bg-[#F7EBEF] px-3 py-1 rounded-full uppercase tracking-wider border border-[#EEDCE2]">
            Servicios Clínicos Especializados
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#26141A]">
            Atención Médica Veterinaria Integral
          </h2>
          <p className="text-xs sm:text-sm text-[#6B4D56]">
            Desde la medicina preventiva hasta cirugías y atención a campo, brindamos servicios veterinarios con dedicación y equipamiento profesional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreServices.map((srv, idx) => {
            const Icon = srv.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-[#EEDCE2] shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Photo Header */}
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={srv.photo}
                    alt={srv.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-xs text-[#7E3A4D] flex items-center justify-center shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-xs text-[#7E3A4D] border border-white/40 shadow-xs">
                    {srv.badge}
                  </span>
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-display font-bold text-[#26141A]">{srv.title}</h3>
                    <span className="text-[11px] text-[#7E3A4D] font-bold block">{srv.subtitle}</span>
                    <p className="text-xs text-[#6B4D56] leading-relaxed pt-1">
                      {srv.description}
                    </p>
                  </div>

                  <a
                    href={getWhatsAppLink(srv.linkMsg)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pt-3 border-t border-[#F9F0F3] flex items-center justify-between text-xs font-bold text-emerald-800 hover:text-emerald-700 transition-colors"
                  >
                    <span>Consultar por WhatsApp</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* EQUINOS Y ATENCIÓN A CAMPO CON FOTOGRAFÍA RURAL REAL */}
      <section id="equinos" className="py-14 px-4 sm:px-8 max-w-7xl mx-auto space-y-6 scroll-mt-20">
        <div className="bg-[#FAF0F3] rounded-3xl p-6 sm:p-10 border border-[#EEDCE2] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="text-[11px] font-bold text-[#7E3A4D] bg-white px-3 py-1 rounded-full uppercase tracking-wider border border-[#EEDCE2]">
              🌾 Estancias & Haras de Neuquén
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#26141A]">
              Medicina Veterinaria Equina & Grandes Animales
            </h2>
            <p className="text-xs sm:text-sm text-[#6B4D56] leading-relaxed">
              El <strong>Dr. Diego Iván Irusta</strong> cuenta con amplia trayectoria en medicina equina y producción ganadera, brindando asistencia clínica periódica y de urgencia directamente en su establecimiento en Las Lajas, Zapala y zona centro/cordillera de Neuquén.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5A3F47] pt-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Atención clínica de cólicos y urgencias</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Odontología y corrección de puntas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Planes sanitarios y control reproductivo</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Cirugías a campo y suturas traumáticas</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href={getWhatsAppLink(WA_EQUINOS_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Coordinar Visita Médica a Campo</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-3xl overflow-hidden border border-[#EEDCE2] shadow-sm relative aspect-4/3">
            <img
              src={ANIMAL_PHOTOS.horseField}
              alt="Caballos en Estancia de Neuquén"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end text-white">
              <h4 className="font-display font-bold text-sm text-white">Cobertura en Toda la Región</h4>
              <p className="text-xs text-rose-100/90 leading-tight pt-0.5">
                Visitas programadas a campos en Las Lajas, Zapala, Loncopué y zona centro/cordillera.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DIRECCIÓN MÉDICA */}
      <section id="direccion-medica" className="py-14 px-4 sm:px-8 max-w-7xl mx-auto space-y-6 scroll-mt-20">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EEDCE2] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 text-center lg:text-left space-y-3">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#FAF0F3] border-2 border-[#EEDCE2] mx-auto lg:mx-0 flex items-center justify-center text-4xl shadow-inner">
              👨‍⚕️
            </div>
            <div>
              <h3 className="text-xl font-display font-bold text-[#26141A]">Dr. Diego Iván Irusta</h3>
              <p className="text-xs font-bold text-[#7E3A4D]">Médico Veterinario • M.P. 502</p>
              <p className="text-[11px] text-[#6B4D56]">Dirección Médica General</p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-4 text-xs sm:text-sm text-[#6B4D56] leading-relaxed">
            <span className="text-[11px] font-bold text-[#7E3A4D] bg-[#F7EBEF] px-3 py-1 rounded-full uppercase tracking-wider border border-[#EEDCE2]">
              Compromiso Profesional
            </span>
            <p>
              En <strong>Veterinaria Ranquel</strong> priorizamos una atención médica ética, personalizada y basada en evidencia científica. Nuestro objetivo es acompañar al tutor en cada etapa de la vida de su animal, brindando diagnósticos claros y tratamientos seguros.
            </p>
            <div className="p-3.5 bg-[#FAF0F3] rounded-2xl border border-[#EEDCE2] text-xs text-[#5A3F47] flex items-center justify-between gap-4">
              <span>Para consultas médicas particulares o dudas sobre tratamientos:</span>
              <a
                href={getWhatsAppLink(WA_TURNO_MSG)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex-shrink-0"
              >
                Contactar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PROCESO DE ATENCIÓN EN 3 PASOS */}
      <section className="py-14 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold text-[#7E3A4D] bg-[#F7EBEF] px-3 py-1 rounded-full uppercase tracking-wider border border-[#EEDCE2]">
            Atención Paso a Paso
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#26141A]">
            ¿Cómo es el Proceso de Consulta?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="bg-white p-6 rounded-3xl border border-[#EEDCE2] shadow-xs space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-[#F7EBEF] text-[#7E3A4D] font-black text-base flex items-center justify-center mx-auto sm:mx-0">
              1
            </div>
            <h3 className="font-display font-bold text-sm text-[#26141A]">Contacto & Turno</h3>
            <p className="text-[#6B4D56] leading-relaxed">
              Nos escribís por WhatsApp o llamás para coordinar el horario de consulta en clínica o la visita a campo.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EEDCE2] shadow-xs space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-[#F7EBEF] text-[#7E3A4D] font-black text-base flex items-center justify-center mx-auto sm:mx-0">
              2
            </div>
            <h3 className="font-display font-bold text-sm text-[#26141A]">Examen & Diagnóstico</h3>
            <p className="text-[#6B4D56] leading-relaxed">
              Examen físico exhaustivo, control biométrico y evaluación clínica completa del paciente.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-[#EEDCE2] shadow-xs space-y-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-[#F7EBEF] text-[#7E3A4D] font-black text-base flex items-center justify-center mx-auto sm:mx-0">
              3
            </div>
            <h3 className="font-display font-bold text-sm text-[#26141A]">Plan Terapéutico & Seguimiento</h3>
            <p className="text-[#6B4D56] leading-relaxed">
              Prescripción oficial, entrega de indicaciones claras y seguimiento evolutivo del paciente hasta su recuperación.
            </p>
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES (ACCORDION ACCESIBLE) */}
      <section id="preguntas" className="py-14 px-4 sm:px-8 max-w-4xl mx-auto space-y-6 scroll-mt-20">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-bold text-[#7E3A4D] bg-[#F7EBEF] px-3 py-1 rounded-full uppercase tracking-wider border border-[#EEDCE2]">
            Información Útil
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#26141A]">
            Preguntas Frecuentes
          </h2>
          <p className="text-xs text-[#6B4D56]">
            Respuestas a las consultas más habituales sobre nuestra modalidad de atención.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#EEDCE2] shadow-2xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[#26141A] hover:bg-[#FAF0F3] transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#7E3A4D] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-[#6B4D56] leading-relaxed border-t border-[#F9F0F3] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SEDES & CONTACTO */}
      <section id="sedes" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 scroll-mt-20">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-[11px] font-bold text-[#7E3A4D] bg-[#F7EBEF] px-3 py-1 rounded-full uppercase tracking-wider border border-[#EEDCE2]">
            🏥 Ubicación & Contacto
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-[#26141A]">
            Nuestra Sede en Las Lajas, Neuquén
          </h2>
          <p className="text-xs sm:text-sm text-[#6B4D56]">
            Atención médica veterinaria en clínica y servicio a campo en Las Lajas y centro/cordillera de la provincia de Neuquén.
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-[#EEDCE2] shadow-sm space-y-5">
          <div className="flex items-center gap-3.5 border-b border-[#F9F0F3] pb-4">
            <img
              src="/logo-ranquel.png"
              alt="Logo Veterinaria Ranquel"
              className="w-12 h-12 rounded-2xl object-contain bg-white p-1 border border-[#EEDCE2] shadow-xs"
            />
            <div>
              <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                CLÍNICA CENTRAL & GUARDIA
              </span>
              <h3 className="text-lg font-display font-bold text-[#26141A] mt-0.5">
                Veterinaria Ranquel — Las Lajas (Neuquén)
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#5A3F47]">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#7E3A4D] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#26141A]">Dirección:</strong>
                <span>Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-[#7E3A4D] flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#26141A]">Horarios:</strong>
                <span>Lunes a Sábados • Atención por Consulta y Turno Previo</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#26141A]">WhatsApp / Turnos:</strong>
                <a href={getWhatsAppLink(WA_TURNO_MSG)} target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-bold hover:underline">
                  {WHATSAPP_DISPLAY}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#26141A]">Consultas & Urgencias:</strong>
                <a href={`tel:${EMERGENCY_PHONE}`} className="text-red-700 font-bold hover:underline">
                  {WHATSAPP_DISPLAY}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#F9F0F3] flex flex-col sm:flex-row gap-3">
            <a
              href={getWhatsAppLink(WA_TURNO_MSG)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Solicitar Turno por WhatsApp</span>
            </a>
            <a
              href="https://maps.google.com/?q=Barrio+Militar+de+Oficiales+Casa+13+Las+Lajas+Neuquen"
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-5 bg-[#FAF0F3] hover:bg-[#F7EBEF] text-[#7E3A4D] text-xs font-bold rounded-2xl border border-[#EEDCE2] flex items-center justify-center gap-1.5 transition-colors"
            >
              <MapPin className="w-4 h-4" />
              <span>Ver en Google Maps</span>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER INSTITUCIONAL */}
      <footer className="bg-[#2C161D] text-[#FDF8F9] py-12 px-4 sm:px-8 border-t border-[#1E0D13]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-white/10">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo-ranquel.png"
                alt="Logo Veterinaria Ranquel"
                className="w-11 h-11 rounded-2xl object-contain bg-white p-1 shadow-md border border-white/20"
              />
              <span className="text-base font-display font-bold text-white">Veterinaria Ranquel</span>
            </div>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Clínica Veterinaria para Grandes y Pequeños Animales. Consultas, cirugía general, primera intervención y atención a campo en Las Lajas (Neuquén).
            </p>
            <p className="text-[11px] text-[#E8A5B8] font-mono">
              Dirección Médica: Dr. Diego Iván Irusta (M.P. 502)
            </p>
          </div>

          <div className="space-y-2 text-xs text-rose-200/80">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-2 font-display">Contacto Directo</h4>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#E8A5B8]" />
              <span>Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#E8A5B8]" />
              <a href={`tel:${EMERGENCY_PHONE}`} className="hover:text-white transition-colors">
                Guardia: {WHATSAPP_DISPLAY}
              </a>
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <MessageCircle className="w-3.5 h-3.5" />
              <a href={getWhatsAppLink(WA_TURNO_MSG)} target="_blank" rel="noopener noreferrer" className="hover:underline">
                WhatsApp: {WHATSAPP_DISPLAY}
              </a>
            </div>
          </div>

          <div className="space-y-3 text-xs text-rose-200/80">
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-2 font-display">Portal Interno</h4>
            <p className="text-[11px] text-rose-200/60">
              Acceso exclusivo para personal médico y administrativo del centro hospitalario.
            </p>
            <button
              onClick={handleOpenLogin}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Acceso al Sistema Profesional</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-rose-200/60">
          <div>
            © 2026 Veterinaria Ranquel • Dr. Diego Iván Irusta (M.P. 502). Todos los derechos reservados.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Aviso Legal & Ética Médica</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad de Datos</a>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION BAR FOR MOBILE (< sm) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF0F3]/95 backdrop-blur-md border-t border-[#EEDCE2] p-2.5 flex items-center gap-2 shadow-lg">
        <a
          href={`tel:${EMERGENCY_PHONE}`}
          className="flex-1 py-2.5 bg-red-600 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Contacto Telefónico</span>
        </a>
        <a
          href={getWhatsAppLink(WA_TURNO_MSG)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-2.5 bg-emerald-600 text-white text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>Pedir Turno</span>
        </a>
      </div>

      {/* QUICK TURN MODAL POPUP */}
      {showWaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div
            className="bg-white rounded-3xl p-6 border border-[#EEDCE2] shadow-2xl w-full max-w-md space-y-4"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between border-b border-[#F9F0F3] pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo-ranquel.png"
                  alt="Logo Ranquel"
                  className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-[#EEDCE2]"
                />
                <div>
                  <h4 className="font-display font-bold text-sm text-[#26141A]">Solicitud Rápida de Turno</h4>
                  <p className="text-[11px] text-emerald-700 font-bold">Veterinaria Ranquel • WhatsApp</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWaModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendCustomWa} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#5A3F47] block mb-1">Nombre del Paciente / Mascota:</label>
                <input
                  type="text"
                  required
                  value={waPetName}
                  onChange={(e) => setWaPetName(e.target.value)}
                  placeholder="Ej: Duque, Luna, etc."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#7E3A4D] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#5A3F47] block mb-1">Especie:</label>
                  <select
                    value={waSpecies}
                    onChange={(e) => setWaSpecies(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#7E3A4D] outline-hidden"
                  >
                    <option value="Canino">🐕 Canino</option>
                    <option value="Felino">🐈 Felino</option>
                    <option value="Equino">🐎 Equino / Campo</option>
                    <option value="Exótico / Otro">🦜 Exótico / Otro</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#5A3F47] block mb-1">Preferencia:</label>
                  <select
                    value={waPreferredTime}
                    onChange={(e) => setWaPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#7E3A4D] outline-hidden"
                  >
                    <option value="Mañana (09:00 a 13:00)">Mañana</option>
                    <option value="Tarde (16:00 a 20:00)">Tarde</option>
                    <option value="Lo antes posible">Urgente</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#5A3F47] block mb-1">Motivo de Consulta:</label>
                <textarea
                  rows={2}
                  value={waReason}
                  onChange={(e) => setWaReason(e.target.value)}
                  placeholder="Ej: Vacunación anual, control general, renguera..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-[#7E3A4D] outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Solicitud a WhatsApp</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
