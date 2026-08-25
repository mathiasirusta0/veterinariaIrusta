// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import App from '../../App';

import { ToastNotification } from '../../components/ToastNotification';

describe('Autenticación y Puerta de Enlace (P0-01, P0-02)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
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

  it('ToastNotification se renderiza sin errores ante diferentes formatos de props y arrays vacíos', () => {
    const { container: c1 } = render(<ToastNotification toasts={[]} onDismiss={() => {}} />);
    expect(c1).toBeDefined();

    const { container: c2 } = render(
      <ToastNotification
        toast={{ id: '1', type: 'success', title: 'Éxito', message: 'Guardado correctamente' }}
        onDismiss={() => {}}
      />
    );
    expect(c2.textContent).toContain('Éxito');

    const { container: c3 } = render(
      <ToastNotification
        toasts={[{ id: '2', type: 'warning', title: 'Alerta', message: 'Stock bajo' }]}
        onDismiss={() => {}}
      />
    );
    expect(c3.textContent).toContain('Alerta');
  });

  it('PublicLandingView ejecuta onGoToLogin y onOpenLogin correctamente sin bucles infinitos de recursión', async () => {
    const { PublicLandingView } = await import('../../components/PublicLandingView');
    let loginOpened = false;

    const { container } = render(
      <PublicLandingView onGoToLogin={() => { loginOpened = true; }} />
    );

    const buttons = container.querySelectorAll('button');
    const ctaButton = Array.from(buttons).find((b) => b.textContent?.includes('Acceso al Sistema'));
    expect(ctaButton).toBeDefined();

    fireEvent.click(ctaButton!);
    expect(loginOpened).toBe(true);
  });

  it('LoginView ejecuta onBackToLanding al solicitar volver a la página principal', async () => {
    const { LoginView } = await import('../../components/LoginView');
    const { VetProvider } = await import('../../context/VetContext');
    let backTriggered = false;

    const { container } = render(
      <VetProvider>
        <LoginView onBackToLanding={() => { backTriggered = true; }} />
      </VetProvider>
    );

    const backButton = container.querySelector('button');
    expect(backButton).toBeDefined();
    expect(backButton?.textContent).toContain('Volver a la Página Principal');

    fireEvent.click(backButton!);
    expect(backTriggered).toBe(true);
  });

  it('LoginView no contiene botones de acceso rápido y exige autenticación por correo y contraseña', async () => {
    const { LoginView } = await import('../../components/LoginView');
    const { VetProvider } = await import('../../context/VetContext');

    const { container } = render(
      <VetProvider>
        <LoginView />
      </VetProvider>
    );

    const buttons = container.querySelectorAll('button');
    const quickAccessBtn = Array.from(buttons).find((b) => b.textContent?.includes('Acceso Rápido'));
    expect(quickAccessBtn).toBeUndefined(); // Sin botones de bypass

    const submitBtn = Array.from(buttons).find((b) => b.textContent?.includes('Ingresar al Hospital'));
    expect(submitBtn).toBeDefined();

    const emailInput = container.querySelector('input[type="email"]');
    const passInput = container.querySelector('input[type="password"]');
    expect(emailInput).toBeDefined();
    expect(passInput).toBeDefined();
  });
});
