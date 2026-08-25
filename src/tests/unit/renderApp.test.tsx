// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';

describe('Autenticación y Puerta de Enlace (P0-01, P0-02)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('un visitante sin sesión previa visualiza la Landing Page Publicitaria Institucional', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(screen.getAllByText(/Veterinaria/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Irusta/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Acceso al Sistema/i).length).toBeGreaterThan(0);
  });

  it('un usuario con sesión activa en localStorage accede directamente al panel principal', () => {
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
    expect(screen.getAllByText(/Dr\. Diego Iván Irusta/).length).toBeGreaterThan(0);
  });
});
