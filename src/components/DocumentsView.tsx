import React, { useState, useRef, useMemo } from 'react';
import {
  FileText,
  Plus,
  ShieldCheck,
  Printer,
  PenTool,
  CheckCircle2,
  Search,
  Filter,
  AlertTriangle,
  Send,
  MessageCircle,
  Clock,
  Download,
  X,
  FileCheck,
  Lock,
  User,
  Sparkles,
  Eye,
  Trash2,
  Award,
  Activity,
  HeartHandshake,
  AlertOctagon,
  Stethoscope,
  Building2,
  Calendar,
  Check,
  Share2,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { ClinicalDocument, DocumentType } from '../types';
import { formatDate, formatDateTime, maskDni } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { EmptyState, PageHeader } from './ui';
import {
  printA4ClinicalDocument,
  downloadClinicalDocumentPdf,
  PrintableClinicalDocumentData,
} from '../utils/printDocumentHelper';

export const DOCUMENT_TEMPLATES: {
  type: DocumentType;
  title: string;
  category: 'CONSENTIMIENTO' | 'CERTIFICADO' | 'LEGAL';
  badgeColor: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultContent: (p: {
    name: string;
    species: string;
    breed: string;
    hc: string;
    ownerName: string;
    ownerDni: string;
    vetName: string;
    vetLicense: string;
  }) => string;
}[] = [
  {
    type: 'CONSENTIMIENTO_ANESTESIA',
    title: 'Consentimiento de Cirugía & Procedimientos Anestésicos',
    category: 'CONSENTIMIENTO',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    icon: Activity,
    defaultContent: (p) =>
      `Por la presente, yo ${p.ownerName} (DNI ${p.ownerDni}), en mi carácter de tutor/responsable del paciente ${p.name} (${p.species} ${p.breed}, HC ${p.hc}), autorizo al equipo médico de Veterinaria Irusta bajo la dirección de ${p.vetName} (${p.vetLicense}) a realizar los procedimientos quirúrgicos y anestésicos necesarios.\n\nHe sido plenamente informado/a sobre la naturaleza de la intervención, los estudios prequirúrgicos requeridos, los riesgos inherentes a todo acto anestésico y las posibles complicaciones, asumiendo libre y conscientemente las decisiones terapéuticas.`,
  },
  {
    type: 'CONSENTIMIENTO_INTERNACION_UCI',
    title: 'Consentimiento de Internación en Terapia Intensiva & UCI',
    category: 'CONSENTIMIENTO',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: ShieldCheck,
    defaultContent: (p) =>
      `Yo, ${p.ownerName} (DNI ${p.ownerDni}), autorizo la internación y hospitalización de urgencia de ${p.name} (HC ${p.hc}) en el sector de Cuidados Críticos / UCI de Veterinaria Irusta.\n\nAutorizo la colocación de accesos vasculares, fluidoterapia endovenosa continua, administración de fármacos de urgencia, oxigenoterapia y monitoreo hemodinámico según criterio profesional del equipo de guardia.`,
  },
  {
    type: 'CONSENTIMIENTO_EUTANASIA',
    title: 'Acta de Consentimiento de Eutanasia Humanitaria',
    category: 'CONSENTIMIENTO',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: HeartHandshake,
    defaultContent: (p) =>
      `Yo, ${p.ownerName} (DNI ${p.ownerDni}), en pleno uso de mis facultades y tras haber recibido el asesoramiento profesional del Dr/a. ${p.vetName} (${p.vetLicense}) sobre el pronóstico irreversible e inviable de ${p.name} (HC ${p.hc}), solicito y autorizo de forma irrevocable la práctica del procedimiento de Eutanasia Humanitaria bajo protocolo farmacológico que garantice la ausencia total de dolor y sufrimiento animal.`,
  },
  {
    type: 'CERTIFICADO_SALUD_VIAJE',
    title: 'Certificado de Aptitud Sanitaria y Tránsito Federal SENASA',
    category: 'CERTIFICADO',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    icon: Award,
    defaultContent: (p) =>
      `El/La profesional que suscribe, Dr/a. ${p.vetName} (${p.vetLicense}), CERTIFICA que en el día de la fecha ha examinado clínicamente al paciente ${p.name} (${p.species}, ${p.breed}, HC ${p.hc}), perteneciente al tutor ${p.ownerName} (DNI ${p.ownerDni}), encontrándolo en EXCELENTE ESTADO GENERAL DE SALUD, sin signos clínicos compatibles con enfermedades infectocontagiosas o parasitarias de denuncia obligatoria, encontrándose APTO para el traslado y tránsito interjurisdiccional.`,
  },
  {
    type: 'CERTIFICADO_VACUNACION_ANTIRRABICA',
    title: 'Certificado Oficial de Vacunación Antirrábica (Ley 22.953)',
    category: 'CERTIFICADO',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: FileCheck,
    defaultContent: (p) =>
      `CERTIFICADO OFICIAL DE VACUNACIÓN ANTIRRÁBICA:\n\nPaciente: ${p.name} (${p.species} ${p.breed}, HC ${p.hc})\nTutor: ${p.ownerName} (DNI ${p.ownerDni})\nVeterinario actuante: Dr/a. ${p.vetName} (${p.vetLicense})\n\nSe certifica la aplicación conforme a la legislación sanitaria vigente, biológico con fecha de vigencia por 12 meses calendario a partir de la emisión del presente.`,
  },
  {
    type: 'ALTA_VOLUNTARIA_DESLINDE',
    title: 'Acta de Alta Voluntaria & Deslinde de Responsabilidad Médica',
    category: 'LEGAL',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: AlertOctagon,
    defaultContent: (p) =>
      `Yo, ${p.ownerName} (DNI ${p.ownerDni}), manifiesto expresamente que he decidido retirar voluntariamente a mi animal ${p.name} (HC ${p.hc}) de la internación hospitalaria, EN CONTRA DEL CONSEJO Y RECOMENDACIÓN MÉDICA explícita emitida por el equipo veterinario.\n\nAsumo toda la responsabilidad por las eventuales consecuencias que dicha decisión pueda ocasionar en la salud o vida del paciente, deslindando al centro médico de cualquier responsabilidad civil o penal.`,
  },
];

// Helper para parsear contenido que pueda ser JSON de evolución o texto libre
function parseDocumentContent(rawContent: string) {
  if (!rawContent) return { isJson: false, text: '' };
  const trimmed = rawContent.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        isJson: true,
        data: parsed,
        text: parsed.assessment || parsed.plan || parsed.content || rawContent,
      };
    } catch {
      return { isJson: false, text: rawContent };
    }
  }
  return { isJson: false, text: rawContent };
}

