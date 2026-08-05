
-- ========== EVENTS ==========
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  short_description text NOT NULL DEFAULT '',
  full_description text NOT NULL DEFAULT '',
  event_type text NOT NULL DEFAULT 'concert',
  status text NOT NULL DEFAULT 'upcoming',
  featured boolean NOT NULL DEFAULT false,
  start_date date,
  end_date date,
  start_time text NOT NULL DEFAULT '',
  end_time text NOT NULL DEFAULT '',
  venue_name text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'FR',
  latitude numeric,
  longitude numeric,
  ticket_price numeric,
  currency text NOT NULL DEFAULT 'EUR',
  is_free boolean NOT NULL DEFAULT false,
  ticket_url text NOT NULL DEFAULT '',
  registration_url text NOT NULL DEFAULT '',
  main_image text NOT NULL DEFAULT '',
  poster_image text NOT NULL DEFAULT '',
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_alt text NOT NULL DEFAULT '',
  artists text[] NOT NULL DEFAULT '{}'::text[],
  organizer text NOT NULL DEFAULT 'BBH Association',
  partners text[] NOT NULL DEFAULT '{}'::text[],
  capacity integer,
  contact_email text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  social_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_label text NOT NULL DEFAULT '',
  cta_url text NOT NULL DEFAULT '',
  seo_title text NOT NULL DEFAULT '',
  seo_description text NOT NULL DEFAULT '',
  ai_summary text NOT NULL DEFAULT '',
  og_image text NOT NULL DEFAULT '',
  noindex boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events public read published" ON public.events
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "events admin read all" ON public.events
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "events admin insert" ON public.events
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "events admin update" ON public.events
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "events admin delete" ON public.events
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER events_set_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ========== EVENT SLUG REDIRECTS ==========
CREATE TABLE public.event_redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  old_slug text NOT NULL UNIQUE,
  event_id uuid NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.event_redirects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.event_redirects TO authenticated;
GRANT ALL ON public.event_redirects TO service_role;

ALTER TABLE public.event_redirects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_redirects public read" ON public.event_redirects
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "event_redirects admin write" ON public.event_redirects
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========== SITE CONTENT ==========
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,
  section_key text NOT NULL DEFAULT '',
  content_key text NOT NULL UNIQUE,
  content_type text NOT NULL DEFAULT 'text',
  text_value text NOT NULL DEFAULT '',
  link_value text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

GRANT SELECT ON public.site_content TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "site_content public read" ON public.site_content
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "site_content admin write" ON public.site_content
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_content_set_updated_at BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ========== NAVIGATION / FOOTER ==========
CREATE TABLE public.nav_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL DEFAULT 'header',
  label text NOT NULL,
  url text NOT NULL,
  external boolean NOT NULL DEFAULT false,
  new_tab boolean NOT NULL DEFAULT false,
  enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.nav_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nav_links TO authenticated;
GRANT ALL ON public.nav_links TO service_role;

ALTER TABLE public.nav_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nav_links public read" ON public.nav_links
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "nav_links admin write" ON public.nav_links
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER nav_links_set_updated_at BEFORE UPDATE ON public.nav_links
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ========== SEED: EVENTS ==========
INSERT INTO public.events (slug, title, short_description, full_description, event_type, status, featured, start_date, venue_name, city, country, main_image, artists, published, sort_order) VALUES
('bbh-live-vol-2-lille-wazemmes', 'BBH LIVE Vol.2 — Lille Wazemmes',
 'Showcases internationaux, ambiance urbaine et artistes indépendants réunis autour de la scène BBH.',
 'BBH LIVE revient pour un deuxième volume à Lille Wazemmes. Une soirée pensée pour la scène : showcases internationaux, artistes indépendants et une ambiance urbaine intime et énergique.',
 'concert', 'upcoming', true, '2026-06-11', 'W Bar Terrasse', 'Lille', 'FR', 'events_upcoming_1', ARRAY['REVERSEFLOW'], true, 1),
('reverseflow-showcase', 'Reverseflow Showcase',
 'Performance live autour de l''univers Reverseflow et de la scène BBH.',
 'Un showcase entièrement dédié à l''univers Reverseflow : live, échanges avec le public et découverte de la scène BBH.',
 'showcase', 'upcoming', false, '2026-05-22', '', 'Maubeuge', 'FR', 'events_upcoming_2', ARRAY['REVERSEFLOW'], true, 2),
('bbh-live-vol-1-maubeuge', 'BBH LIVE Vol.1 — Maubeuge',
 'Le tout premier BBH LIVE, à Maubeuge.', 'Première édition du format signature BBH LIVE, organisée à Maubeuge.',
 'concert', 'past', false, NULL, '', 'Maubeuge', 'FR', 'events_past_1', ARRAY['REVERSEFLOW'], true, 3),
