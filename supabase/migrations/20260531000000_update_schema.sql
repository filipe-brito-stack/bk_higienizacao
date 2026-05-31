-- 1. Remove unused columns from contacts table
ALTER TABLE public.contacts DROP COLUMN IF EXISTS company;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS role;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS status;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS owner;
ALTER TABLE public.contacts DROP COLUMN IF EXISTS avatar_url;

-- 2. Remove unused owner column from deals table
ALTER TABLE public.deals DROP COLUMN IF EXISTS owner;

-- 3. Ensure Row-Level Security (RLS) and grant permissive access for authenticated and anonymous users
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permit all operations for authenticated and anonymous users" ON public.contacts;
CREATE POLICY "Permit all operations for authenticated and anonymous users" ON public.contacts 
    FOR ALL TO public 
    USING (true) 
    WITH CHECK (true);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permit all operations for authenticated and anonymous users" ON public.deals;
CREATE POLICY "Permit all operations for authenticated and anonymous users" ON public.deals 
    FOR ALL TO public 
    USING (true) 
    WITH CHECK (true);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permit all operations for authenticated and anonymous users" ON public.tasks;
CREATE POLICY "Permit all operations for authenticated and anonymous users" ON public.tasks 
    FOR ALL TO public 
    USING (true) 
    WITH CHECK (true);

ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permit all operations for authenticated and anonymous users" ON public.activities;
CREATE POLICY "Permit all operations for authenticated and anonymous users" ON public.activities 
    FOR ALL TO public 
    USING (true) 
    WITH CHECK (true);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permit all operations for authenticated and anonymous users" ON public.goals;
CREATE POLICY "Permit all operations for authenticated and anonymous users" ON public.goals 
    FOR ALL TO public 
    USING (true) 
    WITH CHECK (true);
