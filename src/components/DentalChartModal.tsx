import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Plus,
  Trash2,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export interface ToothCondition {
  number: number;
  condition:
    | 'SANO'
    | 'SARRO_I'
    | 'SARRO_II'
    | 'SARRO_III'
    | 'FRACTURA'
    | 'FORL'
    | 'GINGIVITIS'
    | 'EXTRAIDO'
    | 'AUSENTE'
    | 'MOVILIDAD';
  notes?: string;
}

// Triadan Canine: Upper right (101-110), Upper left (201-210), Lower left (301-311), Lower right (401-411)
const CANINE_UPPER_RIGHT = [110, 109, 108, 107, 106, 105, 104, 103, 102, 101];
const CANINE_UPPER_LEFT = [201, 202, 203, 204, 205, 206, 207, 208, 209, 210];
const CANINE_LOWER_RIGHT = [411, 410, 409, 408, 407, 406, 405, 404, 403, 402, 401];
const CANINE_LOWER_LEFT = [301, 302, 303, 304, 305, 306, 307, 308, 309, 310, 311];

// Triadan Feline: Upper right (101-104, 106-109), Upper left (201-204, 206-209), Lower left (301-304, 307-309), Lower right (401-404, 407-409)
const FELINE_UPPER_RIGHT = [109, 108, 107, 106, 104, 103, 102, 101];
const FELINE_UPPER_LEFT = [201, 202, 203, 204, 206, 207, 208, 209];
const FELINE_LOWER_RIGHT = [409, 408, 407, 404, 403, 402, 401];
const FELINE_LOWER_LEFT = [301, 302, 303, 304, 307, 308, 309];

const CONDITION_COLORS: Record<ToothCondition['condition'], { bg: string; text: string; label: string; border: string }> = {
  SANO: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Sano / Normal', border: 'border-emerald-300' },
  SARRO_I: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Sarro Grado I (Leve)', border: 'border-amber-300' },
  SARRO_II: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Sarro Grado II (Moderado)', border: 'border-amber-400' },
  SARRO_III: { bg: 'bg-orange-100', text: 'text-orange-900', label: 'Sarro Grado III (Severo / Subgingival)', border: 'border-orange-500' },
  FRACTURA: { bg: 'bg-red-100', text: 'text-red-800', label: 'Fractura Dental / Exposición Pulpar', border: 'border-red-400' },
  FORL: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Reabsorción Odontoclástica (FORL)', border: 'border-purple-400' },
  GINGIVITIS: { bg: 'bg-rose-100', text: 'text-rose-800', label: 'Gingivitis / Periodontitis', border: 'border-rose-400' },
  EXTRAIDO: { bg: 'bg-slate-200', text: 'text-slate-700', label: 'Pieza Extraída en Procedimiento', border: 'border-slate-400' },
  AUSENTE: { bg: 'bg-slate-100', text: 'text-slate-400', label: 'Ausente / Anodoncia Previa', border: 'border-slate-300' },
  MOVILIDAD: { bg: 'bg-yellow-100', text: 'text-yellow-900', label: 'Movilidad Grado II-III', border: 'border-yellow-400' },
};

interface DentalChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string | null;
}

