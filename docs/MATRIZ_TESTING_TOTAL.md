# MATRIZ DE TESTING TOTAL — VET SYSTEM

| ID | Módulo | Escenario | Rol | Datos de Prueba | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TEST-01** | Pacientes | Carga inicial y visualización de lista | Recepción / Veterinario | 3 pacientes (Luna, Rocky, Toby) | Conteo exacto: 3 pacientes, 2 caninos, 1 felino, 1 internado | ✅ PASS |
| **TEST-02** | Pacientes | Búsqueda por nombre, microchip, tutor | Todos | "Luna", "Rocky", "Carlos" | Filtrado reactivo en <50ms | ✅ PASS |
| **TEST-03** | Pacientes | Formateo de alertas médicas | Todos | Paciente con alertas | Texto legible ("Condición crónica", "Alergia") sin enum | ✅ PASS |
| **TEST-04** | Pacientes | Exportar censo con auditoría | Superadmin / Vet | Censo hospitalario | Descarga CSV + registro de auditoría | ✅ PASS |
| **TEST-05** | Ficha 360° | Informe Completo unificado | Veterinario | Paciente seleccionado | Visualización consolidada de 14 áreas clínicas | ✅ PASS |
| **TEST-06** | Consultas | Creación de consulta con SOAP | Veterinario | S, O, A, P, Diagnóstico | Persistencia y trazabilidad inmutable | ✅ PASS |
| **TEST-07** | Internación | Ocupación de canil y monitoreo | Enfermería / Vet | UCI Canil 01 | Indicadores en tiempo real sin doble ocupación | ✅ PASS |
| **TEST-08** | Triage | Clasificación Manchester/Veterinaria | Guardia / Vet | Nivel 1 (Rojo) a 5 (Azul) | Priorización inmediata en sala de espera | ✅ PASS |
| **TEST-09** | Agenda | Reserva de turno veterinario | Recepción | Paciente + Horario | Sin solapamiento en el mismo consultorio | ✅ PASS |
| **TEST-10** | Cirugías | Protocolo y checklist preoperatorio | Cirujano | Riesgo ASA + Quirófano | Registro quirúrgico completo | ✅ PASS |
| **TEST-11** | Recetario | Emisión de receta oficial | Veterinario | Fármaco + Dosis + Matrícula | PDF oficial sin recortes | ✅ PASS |
| **TEST-12** | Laboratorio | Registro de analitos y alerta de rango | Bioquímico / Vet | Glucemia 180 mg/dL | Alerta roja en valores alterados | ✅ PASS |
| **TEST-13** | Imágenes | Carga de estudio y reporte | Imagenólogo | Rx Tórax LL + Informe | Asociación a Ficha y visor | ✅ PASS |
| **TEST-14** | Vacunación | Control de vencimiento | Veterinario | Rabia / Tétanos | Alerta automática <30 días | ✅ PASS |
| **TEST-15** | Farmacia | Salida de stock y libro de psicotrópicos | Farmacia / Vet | Ketamina 50mg/ml | Registro en libro oficial SENASA | ✅ PASS |
| **TEST-16** | Caja | Formateo monetario y arqueo | Caja / Admin | Saldos y Facturas | Formato -$15.000 / $15.000 sin bugs | ✅ PASS |
| **TEST-17** | Tutores | Enmascaramiento PII de teléfono/DNI | Recepción / Auxiliar | Tutor | Enmascaramiento según rol RBAC | ✅ PASS |
| **TEST-18** | Documentos | Firma digital de consentimiento | Tutor / Vet | Consentimiento Anestesia | Guardado de firma y hash de integridad | ✅ PASS |
