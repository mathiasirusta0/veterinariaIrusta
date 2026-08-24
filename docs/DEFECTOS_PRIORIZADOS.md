# REGISTRO DE DEFECTOS PRIORIZADOS (P0 / P1 / P2)

## 🔴 Prioridad P0 (Bloqueantes / Integridad / Seguridad)
- **DEF-01 [CORREGIDO]:** Saldo monetario con doble signo o formato ambiguo (`$-15.000` vs `$$15.000`).
  - *Causa Raíz:* Concatenación de símbolo `$` con resultado de `(-num).toLocaleString('es-AR')` y prefijos redundantes en plantillas JSX.
  - *Solución:* Centralización en `formatCurrency` con manejo explícito de signo negativo (`-$15.000,00`).

## 🟠 Prioridad P1 (UX / Mapeo de Nombres / Permisos)
- **DEF-02 [EN PROCESO]:** Nombres de navegación con sufijos extensos ("Pacientes & Ficha 360°", "Consultas Médicas SOAP").
  - *Solución:* Estandarización obligatoria a nombres unívocos simples ("Pacientes", "Consultas Médicas", etc.).
- **DEF-03 [EN PROCESO]:** Enum técnico `CONDICION_CRONICA` visible al usuario final.
  - *Solución:* Formateador de alertas `formatAlertLabel`.
- **DEF-04 [EN PROCESO]:** Teléfonos completos expuestos a roles de recepción/auxiliar sin privilegio.
  - *Solución:* Enmascaramiento de datos personales (PII) según matriz RBAC.
- **DEF-05 [EN PROCESO]:** Presencia del módulo Asistente Clínico IA.
  - *Solución:* Retiro completo y desvinculación total de dependencias.
