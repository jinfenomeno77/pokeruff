
-- Add player_name column for manual entries in past tournaments
ALTER TABLE public.tournament_registrations ADD COLUMN IF NOT EXISTS player_name text;

-- Make user_id nullable so we can have manual entries without a real user
ALTER TABLE public.tournament_registrations ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS: allow admins to insert registrations (for manual entries)
DROP POLICY IF EXISTS "Users can register themselves" ON public.tournament_registrations;

CREATE POLICY "Users and admins can insert registrations"
  ON public.tournament_registrations FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role)
  );
