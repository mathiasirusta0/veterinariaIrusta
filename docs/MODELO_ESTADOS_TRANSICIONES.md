# Modelo de Estados y Transiciones de Pacientes & Turnos

---

## 1. Ciclo de Vida del Turno y Consulta
1. `SOLICITADO` → `CONFIRMADO` (Recepción / WhatsApp)
2. `CONFIRMADO` → `EN_ESPERA` (Check-in Sala de Espera / Triage)
3. `EN_ESPERA` → `EN_CONSULTA` (Llamado a consultorio médico)
4. `EN_CONSULTA` → `ATENDIDO` (Cierre con receta o alta)
5. `EN_CONSULTA` → `INTERNADO` (Derivación a UCI)

## 2. Invariantes de Seguridad Clínica
- **Doble Asignación Bloqueada:** Dos internaciones activas no pueden compartir el mismo identificador de canil/sector.
- **Inmutabilidad SOAP:** Las notas SOAP firmadas son inalterables; se admiten addendums auditados.
