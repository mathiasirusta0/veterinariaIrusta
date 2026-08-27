import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  Printer,
  Download,
  CheckCircle2,
  PenTool,
  RotateCcw,
  MessageCircle,
  Activity,
  HeartHandshake,
  FileCheck,
  AlertOctagon,
  Sparkles,
  User,
  Calendar,
  Lock,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Patient, Owner } from '../types';
import { triggerHaptic } from '../utils/haptics';
import {
  printA4ClinicalDocument,
  downloadClinicalDocumentPdf,
  PrintableClinicalDocumentData,
} from '../utils/printDocumentHelper';

export interface PatientInformedConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  owner?: Owner;
}

const CONSENT_TEMPLATES = [
  {
    id: 'CIRUGIA_ANESTESIA',
    title: 'Consentimiento de Cirugía & Procedimientos Anestésicos',
    icon: Activity,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    description: 'Para cirugías electivas o de urgencia, sedación y anestesia general inhalatoria.',
    getContent: (p: { name: string; species: string; breed: string; hc: string; ownerName: string; ownerDni: string; proc: string }) =>
      `Por la presente, yo ${p.ownerName} (DNI ${p.ownerDni}), en mi carácter de tutor/responsable del paciente ${p.name} (${p.species} ${p.breed}, HC ${p.hc}), autorizo al equipo médico de Clínica Veterinaria Ranquel bajo la dirección médica del Dr. Diego Iván Irusta (M.P. 502) a realizar el siguiente procedimiento:\n\nPROCEDIMIENTO A REALIZAR:\n${p.proc || 'Intervención quirúrgica y protocolo anestésico requerido según diagnóstico clínico.'}\n\nHe sido plenamente informado/a sobre los estudios prequirúrgicos requeridos (análisis de sangre, electrocardiograma, placas), los riesgos inherentes a todo acto anestésico/quirúrgico y las posibles complicaciones, asumiendo libre y conscientemente las decisiones terapéuticas.`,
  },
  {
    id: 'INTERNACION_UCI',
    title: 'Consentimiento de Internación en Terapia Intensiva & UCI',
    icon: ShieldCheck,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Para hospitalización en boxes de cuidados críticos, sueroterapia continua y monitoreo 24hs.',
    getContent: (p: { name: string; species: string; breed: string; hc: string; ownerName: string; ownerDni: string; proc: string }) =>
      `Yo, ${p.ownerName} (DNI ${p.ownerDni}), autorizo la internación y hospitalización continua de ${p.name} (HC ${p.hc}) en el sector de Cuidados Críticos / UCI de Clínica Veterinaria Ranquel.\n\nPROCEDIMIENTO & TRATAMIENTO:\n${p.proc || 'Monitoreo hemodinámico 24 horas, fluidoterapia endovenosa continua, administración de fármacos de urgencia y oxigenoterapia.'}\n\nAutorizo la colocación de accesos vasculares, sondajes y maniobras de soporte vital según criterio del médico de guardia.`,
  },
  {
    id: 'ESTUDIOS_SEDACION',
    title: 'Consentimiento para Estudios Diagnósticos & Procedimientos Menores',
    icon: FileText,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Para sedaciones breves, tomas de muestras, radiografías, ecografías o curaciones complejas.',
    getContent: (p: { name: string; species: string; breed: string; hc: string; ownerName: string; ownerDni: string; proc: string }) =>
      `Yo, ${p.ownerName} (DNI ${p.ownerDni}), autorizo la realización de estudios diagnósticos complementarios para ${p.name} (HC ${p.hc}).\n\nESTUDIO / PROCEDIMIENTO:\n${p.proc || 'Sedación para estudio radiológico / ecográfico, punción biópsica o curación bajo sedación.'}\n\nComprendo los beneficios diagnósticos y el protocolo de sujeción química aplicado por el equipo médico.`,
  },
  {
    id: 'EUTANASIA_HUMANITARIA',
    title: 'Acta de Consentimiento de Eutanasia Humanitaria',
    icon: HeartHandshake,
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    description: 'Procedimiento compasivo para pacientes con pronóstico irreversible y sufrimiento terminal.',
    getContent: (p: { name: string; species: string; breed: string; hc: string; ownerName: string; ownerDni: string; proc: string }) =>
      `Yo, ${p.ownerName} (DNI ${p.ownerDni}), en pleno uso de mis facultades y tras haber recibido el asesoramiento profesional del Dr. Diego Iván Irusta (M.P. 502) sobre el pronóstico irreversible de ${p.name} (HC ${p.hc}), solicito y autorizo de forma irrevocable la práctica de Eutanasia Humanitaria bajo protocolo farmacológico que garantice la ausencia total de dolor y sufrimiento animal.`,
  },
];

