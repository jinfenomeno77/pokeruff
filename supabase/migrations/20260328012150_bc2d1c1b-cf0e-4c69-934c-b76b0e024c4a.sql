ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS stack integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS reentry_count integer NOT NULL DEFAULT 0;