import heroBbhLive from "@/assets/hero-bbh-live.jpg";
import cardScenes from "@/assets/card-scenes.jpg";
import cardAteliers from "@/assets/card-ateliers.jpg";
import cardArtistes from "@/assets/card-artistes.jpg";

/**
 * Central registry of every editable image on the site.
 * Each entry has a stable `slot` key stored in `public.site_images`.
 * Adding a new editable image = add an entry here + use the slot in the page.
 */

export const MEDIA_GROUPS = [
  { key: "accueil", label: "Accueil", path: "/" },
  { key: "evenements", label: "Événements", path: "/evenements" },
  { key: "ateliers", label: "Ateliers", path: "/ateliers" },
  { key: "artistes", label: "Artistes", path: "/artistes" },
  { key: "musique", label: "Musique", path: "/musique" },
  { key: "journal", label: "Journal", path: "/journal" },
  { key: "a-propos", label: "À propos", path: "/a-propos" },
  { key: "contact", label: "Contact", path: "/contact" },
  { key: "identite", label: "Identité visuelle", path: "—" },
  { key: "seo", label: "Images SEO & réseaux sociaux", path: "—" },
] as const;

export type MediaGroupKey = (typeof MEDIA_GROUPS)[number]["key"];

export type MediaSlotDef = {
  slot: string;
  group: MediaGroupKey;
  label: string;
  hint: string;
  aspect: string;
  defaultAlt: string;
  /** Bundled image used when no custom image is uploaded. */
  fallback?: string;
  /** Purely decorative background: alt stays empty on the site. */
  decorative?: boolean;
};

