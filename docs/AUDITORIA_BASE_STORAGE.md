# AUDITORÍA DE BASE DE DATOS Y SUPABASE STORAGE

## 1. Tablas Clínicas y Relaciones
- `patients` (PK: `id`, FK: `owner_id` ➔ `owners.id`)
- `consultations` (PK: `id`, FK: `patient_id` ➔ `patients.id`)
- `hospitalizations` (PK: `id`, FK: `patient_id` ➔ `patients.id`)
- `surgeries` (PK: `id`, FK: `patient_id` ➔ `patients.id`)
- `laboratory_orders` (PK: `id`, FK: `patient_id` ➔ `patients.id`)
- `imaging_studies` (PK: `id`, FK: `patient_id` ➔ `patients.id`)
- `vaccinations` (PK: `id`, FK: `patient_id` ➔ `patients.id`)
- `prescriptions` (PK: `id`, FK: `patient_id` ➔ `patients.id`)
- `clinical_documents` (PK: `id`, FK: `patient_id` ➔ `patients.id`)

## 2. Storage Buckets y Políticas
- `imaging-studies`: Almacenamiento privado de radiografías, ecografías y tomografías. Descargas vía URL firmada temporal.
- `lab-reports`: Informes de laboratorio en PDF / imágenes analíticas.
- `patient-photos`: Fotos públicas de perfil de pacientes.
- `document-signatures`: Firmas digitales en canvas de consentimientos informados.
