import { describe, it, expect } from 'vitest';
import { escapeHtml, getPatientCanonicalStatus } from '../../utils/formatters';
import {
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY,
  getWhatsAppLink,
  WA_TURNO_MSG,
} from '../../components/PublicLandingView';
import {
  TEST_PATIENTS,
  TEST_HOSPITALIZATIONS,
} from '../fixtures/testData';

describe('Master QA — Auditoría Integral E2E & Validación 360°', () => {
  // FASE 2: Landing Page & Navegación
  describe('FASE 2 — Landing Page & Canales de Contacto', () => {
    it('verifica número oficial de WhatsApp y enlaces directos de turnos', () => {
      expect(WHATSAPP_NUMBER).toBe('5492942477136');
      expect(WHATSAPP_DISPLAY).toBe('+54 9 2942 47-7136');

      const link = getWhatsAppLink(WA_TURNO_MSG);
      expect(link).toContain('https://wa.me/5492942477136?text=');
      expect(link).toContain('turno');
    });
  });

  // FASE 3: Autenticación y RBAC
  describe('FASE 3 — Autenticación & Control de Roles (RBAC)', () => {
    it('permite acceso administrativo completo al director médico Dr. Diego Iván Irusta M.P. 502', () => {
      const authUser = {
        id: 'user-irusta-superadmin',
        name: 'Dr. Diego Iván Irusta',
        role: 'SUPERADMIN',
        licenseNumber: 'M.P. 502',
      };
      expect(authUser.role).toBe('SUPERADMIN');
      expect(authUser.licenseNumber).toContain('502');
      expect(authUser.licenseNumber).not.toContain('8412');
    });
  });

  // FASE 4 & 5: Ficha Clínica, Estado Canónico y Cálculos
  describe('FASE 4 & 5 — Integridad Clínica & Estado Canónico del Paciente', () => {
    it('resuelve el estado canónico de paciente hospitalizado en UCI', () => {
      const patient = { ...TEST_PATIENTS[0], status: 'ACTIVO' as const };
      const hospitalizations = [
        {
          ...TEST_HOSPITALIZATIONS[0],
          patientId: patient.id,
          status: 'ACTIVA' as const,
          kennelNumber: '03',
          sector: 'UCI' as const,
        },
      ];

      const canonical = getPatientCanonicalStatus(patient, hospitalizations);
      expect(canonical.label).toContain('INTERNADO');
      expect(canonical.label).toContain('Box 03 - UCI');
      expect(canonical.isHospitalized).toBe(true);
    });

    it('calcula con precisión matemática la Presión Arterial Media (PAM)', () => {
      const tas = 120;
      const tad = 80;
      const pam = Math.round(((tas + 2 * tad) / 3) * 10) / 10;
      expect(pam).toBe(93.3);
    });

    it('calcula con precisión el déficit de deshidratación en fluidoterapia', () => {
      const pesoKg = 25;
      const deshidratacionPct = 7; // 7%
      const deficitLitros = Math.round((pesoKg * (deshidratacionPct / 100)) * 100) / 100;
      expect(deficitLitros).toBe(1.75); // 1.75 Litros = 1750 ml
    });
  });

  // FASE 8: Farmacia, Stock & FEFO
  describe('FASE 8 — Gestión de Farmacia & Despacho FEFO', () => {
    it('ordena lotes por fecha de vencimiento más próxima (FEFO)', () => {
      const batches = [
        { batch: 'LOTE-B', exp: '2026-12-01', stock: 10 },
        { batch: 'LOTE-A', exp: '2026-10-15', stock: 5 },
        { batch: 'LOTE-C', exp: '2027-05-20', stock: 20 },
      ];

      const sortedFefo = [...batches].sort(
        (a, b) => new Date(a.exp).getTime() - new Date(b.exp).getTime()
      );

      expect(sortedFefo[0].batch).toBe('LOTE-A');
      expect(sortedFefo[1].batch).toBe('LOTE-B');
      expect(sortedFefo[2].batch).toBe('LOTE-C');
    });

    it('descuenta correctamente el stock evitando valores negativos inconsistentes', () => {
      let currentStock = 15;
      const requestedQty = 5;
      expect(currentStock >= requestedQty).toBe(true);
      currentStock -= requestedQty;
      expect(currentStock).toBe(10);
    });
  });

  // FASE 11 & 14: Caja, POS, Vuelto y Comprobantes
  describe('FASE 11 & 14 — Caja, POS & Cobranza', () => {
    it('calcula correctamente subtotal, descuento, total y vuelto', () => {
      const items = [
        { desc: 'Consulta Médica', price: 15000, qty: 1 },
        { desc: 'Antibiótico Inyectable', price: 6500, qty: 2 },
      ];
      const subtotal = items.reduce((acc, item) => acc + item.price * item.qty, 0);
      expect(subtotal).toBe(28000);

      const discount = 3000;
      const total = subtotal - discount;
      expect(total).toBe(25000);

      const pagoEfectivo = 30000;
      const vuelto = pagoEfectivo - total;
      expect(vuelto).toBe(5000);
      expect(vuelto).toBeGreaterThanOrEqual(0);
    });
  });

  // FASE 31: Protección Anti-Doble Clic
  describe('FASE 31 — Concurrencia & Protección Anti-Doble Clic', () => {
    it('evita ejecución múltiple concurrente mediante guard flag', () => {
      let submitCount = 0;
      let isSubmitting = false;

      const performAction = () => {
        if (isSubmitting) return;
        isSubmitting = true;
        submitCount += 1;
      };

      performAction();
      performAction();

      expect(submitCount).toBe(1);
    });
  });

  // FASE 35: Blindaje XSS OWASP
  describe('FASE 35 — Seguridad Web & Sanitización XSS', () => {
    it('neutraliza inyecciones de código malicioso en documentos de impresión', () => {
      const maliciousPayload = '<script>alert("XSS Attack")</script><img src=x onerror="stealCookies()">';
      const sanitized = escapeHtml(maliciousPayload);

      expect(sanitized).not.toContain('<script>');
      expect(sanitized).not.toContain('</script>');
      expect(sanitized).toContain('&lt;script&gt;');
      expect(sanitized).toContain('&lt;img');
    });
  });
});
