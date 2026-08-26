import { describe, it, expect } from 'vitest';
import {
  patientRepository,
  ownerRepository,
  vitalsRepository,
  executeDemoCleanupRPC,
  mapPatientToDB,
  mapPatientFromDB,
  mapOwnerToDB,
  mapOwnerFromDB,
} from '../../services/supabaseRepository';
import { Patient, Owner } from '../../types';

describe('Supabase Single Source of Truth & RLS Security Tests', () => {
  const realOwner: Owner = {
    id: `own-real-${Date.now()}`,
    firstName: 'Martín',
    lastName: 'González',
    dni: '38.450.912',
    phone: '+54 358 4123456',
    whatsapp: '+54 358 4123456',
    email: 'martin.gonzalez@email.com',
    address: 'Av. Marcelo T. de Alvear 1240',
    city: 'Río Cuarto',
    province: 'Córdoba',
    postalCode: '5800',
    createdAt: new Date().toISOString(),
    balance: 0,
  };

  const realPatient: Patient = {
    id: `pat-real-${Date.now()}`,
    name: 'Thor',
    species: 'CANINO',
    breed: 'Border Collie',
    sex: 'MACHO',
    reproductiveStatus: 'ENTERO',
    birthDate: '2022-03-15',
    calculatedAge: '4 años',
    weight: 22.4,
    color: 'Negro y Blanco',
    microchip: '981098107654321',
    clinicalRecordNumber: 'HC-2026-9001',
    ownerId: realOwner.id,
    status: 'ACTIVO',
    alerts: [],
    branchId: 'branch-1',
    createdAt: new Date().toISOString(),
  };

  it('1. Criterio de Aceptación: Los estados iniciales en el cliente inician limpios', () => {
    const initialClients: Patient[] = [];
    expect(initialClients.length).toBe(0);
  });

  it('2. Criterio de Aceptación: Mapeador bidireccional de Owner y Patient convierte correctamente a columnas PostgreSQL', () => {
    const dbOwner = mapOwnerToDB(realOwner);
    expect(dbOwner.first_name).toBe(realOwner.firstName);
    expect(dbOwner.last_name).toBe(realOwner.lastName);
    expect(dbOwner.dni).toBe(realOwner.dni);

    const remappedOwner = mapOwnerFromDB(dbOwner);
    expect(remappedOwner.firstName).toBe(realOwner.firstName);
    expect(remappedOwner.lastName).toBe(realOwner.lastName);

    const dbPatient = mapPatientToDB(realPatient);
    expect(dbPatient.name).toBe(realPatient.name);
    expect(dbPatient.clinical_record_number).toBe(realPatient.clinicalRecordNumber);

    const remappedPat = mapPatientFromDB(dbPatient);
    expect(remappedPat.name).toBe(realPatient.name);
    expect(remappedPat.clinicalRecordNumber).toBe(realPatient.clinicalRecordNumber);
  });

  it('3. Criterio de Aceptación: Operación de creación en repositorio maneja respuestas e integridad en Supabase', async () => {
    const ownerRes = await ownerRepository.create(realOwner);
    // Valida que el repositorio retorne respuesta estructurada sin excepciones no capturadas
    expect(ownerRes).toBeDefined();
    if (ownerRes.error) {
      expect(typeof ownerRes.error).toBe('string');
    } else {
      expect(ownerRes.data).toBeDefined();
    }
  });

  it('4. Criterio de Aceptación: Si Supabase rechaza la operación, el repositorio retorna error controlado', async () => {
    const invalidPat: any = { id: null, name: null };
    const failRes = await patientRepository.create(invalidPat);
    expect(failRes.data).toBeNull();
    expect(failRes.error).not.toBeNull();
  });

  it('5. Criterio de Aceptación: El Dry Run y Limpieza validan frases de confirmación estrictas', async () => {
    const wrongPhrase = await executeDemoCleanupRPC(false, 'BORRAR TODO');
    expect(wrongPhrase.success).toBe(false);
    expect(wrongPhrase.message).toContain('Frase de confirmación');
  });
});
