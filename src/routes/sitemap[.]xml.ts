import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Dynamic sitemap: static pages come from the `seo_pages` table (so the admin
 * can change priority/changefreq or hide a page), plus one entry per published
 * song and journal post.
 */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const [settingsRes, pagesRes, songsRes, postsRes] = await Promise.all([
          supabaseAdmin.from("site_settings").select("base_url").eq("id", 1).maybeSingle(),
          supabaseAdmin
            .from("seo_pages")
            .select("path, priority, changefreq, noindex")
            .order("sort_order", { ascending: true }),
          supabaseAdmin
            .from("songs")
            .select("slug, updated_at")
            .eq("published", true)
            .order("release_date", { ascending: false }),
          supabaseAdmin
            .from("journal_posts")
            .select("slug, updated_at")
            .eq("published", true)
            .order("published_at", { ascending: false }),
        ]);

        const baseUrl = (settingsRes.data?.base_url ?? "https://bbhweb.lovable.app").replace(
          /\/+$/,
          "",
        );

        type Entry = {
          path: string;
          lastmod?: string;
          changefreq?: string;
          priority?: string;
        };

        const entries: Entry[] = [];

        for (const p of pagesRes.data ?? []) {
          if (p.noindex) continue;
          entries.push({
            path: p.path,
            changefreq: p.changefreq ?? undefined,
            priority: p.priority != null ? Number(p.priority).toFixed(1) : undefined,
          });
        }

        for (const s of songsRes.data ?? []) {
          entries.push({
            path: `/musique/${s.slug}`,
            lastmod: s.updated_at ? new Date(s.updated_at).toISOString() : undefined,
            changefreq: "monthly",
            priority: "0.7",
          });
        }

        for (const p of postsRes.data ?? []) {
          entries.push({
            path: `/journal/${p.slug}`,
            lastmod: p.updated_at ? new Date(p.updated_at).toISOString() : undefined,
            changefreq: "monthly",
            priority: "0.6",
          });
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${baseUrl}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
