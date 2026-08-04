-- =========================
-- site_settings (singleton)
-- =========================
CREATE TABLE public.site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  site_name text NOT NULL DEFAULT 'BBH Association',
  base_url text NOT NULL DEFAULT 'https://bbhweb.lovable.app',
  tagline text NOT NULL DEFAULT '',
  default_description text NOT NULL DEFAULT '',
  ai_summary text NOT NULL DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}'::text[],
  twitter_handle text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  locality text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'FR',
  social_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  google_site_verification text NOT NULL DEFAULT '',
  bing_site_verification text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = 1)
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "site_settings public read"
  ON public.site_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "site_settings admin insert"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "site_settings admin update"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "site_settings admin delete"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_settings_set_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- seo_pages
-- =========================
CREATE TABLE public.seo_pages (
  page_key text PRIMARY KEY,
  path text NOT NULL,
  label text NOT NULL DEFAULT '',
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  og_title text NOT NULL DEFAULT '',
  og_description text NOT NULL DEFAULT '',
  ai_summary text NOT NULL DEFAULT '',
  keywords text[] NOT NULL DEFAULT '{}'::text[],
  noindex boolean NOT NULL DEFAULT false,
  priority numeric(2,1) NOT NULL DEFAULT 0.6,
  changefreq text NOT NULL DEFAULT 'monthly',
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.seo_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.seo_pages TO authenticated;
GRANT ALL ON public.seo_pages TO service_role;

ALTER TABLE public.seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "seo_pages public read"
  ON public.seo_pages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "seo_pages admin insert"
  ON public.seo_pages FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "seo_pages admin update"
  ON public.seo_pages FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "seo_pages admin delete"
  ON public.seo_pages FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER seo_pages_set_updated_at
  BEFORE UPDATE ON public.seo_pages
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========================
-- Valeurs de départ
-- =========================
INSERT INTO public.site_settings (
  id, site_name, base_url, tagline, default_description, ai_summary, keywords,
  contact_email, locality, region, country
) VALUES (
  1,
  'BBH Association',
  'https://bbhweb.lovable.app',
  'Élever la culture urbaine',
  'BBH Association crée des événements, ateliers et projets culturels autour du rap et de la musique en Hauts-de-France.',
  'BBH Association est une association culturelle indépendante des Hauts-de-France (France) dédiée à la culture urbaine. Elle organise des événements live (BBH LIVE, open mics, showcases), anime des ateliers d''écriture rap et d''initiation au studio, accompagne des artistes émergents et publie la musique et le journal de l''artiste REVERSEFLOW.',
  ARRAY['association culture urbaine','rap Hauts-de-France','atelier écriture rap','showcase rap Lille','BBH Association','Reverseflow'],
  'reversflowstudio@gmail.com',
  'Lille',
  'Hauts-de-France',
  'FR'
);

INSERT INTO public.seo_pages (page_key, path, label, title, description, og_title, og_description, ai_summary, keywords, priority, changefreq, sort_order) VALUES
('home', '/', 'Accueil',
 'BBH Association — Élever la culture urbaine',
 'Association culture urbaine en Hauts-de-France : événements live, ateliers d''écriture rap, accompagnement d''artistes et projets musicaux.',
 'BBH Association — Élever la culture urbaine',
 'Événements, ateliers, artistes et projets culturels autour du rap et de la musique.',
 'Page d''accueil de BBH Association : présentation du mouvement, chiffres clés, piliers (événements live, ateliers créatifs, réseau d''artistes) et accès aux événements et au roster.',
 ARRAY['association culture urbaine','rap Hauts-de-France','BBH Association'], 1.0, 'weekly', 10),
('events', '/evenements', 'Événements',
 'Événements BBH — Shows, open mics & showcases',
 'Tous les événements BBH : BBH LIVE, open mics, showcases et rencontres autour de la culture urbaine en Hauts-de-France.',
 'Événements BBH — Shows, open mics & showcases',
 'Shows, open mics, showcases et rencontres autour de la culture urbaine.',
 'Programmation de BBH Association : prochains événements, format signature BBH LIVE, archives des soirées passées et raisons de venir.',
 ARRAY['concert rap Lille','open mic Hauts-de-France','showcase rap'], 0.9, 'weekly', 20),
('workshops', '/ateliers', 'Ateliers',
 'Ateliers BBH — Rap, écriture, studio & expression',
 'Ateliers d''écriture rap, initiation à l''enregistrement, expression artistique et accompagnement d''artistes pour écoles, MJC et structures culturelles.',
 'Ateliers BBH — Rap, écriture & studio',
 'Des ateliers accessibles et concrets pour accompagner les jeunes et les artistes émergents.',
 'Ateliers proposés par BBH Association : écriture rap, initiation à l''enregistrement en studio, expression artistique et accompagnement d''artistes. Formats ponctuels, cycles ou interventions sur mesure pour écoles, MJC, centres sociaux et collectivités.',
 ARRAY['atelier écriture rap','atelier studio musique','intervention scolaire rap'], 0.8, 'monthly', 30),
('artists', '/artistes', 'Artistes',
 'Artistes BBH — Le roster',
 'Le roster BBH : REVERSEFLOW et les artistes accompagnés par l''association autour de la scène urbaine indépendante.',
 'Artistes BBH — Le roster',
 'Découvre les artistes accompagnés par BBH Association.',
 'Roster de BBH Association. Artiste principal : REVERSEFLOW, rappeur et auteur-compositeur des Hauts-de-France.',
 ARRAY['artiste rap indépendant','Reverseflow','roster BBH'], 0.8, 'weekly', 40),
('music', '/musique', 'Musique',
 'Musique de REVERSEFLOW — Écoute & archive · BBH',
 'Écoute les morceaux de REVERSEFLOW : sorties, archive complète, paroles, crédits et lecteur audio intégré.',
 'REVERSEFLOW — Musique',
 'Écoute les morceaux de REVERSEFLOW : sorties, archive et lecteur intégré.',
 'Catalogue musical de REVERSEFLOW hébergé par BBH Association : morceau à la une, archive des sorties, écoute en ligne, paroles et crédits.',
 ARRAY['Reverseflow musique','écouter rap français','nouveau son rap'], 0.9, 'weekly', 50),
('journal', '/journal', 'Journal',
 'Journal de REVERSEFLOW — Studio, sessions & coulisses · BBH',
 'Le carnet de bord de REVERSEFLOW : sessions studio, coulisses, dates, inspirations et annonces de sorties.',
 'Journal de REVERSEFLOW',
 'Sessions studio, coulisses, dates et inspirations.',
 'Journal d''artiste de REVERSEFLOW publié par BBH Association : billets sur les sessions studio, les coulisses, les dates de concert et les sorties.',
 ARRAY['journal artiste rap','coulisses studio rap','Reverseflow actualité'], 0.7, 'weekly', 60),
('about', '/a-propos', 'À propos',
 'À propos — BBH Association',
 'L''histoire, la vision, les missions et les valeurs de BBH Association, association de culture urbaine des Hauts-de-France.',
 'À propos de BBH Association',
 'Créer nos propres espaces pour la culture urbaine.',
 'Présentation de BBH Association : origine du projet, vision (connecter artistes, lieux et publics), missions (scènes, accompagnement, ateliers, communauté) et valeurs.',
 ARRAY['association culturelle Hauts-de-France','culture urbaine association'], 0.6, 'monthly', 70),
('contact', '/contact', 'Contact',
 'Contact & partenariats — BBH Association',
 'Contacte BBH Association pour un événement, un atelier, un partenariat ou un accompagnement artistique.',
 'Contact — BBH Association',
 'Artiste, lieu, école ou partenaire : construisons quelque chose ensemble.',
 'Page de contact de BBH Association pour les demandes d''événements, d''ateliers, de partenariats et d''accompagnement artistique.',
 ARRAY['contact association rap','partenariat culturel Hauts-de-France'], 0.5, 'yearly', 80);