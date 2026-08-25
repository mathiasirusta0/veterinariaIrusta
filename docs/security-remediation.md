# Documento de Remediación de Seguridad & Arquitectura
**VET SYSTEM — Veterinaria Irusta**  
**Fecha de Ejecución:** 25 de Agosto de 2026  
**Dirección Médica:** Dr. Diego Iván Irusta (M.P. 502)  
**Alcance:** Seguridad de Autenticación, RLS en Supabase, Integridad de Datos Clínicos, Cabeceras HTTP y Optimización de Bundle.

---

## 1. Resumen de Hallazgos y Acciones de Remediación

| Prioridad | Hallazgo Original | Acción de Remediación Implementada | Estado |
|---|---|---|---|
| **P0** | Credencial de respaldo embebida en JavaScript cliente. | Eliminado el bypass completo de credenciales en `LoginView.tsx`. Autenticación obligatoria contra servidor Supabase Auth. | **SUBSANADO** |
| **P0** | Registro público con autoasignación de rol `SUPERADMIN`. | Eliminado el formulario de autoregistro en cliente. La provisión de usuarios y roles sólo es ejecutable por la Dirección Médica. | **SUBSANADO** |
| **P0** | Fallback silencioso en escrituras clínicas ("Offline cached"). | Implementada cola durable (`OfflineSyncQueue`) con reintentos automáticos, trazabilidad y estado de sincronización. | **SUBSANADO** |
| **P0** | Exposición de JSON crudo en visor de documentos clínicos. | Implementado parser tipado y sanitizado que renderiza notas SOAP formateadas y oculta metadatos crudos. | **SUBSANADO** |
| **P1** | Políticas RLS permisivas `USING (true)` y auditoría en cliente. | Creada migración `003_hardened_rls_and_audit.sql` con `DENY BY DEFAULT` para anónimos, aislamiento multi-sede y `audit_logs` inmutable (append-only). | **SUBSANADO** |
| **P1** | Bundle inicial monolítico (~1.41 MB). | Implementada división de código mediante `React.lazy()` y `Suspense` en `App.tsx` + configuración de chunks en `vite.config.ts`. | **SUBSANADO** |
| **P1** | Ausencia de cabeceras HTTP de seguridad. | Configuradas cabeceras estrictas en `vercel.json` (CSP, nosniff, SAMEORIGIN, Referrer-Policy, Permissions-Policy, COOP, HSTS). | **SUBSANADO** |

---

## 2. Matriz de Autorización y Políticas RLS

Todas las consultas y mutaciones de la base de datos se rigen por las siguientes reglas en PostgreSQL:

- **Rol Anónimo (`anon`):** Acceso completamente denegado a todas las tablasasistenciales y financieras (`REVOKE ALL`).
- **Usuarios Autenticados (`authenticated`):**
  - `profiles`: Lectura de perfiles de la clínica; actualización/creación restringida a `SUPERADMIN` o al propio usuario autenticado (`auth.uid() = id`).
  - `patients`, `owners`, `vital_signs`, `hospitalizations`, `consultations`: Acceso permitido a personal asistencial autenticado con validación por sede.
  - `audit_logs`: **Estrictamente Append-Only**. Se permite `SELECT` e `INSERT`. Operaciones de `UPDATE` y `DELETE` revocadas a nivel de motor de base de datos.

---

## 3. Arquitectura de Sincronización Confiable

Para evitar la pérdida o adulteración silenciosa de información clínica:

1. Cada operación asistencial (evolución, signos vitales, administración de fármacos, alta) envía una petición transaccional a Supabase.
2. Si se interrumpe la conexión a internet, la operación se almacena en una cola persistente local (`VET_OFFLINE_SYNC_QUEUE`) con sello de tiempo UTC y contador de reintentos.
3. El sistema emite eventos de estado de sincronización (`vet:sync_status_changed`) informando al profesional de forma transparente si existen operaciones pendientes de sincronización.
4. Al restablecerse la red, `processSyncQueue()` reintenta automáticamente las transacciones pendientes en orden FIFO.

---

## 4. Cabeceras HTTP de Seguridad Configuradas (`vercel.json`)

```json
{
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'self';",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload"
}
```

---

## 5. Procedimiento de Despliegue & Plan de Rollback

### Despliegue a Producción:
1. Ejecutar migración SQL `src/lib/003_hardened_rls_and_audit.sql` en el editor SQL de Supabase.
2. Compilar el frontend optimizado con `npm run build`.
3. Desplegar los cambios en Vercel (`main` branch).

### Plan de Rollback Seguro:
En caso de requerirse una reversión:
1. Revertir el commit en Git a la versión previa (`git revert HEAD`).
2. Si se requiere ajustar políticas RLS temporalmente, aplicar el script de contingencia manteniendo siempre la denegación a usuarios anónimos.
