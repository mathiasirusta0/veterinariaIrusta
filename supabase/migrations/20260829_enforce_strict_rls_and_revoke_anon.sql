-- ==============================================================================
-- 🔒 MIGRACIÓN MAESTRA DE SEGURIDAD RLS Y REVOCACIÓN DE ACCESO ANÓNIMO (DINÁMICA)
-- Veterinaria Ranquel — Las Lajas, Neuquén
-- ==============================================================================

-- 1. REVOCAR TODOS LOS PRIVILEGIOS AL ROL ANÓNIMO ('anon') EN EL ESQUEMA PÚBLICO
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;

-- 2. CONCEDER PRIVILEGIOS AL ROL AUTENTICADO ('authenticated')
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- 3. HABILITAR RLS Y DEFINIR POLÍTICAS DINÁMICAMENTE PARA CADA TABLA EXISTENTE
DO $$
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN (
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
    ) LOOP
        -- Habilitar RLS en cada tabla existente
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', rec.table_name);

        -- Limpiar políticas permisivas previas
        EXECUTE format('DROP POLICY IF EXISTS "Permitir lectura anonima" ON public.%I', rec.table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir acceso publico total" ON public.%I', rec.table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir lectura publica" ON public.%I', rec.table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir insercion publica" ON public.%I', rec.table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir actualizacion publica" ON public.%I', rec.table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir eliminacion publica" ON public.%I', rec.table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Acceso total a autenticados" ON public.%I', rec.table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Acceso autenticado seguro" ON public.%I', rec.table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Insercion inmutable de auditoria" ON public.%I', rec.table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Lectura de auditoria para autenticados" ON public.%I', rec.table_name);

        -- Aplicar política segura para usuarios autenticados
        IF rec.table_name = 'audit_logs' THEN
            EXECUTE format('CREATE POLICY "Insercion inmutable de auditoria" ON public.%I FOR INSERT TO authenticated WITH CHECK (true)', rec.table_name);
            EXECUTE format('CREATE POLICY "Lectura de auditoria para autenticados" ON public.%I FOR SELECT TO authenticated USING (true)', rec.table_name);
        ELSE
            EXECUTE format('CREATE POLICY "Acceso autenticado seguro" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', rec.table_name);
        END IF;
    END LOOP;
END $$;

-- 4. CONCEDER ÚNICAMENTE LECTURA DE SEDES AL ROL ANÓNIMO PARA LA LANDING
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'branches'
    ) THEN
        GRANT SELECT ON public.branches TO anon;
        DROP POLICY IF EXISTS "Lectura publica de sedes para landing" ON public.branches;
        CREATE POLICY "Lectura publica de sedes para landing" 
        ON public.branches FOR SELECT TO anon 
        USING (true);
    END IF;
END $$;
