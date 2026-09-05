import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageCard } from "@/components/ImageCard";
import { CtaButton } from "@/components/CtaButton";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { getPublicArtist } from "@/lib/artists.functions";
import { localizeArtist, type ArtistRecord } from "@/lib/artists.shared";
import { useLocale, useT } from "@/lib/i18n";
import { Instagram, Music2, Youtube, MapPin, ArrowLeft, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/artistes/$slug")({
  loader: async ({ context, params }) => {
    const [seo, data] = await Promise.all([
      context.queryClient.ensureQueryData(seoQueryOptions),
      getPublicArtist({ data: { slug: params.slug } }),
    ]);
    if (!data.artist) throw notFound();
    return { seo: seo as SeoConfig, ...data };
  },
  head: ({ loaderData, params }) => {
    const cfg = loaderData?.seo;
    const artist = loaderData?.artist;
    const base = cfg?.settings.baseUrl ?? "";
    const path = `/artistes/${params.slug}`;
    if (!artist) {
      return pageHead(cfg, "artists", {
        path,
        title: "Artiste introuvable — BBH Association",
        description: "Cet artiste n'est pas disponible.",
        noindex: true,
      });
    }
    const title = `${artist.name} — Artiste BBH`;
    const description =
      artist.bio?.slice(0, 200) || `${artist.name}, artiste du roster BBH Association.`;
    return pageHead(cfg, "artists", {
      path,
      title,
      description,
      type: "profile",
      jsonLd: [
        breadcrumbJsonLd(base, [
          { name: "Accueil", path: "/" },
          { name: "Artistes", path: "/artistes" },
          { name: artist.name, path },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "MusicGroup",
          name: artist.name,
          url: absoluteUrl(base, path),
          description: artist.bio || undefined,
          genre: artist.genres?.length ? artist.genres : undefined,
          sameAs: [artist.instagram, artist.spotify, artist.youtube].filter(Boolean),
        },
      ],
    });
  },
  notFoundComponent: ArtistNotFound,
  errorComponent: ArtistNotFound,
  component: ArtistDetail,
});

function ArtistNotFound() {
  return (
    <SiteShell>
      <section className="mx-auto max-w-3xl px-6 py-32 text-center">
        <h1 className="font-display text-5xl font-black tracking-tighter">Artiste introuvable</h1>
        <p className="mt-4 text-muted-foreground">Cet artiste n'existe pas ou n'est plus en ligne.</p>
        <div className="mt-8 flex justify-center">
          <CtaButton to="/artistes" variant="primary">
            <ArrowLeft className="size-4" /> Retour au roster
          </CtaButton>
        </div>
      </section>
    </SiteShell>
  );
}

function ArtistDetail() {
  const { artist: raw, songs } = Route.useLoaderData() as {
    artist: ArtistRecord | null;
    songs: { slug: string; title: string }[];
  };
  const { locale } = useLocale();
  const t = useT();
  if (!raw) return <ArtistNotFound />;
  const artist = localizeArtist(raw, locale);

  const socials = [
    { href: artist.instagram, label: "Instagram", Icon: Instagram },
    { href: artist.spotify, label: "Spotify", Icon: Music2 },
    { href: artist.youtube, label: "YouTube", Icon: Youtube },
  ].filter((s) => !!s.href);

  return (
    <SiteShell>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-7xl px-6 pt-10 pb-16">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: "Artistes", path: "/artistes" },
              { name: artist.name, path: `/artistes/${artist.slug}` },
            ]}
          />
          <div className="mt-8 grid gap-10 md:grid-cols-[1fr_1.3fr]">
            <ImageCard
              tone="mixed"
              aspect="aspect-square"
              title=""
              overlay={false}
              slot={artist.isFounder ? "artist_reverseflow" : undefined}
              alt={`Portrait de ${artist.name}`}
            />
            <div>
              {artist.badge && (
                <span className="inline-flex items-center rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-electric-glow">
                  {artist.badge}
                </span>
              )}
              <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-6xl">
                {artist.name}
              </h1>
              {artist.origin && (
                <div className="mt-3 flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <MapPin className="size-3" /> {artist.origin}
                </div>
              )}
              {artist.genres?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {artist.genres.map((g) => (
                    <span
                      key={g}
                      className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
              {artist.bio && (
                <p className="mt-6 max-w-2xl text-base text-muted-foreground">{artist.bio}</p>
              )}
              {socials.length > 0 && (
                <div className="mt-8 flex gap-2">
                  {socials.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="grid size-9 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:border-electric/40 hover:text-foreground"
                    >
                      <Icon className="size-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {songs.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-16">
          <h2 className="font-display text-3xl font-black tracking-tighter">{t("artist.music")}</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((s) => (
              <li key={s.slug}>
                <Link
                  to="/musique/$slug"
                  params={{ slug: s.slug }}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-surface/40 px-5 py-4 text-sm transition hover:border-electric/40"
                >
                  {s.title}
                  <ArrowRight className="size-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pb-32">
        <CtaButton to="/artistes" variant="secondary">
          <ArrowLeft className="size-4" /> {t("artist.roster")}
        </CtaButton>
      </section>
    </SiteShell>
  );
}
