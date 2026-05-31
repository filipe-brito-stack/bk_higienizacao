-- Supabase Migration: 20260530000000_initial_schema.sql
-- Description: Create core tables for CRM (contacts, deals, tasks, activities, goals, profile) and populates initial values.

-- 1. Enable UUID Extension if not already active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Profiles Table (user settings & details)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Create Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    last_contact TEXT,
    phone TEXT,
    birth_month TEXT,
    birth_year TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Create Deals Table
CREATE TABLE IF NOT EXISTS public.deals (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    service_description TEXT NOT NULL,
    value DOUBLE PRECISION NOT NULL DEFAULT 0,
    cost DOUBLE PRECISION NOT NULL DEFAULT 0,
    stage TEXT NOT NULL CHECK (stage IN ('Proposta', 'Agendado', 'Realizado')),
    date TEXT NOT NULL,
    owner TEXT DEFAULT 'Alex',
    photo_before TEXT,
    photo_after TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    associated_with TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    priority TEXT NOT NULL CHECK (priority IN ('Urgent', 'Medium', 'Low')),
    due_date TEXT NOT NULL,
    value DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Create Activities Table
CREATE TABLE IF NOT EXISTS public.activities (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('closed', 'email', 'contact', 'call')),
    title TEXT NOT NULL,
    sub TEXT,
    time TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. Create Goals Table (singleton dashboard-wide settings)
CREATE TABLE IF NOT EXISTS public.goals (
    id TEXT PRIMARY KEY DEFAULT 'singleton' CHECK (id = 'singleton'),
    monthly_revenue_target DOUBLE PRECISION NOT NULL DEFAULT 10000,
    monthly_revenue_reached DOUBLE PRECISION NOT NULL DEFAULT 4600,
    new_customers_target DOUBLE PRECISION NOT NULL DEFAULT 8,
    new_customers_reached DOUBLE PRECISION NOT NULL DEFAULT 3,
    lead_quality_score DOUBLE PRECISION NOT NULL DEFAULT 94,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Indexes for Optimized Reads
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON public.tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

-- 9. Row Level Security Policies
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create Open/Permissive Policies for local/applet environments
-- Note: In extremely secure enterprise setups other rules might restrict. Here we ensure full app access.
CREATE POLICY "Permit all operations for authenticated and anonymous users" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permit all operations for authenticated and anonymous users" ON public.contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permit all operations for authenticated and anonymous users" ON public.deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permit all operations for authenticated and anonymous users" ON public.tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permit all operations for authenticated and anonymous users" ON public.activities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permit all operations for authenticated and anonymous users" ON public.goals FOR ALL USING (true) WITH CHECK (true);

-- 10. Seed Initial Data (Only if empty)
-- Profile
INSERT INTO public.profiles (id, name, avatar_url)
VALUES ('bruno', 'Bruno Kawaguchi', '/bruno_profile_pic.png')
ON CONFLICT (id) DO NOTHING;

-- Goals
INSERT INTO public.goals (id, monthly_revenue_target, monthly_revenue_reached, new_customers_target, new_customers_reached, lead_quality_score)
VALUES ('singleton', 10000, 4600, 8, 3, 94)
ON CONFLICT (id) DO NOTHING;

-- Contacts
INSERT INTO public.contacts (id, name, email, last_contact, phone)
VALUES 
('c1', 'Jane Doe', 'jane.doe@acme.corp', 'Há 2 horas', '+1 (555) 234-5678'),
('c4', 'Robert King', 'robert@fincloud.biz', '08 de Out, 2023', '+1 (555) 987-6543')
ON CONFLICT (id) DO NOTHING;

-- Deals
INSERT INTO public.deals (id, client_name, service_description, value, cost, stage, date, owner)
VALUES 
('d1', 'Jane Doe', 'Higienização Completa de Sofá de Canto', 450, 80, 'Proposta', '2026-05-24', 'Alex'),
('d2', 'Robert King', 'Impermeabilização de Estofados', 600, 150, 'Realizado', '2026-05-23', 'Sarah Miller'),
('d6', 'Robert King', 'Higienização de Poltronas e Cadeiras', 950, 160, 'Realizado', '2026-05-24', 'Alex')
ON CONFLICT (id) DO NOTHING;

-- Tasks
INSERT INTO public.tasks (id, title, associated_with, completed, priority, due_date)
VALUES 
('t1', 'Enviar proposta final de higienização', 'Jane Doe', false, 'Urgent', '2026-05-31'),
('t2', 'Confirmar recebimento do pagamento', 'Robert King', true, 'Medium', '2026-05-28'),
('t4', 'Ligar pós-venda para avaliação de satisfação', 'Robert King', true, 'Medium', '2026-05-29')
ON CONFLICT (id) DO NOTHING;

-- Activities
INSERT INTO public.activities (id, type, title, sub, time)
VALUES 
('a1', 'closed', 'Serviço Concluído: Robert King', 'Impermeabilização de Estofados finalizado e aprovado', 'Há 1 hora'),
('a2', 'contact', 'Mensagem WhatsApp enviada', 'Enviado link de agendamento para Jane Doe', 'Há 5 horas')
ON CONFLICT (id) DO NOTHING;
