import React, { useState, useRef } from 'react';
import {
  FileText,
  Plus,
  ShieldCheck,
  Printer,
  PenTool,
  CheckCircle2,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const DocumentsView: React.FC = () => {
  const { documents, patients, owners, signDocument, setQuickModal, openPrintModal } = useVet();

  const [signingDocId, setSigningDocId] = useState<string | null>(null);
  const [signerName, setSignerName] = useState('');
  const [signerDni, setSignerDni] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

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
    ctx.strokeStyle = '#0d9488';
    ctx.lineWidth = 2.5;
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

  const handleSaveSignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingDocId || !signerName || !signerDni) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas ? canvas.toDataURL() : '';
    signDocument(signingDocId, signerName, signerDni, dataUrl);
    setSigningDocId(null);
    setSignerName('');
    setSignerDni('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            <span>Documentos Médicos & Consentimientos Informados</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Autorización de anestesia, cirugía, eutanasia, internación y firma digital en pantalla
          </p>
        </div>

        <button
          onClick={() => setQuickModal('NUEVO_CONSENTIMIENTO')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Generar Documento</span>
        </button>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {documents.map((doc) => {
          const patient = patients.find((p) => p.id === doc.patientId);
          const owner = owners.find((o) => o.id === doc.ownerId);

          return (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{doc.title}</h3>
                    <p className="text-xs text-slate-500">
                      Paciente: <span className="text-slate-900 font-bold">{patient?.name}</span> ({patient?.species})
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      doc.isSigned
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {doc.isSigned ? '✅ FIRMADO' : '⏳ PENDIENTE DE FIRMA'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 my-3 leading-relaxed whitespace-pre-line">
                  {doc.content}
                </div>

                {doc.isSigned && (
                  <div className="bg-emerald-50/50 border border-emerald-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="text-emerald-800 font-bold block">Firma Registrada:</span>
                      <span className="text-slate-900 font-medium">{doc.signedByOwnerName}</span>
                      <span className="text-slate-500 block text-[11px]">DNI: {doc.signedByOwnerDni}</span>
                    </div>
                    {doc.signatureDataUrl && (
                      <img
                        src={doc.signatureDataUrl}
                        alt="Firma Digital"
                        className="h-12 w-28 object-contain bg-white rounded border border-slate-200 p-1"
                      />
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">{new Date(doc.createdAt).toLocaleDateString('es-AR')}</span>

                <div className="flex items-center gap-2">
                  {!doc.isSigned && (
                    <button
                      onClick={() => {
                        setSigningDocId(doc.id);
                        if (owner) {
                          setSignerName(`${owner.firstName} ${owner.lastName}`);
                          setSignerDni(owner.dni);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 transition-all"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Firmar en Pantalla</span>
                    </button>
                  )}
                  <button
                    onClick={() =>
                      openPrintModal({
                        type: 'CONSENTIMIENTO',
                        documentId: doc.id,
                        patientId: doc.patientId,
                      })
                    }
                    className="p-1.5 text-slate-500 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                    title="Imprimir / PDF"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Signature Modal */}
      {signingDocId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-teal-600" />
              <span>Firma Digital de Consentimiento Informado</span>
            </h3>

            <form onSubmit={handleSaveSignature} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Nombre Completo del Firmante (Tutor):</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">DNI del Firmante:</label>
                <input
                  type="text"
                  value={signerDni}
                  onChange={(e) => setSignerDni(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-700 font-bold">Dibujá la firma en el recuadro:</label>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="text-teal-600 hover:text-teal-700 underline text-[11px] font-semibold"
                  >
                    Borrar trazo
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={440}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 bg-slate-50 rounded-xl border border-slate-300 cursor-crosshair touch-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSigningDocId(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg shadow-sm"
                >
                  Guardar Firma & Certificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
