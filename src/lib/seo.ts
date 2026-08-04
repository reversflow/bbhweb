import type { SeoConfig, SeoPage, SiteSettings } from "./seo.functions";

export type HeadTag = Record<string, unknown>;

export const FALLBACK_OG_IMAGE =
  "https://storage.googleapis.com/gpt-engineer-file-uploads/X2BXKdzMFfcdJAZIM2uxvyYnkL52/social-images/social-1784205769623-BBH_LOGO_VEC.webp";

export function absoluteUrl(baseUrl: string, path: string) {
  const base = (baseUrl || "").replace(/\/+$/, "");
  if (!path) return base || "/";
  if (/^https?:\/\//.test(path)) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function findPage(config: SeoConfig | undefined, key: string): SeoPage | undefined {
  return config?.pages.find((p) => p.pageKey === key);
}

type BuildOptions = {
  /** Route path, e.g. "/musique" or "/musique/mon-titre". */
  path: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Absolute or root-relative image path. */
  image?: string | null;
  type?: "website" | "article" | "music.song" | "profile";
  aiSummary?: string;
  keywords?: string[];
  noindex?: boolean;
  /** JSON-LD objects appended to the page. */
  jsonLd?: unknown[];
};

/**
 * Builds a complete, self-referencing head() payload: title, description,
 * canonical, Open Graph, Twitter cards, AI-search summary and JSON-LD.
 */
export function buildHead(
  settings: SiteSettings,
  page: SeoPage | undefined,
  opts: BuildOptions,
) {
  const siteName = settings.siteName || "BBH Association";
  const title = opts.title || page?.title || siteName;
  const description =
    opts.description || page?.description || settings.defaultDescription || "";
  const ogTitle = opts.ogTitle || page?.ogTitle || title;
  const ogDescription = opts.ogDescription || page?.ogDescription || description;
  const canonical = absoluteUrl(settings.baseUrl, opts.path);
  const image = absoluteUrl(settings.baseUrl, opts.image || FALLBACK_OG_IMAGE);
  const keywords = opts.keywords ?? page?.keywords ?? settings.keywords;
  const aiSummary = opts.aiSummary || page?.aiSummary || settings.aiSummary;
  const noindex = opts.noindex ?? page?.noindex ?? false;

  const meta: HeadTag[] = [
    { title },
    { name: "description", content: description },
    { property: "og:site_name", content: siteName },
    { property: "og:locale", content: "fr_FR" },
    { property: "og:type", content: opts.type ?? "website" },
    { property: "og:title", content: ogTitle },
    { property: "og:description", content: ogDescription },
    { property: "og:url", content: canonical },
    { property: "og:image", content: image },
    { property: "og:image:alt", content: ogTitle },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: ogTitle },
    { name: "twitter:description", content: ogDescription },
    { name: "twitter:image", content: image },
  ];

  if (keywords && keywords.length > 0) {
    meta.push({ name: "keywords", content: keywords.join(", ") });
  }
  if (settings.twitterHandle) {
    meta.push({ name: "twitter:site", content: settings.twitterHandle });
  }
  if (aiSummary) {
    // Consumed by AI answer engines and summarisers.
    meta.push({ name: "ai-summary", content: aiSummary });
    meta.push({ name: "summary", content: aiSummary });
  }
  meta.push({
    name: "robots",
    content: noindex
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  });

  const scripts = (opts.jsonLd ?? []).map((node) => ({
    type: "application/ld+json",
    children: JSON.stringify(node),
  }));

  return {
    meta,
    links: [{ rel: "canonical", href: canonical }],
    scripts,
  };
}

/** Breadcrumb JSON-LD from an ordered list of crumbs. */
export function breadcrumbJsonLd(
  baseUrl: string,
  crumbs: { name: string; path: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(baseUrl, c.path),
    })),
  };
}

export function organizationJsonLd(settings: SiteSettings) {
  const base = settings.baseUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${base}/#organization`,
    name: settings.siteName,
    url: base || undefined,
    logo: absoluteUrl(base, FALLBACK_OG_IMAGE),
    description: settings.defaultDescription,
    email: settings.contactEmail || undefined,
    sameAs: settings.socialLinks.length ? settings.socialLinks : undefined,
    address: settings.locality
      ? {
          "@type": "PostalAddress",
          addressLocality: settings.locality,
          addressRegion: settings.region || undefined,
          addressCountry: settings.country || "FR",
        }
      : undefined,
  };
}

export function websiteJsonLd(settings: SiteSettings) {
  const base = settings.baseUrl.replace(/\/+$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${base}/#website`,
    name: settings.siteName,
    url: base || undefined,
    inLanguage: "fr-FR",
    description: settings.defaultDescription,
    publisher: { "@id": `${base}/#organization` },
  };
}
