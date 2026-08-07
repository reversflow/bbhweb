/** Shared, browser-safe helpers and types for the events system. */

import { parseBlocks, type Block } from "@/lib/blocks.shared";

export type EventRecord = {

  id: string;
  slug: string;
  title: string;
  short_description: string;
  full_description: string;
  event_type: string;
  status: string;
  featured: boolean;
  start_date: string | null;
  end_date: string | null;
  start_time: string;
  end_time: string;
  venue_name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  ticket_price: number | null;
  currency: string;
  is_free: boolean;
  ticket_url: string;
  registration_url: string;
  main_image: string;
  poster_image: string;
  gallery: string[];
  image_alt: string;
  artists: string[];
  organizer: string;
  partners: string[];
  capacity: number | null;
  contact_email: string;
  contact_phone: string;
  social_links: string[];
  cta_label: string;
  cta_url: string;
  seo_title: string;
  seo_description: string;
  ai_summary: string;
  og_image: string;
  noindex: boolean;
  published: boolean;
  sort_order: number;
  blocks: Block[];
  hero_video: string;
  hero_video_poster: string;
  created_at?: string;
  updated_at?: string;
};

export const EVENT_TYPES = [
  { value: "concert", label: "Concert" },
  { value: "showcase", label: "Showcase" },
  { value: "open-mic", label: "Open mic" },
  { value: "atelier", label: "Atelier" },
  { value: "rencontre", label: "Rencontre" },
  { value: "autre", label: "Autre" },
] as const;

export const EVENT_STATUSES = [
  { value: "upcoming", label: "À venir" },
  { value: "past", label: "Passé" },
  { value: "cancelled", label: "Annulé" },
] as const;

/** URL-safe slug: lowercase, accents stripped, dots and symbols collapsed. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 2 && slug.length <= 120;
}

const FR_DATE = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatEventDate(date: string | null): string {
  if (!date) return "";
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "";
  return FR_DATE.format(d);
}

export function formatEventLocation(e: Pick<EventRecord, "venue_name" | "city">): string {
  return [e.venue_name, e.city].filter(Boolean).join(", ");
}

export function eventPriceLabel(e: EventRecord): string {
  if (e.is_free) return "Entrée libre";
  if (e.ticket_price == null) return "";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: e.currency || "EUR",
  }).format(Number(e.ticket_price));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function strArray(v: any): string[] {
  return Array.isArray(v) ? v.filter((x: unknown): x is string => typeof x === "string") : [];
}

export function mapEvent(row: any): EventRecord {
  return {
    ...row,
    blocks: parseBlocks(row.blocks),
    hero_video: row.hero_video ?? "",
    hero_video_poster: row.hero_video_poster ?? "",
    gallery: strArray(row.gallery),
    social_links: strArray(row.social_links),
    artists: strArray(row.artists),
    partners: strArray(row.partners),
    latitude: row.latitude == null ? null : Number(row.latitude),
    longitude: row.longitude == null ? null : Number(row.longitude),
    ticket_price: row.ticket_price == null ? null : Number(row.ticket_price),
  } as EventRecord;
}
/* eslint-enable @typescript-eslint/no-explicit-any */
