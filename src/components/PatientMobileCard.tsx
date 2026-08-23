import React from 'react';
import {
  Phone,
  MessageCircle,
  Copy,
  Check,
  Stethoscope,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Heart,
} from 'lucide-react';
import { Patient, Owner } from '../types';
import { formatWeight } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';

interface PatientMobileCardProps {
  patient: Patient;
  owner?: Owner;
  isInterned: boolean;
  onOpenPatient: (id: string) => void;
  onOpenSOAP: (id: string) => void;
  onOpenDentalChart: (id: string) => void;
  onOpenBodyMap: (id: string) => void;
  onOpenWhatsApp: (data: {
    patientName: string;
    species: string;
    ownerName: string;
    ownerPhone?: string;
    diagnosis?: string;
  }) => void;
}

export const PatientMobileCard: React.FC<PatientMobileCardProps> = ({
  patient,
  owner,
  isInterned,
  onOpenPatient,
  onOpenSOAP,
  onOpenDentalChart,
  onOpenBodyMap,
  onOpenWhatsApp,
}) => {
  const [copiedChip, setCopiedChip] = React.useState(false);

  const handleCopyChip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!patient.microchip) return;
    triggerHaptic('light');
    navigator.clipboard.writeText(patient.microchip);
    setCopiedChip(true);
    setTimeout(() => setCopiedChip(false), 2000);
  };

  const speciesEmoji =
    patient.species === 'Canino' ? '🐕' : patient.species === 'Felino' ? '🐈' : '🦜';

  return (
    <article
      onClick={() => {
        triggerHaptic('light');
        onOpenPatient(patient.id);
      }}
      className="bg-white border border-slate-200/90 hover:border-teal-500/60 rounded-2xl p-4 shadow-xs space-y-3 cursor-pointer active:scale-[0.99] transition-all w-full max-w-full min-w-0"
      aria-label={`Ficha de paciente ${patient.name}`}
    >
      {/* 1. Header: Avatar, Name, Record Number & Status Badge */}
      <div className="flex items-start justify-between gap-2.5 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative flex-shrink-0">
            <img
              src={patient.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120'}
              alt={`Foto de ${patient.name}`}
              className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <span
              className="absolute -bottom-1 -right-1 text-xs bg-white rounded-full p-0.5 shadow-2xs border border-slate-100"
              title={patient.species}
            >
              {speciesEmoji}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 truncate tracking-tight">
                {patient.name || 'Paciente'}
              </h3>
              <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-600 border border-slate-200 flex-shrink-0">
                {patient.clinicalRecordNumber || 'HC-0000'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {[patient.species, patient.breed].filter(Boolean).join(' • ')}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase flex-shrink-0 flex items-center gap-1 ${
            isInterned
              ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
              : patient.status === 'ACTIVO'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          {isInterned && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
          <span>{isInterned ? 'INTERNADO' : patient.status || 'ACTIVO'}</span>
        </span>
      </div>

      {/* 2. Demographic and Clinical Metric Badges */}
      <div className="flex items-center gap-1.5 flex-wrap text-xs">
        <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-slate-700 font-semibold text-[11px]">
          {patient.sex} {patient.reproductiveStatus ? `(${patient.reproductiveStatus})` : ''} • {patient.calculatedAge || 'Edad N/D'}
        </span>

        <span className="bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-xl text-teal-800 font-mono font-black text-[11px]">
          ⚖️ {formatWeight(patient.weight)}
        </span>

        {patient.color && (
          <span className="bg-slate-50 border border-slate-200 px-2 py-1 rounded-xl text-slate-600 text-[10px] font-medium">
            🎨 {patient.color}
          </span>
        )}

        {patient.microchip && (
          <button
            type="button"
            onClick={handleCopyChip}
            className="bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2 py-1 rounded-xl text-slate-700 font-mono text-[10px] font-bold flex items-center gap-1 transition-colors touch-manipulation min-h-[28px]"
            title="Copiar número de microchip ISO"
          >
            {copiedChip ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
            <span>CHIP: {patient.microchip}</span>
          </button>
        )}
      </div>

      {/* 3. Clinical Alerts & Chronic Conditions (Graceful Multi-line Wrap) */}
      {patient.alerts && patient.alerts.length > 0 && (
        <div className="space-y-1 w-full">
          {patient.alerts.map((al, idx) => (
            <div
              key={idx}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-start gap-1.5 break-words overflow-wrap-anywhere w-full leading-tight"
            >
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-red-600" />
              <span>
                {al.type}: {al.description}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* 4. Owner & Contact Section */}
      {owner && (
        <div className="flex items-center justify-between bg-slate-50/90 px-3 py-2.5 rounded-xl border border-slate-200/80 text-xs gap-2">
          <div className="truncate min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Tutor:</span>
            <span className="font-bold text-slate-800 text-xs truncate block">
              {owner.firstName} {owner.lastName}
            </span>
          </div>

          <div
            className="flex items-center gap-2 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {owner.phone && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    onOpenWhatsApp({
                      patientName: patient.name,
                      species: patient.species,
                      ownerName: `${owner.firstName} ${owner.lastName}`,
                      ownerPhone: owner.phone,
                      diagnosis: 'Control general en clínica veterinaria',
                    });
                  }}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-all active:scale-95 touch-manipulation"
                  title="Enviar WhatsApp directo al tutor"
                  aria-label="WhatsApp tutor"
                >
                  <MessageCircle className="w-4 h-4 fill-emerald-600 text-white" />
                </button>

                <a
                  href={`tel:${owner.phone.replace(/[^0-9]/g, '')}`}
                  className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center transition-all active:scale-95 touch-manipulation"
                  title="Llamar por teléfono al tutor"
                  aria-label="Llamar tutor"
                >
                  <Phone className="w-4 h-4 text-teal-600" />
                </a>
              </>
            )}
          </div>
        </div>
      )}

      {/* 5. Fast Clinical Actions & 360 Link */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        <div
          className="flex items-center gap-1.5 flex-wrap"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              triggerHaptic('medium');
              onOpenSOAP(patient.id);
            }}
            className="btn-physical btn-physical-teal px-3 py-1.5 text-white font-black text-xs flex items-center gap-1 rounded-xl min-h-[36px]"
            title="Abrir nueva consulta SOAP"
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>+ SOAP</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenDentalChart(patient.id);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs min-h-[36px] flex items-center gap-1 transition-colors"
            title="Abrir Odontograma"
          >
            <span>🦷</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenBodyMap(patient.id);
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs min-h-[36px] flex items-center gap-1 transition-colors"
            title="Abrir Mapa Corporal de Lesiones"
          >
            <span>🐾</span>
          </button>
        </div>

        <span className="font-bold text-teal-700 hover:text-teal-900 text-xs flex items-center gap-1 group">
          <span>Ficha 360°</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </article>
  );
};