export const DentalChartModal: React.FC<DentalChartModalProps> = ({
  isOpen,
  onClose,
  patientId,
}) => {
  const { patients, showToast, logAudit } = useVet();

  const patient = patients.find((p) => p.id === patientId) || patients[0];
  const isFeline = patient?.species?.toLowerCase().includes('fel') || patient?.species?.toLowerCase().includes('gato');

  const [selectedCondition, setSelectedCondition] = useState<ToothCondition['condition']>('SARRO_II');
  const [teethState, setTeethState] = useState<Record<number, ToothCondition>>({
    104: { number: 104, condition: 'SARRO_I', notes: 'Placa leve en canino superior derecho' },
    108: { number: 108, condition: 'SARRO_III', notes: 'Cálculo dental marcado en 4to premolar superior' },
    208: { number: 208, condition: 'SARRO_II', notes: 'Sarro moderado' },
    309: { number: 309, condition: 'GINGIVITIS', notes: 'Bolsa periodontal en primer molar' },
  });

  const [generalDiagnosis, setGeneralDiagnosis] = useState(
    'Enfermedad periodontal Grado II generalizada con sarro subgingival en premolares y molares superiores.'
  );
  const [treatmentPlan, setTreatmentPlan] = useState(
    '1. Profilaxis ultrasónica supragingival y subgingival.\n2. Pulido dental con pasta abrasiva de flúor.\n3. Sondaje periodontal de arcadas.\n4. Terapia antibiótica posprofilaxis (Espiramicina + Metronidazol) por 7 días.'
  );

  if (!isOpen || !patient) return null;

  const upperRight = isFeline ? FELINE_UPPER_RIGHT : CANINE_UPPER_RIGHT;
  const upperLeft = isFeline ? FELINE_UPPER_LEFT : CANINE_UPPER_LEFT;
  const lowerRight = isFeline ? FELINE_LOWER_RIGHT : CANINE_LOWER_RIGHT;
  const lowerLeft = isFeline ? FELINE_LOWER_LEFT : CANINE_LOWER_LEFT;

  const handleToothClick = (toothNum: number) => {
    setTeethState((prev) => {
      const current = prev[toothNum];
      if (current && current.condition === selectedCondition) {
        // If clicked again with same condition, revert to SANO
        const copy = { ...prev };
        delete copy[toothNum];
        return copy;
      }
      return {
        ...prev,
        [toothNum]: {
          number: toothNum,
          condition: selectedCondition,
        },
      };
    });
  };

  const handleSaveDentalRecord = () => {
    showToast(
      'success',
      'Odontograma Guardado',
      `Ficha odontológica registrada para ${patient?.name || 'Paciente'} (${Object.keys(teethState).length} piezas evaluadas).`
    );
    if (patient?.id) {
      logAudit(
        'REGISTRO_ODONTOGRAMA',
        'Patient',
        patient.id,
        `Odontograma Triadan guardado: ${Object.keys(teethState).length} piezas marcadas para ${patient.name}`
      );
    }
    onClose();
  };

  const getToothBadge = (num: number) => {
    const item = teethState[num];
    const cond = item ? item.condition : 'SANO';
    const cfg = CONDITION_COLORS[cond];

    return (
      <button
        key={num}
        type="button"
        onClick={() => handleToothClick(num)}
        title={`Pieza Triadan ${num}: ${cfg.label}`}
        className={`w-9 h-11 rounded-lg flex flex-col items-center justify-between p-1 border font-mono text-[10px] transition-all hover:scale-105 active:scale-95 shadow-2xs ${cfg.bg} ${cfg.border} ${
          item ? 'ring-2 ring-teal-500 ring-offset-1 font-black' : 'hover:border-teal-400 text-slate-600'
        }`}
      >
        <span className="font-bold">{num}</span>
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            cond === 'SANO'
              ? 'bg-emerald-400'
              : cond.startsWith('SARRO')
              ? 'bg-amber-500'
              : cond === 'FRACTURA'
              ? 'bg-red-500'
              : cond === 'FORL'
              ? 'bg-purple-600'
              : cond === 'EXTRAIDO' || cond === 'AUSENTE'
              ? 'bg-slate-400'
              : 'bg-rose-500'
          }`}
        ></div>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div role="dialog" aria-modal="true" className="bg-white border border-slate-200 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-lg">
              🦷
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Odontograma Clínico Veterinario (Sistema Triadan Modificado)
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Condition Selector Palette */}
          <div>
            <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-2">
              1. Seleccioná la condición o patología y hacé clic en las piezas dentales:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(Object.keys(CONDITION_COLORS) as ToothCondition['condition'][]).map((cond) => {
                const cfg = CONDITION_COLORS[cond];
                const isSelected = selectedCondition === cond;

                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setSelectedCondition(cond)}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm font-bold'
                        : `${cfg.bg} ${cfg.border} text-slate-700 hover:border-slate-400`
                    }`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        isSelected
                          ? 'bg-white'
                          : cond === 'SANO'
                          ? 'bg-emerald-500'
                          : cond.startsWith('SARRO')
                          ? 'bg-amber-500'
                          : cond === 'FRACTURA'
                          ? 'bg-red-500'
                          : 'bg-purple-600'
                      }`}
                    ></span>
                    <span className="text-[11px] leading-tight truncate">{cfg.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dental Arcades Visual Grid */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-6">
            {/* Upper Arcade (Maxilar Superior) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Arcada Superior (Maxilar)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">DERECHA ⟵ VISTA FRONTAL ⟶ IZQUIERDA</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {/* Cuadrante 1 (Superior Derecho) */}
                <div className="flex items-center gap-1 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  {upperRight.map(getToothBadge)}
                </div>

                <div className="h-10 w-0.5 bg-slate-300 mx-1"></div>

                {/* Cuadrante 2 (Superior Izquierdo) */}
                <div className="flex items-center gap-1 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  {upperLeft.map(getToothBadge)}
                </div>
              </div>
            </div>

            {/* Lower Arcade (Mandíbula Inferior) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Arcada Inferior (Mandíbula)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">DERECHA ⟵ VISTA FRONTAL ⟶ IZQUIERDA</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {/* Cuadrante 4 (Inferior Derecho) */}
                <div className="flex items-center gap-1 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  {lowerRight.map(getToothBadge)}
                </div>

                <div className="h-10 w-0.5 bg-slate-300 mx-1"></div>

                {/* Cuadrante 3 (Inferior Izquierdo) */}
                <div className="flex items-center gap-1 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
                  {lowerLeft.map(getToothBadge)}
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic & Plan Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-900 block mb-1">
                Diagnóstico Odontológico & Hallazgos:
              </label>
              <textarea
                value={generalDiagnosis}
                onChange={(e) => setGeneralDiagnosis(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 block mb-1">
                Plan Terapéutico & Profilaxis / Extracciones:
              </label>
              <textarea
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Total de piezas con hallazgos:{' '}
            <strong className="text-slate-900">{Object.keys(teethState).length}</strong>
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
              onClick={handleSaveDentalRecord}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Ficha Odontológica</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
