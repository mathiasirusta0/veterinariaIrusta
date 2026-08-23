# Auditoría Funcional: Hospital & Cuidados Intensivos (UCI)

**Fecha:** 22 de Agosto de 2026  
**Sistema:** Veterinaria Irusta (Hospital Veterinario 24hs)

---

## 1. Matriz de Hallazgos y Correcciones de Intervención

| ID | Prioridad | Estado | Evidencia | Impacto Urgente | Causa | Solución | Prueba | Riesgo | Rollback |
| :--- | :---: | :---: | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **HOSP-01** | **P0** | **RESUELTO** | "Caninos" y "Felinos" figuraban como sectores | Confusión taxonómica vs asistencial | Categorización hardcodeada | Separación estricta de Sector Asistencial y Filtro de Especie | Test de filtros | Nulo | Revertir componente |
| **HOSP-02** | **P0** | **RESUELTO** | 5 botones compitiendo en cabecera de pizarra | Sobrecarga cognitiva en urgencias | Botones agregados sin jerarquía | 1 botón primario: `+ Ingresar Urgencia` + herramientas compactas | Test visual | Nulo | Revertir barra |
| **HOSP-03** | **P1** | **RESUELTO** | 4 botones de igual jerarquía por canil | Salto entre módulos durante guardia | Falta de un workspace integrado | 1 botón principal: `Abrir Intervención` con modal 360° | E2E Intervención | Bajo | Revertir tarjetas |
| **HOSP-04** | **P1** | **RESUELTO** | Indicaciones terapéuticas aisladas | Dificultad para seguir el plan | Falta de pestaña de Plan | Pestaña de Plan de Intervención con fármacos y fluidos | Test de medicación | Bajo | Revertir modal |
