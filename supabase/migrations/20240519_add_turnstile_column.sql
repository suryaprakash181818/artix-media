-- ============================================================
-- ARTIX MEDIA — Turnstile Column Migration
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Add cf_turnstile_response column (idempotent — safe to run multiple times)
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS cf_turnstile_response text DEFAULT NULL;

-- Step 2: Verify column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name   = 'leads'
ORDER BY ordinal_position;
