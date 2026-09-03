import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  getPatientCanonicalStatus,
  formatWeight,
  calculateMeanArterialPressure,
} from '../../utils/formatters';

describe('QA 360° — Seguridad OWASP, Sanitización y Cálculos Clínicos', () => {
  describe('1. Sanitización de Caracteres Especiales (XSS Defense)', () => {
    it('debe escapar etiquetas <script> y atributos maliciosos', () => {
      const maliciousInput = '<script>alert("XSS")</script>';
      const sanitized = escapeHtml(maliciousInput);
      expect(sanitized).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      expect(sanitized).not.toContain('<');
      expect(sanitized).not.toContain('>');
    });

    it('debe escapar payloads con manejadores de eventos (onerror/onload)', () => {
      const payload = '<img src="x" onerror="document.location=\'http://evil.com\'" />';
      const sanitized = escapeHtml(payload);
      expect(sanitized).toBe('&lt;img src=&quot;x&quot; onerror=&quot;document.location=&#039;http://evil.com&#039;&quot; /&gt;');
    });

    it('debe manejar de forma segura entradas vacías, nulas o indefinidas', () => {
      expect(escapeHtml(null)).toBe('');
      expect(escapeHtml(undefined)).toBe('');
      expect(escapeHtml('')).toBe('');
      expect(escapeHtml(42)).toBe('42');
    });
  });

  describe('2. Integridad del Estado Canónico de Pacientes', () => {
    it('debe priorizar estado INTERNADO si el paciente posee internación activa en UCI', () => {
      const patient = { id: 'pat-1', name: 'Anya', status: 'ACTIVO' };
      const hospitalizations = [
        { patientId: 'pat-1', status: 'ACTIVA', kennelNumber: '02', sector: 'UCI' },
      ];

      const canonical = getPatientCanonicalStatus(patient, hospitalizations);
      expect(canonical.statusCode).toBe('INTERNADO');
      expect(canonical.isHospitalized).toBe(true);
      expect(canonical.label).toContain('INTERNADO');
      expect(canonical.label).toContain('Box 02');
    });

    it('debe resolver ARCHIVADO para pacientes archivados aunque existan registros previos', () => {
      const patient = { id: 'pat-2', name: 'Rex', status: 'ARCHIVADO', isArchived: true };
      const hospitalizations = [
        { patientId: 'pat-2', status: 'ALTA', kennelNumber: '01' },
      ];

      const canonical = getPatientCanonicalStatus(patient, hospitalizations);
      expect(canonical.statusCode).toBe('ARCHIVADO');
      expect(canonical.isHospitalized).toBe(false);
      expect(canonical.label).toBe('Archivado');
    });

    it('debe resolver ALTA MÉDICA cuando el estado es ALTA o ALTA_MEDICA', () => {
      const patient = { id: 'pat-3', name: 'Milo', status: 'ALTA_MEDICA' };
      const canonical = getPatientCanonicalStatus(patient, []);
      expect(canonical.statusCode).toBe('ALTA_MEDICA');
      expect(canonical.label).toBe('Alta Médica');
    });
  });

  describe('3. Precisión Matemática de Signos Vitales y Biometría', () => {
    it('debe calcular la Presión Arterial Media (PAM) con la fórmula clínica exacta (PAS + 2*PAD)/3', () => {
      // TAS: 120, TAD: 80 -> (120 + 160) / 3 = 280 / 3 = 93.33 -> redondeado 93
      const pam1 = calculateMeanArterialPressure(120, 80);
      expect(pam1).toBe(93);

      // TAS: 140, TAD: 90 -> (140 + 180) / 3 = 320 / 3 = 106.66 -> redondeado 107
      const pam2 = calculateMeanArterialPressure(140, 90);
      expect(pam2).toBe(107);
    });

    it('debe formatear pesos con un decimal exacto y manejar cadenas o ceros', () => {
      expect(formatWeight(30)).toBe('30.0 kg');
      expect(formatWeight('15.5')).toBe('15.5 kg');
      expect(formatWeight(0)).toBe('0.0 kg');
      expect(formatWeight(null, 'N/D')).toBe('N/D');
    });
  });
});
