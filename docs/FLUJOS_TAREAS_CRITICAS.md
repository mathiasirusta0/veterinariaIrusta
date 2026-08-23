# Flujos de Tareas Críticas Hospitalarias

---

## 1. Invariante: Próxima Acción Obligatoria en UCI
- **Regla Clínica:** Ningún paciente internado en UCI o calificado como CRÍTICO puede figurar como "Sin pendientes".
- **Resolución Automática:** Si no hay medicación inmediata programada, el sistema infiere y muestra la próxima ronda de constantes biométricas (ej: `Control de Glucemia & T° 23:00`) o la guardia responsable.
