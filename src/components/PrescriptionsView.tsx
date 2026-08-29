import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Pill,
  MessageCircle,
  QrCode,
  User,
  UserPlus,
  PawPrint,
  Sparkles,
  Trash2,
  Copy,
  Calculator,
  ExternalLink,
  ChevronDown,
  Info,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { Prescription, PrescriptionItem, PrescriptionType, SENASACategory, Species } from '../types';
import { formatDate, formatWeight } from '../utils/formatters';
import { printA4Prescription } from '../utils/printDocumentHelper';
import { triggerHaptic } from '../utils/haptics';
import { calculatePrescriptionSha256 } from '../utils/crypto';
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
    diagnosis: 'Control posoperatorio / Prevención de infección y analgesia multimodal',
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
        instructions: 'Administrar junto con una pequeña porción de comida para evitar malestar gástrico.',
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
        instructions: 'Dar siempre con estómago lleno. Suspender de inmediato si hay vómitos o heces oscuras.',
      },
    ],
  },
  {
    name: 'Gastroenteritis & Antiemético',
    category: 'Medicina Interna',
    diagnosis: 'Gastroenteritis aguda / Tratamiento sintomático y protector de mucosa',
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
        instructions: 'Administrar con un bocado pequeño de comida al menos 2 horas antes de la alimentación principal.',
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
        instructions: 'Dar por la mañana 30 minutos antes del primer alimento.',
      },
    ],
  },
  {
    name: 'Dermatología / Prurito Alérgico',
    category: 'Dermatología',
    diagnosis: 'Dermatitis atópica canina / Control de prurito e inflamación',
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
        instructions: 'Puede administrarse con o sin comida. Mantener horario regular.',
      },
    ],
  },
  {
    name: 'Otitis Externa & Limpieza',
    category: 'Dermatología',
    diagnosis: 'Otitis externa bacteriana / Tratamiento tópico y limpieza',
    type: 'RECETA_COMUN',
    items: [
      {
        medicationName: 'Gotas Óticas Combinadas (Gentamicina + Betametasona + Clotrimazol)',
        activeIngredient: 'Gentamicina / Betametasona / Clotrimazol',
        presentation: 'Frasco gotero 15ml',
        dose: '4 a 6 gotas en el conducto auditivo afectado',
        route: 'OTICA',
        frequency: 'Cada 12 horas',
        duration: '10 días',
        quantityPrescribed: 1,
        senasaCategory: 'CAT_III_RECETA',
        requiresRVE: false,
        instructions: 'Limpiar previamente el pabellón con gasa seca. Masajear la base de la oreja 1 minuto tras aplicar.',
      },
    ],
  },
  {
    name: 'Dolor Osteoarticular / Analgesia',
    category: 'Traumatología',
    diagnosis: 'Osteoartritis / Dolor articular crónico reagudizado',
    type: 'RECETA_COMUN',
    items: [
      {
        medicationName: 'Meloxicam 2.5mg',
        activeIngredient: 'Meloxicam',
        presentation: 'Comprimidos',
        dose: '0.1 mg/kg cada 24 horas',
        route: 'ORAL',
        frequency: 'Cada 24 horas con la comida',
        duration: '7 días',
        quantityPrescribed: 1,
        senasaCategory: 'CAT_III_RECETA',
        requiresRVE: false,
        instructions: 'Administrar con comida abundante. Controlar función renal e hidratación.',
      },
      {
        medicationName: 'Condroprotectores Glucosamina + Condroitín',
        activeIngredient: 'Glucosamina sulfato / Condroitín sulfato',
        presentation: 'Comprimidos palatables',
        dose: '1 comprimido cada 24 horas',
        route: 'ORAL',
        frequency: 'Cada 24 horas',
        duration: '30 días',
        quantityPrescribed: 1,
        senasaCategory: 'VENTA_LIBRE',
        requiresRVE: false,
        instructions: 'Ofrecer como premio antes de la comida principal.',
      },
    ],
  },
  {
    name: 'Psicotrópico / Antiepiléptico (Cat I)',
    category: 'Neurología',
    diagnosis: 'Epilepsia idiopática canina / Terapia anticonvulsiva de mantenimiento',
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
        instructions: 'Medicamento controlado bajo receta archivada. No suspender nunca de forma brusca.',
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
    addPatient,
    addOwner,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    openWhatsAppHub,
    showToast,
  } = useVet();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('TODOS');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form Mode: Registered Patient vs New/External Unregistered Patient
  const [patientMode, setPatientMode] = useState<'REGISTERED' | 'EXTERNAL'>('REGISTERED');

  // Registered Patient Form State
  const [patientId, setPatientId] = useState(patients[0]?.id || '');

  // External / Walk-in Patient Form State
  const [extPatientName, setExtPatientName] = useState('');
  const [extSpecies, setExtSpecies] = useState<Species>('CANINO');
  const [extBreed, setExtBreed] = useState('');
  const [extWeight, setExtWeight] = useState('');
  const [extAge, setExtAge] = useState('');
  const [extOwnerName, setExtOwnerName] = useState('');
  const [extOwnerDni, setExtOwnerDni] = useState(''); // No obligatorio
  const [extOwnerPhone, setExtOwnerPhone] = useState('');
  const [extOwnerAddress, setExtOwnerAddress] = useState('');
  const [autoSaveToSystem, setAutoSaveToSystem] = useState(false);

  // Common Prescription Form State
  const [prescriptionType, setPrescriptionType] = useState<PrescriptionType>('RECETA_COMUN');
  const [diagnosis, setDiagnosis] = useState('Gastroenteritis aguda / Tratamiento sintomático');
  const [notes, setNotes] = useState('');
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

    const patientName = (p.isExternalPatient ? p.patientName : pat?.name) || '';
    const ownerName = (p.isExternalPatient ? p.ownerName : ow ? `${ow.firstName} ${ow.lastName}` : '') || '';
    const ownerDni = (p.isExternalPatient ? p.ownerDni : ow?.dni) || '';
    const hcNumber = (p.isExternalPatient ? (p.patientHc || 'Ambulatorio') : pat?.clinicalRecordNumber) || '';

    const matchesSearch =
      (p.prescriptionNumber || '').toLowerCase().includes(q) ||
      (p.vetName || '').toLowerCase().includes(q) ||
      (p.diagnosis || '').toLowerCase().includes(q) ||
      patientName.toLowerCase().includes(q) ||
      ownerName.toLowerCase().includes(q) ||
      ownerDni.toLowerCase().includes(q) ||
      hcNumber.toLowerCase().includes(q) ||
      p.items.some(
        (it) =>
          it.medicationName.toLowerCase().includes(q) ||
          (it.activeIngredient && it.activeIngredient.toLowerCase().includes(q))
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

  const handleCreatePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    const vet = users.find((u) => u.role === 'VETERINARIO') || users[0];
    const currentYear = new Date().getFullYear();
    const rxSequence = (prescriptions.length + 1).toString().padStart(6, '0');
    const rxNum = `REC-${currentYear}-${rxSequence}`;
    const rxDate = new Date().toISOString().split('T')[0];

    const cleanItems = items.map((it, idx) => ({
      ...it,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${idx}`,
    }));

    let finalPatientId = patientId;
    let finalOwnerId = 'owner-unregistered';
    let isExternal = false;
    let externalData: Partial<Prescription> = {};

    if (patientMode === 'EXTERNAL') {
      isExternal = true;
      if (!extPatientName.trim() || !extOwnerName.trim()) {
        showToast('error', 'Campos Obligatorios', 'Por favor ingresa el nombre del paciente y el nombre del tutor.');
        return;
      }

      // If user selected to auto-register into clinic database
      if (autoSaveToSystem) {
        try {
          const parts = extOwnerName.trim().split(' ');
          const firstName = parts[0] || 'Tutor';
          const lastName = parts.slice(1).join(' ') || 'Externo';
          const newOwner = addOwner({
            firstName,
            lastName,
            dni: extOwnerDni.trim() || 'N/A',
            phone: extOwnerPhone.trim() || '+54 9 2942 00-0000',
            address: extOwnerAddress.trim() || 'Las Lajas, Neuquén',
            branchId: activeBranch?.id || 'branch-1',
            active: true,
          });

          const weightNum = parseFloat(extWeight) || 10;
          const newPat = addPatient({
            name: extPatientName.trim(),
            species: extSpecies,
            breed: extBreed.trim() || 'Mestizo',
            gender: 'MACHO',
            weight: weightNum,
            age: parseInt(extAge, 10) || 3,
            ownerId: newOwner.id,
            branchId: activeBranch?.id || 'branch-1',
            status: 'ACTIVO',
          });

          finalPatientId = newPat.id;
          finalOwnerId = newOwner.id;
          isExternal = false;
          showToast('success', 'Padrón Actualizado', `Paciente ${newPat.name} y tutor registrados en el sistema.`);
        } catch {
          // Fallback to purely external snapshot if registration fails
          isExternal = true;
        }
      }

      externalData = {
        isExternalPatient: isExternal,
        patientName: extPatientName.trim(),
        patientSpecies: extSpecies,
        patientBreed: extBreed.trim() || 'Mestizo',
        patientWeight: extWeight.trim() ? `${extWeight.trim()} kg` : 'N/A',
        patientAge: extAge.trim() ? `${extAge.trim()} años` : 'Adulto',
        patientHc: isExternal ? 'Consulta Externa / Ambulatorio' : undefined,
        ownerName: extOwnerName.trim(),
        ownerDni: extOwnerDni.trim() || undefined,
        ownerPhone: extOwnerPhone.trim() || undefined,
        ownerAddress: extOwnerAddress.trim() || 'Las Lajas, Neuquén',
      };
    } else {
      const pat = patients.find((p) => p.id === patientId);
      const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;
      finalPatientId = pat?.id || patientId;
      finalOwnerId = ow?.id || 'owner-1';
    }

    const hash = await calculatePrescriptionSha256({
      prescriptionNumber: rxNum,
      patientId: finalPatientId,
      vetName: vet?.name || currentUser?.name || 'Dr. Diego Iván Irusta',
      vetLicense: vet?.licenseNumber || currentUser?.licenseNumber || 'M.P. 502 (Neuquén)',
      items: cleanItems,
      date: rxDate,
    });

    const newPrescription: Prescription = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rx-${Date.now()}`,
      prescriptionNumber: rxNum,
      prescriptionType,
      patientId: finalPatientId,
      ownerId: finalOwnerId,
      vetId: vet?.id || currentUser?.id || 'user-irusta-dir',
      vetName: vet?.name || currentUser?.name || 'Dr. Diego Iván Irusta',
      vetLicense: vet?.licenseNumber || currentUser?.licenseNumber || 'M.P. 502 (Neuquén)',
      vetCuit: '20-31458920-4',
      establishmentName: 'Veterinaria Ranquel',
      establishmentAddress: 'Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)',
      date: rxDate,
      diagnosis,
      notes: notes.trim() || undefined,
      items: cleanItems,
      isDispensed: false,
      digitalSignatureHash: hash,
      ...externalData,
    };

    addPrescription(newPrescription);
    setIsNewModalOpen(false);

    // Reset form fields
    setExtPatientName('');
    setExtBreed('');
    setExtWeight('');
    setExtAge('');
    setExtOwnerName('');
    setExtOwnerDni('');
    setExtOwnerPhone('');
    setExtOwnerAddress('');
    setAutoSaveToSystem(false);

    showToast('success', 'Receta Emitida con Éxito', 'Receta ' + newPrescription.prescriptionNumber + ' registrada con firma matriculada.');
  };

  const handlePrintPrescription = (rx: Prescription) => {
    triggerHaptic('medium');
    const pat = rx.isExternalPatient ? null : patients.find((p) => p.id === rx.patientId);
    const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;

    const patientName = rx.isExternalPatient ? (rx.patientName || 'Paciente Ambulatorio') : (pat?.name || 'Paciente');
    const patientSpecies = rx.isExternalPatient ? (rx.patientSpecies || 'CANINO') : (pat?.species || 'CANINO');
    const patientBreed = rx.isExternalPatient ? (rx.patientBreed || 'Mestizo') : (pat?.breed || 'Mestizo');
    const patientWeight = rx.isExternalPatient ? (rx.patientWeight || 'N/A') : (pat?.weight ? `${pat.weight} kg` : 'N/A');
    const patientAge = rx.isExternalPatient ? (rx.patientAge || 'Adulto') : (pat?.calculatedAge || 'Adulto');
    const patientHc = rx.isExternalPatient ? 'Consulta Externa / Ambulatorio' : (pat?.clinicalRecordNumber || 'HC-000');

    const ownerName = rx.isExternalPatient ? (rx.ownerName || 'Tutor Responsable') : (ow ? `${ow.firstName} ${ow.lastName}` : 'Tutor Responsable');
    const ownerDni = rx.isExternalPatient ? (rx.ownerDni || 'No informado') : (ow?.dni || 'No informado');
    const ownerPhone = rx.isExternalPatient ? (rx.ownerPhone || 'N/A') : (ow?.phone || ow?.whatsapp || 'N/A');
    const ownerAddress = rx.isExternalPatient ? (rx.ownerAddress || 'Las Lajas, Neuquén') : (ow?.address || 'Las Lajas, Neuquén');

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
        address: activeBranch?.address || 'Las Lajas, Neuquén',
        phone: activeBranch?.phone || '+54 9 2942 47-7136',
      },
      patient: {
        name: patientName,
        species: patientSpecies,
        breed: patientBreed,
        weight: patientWeight,
        age: patientAge,
        hc: patientHc,
      },
      owner: {
        name: ownerName,
        dni: ownerDni,
        phone: ownerPhone,
        address: ownerAddress,
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
    showToast('success', 'Receta en Impresión A4', `Receta ${rx.prescriptionNumber} lista para imprimir.`);
  };

  const handleSendWhatsApp = (rx: Prescription) => {
    triggerHaptic('light');
    const pat = rx.isExternalPatient ? null : patients.find((p) => p.id === rx.patientId);
    const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;

    const patientName = rx.isExternalPatient ? (rx.patientName || 'su mascota') : (pat?.name || 'su mascota');
    const ownerName = rx.isExternalPatient ? (rx.ownerName || 'Tutor') : (ow ? `${ow.firstName} ${ow.lastName}` : 'Tutor');
    const ownerPhone = rx.isExternalPatient ? (rx.ownerPhone || '') : (ow?.phone || ow?.whatsapp || '');

    if (!ownerPhone) {
      showToast('info', 'Teléfono no registrado', 'Esta receta no tiene un número de teléfono cargado para WhatsApp.');
      return;
    }

    const medSummary = rx.items
      .map((it) => it.medicationName + ': ' + it.dose + ' por ' + it.duration + (it.instructions ? ' (' + it.instructions + ')' : ''))
      .join(' \n');

    openWhatsAppHub({
      patientName,
      ownerName,
      ownerPhone,
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

  const selectedPatientData = patients.find((p) => p.id === patientId);
  const selectedOwnerData = selectedPatientData ? owners.find((o) => o.id === selectedPatientData.ownerId) : null;

  return (
    <div className="space-y-5 pb-16 w-full max-w-full">
      {/* 1. Header */}
      <PageHeader
        category="Farmacología, Prescripciones & Terapéutica"
        title="Recetario Digital & Prescripciones Oficiales"
        description="Confección de recetas médicas veterinarias oficiales para pacientes registrados y clientes nuevos externos, con membrete oficial, validación SENASA, firma digital matriculada y envío por WhatsApp"
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
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Plantillas Terapéuticas Frecuentes (1-Click Presets):
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
            Carga rápida de diagnóstico y posología estándar
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
          placeholder="Buscar por número de receta, paciente (registrado o externo), tutor, DNI, principio activo o diagnóstico..."
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
                ? 'No hay recetas que coincidan con los filtros de búsqueda aplicados.'
                : 'Aún no se han emitido recetas médicas veterinarias. Haz clic en "Emitir Nueva Receta" o selecciona una plantilla rápida para comenzar.'
            }
            actionLabel="Emitir Primera Receta"
            onAction={() => setIsNewModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrescriptions.map((rx) => {
              const isExt = !!rx.isExternalPatient;
              const pat = isExt ? null : patients.find((p) => p.id === rx.patientId);
              const ow = pat ? owners.find((o) => o.id === pat.ownerId) : null;

              const patientName = isExt ? (rx.patientName || 'Paciente Ambulatorio') : (pat?.name || 'Paciente');
              const patientSpecies = isExt ? (rx.patientSpecies || 'CANINO') : (pat?.species || 'CANINO');
              const patientBreed = isExt ? (rx.patientBreed || 'Mestizo') : (pat?.breed || 'Mestizo');
              const patientWeight = isExt ? (rx.patientWeight || '') : (pat?.weight ? formatWeight(pat.weight) : '');
              const hcDisplay = isExt ? 'Ambulatorio / Externo' : (pat?.clinicalRecordNumber || 'HC-0000');

              const ownerName = isExt ? (rx.ownerName || 'Tutor Externo') : (ow ? `${ow.firstName} ${ow.lastName}` : 'N/A');
              const ownerPhone = isExt ? (rx.ownerPhone || '') : (ow?.phone || ow?.whatsapp || '');
              const ownerDni = isExt ? rx.ownerDni : ow?.dni;

              const typeBadgeClass =
                rx.prescriptionType === 'RECETA_OFICIAL_ARCHIVADA'
                  ? 'bg-rose-50 text-rose-800 border-rose-200 font-bold'
                  : rx.prescriptionType === 'RECETA_ELECTRONICA_SENASA'
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
                        <div className="flex items-center gap-1.5">
                          <span
                            onClick={() => {
                              if (pat) {
                                setSelectedPatientId(pat.id);
                                setActivePatientTab('RECETAS');
                                setActiveView('PACIENTES');
                              }
                            }}
                            className={`font-bold text-slate-900 text-sm ${pat ? 'hover:text-teal-700 cursor-pointer' : ''}`}
                          >
                            {patientName}
                          </span>
                          {isExt && (
                            <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-md">
                              Externo
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          {hcDisplay}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500">
                        {patientSpecies} • {patientBreed} {patientWeight ? '• ' + patientWeight : ''}
                      </p>

                      <p className="text-[11px] text-slate-600">
                        Tutor: <strong>{ownerName}</strong>
                        {ownerDni ? ` (DNI: ${ownerDni})` : ''}
                        {ownerPhone ? ` · Tel: ${ownerPhone}` : ''}
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
                            {item.presentation && (
                              <span className="text-[10px] text-slate-500 font-normal">({item.presentation})</span>
                            )}
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
                      {ownerPhone && (
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
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <span>Confeccionar Receta Médica Oficial</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePrescription} className="space-y-4 text-xs">
              {/* Segmented Control: Paciente Registrado vs Paciente Nuevo / Externo */}
              <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setPatientMode('REGISTERED')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    patientMode === 'REGISTERED'
                      ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <PawPrint className="w-3.5 h-3.5 text-teal-600" />
                  <span>Paciente del Padrón</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPatientMode('EXTERNAL')}
                  className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    patientMode === 'EXTERNAL'
                      ? 'bg-white text-teal-900 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                  <span>+ Paciente / Tutor Nuevo (No Registrado)</span>
                </button>
              </div>

              {/* Mode A: Registered Patient Selector */}
              {patientMode === 'REGISTERED' && (
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="text-slate-700 block font-bold">Seleccionar Paciente de la Clínica:</label>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  >
                    {patients.map((p) => {
                      const ow = owners.find((o) => o.id === p.ownerId);
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.species} • {p.clinicalRecordNumber}) — Tutor: {ow ? `${ow.firstName} ${ow.lastName}` : 'N/A'}
                        </option>
                      );
                    })}
                  </select>

                  {selectedPatientData && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <strong>Tutor:</strong> {selectedOwnerData ? `${selectedOwnerData.firstName} ${selectedOwnerData.lastName}` : 'N/A'}
                        {selectedOwnerData?.dni ? ` · DNI: ${selectedOwnerData.dni}` : ''}
                      </div>
                      <div>
                        <strong>Peso:</strong> {selectedPatientData.weight ? `${selectedPatientData.weight} kg` : 'N/A'} · <strong>Edad:</strong> {selectedPatientData.calculatedAge || 'Adulto'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mode B: External / Walk-in Unregistered Patient Form */}
              {patientMode === 'EXTERNAL' && (
                <div className="space-y-3 bg-teal-50/40 p-4 rounded-2xl border border-teal-200/80">
                  <div className="flex items-center gap-1.5 text-teal-800 font-black text-xs uppercase tracking-wider">
                    <UserPlus className="w-4 h-4 text-teal-600" />
                    <span>Datos del Paciente & Tutor No Registrado</span>
                  </div>

                  {/* Patient Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="text-slate-700 text-[11px] font-bold block mb-1">
                        Nombre del Paciente <span className="text-rose-500">*</span>:
                      </label>
                      <input
                        type="text"
                        value={extPatientName}
                        onChange={(e) => setExtPatientName(e.target.value)}
                        required={patientMode === 'EXTERNAL'}
                        placeholder="Ej: Thor, Luna, Simba..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 text-[11px] font-bold block mb-1">Especie:</label>
                      <select
                        value={extSpecies}
                        onChange={(e) => setExtSpecies(e.target.value as Species)}
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="CANINO">Canino</option>
                        <option value="FELINO">Felino</option>
                        <option value="EQUINO">Equino</option>
                        <option value="BOVINO">Bovino</option>
                        <option value="OVINO">Ovino</option>
                        <option value="CAPRINO">Caprino</option>
                        <option value="PORCINO">Porcino</option>
                        <option value="AVE">Ave</option>
                        <option value="OTRO">Otro / Exótico</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-slate-700 text-[11px] font-bold block mb-1">Raza (Opcional):</label>
                      <input
                        type="text"
                        value={extBreed}
                        onChange={(e) => setExtBreed(e.target.value)}
                        placeholder="Ej: Caniche, Mestizo..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 text-[11px] font-bold block mb-1">Peso (kg aprox):</label>
                      <input
                        type="text"
                        value={extWeight}
                        onChange={(e) => setExtWeight(e.target.value)}
                        placeholder="Ej: 14.5"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="text-slate-700 text-[11px] font-bold block mb-1">Edad (Opcional):</label>
                      <input
                        type="text"
                        value={extAge}
                        onChange={(e) => setExtAge(e.target.value)}
                        placeholder="Ej: 4 años"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Owner Fields */}
                  <div className="border-t border-teal-200/60 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-slate-700 text-[11px] font-bold block mb-1">
                        Nombre y Apellido del Tutor <span className="text-rose-500">*</span>:
                      </label>
                      <input
                        type="text"
                        value={extOwnerName}
                        onChange={(e) => setExtOwnerName(e.target.value)}
                        required={patientMode === 'EXTERNAL'}
                        placeholder="Ej: Carlos Gómez"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 text-[11px] font-bold block mb-1">
                        DNI del Tutor <span className="text-slate-400 font-normal">(Opcional / No obligatorio)</span>:
                      </label>
                      <input
                        type="text"
                        value={extOwnerDni}
                        onChange={(e) => setExtOwnerDni(e.target.value)}
                        placeholder="Ej: 36.133.340"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 text-[11px] font-bold block mb-1">Teléfono / WhatsApp (Opcional):</label>
                      <input
                        type="text"
                        value={extOwnerPhone}
                        onChange={(e) => setExtOwnerPhone(e.target.value)}
                        placeholder="Ej: +54 9 2942 47-7136"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 text-[11px] font-bold block mb-1">Domicilio / Localidad (Opcional):</label>
                      <input
                        type="text"
                        value={extOwnerAddress}
                        onChange={(e) => setExtOwnerAddress(e.target.value)}
                        placeholder="Ej: Las Lajas, Neuquén"
                        className="w-full bg-white border border-slate-200 rounded-xl p-2 text-slate-900 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  {/* Auto-save to system checkbox */}
                  <label className="flex items-center gap-2 cursor-pointer pt-1 text-[11px] font-bold text-slate-700 select-none">
                    <input
                      type="checkbox"
                      checked={autoSaveToSystem}
                      onChange={(e) => setAutoSaveToSystem(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Guardar automáticamente este paciente y tutor en el padrón de la clínica</span>
                  </label>
                </div>
              )}

              {/* Prescription Type & Diagnosis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Diagnóstico Clínico / Motivo:</label>
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    required
                    placeholder="Ej: Gastroenteritis aguda / Tratamiento sintomático..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>
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

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-1">
                        <label className="text-slate-500 text-[10px] uppercase font-bold block">Nombre Comercial:</label>
                        <input
                          type="text"
                          value={item.medicationName}
                          onChange={(e) => handleItemChange(index, 'medicationName', e.target.value)}
                          required
                          placeholder="Ej: Cerenia 16mg"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="text-slate-500 text-[10px] uppercase font-bold block">Principio Activo:</label>
                        <input
                          type="text"
                          value={item.activeIngredient || ''}
                          onChange={(e) => handleItemChange(index, 'activeIngredient', e.target.value)}
                          placeholder="Ej: Maropitant Citrato"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                        />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="text-slate-500 text-[10px] uppercase font-bold block">Presentación:</label>
                        <input
                          type="text"
                          value={item.presentation}
                          onChange={(e) => handleItemChange(index, 'presentation', e.target.value)}
                          placeholder="Ej: Comprimidos, Jarabe..."
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div>
                        <label className="text-slate-500 text-[10px] uppercase font-bold block">Dosis & Vía:</label>
                        <input
                          type="text"
                          value={item.dose}
                          onChange={(e) => handleItemChange(index, 'dose', e.target.value)}
                          required
                          placeholder="Ej: 1 comp cada 24hs Oral"
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
                          placeholder="Ej: Cada 24 horas"
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
                          placeholder="Ej: 3 días"
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="text-slate-500 text-[10px] uppercase font-bold block">Cantidad Envases:</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantityPrescribed || 1}
                          onChange={(e) => handleItemChange(index, 'quantityPrescribed', parseInt(e.target.value, 10) || 1)}
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
                        placeholder="Ej: Administrar con una pequeña porción de comida."
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Observaciones / Notas */}
              <div>
                <label className="text-slate-700 block font-bold mb-1">Observaciones o Advertencias Adicionales (Opcional):</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Recontrol en 7 días si persisten los síntomas..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                />
              </div>

              {/* Action Buttons */}
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
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Firmar & Emitir Receta Oficial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
