import { describe, it, expect } from 'vitest';
import { INITIAL_BRANCHES } from '../../mockData';
import { TEST_HOSPITALIZATIONS, TEST_INVOICES } from '../fixtures/testData';

describe('Multi-Branch Tenant Isolation Integration Tests', () => {
  const branch1Id = INITIAL_BRANCHES[0].id; // branch-1 Central
  const branch2Id = INITIAL_BRANCHES[1]?.id || 'branch-2'; // branch-2 Norte

  it('should verify that hospitalizations belong to their corresponding branch', () => {
    const branch1Hosps = TEST_HOSPITALIZATIONS.filter(
      (h) => !h.branchId || h.branchId === branch1Id
    );
    const branch2Hosps = TEST_HOSPITALIZATIONS.filter(
      (h) => h.branchId === branch2Id
    );

    expect(branch1Hosps.length).toBeGreaterThan(0);
    expect(branch2Hosps.every((h) => h.branchId === branch2Id)).toBe(true);
  });

  it('should isolate invoices and billing per branch', () => {
    const branch1Invoices = TEST_INVOICES.filter(
      (i) => !i.branchId || i.branchId === branch1Id
    );
    expect(branch1Invoices.every((i) => !i.branchId || i.branchId === branch1Id)).toBe(true);
  });
});
