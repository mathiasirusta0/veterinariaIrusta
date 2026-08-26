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
import { formatPhoneNumberE164, formatDate } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';

export interface WhatsAppData {
  ownerPhone?: string;
  ownerName?: string;
  patientName?: string;
  patientId?: string;
  ownerId?: string;
  type?: 'TURNO' | 'RECORDATORIO_TURNO' | 'VACUNA' | 'INTERNACION' | 'RECETA' | 'PRESUPUESTO' | 'COBRO_INSUMO' | 'ALTA_MEDICA' | 'AUTORIZACION_ESTUDIO';
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
    appointments,
    vaccinations,
    estimates,
    invoices,
    surgeries,
    labOrders,
    imagingStudies,
    consultations,
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
  const [templateType, setTemplateType] = useState<
    'INTERNACION' | 'RECETA' | 'TURNO' | 'COBRO_INSUMO' | 'ALTA_MEDICA' | 'AUTORIZACION_ESTUDIO' | 'VACUNA' | 'PRESUPUESTO'
  >('TURNO');
  // Message body state
  const [messageBody, setMessageBody] = useState<string>('');

  // Find objects
  const currentOwner = owners.find((o) => o.id === selectedOwnerId) || owners[0];
  const ownerPatients = patients.filter((p) => p.ownerId === currentOwner?.id);
  const currentPatient = patients.find((p) => p.id === selectedPatientId) || ownerPatients[0] || patients[0];

