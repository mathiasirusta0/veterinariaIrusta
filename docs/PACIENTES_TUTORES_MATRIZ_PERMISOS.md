# Matriz de Permisos & RLS — Pacientes & Tutores

---

## Matriz de Capacidades

| Capacidad | VETERINARIO | ENFERMERIA | RECEPCION | CAJA | SUPERADMIN |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `patient.search` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `patient.read_clinical` | ✓ | ✓ | ✗ | ✗ | ✓ |
| `patient.edit_clinical` | ✓ | ✗ | ✗ | ✗ | ✓ |
| `vital_signs.record` | ✓ | ✓ | ✗ | ✗ | ✓ |
| `guardian.read_contact` | ✓ | ✓ | ✓ | ✓ | ✓ |
| `billing.read_balance` | ✗ | ✗ | ✓ | ✓ | ✓ |
| `prescription.sign` | ✓ | ✗ | ✗ | ✗ | ✓ |
