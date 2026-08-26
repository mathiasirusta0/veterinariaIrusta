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
  } = useVet();

  // Active Main Subtab: 'COBROS' vs 'PRESUPUESTOS'
  const [mainTab, setMainTab] = useState<'COBROS' | 'PRESUPUESTOS'>('COBROS');

  // Form State: Quick Charge / Estimate
  const [chargeMode, setChargeMode] = useState<'REGISTERED' | 'CUSTOM'>('REGISTERED');
  const [selectedPatId, setSelectedPatId] = useState(patients[0]?.id || '');

  // Custom Client Fields
  const [customOwnerName, setCustomOwnerName] = useState('');
  const [customOwnerPhone, setCustomOwnerPhone] = useState('');
  const [customPetName, setCustomPetName] = useState('');
  const [customPetSpecies, setCustomPetSpecies] = useState('Canino');

  // Charge Details
  const [chargeReason, setChargeReason] = useState('Consulta clínica general + Medicación');
  const [chargeAmount, setChargeAmount] = useState<number | ''>(15000);
  const [chargePaymentMethod, setChargePaymentMethod] = useState<FinancialPaymentMethod>('TRANSFERENCIA');
  const [chargeNotes, setChargeNotes] = useState('');
  const [estimateValidityDays, setEstimateValidityDays] = useState(15);

  // Search in History
  const [historySearch, setHistorySearch] = useState('');

  // Receipt / Estimate Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showCashCloseModal, setShowCashCloseModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<PrintableReceiptData | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper: auto-suggest reason from patient status
  const handleAutoSuggestReason = (patId: string) => {
    triggerHaptic('light');
    const pat = patients.find((p) => p.id === patId);
    if (pat) {
      setChargeReason(`Atención clínica y medicación - ${pat.name}`);
      setChargeAmount(15000);
      showToast('info', 'Motivo Sugerido', `Cargado para ${pat.name}.`);
    }
  };

  // Submit quick charge or estimate
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    const numAmount = Number(chargeAmount);
    if (!numAmount || numAmount <= 0) {
      showToast('error', 'Monto Requerido', 'Por favor ingrese un monto válido mayor a $0.');
      return;
    }

    if (!chargeReason.trim()) {
      showToast('error', 'Motivo Requerido', 'Por favor describa el motivo de consulta o presupuesto.');
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

    if (chargeMode === 'REGISTERED') {
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

    if (mainTab === 'COBROS') {
      // 1. COBRO REALIZADO
      const receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // Financial Movement
      addFinancialMovement({
        type: 'INGRESO',
        category: 'Atención & Consultas',
        concept: `${chargeReason.trim()} - ${patName} (${ownName})`,
        amount: numAmount,
        date: todayStr,
        paymentMethod: chargePaymentMethod,
        clientName: ownName,
        status: 'COBRADO',
        notes: `Comprobante ${receiptNumber}. ${chargeNotes.trim()}`,
        branchId: activeBranch?.id || 'branch-central',
      });

      // Invoice / Recibo X
      createInvoice({
        patientId: targetPatId,
        customerId: targetOwnerId || 'own-gen',
        customerName: ownName,
        customerDni: '',
        customerAddress: 'Río Cuarto, Córdoba',
        customerTaxCondition: 'CONSUMIDOR_FINAL',
        type: 'X',
        pointOfSale: 1,
        invoiceNumber: Math.floor(1000 + Math.random() * 9000),
        date: todayStr,
        items: [
          {
            description: chargeReason.trim(),
            quantity: 1,
            unitPrice: numAmount,
            subtotal: numAmount,
          },
        ],
        subtotal: numAmount,
        vatAmount: 0,
        totalAmount: numAmount,
        paymentMethod: chargePaymentMethod,
        isPaid: true,
        branchId: activeBranch?.id || 'branch-central',
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
        items: [
          {
            description: chargeReason.trim(),
            quantity: 1,
            unitPrice: numAmount,
            subtotal: numAmount,
          },
        ],
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
      const estimateNumber = `PRES-2026-${Math.floor(100 + Math.random() * 900)}`;

      createEstimate({
        patientId: targetPatId || 'pat-gen',
        ownerId: targetOwnerId || 'own-gen',
        branchId: activeBranch?.id || 'branch-central',
        items: [
          {
            id: `est-item-${Date.now()}`,
            description: chargeReason.trim(),
            quantity: 1,
            unitPrice: numAmount,
            subtotal: numAmount,
          },
        ],
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
        items: [
          {
            description: chargeReason.trim(),
            quantity: 1,
            unitPrice: numAmount,
            subtotal: numAmount,
          },
        ],
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

    const receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
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
      branchId: activeBranch?.id || 'branch-central',
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
    <div className="space-y-6 pb-12 w-full max-w-full">
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

      {/* Navigation Subtabs: COBROS vs PRESUPUESTOS */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth border-b border-slate-200 pb-2.5 -mx-1 px-1 sm:mx-0 sm:px-0 w-full flex-nowrap">
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
          <span>🧾 Cobros & Comprobantes de Pago</span>
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

      {/* Main 2-Column Layout */}
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
            {/* Modo Paciente */}
            <div className="p-1 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setChargeMode('REGISTERED');
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  chargeMode === 'REGISTERED'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🐾 Paciente de la Clínica</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setChargeMode('CUSTOM');
                }}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  chargeMode === 'CUSTOM'
                    ? 'bg-teal-700 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👤 Cliente / Particular</span>
              </button>
            </div>

            {/* Selector de Paciente */}
            {chargeMode === 'REGISTERED' ? (
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-bold block">Seleccionar Paciente *</label>
                  <button
                    type="button"
                    onClick={() => handleAutoSuggestReason(selectedPatId)}
                    className="text-[10px] text-teal-700 hover:text-teal-800 font-bold bg-white px-2 py-0.5 rounded-lg border border-slate-200 cursor-pointer shadow-2xs"
                  >
                    ⚡ Cargar motivo sugerido
                  </button>
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
                    return (
                      <option key={p.id} value={p.id}>
                        🟢 {p.name} ({p.species} • {p.breed}) — Tutor: {own ? `${own.firstName} ${own.lastName}` : 'N/A'} ({p.clinicalRecordNumber})
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
                    : 'REC-2026-0001';
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
              <div className="text-center pb-3 border-b-2 border-slate-200">
                <span className="font-extrabold text-teal-800 uppercase tracking-widest text-[11px] block">
                  VETERINARIA RANQUEL — CENTRO HOSPITALARIO VETERINARIO
                </span>
                <h4 className="font-black text-slate-900 text-sm mt-0.5 uppercase tracking-wide">
                  {currentDocument.type === 'PRESUPUESTO' ? 'PRESUPUESTO CLÍNICO' : 'COMPROBANTE DE PAGO & RECIBO'}
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  Río Cuarto, Córdoba • Tel/WhatsApp: +54 9 2942 47-7136 • Dirección Médica: Dr. Diego Iván Irusta (M.P. 502)
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-teal-100/80 text-teal-900 font-mono font-black text-xs rounded-full border border-teal-300">
                  Nº {currentDocument.receiptNumber} • {currentDocument.date} {currentDocument.time}
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

            {/* BOTONES DE ACCIÓN: DESCARGA PDF, TICKET TÉRMICO, A4, WHATSAPP */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => downloadHtmlAsPdf(currentDocument)}
                  className="px-3 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-teal-600/20 active:scale-95"
                  title="Descargar documento oficial en PDF A4"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => printThermalTicket(currentDocument)}
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
