import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  Stethoscope,
  HeartPulse,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { formatPhoneNumberE164 } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';

export interface WhatsAppData {
  ownerPhone?: string;
  ownerName?: string;
  patientName?: string;
  patientId?: string;
  ownerId?: string;
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
  const {
    owners,
    patients,
    hospitalizations,
    clinicalEvolutions,
    prescriptions,
    encounterConsumptions,
    appointments,
    currentUser,
    showToast,
    logAudit,
  } = useVet();

  // Selected Owner state
  const [selectedOwnerId, setSelectedOwnerId] = useState<string>('');
  // Selected Patient state
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  // Custom phone number state
  const [customPhone, setCustomPhone] = useState<string>('');
  // Template type state
  const [templateType, setTemplateType] = useState<NonNullable<WhatsAppData['type']>>('INTERNACION');
  // Message body state
  const [messageBody, setMessageBody] = useState<string>('');

  // Find objects
  const currentOwner = owners.find((o) => o.id === selectedOwnerId) || owners[0];
  const ownerPatients = patients.filter((p) => p.ownerId === currentOwner?.id);
  const currentPatient = patients.find((p) => p.id === selectedPatientId) || ownerPatients[0] || patients[0];

  // Helper to generate dynamic message based on actual patient, owner and clinical data
  const generateTemplateMessage = (
    type: NonNullable<WhatsAppData['type']>,
    owner = currentOwner,
    patient = currentPatient
  ): string => {
    const ownerName = owner ? `${owner.firstName} ${owner.lastName || ''}`.trim() : 'Tutor';
    const petName = patient ? patient.name : 'su mascota';
    const vetInCharge = currentUser?.name || 'Dr. Diego Iván Irusta';

    // Fetch latest clinical data for this patient
    const patientHosp = hospitalizations.find((h) => h.patientId === patient?.id && h.status === 'ACTIVA');
    const patientEvos = clinicalEvolutions
      .filter((e) => e.patientId === patient?.id)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    const latestEvo = patientEvos[0];
    const latestEvoText = latestEvo
      ? latestEvo.assessment || latestEvo.plan || latestEvo.evolutionText || 'Paciente estable con monitoreo continuo.'
      : 'Paciente hemodinámicamente estable, afebril y con buena tolerancia.';

    // Active meds
    const activeMeds = (patientHosp?.medications || [])
      .filter((m) => m.status !== 'SUSPENDIDA')
      .map((m) => `• ${m.drugName} (${m.dose} ${m.route}) c/${m.frequency}`)
      .join('\n');

    switch (type) {
      case 'INTERNACION':
        return `Estimado/a ${ownerName} 👋:
Le enviamos el *Reporte Médico & Novedades* de *${petName}* de *Veterinaria Irusta*.

📋 *Estado Clínico & Evolución:*
${latestEvoText}

💊 *Tratamiento & Medicaciones:*
${activeMeds || '• Medicación y plan terapéutico reglado según indicación.'}

🩺 *Monitoreo:* Cuidados intensivos y control de constantes bajo supervisión del *${vetInCharge}* (M.P. 502).
⏰ *Horario de Visitas de Internación:* Hoy de 16:00 a 18:00 hs.
📱 *WhatsApp de Guardia:* +54 9 2942 47-7136. ¡Cuidamos de ${petName} con el mayor compromiso! 🐾❤️`;

      case 'TURNO':
        return `🐾 *CLÍNICA VETERINARIA IRUSTA* 🏥
*Recordatorio de Cita Médica* ✨

Hola *${ownerName}*, ¡esperamos que estés muy bien! Te recordamos el turno médico programado para *${petName}*:

🐶 *Paciente:* ${petName} ${patient ? `(${patient.species} • ${patient.breed})` : ''}
🗓️ *Fecha:* ${initialData?.details?.date || 'Próximamente'}
⏰ *Horario:* ${initialData?.details?.time || '10:00'} hs
👨‍⚕️ *Profesional Asignado:* ${initialData?.details?.vetName || vetInCharge} (M.P. 502)
🩺 *Motivo:* ${initialData?.details?.supplyName || 'Consulta médica general'}
📍 *Ubicación:* Clínica Veterinaria Irusta — Río Cuarto, Córdoba

⚠️ *Recomendaciones para la visita:*
• Por favor concurrir 5 a 10 minutos antes del horario pactado.
• Traer a perros con collar y correa, y a gatos o animales pequeños en transportadora segura.
• Si necesitas reprogramar o cancelar, avísanos respondiendo a este mensaje con anticipación.

¡Te esperamos para cuidar la salud y bienestar de ${petName}! 🐾❤️`;

      case 'RECETA':
        return `Hola ${ownerName}! 👋 Adjuntamos las indicaciones médicas y receta para *${petName}* prescripta por *${vetInCharge}* de *Veterinaria Irusta*:

📋 *Plan Farmacológico:*
${initialData?.details?.prescriptionText || activeMeds || '1. Protector gástrico y antiemético según indicación.\n2. Dieta blanda gastrointestinal fraccionada.\n3. Reposo y control de hidratación.'}

⚠️ Ante cualquier duda o síntoma de alarma, contáctenos a nuestra guardia: *+54 9 2942 47-7136*. ¡Pronta recuperación para ${petName}! 🐾`;

      case 'COBRO_INSUMO':
        return `Hola ${ownerName}! 👋 Le informamos desde administración de *Veterinaria Irusta* sobre los insumos médicos y tratamientos realizados a *${petName}*:

🧾 *Detalle de Prestaciones / Insumos:* ${initialData?.details?.supplyName || 'Tratamiento médico de guardia, descartables y medicación aplicada'}
💵 *Total a Abonar:* $${(initialData?.details?.supplyAmount || 18500).toLocaleString('es-AR')}
🏦 *Alias de Pago / Transferencia:* ` + (initialData?.details?.bankAlias || 'VET.IRUSTA.PAGOS') + `
Titular: Dr. Diego Iván Irusta

Agradecemos enviar el comprobante por este medio para asentar en la cuenta de ${petName}. ¡Muchas gracias! 🐾`;

      case 'ALTA_MEDICA':
        return `¡Excelentes noticias ${ownerName}! 🎉
*${petName}* ha respondido muy favorablemente al tratamiento y ha recibido el *Alta Médica* en *Veterinaria Irusta* por indicación del *${vetInCharge}*.

⏰ Pueden pasar a retirarlo/a hoy por la clínica.
📄 Les entregaremos el resumen de historia clínica, indicaciones de medicación ambulatoria y pautas de control.

¡Los esperamos para el reencuentro con ${petName}! 🐶🐱❤️`;

      case 'AUTORIZACION_ESTUDIO':
        return `Estimado/a ${ownerName} ⚠️:
Desde el equipo médico de *Veterinaria Irusta*, le solicitamos autorización para realizar un procedimiento / estudio complementario a *${petName}*:

🔬 *Procedimiento:* ${initialData?.details?.supplyName || 'Ecografía abdominal y panel bioquímico de urgencia'}
💡 *Motivo:* Valoración diagnóstica inmediata para definir el tratamiento médico adecuado.
👨‍⚕️ *Profesional Responsable:* ${vetInCharge}

Por favor, responda *AUTORIZO* para proceder de inmediato. Quedamos a su entera disposición. 🩺`;

      case 'VACUNA':
        return `Hola ${ownerName}! 👋 Le recordamos desde *Veterinaria Irusta* que *${petName}* tiene próxima la aplicación de su vacuna *${initialData?.details?.vaccineName || 'Antirrábica / Séxtuple'}* (Vencimiento: *${initialData?.details?.dueDate || 'en los próximos días'}*).

Mantener su plan sanitario al día es fundamental para proteger su salud.
¿Desea que le reservemos un turno esta semana? 💉🐾`;

      case 'PRESUPUESTO':
        return `Hola ${ownerName}! 👋 Le enviamos el presupuesto médico estimado para *${petName}* de *Veterinaria Irusta*:

🧾 *Total Estimado:* $${(initialData?.details?.estimateTotal || 45000).toLocaleString('es-AR')}
Incluye honorarios médicos, monitoreo y medicación correspondiente.
👨‍⚕️ *Dirección Médica:* Dr. Diego Iván Irusta (M.P. 502)

Este presupuesto tiene validez por 15 días. Quedamos a su disposición para coordinar. 🐾`;

      default:
        return `Hola ${ownerName}, le escribimos de Veterinaria Irusta respecto a ${petName}.`;
    }
  };

