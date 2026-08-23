# Inventario de Rutas, Componentes y Capas de Datos

---

## 1. Mapeo de Rutas y Componentes
- `/dashboard`: `DashboardView.tsx` (KPIs hospitalarios, internaciones activas).
- `/pacientes`: `PatientsListView.tsx` + `Patient360View.tsx` (Ficha 360°, macro-navegación).
- `/agenda`: `AppointmentsView.tsx` (Calendario, profesionales, turnos de guardia).
- `/triage`: `TriageView.tsx` (Sala de espera, priorización Nivel 1 a 5).
- `/consultas`: `ConsultationsView.tsx` (Atención médica SOAP, diagnósticos).
- `/signos-vitales`: `VitalSignsView.tsx` (Biometría, SpO2, TAM, temperatura).
- `/recetas`: `PrescriptionsView.tsx` (Recetario oficial con firma profesional).
- `/internacion`: `HospitalizationWhiteboardView.tsx` (Caniles UCI, fluidoterapia).
- `/cirugias`: `SurgeriesView.tsx` (Quirófano, anestesia, checklist).
- `/laboratorio`: `LaboratoryView.tsx` (Bioquímica, hematología, orina).
- `/imagenes`: `ImagingView.tsx` (Radiografías, ecografías, informes).
- `/vacunacion`: `VaccinationView.tsx` (Plan sanitario, control de lotes).
- `/inventario`: `InventoryView.tsx` (Farmacia, vencimientos FEFO, descartables).
- `/caja`: `CashAndBillingView.tsx` (Cuentas corrientes, facturación ARCA).
- `/documentos`: `DocumentsView.tsx` (Consentimientos legales, Ley 25.326).
- `/configuracion`: `SettingsAndUsersView.tsx` (Roles RBAC, usuarios, sedes).

## 2. Capa de Datos & Sincronización
- Sincronizador: `src/lib/supabaseSync.ts` con normalizadores bidireccionales camelCase <-> snake_case y fallback seguro ante nulos.
- Cliente PostgreSQL: `src/lib/supabaseClient.ts`.
