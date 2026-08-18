import React from 'react';
import {
  Scan,
  Plus,
  Image as ImageIcon,
  FileText,
  Calendar,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const ImagingView: React.FC = () => {
  const { imagingStudies, patients, setQuickModal } = useVet();

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Scan className="w-5 h-5 text-teal-600" />
            <span>Imágenes Diagnósticas & Informes</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Radiografías digitales (RX), Ecografías abdominales y cardíacas, Tomografía y Endoscopía
          </p>
        </div>

        <button
          onClick={() => setQuickModal('NUEVA_IMAGEN')}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-md shadow-teal-600/20 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Estudio de Imagen</span>
        </button>
      </div>

      {/* Studies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {imagingStudies.map((study) => {
          const patient = patients.find((p) => p.id === study.patientId);

          return (
            <div
              key={study.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-teal-500/50 transition-all shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {study.modality} — {study.region}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Paciente: <span className="text-slate-900 font-bold">{patient?.name}</span> • Estudio:{' '}
                      <span className="font-mono text-teal-700 font-bold">{study.studyNumber}</span>
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    {study.status}
                  </span>
                </div>

                {/* Image Previews if available */}
                {study.imageUrls && study.imageUrls.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 my-3">
                    {study.imageUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Estudio de imagen"
                        className="w-full h-36 object-cover rounded-xl border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                )}

                {/* Report Findings */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">
                      Hallazgos Radiológicos / Ecográficos:
                    </span>
                    <p className="text-slate-700 mt-0.5">{study.findings}</p>
                  </div>

                  {study.conclusion && (
                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-teal-700 font-bold block text-[10px] uppercase">
                        Conclusión Diagnóstica:
                      </span>
                      <p className="text-slate-900 font-bold mt-0.5">{study.conclusion}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                <span>Informó: {study.specialistName}</span>
                <span>{new Date(study.date).toLocaleDateString('es-AR')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
