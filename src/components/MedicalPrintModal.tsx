import React, { useState } from 'react';
import {
  Printer,
  X,
  FileText,
  Syringe,
  Receipt,
  BedDouble,
  ShieldCheck,
  Download,
  Share2,
  Building2,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { formatDate, formatDateTime, formatCurrency, formatInvoiceNumber } from '../utils/formatters';

export interface MedicalPrintData {
  type: 'RECETA' | 'VACUNACION' | 'EPICRISIS' | 'FACTURA' | 'CONSENTIMIENTO';
  patientId?: string;
  consultationId?: string;
  vaccineId?: string;
  hospitalizationId?: string;
  invoiceId?: string;
  documentId?: string;
}

export const MedicalPrintModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  printData: MedicalPrintData | null;
}> = ({ isOpen, onClose, printData }) => {
  const {
    activeBranch,
    currentUser,
    patients,
    owners,
    consultations,
    vaccinations,
    hospitalizations,
    invoices,
    documents,
  } = useVet();

  if (!isOpen || !printData) return null;

  const handlePrint = () => {
    window.print();
  };

  const patient = printData.patientId
    ? patients.find((p) => p.id === printData.patientId)
    : patients[0];
  const owner = patient ? owners.find((o) => o.id === patient.ownerId) : owners[0];

  const consultation = printData.consultationId
    ? consultations.find((c) => c.id === printData.consultationId)
    : consultations.find((c) => c.patientId === patient?.id);

  const vaccine = printData.vaccineId
    ? vaccinations.find((v) => v.id === printData.vaccineId)
    : vaccinations.find((v) => v.patientId === patient?.id);

  const hospitalization = printData.hospitalizationId
    ? hospitalizations.find((h) => h.id === printData.hospitalizationId)
    : hospitalizations.find((h) => h.patientId === patient?.id);

  const invoice = printData.invoiceId
    ? invoices.find((i) => i.id === printData.invoiceId)
    : invoices[0];

  const document = printData.documentId
    ? documents.find((d) => d.id === printData.documentId)
    : documents[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 print:m-0 print:p-0 print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Vista Previa de Impresión & Exportación PDF
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-white space-y-6 text-slate-900 custom-scrollbar print:p-0 print:overflow-visible">
          {/* Official Letterhead Header */}
          <div className="flex items-start justify-between border-b-2 border-teal-700 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-teal-700 flex items-center justify-center text-white font-black text-xl">
                V
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900">
                  {activeBranch.name.toUpperCase()}
                </h1>
                <p className="text-xs text-teal-800 font-bold uppercase tracking-wider">
                  Centro Hospitalario & Cuidados Intensivos Veterinarios
                </p>
                <p className="text-[11px] text-slate-500">
                  {activeBranch.address} • Tel. Guardia 24hs: {activeBranch.phone}
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 block mb-1">
                {new Date().toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
              <span className="text-slate-500 block text-[11px]">
                Dr./Dra.: <span className="font-bold text-slate-800">{currentUser.name}</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Matrícula: {currentUser.licenseNumber || 'M.P. 502'}
              </span>
            </div>
          </div>

          {/* Patient and Owner Metadata Strip */}
          {patient && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Paciente:</span>
                <span className="font-bold text-slate-900">{patient.name}</span>
                <span className="text-slate-500 block text-[11px]">({patient.species} • {patient.breed})</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Historia Clínica:</span>
                <span className="font-mono font-bold text-teal-700">{patient.clinicalRecordNumber}</span>
                <span className="text-slate-500 block text-[11px]">Microchip: {patient.microchip || 'No reg.'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Peso & Edad:</span>
                <span className="font-bold text-slate-900">{patient.weight} kg</span>
                <span className="text-slate-500 block text-[11px]">{patient.calculatedAge} • {patient.sex}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Tutor / Titular:</span>
                <span className="font-bold text-slate-900">{owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'}</span>
                <span className="text-slate-500 block text-[11px]">DNI: {owner?.dni || 'S/D'}</span>
              </div>
            </div>
          )}

          {/* 1. RECETA MÉDICA */}
          {printData.type === 'RECETA' && (
            <div className="space-y-5 pt-2">
              <div className="text-center border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold uppercase tracking-wider text-teal-800">
                  ℞ Recetario Médico & Prescripción Farmacológica
                </h2>
              </div>

              {consultation?.soap.assessment && (
                <div className="text-xs">
                  <span className="font-bold text-slate-700">Diagnóstico Presuntivo / Indicación:</span>
                  <p className="text-slate-800 mt-0.5">{consultation.soap.assessment}</p>
                </div>
              )}

              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Indicaciones Farmacológicas:
                </span>
                {consultation?.prescriptions && consultation.prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {consultation.prescriptions.map((p, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900 text-sm">{idx + 1}. {p.medicationName}</span>
                          <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            Vía {p.route}
                          </span>
                        </div>
                        <p className="text-slate-700 font-semibold">
                          Dosis: <span className="font-mono text-slate-900 font-bold">{p.dose}</span> — Frecuencia: <span className="font-mono font-bold text-slate-900">{p.frequency}</span>
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          Duración del tratamiento: <span className="font-bold text-slate-700">{p.duration}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <p className="font-bold text-slate-800">1. Protector Gástrico + Antiinflamatorio / Analgésico</p>
                    <p className="text-slate-600 mt-1">Administrar cada 12 horas con las comidas durante 5 días seguidos.</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
                <span className="font-bold block">⚠️ Cuidados y Advertencias Generales:</span>
                <p>Cumplir los horarios de administración. En caso de vómitos, decaimiento agudo o reacciones alérgicas, suspender y concurrir inmediatamente a la guardia 24hs.</p>
              </div>
            </div>
          )}

          {/* 2. CERTIFICADO DE VACUNACION */}
          {printData.type === 'VACUNACION' && (
            <div className="space-y-5 pt-2">
              <div className="text-center border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold uppercase tracking-wider text-teal-800">
                  💉 Certificado Oficial de Vacunación & Libreta Sanitaria
                </h2>
              </div>

              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-sm">
                    {vaccine?.vaccineName || 'Séxtuple Canina / Antirrábica'}
                  </span>
                  <span className="font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                    ESTADO: APLICADA
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Lote del Biológico:</span>
                    <span className="font-mono font-bold text-slate-900">{vaccine?.batchNumber || 'LOT-2026-X8'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Laboratorio Fabricante:</span>
                    <span className="font-semibold text-slate-900">{vaccine?.manufacturer || 'Zoetis / Boehringer'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha de Aplicación:</span>
                    <span className="font-bold text-slate-900">{vaccine?.administeredDate || '18/08/2026'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Próximo Refuerzo:</span>
                    <span className="font-bold text-teal-700">{vaccine?.nextDueDate || '18/08/2027'}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Por la presente se certifica que el ejemplar detallado precedentemente ha sido examinado clínicamente y hallado en condiciones de aptitud física para recibir la inoculación del biológico correspondiente, registrado bajo estrictas normas de bioseguridad y cadena de frío.
              </p>
            </div>
          )}

          {/* 3. EPICRISIS / RESUMEN DE ALTA */}
          {printData.type === 'EPICRISIS' && (
            <div className="space-y-5 pt-2">
              <div className="text-center border-b border-slate-200 pb-2">
                <h2 className="text-base font-bold uppercase tracking-wider text-teal-800">
                  🏥 Epicrisis Hospitalaria & Resumen de Alta Médica
                </h2>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Diagnóstico de Ingreso & Egreso:</span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {hospitalization?.primaryDiagnosis || 'Gastroenteritis aguda severa con deshidratación grado II compensada'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Evolución Clínica & Tratamiento en Hospital:</span>
                  <p className="text-slate-700 mt-0.5 leading-relaxed">
                    {hospitalization?.dischargeSummary ||
                      'Paciente completó protocolo de fluidoterapia endovenosa, terapia antiemética con Maropitant y gastroprotección. Evoluciona favorablemente con buen apetito y heces formadas. Se otorga alta médica con control programado.'}
                  </p>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Plan Terapéutico Domiciliario:</span>
                  <p className="text-slate-700 mt-0.5">
                    1. Dieta gastrointestinal blanda durante 7 días.
                    <br />
                    2. Medicación según receta adjunta por 5 días.
                    <br />
                    3. Reposo y control en consultorio en 72 horas.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. FACTURA AFIP */}
          {printData.type === 'FACTURA' && invoice && (
            <div className="space-y-4 pt-2">
              <div className="border border-slate-300 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-2xl font-black text-slate-900">{invoice.type ? invoice.type.replace('_', ' ') : 'FACTURA B'}</span>
                    <p className="text-xs text-slate-500 font-mono">N° {invoice.invoiceNumber}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-slate-800">Fecha: {invoice.date}</p>
                    <p className="text-slate-500">CUIT: 30-71829384-9</p>
                  </div>
                </div>

                <table className="w-full text-xs text-left">
                  <thead className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="py-2">Descripción</th>
                      <th className="py-2 text-center">Cant.</th>
                      <th className="py-2 text-right">Precio Unit.</th>
                      <th className="py-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invoice.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 font-semibold text-slate-900">{item.description}</td>
                        <td className="py-2 text-center">{item.quantity}</td>
                        <td className="py-2 text-right font-mono">${(item.unitPrice || 0).toLocaleString('es-AR')}</td>
                        <td className="py-2 text-right font-mono font-bold text-slate-900">${(item.subtotal || 0).toLocaleString('es-AR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-base font-black">
                  <span>TOTAL A PAGAR:</span>
                  <span className="font-mono text-teal-800 text-xl">${(invoice.totalAmount || 0).toLocaleString('es-AR')}</span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-xs bg-slate-50 p-3 rounded-lg">
                  <div>
                    <span className="font-bold text-slate-800 block">CAE N°: {invoice.caeNumber}</span>
                    <span className="text-slate-500 block text-[11px]">Vencimiento CAE: {invoice.caeExpirationDate}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded bg-teal-100 text-teal-900 font-bold font-mono text-[11px]">
                      PAGO: {invoice.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. CONSENTIMIENTO INFORMADO */}
          {printData.type === 'CONSENTIMIENTO' && document && (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="font-black text-slate-900 text-base uppercase">{document.title}</h3>
                <span className="text-xs text-slate-500 font-medium">Categoría: {document.type}</span>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p>{document.content}</p>
              </div>

              {document.isSigned && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Firmado Digitalmente por el Tutor:</span>
                    <p className="font-bold text-slate-900 text-xs">{document.signedByOwnerName} (DNI: {document.signedByOwnerDni})</p>
                    <span className="text-[10px] text-slate-500 font-mono">Registro: {formatDateTime(document.createdAt)}</span>
                  </div>
                  {document.signatureDataUrl && (
                    <img
                      src={document.signatureDataUrl}
                      alt="Firma"
                      className="h-14 border-b border-slate-400 px-2"
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {/* Professional Signature & Stamp Box */}
          <div className="pt-8 mt-8 border-t border-slate-200 flex items-end justify-between text-xs">
            <div className="text-slate-400 text-[10px]">
              <p>Documento generado digitalmente por VET SYSTEM.</p>
              <p>Validez médica legal bajo normas del Colegio de Médicos Veterinarios.</p>
            </div>

            <div className="text-center w-56 border-t border-slate-900 pt-2 space-y-0.5">
              <span className="font-bold text-slate-900 block">{currentUser.name}</span>
              <span className="text-[11px] text-slate-600 block">Médico Veterinario • {currentUser.licenseNumber || 'M.P. 502'}</span>
              <span className="text-[10px] text-teal-700 font-semibold block">Firma & Sello Acreditado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
