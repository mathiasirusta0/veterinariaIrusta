-- ==============================================================================
-- 📁 MÓDULO DE PACIENTES ARCHIVADOS & HISTÓRICO HOSPITALARIO - SUPABASE
-- Veterinaria Ranquel - Dr. Diego Iván Irusta
-- ==============================================================================

-- 1. Añadir columnas de control de archivado en la tabla de pacientes existente
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS archive_reason TEXT,
ADD COLUMN IF NOT EXISTS discharge_notes TEXT,
ADD COLUMN IF NOT EXISTS discharged_at TIMESTAMPTZ;

-- 2. Crear índice para optimizar consultas de pacientes activos vs archivados
CREATE INDEX IF NOT EXISTS idx_patients_status_archived 
ON public.patients (status, is_archived);

-- 3. Crear tabla dedicada para registro y resguardo histórico de Pacientes Archivados
CREATE TABLE IF NOT EXISTS public.archived_patients (
    id TEXT PRIMARY KEY,
    patient_id TEXT,
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    sex TEXT,
    reproductive_status TEXT,
    birth_date DATE,
    weight NUMERIC(6, 2),
    microchip TEXT,
    photo_url TEXT,
    clinical_record_number TEXT NOT NULL,
    archived_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    archive_reason TEXT DEFAULT 'Alta médica / Inactividad',
    discharge_notes TEXT,
    owner_name TEXT,
    owner_phone TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Habilitar Seguridad RLS (Row Level Security)
ALTER TABLE public.archived_patients ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de acceso RLS para lectura, inserción, actualización y eliminación
DO $$
BEGIN
    DROP POLICY IF EXISTS "Permitir lectura publica de archivados" ON public.archived_patients;
    CREATE POLICY "Permitir lectura publica de archivados" 
    ON public.archived_patients FOR SELECT 
    USING (true);

    DROP POLICY IF EXISTS "Permitir insercion de archivados" ON public.archived_patients;
    CREATE POLICY "Permitir insercion de archivados" 
    ON public.archived_patients FOR INSERT 
    WITH CHECK (true);

    DROP POLICY IF EXISTS "Permitir actualizacion de archivados" ON public.archived_patients;
    CREATE POLICY "Permitir actualizacion de archivados" 
    ON public.archived_patients FOR UPDATE 
    USING (true);

    DROP POLICY IF EXISTS "Permitir eliminacion de archivados" ON public.archived_patients;
    CREATE POLICY "Permitir eliminacion de archivados" 
    ON public.archived_patients FOR DELETE 
    USING (true);
END $$;

-- 6. Vista SQL rápida para consultar pacientes archivados con datos de tutor unificados
CREATE OR REPLACE VIEW public.v_pacientes_archivados AS
SELECT 
    p.id,
    p.name,
    p.species,
    p.breed,
    p.sex,
    p.weight,
    p.clinical_record_number,
    p.microchip,
    p.photo_url,
    p.status,
    p.created_at,
    o.first_name || ' ' || o.last_name AS tutor_nombre,
    o.phone AS tutor_telefono,
    o.whatsapp AS tutor_whatsapp,
    o.email AS tutor_email
FROM public.patients p
LEFT JOIN public.owners o ON p.owner_id = o.id
WHERE p.status = 'ARCHIVADO' OR p.is_archived = TRUE;
