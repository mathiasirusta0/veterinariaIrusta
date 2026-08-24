import { calculateDocumentSha256 } from '../utils/crypto';
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
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { ClinicalDocument, DocumentType } from '../types';
import { formatDate, formatDateTime, maskDni } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { EmptyState, PageHeader } from './ui';

export const DOCUMENT_TEMPLATES: {
  type: DocumentType;
  title: string;
  category: 'CONSENTIMIENTO' | 'CERTIFICADO' | 'LEGAL';
  badgeColor: string;
  defaultContent: (p: { name: string; species: string; breed: string; hc: string; ownerName: string; ownerDni: string; vetName: string; vetLicense: string }) => string;
}[] = [
  {
    type: 'CONSENTIMIENTO_ANESTESIA',
    title: 'Consentimiento de Cirugía & Procedimientos Anestésicos',
    category: 'CONSENTIMIENTO',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    defaultContent: (p) =>
      `Por la presente, yo ${p.ownerName} (DNI ${p.ownerDni}), en mi carácter de tutor/responsable del paciente ${p.name} (${p.species} ${p.breed}, HC ${p.hc}), autorizo al equipo médico de Veterinaria Irusta bajo la dirección de ${p.vetName} (${p.vetLicense}) a realizar los procedimientos quirúrgicos y anestésicos necesarios.\n\nHe sido plenamente informado/a sobre la naturaleza de la intervención, los estudios prequirúrgicos requeridos, los riesgos inherentes a todo acto anestésico y las posibles complicaciones, asumiendo libre y conscientemente las decisiones terapéuticas.`,
  },
  {
    type: 'CONSENTIMIENTO_INTERNACION_UCI',
    title: 'Consentimiento de Internación en Terapia Intensiva & UCI',
    category: 'CONSENTIMIENTO',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    defaultContent: (p) =>
      `Yo, ${p.ownerName} (DNI ${p.ownerDni}), autorizo la internación y hospitalización de urgencia de ${p.name} (HC ${p.hc}) en el sector de Cuidados Críticos / UCI de Veterinaria Irusta.\n\nAutorizo la colocación de accesos vasculares, fluidoterapia endovenosa continua, administración de fármacos de urgencia, oxigenoterapia y monitoreo hemodinámico según criterio profesional del equipo de guardia.`,
  },
  {
    type: 'CONSENTIMIENTO_EUTANASIA',
    title: 'Acta de Consentimiento de Eutanasia Humanitaria',
    category: 'CONSENTIMIENTO',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    defaultContent: (p) =>
      `Yo, ${p.ownerName} (DNI ${p.ownerDni}), en pleno uso de mis facultades y tras haber recibido el asesoramiento profesional del Dr/a. ${p.vetName} (${p.vetLicense}) sobre el pronóstico irreversible e inviable de ${p.name} (HC ${p.hc}), solicito y autorizo de forma irrevocable la práctica del procedimiento de Eutanasia Humanitaria bajo protocolo farmacológico que garantice la ausencia total de dolor y sufrimiento animal.`,
  },
  {
    type: 'CERTIFICADO_SALUD_VIAJE',
    title: 'Certificado de Aptitud Sanitaria y Tránsito Federal SENASA',
    category: 'CERTIFICADO',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
    defaultContent: (p) =>
      `El/La profesional que suscribe, Dr/a. ${p.vetName} (${p.vetLicense}), CERTIFICA que en el día de la fecha ha examinado clínicamente al paciente ${p.name} (${p.species}, ${p.breed}, HC ${p.hc}), perteneciente al tutor ${p.ownerName} (DNI ${p.ownerDni}), encontrándolo en EXCELENTE ESTADO GENERAL DE SALUD, sin signos clínicos compatibles con enfermedades infectocontagiosas o parasitarias de denuncia obligatoria, encontrándose APTO para el traslado y tránsito interjurisdiccional.`,
  },
  {
    type: 'CERTIFICADO_VACUNACION_ANTIRRABICA',
    title: 'Certificado Oficial de Vacunación Antirrábica (Ley 22.953)',
    category: 'CERTIFICADO',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    defaultContent: (p) =>
      `CERTIFICADO OFICIAL DE VACUNACIÓN ANTIRRÁBICA:\n\nPaciente: ${p.name} (${p.species} ${p.breed}, HC ${p.hc})\nTutor: ${p.ownerName} (DNI ${p.ownerDni})\nVeterinario actuante: Dr/a. ${p.vetName} (${p.vetLicense})\n\nSe certifica la aplicación conforme a la legislación sanitaria vigente, biológico con fecha de vigencia por 12 meses calendario a partir de la emisión del presente.`,
  },
  {
    type: 'ALTA_VOLUNTARIA_DESLINDE',
    title: 'Acta de Alta Voluntaria & Deslinde de Responsabilidad Médica',
    category: 'LEGAL',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
    defaultContent: (p) =>
      `Yo, ${p.ownerName} (DNI ${p.ownerDni}), manifiesto expresamente que he decidido retirar voluntariamente a mi animal ${p.name} (HC ${p.hc}) de la internación hospitalaria, EN CONTRA DEL CONSEJO Y RECOMENDACIÓN MÉDICA explícita emitida por el equipo veterinario.\n\nAsumo toda la responsabilidad por las eventuales consecuencias que dicha decisión pueda ocasionar en la salud o vida del paciente, deslindando al centro médico de cualquier responsabilidad civil o penal.`,
  },
];

