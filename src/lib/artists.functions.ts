import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { mapArtist, type ArtistRecord } from "@/lib/artists.shared";

/** Legacy shape kept for older callers. */
export type PublicArtist = {
  id: string;
  slug: string;
  name: string;
  role: string | null;
  origin: string | null;
  genres: string[];
  bio: string | null;
  portrait_url: string | null;
  instagram: string | null;
  spotify: string | null;
  youtube: string | null;
  badge: string | null;
  is_founder: boolean;
  updated_at?: string | null;
};

export type ArtistLinkedItem = {
  type: "event" | "song" | "journal" | "artist";
  title: string;
  slug: string;
  path: string;
  cover: string;
  date: string;
};

/** Public: the published roster. */
export const listPublicArtists = createServerFn({ method: "GET" }).handler(
  async (): Promise<ArtistRecord[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("artists")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true });
    return (data ?? []).map(mapArtist);
  },
);

/** Public: one published artist by slug, with songs and every linked content. */
export const getPublicArtist = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(
    async ({
      data,
    }): Promise<{
      artist: ArtistRecord | null;
      songs: { slug: string; title: string; cover_url: string | null; release_date: string | null }[];
      linked: ArtistLinkedItem[];
    }> => {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: row } = await supabaseAdmin
        .from("artists")
        .select("*")
        .eq("slug", data.slug)
        .eq("published", true)
        .maybeSingle();
      if (!row) return { artist: null, songs: [], linked: [] };
      const artist = mapArtist(row);

      const { data: songs } = await supabaseAdmin
        .from("songs")
        .select("slug, title, cover_url, release_date")
        .eq("artist_id", artist.id)
        .eq("published", true)
        .order("release_date", { ascending: false })
        .limit(24);

      const { data: links } = await supabaseAdmin
        .from("content_links")
        .select("target_type, target_id, sort_order")
        .eq("source_type", "artist")
        .eq("source_id", artist.id)
        .order("sort_order", { ascending: true });

      const ids = { event: [] as string[], song: [] as string[], journal: [] as string[] };
      for (const l of links ?? []) {
        const t = l.target_type as keyof typeof ids;
        if (t in ids) ids[t].push(l.target_id as string);
      }

      const linked: ArtistLinkedItem[] = [];
      if (ids.event.length) {
        const { data: rows } = await supabaseAdmin
          .from("events")
          .select("slug, title, main_image, start_date")
          .in("id", ids.event)
          .eq("published", true);
        for (const r of rows ?? [])
          linked.push({
            type: "event",
            title: r.title,
            slug: r.slug,
            path: `/evenements/${r.slug}`,
            cover: r.main_image ?? "",
            date: r.start_date ?? "",
          });
      }
      if (ids.song.length) {
        const { data: rows } = await supabaseAdmin
          .from("songs")
          .select("slug, title, cover_url, release_date")
          .in("id", ids.song)
          .eq("published", true);
        for (const r of rows ?? [])
          linked.push({
            type: "song",
            title: r.title,
            slug: r.slug,
            path: `/musique/${r.slug}`,
            cover: r.cover_url ?? "",
            date: r.release_date ?? "",
          });
      }
      if (ids.journal.length) {
        const { data: rows } = await supabaseAdmin
          .from("journal_posts")
          .select("slug, title, cover_url, published_at")
          .in("id", ids.journal)
          .eq("published", true);
        for (const r of rows ?? [])
          linked.push({
            type: "journal",
            title: r.title,
            slug: r.slug,
            path: `/journal/${r.slug}`,
            cover: r.cover_url ?? "",
            date: r.published_at ?? "",
          });
      }

      return {
        artist,
        songs: (songs ?? []) as { slug: string; title: string; cover_url: string | null; release_date: string | null }[],
        linked,
      };
    },
  );

async function requireAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

/** Admin: the whole roster, published or not. */
export const adminListArtists = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ArtistRecord[]> => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("artists")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapArtist);
  });

const url = z.string().max(500).default("");
const ArtistInput = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1, "Le slug est obligatoire.")
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug invalide (minuscules, chiffres et tirets)."),
  name: z.string().min(1, "Le nom est obligatoire.").max(120),
  role: z.string().max(120).default(""),
  origin: z.string().max(120).default(""),
  genres: z.array(z.string().max(40)).max(20).default([]),
  tags: z.array(z.string().max(40)).max(30).default([]),
  short_description: z.string().max(400).default(""),
  bio: z.string().max(20000).default(""),
  universe: z.string().max(4000).default(""),
  portrait_url: z.string().max(500).default(""),
  hero_media: z.string().max(500).default(""),
  hero_poster: z.string().max(500).default(""),
  instagram: url,
  tiktok: url,
  youtube: url,
  spotify: url,
  soundcloud: url,
  website: url,
  links: z.array(z.object({ label: z.string().max(60), url: z.string().max(500) })).max(20).default([]),
  gallery: z.array(z.object({ path: z.string().max(500), alt: z.string().max(300) })).max(60).default([]),
  videos: z
    .array(
      z.object({
        path: z.string().max(500),
        poster: z.string().max(500).default(""),
        title: z.string().max(200).default(""),
      }),
    )
    .max(30)
    .default([]),
  blocks: z.array(z.record(z.string(), z.unknown())).max(120).default([]),
  booking_url: url,
  booking_label: z.string().max(80).default(""),
  badge: z.string().max(60).default(""),
  is_founder: z.boolean().default(false),
  published: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

/** Admin: create or update an artist. */
export const upsertArtist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => ArtistInput.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { id, ...payload } = data;
    const q = id
      ? supabaseAdmin.from("artists").update(payload).eq("id", id).select("id").single()
      : supabaseAdmin.from("artists").insert(payload).select("id").single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return { ok: true, id: (row as { id: string }).id };
  });

/** Admin: delete an artist and every relation pointing at it. */
export const deleteArtist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("content_links").delete().eq("source_type", "artist").eq("source_id", data.id);
    await supabaseAdmin.from("content_links").delete().eq("target_type", "artist").eq("target_id", data.id);
    const { error } = await supabaseAdmin.from("artists").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
