-- ==============================================================================
-- VET SYSTEM — SEED DATA INICIAL PARA SUPABASE CLOUD
-- ==============================================================================

-- 1. SUCURSAL PRINCIPAL
INSERT INTO public.branches (id, name, address, phone, email, is_main)
VALUES 
('branch-central', 'Hospital Veterinario Central', 'Av. del Libertador 4520, CABA', '+54 11 4789-0000', 'contacto@vetsystem.com', true),
('branch-norte', 'Clínica Veterinaria Sede Norte', 'Av. Maipú 2100, Vicente López', '+54 11 4790-1122', 'norte@vetsystem.com', false)
ON CONFLICT (id) DO NOTHING;

-- 2. USUARIOS & STAFF VETERINARIO
INSERT INTO public.users (id, name, email, role, branch_id, license_number, phone, active)
VALUES 
('usr-1', 'Dr. Martín López', 'm.lopez@vetsystem.com', 'DIRECTOR_MEDICO', 'branch-central', 'MP-VET-7841', '+54 9 11 5555-1111', true),
('usr-2', 'Dra. Sofía Albarracín', 's.albarracin@vetsystem.com', 'VETERINARIO_PLANTA', 'branch-central', 'MP-VET-8920', '+54 9 11 5555-2222', true),
('usr-3', 'Dr. Matías Rossi', 'm.rossi@vetsystem.com', 'CIRUJANO', 'branch-central', 'MP-VET-9104', '+54 9 11 5555-3333', true),
('usr-4', 'Enf. Camila Gómez', 'c.gomez@vetsystem.com', 'ENFERMERO', 'branch-central', 'TEC-VET-412', '+54 9 11 5555-4444', true)
ON CONFLICT (id) DO NOTHING;

-- 3. PROPIETARIOS / TUTORES
INSERT INTO public.owners (id, first_name, last_name, dni, phone, whatsapp, email, address, city, balance)
VALUES 
('own-1', 'Carlos', 'Rodríguez', '32.450.812', '+54 11 6789-1234', '+5491167891234', 'carlos.rodriguez@gmail.com', 'Av. Santa Fe 3420, 4B', 'CABA', 0.00),
('own-2', 'Mariana', 'Benítez', '35.120.441', '+54 11 5432-9876', '+5491154329876', 'marianabenitez@hotmail.com', 'Juramento 2150', 'CABA', -15000.00),
('own-3', 'Lucas', 'Fernández', '28.990.123', '+54 11 4567-8901', '+5491145678901', 'lucas.fernandez@gmail.com', 'Cabildo 1890', 'CABA', 0.00)
ON CONFLICT (id) DO NOTHING;

