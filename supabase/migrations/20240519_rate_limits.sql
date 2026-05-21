-- Migration: Create rate_limits table for Edge Function IP-based rate limiting
-- Run this in: Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip           text NOT NULL,
  endpoint     text NOT NULL,
  count        integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now(),
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by IP + endpoint + window
CREATE INDEX IF NOT EXISTS rate_limits_ip_endpoint_window_idx
  ON public.rate_limits (ip, endpoint, window_start);

-- Auto-cleanup: delete rows older than 2 hours to keep table lean
-- (Optional: set up a pg_cron job or Supabase scheduled function)
-- DELETE FROM rate_limits WHERE window_start < now() - interval '2 hours';

-- RLS: Edge Function uses service role key, no RLS needed
-- But disable public access just in case
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies — only service role key can access
