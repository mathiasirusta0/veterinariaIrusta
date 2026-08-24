import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Archive,
  Calendar,
  Clock,
  Heart,
  Stethoscope,
  Pill,
  AlertCircle,
  FileText,
  BedDouble,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Patient, Owner } from '../types';
import { formatDate, formatDateTime, formatTime } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';

interface PatientDischargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  owner?: Owner | null;
}

export const PatientDischargeModal: React.FC<PatientDischargeModalProps> = ({
  isOpen,
  onClose,
  patient,
  owner,
}) => {
  const { hospitalizations, encounters, dischargePatient, archivePatient, unarchivePatient, currentUser } = useVet();

  const [activeAction, setActiveAction] = useState<'DISCHARGE' | 'ARCHIVE'>('DISCHARGE');
  const [condition, setCondition] = useState<string>('Completamente Recuperado');
  const [dischargeDate, setDischargeDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dischargeTime, setDischargeTime] = useState<string>(() => new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
  const [dischargeNotes, setDischargeNotes] = useState<string>('Paciente evaluado clínicamente con excelente evolución favorable. Signos vitales dentro de rangos normales. Se otorga alta médica.');
  const [homeMedication, setHomeMedication] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');
  const [archiveReason, setArchiveReason] = useState<string>('Tratamiento finalizado / Paciente inactivo temporalmente');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !patient) return null;

  // Active hospitalization info
  const activeHosp = hospitalizations.find((h) => h.patientId === patient.id && h.status === 'ACTIVA');
  const activeEnc = encounters.find((e) => e.patientId === patient.id && e.status === 'EN_CURSO');

  // Compute hospitalization duration
  let hospDurationText = '';
  if (activeHosp?.admittedAt) {
    const start = new Date(activeHosp.admittedAt).getTime();
    const now = Date.now();
    const diffHours = Math.max(1, Math.round((now - start) / (1000 * 60 * 60)));
    const days = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    hospDurationText = `${days} día(s) y ${remainingHours} hora(s) internado (Box/Canil ${activeHosp.kennelNumber || '01'})`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    triggerHaptic('medium');

    try {
      if (activeAction === 'DISCHARGE') {
        dischargePatient(patient.id, {
          condition,
          dischargeNotes: `[${dischargeDate} ${dischargeTime}] ${dischargeNotes}`,
          homeMedication: homeMedication.trim() || undefined,
          followUpDate: followUpDate || undefined,
        });
      } else {
        if (patient.status === 'ARCHIVADO') {
          unarchivePatient(patient.id);
        } else {
          archivePatient(patient.id, archiveReason);
        }
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-[#E8E3D9]">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#F9F8F5] border-b border-[#E8E3D9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-lg font-black font-serif text-[#162217]">
                Gestión de Alta Médica & Estado Clínico
              </h3>
              <p className="text-xs text-[#556956]">
                Paciente: <span className="font-bold text-[#162217]">{patient.name}</span> ({patient.species} • {patient.breed || 'Mestizo'}) — Tutor: {owner ? `${owner.firstName} ${owner.lastName}` : 'Sin tutor'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs */}
        <div className="flex border-b border-[#E8E3D9] bg-[#FAF8F5] px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveAction('DISCHARGE');
              triggerHaptic('light');
            }}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeAction === 'DISCHARGE'
                ? 'border-emerald-600 text-emerald-900 bg-white rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Dar de Alta Médica (Recuperado)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveAction('ARCHIVE');
              triggerHaptic('light');
            }}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeAction === 'ARCHIVE'
                ? 'border-[#8C6B43] text-[#553E23] bg-white rounded-t-xl'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Archive className="w-4 h-4 text-[#8C6B43]" />
            <span>{patient.status === 'ARCHIVADO' ? 'Desarchivar Paciente' : 'Archivar Ficha'}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-[#1C2B1D]">
          {activeAction === 'DISCHARGE' ? (
            <>
              {/* Active Hospitalization Alert */}
              {activeHosp && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3">
                  <BedDouble className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  <div className="space-y-0.5">
                    <p className="font-bold text-emerald-900 text-xs">
                      Internación Activa en Curso Detectada
                    </p>
                    <p className="text-[11px] text-emerald-800">
                      Tiempo en hospital: <span className="font-bold">{hospDurationText}</span>. Al confirmar el alta, el box o canil quedará liberado automáticamente y el cómputo final de días se registrará en su historia clínica.
                    </p>
                  </div>
                </div>
              )}

              {/* Condition */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#162217] block">
                  Estado / Condición Médica al Egreso:
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 font-bold text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="Completamente Recuperado">🟢 Completamente Recuperado (Alta Definitiva)</option>
                  <option value="Mejoría Clínica Notoria / Tratamiento Ambulatorio">🟡 Mejoría Clínica Notoria (Continuación en Domicilio)</option>
                  <option value="Alta Médica con Control Programado">🔵 Alta Médica con Control Programado</option>
                  <option value="Alta Voluntaria / Retiro por Tutor">🟠 Alta Voluntaria Solicitada por el Tutor</option>
                </select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-[#162217] flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Fecha de Alta:</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dischargeDate}
                    onChange={(e) => setDischargeDate(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 font-bold text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-[#162217] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Hora de Alta:</span>
                  </label>
                  <input
                    type="time"
                    required
                    value={dischargeTime}
                    onChange={(e) => setDischargeTime(e.target.value)}
                    className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 font-bold text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Discharge Epicrisis / Notes */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#162217] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Resumen Clínico / Epicrisis de Egreso:</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  placeholder="Detallar evolución clínica, estado al momento de la salida..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Home Medication & Prescriptions */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#162217] flex items-center gap-1.5">
                  <Pill className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Medicación y Cuidados Prescriptos para el Hogar:</span>
                </label>
                <textarea
                  rows={2}
                  value={homeMedication}
                  onChange={(e) => setHomeMedication(e.target.value)}
                  placeholder="Ej: Amoxicilina 500mg: 1 comp cada 12hs por 7 días. Reposo relativo..."
                  className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Follow Up Date */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#162217] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Próximo Control / Revisión (Opcional):</span>
                </label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 font-bold text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Trust Badge */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-[11px] text-amber-900 font-medium">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  El paciente quedará registrado como recuperado y toda su información, signos vitales y tratamientos permanecerán <strong>100% guardados en Supabase</strong> para futuras consultas.
                </span>
              </div>
            </>
          ) : (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <h4 className="font-bold text-amber-950 text-xs flex items-center gap-2">
                  <Archive className="w-4 h-4 text-amber-800" />
                  <span>
                    {patient.status === 'ARCHIVADO'
                      ? '¿Deseás reactivar y desarchivar la ficha clínica?'
                      : '¿Deseás archivar la ficha de este paciente?'}
                  </span>
                </h4>
                <p className="text-[11px] text-amber-900">
                  {patient.status === 'ARCHIVADO'
                    ? 'Al desarchivar, el paciente volverá a figurar en la lista activa general con todo su historial intacto.'
                    : 'Al archivar, la ficha se ocultará de la lista principal para mayor orden. Podrás volver a encontrarla y reactivarla en cualquier momento filtrando por "Archivados". Ningún dato se borra.'}
                </p>
              </div>

              {patient.status !== 'ARCHIVADO' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-[#162217] block">Motivo del Archivado:</label>
                  <input
                    type="text"
                    value={archiveReason}
                    onChange={(e) => setArchiveReason(e.target.value)}
                    placeholder="Ej: Cambio de ciudad, paciente sin visitas recientes..."
                    className="w-full bg-[#FAF8F5] border border-[#DDD7C8] rounded-xl p-2.5 font-bold text-xs focus:ring-2 focus:ring-amber-600 focus:outline-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-[#E8E3D9] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl text-white font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                activeAction === 'DISCHARGE'
                  ? 'bg-emerald-700 hover:bg-emerald-800 border border-emerald-800'
                  : 'bg-[#8C6B43] hover:bg-[#725431] border border-[#725431]'
              }`}
            >
              {isSubmitting ? (
                <span>Guardando en Supabase...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {activeAction === 'DISCHARGE'
                      ? 'Confirmar Alta Médica'
                      : patient.status === 'ARCHIVADO'
                      ? 'Desarchivar Paciente'
                      : 'Archivar Ficha'}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
