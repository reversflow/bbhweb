import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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

const COLUMNS =
  "id, slug, name, role, origin, genres, bio, portrait_url, instagram, spotify, youtube, badge, is_founder, updated_at";

/** Public: the whole roster. */
export const listPublicArtists = createServerFn({ method: "GET" }).handler(async (): Promise<PublicArtist[]> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("artists")
    .select(COLUMNS)
    .order("sort_order", { ascending: true });
  return (data ?? []) as unknown as PublicArtist[];
});

/** Public: one artist by slug, plus their published songs. */
export const getPublicArtist = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: artist } = await supabaseAdmin
      .from("artists")
      .select(COLUMNS)
      .eq("slug", data.slug)
      .maybeSingle();
    if (!artist) return { artist: null as PublicArtist | null, songs: [] as { slug: string; title: string }[] };
    const { data: songs } = await supabaseAdmin
      .from("songs")
      .select("slug, title")
      .eq("artist_id", (artist as { id: string }).id)
      .eq("published", true)
      .order("release_date", { ascending: false })
      .limit(12);
    return {
      artist: artist as unknown as PublicArtist,
      songs: (songs ?? []) as { slug: string; title: string }[],
    };
  });
