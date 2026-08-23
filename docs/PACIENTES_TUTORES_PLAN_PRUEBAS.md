# Plan de Pruebas — Módulo Pacientes & Tutores

---

## 1. Pruebas Unitarias
- [x] Validación y cálculo de variaciones de peso en intervalos de tiempo.
- [x] Formateo seguro de fechas sin etiquetas ambiguas.
- [x] Normalización de entidades PostgreSQL snake_case a TypeScript camelCase.

## 2. Pruebas de Integración y E2E
- [x] Búsqueda cruzada por nombre, microchip, DNI de tutor y número de historia clínica.
- [x] Alerta interactiva en pacientes internados sin signos vitales recientes.
- [x] Conmutación entre vistas de Pacientes y Tutores sin pérdida de estado.
