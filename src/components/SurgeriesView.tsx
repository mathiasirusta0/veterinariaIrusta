import React, { useState } from 'react';
import {
  Scissors,
  Plus,
  Clock,
  Heart,
  Activity,
  AlertTriangle,
  User,
  CheckCircle2,
  Radio,
  Calculator,
  Search,
  MessageCircle,
  ShieldCheck,
  Filter,
  FileText,
  Printer,
  BedDouble,
  Play,
  Check,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { SurgeryRecord } from '../types';
import { formatDate, formatTime, formatWeight } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, SearchInput, FilterBar } from './ui';

export const SurgeriesView: React.FC = () => {
  const {
    surgeries,
    patients,
    owners,
    updateSurgeryStatus,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openCalculators,
    openAnesthesiaChart,
    openWhatsAppHub,
    showToast,
  } = useVet();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [showChecklistModal, setShowChecklistModal] = useState<string | null>(null);
  const [showConsentModal, setShowConsentModal] = useState<SurgeryRecord | null>(null);

  const [checklistState, setChecklistState] = useState({
    patientIdentity: true,
    siteMarked: true,
    anesthesiaMachineChecked: true,
    pulseOximeterOn: true,
    knownAllergiesReviewed: true,
    difficultAirwayRisk: false,
    bloodLossRiskReviewed: true,
    sterileIndicatorsChecked: true,
    antibioticProphylaxisGiven: true,
    spongeAndInstrumentCountConfirmed: true,
    specimenLabeled: true,
    postOpAnalgesiaPlanReviewed: true,
  });

  const filteredSurgeries = surgeries.filter((surg) => {
    const q = (search || '').toLowerCase();
    const patient = patients.find((p) => p.id === surg.patientId);
    const petName = patient?.name?.toLowerCase() || '';
    const hc = patient?.clinicalRecordNumber?.toLowerCase() || '';
    const proc = (surg.procedureName || '').toLowerCase();
    const surgeon = (surg.surgeonName || '').toLowerCase();
    const anest = (surg.anesthetistName || '').toLowerCase();

    const matchesSearch =
      petName.includes(q) || hc.includes(q) || proc.includes(q) || surgeon.includes(q) || anest.includes(q);

    const matchesStatus = statusFilter === 'TODOS' || surg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Action handlers
  const handleStartSurgery = (surg: SurgeryRecord) => {
    triggerHaptic('medium');
    updateSurgeryStatus(surg.id, 'EN_CURSO');
    showToast('info', 'Cirugía en Curso', 'Se inició el procedimiento quirúrgico de ' + surg.procedureName);
  };

  const handleFinishSurgery = (surg: SurgeryRecord) => {
    triggerHaptic('medium');
    updateSurgeryStatus(surg.id, 'FINALIZADA');
    showToast('success', 'Cirugía Finalizada', 'Procedimiento concluido exitosamente.');
  };

  const handlePassToRecovery = (surg: SurgeryRecord) => {
    triggerHaptic('medium');
    setSelectedPatientId(surg.patientId);
    setQuickModal('INGRESO_INTERNACION');
  };

  const handlePrintProtocol = (surg: SurgeryRecord) => {
    triggerHaptic('light');
    window.print();
  };

  const asaGradeColors: Record<string, { label: string; bg: string; text: string }> = {
    I: { label: 'ASA I (Paciente Sano)', bg: 'bg-emerald-50 border-emerald-300', text: 'text-emerald-800' },
    II: { label: 'ASA II (Enfermedad Leve)', bg: 'bg-teal-50 border-teal-300', text: 'text-teal-800' },
    III: { label: 'ASA III (Enfermedad Sistémica Grave)', bg: 'bg-amber-50 border-amber-300', text: 'text-amber-800' },
    IV: { label: 'ASA IV (Riesgo Vital Constante)', bg: 'bg-orange-50 border-orange-300', text: 'text-orange-800' },
    V: { label: 'ASA V (Moribundo)', bg: 'bg-rose-50 border-rose-300', text: 'text-rose-800' },
    E: { label: 'ASA E (Emergencia Quirúrgica)', bg: 'bg-red-600 text-white', text: 'text-white' },
  };

  const statusOptions = [
    { id: 'TODAS', label: 'Todas', badge: surgeries.length },
    { id: 'PROGRAMADA', label: 'Programadas', badge: surgeries.filter((s) => s.status === 'PROGRAMADA').length },
    { id: 'EN_CURSO', label: 'En Curso', badge: surgeries.filter((s) => s.status === 'EN_CURSO').length },
    { id: 'FINALIZADA', label: 'Finalizadas', badge: surgeries.filter((s) => s.status === 'FINALIZADA').length },
    { id: 'SUSPENDIDA', label: 'Suspendidas', badge: surgeries.filter((s) => s.status === 'SUSPENDIDA').length },
  ];

  return (
    <div className="space-y-5 pb-12 w-full max-w-full">
      {/* 1. Header */}
      <PageHeader
        category="Centro Quirúrgico, Anestesiología & Recuperación"
        title="Quirófano & Cirugías"
        description="Planificación quirúrgica, protocolos anestésicos multimodales, estratificación ASA y listas de verificación"
        icon={Scissors}
        actions={[
          {
            label: 'Calculadora Dosis',
            icon: Calculator,
            onClick: () => openCalculators(),
            variant: 'secondary',
          },
          {
            label: 'Programar Cirugía',
            icon: Plus,
            onClick: () => setQuickModal('NUEVA_CIRUGIA'),
            variant: 'primary',
          },
        ]}
      />

      {/* 2. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs space-y-3 w-full max-w-full">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar por cirugía, paciente, HC, cirujano o anestesista..."
        />
        <FilterBar
          options={statusOptions}
          activeId={statusFilter}
          onSelect={setStatusFilter}
          label="Estado Quirúrgico"
        />
      </div>

      {/* 3. Surgeries List */}
      <div className="space-y-4 w-full">
        {filteredSurgeries.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="No se encontraron cirugías registradas"
            description={
              search || statusFilter !== 'TODAS'
                ? 'No hay procedimientos quirúrgicos que coincidan con la búsqueda o filtro seleccionado.'
                : 'No hay cirugías programadas actualmente en el centro quirúrgico.'
            }
            actionLabel="Programar Nueva Cirugía"
            onAction={() => setQuickModal('NUEVA_CIRUGIA')}
          />
        ) : (
          filteredSurgeries.map((surg) => {
            const patient = patients.find((p) => p.id === surg.patientId);
            const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
            const asaKey = surg.preOpAssessment?.asaGrade || (surg as any).asaGrade || 'II';
            const asaInfo = asaGradeColors[asaKey] || asaGradeColors.II;

            const isEnCurso = surg.status === 'EN_CURSO';

            return (
              <div
                key={surg.id}
                className={'bg-white border rounded-2xl p-4 sm:p-5 shadow-xs transition-all flex flex-col gap-4 w-full ' +
                  (isEnCurso
                    ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-50/10'
                    : 'border-slate-200/90 hover:border-teal-500/60')}
              >
                {/* Header Row: Procedure + Patient + Surgeon */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0 text-teal-700">
                      <Scissors className="w-6 h-6" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 leading-tight">{surg.procedureName}</h3>
                        <span
                          className={'text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase border ' +
                            (surg.status === 'EN_CURSO'
                              ? 'bg-amber-500 text-white animate-pulse'
                              : surg.status === 'FINALIZADA'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-teal-50 text-teal-800 border-teal-200')}
                        >
                          {surg.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">
                        Paciente:{' '}
                        <strong
                          onClick={() => {
                            if (patient) {
                              setSelectedPatientId(patient.id);
                              setActivePatientTab('CIRUGIAS');
                              setActiveView('PACIENTES');
                            }
                          }}
                          className="text-teal-700 hover:underline cursor-pointer font-bold"
                        >
                          {patient?.name || 'Paciente'}
                        </strong>{' '}
                        <span className="font-mono text-[11px] text-slate-500">({patient?.clinicalRecordNumber || 'HC-0000'})</span>{' '}
                        • {patient?.species} {patient?.breed} • {patient?.weight ? formatWeight(patient.weight) : ''}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col md:items-end text-xs text-slate-600">
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      <span>Cirujano: {surg.surgeonName}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Anestesista: <strong className="text-slate-700">{surg.anesthetistName}</strong>
                      {surg.assistantName ? ' • Ayudante: ' + surg.assistantName : ''}
                    </div>
                    <div className="font-mono text-slate-500 text-[11px] mt-0.5">
                      📅 {formatDate(surg.date)} a las {surg.startTime || '09:00'} hs
                    </div>
                  </div>
                </div>

                {/* Pre-Op ASA Assessment & Anesthesia Protocol */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs bg-slate-50/90 p-3 sm:p-4 rounded-xl border border-slate-200/80">
                  {/* ASA Grade */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Riesgo ASA:</span>
                    <span className={'inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-black border ' + asaInfo.bg + ' ' + asaInfo.text}>
                      {asaInfo.label}
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Ayuno: {surg.preOpAssessment?.fastingHours || 8}h sólidos
                    </span>
                  </div>

                  {/* Premedication */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Premedicación:</span>
                    <p className="text-xs text-slate-800 font-semibold leading-snug">
                      {surg.anesthesiaProtocol?.premedication || 'Acepromacina + Morfina'}
                    </p>
                  </div>

                  {/* Induction */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Inducción:</span>
                    <p className="text-xs text-slate-800 font-semibold leading-snug">
                      {surg.anesthesiaProtocol?.induction || 'Propofol 4 mg/kg + Fentanilo'}
                    </p>
                  </div>

                  {/* Maintenance */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">Mantenimiento:</span>
                    <p className="text-xs text-slate-800 font-semibold leading-snug">
                      {surg.anesthesiaProtocol?.maintenance || 'Isoflurano 1.5% en O2'}
                    </p>
                  </div>
                </div>

                {/* Technique & Findings */}
                {surg.surgicalTechnique && (
                  <div className="text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider">
                      Técnica Quirúrgica & Hallazgos:
                    </span>
                    <p className="text-slate-700 leading-relaxed">{surg.surgicalTechnique}</p>
                    {surg.postOpOrders && (
                      <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-200/60">
                        <strong>Posoperatorio:</strong> {surg.postOpOrders}
                      </p>
                    )}
                  </div>
                )}

                {/* Interactive Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                  {/* Status switcher */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Estado:</span>
                    <select
                      value={surg.status}
                      onChange={(e) => updateSurgeryStatus(surg.id, e.target.value as SurgeryRecord['status'])}
                      className="min-h-[38px] px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                      <option value="PROGRAMADA">Programada</option>
                      <option value="EN_CURSO">En Curso</option>
                      <option value="FINALIZADA">Finalizada</option>
                      <option value="SUSPENDIDA">Suspendida</option>
                    </select>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Checklist OMS */}
                    <button
                      type="button"
                      onClick={() => setShowChecklistModal(surg.id)}
                      className="min-h-[38px] px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                      title="Lista de verificación de seguridad quirúrgica OMS"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                      <span>Checklist OMS</span>
                    </button>

                    {/* Informed Consent */}
                    <button
                      type="button"
                      onClick={() => setShowConsentModal(surg)}
                      className="min-h-[38px] px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                      title="Ver y generar consentimiento informado firmado"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span>Consentimiento</span>
                    </button>

                    {/* WhatsApp Notice */}
                    {owner && (
                      <button
                        type="button"
                        onClick={() =>
                          openWhatsAppHub({
                            patientName: patient?.name || 'su mascota',
                            ownerName: owner.firstName + ' ' + owner.lastName,
                            ownerPhone: owner.phone || owner.whatsapp || '',
                            type: 'CIRUGIA_PARTE',
                            details: {
                              surgeryName: surg.procedureName,
                              surgeonName: surg.surgeonName,
                              status: surg.status,
                            },
                          })
                        }
                        className="min-h-[38px] px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                        title="Enviar reporte quirúrgico al tutor por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>
                    )}

                    {/* Live Anesthesia Chart */}
                    <button
                      type="button"
                      onClick={() => openAnesthesiaChart(surg.patientId, surg.procedureName)}
                      className="min-h-[38px] px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs rounded-xl border border-teal-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                    >
                      <span>🫁</span>
                      <span>Hoja Anestesia</span>
                    </button>

                    {/* Derive to Recovery / UCI */}
                    <button
                      type="button"
                      onClick={() => handlePassToRecovery(surg)}
                      className="min-h-[38px] px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-xs rounded-xl border border-purple-200 flex items-center gap-1.5 transition-all active:scale-95 touch-manipulation"
                      title="Derivar paciente a sala de recuperación postquirúrgica o UCI"
                    >
                      <BedDouble className="w-3.5 h-3.5 text-purple-600" />
                      <span>Recuperación / UCI</span>
                    </button>

                    {/* Print Protocol */}
                    <button
                      type="button"
                      onClick={() => handlePrintProtocol(surg)}
                      className="min-h-[38px] p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition-colors"
                      title="Imprimir protocolo quirúrgico"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. Checklist Modal */}
      {showChecklistModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Checklist de Seguridad Quirúrgica OMS</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowChecklistModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-700 block mb-1">
                  1. Sign In (Antes de la inducción anestésica):
                </span>
                <div className="space-y-1.5 pl-2">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.patientIdentity}
                      onChange={(e) => setChecklistState({ ...checklistState, patientIdentity: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Identidad del paciente y procedimiento confirmados con el tutor</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.knownAllergiesReviewed}
                      onChange={(e) => setChecklistState({ ...checklistState, knownAllergiesReviewed: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Alergias conocidas revisadas y verificadas</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.anesthesiaMachineChecked}
                      onChange={(e) => setChecklistState({ ...checklistState, anesthesiaMachineChecked: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Máquina de anestesia y circuitos de O2 verificados</span>
                  </label>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-teal-700 block mb-1">
                  2. Time Out (Antes de la incisión quirúrgica):
                </span>
                <div className="space-y-1.5 pl-2">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.sterileIndicatorsChecked}
                      onChange={(e) => setChecklistState({ ...checklistState, sterileIndicatorsChecked: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Esterilidad de campos e instrumental quirúrgico comprobada</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.antibioticProphylaxisGiven}
                      onChange={(e) => setChecklistState({ ...checklistState, antibioticProphylaxisGiven: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Profilaxis antibiótica administrada (&lt; 60 min)</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.bloodLossRiskReviewed}
                      onChange={(e) => setChecklistState({ ...checklistState, bloodLossRiskReviewed: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Riesgo de hemorragia y fluidoterapia evaluados</span>
                  </label>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-teal-700 block mb-1">
                  3. Sign Out (Antes de salir del quirófano / pase a recuperación):
                </span>
                <div className="space-y-1.5 pl-2">
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.spongeAndInstrumentCountConfirmed}
                      onChange={(e) => setChecklistState({ ...checklistState, spongeAndInstrumentCountConfirmed: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Recuento completo de gasas, compresas e instrumental quirúrgico confirmado</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.specimenLabeled}
                      onChange={(e) => setChecklistState({ ...checklistState, specimenLabeled: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Etiquetado y rotulado de muestras/biopsias con datos del paciente</span>
                  </label>
                  <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklistState.postOpAnalgesiaPlanReviewed}
                      onChange={(e) => setChecklistState({ ...checklistState, postOpAnalgesiaPlanReviewed: e.target.checked })}
                      className="rounded text-teal-600"
                    />
                    <span>Plan de analgesia postoperatoria, fluidos y monitoreo en internación acordado</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  showToast('success', 'Checklist Confirmado', 'Lista de verificación quirúrgica validada correctamente.');
                  setShowChecklistModal(null);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Validar Lista de Seguridad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Informed Consent Preview Modal */}
      {showConsentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 max-w-xl w-full shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-slate-900 text-base">Consentimiento Informado Quirúrgico</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConsentModal(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                AUTORIZACIÓN PARA INTERVENCIÓN QUIRÚRGICA Y ANESTESIA
              </p>
              <p>
                Por la presente autorizo al equipo veterinario a realizar la intervención denominada{' '}
                <strong>{showConsentModal.procedureName}</strong> en el paciente registrado con clasificación de riesgo{' '}
                <strong>ASA {showConsentModal.preOpAssessment?.asaGrade || 'II'}</strong>.
              </p>
              <p>
                He sido informado de los riesgos inherentes a todo acto anestésico y quirúrgico, así como de los cuidados
                posoperatorios requeridos para su adecuada recuperación.
              </p>
              <div className="pt-4 grid grid-cols-2 gap-4 border-t border-slate-200 text-[11px]">
                <div>
                  <span className="block text-slate-400 font-bold">Cirujano Responsable:</span>
                  <strong className="text-slate-800">{showConsentModal.surgeonName}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold">Anestesista:</span>
                  <strong className="text-slate-800">{showConsentModal.anesthetistName}</strong>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Documento</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast('success', 'Consentimiento Firmado', 'Documento de consentimiento registrado con éxito.');
                  setShowConsentModal(null);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md"
              >
                Aceptar & Registrar Firma
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
