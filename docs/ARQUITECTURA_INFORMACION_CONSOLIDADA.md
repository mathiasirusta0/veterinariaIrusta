# Arquitectura de Información Consolidada — Veterinaria Irusta

**Versión:** 2.0 (Consolidación a 6 Macro-Áreas)  
**Fecha:** 22 de Agosto de 2026

---

## 1. Estructura de Navegación Principal (Máximo 6 Áreas)

1. **Inicio (`DASHBOARD`):**
   - Panel de control hospitalario, ocupación de camas UCI, alertas de guardia e ingresos espontáneos.
2. **Pacientes (`PACIENTES`):**
   - Directorio unificado de pacientes y tutores.
   - Ficha Médica 360° con el núcleo de **Evolución Clínica Unificada**.
   - Sub-pistas: Resumen 360°, Clínica & SOAP, Hospital & Estudios, Prevención & Documentos, Tutor & Facturación.
3. **Atención (`AGENDA` / `ATENCION`):**
   - Agenda de turnos programados.
   - Sala de espera & Triage veterinario (Niveles 1 a 5).
   - Consultas médicas ambulatorias SOAP.
4. **Hospital (`INTERNACION` / `HOSPITAL`):**
   - Pizarra de internación UCI con control de fluidoterapia y balance hídrico.
   - Quirófano & Cirugías con protocolo anestésico y monitorización.
   - Bandeja de órdenes de Laboratorio e Imágenes pendientes.
5. **Gestión (`INVENTARIO` / `GESTION`):**
   - Farmacia & Stock con control de lotes y vencimientos FEFO.
   - Plan de vacunación institucional.
   - Documentos & Consentimientos informados (Ley 25.326).
   - Caja & Facturación ARCA.
6. **Administración (`CONFIGURACION`):**
   - Gestión de usuarios y roles RBAC.
   - Sedes y configuración general.
   - Centro de Pruebas QA y Auditoría append-only.

## 2. Herramientas en Contexto (Sin saturación de menú)
- **Calculadora de Dosis & Fluidoterapia:** Accesible directamente desde la ficha, la pizarra UCI y el recetario.
- **Asistente Clínico IA:** Accesible contextualmente como borrador orientativo desde la ficha del paciente.
- **Odontograma Triadan:** Accesible desde la sección de clínica y procedimientos del paciente.
