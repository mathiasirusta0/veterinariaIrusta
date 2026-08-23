# Matriz de Roles y Políticas Row Level Security (RLS)

---

## 1. Políticas RLS en Supabase (PostgreSQL)

| Tabla | Operación | Rol `anon` | Rol `authenticated` | Condición RLS |
| :--- | :--- | :---: | :---: | :--- |
| `patients` | SELECT | ✗ | ✓ | `auth.jwt() ->> 'clinic_id' = clinic_id` |
| `patients` | INSERT/UPDATE | ✗ | ✓ | Rol en (`VETERINARIO`, `ENFERMERIA`, `RECEPCION`, `SUPERADMIN`) |
| `consultations` | INSERT | ✗ | ✓ | Rol en (`VETERINARIO`, `DIRECTOR_MEDICO`, `SUPERADMIN`) |
| `consultations` | UPDATE | ✗ | ✓ | Addendum fechado únicamente por el autor original |
| `vital_signs` | INSERT | ✗ | ✓ | Rol en (`VETERINARIO`, `ENFERMERIA`, `SUPERADMIN`) |
| `invoices` | SELECT | ✗ | ✓ | Rol en (`CAJA`, `RECEPCION`, `DIRECTOR_MEDICO`, `SUPERADMIN`) |
| `audit_logs` | INSERT | ✗ | ✓ | Append-only para todas las operaciones mutantes |
| `audit_logs` | UPDATE/DELETE | ✗ | ✗ | Bloqueado estrictamente por trigger PostgreSQL |
