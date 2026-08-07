import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Centralised media library: every image and MP4 uploaded once, reusable
 * anywhere (event blocks, journal blocks, hero videos, galleries).
 * Library rows live in `site_images` with `is_library = true` and a generated
 * `lib_…` key, so they share the same private bucket and `/media/$` serving.
 */

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

export type LibraryItem = {
  key: string;
  mediaType: "image" | "video";
  storagePath: string;
  posterPath: string;
  mimeType: string;
  title: string;
  alt: string;
  caption: string;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  fileSize: number | null;
  createdAt: string;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapItem(r: any): LibraryItem {
  return {
    key: r.slot,
    mediaType: r.media_type === "video" ? "video" : "image",
    storagePath: r.storage_path,
    posterPath: r.poster_path ?? "",
    mimeType: r.mime_type ?? "",
    title: r.title ?? "",
    alt: r.alt_text ?? "",
    caption: r.caption ?? "",
    durationSeconds: r.duration_seconds == null ? null : Number(r.duration_seconds),
    width: r.width ?? null,
    height: r.height ?? null,
    fileSize: r.file_size == null ? null : Number(r.file_size),
    createdAt: r.created_at ?? "",
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Admin: the whole library, newest first. */
export const listLibraryMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<LibraryItem[]> => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("site_images")
      .select(
        "slot, media_type, storage_path, poster_path, mime_type, title, alt_text, caption, duration_seconds, width, height, file_size, created_at",
      )
      .eq("is_library", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapItem);
  });

/** Admin: signed upload URL inside the media library folder. */
export const createLibraryUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        ext: z
          .string()
          .min(1)
          .max(6)
          .regex(/^[a-z0-9]+$/, "extension invalide"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = `library/${crypto.randomUUID()}.${data.ext}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from("site-images")
      .createSignedUploadUrl(path);
    if (error || !signed) throw new Error(error?.message ?? "Upload url failed");
    return { signedUrl: signed.signedUrl, path };
  });

const SaveInput = z.object({
  key: z.string().max(80).optional(),
  mediaType: z.enum(["image", "video"]),
  storagePath: z.string().min(1).max(500),
  posterPath: z.string().max(500).default(""),
  mimeType: z.string().max(120).default(""),
  title: z.string().max(200).default(""),
  alt: z.string().min(1, "Le texte alternatif est obligatoire.").max(300),
  caption: z.string().max(400).default(""),
  durationSeconds: z.number().nonnegative().nullable().default(null),
  width: z.number().int().nullable().default(null),
  height: z.number().int().nullable().default(null),
  fileSize: z.number().int().nullable().default(null),
});

/** Admin: create or update a library item. */
export const saveLibraryMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => SaveInput.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const key = data.key ?? `lib_${crypto.randomUUID().replace(/-/g, "")}`;
    const { error } = await supabaseAdmin.from("site_images").upsert(
      {
        slot: key,
        is_library: true,
        media_type: data.mediaType,
        storage_path: data.storagePath,
        poster_path: data.posterPath,
        mime_type: data.mimeType,
        title: data.title,
        alt_text: data.alt,
        caption: data.caption,
        duration_seconds: data.durationSeconds,
        width: data.width,
        height: data.height,
        file_size: data.fileSize,
        updated_by: context.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slot" },
    );
    if (error) throw new Error(error.message);
    return { ok: true, key };
  });

/** Admin: delete a library item and its stored files. */
export const deleteLibraryMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ key: z.string().min(1).max(80) }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("site_images")
      .select("storage_path, poster_path")
      .eq("slot", data.key)
      .eq("is_library", true)
      .maybeSingle();
    if (!row) throw new Error("Média introuvable.");

    const { error } = await supabaseAdmin
      .from("site_images")
      .delete()
      .eq("slot", data.key)
      .eq("is_library", true);
    if (error) throw new Error(error.message);

    const files = [row.storage_path, row.poster_path].filter(
      (p): p is string => typeof p === "string" && p.length > 0,
    );
    for (const f of files) {
      const { data: still } = await supabaseAdmin
        .from("site_images")
        .select("slot")
        .or(`storage_path.eq.${f},poster_path.eq.${f}`)
        .limit(1);
      if (!still || still.length === 0) {
        await supabaseAdmin.storage.from("site-images").remove([f]);
      }
    }
    return { ok: true };
  });
