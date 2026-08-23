# Arquitectura Simple Centrada en el Paciente

**Fecha:** 22 de Agosto de 2026  
**Sistema:** Veterinaria Irusta

---

## 1. Dos Pantallas Principales
1. **Lista de Pacientes (`PatientsListView`):**
   - Pantalla inicial por defecto.
   - Búsqueda unificada por Paciente, HC, Microchip, Tutor, DNI o Teléfono.
   - Clic en cualquier fila abre la ficha médica completa.
   - Botón primario: `+ Nuevo Paciente`.

2. **Ficha del Paciente (`Patient360View`):**
   - Encabezado con identidad, especie, peso, ubicación y alertas.
   - 5 Secciones Clínicas Principales:
     - **Signos Vitales:** Últimas constantes biométricas + acción `Registrar Signos`.
     - **Medicación:** Esquema farmacológico activo + acción `Indicar Medicación` / `Registrar Administración`.
     - **Evolución:** Timeline cronológico multirrol con firma SHA-256 + acción `Nueva Evolución`.
     - **Estudios:** Solicitudes y resultados de laboratorio e imágenes + acción `Solicitar Estudio`.
     - **Tutor:** Contacto y datos administrativos + acción `Contactar` / `Editar`.
