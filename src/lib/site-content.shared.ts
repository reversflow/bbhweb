/** Browser-safe types and helpers for editable page content and navigation. */

export type SiteContentRow = {
  id: string;
  page_key: string;
  section_key: string;
  content_key: string;
  content_type: string;
  text_value: string;
  link_value: string;
  sort_order: number;
};

export type NavLink = {
  id: string;
  location: "header" | "footer" | "legal" | "social";
  label: string;
  url: string;
  external: boolean;
  new_tab: boolean;
  enabled: boolean;
  sort_order: number;
};

export type SiteContentBundle = { content: SiteContentRow[]; nav: NavLink[] };

/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapContent(row: any): SiteContentRow {
  return {
    id: row.id,
    page_key: row.page_key ?? "",
    section_key: row.section_key ?? "",
    content_key: row.content_key,
    content_type: row.content_type ?? "text",
    text_value: row.text_value ?? "",
    link_value: row.link_value ?? "",
    sort_order: row.sort_order ?? 100,
  };
}

export function mapNav(row: any): NavLink {
  return {
    id: row.id,
    location: (row.location ?? "header") as NavLink["location"],
    label: row.label ?? "",
    url: row.url ?? "/",
    external: Boolean(row.external),
    new_tab: Boolean(row.new_tab),
    enabled: row.enabled !== false,
    sort_order: row.sort_order ?? 100,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const PAGE_LABELS: Record<string, string> = {
  home: "Accueil",
  events: "Événements",
  workshops: "Ateliers",
  artists: "Artistes",
  music: "Musique",
  journal: "Journal",
  about: "À propos",
  contact: "Contact",
  global: "Global (pied de page)",
};

/** Lookup helper: returns the stored text or the supplied fallback. */
export function contentText(
  bundle: SiteContentBundle | undefined,
  key: string,
  fallback: string,
): string {
  const row = bundle?.content.find((c) => c.content_key === key);
  return row && row.text_value ? row.text_value : fallback;
}

/** Lookup helper for buttons: label + destination with fallbacks. */
export function contentLink(
  bundle: SiteContentBundle | undefined,
  key: string,
  fallbackLabel: string,
  fallbackUrl: string,
): { label: string; url: string } {
  const row = bundle?.content.find((c) => c.content_key === key);
  return {
    label: row && row.text_value ? row.text_value : fallbackLabel,
    url: row && row.link_value ? row.link_value : fallbackUrl,
  };
}

/** Strips every tag except a small safe formatting set, and all attributes but href. */
export function sanitizeRichText(html: string): string {
  const allowed = new Set(["p", "br", "strong", "b", "em", "i", "ul", "ol", "li", "a", "h2", "h3"]);
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\s*(script|style|iframe|object|embed|form)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*\/?>/gi, "")
    .replace(/<\/?([a-zA-Z0-9]+)([^>]*)>/g, (match, tag: string, attrs: string) => {
      const name = tag.toLowerCase();
      if (!allowed.has(name)) return "";
      if (match.startsWith("</")) return `</${name}>`;
      if (name === "a") {
        const href = /href\s*=\s*"([^"]*)"/i.exec(attrs)?.[1] ?? "";
        const safe = /^(https?:\/\/|\/|mailto:|tel:)/i.test(href) ? href : "";
        if (!safe) return "<a>";
        const external = /^https?:\/\//i.test(safe);
        return `<a href="${safe}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>`;
      }
      return `<${name}>`;
    });
}
