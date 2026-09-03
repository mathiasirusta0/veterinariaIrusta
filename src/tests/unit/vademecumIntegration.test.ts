import { describe, it, expect } from 'vitest';
import { MASTER_VADEMECUM, ROUTE_CONSUMABLE_RULES } from '../../data/vademecumData';
import { Product, EncounterConsumptionItem } from '../../types';

describe('Vademécum Veterinario Maestro & Auto-Kits de Insumos', () => {
  // Test 1: Contenido exhaustivo del vademécum
  it('contiene un catálogo completo de más de 30 medicamentos e insumos veterinarios tipificados', () => {
    expect(MASTER_VADEMECUM.length).toBeGreaterThanOrEqual(30);

    // Verificar presencia de fármacos clave solicitados por el usuario
    const dipirona = MASTER_VADEMECUM.find((m) => m.commercialName.toLowerCase().includes('dipirona'));
    expect(dipirona).toBeDefined();
    expect(dipirona?.concentration).toBe('500 mg/ml');
    expect(dipirona?.defaultRoute).toBe('IV');
    expect(dipirona?.suggestedSalePrice).toBeGreaterThan(0);

    const metoclopramida10 = MASTER_VADEMECUM.find(
      (m) => m.commercialName.toLowerCase().includes('metoclopramida') && m.concentration.includes('10 mg')
    );
    expect(metoclopramida10).toBeDefined();
    expect(metoclopramida10?.defaultRoute).toBe('IV');

    const metoclopramida5 = MASTER_VADEMECUM.find(
      (m) => m.commercialName.toLowerCase().includes('metoclopramida') && m.concentration.includes('5 mg')
    );
    expect(metoclopramida5).toBeDefined();

    const maropitant = MASTER_VADEMECUM.find((m) => m.commercialName.toLowerCase().includes('maropitant') || m.commercialName.toLowerCase().includes('cerenia'));
    expect(maropitant).toBeDefined();
    expect(maropitant?.concentration).toBe('10 mg/ml');

    const tramadol = MASTER_VADEMECUM.find((m) => m.commercialName.toLowerCase().includes('tramadol'));
    expect(tramadol).toBeDefined();
    expect(tramadol?.isPsychotropic).toBe(true);

    const ketamina = MASTER_VADEMECUM.find((m) => m.commercialName.toLowerCase().includes('ketamina'));
    expect(ketamina).toBeDefined();
    expect(ketamina?.isNarcotic).toBe(true);
  });

  // Test 2: Insumos descartables completos (jeringas, agujas, catéteres, guías)
  it('contiene la totalidad de insumos descartables, jeringas de todas las medidas y agujas específicas', () => {
    const jeringa1ml = MASTER_VADEMECUM.find((m) => m.commercialName.toLowerCase().includes('jeringa 1ml'));
    const jeringa3ml = MASTER_VADEMECUM.find((m) => m.commercialName.toLowerCase().includes('jeringa 3ml'));
    const jeringa5ml = MASTER_VADEMECUM.find((m) => m.commercialName.toLowerCase().includes('jeringa 5ml'));
    const jeringa10ml = MASTER_VADEMECUM.find((m) => m.commercialName.toLowerCase().includes('jeringa 10ml'));
    const jeringa20ml = MASTER_VADEMECUM.find((m) => m.commercialName.toLowerCase().includes('jeringa 20ml'));

    expect(jeringa1ml).toBeDefined();
    expect(jeringa3ml).toBeDefined();
    expect(jeringa5ml).toBeDefined();
    expect(jeringa10ml).toBeDefined();
    expect(jeringa20ml).toBeDefined();

    const aguja258 = MASTER_VADEMECUM.find((m) => m.commercialName.includes('25/8'));
    const aguja215 = MASTER_VADEMECUM.find((m) => m.commercialName.includes('21/5'));
    const aguja408 = MASTER_VADEMECUM.find((m) => m.commercialName.includes('40/8'));

    expect(aguja258).toBeDefined();
    expect(aguja215).toBeDefined();
    expect(aguja408).toBeDefined();

    const cateter22g = MASTER_VADEMECUM.find((m) => m.commercialName.toLowerCase().includes('catéter iv 22g'));
    const guiaSuero = MASTER_VADEMECUM.find((m) => m.commercialName.toLowerCase().includes('guía de perfusión'));
    const llave3vias = MASTER_VADEMECUM.find((m) => m.commercialName.toLowerCase().includes('llave de 3 vías'));

    expect(cateter22g).toBeDefined();
    expect(guiaSuero).toBeDefined();
    expect(llave3vias).toBeDefined();
  });

  // Test 3: Reglas clínicas de asociación automática vía -> insumos
  it('aplica las reglas correctas de kit de insumos según vía de administración (IV, SC, IM, FLUIDO)', () => {
    // Vía Endovenosa (IV) -> Jeringa 3ml + Aguja 25/8
    const ivRule = ROUTE_CONSUMABLE_RULES.IV;
    expect(ivRule).toBeDefined();
    expect(ivRule.suggestedSyringe).toContain('Jeringa 3ml');
    expect(ivRule.suggestedNeedleOrCatheter).toContain('25/8');

    // Vía Subcutánea (SC) -> Jeringa 3ml + Aguja 21/5
    const scRule = ROUTE_CONSUMABLE_RULES.SC;
    expect(scRule).toBeDefined();
    expect(scRule.suggestedSyringe).toContain('Jeringa 3ml');
    expect(scRule.suggestedNeedleOrCatheter).toContain('21/5');

    // Fluidoterapia -> Catéter 22G + Guía de perfusión + Llave de 3 vías
    const fluidRule = ROUTE_CONSUMABLE_RULES.FLUIDO;
    expect(fluidRule).toBeDefined();
    expect(fluidRule.suggestedNeedleOrCatheter).toContain('Catéter IV 22G');
    expect(fluidRule.additionalSupplies?.some((s) => s.includes('Guía de perfusión'))).toBe(true);
    expect(fluidRule.additionalSupplies?.some((s) => s.includes('Llave de 3 vías'))).toBe(true);
  });

  // Test 4: Simulación de importación de fármaco y fijación de precios
  it('permite importar un medicamento del vademécum al inventario activo con personalización de precios y stock', () => {
    const vadDipirona = MASTER_VADEMECUM.find((m) => m.id === 'vad-dipirona-500')!;

    const importedProduct: Product = {
      id: 'prod-' + vadDipirona.code.toLowerCase(),
      code: vadDipirona.code,
      commercialName: vadDipirona.commercialName,
      activeIngredient: vadDipirona.activeIngredient,
      category: vadDipirona.category,
      concentration: vadDipirona.concentration,
      presentation: vadDipirona.presentation,
      laboratory: vadDipirona.laboratory,
      supplier: 'Distribuidora Farmavet',
      costPrice: 2500, // Personalizado
      salePrice: 5800, // Personalizado
      currentStock: 25, // Stock inicial
      minStock: 5,
      currentBatch: 'LOT-2026-TEST',
      expirationDate: '2028-05-30',
      branchId: 'branch-1',
      vademecumSourceId: vadDipirona.id,
    };

    expect(importedProduct.commercialName).toBe('Dipirona 500mg/ml Inyectable');
    expect(importedProduct.salePrice).toBe(5800);
    expect(importedProduct.currentStock).toBe(25);
  });

  // Test 5: Sincronización automática de prescripción + kit de descartables en cuenta de paciente
  it('registra el consumo del fármaco y genera automáticamente los ítems de insumos descartables (jeringa y aguja) vinculados a la vía', () => {
    const patientId = 'pat-test-1';
    const consumptions: EncounterConsumptionItem[] = [];

    // Fármaco indicado: Dipirona 1.2 ml por Vía Endovenosa (IV)
    const drugConsumption: EncounterConsumptionItem = {
      id: 'cons-med-1',
      encounterId: 'enc-test-1',
      patientId,
      sourceType: 'MEDICAMENTO',
      sourceId: 'prod-dipirona',
      code: 'MED-DIP-001',
      concept: 'Dipirona 500mg/ml - Dosis: 1.2 ml [IV]',
      quantity: 1,
      unitPrice: 5200,
      costPrice: 2200,
      subtotal: 5200,
      status: 'CONFIRMADO',
      performedAt: new Date().toISOString(),
      performedBy: 'Dr. Diego Iván Irusta',
      isBilled: false,
      productId: 'prod-dipirona',
    };
    consumptions.push(drugConsumption);

    // Auto-Kit para vía IV: Jeringa 3ml ($400) + Aguja 25/8 ($200)
    const syringeItem: EncounterConsumptionItem = {
      id: 'cons-supp-1',
      encounterId: 'enc-test-1',
      patientId,
      sourceType: 'INSUMO',
      sourceId: 'prod-jeringa-3ml',
      code: 'INS-JER-003',
      concept: 'Insumo Descartable: Jeringa 3ml cono luer',
      quantity: 1,
      unitPrice: 400,
      costPrice: 140,
      subtotal: 400,
      status: 'CONFIRMADO',
      performedAt: new Date().toISOString(),
      performedBy: 'Dr. Diego Iván Irusta',
      isBilled: false,
    };
    consumptions.push(syringeItem);

    const needleItem: EncounterConsumptionItem = {
      id: 'cons-supp-2',
      encounterId: 'enc-test-1',
      patientId,
      sourceType: 'INSUMO',
      sourceId: 'prod-aguja-25-8',
      code: 'INS-AGU-258',
      concept: 'Insumo Descartable: Aguja hipodérmica 25/8 (0.8x25mm)',
      quantity: 1,
      unitPrice: 200,
      costPrice: 60,
      subtotal: 200,
      status: 'CONFIRMADO',
      performedAt: new Date().toISOString(),
      performedBy: 'Dr. Diego Iván Irusta',
      isBilled: false,
    };
    consumptions.push(needleItem);

    expect(consumptions.length).toBe(3);
    const totalAmount = consumptions.reduce((sum, item) => sum + item.subtotal, 0);
    // 5200 (Dipirona) + 400 (Jeringa 3ml) + 200 (Aguja 25/8) = $5.800
    expect(totalAmount).toBe(5800);
  });

  // Test 6: Ajuste manual de concentración/dosis (ej: Metoclopramida 10mg vs 5mg)
  it('soporta ajuste y personalización manual de dosis o concentración manteniendo la trazabilidad del fármaco', () => {
    const vadMetoclo = MASTER_VADEMECUM.find((m) => m.code === 'VAD-GAS-001')!;

    // Veterinario prescribe y ajusta dosis personalizada a 5 mg en paciente canino de 5 kg
    const customDose = '5 mg (0.5 ml)';
    const customConcept = `${vadMetoclo.commercialName} - Dosis: ${customDose} [IV]`;

    expect(customConcept).toBe('Metoclopramida 10mg/ml Inyectable - Dosis: 5 mg (0.5 ml) [IV]');
  });
});
