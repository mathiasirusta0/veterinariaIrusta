import React, { useState } from 'react';
import {
  Scale,
  ShieldCheck,
  Building2,
  FileCheck,
  AlertTriangle,
  ExternalLink,
  Search,
  CheckCircle2,
  Clock,
  BookOpen,
  UserCheck,
  Award,
  Globe,
  MapPin,
  HelpCircle,
  FileText,
  Filter,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { RegulatoryRule, RegulatoryStatus } from '../types';

export const RegulatoryComplianceView: React.FC = () => {
  const { regulatoryRules, users, activeBranch, showToast } = useVet();

  const [selectedTab, setSelectedTab] = useState<'NORMAS' | 'PROFESIONALES' | 'ORGANISMOS' | 'CHECKLIST'>('NORMAS');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | RegulatoryStatus>('TODOS');
  const [moduleFilter, setModuleFilter] = useState<string>('TODOS');
  const [selectedRule, setSelectedRule] = useState<RegulatoryRule | null>(null);

  // Filtered Rules
  const filteredRules = regulatoryRules.filter((r) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (r.lawTitle || '').toLowerCase().includes(q) ||
      (r.lawNumber || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q) ||
      (r.organism || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'TODOS' || r.status === statusFilter;
    const matchesModule = moduleFilter === 'TODOS' || r.affectedModule === moduleFilter;
    return matchesSearch && matchesStatus && matchesModule;
  });

  const veterinarians = users.filter((u) => u.role === 'VETERINARIO' || (u.role as string) === 'DIRECTOR_MEDICO');

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-800 text-[10px] font-extrabold tracking-wider border border-teal-200 uppercase">
                Marco Legal Argentina & Provincia del Neuquén
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-extrabold tracking-wider border border-blue-200 uppercase">
                Jurisdicción: Las Lajas
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <Scale className="w-6 h-6 text-teal-600" />
              <span>Centro de Cumplimiento Normativo Veterinario</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium max-w-3xl mt-1">
              Motor regulatorio integral conforme a las leyes de ejercicio profesional de la Provincia del Neuquén, Colegio Médico Veterinario de Neuquén (CMVN), SENASA, Ley 25.326, Ley 25.506 y Ley 24.051.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Estado Regulatorio</span>
              <span className="text-xs font-black text-emerald-600 flex items-center gap-1.5 justify-end">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Vigente & Auditado
              </span>
            </div>
          </div>
        </div>

        {/* Mandatory Legal Disclaimer */}
        <div className="mt-5 bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="font-bold">Aviso de Responsabilidad Legal:</strong> La configuración normativa del software facilita el cumplimiento, pero no reemplaza la habilitación del establecimiento, la matrícula profesional ni el asesoramiento jurídico/contable requerido para cada organización.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-100">
          {[
            { id: 'NORMAS', label: 'Motor de Normas & Leyes', icon: BookOpen, count: regulatoryRules.length },
            { id: 'PROFESIONALES', label: 'Padrón de Veterinarios & Habilitación', icon: UserCheck, count: veterinarians.length },
            { id: 'ORGANISMOS', label: 'Organismos & Enlaces Oficiales', icon: Globe },
            { id: 'CHECKLIST', label: 'Checklist Pre-Producción', icon: FileCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-extrabold ${
                    isActive ? 'bg-teal-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: NORMAS Y LEYES */}
      {selectedTab === 'NORMAS' && (
        <div className="space-y-5">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por ley, artículo, organismo..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="TODOS">Todos los Módulos Afectados</option>
                <option value="EJERCICIO_PROFESIONAL">Ejercicio Profesional (Neuquén)</option>
                <option value="RECETARIO_SENASA">Recetario & RVE SENASA</option>
                <option value="PSICOTROPICOS">Psicotrópicos & Ketamina</option>
                <option value="RESIDUOS_PATOLOGICOS">Residuos Patológicos (Ley 24.051)</option>
                <option value="PROTECCION_DATOS">Protección de Datos (Ley 25.326)</option>
                <option value="BIENESTAR_ANIMAL">Bienestar Animal (Ley 14.346)</option>
                <option value="FACTURACION_ARCA">Facturación Electrónica ARCA</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="VIGENTE">🟢 Vigente</option>
                <option value="MODIFICADA">🟡 Modificada</option>
                <option value="EN_REVISION">🔵 En Revisión</option>
                <option value="DEROGADA">🔴 Derogada</option>
              </select>
            </div>
          </div>

          {/* Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                onClick={() => setSelectedRule(rule)}
                className="bg-white border border-slate-200 hover:border-teal-500 rounded-2xl p-5 space-y-3 cursor-pointer transition-all hover:shadow-md shadow-2xs group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-bold text-[10px]">
                        {rule.lawNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-bold text-[10px] border border-teal-200">
                        {rule.organism.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {rule.lawTitle}
                    </h3>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                    rule.status === 'VIGENTE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : rule.status === 'EN_REVISION'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {rule.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {rule.description}
                </p>

                <div className="bg-slate-50 rounded-xl p-2.5 text-slate-700 text-[11px] border border-slate-100 flex items-start gap-2">
                  <span className="font-bold text-teal-800 shrink-0">Impacto Clínico:</span>
                  <span className="line-clamp-2">{rule.clinicalImpactSummary}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                  <span>Revisado: {rule.lastReviewedAt} por {rule.reviewedBy}</span>
                  <span className="text-teal-600 font-bold group-hover:underline flex items-center gap-1">
                    Ver Detalles →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PADRON DE VETERINARIOS */}
      {selectedTab === 'PROFESIONALES' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Padrón de Médicos Veterinarios & Habilitación Profesional
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Conforme al Estatuto del Colegio Médico Veterinario de la Provincia del Neuquén (CMVN).
              </p>
            </div>
            <span className="text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200">
              {veterinarians.length} Profesionales Registrados
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {veterinarians.map((vet) => {
              const isVerified = vet.isLicenseVerified !== false;
              return (
                <div
                  key={vet.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                        {vet.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{vet.name}</h4>
                        <p className="text-xs text-teal-700 font-semibold">{vet.role}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isVerified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {isVerified ? 'Habilitado CMVN' : 'Pendiente Validación'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Matrícula Provincial</span>
                      <span className="font-mono font-bold text-slate-900">{vet.licenseNumber || 'Sin Matrícula'}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/70">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Jurisdicción</span>
                      <span className="font-semibold text-slate-800">{vet.licenseJurisdiction || 'CMVN Neuquén'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/70">
                    <span className="text-slate-500 font-medium">Firma Electrónica / Sello Digital:</span>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Certificado Registrado
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: ORGANISMOS OFICIALES */}
      {selectedTab === 'ORGANISMOS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              name: 'Colegio Médico Veterinario de Neuquén (CMVN)',
              desc: 'Órgano de matriculación, control deontológico y ética profesional veterinaria en la Provincia del Neuquén.',
              url: 'https://cmvneuquen.com.ar',
              category: 'Colegiatura & Deontología',
              norma: 'Estatuto de Ejercicio Profesional CMVN',
            },
            {
              name: 'SENASA — Sanidad y Calidad Agroalimentaria',
              desc: 'Sistema oficial para Receta Veterinaria Electrónica (RVE), control de biológicos, psicotrópicos y registro de establecimientos.',
              url: 'https://www.argentina.gob.ar/senasa',
              category: 'Sanidad Nacional',
              norma: 'Resolución SENASA 1642/2019',
            },
            {
              name: 'ARCA — Agencia de Recaudación y Control Aduanero',
              desc: 'Régimen de facturación electrónica y Web Services (WSAA/WSMTXCA) en proceso de homologación.',
              url: 'https://www.arca.gob.ar',
              category: 'Fiscal & Tributario',
              norma: 'RG AFIP/ARCA 4291',
            },
            {
              name: 'Municipalidad de Las Lajas — Bromatología & Zoonosis',
              desc: 'Habilitación municipal, control zoonótico y gestión de residuos biopatogénicos locales.',
              url: 'https://laslajas.gob.ar',
              category: 'Municipal / Local',
              norma: 'Ordenanza Municipal Habilitaciones',
            },
            {
              name: 'Secretaría de Ambiente (Gobierno del Neuquén)',
              desc: 'Fiscalización de residuos peligrosos y biopatogénicos conforme a la Ley Provincial 1.875 y Ley Nacional 24.051.',
              url: 'https://neuquen.gov.ar',
              category: 'Ambiente Provincial',
              norma: 'Ley Provincial 1.875 / Ley 24.051',
            },
            {
              name: 'Agencia de Acceso a la Información Pública (AAIP)',
              desc: 'Autoridad de aplicación de la Ley Nacional 25.326 de Protección de Datos Personales y Registro Nacional de Bases de Datos.',
              url: 'https://www.argentina.gob.ar/aaip',
              category: 'Privacidad & Datos',
              norma: 'Ley Nacional 25.326',
            },
          ].map((org, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                  {org.category}
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-2">{org.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{org.desc}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-mono text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg">
                  {org.norma}
                </div>
                <a
                  href={org.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                >
                  <span>Portal Oficial</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: CHECKLIST PRE-PRODUCCION */}
      {selectedTab === 'CHECKLIST' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Checklist Regulatorio & Auditoría Legal Pre-Producción
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Verificación exhaustiva de requisitos antes de declarar el software apto para comercialización y uso clínico operativo.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { title: 'Ejercicio Profesional & Matrícula Colegial', desc: 'Validación obligatoria de matrícula profesional en toda prescripción y acto clínico.', status: 'CUMPLIDO', law: 'CMVN Neuquén M.P. 502' },
              { title: 'Inalterabilidad de Historias Clínicas', desc: 'Consultas cerradas protegidas con enmiendas cronológicas inmutables.', status: 'CUMPLIDO', law: 'Código de Ética CMVN' },
              { title: 'Libro Digital de Psicotrópicos & Ketamina', desc: 'Trazabilidad estricta de entradas, salidas y recetas oficiales sin borrado físico.', status: 'CUMPLIDO', law: 'Leyes 17.818 / 19.303' },
              { title: 'Gestión de Residuos Patológicos', desc: 'Manifiestos de retiro y certificados de disposición final con pesaje registrado.', status: 'CUMPLIDO', law: 'Ley 24.051 / Ley 1.875 Neuquén' },
              { title: 'Protección de Datos Personales', desc: 'Consentimiento de privacidad y confidencialidad de tutores sin uso de datos para entrenamiento no autorizado.', status: 'CUMPLIDO', law: 'Ley 25.326' },
              { title: 'Firma Electrónica & Trazabilidad Criptográfica', desc: 'Almacenamiento de hash criptográfico, autor y timestamp en cada documento emitido.', status: 'CUMPLIDO', law: 'Ley 25.506' },
              { title: 'Régimen de Comprobantes & Web Services ARCA', desc: 'Comprobantes internos no fiscales activos; Web Services WSAA/WSMTXCA en homologación protegida.', status: 'HOMOLOGACION', law: 'RG ARCA 4291' },
              { title: 'Bienestar y Protección Animal', desc: 'Registro formal de sospechas de maltrato con respaldo fotográfico y pericial.', status: 'CUMPLIDO', law: 'Ley 14.346' },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                    {item.status}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">{item.law}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedRule && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                  {selectedRule.organism.replace(/_/g, ' ')}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">{selectedRule.lawTitle}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedRule.lawNumber} — {selectedRule.articleSection}</p>
              </div>
              <button
                onClick={() => setSelectedRule(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-bold text-[10px] block">Descripción de la Norma:</span>
                <p className="text-slate-700 leading-relaxed mt-0.5">{selectedRule.description}</p>
              </div>

              <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-200/70">
                <span className="text-teal-900 uppercase font-bold text-[10px] block">Impacto en la Práctica Clínica & Software:</span>
                <p className="text-teal-950 font-medium mt-0.5">{selectedRule.clinicalImpactSummary}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Vigencia:</span>
                  <span className="font-bold text-slate-800">{selectedRule.effectiveDate}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Revisado Por:</span>
                  <span className="font-bold text-slate-800">{selectedRule.reviewedBy} ({selectedRule.lastReviewedAt})</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedRule(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
