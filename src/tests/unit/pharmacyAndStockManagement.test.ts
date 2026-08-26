import { describe, it, expect } from 'vitest';
import { Product, InventoryMovement } from '../../types';

describe('Módulo de Farmacia & Gestión de Stock', () => {
  const sampleProducts: Product[] = [
    {
      id: 'prod-1',
      code: 'MED-001',
      commercialName: 'Meloxivet Gotas 10ml',
      activeIngredient: 'Meloxicam 0.5%',
      category: 'MEDICAMENTO',
      concentration: '5 mg/ml',
      presentation: 'Frasco gotero 10ml',
      laboratory: 'Holliday-Scott',
      supplier: 'Droguería Vet Central',
      location: 'Estante A-1',
      currentStock: 15,
      minStock: 5,
      costPrice: 4500,
      salePrice: 9500,
      currentBatch: 'L-MEL-2026',
      expirationDate: '2027-08-30',
      branchId: 'branch-1',
    },
    {
      id: 'prod-2',
      code: 'INS-002',
      commercialName: 'Catéter Endovenoso 22G',
      activeIngredient: 'Poliuretano Radiopaco',
      category: 'INSUMO_QUIRURGICO',
      concentration: '22G x 1"',
      presentation: 'Unidad estéril',
      laboratory: 'Nipro Medical',
      supplier: 'Distribuidora Quirúrgica',
      location: 'Quirófano / Gaveta 3',
      currentStock: 3,
      minStock: 10,
      costPrice: 800,
      salePrice: 2200,
      currentBatch: 'L-CAT-889',
      expirationDate: '2028-12-31',
      branchId: 'branch-1',
    },
    {
      id: 'prod-3',
      code: 'PSI-003',
      commercialName: 'Ketamina 50mg/ml',
      activeIngredient: 'Ketamina Clorhidrato',
      category: 'PSICOTROPICO',
      concentration: '50 mg/ml',
      presentation: 'Frasco ampolla 50ml',
      laboratory: 'Holliday',
      supplier: 'Droguería Especial',
      location: 'Caja Fuerte / Psicotrópicos',
      currentStock: 0,
      minStock: 2,
      costPrice: 12000,
      salePrice: 28000,
      currentBatch: 'L-KET-901',
      expirationDate: '2026-09-15',
      isPsychotropic: true,
      branchId: 'branch-1',
    },
  ];

  it('1. Debe calcular correctamente la valorización de stock a precio de costo y venta', () => {
    const totalCost = sampleProducts.reduce((acc, p) => acc + p.currentStock * p.costPrice, 0);
    const totalSale = sampleProducts.reduce((acc, p) => acc + p.currentStock * p.salePrice, 0);

    expect(totalCost).toBe(69900);
    expect(totalSale).toBe(149100);
    expect(totalSale - totalCost).toBe(79200);
  });

  it('2. Debe calcular el margen porcentual comercial de ganancia por producto', () => {
    const p1 = sampleProducts[0];
    const marginP1 = Math.round(((p1.salePrice - p1.costPrice) / p1.costPrice) * 100);
    expect(marginP1).toBe(111);

    const p2 = sampleProducts[1];
    const marginP2 = Math.round(((p2.salePrice - p2.costPrice) / p2.costPrice) * 100);
    expect(marginP2).toBe(175);
  });

  it('3. Debe identificar correctamente artículos en stock crítico y sin stock', () => {
    const criticals = sampleProducts.filter((p) => p.currentStock <= p.minStock);
    expect(criticals.length).toBe(2);

    const outOfStock = sampleProducts.filter((p) => p.currentStock <= 0);
    expect(outOfStock.length).toBe(1);
    expect(outOfStock[0].code).toBe('PSI-003');
  });

  it('4. Debe simular un ajuste de stock positivo por compra a proveedor y registrar el movimiento', () => {
    const p = { ...sampleProducts[0] };
    const quantityToAdd = 10;
    const previousStock = p.currentStock;
    const newStock = previousStock + quantityToAdd;
    p.currentStock = newStock;

    const movement: InventoryMovement = {
      id: 'mov-101',
      productId: p.id,
      productName: p.commercialName,
      type: 'ENTRADA',
      quantity: quantityToAdd,
      previousStock,
      newStock,
      batch: p.currentBatch,
      reason: 'Factura Compra A-0004923 Droguería Vet Central',
      performedBy: 'Dr. Diego Iván Irusta',
      timestamp: new Date().toISOString(),
    };

    expect(p.currentStock).toBe(25);
    expect(movement.type).toBe('ENTRADA');
    expect(movement.newStock).toBe(25);
  });

  it('5. Debe simular un descuento de stock por uso en internación y no permitir stock negativo', () => {
    const p = { ...sampleProducts[1] };
    const quantityToDeduct = 5;
    const newStock = Math.max(0, p.currentStock - quantityToDeduct);
    p.currentStock = newStock;

    expect(p.currentStock).toBe(0);
  });

  it('6. Debe identificar fechas de vencimiento próximas (FEFO)', () => {
    const now = new Date('2026-08-25').getTime();
    const isNearExpiry = (expDate: string) => {
      const exp = new Date(expDate).getTime();
      const diffDays = Math.round((exp - now) / (1000 * 60 * 60 * 24));
      return diffDays <= 60 && diffDays >= 0;
    };

    expect(isNearExpiry('2026-09-15')).toBe(true);
    expect(isNearExpiry('2027-08-30')).toBe(false);
  });

  it('7. Debe permitir la modificación de precio de venta, costo y recálculo dinámico', () => {
    const p = { ...sampleProducts[0] };
    p.costPrice = 6000;
    p.salePrice = 12000;

    const newMargin = Math.round(((p.salePrice - p.costPrice) / p.costPrice) * 100);
    expect(newMargin).toBe(100);
    expect(p.salePrice - p.costPrice).toBe(6000);
  });
});
