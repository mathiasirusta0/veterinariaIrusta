// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { PatientInformedConsentModal } from '../../components/PatientInformedConsentModal';
import { VetProvider } from '../../context/VetContext';
import { Patient, Owner } from '../../types';

const mockPatient: Patient = {
  id: 'pat-duque-001',
  name: 'Duque',
  species: 'CANINO',
  breed: 'American Bully',
  sex: 'MACHO',
  reproductiveStatus: 'ENTERO',
  birthDate: '2025-01-01',
  calculatedAge: '1 año',
  weight: 20,
  color: 'Negro',
  microchip: '',
  clinicalRecordNumber: 'HC-2026-0001',
  status: 'INTERNADO',
  ownerId: 'own-enzo-001',
  branchId: 'branch-1',
  createdAt: '2026-01-01T00:00:00Z',
  alerts: [],
  photoUrl: '',
};

const mockOwner: Owner = {
  id: 'own-enzo-001',
  firstName: 'Enzo',
  lastName: 'Girardi',
  dni: '38123456',
  phone: '+543584302024',
  whatsapp: '+543584302024',
  address: 'Río Cuarto',
  city: 'Río Cuarto',
  province: 'Córdoba',
  postalCode: '5800',
  email: 'enzo@gmail.com',
  balance: 0,
  createdAt: '2026-01-01T00:00:00Z',
};

describe('Módulo de Consentimiento Informado Veterinario', () => {
  afterEach(() => {
    cleanup();
  });

  it('1. Renderiza el modal con los datos del paciente Duque y tutor Enzo Girardi', () => {
    const { container } = render(
      <VetProvider>
        <PatientInformedConsentModal
          isOpen={true}
          onClose={() => {}}
          patient={mockPatient}
          owner={mockOwner}
        />
      </VetProvider>
    );

    expect(container).toBeDefined();
    expect(screen.getAllByText(/Consentimiento Informado Veterinario/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Duque/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Enzo Girardi/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CLÍNICA VETERINARIA RANQUEL/i).length).toBeGreaterThan(0);
  });

  it('2. Permite seleccionar diferentes plantillas de procedimientos', () => {
    render(
      <VetProvider>
        <PatientInformedConsentModal
          isOpen={true}
          onClose={() => {}}
          patient={mockPatient}
          owner={mockOwner}
        />
      </VetProvider>
    );

    const uciBtns = screen.getAllByText(/Internación/i);
    expect(uciBtns.length).toBeGreaterThan(0);
    fireEvent.click(uciBtns[0]);

    expect(screen.getAllByText(/Cuidados Críticos/i).length).toBeGreaterThan(0);
  });

  it('3. Permite alternar a la modalidad de Firma Digital en Pantalla', () => {
    render(
      <VetProvider>
        <PatientInformedConsentModal
          isOpen={true}
          onClose={() => {}}
          patient={mockPatient}
          owner={mockOwner}
        />
      </VetProvider>
    );

    const digitalBtns = screen.getAllByText(/Firma Digital/i);
    expect(digitalBtns.length).toBeGreaterThan(0);
    fireEvent.click(digitalBtns[0]);

    expect(screen.getAllByText(/Firma Digital del Tutor/i).length).toBeGreaterThan(0);
  });
});
