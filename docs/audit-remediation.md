# 🛡️ Documento de Auditoría y Remediación Integral de Seguridad — VET SYSTEM

**Fecha de Remediación:** 27 de Agosto de 2026  
**Sistema:** VET SYSTEM — Sistema Hospitalario Veterinario  
**Institución:** Veterinaria Ranquel (Las Lajas, Neuquén - CP 8347)  
**Director Médico:** Dr. Diego Iván Irusta (M.P. 502)  
**Entorno de Producción:** `https://veterinaria-irusta.vercel.app`  

---

## 1. Mapa de Confianza del Sistema & Arquitectura de Seguridad

```
[ NAVEGADOR / CLIENTE ]
        │
        ▼ (HTTPS + CSP estricto + HSTS + Deny Frame)
[ Vercel Edge / CDN ]
        │
        ├── Landing Pública (SSG/SSR - Sin datos clínicos expuestos)
        │
        └── App Privada Clínico-Hospitalaria
                │
                ▼ (Validación obligatoria de JWT)
        [ Supabase Auth (auth.getUser() / getSession()) ]
                │
                ▼ (Rol 'authenticated' + branch_id verificado)
        [ PostgreSQL Cloud con Row Level Security (RLS) ]
                │
                ├── Políticas Deny-by-Default para rol 'anon'
                ├── Acceso de lectura/escritura condicionado a auth.uid()
                └── Registro de Auditoría Append-Only en audit_logs
```

---

## 2. Matriz de Roles y Permisos (RBAC & RLS)

| Módulo / Entidad | DIRECTOR_MEDICO | VETERINARIO | ENFERMERO_TECNICO | RECEPCION | ADMINISTRATIVO |
|---|:---:|:---:|:---:|:---:|:---:|
| **Pacientes & Tutores** | Total (C/R/U/D) | Total (C/R/U/D) | Lectura / Registro | Lectura / Registro | Lectura / Registro |
| **Historia Clínica 360 & SOAP** | Total / Firma | Total / Firma | Lectura / Notas | No accesible | No accesible |
| **Signos Vitales & Biometría** | Total (C/R/U/D) | Total (C/R/U/D) | Registro / Lectura | No accesible | No accesible |
| **Quirófano & Cirugías** | Total / Firma | Total / Firma | Asistencia | No accesible | No accesible |
| **Agenda de Turnos & Triage** | Total (C/R/U/D) | Total (C/R/U/D) | Registro Triage | Total (C/R/U/D) | Total (C/R/U/D) |
| **Farmacia & Stock** | Total (C/R/U/D) | Consumo / Receta | Consumo interno | Consulta stock | Total (C/R/U/D) |
| **Caja, Facturación & ARCA** | Total / Auditoría | Consulta | No accesible | Cobro / Recibos | Total / Emisión |
| **Documentos Clínicos** | Total / Firma | Total / Firma | Lectura | No accesible | No accesible |
| **Auditoría & Configuración** | Total (C/R) | No accesible | No accesible | No accesible | Configuración |

---

## 3. Lineamientos de Facturación Electrónica ARCA

1. **Aislamiento de Secretos:** WSAA y WSMTXCA exclusivamente en backend/Edge Functions. Certificados y claves en Supabase Vault.
2. **Ambientes Homologación vs Producción:** Separación estricta de credenciales y endpoints.
3. **Correlatividad e Idempotencia:** Registro transaccional por (CUIT, Punto de Venta, Tipo de Comprobante).
4. **Resguardo Fiscal:** Comprobante autorizado con CAE / CAEA y código QR oficial AFIP/ARCA v1.

---

## 4. Estado de Remediación de Hallazgos Críticos (P0)

### ✅ P0.1: Supabase RLS Deny-by-Default
- **Acción:** Creada migración SQL `supabase/migrations/20260827_harden_rls_deny_anon.sql`.
- **Efecto:** `REVOKE ALL FROM anon` aplicado en todas las tablas sensibles. Únicamente se expone la información institucional de la sede para la landing.

### ✅ P0.2: Autenticación Verificada y Cierre de Confianza Ciega
- **Acción:** Actualizado `VetContext.tsx` con verificación de sesión mediante `supabase.auth.getSession()` y escucha reactiva en `supabase.auth.onAuthStateChange`.

### ✅ P0.3: Unificación de Sede Única Oficial y Eliminación de Fixtures
- **Acción:** Sede oficial fijada: **Veterinaria Ranquel, Casa 13, Barrio Militar de Oficiales, Las Lajas, Neuquén (CP 8347)** - Dr. Diego Iván Irusta (M.P. 502).

### ✅ P0.4: Desacoplamiento de Hashes de Navegación
- **Acción:** Las rutas internas de la aplicación clínica utilizan el prefijo `#app/[modulo]`, desacoplándose de los anclajes de navegación de la Landing Page.
