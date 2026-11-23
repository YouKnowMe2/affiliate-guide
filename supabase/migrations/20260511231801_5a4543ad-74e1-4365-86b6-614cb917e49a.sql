-- Cache version singleton table for on-demand revalidation
CREATE TABLE IF NOT EXISTS public.cache_version (
  id INTEGER PRIMARY KEY DEFAULT 1,
  version BIGINT NOT NULL DEFAULT EXTRACT(EPOCH FROM now())::BIGINT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT,
  CONSTRAINT cache_version_singleton CHECK (id = 1)
);

INSERT INTO public.cache_version (id, version) VALUES (1, EXTRACT(EPOCH FROM now())::BIGINT)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.cache_version ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Cache version is publicly readable" ON public.cache_version;
CREATE POLICY "Cache version is publicly readable"
  ON public.cache_version FOR SELECT
  USING (true);

ALTER TABLE public.cache_version REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cache_version;