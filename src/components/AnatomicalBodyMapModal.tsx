import React, { useState } from 'react';
import {
  X,
  MapPin,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export interface BodyLesionMarker {
  id: string;
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  view: 'LATERAL_IZQ' | 'LATERAL_DER' | 'DORSAL' | 'VENTRAL';
  type: 'MASA' | 'DERMATITIS' | 'HERIDA' | 'DOLOR' | 'CICATRIZ' | 'OTRO';
  title: string;
  description: string;
  sizeMm?: number;
}

const LESION_TYPES: Record<
  BodyLesionMarker['type'],
  { label: string; color: string; bg: string; border: string; iconText: string }
> = {
  MASA: { label: 'Masa / Nódulo / Neoplasia', color: 'text-red-700', bg: 'bg-red-500', border: 'border-red-600', iconText: '🔴' },
  DERMATITIS: { label: 'Dermatitis / Alopecia / Prurito', color: 'text-amber-700', bg: 'bg-amber-500', border: 'border-amber-600', iconText: '🟠' },
  HERIDA: { label: 'Herida / Laceración / Úlcera', color: 'text-blue-700', bg: 'bg-blue-500', border: 'border-blue-600', iconText: '🔵' },
  DOLOR: { label: 'Dolor / Fractura / Trauma', color: 'text-yellow-700', bg: 'bg-yellow-500', border: 'border-yellow-600', iconText: '🟡' },
  CICATRIZ: { label: 'Cicatriz Quirúrgica Previa', color: 'text-purple-700', bg: 'bg-purple-500', border: 'border-purple-600', iconText: '🟣' },
  OTRO: { label: 'Otro Hallazgo Clínico', color: 'text-emerald-700', bg: 'bg-emerald-500', border: 'border-emerald-600', iconText: '🟢' },
};

interface AnatomicalBodyMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string | null;
}

