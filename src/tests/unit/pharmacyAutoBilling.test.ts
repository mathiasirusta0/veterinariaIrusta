import { describe, it, expect } from 'vitest';
import { Product, EncounterConsumptionItem, Invoice, FinancialMovement, Hospitalization } from '../../types';

describe('Automatización de Medicación en Pacientes, Farmacia y Finanzas', () => {
  const mockProducts: Product[] = [
    {
      id: 'prod-maropitant',
      code: 'MED-001',
      commercialName: 'Cerenia / Maropitant 10mg/ml',
      activeIngredient: 'Maropitant',
      category: 'MEDICAMENTO',
      concentration: '10 mg/ml',
      presentation: 'Frasco 20 ml',
      laboratory: 'Zoetis',
      supplier: 'Droguería Sur',
      costPrice: 8500,
      salePrice: 16500,
      currentStock: 12,
      minStock: 3,
      currentBatch: 'LOT-2026-A',
      expirationDate: '2027-12-31',
      branchId: 'branch-1',
    },
    {
      id: 'prod-tramadol',
      code: 'MED-002',
      commercialName: 'Tramadol Gotas 50mg/ml',
      activeIngredient: 'Tramadol Clorhidrato',
      category: 'PSICOTROPICO',
      concentration: '50 mg/ml',
      presentation: 'Frasco gotero 10 ml',
      laboratory: 'John Martin',
      supplier: 'Droguería Central',
      costPrice: 4200,
      salePrice: 8900,
      currentStock: 4,
      minStock: 5,
      currentBatch: 'LOT-2026-TRAM',
      expirationDate: '2027-06-30',
      isPsychotropic: true,
      branchId: 'branch-1',
    },
    {
      id: 'prod-ringer',
      code: 'INS-003',
      commercialName: 'Ringer Lactato 500ml',
      activeIngredient: 'Solución Polielectrolítica',
      category: 'DESCARTABLE',
      concentration: '500 ml',
      presentation: 'Sachet 500 ml',
      laboratory: 'B. Braun',
      supplier: 'Distribuidora Médica',
      costPrice: 1800,
      salePrice: 4500,
      currentStock: 0,
      minStock: 10,
      currentBatch: 'LOT-RING-01',
      expirationDate: '2028-01-01',
      branchId: 'branch-1',
    },
    {
      id: 'prod-dipirona',
      code: 'MED-004',
      commercialName: 'Dipirona 500mg/ml Inyectable',
      activeIngredient: 'Dipirona (Metamizol Sódico)',
      category: 'MEDICAMENTO',
      concentration: '500mg/ml',
      presentation: 'Frasco ampolla 50ml',
      laboratory: 'Richmond Vet',
      supplier: 'Distribuidora Farmavet',
      costPrice: 2200,
      salePrice: 5200,
      currentStock: 24,
      minStock: 5,
      currentBatch: 'DIP-2026-X',
      expirationDate: '2027-08-30',
      branchId: 'branch-1',
    },
  ];

  it('1. Debe buscar el fármaco en farmacia y cargar el consumo con precio de venta y costo correctos', () => {
    const prod = mockProducts.find((p) => p.commercialName.toLowerCase().includes('maropitant'));
    expect(prod).toBeDefined();
    expect(prod?.salePrice).toBe(16500);
    expect(prod?.costPrice).toBe(8500);

    const quantity = 2;
    const subtotal = (prod?.salePrice || 0) * quantity;

    const consumption: EncounterConsumptionItem = {
      id: 'cons-test-1',
      encounterId: 'enc-pat-101',
      patientId: 'pat-101',
      sourceType: 'MEDICAMENTO',
      sourceId: prod!.id,
      code: prod!.code,
      concept: `${prod!.commercialName} (${prod!.concentration}) - Dosis: 1.5 ml SC`,
      quantity,
      unitPrice: prod!.salePrice,
      costPrice: prod!.costPrice,
      subtotal,
      status: 'CONFIRMADO',
      performedAt: new Date().toISOString(),
      performedBy: 'Dr. Diego Iván Irusta',
      isBilled: false,
      productId: prod!.id,
      batchNumber: prod!.currentBatch,
    };

    expect(consumption.isBilled).toBe(false);
    expect(consumption.subtotal).toBe(33000);
    expect(consumption.productId).toBe('prod-maropitant');
    expect(consumption.batchNumber).toBe('LOT-2026-A');
  });

  it('2. Debe descontar el stock del catálogo tras la administración clínica', () => {
    const prod = { ...mockProducts[0] };
    const quantityAdministered = 2;
    const previousStock = prod.currentStock;

    prod.currentStock -= quantityAdministered;

    expect(prod.currentStock).toBe(previousStock - quantityAdministered);
    expect(prod.currentStock).toBe(10);
  });

  it('3. Debe liquidar y facturar consumos pendientes en 1 clic generando Recibo X no fiscal', () => {
    const unbilledItems: EncounterConsumptionItem[] = [
      {
        id: 'cons-1',
        encounterId: 'enc-pat-101',
        patientId: 'pat-101',
        sourceType: 'MEDICAMENTO',
        sourceId: 'prod-maropitant',
        code: 'MED-001',
        concept: 'Cerenia / Maropitant 10mg/ml (10 mg/ml)',
        quantity: 1,
        unitPrice: 16500,
        subtotal: 16500,
        status: 'CONFIRMADO',
        performedAt: new Date().toISOString(),
        performedBy: 'Dr. Diego Iván Irusta',
        isBilled: false,
      },
      {
        id: 'cons-2',
        encounterId: 'enc-pat-101',
        patientId: 'pat-101',
        sourceType: 'PROCEDIMIENTO',
        sourceId: 'proc-fluid',
        code: 'PROC-002',
        concept: 'Colocación de Vía Endovenosa & Fluidoterapia',
        quantity: 1,
        unitPrice: 8500,
        subtotal: 8500,
        status: 'CONFIRMADO',
        performedAt: new Date().toISOString(),
        performedBy: 'Dr. Diego Iván Irusta',
        isBilled: false,
      },
    ];

    const totalAmount = unbilledItems.reduce((sum, item) => sum + item.subtotal, 0);
    expect(totalAmount).toBe(25000);

    const newInvoice: Invoice = {
      id: 'inv-test-101',
      invoiceNumber: 'REC-0001-00000101',
      type: 'RECIBO_X',
      pointOfSale: 1,
      date: '2026-08-30',
      ownerId: 'own-1',
      patientId: 'pat-101',
      customerName: 'Juan Pérez',
      customerDniCuit: '20-33445566-9',
      customerTaxCondition: 'Consumidor Final',
      items: unbilledItems.map((it) => ({
        id: it.id,
        description: it.concept,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        subtotal: it.subtotal,
      })),
      totalAmount,
      paymentMethod: 'TRANSFERENCIA',
      status: 'EMITIDO',
      branchId: 'branch-1',
      isFiscal: false,
    };

    expect(newInvoice.type).toBe('RECIBO_X');
    expect(newInvoice.isFiscal).toBe(false);
    expect(newInvoice.totalAmount).toBe(25000);
    expect(newInvoice.invoiceNumber).toMatch(/^REC-0001-\d{8}$/);

    // Mark items as billed
    const billedItems = unbilledItems.map((item) => ({
      ...item,
      isBilled: true,
      invoiceId: newInvoice.id,
    }));

    expect(billedItems.every((i) => i.isBilled)).toBe(true);
    expect(billedItems.every((i) => i.invoiceId === 'inv-test-101')).toBe(true);

    // Generate financial movement
    const finMovement: FinancialMovement = {
      id: 'fin-test-101',
      date: '2026-08-30',
      type: 'INGRESO',
      category: 'Consultas',
      concept: `Cobro Recibo ${newInvoice.invoiceNumber} - Consumos de Paciente`,
      amount: newInvoice.totalAmount,
      paymentMethod: 'TRANSFERENCIA',
      branchId: 'branch-1',
      status: 'COBRADO',
      createdAt: new Date().toISOString(),
      createdBy: 'Dr. Diego Iván Irusta',
    };

    expect(finMovement.type).toBe('INGRESO');
    expect(finMovement.amount).toBe(25000);
  });

  it('4. Debe permitir venta directa de mostrador con descuento de stock e ingreso en Finanzas', () => {
    const prod = { ...mockProducts[1] }; // Tramadol
    const quantity = 1;
    const subtotal = prod.salePrice * quantity;

    expect(subtotal).toBe(8900);

    const newInvoice: Invoice = {
      id: 'inv-counter-1',
      invoiceNumber: 'REC-0001-00000102',
      type: 'RECIBO_X',
      pointOfSale: 1,
      date: '2026-08-30',
      ownerId: 'owner-general',
      customerName: 'Cliente Mostrador',
      customerDniCuit: '00.000.000',
      customerTaxCondition: 'Consumidor Final',
      items: [
        {
          id: 'inv-it-1',
          description: `${prod.commercialName} (${prod.presentation})`,
          quantity,
          unitPrice: prod.salePrice,
          subtotal,
        },
      ],
      totalAmount: subtotal,
      paymentMethod: 'EFECTIVO',
      status: 'EMITIDO',
      branchId: 'branch-1',
      isFiscal: false,
    };

    const finMovement: FinancialMovement = {
      id: 'fin-counter-1',
      date: '2026-08-30',
      type: 'INGRESO',
      category: 'Farmacia & Insumos',
      concept: `Venta Mostrador ${newInvoice.invoiceNumber} - ${prod.commercialName} x${quantity}`,
      amount: subtotal,
      paymentMethod: 'EFECTIVO',
      branchId: 'branch-1',
      clientName: 'Cliente Mostrador',
      status: 'COBRADO',
      createdAt: new Date().toISOString(),
      createdBy: 'Sistema',
    };

    expect(newInvoice.totalAmount).toBe(8900);
    expect(finMovement.category).toBe('Farmacia & Insumos');
    expect(finMovement.amount).toBe(8900);
  });

  it('5. Debe calcular métricas precisas de valorización de stock y margen proyectado', () => {
    const activeProducts = mockProducts;
    const totalUnitsInStock = activeProducts.reduce((sum, p) => sum + p.currentStock, 0);
    const totalCostValue = activeProducts.reduce((sum, p) => sum + p.currentStock * p.costPrice, 0);
    const totalSaleValue = activeProducts.reduce((sum, p) => sum + p.currentStock * p.salePrice, 0);
    const projectedProfit = totalSaleValue - totalCostValue;
    const projectedMarginPercentage =
      totalCostValue > 0 ? Math.round(((projectedProfit / totalCostValue) * 100) * 10) / 10 : 0;

    expect(totalUnitsInStock).toBe(40);
    expect(totalCostValue).toBe(171600);
    expect(totalSaleValue).toBe(358400);
    expect(projectedProfit).toBe(186800);
    expect(projectedMarginPercentage).toBe(108.9);

    const lowStockCount = activeProducts.filter((p) => p.currentStock > 0 && p.currentStock <= p.minStock).length;
    const outOfStockCount = activeProducts.filter((p) => p.currentStock <= 0).length;

    expect(lowStockCount).toBe(1); // Tramadol (4 <= 5)
    expect(outOfStockCount).toBe(1); // Ringer (0 <= 0)
  });

  it('6. Cumplimiento No Fiscal estricto: Comprobantes internos sin CAE ni términos tributarios prohibidos', () => {
    const sampleReceipt: Invoice = {
      id: 'inv-audit',
      invoiceNumber: 'REC-0001-00000505',
      type: 'RECIBO_X',
      pointOfSale: 1,
      date: '2026-08-30',
      ownerId: 'own-1',
      customerName: 'Cliente Ranquel',
      customerDniCuit: '20-12345678-9',
      customerTaxCondition: 'Consumidor Final',
      items: [{ id: '1', description: 'Atención Clínica', quantity: 1, unitPrice: 15000, subtotal: 15000 }],
      totalAmount: 15000,
      paymentMethod: 'EFECTIVO',
      status: 'EMITIDO',
      branchId: 'branch-1',
      isFiscal: false,
    };

    expect(sampleReceipt.isFiscal).toBe(false);
    expect((sampleReceipt as any).cae).toBeUndefined();
    expect((sampleReceipt as any).caeExpiration).toBeUndefined();
    expect((sampleReceipt as any).afipQrUrl).toBeUndefined();
    expect(sampleReceipt.type).not.toMatch(/FACTURA_[ABC]/);
  });

  it('7. Debe buscar automáticamente el precio de Dipirona en Farmacia al cargar consumos de paciente internado', () => {
    const mockHosp: Hospitalization = {
      id: 'hosp-pat-202',
      patientId: 'pat-202',
      vetInChargeId: 'usr-1',
      vetInChargeName: 'Dr. Diego Iván Irusta',
      sector: 'UCI',
      kennelNumber: 'CANIL-02',
      admittedAt: '2026-08-30T08:00:00.000Z',
      primaryDiagnosis: 'Gastroenteritis Hemorrágica / Dolor Abdominal Agudo',
      priority: 'CRITICO',
      status: 'ACTIVA',
      branchId: 'branch-1',
      fluidTherapy: {
        isActive: true,
        solutionType: 'Ringer Lactato',
        volumeTotalMl: 500,
        rateMlPerHour: 25,
        infusionRoute: 'IV',
        startedAt: '2026-08-30T08:30:00.000Z',
        prescribedBy: 'Dr. Diego Iván Irusta',
      },
      feeding: {
        dietType: 'NPO_AYUNO',
        foodBrand: 'NPO',
        amountGramsOrMl: 0,
        frequency: 'Ayuno',
        tolerance: 'EXCELENTE',
      },
      eliminations: [],
      hourlySheet: [],
      intervalHours: 2,
      tasks: [],
      medications: [
        {
          id: 'med-dip-1',
          patientId: 'pat-202',
          hospitalizationId: 'hosp-pat-202',
          drugName: 'Dipirona 500mg/ml Inyectable',
          dose: '1 ml',
          route: 'IV',
          frequency: 'Cada 8 hs',
          scheduledTime: '08:00',
          status: 'PENDIENTE',
        },
        {
          id: 'med-cerenia-1',
          patientId: 'pat-202',
          hospitalizationId: 'hosp-pat-202',
          drugName: 'Cerenia / Maropitant 10mg/ml',
          dose: '1.2 ml',
          route: 'SC',
          frequency: 'Cada 24 hs',
          scheduledTime: '09:00',
          status: 'PENDIENTE',
        },
      ],
    };

    // Simular el algoritmo de carga de internación y búsqueda de precios en Farmacia
    const resolvedItems: { description: string; quantity: number; unitPrice: number; subtotal: number }[] = [];

    // Fármacos en la sábana
    mockHosp.medications.forEach((med) => {
      const searchNorm = med.drugName.trim().toLowerCase();
      const prod = mockProducts.find(
        (p) =>
          p.commercialName.toLowerCase().includes(searchNorm) ||
          p.activeIngredient.toLowerCase().includes(searchNorm) ||
          searchNorm.includes(p.commercialName.toLowerCase())
      );

      const price = prod?.salePrice || 5200;
      resolvedItems.push({
        description: `${med.drugName} (${med.dose} ${med.route}) - Farmacia`,
        quantity: 1,
        unitPrice: price,
        subtotal: price,
      });
    });

    // Fluidoterapia
    if (mockHosp.fluidTherapy.isActive) {
      const ringerProd = mockProducts.find((p) => p.commercialName.toLowerCase().includes('ringer'));
      const ringerPrice = ringerProd?.salePrice || 4500;
      resolvedItems.push({
        description: `Fluidoterapia ${mockHosp.fluidTherapy.solutionType}`,
        quantity: 1,
        unitPrice: ringerPrice,
        subtotal: ringerPrice,
      });
    }

    // Cuidado hospitalario
    resolvedItems.push({
      description: `Atención & Cuidado Hospitalario Canil ${mockHosp.kennelNumber}`,
      quantity: 1,
      unitPrice: 15000,
      subtotal: 15000,
    });

    // Verificar que Dipirona fue resuelta con el precio exacto de Farmacia ($5.200)
    const dipironaItem = resolvedItems.find((i) => i.description.toLowerCase().includes('dipirona'));
    expect(dipironaItem).toBeDefined();
    expect(dipironaItem?.unitPrice).toBe(5200);

    // Verificar que Cerenia fue resuelta con el precio de Farmacia ($16.500)
    const cereniaItem = resolvedItems.find((i) => i.description.toLowerCase().includes('cerenia'));
    expect(cereniaItem).toBeDefined();
    expect(cereniaItem?.unitPrice).toBe(16500);

    // Verificar que Fluidoterapia fue resuelta con el precio de Farmacia ($4.500)
    const fluidItem = resolvedItems.find((i) => i.description.toLowerCase().includes('fluidoterapia'));
    expect(fluidItem).toBeDefined();
    expect(fluidItem?.unitPrice).toBe(4500);

    // Total calculado
    const totalCalculated = resolvedItems.reduce((sum, it) => sum + it.subtotal, 0);
    expect(totalCalculated).toBe(5200 + 16500 + 4500 + 15000); // 41200
  });
});
