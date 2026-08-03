import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Slot keys are declared in `src/lib/media-slots.ts` (UI registry). */
export type SiteImageSlot = string;

const slotSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9_]+$/, "clé de média invalide");

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
  title: string;
  caption: string;
  objectPosition: string;
  storagePath: string;
};

/** Stable, cacheable URL served by `/media/$`. */
export function mediaUrl(storagePath: string) {
  return `/media/${storagePath.split("/").map(encodeURIComponent).join("/")}`;
}

/** Public read: every custom site image with a stable URL. */
export const getSiteImages = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("site_images")
    .select("slot, storage_path, alt_text, title, caption, object_position");
  if (error) throw new Error(error.message);
  const out: SiteImageEntry[] = (data ?? []).map((r) => ({
    slot: r.slot,
    url: mediaUrl(r.storage_path),
    alt: r.alt_text ?? "",
    title: (r as { title?: string }).title ?? "",
    caption: (r as { caption?: string }).caption ?? "",
    objectPosition: r.object_position ?? "center center",
    storagePath: r.storage_path,
  }));
  return out;
});

/** Admin: create a signed upload URL for the site-images bucket. */
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

/** Admin: upsert a slot; removes the replaced file if it is no longer referenced. */
export const upsertSiteImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        slot: slotSchema,
        storagePath: z.string().min(1).max(500),
        alt: z.string().min(1).max(200),
        title: z.string().max(200).default(""),
        caption: z.string().max(400).default(""),
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

    const { error } = await supabaseAdmin.from("site_images").upsert(
      {
        slot: data.slot,
        storage_path: data.storagePath,
        alt_text: data.alt,
        title: data.title,
        caption: data.caption,
        object_position: data.objectPosition,
        updated_by: context.userId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "slot" },
    );
    if (error) throw new Error(error.message);

    if (prev?.storage_path && prev.storage_path !== data.storagePath) {
      await removeIfUnreferenced(supabaseAdmin, prev.storage_path);
    }
    return { ok: true };
  });

/** Admin: reset a slot (removes the custom image, reverts to the default). */
export const resetSiteImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ slot: slotSchema }).parse(data))
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
      await removeIfUnreferenced(supabaseAdmin, prev.storage_path);
    }
    return { ok: true };
  });

/** Never delete a storage object that another slot still points at. */
async function removeIfUnreferenced(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  storagePath: string,
) {
  const { data } = await admin
    .from("site_images")
    .select("slot")
    .eq("storage_path", storagePath)
    .limit(1);
  if (data && data.length > 0) return;
  await admin.storage.from("site-images").remove([storagePath]);
}
