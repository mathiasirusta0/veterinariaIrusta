# 08. Operación Hospitalaria 24h, Backup y Recuperación ante Desastres (DRP)

---

## 1. Objetivos de Recuperación
- **RPO (Recovery Point Objective):** < 1 Hora (respaldos incrementales continuos en Supabase Cloud).
- **RTO (Recovery Time Objective):** < 4 Horas para restauración completa de servicio en contingencia.

## 2. Procedimiento de Contingencia Operativa (Guardia 24h)
- En caso de caída de conectividad externa, el frontend mantiene el estado en memoria y cola local para sincronización reactiva una vez restablecido el enlace.
- La asistencia de IA opera en modo orientativo y nunca interrumpe el flujo de guardia manual de los médicos veterinarios matriculados.