  // Synchronize modal state on open or initialData change
  useEffect(() => {
    if (!isOpen) return;

    // 1. Resolve owner
    let targetOwner = owners[0];
    if (initialData?.ownerId) {
      targetOwner = owners.find((o) => o.id === initialData.ownerId) || targetOwner;
    } else if (initialData?.ownerPhone) {
      targetOwner = owners.find((o) => o.whatsapp === initialData.ownerPhone || o.phone === initialData.ownerPhone) || targetOwner;
    }

    // 2. Resolve patient
    let targetPatient = patients[0];
    if (initialData?.patientId) {
      targetPatient = patients.find((p) => p.id === initialData.patientId) || targetPatient;
    } else if (targetOwner) {
      targetPatient = patients.find((p) => p.ownerId === targetOwner.id) || targetPatient;
    }

    const newOwnerId = targetOwner?.id || '';
    const newPatientId = targetPatient?.id || '';
    const newPhone = initialData?.ownerPhone || targetOwner?.whatsapp || targetOwner?.phone || '+5493584362824';
    const newType = initialData?.type || 'INTERNACION';

    setSelectedOwnerId(newOwnerId);
    setSelectedPatientId(newPatientId);
    setCustomPhone(newPhone);
    setTemplateType(newType);
    setMessageBody(generateTemplateMessage(newType, targetOwner, targetPatient));
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleOwnerChange = (newOwnerId: string) => {
    setSelectedOwnerId(newOwnerId);
    const owner = owners.find((o) => o.id === newOwnerId);
    if (owner) {
      const ownerPhone = owner.whatsapp || owner.phone || '';
      setCustomPhone(ownerPhone);
      const firstPet = patients.find((p) => p.ownerId === owner.id) || patients[0];
      if (firstPet) setSelectedPatientId(firstPet.id);
      setMessageBody(generateTemplateMessage(templateType, owner, firstPet));
    }
  };

  const handlePatientChange = (newPatientId: string) => {
    setSelectedPatientId(newPatientId);
    const patient = patients.find((p) => p.id === newPatientId);
    if (patient) {
      const owner = owners.find((o) => o.id === patient.ownerId) || currentOwner;
      if (owner && owner.id !== selectedOwnerId) {
        setSelectedOwnerId(owner.id);
        setCustomPhone(owner.whatsapp || owner.phone || '');
      }
      setMessageBody(generateTemplateMessage(templateType, owner, patient));
    }
  };

  const handleTemplateChange = (type: NonNullable<WhatsAppData['type']>) => {
    setTemplateType(type);
    setMessageBody(generateTemplateMessage(type, currentOwner, currentPatient));
  };

  const handleRegenerate = () => {
    triggerHaptic('light');
    setMessageBody(generateTemplateMessage(templateType, currentOwner, currentPatient));
    showToast('info', 'Mensaje Regenerado', 'Se recargaron los datos actualizados del paciente y tutor.');
  };

  const handleSendWhatsApp = () => {
    triggerHaptic('success');
    const cleanPhone = formatPhoneNumberE164(customPhone);
    const encoded = encodeURIComponent(messageBody);
    const url = `https://wa.me/${cleanPhone}?text=${encoded}`;

    window.open(url, '_blank');
    showToast('success', 'WhatsApp Abierto', `Mensaje preparado para enviar a ${currentOwner?.firstName || 'Tutor'}.`);
    logAudit(
      'ENVIO_WHATSAPP',
      'Owner',
      currentOwner?.id || 'own-1',
      `Mensaje WhatsApp (${templateType}) para ${currentOwner?.firstName} ${currentOwner?.lastName} (${customPhone})`
    );
    onClose();
  };

  const handleCopyMessage = () => {
    triggerHaptic('light');
    navigator.clipboard.writeText(messageBody);
    showToast('info', 'Mensaje Copiado', 'Texto copiado al portapapeles.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-bold text-lg shadow-xs">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>Centro de Comunicación & WhatsApp con Tutores</span>
              </h2>
              <p className="text-xs text-emerald-100 font-medium">
                Veterinaria Irusta • Novedades médicas, reportes clínicos, recetas, turnos y avisos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-emerald-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          {/* Target Tutor & Patient Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="text-slate-800 font-bold block mb-1">Tutor / Destinatario:</label>
              <select
                value={selectedOwnerId}
                onChange={(e) => handleOwnerChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.firstName} {o.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-800 font-bold block mb-1">Paciente / Mascota:</label>
              <select
                value={selectedPatientId}
                onChange={(e) => handlePatientChange(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {patients.map((p) => {
                  const o = owners.find((own) => own.id === p.ownerId);
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} • {o ? `${o.firstName}` : 'Sin tutor'})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="text-slate-800 font-bold block mb-1">WhatsApp de Destino:</label>
              <input
                type="text"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="+54 9 358 436-2824"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
              </input>
            </div>
          </div>

          {/* Template Selector Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-black text-slate-800 uppercase tracking-wider text-[11px] block">
                Plantillas de Comunicación con el Propietario:
              </span>
              <button
                type="button"
                onClick={handleRegenerate}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer transition-colors"
                title="Recargar texto con datos actuales del paciente"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Recargar Datos</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'INTERNACION', label: 'Reporte UCI / Novedades', icon: BedDouble, color: 'text-teal-600' },
                { id: 'RECETA', label: 'Plan de Medicación', icon: FileText, color: 'text-purple-600' },
                { id: 'TURNO', label: 'Turno Agendado', icon: Calendar, color: 'text-blue-600' },
                { id: 'COBRO_INSUMO', label: 'Pago de Insumo / Saldo', icon: CreditCard, color: 'text-amber-600' },
                { id: 'ALTA_MEDICA', label: 'Alta Médica & Egreso', icon: CheckCheck, color: 'text-emerald-600' },
                { id: 'AUTORIZACION_ESTUDIO', label: 'Autorización Médica', icon: ShieldAlert, color: 'text-rose-600' },
                { id: 'VACUNA', label: 'Aviso de Vacuna', icon: Syringe, color: 'text-emerald-600' },
                { id: 'PRESUPUESTO', label: 'Presupuesto Estimado', icon: DollarSign, color: 'text-slate-600' },
              ].map((tpl) => {
                const Icon = tpl.icon;
                const isSelected = templateType === tpl.id;

                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleTemplateChange(tpl.id as any)}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : tpl.color}`} />
                    <span className="text-[11px] leading-tight font-medium">{tpl.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Preview & Editor */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 font-black text-xs flex items-center gap-1.5">
                <span>Mensaje Preparado para Enviar:</span>
                <span className="text-slate-400 font-normal text-[11px]">(editable antes de enviar)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {messageBody.length} caracteres
              </span>
            </div>
            <textarea
              rows={7}
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white leading-relaxed transition-all"
            />
          </div>

          {/* Info Card */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-emerald-950 leading-relaxed font-medium">
              El mensaje se enviará directamente a través de WhatsApp Web o la app oficial de WhatsApp al número del tutor con formato enriquecido en negritas y emojis.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyMessage}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer active:scale-95"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copiar Texto</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
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
