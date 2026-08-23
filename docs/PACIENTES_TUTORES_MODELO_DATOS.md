# Modelo de Datos & Entidades — Pacientes & Tutores

---

## 1. Esquema Relacional de Entidades

```mermaid
erDiagram
    OWNERS ||--o{ PATIENTS : "tutela / responsable"
    PATIENTS ||--o{ CONSULTATIONS : "consultas SOAP"
    PATIENTS ||--o{ HOSPITALIZATIONS : "internaciones UCI"
    PATIENTS ||--o{ VITAL_SIGNS : "constantes fisiológicas"
    PATIENTS ||--o{ SURGERIES : "cirugías"
    PATIENTS ||--o{ PRESCRIPTIONS : "recetas médicas"
    PATIENTS ||--o{ LAB_ORDERS : "estudios bioquímicos"
    PATIENTS ||--o{ IMAGING_STUDIES : "imágenes RX/Eco"
    PATIENTS ||--o{ VACCINATIONS : "vacunaciones"
    PATIENTS ||--o{ INVOICES : "comprobantes de insumos"
    PATIENTS ||--o{ PROBLEMS : "diagnósticos y problemas"

    PATIENTS {
        string id PK
        string clinicalRecordNumber UK
        string name
        string species
        string breed
        string sex
        string birthDate
        float weight
        string microchip UK
        string status
        string ownerId FK
    }

    OWNERS {
        string id PK
        string firstName
        string lastName
        string dni UK
        string cuit
        string phone
        string email
        string address
        float balance
        string[] authorizedPersons
    }
```

## 2. Invariantes del Dominio
- **Microchip Único:** Si el microchip está presente, debe ser único en la organización.
- **Fecha y Edad:** La edad se calcula dinámicamente desde `birthDate` en tiempo de renderizado.
- **Auditoría Append-Only:** Todo cambio en la ficha del paciente se registra con autor y timestamp UTC.
