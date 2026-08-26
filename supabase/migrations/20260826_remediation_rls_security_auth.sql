-- ==============================================================================
-- VET SYSTEM — ESQUEMA RELACIONAL MAESTRO DE BASE DE DATOS (SUPABASE / POSTGRESQL)
-- Versión Corregida & Endurecida (Sin errores de columna branch_id)
-- ==============================================================================

-- 1. SUCURSALES HOSPITALARIAS (branches)
CREATE TABLE IF NOT EXISTS public.branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    is_main BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. USUARIOS & PERFILES PROFESIONALES (users)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    license_number TEXT,
    phone TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. PERFILES VINCULADOS A AUTH.USERS (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'VETERINARIO',
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    license_number TEXT,
    phone TEXT,
    active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. PROPIETARIOS / TUTORES (owners)
CREATE TABLE IF NOT EXISTS public.owners (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dni TEXT UNIQUE NOT NULL,
    cuit TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT DEFAULT 'Río Cuarto',
    province TEXT DEFAULT 'Córdoba',
    postal_code TEXT DEFAULT '5800',
    emergency_contact TEXT,
    notes TEXT,
    balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. PACIENTES VETERINARIOS (patients)
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT NOT NULL,
    sex TEXT NOT NULL,
    reproductive_status TEXT,
    birth_date DATE,
    calculated_age TEXT,
    weight NUMERIC(6, 2) NOT NULL,
    color TEXT,
    microchip TEXT,
    photo_url TEXT,
    clinical_record_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'ACTIVO',
    alerts JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. SIGNOS VITALES HISTÓRICOS (vital_signs)
CREATE TABLE IF NOT EXISTS public.vital_signs (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    temperature NUMERIC(4, 1),
    heart_rate INTEGER,
    respiratory_rate INTEGER,
    systolic_bp INTEGER,
    diastolic_bp INTEGER,
    mean_bp INTEGER,
    capillary_refill_time_seconds NUMERIC(3, 1),
    mucous_membranes TEXT,
    weight NUMERIC(6, 2),
    glycemia INTEGER,
    oxygen_saturation INTEGER,
    pain_score_glasgow INTEGER,
    recorded_by TEXT,
    notes TEXT
);

-- 7. LISTA DE PROBLEMAS Y DIAGNÓSTICOS (patient_problems)
CREATE TABLE IF NOT EXISTS public.patient_problems (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'ACTIVO',
    onset_date DATE,
    resolved_date DATE,
    vet_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. CONSULTAS MÉDICAS & FORMULARIO SOAP (consultations)
CREATE TABLE IF NOT EXISTS public.consultations (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    vet_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    vet_name TEXT NOT NULL,
    date_time TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    reason TEXT NOT NULL,
    anamnesis TEXT,
    soap JSONB NOT NULL,
    physical_exam JSONB,
    diagnoses TEXT[],
    prescriptions JSONB DEFAULT '[]'::jsonb,
    requires_hospitalization BOOLEAN DEFAULT false,
    requires_surgery BOOLEAN DEFAULT false,
    next_checkup_date DATE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 9. INTERNACIÓN & UCI (hospitalizations)
CREATE TABLE IF NOT EXISTS public.hospitalizations (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    vet_in_charge_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    vet_in_charge_name TEXT NOT NULL,
    sector TEXT NOT NULL,
    kennel_number TEXT NOT NULL,
    admitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    discharged_at TIMESTAMPTZ,
    primary_diagnosis TEXT NOT NULL,
    priority TEXT DEFAULT 'PRIORITARIO',
    fluid_therapy JSONB,
    feeding JSONB,
    eliminations JSONB DEFAULT '[]'::jsonb,
    medications JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    hourly_sheet JSONB DEFAULT '[]'::jsonb,
    interval_hours INTEGER DEFAULT 2,
    next_vitals_time TEXT,
    status TEXT DEFAULT 'ACTIVA',
    discharge_summary TEXT
);

-- 10. CIRUGÍAS & PROTOCOLOS ANESTÉSICOS (surgeries)
CREATE TABLE IF NOT EXISTS public.surgeries (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    procedure_name TEXT NOT NULL,
    surgeon_name TEXT NOT NULL,
    anesthetist_name TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    estimated_duration_minutes INTEGER,
    asa_grade TEXT NOT NULL,
    status TEXT DEFAULT 'PROGRAMADA',
    pre_op_assessment TEXT,
    anesthesia_protocol JSONB,
    surgical_technique TEXT,
    intra_op_events TEXT,
    post_op_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 11. ÓRDENES DE LABORATORIO (laboratory_orders)
CREATE TABLE IF NOT EXISTS public.laboratory_orders (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    test_type TEXT NOT NULL,
    requested_by TEXT NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    results_ready_at TIMESTAMPTZ,
    status TEXT DEFAULT 'SOLICITADO',
    results JSONB DEFAULT '[]'::jsonb,
    conclusions TEXT
);

-- 12. ESTUDIOS DE IMAGEN (imaging_studies)
CREATE TABLE IF NOT EXISTS public.imaging_studies (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    study_number TEXT UNIQUE NOT NULL,
    modality TEXT NOT NULL,
    region TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    image_urls TEXT[],
    findings TEXT,
    diagnosis TEXT,
    status TEXT DEFAULT 'INFORMADO',
    reported_by TEXT
);

-- 13. PLANES DE VACUNACIÓN (vaccinations)
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    batch_number TEXT NOT NULL,
    manufacturer TEXT,
    expiration_date DATE,
    administered_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    administered_by TEXT NOT NULL,
    vet_license TEXT,
    certificate_generated BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 14. FARMACIA, MEDICAMENTOS & PRODUCTOS (products)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    commercial_name TEXT NOT NULL,
    generic_name TEXT,
    category TEXT NOT NULL,
    presentation TEXT,
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    min_stock NUMERIC(10, 2) NOT NULL DEFAULT 5,
    unit TEXT NOT NULL,
    cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    sale_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    current_batch TEXT,
    expiration_date DATE,
    requires_prescription BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 15. MOVIMIENTOS DE STOCK (inventory_movements)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    previous_stock NUMERIC(10, 2) NOT NULL,
    new_stock NUMERIC(10, 2) NOT NULL,
    batch TEXT,
    reason TEXT,
    performed_by TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 16. AGENDA DE TURNOS (appointments)
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE CASCADE,
    vet_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    vet_name TEXT NOT NULL,
    date DATE NOT NULL,
    time TEXT NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    type TEXT NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'RESERVADO',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 17. SALA DE ESPERA & TRIAGE (triage_entries)
CREATE TABLE IF NOT EXISTS public.triage_entries (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE CASCADE,
    arrived_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    chief_complaint TEXT NOT NULL,
    priority TEXT NOT NULL,
    vital_signs_summary JSONB,
    assigned_vet_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'EN_ESPERA',
    wait_time_minutes INTEGER DEFAULT 0
);

-- 18. FACTURACIÓN ELECTRÓNICA & COMPROBANTES (invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    point_of_sale INTEGER DEFAULT 1,
    date DATE NOT NULL,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_dni_cuit TEXT NOT NULL,
    customer_tax_condition TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL,
    cae_number TEXT,
    cae_expiration_date DATE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 19. PRESUPUESTOS CLÍNICOS (estimates)
CREATE TABLE IF NOT EXISTS public.estimates (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    estimate_number TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'PENDIENTE',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 20. DOCUMENTOS CLÍNICOS & CONSENTIMIENTOS (clinical_documents)
CREATE TABLE IF NOT EXISTS public.clinical_documents (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_signed BOOLEAN DEFAULT false,
    signature_data_url TEXT,
    signed_by_owner_name TEXT,
    signed_by_owner_dni TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 21. AUDITORÍA INMUTABLE (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details TEXT NOT NULL,
    previous_value TEXT,
    new_value TEXT
);

-- 22. ARQUEOS DE CAJA (cash_sessions)
CREATE TABLE IF NOT EXISTS public.cash_sessions (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    opened_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    closed_at TIMESTAMPTZ,
    opened_by_user_id TEXT,
    initial_cash NUMERIC(12, 2) NOT NULL DEFAULT 0,
    expected_cash NUMERIC(12, 2) NOT NULL DEFAULT 0,
    actual_cash NUMERIC(12, 2),
    difference NUMERIC(12, 2),
    is_closed BOOLEAN DEFAULT false
);

-- ==============================================================================
-- GARANTIZAR COLUMNA branch_id EN TODAS LAS TABLAS QUE LO REQUIERAN
-- ==============================================================================
DO $$
BEGIN
    ALTER TABLE IF EXISTS public.users ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.profiles ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.owners ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.patients ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.vital_signs ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.patient_problems ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.consultations ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.hospitalizations ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.surgeries ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.laboratory_orders ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.imaging_studies ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.vaccinations ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.inventory_movements ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.appointments ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.triage_entries ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.invoices ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.estimates ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.clinical_documents ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.audit_logs ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE IF EXISTS public.cash_sessions ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
END $$;

-- ==============================================================================
-- ÍNDICES DE ALTO RENDIMIENTO
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_patients_owner_id ON public.patients(owner_id);
CREATE INDEX IF NOT EXISTS idx_patients_branch_id ON public.patients(branch_id);
CREATE INDEX IF NOT EXISTS idx_patients_status ON public.patients(status);
CREATE INDEX IF NOT EXISTS idx_vitals_patient_id ON public.vital_signs(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_patient_id ON public.hospitalizations(patient_id);
CREATE INDEX IF NOT EXISTS idx_surgeries_patient_id ON public.surgeries(patient_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_branch_id ON public.products(branch_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_branch_id ON public.invoices(branch_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs(timestamp DESC);

-- ==============================================================================
-- FUNCIONES HELPER DE SEGURIDAD
-- ==============================================================================
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

-- ==============================================================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ==============================================================================
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

-- ==============================================================================
-- LIMPIAR POLÍTICAS ANTERIORES
-- ==============================================================================
DO $$
DECLARE
    t text;
    all_tables text[] := ARRAY[
        'branches', 'users', 'profiles', 'owners', 'patients', 'vital_signs',
        'patient_problems', 'consultations', 'hospitalizations', 'surgeries',
        'laboratory_orders', 'imaging_studies', 'vaccinations', 'products',
        'inventory_movements', 'appointments', 'triage_entries', 'invoices',
        'estimates', 'clinical_documents', 'audit_logs', 'cash_sessions'
    ];
BEGIN
    FOREACH t IN ARRAY all_tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access policy for %I" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Tenant and role access policy for %I" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated users access for %I" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated access for %I" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated on %I" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Authenticated insert for %I" ON public.%I', t, t);
        EXECUTE format('DROP POLICY IF EXISTS "Authorized select for %I" ON public.%I', t, t);
    END LOOP;
END $$;

-- ==============================================================================
-- POLÍTICAS RLS ESPECÍFICAS Y SEGURAS (DENY BY DEFAULT A ANON)
-- ==============================================================================

-- 1. Sucursales (branches): Todos los autenticados leen; superadmin edita
CREATE POLICY "Authenticated users access for branches"
ON public.branches
FOR ALL
TO authenticated
USING (true)
WITH CHECK (public.is_superadmin_or_director());

-- 2. Auditoría (audit_logs): Insert para autenticados; lectura solo para roles autorizados
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

-- 3. Tablas con aislamiento multi-sede (branch_id)
DO $$
DECLARE
    t text;
    branch_tables text[] := ARRAY[
        'users', 'profiles', 'owners', 'patients', 'vital_signs',
        'patient_problems', 'consultations', 'hospitalizations', 'surgeries',
        'laboratory_orders', 'imaging_studies', 'vaccinations', 'products',
        'inventory_movements', 'appointments', 'triage_entries', 'invoices',
        'estimates', 'clinical_documents', 'cash_sessions'
    ];
BEGIN
    FOREACH t IN ARRAY branch_tables LOOP
        EXECUTE format('
            CREATE POLICY "Authenticated users access for %I"
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
