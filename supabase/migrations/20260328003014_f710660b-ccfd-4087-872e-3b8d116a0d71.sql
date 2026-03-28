ALTER TABLE public.tournament_registrations
  ADD COLUMN IF NOT EXISTS table_number integer DEFAULT NULL;