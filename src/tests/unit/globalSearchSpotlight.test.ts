import { describe, it, expect } from 'vitest';
import { normalizeSearchText, normalizeDigits } from '../../components/GlobalSearchModal';

describe('Buscador Universal Spotlight VET — Tests Unitarios de Normalización y Búsqueda', () => {
  it('1. Debe normalizar texto eliminando tildes, mayúsculas y espacios sobrantes', () => {
    expect(normalizeSearchText('  MARTÍN GONZÁLEZ  ')).toBe('martin gonzalez');
    expect(normalizeSearchText('Cefalexina Suspensión')).toBe('cefalexina suspension');
    expect(normalizeSearchText('Cirugía Ortopédica')).toBe('cirugia ortopedica');
    expect(normalizeSearchText('Óscar Irusta')).toBe('oscar irusta');
  });

  it('2. Debe normalizar dígitos numéricos para teléfonos y DNI sin caracteres especiales', () => {
    expect(normalizeDigits('+54 358 430-2024')).toBe('543584302024');
    expect(normalizeDigits('38.450.912')).toBe('38450912');
    expect(normalizeDigits('(02942) 47-7136')).toBe('02942477136');
  });

  it('3. Debe coincidir términos de búsqueda sobre pacientes incluso con variaciones ortográficas', () => {
    const mockPatients = [
      { id: 'p1', name: 'Simón', species: 'Canino', breed: 'Bulldog Francés', clinicalRecordNumber: 'HC-2026-0001' },
      { id: 'p2', name: 'Duque', species: 'Canino', breed: 'Pastor Alemán', clinicalRecordNumber: 'HC-2026-0002' },
      { id: 'p3', name: 'Pelusa', species: 'Felino', breed: 'Siamés', clinicalRecordNumber: 'HC-2026-0003' },
    ];

    // Buscar "simon" sin tilde
    const q1 = normalizeSearchText('simon');
    const matches1 = mockPatients.filter(p => normalizeSearchText(p.name).includes(q1));
    expect(matches1.length).toBe(1);
    expect(matches1[0].name).toBe('Simón');

    // Buscar "frances" sin tilde sobre la raza
    const q2 = normalizeSearchText('frances');
    const matches2 = mockPatients.filter(p => normalizeSearchText(p.breed).includes(q2));
    expect(matches2.length).toBe(1);
    expect(matches2[0].name).toBe('Simón');

    // Buscar "siames"
    const q3 = normalizeSearchText('siames');
    const matches3 = mockPatients.filter(p => normalizeSearchText(p.breed).includes(q3));
    expect(matches3.length).toBe(1);
    expect(matches3[0].name).toBe('Pelusa');
  });

  it('4. Debe encontrar tutores buscando por fragmento de DNI o teléfono sin formato', () => {
    const mockOwners = [
      { id: 'o1', firstName: 'Martín', lastName: 'González', dni: '38.450.912', phone: '+54 358 4123456' },
      { id: 'o2', firstName: 'Enzo', lastName: 'Girardi', dni: '37108100', phone: '+543584302024' },
    ];

    const qDni = normalizeDigits('38450');
    const matchDni = mockOwners.filter(o => normalizeDigits(o.dni).includes(qDni));
    expect(matchDni.length).toBe(1);
    expect(matchDni[0].firstName).toBe('Martín');

    const qPhone = normalizeDigits('4302024');
    const matchPhone = mockOwners.filter(o => normalizeDigits(o.phone).includes(qPhone));
    expect(matchPhone.length).toBe(1);
    expect(matchPhone[0].firstName).toBe('Enzo');
  });
});
