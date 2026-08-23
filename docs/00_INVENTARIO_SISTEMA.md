# 00. Inventario Integral del Sistema — Veterinaria Irusta

**Fecha:** 22 de Agosto de 2026  
**Entorno:** Producción / Vercel (`https://veterinaria-irusta.vercel.app/`)  
**Stack Tecnológico:** React 18, TypeScript 5+, Tailwind CSS, Vite 6, Vitest, Supabase Cloud (PostgreSQL 15), Node.js Serverless Proxy.

---

## 1. Inventario de Módulos & Vistas del Sistema

| ID Vista / Módulo | Componente Principal | Propósito Clínico / Operativo | Roles Permitidos |
| :--- | :--- | :--- | :--- |
| `DASHBOARD` | `DashboardView.tsx` | Panel central de KPIs, Whiteboard UCI, turnos y alertas de guardia | Todos los roles autenticados |
| `PACIENTES` | `PatientsListView.tsx` / `Patient360View.tsx` | Ficha Médica 360°, directorio clínico, tutores, microchips ISO | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO`, `ENFERMERIA`, `RECEPCION`, `CAJA` |
| `PROPIETARIOS` | `PatientsListView.tsx` (Tab Tutores) / `OwnersView.tsx` | Cuentas corrientes, datos fiscales ARCA, WhatsApp y contactos | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO`, `RECEPCION`, `CAJA` |
| `INTERNACION` | `HospitalizationWhiteboardView.tsx` | Pizarra UCI, caniles, monitoreo de fluidos, balance y órdenes | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO`, `ENFERMERIA` |
| `SALA_ESPERA` | `TriageView.tsx` | Triage veterinario (Nivel 1 a 5), guardia y llamados de atención | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO`, `RECEPCION`, `ENFERMERIA` |
| `AGENDA` | `AppointmentsView.tsx` | Gestión de turnos programados, profesionales y recursos de quirófano | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO`, `RECEPCION` |
| `CONSULTAS` | `ConsultationsView.tsx` | Registro clínico SOAP (Subjetivo, Objetivo, Análisis, Plan) | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO` |
| `SIGNOS_VITALES` | `VitalSignsView.tsx` | Registro biométrico (FC, FR, T°, PAS/PAD, SpO2, dolor Glasgow) | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO`, `ENFERMERIA` |
| `CIRUGIAS` | `SurgeriesView.tsx` | Planificación quirúrgica, protocolos anestésicos y consentimientos | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO`, `ENFERMERIA` |
| `LABORATORIO` | `LaboratoryView.tsx` | Órdenes de laboratorio, paneles bioquímicos y valores de referencia | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO`, `LABORATORIO_EXTERNO` |
| `IMAGENES` | `ImagingView.tsx` | Radiología digital, ecografía, informes de especialistas | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO` |
| `VACUNACION` | `VaccinationView.tsx` | Planes sanitarios, trazabilidad de lotes de vacunas y vencimientos | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO`, `RECEPCION` |
| `RECETAS_OFICIALES` | `PrescriptionsView.tsx` | Recetario con firma profesional y dosificación | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO` |
| `INVENTARIO` | `InventoryView.tsx` | Stock de farmacia, control FEFO, descartables y alertas de mínimos | `SUPERADMIN`, `DIRECTOR_MEDICO`, `FARMACIA`, `VETERINARIO` |
| `CAJA_FACTURACION` | `CashAndBillingView.tsx` | Facturación ARCA/AFIP, arqueo de caja, cuenta corriente de tutores | `SUPERADMIN`, `DIRECTOR_MEDICO`, `CAJA` |
| `DOCUMENTOS` | `DocumentsView.tsx` | Consentimientos quirúrgicos, eutanasia, internación y GDPR/Ley 25.326 | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO`, `RECEPCION` |
| `ASISTENTE_IA` | `AiAssistantView.tsx` | Asistencia diagnóstica, resúmenes para tutores y análisis de interacciones | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO` |
| `CALCULADORAS` | `CalculatorsModal.tsx` | Dosis farmacológicas en mg/kg, fluidoterapia y superficie corporal | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO`, `ENFERMERIA` |
| `ODONTOGRAMA` | `DentalChartModal.tsx` | Sistema Triadan modificado por especie (Caninos y Felinos) | `SUPERADMIN`, `DIRECTOR_MEDICO`, `VETERINARIO` |
| `CENTRO_QA` | `QaAuditCenterModal.tsx` | Panel de validación de integridad clínica y chequeos de resiliencia | `SUPERADMIN`, `DIRECTOR_MEDICO` |
| `CONFIGURACION` | `SettingsAndUsersView.tsx` | Gestión de usuarios, asignación de roles RBAC, sedes y auditoría | `SUPERADMIN`, `DIRECTOR_MEDICO` |

---

## 2. Inventario de Tablas Supabase Cloud (PostgreSQL)

1. `owners`: Tutores/clientes, DNI/CUIT, condición impositiva, saldos, contactos de respaldo.
2. `patients`: Pacientes animales, especie, raza, peso, microchip ISO, alertas y estado clínico.
3. `consultations`: Registros médicos estructurados en formato SOAP.
4. `hospitalizations`: Internaciones activas e históricas, sector, canil, fluidoterapia y evolución.
5. `vital_signs`: Lecturas de constantes fisiológicas con unidades normalizadas.
6. `surgeries`: Protocolos quirúrgicos, anestésicos y cirujanos intervinientes.
7. `prescriptions`: Recetas emitidas, medicamentos, dosis y firma digital.
8. `lab_orders`: Órdenes de laboratorio y resultados bioquímicos/hematológicos.
9. `imaging_studies`: Estudios radiológicos y ecográficos vinculados a almacenamiento seguro.
10. `vaccinations`: Inmunizaciones aplicadas, lotes y fechas de refuerzo.
11. `invoices`: Comprobantes fiscales, cobros de insumos y cuentas corrientes.
12. `documents`: Consentimientos firmados y archivos adjuntos.
13. `audit_logs`: Trazabilidad append-only de accesos y operaciones críticas.
