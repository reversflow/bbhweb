import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SLOTS = [
  "home_hero",
  "home_card_scenes",
  "home_card_ateliers",
  "home_card_artistes",
  "artist_reverseflow",
] as const;
export type SiteImageSlot = (typeof SLOTS)[number];

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

export type SiteImageEntry = {
  slot: SiteImageSlot;
  url: string;
  alt: string;
  objectPosition: string;
  storagePath: string;
};

/** Public read: returns all custom site images with signed URLs (1h TTL). */
export const getSiteImages = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("site_images")
    .select("slot, storage_path, alt_text, object_position");
  if (error) throw new Error(error.message);
  const rows = data ?? [];
  const paths = rows.map((r) => r.storage_path);
  const signed = paths.length
    ? await supabaseAdmin.storage.from("site-images").createSignedUrls(paths, 60 * 60)
    : { data: [], error: null };
  if (signed.error) throw new Error(signed.error.message);
  const byPath = new Map((signed.data ?? []).map((s) => [s.path, s.signedUrl]));
  const out: SiteImageEntry[] = rows
    .filter((r) => SLOTS.includes(r.slot as SiteImageSlot))
    .map((r) => ({
      slot: r.slot as SiteImageSlot,
      url: byPath.get(r.storage_path) ?? "",
      alt: r.alt_text ?? "",
      objectPosition: r.object_position ?? "center center",
      storagePath: r.storage_path,
    }))
    .filter((r) => r.url);
  return out;
});

/** Admin: create signed upload URL for the site-images bucket. */
export const createSiteImageUploadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({ path: z.string().min(1).max(500) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from("site-images")
      .createSignedUploadUrl(data.path);
    if (error || !signed) throw new Error(error?.message ?? "Upload url failed");
    return { token: signed.token, path: signed.path, signedUrl: signed.signedUrl };
  });

/** Admin: upsert a slot; deletes previous file if replaced. */
export const upsertSiteImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        slot: z.enum(SLOTS),
        storagePath: z.string().min(1).max(500),
        alt: z.string().min(1).max(200),
        objectPosition: z
          .string()
          .max(60)
          .regex(/^[a-z0-9%.\s-]+$/i, "invalid object-position")
          .default("center center"),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: prev } = await supabaseAdmin
      .from("site_images")
      .select("storage_path")
      .eq("slot", data.slot)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from("site_images")
      .upsert(
        {
          slot: data.slot,
          storage_path: data.storagePath,
          alt_text: data.alt,
          object_position: data.objectPosition,
          updated_by: context.userId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "slot" },
      );
    if (error) throw new Error(error.message);

    if (prev?.storage_path && prev.storage_path !== data.storagePath) {
      await supabaseAdmin.storage.from("site-images").remove([prev.storage_path]);
    }
    return { ok: true };
  });

/** Admin: reset a slot (remove custom image, revert to default asset). */
export const resetSiteImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ slot: z.enum(SLOTS) }).parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: prev } = await supabaseAdmin
      .from("site_images")
      .select("storage_path")
      .eq("slot", data.slot)
      .maybeSingle();
    const { error } = await supabaseAdmin
      .from("site_images")
      .delete()
      .eq("slot", data.slot);
    if (error) throw new Error(error.message);
    if (prev?.storage_path) {
      await supabaseAdmin.storage.from("site-images").remove([prev.storage_path]);
    }
    return { ok: true };
  });
