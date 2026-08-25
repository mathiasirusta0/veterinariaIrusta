import React, { useState, useMemo } from 'react';
import {
  Receipt,
  DollarSign,
  Printer,
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
} from 'lucide-react';
import { useVet } from '../context/VetContext';
import {
  FinancialMovement,
  FinancialPaymentMethod,
  Invoice,
} from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { triggerHaptic } from '../utils/haptics';
import { PageHeader, EmptyState, StatCard } from './ui';

export const FinancesUnifiedView: React.FC = () => {
  const {
    financialMovements,
    invoices,
    patients,
    owners,
    hospitalizations,
    currentUser,
    activeBranch,
    addFinancialMovement,
    createInvoice,
    openWhatsAppHub,
    showToast,
  } = useVet();

  // Form State: Quick Charge
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

  // Search in History
  const [historySearch, setHistorySearch] = useState('');

  // Receipt Modal State
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState<{
    receiptNumber: string;
    date: string;
    time: string;
    patientName: string;
    species: string;
    breed: string;
    hc: string;
    ownerName: string;
    ownerPhone: string;
    reason: string;
    total: number;
    paymentMethod: FinancialPaymentMethod;
    vetInCharge: string;
    vetLicense: string;
    notes?: string;
  } | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Helper: auto-suggest reason from patient status / hospitalization
  const handleAutoSuggestReason = (patId: string) => {
    triggerHaptic('light');
    const pat = patients.find((p) => p.id === patId);
    const hosp = hospitalizations.find((h) => h.patientId === patId && h.status === 'ACTIVA');

    if (hosp) {
      const days = Math.max(
        1,
        Math.ceil(
          (new Date().getTime() - new Date((hosp as any).admittedAt || (hosp as any).admissionDate || todayStr).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      );
      setChargeReason(
        `Internación en ${hosp.sector === 'UCI' ? 'Terapia Intensiva / UCI' : 'Caniles Generales'} (${hosp.kennelNumber}) - ${days} día${days > 1 ? 's' : ''} + Plan de Sueros y Medicación`
      );
      setChargeAmount(days * (hosp.sector === 'UCI' ? 35000 : 25000) + 15000);
      showToast('info', 'Internación Detectada', 'Se completó el motivo y monto sugerido por internación.');
    } else if (pat) {
      setChargeReason(`Atención clínica y medicación - ${pat.name}`);
      setChargeAmount(15000);
    }
  };

  // Submit quick charge and emit receipt
  const handleSubmitCharge = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');

    const numAmount = Number(chargeAmount);
    if (!numAmount || numAmount <= 0) {
      showToast('error', 'Monto Requerido', 'Por favor ingrese un monto válido mayor a $0.');
      return;
    }

    if (!chargeReason.trim()) {
      showToast('error', 'Motivo Requerido', 'Por favor describa el motivo de consulta o atención.');
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

    const receiptNumber = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = now.toTimeString().slice(0, 5);

    // 1. Add Financial Movement (Ingreso)
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

    // 2. Add Invoice / Recibo X
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

    // 3. Set Receipt Object
    const receiptData = {
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
      total: numAmount,
      paymentMethod: chargePaymentMethod,
      vetInCharge: currentUser?.name || 'Dr. Diego Irusta',
      vetLicense: 'MP 8412',
      notes: chargeNotes.trim(),
    };

    setCurrentReceipt(receiptData);
    setShowReceiptModal(true);

    showToast(
      'success',
      'Cobro Registrado & Comprobante Emitido',
      `Comprobante ${receiptNumber} por ${formatCurrency(numAmount)} emitido con éxito.`
    );

    // Reset fields
    setChargeNotes('');
  };

  const handleSendReceiptWhatsApp = (rec: typeof currentReceipt) => {
    if (!rec) return;
    triggerHaptic('light');

    const patient = patients.find((p) => p.clinicalRecordNumber === rec.hc || p.name === rec.patientName);
    const owner = patient ? owners.find((o) => o.id === patient.ownerId) : null;

    openWhatsAppHub({
      patientId: patient?.id,
      ownerId: owner?.id,
      patientName: rec.patientName,
      ownerName: rec.ownerName,
      ownerPhone: rec.ownerPhone,
      type: 'FACTURA',
      details: {
        invoiceNumber: rec.receiptNumber,
        total: formatCurrency(rec.total),
        paymentMethod: rec.paymentMethod,
        date: rec.date,
        reason: rec.reason,
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

  // Combined History List (Invoices / Receipts & Movements)
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

  return (
    <div className="space-y-6 pb-12 w-full max-w-full">
      {/* Header */}
      <PageHeader
        category="Administración & Caja"
        title="Cobros & Comprobantes de Pago"
        description="Carga simple y directa de motivo de atención, monto del cobro y emisión instantánea de comprobantes PDF y WhatsApp"
        icon={Receipt}
      />

      {/* KPI Cards: Resumen Rápido del Día */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
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

      {/* Main 2-Column Layout: Formulario de Cobro Directo + Historial Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANEL IZQUIERDO: FORMULARIO DE COBRO RÁPIDO */}
        <div className="lg:col-span-5 bg-white border-2 border-teal-200/90 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="w-9 h-9 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Nuevo Cobro & Emisión de Comprobante</h3>
              <p className="text-xs text-slate-500 font-medium">Completa los 3 datos y emite el recibo</p>
            </div>
          </div>

          <form onSubmit={handleSubmitCharge} className="space-y-4 text-xs">
            {/* 1. MODO: PACIENTE REGISTRADO VS CLIENTE PARTICULAR */}
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

            {/* SELECCIÓN DE PACIENTE / CLIENTE */}
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
                    const isInterned = p.status === 'INTERNADO';
                    return (
                      <option key={p.id} value={p.id}>
                        {isInterned ? '🏥 [INTERNADO] ' : '🟢 '}
                        {p.name} ({p.species} • {p.breed}) — Tutor: {own ? `${own.firstName} ${own.lastName}` : 'N/A'} ({p.clinicalRecordNumber})
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

            {/* 2. MOTIVO DE CONSULTA / ATENCIÓN / MEDICACIÓN */}
            <div>
              <label className="text-slate-800 font-black uppercase text-[11px] tracking-wider block mb-1">
                📝 Descripción / Motivo de la Atención o Medicación: *
              </label>
              <textarea
                rows={3}
                required
                value={chargeReason}
                onChange={(e) => setChargeReason(e.target.value)}
                placeholder="Ej: Consulta clínica general + Antibiótico inyectable + Protector gástrico..."
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl p-3 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 shadow-2xs"
              />
            </div>

            {/* 3. MONTO DEL COBRO ($) */}
            <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200 space-y-1.5">
              <label className="text-teal-950 font-black uppercase text-[11px] tracking-wider block">
                💵 Monto Total del Cobro ($ ARG): *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lg font-black text-teal-800">$</span>
                <input
                  type="number"
                  required
                  min="1"
                  step="100"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value ? Number(e.target.value) : '')}
                  placeholder="15000"
                  className="w-full bg-white border-2 border-teal-400 rounded-xl pl-9 pr-4 py-2.5 text-xl font-black font-mono text-teal-950 focus:ring-2 focus:ring-teal-600 shadow-2xs"
                />
              </div>
            </div>

            {/* 4. MEDIO DE PAGO */}
            <div>
              <label className="text-slate-800 font-black uppercase text-[11px] tracking-wider block mb-1">
                💳 Medio de Pago: *
              </label>
              <select
                value={chargePaymentMethod}
                onChange={(e) => setChargePaymentMethod(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-bold text-slate-900 shadow-2xs"
              >
                <option value="TRANSFERENCIA">🏦 Transferencia Bancaria (Alias Dr. Diego Irusta)</option>
                <option value="EFECTIVO">💵 Efectivo en Caja</option>
                <option value="MERCADOPAGO_QR">📱 Mercado Pago / QR</option>
                <option value="TARJETA_DEBITO">💳 Tarjeta de Débito</option>
                <option value="TARJETA_CREDITO">💳 Tarjeta de Crédito</option>
                <option value="CUENTA_CORRIENTE">⏳ Cuenta Corriente (A cobrar)</option>
              </select>
            </div>

            {/* NOTAS OPCIONALES */}
            <div>
              <label className="text-slate-500 font-bold block mb-1">Notas u Observaciones (Opcional):</label>
              <input
                type="text"
                value={chargeNotes}
                onChange={(e) => setChargeNotes(e.target.value)}
                placeholder="Ej: Paciente dado de alta / Control en 48hs"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-slate-700 shadow-2xs font-medium"
              />
            </div>

            {/* BOTÓN PRINCIPAL DE COBRO */}
            <button
              type="submit"
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-teal-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Receipt className="w-5 h-5" />
              <span>
                Cobrar {chargeAmount ? formatCurrency(Number(chargeAmount)) : '$0'} & Emitir Comprobante
              </span>
            </button>
          </form>
        </div>

        {/* PANEL DERECHO: HISTORIAL LIMPIO DE COMPROBANTES Y COBROS */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">Comprobantes & Cobros Realizados</h3>
              <p className="text-xs text-slate-500">Historial reciente con reimpresión y reenvío por WhatsApp</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Buscar por paciente, tutor o motivo..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 font-medium focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No hay cobros registrados"
              description="Utilice el formulario de la izquierda para registrar la primera atención y emitir su comprobante."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredHistory.map((mov) => {
                const isTransfer = mov.paymentMethod === 'TRANSFERENCIA' || mov.paymentMethod === 'MERCADOPAGO_QR';
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
                      {mov.notes && (
                        <p className="text-[11px] text-slate-400 font-mono">{mov.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                      <strong className="text-sm sm:text-base font-black font-mono text-teal-900">
                        {formatCurrency(mov.amount)}
                      </strong>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            setCurrentReceipt({
                              receiptNumber: mov.notes?.includes('REC-2026')
                                ? mov.notes.split('Comprobante ')[1]?.split('.')[0] || 'REC-2026'
                                : 'REC-2026-0001',
                              date: formatDate(mov.date),
                              time: '12:00',
                              patientName: mov.concept.split(' - ')[1]?.split(' (')[0] || 'Mascota',
                              species: 'Canino/Felino',
                              breed: 'Veterinaria Irusta',
                              hc: 'HC-2026',
                              ownerName: mov.clientName || 'Tutor Responsable',
                              ownerPhone: '+54 9 2942 47-7136',
                              reason: mov.concept,
                              total: mov.amount,
                              paymentMethod: mov.paymentMethod,
                              vetInCharge: 'Dr. Diego Irusta',
                              vetLicense: 'MP 8412',
                              notes: mov.notes,
                            });
                            setShowReceiptModal(true);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title="Imprimir / Ver Comprobante"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('light');
                            openWhatsAppHub({
                              ownerName: mov.clientName || 'Tutor Responsable',
                              ownerPhone: '+54 9 2942 47-7136',
                              patientName: mov.concept.split(' - ')[1]?.split(' (')[0] || 'su mascota',
                              type: 'FACTURA',
                              details: {
                                total: formatCurrency(mov.amount),
                                paymentMethod: mov.paymentMethod,
                                date: mov.date,
                                reason: mov.concept,
                              },
                            });
                          }}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          title="Enviar por WhatsApp al tutor"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL COMPROBANTE OFICIAL DE PAGO & RECIBO (PDF / IMPRESIÓN / WHATSAPP) */}
      {showReceiptModal && currentReceipt && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">Comprobante Oficial de Pago</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* DOCUMENTO MEMBRETADO IMPRIMIBLE */}
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-3.5 text-xs text-slate-800 print:bg-white print:p-0 print:border-none">
              {/* Membrete Oficial */}
              <div className="text-center pb-3 border-b-2 border-slate-200">
                <span className="font-extrabold text-teal-800 uppercase tracking-widest text-[11px] block">
                  VETERINARIA IRUSTA — CENTRO HOSPITALARIO VETERINARIO
                </span>
                <h4 className="font-black text-slate-900 text-sm mt-0.5 uppercase tracking-wide">
                  COMPROBANTE DE PAGO & RECIBO DE ATENCIÓN
                </h4>
                <p className="text-[10px] text-slate-500 font-medium">
                  Río Cuarto, Córdoba • Tel/WhatsApp: +54 9 2942 47-7136 • Dirección Médica: Dr. Diego Irusta (MP 8412)
                </p>
                <div className="mt-2 inline-block px-3 py-1 bg-teal-100/80 text-teal-900 font-mono font-black text-xs rounded-full border border-teal-300">
                  Nº {currentReceipt.receiptNumber} • {currentReceipt.date} {currentReceipt.time}
                </div>
              </div>

              {/* Paciente y Tutor */}
              <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Paciente:</span>
                  <strong className="text-slate-900 text-sm block">{currentReceipt.patientName}</strong>
                  <span className="text-[11px] text-slate-500">
                    {currentReceipt.species} {currentReceipt.breed ? `• ${currentReceipt.breed}` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Tutor Responsable:</span>
                  <strong className="text-slate-800 block text-xs">{currentReceipt.ownerName}</strong>
                  <span className="text-[11px] text-slate-500 block">
                    Tel: {currentReceipt.ownerPhone || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Detalle del Concepto / Motivo */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1.5 shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Motivo de Consulta / Prestación:</span>
                <p className="text-xs font-bold text-slate-900 leading-relaxed">{currentReceipt.reason}</p>
                <div className="flex justify-between pt-2 border-t border-slate-100 text-[11px]">
                  <span>Medio de Pago: <strong className="text-slate-700 uppercase">{currentReceipt.paymentMethod}</strong></span>
                  <span className="text-slate-400">Estado: <strong className="text-emerald-700">ABONADO</strong></span>
                </div>
              </div>

              {/* Total Destacado */}
              <div className="bg-teal-50/90 p-3.5 rounded-2xl border-2 border-teal-300 flex items-center justify-between">
                <span className="text-sm font-black text-teal-950 uppercase">TOTAL ABONADO:</span>
                <strong className="text-xl font-black font-mono text-teal-900">
                  {formatCurrency(currentReceipt.total)}
                </strong>
              </div>

              {currentReceipt.notes && (
                <div className="bg-white p-2 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                  <span className="font-bold text-slate-400 text-[10px] block">Observaciones:</span>
                  <p>{currentReceipt.notes}</p>
                </div>
              )}

              {/* Pie con Sello y Firma */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-200 text-[11px] text-slate-600">
                <div>
                  <p className="font-black text-slate-900">{currentReceipt.vetInCharge}</p>
                  <p className="font-mono text-slate-500">Médico Veterinario • Matrícula {currentReceipt.vetLicense}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-mono bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PAGO VERIFICADO</span>
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendReceiptWhatsApp(currentReceipt)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                  title="Enviar comprobante por WhatsApp al tutor"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar por WhatsApp</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
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
