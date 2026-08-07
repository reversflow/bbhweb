import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Relational connections between content types (event ↔ artist ↔ song ↔ journal).
 * One generic table keeps the admin UI simple and lets any page show
 * "contenus liés" without a new join table per pairing.
 */

export const CONTENT_TYPES = ["event", "artist", "song", "journal"] as const;
export type ContentType = (typeof CONTENT_TYPES)[number];

export type LinkedContent = {
  type: ContentType;
  id: string;
  title: string;
  slug: string;
  path: string;
};

const typeEnum = z.enum(CONTENT_TYPES);

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

const TABLES: Record<ContentType, { table: string; path: (slug: string) => string; published?: boolean }> = {
  event: { table: "events", path: (s) => `/evenements/${s}`, published: true },
  artist: { table: "artists", path: (s) => `/artistes/${s}` },
  song: { table: "songs", path: (s) => `/musique/${s}`, published: true },
  journal: { table: "journal_posts", path: (s) => `/journal/${s}`, published: true },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
async function resolve(
  admin: any,
  type: ContentType,
  ids: string[],
  onlyPublished: boolean,
): Promise<LinkedContent[]> {
  if (ids.length === 0) return [];
  const cfg = TABLES[type];
  let q = admin.from(cfg.table).select("id, slug, title, name").in("id", ids);
  if (onlyPublished && cfg.published) q = q.eq("published", true);
  const { data } = await q;
  return (data ?? []).map((r: any) => ({
    type,
    id: r.id as string,
    title: (r.title ?? r.name ?? "") as string,
    slug: r.slug as string,
    path: cfg.path(r.slug as string),
  }));
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Public: everything linked to one piece of content, published only. */
export const getLinkedContent = createServerFn({ method: "GET" })
  .inputValidator((data) =>
    z.object({ sourceType: typeEnum, sourceId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data }): Promise<LinkedContent[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: links } = await supabaseAdmin
      .from("content_links")
      .select("target_type, target_id, sort_order")
      .eq("source_type", data.sourceType)
      .eq("source_id", data.sourceId)
      .order("sort_order", { ascending: true });

    const grouped = new Map<ContentType, string[]>();
    for (const l of links ?? []) {
      const t = l.target_type as ContentType;
      grouped.set(t, [...(grouped.get(t) ?? []), l.target_id as string]);
    }
    const resolved = await Promise.all(
      [...grouped.entries()].map(([t, ids]) => resolve(supabaseAdmin, t, ids, true)),
    );
    return resolved.flat();
  });

/** Admin: every link of one source, published or not. */
export const adminGetLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ sourceType: typeEnum, sourceId: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }): Promise<LinkedContent[]> => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: links } = await supabaseAdmin
      .from("content_links")
      .select("target_type, target_id, sort_order")
      .eq("source_type", data.sourceType)
      .eq("source_id", data.sourceId)
      .order("sort_order", { ascending: true });

    const grouped = new Map<ContentType, string[]>();
    for (const l of links ?? []) {
      const t = l.target_type as ContentType;
      grouped.set(t, [...(grouped.get(t) ?? []), l.target_id as string]);
    }
    const resolved = await Promise.all(
      [...grouped.entries()].map(([t, ids]) => resolve(supabaseAdmin, t, ids, false)),
    );
    return resolved.flat();
  });

/** Admin: pick-list of everything that can be linked. */
export const adminListLinkables = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LinkedContent[]> => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [events, artists, songs, posts] = await Promise.all([
      supabaseAdmin.from("events").select("id, slug, title").order("sort_order"),
      supabaseAdmin.from("artists").select("id, slug, name").order("sort_order"),
      supabaseAdmin.from("songs").select("id, slug, title").order("title"),
      supabaseAdmin.from("journal_posts").select("id, slug, title").order("published_at", { ascending: false }),
    ]);
    const out: LinkedContent[] = [];
    for (const r of events.data ?? [])
      out.push({ type: "event", id: r.id, title: r.title, slug: r.slug, path: `/evenements/${r.slug}` });
    for (const r of artists.data ?? [])
      out.push({ type: "artist", id: r.id, title: r.name, slug: r.slug, path: `/artistes/${r.slug}` });
    for (const r of songs.data ?? [])
      out.push({ type: "song", id: r.id, title: r.title, slug: r.slug, path: `/musique/${r.slug}` });
    for (const r of posts.data ?? [])
      out.push({ type: "journal", id: r.id, title: r.title, slug: r.slug, path: `/journal/${r.slug}` });
    return out;
  });

/** Admin: replace every link of one source (kept symmetric both ways). */
export const setContentLinks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        sourceType: typeEnum,
        sourceId: z.string().uuid(),
        targets: z
          .array(z.object({ type: typeEnum, id: z.string().uuid() }))
          .max(60)
          .default([]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Drop previous links in both directions, then re-create them symmetrically
    // so a related item also lists the source.
    await supabaseAdmin
      .from("content_links")
      .delete()
      .eq("source_type", data.sourceType)
      .eq("source_id", data.sourceId);
    await supabaseAdmin
      .from("content_links")
      .delete()
      .eq("target_type", data.sourceType)
      .eq("target_id", data.sourceId);

    if (data.targets.length === 0) return { ok: true };

    const rows = data.targets.flatMap((t, i) => [
      {
        source_type: data.sourceType,
        source_id: data.sourceId,
        target_type: t.type,
        target_id: t.id,
        sort_order: i,
      },
      {
        source_type: t.type,
        source_id: t.id,
        target_type: data.sourceType,
        target_id: data.sourceId,
        sort_order: i,
      },
    ]);
    const { error } = await supabaseAdmin
      .from("content_links")
      .upsert(rows, { onConflict: "source_type,source_id,target_type,target_id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