export const PatientInformedConsentModal: React.FC<PatientInformedConsentModalProps> = ({
  isOpen,
  onClose,
  patient,
  owner,
}) => {
  const { addDocument, currentUser, showToast } = useVet();

  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [specificProcedure, setSpecificProcedure] = useState('');
  const [customText, setCustomText] = useState('');
  const [mode, setMode] = useState<'VISUALIZAR' | 'FIRMA_DIGITAL'>('VISUALIZAR');

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signerName, setSignerName] = useState(owner ? `${owner.firstName} ${owner.lastName}` : '');
  const [signerDni, setSignerDni] = useState(owner?.dni || '');

  const activeTemplate = CONSENT_TEMPLATES[selectedTemplateIndex];

  useEffect(() => {
    if (patient) {
      const defaultOwnerName = owner ? `${owner.firstName} ${owner.lastName}` : 'Tutor Responsable';
      const defaultOwnerDni = owner?.dni || 'S/D';
      setSignerName(defaultOwnerName);
      setSignerDni(defaultOwnerDni);

      const generated = activeTemplate.getContent({
        name: patient.name,
        species: patient.species,
        breed: patient.breed || 'Mestizo',
        hc: patient.clinicalRecordNumber || patient.id,
        ownerName: defaultOwnerName,
        ownerDni: defaultOwnerDni,
        proc: specificProcedure,
      });
      setCustomText(generated);
    }
  }, [selectedTemplateIndex, specificProcedure, patient, owner]);

  if (!isOpen || !patient) return null;

  const currentDocData: PrintableClinicalDocumentData = {
    title: activeTemplate.title,
    type: activeTemplate.id,
    patientName: patient.name,
    species: patient.species,
    breed: patient.breed || 'Mestizo',
    hc: patient.clinicalRecordNumber || patient.id,
    ownerName: signerName || (owner ? `${owner.firstName} ${owner.lastName}` : 'Tutor Responsable'),
    ownerDni: signerDni || owner?.dni || 'S/D',
    ownerPhone: owner?.phone || owner?.whatsapp || 'S/D',
    date: new Date().toLocaleDateString('es-AR'),
    time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    content: customText,
    vetName: 'Dr. Diego Iván Irusta',
    vetLicense: 'M.P. 502',
    isSigned: hasSignature,
    signedByOwnerName: signerName,
    signedByOwnerDni: signerDni,
    signedAt: new Date().toLocaleString('es-AR'),
  };

  // Canvas Drawing Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSaveDigitalConsent = () => {
    triggerHaptic('medium');
    let signatureUrl = '';
    if (canvasRef.current && hasSignature) {
      signatureUrl = canvasRef.current.toDataURL('image/png');
    }

    addDocument({
      title: activeTemplate.title,
      type: (activeTemplate.id as any),
      patientId: patient.id,
      patientName: patient.name,
      ownerName: signerName,
      ownerDni: signerDni,
      content: customText,
      vetName: 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502',
      isSigned: true,
      signedByOwnerName: signerName,
      signedByOwnerDni: signerDni,
      signedAt: new Date().toISOString(),
      signatureDataUrl: signatureUrl,
    });

    showToast('success', 'Consentimiento Firmado', `Consentimiento informado para ${patient.name} guardado con éxito.`);
    onClose();
  };

  const handleDownloadPdf = async () => {
    triggerHaptic('medium');
    showToast('info', 'Generando PDF', 'Descargando consentimiento informado oficial...');
    const ok = await downloadClinicalDocumentPdf(currentDocData);
    if (ok) {
      showToast('success', 'PDF Descargado', 'Documento listo para firmar en papel o archivar.');
    }
  };

  const handlePrint = () => {
    triggerHaptic('light');
    showToast('info', 'Imprimiendo', 'Abriendo vista de impresión A4...');
    printA4ClinicalDocument(currentDocData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div
        className="bg-white rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              📄
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Consentimiento Informado Veterinario</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-900 border border-teal-200">
                  OFICIAL
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Paciente: <strong className="text-slate-800">{patient.name}</strong> ({patient.species} {patient.breed}) • Tutor: {owner ? `${owner.firstName} ${owner.lastName}` : 'Tutor Responsable'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs custom-scrollbar">
          {/* Template Selector Pills */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
              1. Seleccione el Tipo de Procedimiento o Consentimiento:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {CONSENT_TEMPLATES.map((tmpl, idx) => {
                const Icon = tmpl.icon;
                const isSelected = selectedTemplateIndex === idx;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setSelectedTemplateIndex(idx);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-teal-50 border-teal-500 shadow-xs ring-2 ring-teal-500/20 text-teal-950'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-700' : 'text-slate-500'}`} />
                      <span className="font-bold text-xs line-clamp-1">{tmpl.title.split(' ')[2] || tmpl.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{tmpl.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Procedure Details Input */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
              <span>2. Detalle Específico de la Intervención / Procedimiento Médico:</span>
              <span className="text-[10px] text-slate-400 font-normal">Editable</span>
            </label>
            <input
              type="text"
              value={specificProcedure}
              onChange={(e) => setSpecificProcedure(e.target.value)}
              placeholder="Ej: Ovariohisterectomía programada + Fluido continuo + Monitoreo multiparamétrico"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-hidden"
            />
          </div>

          {/* Mode Switcher: Visualizar / Firma Digital */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <span className="text-[11px] font-black uppercase text-slate-500">
              3. Modalidad de Firma:
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMode('VISUALIZAR')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'VISUALIZAR' ? 'bg-white text-teal-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📄 Para Imprimir en Papel
              </button>
              <button
                type="button"
                onClick={() => setMode('FIRMA_DIGITAL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  mode === 'FIRMA_DIGITAL' ? 'bg-teal-700 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PenTool className="w-3 h-3" />
                <span>🖋️ Firma Digital en Pantalla</span>
              </button>
            </div>
          </div>

          {/* Document Preview Card */}
          <div className="bg-white p-5 rounded-2xl border-2 border-slate-200 space-y-3.5 shadow-2xs">
            <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-teal-800 text-[10px] tracking-widest uppercase block">
                  CLÍNICA VETERINARIA RANQUEL
                </span>
                <h4 className="text-sm font-black text-slate-900">{activeTemplate.title}</h4>
                <p className="text-[10px] text-slate-500">Dirección Médica: Dr. Diego Iván Irusta (M.P. 502) • Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)</p>
              </div>
              <div className="text-right text-[10px] font-mono text-slate-400">
                <span>Fecha: {new Date().toLocaleDateString('es-AR')}</span>
              </div>
            </div>

            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={6}
              className="w-full p-3 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 leading-relaxed font-sans focus:bg-white focus:ring-2 focus:ring-teal-500 outline-hidden custom-scrollbar"
            />

            {/* Signature Area */}
            {mode === 'FIRMA_DIGITAL' ? (
              <div className="p-3.5 bg-slate-50 rounded-xl border border-teal-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-900 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-teal-700" />
                    <span>Firma Digital del Tutor (Dibujar con el Dedo o Mouse):</span>
                  </span>
                  {hasSignature && (
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-[10px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Limpiar Firma</span>
                    </button>
                  )}
                </div>

                <div className="border-2 border-dashed border-teal-400 rounded-xl bg-white overflow-hidden shadow-inner touch-none">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={120}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-28 cursor-crosshair block"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">Aclaración Tutor:</label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block">DNI / CUIT:</label>
                    <input
                      type="text"
                      value={signerDni}
                      onChange={(e) => setSignerDni(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-500 text-[11px]">
                <div className="text-center w-1/2 pr-2 border-r border-slate-200">
                  <div className="h-10 border-b border-slate-400 mb-1"></div>
                  <span>Firma del Tutor Responsable (DNI {signerDni || '___'})</span>
                </div>
                <div className="text-center w-1/2 pl-2">
                  <div className="h-10 border-b border-slate-400 mb-1 flex items-end justify-center pb-1">
                    <span className="font-serif font-black text-slate-800 text-xs">Dr. Diego Iván Irusta</span>
                  </div>
                  <span>Médico Veterinario • M.P. 502</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="px-4 py-2.5 bg-teal-700 hover:bg-teal-600 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md shadow-teal-700/20 active:scale-95 cursor-pointer"
              title="Descargar documento oficial en PDF listo para imprimir y firmar"
            >
              <Download className="w-4 h-4" />
              <span>📥 Descargar PDF</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 cursor-pointer"
              title="Imprimir documento membretado en hoja A4"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ Imprimir A4</span>
            </button>

            {mode === 'FIRMA_DIGITAL' && hasSignature && (
              <button
                type="button"
                onClick={handleSaveDigitalConsent}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Consentimiento Firmado</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs cursor-pointer self-end sm:self-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
