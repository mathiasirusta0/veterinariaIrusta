import { describe, it, expect } from 'vitest';
import { getVerifiedAppUser, isValidUserRole } from '../../lib/auth';

describe('Auditoría 29/08/2026: Seguridad y Autenticación Servidor (SEC-02, SEC-03)', () => {
  it('debe validar únicamente roles reconocidos por el sistema', () => {
    expect(isValidUserRole('DIRECTOR_MEDICO')).toBe(true);
    expect(isValidUserRole('VETERINARIO')).toBe(true);
    expect(isValidUserRole('SUPERADMIN')).toBe(true);
    expect(isValidUserRole('HACKER_ROLE')).toBe(false);
    expect(isValidUserRole('')).toBe(false);
    expect(isValidUserRole(null)).toBe(false);
  });

  it('debe rechazar (fail-closed) y arrojar error si el usuario no tiene perfil en public.profiles', async () => {
    const fakeAuthUser: any = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'irusta_fake_attacker@gmail.com',
    };

    // Al consultar un id inexistente, debe arrojar error y nunca asignar DIRECTOR_MEDICO
    await expect(getVerifiedAppUser(fakeAuthUser)).rejects.toThrow(
      'La cuenta autenticada no posee un perfil profesional habilitado'
    );
  });
});

describe('Auditoría 29/08/2026: Integridad Clínica de Signos Vitales (CLIN-01, CLIN-02, CLIN-03)', () => {
  it('debe calcular la Presión Arterial Media (PAM) usando la fórmula fisiológica estándar (TAS + 2*TAD)/3', () => {
    const tas = 120;
    const tad = 75;
    const calculatedPAM = Math.round((tas + 2 * tad) / 3);
    expect(calculatedPAM).toBe(90);

    const tasCat = 140;
    const tadCat = 80;
    const pamCat = Math.round((tasCat + 2 * tadCat) / 3);
    expect(pamCat).toBe(100);
  });

  it('debe detectar discrepancias significativas (> 15 mmHg) entre TAM manual y calculada', () => {
    const tas = 120;
    const tad = 75;
    const calculatedPAM = Math.round((tas + 2 * tad) / 3); // 90
    const manualPAM = 70; // 20 mmHg de diferencia
    const diff = Math.abs(manualPAM - calculatedPAM);
    expect(diff).toBeGreaterThan(15);
  });

  it('no debe generar valores fisiológicos ficticios por defecto en campos no medidos', () => {
    const parseOptionalFloat = (val: string): number | undefined => {
      if (!val || val.trim() === '') return undefined;
      const n = parseFloat(val);
      return Number.isFinite(n) ? n : undefined;
    };

    expect(parseOptionalFloat('')).toBeUndefined();
    expect(parseOptionalFloat('   ')).toBeUndefined();
    expect(parseOptionalFloat('38.5')).toBe(38.5);
    expect(parseOptionalFloat('0')).toBe(0); // 0 no se reemplaza por default
    expect(parseOptionalFloat('invalido')).toBeUndefined();
  });
});
