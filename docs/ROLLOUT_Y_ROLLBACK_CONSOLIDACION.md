# Plan de Rollout & Rollback — Consolidación y Evolución

---

## 1. Estrategia de Rollout
- **Fase 1:** Implementación de la capa de datos de `clinical_evolution_entries` en VetContext.
- **Fase 2:** Activación de la pestaña "Evolución Clínica" en la Ficha 360°.
- **Fase 3:** Consolidación de la barra lateral en las 6 macro-áreas con compatibilidad de rutas anteriores.

## 2. Procedimiento de Rollback
- Reversión atómica mediante Git commit en la rama `main`.
- En caso de contingencia, los registros previos permanecen intactos en sus tablas originales.
