import React, { useState } from 'react';
import {
  Syringe,
  Plus,
  Printer,
  Calendar,
  ShieldCheck,
  PawPrint,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  MessageCircle,
  Clock,
  Sparkles,
  QrCode,
  Award,
  FileCheck,
  User,
  ExternalLink,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Check,
  Layers,
  Heart,
  Droplet,
  Info,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { VaccinationRecord, Patient, Species, Sex } from '../types';
import { formatDate, formatWeight } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, SearchInput, StatCard } from './ui';

interface VaccinePreset {
  id: string;
  name: string;
  species: Species;
  categoryLabel: string;
  type: string;
  manufacturer: string;
  durationMonths: number;
  route: string;
  notes: string;
  badgeColor: string;
}

export const VACCINE_PRESETS: VaccinePreset[] = [
  // 🐕 CANINOS
  {
    id: 'can-sextuple',
    name: 'Séxtuple Canina (DHPPI-L)',
    species: 'CANINO',
    categoryLabel: '🐕 Canino',
    type: 'Plan Sanitario Anual / Primovacunación',
    manufacturer: 'Zoetis Vanguard / Nobivac',
    durationMonths: 12,
    route: 'Subcutánea (SC)',
    notes: 'Inmunización contra Parvovirus, Moquillo, Hepatitis, Adenovirus, Parainfluenza y Leptospira.',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    id: 'can-rabia',
    name: 'Antirrábica Canina Oficial (Ley 22.953)',
    species: 'CANINO',
    categoryLabel: '🐕 Canino Obligatoria',
    type: 'Vacunación Obligatoria por Ley Nacional',
    manufacturer: 'Nobivac Rabies / BioCan',
    durationMonths: 12,
    route: 'Subcutánea (SC)',
    notes: 'Inmunización obligatoria anual a partir de los 3 meses de edad. Emisión de certificado oficial.',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  {
    id: 'can-kc',
    name: 'Tos de las Perreras (KC / Bordetella)',
    species: 'CANINO',
    categoryLabel: '🐕 Canino',
    type: 'Complejo Respiratorio Infeccioso Canino',
    manufacturer: 'Nobivac KC / Bronchicine',
    durationMonths: 12,
    route: 'Intranasal (IN) / SC',
    notes: 'Protección contra Bordetella bronchiseptica y Parainfluenza. Ideal para guarderías y paseos.',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'can-puppy',
    name: 'Puppy DP (Parvovirus + Moquillo)',
    species: 'CANINO',
    categoryLabel: '🐕 Cachorros',
    type: 'Primovacunación Temprana (45 días)',
    manufacturer: 'Nobivac Puppy DP / Vanguard',
    durationMonths: 1,
    route: 'Subcutánea (SC)',
    notes: 'Primera dosis de alta concentración antigénica para cachorros destetados.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'can-giardia',
    name: 'GiardiaVax (Giardiasis Canina)',
    species: 'CANINO',
    categoryLabel: '🐕 Canino',
    type: 'Control de Enteroparásitos',
    manufacturer: 'Zoetis GiardiaVax',
    durationMonths: 12,
    route: 'Subcutánea (SC)',
    notes: 'Reduce la excreción de quistes y la severidad de cuadros entéricos por Giardia lamblia.',
    badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    id: 'can-desparasitacion',
    name: 'Desparasitación Interna Total Canina',
    species: 'CANINO',
    categoryLabel: '🐕 Antiparasitario',
    type: 'Plan Antiparasitario Trimestral',
    manufacturer: 'Drontal Plus / Total F / Basken',
    durationMonths: 3,
    route: 'Oral',
    notes: 'Praziquantel + Febantel + Pirantel. Control de nemátodes y céstodes.',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },

  // 🐈 FELINOS
  {
    id: 'fel-triple',
    name: 'Triple Felina Trivalente (RCP)',
    species: 'FELINO',
    categoryLabel: '🐈 Felino',
    type: 'Plan Sanitario Anual Felino',
    manufacturer: 'Felocell 3 / Purevax RCP',
    durationMonths: 12,
    route: 'Subcutánea (SC)',
    notes: 'Inmunización contra Rinotraqueítis, Calicivirus y Panleucopenia felina.',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  {
    id: 'fel-felv',
    name: 'Leucemia Viral Felina (FeLV)',
    species: 'FELINO',
    categoryLabel: '🐈 Felino',
    type: 'Inmunización Retroviral',
    manufacturer: 'Purevax FeLV / Leukocell',
    durationMonths: 12,
    route: 'Subcutánea (SC)',
    notes: 'Recomendada en gatos con salida al exterior tras test serológico previo no reactivo.',
    badgeColor: 'bg-pink-50 text-pink-800 border-pink-200',
  },
  {
    id: 'fel-rabia',
    name: 'Antirrábica Felina Oficial (Ley 22.953)',
    species: 'FELINO',
    categoryLabel: '🐈 Felino Obligatoria',
    type: 'Vacunación Obligatoria Nacional',
    manufacturer: 'Nobivac Rabies / Rabisin',
    durationMonths: 12,
    route: 'Subcutánea (SC)',
    notes: 'Inmunización antirrábica obligatoria anual para gatos.',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  {
    id: 'fel-desparasitacion',
    name: 'Desparasitación Integral Felina Spot-On',
    species: 'FELINO',
    categoryLabel: '🐈 Felino Antiparasitario',
    type: 'Control Endectocida',
    manufacturer: 'Profender / Revolution Plus / Advocate',
    durationMonths: 3,
    route: 'Tópica (Spot-on)',
    notes: 'Control combinado de parásitos internos y externos (pulgas, ácaros, tenias y nematodos).',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },

  // 🐎 ÉQUIDOS
  {
    id: 'eq-tetanos',
    name: 'Toxoide Tetánico Equino (Tétanos)',
    species: 'EQUINO',
    categoryLabel: '🐎 Équidos',
    type: 'Prevención Clostridial Obligatoria',
    manufacturer: 'Biológico Equino / Biogénesis Bagó',
    durationMonths: 12,
    route: 'Intramuscular (IM)',
    notes: 'Inmunización contra Clostridium tetani. Vital en equinos de trabajo, deporte y reproducción.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'eq-influenza',
    name: 'Influenza Equina Bivalente (Gripe)',
    species: 'EQUINO',
    categoryLabel: '🐎 Équidos',
    type: 'Sanidad Operativa / Tránsito',
    manufacturer: 'BioEquus / Boehringer',
    durationMonths: 6,
    route: 'Intramuscular (IM)',
    notes: 'Cepa A/Equi 1 y 2. Refuerzo semestral obligatorio para equinos en actividad deportiva y traslado.',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  {
    id: 'eq-encefalo',
    name: 'Encefalomielitis Equina (Oeste / Este)',
    species: 'EQUINO',
    categoryLabel: '🐎 Équidos (SENASA)',
    type: 'Vacunación Oficial Obligatoria SENASA',
    manufacturer: 'Laboratorio Rosenbusch',
    durationMonths: 12,
    route: 'Intramuscular (IM)',
    notes: 'Obligatoria para movimiento y tránsito interprovincial de equinos.',
    badgeColor: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    id: 'eq-adenitis',
    name: 'Adenitis Equina / Papera (Streptococcus equi)',
    species: 'EQUINO',
    categoryLabel: '🐎 Équidos',
    type: 'Sanidad de Haras y Cabañas',
    manufacturer: 'Biogénesis Bagó',
    durationMonths: 12,
    route: 'Intramuscular (IM)',
    notes: 'Prevención de papera equina y afecciones respiratorias en potrillos y adultos.',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
  },
  {
    id: 'eq-desparasitacion',
    name: 'Desparasitación Équidos (Ivermectina + Praziquantel)',
    species: 'EQUINO',
    categoryLabel: '🐎 Équidos Antiparasitario',
    type: 'Plan Sanitario Estratégico',
    manufacturer: 'Equimax / Bimectin / Zoetis',
    durationMonths: 4,
    route: 'Oral (Pasta)',
    notes: 'Control de grandes y pequeños estróngilos, gasterófilos y tenias.',
    badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    id: 'eq-coggins',
    name: 'Test de Coggins / Certificación Oficial AIE',
    species: 'EQUINO',
    categoryLabel: '🐎 SENASA Oficial',
    type: 'Diagnóstico Serológico Anemia Infecciosa Equina',
    manufacturer: 'Laboratorio de Red Oficial SENASA',
    durationMonths: 6,
    route: 'Diagnóstico Serológico',
    notes: 'Validez legal para tránsito y eventos deportivos según resolución SENASA.',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
  },

  // 🐄 BOVINOS / GRANDES ANIMALES
  {
    id: 'bov-mancha',
    name: 'Vacuna Polivalente Mancha y Gangrena',
    species: 'BOVINO',
    categoryLabel: '🐄 Bovinos',
    type: 'Control Clostridial en Rodeo',
    manufacturer: 'Biogénesis Bagó',
    durationMonths: 12,
    route: 'Subcutánea (SC)',
    notes: 'Inmunización contra Clostridium chauvoei, septicum y novyi.',
    badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'bov-carbuncio',
    name: 'Carbuncio Bacteridiano (Bacillus anthracis)',
    species: 'BOVINO',
    categoryLabel: '🐄 Bovinos (SENASA)',
    type: 'Vacunación Obligatoria de Primavera',
    manufacturer: 'Rosenbusch / Biogénesis',
    durationMonths: 12,
    route: 'Subcutánea (SC)',
    notes: 'Cepa Sterne viva avirulenta. Obligatoria anual para ganado bovino.',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
  },
];

export const VaccinationView: React.FC = () => {
  const {
    vaccinations,
    patients,
    owners,
    addVaccination,
    addPatient,
    addOwner,
    currentUser,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    setQuickModal,
    openWhatsAppHub,
    showToast,
  } = useVet();

  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<string>('TODAS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'VIGENTE' | 'POR_VENCER' | 'VENCIDA'>('TODOS');
  const [selectedCertModal, setSelectedCertModal] = useState<VaccinationRecord | null>(null);

  // New Vaccination Form Modal Dual Mode State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [vacMode, setVacMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [formPatientId, setFormPatientId] = useState(patients[0]?.id || '');
  
  // Biological fields
  const [formVaccineName, setFormVaccineName] = useState('Séxtuple Canina (DHPPI-L)');
  const [formType, setFormType] = useState('Plan Sanitario Anual');
  const [formManufacturer, setFormManufacturer] = useState('Zoetis Vanguard / Nobivac');
  const [formBatchNumber, setFormBatchNumber] = useState('LT-VAC-' + Math.floor(1000 + Math.random() * 9000));
  const [formDurationMonths, setFormDurationMonths] = useState(12);
  const [formRoute, setFormRoute] = useState('Subcutánea (SC)');
  const [formDestination, setFormDestination] = useState('');
  const [formNotes, setFormNotes] = useState('Paciente examinado clínicamente apto para inmunización. Normotérmico y sin signos de enfermedad infecciosa.');

  // New Patient & Owner on-the-fly fields
  const [newPetName, setNewPetName] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState<Species>('CANINO');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetSex, setNewPetSex] = useState<Sex>('MACHO');
  const [newPetWeight, setNewPetWeight] = useState('10');
  const [newOwnerFirstName, setNewOwnerFirstName] = useState('');
  const [newOwnerLastName, setNewOwnerLastName] = useState('');
  const [newOwnerPhone, setNewOwnerPhone] = useState('');
  const [newOwnerDni, setNewOwnerDni] = useState('');

  const today = new Date();

  // Metrics Calculation
  const totalCount = vaccinations.length;
  const upcomingCount = vaccinations.filter((v) => {
    const due = new Date(v.nextDueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 30;
  }).length;

  const expiredCount = vaccinations.filter((v) => {
    const due = new Date(v.nextDueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays < 0;
  }).length;

  const validCount = vaccinations.filter((v) => {
    const due = new Date(v.nextDueDate);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 30;
  }).length;

  // Filter List
  const filteredVaccinations = vaccinations.filter((vac) => {
    const q = (search || '').toLowerCase().trim();
    const patient = patients.find((p) => p.id === vac.patientId);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
    const petName = (patient?.name || '').toLowerCase();
    const hc = (patient?.clinicalRecordNumber || '').toLowerCase();
    const passport = (patient?.equinePassport || '').toLowerCase();
    const chip = (patient?.microchip || '').toLowerCase();
    const vacName = (vac.vaccineName || '').toLowerCase();
    const batch = (vac.batchNumber || '').toLowerCase();
    const tutor = owner ? `${owner.firstName} ${owner.lastName}`.toLowerCase() : '';

    const matchesSearch =
      !q ||
      petName.includes(q) ||
      hc.includes(q) ||
      passport.includes(q) ||
      chip.includes(q) ||
      vacName.includes(q) ||
      batch.includes(q) ||
      tutor.includes(q);

    let matchesSpecies = true;
    if (speciesFilter !== 'TODAS') {
      if (speciesFilter === 'EQUIDOS') {
        matchesSpecies = patient?.species === 'EQUINO' || (patient?.species as any) === 'ASNAL' || (patient?.species as any) === 'MULAR';
      } else if (speciesFilter === 'GRANDES') {
        matchesSpecies = patient?.species === 'EQUINO' || patient?.species === 'BOVINO' || patient?.species === 'OVINO' || patient?.species === 'CAPRINO';
      } else {
        matchesSpecies = patient?.species === speciesFilter;
      }
    }

    let matchesStatus = true;
    if (statusFilter !== 'TODOS') {
      const dueDate = new Date(vac.nextDueDate);
      const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (statusFilter === 'VENCIDA') matchesStatus = diffDays < 0;
      else if (statusFilter === 'POR_VENCER') matchesStatus = diffDays >= 0 && diffDays <= 30;
      else if (statusFilter === 'VIGENTE') matchesStatus = diffDays > 30;
    }

    return matchesSearch && matchesSpecies && matchesStatus;
  });

  const handleApplyPreset = (preset: VaccinePreset) => {
    triggerHaptic('medium');
    setFormVaccineName(preset.name);
    setFormType(preset.type);
    setFormManufacturer(preset.manufacturer);
    setFormDurationMonths(preset.durationMonths);
    setFormRoute(preset.route);
    setFormNotes(preset.notes);
    showToast('info', 'Plantilla Seleccionada', `Biológico: ${preset.name}`);
  };

  const handleSaveVaccination = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    let targetPatientId = formPatientId;
    let registeredPetName = '';

    if (vacMode === 'NEW') {
      if (!newPetName.trim()) {
        showToast('error', 'Nombre Requerido', 'Por favor ingrese el nombre del paciente a vacunar.');
        return;
      }
      if (!newOwnerFirstName.trim() || !newOwnerPhone.trim()) {
        showToast('error', 'Tutor Requerido', 'Por favor ingrese nombre y teléfono del tutor responsable.');
        return;
      }

      const newOwnerId = `own-${Date.now()}`;
      addOwner({
        id: newOwnerId,
        firstName: newOwnerFirstName.trim(),
        lastName: newOwnerLastName.trim() || 'Tutor',
        dni: newOwnerDni.trim() || undefined,
        phone: newOwnerPhone.trim(),
        whatsapp: newOwnerPhone.trim(),
        email: '',
        address: 'Río Cuarto, Córdoba',
        city: 'Río Cuarto',
        province: 'Córdoba',
        postalCode: '5800',
        taxCondition: 'CONSUMIDOR_FINAL',
        balance: 0,
        createdAt: new Date().toISOString(),
      });

      const newHC = `HC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPatId = `pat-${Date.now()}`;
      addPatient({
        id: newPatId,
        name: newPetName.trim(),
        species: newPetSpecies,
        breed: newPetBreed.trim() || 'Mestizo',
        sex: newPetSex,
        reproductiveStatus: 'ENTERO',
        color: 'No especificado',
        birthDate: new Date().toISOString(),
        calculatedAge: 'Adulto',
        weight: Number(newPetWeight) || 10,
        status: 'ACTIVO',
        alerts: [],
        clinicalRecordNumber: newHC,
        ownerId: newOwnerId,
        branchId: 'branch-central',
        createdAt: new Date().toISOString(),
      });

      targetPatientId = newPatId;
      registeredPetName = newPetName.trim();
    } else {
      const foundPat = patients.find((p) => p.id === formPatientId);
      registeredPetName = foundPat?.name || 'el paciente';
    }

    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + Number(formDurationMonths));

    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 2);

    addVaccination({
      patientId: targetPatientId,
      vaccineName: formVaccineName,
      type: formType,
      manufacturer: formManufacturer,
      batchNumber: formBatchNumber,
      expirationDate: expDate.toISOString().split('T')[0],
      administeredDate: new Date().toISOString().split('T')[0],
      administeredBy: currentUser?.name || 'Dr. Diego Irusta',
      vetLicense: 'MP 8412',
      nextDueDate: nextDate.toISOString().split('T')[0],
      certificateGenerated: true,
      notes: `${formNotes} [Vía: ${formRoute}]${formDestination ? ` [Destino: ${formDestination}]` : ''}`,
    });

    setIsNewModalOpen(false);
    showToast(
      'success',
      'Inmunización Registrada',
      `Vacunación de ${registeredPetName} asentada con éxito. Próximo refuerzo: ${formatDate(nextDate.toISOString().split('T')[0])}`
    );

    // Reset fields
    setNewPetName('');
    setNewPetBreed('');
    setNewOwnerFirstName('');
    setNewOwnerLastName('');
    setNewOwnerPhone('');
    setNewOwnerDni('');
  };

  const handleSendWhatsApp = (vac: VaccinationRecord) => {
    triggerHaptic('light');
    const patient = patients.find((p) => p.id === vac.patientId);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
    if (!owner) return;

    openWhatsAppHub({
      patientId: patient?.id,
      ownerId: owner.id,
      patientName: patient?.name || 'su mascota',
      ownerName: `${owner.firstName} ${owner.lastName}`,
      ownerPhone: owner.whatsapp || owner.phone || '',
      type: 'VACUNA',
      details: {
        vaccineName: vac.vaccineName,
        dueDate: formatDate(vac.nextDueDate),
        vetName: vac.administeredBy || 'Dr. Diego Irusta',
      },
    });
  };

  return (
    <div className="space-y-6 pb-12 w-full max-w-full">
      {/* Header */}
      <PageHeader
        category="Sanidad, Inmunizaciones & Prevención"
        title="Plan de Vacunación & Libreta Sanitaria"
        description="Gestión integral de biológicos, calendarios de revacunación, certificados oficiales y recordatorios automáticos por WhatsApp"
        icon={Syringe}
        actions={[
          {
            label: '+ Registrar Inmunización',
            icon: Plus,
            onClick: () => {
              triggerHaptic('medium');
              setIsNewModalOpen(true);
            },
            variant: 'primary',
          },
        ]}
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Aplicaciones"
          value={totalCount}
          subtitle="En historial clínico"
          icon={Syringe}
          color="teal"
        />
        <StatCard
          label="Inmunidad Vigente"
          value={validCount}
          subtitle="Al día y protegidos"
          icon={ShieldCheck}
          color="emerald"
        />
        <StatCard
          label="Por Vencer (30 días)"
          value={upcomingCount}
          subtitle="Avisar a tutores"
          icon={Clock}
          color="amber"
        />
        <StatCard
          label="Revacunación Urgente"
          value={expiredCount}
          subtitle="Plan vencido"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      {/* Plantillas Rápidas de Vacunación (1-Click Presets) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Plantillas Rápidas de Inmunización por Especie (1-Click)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
            Click para pre-cargar datos y registrar
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {VACCINE_PRESETS.slice(0, 12).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                handleApplyPreset(preset);
                setIsNewModalOpen(true);
              }}
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-300 text-left transition-all group flex flex-col justify-between shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
            >
              <div>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 block w-max mb-1">
                  {preset.categoryLabel}
                </span>
                <p className="text-xs font-bold text-slate-800 group-hover:text-teal-900 line-clamp-2 leading-tight">
                  {preset.name}
                </p>
              </div>
              <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Refuerzo: {preset.durationMonths}m</span>
                <span className="text-teal-600 font-bold group-hover:translate-x-0.5 transition-transform">+</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white border border-slate-200 p-3 sm:p-4 rounded-3xl shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full flex-1">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por paciente, HC, tutor, vacuna, lote o chip..."
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <select
              value={speciesFilter}
              onChange={(e) => setSpeciesFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="TODAS">🐾 Todas las Especies</option>
              <option value="CANINO">🐕 Caninos</option>
              <option value="FELINO">🐈 Felinos</option>
              <option value="EQUINO">🐎 Équidos (Caballos)</option>
              <option value="BOVINO">🐄 Bovinos</option>
              <option value="GRANDES">🐎🐄 Grandes Animales</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="TODOS">📋 Todos los Estados</option>
              <option value="VIGENTE">🟢 Vigentes (&gt; 30d)</option>
              <option value="POR_VENCER">⏳ Por Vencer (&lt; 30d)</option>
              <option value="VENCIDA">🚨 Vencidas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista / Grilla de Registros de Inmunización */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              Registros de Inmunización & Calendario Sanitario ({filteredVaccinations.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">Veterinaria Irusta</span>
        </div>

        {filteredVaccinations.length === 0 ? (
          <EmptyState
            icon={Syringe}
            title="No se encontraron registros de vacunación"
            description="Utilice las plantillas rápidas o el botón superior para registrar la primera aplicación de biológico."
            actionLabel="+ Registrar Inmunización"
            onAction={() => setIsNewModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVaccinations.map((vac) => {
              const patient = patients.find((p) => p.id === vac.patientId);
              const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;
              const dueDate = new Date(vac.nextDueDate);
              const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

              let statusBadge = {
                label: `Vigente (${diffDays}d)`,
                bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                dot: 'bg-emerald-500',
              };

              if (diffDays < 0) {
                statusBadge = {
                  label: `Vencida (${Math.abs(diffDays)}d)`,
                  bg: 'bg-rose-50 text-rose-800 border-rose-200 font-black',
                  dot: 'bg-rose-500 animate-ping',
                };
              } else if (diffDays <= 30) {
                statusBadge = {
                  label: `Por vencer (${diffDays}d)`,
                  bg: 'bg-amber-50 text-amber-800 border-amber-200 font-bold',
                  dot: 'bg-amber-500',
                };
              }

              return (
                <div
                  key={vac.id}
                  className="bg-slate-50/70 border border-slate-200/90 hover:border-teal-400 rounded-3xl p-4 sm:p-5 space-y-3 transition-all hover:shadow-md flex flex-col justify-between group"
                >
                  <div className="space-y-2.5">
                    {/* Header Card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-black text-teal-700 shadow-2xs">
                          {patient?.species === 'CANINO' ? '🐕' : patient?.species === 'FELINO' ? '🐈' : patient?.species === 'EQUINO' ? '🐎' : '🐾'}
                        </div>
                        <div>
                          <h4
                            onClick={() => {
                              if (patient) {
                                triggerHaptic('light');
                                setSelectedPatientId(patient.id);
                                setActivePatientTab('HISTORIA');
                                setActiveView('PACIENTES');
                              }
                            }}
                            className="text-sm font-black text-slate-900 hover:text-teal-700 cursor-pointer flex items-center gap-1"
                          >
                            <span>{patient?.name || 'Paciente'}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">
                              ({patient?.clinicalRecordNumber})
                            </span>
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {patient?.species} • {patient?.breed} • Tutor: <strong className="text-slate-700">{owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'}</strong>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-xl border flex items-center gap-1.5 font-bold ${statusBadge.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Vaccine Info */}
                    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 space-y-1 text-xs shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-xs">{vac.vaccineName}</span>
                        <span className="text-[10px] text-teal-700 font-mono font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          {vac.batchNumber}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Fab: <strong>{vac.manufacturer}</strong> • {vac.type || 'Plan Sanitario'}
                      </p>
                    </div>

                    {/* Dates & Vet in Charge */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-100/70 p-2.5 rounded-2xl border border-slate-200/60">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Aplicación:</span>
                        <strong className="text-slate-800">{formatDate(vac.administeredDate)}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Próximo Refuerzo:</span>
                        <strong className="text-teal-900">{formatDate(vac.nextDueDate)}</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-600 flex items-center justify-between px-1">
                      <span>Prof: <strong>{vac.administeredBy || 'Dr. Diego Irusta'}</strong> ({vac.vetLicense || 'MP 8412'})</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSendWhatsApp(vac)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                      title="Enviar recordatorio y constancia de vacunación por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('medium');
                        setSelectedCertModal(vac);
                      }}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-teal-600" />
                      <span>Certificado</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Modal Registrar Inmunización (Dual Mode: Registrado/Internado vs Nuevo Paciente) */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                  <Syringe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Registrar Aplicación de Biológico</h3>
                  <p className="text-xs text-slate-500">Plan sanitario para paciente registrado, internado o nuevo ingreso</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVaccination} className="space-y-4 text-xs">
              {/* SELECTOR DUAL DE MODO */}
              <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setVacMode('EXISTING');
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    vacMode === 'EXISTING'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>👥 Paciente Registrado / Internado</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setVacMode('NEW');
                  }}
                  className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    vacMode === 'NEW'
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>✍️ + Paciente Nuevo (Solo Vacunación)</span>
                </button>
              </div>

              {/* SECCIÓN 1: SELECCIÓN O CARGA DE PACIENTE */}
              {vacMode === 'EXISTING' ? (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <label className="text-slate-800 block font-bold">Seleccionar Paciente de la Clínica / Internado *</label>
                  <select
                    value={formPatientId}
                    onChange={(e) => setFormPatientId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-3 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 shadow-2xs text-xs"
                  >
                    {patients.map((p) => {
                      const own = owners.find((o) => o.id === p.ownerId);
                      const isInterned = p.status === 'INTERNADO';
                      return (
                        <option key={p.id} value={p.id}>
                          {isInterned ? '🏥 [INTERNADO] ' : '🟢 '}
                          {p.name} ({p.species} • {p.breed}) — Tutor: {own ? `${own.firstName} ${own.lastName}` : 'N/A'} ({p.clinicalRecordNumber})
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : (
                <div className="space-y-3 bg-amber-50/40 p-4 rounded-2xl border border-amber-200">
                  <div className="flex items-center gap-1.5 border-b border-amber-200/60 pb-1.5 text-amber-950 font-black uppercase text-[11px] tracking-wide">
                    <span>🐾</span>
                    <span>1. Datos del Nuevo Paciente</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Nombre de la Mascota / Animal: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={vacMode === 'NEW'}
                        value={newPetName}
                        onChange={(e) => setNewPetName(e.target.value)}
                        placeholder="ej: Rocky, Luna, Manchita..."
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Especie:</label>
                      <select
                        value={newPetSpecies}
                        onChange={(e) => setNewPetSpecies(e.target.value as Species)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 shadow-2xs"
                      >
                        <option value="CANINO">🐕 Canino (Perro)</option>
                        <option value="FELINO">🐈 Felino (Gato)</option>
                        <option value="EQUINO">🐎 Equino (Caballo / Mula)</option>
                        <option value="BOVINO">🐄 Bovino (Vaca / Toro)</option>
                        <option value="EXOTICO">🦜 Exótico / Otro</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Raza:</label>
                      <input
                        type="text"
                        value={newPetBreed}
                        onChange={(e) => setNewPetBreed(e.target.value)}
                        placeholder="ej: Mestizo, Caniche, Criollo..."
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Sexo:</label>
                      <select
                        value={newPetSex}
                        onChange={(e) => setNewPetSex(e.target.value as Sex)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 shadow-2xs"
                      >
                        <option value="MACHO">Macho</option>
                        <option value="HEMBRA">Hembra</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Peso (kg):</label>
                      <input
                        type="number"
                        step="0.1"
                        value={newPetWeight}
                        onChange={(e) => setNewPetWeight(e.target.value)}
                        placeholder="10.5"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 border-b border-amber-200/60 pb-1.5 pt-2 text-amber-950 font-black uppercase text-[11px] tracking-wide">
                    <span>👤</span>
                    <span>2. Datos del Tutor Responsable</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Nombre del Tutor: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={vacMode === 'NEW'}
                        value={newOwnerFirstName}
                        onChange={(e) => setNewOwnerFirstName(e.target.value)}
                        placeholder="ej: Juan"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Apellido:</label>
                      <input
                        type="text"
                        value={newOwnerLastName}
                        onChange={(e) => setNewOwnerLastName(e.target.value)}
                        placeholder="ej: Pérez"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Teléfono / WhatsApp de Contacto: <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required={vacMode === 'NEW'}
                        value={newOwnerPhone}
                        onChange={(e) => setNewOwnerPhone(e.target.value)}
                        placeholder="ej: +54 9 358 4123456"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">DNI (Opcional):</label>
                      <input
                        type="text"
                        value={newOwnerDni}
                        onChange={(e) => setNewOwnerDni(e.target.value)}
                        placeholder="ej: 38.450.912"
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono text-slate-900 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECCIÓN BIOLÓGICO */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1.5 text-slate-900 font-black uppercase text-[11px] tracking-wide">
                  <span>💉</span>
                  <span>Datos del Biológico / Vacuna</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block font-bold mb-1">Nombre del Biológico / Vacuna: *</label>
                    <input
                      type="text"
                      value={formVaccineName}
                      onChange={(e) => setFormVaccineName(e.target.value)}
                      required
                      placeholder="Ej: Séxtuple Canina, Antirrábica, Tétanos..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block font-bold mb-1">Tipo de Plan Sanitario:</label>
                    <input
                      type="text"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      placeholder="Ej: Plan Anual, Cachorro, Campaña Oficial..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block font-bold mb-1">Laboratorio Fabricante: *</label>
                    <input
                      type="text"
                      value={formManufacturer}
                      onChange={(e) => setFormManufacturer(e.target.value)}
                      required
                      placeholder="Ej: Zoetis, Nobivac, Biogénesis Bagó..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-medium text-slate-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-slate-700 block font-bold mb-1">Número de Lote: *</label>
                    <input
                      type="text"
                      value={formBatchNumber}
                      onChange={(e) => setFormBatchNumber(e.target.value)}
                      required
                      placeholder="Ej: LT-8841-A"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-700 block font-bold mb-1">Vía de Aplicación:</label>
                    <select
                      value={formRoute}
                      onChange={(e) => setFormRoute(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 shadow-2xs"
                    >
                      <option value="Subcutánea (SC)">Subcutánea (SC)</option>
                      <option value="Intramuscular (IM)">Intramuscular (IM)</option>
                      <option value="Intranasal (IN)">Intranasal (IN)</option>
                      <option value="Oral">Oral (Pastas / Comprimidos)</option>
                      <option value="Tópica (Spot-on)">Tópica (Spot-on / Pipeta)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-700 block font-bold mb-1">Período de Refuerzo (Meses):</label>
                    <select
                      value={formDurationMonths}
                      onChange={(e) => setFormDurationMonths(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-teal-900 shadow-2xs"
                    >
                      <option value={1}>1 Mes (Refuerzo Cachorro / Primovacunación)</option>
                      <option value={3}>3 Meses (Desparasitación Trimestral)</option>
                      <option value={4}>4 Meses (Desparasitación Équidos)</option>
                      <option value={6}>6 Meses (Influenza Equina / AIE Coggins)</option>
                      <option value={12}>12 Meses / 1 Año (Séxtuple, Antirrábica, Tétanos)</option>
                      <option value={24}>24 Meses / 2 Años</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Observaciones Clínicas / Tolerancia:</label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Observaciones de la aplicación..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  <span>Guardar & Emitir Certificado</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Modal Certificado Oficial de Vacunación & Libreta Digital */}
      {selectedCertModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-black text-slate-900">Libreta Sanitaria & Certificado</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCertModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3 text-xs text-slate-800">
              <div className="text-center pb-2 border-b border-slate-200">
                <span className="font-extrabold text-teal-800 uppercase tracking-widest text-[11px] block">
                  VETERINARIA IRUSTA — CENTRO HOSPITALARIO VETERINARIO
                </span>
                <h4 className="font-black text-slate-900 text-sm mt-0.5">
                  CERTIFICADO OFICIAL DE INMUNIZACIÓN & SANIDAD
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">Río Cuarto, Córdoba • Tel: +54 9 2942 47-7136</p>
              </div>

              {(() => {
                const patient = patients.find((p) => p.id === selectedCertModal.patientId);
                const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;

                return (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-2xl border border-slate-200/80">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Paciente:</span>
                        <strong className="text-slate-900 text-sm">{patient?.name || 'Mascota'}</strong>
                        <span className="text-[11px] text-slate-500 block">
                          {patient?.species} • {patient?.breed} ({patient?.sex})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">Historia Clínica:</span>
                        <span className="font-mono font-bold text-teal-800 block text-xs">{patient?.clinicalRecordNumber}</span>
                        <span className="text-[11px] text-slate-500 block">Peso: {patient?.weight ? `${patient.weight} kg` : 'N/A'}</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-200/80">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Tutor Responsable:</span>
                      <strong className="text-slate-800">{owner ? `${owner.firstName} ${owner.lastName}` : 'N/A'}</strong>
                      <span className="text-[11px] text-slate-500 block">
                        Tel: {owner?.phone || owner?.whatsapp || 'N/A'} {owner?.dni ? `• DNI: ${owner.dni}` : ''}
                      </span>
                    </div>

                    <div className="bg-teal-50/70 p-3.5 rounded-2xl border border-teal-200 space-y-1.5">
                      <span className="text-[10px] font-bold text-teal-900 uppercase block">Biológico Aplicado:</span>
                      <p className="text-sm font-black text-teal-950">{selectedCertModal.vaccineName}</p>
                      <p className="text-[11px] text-teal-800">
                        Lote: <strong>{selectedCertModal.batchNumber}</strong> • Fab: {selectedCertModal.manufacturer}
                      </p>
                      <div className="flex justify-between pt-1.5 border-t border-teal-200/80 text-[11px]">
                        <span>Aplicación: <strong>{formatDate(selectedCertModal.administeredDate)}</strong></span>
                        <span className="text-teal-900">Próximo Refuerzo: <strong>{formatDate(selectedCertModal.nextDueDate)}</strong></span>
                      </div>
                    </div>

                    {selectedCertModal.notes && (
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                        <span className="font-bold text-slate-400 text-[10px] block">Observaciones:</span>
                        <p>{selectedCertModal.notes}</p>
                      </div>
                    )}

                    <div className="pt-2 text-center text-[11px] text-slate-600 border-t border-slate-200">
                      <p className="font-black text-slate-900">{selectedCertModal.administeredBy || 'Dr. Diego Irusta'}</p>
                      <p className="font-mono text-slate-500">Médico Veterinario • Matrícula: {selectedCertModal.vetLicense || 'MP 8412'}</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Certificado</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCertModal(null)}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
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
