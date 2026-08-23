# Modelo del Episodio de Atención Unificado (`care_episode`)

---

## 1. Ciclo de Vida y Transiciones de Estado
```text
ARRIVED (Llegada)
   ↓
TRIAGE (Clasificación 1-5)
   ↓
WAITING_CLINICIAN (Sala de Espera)
   ↓
IN_ASSESSMENT (Evaluación Médica / SOAP)
   ↓
IN_INTERVENTION (Estabilización / Signos / Fármacos)
   ↓
┌───────────────┬─────────────────┬────────────────┐
↓               ↓                 ↓                ↓
OBSERVATION    HOSPITALIZED (UCI) IN_SURGERY       READY_FOR_DISCHARGE
                                  ↓                ↓
                                  RECOVERY         DISCHARGED / REFERRED
```

## 2. Invariantes del Modelo
- Cada paciente activo en el hospital tiene exactamente un episodio abierto.
- La internación y la cirugía son transiciones de estado del episodio, no módulos aislados.
- Todo cambio de estado registra timestamp UTC, autor y motivo clínico.
