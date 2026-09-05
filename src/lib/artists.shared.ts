/** Browser-safe artist model shared by the admin editor and the public pages. */
import { parseBlocks, type Block } from "@/lib/blocks.shared";
import { parseTranslations, tField, type Locale, type Translations } from "@/lib/i18n";

export type ArtistGalleryItem = { path: string; alt: string };
export type ArtistVideo = { path: string; poster: string; title: string };
export type ArtistLink = { label: string; url: string };

export type ArtistRecord = {
  id: string;
  slug: string;
  name: string;
  role: string;
  origin: string;
  genres: string[];
  tags: string[];
  shortDescription: string;
  bio: string;
  universe: string;
  portraitUrl: string;
  heroMedia: string;
  heroPoster: string;
  instagram: string;
  tiktok: string;
  youtube: string;
  spotify: string;
  soundcloud: string;
  website: string;
  links: ArtistLink[];
  gallery: ArtistGalleryItem[];
  videos: ArtistVideo[];
  blocks: Block[];
  bookingUrl: string;
  bookingLabel: string;
  badge: string;
  isFounder: boolean;
  published: boolean;
  sortOrder: number;
  translations: Translations;
  updatedAt: string | null;
};

const s = (v: unknown) => (typeof v === "string" ? v : "");

function strArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.length > 0) : [];
}

export function parseGallery(v: unknown): ArtistGalleryItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => x && typeof x === "object")
    .map((x) => ({ path: s((x as Record<string, unknown>).path), alt: s((x as Record<string, unknown>).alt) }))
    .filter((x) => x.path.length > 0);
}

export function parseVideos(v: unknown): ArtistVideo[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => x && typeof x === "object")
    .map((x) => {
      const o = x as Record<string, unknown>;
      return { path: s(o.path), poster: s(o.poster), title: s(o.title) };
    })
    .filter((x) => x.path.length > 0);
}

export function parseLinks(v: unknown): ArtistLink[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x) => x && typeof x === "object")
    .map((x) => {
      const o = x as Record<string, unknown>;
      return { label: s(o.label), url: s(o.url) };
    })
    .filter((x) => x.label.length > 0 && x.url.length > 0);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapArtist(r: any): ArtistRecord {
  return {
    id: r.id,
    slug: s(r.slug),
    name: s(r.name),
    role: s(r.role),
    origin: s(r.origin),
    genres: strArray(r.genres),
    tags: strArray(r.tags),
    shortDescription: s(r.short_description),
    bio: s(r.bio),
    universe: s(r.universe),
    portraitUrl: s(r.portrait_url),
    heroMedia: s(r.hero_media),
    heroPoster: s(r.hero_poster),
    instagram: s(r.instagram),
    tiktok: s(r.tiktok),
    youtube: s(r.youtube),
    spotify: s(r.spotify),
    soundcloud: s(r.soundcloud),
    website: s(r.website),
    links: parseLinks(r.links),
    gallery: parseGallery(r.gallery),
    videos: parseVideos(r.videos),
    blocks: parseBlocks(r.blocks),
    bookingUrl: s(r.booking_url),
    bookingLabel: s(r.booking_label),
    badge: s(r.badge),
    isFounder: r.is_founder === true,
    published: r.published !== false,
    sortOrder: typeof r.sort_order === "number" ? r.sort_order : 0,
    translations: parseTranslations(r.translations),
    updatedAt: typeof r.updated_at === "string" ? r.updated_at : null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function emptyArtist(): ArtistRecord {
  return {
    id: "",
    slug: "",
    name: "",
    role: "",
    origin: "",
    genres: [],
    tags: [],
    shortDescription: "",
    bio: "",
    universe: "",
    portraitUrl: "",
    heroMedia: "",
    heroPoster: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    spotify: "",
    soundcloud: "",
    website: "",
    links: [],
    gallery: [],
    videos: [],
    blocks: [],
    bookingUrl: "",
    bookingLabel: "",
    badge: "",
    isFounder: false,
    published: true,
    sortOrder: 0,
    translations: {},
    updatedAt: null,
  };
}

export function slugifyArtist(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

/** Artist fields that can be translated per locale. */
export const ARTIST_I18N_FIELDS = ["name", "short_description", "bio", "universe"] as const;

/** Return a copy of the artist with translatable fields resolved for a locale. */
export function localizeArtist(a: ArtistRecord, locale: Locale): ArtistRecord {
  return {
    ...a,
    name: tField(a.translations, locale, "name", a.name),
    shortDescription: tField(a.translations, locale, "short_description", a.shortDescription),
    bio: tField(a.translations, locale, "bio", a.bio),
    universe: tField(a.translations, locale, "universe", a.universe),
  };
}
