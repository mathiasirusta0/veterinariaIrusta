import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Award,
  Calendar,
  Pill,
  MessageCircle,
  QrCode,
  User,
  PawPrint,
  Sparkles,
  Trash2,
  Copy,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Prescription, PrescriptionItem, PrescriptionType, SENASACategory } from '../types';
import { formatDate, formatWeight } from '../utils/formatters';
import { printA4Prescription } from '../utils/printDocumentHelper';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, SearchInput, FilterBar } from './ui';

interface PrescriptionPreset {
  name: string;
  category: string;
  diagnosis: string;
  type: PrescriptionType;
  items: Omit<PrescriptionItem, 'id'>[];
}

const CLINICAL_PRESETS: PrescriptionPreset[] = [
  {
    name: 'Postquirúrgico Básico Canino',
    category: 'Cirugía',
    diagnosis: 'Control posoperatorio / Prevención de infección y analgesia',
    type: 'RECETA_COMUN',
    items: [
      {
        medicationName: 'Cefalexina 500mg',
        activeIngredient: 'Cefalexina monohidrato',
        presentation: 'Comprimidos',
        dose: '25 mg/kg cada 12 horas',
        route: 'ORAL',
        frequency: 'Cada 12 horas',
        duration: '7 a 10 días',
        quantityPrescribed: 2,
        senasaCategory: 'CAT_III_RECETA',
        requiresRVE: false,
        instructions: 'Administrar junto con comida para evitar malestar gástrico.',
      },
      {
        medicationName: 'Meloxicam 1mg',
        activeIngredient: 'Meloxicam',
        presentation: 'Comprimidos orales',
        dose: '0.1 mg/kg cada 24 horas',
        route: 'ORAL',
        frequency: 'Cada 24 horas',
        duration: '4 días',
        quantityPrescribed: 1,
        senasaCategory: 'CAT_III_RECETA',
        requiresRVE: false,
        instructions: 'Dar siempre con estómago lleno. Suspender si hay vómitos o diarrea.',
      },
    ],
  },
  {
    name: 'Gastroenteritis & Antiemético',
    category: 'Medicina Interna',
    diagnosis: 'Gastroenteritis aguda / Tratamiento sintomático',
    type: 'RECETA_COMUN',
    items: [
      {
        medicationName: 'Cerenia 16mg',
        activeIngredient: 'Maropitant Citrato',
        presentation: 'Comprimidos',
        dose: '2 mg/kg cada 24 horas',
        route: 'ORAL',
        frequency: 'Cada 24 horas',
        duration: '3 a 4 días',
        quantityPrescribed: 1,
        senasaCategory: 'CAT_III_RECETA',
        requiresRVE: false,
        instructions: 'Administrar 2 horas antes de la comida con un snack pequeño.',
      },
      {
        medicationName: 'Omeprazol 10mg',
        activeIngredient: 'Omeprazol',
        presentation: 'Cápsulas',
        dose: '1 mg/kg cada 24 horas',
        route: 'ORAL',
        frequency: 'Cada 24 horas en ayunas',
        duration: '7 días',
        quantityPrescribed: 1,
        senasaCategory: 'CAT_III_RECETA',
        requiresRVE: false,
        instructions: 'Dar por la mañana 30 minutos antes del desayuno.',
      },
    ],
  },
  {
    name: 'Dermatología / Prurito Alérgico',
    category: 'Dermatología',
    diagnosis: 'Dermatitis atópica / Prurito alérgico no estacional',
    type: 'RECETA_COMUN',
    items: [
      {
        medicationName: 'Apoquel 5.4mg',
        activeIngredient: 'Oclacitinib Maleato',
        presentation: 'Comprimidos',
        dose: '0.4 a 0.6 mg/kg cada 12 horas por 14 días, luego cada 24 horas',
        route: 'ORAL',
        frequency: 'Cada 12 horas (fase inicial)',
        duration: '14 días',
        quantityPrescribed: 1,
        senasaCategory: 'CAT_III_RECETA',
        requiresRVE: false,
        instructions: 'Puede administrarse con o sin alimento.',
      },
    ],
  },
  {
    name: 'Psicotrópico / Antiepiléptico (Cat I)',
    category: 'Neurología',
    diagnosis: 'Epilepsia idiopática canina / Terapia anticonvulsiva',
    type: 'RECETA_OFICIAL_ARCHIVADA',
    items: [
      {
        medicationName: 'Fenobarbital 100mg',
        activeIngredient: 'Fenobarbital',
        presentation: 'Comprimidos ranurados',
        dose: '2.5 mg/kg cada 12 horas',
        route: 'ORAL',
        frequency: 'Estrictamente cada 12 horas',
        duration: '30 días',
        quantityPrescribed: 1,
        senasaCategory: 'CAT_I_OFICIAL_ARCHIVADA',
        requiresRVE: false,
        instructions: 'No interrumpir el tratamiento de forma abrupta. Respetar horarios con precisión.',
      },
    ],
  },
];

