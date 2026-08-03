import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Music2, Youtube, MapPin, ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaButton } from "@/components/CtaButton";
import { ImageCard } from "@/components/ImageCard";


export const Route = createFileRoute("/artistes")({
  head: () => ({
    meta: [
      { title: "Artistes BBH — Le roster" },
      {
        name: "description",
        content:
          "Un roster à taille humaine. BBH démarre avec REVERSEFLOW, artiste fondateur.",
      },
      { property: "og:title", content: "Artistes BBH" },
      {
        property: "og:description",
        content: "Découvre les artistes qui collaborent avec BBH Association.",
      },
    ],
  }),
  component: ArtistsPage,
});

const artists = [
  {
    name: "REVERSEFLOW",
    city: "Espagne / France",
    genres: ["Rap", "Trap", "Expérimental"],
    bio: "Artiste espagnol basé en France, fondateur de BBH. Univers sombre, énergie live et approche internationale — le point de départ du roster.",
    badge: "Fondateur / Artiste BBH",
    tone: "mixed" as const,
  },
];



function ArtistsPage() {
  return (
    <SiteShell>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <HeroBackdrop slot="artists_hero" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 select-none overflow-hidden">
          <div className="whitespace-nowrap text-center font-display text-[16vw] font-black leading-[0.8] tracking-tighter text-white/[0.04]">
            ROSTER
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 md:pt-32">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
            Le roster
          </div>
          <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
            Artistes BBH
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Le roster démarre avec un seul nom. On construit lentement, à la
            main, autour d'un fondateur et d'une identité claire.
          </p>
        </div>
      </section>



      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {artists.map((a) => (
            <article
              key={a.name}
              className="group grid gap-0 overflow-hidden rounded-3xl border border-white/10 bg-surface card-hover sm:grid-cols-[1fr_1.2fr]"
            >
              <ImageCard
                tone={a.tone}
                aspect="aspect-square sm:aspect-auto sm:h-full"
                title=""
                overlay={false}
                className="rounded-none border-none"
                slot="artist_reverseflow"
                alt={`Portrait de ${a.name}`}
              />

              <div className="flex flex-col justify-between p-6">
                <div>
                  <span className="inline-flex items-center rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-electric-glow">
                    {a.badge}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-black tracking-tight">
                    {a.name}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    <MapPin className="size-3" /> {a.city}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {a.genres.map((g) => (
                      <span
                        key={g}
                        className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{a.bio}</p>
                </div>
                <div className="mt-6 flex gap-2">
                  <a
                    href="#"
                    aria-label="Instagram"
                    className="grid size-9 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:border-electric/40 hover:text-foreground"
                  >
                    <Instagram className="size-4" />
                  </a>
                  <a
                    href="#"
                    aria-label="Spotify"
                    className="grid size-9 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:border-electric/40 hover:text-foreground"
                  >
                    <Music2 className="size-4" />
                  </a>
                  <a
                    href="#"
                    aria-label="YouTube"
                    className="grid size-9 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:border-electric/40 hover:text-foreground"
                  >
                    <Youtube className="size-4" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-10 md:p-16">
          <div
            className="absolute inset-0 -z-10"
            style={{ background: "var(--gradient-hero)" }}
          />
          <SectionHeading
            eyebrow="Rejoins le catalogue"
            title="Tu veux rejoindre le catalogue BBH&nbsp;?"
            description="Envoie ton profil, tes liens et ton univers. On regarde tout ce qui passe."
          />
          <div className="mt-8">
            <CtaButton to="/contact" variant="primary">
              Envoyer ton profil <ArrowRight className="size-4" />
            </CtaButton>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