('open-mic-bbh', 'Open Mic BBH', 'Scène ouverte aux artistes de la région.',
 'Une scène ouverte où chaque artiste peut venir poser son texte devant un public bienveillant.',
 'open-mic', 'past', false, NULL, '', '', 'FR', 'events_past_2', '{}'::text[], true, 4),
('rencontre-artistes-independants', 'Rencontre artistes indépendants',
 'Un temps d''échange entre artistes indépendants de la scène urbaine.',
 'Rencontre professionnelle et humaine entre artistes indépendants : partage d''expérience, réseau et conseils.',
 'rencontre', 'past', false, NULL, '', '', 'FR', 'events_past_3', '{}'::text[], true, 5);

-- ========== SEED: NAV LINKS ==========
INSERT INTO public.nav_links (location, label, url, sort_order) VALUES
('header', 'Accueil', '/', 1),
('header', 'Musique', '/musique', 2),
('header', 'Événements', '/evenements', 3),
('header', 'Ateliers', '/ateliers', 4),
('header', 'Artistes', '/artistes', 5),
('header', 'Journal', '/journal', 6),
('header', 'À propos', '/a-propos', 7),
('header', 'Contact', '/contact', 8),
('footer', 'Musique', '/musique', 1),
('footer', 'Événements', '/evenements', 2),
('footer', 'Ateliers', '/ateliers', 3),
('footer', 'Artistes', '/artistes', 4),
('footer', 'Journal', '/journal', 5),
('footer', 'À propos', '/a-propos', 6),
('footer', 'Contact', '/contact', 7);

-- ========== SEED: SITE CONTENT ==========
INSERT INTO public.site_content (page_key, section_key, content_key, content_type, text_value, link_value, sort_order) VALUES
('home','hero','home.hero.eyebrow','text','Association culturelle · Hauts-de-France','',1),
('home','hero','home.hero.title','text','BBH Association','',2),
('home','hero','home.hero.subtitle','text','Élever la culture urbaine','',3),
('home','hero','home.hero.intro','richtext','Événements, ateliers et projets culturels autour du rap et de la musique.','',4),
('home','hero','home.hero.primary_button','link','Découvrir','/musique',5),
('home','hero','home.hero.secondary_button','link','Nous contacter','/contact',6),
('events','hero','events.hero.eyebrow','text','Programmation','',1),
('events','hero','events.hero.title','text','Événements BBH','',2),
('events','hero','events.hero.subtitle','text','Shows, open mics, showcases et rencontres autour de la culture urbaine.','',3),
('events','featured','events.featured.title','text','BBH LIVE','',4),
('events','featured','events.featured.description','richtext','Un format pensé pour faire découvrir des artistes indépendants dans une ambiance intime, énergique et authentique.','',5),
('events','upcoming','events.upcoming.title','text','Prochains événements','',6),
('events','upcoming','events.upcoming.empty','text','Aucun événement à venir pour le moment.','',7),
('events','past','events.past.title','text','Événements passés','',8),
('workshops','hero','workshops.hero.eyebrow','text','Transmission','',1),
('workshops','hero','workshops.hero.title','text','Ateliers BBH','',2),
('workshops','hero','workshops.hero.subtitle','text','Écriture, enregistrement, expression et accompagnement artistique.','',3),
('artists','hero','artists.hero.eyebrow','text','Le collectif','',1),
('artists','hero','artists.hero.title','text','Artistes BBH','',2),
('artists','hero','artists.hero.subtitle','text','La scène qui fait vivre le mouvement.','',3),
('music','hero','music.hero.eyebrow','text','Reverseflow','',1),
('music','hero','music.hero.title','text','Musique','',2),
('music','hero','music.hero.subtitle','text','Sorties, morceaux et univers sonore de la scène BBH.','',3),
('journal','hero','journal.hero.eyebrow','text','Journal','',1),
('journal','hero','journal.hero.title','text','Le journal BBH','',2),
('journal','hero','journal.hero.description','richtext','Coulisses, réflexions et actualités du collectif.','',3),
('about','hero','about.hero.eyebrow','text','Notre histoire','',1),
('about','hero','about.hero.title','text','À propos','',2),
('about','mission','about.mission.title','text','Notre mission','',3),
('contact','hero','contact.hero.eyebrow','text','Écrivez-nous','',1),
('contact','hero','contact.hero.title','text','Contact','',2),
('contact','hero','contact.hero.subtitle','text','Partenariats, ateliers, programmation : parlons-en.','',3),
('global','footer','global.footer.cta_title','text','Rejoignez le mouvement BBH','',1),
('global','footer','global.footer.cta_button','link','Nous contacter','/contact',2);
