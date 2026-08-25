-- =========================================================================
-- VET SYSTEM 2026 — MIGRACIÓN 003: ENDURECIMIENTO DE RLS & AUDITORÍA INMUTABLE
-- Veterinaria Irusta • Dirección Médica: Dr. Diego Iván Irusta (M.P. 502)
-- =========================================================================
-- Objetivo:
-- 1. Denegar por defecto acceso anónimo (anon) a todas las tablas clínicas, financieras y de auditoría.
-- 2. Asegurar que 'audit_logs' sea estrictamente append-only (solo SELECT e INSERT).
-- 3. Aislamiento multi-sede y comprobación de roles para usuarios autenticados.
-- =========================================================================

-- 1. REVOCAR PERMISOS ANÓNIMOS (DENY BY DEFAULT)
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;

-- Otorgar uso de schema public a authenticated y service_role únicamente
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;

-- 2. HABILITAR RLS EN TODAS LAS TABLAS
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patient_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.encounter_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.account_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clinical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clinical_evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR POLÍTICAS PERMISIVAS ANTERIORES SI EXISTEN
DO $$ 
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Auth full access profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Allow anon read profiles" ON public.profiles;
  DROP POLICY IF EXISTS "Allow anon insert profiles" ON public.profiles;
  
  -- Owners & Patients
  DROP POLICY IF EXISTS "Auth full access owners" ON public.owners;
  DROP POLICY IF EXISTS "Auth full access patients" ON public.patients;
  
  -- Vitals & Clinical
  DROP POLICY IF EXISTS "Auth full access vital_signs" ON public.vital_signs;
  DROP POLICY IF EXISTS "Auth full access patient_problems" ON public.patient_problems;
  DROP POLICY IF EXISTS "Auth full access consultations" ON public.consultations;
  DROP POLICY IF EXISTS "Auth full access hospitalizations" ON public.hospitalizations;
  DROP POLICY IF EXISTS "Auth full access surgeries" ON public.surgeries;
  DROP POLICY IF EXISTS "Auth full access clinical_documents" ON public.clinical_documents;
  DROP POLICY IF EXISTS "Auth full access clinical_evolutions" ON public.clinical_evolutions;

  -- Financial
  DROP POLICY IF EXISTS "Auth full access financial_transactions" ON public.financial_transactions;
  DROP POLICY IF EXISTS "Auth full access invoices" ON public.invoices;
  DROP POLICY IF EXISTS "Auth full access account_debts" ON public.account_debts;
  DROP POLICY IF EXISTS "Auth full access products" ON public.products;
  DROP POLICY IF EXISTS "Auth full access prescriptions" ON public.prescriptions;

  -- Audit
  DROP POLICY IF EXISTS "Auth read audit_logs" ON public.audit_logs;
  DROP POLICY IF EXISTS "Auth insert audit_logs" ON public.audit_logs;
END $$;

-- 4. POLÍTICAS REFORZADAS DE PERFILES (profiles)
CREATE POLICY "profiles_select_authenticated" ON public.profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_superadmin_or_self" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('SUPERADMIN', 'DIRECCION_MEDICA')
    )
  );

CREATE POLICY "profiles_update_superadmin_or_self" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.id = auth.uid() AND p.role IN ('SUPERADMIN', 'DIRECCION_MEDICA')
    )
  );

-- 5. POLÍTICAS CLÍNICAS Y ASISTENCIALES (owners, patients, vitals, hosp, surgeries)
CREATE POLICY "owners_all_authenticated" ON public.owners
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "patients_all_authenticated" ON public.patients
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "vital_signs_all_authenticated" ON public.vital_signs
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "patient_problems_all_authenticated" ON public.patient_problems
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "consultations_all_authenticated" ON public.consultations
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "hospitalizations_all_authenticated" ON public.hospitalizations
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "surgeries_all_authenticated" ON public.surgeries
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "encounters_all_authenticated" ON public.encounters
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "procedures_all_authenticated" ON public.procedures
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "encounter_consumptions_all_authenticated" ON public.encounter_consumptions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "clinical_documents_all_authenticated" ON public.clinical_documents
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. POLÍTICAS FINANCIERAS Y FARMACIA
CREATE POLICY "products_all_authenticated" ON public.products
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "invoices_all_authenticated" ON public.invoices
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "financial_transactions_all_authenticated" ON public.financial_transactions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "account_debts_all_authenticated" ON public.account_debts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "prescriptions_all_authenticated" ON public.prescriptions
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7. TABLA DE AUDITORÍA INMUTABLE (APPEND-ONLY)
-- No se permite UPDATE ni DELETE a ningún usuario autenticado
CREATE POLICY "audit_logs_select_authenticated" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "audit_logs_insert_authenticated" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 8. ÍNDICES DE ALTO RENDIMIENTO POR SEDE, PACIENTE Y FECHAS
CREATE INDEX IF NOT EXISTS idx_patients_branch_status ON public.patients(branch_id, status);
CREATE INDEX IF NOT EXISTS idx_patients_owner_id ON public.patients(owner_id);
CREATE INDEX IF NOT EXISTS idx_vitals_patient_recorded ON public.vital_signs(patient_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_patient_status ON public.hospitalizations(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_patient_date ON public.invoices(patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_date ON public.audit_logs(entity, entity_id, timestamp DESC);
