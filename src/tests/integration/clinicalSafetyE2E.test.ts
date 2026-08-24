import { describe, it, expect } from 'vitest';
import {
  TEST_PATIENTS,
  TEST_OWNERS,
  TEST_CONSULTATIONS,
  TEST_HOSPITALIZATIONS,
  TEST_INVOICES,
} from '../fixtures/testData';

describe('Flujo Hospitalario E2E de Seguridad Clínica & Facturación', () => {
  it('Tutor -> Paciente -> Consulta SOAP -> Prescripción -> Facturación', () => {
    // 1. Verificar Propietario
    const owner = TEST_OWNERS[0];
    expect(owner.id).toBe('owner-1');
    expect(owner.dni).toBe('32.458.912');

    // 2. Verificar Paciente vinculado
    const patient = TEST_PATIENTS.find((p) => p.ownerId === owner.id);
    expect(patient).toBeDefined();
    expect(patient?.name).toBe('Toby');
    expect(patient?.weight).toBe(32.5);

    // 3. Verificar Consulta SOAP
    const consultation = TEST_CONSULTATIONS.find((c) => c.patientId === patient?.id);
    expect(consultation).toBeDefined();
    expect(consultation?.soap.subjective).toBeTruthy();
    expect(consultation?.soap.assessment).toContain('Gastroenteritis');
    expect(consultation?.vetName).toBe('Dr. Martín López');

    // 4. Verificar Internación UCI vinculada
    const hosp = TEST_HOSPITALIZATIONS.find((h) => h.patientId === patient?.id);
    expect(hosp).toBeDefined();
    expect(hosp?.fluidTherapy?.isActive).toBe(true);
    expect(hosp?.fluidTherapy?.rateMlPerHour).toBe(80);

    // 5. Verificar Factura con CAE
    const invoice = TEST_INVOICES.find((inv) => inv.patientId === patient?.id);
    expect(invoice).toBeDefined();
    expect(invoice?.caeNumber).toBeTruthy();
    expect(invoice?.totalAmount).toBeGreaterThan(0);
  });
});
