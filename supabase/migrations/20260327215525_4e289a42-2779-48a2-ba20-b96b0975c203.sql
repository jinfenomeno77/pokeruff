
ALTER TABLE public.tournaments
  ADD COLUMN IF NOT EXISTS timer_seconds_left integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS timer_updated_at timestamptz DEFAULT now();

ALTER TABLE public.tournaments REPLICA IDENTITY FULL;
