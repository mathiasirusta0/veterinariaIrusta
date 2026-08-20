import { describe, it, expect } from 'vitest';
import { hasViewPermission, getDefaultViewForRole } from '../../utils/rbac';

describe('RBAC Permissions Matrix Unit Tests', () => {
  it('SUPERADMIN and ADMINISTRADOR should have access to all modules including CONFIGURACION', () => {
    expect(hasViewPermission('SUPERADMIN', 'CONFIGURACION')).toBe(true);
    expect(hasViewPermission('SUPERADMIN', 'CIRUGIAS')).toBe(true);
    expect(hasViewPermission('ADMINISTRADOR', 'CONFIGURACION')).toBe(true);
  });

  it('RECEPCION must be denied access to CONFIGURACION, CIRUGIAS, LABORATORIO, and INVENTARIO', () => {
    expect(hasViewPermission('RECEPCION', 'CONFIGURACION')).toBe(false);
    expect(hasViewPermission('RECEPCION', 'CIRUGIAS')).toBe(false);
    expect(hasViewPermission('RECEPCION', 'LABORATORIO')).toBe(false);
    expect(hasViewPermission('RECEPCION', 'INVENTARIO')).toBe(false);

    // Allowed for reception
    expect(hasViewPermission('RECEPCION', 'AGENDA')).toBe(true);
    expect(hasViewPermission('RECEPCION', 'SALA_ESPERA')).toBe(true);
    expect(hasViewPermission('RECEPCION', 'PACIENTES')).toBe(true);
    expect(hasViewPermission('RECEPCION', 'PROPIETARIOS')).toBe(true);
  });

  it('CAJA must be restricted to financial and document operations', () => {
    expect(hasViewPermission('CAJA', 'CAJA_FACTURACION')).toBe(true);
    expect(hasViewPermission('CAJA', 'CIRUGIAS')).toBe(false);
    expect(hasViewPermission('CAJA', 'CONFIGURACION')).toBe(false);
    expect(hasViewPermission('CAJA', 'LABORATORIO')).toBe(false);
  });

  it('getDefaultViewForRole should return appropriate initial landing page', () => {
    expect(getDefaultViewForRole('CAJA')).toBe('CAJA_FACTURACION');
    expect(getDefaultViewForRole('FARMACIA')).toBe('INVENTARIO');
    expect(getDefaultViewForRole('RECEPCION')).toBe('AGENDA');
    expect(getDefaultViewForRole('ENFERMERIA')).toBe('INTERNACION');
    expect(getDefaultViewForRole('VETERINARIO')).toBe('DASHBOARD');
  });
});
