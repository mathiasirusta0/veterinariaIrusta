# 05. Seguridad de Aplicación y Threat Model (STRIDE)

---

## 1. Superficie de Ataque & Mitigaciones

| Amenaza (STRIDE) | Vector Potencial | Mitigación Implementada en Sistema |
| :--- | :--- | :--- |
| **Spoofing (Suplantación)** | Manipulación de identificadores de usuario en cliente | Autenticación basada en Supabase Auth con JWT tokens firmados |
| **Tampering (Alteración)** | Modificación de historiales clínicos SOAP firmados | Modelo append-only con firmas fechadas y addendums auditados |
| **Repudiation (Repudio)** | Negación de administración de medicamentos en UCI | Registro append-only en `audit_logs` con matrícula y timestamp UTC |
| **Information Disclosure** | Exposición de PII (DNI, teléfonos, direcciones de tutores) | Filtrado por capacidades RBAC y aislamiento multi-tenant |
| **Denial of Service** | Consultas masivas no paginadas en búsqueda global | Búsqueda con debounce local y paginación acotada |
| **Elevation of Privilege** | Modificación de roles desde localStorage en frontend | Políticas RLS en PostgreSQL que validan permisos a nivel de base de datos |
