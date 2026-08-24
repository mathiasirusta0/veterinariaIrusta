import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  FileSpreadsheet,
  Lock,
  CheckCircle2,
  Clock,
  History,
  Trash2,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Database,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { formatDateTime } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';

export const SettingsAndUsersView: React.FC = () => {
  const {
    users,
    branches,
    auditLogs,
    currentUser,
    patients,
    owners,
    consultations,
    hospitalizations,
    invoices,
    
    showToast,
  } = useVet();

  const [activeTab, setActiveTab] = useState<'AUDITORIA' | 'PRODUCCION' | 'USUARIOS' | 'SUCURSALES' | 'ROLES'>('PRODUCCION');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleCleanDatabase = () => {
    showToast('info', 'Acción Protegida', 'La base de datos de producción está protegida contra borrados accidentales desde el frontend.');
    setShowConfirmModal(false);
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>Configuración, Producción & Auditoría</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Mantenimiento de base de datos, perfiles de usuario, sedes y registro inmutable de auditoría
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('PRODUCCION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'PRODUCCION'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Base de Datos & Producción</span>
        </button>
        <button
          onClick={() => setActiveTab('AUDITORIA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'AUDITORIA'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Registro de Auditoría ({auditLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('USUARIOS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'USUARIOS'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Usuarios ({users.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('SUCURSALES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            activeTab === 'SUCURSALES'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Sedes ({branches.length})</span>
        </button>
      </div>

      {/* 1. PRODUCCION & LIMPIEZA */}
      {activeTab === 'PRODUCCION' && (
        <div className="space-y-5 animate-fade-in">
          {/* Status Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-600" />
                  <span>Estado de Datos para Operación Real</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Resumen de registros clínicos y transaccionales cargados en el sistema
                </p>
              </div>
              <span className="text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-full">
                Listo para Producción
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
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
          <div className="bg-rose-50/40 border border-rose-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 font-bold">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-black text-rose-950">
                  Limpiar Todos los Datos Demo de Prueba
                </h4>
                <p className="text-xs text-rose-800/80 leading-relaxed">
                  Elimina todos los historiales, pacientes y transacciones de prueba para comenzar a operar con pacientes reales. Se conservan intactas las sedes hospitalarias, el catálogo farmacéutico base y las plantillas legales oficiales.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-rose-200/60 flex items-center justify-between">
              <span className="text-[11px] text-rose-700 font-medium">
                Esta acción restablece el sistema a estado limpio de producción.
              </span>
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpiar y Poner en Producción</span>
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-rose-200">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <h3 className="text-base font-black text-slate-900">¿Confirmar Limpieza de Datos Demo?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Esta acción vaciará todos los registros demo (pacientes, consultas, internaciones, comprobantes) para iniciar la operación con pacientes reales. Las sedes y catálogo médico permanecerán disponibles.
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCleanDatabase}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl text-xs shadow-md"
              >
                Sí, Limpiar Base de Datos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
