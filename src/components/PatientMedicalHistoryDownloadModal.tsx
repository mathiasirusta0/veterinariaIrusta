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
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Patient, Owner } from '../types';
import { formatDate, formatDateTime, formatTime, formatWeight } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';

interface PatientMedicalHistoryDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  owner?: Owner | null;
}

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
    documents,
    openWhatsAppHub,
    showToast,
  } = useVet();

  if (!isOpen || !patient) return null;

  // Filter items for this patient
  const patientVitals = vitals.filter((v) => v.patientId === patient.id).sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  const patientHosps = hospitalizations.filter((h) => h.patientId === patient.id).sort((a, b) => new Date(b.admittedAt).getTime() - new Date(a.admittedAt).getTime());
  const patientConsults = consultations.filter((c) => c.patientId === patient.id).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime());
  const patientEvolutions = clinicalEvolutions.filter((e) => e.patientId === patient.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const patientLabs = labOrders.filter((l) => l.patientId === patient.id).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
  const patientImaging = imagingStudies.filter((i) => i.patientId === patient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const patientSurgeries = surgeries.filter((s) => s.patientId === patient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const patientPrescriptions = prescriptions.filter((p) => p.patientId === patient.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Collect all administered medication records across hospitalizations
  const administeredMedications: {
    id: string;
    date: string;
    time: string;
    drugName: string;
    dose: string;
    route: string;
    administeredBy: string;
    notes?: string;
  }[] = [];

  patientHosps.forEach((hosp) => {
    (hosp.medications || []).forEach((med) => {
      (med.administeredDoses || []).forEach((dose, idx) => {
        const dObj = new Date(dose.administeredAt);
        administeredMedications.push({
          id: `${med.id}-${idx}`,
          date: dObj.toISOString().split('T')[0],
          time: dObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
          drugName: med.drugName,
          dose: `${med.dose || ''} ${med.doseUnit || ''}`.trim(),
          route: med.route,
          administeredBy: dose.administeredBy || 'Dr. Diego Irusta',
          notes: dose.notes,
        });
      });
    });
  });

  // Sort administered meds chronologically descending
  administeredMedications.sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());

  const handlePrint = () => {
    triggerHaptic('light');
    window.print();
  };

  const handleCopyText = () => {
    triggerHaptic('light');
    const text = `HISTORIA CLÍNICA COMPLETA — VETERINARIA IRUSTA
Dirección Médica: Dr. Diego Irusta (MP 8412)
Fecha de Emisión: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}

DATOS DEL PACIENTE:
- Nombre: ${patient.name}
- Especie / Raza: ${patient.species} - ${patient.breed || 'Mestizo'}
- Sexo / Edad: ${patient.sex} - ${patient.calculatedAge || 'No registrada'}
- Peso Actual: ${patient.weight ? `${patient.weight} kg` : 'No registrado'}
- Microchip: ${patient.microchip || 'No posee'}
- N° Ficha: ${patient.clinicalRecordNumber || patient.id}
- Tutor: ${owner ? `${owner.firstName} ${owner.lastName} (Tel: ${owner.phone || 'No registrado'})` : 'No asignado'}

HISTORIAL DE INTERNACIÓN:
${patientHosps.length === 0 ? 'Sin registros de internación.' : patientHosps.map((h) => {
  const diffDays = h.dischargedAt ? Math.round((new Date(h.dischargedAt).getTime() - new Date(h.admittedAt).getTime()) / (1000 * 60 * 60 * 24)) : 'En curso';
  return `• Ingreso: ${formatDateTime(h.admittedAt)} | Egreso: ${h.dischargedAt ? formatDateTime(h.dischargedAt) : 'Activa'} | Días: ${diffDays} | Box: ${h.kennelNumber || '01'} | Diag: ${h.primaryDiagnosis || 'Sin diagnóstico'}`;
}).join('\n')}

SIGNOS VITALES:
${patientVitals.length === 0 ? 'Sin registros de signos vitales.' : patientVitals.map((v) => `• ${formatDateTime(v.recordedAt)}: T° ${v.temperature || '-'}°C | FC ${v.heartRate || '-'} lpm | FR ${v.respiratoryRate || '-'} rpm | PA ${v.systolicBp || '-'}/${v.diastolicBp || '-'} mmHg | Gluc: ${v.glucoseMgDl || '-'} mg/dL | Por: ${v.recordedBy || 'Dr. Diego Irusta'}`).join('\n')}

EVOLUCIONES MÉDICAS:
${patientEvolutions.length === 0 ? 'Sin evoluciones registradas.' : patientEvolutions.map((e) => `• [${formatDateTime(e.timestamp)}] ${e.authorName}: ${e.content}`).join('\n')}

MEDICACIONES ADMINISTRADAS:
${administeredMedications.length === 0 ? 'Sin medicaciones hospitalarias registradas.' : administeredMedications.map((m) => `• [${m.date} ${m.time}] ${m.drugName} (${m.dose} - ${m.route}) - Administrado por: ${m.administeredBy}`).join('\n')}

ESTUDIOS COMPLEMENTARIOS:
${patientLabs.length === 0 && patientImaging.length === 0 ? 'Sin estudios complementarios registrados.' : [
  ...patientLabs.map((l) => `• Laboratorio [${formatDateTime(l.requestedAt)}]: ${l.orderNumber} - ${l.conclusions || 'Pendiente'}`),
  ...patientImaging.map((i) => `• Imagen [${formatDate(i.date)}]: ${i.modality} ${i.region} - ${i.conclusion || 'Informado'}`)
].join('\n')}
`;
    navigator.clipboard.writeText(text);
    showToast('success', 'Historia Clínica Copiada', 'Texto completo copiado al portapapeles listo para compartir.');
  };

  const handleSendWhatsApp = () => {
    triggerHaptic('light');
    if (!owner?.phone) {
      showToast('error', 'Sin Teléfono', 'El tutor no tiene número de WhatsApp registrado.');
      return;
    }
    openWhatsAppHub(patient.id, owner.id, 'INFORME_EVOLUCION', {
      patientName: patient.name,
      ownerName: `${owner.firstName} ${owner.lastName}`,
      date: new Date().toLocaleDateString('es-AR'),
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      vetName: 'Dr. Diego Irusta',
      details: {
        summary: 'Se adjunta el reporte oficial de historia clínica completa.',
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-[#E8E3D9]">
        {/* Action Header Bar (No Print) */}
        <div className="p-4 sm:p-5 bg-[#F9F8F5] border-b border-[#E8E3D9] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5F7359]/15 border border-[#5F7359]/30 text-[#1C2B1D] flex items-center justify-center font-bold">
              <FileText className="w-5 h-5 text-[#5F7359]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black font-serif text-[#162217]">
                Historia Clínica Integral & Epicrisis
              </h3>
              <p className="text-xs text-[#556956]">
                Paciente: <span className="font-bold text-[#162217]">{patient.name}</span> • Tutor: {owner ? `${owner.firstName} ${owner.lastName}` : 'No asignado'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="p-2 sm:px-3 sm:py-2 bg-white hover:bg-gray-100 border border-[#DDD7C8] rounded-xl text-xs font-bold text-[#1C2B1D] flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
              title="Copiar texto"
            >
              <Copy className="w-3.5 h-3.5 text-[#5F7359]" />
              <span className="hidden sm:inline">Copiar Texto</span>
            </button>

            {owner?.phone && (
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="p-2 sm:px-3 sm:py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                title="Enviar por WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 sm:px-4 py-2 bg-[#5F7359] hover:bg-[#4D5E48] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer border border-[#4D5E48]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Content (Printable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6 text-[#1C2B1D] bg-white print:p-0 print:m-0 font-sans text-xs">
          {/* Institutional Header */}
          <div className="border-b-2 border-[#162217] pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif font-black tracking-tight text-[#162217]">
                  CLÍNICA VETERINARIA IRUSTA
                </span>
              </div>
              <p className="text-xs text-[#5F7359] font-bold">
                Grandes y Pequeños Animales • Cuidados Críticos & Cirugía
              </p>
              <p className="text-[11px] text-[#6E502B] font-medium">
                Dirección Médica: <strong>Dr. Diego Irusta</strong> — Matrícula Profesional: <strong>MP 8412</strong>
              </p>
            </div>
            <div className="text-left sm:text-right text-[11px] text-gray-600 font-mono">
              <p className="font-bold text-[#162217]">HISTORIA CLÍNICA OFICIAL</p>
              <p>Emisión: {new Date().toLocaleDateString('es-AR')} {new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</p>
              <p>Estado: <span className="font-bold text-emerald-800">{patient.status}</span></p>
            </div>
          </div>

          {/* Patient & Owner Info Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F9F8F5] border border-[#E8E3D9]">
            <div className="space-y-1">
              <h4 className="font-black text-xs text-[#162217] uppercase tracking-wider flex items-center gap-1.5">
                <span>🐾</span> <span>Datos del Paciente</span>
              </h4>
              <p className="text-xs"><strong>Nombre:</strong> {patient.name}</p>
              <p className="text-xs"><strong>Especie / Raza:</strong> {patient.species} • {patient.breed || 'Mestizo'}</p>
              <p className="text-xs"><strong>Sexo / Edad:</strong> {patient.sex} • {patient.calculatedAge || 'No registrada'}</p>
              <p className="text-xs"><strong>Peso Actual:</strong> {patient.weight ? `${patient.weight} kg` : 'No registrado'}</p>
              <p className="text-xs"><strong>Microchip:</strong> {patient.microchip || 'Sin microchip registrado'}</p>
              <p className="text-xs font-mono text-[11px]"><strong>N° Ficha Clínica:</strong> {patient.clinicalRecordNumber || patient.id}</p>
            </div>

            <div className="space-y-1">
              <h4 className="font-black text-xs text-[#162217] uppercase tracking-wider flex items-center gap-1.5">
                <span>👤</span> <span>Datos del Tutor Responsable</span>
              </h4>
              <p className="text-xs"><strong>Nombre:</strong> {owner ? `${owner.firstName} ${owner.lastName}` : 'No asignado'}</p>
              <p className="text-xs"><strong>Teléfono / WhatsApp:</strong> {owner?.phone || 'No registrado'}</p>
              <p className="text-xs"><strong>Dirección:</strong> {owner?.address || 'Río Cuarto, Córdoba'}</p>
              <p className="text-xs"><strong>DNI / CUIT:</strong> {owner?.dni || owner?.cuit || 'No registrado'}</p>
              <p className="text-xs"><strong>Veterinario a Cargo:</strong> Dr. Diego Irusta (MP 8412)</p>
            </div>
          </div>

          {/* 1. SECCIÓN DE INTERNACIÓN & DÍAS INTERNADO */}
          {patientHosps.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#162217] flex items-center gap-1.5 border-b border-[#E8E3D9] pb-1">
                <BedDouble className="w-3.5 h-3.5 text-[#5F7359]" />
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
                    <div key={hosp.id} className="p-3 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between text-[11px]">
                        <span className="font-bold text-[#162217]">
                          Box / Canil: {hosp.kennelNumber || '01'} ({hosp.sector || 'GENERAL'})
                        </span>
                        <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                          {hosp.status} — {days} día(s) y {remHours} hora(s) internado
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-700">
                        <p><strong>Fecha y Hora de Ingreso:</strong> {formatDateTime(hosp.admittedAt)}</p>
                        <p><strong>Fecha y Hora de Egreso:</strong> {hosp.dischargedAt ? formatDateTime(hosp.dischargedAt) : 'En curso'}</p>
                      </div>
                      {hosp.primaryDiagnosis && (
                        <p className="text-[11px]"><strong>Diagnóstico Principal:</strong> {hosp.primaryDiagnosis}</p>
                      )}
                      {hosp.dischargeSummary && (
                        <p className="text-[11px] text-emerald-950 bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                          <strong>Epicrisis de Egreso:</strong> {hosp.dischargeSummary}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. SECCIÓN DE SIGNOS VITALES CRONOLÓGICOS */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#162217] flex items-center gap-1.5 border-b border-[#E8E3D9] pb-1">
              <Activity className="w-3.5 h-3.5 text-[#5F7359]" />
              <span>2. Controles de Signos Vitales Multiparamétricos</span>
            </h4>

            {patientVitals.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic">No hay controles de signos vitales registrados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#E8E3D9] text-[#6E502B]">
                      <th className="p-1.5">Fecha y Hora</th>
                      <th className="p-1.5">Temp (°C)</th>
                      <th className="p-1.5">FC (lpm)</th>
                      <th className="p-1.5">FR (rpm)</th>
                      <th className="p-1.5">P. Arterial</th>
                      <th className="p-1.5">SpO2 / Glucosa</th>
                      <th className="p-1.5">Dolor</th>
                      <th className="p-1.5">Profesional</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {patientVitals.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="p-1.5 font-mono font-bold text-[#162217]">{formatDateTime(v.recordedAt)}</td>
                        <td className="p-1.5">{v.temperature ? `${v.temperature}°C` : '-'}</td>
                        <td className="p-1.5">{v.heartRate || '-'}</td>
                        <td className="p-1.5">{v.respiratoryRate || '-'}</td>
                        <td className="p-1.5">{v.systolicBp ? `${v.systolicBp}/${v.diastolicBp || '-'}` : '-'}</td>
                        <td className="p-1.5">{v.oxygenSaturation ? `${v.oxygenSaturation}%` : ''} {v.glucoseMgDl ? `(${v.glucoseMgDl} mg/dL)` : '-'}</td>
                        <td className="p-1.5">{v.painScaleScore !== undefined ? `${v.painScaleScore}/10` : '-'}</td>
                        <td className="p-1.5 text-gray-700">{v.recordedBy || 'Dr. Diego Irusta'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. SECCIÓN DE EVOLUCIONES CLÍNICAS */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#162217] flex items-center gap-1.5 border-b border-[#E8E3D9] pb-1">
              <Stethoscope className="w-3.5 h-3.5 text-[#5F7359]" />
              <span>3. Evolución Médica & Notas Clínicas</span>
            </h4>

            {patientEvolutions.length === 0 && patientConsults.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic">No hay notas de evolución registradas.</p>
            ) : (
              <div className="space-y-2">
                {patientEvolutions.map((evo) => (
                  <div key={evo.id} className="p-2.5 rounded-xl border border-gray-200 bg-[#FAF8F5]/50 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#6E502B] font-bold">
                      <span>Evolución Médica — {formatDateTime(evo.timestamp)}</span>
                      <span>{evo.authorName || 'Dr. Diego Irusta'}</span>
                    </div>
                    <p className="text-[11px] text-[#1C2B1D] whitespace-pre-line">{evo.content}</p>
                  </div>
                ))}
                {patientConsults.map((cons) => (
                  <div key={cons.id} className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#6E502B] font-bold">
                      <span>Consulta Médica — {formatDateTime(cons.dateTime)}</span>
                      <span>{cons.vetName || 'Dr. Diego Irusta'}</span>
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
            <h4 className="text-xs font-black uppercase tracking-wider text-[#162217] flex items-center gap-1.5 border-b border-[#E8E3D9] pb-1">
              <Pill className="w-3.5 h-3.5 text-[#5F7359]" />
              <span>4. Medicación y Fármacos Administrados</span>
            </h4>

            {administeredMedications.length === 0 ? (
              <p className="text-[11px] text-gray-500 italic">No hay registros de medicación hospitalaria aplicada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-[#FAF8F5] border-b border-[#E8E3D9] text-[#6E502B]">
                      <th className="p-1.5">Fecha</th>
                      <th className="p-1.5">Hora</th>
                      <th className="p-1.5">Fármaco / Medicamento</th>
                      <th className="p-1.5">Dosis</th>
                      <th className="p-1.5">Vía</th>
                      <th className="p-1.5">Administrado Por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {administeredMedications.map((m) => (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="p-1.5 font-mono">{m.date}</td>
                        <td className="p-1.5 font-mono font-bold">{m.time} hs</td>
                        <td className="p-1.5 font-bold text-[#162217]">{m.drugName}</td>
                        <td className="p-1.5">{m.dose}</td>
                        <td className="p-1.5"><span className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-bold">{m.route}</span></td>
                        <td className="p-1.5 text-gray-700">{m.administeredBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 5. SECCIÓN DE ESTUDIOS COMPLEMENTARIOS & CIRUGÍAS */}
          {(patientLabs.length > 0 || patientImaging.length > 0 || patientSurgeries.length > 0) && (
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#162217] flex items-center gap-1.5 border-b border-[#E8E3D9] pb-1">
                <FlaskConical className="w-3.5 h-3.5 text-[#5F7359]" />
                <span>5. Estudios Complementarios & Procedimientos</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patientLabs.map((l) => (
                  <div key={l.id} className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[11px] space-y-1">
                    <p className="font-bold text-[#162217] flex items-center justify-between">
                      <span>🧪 Laboratorio: {l.orderNumber}</span>
                      <span className="text-[10px] text-gray-500">{formatDate(l.requestedAt)}</span>
                    </p>
                    <p><strong>Conclusiones:</strong> {l.conclusions || 'Pendiente de informe'}</p>
                  </div>
                ))}
                {patientImaging.map((img) => (
                  <div key={img.id} className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[11px] space-y-1">
                    <p className="font-bold text-[#162217] flex items-center justify-between">
                      <span>📸 {img.modality} — {img.region}</span>
                      <span className="text-[10px] text-gray-500">{formatDate(img.date)}</span>
                    </p>
                    <p><strong>Diagnóstico:</strong> {img.conclusion || 'Informado'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature Footer */}
          <div className="pt-8 border-t border-[#E8E3D9] flex flex-col sm:flex-row items-center justify-between gap-6 text-[11px] text-gray-700">
            <div className="space-y-0.5">
              <p className="font-bold text-[#162217]">Veterinaria Irusta • Gestión Médica Hospitalaria</p>
              <p className="text-[10px] text-gray-500">Documento clínico generado y auditado mediante firma digital y Supabase Cloud.</p>
            </div>
            <div className="text-center sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
              <div className="w-48 border-b border-gray-400 mb-1 mx-auto sm:ml-auto"></div>
              <p className="font-bold text-xs text-[#162217]">Dr. Diego Irusta</p>
              <p className="text-[10px] text-[#6E502B]">Dirección Médica • MP 8412</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
