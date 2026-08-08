ALTER TABLE public.artists
  ADD COLUMN IF NOT EXISTS tiktok text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS soundcloud text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS website text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS short_description text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS universe text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS links jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS videos jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hero_media text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_poster text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS booking_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS booking_label text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

DROP POLICY IF EXISTS "artists public read" ON public.artists;
CREATE POLICY "artists public read" ON public.artists
  FOR SELECT TO anon, authenticated
  USING (published = true OR has_role(auth.uid(), 'admin'::app_role));