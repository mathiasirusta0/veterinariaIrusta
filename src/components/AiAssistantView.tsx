import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Stethoscope,
  BedDouble,
  Heart,
  Bot,
  User,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const AiAssistantView: React.FC = () => {
  const { callAiAssistant, patients } = useVet();

  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [taskType, setTaskType] = useState('soap');
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activePatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim()) return;

    setLoading(true);
    setResultText(null);

    const res = await callAiAssistant(taskType, inputPrompt, {
      name: activePatient.name,
      species: activePatient.species,
      breed: activePatient.breed,
      age: activePatient.calculatedAge,
      weight: activePatient.weight,
    });

    setLoading(false);
    if (res.success) {
      setResultText(res.text);
    }
  };

  const handleCopy = () => {
    if (resultText) {
      navigator.clipboard.writeText(resultText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 uppercase tracking-wider">
              Gemini 2.5 Flash Integrado (Server-Side)
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-600" />
            <span>Asistente IA Clínico & Generador de Documentación</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Soporte diagnóstico veterinario, estructuración SOAP automática, pases de guardia y cartas para tutores
          </p>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Prompt Config */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Configuración de Consulta IA
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-slate-700 block font-bold mb-1">Paciente en Contexto:</label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species} - {p.breed}) - {p.weight} kg
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Tipo de Tarea Clínica:</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'soap', label: 'Estructurar SOAP', desc: 'A partir de notas libres' },
                  { id: 'handover_summary', label: 'Pase de Guardia', desc: 'Resumen para internación' },
                  { id: 'owner_summary', label: 'Explicación Tutor', desc: 'Lenguaje claro sin tecnicismos' },
                  { id: 'triage_eval', label: 'Soporte Triage', desc: 'Clasificación de riesgo' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTaskType(t.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      taskType === t.id
                        ? 'bg-teal-50 border-teal-500 text-teal-800 font-bold ring-1 ring-teal-500'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-bold text-xs">{t.label}</div>
                    <div className="text-[10px] opacity-75">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">
                Texto / Hallazgos Clínicos / Instrucción:
              </label>
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                rows={6}
                placeholder="Escribí notas libres del examen, síntomas, dudas diagnósticas o tratamientos a resumir..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
              ></textarea>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !inputPrompt.trim()}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-bold rounded-lg shadow-md shadow-teal-600/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                  <span>Consultando a Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Ejecutar Asistente IA</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 2 Cols: AI Result Output */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Resultado del Asistente Clínico</h3>
              </div>

              {resultText && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-slate-900 px-3 py-1.5 bg-slate-100 rounded-lg transition-colors font-semibold"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar Texto'}</span>
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-20 text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-3 border-teal-600 border-t-transparent animate-spin mx-auto"></div>
                <p className="text-xs text-slate-500 font-medium">
                  Procesando razonamiento clínico veterinario con Gemini...
                </p>
              </div>
            ) : resultText ? (
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                {resultText}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs space-y-2">
                <Sparkles className="w-10 h-10 mx-auto opacity-40 text-teal-600" />
                <p>Completá el campo de texto a la izquierda y hacé clic en "Ejecutar Asistente IA".</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400">
            ⚠️ <span className="font-semibold text-slate-600">Nota clínica:</span> El Asistente IA funciona como soporte y ayuda diagnóstica. Todo plan terapéutico y prescripción farmacológica debe ser validado por el médico veterinario a cargo.
          </div>
        </div>
      </div>
    </div>
  );
};
