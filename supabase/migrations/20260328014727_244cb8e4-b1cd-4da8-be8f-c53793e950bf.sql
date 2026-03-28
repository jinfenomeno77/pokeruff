-- Allow users to update their own registration (stack field)
CREATE POLICY "Users can update own registration"
ON public.tournament_registrations
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable realtime on tournament_registrations
ALTER PUBLICATION supabase_realtime ADD TABLE tournament_registrations;