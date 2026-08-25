import { describe, it, expect } from 'vitest';
import { formatPhoneNumberE164 } from '../../utils/formatters';

describe('WhatsApp Hub Modal & Communication Templates', () => {
  it('formats Argentine phone numbers to E.164 accurately', () => {
    expect(formatPhoneNumberE164('+5493584362824')).toBe('5493584362824');
    expect(formatPhoneNumberE164('3584362824')).toContain('3584362824');
    expect(formatPhoneNumberE164('+54 9 2942 47-7136')).toBe('5492942477136');
  });

  it('verifies institutional messaging includes Dr. Diego Iván Irusta and Veterinaria Irusta', () => {
    const ownerName = 'Enzo Girardi';
    const petName = 'Duque';
    const vetName = 'Dr. Diego Iván Irusta';
    const clinicName = 'Veterinaria Irusta';
    const emergencyPhone = '+54 9 2942 47-7136';

    const msg = `Estimado/a ${ownerName} 👋:
Le enviamos el *Reporte Médico & Novedades* de *${petName}* de *${clinicName}*.

📋 *Estado Clínico & Evolución:*
Paciente hemodinámicamente estable con buena tolerancia.

🩺 *Monitoreo:* Cuidados intensivos y control de constantes bajo supervisión del *${vetName}* (M.P. 502).
📱 *WhatsApp de Guardia:* ${emergencyPhone}.`;

    expect(msg).toContain('Enzo Girardi');
    expect(msg).toContain('Duque');
    expect(msg).toContain('Veterinaria Irusta');
    expect(msg).toContain('Dr. Diego Iván Irusta');
    expect(msg).toContain('+54 9 2942 47-7136');
    expect(msg).not.toContain('VET SYSTEM Hospital');
  });
});
