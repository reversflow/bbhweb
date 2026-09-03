ALTER TABLE public.artists ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.journal_posts ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.songs ADD COLUMN IF NOT EXISTS translations jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS default_locale text NOT NULL DEFAULT 'fr';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS fallback_locale text NOT NULL DEFAULT 'fr';
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS enabled_locales text[] NOT NULL DEFAULT ARRAY['fr','es','en']::text[];