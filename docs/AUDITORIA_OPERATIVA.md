# Auditoría Operativa — Línea Base & Diagnóstico

**Fecha:** 22 de Agosto de 2026  
**Sistema:** Veterinaria Irusta (Hospital Veterinario 24hs)

---

## 1. Matriz de Tareas Frecuentes & Línea Base

| Tarea | Rol | Ruta Actual | Pasos | Tiempo Baseline | Campos | Errores / Riesgos | Mejora Propuesta | Objetivo Medible |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- | :---: |
| **Buscar paciente existente** | Recepción / Vet | `Ctrl+K` GlobalSearch | 2 | 4s | 1 | No normalizar tildes o guiones | Normalización fuzzy & ranking exacto | < 3s |
| **Crear tutor y paciente** | Recepción | Pacientes > Nuevo | 8 | 110s | 14 | Duplicación por DNI sin aviso previo | Wizard guiado con chequeo de duplicados | < 60s |
| **Check-in de turno programado** | Recepción | Agenda > Check-in | 3 | 25s | 2 | Estado libre sin pase a triage | 1-clic: Confirmar llegada a Sala de Espera | < 5s |
| **Ingresar urgencia espontánea** | Recepción / Enf | Triage > Nuevo | 4 | 35s | 4 | Falta de escala de gravedad | Triage estructurado Niveles 1 a 5 | < 15s |
| **Iniciar consulta médica** | Veterinario | Consultas > Nueva | 4 | 30s | 6 | Sobrescribir notas previas | SOAP estructurado con autoguardado | < 10s |
| **Registrar signos vitales** | Enfermería | Signos Vitales | 3 | 40s | 8 | Valores fuera de rango sin alerta | Validación fisiológica por especie | < 25s |
| **Redactar evolución clínica** | Vet / Enfermería | Ficha > Evolución | 3 | 50s | 5 | Pérdida de autoría multirrol | Compositor multirrol con firma SHA-256 | < 30s |
| **Administrar tratamiento UCI** | Enfermería | UCI Whiteboard | 3 | 20s | 2 | Checkbox sin registro horario | 1-clic con hora y autor registrado | < 5s |
| **Emitir receta oficial** | Veterinario | Ficha > Recetario | 5 | 60s | 7 | Falta de firma o matrícula | Generación de receta con trazabilidad | < 30s |
