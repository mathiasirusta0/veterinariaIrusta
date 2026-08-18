import React from 'react';
import {
  LayoutDashboard,
  PawPrint,
  Users,
  CalendarDays,
  Clock,
  Stethoscope,
  BedDouble,
  Scissors,
  FlaskConical,
  Scan,
  Syringe,
  Boxes,
  Receipt,
  FileText,
  Sparkles,
  ShieldCheck,
  Building2,
  Calculator,
  Radio,
  Activity,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const Sidebar: React.FC<{ isOpenMobile?: boolean; onCloseMobile?: () => void }> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const {
    activeView,
    setActiveView,
    hospitalizations,
    triageList,
    appointments,
    labOrders,
    products,
    currentUser,
    activeBranch,
    openCalculators,
    openMonitor,
    openWhatsAppHub,
    openDentalChart,
    openBodyMap,
  } = useVet();

  const activeHospitalCount = hospitalizations.filter((h) => h.status === 'ACTIVA').length;
  const waitingTriageCount = triageList.filter((t) => t.status === 'EN_ESPERA').length;
  const todayAppointments = appointments.filter(
    (a) => a.date === new Date().toISOString().split('T')[0] && a.status !== 'CANCELADO'
  ).length;
  const pendingLabsCount = labOrders.filter((l) => l.status === 'SOLICITADO' || l.status === 'EN_PROCESO').length;
  const lowStockCount = products.filter((p) => p.currentStock <= p.minStock).length;

  const navGroups = [
    {
      group: 'CLÍNICA Y ATENCIÓN',
      items: [
        { id: 'DASHBOARD', label: 'Inicio', icon: LayoutDashboard },
        { id: 'PACIENTES', label: 'Pacientes', icon: PawPrint },
        { id: 'PROPIETARIOS', label: 'Propietarios', icon: Users },
        { id: 'AGENDA', label: 'Agenda', icon: CalendarDays, badge: todayAppointments },
        { id: 'SALA_ESPERA', label: 'Sala de Espera', icon: Clock, badge: waitingTriageCount, badgeColor: 'bg-amber-500' },
        { id: 'CONSULTAS', label: 'Consultas & SOAP', icon: Stethoscope },
        { id: 'SIGNOS_VITALES', label: 'Signos Vitales', icon: Activity },
      ],
    },
    {
      group: 'HOSPITAL & CIRUGÍAS',
      items: [
        { id: 'INTERNACION', label: 'Internación', icon: BedDouble, badge: activeHospitalCount, badgeColor: 'bg-red-500' },
        { id: 'CIRUGIAS', label: 'Cirugías', icon: Scissors },
        { id: 'LABORATORIO', label: 'Laboratorio', icon: FlaskConical, badge: pendingLabsCount, badgeColor: 'bg-purple-500' },
        { id: 'IMAGENES', label: 'Imágenes', icon: Scan },
        { id: 'VACUNAS', label: 'Vacunación', icon: Syringe },
      ],
    },
    {
      group: 'GESTIÓN & SISTEMA',
      items: [
        { id: 'INVENTARIO', label: 'Farmacia & Stock', icon: Boxes, badge: lowStockCount, badgeColor: 'bg-red-500' },
        { id: 'CAJA_FACTURACION', label: 'Caja & Facturas', icon: Receipt },
        { id: 'DOCUMENTOS', label: 'Documentos', icon: FileText },
        { id: 'ASISTENTE_IA', label: 'Asistente IA', icon: Sparkles, badgeColor: 'bg-teal-500' },
        { id: 'CONFIGURACION', label: 'Configuración', icon: ShieldCheck },
      ],
    },
  ];

  const handleSelect = (id: string) => {
    setActiveView(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#0F172A] text-white flex flex-col h-full border-r border-slate-800 transition-transform duration-200 ease-in-out
        md:translate-x-0 md:static md:z-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-700/50">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-black text-lg text-slate-900 shadow-sm shadow-teal-500/30">
          V
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white">VET SYSTEM</span>
          <span className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">
            Hospital Veterinario
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto space-y-4 px-3 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.group} className="space-y-1">
            <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 mb-1.5">
              {group.group}
            </h4>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeView === item.id ||
                (item.id === 'DASHBOARD' && activeView === 'INICIO');

              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-all group rounded-md
                    ${
                      isActive
                        ? 'bg-teal-500/10 text-teal-400 border-l-4 border-teal-500 rounded-r-md font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-white'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white ${
                        item.badgeColor || 'bg-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}

        {/* Clinical Tools Fast Access */}
        <div className="pt-2 border-t border-slate-800 space-y-1">
          <h4 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/80 mb-1.5">
            HERRAMIENTAS CLÍNICAS
          </h4>
          <button
            onClick={() => {
              openCalculators();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-md transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Calculator className="w-4 h-4 text-teal-400 group-hover:text-white" />
              <span>Calculadora Dosis/Fluidos</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300">
              VET
            </span>
          </button>
          <button
            onClick={() => {
              openMonitor();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-md transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Telemetría / Monitor UCI</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300">
              VIVO
            </span>
          </button>
          <button
            onClick={() => {
              openWhatsAppHub();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-md transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-400 font-bold text-sm">💬</span>
              <span>WhatsApp Tutores Hub</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300">
              DIRECTO
            </span>
          </button>
          <button
            onClick={() => {
              openDentalChart();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-md transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-teal-400 font-bold text-sm">🦷</span>
              <span>Odontograma Triadan</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-900/60 text-teal-300">
              ODONTO
            </span>
          </button>
          <button
            onClick={() => {
              openBodyMap();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-md transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-amber-400 font-bold text-sm">🐾</span>
              <span>Mapa de Lesiones</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300">
              CUERPO
            </span>
          </button>
        </div>
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-teal-500 flex items-center justify-center text-xs font-bold text-teal-300">
            {currentUser.name.charAt(3) || 'U'}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">{currentUser.name}</span>
            <span className="text-[10px] text-slate-400 uppercase truncate">
              {currentUser.role} {currentUser.licenseNumber ? `• ${currentUser.licenseNumber}` : ''}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
