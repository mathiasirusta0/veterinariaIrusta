# Arquitectura del Espacio de Intervención Rápida

---

## 1. Estructura de Navegación del Workspace
- **Encabezado Persistente:** Paciente, HC, Especie, Peso, Canil, Prioridad única (`CRÍTICO`, `PRIORITARIO`, `ESTABLE`), Responsable.
- **3 Botones de Intervención Principal:** `+ Evolucionar`, `+ Registrar Signos`, `+ Indicar`.
- **4 Pestañas de Trabajo Internas:**
  1. **Resumen:** Alertas clínicas, diagnóstico, fluidoterapia en curso, medicación próxima.
  2. **Plan:** Hoja de farmacología activa con botón directo `✓ Registrar Aplicación`.
  3. **Evolución:** Historial cronológico multirrol con firmas digitales SHA-256 y addenda.
  4. **Resultados:** Estudios bioquímicos, imágenes y diagnósticos complementarios.
