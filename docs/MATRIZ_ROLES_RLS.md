# MATRIZ DE ROLES Y POLÍTICAS DE ACCESO (RBAC & RLS)

## Roles del Sistema
1. **SUPERADMIN:** Acceso irrestricto a configuración, auditoría, exportación de censo y administración de sedes.
2. **VETERINARIO:** Acceso total clínico, prescripción oficial, cirugías, evoluciones, laboratorio y diagnóstico por imágenes.
3. **ENFERMERIA / TECNICO:** Registro de signos vitales, administración de medicación, controles horarios de internación.
4. **RECEPCION:** Gestión de turnos, admisión de triage, altas de pacientes/tutores con datos protegidos.
5. **CAJA:** Cobros, facturación ARCA, emisión de recibos, arqueos de caja chica.
6. **FARMACIA:** Control de stock, recepción de mercadería, libro de psicotrópicos.

## Políticas RLS (Row Level Security) en Supabase
- `SELECT`: Filtrado por `branch_id` de la sede activa del usuario.
- `INSERT / UPDATE`: Restringido a usuarios autenticados con rol específico.
- `DELETE`: Prohibido para registros clínicos (consultas, evoluciones, recetas), permitido solo soft-delete en entidades administrativas por superadmin.
