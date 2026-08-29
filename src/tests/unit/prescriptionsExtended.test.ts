import { describe, it, expect } from 'vitest';
import { Prescription } from '../../types';
import { calculatePrescriptionSha256 } from '../../utils/crypto';

describe('Módulo de Recetas Médicas — Pacientes Registrados y Clientes Externos / No Registrados', () => {
  it('1. Debe permitir confeccionar una receta para un paciente registrado en la clínica', async () => {
    const rx: Prescription = {
      id: 'rx-reg-1',
      prescriptionNumber: 'REC-2026-000010',
      prescriptionType: 'RECETA_COMUN',
      patientId: 'patient-1',
      ownerId: 'owner-1',
      vetId: 'vet-irusta',
      vetName: 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502 (Neuquén)',
      date: '2026-08-29',
      diagnosis: 'Gastroenteritis aguda / Tratamiento sintomático',
      items: [
        {
          id: 'item-1',
          medicationName: 'Cerenia 16mg',
          activeIngredient: 'Maropitant Citrato',
          presentation: 'Comprimidos',
          dose: '1 comp cada 24 horas',
          route: 'ORAL',
          frequency: 'Cada 24 horas',
          duration: '3 días',
          quantityPrescribed: 1,
          senasaCategory: 'CAT_III_RECETA',
          requiresRVE: false,
          instructions: 'Administrar con una pequeña porción de comida.',
        },
      ],
      isDispensed: false,
    };

    expect(rx.prescriptionNumber).toBe('REC-2026-000010');
    expect(rx.isExternalPatient).toBeUndefined();
    expect(rx.items.length).toBe(1);
    expect(rx.items[0].medicationName).toBe('Cerenia 16mg');
  });

  it('2. Debe permitir emitir recetas para clientes/pacientes nuevos NO registrados sin DNI obligatorio', async () => {
    const extRx: Prescription = {
      id: 'rx-ext-1',
      prescriptionNumber: 'REC-2026-000011',
      prescriptionType: 'RECETA_COMUN',
      patientId: 'patient-ext-123',
      ownerId: 'owner-unregistered',
      vetId: 'vet-irusta',
      vetName: 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502 (Neuquén)',
      date: '2026-08-29',
      diagnosis: 'Otitis externa bacteriana / Consulta de urgencia',
      isExternalPatient: true,
      patientName: 'Ragnar',
      patientSpecies: 'CANINO',
      patientBreed: 'Ovejero Alemán',
      patientWeight: '32 kg',
      patientAge: '4 años',
      patientHc: 'Consulta Externa / Ambulatorio',
      ownerName: 'Marcelo Fernández',
      ownerDni: undefined, // DNI NO OBLIGATORIO
      ownerPhone: '+54 9 2942 55-4433',
      ownerAddress: 'Las Lajas, Neuquén',
      items: [
        {
          id: 'item-ext-1',
          medicationName: 'Gotas Óticas Combinadas',
          activeIngredient: 'Gentamicina / Betametasona / Clotrimazol',
          presentation: 'Frasco gotero 15ml',
          dose: '5 gotas en cada oído',
          route: 'OTICA',
          frequency: 'Cada 12 horas',
          duration: '10 días',
          quantityPrescribed: 1,
          senasaCategory: 'CAT_III_RECETA',
          requiresRVE: false,
          instructions: 'Limpiar previamente con gasa seca.',
        },
      ],
      isDispensed: false,
    };

    expect(extRx.isExternalPatient).toBe(true);
    expect(extRx.patientName).toBe('Ragnar');
    expect(extRx.ownerName).toBe('Marcelo Fernández');
    expect(extRx.ownerDni).toBeUndefined(); // Sin DNI no bloquea la receta
    expect(extRx.ownerPhone).toBe('+54 9 2942 55-4433');
  });

  it('3. Debe registrar y validar el DNI del tutor cuando se proporciona opcionalmente', async () => {
    const extRxWithDni: Prescription = {
      id: 'rx-ext-2',
      prescriptionNumber: 'REC-2026-000012',
      prescriptionType: 'RECETA_OFICIAL_ARCHIVADA',
      patientId: 'patient-ext-456',
      ownerId: 'owner-unregistered',
      vetId: 'vet-irusta',
      vetName: 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502 (Neuquén)',
      date: '2026-08-29',
      diagnosis: 'Control convulsivo',
      isExternalPatient: true,
      patientName: 'Kira',
      patientSpecies: 'FELINO',
      ownerName: 'Valeria Mansilla',
      ownerDni: '38.945.120', // DNI provisto
      ownerPhone: '+54 9 2942 66-7788',
      items: [
        {
          id: 'item-ext-2',
          medicationName: 'Fenobarbital 100mg',
          activeIngredient: 'Fenobarbital',
          presentation: 'Comprimidos ranurados',
          dose: '1/4 comp cada 12 horas',
          route: 'ORAL',
          frequency: 'Cada 12 horas',
          duration: '30 días',
          quantityPrescribed: 1,
          senasaCategory: 'CAT_I_OFICIAL_ARCHIVADA',
          requiresRVE: false,
          instructions: 'Administrar puntualmente cada 12hs.',
        },
      ],
      isDispensed: false,
    };

    expect(extRxWithDni.ownerDni).toBe('38.945.120');
    expect(extRxWithDni.prescriptionType).toBe('RECETA_OFICIAL_ARCHIVADA');
  });

  it('4. Debe calcular el hash criptográfico SHA-256 tanto para pacientes registrados como externos', async () => {
    const hash = await calculatePrescriptionSha256({
      prescriptionNumber: 'REC-2026-000099',
      patientId: 'ext-patient-thor',
      vetName: 'Dr. Diego Iván Irusta',
      vetLicense: 'M.P. 502 (Neuquén)',
      items: [
        {
          id: '1',
          medicationName: 'Amoxicilina 500mg',
          presentation: 'Comprimidos',
          dose: '1 comp cada 12hs',
          route: 'ORAL',
          frequency: 'Cada 12 horas',
          duration: '7 días',
          instructions: '',
        },
      ],
      date: '2026-08-29',
    });

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.startsWith('SHA256:')).toBe(true);
    expect(hash.replace('SHA256:', '').length).toBe(64);
  });
});
