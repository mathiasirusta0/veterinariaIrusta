import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  SunMedium,
  Maximize2,
  FileText,
  FlaskConical,
  Eye,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { triggerHaptic } from '../utils/haptics';

export interface LabDocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  patientName: string;
  species?: string;
  testType: string;
  date?: string;
  diagnosticReport?: string;
  fileUrl: string;
  fileName?: string;
  doctorName?: string;
}

export const LabDocumentViewerModal: React.FC<LabDocumentViewerModalProps> = ({
  isOpen,
  onClose,
  title,
  patientName,
  species,
  testType,
  date,
  diagnosticReport,
  fileUrl,
  fileName,
  doctorName = 'Dr. Diego Iván Irusta (M.P. 502)',
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isInverted, setIsInverted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setIsInverted(false);
      setIsFullscreen(false);
    }
  }, [isOpen, fileUrl]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !fileUrl) return null;

  const isPdf =
    fileUrl.startsWith('data:application/pdf') ||
    fileUrl.toLowerCase().endsWith('.pdf') ||
    (fileName && fileName.toLowerCase().endsWith('.pdf'));

  const handleZoomIn = () => {
    triggerHaptic('light');
    setZoom((prev) => Math.min(prev + 0.25, 3.5));
  };

  const handleZoomOut = () => {
    triggerHaptic('light');
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    triggerHaptic('light');
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    triggerHaptic('light');
    setZoom(1);
    setRotation(0);
    setIsInverted(false);
  };

  const handleDownload = () => {
    triggerHaptic('medium');
    const cleanName = fileName || `Laboratorio_${testType.replace(/\s+/g, '_')}_${patientName.replace(/\s+/g, '_')}`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    triggerHaptic('light');
    if (!isPdf) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title} - ${patientName}</title>
              <style>
                body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; }
                img { max-width: 95%; max-height: 85vh; object-fit: contain; }
                .header { text-align: center; margin: 15px 0; font-size: 13px; color: #333; }
              </style>
            </head>
            <body>
              <div class="header">
                <strong>CLÍNICA VETERINARIA RANQUEL</strong><br />
                Estudio: ${testType} • Paciente: ${patientName} • Fecha: ${date || new Date().toLocaleDateString('es-AR')}
              </div>
              <img src="${fileUrl}" onload="window.print();window.close();" />
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    } else {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.width = '800px';
      iframe.style.height = '600px';
      iframe.src = fileUrl;
      document.body.appendChild(iframe);
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {}
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div
        className={`bg-white rounded-3xl w-full ${
          isFullscreen ? 'max-w-[98vw] h-[96vh]' : 'max-w-5xl max-h-[92vh]'
        } flex flex-col shadow-2xl border border-slate-200 overflow-hidden transition-all text-slate-900`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shadow-2xs">
              {isPdf ? '📄' : '🔬'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">{testType}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                  {isPdf ? 'DOCUMENTO PDF' : 'IMAGEN / CITOLOGÍA'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Paciente: <strong className="text-slate-800">{patientName}</strong> {species ? `(${species})` : ''} • Solicitante: {doctorName}
                {date ? ` • 🗓️ ${date}` : ''}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto">
            {!isPdf && (
              <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-2xs mr-1">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  title="Acercar zoom (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  title="Alejar zoom (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-500 px-1.5 min-w-[36px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  title="Rotar 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsInverted((prev) => !prev)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isInverted ? 'bg-amber-100 text-amber-900 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  title="Invertir contraste (Modo Radiología / Microscopio)"
                >
                  <SunMedium className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  title="Restablecer vista"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer"
              title="Imprimir estudio"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="p-2 bg-white hover:bg-blue-50 text-blue-700 rounded-xl border border-blue-200 transition-colors shadow-2xs cursor-pointer"
              title="Descargar copia a la computadora"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsFullscreen((prev) => !prev)}
              className="p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors shadow-2xs cursor-pointer hidden sm:flex"
              title="Alternar pantalla completa"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer ml-1"
              title="Cerrar visor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 bg-slate-900/95 overflow-auto relative flex items-center justify-center p-3 sm:p-6 custom-scrollbar min-h-[350px]">
          {isPdf ? (
            <div className="w-full h-full min-h-[500px] flex flex-col bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-700">
              <iframe
                src={`${fileUrl}#toolbar=1&navpanes=0`}
                className="w-full flex-1 h-[68vh] rounded-2xl border-0 bg-white"
                title={`${testType} - ${patientName}`}
              />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
              <img
                src={fileUrl}
                alt={`${testType} - ${patientName}`}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  filter: isInverted ? 'invert(100%) contrast(150%)' : 'none',
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-w-full max-h-[68vh] object-contain rounded-xl shadow-2xl select-none"
              />
            </div>
          )}
        </div>

        {/* Diagnostic Conclusion Footer */}
        {diagnosticReport && (
          <div className="p-3.5 sm:p-4 bg-white border-t border-slate-200 text-xs">
            <div className="flex items-center gap-1.5 font-black text-slate-900 mb-1">
              <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
              <span>Informe Diagnóstico & Conclusiones:</span>
            </div>
            <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 whitespace-pre-line">
              {diagnosticReport}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
