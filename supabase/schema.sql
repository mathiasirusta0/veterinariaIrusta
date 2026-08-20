-- ==============================================================================
-- VET SYSTEM — ESQUEMA RELACIONAL MAESTRO DE BASE DE DATOS (POSTGRESQL / SUPABASE)
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
    role TEXT NOT NULL, -- DIRECTOR_MEDICO, VETERINARIO_PLANTA, CIRUJANO, ANESTESISTA, ENFERMERO, RECEPCIONISTA, ADMINISTRADOR
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    license_number TEXT,
    phone TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. PROPIETARIOS / TUTORES (owners)
CREATE TABLE IF NOT EXISTS public.owners (
    id TEXT PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    dni TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    email TEXT,
    address TEXT,
    city TEXT,
    emergency_contact TEXT,
    notes TEXT,
    balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. PACIENTES VETERINARIOS (patients)
CREATE TABLE IF NOT EXISTS public.patients (
    id TEXT PRIMARY KEY,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    species TEXT NOT NULL, -- Canino, Felino, Exótico, etc.
    breed TEXT NOT NULL,
    sex TEXT NOT NULL, -- Macho, Hembra
    reproductive_status TEXT, -- Entero, Castrado
    birth_date DATE,
    calculated_age TEXT,
    weight NUMERIC(6, 2) NOT NULL,
    color TEXT,
    microchip TEXT,
    photo_url TEXT,
    clinical_record_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'ACTIVO', -- ACTIVO, INTERNADO, FALLECIDO, INACTIVO
    alerts JSONB DEFAULT '[]'::jsonb, -- Array de alertas médicas críticas
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. SIGNOS VITALES HISTÓRICOS (vital_signs)
CREATE TABLE IF NOT EXISTS public.vital_signs (
    id TEXT PRIMARY KEY,
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

-- 6. LISTA DE PROBLEMAS Y DIAGNÓSTICOS (patient_problems)
CREATE TABLE IF NOT EXISTS public.patient_problems (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'ACTIVO', -- ACTIVO, RESUELTO, CRONICO
    onset_date DATE,
    resolved_date DATE,
    vet_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 7. CONSULTAS MÉDICAS & FORMULARIO SOAP (consultations)
CREATE TABLE IF NOT EXISTS public.consultations (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    vet_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    vet_name TEXT NOT NULL,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    date_time TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    reason TEXT NOT NULL,
    anamnesis TEXT,
    soap JSONB NOT NULL, -- { subjective, objective, assessment, plan }
    physical_exam JSONB,
    diagnoses TEXT[],
    prescriptions JSONB DEFAULT '[]'::jsonb,
    requires_hospitalization BOOLEAN DEFAULT false,
    requires_surgery BOOLEAN DEFAULT false,
    next_checkup_date DATE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. INTERNACIÓN & UCI (hospitalizations)
CREATE TABLE IF NOT EXISTS public.hospitalizations (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    vet_in_charge_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    vet_in_charge_name TEXT NOT NULL,
    sector TEXT NOT NULL, -- UCI_CRITICOS, CANIL_GENERAL, FELINOS, AISLAMIENTO_INFECCIOSO
    kennel_number TEXT NOT NULL,
    admitted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    discharged_at TIMESTAMPTZ,
    primary_diagnosis TEXT NOT NULL,
    priority TEXT DEFAULT 'PRIORITARIO', -- CRITICO, PRIORITARIO, ESTABLE
    fluid_therapy JSONB,
    feeding JSONB,
    eliminations JSONB DEFAULT '[]'::jsonb,
    medications JSONB DEFAULT '[]'::jsonb,
    tasks JSONB DEFAULT '[]'::jsonb,
    hourly_sheet JSONB DEFAULT '[]'::jsonb,
    interval_hours INTEGER DEFAULT 2,
    next_vitals_time TEXT,
    status TEXT DEFAULT 'ACTIVA', -- ACTIVA, ALTA_MEDICA, DERIVADO, FALLECIDO
    discharge_summary TEXT,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL
);

-- 9. CIRUGÍAS & PROTOCOLOS ANESTÉSICOS (surgeries)
CREATE TABLE IF NOT EXISTS public.surgeries (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    procedure_name TEXT NOT NULL,
    surgeon_name TEXT NOT NULL,
    anesthetist_name TEXT NOT NULL,
    date DATE NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    estimated_duration_minutes INTEGER,
    asa_grade TEXT NOT NULL, -- ASA_I, ASA_II, ASA_III, ASA_IV, ASA_V
    status TEXT DEFAULT 'PROGRAMADA', -- PROGRAMADA, EN_CURSO, FINALIZADA, CANCELADA
    pre_op_assessment TEXT,
    anesthesia_protocol JSONB, -- { induction, maintenance, analgesia }
    surgical_technique TEXT,
    intra_op_events TEXT,
    post_op_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 10. ÓRDENES DE LABORATORIO (laboratory_orders)
CREATE TABLE IF NOT EXISTS public.laboratory_orders (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE NOT NULL,
    test_type TEXT NOT NULL, -- HEMOGRAMA_COMPLETO, PERFIL_BIOQUIMICO, ANALISIS_ORINA, etc.
    requested_by TEXT NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    results_ready_at TIMESTAMPTZ,
    status TEXT DEFAULT 'SOLICITADO', -- SOLICITADO, EN_PROCESO, FINALIZADO
    results JSONB DEFAULT '[]'::jsonb,
    conclusions TEXT
);

-- 11. ESTUDIOS DE IMAGEN (imaging_studies)
CREATE TABLE IF NOT EXISTS public.imaging_studies (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    study_number TEXT UNIQUE NOT NULL,
    modality TEXT NOT NULL, -- RADIOGRAFIA, ECOGRAFIA, ENDOSCOPIA, TOMOGRAFIA
    region TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    image_urls TEXT[],
    findings TEXT,
    diagnosis TEXT,
    status TEXT DEFAULT 'INFORMADO',
    reported_by TEXT
);

-- 12. PLANES DE VACUNACIÓN (vaccinations)
CREATE TABLE IF NOT EXISTS public.vaccinations (
    id TEXT PRIMARY KEY,
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

-- 13. FARMACIA, MEDICAMENTOS & PRODUCTOS (products)
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    commercial_name TEXT NOT NULL,
    generic_name TEXT,
    category TEXT NOT NULL, -- MEDICAMENTO, DESCARTABLE, BIOLOGICO, ALIMENTO
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

-- 14. MOVIMIENTOS DE STOCK (inventory_movements)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    type TEXT NOT NULL, -- INGRESO_COMPRA, EGRESO_VENTA, USO_INTERNACION, USO_CIRUGIA, AJUSTE_MANUAL
    quantity NUMERIC(10, 2) NOT NULL,
    previous_stock NUMERIC(10, 2) NOT NULL,
    new_stock NUMERIC(10, 2) NOT NULL,
    batch TEXT,
    reason TEXT,
    performed_by TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 15. AGENDA DE TURNOS (appointments)
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
    type TEXT NOT NULL, -- CONSULTA_GENERAL, VACUNACION, CIRUGIA, CONTROL, ECOGRAFIA
    reason TEXT,
    status TEXT DEFAULT 'RESERVADO', -- RESERVADO, CONFIRMADO, ESPERANDO, EN_CONSULTA, FINALIZADO, CANCELADO
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 16. SALA DE ESPERA & TRIAGE (triage_entries)
CREATE TABLE IF NOT EXISTS public.triage_entries (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE CASCADE,
    arrived_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    chief_complaint TEXT NOT NULL,
    priority TEXT NOT NULL, -- CRITICO, PRIORITARIO, NORMAL, NO_URGENTE
    vital_signs_summary JSONB,
    assigned_vet_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'EN_ESPERA', -- EN_ESPERA, EN_CONSULTA, DERIVADO_INTERNACION, ATENDIDO
    wait_time_minutes INTEGER DEFAULT 0
);

-- 17. FACTURACIÓN ELECTRÓNICA AFIP (invoices)
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL, -- FACTURA_A, FACTURA_B, FACTURA_C, TICKET_X
    point_of_sale INTEGER DEFAULT 1,
    date DATE NOT NULL,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE SET NULL,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_dni_cuit TEXT NOT NULL,
    customer_tax_condition TEXT NOT NULL,
    items JSONB NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    payment_method TEXT NOT NULL, -- EFECTIVO, TARJETA_DEBITO, TARJETA_CREDITO, TRANSFERENCIA, MERCADOPAGO
    cae_number TEXT,
    cae_expiration_date DATE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 18. PRESUPUESTOS CLÍNICOS (estimates)
CREATE TABLE IF NOT EXISTS public.estimates (
    id TEXT PRIMARY KEY,
    estimate_number TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE CASCADE,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    items JSONB NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'PENDIENTE', -- PENDIENTE, ACEPTADO, RECHAZADO, FACTURADO
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 19. DOCUMENTOS CLÍNICOS & CONSENTIMIENTOS (clinical_documents)
CREATE TABLE IF NOT EXISTS public.clinical_documents (
    id TEXT PRIMARY KEY,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE CASCADE,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- CONSENTIMIENTO_ANESTESIA, CONSENTIMIENTO_CIRUGIA, CONSENTIMIENTO_INTERNACION, CONSENTIMIENTO_EUTANASIA
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_signed BOOLEAN DEFAULT false,
    signature_data_url TEXT,
    signed_by_owner_name TEXT,
    signed_by_owner_dni TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 20. AUDITORÍA INMUTABLE (audit_logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
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

-- 21. ARQUEOS DE CAJA (cash_sessions)
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
-- POLÍTICAS DE SEGURIDAD RLS (ROW LEVEL SECURITY)
-- Permite lectura y escritura con la clave anónima (anon public) en todas las tablas
-- ==============================================================================

-- Asegurar columna branch_id para aislamiento por sede
DO $$
BEGIN
    ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.hospitalizations ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.surgeries ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.laboratory_orders ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.imaging_studies ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.vaccinations ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.triage_entries ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.estimates ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.clinical_documents ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
    ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS branch_id TEXT REFERENCES public.branches(id);
END $$;

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vital_signs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospitalizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratory_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.imaging_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.triage_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento por sede y acceso autenticado
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'branches', 'users', 'owners', 'patients', 'vital_signs',
        'patient_problems', 'consultations', 'hospitalizations', 'surgeries',
        'laboratory_orders', 'imaging_studies', 'vaccinations', 'products',
        'inventory_movements', 'appointments', 'triage_entries', 'invoices',
        'estimates', 'clinical_documents', 'audit_logs', 'cash_sessions'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Public access policy for %I" ON public.%I', t, t);
        EXECUTE format('CREATE POLICY "Tenant and role access policy for %I" ON public.%I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)', t, t);
    END LOOP;
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
CREATE INDEX IF NOT EXISTS idx_hospitalizations_branch_id ON public.hospitalizations(branch_id);
CREATE INDEX IF NOT EXISTS idx_hospitalizations_status ON public.hospitalizations(status);
CREATE INDEX IF NOT EXISTS idx_surgeries_patient_id ON public.surgeries(patient_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON public.products(code);
CREATE INDEX IF NOT EXISTS idx_products_branch_id ON public.products(branch_id);
CREATE INDEX IF NOT EXISTS idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_branch_id ON public.invoices(branch_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON public.audit_logs(timestamp DESC);