export const DocumentsView: React.FC = () => {
  const {
    documents,
    patients,
    owners,
    currentUser,
    addDocument,
    signDocument,
    openPrintModal,
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
      vetName: currentUser.name,
      vetLicense: 'MP-VET 9942',
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
      vetName: currentUser.name,
      vetLicense: 'MP-VET 9942',
    });

    setCustomContent(contentText);
  };

  const handleSaveNewDocument = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === selectedPatientId) || patients[0];
    if (!pat) return;
    const tmpl = DOCUMENT_TEMPLATES[selectedTemplateIndex];

    addDocument({
      type: tmpl.type,
      title: customTitle,
      patientId: pat.id,
      ownerId: pat.ownerId,
      vetName: currentUser.name,
      content: customContent,
      isSigned: false,
    });

    showToast('success', 'Documento Generado', `"${customTitle}" creado exitosamente.`);
    setShowCreateModal(false);
  };

  // Canvas Signature
  const getCanvasCoords = (canvas: HTMLCanvasElement, e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
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
    if (!signingDocId || !signerName || !signerDni) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL() : '';
    signDocument(signingDocId, signerName, signerDni, dataUrl);
    showToast('success', 'Firma Digital Registrada', 'El consentimiento quedó firmado legalmente.');
    setSigningDocId(null);
    setSignerName('');
    setSignerDni('');
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
        (filterType === 'CERTIFICADOS' && doc.type.includes('CERTIFICADO'));

      return matchesSearch && matchesFilter;
    });
  }, [documents, searchTerm, filterType, patients, owners]);

  return (
    <div className="space-y-6 pb-20 w-full max-w-full">
      {/* 1. Header */}
      <PageHeader
        category="Gestión Legal & Expedición de Certificados"
        title="Documentos"
        description="Emisión de consentimientos informados, certificados oficiales SENASA y firma digital manuscrita en pantalla"
        icon={FileText}
        actions={[
          {
            label: '+ Nuevo Documento',
            icon: Plus,
            onClick: () => handleOpenCreateModal(0),
            variant: 'primary',
          },
        ]}
      />

      {/* 2. Quick Template Selector Ribbons */}
      <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-xs space-y-3">
        <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block">
          Plantillas Oficiales de Emisión Rápida:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {DOCUMENT_TEMPLATES.map((tmpl, idx) => (
            <button
              key={tmpl.type}
              type="button"
              onClick={() => handleOpenCreateModal(idx)}
              className="p-3 bg-slate-50 hover:bg-teal-50 border border-slate-200/80 hover:border-teal-300 rounded-2xl text-left transition-all active:scale-95 flex flex-col justify-between group shadow-2xs"
            >
              <div className="space-y-1">
                <span className="text-base block">
                  {tmpl.category === 'CONSENTIMIENTO' ? '📝' : tmpl.category === 'CERTIFICADO' ? '📜' : '⚖️'}
                </span>
                <strong className="text-[11px] font-bold text-slate-800 group-hover:text-teal-900 line-clamp-2 leading-snug">
                  {tmpl.title}
                </strong>
              </div>
              <span className="text-[9px] font-bold text-teal-700 mt-2 block">Emitir →</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, paciente o tutor..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'PENDIENTES', label: '⏳ Pendientes' },
            { id: 'FIRMADOS', label: '✅ Firmados' },
            { id: 'CONSENTIMIENTOS', label: '📝 Consentimientos' },
            { id: 'CERTIFICADOS', label: '📜 Certificados' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilterType(f.id)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
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
          actionLabel="+ Generar Consentimiento"
          onAction={() => handleOpenCreateModal(0)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => {
            const patient = patients.find((p) => p.id === doc.patientId);
            const owner = owners.find((o) => o.id === doc.ownerId);

            return (
              <div
                key={doc.id}
                className="bg-white border border-slate-200 hover:border-teal-500/50 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-sm sm:text-base font-black text-slate-900 leading-snug truncate">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Paciente: <strong className="text-slate-800">{patient?.name || 'S/D'}</strong> ({patient?.species || 'Canino'}) • Tutor: <strong className="text-slate-800">{owner ? `${owner.firstName} ${owner.lastName}` : 'S/D'}</strong>
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

                  {/* Document Text Snippet */}
                  <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto whitespace-pre-line font-sans">
                    {doc.content}
                  </div>

                  {/* Signed info block */}
                  {doc.isSigned && (
                    <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase text-emerald-900 block">Firma Digital Válida:</span>
                        <strong className="text-slate-900">{doc.signedByOwnerName}</strong>
                        <span className="text-slate-500 text-[11px] block font-mono">DNI: {maskDni(doc.signedByOwnerDni)}</span>
                      </div>
                      {doc.signatureDataUrl && (
                        <img
                          src={doc.signatureDataUrl}
                          alt="Firma Manuscrita"
                          className="h-10 max-w-[120px] object-contain border border-emerald-200 bg-white rounded-lg p-1"
                        />
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    📅 {formatDateTime(doc.createdAt)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {/* WhatsApp delivery */}
                    {owner && (
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          openWhatsAppHub({
                            patientName: patient?.name || 'Paciente',
                            ownerName: `${owner.firstName} ${owner.lastName}`,
                            ownerPhone: owner.phone || owner.whatsapp || '',
                            type: 'DOCUMENTO',
                            details: {
                              docTitle: doc.title,
                              isSigned: doc.isSigned,
                              date: formatDate(doc.createdAt),
                            },
                          });
                        }}
                        className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition-colors"
                        title="Enviar por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </button>
                    )}

                    {/* Print Button */}
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        openPrintModal({
                          documentType: doc.type,
                          title: doc.title,
                          patientName: patient?.name || 'Paciente',
                          ownerName: owner ? `${owner.firstName} ${owner.lastName}` : 'Tutor',
                          date: doc.createdAt,
                          content: doc.content,
                        });
                      }}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                      title="Imprimir documento oficial"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>

                    {/* Sign Button if not signed */}
                    {!doc.isSigned && (
                      <button
                        type="button"
                        onClick={() => handleOpenSignatureModal(doc)}
                        className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Firmar en Pantalla</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. MODAL: CREAR DOCUMENTO */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">Generar Documento Clínico Oficial</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewDocument} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Paciente:</label>
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
                  <label className="text-slate-700 font-bold block mb-1">Plantilla:</label>
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
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20"
                >
                  Guardar y Emitir Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: FIRMA DIGITAL TÁCTIL EN PANTALLA */}
      {signingDocId && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">Firma Digital Manuscrita en Pantalla</h3>
              </div>
              <button
                type="button"
                onClick={() => setSigningDocId(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSignature} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="text-slate-700 font-bold">Dibuje su firma con el dedo o mouse:</label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-teal-700 font-bold hover:underline text-[11px]"
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
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20"
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
