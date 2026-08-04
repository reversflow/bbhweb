import { createFileRoute } from "@tanstack/react-router";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { Mic, Users, BookOpen, Radio } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { SectionHeading } from "@/components/SectionHeading";
import { ImageCard } from "@/components/ImageCard";

export const Route = createFileRoute("/a-propos")({
  loader: ({ context }) => context.queryClient.ensureQueryData(seoQueryOptions),
  head: ({ loaderData }) => {
    const cfg = loaderData as SeoConfig | undefined;
    const base = cfg?.settings.baseUrl ?? "";
    return pageHead(cfg, "about", {
      path: "/a-propos",
      jsonLd: [breadcrumbJsonLd(base, [{ name: "Accueil", path: "/" }, { name: "À propos", path: "/a-propos" }])],
    });
  },
  component: AboutPage,
});

const missions = [
  { icon: Radio, title: "Créer des scènes" },
  { icon: Users, title: "Accompagner les artistes" },
  { icon: BookOpen, title: "Transmettre par les ateliers" },
  { icon: Mic, title: "Construire une communauté" },
];

const values = [
  "Indépendance",
  "Culture",
  "Transmission",
  "Diversité",
  "Authenticité",
  "Communauté",
];

function AboutPage() {
  return (
    <SiteShell>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <HeroBackdrop slot="about_hero" />
        <div className="mx-auto grid max-w-7xl gap-12 px-6 pt-24 pb-20 md:grid-cols-[1.2fr_1fr] md:items-end md:pt-32">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
              Notre histoire
            </div>
            <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
              À propos de <span className="text-gradient-blue">BBH</span>.
            </h1>
          </div>
          <p className="max-w-md text-lg text-muted-foreground">
            BBH Association est née d'une idée simple&nbsp;: ne pas attendre que les
            portes s'ouvrent, mais créer nos propres espaces pour la culture urbaine.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <ImageCard
            label="Notre terrain"
            title="Hauts-de-France"
            subtitle="Base opérationnelle"
            tone="blue"
            aspect="aspect-[4/5]"
            slot="about_vision"
          />
          <div>
            <SectionHeading
              eyebrow="Notre vision"
              title="Connecter les univers, ouvrir la scène."
              description="Nous voulons connecter les artistes, les lieux, les publics et les structures autour de projets concrets : événements, ateliers, accompagnement et rencontres."
            />
          </div>
        </div>
      </section>

      {/* Missions */}
      <section className="border-y border-white/5 bg-surface/40">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <SectionHeading eyebrow="Nos missions" title="Ce qu'on fait, concrètement." />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {missions.map((m) => (
              <div
                key={m.title}
                className="rounded-2xl border border-white/10 bg-surface/60 p-7 card-hover"
              >
                <div className="grid size-12 place-items-center rounded-xl border border-electric/30 bg-electric/10 text-electric-glow">
                  <m.icon className="size-5" />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold tracking-tight">
                  {m.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <SectionHeading eyebrow="Nos valeurs" title="Nos valeurs" />
        <div className="mt-10 flex flex-wrap gap-3">
          {values.map((v) => (
            <span
              key={v}
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-foreground transition hover:border-electric/40 hover:text-electric-glow"
            >
              {v}
            </span>
          ))}
        </div>
      </section>

      {/* All for the culture */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface p-10 md:p-20">
          <div
            className="absolute inset-0 -z-10"
            style={{ background: "var(--gradient-hero)" }}
          />
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
              Manifeste
            </div>
            <h2 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
              All for <br className="hidden sm:block" />
              the <span className="text-gradient-blue">culture.</span>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground">
              BBH n'est pas seulement un nom. C'est une manière de rassembler des
              univers différents autour d'une même énergie.
            </p>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
