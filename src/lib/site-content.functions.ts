import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ContentInput, NavInput } from "@/lib/events.schema";
import { mapContent, mapNav, type SiteContentRow, type NavLink } from "@/lib/site-content.shared";

/** Public: every editable text/button and every navigation link. */
export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ content: SiteContentRow[]; nav: NavLink[] }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [contentRes, navRes] = await Promise.all([
      supabaseAdmin.from("site_content").select("*").order("sort_order", { ascending: true }),
      supabaseAdmin.from("nav_links").select("*").order("sort_order", { ascending: true }),
    ]);
    return {
      content: (contentRes.data ?? []).map(mapContent),
      nav: (navRes.data ?? []).map(mapNav),
    };
  },
);

/** Admin: save edited page texts and button destinations. */
export const updateSiteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => ContentInput.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    for (const item of data.items) {
      const { error } = await supabaseAdmin
        .from("site_content")
        .update({
          text_value: item.text_value,
          link_value: item.link_value,
          updated_by: context.userId,
        })
        .eq("content_key", item.content_key);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/** Admin: replace the navigation / footer link set. */
export const updateNavLinks = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => NavInput.parse(data))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("@/lib/admin.server");
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.deleted.length) {
      const { error } = await supabaseAdmin.from("nav_links").delete().in("id", data.deleted);
      if (error) throw new Error(error.message);
    }

    for (const item of data.items) {
      const seen = new Set<string>();
      const key = `${item.location}::${item.url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const payload = {
        location: item.location,
        label: item.label,
        url: item.url,
        external: item.external,
        new_tab: item.new_tab,
        enabled: item.enabled,
        sort_order: item.sort_order,
      };
      const { error } = item.id
        ? await supabaseAdmin.from("nav_links").update(payload).eq("id", item.id)
        : await supabaseAdmin.from("nav_links").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });
