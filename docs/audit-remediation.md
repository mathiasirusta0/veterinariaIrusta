# VET SYSTEM — Informe de Remediación de Seguridad, RLS y Arquitectura

**Fecha de Remediación:** 26 de Agosto de 2026  
**Sistema Evaluado:** VET SYSTEM — Sistema Hospitalario Veterinario  
**Objetivo:** `https://veterinaria-irusta.vercel.app/` / Repositorio Oficial  

---

## 1. Resumen Ejecutivo de Hallazgos y Acciones Ejecutadas

| Prioridad | Hallazgo Comprobado | Remediación Implementada | Estado |
|---|---|---|:---:|
| **P0** | Lectura anónima abierta en API Supabase (`patients`, `owners`, `clinical_documents`, `audit_logs`). | Migración SQL `20260826_remediation_rls_security_auth.sql` con políticas RLS `DENY ALL` para rol `anon`. Acceso restringido exclusivamente a tokens autenticados con JWT válido y aislamiento por sede/rol. | ✅ REMEDIADO |
| **P0** | Escalación de privilegios en el cliente (`localStorage` forzando `SUPERADMIN` por nombres/emails). | Eliminación de toda regla cliente que asigne `SUPERADMIN`. La identidad y el rol se obtienen y validan estrictamente desde `supabase.auth.getUser()` y la tabla protegida `public.profiles`. | ✅ REMEDIADO |
| **P0** | Escrituras directas (`upsert`) no controladas en el cliente. | Transacciones atómicas, validación de esquemas en repositorios y permisos RLS específicos por operación. | ✅ REMEDIADO |
| **P1** | URL `#sedes` abría la vista de Pacientes y carecía de enrutador profundo. | Enrutamiento reactivo por hash (`#sedes`, `#/configuracion/sedes`, `#usuarios`, `#auditoria`) sincronizado con vistas y submódulos. | ✅ REMEDIADO |
| **P1** | CSP con `unsafe-eval` y `frame-ancestors 'self'`. | Endurecimiento de cabeceras en `vercel.json`: se eliminó `unsafe-eval` y se estableció `frame-ancestors 'none'`. | ✅ REMEDIADO |
| **P1** | Tratamiento heterogéneo de cola offline con PII en `localStorage`. | Sanitización de colas, aislamiento por usuario/sede y política explícita de fallo visible. | ✅ REMEDIADO |

---

## 2. Mapa de Confianza del Sistema

```
[ NAVEGADOR CLIENTE ]
        │
        ▼ (1. Credenciales / OAuth)
[ SUPABASE AUTH SERVICE ] ──── (2. Emite JWT firmado con auth.uid())
        │
        ▼ (3. Solicitud HTTPS con Bearer JWT)
[ POSTGRESQL RLS ENGINE ]
  ├── auth.uid() verificado por firma criptográfica
  ├── Función helper get_auth_role() consulta public.profiles
  └── Función helper get_auth_branch() valida aislamiento multi-sede
        │
        ▼ (4. Permisos Validados)
[ TABLAS MAESTRAS EN POSTGRESQL ]
  ├── patients, owners, clinical_documents, invoices (Protegidas)
  └── audit_logs (Append-Only inmutable, UPDATE/DELETE denegado)
```

---

## 3. Matriz de Roles y Permisos (RBAC & RLS)

| Entidad / Módulo | Anon | ENFERMERO | RECEPCION | VETERINARIO | DIRECCION_MEDICA | SUPERADMIN |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Pacientes & Tutores (PII)** | ❌ DENEGADO | Lectura / Signos | Lectura / Alta | CRUD Completo | CRUD Completo | CRUD Completo |
| **Historia Clínica / SOAP** | ❌ DENEGADO | Lectura | ❌ DENEGADO | Crear / Firmar | CRUD / Enmiendas | CRUD Completo |
| **Quirófano & Cirugías** | ❌ DENEGADO | Checklist | ❌ DENEGADO | Protocolo Anest. | CRUD Completo | CRUD Completo |
| **Farmacia & Stock** | ❌ DENEGADO | Consumo dosis | ❌ DENEGADO | Receta / Consumo | Ajuste / Precios | CRUD Completo |
| **Finanzas & Facturación** | ❌ DENEGADO | ❌ DENEGADO | Cobros / Recibos | Presupuestos | Arqueo / Cierre | CRUD Completo |
| **Documentos Legales** | ❌ DENEGADO | ❌ DENEGADO | Emisión | Firma Médica | CRUD Completo | CRUD Completo |
| **Auditoría del Sistema** | ❌ DENEGADO | ❌ DENEGADO | ❌ DENEGADO | ❌ DENEGADO | Lectura Sede | Lectura Global |
| **Configuración & Sedes** | ❌ DENEGADO | ❌ DENEGADO | ❌ DENEGADO | ❌ DENEGADO | ❌ DENEGADO | CRUD Completo |

---

## 4. Lineamientos de Facturación Electrónica ARCA

1. **WSAA & WSMTXCA estrictamente en Backend:** Ningún certificado (`.crt`), clave privada (`.key`), Ticket de Acceso (TRA) ni token/sign se almacena o expone en el frontend (`VITE_*`, bundle o `localStorage`).
2. **Ambientes Seguros:** Separación estricta de variables `ARCA_ENVIRONMENT=homologacion` vs `ARCA_ENVIRONMENT=produccion`.
3. **Máquina de Estados de Comprobantes:**
   draft -> authorizing -> authorized (CAE otorgado + QR v1) | observed/rejected (Rechazo con motivo) | uncertain (Timeout reconciliación)
4. **Idempotencia y Correlatividad:** Serialización de emisiones por Punto de Venta y Tipo de Comprobante, impidiendo saltos de numeración o reintentos duplicados.

---

## 5. Procedimiento de Despliegue y Rollback Seguro

### Procedimiento de Despliegue:
1. **Backup:** Ejecutar snapshot completo de base de datos Supabase.
2. **Migración SQL:** Aplicar `supabase/migrations/20260826_remediation_rls_security_auth.sql`.
3. **Verificación RLS:** Constatar que consultas anónimas retornen acceso denegado.
4. **Frontend Deploy:** Despliegue en Vercel con CSP endurecido.
