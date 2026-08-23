import { describe, it, expect } from 'vitest';
import { formatCurrency, formatInvoiceNumber } from '../../utils/formatters';

describe('Cash & Billing Module Unit Tests', () => {
  it('should calculate theoretical cash in drawer accurately', () => {
    const initialCash = 50000;
    const cashIncome = 85000;
    const cashExpenses = 18500;
    const theoreticalCash = initialCash + cashIncome - cashExpenses;

    expect(theoreticalCash).toBe(116500);
    expect(formatCurrency(theoreticalCash)).toContain('116.500');
  });

  it('should calculate physical bill counting correctly', () => {
    const billCounts: { [denom: number]: number } = {
      20000: 2, // 40000
      10000: 5, // 50000
      2000: 10, // 20000
      1000: 5,  // 5000
      500: 2,   // 1000
      200: 2,   // 400
      100: 1,   // 100
    };

    const physicalTotal = Object.entries(billCounts).reduce(
      (total, [denom, count]) => total + Number(denom) * (Number(count) || 0),
      0
    );

    expect(physicalTotal).toBe(116500);

    const theoreticalCash = 116500;
    const difference = physicalTotal - theoreticalCash;
    expect(difference).toBe(0);
  });

  it('should format invoice numbers with leading zeros and point of sale', () => {
    expect(formatInvoiceNumber('B', 1, 4921)).toBe('B-0001-00004921');
    expect(formatInvoiceNumber('A', 2, 18)).toBe('A-0002-00000018');
  });
});
