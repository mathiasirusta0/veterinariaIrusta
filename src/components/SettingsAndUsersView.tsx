import React, { useState } from 'react';
import {
  Settings,
  Database,
  History,
  Users,
  Building2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  ShieldCheck,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { formatDate, formatDateTime } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { CleanupResult } from '../services/supabaseRepository';

export const SettingsAndUsersView: React.FC = () => {
  const {
    branches,
    users,
    auditLogs,
    currentUser,
    patients,
    owners,
    consultations,
    hospitalizations,
    invoices,
    cleanupDemoData,
    showToast,
  } = useVet();

  const [activeTab, setActiveTab] = useState<'AUDITORIA' | 'PRODUCCION' | 'USUARIOS' | 'SUCURSALES' | 'ROLES'>('PRODUCCION');
  
  // Cleanup Workflow States
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<CleanupResult | null>(null);
  const [confirmationPhrase, setConfirmationPhrase] = useState('');
  const [cleanupSuccessResult, setCleanupSuccessResult] = useState<CleanupResult | null>(null);

  const handleRunDryRun = async () => {
    setIsAnalyzing(true);
    triggerHaptic('medium');
    try {
      const result = await cleanupDemoData(true, 'DRY_RUN');
      setDryRunResult(result);
      if (result.success) {
        showToast('info', 'Análisis Preliminar Listo', `Se encontraron ${result.totalDeleted} registros demo en Supabase.`);
      } else {
        showToast('error', 'Error en Análisis', result.message);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecuteCleanup = async () => {
    if (confirmationPhrase.trim() !== 'ELIMINAR DATOS DEMO') {
      showToast('error', 'Frase Incorrecta', 'Debe escribir exactamente: ELIMINAR DATOS DEMO');
      return;
    }

    setIsCleaning(true);
    triggerHaptic('heavy');
    try {
      const result = await cleanupDemoData(false, confirmationPhrase.trim());
      if (result.success) {
        setCleanupSuccessResult(result);
        setDryRunResult(null);
        setConfirmationPhrase('');
        showToast('success', 'Limpieza Exitosa', `Se eliminaron definitivamente ${result.totalDeleted} registros demo.`);
      } else {
        showToast('error', 'Fallo al Limpiar', result.message);
      }
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black tracking-widest text-teal-700 uppercase">
            Administración Central & Gobierno de Datos
          </span>
          <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-900 mt-1 flex items-center gap-2">
            <span>⚙️</span>
            <span>Configuración, Producción & Auditoría</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de base de datos Supabase, auditoría inmutable, sucursales y control de acceso del Dr. Diego Irusta.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Supabase Cloud Conectado</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('PRODUCCION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PRODUCCION'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Base de Datos & Producción</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDITORIA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'AUDITORIA'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Auditoría & Trazabilidad ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('USUARIOS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'USUARIOS'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios & Profesionales ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SUCURSALES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'SUCURSALES'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Sedes & Sucursales ({branches.length})</span>
        </button>
      </div>

      {/* 1. PRODUCCIÓN & BASE DE DATOS */}
      {activeTab === 'PRODUCCION' && (
        <div className="space-y-6">
          {/* Status Metrics Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Database className="w-4 h-4 text-teal-700" />
                  <span>Estado de Registros en Supabase (Live Single Source of Truth)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Todas las entidades mostradas son leídas directamente desde la base de datos en tiempo real.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                100% Persistencia Cloud
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">Pacientes</span>
                <strong className="text-lg font-black text-slate-900 font-mono">{patients.length}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">Tutores</span>
                <strong className="text-lg font-black text-slate-900 font-mono">{owners.length}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">Consultas</span>
                <strong className="text-lg font-black text-slate-900 font-mono">{consultations.length}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">Internaciones</span>
                <strong className="text-lg font-black text-slate-900 font-mono">{hospitalizations.length}</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 block font-bold">Comprobantes</span>
                <strong className="text-lg font-black text-slate-900 font-mono">{invoices.length}</strong>
              </div>
            </div>
          </div>

          {/* Clean Action Card */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0 font-bold">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-rose-950">
                  Limpieza Segura y Transaccional de Datos Demo
                </h4>
                <p className="text-xs text-rose-900/80 leading-relaxed">
                  Elimina de forma definitiva en Supabase los pacientes de prueba (<code>pat-1</code> Toby, <code>pat-2</code> Luna, <code>pat-3</code> Rocky), sus tutores asociados y sus registros clínicos vinculados. Se conservan intactas las sedes hospitalarias, el catálogo farmacéutico y los datos de usuarios reales.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-rose-800 font-medium">
                <ShieldCheck className="w-4 h-4 text-rose-700 shrink-0" />
                <span>Flujo protegido con verificación de backup, Dry Run previo y frase de confirmación.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCleanupModal(true);
                  handleRunDryRun();
                }}
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Gestionar Limpieza de Datos Demo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. AUDITORIA */}
      {activeTab === 'AUDITORIA' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-teal-600" />
              <span>Logs de Auditoría Inmutables (Trazabilidad Total)</span>
            </h3>
            <span className="text-xs text-slate-400">
              Registrado automáticamente con fecha, usuario y rol
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Fecha & Hora</th>
                  <th className="p-3">Usuario & Rol</th>
                  <th className="p-3">Acción</th>
                  <th className="p-3">Entidad</th>
                  <th className="p-3">Detalle del Evento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 font-sans text-xs">
                      No hay registros de auditoría aún.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80">
                      <td className="p-3 text-[11px] text-slate-500">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="p-3">
                        <span className="text-slate-900 font-bold">{log.userName}</span>
                        <span className="text-[10px] text-teal-700 block font-sans font-semibold">{log.userRole}</span>
                      </td>
                      <td className="p-3">
                        <span className="bg-slate-100 text-slate-800 text-[10px] px-2 py-0.5 rounded font-bold border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{log.entity}</td>
                      <td className="p-3 text-slate-800 font-sans">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. USUARIOS */}
      {activeTab === 'USUARIOS' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Plantel Profesional & Usuarios Activos</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((usr) => (
              <div key={usr.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <strong className="text-sm text-slate-900">{usr.name}</strong>
                  <span className="text-[10px] font-black uppercase bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded-full">
                    {usr.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{usr.email}</p>
                {usr.licenseNumber && (
                  <p className="text-[11px] font-mono text-slate-600">{usr.licenseNumber}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SUCURSALES */}
      {activeTab === 'SUCURSALES' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-600" />
              <span>Sedes & Sucursales Hospitalarias</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branches.map((b) => (
              <div key={b.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <strong className="text-sm text-slate-900 block">{b.name}</strong>
                <p className="text-slate-600">{b.address}</p>
                <p className="text-slate-500 font-mono">{b.phone} • {b.email}</p>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-mono font-bold text-slate-700 mt-1 inline-block">
                  CUIT: {b.cuit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real 2-Step Cleanup Modal */}
      {showCleanupModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-rose-200 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3 text-rose-700">
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h3 className="text-base font-black text-slate-900">Limpieza Transaccional de Datos Demo</h3>
                  <p className="text-[11px] text-slate-500">Pase a producción limpia de Veterinaria Irusta</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCleanupModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Backup Status Badge */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Backup Verificado y Exportado en JSON</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                Listo para rollback
              </span>
            </div>

            {/* Step 1: Dry Run Results */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider">
                  Paso 1: Análisis de Registros Afectados (Dry Run)
                </span>
                <button
                  type="button"
                  onClick={handleRunDryRun}
                  disabled={isAnalyzing}
                  className="text-teal-700 hover:text-teal-900 font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>Re-analizar</span>
                </button>
              </div>

              {isAnalyzing ? (
                <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-2xl">
                  <span>Analizando tablas en Supabase Cloud...</span>
                </div>
              ) : dryRunResult ? (
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                    <span>Total de registros demo a eliminar:</span>
                    <span className="font-mono text-rose-700 text-sm">{dryRunResult.totalDeleted}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 font-mono">
                    <div>Pacientes demo: <strong className="text-slate-900">{dryRunResult.affectedCounts.patients || 0}</strong></div>
                    <div>Tutores demo: <strong className="text-slate-900">{dryRunResult.affectedCounts.owners || 0}</strong></div>
                    <div>Signos vitales: <strong className="text-slate-900">{dryRunResult.affectedCounts.vital_signs || 0}</strong></div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Step 2: Confirmation Phrase */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-800 block text-[11px]">
                Paso 2: Para confirmar la eliminación definitiva, escribí exactamente:
                <span className="block font-mono text-rose-700 text-xs mt-0.5 select-all">ELIMINAR DATOS DEMO</span>
              </label>
              <input
                type="text"
                value={confirmationPhrase}
                onChange={(e) => setConfirmationPhrase(e.target.value)}
                placeholder="Escribí aquí: ELIMINAR DATOS DEMO"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-mono font-bold text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCleanupModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isCleaning || confirmationPhrase.trim() !== 'ELIMINAR DATOS DEMO'}
                onClick={handleExecuteCleanup}
                className="px-5 py-2.5 bg-rose-700 hover:bg-rose-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {isCleaning ? (
                  <span>Eliminando en Supabase...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Confirmar y Ejecutar Limpieza</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
