/** Browser-safe block model shared by the admin editor and the public pages. */

export type BlockBase = { id: string };

export type Block =
  | (BlockBase & { type: "heading"; text: string; level: 2 | 3 })
  | (BlockBase & { type: "text"; text: string })
  | (BlockBase & { type: "image"; path: string; alt: string; caption: string })
  | (BlockBase & {
      type: "video";
      path: string;
      poster: string;
      caption: string;
      autoplay: boolean;
      loop: boolean;
    })
  | (BlockBase & { type: "gallery"; items: { path: string; alt: string }[] })
  | (BlockBase & { type: "quote"; text: string; author: string })
  | (BlockBase & { type: "cta"; label: string; url: string })
  | (BlockBase & { type: "embed"; url: string; title: string });

export type BlockType = Block["type"];

export const BLOCK_TYPES: { value: BlockType; label: string; hint: string }[] = [
  { value: "heading", label: "Titre de section", hint: "Structure la page (H2 / H3)" },
  { value: "text", label: "Paragraphe", hint: "Texte libre, sauts de ligne conservés" },
  { value: "image", label: "Image", hint: "Une image de la médiathèque" },
  { value: "video", label: "Vidéo MP4", hint: "Vidéo hébergée sur le site" },
  { value: "gallery", label: "Galerie", hint: "Grille d'images" },
  { value: "quote", label: "Citation", hint: "Mise en avant éditoriale" },
  { value: "cta", label: "Bouton", hint: "Appel à l'action (billetterie, lien…)" },
  { value: "embed", label: "Intégration", hint: "YouTube, Spotify, Google Maps…" },
];

export function newBlock(type: BlockType): Block {
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
  switch (type) {
    case "heading":
      return { id, type, text: "", level: 2 };
    case "text":
      return { id, type, text: "" };
    case "image":
      return { id, type, path: "", alt: "", caption: "" };
    case "video":
      return { id, type, path: "", poster: "", caption: "", autoplay: false, loop: false };
    case "gallery":
      return { id, type, items: [] };
    case "quote":
      return { id, type, text: "", author: "" };
    case "cta":
      return { id, type, label: "", url: "" };
    case "embed":
      return { id, type, url: "", title: "" };
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/** Tolerant parser: never throws, drops anything unknown or malformed. */
export function parseBlocks(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return [];
  const out: Block[] = [];
  for (const item of raw as any[]) {
    if (!item || typeof item !== "object" || typeof item.type !== "string") continue;
    const id = typeof item.id === "string" && item.id ? item.id : `${out.length}`;
    const s = (v: unknown) => (typeof v === "string" ? v : "");
    switch (item.type) {
      case "heading":
        out.push({ id, type: "heading", text: s(item.text), level: item.level === 3 ? 3 : 2 });
        break;
      case "text":
        out.push({ id, type: "text", text: s(item.text) });
        break;
      case "image":
        out.push({ id, type: "image", path: s(item.path), alt: s(item.alt), caption: s(item.caption) });
        break;
      case "video":
        out.push({
          id,
          type: "video",
          path: s(item.path),
          poster: s(item.poster),
          caption: s(item.caption),
          autoplay: item.autoplay === true,
          loop: item.loop === true,
        });
        break;
      case "gallery":
        out.push({
          id,
          type: "gallery",
          items: Array.isArray(item.items)
            ? item.items
                .filter((g: any) => g && typeof g.path === "string")
                .map((g: any) => ({ path: g.path as string, alt: s(g.alt) }))
            : [],
        });
        break;
      case "quote":
        out.push({ id, type: "quote", text: s(item.text), author: s(item.author) });
        break;
      case "cta":
        out.push({ id, type: "cta", label: s(item.label), url: s(item.url) });
        break;
      case "embed":
        out.push({ id, type: "embed", url: s(item.url), title: s(item.title) });
        break;
      default:
        break;
    }
  }
  return out;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** A block that has no usable content should never reach the public page. */
export function blockIsEmpty(b: Block): boolean {
  switch (b.type) {
    case "heading":
    case "text":
      return !b.text.trim();
    case "image":
      return !b.path;
    case "video":
      return !b.path;
    case "gallery":
      return b.items.length === 0;
    case "quote":
      return !b.text.trim();
    case "cta":
      return !b.label.trim() || !b.url.trim();
    case "embed":
      return !b.url.trim();
  }
}

const EMBED_HOSTS = [
  "youtube.com",
  "www.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
  "youtu.be",
  "player.vimeo.com",
  "open.spotify.com",
  "w.soundcloud.com",
  "bandcamp.com",
  "www.google.com",
];

/** Only allow well-known embed providers, and normalise YouTube share links. */
export function safeEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw.trim());
    if (u.protocol !== "https:") return null;
    if (!EMBED_HOSTS.includes(u.hostname)) return null;
    if (u.hostname === "youtu.be") {
      return `https://www.youtube-nocookie.com/embed/${u.pathname.replace(/^\//, "")}`;
    }
    if (u.hostname.endsWith("youtube.com") && u.pathname === "/watch") {
      const v = u.searchParams.get("v");
      return v ? `https://www.youtube-nocookie.com/embed/${v}` : null;
    }
    return u.toString();
  } catch {
    return null;
  }
}

/** Safe outbound / internal link for CTA blocks. */
export function safeLinkUrl(raw: string): string | null {
  const v = raw.trim();
  if (!v) return null;
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" || u.protocol === "mailto:"
      ? u.toString()
      : null;
  } catch {
    return null;
  }
}
