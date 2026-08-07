import { mediaUrl } from "@/lib/site-images.functions";
import { SiteVideo } from "@/components/SiteVideo";
import {
  blockIsEmpty,
  safeEmbedUrl,
  safeLinkUrl,
  type Block,
} from "@/lib/blocks.shared";

/** Renders an admin-authored block layout with the BBH editorial styling. */
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  const visible = blocks.filter((b) => !blockIsEmpty(b));
  if (visible.length === 0) return null;

  return (
    <div className="mt-12 space-y-10">
      {visible.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </div>
  );
}

function BlockView({ block: b }: { block: Block }) {
  switch (b.type) {
    case "heading":
      return b.level === 3 ? (
        <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{b.text}</h3>
      ) : (
        <h2 className="font-display text-2xl font-black tracking-tighter sm:text-3xl">{b.text}</h2>
      );

    case "text":
      return (
        <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
          {b.text.split(/\n{2,}/).map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>
      );

    case "image":
      return (
        <figure>
          <img
            src={mediaUrl(b.path)}
            alt={b.alt}
            loading="lazy"
            decoding="async"
            className="w-full rounded-2xl border border-white/10 object-cover"
          />
          {b.caption && (
            <figcaption className="mt-2 text-xs text-muted-foreground">{b.caption}</figcaption>
          )}
        </figure>
      );

    case "video":
      return (
        <figure>
          <SiteVideo
            path={b.path}
            poster={b.poster || undefined}
            autoplay={b.autoplay}
            loop={b.loop}
            label={b.caption || undefined}
            className="rounded-2xl border border-white/10"
          />
          {b.caption && (
            <figcaption className="mt-2 text-xs text-muted-foreground">{b.caption}</figcaption>
          )}
        </figure>
      );

    case "gallery":
      return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {b.items.map((it, i) => (
            <img
              key={`${it.path}-${i}`}
              src={mediaUrl(it.path)}
              alt={it.alt}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full rounded-xl border border-white/10 object-cover"
            />
          ))}
        </div>
      );

    case "quote":
      return (
        <blockquote className="border-l-2 border-electric/60 pl-6">
          <p className="font-display text-xl italic leading-snug tracking-tight sm:text-2xl">
            “{b.text}”
          </p>
          {b.author && (
            <cite className="mt-3 block text-[11px] font-semibold uppercase not-italic tracking-[0.2em] text-muted-foreground">
              {b.author}
            </cite>
          )}
        </blockquote>
      );

    case "cta": {
      const href = safeLinkUrl(b.url);
      if (!href) return null;
      const external = /^https?:/.test(href);
      return (
        <div>
          <a
            href={href}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
          >
            {b.label}
          </a>
        </div>
      );
    }

    case "embed": {
      const src = safeEmbedUrl(b.url);
      if (!src) return null;
      return (
        <div className="aspect-video overflow-hidden rounded-2xl border border-white/10">
          <iframe
            src={src}
            title={b.title || "Contenu intégré"}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        </div>
      );
    }
  }
}
