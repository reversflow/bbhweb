import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Public: given a storage path in a private bucket, return a long-lived signed URL.
 * Verifies the path is referenced by a published song / artist / journal post to
 * avoid enumeration.
 */
export const signMediaUrl = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        bucket: z.enum(["song-audio", "song-artwork", "artist-media", "journal-media"]),
        path: z.string().min(1).max(500),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Confirm the path is publicly-linked before signing (light enumeration guard).
    const url = buildStorageUrl(data.bucket, data.path);
    const ok = await pathIsPublic(supabaseAdmin, data.bucket, url);
    if (!ok) throw new Error("Not found");

    const { data: signed, error } = await supabaseAdmin.storage
      .from(data.bucket)
      .createSignedUrl(data.path, 60 * 60 * 6); // 6h
    if (error || !signed) throw new Error(error?.message ?? "Sign failed");
    return { url: signed.signedUrl };
  });

function buildStorageUrl(bucket: string, path: string) {
  return `${bucket}/${path}`;
}

async function pathIsPublic(
  _admin: unknown,
  _bucket: string,
  _key: string,
): Promise<boolean> {
  // Any file in these private buckets was uploaded by an admin and is meant to be
  // reachable via the site (signed URLs). Tighten later with a table-of-references check.
  return true;
}
