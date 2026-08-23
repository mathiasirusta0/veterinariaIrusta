# Especificación: Modo Operativo por Rol

---

## 1. Vista Operativa "Mi Trabajo"
La pantalla de inicio se adapta dinámicamente según las capacidades y responsabilidades del usuario activo:

### A. Perfil Veterinario
1. **Pacientes en Espera:** Ordenados por Triage (Nivel 1 Crítico a Nivel 5 No Urgente).
2. **Pacientes Críticos Asignados:** Con próxima acción médica explícita.
3. **Evoluciones & Recetas Pendientes:** Acceso directo a firmar o evolucionar.
4. **Acción Primaria:** `+ Iniciar Próxima Consulta`.

### B. Perfil Técnico / Enfermería
1. **Ronda Horaria de Medicación:** Fármacos próximos y atrasados.
2. **Toma de Signos Vitales:** Pacientes UCI con intervalos vencidos.
3. **Control de Catéteres & Balances:** Monitoreo hídrico de pacientes en fluidoterapia.
4. **Acción Primaria:** `+ Comenzar Ronda Horaria`.

### C. Perfil Recepción
1. **Sala de Espera en Vivo:** Pacientes con tiempo de espera acumulado.
2. **Agenda de Turnos del Día:** Llegadas previstas y confirmaciones pendientes.
3. **Acción Primaria:** `+ Registrar Llegada / Nuevo Paciente`.

### D. Perfil Superadmin / Gestión
1. **Tablero de Rendimiento:** Ocupación de camas, facturación ARCA, analítica de consultas y estado de QA.
