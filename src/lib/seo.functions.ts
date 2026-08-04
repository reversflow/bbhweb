import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SiteSettings = {
  siteName: string;
  baseUrl: string;
  tagline: string;
  defaultDescription: string;
  aiSummary: string;
  keywords: string[];
  twitterHandle: string;
  contactEmail: string;
  locality: string;
  region: string;
  country: string;
  socialLinks: string[];
  googleSiteVerification: string;
  bingSiteVerification: string;
};

export type SeoPage = {
  pageKey: string;
  path: string;
  label: string;
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  aiSummary: string;
  keywords: string[];
  noindex: boolean;
  priority: number;
  changefreq: string;
  sortOrder: number;
};

export type SeoConfig = { settings: SiteSettings; pages: SeoPage[] };

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "BBH Association",
  baseUrl: "https://bbhweb.lovable.app",
  tagline: "Élever la culture urbaine",
  defaultDescription:
    "BBH Association crée des événements, ateliers et projets culturels autour du rap et de la musique en Hauts-de-France.",
  aiSummary: "",
  keywords: [],
  twitterHandle: "",
  contactEmail: "",
  locality: "",
  region: "",
  country: "FR",
  socialLinks: [],
  googleSiteVerification: "",
  bingSiteVerification: "",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapSettings(row: any): SiteSettings {
  if (!row) return DEFAULT_SETTINGS;
  const raw = row.social_links;
  const socialLinks = Array.isArray(raw)
    ? raw.filter((v: unknown): v is string => typeof v === "string" && v.length > 0)
    : [];
  return {
    siteName: row.site_name || DEFAULT_SETTINGS.siteName,
    baseUrl: (row.base_url || DEFAULT_SETTINGS.baseUrl).replace(/\/+$/, ""),
    tagline: row.tagline ?? "",
    defaultDescription: row.default_description || DEFAULT_SETTINGS.defaultDescription,
    aiSummary: row.ai_summary ?? "",
    keywords: row.keywords ?? [],
    twitterHandle: row.twitter_handle ?? "",
    contactEmail: row.contact_email ?? "",
    locality: row.locality ?? "",
    region: row.region ?? "",
    country: row.country ?? "FR",
    socialLinks,
    googleSiteVerification: row.google_site_verification ?? "",
    bingSiteVerification: row.bing_site_verification ?? "",
  };
}

function mapPage(row: any): SeoPage {
  return {
    pageKey: row.page_key,
    path: row.path,
    label: row.label ?? "",
    title: row.title ?? "",
    description: row.description ?? "",
    ogTitle: row.og_title ?? "",
    ogDescription: row.og_description ?? "",
    aiSummary: row.ai_summary ?? "",
    keywords: row.keywords ?? [],
    noindex: Boolean(row.noindex),
    priority: Number(row.priority ?? 0.6),
    changefreq: row.changefreq ?? "monthly",
    sortOrder: row.sort_order ?? 100,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Public: full SEO configuration (settings + every page record). */
export const getSeoConfig = createServerFn({ method: "GET" }).handler(async (): Promise<SeoConfig> => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [settingsRes, pagesRes] = await Promise.all([
    supabaseAdmin.from("site_settings").select("*").eq("id", 1).maybeSingle(),
    supabaseAdmin.from("seo_pages").select("*").order("sort_order", { ascending: true }),
  ]);
  return {
    settings: mapSettings(settingsRes.data),
    pages: (pagesRes.data ?? []).map(mapPage),
  };
});

const SettingsInput = z.object({
  siteName: z.string().min(1).max(120),
  baseUrl: z.string().url().max(200),
  tagline: z.string().max(200).default(""),
  defaultDescription: z.string().max(400).default(""),
  aiSummary: z.string().max(2000).default(""),
  keywords: z.array(z.string().max(80)).max(30).default([]),
  twitterHandle: z.string().max(40).default(""),
  contactEmail: z.string().max(200).default(""),
  locality: z.string().max(120).default(""),
  region: z.string().max(120).default(""),
  country: z.string().max(4).default("FR"),
  socialLinks: z.array(z.string().url().max(300)).max(12).default([]),
  googleSiteVerification: z.string().max(200).default(""),
  bingSiteVerification: z.string().max(200).default(""),
});

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

export const updateSiteSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => SettingsInput.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("site_settings").upsert(
      {
        id: 1,
        site_name: data.siteName,
        base_url: data.baseUrl.replace(/\/+$/, ""),
        tagline: data.tagline,
        default_description: data.defaultDescription,
        ai_summary: data.aiSummary,
        keywords: data.keywords,
        twitter_handle: data.twitterHandle,
        contact_email: data.contactEmail,
        locality: data.locality,
        region: data.region,
        country: data.country,
        social_links: data.socialLinks,
        google_site_verification: data.googleSiteVerification,
        bing_site_verification: data.bingSiteVerification,
      },
      { onConflict: "id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const PageInput = z.object({
  pageKey: z.string().min(2).max(60).regex(/^[a-z0-9_]+$/),
  title: z.string().max(120).default(""),
  description: z.string().max(320).default(""),
  ogTitle: z.string().max(160).default(""),
  ogDescription: z.string().max(320).default(""),
  aiSummary: z.string().max(2000).default(""),
  keywords: z.array(z.string().max(80)).max(30).default([]),
  noindex: z.boolean().default(false),
  priority: z.number().min(0).max(1).default(0.6),
  changefreq: z
    .enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"])
    .default("monthly"),
});

export const updateSeoPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => PageInput.parse(data))
  .handler(async ({ data, context }) => {
    await requireAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("seo_pages")
      .update({
        title: data.title,
        description: data.description,
        og_title: data.ogTitle,
        og_description: data.ogDescription,
        ai_summary: data.aiSummary,
        keywords: data.keywords,
        noindex: data.noindex,
        priority: data.priority,
        changefreq: data.changefreq,
      })
      .eq("page_key", data.pageKey);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