export const AnatomicalBodyMapModal: React.FC<AnatomicalBodyMapModalProps> = ({
  isOpen,
  onClose,
  patientId,
}) => {
  const { patients, showToast, logAudit } = useVet();

  const patient = patients.find((p) => p.id === patientId) || patients[0];
  const [activeView, setActiveView] = useState<'LATERAL_IZQ' | 'LATERAL_DER' | 'DORSAL' | 'VENTRAL'>('LATERAL_IZQ');
  const [selectedType, setSelectedType] = useState<BodyLesionMarker['type']>('MASA');

  const [markers, setMarkers] = useState<BodyLesionMarker[]>([
    {
      id: 'm-1',
      view: 'LATERAL_IZQ',
      xPercent: 42,
      yPercent: 38,
      type: 'MASA',
      title: 'Nódulo subcutáneo costal',
      description: 'Masa firme no adherida de aprox. 2.5 cm en parrilla costal izquierda',
      sizeMm: 25,
    },
    {
      id: 'm-2',
      view: 'LATERAL_IZQ',
      xPercent: 65,
      yPercent: 52,
      type: 'DERMATITIS',
      title: 'Zona alopécica con eritema',
      description: 'Dermatitis por lamido en muslo posterior',
      sizeMm: 30,
    },
  ]);

  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSize, setNewSize] = useState('15');

  if (!isOpen || !patient) return null;

  const currentViewMarkers = markers.filter((m) => m.view === activeView);

  const handleDiagramClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newMarker: BodyLesionMarker = {
      id: `mark-${Date.now()}`,
      view: activeView,
      xPercent: Math.round(x),
      yPercent: Math.round(y),
      type: selectedType,
      title: `Hallazgo en ${activeView.replace('_', ' ')} (${Math.round(x)}%, ${Math.round(y)}%)`,
      description: 'Sin descripción detallada.',
      sizeMm: 10,
    };

    setMarkers((prev) => [...prev, newMarker]);
    setActiveMarkerId(newMarker.id);
    setNewTitle(newMarker.title);
    setNewDesc(newMarker.description);
    setNewSize('10');
  };

  const handleSaveMarkerDetails = () => {
    if (!activeMarkerId) return;
    setMarkers((prev) =>
      prev.map((m) =>
        m.id === activeMarkerId
          ? {
              ...m,
              title: newTitle || m.title,
              description: newDesc,
              sizeMm: parseInt(newSize) || 10,
              type: selectedType,
            }
          : m
      )
    );
    showToast('success', 'Lesión Actualizada', 'Detalles anatómicos guardados.');
  };

  const handleDeleteMarker = (id: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== id));
    if (activeMarkerId === id) setActiveMarkerId(null);
  };

  const handleSaveAll = () => {
    showToast(
      'success',
      'Mapa Anatómico Guardado',
      `Se han registrado ${markers.length} marcadores de lesiones en la ficha de ${patient?.name || 'Paciente'}.`
    );
    if (patient?.id) {
      logAudit(
        'REGISTRO_MAPA_ANATOMICO',
        'Patient',
        patient.id,
        `Mapa corporal guardado: ${markers.length} lesiones marcadas para ${patient.name}`
      );
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg">
              🐾
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Mapa Anatómico Corporal & Registro de Lesiones
              </h2>
              <p className="text-xs text-slate-400">
                Paciente: <span className="text-white font-bold">{patient?.name || 'Modo General'}</span> ({patient?.species || 'Canino'} - {patient?.breed || 'Mestizo'}) • HC: {patient?.clinicalRecordNumber || 'S/N'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Lesion Palette & View Selector */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* View Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 uppercase text-[11px] mr-2">Vista Anatómica:</span>
              {[
                { id: 'LATERAL_IZQ', label: 'Lateral Izquierda' },
                { id: 'LATERAL_DER', label: 'Lateral Derecha' },
                { id: 'DORSAL', label: 'Dorsal' },
                { id: 'VENTRAL', label: 'Ventral' },
              ].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    setActiveView(v.id as any);
                    setActiveMarkerId(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                    activeView === v.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Type Selector */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-800 uppercase text-[11px] mr-2">Tipo de Lesión:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {(Object.keys(LESION_TYPES) as BodyLesionMarker['type'][]).map((t) => (
                  <option key={t} value={t}>
                    {LESION_TYPES[t].iconText} {LESION_TYPES[t].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Anatomical Silhouette Canvas + Details Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Diagram Silhouette with clickable coordinate overlay (7 cols) */}
            <div className="lg:col-span-7 bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col items-center justify-center relative min-h-[340px] select-none">
              <span className="absolute top-3 left-3 text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-1 rounded">
                Hacé clic en cualquier zona para colocar un marcador
              </span>

              {/* Vector Silhouette Area */}
              <div
                onClick={handleDiagramClick}
                className="relative w-full max-w-md h-72 cursor-crosshair flex items-center justify-center"
              >
                {/* SVG Silhouette Representation */}
                <svg
                  viewBox="0 0 400 240"
                  className="w-full h-full text-teal-500/30 hover:text-teal-500/40 transition-colors drop-shadow-md"
                  fill="currentColor"
                  stroke="#2dd4bf"
                  strokeWidth="2"
                >
                  {/* Stylized Veterinary Canine/Feline Silhouette */}
                  {activeView.startsWith('LATERAL') ? (
                    <path d="M 60 120 C 60 90, 85 70, 110 80 C 130 90, 140 100, 170 100 C 230 100, 270 95, 300 110 C 330 125, 350 110, 365 140 C 365 150, 345 150, 335 140 C 320 145, 310 160, 305 200 C 300 210, 285 210, 285 195 C 285 170, 270 150, 250 150 C 220 150, 190 155, 170 155 C 160 175, 155 205, 145 210 C 135 210, 130 195, 135 170 C 120 160, 95 160, 75 140 Z" />
                  ) : (
                    <path d="M 170 30 C 180 20, 220 20, 230 30 C 245 50, 240 70, 255 100 C 265 120, 275 140, 270 180 C 265 210, 245 220, 200 220 C 155 220, 135 210, 130 180 C 125 140, 135 120, 145 100 C 160 70, 155 50, 170 30 Z" />
                  )}
                </svg>

                {/* Render Markers */}
                {currentViewMarkers.map((m) => {
                  const cfg = LESION_TYPES[m.type];
                  const isSelected = activeMarkerId === m.id;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMarkerId(m.id);
                        setNewTitle(m.title);
                        setNewDesc(m.description);
                        setNewSize(m.sizeMm?.toString() || '10');
                        setSelectedType(m.type);
                      }}
                      style={{ left: `${m.xPercent}%`, top: `${m.yPercent}%` }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-transform hover:scale-125 z-20 ${
                        cfg.bg
                      } ${isSelected ? 'ring-4 ring-white scale-125 animate-bounce' : 'ring-2 ring-slate-900'}`}
                      title={`${m.title} (${cfg.label})`}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>

              <span className="text-[10px] text-slate-500 font-mono mt-2">
                Vista Activa: {activeView.replace('_', ' ')} • {currentViewMarkers.length} lesiones marcadas
              </span>
            </div>

            {/* Right: Selected Marker Inspector & List (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Selected Marker Edit Form */}
              {activeMarkerId ? (
                <div className="bg-slate-50 border border-teal-500/50 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      Editar Hallazgo Seleccionado
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMarker(activeMarkerId)}
                      className="text-red-600 hover:text-red-700 text-[11px] font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Eliminar</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Título / Nombre:</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Tamaño estimado (mm):</label>
                    <input
                      type="number"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Descripción clínica & consistencia:</label>
                    <textarea
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveMarkerDetails}
                    className="w-full py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    Actualizar Marcador
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-slate-400 space-y-1">
                  <MapPin className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="font-bold text-slate-700 text-xs">Ningún marcador seleccionado</p>
                  <p className="text-[11px]">
                    Hacé clic en la silueta anatómica para agregar una nueva lesión o tocá un marcador existente para editarlo.
                  </p>
                </div>
              )}

              {/* All Markers List */}
              <div className="space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Resumen de Lesiones ({markers.length}):
                </span>

                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {markers.map((m) => {
                    const cfg = LESION_TYPES[m.type];
                    return (
                      <div
                        key={m.id}
                        onClick={() => {
                          setActiveView(m.view);
                          setActiveMarkerId(m.id);
                          setNewTitle(m.title);
                          setNewDesc(m.description);
                          setNewSize(m.sizeMm?.toString() || '10');
                          setSelectedType(m.type);
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          activeMarkerId === m.id
                            ? 'bg-teal-50 border-teal-500 shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cfg.iconText}</span>
                          <div>
                            <span className="font-bold text-slate-900 block">{m.title}</span>
                            <span className="text-[10px] text-slate-500">
                              Vista {m.view.replace('_', ' ')} • {m.sizeMm || 10} mm
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-teal-700 font-bold">Editar →</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Total de lesiones registradas: <strong className="text-slate-900">{markers.length}</strong>
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Mapa Anatómico</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
