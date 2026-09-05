import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

const SongInput = z.object({
  id: z.string().uuid().optional(),
  artist_id: z.string().uuid(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/i),
  description: z.string().max(4000).optional().nullable(),
  genres: z.array(z.string().max(40)).max(12).default([]),
  duration_seconds: z.number().int().min(0).max(60 * 60 * 6).nullable().optional(),
  release_date: z.string().optional().nullable(),
  cover_url: z.string().optional().nullable(),
  audio_url: z.string().optional().nullable(),
  lyrics: z.string().max(20000).optional().nullable(),
  credits: z.string().max(4000).optional().nullable(),
  featured: z.boolean().default(false),
  streaming_links: z
    .object({
      spotify: z.string().url().optional().or(z.literal("")),
      apple: z.string().url().optional().or(z.literal("")),
      deezer: z.string().url().optional().or(z.literal("")),
      youtube: z.string().url().optional().or(z.literal("")),
    })
    .partial()
    .default({}),
  gallery: z.array(z.string()).default([]),
  comments_enabled: z.boolean().default(true),
  seo_title: z.string().max(200).optional().nullable(),
  seo_description: z.string().max(400).optional().nullable(),
  published: z.boolean().default(true),
  translations: z.record(z.string(), z.record(z.string(), z.string().max(20000))).default({}),
});

export const upsertSong = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => SongInput.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { ...data };
    const q = data.id
      ? supabaseAdmin.from("songs").update(payload).eq("id", data.id).select().single()
      : supabaseAdmin.from("songs").insert(payload).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteSong = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("songs").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const JournalInput = z.object({
  id: z.string().uuid().optional(),
  artist_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/i),
  excerpt: z.string().max(400).optional().nullable(),
  content: z.string().max(50000).default(""),
  cover_url: z.string().optional().nullable(),
  category: z.string().max(60).optional().nullable(),
  media: z.array(z.string()).default([]),
  published: z.boolean().default(true),
  translations: z.record(z.string(), z.record(z.string(), z.string().max(20000))).default({}),
});

export const upsertJournalPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => JournalInput.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const q = data.id
      ? supabaseAdmin.from("journal_posts").update(data).eq("id", data.id).select().single()
      : supabaseAdmin.from("journal_posts").insert(data).select().single();
    const { data: row, error } = await q;
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteJournalPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("journal_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Admin-only: get a signed URL to UPLOAD a file (client uploads directly). */
export const createUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        bucket: z.enum(["song-audio", "song-artwork", "artist-media", "journal-media"]),
        path: z.string().min(1).max(500),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from(data.bucket)
      .createSignedUploadUrl(data.path);
    if (error || !signed) throw new Error(error?.message ?? "Upload url failed");
    return { token: signed.token, path: signed.path, signedUrl: signed.signedUrl };
  });

export const isCurrentUserAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });

export const moderateComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "approved", "rejected"]),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("comments")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("comments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [songs, journal, pending, approved] = await Promise.all([
      supabaseAdmin.from("songs").select("id, published", { count: "exact", head: false }),
      supabaseAdmin.from("journal_posts").select("id, published", { count: "exact", head: false }),
      supabaseAdmin.from("comments").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("comments").select("id", { count: "exact", head: true }).eq("status", "approved"),
    ]);
    const songsRows = songs.data ?? [];
    const journalRows = journal.data ?? [];
    return {
      songsTotal: songsRows.length,
      songsPublished: songsRows.filter((s) => (s as { published: boolean }).published).length,
      journalTotal: journalRows.length,
      journalPublished: journalRows.filter((p) => (p as { published: boolean }).published).length,
      pendingComments: pending.count ?? 0,
      approvedComments: approved.count ?? 0,
    };
  });

