# Inventario de Acciones Funcionales del Sistema

---

| Pantalla | Acción | Propósito | Capacidad | Backend | Estados | Prueba |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **Operación** | `Abrir Atención` | Abrir workspace del episodio | `episode.view` | Local/Supabase | Activo | E2E Atención |
| **Workspace** | `+ Evolucionar` | Redactar nota clínica/técnica | `evolution.create` | Local/PostgreSQL | Activo | Test Evolución |
| **Workspace** | `+ Registrar Signos` | Guardar constantes biométricas | `vitals.record` | Local/PostgreSQL | Activo | Test Signos |
| **Workspace** | `+ Indicar` | Prescribir fármaco o estudio | `order.create` | Local/PostgreSQL | Activo | Test Indicación |
| **Workspace** | `✓ Administrar` | Registrar aplicación de fármaco | `treatment.administer`| Local/PostgreSQL | Activo | Test Ronda |