-- 4. PACIENTES
INSERT INTO public.patients (id, owner_id, name, species, breed, sex, reproductive_status, birth_date, calculated_age, weight, color, microchip, photo_url, clinical_record_number, status, alerts)
VALUES 
('pat-1', 'own-1', 'Toby', 'Canino', 'Golden Retriever', 'Macho', 'Castrado', '2021-04-15', '5 años', 32.50, 'Dorado', '981098123456789', 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300', 'HC-2026-0041', 'INTERNADO', '[{"type":"ALERGIA","description":"Alérgico a Dipirona / AINEs inyectables"}]'::jsonb),
('pat-2', 'own-2', 'Luna', 'Felino', 'Siamés', 'Hembra', 'Castrado', '2022-08-10', '3 años 11 meses', 3.80, 'Seal Point', '981098987654321', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300', 'HC-2026-0042', 'ACTIVO', '[]'::jsonb),
('pat-3', 'own-3', 'Rocky', 'Canino', 'Bulldog Francés', 'Macho', 'Entero', '2023-01-20', '3 años 6 meses', 12.40, 'Vaquito', '981098456123789', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300', 'HC-2026-0043', 'ACTIVO', '[{"type":"CONDICION_CRONICA","description":"Síndrome Braquicefálico (BAS) Grado II"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 5. SIGNOS VITALES
INSERT INTO public.vital_signs (id, patient_id, recorded_at, temperature, heart_rate, respiratory_rate, systolic_bp, diastolic_bp, mean_bp, capillary_refill_time_seconds, mucous_membranes, weight, glycemia, oxygen_saturation, pain_score_glasgow, recorded_by, notes)
VALUES 
('vit-1', 'pat-1', now(), 39.4, 128, 28, 125, 75, 92, 2.0, 'Pálidas / Secas', 32.50, 95, 97, 2, 'Enf. Camila Gómez', 'Decaído, fiebre en descenso luego de fluidoterapia fría'),
('vit-2', 'pat-2', now() - INTERVAL '2 days', 38.6, 160, 22, 110, 70, 83, 1.5, 'Rosadas húmedas', 3.80, 110, 99, 0, 'Dra. Sofía Albarracín', 'Control sano anual')
ON CONFLICT (id) DO NOTHING;

-- 6. PROBLEMAS MÉDICOS
INSERT INTO public.patient_problems (id, patient_id, title, description, status, onset_date, vet_name)
VALUES 
('prob-1', 'pat-1', 'Gastroenteritis aguda severa', 'Vómitos biliosos y diarrea hemorrágica de 24 hs de evolución', 'ACTIVO', '2026-08-17', 'Dr. Martín López'),
('prob-2', 'pat-1', 'Deshidratación moderada (8%)', 'Pliegue cutáneo persistente, mucosas secas', 'ACTIVO', '2026-08-17', 'Dr. Martín López')
ON CONFLICT (id) DO NOTHING;

-- 7. CONSULTAS SOAP
INSERT INTO public.consultations (id, patient_id, vet_id, vet_name, branch_id, date_time, reason, anamnesis, soap, physical_exam, diagnoses, prescriptions, requires_hospitalization)
VALUES 
('cons-1', 'pat-1', 'usr-1', 'Dr. Martín López', 'branch-central', now() - INTERVAL '1 day', 'Vómitos y diarrea con sangre', 'Comenzó ayer tras ingerir alimento no habitual en el parque.', 
'{"subjective":"Tutor refiere decaimiento marcado y 4 episodios de vómito con restos alimenticios y bilis. Diarrea con estrías de sangre fresca.","objective":"T: 39.4°C, FC: 128 lpm, FR: 28 rpm. TLLC: 2s. Abdomen tenso con dolor a la palpación epigástrica.","assessment":"Gastroenteritis aguda probablemente infecciosa o por indiscreción alimentaria severa con deshidratación 8%.","plan":"Internación en UCI, fluidoterapia con Ringer Lactato a 40 ml/h, Maropitant 1 mg/kg SC, Omeprazol 1 mg/kg IV cada 24 hs, Cefalexina 30 mg/kg cada 12 hs."}'::jsonb,
'{"temperature":39.4,"heartRate":128,"respiratoryRate":28,"mucousMembranes":"Pálidas secas","tllc":2,"abdominalPalpation":"Dolorosa en epigastrio"}'::jsonb,
ARRAY['Gastroenteritis hemorrágica aguda', 'Deshidratación Grado II'],
'[{"medicationName":"Maropitant (Cerenia)","dose":"1 mg/kg","route":"SC","frequency":"Cada 24 horas","duration":"3 días"},{"medicationName":"Omeprazol 40mg IV","dose":"1 mg/kg","route":"IV","frequency":"Cada 24 horas","duration":"5 días"}]'::jsonb,
true)
ON CONFLICT (id) DO NOTHING;

-- 8. INTERNACIÓN & UCI
INSERT INTO public.hospitalizations (id, patient_id, vet_in_charge_id, vet_in_charge_name, sector, kennel_number, admitted_at, primary_diagnosis, priority, fluid_therapy, feeding, interval_hours, status, branch_id)
VALUES 
('hosp-1', 'pat-1', 'usr-1', 'Dr. Martín López', 'UCI_CRITICOS', 'CANIL-02', now() - INTERVAL '18 hours', 'Gastroenteritis aguda severa con deshidratación 8%', 'CRITICO',
'{"isActive":true,"solutionType":"Ringer Lactato con KCl","volumeTotalMl":1500,"rateMlPerHour":45,"infusionRoute":"IV","startedAt":"2026-08-17T20:00:00Z","prescribedBy":"Dr. Martín López"}'::jsonb,
'{"dietType":"AYUNO_PRESCRIPTO","foodBrand":"N/A","amountGramsOrMl":0,"frequency":"Ayuno 12 hs","tolerance":"N/A"}'::jsonb,
2, 'ACTIVA', 'branch-central')
ON CONFLICT (id) DO NOTHING;

-- 9. CIRUGÍAS PROGRAMADAS
INSERT INTO public.surgeries (id, patient_id, procedure_name, surgeon_name, anesthetist_name, date, start_time, estimated_duration_minutes, asa_grade, status, pre_op_assessment, anesthesia_protocol, surgical_technique)
VALUES 
('surg-1', 'pat-3', 'Rinoplastia & Palatoplastia (BAS)', 'Dr. Matías Rossi', 'Dra. Sofía Albarracín', CURRENT_DATE + INTERVAL '2 days', '09:30', 75, 'ASA_II', 'PROGRAMADA',
'Paciente con estenosis de narinas y paladar blando elongado. ECG normal, coagulograma dentro de parámetros.',
'{"induction":"Propofol 4 mg/kg IV + Midazolam 0.2 mg/kg","maintenance":"Isoflurano 1.8% en O2","analgesia":"Fentanilo CRI + Meloxicam SC"}'::jsonb,
'Resección en cuña alar bilateral y estafilectomía con bisturí armónico.')
ON CONFLICT (id) DO NOTHING;

-- 10. PRODUCTOS DE FARMACIA & MEDICAMENTOS
INSERT INTO public.products (id, branch_id, code, commercial_name, generic_name, category, presentation, current_stock, min_stock, unit, cost_price, sale_price, current_batch, expiration_date, requires_prescription)
VALUES 
('prod-1', 'branch-central', 'FAR-001', 'Cerenia 10ml Inyectable', 'Maropitant', 'MEDICAMENTO', 'Frasco ampolla 10ml', 8, 3, 'FRASCO', 18500.00, 32000.00, 'LOT-MAR-2027', '2027-08-30', true),
('prod-2', 'branch-central', 'FAR-002', 'Ringer Lactato 500ml', 'Solución Hidroelectrolítica', 'DESCARTABLE', 'Sachet 500ml', 24, 10, 'UNIDAD', 1200.00, 2900.00, 'LOT-RL-889', '2028-01-15', false),
('prod-3', 'branch-central', 'FAR-003', 'Meloxivet 5mg Gotas', 'Meloxicam 0.5%', 'MEDICAMENTO', 'Frasco gotero 10ml', 15, 5, 'FRASCO', 4800.00, 9500.00, 'LOT-MEL-41', '2027-04-10', true),
('prod-4', 'branch-central', 'FAR-004', 'Nobivac DHPPI+L', 'Séxtuple Canina', 'BIOLOGICO', 'Dosis monodosis', 20, 8, 'DOSIS', 6200.00, 14500.00, 'LOT-NOB-2026', '2027-06-30', true),
('prod-5', 'branch-central', 'FAR-005', 'Propofol 1% Ampollas', 'Propofol 10mg/ml', 'MEDICAMENTO', 'Ampolla 20ml', 12, 4, 'AMPOLLA', 5500.00, 11000.00, 'LOT-PROP-99', '2027-11-20', true)
ON CONFLICT (id) DO NOTHING;

-- 11. FACTURAS AFIP
INSERT INTO public.invoices (id, branch_id, invoice_number, type, point_of_sale, date, owner_id, patient_id, customer_name, customer_dni_cuit, customer_tax_condition, items, total_amount, payment_method, cae_number, cae_expiration_date)
VALUES 
('inv-1', 'branch-central', '0001-00000104', 'FACTURA_B', 1, CURRENT_DATE, 'own-1', 'pat-1', 'Carlos Rodríguez', '32.450.812', 'Consumidor Final',
'[{"id":"it-1","description":"Consulta Médica de Urgencia & Triage","quantity":1,"unitPrice":18000,"subtotal":18000},{"id":"it-2","description":"Día Internación UCI Críticos","quantity":1,"unitPrice":35000,"subtotal":35000}]'::jsonb,
53000.00, 'MERCADOPAGO', '74381920381923', CURRENT_DATE + INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- 12. LOGS DE AUDITORÍA
INSERT INTO public.audit_logs (id, timestamp, user_name, user_role, action, entity, entity_id, details)
VALUES 
('aud-1', now() - INTERVAL '18 hours', 'Dr. Martín López', 'DIRECTOR_MEDICO', 'INGRESO_INTERNACION', 'Hospitalization', 'hosp-1', 'Ingreso a UCI Canil-02 por Gastroenteritis Hemorrágica'),
('aud-2', now() - INTERVAL '17 hours', 'Enf. Camila Gómez', 'ENFERMERO', 'ADMINISTRACION_MEDICACION', 'Hospitalization', 'hosp-1', 'Administración de Maropitant 1 mg/kg SC'),
('aud-3', now() - INTERVAL '2 hours', 'Dr. Martín López', 'DIRECTOR_MEDICO', 'EMISION_FACTURA', 'Invoice', 'inv-1', 'Factura B 0001-00000104 por $53.000 a Carlos Rodríguez')
ON CONFLICT (id) DO NOTHING;
