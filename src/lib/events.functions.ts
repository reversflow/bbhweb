import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { EventInput } from "@/lib/events.schema";
import { mapEvent, type EventRecord } from "@/lib/events.shared";

/** Public: every published event, ordered for the listing page. */
export const listPublicEvents = createServerFn({ method: "GET" }).handler(async (): Promise<EventRecord[]> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("events")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return (data ?? []).map(mapEvent);
});

/**
 * Public: one published event by slug. Falls back to the redirect table so a
 * renamed event keeps its old URL working (single hop, never self-referencing).
 */
export const getPublicEvent = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }): Promise<{ event: EventRecord | null; redirectTo: string | null; related: EventRecord[] }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();

    if (!row) {
      const { data: redirect } = await supabaseAdmin
        .from("event_redirects")
        .select("event_id")
        .eq("old_slug", data.slug)
        .maybeSingle();
      if (redirect) {
        const { data: target } = await supabaseAdmin
          .from("events")
          .select("slug")
          .eq("id", redirect.event_id)
          .eq("published", true)
          .maybeSingle();
        if (target && target.slug !== data.slug) {
          return { event: null, redirectTo: `/evenements/${target.slug}`, related: [] };
        }
      }
      return { event: null, redirectTo: null, related: [] };
    }

    const { data: related } = await supabaseAdmin
      .from("events")
      .select("*")
      .eq("published", true)
      .neq("id", row.id)
      .order("sort_order", { ascending: true })
      .limit(3);

    return { event: mapEvent(row), redirectTo: null, related: (related ?? []).map(mapEvent) };
  });

/** Admin: every event, drafts included. */
export const adminListEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EventRecord[]> => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("events")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map(mapEvent);
  });

/** Admin: preview a single event by slug, published or not. */
export const adminGetEvent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ slug: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data, context }): Promise<EventRecord | null> => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("events").select("*").eq("slug", data.slug).maybeSingle();
    return row ? mapEvent(row) : null;
  });

/** Admin: create or update an event, keeping slugs unique and redirecting old ones. */
export const upsertEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => EventInput.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
      throw new Error("Le lien (slug) doit contenir uniquement des lettres minuscules, chiffres et tirets.");
    }

    const { data: clash } = await supabaseAdmin
      .from("events")
      .select("id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (clash && clash.id !== data.id) {
      throw new Error("Ce lien (slug) est déjà utilisé par un autre événement.");
    }

    const { id, ...fields } = data;

    if (id) {
      const { data: prev } = await supabaseAdmin.from("events").select("slug").eq("id", id).maybeSingle();
      const { error } = await supabaseAdmin.from("events").update(fields).eq("id", id);
      if (error) throw new Error(error.message);
      if (prev && prev.slug !== data.slug) {
        await supabaseAdmin.from("event_redirects").delete().eq("old_slug", data.slug);
        await supabaseAdmin
          .from("event_redirects")
          .upsert({ old_slug: prev.slug, event_id: id }, { onConflict: "old_slug" });
      }
      return { ok: true, id };
    }

    const { data: created, error } = await supabaseAdmin.from("events").insert(fields).select("id").single();
    if (error) throw new Error(error.message);
    return { ok: true, id: created.id as string };
  });

/** Admin: duplicate an event as an unpublished draft. */
export const duplicateEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("events").select("*").eq("id", data.id).single();
    if (error) throw new Error(error.message);

    const copy = { ...row } as Record<string, unknown>;
    delete copy.id;
    delete copy.created_at;
    delete copy.updated_at;
    copy.published = false;
    copy.featured = false;
    copy.title = `${row.title} (copie)`;

    let base = `${row.slug}-copie`;
    for (let i = 2; i < 50; i++) {
      const { data: exists } = await supabaseAdmin.from("events").select("id").eq("slug", base).maybeSingle();
      if (!exists) break;
      base = `${row.slug}-copie-${i}`;
    }
    copy.slug = base;

    const { data: created, error: insErr } = await supabaseAdmin
      .from("events")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(copy as any)
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);
    return { ok: true, id: created.id as string };
  });

/** Admin: delete an event permanently. */
export const deleteEvent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("events").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
