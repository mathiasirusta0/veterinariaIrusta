# Especificación Funcional: Evolución Clínica Unificada

---

## 1. Objetivos del Núcleo de Evolución
- Proveer una **línea de tiempo cronológica, inmutable y auditable** del paciente que integre todas las disciplinas clínicas en un único flujo de lectura.
- Permitir la autoría diferenciada por rol garantizando que cada profesional actúe dentro de sus competencias legales y habilitaciones institucionales.

## 2. Tipos de Evolución y Estructura
- **Evolución Médica (SOAP):** Subjetivo, Objetivo, Evaluación Diagnóstica, Plan Terapéutico & Indicaciones (Exclusivo Veterinario).
- **Evolución Técnica / Enfermería:** Cuidados técnicos, vías periféricas, procedimientos y tratamientos administrados.
- **Observaciones de Auxiliar:** Alimentación, hidratación, higiene de canil, paseos y confort.
- **Pase de Guardia:** Resumen de estado, cambios del turno, tratamientos pendientes y recepción formal.

## 3. Inmutabilidad y Addendums
- Ninguna nota firmada puede ser editada ni sobrescrita.
- Las correcciones o aclaraciones se realizan mediante **Addendums fechados** con autor, motivo y contenido.
- Toda evolución cuenta con un hash criptográfico de integridad (SHA-256).
