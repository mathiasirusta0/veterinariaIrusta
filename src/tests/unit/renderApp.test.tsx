// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

describe('Autenticación y Puerta de Enlace (P0-01, P0-02)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('un visitante sin sesión previa recibe obligatoriamente la pantalla de Login', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(screen.getAllByText('VET SYSTEM').length).toBeGreaterThan(0);
    expect(screen.getByText('Acceso al Sistema Hospitalario')).toBeDefined();
  });

  it('un usuario con sesión activa en localStorage accede directamente al panel principal', () => {
    localStorage.setItem('vetsys_auth_user', JSON.stringify({
      id: 'user-vet-1',
      name: 'Dra. Valentina Ríos',
      email: 'vrios@vetsystem.com.ar',
      role: 'VETERINARIO',
      branchId: 'branch-1',
      licenseNumber: 'MP 8412',
    }));

    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Dra\. Valentina Ríos/).length).toBeGreaterThan(0);
  });
});
