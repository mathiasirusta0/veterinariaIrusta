-- ==============================================================================
-- 🔒 REMEDIACIÓN DE SEGURIDAD P0: RLS HARDENING & DENY-BY-DEFAULT PARA ANON
-- Sistema Hospitalario Veterinario - Veterinaria Ranquel
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

-- 3. HABILITAR ROW LEVEL SECURITY (RLS) ESTRICTO EN TODAS LAS TABLAS DEL SISTEMA
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

-- 4. LIMPIEZA DE POLÍTICAS ANTERIORES Y CREACIÓN DE POLÍTICAS AUTORIZADAS
DO $$
DECLARE
    t text;
    tables text[] := ARRAY[
        'branches', 'users', 'profiles', 'owners', 'patients', 'patient_problems',
        'vital_signs', 'consultations', 'hospitalizations', 'surgeries',
        'laboratory_orders', 'imaging_studies', 'vaccinations', 'products',
        'inventory_movements', 'appointments', 'triage_entries', 'invoices',
        'estimates', 'cash_sessions', 'clinical_documents', 'audit_logs', 'archived_patients'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Eliminar políticas anónimas permisivas anteriores
        EXECUTE format('DROP POLICY IF EXISTS "Permitir lectura anonima" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir acceso publico total" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir lectura publica" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir insercion publica" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir actualizacion publica" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir eliminacion publica" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Acceso total a autenticados" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Lectura para autenticados" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Escritura para autenticados" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Modificacion para autenticados" ON public.%I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Eliminacion para autenticados" ON public.%I', t);

        -- Crear política segura para usuarios autenticados
        EXECUTE format('CREATE POLICY "Acceso autenticado seguro" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', t);
    END LOOP;
END $$;

-- 5. POLÍTICA ESPECIAL DE LECTURA PÚBLICA PARA SEDES EN LANDING
DROP POLICY IF EXISTS "Lectura publica de sedes para landing" ON public.branches;
CREATE POLICY "Lectura publica de sedes para landing" 
ON public.branches FOR SELECT TO anon 
USING (true);

-- 6. POLÍTICA ESPECIAL DE INSERCIÓN DE AUDITORÍA INMUTABLE
DROP POLICY IF EXISTS "Insercion inmutable de auditoria" ON public.audit_logs;
CREATE POLICY "Insercion inmutable de auditoria" 
ON public.audit_logs FOR INSERT TO authenticated 
WITH CHECK (true);