export const PrescriptionsView: React.FC = () => {
  const {
    prescriptions,
    currentUser,
    activeBranch,
    patients,
    owners,
    users,
    addPrescription,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    openWhatsAppHub,
    showToast,
  } = useVet();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('TODOS');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  // Form State for New Prescription
  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [prescriptionType, setPrescriptionType] = useState<PrescriptionType>('RECETA_COMUN');
  const [diagnosis, setDiagnosis] = useState('Gastroenteritis aguda / Tratamiento sintomático');
  const [items, setItems] = useState<Omit<PrescriptionItem, 'id'>[]>([
    {
      medicationName: 'Cerenia 16mg',
      activeIngredient: 'Maropitant Citrato',
      presentation: 'Comprimidos',
      dose: '1 comp cada 24 horas',
      route: 'ORAL',
      frequency: 'Cada 24 horas',
      duration: '3 días',
      quantityPrescribed: 1,
      senasaCategory: 'CAT_III_RECETA',
      requiresRVE: false,
      instructions: 'Administrar con una pequeña porción de comida.',
    },
  ]);

  const filteredPrescriptions = prescriptions.filter((p) => {
    const q = (searchQuery || '').toLowerCase();
    const pat = patients.find((pt) => pt.id === p.patientId);
    const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;
    const matchesSearch =
      (p.prescriptionNumber || '').toLowerCase().includes(q) ||
      (p.vetName || '').toLowerCase().includes(q) ||
      (p.diagnosis || '').toLowerCase().includes(q) ||
      (pat && (pat.name || '').toLowerCase().includes(q)) ||
      (pat && (pat.clinicalRecordNumber || '').toLowerCase().includes(q)) ||
      (ow && (ow.firstName + ' ' + ow.lastName).toLowerCase().includes(q)) ||
      p.items.some(
        (it) =>
          it.medicationName.toLowerCase().includes(q) || it.activeIngredient.toLowerCase().includes(q)
      );

    const matchesType = typeFilter === 'TODOS' || p.prescriptionType === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleApplyPreset = (presetName: string) => {
    const preset = CLINICAL_PRESETS.find((p) => p.name === presetName);
    if (!preset) return;
    triggerHaptic('medium');
    setPrescriptionType(preset.type);
    setDiagnosis(preset.diagnosis);
    setItems(JSON.parse(JSON.stringify(preset.items)));
    showToast('info', 'Plantilla Aplicada', 'Se cargaron los fármacos de ' + preset.name);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        medicationName: '',
        activeIngredient: '',
        presentation: 'Comprimidos',
        dose: '',
        route: 'ORAL',
        frequency: 'Cada 12 horas',
        duration: '5 días',
        quantityPrescribed: 1,
        senasaCategory: 'CAT_III_RECETA',
        requiresRVE: false,
        instructions: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof Omit<PrescriptionItem, 'id'>, value: any) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleCreatePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    const pat = patients.find((p) => p.id === patientId);
    const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;
    const vet = users.find((u) => u.role === 'VETERINARIO') || users[0];

    const newPrescription: Prescription = {
      id: 'rx-' + Date.now(),
      prescriptionNumber: 'REC-2026-' + Math.floor(1000 + Math.random() * 9000),
      prescriptionType,
      patientId,
      ownerId: ow?.id || 'owner-1',
      vetId: vet.id,
      vetName: vet.name,
      vetLicense: vet.licenseNumber || 'M.P. 502',
      vetCuit: '20-32458912-8',
      establishmentName: 'Hospital Veterinario Central 24hs',
      establishmentAddress: 'Av. Corrientes 4550, CABA',
      date: new Date().toISOString().split('T')[0],
      diagnosis,
      items: items.map((it, idx) => ({
        ...it,
        id: 'item-' + Date.now() + '-' + idx,
      })),
      isDispensed: false,
      digitalSignatureHash: 'SHA256:' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    };

    addPrescription(newPrescription);
    setIsNewModalOpen(false);
    showToast('success', 'Receta Emitida con Éxito', 'Receta ' + newPrescription.prescriptionNumber + ' firmada y registrada.');
  };


  const handlePrintPrescription = (rx: Prescription) => {
    triggerHaptic('medium');
    const pat = patients.find((p) => p.id === rx.patientId);
    const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;

    printA4Prescription({
      prescriptionNumber: rx.prescriptionNumber,
      date: formatDate(rx.date || new Date().toISOString()),
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      type: rx.prescriptionType,
      diagnosis: rx.diagnosis || 'Consulta clínica general',
      notes: rx.notes,
      doctor: {
        name: rx.vetName || currentUser?.name || 'Dr. Diego Iván Irusta',
        license: rx.vetLicense || 'M.P. 502',
      },
      branch: {
        name: activeBranch?.name || 'Clínica Veterinaria Ranquel',
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
        address: ow?.address || 'Río Cuarto',
      },
      items: rx.items.map((it) => ({
        medicationName: it.medicationName,
        activeIngredient: it.activeIngredient,
        presentation: it.presentation,
        dose: it.dose,
        route: it.route,
        frequency: it.frequency,
        duration: it.duration,
        quantityPrescribed: it.quantityPrescribed,
        instructions: it.instructions || '',
      })),
    });
    showToast('success', 'Receta en Impresión A4', `Receta ${rx.prescriptionNumber} enviada a impresión oficial.`);
  };

  const handleSendWhatsApp = (rx: Prescription) => {
    triggerHaptic('light');
    const pat = patients.find((p) => p.id === rx.patientId);
    const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;
    if (!ow) return;

    const medSummary = rx.items
      .map((it) => it.medicationName + ': ' + it.dose + ' por ' + it.duration + (it.instructions ? ' (' + it.instructions + ')' : ''))
      .join(' \n');

    openWhatsAppHub({
      patientName: pat?.name || 'su mascota',
      ownerName: ow.firstName + ' ' + ow.lastName,
      ownerPhone: ow.phone || ow.whatsapp || '',
      type: 'RECETA_MEDICA',
      details: {
        prescriptionNumber: rx.prescriptionNumber,
        vetName: rx.vetName,
        diagnosis: rx.diagnosis,
        medications: medSummary,
      },
    });
  };

  const filterOptions = [
    { id: 'TODOS', label: 'Todas', badge: prescriptions.length },
    { id: 'RECETA_COMUN', label: 'Común (Cat III)', badge: prescriptions.filter((p) => p.prescriptionType === 'RECETA_COMUN').length },
    { id: 'RECETA_ARCHIVADA', label: 'Archivada (Cat II)', badge: prescriptions.filter((p) => p.prescriptionType === 'RECETA_ARCHIVADA').length },
    { id: 'RECETA_OFICIAL_ARCHIVADA', label: 'Oficial Psicotrópicos (Cat I)', badge: prescriptions.filter((p) => p.prescriptionType === 'RECETA_OFICIAL_ARCHIVADA').length },
    { id: 'RECETA_ELECTRONICA_SENASA', label: 'RVE SENASA', badge: prescriptions.filter((p) => p.prescriptionType === 'RECETA_ELECTRONICA_SENASA').length },
  ];

  return (
    <div className="space-y-5 pb-16 w-full max-w-full">
      {/* 1. Header */}
      <PageHeader
        category="Farmacología, Prescripciones & Terapéutica"
        title="Recetario Digital & Prescripciones Oficiales"
        description="Confección de recetas médicas veterinarias con membrete oficial, validación SENASA, firma digital matriculada y envío por WhatsApp"
        icon={FileText}
        actions={[
          {
            label: 'Emitir Nueva Receta',
            icon: Plus,
            onClick: () => setIsNewModalOpen(true),
            variant: 'primary',
          },
        ]}
      />

      {/* 2. Quick Clinical Presets Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Plantillas Terapéuticas Frecuentes (1-Click Presets):
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CLINICAL_PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => {
                handleApplyPreset(preset.name);
                setIsNewModalOpen(true);
              }}
              className="px-3 py-1.5 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 text-slate-700 hover:text-teal-800 border border-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-2xs"
            >
              <span>💊</span>
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-2xl shadow-xs space-y-3 w-full max-w-full">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar por número de receta, paciente, HC, tutor, principio activo o diagnóstico..."
        />
        <FilterBar
          options={filterOptions}
          activeId={typeFilter}
          onSelect={setTypeFilter}
          label="Categoría SENASA"
        />
      </div>

      {/* 4. List of Prescriptions */}
      <div className="space-y-4 w-full">
        {filteredPrescriptions.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No se encontraron recetas emitidas"
            description={
              searchQuery || typeFilter !== 'TODOS'
                ? 'No hay recetas que coincidan con los filtros de búsqueda seleccionados.'
                : 'No se han registrado prescripciones médicas en el sistema aún.'
            }
            actionLabel="Emitir Primera Receta"
            onAction={() => setIsNewModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrescriptions.map((rx) => {
              const pat = patients.find((p) => p.id === rx.patientId);
              const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;

              const isOfficial = rx.prescriptionType === 'RECETA_OFICIAL_ARCHIVADA';
              const isSenasa = rx.prescriptionType === 'RECETA_ELECTRONICA_SENASA';

              const typeBadgeClass = isOfficial
                ? 'bg-rose-50 text-rose-800 border-rose-200 font-black'
                : isSenasa
                ? 'bg-blue-50 text-blue-800 border-blue-200 font-bold'
                : rx.prescriptionType === 'RECETA_ARCHIVADA'
                ? 'bg-amber-50 text-amber-800 border-amber-200 font-bold'
                : 'bg-teal-50 text-teal-800 border-teal-200 font-bold';

              return (
                <div
                  key={rx.id}
                  className="bg-white border border-slate-200/90 hover:border-teal-500/60 rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Header: Number + Type */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="font-mono font-black text-slate-900 text-sm tracking-tight">{rx.prescriptionNumber}</span>
                        <p className="text-[10px] text-slate-500 font-medium">📅 {formatDate(rx.date)}</p>
                      </div>

                      <span className={'text-[9px] px-2 py-0.5 rounded-full uppercase border ' + typeBadgeClass}>
                        {rx.prescriptionType.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Patient & Owner Info */}
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span
                          onClick={() => {
                            if (pat) {
                              setSelectedPatientId(pat.id);
                              setActivePatientTab('RECETAS');
                              setActiveView('PACIENTES');
                            }
                          }}
                          className="font-bold text-slate-900 hover:text-teal-700 cursor-pointer text-sm"
                        >
                          {pat?.name || 'Paciente'}
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                          {pat?.clinicalRecordNumber || 'HC-0000'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        {pat?.species} • {pat?.breed} {pat?.weight ? '• ' + formatWeight(pat.weight) : ''}
                      </p>

                      <p className="text-[11px] text-slate-600">
                        Tutor: <strong>{ow ? (ow.firstName + ' ' + ow.lastName) : 'N/A'}</strong> {ow?.phone ? '(' + ow.phone + ')' : ''}
                      </p>
                    </div>

                    {/* Diagnosis */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Diagnóstico:</span>
                      <p className="text-slate-800 font-semibold leading-snug">{rx.diagnosis}</p>
                    </div>

                    {/* Prescribed Items */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Fármacos Prescriptos:</span>
                      {rx.items.map((item, idx) => (
                        <div key={idx} className="bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-0.5">
                          <div className="flex items-center justify-between font-bold text-slate-900 text-xs">
                            <span>💊 {item.medicationName}</span>
                            <span className="text-[10px] text-slate-500 font-normal">({item.presentation})</span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            <strong>Dosis:</strong> {item.dose} • <strong>Duración:</strong> {item.duration}
                          </p>
                          {item.instructions && (
                            <p className="text-[10px] text-slate-500 italic">
                              "{item.instructions}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer: Professional & Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] text-slate-400 block font-bold uppercase">Médico Veterinario:</span>
                      <span className="font-bold text-slate-800 text-[11px] truncate block">
                        {rx.vetName} <span className="font-mono text-slate-500 font-normal">({rx.vetLicense})</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {ow?.phone && (
                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(rx)}
                          className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl transition-all active:scale-95"
                          title="Enviar receta por WhatsApp al tutor"
                        >
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handlePrintPrescription(rx)}
                        className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition-all active:scale-95"
                        title="Imprimir receta oficial"
                      >
                        <Printer className="w-4 h-4 text-teal-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Modal Nueva Receta Oficial */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>Confeccionar Receta Médica Oficial</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Paciente:</label>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species} • {p.clinicalRecordNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Tipo de Receta Oficial:</label>
                  <select
                    value={prescriptionType}
                    onChange={(e) => setPrescriptionType(e.target.value as PrescriptionType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="RECETA_COMUN">Receta Común (Cat III)</option>
                    <option value="RECETA_ARCHIVADA">Receta Archivada (Cat II)</option>
                    <option value="RECETA_OFICIAL_ARCHIVADA">Receta Oficial Archivada (Cat I / Psicotrópicos)</option>
                    <option value="RECETA_ELECTRONICA_SENASA">Receta Electrónica SENASA (RVE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Diagnóstico Clínico:</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                  placeholder="Ej: Otitis externa bacteriana aguda..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Multiple Medication Items Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 text-xs uppercase tracking-wider">
                    Medicamentos Prescriptos ({items.length}):
                  </span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg border border-teal-200 flex items-center gap-1 text-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Medicamento</span>
                  </button>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5 relative">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-teal-700 text-xs">Fármaco #{index + 1}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar medicamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-slate-500 text-[10px] uppercase font-bold block">Nombre Comercial:</label>
                        <input
                          type="text"
                          value={item.medicationName}
                          onChange={(e) => handleItemChange(index, 'medicationName', e.target.value)}
                          required
                          placeholder="Ej: Cefalexina 500mg"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 text-[10px] uppercase font-bold block">Principio Activo:</label>
                        <input
                          type="text"
                          value={item.activeIngredient}
                          onChange={(e) => handleItemChange(index, 'activeIngredient', e.target.value)}
                          placeholder="Ej: Cefalexina monohidrato"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-slate-500 text-[10px] uppercase font-bold block">Dosis & Vía:</label>
                        <input
                          type="text"
                          value={item.dose}
                          onChange={(e) => handleItemChange(index, 'dose', e.target.value)}
                          required
                          placeholder="Ej: 1 comp cada 12hs Oral"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 text-[10px] uppercase font-bold block">Frecuencia:</label>
                        <input
                          type="text"
                          value={item.frequency}
                          onChange={(e) => handleItemChange(index, 'frequency', e.target.value)}
                          required
                          placeholder="Ej: Cada 12 horas"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 text-[10px] uppercase font-bold block">Duración:</label>
                        <input
                          type="text"
                          value={item.duration}
                          onChange={(e) => handleItemChange(index, 'duration', e.target.value)}
                          required
                          placeholder="Ej: 7 días"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-500 text-[10px] uppercase font-bold block">Instrucciones para el Tutor:</label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => handleItemChange(index, 'instructions', e.target.value)}
                        placeholder="Ej: Administrar con alimento. No suspender antes de tiempo."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all"
                >
                  Firmar & Emitir Receta Oficial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
