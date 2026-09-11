-- AgroCultiva - Supabase Schema Migration
-- Proyecto: alexisespinoza11's Project (wxyenmunawsqjqmsaqpq)

-- 1. Tabla de Pedidos Mayoristas / Chacra
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT NOT NULL,
    crop TEXT NOT NULL,
    variety TEXT NOT NULL,
    unit TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    approx_weight_kg NUMERIC NOT NULL,
    unit_price_estimate NUMERIC NOT NULL,
    subtotal_estimate NUMERIC NOT NULL,
    freight_estimate NUMERIC NOT NULL,
    total_estimate NUMERIC NOT NULL,
    origin_location TEXT NOT NULL,
    destination_location TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    contact_role TEXT,
    status TEXT NOT NULL DEFAULT 'Generado',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabla de Diagnósticos Fitosanitarios
CREATE TABLE IF NOT EXISTS public.diagnoses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crop TEXT,
    scientific_crop_name TEXT,
    health_status TEXT,
    disease_common_name TEXT,
    disease_scientific_name TEXT,
    severity TEXT,
    confidence_percentage INTEGER,
    symptoms_description TEXT,
    alert_level TEXT,
    organic_control TEXT[],
    chemical_control TEXT[],
    preventive_tips TEXT[],
    rejection_reason TEXT,
    image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Habilitar Seguridad a Nivel de Filas (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Acceso Público / Anónimo y Autenticado
CREATE POLICY "Allow public select on orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert on orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on orders" ON public.orders FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on orders" ON public.orders FOR DELETE USING (true);

CREATE POLICY "Allow public select on diagnoses" ON public.diagnoses FOR SELECT USING (true);
CREATE POLICY "Allow public insert on diagnoses" ON public.diagnoses FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on diagnoses" ON public.diagnoses FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on diagnoses" ON public.diagnoses FOR DELETE USING (true);
