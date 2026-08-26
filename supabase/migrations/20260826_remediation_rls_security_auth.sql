-- ==============================================================================
-- VET SYSTEM — MIGRACIÓN DE SEGURIDAD, RLS ESTRICTO Y AUTENTICACIÓN
-- Fecha: 2026-08-26
-- Objetivo: Revocación total de acceso anónimo y blindaje RBAC / Multi-Sede
-- ==============================================================================

-- 1. FUNCIONES HELPER SEGURAS PARA RLS
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    (SELECT role FROM public.users WHERE id = auth.uid()::text),
    'ANON'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_auth_branch()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT branch_id FROM public.profiles WHERE id = auth.uid()),
    (SELECT branch_id FROM public.users WHERE id = auth.uid()::text),
    'branch-1'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin_or_director()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.get_auth_role() IN ('SUPERADMIN', 'DIRECCION_MEDICA', 'ADMINISTRADOR', 'DIRECTOR_MEDICO');
$$;

-- 2. HABILITAR ROW LEVEL SECURITY EN TODAS LAS TABLAS
ALTER TABLE IF EXISTS public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patient_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.laboratory_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.imaging_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.triage_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clinical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cash_sessions ENABLE ROW LEVEL SECURITY;

-- 3. ELIMINAR TODAS LAS POLÍTICAS ANÓNIMAS ABIERTAS
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'branches', 'users', 'profiles', 'owners', 'patients', 'vital_signs',
        'patient_problems', 'consultations', 'hospitalizations', 'surgeries',
        'laboratory_orders', 'imaging_studies', 'vaccinations', 'products',
        'inventory_movements', 'appointments', 'triage_entries', 'invoices',
        'estimates', 'clinical_documents', 'audit_logs', 'cash_sessions'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access policy for %I" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant and role access policy for %I" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated on %I" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated users access for %I" ON public.%I', t, t);
    END LOOP;
END $$;

-- 4. POLÍTICAS RESTRICTIVAS POR ROL Y SEDE (SÓLO PARA USUARIOS AUTENTICADOS)

-- Pacientes: lectura/escritura exclusiva para usuarios autenticados de la misma sede o superadmin
CREATE POLICY "Authenticated users access for patients"
ON public.patients
FOR ALL
TO authenticated
USING (
    public.is_superadmin_or_director() OR
    branch_id IS NULL OR
    branch_id = public.get_auth_branch()
)
WITH CHECK (
    public.is_superadmin_or_director() OR
    branch_id IS NULL OR
    branch_id = public.get_auth_branch()
);

-- Propietarios / Tutores: lectura/escritura exclusiva para autenticados
CREATE POLICY "Authenticated users access for owners"
ON public.owners
FOR ALL
TO authenticated
USING (
    public.is_superadmin_or_director() OR
    branch_id IS NULL OR
    branch_id = public.get_auth_branch()
)
WITH CHECK (
    public.is_superadmin_or_director() OR
    branch_id IS NULL OR
    branch_id = public.get_auth_branch()
);

-- Documentos Clínicos: acceso exclusivo para autenticados
CREATE POLICY "Authenticated users access for clinical_documents"
ON public.clinical_documents
FOR ALL
TO authenticated
USING (
    public.is_superadmin_or_director() OR
    branch_id IS NULL OR
    branch_id = public.get_auth_branch()
)
WITH CHECK (
    public.is_superadmin_or_director() OR
    branch_id IS NULL OR
    branch_id = public.get_auth_branch()
);

-- Auditoría: Inserción permitida para registrar eventos; lectura sólo para roles autorizados; UPDATE/DELETE denegado
CREATE POLICY "Authenticated insert for audit_logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authorized select for audit_logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
    public.get_auth_role() IN ('SUPERADMIN', 'DIRECCION_MEDICA', 'ADMINISTRADOR', 'DIRECTOR_MEDICO', 'AUDITOR')
);

-- Finanzas / Facturas
CREATE POLICY "Authenticated users access for invoices"
ON public.invoices
FOR ALL
TO authenticated
USING (
    public.is_superadmin_or_director() OR
    branch_id IS NULL OR
    branch_id = public.get_auth_branch()
)
WITH CHECK (
    public.is_superadmin_or_director() OR
    branch_id IS NULL OR
    branch_id = public.get_auth_branch()
);

-- Tablas Clínicas (Consultas, Internación, Cirugías, Signos, Laboratorio, Imágenes, Vacunas)
DO $$
DECLARE
    t text;
    clinical_tables text[] := ARRAY[
        'vital_signs', 'patient_problems', 'consultations', 'hospitalizations',
        'surgeries', 'laboratory_orders', 'imaging_studies', 'vaccinations',
        'products', 'inventory_movements', 'appointments', 'triage_entries',
        'estimates', 'cash_sessions', 'branches', 'users'
    ];
BEGIN
    FOREACH t IN ARRAY clinical_tables LOOP
        EXECUTE format('
            CREATE POLICY "Authenticated access for %I"
            ON public.%I
            FOR ALL
            TO authenticated
            USING (
                public.is_superadmin_or_director() OR
                branch_id IS NULL OR
                branch_id = public.get_auth_branch()
            )
            WITH CHECK (
                public.is_superadmin_or_director() OR
                branch_id IS NULL OR
                branch_id = public.get_auth_branch()
            )
        ', t, t);
    END LOOP;
END $$;
