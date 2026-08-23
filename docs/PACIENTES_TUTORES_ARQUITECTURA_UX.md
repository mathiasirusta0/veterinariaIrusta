# Arquitectura de Información & UX — Pacientes & Tutores

---

## 1. Estructura de Navegación de 5 Macro-Áreas

1. **Resumen 360° (`RESUMEN`):**
   - Panel de 12 columnas: Alertas críticas, problemas activos, última biometría, evolución ponderal no ambigua y línea de tiempo unificada.
2. **Clínica (`CLINICA`):**
   - Historia Clínica cronológica.
   - Consultas Médicas SOAP (Subjetivo, Objetivo, Análisis, Plan).
   - Signos Vitales y Biometría seriada.
   - Lista de Diagnósticos & Problemas activos/resueltos.
   - Recetas Oficiales SENASA.
   - Odontograma Triadan interactivo.
3. **Hospital & Estudios (`HOSPITAL`):**
   - Internación UCI y control de fluidoterapia.
   - Cirugías, anestesia y protocolos quirúrgicos.
   - Laboratorio clínico con valores de referencia por especie.
   - Diagnóstico por Imágenes (Radiografías y Ecografías).
4. **Prevención & Documentos (`PREVENCION`):**
   - Plan Sanitario & Vacunación con control de lotes.
   - Consentimientos informados (Cirugía, Sedación, Eutanasia, Ley 25.326).
5. **Administración & Tutor (`ADMIN`):**
   - Ficha del Tutor Responsable, personas autorizadas y emergencias.
   - Cuenta Corriente, cobros de insumos y comprobantes de facturación.

---

## 2. Jerarquía Visual & Accesibilidad (WCAG 2.2 AA)
- **Máximo 3 Acciones Primarias:** `Nueva Consulta SOAP`, `Registrar Signos/Peso`, `Más Acciones`.
- **Cabecera Fija Compacta:** Nombre, HC, especie/raza, sexo, edad derivada, peso con fecha y alertas clínicas.
- **Divulgación Progresiva:** Estados vacíos inteligentes con instrucciones operativas claras.
