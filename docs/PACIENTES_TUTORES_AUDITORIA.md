# Auditoría de Pacientes & Tutores — Veterinaria Irusta

**Fecha:** 22 de Agosto de 2026  
**Módulo:** Pacientes & Tutores  
**Sistema:** Veterinaria Irusta (`https://veterinaria-irusta.vercel.app/`)

---

## Matriz de Hallazgos y Correcciones

| ID | Prioridad | Estado | Evidencia | Impacto | Causa | Corrección | Prueba | Riesgo | Rollback |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PAT-01** | **P1** | **CORREGIDO** | En `Patient360View.tsx:711`, paciente internado en UCI mostraba "No hay signos vitales registrados" neutro | Falta de alerta operativa ante ausencia de constantes en paciente crítico | Estado vacío genérico sin evaluar `patient.status === 'INTERNADO'` | Reemplazado por alerta clínica accionable con botón `+ Registrar Signos Vitales` | Test visual de paciente internado sin signos | Nulo | Revertir componente |
| **PAT-02** | **P2** | **CORREGIDO** | En `Patient360View.tsx:757-759`, fechas relativas de peso usaban abreviaturas ambiguas (`Hace 3m`) | Confusión clínica entre minutos y meses en la evolución ponderal | Hardcoding de strings relativos abreviados | Formateo estricto `DD/MM/AAAA · hace N meses` y `DD/MM/AAAA · hoy` | Test unitario de formateo de fechas | Nulo | Revertir string |
| **PAT-03** | **P1** | **CORREGIDO** | En `Patient360View.tsx:822`, paciente con internación activa mostraba "Sin problemas activos" sin sugerencia | Incoherencia entre estado hospitalario y lista diagnóstica | Ausencia de chequeo cruzado de calidad diagnóstica | Advertencia: "No hay problemas activos vinculados. Revisar la lista de problemas de esta internación." | Inspección de UI en paciente Toby | Nulo | Revertir texto |
| **PAT-04** | **P2** | **CORREGIDO** | 14 pestañas planas horizontales causaban sobrecarga cognitiva y desbordamiento en pantallas pequeñas | Dificultad para recorrer la historia clínica y pérdida de contexto | Arquitectura de información plana sin agrupamiento temático | Reorganización en 5 macro-áreas (Resumen, Clínica, Hospital, Prevención, Administración) | Verificación responsive en 390px y desktop | Bajo | Revertir navegación |
| **PAT-05** | **P2** | **CORREGIDO** | Botón rotulado "WhatsApp Insumos" en tarjeta del tutor | Ambigüedad sobre la función real de contacto | Texto demasiado específico en cabecera general | Renombrado a "WhatsApp al Tutor" con selector de plantillas contextual | Prueba manual de apertura de WhatsApp Hub | Nulo | Revertir label |
