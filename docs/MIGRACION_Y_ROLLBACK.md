# Plan de Migración y Procedimiento de Rollback

---

- **Compatibilidad Hacia Atrás:** Las rutas legacy (`DASHBOARD`, `AGENDA`, `INTERNACION`, `INVENTARIO`) redirigen automáticamente al hub de Operación o Gestión sin pérdida de datos.
- **Rollback Instantáneo:** Reversión atómica mediante Git commit en la rama `main`.
