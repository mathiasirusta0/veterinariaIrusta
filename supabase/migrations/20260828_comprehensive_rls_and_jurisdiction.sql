-- ==============================================================================
-- 🔒 MIGRACIÓN MAESTRA DE SEGURIDAD RLS, JURISDICCIÓN E INTEGRIDAD
-- Veterinaria Ranquel — Las Lajas, Neuquén (CP 8347)
-- ==============================================================================

-- 1. REVOCAR PRIVILEGIOS POR DEFECTO PARA EL ROL ANÓNIMO ('anon')
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;

-- Permitir únicamente lectura pública en sedes institucionales para la Landing Page
GRANT SELECT ON public.branches TO anon;

-- 2. CONCEDER PRIVILEGIOS OPERATIVOS AL ROL AUTENTICADO ('authenticated')
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 3. HABILITAR ROW LEVEL SECURITY (RLS) ESTRICTO EN TODAS LAS TABLAS
ALTER TABLE IF EXISTS public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.patient_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vital_signs ENABLE ROW LEVEL SECURITY;
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
ALTER TABLE IF EXISTS public.cash_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clinical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.archived_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.encounter_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.service_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.financial_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.account_debts ENABLE ROW LEVEL SECURITY;

-- 4. LIMPIEZA DE POLÍTICAS ANTERIORES Y CREACIÓN DE POLÍTICAS AUTORIZADAS
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'branches', 'users', 'profiles', 'owners', 'patients', 'patient_problems',
        'vital_signs', 'consultations', 'hospitalizations', 'surgeries',
        'laboratory_orders', 'imaging_studies', 'vaccinations', 'products',
        'inventory_movements', 'appointments', 'triage_entries', 'invoices',
        'estimates', 'cash_sessions', 'clinical_documents', 'audit_logs',
        'archived_patients', 'prescriptions', 'encounters', 'procedures',
        'encounter_consumptions', 'service_prices', 'financial_movements', 'account_debts'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Eliminar políticas anónimas permisivas anteriores si existen
        EXECUTE format('DROP POLICY IF EXISTS "Permitir lectura anonima" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir acceso publico total" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir lectura publica" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir insercion publica" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir actualizacion publica" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir eliminacion publica" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Acceso total a autenticados" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Acceso autenticado seguro" ON public.%I', t);

        -- Crear política segura para usuarios autenticados
        IF t = 'audit_logs' THEN
            -- Inserción inmutable para auditoría (no se permite update ni delete)
            EXECUTE format('CREATE POLICY "Insercion inmutable de auditoria" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)', t);
            EXECUTE format('CREATE POLICY "Lectura de auditoria para autenticados" ON public.%I FOR SELECT TO authenticated USING (true)', t);
        ELSE
            EXECUTE format('CREATE POLICY "Acceso autenticado seguro" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
        END IF;
    END LOOP;
END $$;

-- 5. POLÍTICA ESPECIAL DE LECTURA PÚBLICA PARA SEDES EN LANDING
DROP POLICY IF EXISTS "Lectura publica de sedes para landing" ON public.branches;
CREATE POLICY "Lectura publica de sedes para landing" 
ON public.branches FOR SELECT TO anon 
USING (true);

-- 6. ACTUALIZACIÓN DE JURISDICCIÓN POR DEFECTO PARA NUEVOS TUTORES (LAS LAJAS, NEUQUÉN)
ALTER TABLE IF EXISTS public.owners 
    ALTER COLUMN city SET DEFAULT 'Las Lajas',
    ALTER COLUMN province SET DEFAULT 'Neuquén',
    ALTER COLUMN postal_code SET DEFAULT '8347';
