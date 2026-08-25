// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

describe('Autenticación y Puerta de Enlace (P0-01, P0-02)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('un visitante sin sesión previa visualiza la Landing Page Publicitaria Institucional', async () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();

    const vetMatches = await screen.findAllByText(/Veterinaria/i);
    expect(vetMatches.length).toBeGreaterThan(0);

    const irustaMatches = await screen.findAllByText(/Irusta/i);
    expect(irustaMatches.length).toBeGreaterThan(0);

    const accesoMatches = await screen.findAllByText(/Acceso al Sistema/i);
    expect(accesoMatches.length).toBeGreaterThan(0);
  });

  it('un usuario con sesión activa en localStorage accede directamente al panel principal', async () => {
    localStorage.setItem('vetsys_auth_user', JSON.stringify({
      id: 'user-irusta-superadmin',
      name: 'Dr. Diego Iván Irusta',
      email: 'irusta@gmail.com',
      role: 'SUPERADMIN',
      branchId: 'branch-1',
      licenseNumber: 'M.P. 502 - Dirección Médica',
    }));

    const { container } = render(<App />);
    expect(container).toBeDefined();

    const nameMatches = await screen.findAllByText(/Dr\. Diego Iván Irusta/);
    expect(nameMatches.length).toBeGreaterThan(0);
  });
});
