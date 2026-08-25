import React, { useState } from 'react';
import {
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Filter,
  ArrowRight,
  Printer,
  MessageCircle,
  Clock,
  Sparkles,
  Check,
  Edit3,
  Paperclip,
  Activity,
  Layers,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { LaboratoryOrder, LabResultItem, LabTestType } from '../types';
import { formatDate, formatDateTime, formatWeight } from '../utils/formatters';
import { printA4LabReport } from '../utils/printDocumentHelper';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, SearchInput, FilterBar } from './ui';

export const LaboratoryView: React.FC = () => {
  const {
    labOrders,
    currentUser,
    activeBranch,
    patients,
    owners,
    updateLabResults,
    updateLabOrderStatus,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openWhatsAppHub,
    showToast,
  } = useVet();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [typeFilter, setTypeFilter] = useState('TODOS');
  const [editingOrder, setEditingOrder] = useState<LaboratoryOrder | null>(null);

  // Edit Results Modal State
  const [editResults, setEditResults] = useState<LabResultItem[]>([]);
  const [editConclusions, setEditConclusions] = useState('');

  const filteredOrders = labOrders.filter((lab) => {
    const q = (search || '').toLowerCase();
    const patient = patients.find((p) => p.id === lab.patientId);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
    const petName = (patient?.name || '').toLowerCase();
    const hc = (patient?.clinicalRecordNumber || '').toLowerCase();
    const test = (lab.testType || '').toLowerCase();
    const orderNum = (lab.orderNumber || '').toLowerCase();
    const reqBy = (lab.requestedBy || '').toLowerCase();
    const tutor = owner ? (owner.firstName + ' ' + owner.lastName).toLowerCase() : '';

    const matchesSearch =
      petName.includes(q) ||
      hc.includes(q) ||
      test.includes(q) ||
      orderNum.includes(q) ||
      reqBy.includes(q) ||
      tutor.includes(q) ||
      (lab.conclusions || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'TODOS' || lab.status === statusFilter;
    const matchesType = typeFilter === 'TODOS' || lab.testType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const abnormalCount = labOrders.reduce(
    (acc, lab) => acc + (lab.results?.filter((r) => r.isAbnormal).length || 0),
    0
  );

  const handleOpenEditResults = (lab: LaboratoryOrder) => {
    triggerHaptic('medium');
    setEditingOrder(lab);
    setEditResults(
      lab.results && lab.results.length > 0
        ? JSON.parse(JSON.stringify(lab.results))
        : [
            { parameter: 'Hematocrito', value: '42', unit: '%', referenceRange: '37 - 55', isAbnormal: false },
            { parameter: 'Hemoglobina', value: '14.2', unit: 'g/dL', referenceRange: '12 - 18', isAbnormal: false },
            { parameter: 'Leucocitos Totales', value: '11500', unit: '/uL', referenceRange: '6000 - 17000', isAbnormal: false },
            { parameter: 'Plaquetas', value: '280000', unit: '/uL', referenceRange: '200000 - 500000', isAbnormal: false },
          ]
    );
    setEditConclusions(lab.conclusions || 'Parámetros evaluados dentro de rangos normales de referencia.');
  };


  const handlePrintLab = (lab: LaboratoryOrder) => {
    triggerHaptic('medium');
    const pat = patients.find((p) => p.id === lab.patientId);
    const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;

    printA4LabReport({
      orderNumber: lab.orderNumber,
      testType: lab.testType,
      date: formatDate(lab.requestedAt),
      time: new Date(lab.requestedAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      status: lab.status,
      requestedBy: lab.requestedBy,
      conclusions: lab.conclusions,
      doctor: {
        name: currentUser?.name || 'Dr. Diego Iván Irusta',
        license: currentUser?.licenseNumber || 'M.P. 502',
      },
      branch: {
        name: activeBranch?.name || 'Clínica Veterinaria Irusta',
        address: activeBranch?.address || 'Río Cuarto, Córdoba',
        phone: activeBranch?.phone || '+54 9 2942 47-7136',
      },
      patient: {
        name: pat?.name || 'Paciente',
        species: pat?.species || 'CANINO',
        breed: pat?.breed || 'Mestizo',
        weight: pat?.weight ? `${pat.weight} kg` : 'N/A',
        age: pat?.calculatedAge || 'Adulto',
        hc: pat?.clinicalRecordNumber || 'HC-000',
      },
      owner: {
        name: ow ? `${ow.firstName} ${ow.lastName}` : 'Tutor Responsable',
        dni: ow?.dni || 'N/A',
        phone: ow?.phone || ow?.whatsapp || 'N/A',
      },
      results: (lab.results || []).map((r) => ({
        parameter: r.parameter,
        value: String(r.value),
        unit: r.unit || '',
        referenceRange: r.referenceRange || '-',
        isAbnormal: !!r.isAbnormal,
      })),
    });
    showToast('success', 'Informe en Impresión A4', `Informe ${lab.orderNumber} enviado a impresión oficial.`);
  };

  const handleSaveResults = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    triggerHaptic('medium');

    updateLabResults(editingOrder.id, editResults, editConclusions);
    setEditingOrder(null);
    showToast('success', 'Resultados Guardados', 'Informe de laboratorio ' + editingOrder.orderNumber + ' actualizado y validado.');
  };

  const handleSendWhatsApp = (lab: LaboratoryOrder) => {
    triggerHaptic('light');
    const patient = patients.find((p) => p.id === lab.patientId);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
    if (!owner) return;

    const summary = lab.results
      ? lab.results.map((r) => r.parameter + ': ' + r.value + ' ' + r.unit + (r.isAbnormal ? ' (⚠️ Alterado)' : '')).join(' \n')
      : 'Resultados listos para revisión.';

    openWhatsAppHub({
      patientName: patient?.name || 'su mascota',
      ownerName: owner.firstName + ' ' + owner.lastName,
      ownerPhone: owner.phone || owner.whatsapp || '',
      type: 'LABORATORIO_RESULTADO',
      details: {
        orderNumber: lab.orderNumber,
        testType: lab.testType.replace(/_/g, ' '),
        conclusions: lab.conclusions || 'Estudio concluido.',
        resultsSummary: summary,
      },
    });
  };

  const statusOptions = [
    { id: 'TODOS', label: 'Todas', badge: labOrders.length },
    { id: 'SOLICITADO', label: 'Solicitadas', badge: labOrders.filter((l) => l.status === 'SOLICITADO').length },
    { id: 'MUESTRA_OBTENIDA', label: 'Muestra Tomada', badge: labOrders.filter((l) => l.status === 'MUESTRA_OBTENIDA').length },
    { id: 'EN_PROCESO', label: 'En Análisis', badge: labOrders.filter((l) => l.status === 'EN_PROCESO').length },
    { id: 'FINALIZADO', label: 'Resultados Listos', badge: labOrders.filter((l) => l.status === 'FINALIZADO').length },
  ];

  const testTypeLabels: Record<string, string> = {
    HEMOGRAMA_COMPLETO: 'Hemograma Completo',
    PERFIL_BIOQUIMICO_RENAL_HEPATICO: 'Bioquímica Renal & Hepática',
    URANALISIS: 'Uranálisis Físico-Químico',
    COPROPARASITOLOGICO: 'Coproparasitológico',
    CITOLOGIA: 'Citología & Frotis',
    PERFIL_TIROIDEO: 'Perfil Tiroideo (T4/TSH)',
    TEST_RAPIDO_VIRAL: 'Test Rápido Infeccioso',
    CULTIVO_ANTIBIOGRAMA: 'Cultivo & Antibiograma',
    OTROS: 'Otros Análisis',
  };

  return (
    <div className="space-y-5 pb-16 w-full max-w-full">
      {/* 1. Header */}
      <PageHeader
        category="Diagnóstico Laboratorial & Bioquímica Clínica"
        title="Laboratorio Clínico & Análisis"
        description="Hemogramas, perfiles bioquímicos, uranálisis, citologías y tests rápidos con rangos de referencia por especie"
        icon={FlaskConical}
        actions={[
          {
            label: 'Solicitar Análisis',
            icon: Plus,
            onClick: () => setQuickModal('NUEVO_LAB'),
            variant: 'primary',
          },
        ]}
      />

      {/* 2. Critical Findings Alert Ribbon */}
      {abnormalCount > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse flex-shrink-0" />
            <span>
              <strong>Alerta Clínica:</strong> Se detectaron <strong>{abnormalCount} parámetros fuera de rango</strong> en las muestras analizadas.
            </span>
          </div>
          <span className="font-bold uppercase text-[10px] text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-200">
            Requiere Atención Médica
          </span>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs space-y-3 w-full max-w-full">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por orden, estudio, paciente, HC, solicitante o conclusión..."
        />

        <FilterBar
          options={statusOptions}
          activeId={statusFilter}
          onSelect={setStatusFilter}
          label="Estado de la Muestra"
        />
      </div>

      {/* 4. Lab Orders List */}
      <div className="space-y-4 w-full">
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon={FlaskConical}
            title="No se encontraron órdenes de laboratorio"
            description={
              search || statusFilter !== 'TODOS'
                ? 'No hay análisis clínicos que coincidan con los filtros de búsqueda seleccionados.'
                : 'No se han registrado solicitudes de laboratorio aún.'
            }
            actionLabel="Solicitar Nuevo Análisis"
            onAction={() => setQuickModal('NUEVO_LAB')}
          />
        ) : (
          filteredOrders.map((lab) => {
            const patient = patients.find((p) => p.id === lab.patientId);
            const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
            const isReady = lab.status === 'FINALIZADO';
            const testLabel = testTypeLabels[lab.testType] || lab.testType.replace(/_/g, ' ');

            const hasAbnormal = lab.results?.some((r) => r.isAbnormal);

            return (
              <div
                key={lab.id}
                className={'bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-all flex flex-col gap-4 w-full ' +
                  (hasAbnormal
                    ? 'border-rose-300 ring-2 ring-rose-200/50'
                    : isReady
                    ? 'border-emerald-200 hover:border-emerald-400'
                    : 'border-slate-200/90 hover:border-teal-500/60')}
              >
                {/* Header Row: Test name + Order Number + Patient Info */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg border ' +
                        (isReady
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-teal-50 text-teal-700 border-teal-200')}
                    >
                      <FlaskConical className="w-6 h-6" />
                    </div>

                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 leading-tight">{testLabel}</h3>
                        <span className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 font-bold">
                          {lab.orderNumber}
                        </span>
                        <span
                          className={'text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ' +
                            (lab.status === 'FINALIZADO'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : lab.status === 'EN_PROCESO'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : lab.status === 'MUESTRA_OBTENIDA'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200')}
                        >
                          {lab.status.replace(/_/g, ' ')}
                        </span>
                        {hasAbnormal && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                            ⚠️ VALORES FUERA DE RANGO
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500">
                        Paciente:{' '}
                        <strong
                          onClick={() => {
                            if (patient) {
                              setSelectedPatientId(patient.id);
                              setActivePatientTab('LABORATORIO');
                              setActiveView('PACIENTES');
                            }
                          }}
                          className="text-teal-700 hover:underline cursor-pointer font-bold"
                        >
                          {patient?.name || 'Paciente'}
                        </strong>{' '}
                        <span className="font-mono text-[11px] text-slate-500">({patient?.clinicalRecordNumber || 'HC-0000'})</span>{' '}
                        • {patient?.species} {patient?.breed} {patient?.weight ? '• ' + formatWeight(patient.weight) : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col md:items-end text-xs text-slate-600">
                    <span className="text-slate-500 text-[11px]">
                      Solicitante: <strong className="text-slate-800">{lab.requestedBy || 'Dr. Médico Veterinario'}</strong>
                    </span>
                    <span className="font-mono text-slate-500 text-[11px] mt-0.5">
                      📅 {formatDateTime(lab.requestedAt)}
                    </span>
                  </div>
                </div>

                {/* Lab Results Table */}
                {lab.results && lab.results.length > 0 ? (
                  <div className="overflow-x-auto bg-slate-50/80 p-3 sm:p-4 rounded-xl border border-slate-200/80">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100/90 text-slate-500 uppercase text-[10px] font-bold">
                        <tr>
                          <th className="p-2">Analito / Parámetro</th>
                          <th className="p-2">Valor Obtenido</th>
                          <th className="p-2">Unidad</th>
                          <th className="p-2">Rango Referencia ({patient?.species || 'Canino'})</th>
                          <th className="p-2 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 font-mono">
                        {lab.results.map((r, idx) => (
                          <tr key={idx} className="hover:bg-slate-100/50">
                            <td className="p-2 font-semibold text-slate-900 font-sans">{r.parameter}</td>
                            <td className="p-2">
                              <span
                                className={'font-black px-1.5 py-0.5 rounded ' +
                                  (r.isAbnormal
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'text-slate-800')}
                              >
                                {r.value}
                              </span>
                            </td>
                            <td className="p-2 text-slate-600">{r.unit}</td>
                            <td className="p-2 text-slate-500 font-sans">{r.referenceRange}</td>
                            <td className="p-2 text-right font-sans">
                              {r.isAbnormal ? (
                                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                  ⚠️ Alterado
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  ✓ Normal
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
                    <span>Muestra en preparación. Aún no se han cargado los valores analíticos.</span>
                  </div>
                )}

                {/* Conclusions / Clinical Interpretations */}
                {lab.conclusions && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-0.5">
                    <span className="font-bold text-slate-900 block text-[11px]">Conclusión Diagnóstica & Hallazgos:</span>
                    <p className="text-slate-700 leading-relaxed">{lab.conclusions}</p>
                  </div>
                )}

                {/* Interactive Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  {/* Status switcher */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Estado Muestra:</span>
                    <select
                      value={lab.status}
                      onChange={(e) => updateLabOrderStatus(lab.id, e.target.value as LaboratoryOrder['status'])}
                      className="min-h-[38px] px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      <option value="SOLICITADO">Solicitado</option>
                      <option value="MUESTRA_OBTENIDA">Muestra Obtenida</option>
                      <option value="EN_PROCESO">En Análisis</option>
                      <option value="FINALIZADO">Resultados Listos</option>
                    </select>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Load / Edit Results */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditResults(lab)}
                      className="min-h-[38px] px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                      title="Cargar o modificar resultados analíticos"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-teal-600" />
                      <span>{lab.results && lab.results.length > 0 ? 'Editar Resultados' : 'Cargar Resultados'}</span>
                    </button>

                    {/* WhatsApp Report */}
                    {owner && (
                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(lab)}
                        className="min-h-[38px] px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                        title="Enviar informe al tutor por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    )}

                    {/* Print Report */}
                    <button
                      type="button"
                      onClick={() => handlePrintLab(lab)}
                      className="min-h-[38px] p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 transition-colors"
                      title="Imprimir informe analítico oficial"
                    >
                      <Printer className="w-4 h-4 text-teal-600" />
                    </button>

                    {/* Patient 360° */}
                    {patient && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(patient.id);
                          setActivePatientTab('LABORATORIO');
                          setActiveView('PACIENTES');
                        }}
                        className="min-h-[38px] px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                      >
                        Ficha 360° →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. Load / Edit Results Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">
                  Cargar Resultados: {editingOrder.orderNumber} ({testTypeLabels[editingOrder.testType] || editingOrder.testType})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResults} className="space-y-4 text-xs">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Valores Analíticos ({editResults.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setEditResults([
                        ...editResults,
                        { parameter: '', value: '', unit: '', referenceRange: '', isAbnormal: false },
                      ])
                    }
                    className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-lg font-bold text-xs flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Agregar Analito</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {editResults.map((res, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 items-center">
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={res.parameter}
                          onChange={(e) => {
                            const copy = [...editResults];
                            copy[idx].parameter = e.target.value;
                            setEditResults(copy);
                          }}
                          placeholder="Parámetro (ej: Urea)"
                          required
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-900"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          value={res.value}
                          onChange={(e) => {
                            const copy = [...editResults];
                            copy[idx].value = e.target.value;
                            setEditResults(copy);
                          }}
                          placeholder="Valor"
                          required
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono font-bold text-slate-900"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          value={res.unit}
                          onChange={(e) => {
                            const copy = [...editResults];
                            copy[idx].unit = e.target.value;
                            setEditResults(copy);
                          }}
                          placeholder="Unidad"
                          className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs font-mono text-slate-700"
                        />
                      </div>
                      <div className="col-span-3 flex items-center gap-1.5">
                        <label className="flex items-center gap-1 text-[11px] font-bold text-rose-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={res.isAbnormal || false}
                            onChange={(e) => {
                              const copy = [...editResults];
                              copy[idx].isAbnormal = e.target.checked;
                              setEditResults(copy);
                            }}
                            className="rounded text-rose-600"
                          />
                          <span>Alterado</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Conclusión & Dictamen Bioquímico:</label>
                <textarea
                  rows={3}
                  value={editConclusions}
                  onChange={(e) => setEditConclusions(e.target.value)}
                  placeholder="Interpretación médica de los resultados..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
                >
                  Guardar & Validar Resultados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
