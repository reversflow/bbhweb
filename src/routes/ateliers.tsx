import { createFileRoute, Link } from "@tanstack/react-router";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { ArrowRight } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaButton } from "@/components/CtaButton";
import { WORKSHOPS as workshops } from "@/lib/workshops.data";

export const Route = createFileRoute("/ateliers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(seoQueryOptions),
  head: ({ loaderData }) => {
    const cfg = loaderData as SeoConfig | undefined;
    const base = cfg?.settings.baseUrl ?? "";
    return pageHead(cfg, "workshops", {
      path: "/ateliers",
      jsonLd: [breadcrumbJsonLd(base, [{ name: "Accueil", path: "/" }, { name: "Ateliers", path: "/ateliers" }])],
    });
  },
  component: WorkshopsPage,
});

const audiences = [
  "Écoles",
  "MJC",
  "Centres sociaux",
  "Associations",
  "Mairies",
  "Jeunes artistes",
  "Structures culturelles",
];

const formats = [
  {
    title: "Atelier ponctuel",
    text: "Une intervention unique, format court, pensée comme une découverte forte.",
  },
  {
    title: "Cycle de plusieurs séances",
    text: "Un parcours progressif pour construire un vrai projet artistique dans la durée.",
  },
  {
    title: "Intervention sur mesure",
    text: "Un contenu adapté à ton public, ton lieu et tes objectifs pédagogiques.",
  },
  {
    title: "Restitution live ou présentation finale",
    text: "Une scène, un enregistrement ou une performance pour clôturer le cycle.",
  },
];

function WorkshopsPage() {
  return (
    <SiteShell>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <HeroBackdrop slot="workshops_hero" />
        <div className="mx-auto grid max-w-7xl gap-10 px-6 pt-24 pb-20 md:grid-cols-[1.2fr_1fr] md:items-end md:pt-32">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
              Transmission
            </div>
            <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
              Ateliers BBH
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Des ateliers autour du rap, de l'écriture, de l'expression artistique
              et des métiers de la musique.
            </p>
          </div>
          <p className="max-w-md text-sm text-muted-foreground">
            BBH propose des ateliers accessibles et concrets pour accompagner les
            jeunes, les artistes émergents et les structures culturelles dans la
            découverte de la création musicale.
          </p>
        </div>
      </section>

      {/* Workshops */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading eyebrow="Nos ateliers" title="4 formats, une même énergie" />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {workshops.map((w, i) => (
            <Link
              key={w.slug}
              to="/ateliers/$slug"
              params={{ slug: w.slug }}
              className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-surface/60 p-8 card-hover"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <div className="grid size-12 place-items-center rounded-xl border border-electric/30 bg-electric/10 text-electric-glow">
                    <w.icon className="size-5" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-black tracking-tight">
                    {w.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm text-muted-foreground">
                    {w.text}
                  </p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-electric-glow">
                    Découvrir <ArrowRight className="size-3.5" />
                  </span>
                </div>
                <span className="font-display text-5xl font-black tracking-tighter text-white/5 group-hover:text-white/10">
                  0{i + 1}
                </span>
              </div>
            </Link>
          ))}

        </div>
      </section>

      {/* Audiences */}
      <section className="border-y border-white/5 bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeading eyebrow="Pour qui ?" title="Un contenu adapté à ton public" />
          <div className="mt-10 flex flex-wrap gap-3">
            {audiences.map((a) => (
              <span
                key={a}
                className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-foreground transition hover:border-electric/40 hover:bg-electric/10 hover:text-electric-glow"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading eyebrow="Formats" title="Formats possibles" />
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {formats.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-surface/60 p-6 card-hover"
            >
              <h3 className="font-display text-lg font-bold tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
            </div>
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
          <div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
                Proposer un atelier
              </div>
              <h2 className="mt-4 font-display text-4xl font-black tracking-tighter sm:text-5xl">
                Construisons un atelier ensemble.
              </h2>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Écris-nous ton contexte, ton public et ton objectif — on construit
                une proposition adaptée.
              </p>
            </div>
            <div className="flex md:justify-end">
              <CtaButton to="/contact" variant="primary">
                Contacter BBH <ArrowRight className="size-4" />
              </CtaButton>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
