# PLAN DE RETIRO DEFINITIVO DEL ASISTENTE CLÍNICO IA

## 1. Alcance del Retiro
- Retirar completamente la vista `AiAssistantView.tsx`.
- Eliminar la ruta de navegación `ASISTENTE_IA` de `Sidebar.tsx`, `App.tsx` y modales de búsqueda.
- Desconectar los botones auxiliares de generación automática en `HospitalizationWhiteboardView.tsx`, `Patient360View.tsx`, `QuickModals.tsx` e `ImagingAnnotatorModal.tsx`.
- Eliminar `callAiAssistant` del contexto `VetContext.tsx` y de las interfaces de `types.ts`.

## 2. Preservación de Datos
- Las notas médicas, evoluciones y diagnósticos registrados previamente por profesionales se mantienen 100% intactos como datos clínicos históricos.
