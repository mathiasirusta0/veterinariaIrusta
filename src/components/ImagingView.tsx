import React, { useState } from 'react';
import {
  Scan,
  Plus,
  Image as ImageIcon,
  FileText,
  Calendar,
  Search,
  Filter,
  Printer,
  MessageCircle,
  Eye,
  Edit3,
  CheckCircle2,
  Sparkles,
  Layers,
  Camera,
  Maximize2,
  X,
  User,
  PawPrint,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { ImagingStudy, ImageModality } from '../types';
import { formatDate, formatDateTime, formatWeight } from '../utils/formatters';
import { printA4ImagingReport } from '../utils/printDocumentHelper';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, SearchInput, FilterBar } from './ui';

export const ImagingView: React.FC = () => {
  const {
    imagingStudies,
    currentUser,
    activeBranch,
    patients,
    owners,
    updateImagingStudy,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openImagingAnnotator,
    openWhatsAppHub,
    showToast,
    archiveImaging,
    deleteImaging,
  } = useVet();

  const [search, setSearch] = useState('');
  const [modalityFilter, setModalityFilter] = useState('TODAS');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null);
  const [editingStudy, setEditingStudy] = useState<ImagingStudy | null>(null);
  const [editReport, setEditReport] = useState('');
  const [editConclusion, setEditConclusion] = useState('');

  const filteredStudies = imagingStudies.filter((study) => {
    const q = (search || '').toLowerCase();
    const patient = patients.find((p) => p.id === study.patientId);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
    const petName = (patient?.name || '').toLowerCase();
    const hc = (patient?.clinicalRecordNumber || '').toLowerCase();
    const mod = (study.modality || '').toLowerCase();
    const reg = (study.region || '').toLowerCase();
    const studyNum = (study.studyNumber || '').toLowerCase();
    const perfBy = (study.performedBy || '').toLowerCase();
    const tutor = owner ? (owner.firstName + ' ' + owner.lastName).toLowerCase() : '';

    const matchesSearch =
      petName.includes(q) ||
      hc.includes(q) ||
      mod.includes(q) ||
      reg.includes(q) ||
      studyNum.includes(q) ||
      perfBy.includes(q) ||
      tutor.includes(q) ||
      (study.report || '').toLowerCase().includes(q) ||
      (study.conclusion || '').toLowerCase().includes(q);

    const matchesModality = modalityFilter === 'TODAS' || study.modality === modalityFilter;
    const matchesStatus = statusFilter === 'TODOS' || study.status === statusFilter;

    return matchesSearch && matchesModality && matchesStatus;
  });

  const handleOpenEditReport = (study: ImagingStudy) => {
    triggerHaptic('medium');
    setEditingStudy(study);
    setEditReport(study.report || '');
    setEditConclusion(study.conclusion || '');
  };

  const handleSaveReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudy) return;
    triggerHaptic('medium');

    updateImagingStudy(editingStudy.id, {
      report: editReport,
      conclusion: editConclusion,
      status: 'INFORMADO',
    });

    setEditingStudy(null);
    showToast('success', 'Informe Guardado', 'El estudio ' + editingStudy.studyNumber + ' fue actualizado.');
  };


  const handlePrintImaging = (study: ImagingStudy) => {
    triggerHaptic('medium');
    const pat = patients.find((p) => p.id === study.patientId);
    const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;

    printA4ImagingReport({
      studyNumber: study.studyNumber,
      modality: study.modality,
      region: study.region,
      date: formatDate(study.date),
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      status: study.status,
      radiologistName: study.performedBy || 'Dr. Diego Iván Irusta',
      findings: study.report || '',
      conclusions: study.conclusion || '',
      images: (study.images || []).map((img) => img.url),
      doctor: {
        name: currentUser?.name || 'Dr. Diego Iván Irusta',
        license: currentUser?.licenseNumber || 'M.P. 502',
      },
      branch: {
        name: activeBranch?.name || 'Clínica Veterinaria Ranquel',
        address: activeBranch?.address || 'Río Cuarto, Córdoba',
        phone: activeBranch?.phone || '+54 9 2942 47-7136',
      },
      patient: {
        name: pat?.name || 'Paciente',
        species: pat?.species || 'CANINO',
        breed: pat?.breed || 'Mestizo',
        weight: pat?.weight ? `${pat.weight} kg` : 'N/A',
        age: pat?.calculatedAge || 'Adulto',
        hc: pat?.clinicalRecordNumber || 'HC-000',
      },
      owner: {
        name: ow ? `${ow.firstName} ${ow.lastName}` : 'Tutor Responsable',
        dni: ow?.dni || 'N/A',
        phone: ow?.phone || ow?.whatsapp || 'N/A',
      },
    });
    showToast('success', 'Informe en Impresión A4', `Estudio ${study.studyNumber} enviado a impresión oficial.`);
  };

  const handleSendWhatsApp = (study: ImagingStudy) => {
    triggerHaptic('light');
    const patient = patients.find((p) => p.id === study.patientId);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
    if (!owner) return;

    openWhatsAppHub({
      patientName: patient?.name || 'su mascota',
      ownerName: owner.firstName + ' ' + owner.lastName,
      ownerPhone: owner.phone || owner.whatsapp || '',
      type: 'ESTUDIO_IMAGEN',
      details: {
        studyNumber: study.studyNumber,
        modality: study.modality,
        region: study.region,
        conclusion: study.conclusion || 'Estudio concluido sin anormalidades.',
      },
    });
  };

  const modalityBadges: Record<string, { label: string; bg: string; icon: string }> = {
    RADIOGRAFIA: { label: 'Radiografía Digital (RX)', bg: 'bg-teal-50 text-teal-800 border-teal-200', icon: '⚡' },
    ECOGRAFIA: { label: 'Ecografía Doppler', bg: 'bg-blue-50 text-blue-800 border-blue-200', icon: '📡' },
    TOMOGRAFIA: { label: 'Tomografía (TAC)', bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: '🔄' },
    RESONANCIA: { label: 'Resonancia Magnética (RMN)', bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', icon: '🧲' },
    ENDOSCOPIA: { label: 'Endoscopía / Video', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: '🔬' },
    FOTOGRAFIA_CLINICA: { label: 'Fotografía Clínica', bg: 'bg-pink-50 text-pink-800 border-pink-200', icon: '📷' },
  };

  const modalityFilterOptions = [
    { id: 'TODAS', label: 'Todas', badge: imagingStudies.length },
    { id: 'RADIOGRAFIA', label: '⚡ Rayos X (RX)', badge: imagingStudies.filter((s) => s.modality === 'RADIOGRAFIA').length },
    { id: 'ECOGRAFIA', label: '📡 Ecografía', badge: imagingStudies.filter((s) => s.modality === 'ECOGRAFIA').length },
    { id: 'TOMOGRAFIA', label: '🔄 Tomografía (TAC)', badge: imagingStudies.filter((s) => s.modality === 'TOMOGRAFIA').length },
    { id: 'ENDOSCOPIA', label: '🔬 Endoscopía', badge: imagingStudies.filter((s) => s.modality === 'ENDOSCOPIA').length },
    { id: 'FOTOGRAFIA_CLINICA', label: '📷 Fotografía', badge: imagingStudies.filter((s) => s.modality === 'FOTOGRAFIA_CLINICA').length },
  ];

  return (
    <div className="space-y-5 pb-16 w-full max-w-full">
      {/* 1. Header */}
      <PageHeader
        category="Diagnóstico por Imágenes & Radiología Digital"
        title="Imágenes Diagnósticas & Informes"
        description="Radiografías digitales (RX), Ecografías abdominales y cardíacas, Tomografía y Endoscopía con visor IA"
        icon={Scan}
        actions={[
          {
            label: 'Nuevo Estudio de Imagen',
            icon: Plus,
            onClick: () => setQuickModal('NUEVA_IMAGEN'),
            variant: 'primary',
          },
        ]}
      />

      {/* 2. Search & Modality Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs space-y-3 w-full max-w-full">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por estudio (IMG-...), región, paciente, HC, especialista o hallazgo..."
        />
        <FilterBar
          options={modalityFilterOptions}
          activeId={modalityFilter}
          onSelect={setModalityFilter}
          label="Modalidad de Imagen"
        />
      </div>

      {/* 3. Studies Grid */}
      <div className="space-y-4 w-full">
        {filteredStudies.length === 0 ? (
          <EmptyState
            icon={Scan}
            title="No se encontraron estudios de imagen"
            description={
              search || modalityFilter !== 'TODAS'
                ? 'No hay estudios que coincidan con la búsqueda o modalidad seleccionada.'
                : 'No hay estudios de imagenología registrados en el centro aún.'
            }
            actionLabel="Cargar Nuevo Estudio"
            onAction={() => setQuickModal('NUEVA_IMAGEN')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredStudies.map((study) => {
              const patient = patients.find((p) => p.id === study.patientId);
              const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
              const modalityInfo = modalityBadges[study.modality] || {
                label: study.modality,
                bg: 'bg-slate-100 text-slate-700 border-slate-200',
                icon: '📷',
              };

              const imgList: string[] =
                (study.images && study.images.map((im) => im.url)) ||
                (study as any).imageUrls || [
                  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
                ];

              const isInformado = study.status === 'INFORMADO';

              return (
                <div
                  key={study.id}
                  className="bg-white border border-slate-200/90 hover:border-teal-500/60 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header Row: Modality + Region + Study Number */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={'text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ' + modalityInfo.bg}>
                            {modalityInfo.icon} {study.modality}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.2 rounded border border-slate-200">
                            {study.studyNumber}
                          </span>
                          <span
                            className={'text-[10px] font-bold px-2 py-0.2 rounded-full uppercase ' +
                              (isInformado
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200')}
                          >
                            {study.status}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-tight pt-1">
                          Región: {study.region}
                        </h3>

                        <p className="text-xs text-slate-500">
                          Paciente:{' '}
                          <strong
                            onClick={() => {
                              if (patient) {
                                setSelectedPatientId(patient.id);
                                setActivePatientTab('IMAGENES');
                                setActiveView('PACIENTES');
                              }
                            }}
                            className="text-teal-700 hover:underline cursor-pointer font-bold"
                          >
                            {patient?.name || 'Paciente'}
                          </strong>{' '}
                          <span className="font-mono text-[11px]">({patient?.clinicalRecordNumber || 'HC-0000'})</span>{' '}
                          • {patient?.species} {patient?.breed}
                        </p>
                      </div>

                      <div className="text-right text-xs text-slate-500 font-mono">
                        <span>📅 {formatDate(study.date)}</span>
                        <span className="block text-[11px] font-sans text-slate-600 font-medium">
                          Esp: {study.performedBy || 'Especialista'}
                        </span>
                      </div>
                    </div>

                    {/* Image Captures / Gallery Preview */}
                    {imgList.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {imgList.map((url, i) => (
                          <div
                            key={i}
                            className="relative group rounded-xl overflow-hidden border border-slate-200/90 aspect-4/3 bg-slate-950 cursor-pointer shadow-2xs"
                          >
                            <img
                              src={url}
                              alt={'Captura ' + (i + 1)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform opacity-90 group-hover:opacity-100"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                              <button
                                type="button"
                                onClick={() => setSelectedImagePreview(url)}
                                className="p-1.5 bg-white/90 hover:bg-white text-slate-900 rounded-lg shadow-sm"
                                title="Pantalla completa"
                              >
                                <Maximize2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  openImagingAnnotator({
                                    patientId: study.patientId,
                                    imageUrl: url,
                                    studyTitle: study.modality + ' ' + study.region + ' (' + study.studyNumber + ')',
                                  })
                                }
                                className="px-2 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] rounded-lg shadow-sm flex items-center gap-1"
                                title="Abrir en calibrador y visor IA"
                              >
                                <Scan className="w-3 h-3" />
                                <span>Visor IA</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Structured Report Findings */}
                    <div className="bg-slate-50/90 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-2">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Hallazgos Imagenológicos:
                        </span>
                        <p className="text-slate-700 leading-relaxed mt-0.5">
                          {study.report || 'Estudio sin particularidades según técnica habitual.'}
                        </p>
                      </div>

                      {study.conclusion && (
                        <div className="pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">
                            Conclusión Diagnóstica:
                          </span>
                          <p className="text-slate-900 font-bold mt-0.5 leading-snug">{study.conclusion}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Toolbar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    {/* Status switcher */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Estado:</span>
                      <select
                        value={study.status}
                        onChange={(e) =>
                          updateImagingStudy(study.id, { status: e.target.value as ImagingStudy['status'] })
                        }
                        className="min-h-[38px] px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                      >
                        <option value="SOLICITADO">Solicitado</option>
                        <option value="REALIZADO">Realizado</option>
                        <option value="INFORMADO">Informado</option>
                      </select>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditReport(study)}
                        className="min-h-[38px] px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                        title="Redactar o modificar informe médico"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                        <span>Informe</span>
                      </button>

                      {owner && (
                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(study)}
                          className="min-h-[38px] px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                          title="Enviar reporte por WhatsApp al tutor"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handlePrintImaging(study)}
                        className="min-h-[38px] p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors"
                        title="Imprimir informe de imagenología"
                      >
                        <Printer className="w-4 h-4 text-teal-600" />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openImagingAnnotator({
                            patientId: study.patientId,
                            imageUrl: imgList[0],
                            studyTitle: study.modality + ' ' + study.region + ' (' + study.studyNumber + ')',
                          })
                        }
                        className="min-h-[38px] px-3 py-1.5 bg-slate-950 hover:bg-slate-900 text-emerald-400 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                        title="Abrir en calibrador y visor IA"
                      >
                        <Scan className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Visor IA →</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Fullscreen Image Modal Preview */}
      {selectedImagePreview && (
        <div
          onClick={() => setSelectedImagePreview(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center">
            <img
              src={selectedImagePreview}
              alt="Previsualización de estudio"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-slate-800"
            />
            <button
              type="button"
              onClick={() => setSelectedImagePreview(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Edit Report Modal */}
      {editingStudy && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">
                  Redactar Informe: {editingStudy.studyNumber} ({editingStudy.modality} - {editingStudy.region})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingStudy(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveReport} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Hallazgos Imagenológicos / Descripción Técnica:</label>
                <textarea
                  rows={5}
                  value={editReport}
                  onChange={(e) => setEditReport(e.target.value)}
                  required
                  placeholder="Describir estructuras anatómicas, silueta cardíaca, campos pulmonares, parénquima..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Conclusión Diagnóstica & Dictamen Especialista:</label>
                <textarea
                  rows={3}
                  value={editConclusion}
                  onChange={(e) => setEditConclusion(e.target.value)}
                  required
                  placeholder="Diagnóstico presuntivo o definitivo..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStudy(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
                >
                  Guardar & Validar Informe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
