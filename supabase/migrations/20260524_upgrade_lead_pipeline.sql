-- ============================================================
-- ARTIX MEDIA — Lead Pipeline Upgrade Migration
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Step 1: Add phone and preferred_contact columns to the leads table
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS phone text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS preferred_contact text DEFAULT NULL;

-- Step 2: Add status column if it does not exist, and set the default to 'pending'
ALTER TABLE public.leads
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Step 3: Transition any existing 'new' statuses to 'pending'
UPDATE public.leads
SET status = 'pending'
WHERE status = 'new';

-- Step 4: Ensure the default status is 'pending'
ALTER TABLE public.leads
ALTER COLUMN status SET DEFAULT 'pending';

-- Step 5: Add constraint for allowed status values
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads
ADD CONSTRAINT leads_status_check CHECK (status IN ('pending', 'contacted', 'accepted', 'declined'));
