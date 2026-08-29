-- ==============================================================================
-- VET SYSTEM — ACTIVACIÓN Y CONFIRMACIÓN DE USUARIO DIRECTOR MÉDICO
-- Usuario: irusta@gmail.com | Contraseña: admin1998
-- ==============================================================================

-- 1. Habilitar extensión criptográfica
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Asegurar que las sucursales principales existan
INSERT INTO public.branches (id, name, address, phone, email, is_main)
VALUES 
  ('branch-1', 'Sede Central Las Lajas', 'Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén', '+54 9 2942 47-7136', 'contacto@veterinariaranquel.com.ar', true),
  ('branch-central', 'Sede Central Las Lajas', 'Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén', '+54 9 2942 47-7136', 'contacto@veterinariaranquel.com.ar', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  address = EXCLUDED.address,
  phone = EXCLUDED.phone;

-- 3. Crear o actualizar el usuario en auth.users con contraseña 'admin1998' y correo 100% confirmado
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Buscar si ya existe el usuario por email
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'irusta@gmail.com';

  IF v_user_id IS NULL THEN
    -- Crear nuevo usuario si no existe
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      role,
      aud,
      created_at,
      updated_at
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'irusta@gmail.com',
      crypt('admin1998', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Dr. Diego Iván Irusta","role":"DIRECTOR_MEDICO","license_number":"M.P. 502 (Neuquén)"}',
      'authenticated',
      'authenticated',
      NOW(),
      NOW()
    );
  ELSE
    -- Si ya existe, actualizar contraseña a 'admin1998' y confirmar correo inmediatamente
    UPDATE auth.users
    SET 
      encrypted_password = crypt('admin1998', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}',
      raw_user_meta_data = '{"name":"Dr. Diego Iván Irusta","role":"DIRECTOR_MEDICO","license_number":"M.P. 502 (Neuquén)"}',
      updated_at = NOW()
    WHERE id = v_user_id;
  END IF;

  -- 4. Crear o actualizar en public.profiles
  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    branch_id,
    license_number,
    phone,
    active
  ) VALUES (
    v_user_id,
    'Dr. Diego Iván Irusta',
    'irusta@gmail.com',
    'DIRECTOR_MEDICO',
    'branch-1',
    'M.P. 502 (Neuquén)',
    '+54 9 2942 47-7136',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    branch_id = EXCLUDED.branch_id,
    license_number = EXCLUDED.license_number,
    active = true;

  -- 5. Crear o actualizar en public.users
  INSERT INTO public.users (
    id,
    name,
    email,
    role,
    branch_id,
    license_number,
    phone,
    active
  ) VALUES (
    'usr-1',
    'Dr. Diego Iván Irusta',
    'irusta@gmail.com',
    'DIRECTOR_MEDICO',
    'branch-1',
    'M.P. 502 (Neuquén)',
    '+54 9 2942 47-7136',
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    branch_id = EXCLUDED.branch_id,
    license_number = EXCLUDED.license_number,
    active = true;

END $$;
