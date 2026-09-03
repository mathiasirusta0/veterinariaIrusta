import React, { useState, useMemo } from 'react';
import {
  Receipt,
  DollarSign,
  Printer,
  Download,
  MessageCircle,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  CreditCard,
  Building,
  User,
  Wallet,
  ArrowUpRight,
  Plus,
  RefreshCw,
  QrCode,
  FileText,
  TrendingUp,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import {
  FinancialMovement,
  FinancialPaymentMethod,
  Invoice,
  Estimate,
} from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, StatCard } from './ui';
import {
  printThermalTicket,
  printA4Document,
  downloadHtmlAsPdf,
  downloadReceiptPdf,
  PrintableReceiptData,
  printDailyCashClose,
} from '../utils/printDocumentHelper';

export const FinancesUnifiedView: React.FC = () => {
  const {
    financialMovements,
    invoices,
    estimates,
    patients,
    owners,
    currentUser,
    activeBranch,
    addFinancialMovement,
    createInvoice,
    createEstimate,
    updateEstimateStatus,
    openWhatsAppHub,
    showToast,
    encounterConsumptions,
    getPatientPendingConsumptions,
    billPatientPendingConsumptions,
    addPatientMedicationConsumption,
    hospitalizations,
    products,
    setActiveView,
    setSelectedPatientId,
  } = useVet();

  const activePatients = patients.filter((p) => p.status !== 'ARCHIVADO' && !p.isArchived);

  // Active Main Subtab: 'COBROS' vs 'PRESUPUESTOS'
  const [mainTab, setMainTab] = useState<'COBROS' | 'GASTOS_PACIENTES' | 'PRESUPUESTOS'>('GASTOS_PACIENTES');

  // Dedicated Patient Expenses State
  const [selectedExpensesPatId, setSelectedExpensesPatId] = useState<string>(() => {
    const patWithPending = encounterConsumptions.find((c) => !c.isBilled && c.status !== 'ANULADO');
    return patWithPending?.patientId || patients[0]?.id || '';
  });
  const [expensesFilterTab, setExpensesFilterTab] = useState<'TODOS' | 'CON_SALDO' | 'INTERNADOS'>('CON_SALDO');
  const [expensesSearchQuery, setExpensesSearchQuery] = useState('');
  const [quickAddProductId, setQuickAddProductId] = useState('');
  const [quickAddQuantity, setQuickAddQuantity] = useState(1);
  const [quickAddIncludeConsumables, setQuickAddIncludeConsumables] = useState(true);
  const [settlementPaymentMethod, setSettlementPaymentMethod] = useState<FinancialPaymentMethod>('EFECTIVO');
  const [settlementDiscount, setSettlementDiscount] = useState<number>(0);

  // Form State: Quick Charge / Estimate (Consulta vs Internación vs Particular)
  const [chargeMode, setChargeMode] = useState<'REGISTERED' | 'HOSPITALIZED' | 'CUSTOM'>('REGISTERED');
  const [selectedPatId, setSelectedPatId] = useState('');

  // Custom Client Fields
  const [customOwnerName, setCustomOwnerName] = useState('');
  const [customOwnerPhone, setCustomOwnerPhone] = useState('');
  const [customPetName, setCustomPetName] = useState('');
  const [customPetSpecies, setCustomPetSpecies] = useState('Canino');

  // Charge Details & Itemized Drug / Hospital Breakdown
  const [chargeReason, setChargeReason] = useState('');
  const [chargeAmount, setChargeAmount] = useState<number | ''>('');
  const [chargePaymentMethod, setChargePaymentMethod] = useState<FinancialPaymentMethod>('EFECTIVO');
  const [chargeNotes, setChargeNotes] = useState('');
  const [estimateValidityDays, setEstimateValidityDays] = useState(15);
  const [chargeItems, setChargeItems] = useState<
    { id: string; description: string; quantity: number; unitPrice: number; subtotal: number; isDrug?: boolean; productId?: string }[]
  >([]);
  const [selectedProductIdToAdd, setSelectedProductIdToAdd] = useState('');

  // Search in History
  const [historySearch, setHistorySearch] = useState('');

  // Receipt / Estimate Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCashCloseModal, setShowCashCloseModal] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<PrintableReceiptData | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper: auto-suggest reason from patient status
  const handleAutoSuggestReason = (patId: string) => {
    triggerHaptic('light');
    const pat = patients.find((p) => p.id === patId);
    if (pat) {
      setChargeReason(`Atención clínica y medicación - ${pat.name}`);
      setChargeAmount(15000);
      setChargeItems([
        {
          id: `item-cons-${Date.now()}`,
          description: `Consulta médica y honorarios clínicos - ${pat.name}`,
          quantity: 1,
          unitPrice: 15000,
          subtotal: 15000,
        },
      ]);
      showToast('info', 'Motivo Sugerido', `Cargado para ${pat.name}.`);
    }
  };

  // Helper: Cargar Medicación e Internación con búsqueda automática de precios en Farmacia
  const handleLoadHospitalizationConsumptions = (patId: string) => {
    triggerHaptic('light');
    const pat = patients.find((p) => p.id === patId);
    if (!pat) return;

    // Buscar internación activa del paciente
    const hosp =
      hospitalizations.find((h) => h.patientId === patId && h.status === 'ACTIVA') ||
      hospitalizations.find((h) => h.patientId === patId);

    // Buscar consumos clínicos pendientes
    const unbilled = encounterConsumptions.filter(
      (c) => c.patientId === patId && !c.isBilled && c.status !== 'ANULADO'
    );

    const loadedItems: {
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      isDrug?: boolean;
      productId?: string;
    }[] = [];

    // 1. Desde consumos clínicos registrados
    if (unbilled.length > 0) {
      unbilled.forEach((c) => {
        loadedItems.push({
          id: c.id,
          description: c.concept,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
          subtotal: c.subtotal,
          isDrug: c.sourceType === 'MEDICAMENTO',
          productId: c.productId,
        });
      });
    }

    // 2. Desde sábana de medicación de internación
    if (hosp) {
      if (hosp.medications && hosp.medications.length > 0) {
        hosp.medications.forEach((med) => {
          const alreadyAdded = loadedItems.some((i) =>
            i.description.toLowerCase().includes(med.drugName.toLowerCase())
          );
          if (!alreadyAdded) {
            // Buscar en catálogo de Farmacia por coincidencia exacta o parcial
            const searchNorm = med.drugName.trim().toLowerCase();
            const prod = products.find(
              (p) =>
                p.id === med.productId ||
                p.commercialName.toLowerCase().includes(searchNorm) ||
                p.activeIngredient.toLowerCase().includes(searchNorm) ||
                searchNorm.includes(p.commercialName.toLowerCase())
            );

            const unitPrice = prod?.salePrice || 5200;
            const desc = `${med.drugName} ${med.dose ? `(${med.dose} ${med.route || ''})` : ''} - Farmacia`;

            loadedItems.push({
              id: `med-hosp-${med.id}-${Date.now()}`,
              description: desc,
              quantity: 1,
              unitPrice,
              subtotal: unitPrice,
              isDrug: true,
              productId: prod?.id,
            });
          }
        });
      }

      // 3. Fluidoterapia si está activa
      if (hosp.fluidTherapy?.isActive) {
        const fluidAlreadyAdded = loadedItems.some(
          (i) =>
            i.description.toLowerCase().includes('fluidoterapia') ||
            i.description.toLowerCase().includes('ringer')
        );
        if (!fluidAlreadyAdded) {
          const ringerProd = products.find(
            (p) =>
              p.commercialName.toLowerCase().includes('ringer') ||
              p.commercialName.toLowerCase().includes('fisiol')
          );
          const fluidPrice = ringerProd?.salePrice || 3900;
          loadedItems.push({
            id: `fluid-hosp-${Date.now()}`,
            description: `Fluidoterapia ${hosp.fluidTherapy.solutionType} (${hosp.fluidTherapy.rateMlPerHour} ml/h)`,
            quantity: 1,
            unitPrice: fluidPrice,
            subtotal: fluidPrice,
            productId: ringerProd?.id,
          });
        }
      }

      // 4. Cuidado hospitalario / Canil
      const stayAlreadyAdded = loadedItems.some(
        (i) =>
          i.description.toLowerCase().includes('cuidado hospitalario') ||
          i.description.toLowerCase().includes('canil')
      );
      if (!stayAlreadyAdded) {
        loadedItems.push({
          id: `stay-hosp-${Date.now()}`,
          description: `Atención & Cuidado Hospitalario Canil ${hosp.kennelNumber || 'UCI-01'}`,
          quantity: 1,
          unitPrice: 15000,
          subtotal: 15000,
        });
      }
    }

    // Default fallback si no hay datos de internación
    if (loadedItems.length === 0) {
      loadedItems.push({
        id: `cons-def-${Date.now()}`,
        description: `Atención Médica e Internación - ${pat.name}`,
        quantity: 1,
        unitPrice: 15000,
        subtotal: 15000,
      });
    }

    setChargeItems(loadedItems);
    const total = loadedItems.reduce((sum, it) => sum + it.subtotal, 0);
    setChargeAmount(total);

    const drugNames = loadedItems
      .filter((i) => i.isDrug)
      .map((i) => i.description.split(' - ')[0])
      .join(', ');

    const reasonText = drugNames
      ? `Internación ${hosp?.sector || 'UCI'} (${hosp?.kennelNumber || 'Canil'}) - Medicación: ${drugNames}`
      : `Internación ${hosp?.sector || 'Clínica'} - Cuidados y Atención ${pat.name}`;

    setChargeReason(reasonText);
    showToast(
      'success',
      'Internación & Farmacia Conectada',
      `Se cargaron ${loadedItems.length} ítems de internación y fármacos por $${total.toLocaleString('es-AR')}.`
    );
  };

  // Agregar ítem manual o fármaco adicional desde farmacia
  const handleAddProductToChargeItems = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newItem = {
      id: `it-add-${Date.now()}`,
      description: `${prod.commercialName} (${prod.presentation || prod.concentration}) - Farmacia`,
      quantity: 1,
      unitPrice: prod.salePrice,
      subtotal: prod.salePrice,
      isDrug: true,
      productId: prod.id,
    };

    setChargeItems((prev) => {
      const updated = [...prev, newItem];
      const newTotal = updated.reduce((sum, i) => sum + i.subtotal, 0);
      setChargeAmount(newTotal);
      return updated;
    });

    setSelectedProductIdToAdd('');
    showToast('info', 'Fármaco Agregado', `${prod.commercialName} ($${prod.salePrice.toLocaleString('es-AR')}) añadido a la cuenta.`);
  };

  // Submit quick charge or estimate
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingForm) return;
    setIsSubmittingForm(true);
    triggerHaptic('medium');

    const numAmount = Number(chargeAmount);
    if (!numAmount || numAmount <= 0) {
      showToast('error', 'Monto Requerido', 'Por favor ingrese un monto válido mayor a $0.');
      setIsSubmittingForm(false);
      return;
    }

    if (!chargeReason.trim()) {
      showToast('error', 'Motivo Requerido', 'Por favor describa el motivo de consulta o presupuesto.');
      setIsSubmittingForm(false);
      return;
    }

    let patName = '';
    let patSpecies = '';
    let patBreed = '';
    let patHc = 'S/HC';
    let ownName = '';
    let ownPhone = '';
    let targetPatId: string | undefined = undefined;
    let targetOwnerId: string | undefined = undefined;

    if (chargeMode === 'REGISTERED' || chargeMode === 'HOSPITALIZED') {
      const foundPat = patients.find((p) => p.id === selectedPatId);
      const foundOwn = foundPat ? owners.find((o) => o.id === foundPat.ownerId) : null;
      patName = foundPat?.name || 'Mascota';
      patSpecies = foundPat?.species || 'Canino';
      patBreed = foundPat?.breed || 'Mestizo';
      patHc = foundPat?.clinicalRecordNumber || 'HC-2026';
      ownName = foundOwn ? `${foundOwn.firstName} ${foundOwn.lastName}` : 'Tutor';
      ownPhone = foundOwn?.phone || foundOwn?.whatsapp || '';
      targetPatId = foundPat?.id;
      targetOwnerId = foundOwn?.id;
    } else {
      if (!customOwnerName.trim()) {
        showToast('error', 'Tutor Requerido', 'Por favor ingrese el nombre del tutor o cliente.');
        setIsSubmittingForm(false);
        return;
      }
      patName = customPetName.trim() || 'Mascota';
      patSpecies = customPetSpecies;
      patBreed = 'Particular';
      patHc = 'PARTICULAR';
      ownName = customOwnerName.trim();
      ownPhone = customOwnerPhone.trim();
    }

    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);

    const finalItems =
      chargeItems.length > 0
        ? chargeItems.map((it, idx) => ({
            id: it.id || `inv-it-${Date.now()}-${idx}`,
            description: it.description,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            subtotal: it.subtotal,
          }))
        : [
            {
              id: `inv-it-${Date.now()}`,
              description: chargeReason.trim(),
              quantity: 1,
              unitPrice: numAmount,
              subtotal: numAmount,
            },
          ];

    if (mainTab === 'COBROS') {
      // 1. COBRO REALIZADO
      const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Financial Movement
      addFinancialMovement({
        type: 'INGRESO',
        category: chargeMode === 'HOSPITALIZED' ? 'Internación & UCI' : 'Atención & Consultas',
        concept: `${chargeReason.trim()} - ${patName} (${ownName})`,
        amount: numAmount,
        date: todayStr,
        paymentMethod: chargePaymentMethod,
        clientName: ownName,
        status: 'COBRADO',
        notes: `Comprobante ${receiptNumber}. ${chargeNotes.trim()}`,
        branchId: activeBranch?.id || 'branch-1',
      });

      // Invoice / Recibo X
      createInvoice({
        patientId: targetPatId,
        customerId: targetOwnerId || 'own-gen',
        customerName: ownName,
        customerDni: '',
        customerAddress: 'Las Lajas, Neuquén',
        customerTaxCondition: 'CONSUMIDOR_FINAL',
        type: 'X',
        pointOfSale: 1,
        invoiceNumber: Math.floor(1000 + Math.random() * 9000),
        date: todayStr,
        items: finalItems,
        subtotal: numAmount,
        vatAmount: 0,
        totalAmount: numAmount,
        paymentMethod: chargePaymentMethod,
        isPaid: true,
        branchId: activeBranch?.id || 'branch-1',
      });

      const docData: PrintableReceiptData = {
        receiptNumber,
        date: formatDate(todayStr),
        time: timeStr,
        patientName: patName,
        species: patSpecies,
        breed: patBreed,
        hc: patHc,
        ownerName: ownName,
        ownerPhone: ownPhone,
        reason: chargeReason.trim(),
        items: finalItems,
        total: numAmount,
        paymentMethod: chargePaymentMethod,
        vetInCharge: currentUser?.name || 'Dr. Diego Iván Irusta',
        vetLicense: 'M.P. 502',
        notes: chargeNotes.trim(),
        type: 'COMPROBANTE',
      };

      setCurrentDocument(docData);
      setShowReceiptModal(true);

      showToast(
        'success',
        'Cobro Registrado & Comprobante Emitido',
        `Comprobante ${receiptNumber} por ${formatCurrency(numAmount)} emitido con éxito.`
      );
    } else {
      // 2. PRESUPUESTO CLÍNICO
      const estimateNumber = `PRES-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

      createEstimate({
        patientId: targetPatId || 'pat-gen',
        ownerId: targetOwnerId || 'own-gen',
        branchId: activeBranch?.id || 'branch-1',
        items: finalItems,
        totalAmount: numAmount,
        notes: chargeNotes.trim() || `Presupuesto válido por ${estimateValidityDays} días.`,
        status: 'PENDIENTE',
      });

      const docData: PrintableReceiptData = {
        receiptNumber: estimateNumber,
        date: formatDate(todayStr),
        time: timeStr,
        patientName: patName,
        species: patSpecies,
        breed: patBreed,
        hc: patHc,
        ownerName: ownName,
        ownerPhone: ownPhone,
        reason: chargeReason.trim(),
        items: finalItems,
        total: numAmount,
        paymentMethod: chargePaymentMethod,
        vetInCharge: currentUser?.name || 'Dr. Diego Iván Irusta',
        vetLicense: 'M.P. 502',
        notes: chargeNotes.trim(),
        type: 'PRESUPUESTO',
        validityDays: estimateValidityDays,
      };

      setCurrentDocument(docData);
      setShowReceiptModal(true);

      showToast(
        'success',
        'Presupuesto Creado',
        `Presupuesto ${estimateNumber} por ${formatCurrency(numAmount)} generado con éxito.`
      );
    }

    setChargeNotes('');
  };

  const handleConvertEstimateToCharge = (est: Estimate) => {
    triggerHaptic('medium');
    const pat = patients.find((p) => p.id === est.patientId);
    const own = owners.find((o) => o.id === est.ownerId);

    const receiptNumber = `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const patName = pat?.name || 'Mascota';
    const ownName = own ? `${own.firstName} ${own.lastName}` : 'Tutor Responsable';

    addFinancialMovement({
      type: 'INGRESO',
      category: 'Atención & Consultas',
      concept: `Cobro Presupuesto ${est.estimateNumber} - ${patName} (${ownName})`,
      amount: est.totalAmount,
      date: todayStr,
      paymentMethod: 'TRANSFERENCIA',
      clientName: ownName,
      status: 'COBRADO',
      notes: `Comprobante ${receiptNumber} de Presupuesto ${est.estimateNumber}`,
      branchId: activeBranch?.id || 'branch-1',
    });

    updateEstimateStatus(est.id, 'ACEPTADO');

    const docData: PrintableReceiptData = {
      receiptNumber,
      date: formatDate(todayStr),
      time: '12:00',
      patientName: patName,
      species: pat?.species || 'Canino',
      breed: pat?.breed || 'Mestizo',
      hc: pat?.clinicalRecordNumber || 'HC-2026',
      ownerName: ownName,
      ownerPhone: own?.whatsapp || own?.phone || '',
      reason: est.items.map((i) => i.description).join(', '),
      items: est.items.map((i) => ({
        description: i.description,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        subtotal: i.subtotal,
      })),
      total: est.totalAmount,
      paymentMethod: 'TRANSFERENCIA',
      vetInCharge: currentUser?.name || 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502',
      notes: est.notes,
      type: 'COMPROBANTE',
    };

    setCurrentDocument(docData);
    setShowReceiptModal(true);

    showToast('success', 'Presupuesto Cobrado', `Se registró el cobro y comprobante ${receiptNumber}.`);
  };


  const handlePrintCashClose = () => {
    triggerHaptic('medium');
    printDailyCashClose({
      date: new Date().toLocaleDateString('es-AR'),
      time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
      responsibleName: currentUser?.name || 'Dr. Diego Iván Irusta',
      branchName: activeBranch.name,
      branchAddress: activeBranch.address,
      totalIncome: totalToday,
      totalExpense: 0,
      netBalance: totalToday,
      breakdown: {
        cashTotal,
        transferTotal,
        qrTotal: 0,
        cardTotal: 0,
      },
      transactions: todayMovements.map((m) => ({
        time: m.time || '12:00',
        concept: m.concept,
        clientName: m.clientName || 'Cliente',
        paymentMethod: m.paymentMethod,
        amount: m.amount,
      })),
    });
    showToast('success', 'Arqueo Emitido', 'Cierre de caja oficial enviado a impresión A4.');
  };

  const handleSendWhatsApp = (doc: PrintableReceiptData | null) => {
    if (!doc) return;
    triggerHaptic('light');

    const patient = patients.find((p) => p.clinicalRecordNumber === doc.hc || p.name === doc.patientName);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;

    openWhatsAppHub({
      patientId: patient?.id,
      ownerId: owner?.id,
      patientName: doc.patientName,
      ownerName: doc.ownerName,
      ownerPhone: doc.ownerPhone,
      type: doc.type === 'PRESUPUESTO' ? 'PRESUPUESTO' : 'FACTURA',
      details: {
        invoiceNumber: doc.receiptNumber,
        total: formatCurrency(doc.total),
        paymentMethod: doc.paymentMethod,
        date: doc.date,
        reason: doc.reason,
      },
    });
  };

  // Metrics (Today)
  const todayMovements = useMemo(() => {
    return financialMovements.filter((m) => m.date === todayStr && !m.isVoided && m.type === 'INGRESO');
  }, [financialMovements, todayStr]);

  const totalToday = useMemo(() => {
    return todayMovements.reduce((acc, m) => acc + (m.amount || 0), 0);
  }, [todayMovements]);

  const countToday = todayMovements.length;

  const transferTotal = useMemo(() => {
    return todayMovements
      .filter((m) => m.paymentMethod === 'TRANSFERENCIA' || m.paymentMethod === 'MERCADOPAGO_QR')
      .reduce((acc, m) => acc + (m.amount || 0), 0);
  }, [todayMovements]);

  const cashTotal = useMemo(() => {
    return todayMovements
      .filter((m) => m.paymentMethod === 'EFECTIVO')
      .reduce((acc, m) => acc + (m.amount || 0), 0);
  }, [todayMovements]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    const q = historySearch.toLowerCase().trim();
    return financialMovements
      .filter((m) => m.type === 'INGRESO')
      .filter((m) => {
        if (!q) return true;
        return (
          m.concept.toLowerCase().includes(q) ||
          (m.clientName && m.clientName.toLowerCase().includes(q)) ||
          (m.notes && m.notes.toLowerCase().includes(q)) ||
          m.paymentMethod.toLowerCase().includes(q)
        );
      })
      .slice(0, 30);
  }, [financialMovements, historySearch]);

  const filteredEstimates = useMemo(() => {
    const q = historySearch.toLowerCase().trim();
    return estimates.filter((est) => {
      if (!q) return true;
      const pat = patients.find((p) => p.id === est.patientId);
      const own = owners.find((o) => o.id === est.ownerId);
      const ownFullName = own ? `${own.firstName} ${own.lastName}` : '';
      return (
        est.estimateNumber.toLowerCase().includes(q) ||
        (pat && pat.name.toLowerCase().includes(q)) ||
        (ownFullName && ownFullName.toLowerCase().includes(q)) ||
        est.items.some((i) => i.description.toLowerCase().includes(q))
      );
    });
  }, [estimates, historySearch, patients, owners]);

  return (
    <div className="space-y-3.5 pb-10 w-full max-w-full">
      {/* Header */}
      <PageHeader
        category="Administración & Caja"
        title="Cobros, Comprobantes & Presupuestos"
        description="Gestión simple y ágil de cobros, presupuestos clínicos y emisión con descarga PDF, ticket térmico y WhatsApp"
        icon={Receipt}
      />

      
      {/* Action Bar & Quick Arqueo */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Gestión de Caja Diaria & Arqueos de Turno</span>
        </div>
        <button
          type="button"
          onClick={() => setShowCashCloseModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Printer className="w-4 h-4 text-teal-400" />
          <span>Arqueo & Cierre de Caja Diario</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Cobrado Hoy"
          value={formatCurrency(totalToday)}
          subtitle={`${countToday} cobro${countToday === 1 ? '' : 's'} realizados`}
          icon={DollarSign}
          color="teal"
        />
        <StatCard
          label="Cobros Realizados"
          value={countToday}
          subtitle="Atenciones cobradas hoy"
          icon={Receipt}
          color="emerald"
        />
        <StatCard
          label="Transferencias / MP"
          value={formatCurrency(transferTotal)}
          subtitle="Banco & QR"
          icon={CreditCard}
          color="sky"
        />
        <StatCard
          label="Efectivo en Caja"
          value={formatCurrency(cashTotal)}
          subtitle="Billetes en recepción"
          icon={Wallet}
          color="amber"
        />
      </div>

      {/* Navigation Subtabs: GASTOS_PACIENTES vs COBROS vs PRESUPUESTOS */}
      {(() => {
        const totalPendingCount = encounterConsumptions.filter((c) => !c.isBilled && c.status !== 'ANULADO').length;
        return (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth border-b border-slate-200 pb-2.5 -mx-1 px-1 sm:mx-0 sm:px-0 w-full flex-nowrap">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setMainTab('GASTOS_PACIENTES');
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer flex-shrink-0 whitespace-nowrap min-h-[40px] touch-manipulation ${
                mainTab === 'GASTOS_PACIENTES'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-teal-50 hover:text-teal-900'
              }`}
            >
              <span className="text-base">🐾</span>
              <span>Gastos Clínicos de Pacientes (Medicamentos & Internación)</span>
              {totalPendingCount > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  mainTab === 'GASTOS_PACIENTES' ? 'bg-white text-teal-900' : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {totalPendingCount} pendientes
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setMainTab('COBROS');
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer flex-shrink-0 whitespace-nowrap min-h-[40px] touch-manipulation ${
                mainTab === 'COBROS'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>🧾 Cobros Directos & Recibos</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setMainTab('PRESUPUESTOS');
              }}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer flex-shrink-0 whitespace-nowrap min-h-[40px] touch-manipulation ${
                mainTab === 'PRESUPUESTOS'
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>📋 Presupuestos Clínicos ({estimates.length})</span>
            </button>
          </div>
        );
      })()}

      {/* 💊 PANEL DE CONSUMOS CLÍNICOS & FÁRMACOS PENDIENTES DE COBRO */}
      {(() => {
        const pendingConsumptions = encounterConsumptions.filter(
          (c) => !c.isBilled && c.status !== 'ANULADO'
        );
        if (pendingConsumptions.length === 0) return null;

        const totalPendingAmount = pendingConsumptions.reduce((acc, c) => acc + c.subtotal, 0);

        // Agrupar por paciente
        const groupedByPatient: Record<string, typeof pendingConsumptions> = {};
        pendingConsumptions.forEach((c) => {
          if (!groupedByPatient[c.patientId]) groupedByPatient[c.patientId] = [];
          groupedByPatient[c.patientId].push(c);
        });

        return (
          <div className="bg-amber-50/80 border border-amber-200 rounded-3xl p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-100 text-amber-800 rounded-xl font-black text-sm">💊</span>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-amber-950">
                    Consumos Clínicos & Medicamentos Pendientes de Cobro ({pendingConsumptions.length} ítems)
                  </h4>
                  <p className="text-[11px] text-amber-700">
                    Fármacos y procedimientos administrados a pacientes que aún no fueron liquidados.
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider block">Total por Cobrar</span>
                <span className="text-base font-black text-amber-950 font-mono">
                  ${totalPendingAmount.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {Object.entries(groupedByPatient).map(([patId, items]) => {
                const pat = patients.find((p) => p.id === patId);
                const own = owners.find((o) => o.id === pat?.ownerId);
                const patTotal = items.reduce((sum, i) => sum + i.subtotal, 0);

                return (
                  <div
                    key={patId}
                    className="bg-white border border-amber-200 rounded-2xl p-3 shadow-2xs space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-xs truncate">
                          {pat?.name || 'Paciente'} ({pat?.species || 'Mascota'})
                        </span>
                        <span className="font-mono font-black text-xs text-amber-900">
                          ${patTotal.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Tutor: {own ? `${own.firstName} ${own.lastName}` : 'Consumidor Final'} • {items.length} ítem{items.length === 1 ? '' : 's'}
                      </p>
                      <div className="mt-1.5 space-y-0.5 text-[10px] text-slate-700">
                        {items.slice(0, 2).map((it) => (
                          <div key={it.id} className="truncate text-slate-600">
                            • {it.concept} (${it.subtotal.toLocaleString('es-AR')})
                          </div>
                        ))}
                        {items.length > 2 && (
                          <span className="text-[9px] text-slate-400 italic">
                            +{items.length - 2} ítem(s) adicionales...
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const invoice = billPatientPendingConsumptions(
                            patId,
                            'EFECTIVO',
                            'RECIBO_X'
                          );
                          const docData: PrintableReceiptData = {
                            receiptNumber: invoice.invoiceNumber,
                            date: formatDate(todayStr),
                            time: '12:00',
                            patientName: pat?.name || 'Paciente',
                            species: pat?.species || 'Canino',
                            breed: pat?.breed || 'Mestizo',
                            hc: pat?.clinicalRecordNumber || 'HC-2026',
                            ownerName: own ? `${own.firstName} ${own.lastName}` : 'Consumidor Final',
                            ownerPhone: own?.whatsapp || own?.phone || '',
                            reason: `Liquidación de ${items.length} consumos y fármacos`,
                            items: items.map((i) => ({
                              description: i.concept,
                              quantity: i.quantity,
                              unitPrice: i.unitPrice,
                              subtotal: i.subtotal,
                            })),
                            total: invoice.totalAmount,
                            paymentMethod: 'EFECTIVO',
                            vetInCharge: currentUser?.name || 'Dr. Diego Iván Irusta',
                            vetLicense: 'M.P. 502',
                            type: 'COMPROBANTE',
                          };
                          setCurrentDocument(docData);
                          setShowReceiptModal(true);
                        } catch (err: any) {
                          showToast('error', 'Error al liquidar', err.message);
                        }
                      }}
                      className="w-full py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-[11px] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>Cobrar y Emitir Recibo (${patTotal.toLocaleString('es-AR')})</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Main 2-Column Layout */}
            {/* ======================================================== */}
      {/* 🐾 SUBMÓDULO DEDICADO: GASTOS CLÍNICOS DE PACIENTES */}
      {/* ======================================================== */}
      {mainTab === 'GASTOS_PACIENTES' && (() => {
        const allUnbilledConsumptions = encounterConsumptions.filter(
          (c) => !c.isBilled && c.status !== 'ANULADO'
        );

        // Group unbilled consumptions by patientId
        const consumptionsByPatient = allUnbilledConsumptions.reduce((acc, c) => {
          if (!acc[c.patientId]) acc[c.patientId] = [];
          acc[c.patientId].push(c);
          return acc;
        }, {} as Record<string, typeof allUnbilledConsumptions>);

        // Filter patients
        const displayedPatients = activePatients.filter((p) => {
          const hasPending = (consumptionsByPatient[p.id]?.length || 0) > 0;
          const isHosp = p.status === 'EN_TRATAMIENTO' || hospitalizations.some((h) => h.patientId === p.id && h.status === 'ACTIVA');
          
          if (expensesFilterTab === 'CON_SALDO' && !hasPending) return false;
          if (expensesFilterTab === 'INTERNADOS' && !isHosp) return false;

          if (expensesSearchQuery.trim()) {
            const q = expensesSearchQuery.toLowerCase().trim();
            const own = owners.find((o) => o.id === p.ownerId);
            const ownName = own ? `${own.firstName} ${own.lastName}`.toLowerCase() : '';
            return (
              p.name.toLowerCase().includes(q) ||
              (p.clinicalRecordNumber && p.clinicalRecordNumber.toLowerCase().includes(q)) ||
              ownName.includes(q)
            );
          }
          return true;
        });

        // Current selected patient
        const currentPat = patients.find((p) => p.id === selectedExpensesPatId) || displayedPatients[0] || patients[0];
        const currentPatOwner = owners.find((o) => o.id === currentPat?.ownerId);
        const currentPatConsumptions = currentPat ? (consumptionsByPatient[currentPat.id] || []) : [];
        const currentPatHosp = currentPat ? hospitalizations.find((h) => h.patientId === currentPat.id && h.status === 'ACTIVA') : null;

        // Financial totals for current patient
        const totalMedications = currentPatConsumptions
          .filter((c) => c.sourceType === 'MEDICAMENTO')
          .reduce((sum, c) => sum + c.subtotal, 0);

        const totalSupplies = currentPatConsumptions
          .filter((c) => c.sourceType === 'INSUMO')
          .reduce((sum, c) => sum + c.subtotal, 0);

        const totalProcedures = currentPatConsumptions
          .filter((c) => c.sourceType === 'PROCEDIMIENTO' || c.sourceType === 'CIRUGIA' || c.sourceType === 'ESTUDIO')
          .reduce((sum, c) => sum + c.subtotal, 0);

        const totalHospitalization = currentPatConsumptions
          .filter((c) => c.sourceType === 'HOSPITALIZACION')
          .reduce((sum, c) => sum + c.subtotal, 0);

        const grandTotalPending = currentPatConsumptions.reduce((sum, c) => sum + c.subtotal, 0);
        const finalSettlementTotal = Math.max(0, grandTotalPending - (settlementDiscount || 0));

        return (
          <div className="space-y-5 animate-fade-in">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white rounded-3xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-white/15 rounded-2xl text-xl">🐾</span>
                  <h2 className="text-xl font-black tracking-tight">Liquidación & Gastos Clínicos de Pacientes</h2>
                </div>
                <p className="text-xs text-teal-100 max-w-2xl leading-relaxed">
                  Todos los medicamentos aplicados, descartables (jeringas, agujas, sueros) e internaciones se cargan de forma automatizada a la cuenta del paciente. Seleccione un paciente para revisar su cuenta y liquidar en 1 clic.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/20 text-right">
                  <span className="text-[10px] uppercase font-bold text-teal-200 block">Total General por Cobrar</span>
                  <span className="text-xl font-black font-mono text-white">
                    ${allUnbilledConsumptions.reduce((s, c) => s + c.subtotal, 0).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            {/* 2-Column Split: Selector de Pacientes + Cuenta Corriente */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* COLUMNA IZQUIERDA: LISTADO DE PACIENTES (4 Cols) */}
              <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <span className="font-black text-slate-900 text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5">
                    <span>📋 Pacientes ({displayedPatients.length})</span>
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {allUnbilledConsumptions.length} consumos
                  </span>
                </div>

                {/* Filtros de Pestaña */}
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setExpensesFilterTab('CON_SALDO')}
                    className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                      expensesFilterTab === 'CON_SALDO'
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Con Saldo
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpensesFilterTab('INTERNADOS')}
                    className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                      expensesFilterTab === 'INTERNADOS'
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Internados
                  </button>
                  <button
                    type="button"
                    onClick={() => setExpensesFilterTab('TODOS')}
                    className={`py-1.5 px-2 rounded-lg transition-all text-center ${
                      expensesFilterTab === 'TODOS'
                        ? 'bg-teal-700 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Todos
                  </button>
                </div>

                {/* Buscador de Pacientes */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={expensesSearchQuery}
                    onChange={(e) => setExpensesSearchQuery(e.target.value)}
                    placeholder="Buscar paciente o tutor..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                {/* Lista Scrolleable de Pacientes */}
                <div className="space-y-2 max-h-[520px] overflow-y-auto custom-scrollbar pr-1">
                  {displayedPatients.map((pat) => {
                    const isSelected = pat.id === currentPat?.id;
                    const own = owners.find((o) => o.id === pat.ownerId);
                    const patCons = consumptionsByPatient[pat.id] || [];
                    const patTotal = patCons.reduce((s, c) => s + c.subtotal, 0);
                    const isHosp = pat.status === 'EN_TRATAMIENTO' || hospitalizations.some((h) => h.patientId === pat.id && h.status === 'ACTIVA');

                    return (
                      <button
                        key={pat.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          setSelectedExpensesPatId(pat.id);
                        }}
                        className={`w-full text-left p-3 rounded-2xl border transition-all flex items-start justify-between gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-teal-50/90 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm">
                              {pat.species?.toUpperCase() === 'CANINO' ? '🐕' : pat.species?.toUpperCase() === 'FELINO' ? '🐈' : '🦜'}
                            </span>
                            <span className="font-black text-xs text-slate-900 truncate">
                              {pat.name}
                            </span>
                            {isHosp && (
                              <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[9px] font-black rounded-md">
                                INTERNADO
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {pat.breed} • {pat.clinicalRecordNumber}
                          </p>
                          <p className="text-[10px] text-slate-600 truncate">
                            Tutor: <strong className="text-slate-800">{own ? `${own.firstName} ${own.lastName}` : 'Sin tutor'}</strong>
                          </p>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className={`px-2 py-0.5 rounded-lg font-mono font-black text-xs block ${
                            patTotal > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            ${patTotal.toLocaleString('es-AR')}
                          </span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {patCons.length} ítem{patCons.length === 1 ? '' : 's'}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {displayedPatients.length === 0 && (
                    <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
                      No se encontraron pacientes para este filtro.
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMNA DERECHA: ESTADO DE CUENTA, DESGLOSE & COBRO EN 1-CLIC (8 Cols) */}
              <div className="lg:col-span-8 space-y-4">
                {currentPat ? (
                  <div className="bg-white border-2 border-teal-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
                    {/* Header del Paciente Seleccionado */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-2xl flex-shrink-0 shadow-2xs">
                          {currentPat.species?.toUpperCase() === 'CANINO' ? '🐕' : currentPat.species?.toUpperCase() === 'FELINO' ? '🐈' : '🦜'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-black text-slate-900">{currentPat.name}</h3>
                            <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                              {currentPat.clinicalRecordNumber}
                            </span>
                            {currentPatHosp && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-900 border border-purple-200 text-xs font-black rounded-lg">
                                🏥 Canil: {currentPatHosp.kennelNumber || '01'} ({currentPatHosp.sector || 'UCI'})
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">
                            {currentPat.species} • {currentPat.breed} • Tutor: <strong className="text-slate-800">{currentPatOwner ? `${currentPatOwner.firstName} ${currentPatOwner.lastName}` : 'Consumidor Final'}</strong> ({currentPatOwner?.phone || 'Sin tel.'})
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {currentPatOwner?.phone && (
                          <button
                            type="button"
                            onClick={() => {
                              openWhatsAppHub({
                                patientName: currentPat.name,
                                ownerName: `${currentPatOwner.firstName} ${currentPatOwner.lastName}`,
                                ownerPhone: currentPatOwner.phone,
                                type: 'DEUDA',
                                details: {
                                  total: `$${grandTotalPending.toLocaleString('es-AR')}`,
                                  reason: `Liquidación de ${currentPatConsumptions.length} consumos y medicamentos`,
                                },
                              });
                            }}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>WhatsApp Tutor</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPatientId(currentPat.id);
                            setActiveView('PACIENTES');
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>Ficha 360° →</span>
                        </button>
                      </div>
                    </div>

                    {/* 4 Métricas Clave de Gastos del Paciente */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="bg-teal-50/70 border border-teal-200 p-3.5 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase text-teal-800 block">💊 Medicamentos</span>
                        <span className="text-base sm:text-lg font-black text-teal-950 font-mono">
                          ${totalMedications.toLocaleString('es-AR')}
                        </span>
                      </div>

                      <div className="bg-indigo-50/70 border border-indigo-200 p-3.5 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase text-indigo-800 block">📦 Descartables</span>
                        <span className="text-base sm:text-lg font-black text-indigo-950 font-mono">
                          ${totalSupplies.toLocaleString('es-AR')}
                        </span>
                      </div>

                      <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-2xl">
                        <span className="text-[10px] font-bold uppercase text-purple-800 block">🏥 Internación</span>
                        <span className="text-base sm:text-lg font-black text-purple-950 font-mono">
                          ${totalHospitalization.toLocaleString('es-AR')}
                        </span>
                      </div>

                      <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-2xl">
                        <span className="text-[10px] font-black uppercase text-amber-900 block">💰 Total Pendiente</span>
                        <span className="text-base sm:text-lg font-black text-amber-950 font-mono">
                          ${grandTotalPending.toLocaleString('es-AR')}
                        </span>
                      </div>
                    </div>

                    {/* ⚡ Carga Rápida de Fármaco o Insumo Adicional desde Farmacia */}
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
                        + Agregar Medicamento o Insumo desde Farmacia a este Paciente:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-6">
                          <select
                            value={quickAddProductId}
                            onChange={(e) => setQuickAddProductId(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                          >
                            <option value="">Seleccione fármaco / descartable...</option>
                            {products.filter(p => !p.isArchived).map(p => (
                              <option key={p.id} value={p.id}>
                                {p.commercialName} — ${p.salePrice.toLocaleString('es-AR')} (Stock: {p.currentStock})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={quickAddQuantity}
                            onChange={(e) => setQuickAddQuantity(Math.max(1, Number(e.target.value) || 1))}
                            className="w-full bg-white border border-slate-200 rounded-xl p-2 text-center text-xs font-bold text-slate-900"
                            placeholder="Cant."
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <button
                            type="button"
                            onClick={() => {
                              if (!quickAddProductId) {
                                showToast('error', 'Seleccione un producto', 'Elija un fármaco o descartable del listado.');
                                return;
                              }
                              const selectedProd = products.find(p => p.id === quickAddProductId);
                              if (selectedProd) {
                                addPatientMedicationConsumption(currentPat.id, selectedProd.id, quickAddQuantity, {
                                  includeConsumables: quickAddIncludeConsumables && selectedProd.category === 'MEDICAMENTO',
                                });
                                showToast('success', 'Consumo Añadido', `${selectedProd.commercialName} (x${quickAddQuantity}) sumado a la cuenta.`);
                                setQuickAddProductId('');
                                setQuickAddQuantity(1);
                              }
                            }}
                            className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Sumar a Cuenta</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Tabla Detallada de Consumos del Paciente */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          📄 Desglose de Consumos & Prestaciones ({currentPatConsumptions.length} ítems):
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Valores oficiales de Farmacia Hospitalaria
                        </span>
                      </div>

                      {currentPatConsumptions.length > 0 ? (
                        <div className="overflow-x-auto max-h-72 custom-scrollbar rounded-2xl border border-slate-200">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 text-[10px] text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 sticky top-0 bg-slate-50 z-10">
                              <tr>
                                <th className="p-2.5">Fecha/Hora</th>
                                <th className="p-2.5">Tipo</th>
                                <th className="p-2.5">Concepto / Medicación</th>
                                <th className="p-2.5 text-center">Cant.</th>
                                <th className="p-2.5 text-right">Precio Unit.</th>
                                <th className="p-2.5 text-right">Subtotal</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {currentPatConsumptions.map((c) => (
                                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                                  <td className="p-2.5 font-mono text-slate-500 text-[11px]">
                                    {formatDate(c.performedAt || c.recordedAt)}
                                  </td>
                                  <td className="p-2.5">
                                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                      c.sourceType === 'INSUMO'
                                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                        : c.sourceType === 'HOSPITALIZACION'
                                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                        : 'bg-teal-50 text-teal-800 border border-teal-200'
                                    }`}>
                                      {c.sourceType === 'INSUMO' ? '📦 INSUMO' : c.sourceType === 'HOSPITALIZACION' ? '🏥 ESTADÍA' : '💊 MEDICACIÓN'}
                                    </span>
                                  </td>
                                  <td className="p-2.5 font-bold text-slate-900">{c.concept || c.itemName}</td>
                                  <td className="p-2.5 text-center font-mono font-bold">{c.quantity}</td>
                                  <td className="p-2.5 text-right font-mono text-slate-700">
                                    ${c.unitPrice.toLocaleString('es-AR')}
                                  </td>
                                  <td className="p-2.5 text-right font-mono font-black text-teal-900">
                                    ${c.subtotal.toLocaleString('es-AR')}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                          Este paciente no registra consumos clínicos pendientes. Los fármacos e insumos indicados ya han sido liquidados o no se han cargado prestaciones.
                        </div>
                      )}
                    </div>

                    {/* CAJA DE LIQUIDACIÓN Y COBRO EN 1-CLIC */}
                    {currentPatConsumptions.length > 0 && (
                      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/50 border-2 border-emerald-300 rounded-3xl p-5 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="p-2 bg-emerald-600 text-white rounded-xl font-black text-base">⚡</span>
                            <div>
                              <h4 className="text-sm sm:text-base font-black text-emerald-950">
                                Liquidación & Emisión de Comprobante en 1-Clic
                              </h4>
                              <p className="text-[11px] text-emerald-800">
                                Seleccione la forma de pago y emita automáticamente el Recibo Interno No Fiscal.
                              </p>
                            </div>
                          </div>

                          <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold uppercase text-emerald-800 block">Total a Liquidar</span>
                            <span className="text-2xl font-black font-mono text-emerald-950">
                              ${finalSettlementTotal.toLocaleString('es-AR')}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
                          <div>
                            <label className="font-bold text-slate-700 text-xs block mb-1">
                              Forma de Pago del Tutor:
                            </label>
                            <select
                              value={settlementPaymentMethod}
                              onChange={(e) => setSettlementPaymentMethod(e.target.value as any)}
                              className="w-full bg-white border border-emerald-300 rounded-xl p-2.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            >
                              <option value="EFECTIVO">💵 Efectivo (Billetes en caja)</option>
                              <option value="TRANSFERENCIA">📲 Transferencia Bancaria (Alias / CBU)</option>
                              <option value="MERCADOPAGO_QR">📱 Mercado Pago / QR Dinámico</option>
                              <option value="DEBITO">💳 Tarjeta de Débito</option>
                              <option value="CREDITO">💳 Tarjeta de Crédito</option>
                            </select>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 text-xs block mb-1">
                              Descuento / Bonificación ($):
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={grandTotalPending}
                              value={settlementDiscount || ''}
                              onChange={(e) => setSettlementDiscount(Math.max(0, Number(e.target.value) || 0))}
                              placeholder="0 (opcional)"
                              className="w-full bg-white border border-emerald-300 rounded-xl p-2.5 text-xs font-bold text-slate-900"
                            />
                          </div>

                          <div>
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  triggerHaptic('success');
                                  const invoice = billPatientPendingConsumptions(
                                    currentPat.id,
                                    settlementPaymentMethod as any,
                                    'RECIBO_X',
                                    settlementDiscount
                                  );

                                  const docData: PrintableReceiptData = {
                                    receiptNumber: invoice.invoiceNumber,
                                    date: formatDate(todayStr),
                                    time: new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
                                    patientName: currentPat.name,
                                    species: currentPat.species || 'Canino',
                                    breed: currentPat.breed || 'Mestizo',
                                    hc: currentPat.clinicalRecordNumber || 'HC-2026',
                                    ownerName: currentPatOwner ? `${currentPatOwner.firstName} ${currentPatOwner.lastName}` : 'Consumidor Final',
                                    ownerPhone: currentPatOwner?.phone || '',
                                    reason: `Liquidación de ${currentPatConsumptions.length} consumos clínicos e internación`,
                                    items: currentPatConsumptions.map((i) => ({
                                      description: i.concept || i.itemName,
                                      quantity: i.quantity,
                                      unitPrice: i.unitPrice,
                                      subtotal: i.subtotal,
                                    })),
                                    total: invoice.totalAmount,
                                    paymentMethod: settlementPaymentMethod,
                                    vetInCharge: currentUser?.name || 'Dr. Diego Iván Irusta',
                                    vetLicense: 'M.P. 502',
                                    type: 'COMPROBANTE',
                                  };

                                  setCurrentDocument(docData);
                                  setShowReceiptModal(true);
                                  showToast('success', 'Liquidación Exitosa', `Comprobante ${invoice.invoiceNumber} emitido por $${invoice.totalAmount.toLocaleString('es-AR')}.`);
                                  setSettlementDiscount(0);
                                } catch (err: any) {
                                  showToast('error', 'Error al liquidar', err.message);
                                }
                              }}
                              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <Receipt className="w-4 h-4" />
                              <span>✓ Cobrar Todo y Emitir Recibo</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-400">
                    Seleccione un paciente en la lista izquierda para visualizar su estado de cuenta.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {mainTab !== 'GASTOS_PACIENTES' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANEL IZQUIERDO: FORMULARIO */}
        <div className="lg:col-span-5 bg-white border-2 border-teal-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {mainTab === 'COBROS' ? 'Nuevo Cobro & Emisión de Comprobante' : 'Nuevo Presupuesto Clínico'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {mainTab === 'COBROS' ? 'Completa los datos y emite el recibo' : 'Presupuesta tratamientos o cirugías'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
            {/* Modo Paciente: Consulta vs Internación vs Particular */}
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setChargeMode('REGISTERED');
                  handleAutoSuggestReason(selectedPatId);
                }}
                className={`flex-1 py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  chargeMode === 'REGISTERED'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🐾 Consulta</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setChargeMode('HOSPITALIZED');
                  // Elegir primer paciente internado o el actual
                  const activeHosp = hospitalizations.find((h) => h.status === 'ACTIVA');
                  const patIdToUse = activeHosp ? activeHosp.patientId : selectedPatId;
                  setSelectedPatId(patIdToUse);
                  handleLoadHospitalizationConsumptions(patIdToUse);
                }}
                className={`flex-1 py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  chargeMode === 'HOSPITALIZED'
                    ? 'bg-purple-800 text-white shadow-sm'
                    : 'text-purple-900 bg-purple-50/70 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                <span>🏥 Internación</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setChargeMode('CUSTOM');
                  setChargeItems([]);
                }}
                className={`flex-1 py-2 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  chargeMode === 'CUSTOM'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👤 Particular</span>
              </button>
            </div>

            {/* Selector de Paciente */}
            {chargeMode === 'HOSPITALIZED' ? (
              <div className="space-y-2 bg-purple-50/80 p-3.5 rounded-2xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 bg-purple-200 text-purple-900 rounded-lg text-xs font-black">🏥</span>
                    <label className="text-purple-950 font-bold block">Paciente en Internación *</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLoadHospitalizationConsumptions(selectedPatId)}
                    className="text-[10px] text-purple-900 hover:text-purple-950 font-black bg-white px-2 py-0.5 rounded-lg border border-purple-200 cursor-pointer shadow-2xs"
                  >
                    ⚡ Recargar Fármacos e Internación
                  </button>
                </div>

                <select
                  value={selectedPatId}
                  onChange={(e) => {
                    setSelectedPatId(e.target.value);
                    handleLoadHospitalizationConsumptions(e.target.value);
                  }}
                  className="w-full bg-white border border-purple-300 rounded-xl p-2.5 font-bold text-purple-950 focus:ring-2 focus:ring-purple-500 shadow-2xs text-xs cursor-pointer"
                >
                  {patients.map((p) => {
                    const hosp = hospitalizations.find((h) => h.patientId === p.id && h.status === 'ACTIVA');
                    const own = owners.find((o) => o.id === p.ownerId);
                    return (
                      <option key={p.id} value={p.id}>
                        {hosp ? `🏥 [${hosp.sector || 'UCI'} - ${hosp.kennelNumber || 'Canil'}]` : '🐾'}{' '}
                        {p.name} ({p.species} • {p.breed}) — Tutor: {own ? `${own.firstName} ${own.lastName}` : 'N/A'} ({p.clinicalRecordNumber})
                      </option>
                    );
                  })}
                </select>

                {(() => {
                  const selPat = patients.find((p) => p.id === selectedPatId);
                  const selOwn = selPat ? owners.find((o) => o.id === selPat.ownerId) : null;
                  const selHosp = hospitalizations.find((h) => h.patientId === selectedPatId && h.status === 'ACTIVA');
                  return (
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-purple-900 pt-1 font-medium gap-1">
                      <span>Tutor: <strong className="text-purple-950">{selOwn ? `${selOwn.firstName} ${selOwn.lastName}` : 'N/A'}</strong></span>
                      {selHosp && (
                        <span className="px-2 py-0.5 bg-purple-200/80 text-purple-950 font-black rounded-lg text-[10px]">
                          Canil: {selHosp.kennelNumber || 'UCI'} ({selHosp.priority || 'ESTABLE'})
                        </span>
                      )}
                      <span>Tel: <strong className="text-purple-950">{selOwn?.phone || selOwn?.whatsapp || 'N/A'}</strong></span>
                    </div>
                  );
                })()}
              </div>
            ) : chargeMode === 'REGISTERED' ? (
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label className="text-slate-800 font-bold block">Seleccionar Paciente *</label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleAutoSuggestReason(selectedPatId)}
                      className="text-[10px] text-teal-700 hover:text-teal-800 font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200 cursor-pointer shadow-2xs"
                    >
                      ⚡ Motivo sugerido
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setChargeMode('HOSPITALIZED');
                        handleLoadHospitalizationConsumptions(selectedPatId);
                      }}
                      className="text-[10px] text-purple-800 hover:text-purple-950 font-bold bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200 cursor-pointer shadow-2xs"
                    >
                      🏥 Cargar Internación
                    </button>
                  </div>
                </div>

                <select
                  value={selectedPatId}
                  onChange={(e) => {
                    setSelectedPatId(e.target.value);
                    handleAutoSuggestReason(e.target.value);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 focus:ring-2 focus:ring-teal-500 shadow-2xs text-xs"
                >
                  {patients.map((p) => {
                    const own = owners.find((o) => o.id === p.ownerId);
                    const isHosp = hospitalizations.some((h) => h.patientId === p.id && h.status === 'ACTIVA');
                    return (
                      <option key={p.id} value={p.id}>
                        {isHosp ? '🏥 [Internado]' : '🟢'} {p.name} ({p.species} • {p.breed}) — Tutor: {own ? `${own.firstName} ${own.lastName}` : 'N/A'} ({p.clinicalRecordNumber})
                      </option>
                    );
                  })}
                </select>

                {(() => {
                  const selPat = patients.find((p) => p.id === selectedPatId);
                  const selOwn = selPat ? owners.find((o) => o.id === selPat.ownerId) : null;
                  return (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
                      <span>Tutor: <strong className="text-slate-800">{selOwn ? `${selOwn.firstName} ${selOwn.lastName}` : 'N/A'}</strong></span>
                      <span>Tel: <strong className="text-slate-800">{selOwn?.phone || selOwn?.whatsapp || 'N/A'}</strong></span>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-2.5 bg-amber-50/40 p-3.5 rounded-2xl border border-amber-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Nombre del Tutor / Cliente *</label>
                    <input
                      type="text"
                      required={chargeMode === 'CUSTOM'}
                      value={customOwnerName}
                      onChange={(e) => setCustomOwnerName(e.target.value)}
                      placeholder="Ej: Marcelo Torres"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required={chargeMode === 'CUSTOM'}
                      value={customOwnerPhone}
                      onChange={(e) => setCustomOwnerPhone(e.target.value)}
                      placeholder="Ej: +54 9 358 4123456"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-mono font-bold text-slate-900 shadow-2xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Nombre Mascota (Opcional)</label>
                    <input
                      type="text"
                      value={customPetName}
                      onChange={(e) => setCustomPetName(e.target.value)}
                      placeholder="Ej: Rocco"
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-semibold text-slate-900 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="text-slate-700 font-bold block mb-1">Especie</label>
                    <select
                      value={customPetSpecies}
                      onChange={(e) => setCustomPetSpecies(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold text-slate-900 shadow-2xs"
                    >
                      <option value="Canino">🐕 Canino</option>
                      <option value="Felino">🐈 Felino</option>
                      <option value="Equino">🐎 Equino</option>
                      <option value="Bovino">🐄 Bovino</option>
                      <option value="Exótico">🦜 Exótico / Otro</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 💊 DESGLOSE AUTOMÁTICO DE FÁRMACOS & SERVICIOS SINCRONIZADOS */}
            {chargeItems.length > 0 && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="font-black text-slate-800 text-xs flex items-center gap-1">
                    <span>💊</span> Desglose de Fármacos e Insumos ({chargeItems.length}):
                  </span>
                  <span className="text-[11px] font-mono font-black text-teal-800">
                    Subtotal: ${chargeItems.reduce((s, i) => s + i.subtotal, 0).toLocaleString('es-AR')}
                  </span>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1">
                  {chargeItems.map((item, idx) => (
                    <div key={item.id || idx} className="flex items-center justify-between pt-1.5 text-xs">
                      <div className="flex-1 pr-2 truncate">
                        <span className="font-bold text-slate-900 block truncate">{item.description}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {item.quantity} un. × ${item.unitPrice.toLocaleString('es-AR')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-900">
                          ${item.subtotal.toLocaleString('es-AR')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = chargeItems.filter((_, i) => i !== idx);
                            setChargeItems(updated);
                            const newTotal = updated.reduce((s, i) => s + i.subtotal, 0);
                            setChargeAmount(newTotal);
                          }}
                          className="text-slate-300 hover:text-rose-600 font-bold p-0.5 cursor-pointer text-xs"
                          title="Quitar ítem"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selector rápido para añadir otro fármaco de Farmacia */}
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                  <select
                    value={selectedProductIdToAdd}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddProductToChargeItems(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl p-1.5 font-bold text-slate-800 text-[11px] cursor-pointer"
                  >
                    <option value="">+ Agregar fármaco de Farmacia (Dipirona, Tramadol, etc.)...</option>
                    {products
                      .filter((p) => !p.isArchived)
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.commercialName} ({p.presentation || p.concentration}) • ${p.salePrice.toLocaleString('es-AR')} (Stock: {p.currentStock})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {/* Motivo de Consulta / Concepto */}
            <div>
              <label className="text-slate-800 font-black uppercase text-[11px] tracking-wider block mb-1">
                📝 {mainTab === 'COBROS' ? 'Descripción / Motivo de la Atención o Medicación:' : 'Concepto del Procedimiento / Cirugía:'} *
              </label>
              <textarea
                rows={3}
                required
                value={chargeReason}
                onChange={(e) => setChargeReason(e.target.value)}
                placeholder="Ej: Consulta clínica general + Antibiótico inyectable + Cirugía de esterilización..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 shadow-2xs"
              />
            </div>

            {/* Monto ($) */}
            <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200 space-y-1.5">
              <label className="text-teal-950 font-black uppercase text-[11px] tracking-wider block">
                💵 {mainTab === 'COBROS' ? 'Monto Total del Cobro ($ ARG):' : 'Importe Total Presupuestado ($ ARG):'} *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-teal-800">$</span>
                <input
                  type="number"
                  required
                  min="0.01"
                  step="any"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="15000"
                  className="w-full bg-white border-2 border-teal-400 rounded-xl pl-9 pr-4 py-2.5 text-xl font-black font-mono text-teal-950 focus:ring-2 focus:ring-teal-600 shadow-2xs"
                />
              </div>
            </div>

            {/* Medio de Pago o Validez */}
            {mainTab === 'COBROS' ? (
              <div>
                <label className="text-slate-800 font-black uppercase text-[11px] tracking-wider block mb-1">
                  💳 Medio de Pago: *
                </label>
                <select
                  value={chargePaymentMethod}
                  onChange={(e) => setChargePaymentMethod(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 shadow-2xs"
                >
                  <option value="TRANSFERENCIA">🏦 Transferencia Bancaria (Alias Dr. Diego Iván Irusta)</option>
                  <option value="EFECTIVO">💵 Efectivo en Caja</option>
                  <option value="MERCADOPAGO_QR">📱 Mercado Pago / QR</option>
                  <option value="TARJETA_DEBITO">💳 Tarjeta de Débito</option>
                  <option value="TARJETA_CREDITO">💳 Tarjeta de Crédito</option>
                  <option value="CUENTA_CORRIENTE">⏳ Cuenta Corriente (A cobrar)</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="text-slate-800 font-black uppercase text-[11px] tracking-wider block mb-1">
                  📅 Validez del Presupuesto (Días):
                </label>
                <select
                  value={estimateValidityDays}
                  onChange={(e) => setEstimateValidityDays(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 shadow-2xs"
                >
                  <option value={7}>7 Días</option>
                  <option value={15}>15 Días (Recomendado)</option>
                  <option value={30}>30 Días</option>
                  <option value={60}>60 Días</option>
                </select>
              </div>
            )}

            {/* Observaciones */}
            <div>
              <label className="text-slate-500 font-bold block mb-1">Notas u Observaciones (Opcional):</label>
              <input
                type="text"
                value={chargeNotes}
                onChange={(e) => setChargeNotes(e.target.value)}
                placeholder="Ej: Incluye medicamentos postquirúrgicos"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-700 shadow-2xs font-medium"
              />
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-teal-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {mainTab === 'COBROS' ? <Receipt className="w-5 h-5" /> : <FileSpreadsheet className="w-5 h-5" />}
              <span>
                {mainTab === 'COBROS'
                  ? `Cobrar ${chargeAmount ? formatCurrency(Number(chargeAmount)) : '$0'} & Emitir Comprobante`
                  : `Generar Presupuesto por ${chargeAmount ? formatCurrency(Number(chargeAmount)) : '$0'}`}
              </span>
            </button>
          </form>
        </div>

        {/* PANEL DERECHO: HISTORIAL */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                {mainTab === 'COBROS' ? 'Comprobantes & Cobros Realizados' : 'Presupuestos Clínicos Emitidos'}
              </h3>
              <p className="text-xs text-slate-500">
                {mainTab === 'COBROS'
                  ? 'Descarga PDF, ticket térmico y reenvío por WhatsApp'
                  : 'Presupuestos activos con conversión a cobro en 1 clic'}
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Buscar por paciente, tutor..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {mainTab === 'COBROS' ? (
            filteredHistory.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No hay cobros registrados"
                description="Utilice el formulario de la izquierda para registrar la primera atención y emitir su comprobante."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredHistory.map((mov) => {
                  const receiptNum = mov.notes?.includes('REC-2026')
                    ? mov.notes.split('Comprobante ')[1]?.split('.')[0] || 'REC-2026'
                    : 'REC-${new Date().getFullYear()}-0001';
                  const patName = mov.concept.split(' - ')[1]?.split(' (')[0] || 'Mascota';

                  const docData: PrintableReceiptData = {
                    receiptNumber: receiptNum,
                    date: formatDate(mov.date),
                    time: '12:00',
                    patientName: patName,
                    species: 'Canino/Felino',
                    breed: 'Veterinaria Ranquel',
                    hc: 'HC-2026',
                    ownerName: mov.clientName || 'Tutor Responsable',
                    ownerPhone: '+54 9 2942 47-7136',
                    reason: mov.concept,
                    total: mov.amount,
                    paymentMethod: mov.paymentMethod,
                    vetInCharge: 'Dr. Diego Iván Irusta',
                    vetLicense: 'M.P. 502',
                    notes: mov.notes,
                    type: 'COMPROBANTE',
                  };

                  return (
                    <div
                      key={mov.id}
                      className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2.5 rounded-2xl transition-colors"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-900">{mov.date}</span>
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200">
                            {mov.paymentMethod}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">•</span>
                          <strong className="text-xs text-slate-900">{mov.clientName || 'Cliente'}</strong>
                        </div>
                        <p className="text-xs font-semibold text-slate-700 line-clamp-1">{mov.concept}</p>
                        {mov.notes && <p className="text-[11px] text-slate-400 font-mono">{mov.notes}</p>}
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                        <strong className="text-sm sm:text-base font-black font-mono text-teal-900 mr-1">
                          {formatCurrency(mov.amount)}
                        </strong>

                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setCurrentDocument(docData);
                            setShowReceiptModal(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title="Ver / Opciones de Comprobante"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            printThermalTicket(docData);
                          }}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title="Imprimir Ticket Térmico (80mm)"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Ticket</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            downloadHtmlAsPdf(docData);
                          }}
                          className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title="Descargar o Imprimir PDF A4"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendWhatsApp(docData)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title="Enviar por WhatsApp al tutor"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : filteredEstimates.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title="No hay presupuestos generados"
              description="Utilice el formulario de la izquierda para crear un presupuesto clínico."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredEstimates.map((est) => {
                const pat = patients.find((p) => p.id === est.patientId);
                const own = owners.find((o) => o.id === est.ownerId);
                const ownName = own ? `${own.firstName} ${own.lastName}` : 'Tutor Responsable';

                const docData: PrintableReceiptData = {
                  receiptNumber: est.estimateNumber,
                  date: formatDate(est.createdAt || todayStr),
                  time: '12:00',
                  patientName: pat?.name || 'Mascota',
                  species: pat?.species || 'Canino',
                  breed: pat?.breed || 'Mestizo',
                  hc: pat?.clinicalRecordNumber || 'HC-2026',
                  ownerName: ownName,
                  ownerPhone: own?.whatsapp || own?.phone || '',
                  reason: est.items.map((i) => i.description).join(', '),
                  items: est.items.map((i) => ({
                    description: i.description,
                    quantity: i.quantity,
                    unitPrice: i.unitPrice,
                    subtotal: i.subtotal,
                  })),
                  total: est.totalAmount,
                  paymentMethod: 'PRESUPUESTO',
                  vetInCharge: 'Dr. Diego Iván Irusta',
                  vetLicense: 'M.P. 502',
                  notes: est.notes,
                  type: 'PRESUPUESTO',
                };

                return (
                  <div
                    key={est.id}
                    className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2.5 rounded-2xl transition-colors"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                          {est.estimateNumber}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                            est.status === 'ACEPTADO'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : est.status === 'RECHAZADO'
                              ? 'bg-red-50 text-red-800 border border-red-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {est.status}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">•</span>
                        <strong className="text-xs text-slate-900">{pat?.name || 'Mascota'} ({ownName})</strong>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                        {est.items.map((i) => i.description).join(', ')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                      <strong className="text-sm sm:text-base font-black font-mono text-teal-900 mr-1">
                        {formatCurrency(est.totalAmount)}
                      </strong>

                      {est.status === 'PENDIENTE' && (
                        <button
                          type="button"
                          onClick={() => handleConvertEstimateToCharge(est)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-2xs"
                          title="Aceptar y cobrar presupuesto en caja"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Cobrar</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          printThermalTicket(docData);
                        }}
                        className="px-2 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        title="Imprimir Ticket Térmico"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Ticket</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic('light');
                          downloadHtmlAsPdf(docData);
                        }}
                        className="px-2 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        title="Descargar PDF A4"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendWhatsApp(docData)}
                        className="px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                        title="Enviar Presupuesto por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      )}

      {/* MODAL DOCUMENTO OFICIAL (COMPROBANTE / PRESUPUESTO) CON DESCARGA PDF & TICKET */}
      {showReceiptModal && currentDocument && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {currentDocument.type === 'PRESUPUESTO' ? 'Presupuesto Clínico Oficial' : 'Comprobante Oficial de Pago'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Vista Previa del Documento */}
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3.5 text-xs text-slate-800">
              <div className="pb-3 border-b-2 border-slate-200 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <img
                    src="/logo-ranquel.png"
                    alt="Logo Veterinaria Ranquel"
                    className="w-14 h-14 rounded-2xl object-contain bg-white p-1 border-2 border-teal-300 shadow-sm flex-shrink-0"
                  />
                  <div>
                    <span className="font-extrabold text-teal-800 uppercase tracking-widest text-[10px] sm:text-[11px] block">
                      VETERINARIA RANQUEL — CENTRO HOSPITALARIO
                    </span>
                    <h4 className="font-black text-slate-900 text-sm sm:text-base uppercase tracking-tight">
                      {currentDocument.type === 'PRESUPUESTO' ? 'PRESUPUESTO CLÍNICO OFICIAL' : 'COMPROBANTE DE PAGO & RECIBO'}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Casa 13, Barrio Militar de Oficiales, Las Lajas (Neuquén) • Tel: +54 9 2942 47-7136 • Dr. Diego Iván Irusta (M.P. 502)
                    </p>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="px-3 py-1 bg-teal-100 text-teal-950 font-mono font-black text-xs rounded-full border border-teal-300 shadow-2xs">
                    Nº {currentDocument.receiptNumber}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block text-center sm:text-right mt-1">
                    {currentDocument.date} {currentDocument.time}
                  </span>
                </div>
              </div>

              {/* Paciente y Tutor */}
              <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Paciente:</span>
                  <strong className="text-slate-900 text-sm block">{currentDocument.patientName}</strong>
                  <span className="text-[11px] text-slate-500">
                    {currentDocument.species} {currentDocument.breed ? `• ${currentDocument.breed}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tutor Responsable:</span>
                  <strong className="text-slate-800 block text-xs">{currentDocument.ownerName}</strong>
                  <span className="text-[11px] text-slate-500 block">
                    Tel: {currentDocument.ownerPhone || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Detalle */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">
                  {currentDocument.type === 'PRESUPUESTO' ? 'Concepto Presupuestado:' : 'Motivo de Consulta / Prestación:'}
                </span>
                <p className="text-xs font-bold text-slate-900 leading-relaxed">{currentDocument.reason}</p>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span>Medio de Pago: <strong className="text-slate-700 uppercase">{currentDocument.paymentMethod}</strong></span>
                  <span className="text-slate-400">
                    Estado: <strong className="text-emerald-700">{currentDocument.type === 'PRESUPUESTO' ? 'PENDIENTE' : 'ABONADO'}</strong>
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="bg-teal-50/90 p-3.5 rounded-2xl border-2 border-teal-300 flex items-center justify-between">
                <span className="text-sm font-black text-teal-950 uppercase">
                  {currentDocument.type === 'PRESUPUESTO' ? 'TOTAL PRESUPUESTADO:' : 'TOTAL ABONADO:'}
                </span>
                <strong className="text-xl font-black font-mono text-teal-900">
                  {formatCurrency(currentDocument.total)}
                </strong>
              </div>

              {currentDocument.notes && (
                <div className="bg-white p-2 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-400 text-[10px] block">Observaciones:</span>
                  <p>{currentDocument.notes}</p>
                </div>
              )}

              {/* Pie */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-[11px] text-slate-600">
                <div>
                  <p className="font-black text-slate-900">{currentDocument.vetInCharge}</p>
                  <p className="font-mono text-slate-500">Médico Veterinario • Matrícula {currentDocument.vetLicense}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-mono bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{currentDocument.type === 'PRESUPUESTO' ? 'PRESUPUESTO OFICIAL' : 'PAGO VERIFICADO'}</span>
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN: DESCARGA PDF, TICKET TÉRMICO, A4, WHATSAPP & CONVERSIÓN */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              {/* Botón de alternancia Presupuesto / Recibo */}
              <div className="flex items-center justify-between bg-slate-100/80 p-2 rounded-2xl border border-slate-200 text-xs">
                <span className="text-slate-600 font-bold">
                  {currentDocument.type === 'PRESUPUESTO' ? '¿Desea facturar este presupuesto?' : '¿Desea generar un presupuesto clínico?'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('medium');
                    const newType = currentDocument.type === 'PRESUPUESTO' ? 'COMPROBANTE' : 'PRESUPUESTO';
                    const newNum = newType === 'PRESUPUESTO' 
                      ? (currentDocument.receiptNumber.startsWith('PRES') ? currentDocument.receiptNumber : `PRES-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`)
                      : (currentDocument.receiptNumber.startsWith('REC') ? currentDocument.receiptNumber : `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
                    
                    setCurrentDocument({
                      ...currentDocument,
                      type: newType,
                      receiptNumber: newNum,
                    });
                    showToast('info', 'Formato Actualizado', `Cambiado a ${newType === 'PRESUPUESTO' ? 'Presupuesto Clínico' : 'Comprobante de Pago'}`);
                  }}
                  className="px-3 py-1 bg-white hover:bg-slate-50 text-teal-800 font-black rounded-xl border border-slate-300 shadow-2xs transition-all active:scale-95 cursor-pointer"
                >
                  {currentDocument.type === 'PRESUPUESTO' ? '💳 Cambiar a Comprobante de Pago' : '📋 Convertir a Presupuesto Oficial'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    triggerHaptic('medium');
                    showToast('info', 'Generando PDF', `Descargando ${currentDocument.type === 'PRESUPUESTO' ? 'presupuesto oficial' : 'comprobante de pago'}...`);
                    const ok = await downloadReceiptPdf(currentDocument);
                    if (ok) {
                      showToast('success', 'PDF Descargado', `${currentDocument.type === 'PRESUPUESTO' ? 'Presupuesto' : 'Comprobante'} guardado en su carpeta de descargas.`);
                    }
                  }}
                  className="px-3 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-teal-600/20 active:scale-95"
                  title="Descargar documento oficial en PDF A4 limpio y membretado"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    showToast('info', 'Impresión A4', 'Abriendo vista de impresión A4 membretada...');
                    printA4Document(currentDocument);
                  }}
                  className="px-3 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20 active:scale-95"
                  title="Imprimir documento membretado en hoja A4"
                >
                  <FileText className="w-4 h-4" />
                  <span>Imprimir A4</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    showToast('info', 'Ticket Térmico', 'Abriendo diálogo para ticketera de 80mm...');
                    printThermalTicket(currentDocument);
                  }}
                  className="px-3 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-600/20 active:scale-95"
                  title="Imprimir ticket para impresora térmica de 80mm"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Ticket</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(currentDocument)}
                  className="px-3 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
                  title="Enviar documento por WhatsApp al tutor"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
