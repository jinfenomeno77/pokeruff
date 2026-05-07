
-- Create singleton-style table for blind structure config
CREATE TABLE public.blind_structure_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  structure JSONB NOT NULL,
  late_registration_end_index INTEGER NOT NULL DEFAULT 6,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.blind_structure_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blind structure publicly viewable"
ON public.blind_structure_config FOR SELECT
USING (true);

CREATE POLICY "Admins can insert blind structure"
ON public.blind_structure_config FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update blind structure"
ON public.blind_structure_config FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete blind structure"
ON public.blind_structure_config FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime
ALTER TABLE public.blind_structure_config REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blind_structure_config;

-- Seed with current default structure
INSERT INTO public.blind_structure_config (structure, late_registration_end_index)
VALUES (
  '[
    {"level":1,"smallBlind":5,"bigBlind":10,"ante":0,"duration":20},
    {"level":2,"smallBlind":10,"bigBlind":20,"ante":0,"duration":20},
    {"level":3,"smallBlind":15,"bigBlind":30,"ante":0,"duration":20},
    {"level":4,"smallBlind":25,"bigBlind":50,"ante":0,"duration":20},
    {"level":5,"smallBlind":50,"bigBlind":100,"ante":0,"duration":20},
    {"level":0,"smallBlind":0,"bigBlind":0,"ante":0,"duration":10,"isBreak":true},
    {"level":6,"smallBlind":75,"bigBlind":150,"ante":0,"duration":15},
    {"level":7,"smallBlind":100,"bigBlind":200,"ante":0,"duration":15},
    {"level":8,"smallBlind":150,"bigBlind":300,"ante":0,"duration":15},
    {"level":9,"smallBlind":200,"bigBlind":400,"ante":0,"duration":15},
    {"level":10,"smallBlind":250,"bigBlind":500,"ante":0,"duration":15},
    {"level":0,"smallBlind":0,"bigBlind":0,"ante":0,"duration":10,"isBreak":true},
    {"level":11,"smallBlind":300,"bigBlind":600,"ante":0,"duration":15},
    {"level":12,"smallBlind":400,"bigBlind":800,"ante":0,"duration":15},
    {"level":13,"smallBlind":500,"bigBlind":1000,"ante":0,"duration":15},
    {"level":14,"smallBlind":600,"bigBlind":1200,"ante":0,"duration":15},
    {"level":15,"smallBlind":800,"bigBlind":1600,"ante":0,"duration":15},
    {"level":0,"smallBlind":0,"bigBlind":0,"ante":0,"duration":10,"isBreak":true},
    {"level":16,"smallBlind":1000,"bigBlind":2000,"ante":0,"duration":15},
    {"level":17,"smallBlind":1500,"bigBlind":3000,"ante":0,"duration":15},
    {"level":18,"smallBlind":2000,"bigBlind":4000,"ante":0,"duration":15},
    {"level":19,"smallBlind":2500,"bigBlind":5000,"ante":0,"duration":15},
    {"level":20,"smallBlind":3000,"bigBlind":6000,"ante":0,"duration":15},
    {"level":0,"smallBlind":0,"bigBlind":0,"ante":0,"duration":10,"isBreak":true},
    {"level":21,"smallBlind":4000,"bigBlind":8000,"ante":0,"duration":15},
    {"level":22,"smallBlind":5000,"bigBlind":10000,"ante":0,"duration":15}
  ]'::jsonb,
  6
);
