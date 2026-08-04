import { createFileRoute } from "@tanstack/react-router";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { ArrowRight, Sparkles, Users, Mic, Calendar, Radio } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { ImageCard } from "@/components/ImageCard";
import { CtaButton } from "@/components/CtaButton";
import { SectionHeading } from "@/components/SectionHeading";


export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(seoQueryOptions),
  head: ({ loaderData }) => {
    const cfg = loaderData as SeoConfig | undefined;
    const base = cfg?.settings.baseUrl ?? "";
    return pageHead(cfg, "home", {
      path: "/",
      jsonLd: [breadcrumbJsonLd(base, [{ name: "Accueil", path: "/" }])],
    });
  },
  component: Home,
});

const stats = [
  { value: "+35", label: "Artistes accompagnés" },
  { value: "+30K", label: "Personnes touchées sur les réseaux" },
  { value: "260+", label: "Sessions d'enregistrement" },
  { value: "3", label: "Pays connectés" },
];

const pillars = [
  {
    icon: Calendar,
    title: "Événements live",
    text: "Showcases, open mics, scènes rap et rencontres artistiques.",
  },
  {
    icon: Mic,
    title: "Ateliers créatifs",
    text: "Écriture rap, initiation à l'enregistrement, expression artistique et accompagnement.",
  },
  {
    icon: Users,
    title: "Réseau d'artistes",
    text: "Un catalogue vivant d'artistes qui collaborent avec BBH.",
  },
];

function Home() {
  return (
    <SiteShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 md:pt-32 md:pb-32">
          <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                <Sparkles className="size-3 text-electric-glow" />
                Hauts-de-France · Culture urbaine indépendante
              </div>
              <h1 className="mt-6 font-display text-[clamp(2.75rem,7vw,6.5rem)] font-black leading-[0.95] tracking-tighter">
                BBH — <br />
                <span className="text-gradient-blue">Élever</span> la
                <br />
                culture urbaine.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
                Événements, ateliers, artistes et projets culturels autour du rap,
                de la musique et de la communauté.
              </p>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground/80">
                BBH Association crée des espaces où les artistes émergents peuvent
                se rencontrer, performer, apprendre et construire leur univers.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <CtaButton to="/evenements" variant="primary">
                  Voir les événements <ArrowRight className="size-4" />
                </CtaButton>
                <CtaButton to="/artistes" variant="secondary">
                  Découvrir les artistes
                </CtaButton>
              </div>
            </div>

            {/* right-side floating card */}
            <div className="relative hidden lg:block">
              <ImageCard
                label="Now playing"
                title="BBH LIVE Vol.2"
                subtitle="11 juin 2026 · Lille"
                tone="mixed"
                aspect="aspect-[4/5]"
                slot="home_hero"
                alt="BBH LIVE — scène rap éclairée en bleu et violet"
                eager
              />
              <div className="absolute -bottom-6 -left-6 w-52 rotate-[-3deg]">
                <div className="rounded-2xl border border-white/10 bg-surface-elevated/80 p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-electric-glow">
                    <Radio className="size-3" /> Live
                  </div>
                  <p className="mt-2 text-sm text-foreground">
                    Une scène ouverte, une communauté connectée, un mouvement.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* hero cards row */}
          <div className="mt-16 grid gap-5 md:grid-cols-3">
            <ImageCard
              label="BBH Live"
              title="Scènes & showcases"
              tone="blue"
              aspect="aspect-[5/6]"
              slot="home_card_scenes"
              alt="Public d'un showcase BBH LIVE, mains levées sous les lumières bleues"
            />
            <ImageCard
              label="Ateliers"
              title="Écriture & studio"
              tone="red"
              aspect="aspect-[5/6]"
              slot="home_card_ateliers"
              alt="Séance d'écriture rap en studio, micro et carnet de textes"
            />
            <ImageCard
              label="Artistes BBH"
              title="Le roster"
              tone="purple"
              aspect="aspect-[5/6]"
              slot="home_card_artistes"
              alt="Portrait éditorial d'un artiste BBH sous une lumière violette"
            />
          </div>

        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/5 bg-surface/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-5xl font-black tracking-tighter text-foreground sm:text-6xl">
                {s.value}
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground sm:text-sm">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MOVEMENT */}
      <section className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.1fr]">
          <SectionHeading
            eyebrow="Le mouvement"
            title="Un mouvement culturel, pas juste des événements."
            description="BBH rassemble artistes, publics, lieux culturels et partenaires autour d'une vision simple : créer des opportunités concrètes pour la scène urbaine indépendante."
          />
          <div className="grid gap-4 sm:grid-cols-1">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="group flex gap-5 rounded-2xl border border-white/10 bg-surface/60 p-6 transition hover:border-electric/40 hover:bg-surface"
              >
                <div className="grid size-12 shrink-0 place-items-center rounded-xl border border-electric/30 bg-electric/10 text-electric-glow">
                  <p.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-xl font-bold tracking-tight">
                    {p.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
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
                Rejoins-nous
              </div>
              <h2 className="mt-4 font-display text-4xl font-black tracking-tighter sm:text-5xl md:text-6xl">
                Tu veux faire partie du mouvement&nbsp;?
              </h2>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
                Artiste, lieu, association, école ou partenaire&nbsp;: construisons
                quelque chose ensemble.
              </p>
            </div>
            <div className="flex md:justify-end">
              <CtaButton to="/contact" variant="primary">
                Nous contacter <ArrowRight className="size-4" />
              </CtaButton>
            </div>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
