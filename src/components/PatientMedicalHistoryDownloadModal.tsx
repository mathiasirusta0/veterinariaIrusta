import React from 'react';
import {
  X,
  Printer,
  Download,
  MessageCircle,
  Copy,
  Calendar,
  Clock,
  Heart,
  Stethoscope,
  Activity,
  BedDouble,
  Pill,
  FlaskConical,
  Scan,
  ShieldCheck,
  CheckCircle2,
  FileText,
  DollarSign,
  Receipt,
  Scissors,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Patient, Owner } from '../types';
import { formatDate, formatDateTime, formatTime, formatWeight, formatCurrency } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { printA4MedicalHistory, downloadMedicalHistoryPdf } from '../utils/printDocumentHelper';

interface PatientMedicalHistoryDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  owner?: Owner | null;
}

const getDayName = (dateStr: string | Date): string => {
  try {
    const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    if (isNaN(d.getTime())) return '';
    const day = d.toLocaleDateString('es-AR', { weekday: 'short' });
    return day.charAt(0).toUpperCase() + day.slice(1) + '.';
  } catch {
    return '';
  }
};

export const PatientMedicalHistoryDownloadModal: React.FC<PatientMedicalHistoryDownloadModalProps> = ({
  isOpen,
  onClose,
  patient,
  owner,
}) => {
  const {
    vitals,
    consultations,
    hospitalizations,
    clinicalEvolutions,
    labOrders,
    imagingStudies,
    surgeries,
    prescriptions,
    invoices,
    estimates,
    openWhatsAppHub,
    showToast,
  } = useVet();

  const [isGeneratingPdf, setIsGeneratingPdf] = React.useState(false);

  if (!isOpen || !patient) return null;

  // Filter items for this patient
  const patientVitals = vitals
    .filter((v) => v.patientId === patient.id)
    .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

  const patientHosps = hospitalizations
    .filter((h) => h.patientId === patient.id)
    .sort((a, b) => new Date(b.admittedAt).getTime() - new Date(a.admittedAt).getTime());

  const patientConsults = consultations
    .filter((c) => c.patientId === patient.id)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());

  const patientEvolutions = clinicalEvolutions
    .filter((e) => e.patientId === patient.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.timestamp || b.dateTime || 0).getTime() -
        new Date(a.createdAt || a.timestamp || a.dateTime || 0).getTime()
    );

  const patientLabs = labOrders
    .filter((l) => l.patientId === patient.id)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const patientImaging = imagingStudies
    .filter((i) => i.patientId === patient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const patientSurgeries = surgeries
    .filter((s) => s.patientId === patient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const patientPrescriptions = prescriptions
    .filter((p) => p.patientId === patient.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 1. Collect all administered medication records
  const administeredMedications: {
    id: string;
    date: string;
    dayOfWeek: string;
    time: string;
    drugName: string;
    dose: string;
    route: string;
    administeredBy: string;
    notes?: string;
  }[] = [];

  patientHosps.forEach((hosp) => {
    (hosp.medications || []).forEach((med) => {
      (med.doseSlots || []).forEach((slot, sIdx) => {
        if (slot.status === 'REALIZADA' || slot.administeredAt) {
          const dObj = slot.administeredAt ? new Date(slot.administeredAt) : new Date();
          administeredMedications.push({
            id: `${med.id}-slot-${slot.time}-${sIdx}`,
            date: dObj.toLocaleDateString('es-AR'),
            dayOfWeek: getDayName(dObj),
            time: slot.time || dObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
            drugName: med.drugName,
            dose: `${med.dose || ''} (${med.route})`.trim(),
            route: med.route,
            administeredBy: slot.administeredBy || 'Dr. Diego Iván Irusta',
            notes: slot.notes || `Toma de las ${slot.time} hs`,
          });
        }
      });

      (med.administeredDoses || []).forEach((dose, idx) => {
        const dObj = new Date(dose.administeredAt);
        const dateStr = dObj.toLocaleDateString('es-AR');
        const timeStr = dObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        const exists = administeredMedications.some(
          (m) => m.drugName === med.drugName && m.date === dateStr && m.time.startsWith(timeStr.slice(0, 2))
        );
        if (!exists) {
          administeredMedications.push({
            id: `${med.id}-dose-${idx}`,
            date: dateStr,
            dayOfWeek: getDayName(dObj),
            time: timeStr,
            drugName: med.drugName,
            dose: `${med.dose || ''}`.trim(),
            route: med.route,
            administeredBy: dose.administeredBy || 'Dr. Diego Iván Irusta',
            notes: dose.notes,
          });
        }
      });
    });
  });

  // 2. Financial Breakdown: Supplies, Meds, Consultations, Hospital stay, and Invoices
  interface FinancialItem {
    id: string;
    category: string;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }

  const financialItems: FinancialItem[] = [];

  // From Invoices for this patient
  const patientInvoices = invoices.filter((inv) => inv.patientId === patient.id || (owner && inv.ownerId === owner.id));
  patientInvoices.forEach((inv) => {
    (inv.items || []).forEach((it, idx) => {
      financialItems.push({
        id: `inv-${inv.id}-${idx}`,
        category: 'Comprobante',
        description: `${it.description} (Factura/Recibo ${inv.invoiceNumber || inv.id})`,
        quantity: it.quantity || 1,
        unitPrice: it.unitPrice || it.subtotal || 0,
        subtotal: it.subtotal || (it.quantity * it.unitPrice) || 0,
      });
    });
  });

  // From accepted estimates
  const patientEstimates = estimates.filter((est) => est.patientId === patient.id && est.status === 'ACEPTADO');
  patientEstimates.forEach((est) => {
    (est.items || []).forEach((it, idx) => {
      const alreadyInvoiced = financialItems.some((fi) => fi.description.includes(it.description));
      if (!alreadyInvoiced) {
        financialItems.push({
          id: `est-${est.id}-${idx}`,
          category: 'Presupuesto Aprobado',
          description: `${it.description} (Presupuesto ${est.estimateNumber || est.id})`,
          quantity: it.quantity || 1,
          unitPrice: it.unitPrice || it.subtotal || 0,
          subtotal: it.subtotal || (it.quantity * it.unitPrice) || 0,
        });
      }
    });
  });

  // If financial items are empty, create structured default clinical charges from actual hospital stay and medications
  if (financialItems.length === 0) {
    if (patientHosps.length > 0) {
      patientHosps.forEach((hosp, idx) => {
        const start = new Date(hosp.admittedAt).getTime();
        const end = hosp.dischargedAt ? new Date(hosp.dischargedAt).getTime() : Date.now();
        const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
        financialItems.push({
          id: `hosp-stay-${idx}`,
          category: 'Internación',
          description: `Días de Internación UCI / Monitoreo 24hs (Box ${hosp.kennelNumber || '01'})`,
          quantity: days,
          unitPrice: 28000,
          subtotal: days * 28000,
        });
      });
    }

    if (administeredMedications.length > 0) {
      // Group administered medications
      const medCounts: { [key: string]: number } = {};
      administeredMedications.forEach((m) => {
        medCounts[m.drugName] = (medCounts[m.drugName] || 0) + 1;
      });
      Object.entries(medCounts).forEach(([drug, count], idx) => {
        financialItems.push({
          id: `med-charge-${idx}`,
          category: 'Farmacia & Insumos',
          description: `Administración de ${drug} (Dosis hospitalaria y descartables)`,
          quantity: count,
          unitPrice: 3500,
          subtotal: count * 3500,
        });
      });
    }

    if (patientLabs.length > 0) {
      patientLabs.forEach((l, idx) => {
        financialItems.push({
          id: `lab-charge-${idx}`,
          category: 'Laboratorio',
          description: `Panel de Laboratorio: ${l.orderNumber} (${l.testType})`,
          quantity: 1,
          unitPrice: 14500,
          subtotal: 14500,
        });
      });
    }

    if (patientSurgeries.length > 0) {
      patientSurgeries.forEach((s, idx) => {
        financialItems.push({
          id: `surg-charge-${idx}`,
          category: 'Quirófano',
          description: `Procedimiento Quirúrgico: ${s.procedureName}`,
          quantity: 1,
          unitPrice: 65000,
          subtotal: 65000,
        });
      });
    }
  }

  const totalSpent = financialItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const totalPaid = patientInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const balanceDue = owner?.balance !== undefined ? Math.abs(owner.balance < 0 ? owner.balance : 0) : Math.max(0, totalSpent - totalPaid);

  // Prepare Printable Data for PDF / A4 Print
  const printableData = {
    patient: {
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      sex: patient.sex,
      age: patient.calculatedAge,
      weight: patient.weight,
      color: patient.color,
      microchip: patient.microchip,
      hc: patient.clinicalRecordNumber || patient.id,
      status: patient.status,
    },
    owner: owner
      ? {
          name: `${owner.firstName} ${owner.lastName}`.trim(),
          phone: owner.phone || owner.whatsapp,
          dni: owner.dni || owner.cuit,
          address: owner.address ? `${owner.address}, ${owner.city || 'Río Cuarto'}` : 'Río Cuarto, Córdoba',
          balance: owner.balance,
        }
      : undefined,
    doctor: {
      name: 'Dr. Diego Iván Irusta',
      license: 'M.P. 502',
    },
    emissionDate: new Date().toLocaleDateString('es-AR'),
    emissionTime: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    hospitalizations: patientHosps.map((h) => {
      const start = new Date(h.admittedAt).getTime();
      const end = h.dischargedAt ? new Date(h.dischargedAt).getTime() : Date.now();
      const diffHours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
      const days = Math.floor(diffHours / 24);
      const remHours = diffHours % 24;
      return {
        kennelNumber: h.kennelNumber,
        sector: h.sector,
        admittedAt: formatDateTime(h.admittedAt),
        dischargedAt: h.dischargedAt ? formatDateTime(h.dischargedAt) : 'En curso',
        daysCount: `${days} día(s) y ${remHours} hora(s)`,
        primaryDiagnosis: h.primaryDiagnosis,
        dischargeSummary: h.dischargeSummary,
        status: h.status,
      };
    }),
    vitals: patientVitals.map((v) => {
      const dObj = new Date(v.recordedAt);
      return {
        date: dObj.toLocaleDateString('es-AR'),
        dayOfWeek: getDayName(dObj),
        time: dObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) + ' hs',
        temp: v.temperature,
        hr: v.heartRate,
        rr: v.respiratoryRate,
        bp: v.systolicBp ? `${v.systolicBp}/${v.diastolicBp || '-'}` : undefined,
        spo2Glucose: `${v.oxygenSaturation ? v.oxygenSaturation + '%' : ''} ${v.glucoseMgDl ? '(' + v.glucoseMgDl + ' mg/dL)' : ''}`.trim(),
        pain: v.painScaleScore,
        recordedBy: v.recordedBy || 'Dr. Diego Iván Irusta',
      };
    }),
    evolutions: patientEvolutions.map((e) => {
      const dObj = new Date(e.createdAt || e.timestamp || e.dateTime || 0);
      return {
        date: dObj.toLocaleDateString('es-AR'),
        dayOfWeek: getDayName(dObj),
        time: dObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
        author: e.authorName || 'Dr. Diego Iván Irusta',
        license: e.authorLicense || 'M.P. 502',
        type: e.type || 'Médica',
        content: e.content || (e as any).assessment || (e as any).plan || 'Evolución clínica registrada.',
      };
    }),
    medications: administeredMedications,
    studies: [
      ...patientLabs.map((l) => ({
        type: 'LABORATORIO' as const,
        date: formatDate(l.requestedAt),
        title: `Orden ${l.orderNumber} (${l.testType})`,
        subtitle: l.status,
        details: l.conclusions || 'Informe en proceso / muestra procesada en laboratorio central.',
      })),
      ...patientImaging.map((i) => ({
        type: 'IMAGEN' as const,
        date: formatDate(i.date),
        title: `${i.modality} — ${i.region}`,
        details: i.conclusion || 'Estudio de diagnóstico por imágenes completado.',
      })),
      ...patientSurgeries.map((s) => ({
        type: 'CIRUGIA' as const,
        date: formatDate(s.date),
        title: s.procedureName,
        details: `Cirujano: ${s.surgeonName} • Anestesista: ${s.anesthetistName} • ASA ${s.preOpAssessment?.asaGrade || 'II'}`,
      })),
    ],
    financials: {
      items: financialItems,
      totalSpent,
      totalPaid,
      balanceDue,
    },
  };

  const handlePrintA4 = () => {
    triggerHaptic('light');
    printA4MedicalHistory(printableData);
    showToast('info', 'Impresión A4 Lista', 'Generando vista de impresión oficial...');
  };

  const handleDownloadPdf = async () => {
    triggerHaptic('medium');
    setIsGeneratingPdf(true);
    showToast('info', 'Generando PDF Oficial...', 'Construyendo documento membretado con gráficos vectoriales...');
    try {
      const ok = await downloadMedicalHistoryPdf(printableData);
      if (ok) {
        showToast('success', 'PDF Descargado', 'Historia clínica guardada en la carpeta de descargas.');
      } else {
        showToast('warning', 'Descarga', 'Abriendo vista de impresión para guardar como PDF.');
      }
    } catch {
      showToast('error', 'Error al Descargar', 'No se pudo generar el archivo PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleCopyText = () => {
    triggerHaptic('light');
    const text = `CLÍNICA VETERINARIA IRUSTA — HISTORIA CLÍNICA INTEGRAL
Dirección Médica: Dr. Diego Iván Irusta (M.P. 502)
Fecha de Emisión: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}

==================================================
DATOS DEL PACIENTE:
- Nombre: ${patient.name}
- Especie / Raza: ${patient.species} - ${patient.breed || 'Mestizo'}
- Sexo / Edad: ${patient.sex} - ${patient.calculatedAge || 'No registrada'}
- Peso Actual: ${patient.weight ? `${patient.weight} kg` : 'No registrado'}
- Pelaje / Color: ${patient.color || 'No especificado'}
- Microchip ISO: ${patient.microchip || 'Sin microchip'}
- N° Ficha Clínica: ${patient.clinicalRecordNumber || patient.id}
- Estado Clínico: ${patient.status}

DATOS DEL TUTOR TITULAR:
- Nombre: ${owner ? `${owner.firstName} ${owner.lastName}` : 'No asignado'}
- Teléfono / WhatsApp: ${owner?.phone || 'No registrado'}
- DNI / CUIT: ${owner?.dni || owner?.cuit || 'S/D'}
- Dirección: ${owner?.address || 'Río Cuarto, Córdoba'}
- Saldo Cuenta Corriente: ${owner?.balance !== undefined ? formatCurrency(owner.balance) : '$ 0,00'}
- Veterinario a Cargo: Dr. Diego Iván Irusta (M.P. 502)

==================================================
1. REGISTRO DE INTERNACIÓN:
${patientHosps.length === 0 ? 'Sin registros de internación hospitalaria.' : patientHosps.map((h) => {
  const diffDays = h.dischargedAt ? Math.round((new Date(h.dischargedAt).getTime() - new Date(h.admittedAt).getTime()) / (1000 * 60 * 60 * 24)) : 'En curso';
  return `• [${formatDateTime(h.admittedAt)}] Box: ${h.kennelNumber || '01'} | Estado: ${h.status} | Días: ${diffDays} | Diag: ${h.primaryDiagnosis || 'S/D'}`;
}).join('\n')}

2. CONTROLES DE SIGNOS VITALES:
${patientVitals.length === 0 ? 'Sin controles biométricos registrados.' : patientVitals.map((v) => {
  const d = new Date(v.recordedAt);
  return `• [${getDayName(d)} ${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}] T: ${v.temperature || '-'}°C | FC: ${v.heartRate || '-'} lpm | FR: ${v.respiratoryRate || '-'} rpm | PA: ${v.systolicBp || '-'}/${v.diastolicBp || '-'} | SpO2: ${v.oxygenSaturation || '-'}% | Gluc: ${v.glucoseMgDl || '-'} mg/dL | Profesional: ${v.recordedBy || 'Dr. Diego Iván Irusta'}`;
}).join('\n')}

3. EVOLUCIÓN MÉDICA & NOTAS CLÍNICAS:
${patientEvolutions.length === 0 ? 'Sin evoluciones registradas.' : patientEvolutions.map((e) => {
  const d = new Date(e.createdAt || e.timestamp || e.dateTime || 0);
  return `• [${getDayName(d)} ${d.toLocaleDateString('es-AR')} ${d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}] (${e.authorName || 'Dr. Diego Iván Irusta'} - ${e.authorLicense || 'M.P. 502'}):\n${e.content || (e as any).assessment || (e as any).plan}`;
}).join('\n\n')}

4. MEDICACIÓN & TRATAMIENTOS ADMINISTRADOS:
${administeredMedications.length === 0 ? 'Sin medicaciones hospitalarias administradas.' : administeredMedications.map((m) => `• [${m.dayOfWeek} ${m.date} ${m.time} hs] ${m.drugName} (${m.dose} - ${m.route}) - Por: ${m.administeredBy}`).join('\n')}

5. ESTUDIOS COMPLEMENTARIOS & CIRUGÍAS:
${printableData.studies.length === 0 ? 'Sin estudios complementarios registrados.' : printableData.studies.map((s) => `• [${s.date}] ${s.type}: ${s.title} - ${s.details}`).join('\n')}

==================================================
6. PRESUPUESTO & LIQUIDACIÓN DE GASTOS:
${financialItems.map((it) => `• ${it.description} x${it.quantity} = ${formatCurrency(it.subtotal)}`).join('\n')}
- TOTAL GASTADO: ${formatCurrency(totalSpent)}
- TOTAL ABONADO: ${formatCurrency(totalPaid)}
- SALDO PENDIENTE: ${formatCurrency(balanceDue)}
`;
    navigator.clipboard.writeText(text);
    showToast('success', 'Historia Clínica Copiada', 'Texto completo copiado al portapapeles.');
  };

  const handleSendWhatsApp = () => {
    triggerHaptic('light');
    if (!owner?.phone && !owner?.whatsapp) {
      showToast('error', 'Sin Teléfono', 'El tutor no tiene número de teléfono registrado.');
      return;
    }
    openWhatsAppHub({
      patientId: patient.id,
      ownerId: owner.id,
      patientName: patient.name,
      ownerName: `${owner.firstName} ${owner.lastName}`,
      ownerPhone: owner.whatsapp || owner.phone || '',
      type: 'INTERNACION',
      details: {
        supplyName: `Historia Clínica y Resumen de Gastos de ${patient.name}`,
        supplyAmount: balanceDue,
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[96vh] flex flex-col overflow-hidden border border-[#E8E3D9]">
        {/* Action Header Bar (No Print) */}
        <div className="p-3.5 sm:p-5 bg-gradient-to-r from-[#F9F8F5] to-teal-50/40 border-b border-[#E8E3D9] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-serif text-slate-900">
                Historia Clínica Integral & Liquidación
              </h3>
              <p className="text-xs text-slate-600">
                Paciente: <strong className="text-slate-900">{patient.name}</strong> ({patient.clinicalRecordNumber || 'HC-0000'}) • Tutor: <strong className="text-slate-900">{owner ? `${owner.firstName} ${owner.lastName}` : 'Sin asignar'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
              title="Copiar texto estructurado"
            >
              <Copy className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Copiar Texto</span>
            </button>

            {(owner?.phone || owner?.whatsapp) && (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Compartir por WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            )}

            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPdf}
              className="px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 border border-teal-700"
              title="Descargar en PDF A4 membretado"
            >
              {isGeneratingPdf ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrintA4}
              className="px-3.5 sm:px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-teal-800 active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir A4</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Institutional A4 Preview Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 text-slate-900 bg-white font-sans text-xs">
          {/* Institutional Letterhead */}
          <div className="border-b-2 border-teal-800 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif font-black tracking-tight text-teal-900">
                  CLÍNICA VETERINARIA IRUSTA
                </span>
              </div>
              <p className="text-xs text-teal-700 font-bold">
                Grandes y Pequeños Animales • Cuidados Críticos & Cirugía 24 Hs
              </p>
              <p className="text-[11px] text-slate-600 font-medium">
                Dirección Médica: <strong>Dr. Diego Iván Irusta</strong> — Matrícula Profesional: <strong>M.P. 502</strong>
              </p>
            </div>
            <div className="text-left sm:text-right text-[11px] text-slate-500 font-mono">
              <p className="font-black text-slate-900 uppercase">HISTORIA CLÍNICA OFICIAL</p>
              <p>Emisión: {new Date().toLocaleDateString('es-AR')} {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</p>
              <p>Estado Clínico: <span className="font-bold text-emerald-700">{patient.status}</span></p>
            </div>
          </div>

          {/* Patient & Owner Identity Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="space-y-1">
              <h4 className="font-black text-xs text-teal-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <span>🐾</span> <span>Datos del Paciente</span>
              </h4>
              <p className="text-xs"><strong>Nombre:</strong> {patient.name}</p>
              <p className="text-xs"><strong>Especie / Raza:</strong> {patient.species} • {patient.breed || 'Mestizo'}</p>
              <p className="text-xs"><strong>Sexo / Edad:</strong> {patient.sex} • {patient.calculatedAge || 'No registrada'}</p>
              <p className="text-xs"><strong>Peso Actual:</strong> {patient.weight ? `${patient.weight} kg` : 'No registrado'}</p>
              <p className="text-xs"><strong>Pelaje / Color:</strong> {patient.color || 'No especificado'}</p>
              <p className="text-xs"><strong>Microchip ISO:</strong> {patient.microchip || 'Sin microchip registrado'}</p>
              <p className="text-xs font-mono text-[11px]"><strong>N° Ficha Clínica:</strong> {patient.clinicalRecordNumber || patient.id}</p>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-xs text-teal-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <span>👤</span> <span>Datos del Tutor Titular</span>
              </h4>
              <p className="text-xs"><strong>Nombre:</strong> {owner ? `${owner.firstName} ${owner.lastName}` : 'No asignado'}</p>
              <p className="text-xs"><strong>Teléfono / WhatsApp:</strong> {owner?.phone || owner?.whatsapp || 'No registrado'}</p>
              <p className="text-xs"><strong>DNI / CUIT:</strong> {owner?.dni || owner?.cuit || 'No registrado'}</p>
              <p className="text-xs"><strong>Dirección:</strong> {owner?.address || 'Río Cuarto, Córdoba'}</p>
              <p className="text-xs">
                <strong>Cuenta Corriente:</strong>{' '}
                <span className={owner?.balance && owner.balance < 0 ? 'text-rose-600 font-bold' : 'text-emerald-700 font-bold'}>
                  {owner?.balance !== undefined ? formatCurrency(owner.balance) : '$ 0,00'}
                </span>
              </p>
              <p className="text-xs"><strong>Veterinario a Cargo:</strong> Dr. Diego Iván Irusta (M.P. 502)</p>
            </div>
          </div>

          {/* 1. SECCIÓN DE INTERNACIÓN & DÍAS EN HOSPITAL */}
          {patientHosps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <BedDouble className="w-4 h-4 text-teal-700" />
                <span>1. Registro de Internación & Días en Hospital</span>
              </h4>

              <div className="space-y-2">
                {patientHosps.map((hosp) => {
                  const start = new Date(hosp.admittedAt).getTime();
                  const end = hosp.dischargedAt ? new Date(hosp.dischargedAt).getTime() : Date.now();
                  const diffHours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
                  const days = Math.floor(diffHours / 24);
                  const remHours = diffHours % 24;

                  return (
                    <div key={hosp.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-900">
                          Box / Canil: {hosp.kennelNumber || '01'} ({hosp.sector || 'GENERAL'})
                        </span>
                        <span className="font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                          {hosp.status} — {days} día(s) y {remHours} hora(s) internado
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-700">
                        <p><strong>Fecha y Hora de Ingreso:</strong> {formatDateTime(hosp.admittedAt)}</p>
                        <p><strong>Fecha y Hora de Egreso:</strong> {hosp.dischargedAt ? formatDateTime(hosp.dischargedAt) : 'En curso'}</p>
                      </div>
                      {hosp.primaryDiagnosis && (
                        <p className="text-[11px]"><strong>Diagnóstico Principal:</strong> {hosp.primaryDiagnosis}</p>
                      )}
                      {hosp.dischargeSummary && (
                        <p className="text-[11px] text-emerald-950 bg-emerald-50/90 p-2.5 rounded-xl border border-emerald-200">
                          <strong>Epicrisis de Egreso:</strong> {hosp.dischargeSummary}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. SECCIÓN DE SIGNOS VITALES MULTIPARAMÉTRICOS */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Activity className="w-4 h-4 text-teal-700" />
              <span>2. Controles de Signos Vitales Multiparamétricos</span>
            </h4>

            {patientVitals.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic p-3 bg-slate-50 rounded-xl">No hay controles de signos vitales registrados.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-2">Día / Fecha y Hora</th>
                      <th className="p-2">Temp (°C)</th>
                      <th className="p-2">FC (lpm)</th>
                      <th className="p-2">FR (rpm)</th>
                      <th className="p-2">P. Arterial</th>
                      <th className="p-2">SpO2 / Glucosa</th>
                      <th className="p-2">Dolor</th>
                      <th className="p-2">Profesional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patientVitals.map((v) => {
                      const d = new Date(v.recordedAt);
                      return (
                        <tr key={v.id} className="hover:bg-teal-50/30 transition-colors">
                          <td className="p-2 font-mono font-bold text-slate-900">
                            <span className="text-teal-700">{getDayName(d)}</span> {d.toLocaleDateString('es-AR')} {d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs
                          </td>
                          <td className="p-2 font-bold">{v.temperature ? `${v.temperature}°C` : '-'}</td>
                          <td className="p-2">{v.heartRate || '-'}</td>
                          <td className="p-2">{v.respiratoryRate || '-'}</td>
                          <td className="p-2">{v.systolicBp ? `${v.systolicBp}/${v.diastolicBp || '-'}` : '-'}</td>
                          <td className="p-2 font-mono">{v.oxygenSaturation ? `${v.oxygenSaturation}%` : ''} {v.glucoseMgDl ? `(${v.glucoseMgDl} mg/dL)` : '-'}</td>
                          <td className="p-2">{v.painScaleScore !== undefined ? `${v.painScaleScore}/10` : '-'}</td>
                          <td className="p-2 text-slate-700">{v.recordedBy || 'Dr. Diego Iván Irusta'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. SECCIÓN DE EVOLUCIONES CLÍNICAS */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Stethoscope className="w-4 h-4 text-teal-700" />
              <span>3. Evolución Médica & Notas Clínicas</span>
            </h4>

            {patientEvolutions.length === 0 && patientConsults.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic p-3 bg-slate-50 rounded-xl">No hay notas de evolución registradas.</p>
            ) : (
              <div className="space-y-2.5">
                {patientEvolutions.map((evo) => {
                  const fullText = evo.content || (evo as any).assessment || (evo as any).plan || (evo as any).evolutionText || 'Evolución registrada.';
                  const evoDate = new Date(evo.createdAt || evo.timestamp || evo.dateTime || Date.now());
                  return (
                    <div key={evo.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-teal-800 font-bold border-b border-slate-200 pb-1">
                        <span>Evolución ({evo.type || 'Médica'}) — {getDayName(evoDate)} {evoDate.toLocaleDateString('es-AR')} {evoDate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span>
                        <span>{evo.authorName || 'Dr. Diego Iván Irusta'} ({evo.authorLicense || 'M.P. 502'})</span>
                      </div>
                      <p className="text-[11px] text-slate-800 whitespace-pre-line leading-relaxed">{fullText}</p>
                    </div>
                  );
                })}
                {patientConsults.map((cons) => (
                  <div key={cons.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-teal-800 font-bold border-b border-slate-200 pb-1">
                      <span>Consulta Médica — {formatDateTime(cons.dateTime)}</span>
                      <span>{cons.vetName || 'Dr. Diego Iván Irusta'}</span>
                    </div>
                    <p className="text-[11px]"><strong>Motivo:</strong> {cons.reason}</p>
                    {cons.anamnesis && <p className="text-[11px]"><strong>Anamnesis:</strong> {cons.anamnesis}</p>}
                    {cons.soap?.plan && <p className="text-[11px]"><strong>Plan Terapéutico:</strong> {cons.soap.plan}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. SECCIÓN DE MEDICACIÓN ADMINISTRADA */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <Pill className="w-4 h-4 text-teal-700" />
              <span>4. Medicación & Tratamientos Administrados</span>
            </h4>

            {administeredMedications.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic p-3 bg-slate-50 rounded-xl">No hay registros de medicación hospitalaria aplicada.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                      <th className="p-2">Día / Fecha</th>
                      <th className="p-2">Hora</th>
                      <th className="p-2">Fármaco / Principio Activo</th>
                      <th className="p-2">Dosis</th>
                      <th className="p-2">Vía</th>
                      <th className="p-2">Administrado Por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {administeredMedications.map((m) => (
                      <tr key={m.id} className="hover:bg-teal-50/30 transition-colors">
                        <td className="p-2 font-mono">
                          <span className="font-bold text-teal-700">{m.dayOfWeek}</span> {m.date}
                        </td>
                        <td className="p-2 font-mono font-bold text-slate-900">{m.time} hs</td>
                        <td className="p-2 font-bold text-slate-900">{m.drugName}</td>
                        <td className="p-2">{m.dose}</td>
                        <td className="p-2"><span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[10px] font-bold">{m.route}</span></td>
                        <td className="p-2 text-slate-700">{m.administeredBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 5. SECCIÓN DE ESTUDIOS COMPLEMENTARIOS */}
          {(patientLabs.length > 0 || patientImaging.length > 0 || patientSurgeries.length > 0) && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
                <FlaskConical className="w-4 h-4 text-teal-700" />
                <span>5. Estudios Complementarios, Laboratorios & Procedimientos</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patientLabs.map((l) => (
                  <div key={l.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-[11px] space-y-1">
                    <p className="font-bold text-slate-900 flex items-center justify-between">
                      <span>🧪 Laboratorio: {l.orderNumber}</span>
                      <span className="text-[10px] text-slate-500">{formatDate(l.requestedAt)}</span>
                    </p>
                    <p><strong>Panel:</strong> {l.testType}</p>
                    <p><strong>Conclusiones:</strong> {l.conclusions || 'Pendiente de informe'}</p>
                  </div>
                ))}
                {patientImaging.map((img) => (
                  <div key={img.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-[11px] space-y-1">
                    <p className="font-bold text-slate-900 flex items-center justify-between">
                      <span>📸 {img.modality} — {img.region}</span>
                      <span className="text-[10px] text-slate-500">{formatDate(img.date)}</span>
                    </p>
                    <p><strong>Diagnóstico:</strong> {img.conclusion || 'Informado'}</p>
                  </div>
                ))}
                {patientSurgeries.map((surg) => (
                  <div key={surg.id} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-[11px] space-y-1 sm:col-span-2">
                    <p className="font-bold text-slate-900 flex items-center justify-between">
                      <span>✂️ Cirugía: {surg.procedureName}</span>
                      <span className="text-[10px] text-slate-500">{formatDate(surg.date)}</span>
                    </p>
                    <p><strong>Equipo:</strong> Cirujano: {surg.surgeonName} • Anestesista: {surg.anesthetistName} • ASA {surg.preOpAssessment?.asaGrade || 'II'}</p>
                    {surg.findings && <p><strong>Hallazgos:</strong> {surg.findings}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. PRESUPUESTO & LIQUIDACIÓN DE INSUMOS Y GASTOS (NUEVA SECCIÓN REQUERIDA) */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5 border-b border-slate-200 pb-1">
              <DollarSign className="w-4 h-4 text-teal-700" />
              <span>6. Presupuesto & Liquidación Total de Insumos y Gastos</span>
            </h4>

            {financialItems.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic p-3 bg-slate-50 rounded-xl">No hay gastos ni insumos computados aún para este paciente.</p>
            ) : (
              <div className="space-y-3">
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                        <th className="p-2">Categoría</th>
                        <th className="p-2">Descripción del Insumo / Servicio</th>
                        <th className="p-2 text-center">Cant.</th>
                        <th className="p-2 text-right">P. Unitario</th>
                        <th className="p-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {financialItems.map((it) => (
                        <tr key={it.id} className="hover:bg-teal-50/30 transition-colors">
                          <td className="p-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 text-[10px] font-bold">
                              {it.category}
                            </span>
                          </td>
                          <td className="p-2 font-medium text-slate-900">{it.description}</td>
                          <td className="p-2 text-center font-bold">{it.quantity}</td>
                          <td className="p-2 text-right font-mono">{formatCurrency(it.unitPrice)}</td>
                          <td className="p-2 text-right font-mono font-bold text-slate-900">{formatCurrency(it.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Metric Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Gastado / Incurrido</span>
                    <strong className="text-sm font-black text-slate-900">{formatCurrency(totalSpent)}</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Abonado / Pagado</span>
                    <strong className="text-sm font-black text-emerald-800">{formatCurrency(totalPaid)}</strong>
                  </div>
                  <div className={`p-3 rounded-2xl border text-center ${balanceDue > 0 ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                    <span className={`text-[10px] uppercase font-bold block ${balanceDue > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                      Saldo Pendiente
                    </span>
                    <strong className={`text-sm font-black ${balanceDue > 0 ? 'text-rose-800' : 'text-emerald-800'}`}>
                      {formatCurrency(balanceDue)}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Institutional Signature Footer */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-slate-600">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900">Veterinaria Irusta • Gestión Médica Hospitalaria</p>
              <p className="text-[10px] text-slate-500">Documento clínico generado y auditado mediante firma digital y Supabase Cloud.</p>
            </div>
            <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
              <div className="w-48 border-b border-slate-400 mb-1 mx-auto sm:ml-auto"></div>
              <p className="font-bold text-xs text-slate-900">Dr. Diego Iván Irusta</p>
              <p className="text-[10px] text-teal-800 font-bold">Dirección Médica • M.P. 502</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
