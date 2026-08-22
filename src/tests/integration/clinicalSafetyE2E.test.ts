import { describe, it, expect } from 'vitest';
import {
  INITIAL_PATIENTS,
  INITIAL_OWNERS,
  INITIAL_CONSULTATIONS,
  INITIAL_HOSPITALIZATIONS,
  INITIAL_SURGERIES,
  INITIAL_INVOICES,
} from '../../mockData';
import { Patient, Owner, Consultation, Prescription, Invoice } from '../../types';

describe('Flujo Hospitalario E2E de Seguridad Clínica & Facturación', () => {
  it('Tutor -> Paciente -> Consulta SOAP -> Prescripción -> Facturación', () => {
    // 1. Verificar Propietario
    const owner = INITIAL_OWNERS[0];
    expect(owner.id).toBe('owner-1');
    expect(owner.dni).toBe('32.458.912');

    // 2. Verificar Paciente vinculado
    const patient = INITIAL_PATIENTS.find((p) => p.ownerId === owner.id);
    expect(patient).toBeDefined();
    expect(patient?.name).toBe('Toby');
    expect(patient?.weight).toBe(32.5);

    // 3. Verificar Consulta SOAP
    const consultation = INITIAL_CONSULTATIONS.find((c) => c.patientId === patient?.id);
    expect(consultation).toBeDefined();
    expect(consultation?.soap.subjective).toBeTruthy();
    expect(consultation?.soap.assessment).toContain('Gastroenteritis');
    expect(consultation?.vetName).toBe('Dr. Martín López');

    // 4. Verificar Internación UCI vinculada
    const hosp = INITIAL_HOSPITALIZATIONS.find((h) => h.patientId === patient?.id);
    expect(hosp).toBeDefined();
    expect(hosp?.fluidTherapy.isActive).toBe(true);
    expect(hosp?.fluidTherapy.rateMlPerHour).toBe(80);

    // 5. Verificar Factura con CAE
    const invoice = INITIAL_INVOICES.find((inv) => inv.patientId === patient?.id);
    expect(invoice).toBeDefined();
    expect(invoice?.caeNumber).toBeTruthy();
    expect(invoice?.totalAmount).toBeGreaterThan(0);
  });
});
