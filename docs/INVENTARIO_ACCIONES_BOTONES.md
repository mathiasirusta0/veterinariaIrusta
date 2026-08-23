# Inventario de Acciones y Botones del Módulo Hospital

---

| Pantalla | Botón | Propósito | Capacidad Requerida | Acción Real | Estado | Prueba | Decisión |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **Pizarra UCI** | `+ Ingresar Urgencia` | Admisión rápida de urgencia | `hospital.admit` | Abre modal de ingreso | Activo | E2E Admisión | **CONSERVAR** |
| **Pizarra UCI** | `Modo TV` | Monitor de pared pasivo | `hospital.view` | Pantalla completa oscura | Activo | Test visual | **CONSERVAR (Compacto)** |
| **Pizarra UCI** | `Telemetría` | Datos multiparamétricos | `vitals.read` | Modal de telemetría | Activo | Test monitor | **CONSERVAR (Compacto)** |
| **Canil Card** | `Abrir Intervención` | Workspace central del paciente | `hospital.intervene` | Abre modal de 4 pestañas | Activo | Test de modal | **NUEVO NÚCLEO** |
| **Intervención** | `+ Evolucionar` | Redactar SOAP o cuidados | `evolution.create` | Abre compositor | Activo | Test evolución | **CONSERVAR** |
| **Intervención** | `+ Registrar Signos` | Constantes biométricas | `vitals.record` | Captura fisiológica | Activo | Test de signos | **CONSERVAR** |
| **Intervención** | `+ Indicar` | Prescribir o solicitar estudios | `order.create` | Formulario de indicación | Activo | Test indicación | **NUEVO NÚCLEO** |
