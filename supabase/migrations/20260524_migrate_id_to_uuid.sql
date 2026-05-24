-- ============================================================
-- ARTIX MEDIA — Leads ID Column BIGINT to UUID Migration
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Enable pgcrypto extension for UUID generation functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Add a temporary uuid column
ALTER TABLE public.leads ADD COLUMN id_uuid uuid DEFAULT gen_random_uuid();

-- Step 3: Ensure all existing rows have a generated UUID
UPDATE public.leads SET id_uuid = gen_random_uuid() WHERE id_uuid IS NULL;

-- Step 4: Drop the existing primary key constraint on the bigint id column
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_pkey CASCADE;

-- Step 5: Drop the old bigint id column
ALTER TABLE public.leads DROP COLUMN id;

-- Step 6: Rename the temporary uuid column to id
ALTER TABLE public.leads RENAME COLUMN id_uuid TO id;

-- Step 7: Set the new uuid id column as the Primary Key
ALTER TABLE public.leads ADD PRIMARY KEY (id);

-- Step 8: Ensure new inserts automatically get a generated UUID if not provided
ALTER TABLE public.leads ALTER COLUMN id SET DEFAULT gen_random_uuid();
