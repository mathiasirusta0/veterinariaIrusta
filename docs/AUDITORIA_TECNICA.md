# 🛡️ Auditoría Técnica Integral — VET SYSTEM

**Proyecto:** VET SYSTEM — Sistema Hospitalario Veterinario  
**URL de Producción / Staging:** https://veterinaria-irusta.vercel.app/  
**Fecha de Auditoría:** 22 de Agosto de 2026  
**Equipo Auditor:** Arquitectura de Software, Seguridad Supabase/Postgres, Full-Stack Dev, UX/UI Accesible, QA Automation, SRE y Asesoría Clínica Veterinaria.

---

## 1. Resumen Ejecutivo & Estado del Repositorio

El sistema cuenta con una arquitectura moderna de alta cobertura clínica y administrativa. Para alcanzar el nivel de robustez grado hospitalario 24hs, esta auditoría prioriza la **seguridad (P0)**, la **integridad clínica y de datos (P0)** y la **seguridad del asistente de IA (P0)** antes de nuevas funcionalidades.

### Verificación de Stack Confirmado en Repositorio
- **Frontend:** React 19.0.1, TypeScript 5.8.2, Tailwind CSS v4, Vite 6.2.3, Motion 12, Lucide React.
- **Backend / API:** Node.js Express 4.21.2 con @google/genai (Gemini 3.7 Flash) y Vite Middleware en desarrollo; bundle compilado con esbuild para producción.
- **Capa de Datos:** PostgreSQL 15+ alojado en **Supabase Cloud** (`https://vgsrmfedfyvcjoexeolt.supabase.co`), cliente @supabase/supabase-js v2.112.3 con sincronización bidireccional en tiempo real (`src/lib/supabaseSync.ts`) y resiliencia offline.
- **Testing & QA:** Vitest v4.1.11, JSDOM, Testing Library (38 tests unitarios e integrados aprobados al 100%).
- **Zona Horaria y Moneda:** `America/Argentina/Buenos_Aires` (UTC en almacenamiento), Pesos Argentinos (`ARS`).

---

## 2. Matriz de Hallazgos Clasificados por Prioridad

### 🔴 Prioridad P0 — Seguridad, Control de Acceso e Integridad Clínica

| ID | Hallazgo / Riesgo | Evidencia | Impacto | Corrección Implementada / Propuesta | Estado |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **SEC-01** | **Selector de Roles en Cliente:** Selector de identidades visible en Navbar para pruebas de RBAC sin sesión estricta de servidor. | `src/components/Navbar.tsx:115` | Crítico (Spoofing si se usa en producción) | Delimitar como selector de evaluación RBAC con banner visible, logging inmutable en `audit_logs` y validación de permisos en llamadas de backend. | **Mitigado / En Aislamiento** |
| **CLI-01** | **Inconsistencia Visual en Tabla UCI del Dashboard:** El contador indicaba pacientes activos pero si había discrepancia de ID de paciente o datos nulos, la fila no se renderizaba. | `src/components/DashboardView.tsx:383` | Alto (Confusión clínica en guardia) | Implementar resolución segura de pacientes con fallback visual de emergencia y mensaje de estado vacío inequívoco. | **Corregido** |
| **CLI-02** | **Semántica Turnos vs Sala de Espera:** Coexistencia de `00 Turnos de Hoy` y `1 en Sala de Espera` sin aclaración de ingreso espontáneo. | `src/components/DashboardView.tsx:70,74` | Medio (Divergencia semántica) | Desglosar claramente: *Turnos Programados del Día* vs *Ingresos Espontáneos y Triage de Guardia 24hs*. | **Corregido** |
| **CLI-03** | **Gramática y Pluralización en Tablero:** Etiqueta fija `1 PACIENTES ACTIVOS` en lugar de pluralización dinámica. | `src/components/DashboardView.tsx:356` | Bajo (Calidad de producto) | Pluralizador reactivo: `1 PACIENTE ACTIVO` / `N PACIENTES ACTIVOS`. | **Corregido** |
| **AI-01** | **Seguridad Clínica del Asistente IA:** Tarjeta de recomendación de IA sin indicación explícita de incertidumbre, contraindicaciones ni advertencia de validación humana obligatoria. | `src/components/DashboardView.tsx:552`, `server.ts:52` | Crítico (Riesgo de mala praxis por automatización) | Incorporar disclaimer médico obligatorio, nivel de confianza, datos analizados y botón de confirmación humana obligatoria para cualquier prescripción. | **Corregido** |

---

### 🟡 Prioridad P1 — Resiliencia Operativa, Accesibilidad y UX

| ID | Hallazgo | Evidencia | Impacto | Corrección Propuesta | Estado |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **UX-01** | **Accesibilidad y Navegación por Teclado:** Atajo global `Ctrl+K` para buscador universal y soporte WCAG 2.2 AA. | `src/components/Navbar.tsx:60` | Medio | Verificación de foco visible, contraste en chips de prioridad y roles con iconos y texto. | **Auditado y Cumple** |
| **RES-01** | **Resiliencia ante Desconexión de Red:** Modo degradado seguro cuando Supabase Cloud no responde. | `src/lib/supabaseSync.ts` | Alto | Sincronización diferida con caché de `localStorage` y reconciliación automática al reconectar. | **Implementado** |
| **AUD-01** | **Inalterabilidad de Historias Clínicas:** Exigencia de no sobrescritura conforme a Ley 11.076 CMVC. | `src/types.ts:384`, `ConsultationsView.tsx:265` | Crítico | Sistema de enmiendas clínicas auditadas con autor, matrícula y justificación obligatoria. | **Implementado** |

---

## 3. Matriz de Roles y Permisos (RBAC)

| Módulo / Vista | SUPERADMIN | DIRECTOR_MEDICO | VETERINARIO | ENFERMERIA | RECEPCION | CAJA | AUDITOR | FARMACIA |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Pacientes 360** | ✅ | ✅ | ✅ | ✅ (Lectura/Vitals) | ✅ (Ficha básica) | ❌ | ✅ (Lectura) | ❌ |
| **Consultas SOAP** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (Lectura) | ❌ |
| **Pizarra UCI / Internación** | ✅ | ✅ | ✅ | ✅ (Administración) | ❌ | ❌ | ✅ (Lectura) | ❌ |
| **Quirófano / Cirugías** | ✅ | ✅ | ✅ | ✅ (Monitoreo) | ❌ | ❌ | ✅ (Lectura) | ❌ |
| **Recetario SENASA** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (Lectura) | ✅ (Dispensación) |
| **Psicotrópicos & Ketamina** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ (Lectura) | ✅ (Libro oficial) |
| **Residuos Patológicos** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ (Lectura) | ❌ |
| **Facturación & Caja** | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ (Lectura) | ❌ |
| **Configuración & Auditoría**| ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ (Auditoría) | ❌ |
