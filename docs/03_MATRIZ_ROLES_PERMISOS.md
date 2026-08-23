# 03. Matriz de Roles y Capacidades (RBAC)

---

## Matriz de Capacidades por Rol Clínico / Administrativo

| Capacidad / Recurso | `SUPERADMIN` | `DIRECTOR_MEDICO` | `VETERINARIO` | `ENFERMERIA` | `RECEPCION` | `CAJA` | `FARMACIA` |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `patient.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `patient.write` | ✓ | ✓ | ✓ | ✓ (signos) | ✓ (alta/tutor) | ✗ | ✗ |
| `soap.sign` | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `vital_signs.record` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| `surgery.manage` | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| `prescription.issue` | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| `billing.manage` | ✓ | ✓ | ✗ | ✗ | ✓ (cobro) | ✓ | ✗ |
| `stock.adjust` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ |
| `settings.manage` | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| `ai.consult` | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
