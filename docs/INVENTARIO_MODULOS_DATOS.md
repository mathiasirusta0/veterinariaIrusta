# INVENTARIO COMPLETO DE MÓDULOS, VISTAS Y ESTRUCTURAS DE DATOS

## 1. Módulos y Vistas del Sistema

| ID Vista | Nombre Visible Oficial | Componente Principal | Entidades Principales |
| :--- | :--- | :--- | :--- |
| `PACIENTES` | **Pacientes** | `PatientsListView.tsx`, `Patient360View.tsx`, `PatientFullReportView.tsx` | `Patient`, `Owner`, `VitalSigns`, `PatientProblem` |
| `CONSULTAS` | **Consultas Médicas** | `ConsultationsView.tsx` | `Consultation`, `SoapNote`, `PrescriptionItem` |
| `INTERNACION` | **Internación** | `HospitalizationWhiteboardView.tsx` | `Hospitalization`, `HourlyVitalSigns`, `GuardPass` |
| `SALA_ESPERA` | **Triage** | `TriageWaitingRoomView.tsx` | `TriageEntry` |
| `AGENDA` | **Agenda de Turnos** | `AppointmentsCalendarView.tsx` | `Appointment` |
| `CIRUGIAS` | **Cirugías** | `SurgeriesView.tsx` | `SurgeryRecord` |
| `RECETAS_OFICIALES` | **Recetario** | `OfficialPrescriptionsView.tsx` | `Prescription` |
| `LABORATORIO` | **Laboratorio** | `LaboratoryView.tsx` | `LaboratoryOrder` |
| `IMAGENES` | **Diagnóstico por Imágenes** | `ImagingView.tsx` | `ImagingStudy` |
| `VACUNAS` | **Plan de Vacunación** | `VaccinationView.tsx` | `VaccinationRecord` |
| `INVENTARIO` | **Farmacia** | `InventoryView.tsx` | `Product`, `InventoryMovement` |
| `CAJA_FACTURACION` | **Caja** | `CashAndBillingView.tsx` | `Invoice`, `Estimate`, `CashSession` |
| `PROPIETARIOS` | **Directorio de Tutores** | `OwnersDirectoryView.tsx` | `Owner` |
| `DOCUMENTOS` | **Documentos** | `DocumentsView.tsx` | `ClinicalDocument` |
| `CONFIGURACION` | **Configuración & Auditoría** | `SettingsView.tsx` | `AuditLog`, `Branch`, `User` |

## 2. Inventario de Modelos de Datos en Memoria y Persistencia (Supabase/LocalStorage)

- **Pacientes (`patients`):** 3 pacientes iniciales (*Luna, Rocky, Toby*) con especie, raza, sexo, peso, microchip, alertas clínicas, pasaporte équido y vínculo a tutor.
- **Tutores (`owners`):** 3 tutores iniciales con DNI/CUIT, teléfono, dirección y saldo de cuenta corriente.
- **Consultas (`consultations`):** Registros clínicos con SOAP, diagnósticos, constantes biológicas y plan terapéutico.
- **Internaciones (`hospitalizations`):** Casos activos y de alta con asignación de canil/sector y fluidoterapia.
