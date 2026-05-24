-- ============================================================
-- ARTIX MEDIA — Leads RLS Policy Fix
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Ensure Row Level Security is enabled on the leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Step 2: Clean up any outdated or conflicting insert policies
DROP POLICY IF EXISTS "Allow public lead submissions" ON public.leads;
DROP POLICY IF EXISTS "Allow anonymous insert" ON public.leads;
DROP POLICY IF EXISTS "Allow public insert" ON public.leads;

-- Step 3: Create the INSERT-only policy for public (unauthenticated) users
CREATE POLICY "Allow public lead submissions"
ON public.leads
FOR INSERT
TO public
WITH CHECK (true);
