import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Stable public URL for a private content image (song artwork / journal cover). */
export function coverUrl(bucket: "song-artwork" | "journal-media", path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `/cover/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export type PublicSong = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  genres: string[];
  duration_seconds: number | null;
  release_date: string | null;
  cover_url: string | null;
  audio_url: string | null;
  lyrics: string | null;
  credits: string | null;
  featured: boolean;
  comments_enabled: boolean;
  streaming_links: Record<string, string> | null;
  seo_title: string | null;
  seo_description: string | null;
  translations?: unknown;
  updated_at?: string | null;
};

export type PublicPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  category: string | null;
  published_at: string;
  translations?: unknown;
  updated_at?: string | null;
};

const SONG_COLUMNS =
  "id, slug, title, description, genres, duration_seconds, release_date, cover_url, audio_url, lyrics, credits, featured, comments_enabled, streaming_links, seo_title, seo_description, translations, updated_at";

/** Public: one published song by slug, plus a few related tracks. */
export const getPublicSong = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: song } = await supabaseAdmin
      .from("songs")
      .select(SONG_COLUMNS)
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (!song) return { song: null as PublicSong | null, related: [] as PublicSong[] };
    const { data: related } = await supabaseAdmin
      .from("songs")
      .select(SONG_COLUMNS)
      .eq("published", true)
      .neq("id", (song as { id: string }).id)
      .order("release_date", { ascending: false })
      .limit(6);
    return {
      song: song as unknown as PublicSong,
      related: (related ?? []) as unknown as PublicSong[],
    };
  });

/** Public: every published song (archive + sitemap). */
export const listPublicSongs = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("songs")
    .select(SONG_COLUMNS)
    .eq("published", true)
    .order("release_date", { ascending: false });
  return (data ?? []) as unknown as PublicSong[];
});

/** Public: one published journal post by slug. */
export const getPublicPost = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: post } = await supabaseAdmin
      .from("journal_posts")
      .select("id, slug, title, excerpt, content, cover_url, category, published_at, translations, updated_at")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    return { post: (post ?? null) as PublicPost | null };
  });

/** Public: every published journal post (index + sitemap). */
export const listPublicPosts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("journal_posts")
    .select("id, slug, title, excerpt, content, cover_url, category, published_at, translations, updated_at")
    .eq("published", true)
    .order("published_at", { ascending: false });
  return (data ?? []) as unknown as PublicPost[];
});
