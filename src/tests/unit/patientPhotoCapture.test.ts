import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Patient Photo Capture & Removal of Monitor UCI Activo', () => {
  it('confirms that "Monitor UCI Activo" is removed from Patient360View', () => {
    const p360Path = path.resolve(__dirname, '../../components/Patient360View.tsx');
    const content = fs.readFileSync(p360Path, 'utf-8');
    expect(content).not.toContain('<span>Monitor UCI Activo</span>');
    expect(content).not.toContain('Monitor UCI Activo');
  });

  it('verifies that patient photo uploader and camera input with environment capture are present', () => {
    const p360Path = path.resolve(__dirname, '../../components/Patient360View.tsx');
    const p360Content = fs.readFileSync(p360Path, 'utf-8');
    expect(p360Content).toContain('capture="environment"');
    expect(p360Content).toContain('Sacar Foto con Cámara');
    expect(p360Content).toContain('Subir desde Archivo');

    const quickModalsPath = path.resolve(__dirname, '../../components/QuickModals.tsx');
    const quickContent = fs.readFileSync(quickModalsPath, 'utf-8');
    expect(quickContent).toContain('capture="environment"');
    expect(quickContent).toContain('Sacar Foto con Cámara');
  });
});
