CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.manutencao_keep_alive (
  executado_em timestamp with time zone NOT NULL DEFAULT now()
);

REVOKE ALL ON public.manutencao_keep_alive FROM anon, authenticated;
GRANT ALL ON public.manutencao_keep_alive TO service_role;

ALTER TABLE public.manutencao_keep_alive ENABLE ROW LEVEL SECURITY;

SELECT cron.schedule(
  'keep-alive-diario',
  '17 3 * * *',
  $$INSERT INTO public.manutencao_keep_alive (executado_em) VALUES (now());$$
);

SELECT cron.schedule(
  'keep-alive-limpeza-semanal',
  '40 3 * * 0',
  $$DELETE FROM public.manutencao_keep_alive WHERE executado_em < now() - interval '14 days';$$
);