-- ==============================================================================
-- VET SYSTEM — MIGRACIÓN: UNIFICACIÓN DE FINANZAS, SUPABASE AUTH & RLS POLICIES
-- ==============================================================================

-- 1. PERFILES DE USUARIO VINCULADOS A AUTH.USERS (profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'VETERINARIO', -- SUPERADMIN, ADMINISTRADOR, DIRECTOR_MEDICO, VETERINARIO, ENFERMERIA, RECEPCION, CAJA, FARMACIA, LABORATORIO
    branch_id TEXT REFERENCES public.branches(id) ON DELETE SET NULL,
    license_number TEXT,
    phone TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS en perfiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Los usuarios autenticados pueden ver perfiles de su sucursal"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Superadmin y Administradores pueden gestionar perfiles"
    ON public.profiles FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('SUPERADMIN', 'ADMINISTRADOR')
        )
    );

-- 2. TRANSACCIONES FINANCIERAS UNIFICADAS (financial_transactions)
-- Única fuente de verdad para Caja, Facturas, Ventas de Farmacia y Gastos
CREATE TABLE IF NOT EXISTS public.financial_transactions (
    id TEXT PRIMARY KEY,
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('INGRESO', 'GASTO', 'REVERSO')),
    category TEXT NOT NULL,
    concept TEXT NOT NULL,
    description TEXT,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency TEXT DEFAULT 'ARS',
    payment_method TEXT NOT NULL, -- EFECTIVO, TRANSFERENCIA, TARJETA_DEBITO, TARJETA_CREDITO, MERCADOPAGO_QR, OTRO
    status TEXT NOT NULL DEFAULT 'COBRADO', -- COBRADO, PAGADO, PENDIENTE, ANULADO
    occurred_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    
    -- Trazabilidad de origen para evitar duplicados
    source_type TEXT NOT NULL, -- FACTURA, TICKET_CAJA, VENTA_FARMACIA, COBRO_DEUDA, PAGO_PROVEEDOR, GASTO_MANUAL, AJUSTE
    source_id TEXT, -- ID de invoice, debt_payment, etc.
    
    -- Entidades relacionadas
    owner_id TEXT REFERENCES public.owners(id) ON DELETE SET NULL,
    client_name TEXT,
    supplier_name TEXT,
    patient_id TEXT REFERENCES public.patients(id) ON DELETE SET NULL,
    
    -- Auditoría y anulación
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    is_voided BOOLEAN DEFAULT false,
    voided_at TIMESTAMPTZ,
    voided_by TEXT,
    void_reason TEXT
);

-- Índice único compuesto para idempotencia (evita duplicados)
CREATE UNIQUE INDEX IF NOT EXISTS idx_financial_transactions_source 
    ON public.financial_transactions (branch_id, source_type, source_id)
    WHERE source_id IS NOT NULL AND is_voided = false;

-- 3. CUENTAS CORRIENTES Y DEUDAS (account_debts)
CREATE TABLE IF NOT EXISTS public.account_debts (
    id TEXT PRIMARY KEY,
    branch_id TEXT NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('COBRAR', 'PAGAR')),
    entity_name TEXT NOT NULL,
    owner_id TEXT REFERENCES public.owners(id) ON DELETE SET NULL,
    supplier_id TEXT,
    invoice_id TEXT REFERENCES public.invoices(id) ON DELETE SET NULL,
    concept TEXT NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    balance NUMERIC(12, 2) NOT NULL CHECK (balance >= 0),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (status IN ('PENDIENTE', 'PARCIAL', 'PAGADA', 'VENCIDA')),
    notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. PAGOS PARCIALES DE DEUDAS (debt_payments)
CREATE TABLE IF NOT EXISTS public.debt_payments (
    id TEXT PRIMARY KEY,
    debt_id TEXT NOT NULL REFERENCES public.account_debts(id) ON DELETE CASCADE,
    transaction_id TEXT REFERENCES public.financial_transactions(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL,
    paid_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    notes TEXT,
    registered_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debt_payments ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura restringidas a usuarios autenticados
CREATE POLICY "Permitir lectura financiera a usuarios autenticados"
    ON public.financial_transactions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir inserción financiera a usuarios autenticados"
    ON public.financial_transactions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Permitir lectura de deudas a usuarios autenticados"
    ON public.account_debts FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir gestión de deudas a usuarios autenticados"
    ON public.account_debts FOR ALL
    TO authenticated
    USING (true);

CREATE POLICY "Permitir pagos de deudas a usuarios autenticados"
    ON public.debt_payments FOR ALL
    TO authenticated
    USING (true);

-- 6. TRIGGER PARA ACTUALIZACIÓN AUTOMÁTICA DE SALDOS DE DEUDA
CREATE OR REPLACE FUNCTION public.handle_debt_payment_trigger()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.account_debts
    SET 
        paid_amount = paid_amount + NEW.amount,
        balance = GREATEST(0, total_amount - (paid_amount + NEW.amount)),
        status = CASE 
            WHEN (total_amount - (paid_amount + NEW.amount)) <= 0 THEN 'PAGADA'
            ELSE 'PARCIAL'
        END,
        updated_at = timezone('utc'::text, now())
    WHERE id = NEW.debt_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_on_debt_payment ON public.debt_payments;
CREATE TRIGGER trigger_on_debt_payment
    AFTER INSERT ON public.debt_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_debt_payment_trigger();
