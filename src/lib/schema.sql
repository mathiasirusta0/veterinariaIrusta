-- VET SYSTEM 2026 — Complete Supabase PostgreSQL Schema & Security Policies (RLS)

-- 1. PROFILES TABLE (Associated with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'VETERINARIO',
  branch_id TEXT NOT NULL DEFAULT 'branch-1',
  license_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. OWNERS TABLE
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

-- 3. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
  id TEXT PRIMARY KEY,
  owner_id TEXT REFERENCES public.owners(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  sex TEXT,
  reproductive_status TEXT,
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

-- 4. CLINICAL ENCOUNTERS (Atención Ambulatoria & Guardia/Internación)
CREATE TABLE IF NOT EXISTS public.encounters (
  id TEXT PRIMARY KEY,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'AMBULATORIA',
  status TEXT NOT NULL DEFAULT 'EN_CURSO',
  admitted_at TIMESTAMPTZ DEFAULT NOW(),
  discharged_at TIMESTAMPTZ,
  vet_in_charge_id TEXT,
  vet_in_charge_name TEXT,
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

-- 5. CLINICAL PROCEDURES
CREATE TABLE IF NOT EXISTS public.procedures (
  id TEXT PRIMARY KEY,
  encounter_id TEXT REFERENCES public.encounters(id) ON DELETE CASCADE,
  patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
  procedure_name TEXT NOT NULL,
  category TEXT DEFAULT 'TERAPEUTICO',
  is_performed BOOLEAN DEFAULT FALSE,
  performed_at TIMESTAMPTZ,
  performed_by TEXT,
  price NUMERIC DEFAULT 0,
  is_billable BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ENCOUNTER CONSUMPTIONS (Prefacturación y Trazabilidad)
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
  performed_by TEXT,
  is_billed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. FINANCIAL TRANSACTIONS (Caja & Finanzas)
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id TEXT PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  concept TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  branch_id TEXT NOT NULL DEFAULT 'branch-1',
  patient_id TEXT,
  owner_id TEXT,
  status TEXT DEFAULT 'CONFIRMADO',
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INVOICES (Facturas & Comprobantes)
CREATE TABLE IF NOT EXISTS public.invoices (
  id TEXT PRIMARY KEY,
  invoice_number TEXT NOT NULL,
  type TEXT NOT NULL,
  point_of_sale INTEGER DEFAULT 1,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  owner_id TEXT,
  patient_id TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'EMITIDA',
  payment_method TEXT NOT NULL,
  cae_number TEXT,
  cae_expiration_date DATE,
  branch_id TEXT NOT NULL DEFAULT 'branch-1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ACCOUNT DEBTS (Cuentas Corrientes)
CREATE TABLE IF NOT EXISTS public.account_debts (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  person_name TEXT NOT NULL,
  owner_id TEXT,
  concept TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  remaining_amount NUMERIC NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'PENDIENTE',
  branch_id TEXT NOT NULL DEFAULT 'branch-1',
  payments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AUDIT LOGS (Inmutables)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id TEXT,
  details TEXT,
  previous_value TEXT,
  new_value TEXT
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounter_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to perform standard operations
CREATE POLICY "Authenticated users have full access to profiles" ON public.profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to owners" ON public.owners FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to patients" ON public.patients FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to encounters" ON public.encounters FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to procedures" ON public.procedures FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to consumptions" ON public.encounter_consumptions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to financial_transactions" ON public.financial_transactions FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to invoices" ON public.invoices FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users have full access to account_debts" ON public.account_debts FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert and read audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);
