import { describe, it, expect } from 'vitest';
import {
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY,
  WA_TURNO_MSG,
  WA_GUARDIA_MSG,
  WA_CAMPO_MSG,
  WA_CONSULTA_MSG,
  getWhatsAppLink,
} from '../../components/PublicLandingView';

describe('Public Landing WhatsApp Integration', () => {
  it('has the official phone number configuration', () => {
    expect(WHATSAPP_NUMBER).toBe('5492942477136');
    expect(WHATSAPP_DISPLAY).toBe('+54 9 2942 47-7136');
  });

  it('generates properly formatted wa.me URLs with encoded automated messages', () => {
    const turnoLink = getWhatsAppLink(WA_TURNO_MSG);
    expect(turnoLink).toContain('https://wa.me/5492942477136?text=');
    expect(turnoLink).toContain('solicitar%20un%20turno');

    const guardiaLink = getWhatsAppLink(WA_GUARDIA_MSG);
    expect(guardiaLink).toContain('https://wa.me/5492942477136?text=');
    expect(guardiaLink).toContain('urgencia%20veterinaria');

    const campoLink = getWhatsAppLink(WA_CAMPO_MSG);
    expect(campoLink).toContain('https://wa.me/5492942477136?text=');
    expect(campoLink).toContain('visita%20a%20campo');
  });

  it('defaults to appointment request message when no custom text is provided', () => {
    const defaultLink = getWhatsAppLink();
    expect(defaultLink).toContain('https://wa.me/5492942477136?text=');
    expect(defaultLink).toContain(encodeURIComponent(WA_TURNO_MSG));
  });
});
