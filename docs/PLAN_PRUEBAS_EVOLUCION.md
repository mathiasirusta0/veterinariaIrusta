# Plan de Pruebas para Evolución Clínica & Consolidación

---

## 1. Pruebas Unitarias & E2E
1. **Creación de Evolución Médica:** Verificar que un veterinario pueda registrar SOAP con firma SHA-256.
2. **Creación de Evolución de Enfermería:** Verificar que enfermería pueda registrar tratamientos administrados.
3. **Creación de Nota de Auxiliar:** Verificar que el auxiliar solo acceda a campos de higiene, alimentación y confort.
4. **Inmutabilidad:** Confirmar que no se puede sobrescribir una nota firmada y que los addendums se agregan cronológicamente.
5. **Integración con UCI:** Comprobar que el botón `+ Evolucionar` desde la pizarra abre la ficha en la sección correcta.
