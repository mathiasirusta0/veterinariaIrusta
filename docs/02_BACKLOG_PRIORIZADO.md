# 02. Backlog Priorizado de Mejoras Técnicas & Clínicas

---

## Sprint 1: Estabilidad Crítica & Integridad de Datos (P0 / P1) — [COMPLETADO]
- [x] **BL-01:** Normalización bi-direccional y defensiva de todas las entidades Supabase (`supabaseSync.ts`).
- [x] **BL-02:** Eliminación de errores de desreferenciación en nulos (`fluidTherapy`, `alerts`, `diagnoses`).
- [x] **BL-03:** Integración del módulo de Propietarios dentro del Módulo de Pacientes con gestión de insumos y WhatsApp Hub.
- [x] **BL-04:** Remoción de módulos obsoletos y de cartelería no verificable ("100% Auditado", "91% Relevancia").
- [x] **BL-05:** Cobertura de tests unitarios y de integración al 100% (39 tests en Vitest).

## Sprint 2: Seguridad, RBAC & Aislamiento de Sedes (P1)
- [ ] **BL-06:** Enforzamiento estricto de RLS (Row Level Security) en Supabase para multi-sede y aislamiento de datos por tenant.
- [ ] **BL-07:** Reemplazo de claims en cliente por JWT claims validados en servidor/base de datos.
- [ ] **BL-08:** Rate limiting en endpoints de búsqueda y exportación de historias clínicas.

## Sprint 3: Operación Clínica Avanzada & SRE (P2)
- [ ] **BL-09:** Exportación de historias clínicas en PDF oficial con firma digital del profesional.
- [ ] **BL-10:** Políticas de retención automática y backup programado con RPO < 1h y RTO < 4h.
