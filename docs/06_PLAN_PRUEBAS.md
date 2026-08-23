# 06. Plan de Pruebas Automatizadas & QA

---

## 1. Resumen de Ejecución
- **Framework de Pruebas:** Vitest v4.1.11
- **Suites Activas:** 8 suites de prueba (39 tests unitarios e integrados)
- **Estado Actual:** 100% Aprobadas (0 fallos)

## 2. Cobertura de Suites
1. `dosages.test.ts`: Cálculo de dosis, fluidoterapia y superficie corporal.
2. `normalizers.test.ts`: Resiliencia ante valores nulos en Supabase Cloud.
3. `rbac.test.ts`: Matriz de permisos de vistas y capacidades operativas.
4. `clinicalSafetyE2E.test.ts`: Flujo clínico de admisión, diagnóstico y alta médica.
5. `branchIsolation.test.ts`: Aislamiento de datos entre sedes/sucursales.
6. `moduleResilience.test.ts`: Recuperación ante fallos de red y desconexión.
7. `regulatoryAndControlledDrugs.test.ts`: Validaciones de recetario profesional.
8. `formatters.test.ts`: Formateo estricto de pesos, teléfonos y monedas en ARS.
