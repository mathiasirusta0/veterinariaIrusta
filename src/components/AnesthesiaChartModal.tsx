import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Activity,
  Droplet,
  Clock,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { formatDurationMinutes } from '../utils/formatters';

export interface AnesthesiaDataPoint {
  id: string;
  minute: number;
  timeStr: string;
  heartRate: number;
  respiratoryRate: number;
  spo2: number;
  etco2: number;
  meanBP: number;
  temp: number;
  isoPercent: number;
  o2FlowLMin: number;
  fluidsMlTotal: number;
  drugsBolus?: string;
}

interface AnesthesiaChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId?: string | null;
  surgeryProcedureName?: string;
}

export const AnesthesiaChartModal: React.FC<AnesthesiaChartModalProps> = ({
  isOpen,
  onClose,
  patientId,
  surgeryProcedureName = 'Cirugía General & Procedimiento Quirúrgico',
}) => {
  const { patients, showToast, logAudit } = useVet();
  const patient = patients.find((p) => p.id === patientId) || patients[0];

  const [isRunning, setIsRunning] = useState(true);
  const [elapsedMinutes, setElapsedMinutes] = useState(25);

  const [points, setPoints] = useState<AnesthesiaDataPoint[]>([
    { id: 'p-0', minute: 0, timeStr: '10:00', heartRate: 115, respiratoryRate: 20, spo2: 98, etco2: 36, meanBP: 85, temp: 38.2, isoPercent: 2.0, o2FlowLMin: 1.5, fluidsMlTotal: 50, drugsBolus: 'Inducción Propofol + Fentanilo' },
    { id: 'p-5', minute: 5, timeStr: '10:05', heartRate: 110, respiratoryRate: 18, spo2: 99, etco2: 38, meanBP: 82, temp: 38.0, isoPercent: 1.8, o2FlowLMin: 1.2, fluidsMlTotal: 100 },
    { id: 'p-10', minute: 10, timeStr: '10:10', heartRate: 108, respiratoryRate: 16, spo2: 98, etco2: 40, meanBP: 80, temp: 37.8, isoPercent: 1.5, o2FlowLMin: 1.0, fluidsMlTotal: 150 },
    { id: 'p-15', minute: 15, timeStr: '10:15', heartRate: 125, respiratoryRate: 22, spo2: 97, etco2: 42, meanBP: 76, temp: 37.6, isoPercent: 1.8, o2FlowLMin: 1.2, fluidsMlTotal: 200, drugsBolus: 'Rescate Fentanilo 2 ug/kg' },
    { id: 'p-20', minute: 20, timeStr: '10:20', heartRate: 105, respiratoryRate: 15, spo2: 99, etco2: 39, meanBP: 84, temp: 37.5, isoPercent: 1.5, o2FlowLMin: 1.0, fluidsMlTotal: 250 },
    { id: 'p-25', minute: 25, timeStr: '10:25', heartRate: 102, respiratoryRate: 14, spo2: 99, etco2: 38, meanBP: 85, temp: 37.4, isoPercent: 1.5, o2FlowLMin: 1.0, fluidsMlTotal: 300 },
  ]);

  // New Point Form State
  const [newHR, setNewHR] = useState('105');
  const [newFR, setNewFR] = useState('16');
  const [newSpO2, setNewSpO2] = useState('99');
  const [newEtCO2, setNewEtCO2] = useState('38');
  const [newPAM, setNewPAM] = useState('82');
  const [newTemp, setNewTemp] = useState('37.4');
  const [newIso, setNewIso] = useState('1.5');
  const [newO2, setNewO2] = useState('1.0');
  const [newFluids, setNewFluids] = useState('350');
  const [newBolus, setNewBolus] = useState('');

  if (!isOpen || !patient) return null;

  const handleAddPoint = (e: React.FormEvent) => {
    e.preventDefault();
    const nextMinute = elapsedMinutes + 5;
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newPt: AnesthesiaDataPoint = {
      id: `anest-${Date.now()}`,
      minute: nextMinute,
      timeStr,
      heartRate: parseInt(newHR) || 100,
      respiratoryRate: parseInt(newFR) || 16,
      spo2: parseInt(newSpO2) || 98,
      etco2: parseInt(newEtCO2) || 38,
      meanBP: parseInt(newPAM) || 80,
      temp: parseFloat(newTemp) || 37.5,
      isoPercent: parseFloat(newIso) || 1.5,
      o2FlowLMin: parseFloat(newO2) || 1.0,
      fluidsMlTotal: parseInt(newFluids) || 350,
      drugsBolus: newBolus || undefined,
    };

    setPoints((prev) => [...prev, newPt]);
    setElapsedMinutes(nextMinute);
    setNewBolus('');
    showToast('success', 'Punto Anestésico Registrado', `Minuto ${nextMinute}: FC ${newPt.heartRate}, SpO2 ${newPt.spo2}%, PAM ${newPt.meanBP}`);
  };

  const handleSaveAnesthesiaSheet = () => {
    showToast(
      'success',
      'Hoja Anestésica Guardada',
      `Protocolo intraquirúrgico certificado (${points.length} puntos de registro) para ${patient.name}.`
    );
    logAudit(
      'REGISTRO_HOJA_ANESTESICA',
      'SurgeryRecord',
      patient.id,
      `Hoja de registro anestésico guardada: ${points.length} intervalos de 5 min para ${patient.name} en ${surgeryProcedureName}`
    );
    onClose();
  };

  const latestPoint = points[points.length - 1];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
              🫁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Hoja de Registro Anestésico Intraoperatorio en Vivo
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold font-mono uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Tiempo Anestésico: {elapsedMinutes} min ({formatDurationMinutes(elapsedMinutes)})
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Paciente: <span className="text-white font-bold">{patient?.name || 'Modo General'}</span> ({patient?.species || 'Canino'} • {patient?.weight || 10} kg) • Procedimiento: <span className="text-emerald-300 font-semibold">{surgeryProcedureName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Imprimir / Exportar Hoja"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Quick Vital Tiles Summary */}
          {latestPoint && (
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-emerald-400 font-bold uppercase block">Frec. Cardíaca</span>
                <span className="text-xl font-black font-mono text-white">{latestPoint.heartRate}</span>
                <span className="text-[9px] text-slate-400 block">lpm</span>
              </div>
              <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-cyan-400 font-bold uppercase block">Saturación SpO2</span>
                <span className="text-xl font-black font-mono text-white">{latestPoint.spo2}%</span>
                <span className="text-[9px] text-slate-400 block">Pletismografía</span>
              </div>
              <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-amber-400 font-bold uppercase block">Capnografía EtCO2</span>
                <span className="text-xl font-black font-mono text-white">{latestPoint.etco2}</span>
                <span className="text-[9px] text-slate-400 block">mmHg</span>
              </div>
              <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-red-400 font-bold uppercase block">Presión Media PAM</span>
                <span className="text-xl font-black font-mono text-white">{latestPoint.meanBP}</span>
                <span className="text-[9px] text-slate-400 block">mmHg</span>
              </div>
              <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-purple-400 font-bold uppercase block">Isoflurano</span>
                <span className="text-xl font-black font-mono text-white">{latestPoint.isoPercent}%</span>
                <span className="text-[9px] text-slate-400 block">{latestPoint.o2FlowLMin} L/min O2</span>
              </div>
              <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800 text-center">
                <span className="text-[10px] text-blue-400 font-bold uppercase block">Temperatura</span>
                <span className="text-xl font-black font-mono text-white">{latestPoint.temp} °C</span>
                <span className="text-[9px] text-slate-400 block">Esofágica</span>
              </div>
            </div>
          )}

          {/* Visual SVG Trend Curve Graphic */}
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs flex items-center gap-2 text-emerald-400">
                <Activity className="w-4 h-4" />
                Curva de Estabilidad Hemodinámica Intraquirúrgica
              </span>
              <div className="flex items-center gap-4 text-[10px] font-medium">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> FC (lpm)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> SpO2 (%)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> PAM (mmHg)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> EtCO2</span>
              </div>
            </div>

            {/* SVG Visual Timeline Graphic */}
            <div className="h-40 w-full relative flex items-end justify-between px-4 pt-4 border-b border-slate-800">
              {/* Grid Lines */}
              <div className="absolute inset-x-0 top-1/4 border-b border-slate-800/80"></div>
              <div className="absolute inset-x-0 top-2/4 border-b border-slate-800/80"></div>
              <div className="absolute inset-x-0 top-3/4 border-b border-slate-800/80"></div>

              {points.map((pt, idx) => (
                <div key={pt.id} className="flex-1 flex flex-col items-center gap-1 relative z-10 group">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-950 text-white px-2 py-1 rounded text-[9px] font-mono whitespace-nowrap shadow-xl border border-slate-700">
                    Min {pt.minute} • FC:{pt.heartRate} | SpO2:{pt.spo2}% | PAM:{pt.meanBP} | EtCO2:{pt.etco2}
                    {pt.drugsBolus && <div className="text-amber-400 font-bold">💊 {pt.drugsBolus}</div>}
                  </div>

                  {/* Multi-point Bar */}
                  <div className="w-full flex justify-center items-end h-28 gap-0.5">
                    {/* FC Bar */}
                    <div
                      style={{ height: `${Math.min(100, Math.max(20, (pt.heartRate / 160) * 100))}%` }}
                      className="w-2 bg-emerald-500 rounded-t-sm"
                      title={`FC: ${pt.heartRate} lpm`}
                    ></div>
                    {/* PAM Bar */}
                    <div
                      style={{ height: `${Math.min(100, Math.max(20, (pt.meanBP / 120) * 100))}%` }}
                      className="w-2 bg-red-500 rounded-t-sm"
                      title={`PAM: ${pt.meanBP} mmHg`}
                    ></div>
                  </div>

                  <span className="text-[10px] font-mono text-slate-400">{pt.minute}'</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form to log next 5-min interval */}
          <form onSubmit={handleAddPoint} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                Registrar Nuevo Intervalo (+5 Minutos):
              </span>
              <span className="text-[11px] font-mono text-teal-700 font-bold">
                Próximo punto: Minuto {elapsedMinutes + 5}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">FC (lpm):</label>
                <input
                  type="number"
                  value={newHR}
                  onChange={(e) => setNewHR(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">FR (rpm):</label>
                <input
                  type="number"
                  value={newFR}
                  onChange={(e) => setNewFR(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">SpO2 (%):</label>
                <input
                  type="number"
                  value={newSpO2}
                  onChange={(e) => setNewSpO2(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">EtCO2 (mmHg):</label>
                <input
                  type="number"
                  value={newEtCO2}
                  onChange={(e) => setNewEtCO2(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">PAM (mmHg):</label>
                <input
                  type="number"
                  value={newPAM}
                  onChange={(e) => setNewPAM(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold font-mono text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Isoflurano (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newIso}
                  onChange={(e) => setNewIso(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Flujo O2 (L/min):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newO2}
                  onChange={(e) => setNewO2(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Temp (°C):</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTemp}
                  onChange={(e) => setNewTemp(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 font-bold font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Fármaco / Bolo administrado:</label>
                <input
                  type="text"
                  placeholder="ej: Fentanilo 1ml, Atropina"
                  value={newBolus}
                  onChange={(e) => setNewBolus(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Punto (+5 min)</span>
              </button>
            </div>
          </form>

          {/* Chronological Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-mono text-[10px] uppercase">
                  <th className="p-2.5">Min</th>
                  <th className="p-2.5">Hora</th>
                  <th className="p-2.5">FC (lpm)</th>
                  <th className="p-2.5">FR (rpm)</th>
                  <th className="p-2.5">SpO2</th>
                  <th className="p-2.5">EtCO2</th>
                  <th className="p-2.5">PAM</th>
                  <th className="p-2.5">Temp</th>
                  <th className="p-2.5">Iso %</th>
                  <th className="p-2.5">Fluidos</th>
                  <th className="p-2.5">Eventos / Fármacos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {points.map((pt) => (
                  <tr key={pt.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900">{pt.minute}'</td>
                    <td className="p-2.5 text-slate-500">{pt.timeStr}</td>
                    <td className="p-2.5 font-bold text-emerald-700">{pt.heartRate}</td>
                    <td className="p-2.5 text-slate-800">{pt.respiratoryRate}</td>
                    <td className="p-2.5 font-bold text-cyan-700">{pt.spo2}%</td>
                    <td className="p-2.5 font-bold text-amber-700">{pt.etco2}</td>
                    <td className="p-2.5 font-bold text-red-700">{pt.meanBP}</td>
                    <td className="p-2.5 text-slate-800">{pt.temp} °C</td>
                    <td className="p-2.5 text-purple-700">{pt.isoPercent}%</td>
                    <td className="p-2.5 text-slate-700">{pt.fluidsMlTotal} ml</td>
                    <td className="p-2.5 text-slate-800 font-sans text-xs">
                      {pt.drugsBolus ? (
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded font-bold">
                          {pt.drugsBolus}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Total de intervalos registrados: <strong className="text-slate-900">{points.length}</strong>
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold rounded-xl transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSaveAnesthesiaSheet}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar & Certificar Anestesia</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
