import React, { useState } from 'react';
import {
  X,
  MessageCircle,
  Send,
  Copy,
  CheckCircle2,
  Calendar,
  Syringe,
  BedDouble,
  FileText,
  DollarSign,
  User,
  Sparkles,
  CreditCard,
  CheckCheck,
  ShieldAlert,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { formatPhoneNumberE164 } from '../utils/formatters';

export interface WhatsAppData {
  ownerPhone: string;
  ownerName?: string;
  patientName?: string;
  type?: 'TURNO' | 'VACUNA' | 'INTERNACION' | 'RECETA' | 'PRESUPUESTO' | 'COBRO_INSUMO' | 'ALTA_MEDICA' | 'AUTORIZACION_ESTUDIO';
  details?: {
    date?: string;
    time?: string;
    vetName?: string;
    vaccineName?: string;
    dueDate?: string;
    hospStatus?: string;
    prescriptionText?: string;
    estimateTotal?: number;
    supplyName?: string;
    supplyAmount?: number;
    bankAlias?: string;
  };
}

interface WhatsAppHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: WhatsAppData | null;
}

export const WhatsAppHubModal: React.FC<WhatsAppHubModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const { owners, patients, showToast, logAudit } = useVet();

  const [selectedOwnerId, setSelectedOwnerId] = useState(
    initialData
      ? owners.find((o) => o.whatsapp === initialData.ownerPhone || o.phone === initialData.ownerPhone)?.id || owners[0]?.id
      : owners[0]?.id
  );

  const currentOwner = owners.find((o) => o.id === selectedOwnerId) || owners[0];
  const ownerPets = patients.filter((p) => p.ownerId === currentOwner?.id);
  const [selectedPatientId, setSelectedPatientId] = useState(ownerPets[0]?.id || patients[0]?.id);
  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const [templateType, setTemplateType] = useState<NonNullable<WhatsAppData['type']>>(
    initialData?.type || 'TURNO'
  );

  const [customPhone, setCustomPhone] = useState(
    initialData?.ownerPhone || currentOwner?.whatsapp || currentOwner?.phone || '+5491167891234'
  );

  // Generate message based on template
  const generateTemplateMessage = (type: NonNullable<WhatsAppData['type']>): string => {
    const ownerName = currentOwner ? currentOwner.firstName : 'Tutor';
    const petName = currentPatient ? currentPatient.name : 'su mascota';

    switch (type) {
      case 'TURNO':
        return `Hola ${ownerName}! 👋 Le escribimos de *VET SYSTEM Hospital Veterinario*.
Le recordamos que *${petName}* tiene un turno agendado para el día *${initialData?.details?.date || 'Mañana'}* a las *${initialData?.details?.time || '15:30'} hs* con el/la profesional *${initialData?.details?.vetName || 'Dr. Martín López'}*.

📍 *Dirección:* Av. Corrientes 4550, CABA
⚠️ *Indicaciones previas:* Por favor concurrir con collar y correa o transportadora. Si tiene ayuno indicado, cumplir 8 hs de sólidos.

Por favor, responda *CONFIRMAR* para reservar su horario. ¡Muchas gracias! 🐾`;

      case 'VACUNA':
        return `Hola ${ownerName}! 👋 Le recordamos desde *VET SYSTEM* que *${petName}* tiene próxima la aplicación de su vacuna *${initialData?.details?.vaccineName || 'Séxtuple / Antirrábica'}* (Vencimiento: *${initialData?.details?.dueDate || 'en los próximos días'}*).

Mantener el plan de vacunación al día es fundamental para su protección. 
¿Desea que le reservemos un turno para esta semana? 💉🐾`;

      case 'INTERNACION':
        return `Estimada familia de *${petName}* 🏥:
Les enviamos el *Reporte Médico de Internación* de hoy.

${petName} se encuentra estable bajo monitoreo continuo en nuestra UCI.
💧 *Fluidoterapia:* Activa con balance de hidratación controlado.
💊 *Tratamientos:* Recibiendo medicación reglada según plan.
🥣 *Alimentación & Ánimo:* Con buena tolerancia y descansando confortablemente.

⏰ *Horario de Visita:* Hoy de 16:00 a 18:00 hs.
¡Cualquier novedad les avisaremos de inmediato! Nuestro equipo 24hs está cuidando de ${petName}. 🩺❤️`;

      case 'COBRO_INSUMO':
        return `Hola ${ownerName}! 👋 Le informamos desde administración de *VET SYSTEM* sobre los insumos médicos aplicados en la atención de *${petName}*:

🧾 *Detalle de Insumo / Medicación:* ${initialData?.details?.supplyName || 'Medicación endovenosa, fluidoterapia y descartables de internación'}
💵 *Monto Total:* $${(initialData?.details?.supplyAmount || 18500).toLocaleString('es-AR')}
🏦 *Alias de Pago / Transferencia:* ` + (initialData?.details?.bankAlias || 'VETSYSTEM.PAGOS.MP') + `

Agradecemos enviar el comprobante por este medio para asentar en la cuenta de ${petName}. ¡Muchas gracias! 🐾`;

      case 'ALTA_MEDICA':
        return `¡Excelentes noticias ${ownerName}! 🎉
*${petName}* ha respondido muy bien al tratamiento y ha recibido el *Alta Médica*.

⏰ Pueden pasar a retirarlo/a hoy hasta las 20:00 hs.
📄 Les entregaremos el resumen de historia clínica, indicaciones de medicación ambulatoria y pautas de alarma.

¡Los esperamos en recepción para el reencuentro con ${petName}! 🐶🐱❤️`;

      case 'AUTORIZACION_ESTUDIO':
        return `Estimado/a ${ownerName} ⚠️:
Desde el equipo médico de *VET SYSTEM*, les solicitamos autorización para realizar un estudio complementario a *${petName}*:

🔬 *Procedimiento:* ${initialData?.details?.supplyName || 'Ecografía abdominal de urgencia y panel de química sanguínea'}
💡 *Motivo:* Valoración diagnóstica inmediata para ajustar el plan terapéutico.

Por favor, responda *AUTORIZO* para proceder de inmediato. Quedamos a su disposición ante cualquier consulta. 🩺`;

      case 'RECETA':
        return `Hola ${ownerName}! 👋 Adjuntamos las indicaciones médicas y receta digital para *${petName}*:

📋 *Tratamiento Prescripto:*
${initialData?.details?.prescriptionText || '1. Maropitant 1 comp c/24hs por 3 días.\n2. Omeprazol 20mg 1 cápsula en ayunas por 7 días.\n3. Dieta blanda gastrointestinal.'}

⚠️ Ante vómitos reiterados o decaimiento, contáctese con nuestra guardia médica 24hs. ¡Pronta recuperación para ${petName}! 🐾`;

      case 'PRESUPUESTO':
        return `Hola ${ownerName}! 👋 Le enviamos el presupuesto médico solicitado para *${petName}*:

🧾 *Total Estimado:* $${(initialData?.details?.estimateTotal || 45000).toLocaleString('es-AR')}
Incluye honorarios clínicos/quirúrgicos, monitoreo y medicación perioperatoria.

Este presupuesto tiene una validez de 15 días. Quedamos a su disposición para coordinar la fecha. 🐾`;

      default:
        return `Hola ${ownerName}, le escribimos de VET SYSTEM respecto a ${petName}.`;
    }
  };

  const [messageBody, setMessageBody] = useState(() =>
    generateTemplateMessage(templateType)
  );

  if (!isOpen) return null;

  const handleTemplateChange = (type: NonNullable<WhatsAppData['type']>) => {
    setTemplateType(type);
    setMessageBody(generateTemplateMessage(type));
  };

  const handleSendWhatsApp = () => {
    const cleanPhone = formatPhoneNumberE164(customPhone);
    const encoded = encodeURIComponent(messageBody);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;

    window.open(url, '_blank');
    showToast('success', 'WhatsApp Abierto', `Mensaje preparado para enviar a ${currentOwner?.firstName || 'Tutor'}.`);
    logAudit(
      'ENVIO_WHATSAPP',
      'Owner',
      currentOwner?.id || 'own-1',
      `Mensaje WhatsApp (${templateType}) generado para ${customPhone}`
    );
    onClose();
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageBody);
    showToast('info', 'Mensaje Copiado', 'Texto copiado al portapapeles.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-lg">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Centro de Comunicación & WhatsApp con Tutores
              </h2>
              <p className="text-xs text-emerald-100">
                Cobro de insumos, reportes UCI, recetas, turnos y avisos al tutor responsable
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Target Tutor & Patient Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <label className="text-slate-700 font-bold block mb-1">Tutor / Destinatario:</label>
              <select
                value={selectedOwnerId}
                onChange={(e) => {
                  setSelectedOwnerId(e.target.value);
                  const o = owners.find((own) => own.id === e.target.value);
                  if (o) setCustomPhone(o.whatsapp || o.phone);
                }}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.firstName} {o.lastName} ({o.whatsapp || o.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 font-bold block mb-1">Número de WhatsApp (con código país):</label>
              <input
                type="text"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="+54 9 11 1234-5678"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Template Selector Tabs */}
          <div>
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-2">
              Plantillas de Comunicación con el Propietario:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'COBRO_INSUMO', label: 'Pago de Insumo', icon: CreditCard, color: 'text-amber-600' },
                { id: 'INTERNACION', label: 'Reporte UCI', icon: BedDouble, color: 'text-teal-600' },
                { id: 'ALTA_MEDICA', label: 'Alta Médica', icon: CheckCheck, color: 'text-emerald-600' },
                { id: 'AUTORIZACION_ESTUDIO', label: 'Autorización', icon: ShieldAlert, color: 'text-rose-600' },
                { id: 'TURNO', label: 'Turno Agendado', icon: Calendar, color: 'text-blue-600' },
                { id: 'RECETA', label: 'Receta Digital', icon: FileText, color: 'text-purple-600' },
                { id: 'VACUNA', label: 'Aviso Vacuna', icon: Syringe, color: 'text-emerald-600' },
                { id: 'PRESUPUESTO', label: 'Presupuesto', icon: DollarSign, color: 'text-slate-600' },
              ].map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = templateType === tpl.id;

                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleTemplateChange(tpl.id as any)}
                    className={`p-2.5 rounded-xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : tpl.color}`} />
                    <span className="text-[11px] leading-tight">{tpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Preview & Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold">Mensaje a Enviar:</label>
              <span className="text-[10px] text-slate-400 font-mono">
                {messageBody.length} caracteres
              </span>
            </div>
            <textarea
              rows={6}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
            />
          </div>

          {/* Info Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-900 leading-relaxed">
              El mensaje se enviará directamente a través de WhatsApp Web o la aplicación móvil oficial de WhatsApp con formato enriquecido en negritas y emojis.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyMessage}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar Texto</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Abrir en WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
