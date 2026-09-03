-- =========================================================================
-- VET SYSTEM 2026 — ESQUEMA COMPLETO Y POLÍTICAS DE SEGURIDAD (SUPABASE)
-- Veterinaria Irusta • Dirección Médica: Dr. Diego Iván Irusta
-- =========================================================================
-- Instrucciones:
-- 1. Ingresá a tu consola de Supabase (https://app.supabase.com).
-- 2. Seleccioná tu proyecto y abrí "SQL Editor" en el menú lateral.
-- 3. Creá una nueva consulta, pegá este script completo y hacé clic en "RUN".
-- =========================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA DE PERFILES DE USUARIO (Vinculada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'SUPERADMIN',
  branch_id TEXT NOT NULL DEFAULT 'branch-1',
  license_number TEXT DEFAULT 'M.P. 502 - Dirección Médica',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE TUTORES / PROPIETARIOS
CREATE TABLE IF NOT EXISTS public.owners (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  dni TEXT,
  cuit TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  address TEXT,
  city TEXT DEFAULT 'Las Lajas',
  province TEXT DEFAULT 'Neuquén',
  postal_code TEXT DEFAULT '8347',
  notes TEXT,
  balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA DE PACIENTES (Grandes y Pequeños Animales)
CREATE TABLE IF NOT EXISTS public.patients (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES public.owners(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL DEFAULT 'CANINO',
  breed TEXT,
  sex TEXT DEFAULT 'MACHO',
  reproductive_status TEXT DEFAULT 'ENTERO',
  birth_date DATE,
  calculated_age TEXT,
  weight NUMERIC,
  color TEXT,
  microchip TEXT,
  photo_url TEXT,
  clinical_record_number TEXT,
  status TEXT DEFAULT 'ACTIVO',
  alerts JSONB DEFAULT '[]'::jsonb,
  branch_id TEXT NOT NULL DEFAULT 'branch-1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA DE SIGNOS VITALES (Controles Multiparamétricos)
CREATE TABLE IF NOT EXISTS public.vital_signs (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  temperature NUMERIC,
  heart_rate NUMERIC,
  respiratory_rate NUMERIC,
  systolic_bp NUMERIC,
  diastolic_bp NUMERIC,
  mucous_membrane_status TEXT,
  capillary_refill_time_sec NUMERIC,
  pulse_quality TEXT,
  oxygen_saturation NUMERIC,
  glucose_mg_dl NUMERIC,
  pain_scale_score NUMERIC,
  recorded_by TEXT DEFAULT 'Dr. Diego Iván Irusta',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA DE PROBLEMAS CLÍNICOS
CREATE TABLE IF NOT EXISTS public.patient_problems (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  problem_name TEXT NOT NULL,
  category TEXT DEFAULT 'CLINICO',
  status TEXT DEFAULT 'ACTIVO',
  diagnosed_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  notes TEXT
);

-- 6. TABLA DE ENCUENTROS / ATENCIONES UNIFICADAS (Ambulatoria & Internación)
CREATE TABLE IF NOT EXISTS public.encounters (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'AMBULATORIA',
  status TEXT NOT NULL DEFAULT 'EN_CURSO',
  admitted_at TIMESTAMPTZ DEFAULT NOW(),
  discharged_at TIMESTAMPTZ,
  vet_in_charge_id TEXT DEFAULT 'user-irusta',
  vet_in_charge_name TEXT DEFAULT 'Dr. Diego Iván Irusta',
  reason TEXT,
  initial_diagnosis TEXT,
  final_diagnosis TEXT,
  discharge_notes TEXT,
  discharge_prescription TEXT,
  follow_up_date DATE,
  sector TEXT,
  kennel_number TEXT,
  priority TEXT,
  branch_id TEXT NOT NULL DEFAULT 'branch-1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABLA DE PROCEDIMIENTOS CLÍNICOS
CREATE TABLE IF NOT EXISTS public.procedures (
  id TEXT PRIMARY KEY,
  encounter_id TEXT REFERENCES public.encounters(id) ON DELETE CASCADE,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  procedure_name TEXT NOT NULL,
  category TEXT DEFAULT 'TERAPEUTICO',
  is_performed BOOLEAN DEFAULT FALSE,
  performed_at TIMESTAMPTZ,
  performed_by TEXT DEFAULT 'Dr. Diego Iván Irusta',
  price NUMERIC DEFAULT 0,
  is_billable BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TABLA DE CONSUMOS Y PREFACTURACIÓN
CREATE TABLE IF NOT EXISTS public.encounter_consumptions (
  id TEXT PRIMARY KEY,
  encounter_id TEXT REFERENCES public.encounters(id) ON DELETE CASCADE,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  code TEXT NOT NULL,
  concept TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  unit_price NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'CONFIRMADO',
  performed_at TIMESTAMPTZ DEFAULT NOW(),
  performed_by TEXT DEFAULT 'Dr. Diego Iván Irusta',
  is_billed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA DE CONSULTAS MÉDICAS GENERALES
CREATE TABLE IF NOT EXISTS public.consultations (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  vet_name TEXT DEFAULT 'Dr. Diego Iván Irusta',
  date TIMESTAMPTZ DEFAULT NOW(),
  reason TEXT,
  symptoms TEXT,
  physical_exam JSONB DEFAULT '{}'::jsonb,
  differential_diagnosis TEXT,
  definitive_diagnosis TEXT,
  treatment_plan TEXT,
  status TEXT DEFAULT 'COMPLETADA',
  branch_id TEXT NOT NULL DEFAULT 'branch-1'
);

-- 10. TABLA DE HOSPITALIZACIONES / INTERNACIONES
CREATE TABLE IF NOT EXISTS public.hospitalizations (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  vet_in_charge_name TEXT DEFAULT 'Dr. Diego Iván Irusta',
  sector TEXT DEFAULT 'CANIL',
  kennel_number TEXT DEFAULT '01',
  admitted_at TIMESTAMPTZ DEFAULT NOW(),
  discharged_at TIMESTAMPTZ,
  primary_diagnosis TEXT,
  priority TEXT DEFAULT 'ESTABLE',
  fluid_therapy JSONB DEFAULT '{"isActive": false}'::jsonb,
  feeding JSONB DEFAULT '{"dietType": "ORAL"}'::jsonb,
  medications JSONB DEFAULT '[]'::jsonb,
  hourly_sheet JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'ACTIVA',
  branch_id TEXT NOT NULL DEFAULT 'branch-1'
);

-- 11. TABLA DE CIRUGÍAS Y PROTOCOLOS QUIRÚRGICOS
CREATE TABLE IF NOT EXISTS public.surgeries (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  surgery_name TEXT NOT NULL,
  surgeon_name TEXT DEFAULT 'Dr. Diego Iván Irusta',
  anesthesiologist_name TEXT DEFAULT 'Dr. Diego Iván Irusta',
  scheduled_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'PROGRAMADA',
  pre_op_notes TEXT,
  post_op_notes TEXT,
  surgical_description TEXT,
  anesthesia_record JSONB DEFAULT '{}'::jsonb,
  branch_id TEXT NOT NULL DEFAULT 'branch-1'
);

-- 12. TABLA DE PRODUCTOS Y FARMACIA
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  commercial_name TEXT NOT NULL,
  generic_name TEXT,
  category TEXT DEFAULT 'MEDICAMENTO',
  presentation TEXT,
  concentration TEXT,
  laboratory TEXT,
  current_stock NUMERIC DEFAULT 0,
  min_stock NUMERIC DEFAULT 5,
  cost_price NUMERIC DEFAULT 0,
  sale_price NUMERIC DEFAULT 0,
  current_batch TEXT,
  expiration_date DATE,
  supplier TEXT,
  requires_prescription BOOLEAN DEFAULT FALSE,
  branch_id TEXT NOT NULL DEFAULT 'branch-1'
);

-- 13. TABLA DE MOVIMIENTOS FINANCIEROS Y CAJA
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL DEFAULT 'INGRESO',
  category TEXT NOT NULL DEFAULT 'Consultas',
  concept TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'EFECTIVO',
  branch_id TEXT NOT NULL DEFAULT 'branch-1',
  patient_id TEXT,
  owner_id TEXT,
  status TEXT DEFAULT 'CONFIRMADO',
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. TABLA DE COMPROBANTES Y RECIBOS INTERNOS (NO FISCALES)
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'RECIBO_X',
  point_of_sale INTEGER DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  owner_id TEXT,
  patient_id TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'EMITIDO',
  payment_method TEXT NOT NULL,
  branch_id TEXT DEFAULT 'branch-01',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. TABLA DE RECETAS MÉDICAS OFICIALES
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id TEXT PRIMARY KEY,
  prescription_number TEXT NOT NULL,
  prescription_type TEXT DEFAULT 'RECETA_COMUN',
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  owner_id TEXT,
  vet_id TEXT,
  vet_name TEXT DEFAULT 'Dr. Diego Iván Irusta',
  vet_license TEXT DEFAULT 'M.P. 502',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  diagnosis TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  is_dispensed BOOLEAN DEFAULT FALSE,
  digital_signature_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. TABLA DE CUENTAS CORRIENTES Y DEUDAS
CREATE TABLE IF NOT EXISTS public.account_debts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL DEFAULT 'COBRAR',
  person_name TEXT NOT NULL,
  owner_id TEXT,
  concept TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC NOT NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'PENDIENTE',
  branch_id TEXT NOT NULL DEFAULT 'branch-1',
  payments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. TABLA DE DOCUMENTOS Y CONSENTIMIENTOS
CREATE TABLE IF NOT EXISTS public.clinical_documents (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  owner_id TEXT,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  vet_name TEXT DEFAULT 'Dr. Diego Iván Irusta',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. TABLA DE AUDITORÍA INMUTABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_name TEXT NOT NULL DEFAULT 'Dr. Diego Iván Irusta',
  user_role TEXT NOT NULL DEFAULT 'SUPERADMIN',
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  previous_value TEXT,
  new_value TEXT
);

-- =========================================================================
-- SEGURIDAD RLS (ROW LEVEL SECURITY)
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounter_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para usuarios autenticados
CREATE POLICY "Auth full access profiles" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access owners" ON public.owners FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access patients" ON public.patients FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access vital_signs" ON public.vital_signs FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access patient_problems" ON public.patient_problems FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access encounters" ON public.encounters FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access procedures" ON public.procedures FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access encounter_consumptions" ON public.encounter_consumptions FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access consultations" ON public.consultations FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access hospitalizations" ON public.hospitalizations FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access surgeries" ON public.surgeries FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access products" ON public.products FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access financial_transactions" ON public.financial_transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access invoices" ON public.invoices FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access prescriptions" ON public.prescriptions FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access account_debts" ON public.account_debts FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth full access clinical_documents" ON public.clinical_documents FOR ALL TO authenticated USING (true);
CREATE POLICY "Auth read audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
