import { formatDate } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
// Age calculation helper functions
function computeAgeFromBirthDate(birthDateStr: string): string {
  if (!birthDateStr) return 'Desconocida';
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return 'Desconocida';
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
    years--;
    months += 12;
  }
  if (years <= 0) {
    return months <= 1 ? '1 mes' : `${months} meses`;
  }
  if (months === 0) {
    return years === 1 ? '1 año' : `${years} años`;
  }
  return years === 1 ? `1 año y ${months} meses` : `${years} años y ${months} meses`;
}

function computeBirthDateFromAge(val: number, unit: 'AÑOS' | 'MESES'): string {
  const d = new Date();
  if (unit === 'AÑOS') {
    d.setFullYear(d.getFullYear() - (val || 0));
  } else {
    d.setMonth(d.getMonth() - (val || 0));
  }
  return d.toISOString().split('T')[0];
}

import React, { useState, useEffect } from 'react';
import { processImageFile } from '../utils/imageUploadHelper';
import {
  X,
  PawPrint,
  Users,
  Camera,
  Upload,
  Calendar,
  Clock,
  Stethoscope,
  BedDouble,
  Scissors,
  FlaskConical,
  Scan,
  Syringe,
  Boxes,
  Receipt,
  FileText,
  Heart,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import { hasQuickActionPermission } from '../utils/rbac';
import { Species, Sex, Product } from '../types';

export const QuickModals: React.FC = () => {
  const {
    currentUser,
    quickModal,
    setQuickModal,
    patients,
    owners,
    users,
    products,
    addPatient,
    addOwner,
    addAppointment,
    addTriageEntry,
    addConsultation,
    admitPatientToHospital,
    addHourlySheetEntry,
    addVitalSigns,
    addLabOrder,
    addImagingStudy,
    addVaccination,
    addProduct,
    createInvoice,
    createEstimate,
    addDocument,
    addSurgery,
    setSelectedPatientId,
    setActivePatientTab,
    setActiveView,
    activeBranch,
    openWhatsAppHub,
    showToast,
  } = useVet();

  // Patient Form State
  const [patName, setPatName] = useState('');
  const [patSpecies, setPatSpecies] = useState<string>('Canino');
  const [patBreed, setPatBreed] = useState('');
  const [patSex, setPatSex] = useState<'Macho' | 'Hembra'>('Macho');
  const [patRepro, setPatRepro] = useState<'Entero' | 'Castrado'>('Entero');
  const [patAgeMode, setPatAgeMode] = useState<'EDAD' | 'FECHA'>('EDAD');
  const [patAgeValue, setPatAgeValue] = useState<string>('2');
  const [patAgeUnit, setPatAgeUnit] = useState<'AÑOS' | 'MESES'>('AÑOS');
  const [patBirth, setPatBirth] = useState(() => computeBirthDateFromAge(2, 'AÑOS'));
  const [patWeight, setPatWeight] = useState<number | string>(10);
  const [patColor, setPatColor] = useState('');
  const [patMicrochip, setPatMicrochip] = useState('');
  const [patOwnerId, setPatOwnerId] = useState(owners[0]?.id || '');
  const [patAlert, setPatAlert] = useState('');
  const [patPhotoUrl, setPatPhotoUrl] = useState('');
  
  // Destination & Immediate Care Action State
  const [patActionDestination, setPatActionDestination] = useState<
    'ATENCION_360' | 'TRIAGE' | 'SOLO_REGISTRAR'
  >('ATENCION_360');

  // Owner Form State inside Patient Registration (Manual owner creation)
  const [patOwnerMode, setPatOwnerMode] = useState<'MANUAL' | 'EXISTING'>('MANUAL');
  const [patOwnerFirstName, setPatOwnerFirstName] = useState('');
  const [patOwnerLastName, setPatOwnerLastName] = useState('');
  const [patOwnerPhone, setPatOwnerPhone] = useState('');
  const [patOwnerDni, setPatOwnerDni] = useState('');
  const [patOwnerEmail, setPatOwnerEmail] = useState('');

  // Owner Form State
  const [ownFirst, setOwnFirst] = useState('');
  const [ownLast, setOwnLast] = useState('');
  const [ownDni, setOwnDni] = useState('');
  const [ownPhone, setOwnPhone] = useState('');
  const [ownEmail, setOwnEmail] = useState('');
  const [ownAddress, setOwnAddress] = useState('');

  // Appointment Form State (Dual Mode: Existing vs New Patient/Owner)
  const [aptMode, setAptMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [aptPatId, setAptPatId] = useState(patients[0]?.id || '');
  const [aptNewPetName, setAptNewPetName] = useState('');
  const [aptNewPetSpecies, setAptNewPetSpecies] = useState('Canino');
  const [aptNewPetBreed, setAptNewPetBreed] = useState('');
  const [aptNewOwnerFirstName, setAptNewOwnerFirstName] = useState('');
  const [aptNewOwnerLastName, setAptNewOwnerLastName] = useState('');
  const [aptNewOwnerPhone, setAptNewOwnerPhone] = useState('');
  const [aptNewOwnerDni, setAptNewOwnerDni] = useState('');
  const [aptDate, setAptDate] = useState(new Date().toISOString().split('T')[0]);
  const [aptTime, setAptTime] = useState('10:00');
  const [aptDuration, setAptDuration] = useState<number>(30);
  const [aptReason, setAptReason] = useState('Consulta clínica general');
  const [aptType, setAptType] = useState<any>('CONSULTA');
  const [aptVetId, setAptVetId] = useState(users.find((u) => u.name?.includes('Irusta'))?.id || users[0]?.id || 'usr-1');
  const [aptSendWhatsApp, setAptSendWhatsApp] = useState(false);

  // Triage Form State
  const [triPatId, setTriPatId] = useState(patients[0]?.id || '');
  const [triComplaint, setTriComplaint] = useState('');
  const [triPriority, setTriPriority] = useState<any>('NORMAL');

  // Consultation SOAP Wizard State
  const [consPatId, setConsPatId] = useState(patients[0]?.id || '');
  const [consReason, setConsReason] = useState('Control clínico');
  const [consAnamnesis, setConsAnamnesis] = useState('');
  const [soapS, setSoapS] = useState('');
  const [soapO, setSoapO] = useState('');
  const [soapA, setSoapA] = useState('');
  const [soapP, setSoapP] = useState('');
  const [consTemp, setConsTemp] = useState<number>(38.5);
  const [consFC, setConsFC] = useState<number>(100);
  const [consFR, setConsFR] = useState<number>(24);
  const [consMedName, setConsMedName] = useState('');
  const [consMedDose, setConsMedDose] = useState('');
  const [consReqHosp, setConsReqHosp] = useState(false);
  const [aiSoapLoading, setAiSoapLoading] = useState(false);

  // Hospitalization Admit State
  const [hospPatId, setHospPatId] = useState(patients[0]?.id || '');
  const [hospSector, setHospSector] = useState<any>('UCI_CRITICOS');
  const [hospKennel, setHospKennel] = useState('CANIL-01');
  const [hospDiag, setHospDiag] = useState('');
  const [hospPriority, setHospPriority] = useState<any>('PRIORITARIO');
  const [hospFluidRate, setHospFluidRate] = useState(40);
  const [hospFluidType, setHospFluidType] = useState('Ringer Lactato');

  // Surgery Form State
  const [surgPatId, setSurgPatId] = useState(patients[0]?.id || '');
  const [surgProcName, setSurgProcName] = useState('Osteosíntesis de fémur con placa LCP');
  const [surgSurgeon, setSurgSurgeon] = useState(users[0]?.name || 'Dr. Diego Iván Irusta');
  const [surgAnesthetist, setSurgAnesthetist] = useState('Dra. Sofía Albarracín');
  const [surgDate, setSurgDate] = useState(new Date().toISOString().split('T')[0]);
  const [surgStartTime, setSurgStartTime] = useState('11:00');
  const [surgDuration, setSurgDuration] = useState(90);
  const [surgAsa, setSurgAsa] = useState<'ASA_I' | 'ASA_II' | 'ASA_III' | 'ASA_IV' | 'ASA_V'>('ASA_II');
  const [surgPreOp, setSurgPreOp] = useState('Ayuno 8 hs sólidos, 2 hs líquidos. ECG y coagulación sin particularidades.');
  const [surgInduction, setSurgInduction] = useState('Propofol 4 mg/kg IV + Midazolam 0.2 mg/kg IV');
  const [surgMaintenance, setSurgMaintenance] = useState('Isoflurano 1.8% en O2 al 100% con ventilación asistida');
  const [surgAnalgesia, setSurgAnalgesia] = useState('Fentanilo CRI 5 mcg/kg/h + Meloxicam 0.2 mg/kg SC');
  const [surgTechnique, setSurgTechnique] = useState('Abordaje cráneo-lateral de fémur, reducción anatómica y colocación de placa 3.5');
  const [surgPostOp, setSurgPostOp] = useState('Reposo estricto 30 días, antibióticoterapia Cefalexina 30 mg/kg c/12hs x 10 días, control radiológico a las 4 semanas.');

  // Lab Order State
  const [labPatId, setLabPatId] = useState(patients[0]?.id || '');
  const [labType, setLabType] = useState<any>('HEMOGRAMA_COMPLETO');

  // Imaging State
  const [imgPatId, setImgPatId] = useState(patients[0]?.id || '');
  const [imgModality, setImgModality] = useState<any>('RADIOGRAFIA');
  const [imgRegion, setImgRegion] = useState('Tórax L/L y V/D');
  const [imgFindings, setImgFindings] = useState('');

  // Vaccination State
  const [vacMode, setVacMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [vacPatId, setVacPatId] = useState(patients[0]?.id || '');
  const [vacName, setVacName] = useState('Séxtuple Canina');
  const [vacBatch, setVacBatch] = useState('LOT-2026-X8');
  const [vacExp, setVacExp] = useState('2027-06-30');
  const [vacNext, setVacNext] = useState('2027-08-18');
  
  // New patient and owner for quick vaccine
  const [vacNewPetName, setVacNewPetName] = useState('');
  const [vacNewPetSpecies, setVacNewPetSpecies] = useState<Species>('CANINO');
  const [vacNewPetBreed, setVacNewPetBreed] = useState('');
  const [vacNewPetSex, setVacNewPetSex] = useState<Sex>('MACHO');
  const [vacNewPetWeight, setVacNewPetWeight] = useState('10');
  const [vacNewOwnerFirstName, setVacNewOwnerFirstName] = useState('');
  const [vacNewOwnerLastName, setVacNewOwnerLastName] = useState('');
  const [vacNewOwnerPhone, setVacNewOwnerPhone] = useState('');
  const [vacNewOwnerDni, setVacNewOwnerDni] = useState('');

  // Product State
  const [prodName, setProdName] = useState('');
  const [prodIngr, setProdIngr] = useState('');
  const [prodCode, setProdCode] = useState('');
  const [prodStock, setProdStock] = useState(20);
  const [prodPrice, setProdPrice] = useState(5000);
  const [prodCategory, setProdCategory] = useState<any>('FARMACO');

  // Invoice AFIP State
  const [invCustName, setInvCustName] = useState('');
  const [invCustDni, setInvCustDni] = useState('');
  const [invType, setInvType] = useState<'FACTURA_B' | 'FACTURA_A' | 'FACTURA_C' | 'RECIBO_X'>('FACTURA_B');
  const [invItemDesc, setInvItemDesc] = useState('Consulta clínica veterinaria diurna');
  const [invItemAmount, setInvItemAmount] = useState<number>(15000);
  const [invPayMethod, setInvPayMethod] = useState<any>('TARJETA_DEBITO');

  // Estimate State
  const [estPatId, setEstPatId] = useState(patients[0]?.id || '');
  const [estDesc, setEstDesc] = useState('Procedimiento quirúrgico y anestesia inhalatoria');
  const [estAmount, setEstAmount] = useState<number>(85000);
  const [estNotes, setEstNotes] = useState('Incluye honorarios quirúrgicos, monitorización multiparamétrica y medicación posoperatoria');

  // Document State
  const [docPatId, setDocPatId] = useState(patients[0]?.id || '');

  // Sincronización reactiva de selectores cuando los pacientes cargan desde Supabase
  useEffect(() => {
    if (patients.length > 0) {
      const firstId = patients[0].id;
      if (!aptPatId || !patients.some((p) => p.id === aptPatId)) setAptPatId(firstId);
      if (!triPatId || !patients.some((p) => p.id === triPatId)) setTriPatId(firstId);
      if (!consPatId || !patients.some((p) => p.id === consPatId)) setConsPatId(firstId);
      if (!hospPatId || !patients.some((p) => p.id === hospPatId)) setHospPatId(firstId);
      if (!surgPatId || !patients.some((p) => p.id === surgPatId)) setSurgPatId(firstId);
      if (!labPatId || !patients.some((p) => p.id === labPatId)) setLabPatId(firstId);
      if (!imgPatId || !patients.some((p) => p.id === imgPatId)) setImgPatId(firstId);
      if (!vacPatId || !patients.some((p) => p.id === vacPatId)) setVacPatId(firstId);
      if (!estPatId || !patients.some((p) => p.id === estPatId)) setEstPatId(firstId);
      if (!docPatId || !patients.some((p) => p.id === docPatId)) setDocPatId(firstId);
    }
  }, [patients]);
  const [docType, setDocType] = useState<'ANESTESIA' | 'CIRUGIA' | 'INTERNACION' | 'EUTANASIA'>('ANESTESIA');
  const [docTitle, setDocTitle] = useState('Consentimiento Informado para Procedimiento Anestésico');
  const [docContent, setDocContent] = useState(
    'Por la presente autorizo al equipo médico veterinario a realizar los procedimientos diagnósticos, anestésicos y quirúrgicos necesarios. He sido informado de los riesgos inherentes.'
  );

  if (!quickModal) return null;

  // Preset 1-Click "Examen Físico Normal"
  const applyNormalPhysicalExam = () => {
    setSoapO(
      'Estado general: Alerta y reactivo. Mucosas: Rosadas y húmedas. TLLC: < 2 seg. Ganglios linfáticos: Normales y simétricos sin linfadenomegalia. Auscultación cardiopulmonar: Ritmo sinusal regular sin soplos, campos pulmonares limpios sin rales ni estridor. Palpación abdominal: Blando, depresible, indoloro, sin organomegalias. Hidratación: 100% (pliegue cutáneo normal).'
    );
    setConsTemp(38.5);
    setConsFC(110);
    setConsFR(22);
  };

  // AI SOAP Assistant inside Consultation modal
  const handleAiSoapGenerate = () => {
    setSoapS(consAnamnesis || `Paciente ingresa a consulta por ${consReason || 'control clínico'}.`);
    setSoapO(`Constantes: T° ${consTemp}°C, FC ${consFC} lpm, FR ${consFR} rpm. Examen general sin particularidades.`);
    setSoapA(`Evaluación clínica orientada por motivo: ${consReason}. Diagnóstico presuntivo en curso.`);
    setSoapP(`Plan terapéutico: ${consMedName ? `${consMedName} (${consMedDose})` : 'Monitoreo ambulatorio y control evolutivo'}.`);
  };

  // Handlers
  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    let ownerIdToUse = patOwnerId;

    // Si está en modo manual o si no hay tutores previos registrados
    if (patOwnerMode === 'MANUAL' || owners.length === 0 || !ownerIdToUse) {
      if (!patOwnerFirstName.trim() || !patOwnerLastName.trim()) {
        showToast('error', 'Faltan Datos del Propietario', 'Debe ingresar el nombre y apellido del propietario.');
        return;
      }
      if (!patOwnerPhone.trim()) {
        showToast('error', 'Falta Teléfono de Contacto', 'Debe ingresar el teléfono para poder comunicarle las novedades y evolución clínica.');
        return;
      }

      const createdOwner = addOwner({
        firstName: patOwnerFirstName.trim(),
        lastName: patOwnerLastName.trim(),
        dni: patOwnerDni.trim() || 'S/D',
        phone: patOwnerPhone.trim(),
        whatsapp: patOwnerPhone.trim(),
        email: patOwnerEmail.trim() || `${patOwnerFirstName.toLowerCase().replace(/\s+/g, '')}@veterinariairusta.com`,
        address: 'Río Cuarto, Córdoba',
        city: 'Río Cuarto',
      });
      ownerIdToUse = createdOwner.id;
    }

    const calculatedAgeStr = patAgeMode === 'EDAD'
      ? `${patAgeValue || '1'} ${patAgeUnit === 'AÑOS' ? (Number(patAgeValue) === 1 ? 'año' : 'años') : (Number(patAgeValue) === 1 ? 'mes' : 'meses')}`
      : computeAgeFromBirthDate(patBirth);

    const birthDateToSave = patAgeMode === 'EDAD'
      ? computeBirthDateFromAge(Number(patAgeValue) || 1, patAgeUnit)
      : (patBirth || new Date().toISOString().split('T')[0]);

    const created = addPatient({
      name: patName.trim(),
      species: patSpecies as any,
      breed: patBreed.trim() || 'Mestizo',
      sex: patSex,
      reproductiveStatus: patRepro,
      birthDate: birthDateToSave,
      calculatedAge: calculatedAgeStr,
      weight: Number(patWeight) || 10,
      color: patColor.trim() || 'Estándar',
      microchip: patMicrochip.trim() || undefined,
      photoUrl: patPhotoUrl || undefined,
      ownerId: ownerIdToUse,
      status: 'ACTIVO',
      alerts: patAlert ? [{ type: 'ALERGIA' as const, description: patAlert, severity: 'ALTA' as const }] : [],
    });

    // Resetear formulario
    setPatName('');
    setPatBreed('');
    setPatColor('');
    setPatMicrochip('');
    setPatAlert('');
    setPatOwnerFirstName('');
    setPatOwnerLastName('');
    setPatOwnerPhone('');
    setPatOwnerDni('');
    setPatOwnerEmail('');
    setPatPhotoUrl('');

    // Handle immediate care destination workflow
    if (patActionDestination === 'ATENCION_360') {
      setSelectedPatientId(created.id);
      setActivePatientTab('HISTORIA');
      setActiveView('PACIENTES');
      setQuickModal(null);
      showToast(
        'success',
        'Atención Clínica Iniciada',
        `${created.name} registrado. Abriendo expediente clínico 360° en Evolución Médica.`
      );
    } else if (patActionDestination === 'TRIAGE') {
      addTriageEntry({
        patientId: created.id,
        ownerId: ownerIdToUse,
        priority: 'URGENTE',
        chiefComplaint: patAlert || 'Ingreso por guardia y triage',
      });
      setSelectedPatientId(created.id);
      setActiveView('PACIENTES');
      setQuickModal(null);
      showToast(
        'success',
        'Derivado a Triage',
        `${created.name} ingresó a la sala de espera y guardia.`
      );
    } else {
      setSelectedPatientId(created.id);
      setActiveView('PACIENTES');
      setQuickModal(null);
      showToast(
        'success',
        'Paciente Registrado',
        `${created.name} y los datos de su tutor fueron guardados con éxito.`
      );
    }
  };

  const handleCreateOwner = (e: React.FormEvent) => {
    e.preventDefault();
    const created = addOwner({
      firstName: ownFirst,
      lastName: ownLast,
      dni: ownDni,
      phone: ownPhone,
      email: ownEmail || `${ownFirst.toLowerCase()}@email.com`,
      whatsapp: ownPhone,
      address: ownAddress || 'S/D',
      city: 'Buenos Aires',
    });
    setQuickModal(null);
  };

  const handleCreateAppointment = (e?: React.FormEvent, forceWhatsApp?: boolean) => {
    if (e && e.preventDefault) e.preventDefault();
    const shouldSendWhatsApp = forceWhatsApp !== undefined ? forceWhatsApp : aptSendWhatsApp;
    let targetPatientId = aptPatId;
    let targetOwnerId = '';
    let petDisplayName = '';
    let ownerDisplayName = '';
    let ownerPhone = '';

    if (aptMode === 'NEW') {
      if (!aptNewPetName.trim()) {
        showToast('error', 'Falta Nombre del Paciente', 'Por favor ingrese el nombre del paciente a agendar.');
        return;
      }
      if (!aptNewOwnerFirstName.trim()) {
        showToast('error', 'Falta Nombre del Tutor', 'Por favor ingrese el nombre del tutor responsable.');
        return;
      }
      if (!aptNewOwnerPhone.trim()) {
        showToast('error', 'Falta Teléfono de Contacto', 'Por favor ingrese el teléfono / WhatsApp del tutor.');
        return;
      }

      // 1. Create new Owner
      const createdOwner = addOwner({
        firstName: aptNewOwnerFirstName.trim(),
        lastName: (aptNewOwnerLastName || '').trim(),
        dni: aptNewOwnerDni.trim() || 'S/D',
        phone: aptNewOwnerPhone.trim(),
        whatsapp: aptNewOwnerPhone.trim(),
        email: `${aptNewOwnerFirstName.toLowerCase().replace(/\s+/g, '')}@veterinariairusta.com`,
        address: 'Río Cuarto, Córdoba',
        city: 'Río Cuarto',
        taxCondition: 'CONSUMIDOR_FINAL',
        balance: 0,
        branchId: 'branch-central',
      });
      targetOwnerId = createdOwner.id;
      ownerDisplayName = `${createdOwner.firstName} ${createdOwner.lastName}`.trim();
      ownerPhone = createdOwner.phone;

      // 2. Create new Patient
      const createdPatient = addPatient({
        name: aptNewPetName.trim(),
        species: aptNewPetSpecies as any,
        breed: aptNewPetBreed.trim() || 'Mestizo',
        sex: 'Macho',
        reproductiveStatus: 'Entero',
        birthDate: new Date().toISOString().split('T')[0],
        calculatedAge: '1 año',
        weight: 10,
        color: 'Estándar',
        ownerId: createdOwner.id,
        status: 'ACTIVO',
        alerts: [],
      });
      targetPatientId = createdPatient.id;
      petDisplayName = createdPatient.name;
    } else {
      const pat = patients.find((p) => p.id === aptPatId) || patients[0];
      targetPatientId = pat?.id || '';
      targetOwnerId = pat?.ownerId || owners[0]?.id || '';
      const own = owners.find((o) => o.id === targetOwnerId);
      petDisplayName = pat?.name || 'Paciente';
      ownerDisplayName = own ? `${own.firstName} ${own.lastName}` : 'Tutor';
      ownerPhone = own?.whatsapp || own?.phone || '';
    }

    const assignedVet = users.find((u) => u.id === aptVetId) || users[0];
    const vetName = assignedVet
      ? (assignedVet.name?.includes('Dr.') ? assignedVet.name : `Dr. ${assignedVet.name}`)
      : 'Dr. Diego Iván Irusta';

    addAppointment({
      patientId: targetPatientId,
      ownerId: targetOwnerId,
      vetId: assignedVet?.id || 'usr-1',
      vetName: vetName,
      date: aptDate,
      time: aptTime,
      durationMinutes: Number(aptDuration) || 30,
      reason: aptReason.trim() || 'Consulta clínica general',
      type: aptType,
      status: 'RESERVADO',
    });

    // Reset fields
    setAptNewPetName('');
    setAptNewPetBreed('');
    setAptNewOwnerFirstName('');
    setAptNewOwnerLastName('');
    setAptNewOwnerPhone('');
    setAptNewOwnerDni('');
    setAptMode('EXISTING');
    setAptSendWhatsApp(false);

    setQuickModal(null);
    setActiveView('AGENDA');
    showToast('success', 'Turno Agendado con Éxito', `Turno reservado para ${petDisplayName} (${ownerDisplayName}) el ${aptDate} a las ${aptTime} hs con ${vetName}.`);

    if (shouldSendWhatsApp && ownerPhone) {
      const formattedFullDate = formatDate(aptDate, 'Fecha no registrada', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

      openWhatsAppHub({
        patientId: targetPatientId,
        ownerId: targetOwnerId,
        patientName: petDisplayName,
        ownerName: ownerDisplayName,
        ownerPhone: ownerPhone,
        type: 'TURNO',
        details: {
          date: formattedFullDate.charAt(0).toUpperCase() + formattedFullDate.slice(1),
          time: aptTime,
          vetName: vetName,
          supplyName: aptReason || 'Consulta médica general',
        },
      });
    }
  };

  const handleCreateTriage = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === triPatId);
    addTriageEntry({
      patientId: triPatId,
      ownerId: pat?.ownerId || owners[0].id,
      chiefComplaint: triComplaint,
      priority: triPriority,
    });
    setQuickModal(null);
    setActiveView('SALA_ESPERA');
  };

  const handleCreateConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === consPatId);
    addConsultation({
      patientId: consPatId,
      ownerId: pat?.ownerId || owners[0].id,
      reason: consReason,
      anamnesis: consAnamnesis,
      vitalSigns: {
        patientId: consPatId,
        temperature: Number(consTemp),
        heartRate: Number(consFC),
        respiratoryRate: Number(consFR),
      },
      soap: {
        subjective: soapS || 'Sin observaciones subjetivas',
        objective: soapO || 'Examen físico dentro de parámetros esperados',
        assessment: soapA || 'Diagnóstico presuntivo establecido',
        plan: soapP || 'Tratamiento ambulatorio indicado',
      },
      prescriptions: consMedName
        ? [{ medicationName: consMedName, dose: consMedDose, frequency: 'Cada 12 horas', route: 'Oral', duration: '5 días' }]
        : [],
      requiresHospitalization: consReqHosp,
      status: 'FINALIZADA',
    });

    if (consReqHosp) {
      admitPatientToHospital({
        patientId: consPatId,
        sector: 'UCI_CRITICOS',
        kennelNumber: 'CANIL-01',
        primaryDiagnosis: soapA || consReason,
        priority: 'PRIORITARIO',
      });
    }

    setQuickModal(null);
    setSelectedPatientId(consPatId);
    setActiveView('PACIENTES');
  };

  const handleCreateHospitalization = (e: React.FormEvent) => {
    e.preventDefault();
    admitPatientToHospital({
      patientId: hospPatId,
      sector: hospSector,
      kennelNumber: hospKennel,
      primaryDiagnosis: hospDiag,
      priority: hospPriority,
      fluidTherapy: {
        isActive: true,
        solutionType: hospFluidType,
        volumeTotalMl: 1000,
        rateMlPerHour: Number(hospFluidRate),
        infusionRoute: 'IV',
        startedAt: new Date().toISOString(),
        prescribedBy: 'Dr. Diego Iván Irusta',
      },
    });
    setQuickModal(null);
    setActiveView('INTERNACION');
  };

  const handleCreateSurgery = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === surgPatId) || patients[0];
    addSurgery({
      patientId: surgPatId || pat.id,
      procedureName: surgProcName,
      surgeonName: surgSurgeon,
      anesthetistName: surgAnesthetist,
      date: surgDate,
      startTime: surgStartTime,
      estimatedDurationMinutes: Number(surgDuration),
      asaGrade: surgAsa,
      status: 'PROGRAMADA',
      preOpAssessment: surgPreOp,
      anesthesiaProtocol: {
        induction: surgInduction,
        maintenance: surgMaintenance,
        analgesia: surgAnalgesia,
      },
      surgicalTechnique: surgTechnique,
      postOpInstructions: surgPostOp,
    });
    setQuickModal(null);
    setActiveView('CIRUGIAS');
  };

  const handleCreateLabOrder = (e: React.FormEvent) => {
    e.preventDefault();
    addLabOrder({
      patientId: labPatId,
      testType: labType,
      requestedBy: 'Dr. Diego Iván Irusta',
      status: 'PENDIENTE',
    });
    setQuickModal(null);
    setActiveView('LABORATORIO');
  };

  const handleCreateImagingStudy = (e: React.FormEvent) => {
    e.preventDefault();
    addImagingStudy({
      patientId: imgPatId,
      modality: imgModality,
      region: imgRegion,
      findings: imgFindings || 'Estudio en proceso de informe radiológico.',
      specialistName: 'Dra. Imagenóloga Vet',
      status: 'COMPLETADO',
    });
    setQuickModal(null);
    setActiveView('IMAGENES');
  };

  const handleCreateVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    let targetPatientId = vacPatId;
    let registeredPetName = '';

    if (vacMode === 'NEW') {
      if (!vacNewPetName.trim()) {
        showToast('error', 'Nombre Requerido', 'Por favor ingrese el nombre del paciente.');
        return;
      }
      if (!vacNewOwnerFirstName.trim() || !vacNewOwnerPhone.trim()) {
        showToast('error', 'Tutor Requerido', 'Por favor ingrese nombre y teléfono del tutor.');
        return;
      }

      const newOwnerId = `own-${Date.now()}`;
      addOwner({
        id: newOwnerId,
        firstName: vacNewOwnerFirstName.trim(),
        lastName: vacNewOwnerLastName.trim() || 'Tutor',
        dni: vacNewOwnerDni.trim() || undefined,
        phone: vacNewOwnerPhone.trim(),
        whatsapp: vacNewOwnerPhone.trim(),
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
        name: vacNewPetName.trim(),
        species: vacNewPetSpecies,
        breed: vacNewPetBreed.trim() || 'Mestizo',
        sex: vacNewPetSex,
        reproductiveStatus: 'ENTERO',
        birthDate: new Date().toISOString(),
        calculatedAge: 'Adulto',
        weight: Number(vacNewPetWeight) || 10,
        status: 'ACTIVO',
        alerts: [],
        clinicalRecordNumber: newHC,
        ownerId: newOwnerId,
        branchId: 'branch-central',
        createdAt: new Date().toISOString(),
      });

      targetPatientId = newPatId;
      registeredPetName = vacNewPetName.trim();
    } else {
      const foundPat = patients.find(p => p.id === vacPatId);
      registeredPetName = foundPat?.name || 'el paciente';
    }

    addVaccination({
      patientId: targetPatientId,
      vaccineName: vacName,
      type: 'PLAN_SANITARIO',
      batchNumber: vacBatch,
      manufacturer: 'Zoetis / Boehringer',
      expirationDate: vacExp,
      administeredDate: new Date().toISOString().split('T')[0],
      nextDueDate: vacNext,
      administeredBy: currentUser?.name || 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502',
      certificateGenerated: true,
    });

    showToast('success', 'Vacunación Registrada', `Inmunización de ${registeredPetName} registrada correctamente.`);
    setQuickModal(null);
    setActiveView('VACUNAS');
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const catMap: Record<string, Product['category']> = {
      FARMACO: 'MEDICAMENTO',
      MEDICAMENTO: 'MEDICAMENTO',
      INSUMO_QUIRURGICO: 'INSUMO_QUIRURGICO',
      DESCARTABLE: 'DESCARTABLE',
      VACUNA: 'VACUNA',
      ALIMENTO: 'ALIMENTO',
      PSICOTROPICO: 'PSICOTROPICO',
    };
    const validCat: Product['category'] = catMap[prodCategory] || 'MEDICAMENTO';
    addProduct({
      code: prodCode || `MED-${Math.floor(Math.random() * 9000 + 1000)}`,
      commercialName: prodName,
      activeIngredient: prodIngr || prodName,
      concentration: 'Estándar',
      category: validCat,
      presentation: 'Unidad',
      laboratory: 'Laboratorio Veterinario',
      supplier: 'Droguería Central',
      location: 'Estante Principal',
      currentStock: Number(prodStock),
      minStock: 5,
      costPrice: Number(prodPrice) * 0.6,
      salePrice: Number(prodPrice),
      currentBatch: 'L-2026',
      expirationDate: '2027-12-31',
    });
    setQuickModal(null);
    setActiveView('FARMACIA');
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    createInvoice({
      type: invType,
      branchId: activeBranch.id,
      customerName: invCustName || 'Consumidor Final',
      customerDniCuit: invCustDni || '00-00000000-0',
      items: [
        {
          id: `item-${Date.now()}`,
          description: invItemDesc,
          quantity: 1,
          unitPrice: Number(invItemAmount),
          subtotal: Number(invItemAmount),
        },
      ],
      paymentMethod: invPayMethod,
      totalAmount: Number(invItemAmount),
    });
    setQuickModal(null);
    setActiveView('CAJA_FACTURACION');
  };

  const handleCreateEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === estPatId);
    const ownerId = pat?.ownerId || owners[0]?.id || 'own-gen';
    createEstimate({
      patientId: estPatId,
      ownerId,
      branchId: activeBranch.id,
      items: [
        {
          id: `est-item-${Date.now()}`,
          description: estDesc,
          quantity: 1,
          unitPrice: Number(estAmount),
          subtotal: Number(estAmount),
        },
      ],
      totalAmount: Number(estAmount),
      notes: estNotes,
      status: 'PENDIENTE',
    });
    showToast('success', 'Presupuesto Creado', `Se generó el presupuesto clínico por $${Number(estAmount).toLocaleString('es-AR')}.`);
    setQuickModal(null);
    setActiveView('CAJA_FACTURACION');
  };

  const handleCreateConsentDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find((p) => p.id === docPatId);
    addDocument({
      patientId: docPatId,
      ownerId: pat?.ownerId || owners[0].id,
      type: docType,
      title: docTitle,
      content: docContent,
      isSigned: false,
    });
    setQuickModal(null);
    setActiveView('DOCUMENTOS');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl sm:max-w-3xl p-5 sm:p-6 space-y-4 max-h-[92dvh] sm:max-h-[88vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-150 safe-bottom">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            {quickModal === 'QUICK_ACTIONS' && '⚡ Acciones Rápidas del Hospital'}
            {quickModal === 'NUEVO_PACIENTE' && '🐾 Alta de Nuevo Paciente'}
            {quickModal === 'NUEVO_PROPIETARIO' && '👤 Alta de Propietario / Tutor'}
            {quickModal === 'NUEVO_TURNO' && '📅 Agendar Nuevo Turno'}
            {quickModal === 'NUEVO_TRIAGE' && '⏱️ Ingresar Paciente a Triage / Sala de Espera'}
                        {quickModal === 'INGRESO_INTERNACION' && '🏥 Ingreso Directo a Internación (Caniles/UCI)'}
            {quickModal === 'NUEVA_CIRUGIA' && '✂️ Programar Cirugía & Protocolo Anestésico'}
            {quickModal === 'NUEVO_LAB' && '🧪 Solicitar Análisis de Laboratorio'}
            {quickModal === 'NUEVA_IMAGEN' && '🔍 Solicitar Estudio de Imagen'}
            {quickModal === 'NUEVA_VACUNA' && '💉 Aplicar Vacuna & Libreta'}
            {quickModal === 'NUEVO_PRODUCTO' && '📦 Alta de Producto / Medicamento'}
            {quickModal === 'NUEVA_FACTURA' && (invType === 'RECIBO_X' ? '📄 Emitir Ticket Común' : '🧾 Emitir Factura ARCA (AFIP)')}
            {quickModal === 'NUEVO_PRESUPUESTO' && '📋 Generar Nuevo Presupuesto Clínico'}
            {quickModal === 'NUEVO_CONSENTIMIENTO' && '📑 Generar Consentimiento Informado'}
          </h3>
          <button
            onClick={() => setQuickModal(null)}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. QUICK ACTIONS PICKER */}
        {quickModal === 'QUICK_ACTIONS' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[
              { id: 'NUEVO_PACIENTE', label: 'Nuevo Paciente', icon: PawPrint, color: 'bg-teal-700' },
              { id: 'NUEVO_PROPIETARIO', label: 'Nuevo Propietario', icon: Users, color: 'bg-slate-700' },
              { id: 'NUEVO_TURNO', label: 'Nuevo Turno', icon: Calendar, color: 'bg-teal-800' },
              { id: 'NUEVO_TRIAGE', label: 'Ingreso a Triage', icon: Clock, color: 'bg-amber-600' },
              { id: 'NUEVA_CIRUGIA', label: 'Programar Cirugía', icon: Scissors, color: 'bg-indigo-600' },
              { id: 'NUEVO_LAB', label: 'Laboratorio', icon: FlaskConical, color: 'bg-purple-600' },
              { id: 'NUEVA_IMAGEN', label: 'Estudio de Imagen', icon: Scan, color: 'bg-sky-600' },
              { id: 'NUEVA_VACUNA', label: 'Aplicar Vacuna', icon: Syringe, color: 'bg-emerald-600' },
              { id: 'NUEVA_FACTURA', label: 'Factura AFIP', icon: Receipt, color: 'bg-emerald-700' },
              { id: 'NUEVO_CONSENTIMIENTO', label: 'Consentimiento', icon: FileText, color: 'bg-slate-800' },
            ]
              .filter((action) => hasQuickActionPermission(currentUser?.role, action.id))
              .map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => setQuickModal(action.id)}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-teal-500/50 hover:bg-slate-100/80 text-left transition-all group flex flex-col justify-between cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center text-white mb-3 shadow-sm`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 group-hover:text-teal-700">
                      {action.label}
                    </span>
                  </button>
                );
              })}
          </div>
        )}

        {/* 2. NUEVO PACIENTE FORM */}
        {quickModal === 'NUEVO_PACIENTE' && (
          <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
            {/* BLOQUE 1: IDENTIFICACIÓN DEL PACIENTE */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                <span className="text-base">🐾</span>
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  1. Ficha del Paciente
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">
                    Nombre del Paciente: <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={patName}
                    onChange={(e) => setPatName(e.target.value)}
                    placeholder="ej: Rocky, Duque..."
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Especie:</label>
                  <select
                    value={patSpecies}
                    onChange={(e) => setPatSpecies(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                  >
                    <option value="Canino">Canino (Perro)</option>
                    <option value="Felino">Felino (Gato)</option>
                    <option value="Equino">Equino (Caballo)</option>
                    <option value="Bovino">Bovino (Vaca / Toro)</option>
                    <option value="Ovino">Ovino / Caprino</option>
                    <option value="Exótico">Exótico / No Convencional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">
                    Raza: <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={patBreed}
                    onChange={(e) => setPatBreed(e.target.value)}
                    placeholder="ej: American Bully, Criollo, Mestizo..."
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Sexo & Condición Reproductiva:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={patSex}
                      onChange={(e) => setPatSex(e.target.value as any)}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                    >
                      <option value="Macho">Macho</option>
                      <option value="Hembra">Hembra</option>
                    </select>
                    <select
                      value={patRepro}
                      onChange={(e) => setPatRepro(e.target.value as any)}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                    >
                      <option value="Entero">Entero</option>
                      <option value="Castrado">Castrado</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Peso */}
                <div>
                  <label className="text-slate-700 block font-bold mb-1">
                    Peso (kg): <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="1000"
                    value={patWeight}
                    onChange={(e) => setPatWeight(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                  />
                </div>

                {/* Color / Pelaje */}
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Color / Pelaje:</label>
                  <input
                    type="text"
                    value={patColor}
                    onChange={(e) => setPatColor(e.target.value)}
                    placeholder="ej: Negro, Atigrado, Alazán..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                  />
                </div>

                {/* Edad o Fecha de Nacimiento con selector limpio */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-700 font-bold">Edad / Nacimiento:</label>
                    <button
                      type="button"
                      onClick={() => setPatAgeMode(patAgeMode === 'EDAD' ? 'FECHA' : 'EDAD')}
                      className="text-[10px] text-teal-700 hover:text-teal-900 font-extrabold underline cursor-pointer"
                    >
                      {patAgeMode === 'EDAD' ? '🗓️ Usar Fecha' : '⏳ Usar Edad'}
                    </button>
                  </div>

                  {patAgeMode === 'EDAD' ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="40"
                        step="1"
                        value={patAgeValue}
                        onChange={(e) => setPatAgeValue(e.target.value)}
                        placeholder="ej: 2"
                        className="w-20 bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs text-center"
                      />
                      <select
                        value={patAgeUnit}
                        onChange={(e) => setPatAgeUnit(e.target.value as any)}
                        className="flex-1 bg-white border border-slate-300 rounded-xl px-2 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                      >
                        <option value="AÑOS">Años</option>
                        <option value="MESES">Meses</option>
                      </select>
                    </div>
                  ) : (
                    <input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      value={patBirth}
                      onChange={(e) => setPatBirth(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* BLOQUE 2: DATOS DEL PROPIETARIO / TUTOR */}
            <div className="p-4 bg-teal-50/40 rounded-2xl border border-teal-200/80 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">👤</span>
                  <span className="font-extrabold text-teal-950 text-xs uppercase tracking-wider">
                    2. Datos del Propietario / Tutor Responsable
                  </span>
                </div>
                {owners.length > 0 && (
                  <div className="flex items-center gap-1 bg-white border border-teal-200 p-0.5 rounded-lg text-[11px] font-bold self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setPatOwnerMode('MANUAL')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        patOwnerMode === 'MANUAL'
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      ✍️ Escribir Tutor
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatOwnerMode('EXISTING')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        patOwnerMode === 'EXISTING'
                          ? 'bg-teal-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      👥 Seleccionar Existente ({owners.length})
                    </button>
                  </div>
                )}
              </div>

              {patOwnerMode === 'MANUAL' || owners.length === 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-800 block font-bold mb-1">
                        Nombre del Propietario: <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={patOwnerFirstName}
                        onChange={(e) => setPatOwnerFirstName(e.target.value)}
                        placeholder="ej: Carlos"
                        required={patOwnerMode === 'MANUAL' || owners.length === 0}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-800 block font-bold mb-1">
                        Apellido del Propietario: <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="text"
                        value={patOwnerLastName}
                        onChange={(e) => setPatOwnerLastName(e.target.value)}
                        placeholder="ej: Rodríguez"
                        required={patOwnerMode === 'MANUAL' || owners.length === 0}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-800 block font-bold mb-1">
                        Teléfono / WhatsApp de Contacto: <span className="text-rose-500 font-bold">*</span>
                      </label>
                      <input
                        type="tel"
                        value={patOwnerPhone}
                        onChange={(e) => setPatOwnerPhone(e.target.value)}
                        placeholder="ej: +54 9 358 4123456"
                        required={patOwnerMode === 'MANUAL' || owners.length === 0}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                      />
                      <span className="text-[10px] text-teal-800 font-bold mt-1 block">
                        📱 Para avisarle novedades clínicas, partes médicos y evolución del tratamiento.
                      </span>
                    </div>

                    <div>
                      <label className="text-slate-800 block font-bold mb-1">DNI / CUIT (Opcional):</label>
                      <input
                        type="text"
                        value={patOwnerDni}
                        onChange={(e) => setPatOwnerDni(e.target.value)}
                        placeholder="ej: 38.450.912"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-slate-800 block font-bold mb-1">Seleccionar Tutor de la Base de Datos:</label>
                  <select
                    value={patOwnerId}
                    onChange={(e) => setPatOwnerId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                  >
                    {owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.firstName} {o.lastName} {o.phone ? `• Tel: ${o.phone}` : ''} {o.dni ? `• DNI: ${o.dni}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* BLOQUE 3: DATOS CLÍNICOS ADICIONALES */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3 shadow-2xs">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                <span className="text-base">🛡️</span>
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  3. Datos Clínicos Adicionales & Identificación
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 block font-bold mb-1">Microchip ISO (Opcional):</label>
                  <input
                    type="text"
                    value={patMicrochip}
                    onChange={(e) => setPatMicrochip(e.target.value)}
                    placeholder="ej: 981098109283719"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-slate-700 block font-bold mb-1">Alerta Médica Inicial (Opcional):</label>
                  <input
                    type="text"
                    value={patAlert}
                    onChange={(e) => setPatAlert(e.target.value)}
                    placeholder="ej: Alérgico a penicilina, Cardiópata, Agresivo..."
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-rose-700 placeholder-slate-400 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-2xs"
                  />
                </div>
              </div>
            </div>

            {/* BLOQUE 4: FOTO DEL PACIENTE (CÁMARA / ARCHIVO LOCAL) */}
            <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/80 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">📷</span>
                  <span className="font-extrabold text-amber-950 text-xs uppercase tracking-wider">
                    4. Foto del Paciente (Cámara del Teléfono o Archivo)
                  </span>
                </div>
                <span className="text-[10px] text-amber-800 font-medium">Opcional</span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-amber-300 overflow-hidden flex items-center justify-center flex-shrink-0 shadow-2xs">
                  {patPhotoUrl ? (
                    <img src={patPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-amber-400">🐾</span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <label className="px-3.5 py-2 bg-amber-700 hover:bg-amber-600 text-white rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all">
                    <Camera className="w-4 h-4" />
                    <span>📷 Sacar Foto con Cámara</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const dataUrl = await processImageFile(file);
                            setPatPhotoUrl(dataUrl);
                            showToast('success', 'Foto Capturada', 'Foto tomada con éxito.');
                          } catch (err: any) {
                            showToast('error', 'Error al Capturar Foto', err.message);
                          }
                        }
                      }}
                    />
                  </label>

                  <label className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all">
                    <Upload className="w-4 h-4" />
                    <span>📁 Subir desde Archivo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const dataUrl = await processImageFile(file);
                            setPatPhotoUrl(dataUrl);
                            showToast('success', 'Foto Cargada', 'Foto seleccionada con éxito.');
                          } catch (err: any) {
                            showToast('error', 'Error al Cargar Foto', err.message);
                          }
                        }
                      }}
                    />
                  </label>

                  {patPhotoUrl && (
                    <button
                      type="button"
                      onClick={() => setPatPhotoUrl('')}
                      className="px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-xs transition-colors"
                    >
                      Quitar Foto
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* BLOQUE 5: ACCIÓN POST-REGISTRO */}
            <div className="p-4 bg-teal-50/70 rounded-2xl border-2 border-teal-300 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">🚀</span>
                  <span className="font-black text-teal-950 text-xs uppercase tracking-wider">
                    5. Destino Inmediato tras el Registro
                  </span>
                </div>
              </div>

              {/* Selector de Destino */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setPatActionDestination('ATENCION_360');
                  }}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                    patActionDestination === 'ATENCION_360'
                      ? 'bg-teal-700 text-white border-teal-800 shadow-sm ring-2 ring-teal-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50'
                  }`}
                >
                  <span className="text-base">🩺</span>
                  <span className="leading-tight">Atención 360° / SOAP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setPatActionDestination('TRIAGE');
                  }}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                    patActionDestination === 'TRIAGE'
                      ? 'bg-teal-700 text-white border-teal-800 shadow-sm ring-2 ring-teal-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50'
                  }`}
                >
                  <span className="text-base">🚨</span>
                  <span className="leading-tight">Triage / Guardia</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setPatActionDestination('SOLO_REGISTRAR');
                  }}
                  className={`p-2.5 rounded-xl border font-bold text-xs flex flex-col items-center text-center gap-1 transition-all cursor-pointer ${
                    patActionDestination === 'SOLO_REGISTRAR'
                      ? 'bg-teal-700 text-white border-teal-800 shadow-sm ring-2 ring-teal-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50'
                  }`}
                >
                  <span className="text-base">💾</span>
                  <span className="leading-tight">Solo Guardar Ficha</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-physical btn-physical-teal px-6 py-2.5 rounded-xl text-white font-extrabold shadow-md flex items-center gap-2 cursor-pointer"
              >
                {patActionDestination === 'ATENCION_360' && (
                  <>
                    <Stethoscope className="w-4 h-4" />
                    <span>🩺 Guardar e Iniciar Atención Médica</span>
                  </>
                )}
                {patActionDestination === 'TRIAGE' && (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>🚨 Guardar y Derivar a Triage</span>
                  </>
                )}
                {patActionDestination === 'SOLO_REGISTRAR' && (
                  <>
                    <PawPrint className="w-4 h-4" />
                    <span>💾 Guardar Ficha del Paciente</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* 3. NUEVO PROPIETARIO */}
        {quickModal === 'NUEVO_PROPIETARIO' && (
          <form onSubmit={handleCreateOwner} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Nombre:</label>
                <input
                  type="text"
                  value={ownFirst}
                  onChange={(e) => setOwnFirst(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-700 block font-bold mb-1">Apellido:</label>
                <input
                  type="text"
                  value={ownLast}
                  onChange={(e) => setOwnLast(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">DNI / CUIT:</label>
                <input
                  type="text"
                  value={ownDni}
                  onChange={(e) => setOwnDni(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-semibold"
                />
              </div>
              <div>
                <label className="text-slate-700 block font-bold mb-1">Teléfono / WhatsApp:</label>
                <input
                  type="text"
                  value={ownPhone}
                  onChange={(e) => setOwnPhone(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Email:</label>
              <input
                type="email"
                value={ownEmail}
                onChange={(e) => setOwnEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-sm"
              >
                Guardar Propietario
              </button>
            </div>
          </form>
        )}

        {/* 4. NUEVA CONSULTA SOAP WIZARD */}
        {quickModal === 'NUEVA_CONSULTA' && (
          <form onSubmit={handleCreateConsultation} className="space-y-4 text-xs">
            {/* Top preset bar */}
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2">
                <label className="text-slate-700 font-bold">Paciente:</label>
                <select
                  value={consPatId}
                  onChange={(e) => setConsPatId(e.target.value)}
                  className="bg-white border border-slate-200 text-slate-900 font-bold rounded-lg px-2 py-1"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={applyNormalPhysicalExam}
                  className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg border border-teal-200 transition-colors"
                  title="Carga automática de examen físico completo normal"
                >
                  ⚡ Examen Físico Normal
                </button>
                <button
                  type="button"
                  onClick={handleAiSoapGenerate}
                  disabled={aiSoapLoading}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg border border-slate-300 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>Asistente IA</span>
                </button>
              </div>
            </div>

            {/* Vitals inputs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="text-slate-500 block text-[10px] uppercase font-bold">Temp (°C):</label>
                <input
                  type="number"
                  step="0.1"
                  value={consTemp}
                  onChange={(e) => setConsTemp(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-900 font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-slate-500 block text-[10px] uppercase font-bold">FC (lpm):</label>
                <input
                  type="number"
                  value={consFC}
                  onChange={(e) => setConsFC(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-900 font-bold font-mono"
                />
              </div>
              <div>
                <label className="text-slate-500 block text-[10px] uppercase font-bold">FR (rpm):</label>
                <input
                  type="number"
                  value={consFR}
                  onChange={(e) => setConsFR(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-slate-900 font-bold font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Motivo de Consulta:</label>
                <input
                  type="text"
                  value={consReason}
                  onChange={(e) => setConsReason(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="text-slate-700 block font-bold mb-1">Anamnesis / Historia Previa:</label>
                <input
                  type="text"
                  value={consAnamnesis}
                  onChange={(e) => setConsAnamnesis(e.target.value)}
                  placeholder="Comportamiento, vómitos, deposiciones..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            {/* SOAP Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-teal-700 font-bold block mb-1">S — SUBJETIVO:</label>
                <textarea
                  value={soapS}
                  onChange={(e) => setSoapS(e.target.value)}
                  rows={2}
                  placeholder="Observaciones del tutor..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                ></textarea>
              </div>

              <div>
                <label className="text-teal-700 font-bold block mb-1">O — OBJETIVO (Examen Físico):</label>
                <textarea
                  value={soapO}
                  onChange={(e) => setSoapO(e.target.value)}
                  rows={2}
                  placeholder="Mucosas, TLLC, auscultación..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                ></textarea>
              </div>

              <div>
                <label className="text-teal-700 font-bold block mb-1">A — EVALUACIÓN / DIAGNÓSTICO:</label>
                <textarea
                  value={soapA}
                  onChange={(e) => setSoapA(e.target.value)}
                  rows={2}
                  placeholder="Diagnósticos presuntivos y diferenciales..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                ></textarea>
              </div>

              <div>
                <label className="text-teal-700 font-bold block mb-1">P — PLAN TERAPÉUTICO:</label>
                <textarea
                  value={soapP}
                  onChange={(e) => setSoapP(e.target.value)}
                  rows={2}
                  placeholder="Indicaciones, estudios solicitados..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900"
                ></textarea>
              </div>
            </div>

            {/* Prescription item */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="text-slate-700 font-bold block">Prescripción Farmacológica (Receta):</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={consMedName}
                  onChange={(e) => setConsMedName(e.target.value)}
                  placeholder="Fármaco (ej: Enrofloxacina)"
                  className="bg-white border border-slate-200 rounded-lg p-2 text-slate-900"
                />
                <input
                  type="text"
                  value={consMedDose}
                  onChange={(e) => setConsMedDose(e.target.value)}
                  placeholder="Dosis (ej: 5 mg/kg cada 24hs)"
                  className="bg-white border border-slate-200 rounded-lg p-2 text-slate-900"
                />
              </div>
            </div>

            {/* Hospitalization checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="reqHosp"
                checked={consReqHosp}
                onChange={(e) => setConsReqHosp(e.target.checked)}
                className="w-4 h-4 rounded text-red-600"
              />
              <label htmlFor="reqHosp" className="text-red-700 font-bold cursor-pointer">
                🏥 Paciente requiere internación hospitalaria inmediata
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-sm"
              >
                Finalizar Consulta SOAP
              </button>
            </div>
          </form>
        )}

        {/* 5. INGRESO INTERNACION FORM */}
        {quickModal === 'INGRESO_INTERNACION' && (
          <form onSubmit={handleCreateHospitalization} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Paciente:</label>
                <select
                  value={hospPatId}
                  onChange={(e) => setHospPatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Sector & Canil:</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={hospSector}
                    onChange={(e) => setHospSector(e.target.value as any)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-slate-900 font-semibold"
                  >
                    <option value="UCI_CRITICOS">UCI Críticos</option>
                    <option value="CANIL_GENERAL">Canil Perros</option>
                    <option value="GATERIO_FELINOS">Gaterío</option>
                    <option value="AISLAMIENTO_INFECCIOSO">Aislamiento</option>
                  </select>
                  <input
                    type="text"
                    value={hospKennel}
                    onChange={(e) => setHospKennel(e.target.value)}
                    required
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Diagnóstico de Ingreso:</label>
              <input
                type="text"
                value={hospDiag}
                onChange={(e) => setHospDiag(e.target.value)}
                placeholder="ej: Gastroenteritis hemorrágica, Deshidratación 8%"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Prioridad:</label>
                <select
                  value={hospPriority}
                  onChange={(e) => setHospPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold"
                >
                  <option value="CRITICO">🔴 CRÍTICO</option>
                  <option value="PRIORITARIO">🟡 PRIORITARIO</option>
                  <option value="ESTABLE">🟢 ESTABLE</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Tipo de Solución:</label>
                <input
                  type="text"
                  value={hospFluidType}
                  onChange={(e) => setHospFluidType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Goteo / Infusión (ml/h):</label>
                <input
                  type="number"
                  value={hospFluidRate}
                  onChange={(e) => setHospFluidRate(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-sm"
              >
                Ingresar a Internación
              </button>
            </div>
          </form>
        )}

        {/* NUEVA CIRUGIA FORM */}
        {quickModal === 'NUEVA_CIRUGIA' && (
          <form onSubmit={handleCreateSurgery} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Paciente:</label>
                <select
                  value={surgPatId}
                  onChange={(e) => setSurgPatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species} - {p.breed})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Procedimiento Quirúrgico:</label>
                <input
                  type="text"
                  value={surgProcName}
                  onChange={(e) => setSurgProcName(e.target.value)}
                  placeholder="ej: Osteosíntesis de fémur / OSH"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Cirujano Principal:</label>
                <input
                  type="text"
                  value={surgSurgeon}
                  onChange={(e) => setSurgSurgeon(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Anestesista:</label>
                <input
                  type="text"
                  value={surgAnesthetist}
                  onChange={(e) => setSurgAnesthetist(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Riesgo Quirúrgico (ASA):</label>
                <select
                  value={surgAsa}
                  onChange={(e) => setSurgAsa(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold"
                >
                  <option value="ASA_I">ASA I - Paciente Normal / Sano</option>
                  <option value="ASA_II">ASA II - Enfermedad Sistémica Leve</option>
                  <option value="ASA_III">ASA III - Enfermedad Sistémica Moderada</option>
                  <option value="ASA_IV">ASA IV - Enfermedad Sistémica Grave</option>
                  <option value="ASA_V">ASA V - Moribundo / Emergencia Vital</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Fecha:</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={surgDate}
                  onChange={(e) => setSurgDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Hora Inicio:</label>
                <input
                  type="time"
                  value={surgStartTime}
                  onChange={(e) => setSurgStartTime(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Duración Estimada (min):</label>
                <input
                  type="number"
                  value={surgDuration}
                  onChange={(e) => setSurgDuration(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
              <h4 className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                Protocolo Anestésico & Quirúrgico
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-600 block text-[11px] font-bold mb-0.5">Inducción:</label>
                  <input
                    type="text"
                    value={surgInduction}
                    onChange={(e) => setSurgInduction(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-slate-600 block text-[11px] font-bold mb-0.5">Mantenimiento:</label>
                  <input
                    type="text"
                    value={surgMaintenance}
                    onChange={(e) => setSurgMaintenance(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-600 block text-[11px] font-bold mb-0.5">Analgesia Perioperatoria:</label>
                <input
                  type="text"
                  value={surgAnalgesia}
                  onChange={(e) => setSurgAnalgesia(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Técnica Quirúrgica / Plan:</label>
              <textarea
                value={surgTechnique}
                onChange={(e) => setSurgTechnique(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              ></textarea>
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Indicaciones Posoperatorias:</label>
              <textarea
                value={surgPostOp}
                onChange={(e) => setSurgPostOp(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-sm"
              >
                Programar Cirugía
              </button>
            </div>
          </form>
        )}

        {/* 6. NUEVO TURNO FORM (REDISEÑO TOTAL CON PACIENTE NUEVO Y REGISTRADO) */}
        {quickModal === 'NUEVO_TURNO' && (
          <form onSubmit={handleCreateAppointment} className="space-y-4 text-xs">
            {/* Mode Switcher */}
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setAptMode('EXISTING')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  aptMode === 'EXISTING'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👥 Paciente Registrado</span>
              </button>
              <button
                type="button"
                onClick={() => setAptMode('NEW')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  aptMode === 'NEW'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>✍️ + Paciente y Tutor Nuevos</span>
              </button>
            </div>

            {/* SELECCIÓN O CARGA DE PACIENTE */}
            {aptMode === 'EXISTING' ? (
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 block font-bold">Seleccionar Paciente de la Clínica *</label>
                  {patients.length > 0 && (
                    <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                      {patients.length} {patients.length === 1 ? 'paciente disponible' : 'pacientes disponibles'}
                    </span>
                  )}
                </div>

                {patients.length === 0 ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-2">
                    <p className="text-amber-900 font-bold text-xs">
                      ⚠️ Aún no hay pacientes registrados en el sistema.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAptMode('NEW')}
                      className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                      ✍️ Cargar Paciente y Tutor Nuevos
                    </button>
                  </div>
                ) : (
                  <select
                    value={aptPatId || patients[0]?.id || ''}
                    onChange={(e) => setAptPatId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-2xs cursor-pointer"
                  >
                    {patients.map((p) => {
                      const own = owners.find((o) => o.id === p.ownerId);
                      return (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.species} • {p.breed}) {own ? `— Tutor: ${own.firstName} ${own.lastName} (${own.phone || 'S/D'})` : ''}
                        </option>
                      );
                    })}
                  </select>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Bloque Mascota Nueva */}
                <div className="bg-teal-50/40 p-3.5 rounded-2xl border border-teal-200/80 space-y-3">
                  <div className="flex items-center gap-2 border-b border-teal-200/80 pb-1.5">
                    <span>🐾</span>
                    <span className="font-extrabold text-teal-950 text-xs uppercase tracking-wider">
                      1. Datos del Nuevo Paciente (Mascota)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nombre de la Mascota *</label>
                      <input
                        type="text"
                        required={aptMode === 'NEW'}
                        value={aptNewPetName}
                        onChange={(e) => setAptNewPetName(e.target.value)}
                        placeholder="ej: Milo, Thor, Luna..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Especie *</label>
                      <select
                        value={aptNewPetSpecies}
                        onChange={(e) => setAptNewPetSpecies(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Canino">🐕 Canino</option>
                        <option value="Felino">🐈 Felino</option>
                        <option value="Equino">🐎 Equino</option>
                        <option value="Bovino">🐄 Bovino</option>
                        <option value="Ave">🦜 Ave</option>
                        <option value="Exotico">🦎 Exótico</option>
                      </select>
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Raza (Opcional)</label>
                      <input
                        type="text"
                        value={aptNewPetBreed}
                        onChange={(e) => setAptNewPetBreed(e.target.value)}
                        placeholder="ej: Caniche, Mestizo..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloque Tutor Nuevo */}
                <div className="bg-teal-50/40 p-3.5 rounded-2xl border border-teal-200/80 space-y-3">
                  <div className="flex items-center gap-2 border-b border-teal-200/80 pb-1.5">
                    <span>👤</span>
                    <span className="font-extrabold text-teal-950 text-xs uppercase tracking-wider">
                      2. Datos del Tutor Responsable
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nombre del Tutor *</label>
                      <input
                        type="text"
                        required={aptMode === 'NEW'}
                        value={aptNewOwnerFirstName}
                        onChange={(e) => setAptNewOwnerFirstName(e.target.value)}
                        placeholder="ej: Laura"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Apellido del Tutor *</label>
                      <input
                        type="text"
                        required={aptMode === 'NEW'}
                        value={aptNewOwnerLastName}
                        onChange={(e) => setAptNewOwnerLastName(e.target.value)}
                        placeholder="ej: Gómez"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Teléfono / WhatsApp de Contacto *</label>
                      <input
                        type="tel"
                        required={aptMode === 'NEW'}
                        value={aptNewOwnerPhone}
                        onChange={(e) => setAptNewOwnerPhone(e.target.value)}
                        placeholder="ej: +54 9 358 4123456"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">DNI / CUIT (Opcional)</label>
                      <input
                        type="text"
                        value={aptNewOwnerDni}
                        onChange={(e) => setAptNewOwnerDni(e.target.value)}
                        placeholder="ej: 38450912"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DETALLES DE LA CITA MÉDICA */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <span>🗓️</span>
                <span className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                  {aptMode === 'NEW' ? '3. Detalles de la Cita Médica' : 'Detalles de la Cita Médica'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha del Turno *</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={aptDate}
                    onChange={(e) => setAptDate(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Horario *</label>
                  <input
                    type="time"
                    value={aptTime}
                    onChange={(e) => setAptTime(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono font-black focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Duración Estimada</label>
                  <select
                    value={aptDuration}
                    onChange={(e) => setAptDuration(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos (Estándar)</option>
                    <option value={45}>45 minutos</option>
                    <option value={60}>60 minutos (Extendido / Cirugía)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tipo de Cita *</label>
                  <select
                    value={aptType}
                    onChange={(e) => setAptType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="CONSULTA">🩺 Consulta Clínica General</option>
                    <option value="VACUNACION">💉 Plan Sanitario / Vacunación</option>
                    <option value="CIRUGIA">✂️ Cirugía / Quirófano</option>
                    <option value="CONTROL">🔍 Control Posoperatorio</option>
                    <option value="ESTUDIO">🔬 Estudio / Laboratorio / RX</option>
                    <option value="URGENCIA">🚨 Guardia / Urgencia</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Profesional Asignado</label>
                  <select
                    value={aptVetId}
                    onChange={(e) => setAptVetId(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-teal-500"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        👨‍⚕️ {u.name?.includes('Dr.') ? u.name : `Dr. ${u.name}`} (M.P. 502)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo de la Cita / Novedades *</label>
                <input
                  type="text"
                  value={aptReason}
                  onChange={(e) => setAptReason(e.target.value)}
                  placeholder="ej: Control general, decaimiento, vacuna antirrábica..."
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Checkbox WhatsApp */}
              <label className="flex items-center gap-2 pt-1 text-slate-700 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={aptSendWhatsApp}
                  onChange={(e) => setAptSendWhatsApp(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500"
                />
                <span>📱 Enviar confirmación y recordatorio automático por WhatsApp al agendar</span>
              </label>
            </div>

            {/* Action Buttons: Guardar Turno (Solo Registrar) y Guardar y Avisar por WhatsApp */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors text-xs text-center"
              >
                Cancelar
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleCreateAppointment(e, true)}
                  className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Guarda el turno y abre WhatsApp para notificar al tutor"
                >
                  <span>💬 Guardar y Avisar por WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleCreateAppointment(e, false)}
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-black text-xs shadow-md shadow-teal-700/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Guarda y reserva el turno en el sistema sin enviar mensaje"
                >
                  <span>🗓️ Guardar Turno (Solo Registrar)</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 7. NUEVO TRIAGE */}
        {quickModal === 'NUEVO_TRIAGE' && (
          <form onSubmit={handleCreateTriage} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-700 block font-bold mb-1">Paciente:</label>
              <select
                value={triPatId}
                onChange={(e) => setTriPatId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Motivo de Urgencia / Consulta:</label>
              <input
                type="text"
                value={triComplaint}
                onChange={(e) => setTriComplaint(e.target.value)}
                placeholder="ej: Dificultad respiratoria, traumatismo..."
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Clasificación de Triage:</label>
              <select
                value={triPriority}
                onChange={(e) => setTriPriority(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold"
              >
                <option value="CRITICO">🔴 NIVEL 1: CRÍTICO (Atención inmediata)</option>
                <option value="PRIORITARIO">🟡 NIVEL 2: PRIORITARIO (&lt; 15 min)</option>
                <option value="NORMAL">🟢 NIVEL 3: NORMAL (&lt; 45 min)</option>
                <option value="NO_URGENTE">🔵 NIVEL 4: NO URGENTE</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-sm"
              >
                Ingresar a Sala
              </button>
            </div>
          </form>
        )}

        {/* 8. NUEVO LAB */}
        {quickModal === 'NUEVO_LAB' && (
          <form onSubmit={handleCreateLabOrder} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-700 block font-bold mb-1">Paciente:</label>
              <select
                value={labPatId}
                onChange={(e) => setLabPatId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Panel de Análisis:</label>
              <select
                value={labType}
                onChange={(e) => setLabType(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold"
              >
                <option value="HEMOGRAMA_COMPLETO">Hemograma Completo</option>
                <option value="PERFIL_RENAL_HEPATICO">Perfil Bioquímico Renal & Hepático</option>
                <option value="IONOGRAMA">Ionograma & Gases en Sangre</option>
                <option value="COAGULOGRAMA">Perfil de Coagulación</option>
                <option value="URINALISIS">Urinálisis Completo</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-sm"
              >
                Solicitar a Laboratorio
              </button>
            </div>
          </form>
        )}

        {/* 9. NUEVA IMAGEN */}
        {quickModal === 'NUEVA_IMAGEN' && (
          <form onSubmit={handleCreateImagingStudy} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-700 block font-bold mb-1">Paciente:</label>
              <select
                value={imgPatId}
                onChange={(e) => setImgPatId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Modalidad:</label>
                <select
                  value={imgModality}
                  onChange={(e) => setImgModality(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold"
                >
                  <option value="RADIOGRAFIA">Radiografía Digital (RX)</option>
                  <option value="ECOGRAFIA">Ecografía Abdominal</option>
                  <option value="ECOCARDIOGRAMA">Ecocardiograma Doppler</option>
                  <option value="TOMOGRAFIA">Tomografía Computada (TC)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Región Anatómica:</label>
                <input
                  type="text"
                  value={imgRegion}
                  onChange={(e) => setImgRegion(e.target.value)}
                  placeholder="ej: Tórax L/L y V/D"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Hallazgos / Informe Preliminar:</label>
              <textarea
                value={imgFindings}
                onChange={(e) => setImgFindings(e.target.value)}
                rows={3}
                placeholder="Hallazgos radiológicos o ecográficos observados..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-sm"
              >
                Guardar Estudio
              </button>
            </div>
          </form>
        )}

        {/* 10. NUEVA VACUNA (DUAL MODE: REGISTRADO/INTERNADO VS NUEVO PACIENTE) */}
        {quickModal === 'NUEVA_VACUNA' && (
          <form onSubmit={handleCreateVaccine} className="space-y-4 text-xs">
            {/* Mode Switcher */}
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setVacMode('EXISTING')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  vacMode === 'EXISTING'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👥 Paciente Registrado / Internado</span>
              </button>
              <button
                type="button"
                onClick={() => setVacMode('NEW')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  vacMode === 'NEW'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>✍️ + Paciente Nuevo (Solo Vacunación)</span>
              </button>
            </div>

            {/* SELECCIÓN O CARGA DE PACIENTE */}
            {vacMode === 'EXISTING' ? (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <label className="text-slate-800 block font-bold">Seleccionar Paciente de la Clínica *</label>
                <select
                  value={vacPatId}
                  onChange={(e) => setVacPatId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 shadow-2xs text-xs"
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
                      Nombre de la Mascota: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required={vacMode === 'NEW'}
                      value={vacNewPetName}
                      onChange={(e) => setVacNewPetName(e.target.value)}
                      placeholder="ej: Milo, Rocco..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Especie:</label>
                    <select
                      value={vacNewPetSpecies}
                      onChange={(e) => setVacNewPetSpecies(e.target.value as Species)}
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
                      value={vacNewPetBreed}
                      onChange={(e) => setVacNewPetBreed(e.target.value)}
                      placeholder="ej: Caniche, Criollo..."
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sexo:</label>
                    <select
                      value={vacNewPetSex}
                      onChange={(e) => setVacNewPetSex(e.target.value as Sex)}
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
                      value={vacNewPetWeight}
                      onChange={(e) => setVacNewPetWeight(e.target.value)}
                      placeholder="8.5"
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
                      value={vacNewOwnerFirstName}
                      onChange={(e) => setVacNewOwnerFirstName(e.target.value)}
                      placeholder="ej: Carolina"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Apellido:</label>
                    <input
                      type="text"
                      value={vacNewOwnerLastName}
                      onChange={(e) => setVacNewOwnerLastName(e.target.value)}
                      placeholder="ej: Gómez"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Teléfono / WhatsApp: <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required={vacMode === 'NEW'}
                      value={vacNewOwnerPhone}
                      onChange={(e) => setVacNewOwnerPhone(e.target.value)}
                      placeholder="ej: +54 9 358 4123456"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono font-bold text-slate-900 shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">DNI (Opcional):</label>
                    <input
                      type="text"
                      value={vacNewOwnerDni}
                      onChange={(e) => setVacNewOwnerDni(e.target.value)}
                      placeholder="ej: 34.567.890"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECCIÓN BIOLÓGICO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Biológico / Vacuna:</label>
                <input
                  type="text"
                  value={vacName}
                  onChange={(e) => setVacName(e.target.value)}
                  required
                  placeholder="ej: Antirrábica, Séxtuple, Triple Felina..."
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-bold shadow-2xs"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Lote del Fabricante:</label>
                <input
                  type="text"
                  value={vacBatch}
                  onChange={(e) => setVacBatch(e.target.value)}
                  required
                  placeholder="ej: LT-AR-2026"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono font-bold shadow-2xs"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Vencimiento del Lote:</label>
                <input
                  type="date"
                  value={vacExp}
                  onChange={(e) => setVacExp(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-2xs"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">📅 Próximo Refuerzo (Fecha Exacta):</label>
                <input
                  type="date"
                  value={vacNext}
                  onChange={(e) => setVacNext(e.target.value)}
                  required
                  className="w-full bg-white border-2 border-teal-400 rounded-xl p-2.5 text-teal-950 font-mono font-black shadow-2xs"
                />
              </div>
            </div>

            {/* Quick Booster Chips */}
            <div className="bg-teal-50/70 p-3 rounded-2xl border border-teal-200 space-y-1.5">
              <span className="text-[10px] text-teal-900 font-bold uppercase tracking-wider block">
                Calculador Rápido de Refuerzo / Revacunación:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    const d = new Date();
                    d.setDate(d.getDate() + 15);
                    setVacNext(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-300 text-teal-900 rounded-lg font-bold text-[10px] cursor-pointer"
                >
                  +15 Días
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    const d = new Date();
                    d.setDate(d.getDate() + 21);
                    setVacNext(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-300 text-teal-900 rounded-lg font-bold text-[10px] cursor-pointer"
                >
                  +21 Días (Cachorro)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    const d = new Date();
                    d.setMonth(d.getMonth() + 1);
                    setVacNext(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-300 text-teal-900 rounded-lg font-bold text-[10px] cursor-pointer"
                >
                  +1 Mes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    const d = new Date();
                    d.setMonth(d.getMonth() + 3);
                    setVacNext(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-300 text-teal-900 rounded-lg font-bold text-[10px] cursor-pointer"
                >
                  +3 Meses
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    const d = new Date();
                    d.setMonth(d.getMonth() + 6);
                    setVacNext(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-300 text-teal-900 rounded-lg font-bold text-[10px] cursor-pointer"
                >
                  +6 Meses
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    const d = new Date();
                    d.setFullYear(d.getFullYear() + 1);
                    setVacNext(d.toISOString().split('T')[0]);
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-teal-100 border border-teal-300 text-teal-900 rounded-lg font-bold text-[10px] cursor-pointer"
                >
                  +1 Año
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-md shadow-teal-600/20 active:scale-95 transition-all cursor-pointer"
              >
                Registrar en Libreta
              </button>
            </div>
          </form>
        )}

        {/* 11. NUEVO PRODUCTO */}
        {quickModal === 'NUEVO_PRODUCTO' && (
          <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Nombre Comercial:</label>
                <input
                  type="text"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="ej: Enrofloxacina 10%"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Principio Activo:</label>
                <input
                  type="text"
                  value={prodIngr}
                  onChange={(e) => setProdIngr(e.target.value)}
                  placeholder="ej: Enrofloxacina"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Categoría:</label>
                <select
                  value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-slate-900 font-semibold"
                >
                  <option value="MEDICAMENTO">💊 Medicamento</option>
                  <option value="INSUMO_QUIRURGICO">✂️ Insumo Quirúrgico</option>
                  <option value="DESCARTABLE">📦 Descartable</option>
                  <option value="VACUNA">💉 Vacuna</option>
                  <option value="PSICOTROPICO">🔒 Psicotrópico</option>
                  <option value="ALIMENTO">🥩 Alimento</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Stock Inicial:</label>
                <input
                  type="number"
                  value={prodStock}
                  onChange={(e) => setProdStock(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Precio Venta ($):</label>
                <input
                  type="number"
                  value={prodPrice}
                  onChange={(e) => setProdPrice(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-sm"
              >
                Guardar Producto
              </button>
            </div>
          </form>
        )}

        {/* 12. NUEVA FACTURA ARCA / TICKET COMÚN */}
        {quickModal === 'NUEVA_FACTURA' && (
          <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Tipo de Comprobante:</label>
                <select
                  value={invType}
                  onChange={(e) => setInvType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold"
                >
                  <option value="FACTURA_B">🧾 Factura B (ARCA - Consumidor Final)</option>
                  <option value="FACTURA_A">🧾 Factura A (ARCA - Resp. Inscripto)</option>
                  <option value="FACTURA_C">🧾 Factura C (ARCA - Monotributo)</option>
                  <option value="RECIBO_X">📄 Ticket Común / Recibo X (Sin ARCA)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Medio de Pago:</label>
                <select
                  value={invPayMethod}
                  onChange={(e) => setInvPayMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                >
                  <option value="TARJETA_DEBITO">💳 Tarjeta de Débito</option>
                  <option value="TARJETA_CREDITO">💳 Tarjeta de Crédito</option>
                  <option value="TRANSFERENCIA_QR">📱 Transferencia / QR</option>
                  <option value="EFECTIVO">💵 Efectivo</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Nombre / Razón Social del Tutor:</label>
                <input
                  type="text"
                  value={invCustName}
                  onChange={(e) => setInvCustName(e.target.value)}
                  placeholder="ej: María González"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">DNI / CUIT:</label>
                <input
                  type="text"
                  value={invCustDni}
                  onChange={(e) => setInvCustDni(e.target.value)}
                  placeholder="ej: 34112233"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-slate-700 block font-bold mb-1">Concepto / Detalle del Gasto:</label>
                <input
                  type="text"
                  value={invItemDesc}
                  onChange={(e) => setInvItemDesc(e.target.value)}
                  required
                  placeholder="ej: Consulta diurna, Medicamentos y suero..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Total ($ ARS):</label>
                <input
                  type="number"
                  value={invItemAmount}
                  onChange={(e) => setInvItemAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold text-sm"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
              {invType === 'RECIBO_X' ? (
                <span className="text-slate-700 font-medium">
                  ℹ️ Se emitirá un <strong>Ticket / Recibo interno no fiscal</strong> para control y liberación de gasto del propietario sin conexión a ARCA.
                </span>
              ) : (
                <span className="text-emerald-800 font-medium">
                  🔒 Se emitirá un <strong>comprobante fiscal oficial homologado por ARCA (AFIP)</strong> con generación automática de CAE y código QR fiscal.
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black shadow-md shadow-teal-600/20 active:scale-95 transition-all"
              >
                {invType === 'RECIBO_X' ? '✓ Emitir Ticket Común' : '✓ Emitir Factura ARCA (CAE)'}
              </button>
            </div>
          </form>
        )}

        {/* 13. NUEVO PRESUPUESTO */}
        {quickModal === 'NUEVO_PRESUPUESTO' && (
          <form onSubmit={handleCreateEstimate} className="space-y-3 text-xs">
            <div>
              <label className="text-slate-700 block font-bold mb-1">Paciente:</label>
              <select
                value={estPatId}
                onChange={(e) => setEstPatId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="text-slate-700 block font-bold mb-1">Concepto del Procedimiento:</label>
                <input
                  type="text"
                  value={estDesc}
                  onChange={(e) => setEstDesc(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Importe Total ($):</label>
                <input
                  type="number"
                  value={estAmount}
                  onChange={(e) => setEstAmount(Number(e.target.value))}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Condiciones & Aclaraciones:</label>
              <textarea
                value={estNotes}
                onChange={(e) => setEstNotes(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-sm"
              >
                Generar Presupuesto
              </button>
            </div>
          </form>
        )}

        {/* 14. NUEVO CONSENTIMIENTO */}
        {quickModal === 'NUEVO_CONSENTIMIENTO' && (
          <form onSubmit={handleCreateConsentDoc} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-700 block font-bold mb-1">Paciente:</label>
                <select
                  value={docPatId}
                  onChange={(e) => setDocPatId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.species})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 block font-bold mb-1">Tipo de Documento:</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-bold"
                >
                  <option value="ANESTESIA">Consentimiento Anestesia</option>
                  <option value="CIRUGIA">Consentimiento Quirúrgico</option>
                  <option value="INTERNACION">Autorización de Internación</option>
                  <option value="EUTANASIA">Consentimiento de Eutanasia Humanitaria</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Título del Documento:</label>
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 font-semibold"
              />
            </div>

            <div>
              <label className="text-slate-700 block font-bold mb-1">Cláusulas del Consentimiento:</label>
              <textarea
                value={docContent}
                onChange={(e) => setDocContent(e.target.value)}
                rows={4}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setQuickModal(null)}
                className="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold shadow-sm"
              >
                Crear Documento para Firma
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
