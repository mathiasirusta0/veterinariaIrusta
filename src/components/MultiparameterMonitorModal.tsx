import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Heart,
  X,
  Volume2,
  VolumeX,
  AlertTriangle,
  Radio,
  Sliders,
  Play,
  Pause,
  RefreshCw,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const MultiparameterMonitorModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  patientId?: string;
}> = ({ isOpen, onClose, patientId }) => {
  const { patients, selectedPatientId } = useVet();

  const activePatient =
    patients.find((p) => p.id === (patientId || selectedPatientId)) || patients[0];

  const [simState, setSimState] = useState<
    'NORMAL' | 'TAQUICARDIA' | 'BRADICARDIA' | 'DESATURACION' | 'ARRITMIA'
  >('NORMAL');

  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [nibpManual, setNibpManual] = useState({ sys: 120, dia: 75, map: 90 });
  const [pulseBeep, setPulseBeep] = useState(false);

  // Canvas references for waves
  const ecgCanvasRef = useRef<HTMLCanvasElement>(null);
  const spo2CanvasRef = useRef<HTMLCanvasElement>(null);
  const co2CanvasRef = useRef<HTMLCanvasElement>(null);

  // Animation values
  const ecgX = useRef(0);
  const spo2X = useRef(0);
  const co2X = useRef(0);

  // Dynamic values depending on sim state
  let hr = 115;
  let spo2 = 98;
  let etco2 = 38;
  let rr = 20;
  let temp = 38.4;

  if (simState === 'TAQUICARDIA') {
    hr = 175;
    nibpManual.map = 105;
  } else if (simState === 'BRADICARDIA') {
    hr = 52;
    nibpManual.sys = 85;
    nibpManual.dia = 50;
    nibpManual.map = 61;
  } else if (simState === 'DESATURACION') {
    spo2 = 87;
    etco2 = 52;
  } else if (simState === 'ARRITMIA') {
    hr = 135;
  }

  // Animation loop for ECG, SpO2 & EtCO2
  useEffect(() => {
    if (!isOpen) return;

    let animId: number;
    let tick = 0;

    const draw = () => {
      tick++;

      // 1. ECG Canvas (Green)
      const ecgCanvas = ecgCanvasRef.current;
      if (ecgCanvas) {
        const ctx = ecgCanvas.getContext('2d');
        if (ctx) {
          const w = ecgCanvas.width;
          const h = ecgCanvas.height;
          const mid = h / 2;

          // Clear lead area with trailing black
          ctx.fillStyle = 'rgba(11, 17, 32, 0.2)';
          ctx.fillRect(ecgX.current, 0, 8, h);

          // Calculate ECG wave height
          const beatFreq = simState === 'TAQUICARDIA' ? 25 : simState === 'BRADICARDIA' ? 70 : 40;
          const posInBeat = tick % beatFreq;
          let y = mid;

          if (posInBeat === 10) y = mid - 4; // P wave
          else if (posInBeat === 11) y = mid - 6;
          else if (posInBeat === 12) y = mid - 4;
          else if (posInBeat === 15) y = mid + 8; // Q
          else if (posInBeat === 16) {
            y = mid - 32; // R peak
            setPulseBeep(true);
            setTimeout(() => setPulseBeep(false), 80);
          } else if (posInBeat === 17) y = mid + 16; // S
          else if (posInBeat === 21) y = mid - 8; // T wave
          else if (posInBeat === 22) y = mid - 10;
          else if (posInBeat === 23) y = mid - 6;

          ctx.strokeStyle = '#22c55e'; // Bright green
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ecgX.current, mid);
          ctx.lineTo(ecgX.current + 2, y);
          ctx.stroke();

          ecgX.current = (ecgX.current + 2) % w;
        }
      }

      // 2. SpO2 Pleth Wave (Cyan)
      const spo2Canvas = spo2CanvasRef.current;
      if (spo2Canvas) {
        const ctx = spo2Canvas.getContext('2d');
        if (ctx) {
          const w = spo2Canvas.width;
          const h = spo2Canvas.height;
          const mid = h / 2;

          ctx.fillStyle = 'rgba(11, 17, 32, 0.2)';
          ctx.fillRect(spo2X.current, 0, 8, h);

          const beatFreq = simState === 'TAQUICARDIA' ? 25 : 40;
          const pos = tick % beatFreq;
          const amplitude = simState === 'DESATURACION' ? 10 : 20;
          const y = mid - Math.sin((pos / beatFreq) * Math.PI * 2) * amplitude;

          ctx.strokeStyle = '#06b6d4'; // Bright cyan
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(spo2X.current, mid);
          ctx.lineTo(spo2X.current + 2, y);
          ctx.stroke();

          spo2X.current = (spo2X.current + 2) % w;
        }
      }

      // 3. Capnography EtCO2 Wave (Yellow)
      const co2Canvas = co2CanvasRef.current;
      if (co2Canvas) {
        const ctx = co2Canvas.getContext('2d');
        if (ctx) {
          const w = co2Canvas.width;
          const h = co2Canvas.height;
          const base = h - 8;

          ctx.fillStyle = 'rgba(11, 17, 32, 0.2)';
          ctx.fillRect(co2X.current, 0, 8, h);

          const respFreq = 80;
          const pos = tick % respFreq;
          let y = base;

          if (pos > 20 && pos < 55) {
            // Plateau phase
            y = base - 28 + (pos % 3);
          }

          ctx.strokeStyle = '#eab308'; // Bright yellow
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(co2X.current, base);
          ctx.lineTo(co2X.current + 2, y);
          ctx.stroke();

          co2X.current = (co2X.current + 2) % w;
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, simState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-[#0B1120] border-2 border-slate-700 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] text-white">
        {/* Top telemetry bar */}
        <div className="bg-[#070B14] px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${pulseBeep ? 'bg-emerald-400 scale-125' : 'bg-emerald-600'} transition-all shadow-sm shadow-emerald-500`}></span>
              <span className="font-mono font-black text-sm text-emerald-400 tracking-wider">
                TELEMETRÍA EN VIVO UCI / QUIRÓFANO
              </span>
            </div>
            <span className="text-xs text-slate-400">|</span>
            <div className="text-xs">
              <span className="text-slate-400">Paciente: </span>
              <span className="font-bold text-white">{activePatient?.name || 'Modo Simulación'}</span> ({activePatient?.species || 'Canino'} • {activePatient?.weight || 10} kg)
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Alarm status */}
            {simState !== 'NORMAL' && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-600/30 border border-red-500 rounded-lg text-red-300 text-xs font-bold animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>ALARMA FISIOLÓGICA ACTIVA</span>
              </div>
            )}

            <button
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isAudioMuted
                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                  : 'bg-teal-600/30 border-teal-500 text-teal-300'
              }`}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-bounce" />}
              <span>{isAudioMuted ? 'Mute' : 'QRS Beep'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Telemetry Screen Grid */}
        <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar">
          {/* Waves column (Left 3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            {/* 1. ECG II Wave Lead */}
            <div className="bg-[#070D1A] border border-emerald-950/80 rounded-2xl p-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono mb-1 text-emerald-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider">ECG DII (Lead II)</span>
                  <span className="text-[10px] text-emerald-600">1.0 mV • 25 mm/s</span>
                </div>
                <span className="text-xs font-bold">{hr} BPM</span>
              </div>
              <canvas
                ref={ecgCanvasRef}
                width={650}
                height={90}
                className="w-full h-24 bg-transparent rounded-lg"
              />
            </div>

            {/* 2. SpO2 Pleth Wave */}
            <div className="bg-[#070D1A] border border-cyan-950/80 rounded-2xl p-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono mb-1 text-cyan-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider">Pleth (SpO2)</span>
                  <span className="text-[10px] text-cyan-600">Pletismografía Digital</span>
                </div>
                <span className="text-xs font-bold">{spo2}%</span>
              </div>
              <canvas
                ref={spo2CanvasRef}
                width={650}
                height={75}
                className="w-full h-20 bg-transparent rounded-lg"
              />
            </div>

            {/* 3. EtCO2 Capnography Wave */}
            <div className="bg-[#070D1A] border border-yellow-950/80 rounded-2xl p-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs font-mono mb-1 text-yellow-400">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase tracking-wider">Capnografía (EtCO2)</span>
                  <span className="text-[10px] text-yellow-600">Flujo Espiratorio • FR {rr} rpm</span>
                </div>
                <span className="text-xs font-bold">{etco2} mmHg</span>
              </div>
              <canvas
                ref={co2CanvasRef}
                width={650}
                height={75}
                className="w-full h-20 bg-transparent rounded-lg"
              />
            </div>
          </div>

          {/* Numeric Parameter Boxes (Right 1 col) */}
          <div className="space-y-3 flex flex-col justify-between">
            {/* HR Box */}
            <div className="bg-[#070D1A] border-2 border-emerald-500/40 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  FC / Heart Rate
                </span>
                <span className="text-4xl font-black text-emerald-400 font-mono">{hr}</span>
                <span className="text-[10px] text-slate-500 block">LPM (60 - 160)</span>
              </div>
              <Heart className={`w-8 h-8 text-emerald-400 ${pulseBeep ? 'scale-125' : 'scale-100'} transition-transform`} />
            </div>

            {/* SpO2 Box */}
            <div className="bg-[#070D1A] border-2 border-cyan-500/40 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block">
                  SpO2 Sat. O2
                </span>
                <span className={`text-4xl font-black font-mono ${spo2 < 90 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
                  {spo2} <span className="text-base">%</span>
                </span>
                <span className="text-[10px] text-slate-500 block">Alarma &lt; 92%</span>
              </div>
              <Activity className="w-8 h-8 text-cyan-400" />
            </div>

            {/* NIBP / Blood Pressure Box */}
            <div className="bg-[#070D1A] border-2 border-red-500/40 rounded-2xl p-3.5">
              <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block">
                PANI / Presión Arterial
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-white font-mono">
                  {nibpManual.sys}/{nibpManual.dia}
                </span>
                <span className="text-xs text-red-400 font-bold font-mono">
                  PAM: {nibpManual.map} mmHg
                </span>
              </div>
            </div>

            {/* Temp & EtCO2 Box */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#070D1A] border border-yellow-500/30 rounded-xl p-2.5">
                <span className="text-[9px] uppercase font-bold text-yellow-400 block">EtCO2:</span>
                <span className="text-xl font-bold text-yellow-400 font-mono">{etco2}</span>
                <span className="text-[9px] text-slate-500 block">mmHg</span>
              </div>
              <div className="bg-[#070D1A] border border-slate-700 rounded-xl p-2.5">
                <span className="text-[9px] uppercase font-bold text-slate-300 block">Temp:</span>
                <span className="text-xl font-bold text-white font-mono">{temp}</span>
                <span className="text-[9px] text-slate-500 block">°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simulation Control Drawer */}
        <div className="bg-[#070B14] px-5 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-teal-400" />
            <span className="font-bold text-slate-300">Simulador de Ritmo Fisiológico:</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'NORMAL', label: 'Sinusal Normal', color: 'hover:bg-emerald-600' },
              { id: 'TAQUICARDIA', label: 'Taquicardia (>160)', color: 'hover:bg-amber-600' },
              { id: 'BRADICARDIA', label: 'Bradicardia (<60)', color: 'hover:bg-purple-600' },
              { id: 'DESATURACION', label: 'Hipoxemia (SpO2 87%)', color: 'hover:bg-red-600' },
              { id: 'ARRITMIA', label: 'Extrasístoles Ventriculares', color: 'hover:bg-orange-600' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setSimState(st.id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                  simState === st.id
                    ? 'bg-teal-600 text-white shadow-md shadow-teal-500/30'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
          >
            Cerrar Monitor
          </button>
        </div>
      </div>
    </div>
  );
};
