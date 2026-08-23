# Matriz de Capacidades y Autorización RLS

---

| Capacidad | Veterinario | Director Médico | Enfermería | Recepción |
| :--- | :---: | :---: | :---: | :---: |
| `episode.create` | ✓ | ✓ | ✓ | ✓ |
| `episode.triage` | ✓ | ✓ | ✓ | ✗ |
| `episode.intervene` | ✓ | ✓ | ✓ | ✗ |
| `order.prescribe` | ✓ | ✓ | ✗ | ✗ |
| `task.administer` | ✓ | ✓ | ✓ | ✗ |
| `vitals.capture` | ✓ | ✓ | ✓ | ✓ |
| `discharge.authorize` | ✓ | ✓ | ✗ | ✗ |
