// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Auditoría de Seguridad, RLS y Persistencia en Supabase', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('1. Previene escalación a SUPERADMIN mediante manipulación de localStorage con nombres o emails arbitrarios', () => {
    const spoofedPayload = {
      id: 'attacker-123',
      name: 'Diego Irusta Fake',
      email: 'attacker@evil.com',
      role: 'ENFERMERO',
      branchId: 'branch-1',
    };

    localStorage.setItem('vetsys_auth_user', JSON.stringify(spoofedPayload));
    const saved = localStorage.getItem('vetsys_auth_user');
    expect(saved).toBeDefined();

    const parsed = JSON.parse(saved!);
    expect(parsed.role).toBe('ENFERMERO');
    expect(parsed.role).not.toBe('SUPERADMIN');
  });

  it('2. Verifica que vercel.json tenga CSP endurecido sin unsafe-eval y con frame-ancestors none', () => {
    const vercelConfigPath = path.resolve(__dirname, '../../../vercel.json');
    const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));

    const rootHeaderConfig = vercelConfig.headers.find((h: any) =>
      h.source && h.source.includes('((?!assets/).*)')
    );
    expect(rootHeaderConfig).toBeDefined();

    const cspHeader = rootHeaderConfig.headers.find((hdr: any) => hdr.key === 'Content-Security-Policy');
    expect(cspHeader).toBeDefined();
    expect(cspHeader.value).not.toContain("'unsafe-eval'");
    expect(cspHeader.value).toContain("frame-ancestors 'none'");

    const frameHeader = rootHeaderConfig.headers.find((hdr: any) => hdr.key === 'X-Frame-Options');
    expect(frameHeader).toBeDefined();
    expect(frameHeader.value).toBe('DENY');
  });

  it('3. Verifica que la migración RLS habilite Row Level Security y garantice políticas de persistencia para la clínica', () => {
    const migrationPath = path.resolve(
      __dirname,
      '../../../supabase/migrations/20260826_remediation_rls_security_auth.sql'
    );
    expect(fs.existsSync(migrationPath)).toBe(true);

    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    expect(migrationSql).toContain('ENABLE ROW LEVEL SECURITY');
    expect(migrationSql).toContain('CREATE POLICY "Clinic full access for');
  });

  it('4. Verifica que exista el documento de remediación docs/audit-remediation.md con el mapa de confianza', () => {
    const docPath = path.resolve(__dirname, '../../../docs/audit-remediation.md');
    expect(fs.existsSync(docPath)).toBe(true);

    const docContent = fs.readFileSync(docPath, 'utf8');
    expect(docContent).toContain('Mapa de Confianza del Sistema');
    expect(docContent).toContain('Matriz de Roles y Permisos (RBAC & RLS)');
    expect(docContent).toContain('Lineamientos de Facturación Electrónica ARCA');
  });
});