export const DocumentsView: React.FC = () => {
  const {
    documents,
    patients,
    owners,
    currentUser,
    addDocument,
    signDocument,
    openWhatsAppHub,
    showToast,
  } = useVet();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('TODOS');

  // Generation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<ClinicalDocument | null>(null);

  // Signing Modal State
  const [signingDocId, setSigningDocId] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerDni, setSignerDni] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize Create Modal with selected patient & template
  const handleOpenCreateModal = (templateIdx = 0) => {
    triggerHaptic('light');
    setSelectedTemplateIndex(templateIdx);
    const pat = patients.find((p) => p.id === (selectedPatientId || patients[0]?.id)) || patients[0];
    const own = owners.find((o) => o.id === pat?.ownerId);
    const tmpl = DOCUMENT_TEMPLATES[templateIdx];

    const contentText = tmpl.defaultContent({
      name: pat?.name || 'Paciente',
      species: pat?.species || 'Canino',
      breed: pat?.breed || 'Mestizo',
      hc: pat?.clinicalRecordNumber || 'HC-0001',
      ownerName: own ? `${own.firstName} ${own.lastName}` : 'Tutor Responsable',
      ownerDni: own?.dni || 'S/D',
      vetName: currentUser?.name || 'Dr. Diego Iván Irusta',
      vetLicense: currentUser?.licenseNumber || 'M.P. 502',
    });

    setCustomTitle(tmpl.title);
    setCustomContent(contentText);
    setShowCreateModal(true);
  };

  const handlePatientChangeInModal = (patId: string) => {
    setSelectedPatientId(patId);
    const pat = patients.find((p) => p.id === patId);
    const own = owners.find((o) => o.id === pat?.ownerId);
    const tmpl = DOCUMENT_TEMPLATES[selectedTemplateIndex];

    const contentText = tmpl.defaultContent({
      name: pat?.name || 'Paciente',
      species: pat?.species || 'Canino',
      breed: pat?.breed || 'Mestizo',
      hc: pat?.clinicalRecordNumber || 'HC-0001',
      ownerName: own ? `${own.firstName} ${own.lastName}` : 'Tutor Responsable',
      ownerDni: own?.dni || 'S/D',
      vetName: currentUser?.name || 'Dr. Diego Iván Irusta',
      vetLicense: currentUser?.licenseNumber || 'M.P. 502',
    });

    setCustomContent(contentText);
  };

  const handleSaveNewDocument = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    const pat = patients.find((p) => p.id === selectedPatientId) || patients[0];
    if (!pat) return;
    const tmpl = DOCUMENT_TEMPLATES[selectedTemplateIndex];

    addDocument({
      type: tmpl.type,
      title: customTitle.trim() || tmpl.title,
      patientId: pat.id,
      ownerId: pat.ownerId,
      vetName: currentUser?.name || 'Dr. Diego Iván Irusta',
      content: customContent.trim(),
      isSigned: false,
    });

    showToast('success', 'Documento Generado', `"${customTitle}" creado exitosamente.`);
    setShowCreateModal(false);
  };

  // Canvas Signature
  const getCanvasCoords = (
    canvas: HTMLCanvasElement,
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const coords = getCanvasCoords(canvas, e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const coords = getCanvasCoords(canvas, e);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = '#0f766e';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleOpenSignatureModal = (doc: ClinicalDocument) => {
    triggerHaptic('medium');
    const own = owners.find((o) => o.id === doc.ownerId);
    setSigningDocId(doc.id);
    setSignerName(own ? `${own.firstName} ${own.lastName}` : '');
    setSignerDni(own?.dni || '');
  };

  const handleSaveSignature = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    if (!signingDocId || !signerName.trim() || !signerDni.trim()) {
      showToast('error', 'Campos Incompletos', 'Complete nombre y DNI del tutor.');
      return;
    }
    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL() : '';
    signDocument(signingDocId, signerName.trim(), signerDni.trim(), dataUrl);
    showToast('success', 'Firma Digital Registrada', 'El documento quedó legalmente firmado.');
    setSigningDocId(null);
    setSignerName('');
    setSignerDni('');

    // If preview is open, update preview doc
    if (previewDoc && previewDoc.id === signingDocId) {
      setPreviewDoc((prev) =>
        prev
          ? {
              ...prev,
              isSigned: true,
              signedByOwnerName: signerName.trim(),
              signedByOwnerDni: signerDni.trim(),
              signatureDataUrl: dataUrl,
            }
          : null
      );
    }
  };

  // Helper para preparar datos de impresión y PDF
  const preparePrintableData = (doc: ClinicalDocument): PrintableClinicalDocumentData => {
    const patient = patients.find((p) => p.id === doc.patientId);
    const owner = owners.find((o) => o.id === doc.ownerId);
    const parsed = parseDocumentContent(doc.content);

    let cleanText = doc.content;
    if (parsed.isJson && parsed.data) {
      cleanText = `EVOLUCIÓN MÉDICA INTEGRAL\nSector: ${parsed.data.sector || 'UCI / Guardia'}\nTurno: ${parsed.data.shift || 'General'}\nProfesional: ${parsed.data.authorName || doc.vetName || 'Dr. Diego Iván Irusta'} (${parsed.data.authorLicense || 'M.P. 502'})\n\nEVALUACIÓN MÉDICA:\n${parsed.data.assessment || 'Sin evaluación registrada'}\n\nPLAN TERAPÉUTICO & INDICACIONES:\n${parsed.data.plan || 'Mantener indicaciones previas'}${parsed.data.notes ? `\n\nOBSERVACIONES:\n${parsed.data.notes}` : ''}`;
    }

    return {
      title: doc.title,
      type: doc.type,
      patientName: patient?.name || 'Paciente',
      species: patient?.species || 'Canino',
      breed: patient?.breed || 'Mestizo',
      hc: patient?.clinicalRecordNumber || 'HC-2026',
      ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Tutor Responsable',
      ownerDni: owner?.dni || 'S/D',
      ownerPhone: owner?.phone || owner?.whatsapp || 'S/D',
      date: formatDate(doc.createdAt),
      time: new Date(doc.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      content: cleanText,
      vetName: doc.vetName || 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502',
      isSigned: doc.isSigned,
      signedByOwnerName: doc.signedByOwnerName,
      signedByOwnerDni: doc.signedByOwnerDni,
      signatureDataUrl: doc.signatureDataUrl,
    };
  };

  const handlePrintDoc = (doc: ClinicalDocument) => {
    triggerHaptic('light');
    const data = preparePrintableData(doc);
    printA4ClinicalDocument(data);
  };

  const handleDownloadPdf = (doc: ClinicalDocument) => {
    triggerHaptic('light');
    const data = preparePrintableData(doc);
    downloadClinicalDocumentPdf(data);
    showToast('info', 'Generando PDF', 'Abriendo vista previa para guardar como PDF.');
  };

  const handleSendWhatsApp = (doc: ClinicalDocument) => {
    triggerHaptic('light');
    const patient = patients.find((p) => p.id === doc.patientId);
    const owner = owners.find((o) => o.id === doc.ownerId);

    openWhatsAppHub({
      patientName: patient?.name || 'Paciente',
      ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Tutor',
      ownerPhone: owner?.phone || owner?.whatsapp || '',
      type: 'DOCUMENTO',
      details: {
        docTitle: doc.title,
        isSigned: doc.isSigned,
        date: formatDate(doc.createdAt),
      },
    });
  };

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const q = searchTerm.toLowerCase().trim();
      const pat = patients.find((p) => p.id === doc.patientId);
      const own = owners.find((o) => o.id === doc.ownerId);

      const matchesSearch =
        !q ||
        doc.title.toLowerCase().includes(q) ||
        doc.content.toLowerCase().includes(q) ||
        (pat && pat.name.toLowerCase().includes(q)) ||
        (own && `${own.firstName} ${own.lastName}`.toLowerCase().includes(q));

      const matchesFilter =
        filterType === 'TODOS' ||
        (filterType === 'FIRMADOS' && doc.isSigned) ||
        (filterType === 'PENDIENTES' && !doc.isSigned) ||
        (filterType === 'CONSENTIMIENTOS' && doc.type.includes('CONSENTIMIENTO')) ||
        (filterType === 'CERTIFICADOS' && doc.type.includes('CERTIFICADO')) ||
        (filterType === 'EVOLUCIONES' && (doc.type.includes('EVOLUCION') || doc.type.includes('ALTA') || doc.type.includes('INFORME')));

      return matchesSearch && matchesFilter;
    });
  }, [documents, searchTerm, filterType, patients, owners]);

  return (
    <div className="space-y-6 pb-20 w-full max-w-full">
      {/* 1. Header */}
      <PageHeader
        category="Gestión Legal & Expedición de Certificados"
        title="Documentos Clínicos & Legales"
        description="Emisión de consentimientos informados, certificados oficiales SENASA, evoluciones y firma digital en pantalla"
        icon={FileText}
        actions={[
          {
            label: 'Nuevo Documento',
            icon: Plus,
            onClick: () => handleOpenCreateModal(0),
            variant: 'primary',
          },
        ]}
      />

      {/* 2. Quick Template Selector Ribbons */}
      <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-3xl shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
            Plantillas Oficiales de Emisión Rápida:
          </span>
          <span className="text-[11px] font-bold text-teal-700">Veterinaria Irusta</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 text-xs">
          {DOCUMENT_TEMPLATES.map((tmpl, idx) => {
            const Icon = tmpl.icon;
            return (
              <button
                key={tmpl.type}
                type="button"
                onClick={() => handleOpenCreateModal(idx)}
                className="p-3.5 bg-slate-50 hover:bg-teal-50/80 border border-slate-200 hover:border-teal-400 rounded-2xl text-left transition-all active:scale-95 flex flex-col justify-between group shadow-2xs cursor-pointer min-h-[110px]"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 group-hover:border-teal-300 group-hover:bg-teal-600 group-hover:text-white text-slate-700 flex items-center justify-center transition-all shadow-2xs">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white/80 border border-slate-200 text-slate-600">
                      {tmpl.category}
                    </span>
                  </div>
                  <strong className="text-xs font-bold text-slate-800 group-hover:text-teal-950 line-clamp-2 leading-snug">
                    {tmpl.title}
                  </strong>
                </div>

                <div className="text-[11px] font-bold text-teal-700 group-hover:text-teal-800 flex items-center gap-1 pt-2">
                  <span>Emitir</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, paciente, tutor o contenido..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'PENDIENTES', label: '⏳ Pendientes' },
            { id: 'FIRMADOS', label: '✅ Firmados' },
            { id: 'CONSENTIMIENTOS', label: '📝 Consentimientos' },
            { id: 'CERTIFICADOS', label: '📜 Certificados' },
            { id: 'EVOLUCIONES', label: '🩺 Evoluciones & Altas' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setFilterType(f.id);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                filterType === f.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No se encontraron documentos"
          description="Generá un nuevo consentimiento o certificado haciendo clic en las plantillas superiores."
          actionLabel="+ Generar Documento"
          onAction={() => handleOpenCreateModal(0)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => {
            const patient = patients.find((p) => p.id === doc.patientId);
            const owner = owners.find((o) => o.id === doc.ownerId);
            const parsed = parseDocumentContent(doc.content);

            return (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 hover:border-teal-400 rounded-3xl p-4 sm:p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Header Card */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 text-teal-800">
                          {doc.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDate(doc.createdAt)}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Paciente: <strong className="text-slate-800">{patient?.name || 'S/D'}</strong> ({patient?.species || 'Canino'} {patient?.breed ? `· ${patient.breed}` : ''}) • Tutor: <strong className="text-slate-800">{owner ? `${owner.firstName} ${owner.lastName}` : 'S/D'}</strong>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border whitespace-nowrap ${
                        doc.isSigned
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {doc.isSigned ? '✓ Firmado' : '⏳ Pendiente'}
                    </span>
                  </div>

                  {/* Body Content: Clean Formatted View (No raw JSON!) */}
                  {parsed.isJson && parsed.data ? (
                    <div className="bg-slate-50/90 rounded-2xl border border-slate-200/80 p-3.5 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 border-b border-slate-200/60 pb-1.5">
                        <span className="flex items-center gap-1 text-teal-800 font-black">
                          <Stethoscope className="w-3.5 h-3.5" />
                          <span>{parsed.data.authorName || doc.vetName || 'Dr. Diego Iván Irusta'}</span>
                          <span className="font-normal opacity-80">({parsed.data.authorLicense || 'M.P. 502'})</span>
                        </span>
                        <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                          {parsed.data.sector || 'UCI / Guardia'} · {parsed.data.shift || 'DIURNO'}
                        </span>
                      </div>

                      {parsed.data.assessment && (
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-extrabold uppercase text-slate-500 block">Evaluación Médica:</span>
                          <p className="text-slate-800 font-medium leading-relaxed">{parsed.data.assessment}</p>
                        </div>
                      )}

                      {parsed.data.plan && (
                        <div className="space-y-0.5 bg-teal-50/70 p-2.5 rounded-xl border border-teal-200/70">
                          <span className="text-[10px] font-extrabold uppercase text-teal-900 block">Plan Terapéutico & Indicaciones:</span>
                          <p className="text-teal-950 font-medium leading-relaxed">{parsed.data.plan}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line font-sans">
                      {doc.content}
                    </div>
                  )}

                  {/* Signed info block */}
                  {doc.isSigned && (
                    <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-emerald-900 block">Firma Digital Registrada:</span>
                        <strong className="text-slate-900">{doc.signedByOwnerName || (owner ? `${owner.firstName} ${owner.lastName}` : 'Tutor')}</strong>
                        <span className="text-slate-500 text-[11px] block font-mono">DNI: {maskDni(doc.signedByOwnerDni || owner?.dni || 'S/D')}</span>
                      </div>
                      {doc.signatureDataUrl ? (
                        <img
                          src={doc.signatureDataUrl}
                          alt="Firma Manuscrita"
                          className="h-10 max-w-[120px] object-contain border border-emerald-200 bg-white rounded-lg p-1"
                        />
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-1 rounded border border-emerald-200">
                          ✓ Verificada
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    {/* View Modal Button */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setPreviewDoc(doc);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                      title="Ver vista previa completa"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver</span>
                    </button>

                    {/* PDF Download */}
                    <button
                      type="button"
                      onClick={() => handleDownloadPdf(doc)}
                      className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl border border-teal-200 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Descargar documento en PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-teal-600" />
                      <span>PDF</span>
                    </button>

                    {/* Print A4 */}
                    <button
                      type="button"
                      onClick={() => handlePrintDoc(doc)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Imprimir documento oficial"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp */}
                    {owner && (
                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(doc)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl border border-emerald-200 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Enviar por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    )}

                    {/* Sign Button */}
                    {!doc.isSigned && (
                      <button
                        type="button"
                        onClick={() => handleOpenSignatureModal(doc)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Firmar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL: VISTA PREVIA MEMBRETADA OFICIAL A4 */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto flex flex-col justify-between">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <div>
                  <h3 className="text-base font-black text-slate-900">{previewDoc.title}</h3>
                  <span className="text-[11px] text-slate-400">Vista Oficial Membretada A4</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Hoja A4 Membretada Preview */}
            <div className="bg-slate-50 border border-slate-300 rounded-2xl p-5 sm:p-7 space-y-5 text-xs text-slate-800 shadow-inner">
              {/* Membrete */}
              <div className="border-b-2 border-teal-700 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <div className="text-lg font-black text-teal-800">VETERINARIA IRUSTA</div>
                  <div className="text-[11px] text-slate-600 font-bold">Centro Hospitalario Veterinario • Guardia 24 Horas</div>
                  <div className="text-[10px] text-slate-500">Río Cuarto, Córdoba • Tel/WhatsApp: +54 9 2942 47-7136</div>
                  <div className="text-[10px] text-slate-500 font-medium">Dirección Médica: Dr. Diego Iván Irusta • M.P. 502</div>
                </div>
                <div className="bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl text-right">
                  <span className="text-[10px] font-black text-teal-800 uppercase block">{previewDoc.type.replace(/_/g, ' ')}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Fecha: {formatDate(previewDoc.createdAt)}</span>
                </div>
              </div>

              {/* Paciente y Tutor Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {(() => {
                  const pat = patients.find((p) => p.id === previewDoc.patientId);
                  const own = owners.find((o) => o.id === previewDoc.ownerId);
                  return (
                    <>
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">🐾 Datos del Paciente</span>
                        <div className="flex justify-between"><span>Nombre:</span><strong className="text-slate-900">{pat?.name || 'S/D'}</strong></div>
                        <div className="flex justify-between"><span>Especie/Raza:</span><span>{pat?.species || 'Canino'} · {pat?.breed || 'Mestizo'}</span></div>
                        <div className="flex justify-between"><span>Historia Clínica:</span><span className="font-mono">{pat?.clinicalRecordNumber || 'HC-2026'}</span></div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 block">👤 Tutor Responsable</span>
                        <div className="flex justify-between"><span>Nombre:</span><strong className="text-slate-900">{own ? `${own.firstName} ${own.lastName}` : 'S/D'}</strong></div>
                        <div className="flex justify-between"><span>DNI / Pasaporte:</span><span className="font-mono">{own?.dni || 'S/D'}</span></div>
                        <div className="flex justify-between"><span>Teléfono:</span><span>{own?.phone || own?.whatsapp || 'S/D'}</span></div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Cuerpo del Documento */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3 leading-relaxed">
                <span className="text-[10px] font-black uppercase text-slate-400 block border-b border-slate-100 pb-1">
                  📄 Contenido del Instrumento Clínico / Legal
                </span>
                {(() => {
                  const parsed = parseDocumentContent(previewDoc.content);
                  if (parsed.isJson && parsed.data) {
                    return (
                      <div className="space-y-3">
                        <div className="bg-teal-50/50 p-2.5 rounded-lg border border-teal-100 font-mono text-[11px] text-teal-950 flex justify-between">
                          <span>Médico: <strong>{parsed.data.authorName || previewDoc.vetName || 'Dr. Diego Iván Irusta'}</strong> ({parsed.data.authorLicense || 'M.P. 502'})</span>
                          <span>{parsed.data.sector || 'UCI'} · {parsed.data.shift || 'DIURNO'}</span>
                        </div>
                        {parsed.data.assessment && (
                          <div>
                            <strong className="text-slate-700 block mb-1">Evaluación Médica:</strong>
                            <p className="text-slate-800 leading-relaxed">{parsed.data.assessment}</p>
                          </div>
                        )}
                        {parsed.data.plan && (
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                            <strong className="text-teal-900 block mb-1">Plan Terapéutico & Medicación:</strong>
                            <p className="text-slate-800 leading-relaxed">{parsed.data.plan}</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return <p className="whitespace-pre-line text-slate-800 leading-relaxed">{previewDoc.content}</p>;
                })()}
              </div>

              {/* Firmas */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-center">
                <div className="space-y-1">
                  {previewDoc.signatureDataUrl ? (
                    <img src={previewDoc.signatureDataUrl} className="h-10 mx-auto object-contain" alt="Firma Tutor" />
                  ) : (
                    <div className="h-10 flex items-center justify-center text-[10px] text-slate-400 italic">
                      {previewDoc.isSigned ? 'Firma Verificada' : 'Sin Firmar'}
                    </div>
                  )}
                  <div className="border-t border-slate-400 w-3/4 mx-auto pt-1">
                    <strong className="block text-[11px]">{previewDoc.signedByOwnerName || 'Firma del Tutor'}</strong>
                    <span className="text-[10px] text-slate-500">Tutor Responsable</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="h-10 flex items-center justify-center text-[11px] font-bold text-teal-800">
                    {previewDoc.vetName || 'Dr. Diego Iván Irusta'}
                  </div>
                  <div className="border-t border-slate-400 w-3/4 mx-auto pt-1">
                    <strong className="block text-[11px]">{previewDoc.vetName || 'Dr. Diego Iván Irusta'}</strong>
                    <span className="text-[10px] text-slate-500">Médico Veterinario • M.P. 502</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cerrar
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(previewDoc)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrintDoc(previewDoc)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir A4</span>
                </button>

                {!previewDoc.isSigned && (
                  <button
                    type="button"
                    onClick={() => handleOpenSignatureModal(previewDoc)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Firmar en Pantalla</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: CREAR DOCUMENTO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">Generar Documento Clínico Oficial</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewDocument} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Paciente en Contexto:</label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => handlePatientChangeInModal(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species} {p.breed}) — {p.clinicalRecordNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">Plantilla Oficial:</label>
                  <select
                    value={selectedTemplateIndex}
                    onChange={(e) => handleOpenCreateModal(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    {DOCUMENT_TEMPLATES.map((tmpl, i) => (
                      <option key={tmpl.type} value={i}>
                        {tmpl.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Título del Documento:</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Texto & Cláusulas del Documento:</label>
                <textarea
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-sans text-xs text-slate-900 focus:ring-2 focus:ring-teal-500 leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 cursor-pointer"
                >
                  Guardar y Emitir Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: FIRMA DIGITAL TÁCTIL EN PANTALLA */}
      {signingDocId && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">Firma Digital Manuscrita en Pantalla</h3>
              </div>
              <button
                type="button"
                onClick={() => setSigningDocId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSignature} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Nombre Completo del Tutor:</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                    placeholder="Ej: Carlos Gómez"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">DNI / Pasaporte:</label>
                  <input
                    type="text"
                    value={signerDni}
                    onChange={(e) => setSignerDni(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 font-mono focus:ring-2 focus:ring-teal-500"
                    placeholder="Ej: 38123456"
                    required
                  />
                </div>
              </div>

              {/* Canvas Pad */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-700 font-bold">Dibuje su firma con el dedo, stylus o mouse:</label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-teal-700 font-bold hover:underline text-[11px] cursor-pointer"
                  >
                    Borrar y reiniciar
                  </button>
                </div>

                <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl bg-slate-50 overflow-hidden touch-none relative">
                  <canvas
                    ref={canvasRef}
                    width={480}
                    height={160}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-40 cursor-crosshair bg-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  La firma digital queda vinculada con hash criptográfico y fecha/hora inmutable.
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSigningDocId(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 cursor-pointer"
                >
                  Confirmar y Guardar Firma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
