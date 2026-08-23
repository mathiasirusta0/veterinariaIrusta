# 🚀 Plan Integral de Mejoras y Estabilización — VET SYSTEM

Este documento establece la hoja de ruta y las fases de ejecución técnica de las mejoras identificadas en la auditoría inicial.

---

## Fase 1 — Diagnóstico, Inventario y Documentación (Completada)
- [x] Ejecución de verificación técnica (Vitest 38/38 pasados, Typecheck 0 errores, Build exitoso).
- [x] Mapa de arquitectura y trazabilidad de componentes.
- [x] Elaboración de `docs/AUDITORIA_TECNICA.md` y matriz de roles RBAC.

---

## Fase 2 — Seguridad, Control de Acceso y Aislamiento P0 (En curso)
- [x] Mitigación del selector de usuarios/roles para modo evaluación / auditoría con registro explícito en `audit_logs`.
- [x] Aislamiento multisede estricto (`BranchId` en cada entidad clínica y financiera).
- [x] Sincronización inmutable con Supabase Cloud.

---

## Fase 3 — Coherencia de Datos y Semántica Clínica P0/P1
- [x] Corrección de discrepancias en la tabla de internación del Dashboard.
- [x] Explicación semántica entre *Turnos Programados* e *Ingresos Espontáneos / Triage en Espera*.
- [x] Pluralización reactiva y normalización gramatical.
- [x] Incorporación de enmiendas clínicas auditadas sin sobrescritura destructiva.

---

## Fase 4 — Asistente IA Seguro y Explicable
- [x] Tarjeta de IA explicable con nivel de incertidumbre, contraindicaciones analizadas y fuente sugerida.
- [x] Advertencia médica obligatoria: *Borrador asistido que requiere validación y prescripción por profesional veterinario matriculado*.
- [x] Prohibición de mutaciones automáticas de historias clínicas desde IA sin confirmación explícita.

---

## Fase 5 — UX, Accesibilidad (WCAG 2.2 AA) y Resiliencia
- [x] Soporte para navegación por teclado (`Ctrl+K`).
- [x] Estados de carga, vacío y error en todas las vistas.
- [x] Modo degradado con almacenamiento local seguro ante desconexión de red.
