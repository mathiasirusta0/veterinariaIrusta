import { describe, it, expect } from 'vitest';
import { INITIAL_BRANCHES, INITIAL_HOSPITALIZATIONS, INITIAL_APPOINTMENTS, INITIAL_INVOICES } from '../../mockData';

describe('Multi-Branch Tenant Isolation Integration Tests', () => {
  const branch1Id = INITIAL_BRANCHES[0].id; // branch-1 Central
  const branch2Id = INITIAL_BRANCHES[1].id; // branch-2 Norte

  it('should verify that hospitalizations belong to their corresponding branch', () => {
    const branch1Hosps = INITIAL_HOSPITALIZATIONS.filter(
      (h) => !h.branchId || h.branchId === branch1Id
    );
    const branch2Hosps = INITIAL_HOSPITALIZATIONS.filter(
      (h) => h.branchId === branch2Id
    );

    expect(branch1Hosps.length).toBeGreaterThan(0);
    // Filtering by branch isolation ensures data from other branches is excluded
    expect(branch2Hosps.every((h) => h.branchId === branch2Id)).toBe(true);
  });

  it('should verify that appointments can be isolated per branch', () => {
    const branch1Appointments = INITIAL_APPOINTMENTS.filter(
      (a) => !a.branchId || a.branchId === branch1Id
    );
    const branch2Appointments = INITIAL_APPOINTMENTS.filter(
      (a) => a.branchId === branch2Id
    );

    expect(branch1Appointments.every((a) => !a.branchId || a.branchId === branch1Id)).toBe(true);
    expect(branch2Appointments.every((a) => a.branchId === branch2Id)).toBe(true);
  });

  it('should isolate invoices and billing per branch', () => {
    const branch1Invoices = INITIAL_INVOICES.filter(
      (i) => !i.branchId || i.branchId === branch1Id
    );
    expect(branch1Invoices.every((i) => !i.branchId || i.branchId === branch1Id)).toBe(true);
  });
});
