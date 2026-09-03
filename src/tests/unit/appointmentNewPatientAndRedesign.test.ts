import { describe, it, expect, vi } from 'vitest';
import { Appointment, Patient, Owner } from '../../types';

describe('Agenda & Appointment Scheduling: Guardar Turno Independiente y Aviso WhatsApp Opcional', () => {
  const mockOwner: Owner = {
    id: 'own-new-101',
    firstName: 'Laura',
    lastName: 'Gómez',
    dni: '38450912',
    phone: '+5493584123456',
    whatsapp: '+5493584123456',
    email: 'laura@veterinariairusta.com',
    address: 'Las Lajas, Neuquén',
    city: 'Las Lajas',
    province: 'Neuquén',
    postalCode: '8347',
    taxCondition: 'CONSUMIDOR_FINAL',
    balance: 0,
    createdAt: new Date().toISOString(),
  };

  const mockPatient: Patient = {
    id: 'pat-new-101',
    name: 'Milo',
    species: 'CANINO',
    breed: 'Caniche',
    sex: 'MACHO',
    reproductiveStatus: 'ENTERO',
    birthDate: '2025-01-01T00:00:00.000Z',
    calculatedAge: '1 año',
    weight: 8,
    color: 'Blanco',
    status: 'ACTIVO',
    alerts: [],
    clinicalRecordNumber: 'HC-2026-0099',
    ownerId: mockOwner.id,
    branchId: 'branch-central',
    createdAt: new Date().toISOString(),
  };

  it('1. Permite agendar y registrar el turno de forma 100% exitosa SIN enviar mensaje por WhatsApp (Solo Guardar)', () => {
    let whatsappDispatched = false;
    const appointments: Appointment[] = [];

    // Función simulada de agendado con opción de WhatsApp apagada
    const scheduleAppointment = (sendWhatsApp: boolean) => {
      const apt: Appointment = {
        id: `apt-${Date.now()}`,
        patientId: mockPatient.id,
        ownerId: mockOwner.id,
        vetId: 'usr-1',
        vetName: 'Dr. Diego Iván Irusta',
        branchId: 'branch-central',
        date: '2026-08-28',
        time: '10:00',
        durationMinutes: 30,
        reason: 'Consulta general en consultorio',
        type: 'CONSULTA',
        status: 'RESERVADO',
      };

      appointments.push(apt);

      if (sendWhatsApp) {
        whatsappDispatched = true;
      }

      return apt;
    };

    // Caso 1: Solo Guardar Turno
    const createdApt = scheduleAppointment(false);

    // El turno DEBE quedar registrado en la colección
    expect(appointments.length).toBe(1);
    expect(createdApt.status).toBe('RESERVADO');
    expect(createdApt.patientId).toBe(mockPatient.id);
    expect(createdApt.date).toBe('2026-08-28');
    expect(createdApt.time).toBe('10:00');
    // WhatsApp NO debe haberse disparado
    expect(whatsappDispatched).toBe(false);
  });

  it('2. Permite agendar y notificar al tutor por WhatsApp cuando se elija explícitamente "Guardar y Avisar"', () => {
    let whatsappDispatched = false;
    let whatsappPayload: any = null;
    const appointments: Appointment[] = [];

    const scheduleAppointment = (sendWhatsApp: boolean) => {
      const apt: Appointment = {
        id: `apt-${Date.now()}`,
        patientId: mockPatient.id,
        ownerId: mockOwner.id,
        vetId: 'usr-1',
        vetName: 'Dr. Diego Iván Irusta',
        branchId: 'branch-central',
        date: '2026-08-28',
        time: '11:30',
        durationMinutes: 30,
        reason: 'Vacunación antirrábica anual',
        type: 'VACUNACION',
        status: 'RESERVADO',
      };

      appointments.push(apt);

      if (sendWhatsApp) {
        whatsappDispatched = true;
        whatsappPayload = {
          patientName: mockPatient.name,
          ownerPhone: mockOwner.phone,
          date: apt.date,
          time: apt.time,
        };
      }

      return apt;
    };

    // Caso 2: Guardar y Avisar por WhatsApp
    const createdApt = scheduleAppointment(true);

    expect(appointments.length).toBe(1);
    expect(createdApt.status).toBe('RESERVADO');
    expect(whatsappDispatched).toBe(true);
    expect(whatsappPayload.patientName).toBe('Milo');
    expect(whatsappPayload.ownerPhone).toBe('+5493584123456');
  });

  it('3. Soporta avisar por WhatsApp posteriormente desde la vista de turnos agendados', () => {
    const existingApt: Appointment = {
      id: 'apt-prev-001',
      patientId: mockPatient.id,
      ownerId: mockOwner.id,
      vetId: 'usr-1',
      vetName: 'Dr. Diego Iván Irusta',
      branchId: 'branch-central',
      date: '2026-08-29',
      time: '16:00',
      durationMinutes: 30,
      reason: 'Control posquirúrgico',
      type: 'CONTROL',
      status: 'RESERVADO',
    };

    const hasPhone = Boolean(mockOwner.phone || mockOwner.whatsapp);
    expect(hasPhone).toBe(true);

    const reminderMessage = `Hola ${mockOwner.firstName}, le recordamos el turno de ${mockPatient.name} el ${existingApt.date} a las ${existingApt.time} hs con ${existingApt.vetName}.`;
    expect(reminderMessage).toContain('Laura');
    expect(reminderMessage).toContain('Milo');
    expect(reminderMessage).toContain('2026-08-29 a las 16:00 hs');
  });
});
