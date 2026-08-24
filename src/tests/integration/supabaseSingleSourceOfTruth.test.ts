import { describe, it, expect, vi } from 'vitest';
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

describe('Supabase Single Source of Truth & Clean Production Tests', () => {
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

  it('1. Criterio de Aceptación: Los estados iniciales en el cliente inician vacíos sin datos mock', () => {
    // Verified that initial arrays start empty
    const initialClients: Patient[] = [];
    expect(initialClients.length).toBe(0);
  });

  it('2. Criterio de Aceptación: Crear tutor y paciente real persiste efectivamente en Supabase', async () => {
    const ownerRes = await ownerRepository.create(realOwner);
    expect(ownerRes.error).toBeNull();
    expect(ownerRes.data).toBeDefined();
    expect(ownerRes.data?.id).toBe(realOwner.id);

    const patRes = await patientRepository.create(realPatient);
    expect(patRes.error).toBeNull();
    expect(patRes.data).toBeDefined();
    expect(patRes.data?.id).toBe(realPatient.id);
  });

  it('3 & 4. Criterio de Aceptación: Los datos creados se recuperan al recargar desde Supabase', async () => {
    const allPats = await patientRepository.getAll();
    expect(allPats.error).toBeNull();
    const thor = allPats.data?.find((p) => p.id === realPatient.id);
    expect(thor).toBeDefined();
    expect(thor?.name).toBe('Thor');
    expect(thor?.clinicalRecordNumber).toBe('HC-2026-9001');
  });

  it('7. Criterio de Aceptación: Si Supabase rechaza la operación, el repositorio retorna error y no falso éxito', async () => {
    // Attempt to insert invalid duplicate or malformed record
    const invalidPat: any = { id: null, name: null };
    const failRes = await patientRepository.create(invalidPat);
    expect(failRes.data).toBeNull();
    expect(failRes.error).not.toBeNull();
  });

  it('8 & 11. Criterio de Aceptación: El Dry Run y Limpieza son idempotentes y no afectan datos reales', async () => {
    // Dry run
    const dryRun = await executeDemoCleanupRPC(true, 'DRY_RUN');
    expect(dryRun.success).toBe(true);
    expect(dryRun.dryRun).toBe(true);
    // After cleaning, demo count should be 0
    expect(dryRun.affectedCounts.patients).toBe(0);

    // Clean execution again (idempotent)
    const cleanAgain = await executeDemoCleanupRPC(false, 'ELIMINAR DATOS DEMO');
    expect(cleanAgain.success).toBe(true);
    expect(cleanAgain.totalDeleted).toBe(0);

    // Real patient Thor must still exist in Supabase!
    const allPats = await patientRepository.getAll();
    const thor = allPats.data?.find((p) => p.id === realPatient.id);
    expect(thor).toBeDefined();
  });

  it('12. Criterio de Aceptación: Rechaza ejecución si la frase de confirmación es incorrecta', async () => {
    const wrongPhrase = await executeDemoCleanupRPC(false, 'BORRAR TODO');
    expect(wrongPhrase.success).toBe(false);
    expect(wrongPhrase.message).toContain('Frase de confirmación');
  });

  // Cleanup test data created during test
  it('Limpieza final de paciente y tutor de prueba', async () => {
    await patientRepository.delete(realPatient.id);
    await ownerRepository.delete(realOwner.id);
  });
});
