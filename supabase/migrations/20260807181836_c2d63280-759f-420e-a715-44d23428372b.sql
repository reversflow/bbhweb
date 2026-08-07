-- 1. Media library: videos + library items
ALTER TABLE public.site_images
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image',
  ADD COLUMN IF NOT EXISTS mime_type text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS poster_path text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS duration_seconds numeric,
  ADD COLUMN IF NOT EXISTS width integer,
  ADD COLUMN IF NOT EXISTS height integer,
  ADD COLUMN IF NOT EXISTS file_size bigint,
  ADD COLUMN IF NOT EXISTS is_library boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS site_images_library_idx ON public.site_images (is_library, created_at DESC);

-- 2. Events: block layout + hero video
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS hero_video text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS hero_video_poster text NOT NULL DEFAULT '';

-- 3. Journal: blocks, video, feed metadata
ALTER TABLE public.journal_posts
  ADD COLUMN IF NOT EXISTS blocks jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_poster text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tags text[] NOT NULL DEFAULT '{}';

-- 4. Songs: optional video
ALTER TABLE public.songs
  ADD COLUMN IF NOT EXISTS video_url text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS video_poster text NOT NULL DEFAULT '';

-- 5. Relational connections between content types
CREATE TABLE IF NOT EXISTS public.content_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type text NOT NULL CHECK (source_type IN ('event','artist','song','journal')),
  source_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('event','artist','song','journal')),
  target_id uuid NOT NULL,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_type, source_id, target_type, target_id)
);

GRANT SELECT ON public.content_links TO anon;
GRANT SELECT ON public.content_links TO authenticated;
GRANT ALL ON public.content_links TO service_role;

ALTER TABLE public.content_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "content_links_public_read"
  ON public.content_links FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS content_links_source_idx ON public.content_links (source_type, source_id);
CREATE INDEX IF NOT EXISTS content_links_target_idx ON public.content_links (target_type, target_id);