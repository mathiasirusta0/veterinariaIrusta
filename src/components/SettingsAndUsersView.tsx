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
} from 'lucide-react';
import { useVet } from '../context/VetContext';

export const SettingsAndUsersView: React.FC = () => {
  const { users, branches, auditLogs, currentUser } = useVet();

  const [activeTab, setActiveTab] = useState<'USUARIOS' | 'SUCURSALES' | 'AUDITORIA' | 'ROLES'>('AUDITORIA');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <span>Configuración, Roles RBAC & Trazabilidad</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Control de usuarios, permisos por rol, sedes hospitalarias y registro inmutable de auditoría
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('AUDITORIA')}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'AUDITORIA'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Registro de Auditoría ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('USUARIOS')}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'USUARIOS'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Usuarios & Profesionales ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('SUCURSALES')}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'SUCURSALES'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Sucursales / Sedes ({branches.length})
        </button>
        <button
          onClick={() => setActiveTab('ROLES')}
          className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
            activeTab === 'ROLES'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Matriz de Permisos RBAC
        </button>
      </div>

      {/* 1. AUDITORIA */}
      {activeTab === 'AUDITORIA' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
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
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="p-3 text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleString('es-AR')}
                    </td>
                    <td className="p-3">
                      <span className="text-slate-900 font-bold">{log.userName}</span>
                      <span className="text-[10px] text-teal-700 block font-sans font-semibold">{log.userRole}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{log.entity}</td>
                    <td className="p-3 text-slate-700 font-sans text-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. USUARIOS */}
      {activeTab === 'USUARIOS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((u) => (
            <div
              key={u.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{u.name}</h3>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 font-mono">
                  {u.role}
                </span>
              </div>

              {u.licenseNumber && (
                <p className="text-xs text-slate-700 font-mono bg-slate-50 p-2 rounded-lg border border-slate-100">
                  Matrícula Profesional: {u.licenseNumber}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 3. SUCURSALES */}
      {activeTab === 'SUCURSALES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches.map((b) => (
            <div
              key={b.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                  <p className="text-xs text-slate-500">{b.address}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                  {b.code}
                </span>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <p>Tel: {b.phone} • WhatsApp: {b.whatsapp}</p>
                <p>CUIT: {b.cuit} • Condición: {b.taxCondition}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. ROLES RBAC */}
      {activeTab === 'ROLES' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Matriz de Control de Acceso Basado en Roles (RBAC)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {[
              {
                role: 'VETERINARIO',
                desc: 'Acceso completo a Ficha 360°, SOAP, Internación, Cirugías, Prescripciones y Solicitud de Laboratorio.',
                color: 'text-teal-700',
              },
              {
                role: 'ENFERMERIA',
                desc: 'Administración de medicamentos, hojas horarias, monitoreo vital, fluidoterapia y cuidados hospitalarios.',
                color: 'text-sky-700',
              },
              {
                role: 'RECEPCION',
                desc: 'Gestión de agenda, turnos, altas de pacientes y propietarios, triage y sala de espera.',
                color: 'text-amber-700',
              },
              {
                role: 'CAJA',
                desc: 'Emisión de Facturas AFIP A/B/C, presupuestos, cobros, medios de pago y arqueo de caja.',
                color: 'text-teal-800',
              },
              {
                role: 'ADMINISTRADOR',
                desc: 'Gestión de inventario, proveedores, auditoría, reportes financieros y configuración general.',
                color: 'text-indigo-700',
              },
              {
                role: 'SUPERADMIN',
                desc: 'Control total multi-sucursal, configuración fiscal AFIP/ARCA, roles y seguridad.',
                color: 'text-rose-700',
              },
            ].map((r) => (
              <div key={r.role} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className={`font-bold text-sm ${r.color}`}>{r.role}</div>
                <p className="text-slate-600 leading-relaxed">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