  // Helper to generate dynamic message based on actual patient, owner and clinical data
  const generateTemplateMessage = (
    type: 'INTERNACION' | 'RECETA' | 'TURNO' | 'COBRO_INSUMO' | 'ALTA_MEDICA' | 'AUTORIZACION_ESTUDIO' | 'VACUNA' | 'PRESUPUESTO',
    owner = currentOwner,
    patient = currentPatient
  ): string => {
    const ownerName = owner ? `${owner.firstName} ${owner.lastName || ''}`.trim() : 'Tutor';
    const petName = patient ? patient.name : 'su mascota';
    const petDesc = patient ? `(${patient.species} • ${patient.breed})` : '';
    const vetInCharge = currentUser?.name || 'Dr. Diego Iván Irusta';

    switch (type) {
      // 1. TURNO AGENDADO / RECORDATORIO DE CITA
      case 'TURNO': {
        // Query patient upcoming appointments
        const patientApts = appointments
          .filter((a) => a.patientId === patient?.id && a.status !== 'CANCELADO')
          .sort((a, b) => a.date.localeCompare(b.date));
        const nextApt = patientApts[0];

        let dateStr = initialData?.details?.date;
        if (!dateStr && nextApt?.date) {
          dateStr = formatDate(nextApt.date, 'Próximamente', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
        }
        if (!dateStr) {
          dateStr = 'Próximamente';
        }

        const timeStr = initialData?.details?.time || nextApt?.time || '10:00';
        const vetStr = initialData?.details?.vetName || nextApt?.vetName || vetInCharge;
        const reasonStr = initialData?.details?.supplyName || nextApt?.reason || 'Consulta médica general';

        return `🐾 *CLÍNICA VETERINARIA RANQUEL* 🏥
*Recordatorio de Cita Médica* ✨

Hola *${ownerName}*, ¡esperamos que estés muy bien! Te recordamos el turno médico programado para *${petName}*:

🐶 *Paciente:* ${petName} ${petDesc}
🗓️ *Fecha:* ${dateStr}
⏰ *Horario:* ${timeStr} hs
👨‍⚕️ *Profesional Asignado:* ${vetStr} (M.P. 502)
🩺 *Motivo:* ${reasonStr}
📍 *Ubicación:* Clínica Veterinaria Ranquel — Río Cuarto, Córdoba

⚠️ *Recomendaciones para la visita:*
• Por favor concurrir 5 a 10 minutos antes del horario pactado.
• Traer a perros con collar y correa, y a gatos o animales pequeños en transportadora segura.
• Si necesitas reprogramar o cancelar, avísanos respondiendo a este mensaje con anticipación.

¡Te esperamos para cuidar la salud y bienestar de ${petName}! 🐾❤️`;
      }

      // 2. REPORTE UCI / INTERNACIÓN
      case 'INTERNACION': {
        const patientHosp = hospitalizations.find((h) => h.patientId === patient?.id && h.status === 'ACTIVA');
        const patientEvos = clinicalEvolutions
          .filter((e) => e.patientId === patient?.id)
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        const latestEvo = patientEvos[0];
        const evoText = latestEvo?.assessment || latestEvo?.plan || latestEvo?.evolutionText || (patientHosp ? `Diagnóstico: ${patientHosp.primaryDiagnosis}. Monitoreo continuo y estabilidad hemodinámica.` : 'Paciente con monitoreo clínico y evolución favorable.');

        const activeMeds = (patientHosp?.medications || [])
          .filter((m) => m.status !== 'SUSPENDIDA')
          .map((m) => `• ${m.drugName} (${m.dose} ${m.route}) c/${m.frequency}`)
          .join('\n');

        return `🐾 *CLÍNICA VETERINARIA RANQUEL* 🏥
*Reporte Médico de Internación & UCI* 🩺

Estimado/a *${ownerName}*, le compartimos el informe de estado clínico y novedades de *${petName}*:

🐶 *Paciente:* ${petName} ${petDesc}
🏥 *Sector:* ${patientHosp ? `${patientHosp.sector} (Canil ${patientHosp.kennelNumber})` : 'Área de Cuidados Clínicos'}
👨‍⚕️ *Veterinario a Cargo:* ${patientHosp?.vetInChargeName || vetInCharge} (M.P. 502)

📋 *Estado Clínico & Evolución:*
${evoText}

💊 *Plan Terapéutico & Medicaciones:*
${activeMeds || '• Medicación y fluidoterapia administradas según prescripción médica.'}

⏰ *Horario de Visitas de Internación:* Hoy de 16:00 a 18:00 hs.
📱 *WhatsApp de Guardia 24hs:* +54 9 2942 47-7136

¡Estamos acompañando y cuidando a ${petName} con la máxima dedicación! 🐾❤️`;
      }

      // 3. PLAN DE MEDICACIÓN / RECETA
      case 'RECETA': {
        const patientRxs = prescriptions
          .filter((p) => p.patientId === patient?.id)
          .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        const latestRx = patientRxs[0];

        let rxText = '';
        if (latestRx && latestRx.medications && latestRx.medications.length > 0) {
          rxText = latestRx.medications
            .map((m, idx) => `${idx + 1}. *${m.drugName}*: ${m.dose} (${m.route}) cada ${m.frequency} durante ${m.duration}.${m.instructions ? `\n   ↳ _Indicación:_ ${m.instructions}` : ''}`)
            .join('\n\n');
        } else if (initialData?.details?.prescriptionText) {
          rxText = initialData.details.prescriptionText;
        } else {
          rxText = '1. Continuar con la medicación según pauta horaria indicada.\n2. Administrar con alimento para protección gástrica.\n3. Dieta blanda e hidratación permanente.';
        }

        const rxNotes = latestRx?.generalInstructions || latestRx?.notes || 'Cumplir estrictamente la duración completa del tratamiento prescripto.';

        return `🐾 *CLÍNICA VETERINARIA RANQUEL* 🏥
*Plan de Medicación & Prescripción Oficial* 💊

Hola *${ownerName}*, le enviamos las indicaciones farmacológicas detalladas para *${petName}*:

🐶 *Paciente:* ${petName} ${petDesc}
👨‍⚕️ *Profesional Prescriptor:* ${latestRx?.vetName || vetInCharge} (M.P. 502)
🗓️ *Fecha de Emisión:* ${latestRx?.date ? formatDate(latestRx.date) : formatDate(new Date().toISOString())}

📋 *Medicamentos Indicados:*
${rxText}

⚠️ *Instrucciones Generales:*
${rxNotes}

Ante cualquier efecto adverso o duda sobre la administración, comuníquese con nosotros. ¡Pronta recuperación para ${petName}! 🐾✨`;
      }

      // 4. PAGO DE INSUMO / SALDO DE CUENTA
      case 'COBRO_INSUMO': {
        const patientInvoices = invoices
          .filter((i) => i.patientId === patient?.id || i.ownerId === owner?.id)
          .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        const latestInvoice = patientInvoices[0];

        const amount = initialData?.details?.supplyAmount || (latestInvoice ? latestInvoice.totalAmount : (owner?.balance && owner.balance > 0 ? owner.balance : 18500));
        const concept = initialData?.details?.supplyName || (latestInvoice ? latestInvoice.items.map((it) => it.description).join(', ') : 'Prestaciones médicas, honorarios e insumos aplicados');
        const bankAlias = initialData?.details?.bankAlias || 'VET.RANQUEL.PAGOS';

        return `🐾 *CLÍNICA VETERINARIA RANQUEL* 🏥
*Comprobante de Prestaciones & Detalle de Saldo* 🧾

Hola *${ownerName}*, le enviamos el detalle de tratamientos e insumos médicos realizados a *${petName}*:

🐶 *Paciente:* ${petName} ${petDesc}
📄 *Detalle:* ${concept}
💵 *Monto Total:* $${amount.toLocaleString('es-AR')}

🏦 *Datos para Transferencia Bancaria:*
• *Alias:* ${bankAlias}
• *Titular:* Dr. Diego Iván Irusta
• *Banco:* Banco de la Provincia de Córdoba / Mercado Pago

⚠️ Por favor, envíe el comprobante de transferencia a este WhatsApp para asentar el pago en la ficha médica de ${petName}. ¡Muchas gracias! 🐾`;
      }

      // 5. ALTA MÉDICA & EGRESO
      case 'ALTA_MEDICA': {
        const lastHosp = hospitalizations
          .filter((h) => h.patientId === patient?.id)
          .sort((a, b) => new Date(b.admittedAt || 0).getTime() - new Date(a.admittedAt || 0).getTime())[0];
        const lastCons = consultations
          .filter((c) => c.patientId === patient?.id)
          .sort((a, b) => new Date(b.dateTime || 0).getTime() - new Date(a.dateTime || 0).getTime())[0];

        const dischargeSummary = lastHosp?.dischargeSummary || lastCons?.soap?.plan || 'Paciente clínicamente compensado con excelente evolución post-tratamiento.';
        const doctor = lastHosp?.vetInChargeName || lastCons?.vetName || vetInCharge;

        return `🐾 *CLÍNICA VETERINARIA RANQUEL* 🏥
*¡Alta Médica & Egreso Clínico!* 🎉

¡Excelentes noticias *${ownerName}*! Nos alegra informarle que *${petName}* ha evolucionado favorablemente y recibió el *Alta Médica*:

🐶 *Paciente:* ${petName} ${petDesc}
👨‍⚕️ *Médico que otorga el Alta:* ${doctor} (M.P. 502)
🗓️ *Fecha:* ${formatDate(new Date().toISOString())}

📋 *Resumen de Egreso & Pautas de Cuidado:*
${dischargeSummary}

⏰ Ya pueden coordinar para retirar a ${petName} por la clínica. En recepción les entregaremos el certificado de alta y las pautas de control ambulatorio.

¡Los esperamos con mucha alegría para el reencuentro con ${petName}! 🐶🐱❤️`;
      }

      // 6. AUTORIZACIÓN MÉDICA / CONSENTIMIENTO
      case 'AUTORIZACION_ESTUDIO': {
        const pendingSurgery = surgeries
          .filter((s) => s.patientId === patient?.id && s.status === 'PROGRAMADA')
          .sort((a, b) => a.date.localeCompare(b.date))[0];
        const pendingLab = labOrders
          .filter((l) => l.patientId === patient?.id && l.status === 'SOLICITADO')[0];
        const pendingImg = imagingStudies
          .filter((img) => img.patientId === patient?.id)[0];

        const procedureName = initialData?.details?.supplyName || pendingSurgery?.procedureName || (pendingLab ? `Análisis de Laboratorio (${pendingLab.testType})` : pendingImg ? `Estudio de Imagen (${pendingImg.modality} - ${pendingImg.region})` : 'Procedimiento diagnóstico / quirúrgico de urgencia');
        const surgeon = pendingSurgery?.surgeonName || vetInCharge;

        return `🐾 *CLÍNICA VETERINARIA RANQUEL* 🏥
*Solicitud de Autorización Médica & Consentimiento* 📋

Estimado/a *${ownerName}*, desde la dirección médica le solicitamos su consentimiento informado para realizar un procedimiento a *${petName}*:

🐶 *Paciente:* ${petName} ${petDesc}
🔬 *Procedimiento Solicitado:* ${procedureName}
👨‍⚕️ *Profesional Responsable:* ${surgeon} (M.P. 502)
💡 *Finalidad:* Diagnóstico certero y tratamiento oportuno para salvaguardar la salud del paciente.

⚠️ *¿Cómo confirmar?*
Por favor, responda a este mensaje con la palabra:
👉 *AUTORIZO*

Ante cualquier consulta sobre el procedimiento, nuestro equipo médico está a su total disposición. 🩺🐾`;
      }

      // 7. AVISO DE VACUNACIÓN
      case 'VACUNA': {
        const patientVacs = vaccinations
          .filter((v) => v.patientId === patient?.id)
          .sort((a, b) => new Date(b.nextDueDate || 0).getTime() - new Date(a.nextDueDate || 0).getTime());
        const latestVac = patientVacs[0];

        const vacName = initialData?.details?.vaccineName || latestVac?.vaccineName || 'Antirrábica / Séxtuple Canina / Triple Felina';
        const vacDueDate = initialData?.details?.dueDate || (latestVac?.nextDueDate ? formatDate(latestVac.nextDueDate) : 'este mes');
        const vacBatch = latestVac?.batchNumber ? `(Lote: ${latestVac.batchNumber})` : '';

        return `🐾 *CLÍNICA VETERINARIA RANQUEL* 🏥
*Aviso de Vencimiento de Vacunación* 💉

Hola *${ownerName}*, esperamos que estés muy bien. Te escribimos para recordarte la próxima vacuna de *${petName}*:

🐶 *Paciente:* ${petName} ${petDesc}
💉 *Vacuna:* ${vacName} ${vacBatch}
🗓️ *Fecha Sugerida / Vencimiento:* ${vacDueDate}
📍 *Lugar:* Clínica Veterinaria Ranquel — Río Cuarto, Córdoba

⚠️ *¿Por qué es importante?*
Mantener el plan sanitario al día genera anticuerpos esenciales para prevenir enfermedades infecciosas graves.

¿Deseas que te reservemos un turno para la aplicación esta semana? ¡Respondemos por este medio para agendarlo! 🐾❤️`;
      }

      // 8. PRESUPUESTO ESTIMADO
      case 'PRESUPUESTO': {
        const patientEstimates = estimates
          .filter((e) => e.patientId === patient?.id || e.ownerId === owner?.id)
          .sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
        const latestEst = patientEstimates[0];

        let itemsList = '';
        if (latestEst && latestEst.items && latestEst.items.length > 0) {
          itemsList = latestEst.items
            .map((it) => `• ${it.description}: $${it.total.toLocaleString('es-AR')}`)
            .join('\n');
        } else {
          itemsList = '• Consulta clínica de especialidad\n• Procedimiento y material descartable\n• Medicación intraoperatoria y monitoreo';
        }

        const totalEst = latestEst ? latestEst.totalAmount : (initialData?.details?.estimateTotal || 45000);
        const estNum = latestEst?.estimateNumber ? ` (${latestEst.estimateNumber})` : '';

        return `🐾 *CLÍNICA VETERINARIA RANQUEL* 🏥
*Presupuesto Médico Estimado* 📋${estNum}

Hola *${ownerName}*, le enviamos la estimación presupuestaria para el tratamiento médico de *${petName}*:

🐶 *Paciente:* ${petName} ${petDesc}
🗓️ *Fecha de Cotización:* ${latestEst?.date ? formatDate(latestEst.date) : formatDate(new Date().toISOString())}
👨‍⚕️ *Dirección Médica:* Dr. Diego Iván Irusta (M.P. 502)

📋 *Detalle de Prestaciones Incluidas:*
${itemsList}

💵 *Total Estimado:* $${totalEst.toLocaleString('es-AR')}
⏳ *Validez:* 15 días corridos a partir de la fecha de emisión.

Quedamos a su entera disposición para coordinar turnos o resolver cualquier duda. ¡Muchas gracias! 🐾`;
      }

      default:
        return `Hola ${ownerName}, le escribimos de Veterinaria Ranquel respecto a ${petName}.`;
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
    const newPhone = initialData?.ownerPhone || targetOwner?.whatsapp || targetOwner?.phone || '';
    
    // Normalize type (handles 'RECORDATORIO_TURNO' -> 'TURNO')
    let newType: 'INTERNACION' | 'RECETA' | 'TURNO' | 'COBRO_INSUMO' | 'ALTA_MEDICA' | 'AUTORIZACION_ESTUDIO' | 'VACUNA' | 'PRESUPUESTO' = 'TURNO';
    if (initialData?.type) {
      if (initialData.type === 'RECORDATORIO_TURNO' || initialData.type === 'TURNO') {
        newType = 'TURNO';
      } else {
        newType = initialData.type as any;
      }
    }

    setSelectedOwnerId(newOwnerId);
    setSelectedPatientId(newPatientId);
    setCustomPhone(newPhone);
    setTemplateType(newType);
    setMessageBody(generateTemplateMessage(newType, targetOwner, targetPatient));
  }, [isOpen, initialData, owners, patients, appointments, hospitalizations, prescriptions, vaccinations, estimates]);

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

  const handleTemplateChange = (type: 'INTERNACION' | 'RECETA' | 'TURNO' | 'COBRO_INSUMO' | 'ALTA_MEDICA' | 'AUTORIZACION_ESTUDIO' | 'VACUNA' | 'PRESUPUESTO') => {
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
                Veterinaria Ranquel • Novedades médicas, reportes clínicos, recetas, turnos y avisos
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
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
              />
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
                { id: 'TURNO', label: 'Turno Agendado', icon: Calendar, color: 'text-blue-600' },
                { id: 'INTERNACION', label: 'Reporte UCI / Novedades', icon: BedDouble, color: 'text-teal-600' },
                { id: 'RECETA', label: 'Plan de Medicación', icon: FileText, color: 'text-purple-600' },
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
              rows={8}
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
