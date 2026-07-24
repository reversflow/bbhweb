
-- 1. Table
CREATE TABLE public.site_images (
  slot text PRIMARY KEY,
  storage_path text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  object_position text NOT NULL DEFAULT 'center center',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

-- 2. Grants
GRANT SELECT ON public.site_images TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_images TO authenticated;
GRANT ALL ON public.site_images TO service_role;

-- 3. RLS
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

-- 4. Policies
CREATE POLICY "site_images public read"
  ON public.site_images FOR SELECT
  USING (true);

CREATE POLICY "site_images admin insert"
  ON public.site_images FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "site_images admin update"
  ON public.site_images FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "site_images admin delete"
  ON public.site_images FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 5. updated_at trigger
CREATE TRIGGER site_images_set_updated_at
  BEFORE UPDATE ON public.site_images
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 6. Storage policies on the private `site-images` bucket
CREATE POLICY "site-images admin read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "site-images admin insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "site-images admin update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "site-images admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-images' AND public.has_role(auth.uid(), 'admin'));
