import React from 'react';
import {
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Activity,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Calendar,
  Award,
  ChevronRight,
  MessageCircle,
  Building2,
  Lock,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

interface PublicLandingViewProps {
  onOpenLogin: () => void;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({ onOpenLogin }) => {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#2C3E2D] font-sans antialiased selection:bg-[#6E8268] selection:text-white">
      {/* 🧭 TOP BAR / AVISO DE GUARDIA */}
      <div className="bg-[#6E8268] text-white py-2 px-4 sm:px-8 text-xs font-semibold flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
          <span>GUARDIA VETERINARIA & EMERGENCIAS 24 HORAS ACTIVAS</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="hidden sm:inline">Río Cuarto • CABA • Zona Norte</span>
          <a
            href="https://wa.me/5491138229011"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-100 hover:text-white underline font-bold"
          >
            <Phone className="w-3 h-3" />
            <span>Guardia Directa: (011) 4862-9900</span>
          </a>
        </div>
      </div>

      {/* 🏛️ NAVBAR INSTITUCIONAL */}
      <header className="sticky top-0 z-40 bg-[#F7F5F0]/90 backdrop-blur-md border-b border-[#E3DEC3] px-4 sm:px-8 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6E8268] text-white flex items-center justify-center text-xl shadow-xs">
              🐴
            </div>
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-[#6E8268] block">
                Hospital & Centro Veterinario
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-serif tracking-tight text-[#2C3E2D]">
                Veterinaria <span className="text-[#6E8268]">Irusta</span>
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#4A5D4B]">
            <a href="#servicios" className="hover:text-[#2C3E2D] transition-colors">Servicios</a>
            <a href="#equinos" className="hover:text-[#2C3E2D] transition-colors">Equinos & Campo</a>
            <a href="#pequenos" className="hover:text-[#2C3E2D] transition-colors">Pequeños Animales</a>
            <a href="#equipo" className="hover:text-[#2C3E2D] transition-colors">Equipo Médico</a>
            <a href="#sedes" className="hover:text-[#2C3E2D] transition-colors">Sedes & Guardia</a>
          </nav>

          {/* CTA System Access */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenLogin();
              }}
              className="px-4 py-2.5 bg-[#6E8268] hover:bg-[#5C7053] active:scale-98 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Acceso al Sistema</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 🌟 HERO SECTION */}
      <section className="relative px-4 sm:px-8 pt-8 pb-16 max-w-7xl mx-auto overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#E9E4D4] text-[#4A5D4B] px-3.5 py-1.5 rounded-full text-xs font-bold border border-[#DDD7C4]">
              <Sparkles className="w-3.5 h-3.5 text-[#6E8268]" />
              <span>Propuesta Web • Agosto 2026</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-black tracking-tight text-[#1F2E20] leading-[1.15]">
              Medicina Veterinaria Integral, Equinos y Hospital 24hs.
            </h2>

            <p className="text-base sm:text-lg text-[#556956] font-medium leading-relaxed max-w-2xl">
              Atención médica y quirúrgica de alta complejidad para caballos de deporte, animales de campo y pequeños animales. Hospital con internación continua, diagnóstico por imágenes y laboratorio in situ.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenLogin();
                }}
                className="px-6 py-3.5 bg-[#6E8268] hover:bg-[#5C7053] active:scale-98 text-white font-bold text-sm rounded-2xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <span>Ingresar al Sistema Hospitalario</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="https://wa.me/5491138229011"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-white hover:bg-[#EFECE3] border border-[#DDD7C4] text-[#2C3E2D] font-bold text-sm rounded-2xl transition-all shadow-xs flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Guardia WhatsApp 24hs</span>
              </a>
            </div>

            {/* Micro Trust Badges */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#E3DEC3]">
              <div>
                <span className="text-xl sm:text-2xl font-black font-serif text-[#2C3E2D] block">+15.000</span>
                <span className="text-[11px] text-[#6A7E6B] font-semibold">Pacientes Atendidos</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black font-serif text-[#2C3E2D] block">24 / 7</span>
                <span className="text-[11px] text-[#6A7E6B] font-semibold">Guardia & Traslados</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black font-serif text-[#2C3E2D] block">100%</span>
                <span className="text-[11px] text-[#6A7E6B] font-semibold">Compromiso Clínico</span>
              </div>
            </div>
          </div>

          {/* Imagery Grid Column */}
          <div className="lg:col-span-5 space-y-4">
            {/* Main Featured Horse Photo */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white group">
              <img
                src="https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&w=800&q=80"
                alt="Caballos al atardecer en el campo - Veterinaria Irusta"
                className="w-full h-64 sm:h-72 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">Medicina Equina de Excelencia</span>
                <h3 className="text-lg font-serif font-bold">Clínica a Campo, Traumatología & Rendimiento</h3>
              </div>
            </div>

            {/* Small Animals & Diagnostics Row */}
            <div className="grid grid-cols-2 gap-3.5">
              <div className="relative rounded-2xl overflow-hidden shadow-md border-3 border-white group">
                <img
                  src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80"
                  alt="Perro en consulta veterinaria"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                  <span className="text-[10px] font-bold">Pequeños Animales</span>
                </div>
              </div>

              <div className="relative rounded-2xl overflow-hidden shadow-md border-3 border-white group">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=80"
                  alt="Quirófano e imágenes veterinarias"
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3 text-white">
                  <span className="text-[10px] font-bold">Quirófano & UCI 24hs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🌿 VALUE PILLARS / BAND */}
      <section className="bg-[#6E8268] text-white py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
              ⏱️
            </div>
            <div>
              <h4 className="text-sm font-bold font-serif">Guardia Continua 24hs</h4>
              <p className="text-xs text-emerald-100 mt-0.5">Atención médica y quirúrgica ininterrumpida los 365 días del año.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
              🐴
            </div>
            <div>
              <h4 className="text-sm font-bold font-serif">Especialidad Equina</h4>
              <p className="text-xs text-emerald-100 mt-0.5">Atención a campo, cólicos, odontología y evaluación pre-compra.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
              🔬
            </div>
            <div>
              <h4 className="text-sm font-bold font-serif">Laboratorio In Situ</h4>
              <p className="text-xs text-emerald-100 mt-0.5">Resultados inmediatos de bioquímica, hemograma y frotis.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lg flex-shrink-0">
              🛡️
            </div>
            <div>
              <h4 className="text-sm font-bold font-serif">VET SYSTEM Digital</h4>
              <p className="text-xs text-emerald-100 mt-0.5">Historias clínicas inmutables con trazabilidad total.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 🐾 SERVICIOS INTEGRALES */}
      <section id="servicios" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6E8268]">Nuestras Especialidades</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1F2E20]">Servicios Médicos de Alta Complejidad</h2>
          <p className="text-xs sm:text-sm text-[#5C7053]">Infraestructura moderna para garantizar el diagnóstico preciso y el tratamiento oportuno.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div id="equinos" className="bg-white rounded-3xl p-6 border border-[#E3DEC3] shadow-xs hover:border-[#6E8268] transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F0EBE1] text-[#6E8268] flex items-center justify-center text-2xl">
              🐴
            </div>
            <h3 className="text-lg font-serif font-bold text-[#1F2E20]">Medicina Equina & Campo</h3>
            <p className="text-xs text-[#556956] leading-relaxed">
              Atención integral para caballos deportivos, de polo y de trabajo. Diagnóstico de claudicaciones, ecografía musculoesquelética, cirugía de cólico, odontología correctiva y manejo reproductivo.
            </p>
            <ul className="space-y-1.5 text-xs text-[#4A5D4B] pt-2 border-t border-[#EFECE3]">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6E8268]" /> Traslado e internación en boxes UCI</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6E8268]" /> Evaluación pre-compra completa</li>
            </ul>
          </div>

          {/* Card 2 */}
          <div id="pequenos" className="bg-white rounded-3xl p-6 border border-[#E3DEC3] shadow-xs hover:border-[#6E8268] transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F0EBE1] text-[#6E8268] flex items-center justify-center text-2xl">
              🐕
            </div>
            <h3 className="text-lg font-serif font-bold text-[#1F2E20]">Pequeños Animales (Caninos & Felinos)</h3>
            <p className="text-xs text-[#556956] leading-relaxed">
              Consultorios equipados para consulta general, planes vacunales SENASA, dermatología, cardiología, oncología y medicina preventiva personalizada.
            </p>
            <ul className="space-y-1.5 text-xs text-[#4A5D4B] pt-2 border-t border-[#EFECE3]">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6E8268]" /> Hospitalización con caniles climatizados</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6E8268]" /> Quirófano con anestesia inhalatoria</li>
            </ul>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E3DEC3] shadow-xs hover:border-[#6E8268] transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F0EBE1] text-[#6E8268] flex items-center justify-center text-2xl">
              🏥
            </div>
            <h3 className="text-lg font-serif font-bold text-[#1F2E20]">Diagnóstico & Cuidados Críticos</h3>
            <p className="text-xs text-[#556956] leading-relaxed">
              Radiología digital de alta resolución, ecocardiografía Doppler color, monitoreo hemodinámico multiparamétrico y fluidoterapia con bomba de infusión.
            </p>
            <ul className="space-y-1.5 text-xs text-[#4A5D4B] pt-2 border-t border-[#EFECE3]">
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6E8268]" /> Laboratorio de urgencia en 20 minutos</li>
              <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-[#6E8268]" /> Triage y reanimación avanzada</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 👨‍⚕️ DIRECCIÓN MÉDICA */}
      <section id="equipo" className="bg-[#EFECE3] py-16 px-4 sm:px-8 border-y border-[#DDD7C4]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=600&q=80"
                alt="Dr. Matías Irusta - Dirección Médica"
                className="w-full h-80 object-cover"
              />
              <div className="p-4 bg-white">
                <h4 className="text-base font-serif font-bold text-[#1F2E20]">Dr. Matías Irusta</h4>
                <p className="text-xs text-[#6E8268] font-bold">Director Médico • MP 8412</p>
                <p className="text-[11px] text-[#6A7E6B] mt-0.5">Especialista en Medicina Equina y Clínica de Pequeños Animales</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6E8268]">Dirección Médica & Compromiso</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1F2E20]">
              Vocación, Ciencia y Cuidado Compasivo
            </h2>
            <p className="text-sm text-[#4A5D4B] leading-relaxed">
              "En Veterinaria Irusta combinamos la experiencia a campo con la más rigurosa tecnología hospitalaria. Cada paciente, ya sea un caballo de alto rendimiento o la mascota de la familia, recibe un seguimiento clínico minucioso, transparente e ininterrumpido."
            </p>
            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  onOpenLogin();
                }}
                className="px-5 py-3 bg-[#6E8268] hover:bg-[#5C7053] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Acceder a la Ficha Clínica en VET SYSTEM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 📍 SEDES & CONTACTO */}
      <section id="sedes" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6E8268]">Nuestras Instalaciones</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-black text-[#1F2E20]">Sedes & Atención de Guardia</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E3DEC3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-[#1F2E20]">Sede Central Río Cuarto (Córdoba)</h3>
              <span className="text-[10px] font-bold bg-[#E9E4D4] text-[#4A5D4B] px-2.5 py-1 rounded-full">Sede Matriz</span>
            </div>
            <p className="text-xs text-[#556956]">Atención a campo, boxes de internación equina y clínica veterinaria general.</p>
            <div className="space-y-1.5 text-xs text-[#4A5D4B] pt-2 border-t border-[#EFECE3]">
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#6E8268]" /> <span>Río Cuarto, Provincia de Córdoba (CP 5800)</span></div>
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#6E8268]" /> <span>Tel: (0358) 464-9000 • Guardia WhatsApp</span></div>
              <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#6E8268]" /> <span>Lunes a Sábados 08:00 - 20:00 • Guardia 24hs</span></div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#E3DEC3] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-bold text-[#1F2E20]">Hospital Central 24hs (CABA & Norte)</h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">Guardia 24/7</span>
            </div>
            <p className="text-xs text-[#556956]">Centro de alta complejidad, quirófano de urgencia y unidad de cuidados intensivos.</p>
            <div className="space-y-1.5 text-xs text-[#4A5D4B] pt-2 border-t border-[#EFECE3]">
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#6E8268]" /> <span>Av. Corrientes 4550, CABA / Av. Maipú 2140, Olivos</span></div>
              <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#6E8268]" /> <span>Tel: (011) 4862-9900 / 4791-3320</span></div>
              <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#6E8268]" /> <span>Abierto las 24 horas, los 365 días del año</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* 📜 FOOTER INSTITUCIONAL */}
      <footer className="bg-[#2C3E2D] text-white py-12 px-4 sm:px-8 border-t border-[#1F2E20]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xl">🐴</span>
              <span className="text-base font-serif font-bold text-white">Veterinaria Irusta</span>
            </div>
            <p className="text-xs text-slate-300">
              Gestión Hospitalaria & Medicina Veterinaria Integral • Río Cuarto & Buenos Aires
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                triggerHaptic('medium');
                onOpenLogin();
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Portal de Profesionales (Login)</span>
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/10 text-center text-[11px] text-slate-400">
          © 2026 Veterinaria Irusta • VET SYSTEM — Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};
