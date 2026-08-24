import { describe, it, expect } from 'vitest';
import { hasViewPermission, getDefaultViewForRole, hasQuickActionPermission } from '../../utils/rbac';

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

  it('hasQuickActionPermission should filter quick action modals based on role', () => {
    // Receptionist can create appointments and patients, but cannot schedule surgery or write prescriptions
    expect(hasQuickActionPermission('RECEPCION', 'NUEVO_TURNO')).toBe(true);
    expect(hasQuickActionPermission('RECEPCION', 'NUEVO_PACIENTE')).toBe(true);
    expect(hasQuickActionPermission('RECEPCION', 'NUEVA_CIRUGIA')).toBe(false);
    expect(hasQuickActionPermission('RECEPCION', 'NUEVO_LAB')).toBe(false);

    // Cashier can create invoices, but not surgeries
    expect(hasQuickActionPermission('CAJA', 'NUEVA_FACTURA')).toBe(true);
    expect(hasQuickActionPermission('CAJA', 'NUEVA_CIRUGIA')).toBe(false);

    // Veterinarian has full clinical quick action access
    expect(hasQuickActionPermission('VETERINARIO', 'NUEVA_CONSULTA')).toBe(true);
    expect(hasQuickActionPermission('VETERINARIO', 'NUEVA_CIRUGIA')).toBe(true);
    expect(hasQuickActionPermission('VETERINARIO', 'NUEVO_LAB')).toBe(true);
  });
});
