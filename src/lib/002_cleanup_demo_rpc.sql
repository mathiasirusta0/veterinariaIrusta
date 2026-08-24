-- ==============================================================================
-- MIGRACIÓN 002: RPC TRANSACCIONAL PARA LIMPIEZA SEGURA DE DATOS DEMO
-- VETERINARIA IRUSTA - SISTEMA HOSPITALARIO
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.cleanup_demo_data(
  p_dry_run BOOLEAN DEFAULT TRUE,
  p_confirmation_phrase TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_demo_patient_ids TEXT[];
  v_demo_owner_ids TEXT[];
  v_count_patients INT := 0;
  v_count_owners INT := 0;
  v_count_vitals INT := 0;
  v_count_problems INT := 0;
  v_count_consultations INT := 0;
  v_count_hospitalizations INT := 0;
  v_count_surgeries INT := 0;
  v_count_encounters INT := 0;
  v_count_procedures INT := 0;
  v_count_consumptions INT := 0;
  v_count_prescriptions INT := 0;
  v_count_documents INT := 0;
  v_count_invoices INT := 0;
  v_count_debts INT := 0;
  v_count_financial INT := 0;
  v_count_labs INT := 0;
  v_count_imaging INT := 0;
  v_count_vaccinations INT := 0;
  v_count_appointments INT := 0;
  v_count_triage INT := 0;
  v_total_deleted INT := 0;
  v_result JSONB;
BEGIN
  -- Validar frase de confirmación en modo de ejecución real
  IF NOT p_dry_run AND TRIM(p_confirmation_phrase) <> 'ELIMINAR DATOS DEMO' THEN
    RAISE EXCEPTION 'Frase de confirmación inválida. Para ejecutar la limpieza debe ingresar exactamente: ELIMINAR DATOS DEMO';
  END IF;

  -- 1. Identificar pacientes demo confirmados (pat-1, pat-2, pat-3 o con patrón demo)
  SELECT ARRAY_AGG(id) INTO v_demo_patient_ids
  FROM public.patients
  WHERE id IN ('pat-1', 'pat-2', 'pat-3')
     OR id LIKE 'pat-demo-%'
     OR clinical_record_number IN ('HC-2026-0041', 'HC-2026-0042', 'HC-2026-0043');

  -- Si no hay pacientes demo, inicializar en array vacío
  IF v_demo_patient_ids IS NULL THEN
    v_demo_patient_ids := ARRAY[]::TEXT[];
  END IF;

  -- 2. Identificar tutores demo que NO tienen pacientes reales vinculados
  SELECT ARRAY_AGG(o.id) INTO v_demo_owner_ids
  FROM public.owners o
  WHERE (o.id IN ('own-1', 'own-2', 'own-3') OR o.id LIKE 'own-demo-%')
    AND NOT EXISTS (
      SELECT 1 FROM public.patients p
      WHERE p.owner_id = o.id
        AND NOT (p.id = ANY(v_demo_patient_ids))
    );

  IF v_demo_owner_ids IS NULL THEN
    v_demo_owner_ids := ARRAY[]::TEXT[];
  END IF;

  -- 3. Conteo de registros demo asociados
  SELECT COUNT(*) INTO v_count_patients FROM public.patients WHERE id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_owners FROM public.owners WHERE id = ANY(v_demo_owner_ids);
  SELECT COUNT(*) INTO v_count_vitals FROM public.vital_signs WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_problems FROM public.patient_problems WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_consultations FROM public.consultations WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_hospitalizations FROM public.hospitalizations WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_surgeries FROM public.surgeries WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_encounters FROM public.encounters WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_procedures FROM public.procedures WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_consumptions FROM public.encounter_consumptions WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_prescriptions FROM public.prescriptions WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_documents FROM public.clinical_documents WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_invoices FROM public.invoices WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_debts FROM public.account_debts WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_financial FROM public.financial_transactions WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_labs FROM public.laboratory_orders WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_imaging FROM public.imaging_studies WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_vaccinations FROM public.vaccinations WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_appointments FROM public.appointments WHERE patient_id = ANY(v_demo_patient_ids);
  SELECT COUNT(*) INTO v_count_triage FROM public.triage_entries WHERE patient_id = ANY(v_demo_patient_ids);

  v_total_deleted := v_count_patients + v_count_owners + v_count_vitals + v_count_problems +
                     v_count_consultations + v_count_hospitalizations + v_count_surgeries +
                     v_count_encounters + v_count_procedures + v_count_consumptions +
                     v_count_prescriptions + v_count_documents + v_count_invoices +
                     v_count_debts + v_count_financial + v_count_labs + v_count_imaging +
                     v_count_vaccinations + v_count_appointments + v_count_triage;

  -- 4. Si NO es dry run, proceder con la eliminación transaccional
  IF NOT p_dry_run THEN
    IF ARRAY_LENGTH(v_demo_patient_ids, 1) > 0 THEN
      DELETE FROM public.vital_signs WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.patient_problems WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.encounter_consumptions WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.procedures WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.encounters WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.consultations WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.hospitalizations WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.surgeries WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.prescriptions WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.clinical_documents WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.laboratory_orders WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.imaging_studies WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.vaccinations WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.appointments WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.triage_entries WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.invoices WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.account_debts WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.financial_transactions WHERE patient_id = ANY(v_demo_patient_ids);
      DELETE FROM public.patients WHERE id = ANY(v_demo_patient_ids);
    END IF;

    IF ARRAY_LENGTH(v_demo_owner_ids, 1) > 0 THEN
      DELETE FROM public.owners WHERE id = ANY(v_demo_owner_ids);
    END IF;

    -- Registrar evento en audit_logs
    INSERT INTO public.audit_logs (
      id,
      timestamp,
      user_name,
      user_role,
      action,
      entity,
      entity_id,
      details
    ) VALUES (
      'audit-cleanup-' || TO_CHAR(NOW(), 'YYYYMMDD-HH24MISS'),
      NOW()::TEXT,
      'Dr. Diego Irusta',
      'SUPERADMIN',
      'LIMPIEZA_DATOS_DEMO',
      'Database',
      'public',
      'Eliminación de ' || v_total_deleted || ' registros demo para pase a producción limpia.'
    );
  END IF;

  -- 5. Construir respuesta JSON
  v_result := jsonb_build_object(
    'success', TRUE,
    'dry_run', p_dry_run,
    'message', CASE WHEN p_dry_run THEN 'Análisis preliminar (Dry Run) completado con éxito.' ELSE 'Limpieza de datos demo ejecutada exitosamente.' END,
    'total_deleted', v_total_deleted,
    'affected_counts', jsonb_build_object(
      'patients', v_count_patients,
      'owners', v_count_owners,
      'vital_signs', v_count_vitals,
      'patient_problems', v_count_problems,
      'consultations', v_count_consultations,
      'hospitalizations', v_count_hospitalizations,
      'surgeries', v_count_surgeries,
      'encounters', v_count_encounters,
      'procedures', v_count_procedures,
      'encounter_consumptions', v_count_consumptions,
      'prescriptions', v_count_prescriptions,
      'clinical_documents', v_count_documents,
      'invoices', v_count_invoices,
      'account_debts', v_count_debts,
      'financial_transactions', v_count_financial,
      'laboratory_orders', v_count_labs,
      'imaging_studies', v_count_imaging,
      'vaccinations', v_count_vaccinations,
      'appointments', v_count_appointments,
      'triage_entries', v_count_triage
    )
  );

  RETURN v_result;
END;
$$;
