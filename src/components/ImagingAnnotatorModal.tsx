import React, { useState, useRef } from 'react';
import {
  X,
  Scan,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Tag,
  PenTool,
  CheckCircle2,
  Download,
  Printer,
  Sparkles,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

interface ImagingAnnotatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string | null;
  imageUrl?: string;
  studyTitle?: string;
}

export const ImagingAnnotatorModal: React.FC<ImagingAnnotatorModalProps> = ({
  isOpen,
  onClose,
  patientId,
  imageUrl = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&auto=format&fit=crop&q=80',
  studyTitle = 'Radiografía Tórax Perfil Lateral Derecha (Estudio Cardiorrespiratorio)',
}) => {
  const { patients, showToast, logAudit } = useVet();
  const patient = patients.find((p) => p.id === patientId) || patients[0];

  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [invert, setInvert] = useState(false);
  const [contrast, setContrast] = useState(100);
  const [brightness, setBrightness] = useState(100);

  const [toolMode, setToolMode] = useState<'PAN' | 'ARROW' | 'CIRCLE' | 'MEASURE' | 'TEXT'>('PAN');
  const [annotations, setAnnotations] = useState<
    { id: string; type: string; x: number; y: number; text: string }[]
  >([
    { id: 'ann-1', type: 'ARROW', x: 48, y: 45, text: 'Silueta cardíaca aumentada (VHS 10.8)' },
    { id: 'ann-2', type: 'CIRCLE', x: 62, y: 35, text: 'Patrón bronquial perihiliar leve' },
  ]);

  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  if (!isOpen || !patient) return null;

  const handleAiInterpretation = () => {
    const annSummary = annotations.length > 0 ? annotations.map(a => a.text).join('; ') : 'Sin hallazgos focales anotados';
    const report = `INFORME RADIOLÓGICO (${studyTitle})\nPaciente: ${patient.name} (${patient.species} ${patient.breed})\nHallazgos: ${annSummary}\nConclusión: Hallazgos compatibles con evaluación clínica.`;
    setAiReport(report);
    showToast('info', 'Informe Estructurado', 'Plantilla de informe radiológico generada.');
  };

  const handleSaveStudy = () => {
    showToast('success', 'Estudio Anotado Guardado', `Anotaciones radiológicas registradas para ${patient.name}.`);
    logAudit('ANOTACION_IMAGEN', 'ImagingStudy', patient.id, `Estudio ${studyTitle} anotado y guardado`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden text-white animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg">
              <Scan className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">{studyTitle}</h2>
              <p className="text-xs text-slate-400">
                Paciente: <span className="text-teal-300 font-bold">{patient.name}</span> ({patient.species} - {patient.breed}) • HC: {patient.clinicalRecordNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAiInterpretation}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-200" />
              <span>{aiLoading ? 'Analizando...' : 'Generar Borrador'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-2.5 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Zoom & Rotation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Reducir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-slate-300 text-[11px] w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.2))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 ml-2"
              title="Rotar 90°"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setInvert((i) => !i)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                invert ? 'bg-teal-600 text-white border-teal-500' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              Invertir Negativo
            </button>
          </div>

          {/* Contrast & Brightness Sliders */}
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Brillo:</span>
              <input
                type="range"
                min="50"
                max="150"
                value={brightness}
                onChange={(e) => setBrightness(Number(e.target.value))}
                className="w-20 accent-teal-500"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Contraste:</span>
              <input
                type="range"
                min="50"
                max="200"
                value={contrast}
                onChange={(e) => setContrast(Number(e.target.value))}
                className="w-20 accent-teal-500"
              />
            </div>
          </div>
        </div>

        {/* Viewport Canvas + Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 flex-1 overflow-hidden min-h-[380px]">
          {/* Main Visualizer Area (8 cols) */}
          <div className="lg:col-span-8 bg-black flex items-center justify-center relative overflow-hidden p-4">
            <div
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                filter: `invert(${invert ? 1 : 0}) contrast(${contrast}%) brightness(${brightness}%)`,
                transition: 'transform 0.15s ease-out',
              }}
              className="relative max-w-full max-h-[420px] rounded-lg overflow-hidden border border-slate-800 shadow-2xl select-none"
            >
              <img
                src={imageUrl}
                alt="Radiografía Diagnóstica"
                className="w-full h-auto object-contain max-h-[400px] pointer-events-none"
              />

              {/* Annotation Markers */}
              {annotations.map((ann) => (
                <div
                  key={ann.id}
                  style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 group cursor-pointer z-20"
                >
                  <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-white shadow-lg animate-pulse">
                    📍
                  </span>
                  <div className="bg-slate-900/90 text-white text-[10px] px-2 py-0.5 rounded border border-teal-500/50 whitespace-nowrap shadow-xl">
                    {ann.text}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Report & Findings Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-slate-950 p-5 border-l border-slate-800 flex flex-col justify-between space-y-4 overflow-y-auto">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Informe Radiológico & Hallazgos
              </span>

              {aiReport ? (
                <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-4 text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                  {aiReport}
                </div>
              ) : (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
                  <p className="font-bold text-slate-200">Anotaciones registradas:</p>
                  <ul className="list-disc pl-4 space-y-1 text-[11px]">
                    {annotations.map((a) => (
                      <li key={a.id}>{a.text}</li>
                    ))}
                  </ul>
                  <p className="text-[10px] text-slate-500 pt-2 border-t border-slate-800">
                    Tocá "Interpretar con IA" para obtener un informe descriptivo automático con medición VHS y diagnóstico presuntivo.
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
              >
                Cerrar
              </button>

              <button
                type="button"
                onClick={handleSaveStudy}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all text-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Estudio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
