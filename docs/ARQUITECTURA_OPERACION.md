# Arquitectura del Hub de Operación Hospitalaria

---

## 1. Estructura de la Pantalla de Operación
- **Cabecera Operativa:** Acción primaria `+ Nuevo Ingreso de Urgencia`.
- **Buscador Rápido Ctrl+K:** Acceso instantáneo por Microchip, DNI o Nombre.
- **Cola Unificada de Episodios:** Listado ordenado por gravedad y tiempo de espera con botón directo **`Abrir Atención`**.
- **Espacio de Atención Integrado:** Modal workspace con 4 pestañas:
  1. *Resumen:* Diagnóstico, balance hídrico y signos actuales.
  2. *Plan:* Medicación activa con botón de aplicación `✓ Administrar`.
  3. *Evolución:* Timeline cronológico multirrol con firmas SHA-256.
  4. *Resultados:* Informes de laboratorio e imágenes.