export const MEDIA_SLOTS: MediaSlotDef[] = [
  /* ---------------- Accueil ---------------- */
  {
    slot: "home_hero",
    group: "accueil",
    label: "Hero — BBH LIVE Vol.2",
    hint: "Grande carte portrait de la page d'accueil.",
    aspect: "aspect-[4/5]",
    fallback: heroBbhLive,
    defaultAlt: "BBH LIVE — scène rap éclairée en bleu et violet",
  },
  {
    slot: "home_card_scenes",
    group: "accueil",
    label: "Card — Scènes & showcases",
    hint: "Première carte de la rangée sous le hero.",
    aspect: "aspect-[5/6]",
    fallback: cardScenes,
    defaultAlt: "Public d'un showcase BBH LIVE dans les Hauts-de-France",
  },
  {
    slot: "home_card_ateliers",
    group: "accueil",
    label: "Card — Ateliers",
    hint: "Deuxième carte de la rangée sous le hero.",
    aspect: "aspect-[5/6]",
    fallback: cardAteliers,
    defaultAlt: "Séance d'atelier d'écriture rap en studio",
  },
  {
    slot: "home_card_artistes",
    group: "accueil",
    label: "Card — Artistes BBH",
    hint: "Troisième carte de la rangée sous le hero.",
    aspect: "aspect-[5/6]",
    fallback: cardArtistes,
    defaultAlt: "Portrait éditorial d'un artiste du roster BBH",
  },

  /* ---------------- Événements ---------------- */
  {
    slot: "events_hero",
    group: "evenements",
    label: "Bandeau de tête — Événements",
    hint: "Image de fond du haut de page. Vide = dégradé actuel conservé.",
    aspect: "aspect-[16/7]",
    defaultAlt: "Concert rap organisé par BBH Association",
    decorative: true,
  },
  {
    slot: "events_featured_bbhlive",
    group: "evenements",
    label: "Format phare — BBH LIVE",
    hint: "Grande carte portrait de la section « À la une ».",
    aspect: "aspect-[4/5]",
    defaultAlt: "Soirée BBH LIVE, format signature de l'association",
  },
  {
    slot: "events_upcoming_1",
    group: "evenements",
    label: "Prochain événement 1 — BBH LIVE Vol.2",
    hint: "Visuel de la première carte « Prochains événements ».",
    aspect: "aspect-[16/10]",
    defaultAlt: "Affiche du BBH LIVE Vol.2 à Lille Wazemmes",
  },
  {
    slot: "events_upcoming_2",
    group: "evenements",
    label: "Prochain événement 2 — Reverseflow Showcase",
    hint: "Visuel de la deuxième carte « Prochains événements ».",
    aspect: "aspect-[16/10]",
    defaultAlt: "Affiche du showcase Reverseflow à Maubeuge",
  },
  {
    slot: "events_past_1",
    group: "evenements",
    label: "Archive 1 — BBH LIVE Vol.1",
    hint: "Première carte des événements passés.",
    aspect: "aspect-[4/5]",
    defaultAlt: "BBH LIVE Vol.1 à Maubeuge",
  },
  {
    slot: "events_past_2",
    group: "evenements",
    label: "Archive 2 — Open Mic BBH",
    hint: "Deuxième carte des événements passés.",
    aspect: "aspect-[4/5]",
    defaultAlt: "Open Mic BBH, scène ouverte aux artistes émergents",
  },
  {
    slot: "events_past_3",
    group: "evenements",
    label: "Archive 3 — Rencontre artistes",
    hint: "Troisième carte des événements passés.",
    aspect: "aspect-[4/5]",
    defaultAlt: "Rencontre d'artistes indépendants organisée par BBH",
  },

  /* ---------------- Ateliers ---------------- */
  {
    slot: "workshops_hero",
    group: "ateliers",
    label: "Bandeau de tête — Ateliers",
    hint: "Image de fond du haut de page. Vide = dégradé actuel conservé.",
    aspect: "aspect-[16/7]",
    defaultAlt: "Atelier d'écriture rap animé par BBH Association",
    decorative: true,
  },

  /* ---------------- Artistes ---------------- */
  {
    slot: "artists_hero",
    group: "artistes",
    label: "Bandeau de tête — Artistes",
    hint: "Image de fond du haut de page. Vide = dégradé actuel conservé.",
    aspect: "aspect-[16/7]",
    defaultAlt: "Roster d'artistes de BBH Association",
    decorative: true,
  },
  {
    slot: "artist_reverseflow",
    group: "artistes",
    label: "Portrait — REVERSEFLOW",
    hint: "Photo affichée sur la fiche du roster.",
    aspect: "aspect-square",
    fallback: cardArtistes,
    defaultAlt: "Portrait de REVERSEFLOW, fondateur de BBH Association",
  },

  /* ---------------- Musique ---------------- */
  {
    slot: "music_hero",
    group: "musique",
    label: "Bandeau de tête — Musique",
    hint: "Image de fond du haut de page. Vide = dégradé actuel conservé.",
    aspect: "aspect-[16/7]",
    defaultAlt: "Sorties musicales de REVERSEFLOW et du label BBH",
    decorative: true,
  },

  /* ---------------- Journal ---------------- */
  {
    slot: "journal_hero",
    group: "journal",
    label: "Bandeau de tête — Journal",
    hint: "Image de fond du haut de page. Vide = dégradé actuel conservé.",
    aspect: "aspect-[16/7]",
    defaultAlt: "Coulisses et carnet de bord des artistes BBH",
    decorative: true,
  },

  /* ---------------- À propos ---------------- */
  {
    slot: "about_hero",
    group: "a-propos",
    label: "Bandeau de tête — À propos",
    hint: "Image de fond du haut de page. Vide = dégradé actuel conservé.",
    aspect: "aspect-[16/7]",
    defaultAlt: "L'équipe de BBH Association en événement",
    decorative: true,
  },
  {
    slot: "about_vision",
    group: "a-propos",
    label: "Notre terrain — Hauts-de-France",
    hint: "Grande carte portrait de la section « Notre vision ».",
    aspect: "aspect-[4/5]",
    defaultAlt: "Territoire d'action de BBH dans les Hauts-de-France",
  },

  /* ---------------- Contact ---------------- */
  {
    slot: "contact_hero",
    group: "contact",
    label: "Bandeau de tête — Contact",
    hint: "Image de fond du haut de page. Vide = dégradé actuel conservé.",
    aspect: "aspect-[16/7]",
    defaultAlt: "Contacter BBH Association pour un partenariat",
    decorative: true,
  },

  /* ---------------- Identité visuelle ---------------- */
  {
    slot: "brand_logo",
    group: "identite",
    label: "Logo BBH (navigation & footer)",
    hint: "Remplace le logo typographique « BBH ». Fond transparent recommandé (PNG/WebP/SVG).",
    aspect: "aspect-[3/1]",
    defaultAlt: "Logo de BBH Association",
  },

  /* ---------------- SEO ---------------- */
  {
    slot: "seo_default_og",
    group: "seo",
    label: "Image de partage par défaut",
    hint: "Utilisée sur les réseaux sociaux quand une page n'a pas d'image propre. Format conseillé : 1200 × 630 px.",
    aspect: "aspect-[1200/630]",
    defaultAlt: "BBH Association — culture urbaine dans les Hauts-de-France",
  },
];

export const MEDIA_SLOT_KEYS = MEDIA_SLOTS.map((s) => s.slot);

export function isMediaSlot(value: string): boolean {
  return MEDIA_SLOT_KEYS.includes(value);
}

export function getMediaSlotDef(slot: string): MediaSlotDef | undefined {
  return MEDIA_SLOTS.find((s) => s.slot === slot);
}

/** Anchors used by the object-position control. */
export const MEDIA_ANCHORS: { label: string; icon: string; value: string }[] = [
  { label: "Haut gauche", icon: "↖", value: "left top" },
  { label: "Haut", icon: "↑", value: "center top" },
  { label: "Haut droite", icon: "↗", value: "right top" },
  { label: "Gauche", icon: "←", value: "left center" },
  { label: "Centre", icon: "•", value: "center center" },
  { label: "Droite", icon: "→", value: "right center" },
  { label: "Bas gauche", icon: "↙", value: "left bottom" },
  { label: "Bas", icon: "↓", value: "center bottom" },
  { label: "Bas droite", icon: "↘", value: "right bottom" },
];
