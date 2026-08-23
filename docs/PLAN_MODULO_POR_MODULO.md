# Plan de Mejora Integral Módulo por Módulo — Veterinaria Irusta

**Fecha:** 22 de Agosto de 2026  
**Sistema:** Veterinaria Irusta (Hospital Veterinario 24hs)

---

## Matriz de Ejecución Módulo por Módulo

| Orden | Módulo | Estado Actual | Conservar | Agregar | Quitar / Simplificar | Corregir | Prioridad | Dependencias | Pruebas | Riesgo | Rollback | Estado |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- | :---: | :--- | :---: |
| **1** | **Plataforma, Auth & RBAC** | Selector visual + roles | Identidad y sede activas | Matriz granular de capacidades (`soap.sign`, `stock.adjust`) | Suplantación de identidad en cliente | Políticas RLS en PostgreSQL | **P0** | Supabase Auth | Tests unitarios RBAC | Bajo | Revertir `rbac.ts` | **COMPLETADO (LOTE 1)** |
| **2** | **Navegación & Buscador** | Barra lateral + GlobalSearch | Menú agrupado y atajo `Ctrl+K` | Paginación y resaltado de coincidencias | Entradas redundantes (Directorio separado) | Rutas protegidas y 403 claro | **P1** | RBAC | Tests de navegación | Nulo | Revertir `Sidebar.tsx` | **COMPLETADO** |
| **3** | **Pacientes & Tutores** | Ficha 360° + Directorio unificado | Ficha 360°, HC, microchips, tutor | Macro-navegación en 5 áreas, alertas UCI | 14 pestañas planas desbordadas | Fechas ponderales ambiguas (`Hace 3m`) | **P1** | Plataforma | Tests E2E de paciente | Bajo | Revertir componentes | **COMPLETADO** |
| **4** | **Agenda & Sala de Espera** | Turnos + Triage veterinario | Flujo de guardia vs turnos | Bloqueo concurrente de recursos | Duplicación de turnos por reintento | Horario local America/Argentina/Buenos_Aires | **P1** | Pacientes | Concurrencia de turnos | Bajo | Revertir agenda | **EN PROGRESO** |
| **5** | **SOAP, Signos & Recetas** | Consultas SOAP + Biometría | Estructura SOAP y rangos de especie | Autosave y addendums fechados | Hardcoded KPIs en Signos Vitales sin registros | Dinamizar KPIs según últimas lecturas | **P1** | Pacientes | Tests de biometría | Bajo | Revertir vistas | **COMPLETADO (LOTE 1)** |
| **6** | **UCI & Cirugías** | Whiteboard + Protocolos | Whiteboard, caniles, fluidoterapia | Constraint: 1 paciente por canil | Checkboxes de tratamiento sin autor/hora | Tratamientos con trazabilidad horaria | **P1** | Pacientes | Tests de internación | Bajo | Revertir whiteboard | **PENDIENTE** |
| **7** | **Laboratorio & Imágenes** | Órdenes + Diagnóstico RX/Eco | Historial bioquímico e informes | Cadena de custodia y URLs firmadas | URLs permanentes públicas | Validación MIME y valores críticos | **P2** | Storage | Tests de laboratorio | Bajo | Revertir lab | **PENDIENTE** |
| **8** | **Farmacia & Stock** | Inventario + FEFO | Lotes, vencimientos y alertas | Libro inmutable de movimientos | Modificación de stock sin comprobante | Restricción de stock negativo | **P2** | Insumos | Tests de inventario | Bajo | Revertir stock | **PENDIENTE** |
| **9** | **Documentos & Legal** | Consentimientos informados | Plantillas y firmas | Versionado de plantillas y hash | Renderizado con HTML sin sanitizar | Sanitización estricta de documentos | **P2** | Storage | Tests de documentos | Bajo | Revertir docs | **PENDIENTE** |
| **10** | **IA, Calculadoras & Odonto** | Gemini + Dosis + Triadan | Disclaimers y validación humana | Evals de seguridad y no-alucinación | Métricas arbitrarias ("91% Relevancia") | Badge a "Borrador Clínico" | **P2** | Asistente | Evals de IA | Nulo | Revertir IA | **COMPLETADO** |
| **11** | **Facturación & Operación** | Caja + AFIP/ARCA | Historial de cobros y cuentas corrientes | Cierre de caja y conciliación | Totales hardcodeados o tipo `float` | Moneda ARS y decimales enteros | **P2** | Facturación | Tests de caja | Bajo | Revertir caja | **PENDIENTE** |
