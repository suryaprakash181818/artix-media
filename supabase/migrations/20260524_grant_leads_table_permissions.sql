-- ============================================================
-- ARTIX MEDIA — Leads Table Permissions Grant
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Grant INSERT privileges on the leads table to unauthenticated (anon) and authenticated roles
GRANT INSERT ON TABLE public.leads TO anon;
GRANT INSERT ON TABLE public.leads TO authenticated;

-- Ensure service_role (used by Edge Functions / Admin) has full access
GRANT ALL ON TABLE public.leads TO service_role;
GRANT ALL ON TABLE public.leads TO postgres;
