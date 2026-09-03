import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ARCA_FISCAL_ENABLED } from '../../types';
import { normalizeInvoice } from '../../utils/normalizers';

describe('Test Estático de Ausencia de Términos Fiscales & Contención de ARCA/AFIP', () => {
  it('ARCA_FISCAL_ENABLED debe ser estrictamente false', () => {
    expect(ARCA_FISCAL_ENABLED).toBe(false);
  });

  it('No debe existir generación aleatoria de CAE ni simulación fiscal en código de producción', () => {
    const srcDir = path.resolve(__dirname, '../../');
    const filesToExclude = ['tests', 'node_modules', 'dist'];

    function scanDir(dir: string): string[] {
      let results: string[] = [];
      const list = fs.readdirSync(dir);
      list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          if (!filesToExclude.some((ex) => file.includes(ex))) {
            results = results.concat(scanDir(filePath));
          }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
          results.push(filePath);
        }
      });
      return results;
    }

    const tsFiles = scanDir(srcDir);
    const forbiddenPatterns = [
      /Math\.floor\(1e13/i,
      /Math\.random\(\)\s*\*\s*9e13/i,
      /'FACTURA_A'/g,
      /'FACTURA_B'/g,
      /'FACTURA_C'/g,
      /"FACTURA_A"/g,
      /"FACTURA_B"/g,
      /"FACTURA_C"/g,
    ];

    const violations: { file: string; match: string }[] = [];

    tsFiles.forEach((filePath) => {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      forbiddenPatterns.forEach((pattern) => {
        const matches = fileContent.match(pattern);
        if (matches) {
          violations.push({
            file: path.relative(srcDir, filePath),
            match: matches[0],
          });
        }
      });
    });

    expect(violations).toEqual([]);
  });

  it('normalizeInvoice normaliza cualquier comprobante a documento no fiscal RECIBO_X', () => {
    const raw = {
      id: 'inv-123',
      invoice_number: 'REC-0001-00004921',
      total_amount: 15000,
      customer_name: 'María García',
    };

    const normalized = normalizeInvoice(raw);
    expect(normalized.isFiscal).toBe(false);
    expect(normalized.type).toBe('RECIBO_X');
    expect(normalized.status).toBe('EMITIDO');
    expect(normalized.invoiceNumber).toBe('REC-0001-00004921');
  });
});
