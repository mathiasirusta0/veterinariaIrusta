# 01. Auditoría Integral y Diagnóstico Técnico — Veterinaria Irusta

**Alcance:** Código fuente, componentes React, capas de sincronización Supabase, modelo de datos, seguridad RBAC y experiencia de usuario.

---

## Matriz de Hallazgos Auditados

| ID | Prioridad | Estado | Módulo | Evidencia | Impacto | Causa Raíz | Corrección Realizada / Requerida | Prueba de Aceptación | Riesgo | Rollback | Responsable |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **AUD-01** | **P0** | **RESUELTO** | Sincronización Supabase | Columna PostgreSQL `fluid_therapy` nula rompía Dashboard (`Cannot read properties of undefined (reading 'isActive')`) | Pantalla blanca para usuarios al ingresar al sistema | Falta de normalización snake_case a camelCase con fallback de objetos vacíos | Implementado `normalizeHospitalization` y normalizadores completos en `supabaseSync.ts` | Test unitario `normalizers.test.ts` pasando 100% | Mínimo | Revertir normalizador | Arquitecto Full-Stack |
| **AUD-02** | **P1** | **RESUELTO** | Pacientes & Tutores | Tutores estaban desconectados del flujo clínico del paciente | Dificultad para contactar al dueño ante emergencias o cobro de insumos | Separación rígida de módulos en interfaz | Integración de Pestaña `TUTOR` en Patient360 y subpestañas en `PatientsListView` | Validación de interfaz y navegación fluida | Mínimo | Revertir componentes UI | Diseñador UX / Dev |
| **AUD-03** | **P2** | **RESUELTO** | Dashboard / Compliance | Banner con texto "100% Auditado" sin trazabilidad de certificación formal | Promesa de cumplimiento regulatorio sin evidencia auditable | Textos hardcodeados de marketing técnico | Removido banner no calibrado y reemplazado por controles clínicos reales | Inspección de código y UI | Nulo | Restaurar componente | Auditor / Dev |
| **AUD-04** | **P2** | **RESUELTO** | Asistente IA | Indicador visual "91% Relevancia" no calibrado estadísticamente | Falsa sensación de certeza diagnóstica en profesionales | Métrica arbitraria fija en interfaz | Sustituido por badge explícito "Borrador Clínico" | Verificación visual en Dashboard | Nulo | Revertir texto | Analista Clínico |
| **AUD-05** | **P1** | **CONFIRMADO** | Seguridad & RBAC | Cambio de rol disponible en selector local de desarrollo | Potencial riesgo de suplantación si se mantiene activo en prod | Mock de desarrollo persistido en cliente | Aislar el selector de demo bajo flag de entorno seguro (`VITE_DEMO_MODE`) | Test de restricción por rol | Bajo | Feature flag | Especialista Seguridad |
