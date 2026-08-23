# Modelo de Eventos de la Línea de Tiempo Unificada

---

## 1. Esquema de Datos de `clinical_evolution_entries`

```sql
CREATE TABLE IF NOT EXISTS clinical_evolution_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  hospitalization_id UUID REFERENCES hospitalizations(id),
  type VARCHAR(50) NOT NULL, -- 'MEDICA', 'ENFERMERIA', 'AUXILIAR', 'PASE_GUARDIA'
  status VARCHAR(30) NOT NULL DEFAULT 'FIRMADO', -- 'BORRADOR', 'FIRMADO', 'CON_ADDENDUM', 'ANULADO'
  date_time TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  author_name VARCHAR(150) NOT NULL,
  author_role VARCHAR(50) NOT NULL,
  author_license VARCHAR(50),
  sector VARCHAR(100),
  subjective_summary TEXT,
  objective_summary TEXT,
  assessment TEXT,
  plan TEXT,
  nursing_notes TEXT,
  assistant_notes TEXT,
  administered_treatments TEXT[],
  vital_signs_snapshot JSONB,
  next_action VARCHAR(255),
  next_action_due_date TIMESTAMPTZ,
  next_action_assignee VARCHAR(150),
  signature_hash VARCHAR(255) NOT NULL,
  addenda JSONB DEFAULT '[]'::jsonb
);
```
