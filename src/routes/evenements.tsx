import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Calendar, MapPin, Users, Music, Heart } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { ImageCard } from "@/components/ImageCard";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaButton } from "@/components/CtaButton";

export const Route = createFileRoute("/evenements")({
  head: () => ({
    meta: [
      { title: "Événements BBH — Shows, open mics & showcases" },
      {
        name: "description",
        content:
          "Retrouve tous les événements BBH : shows, open mics, showcases et rencontres autour de la culture urbaine.",
      },
      { property: "og:title", content: "Événements BBH" },
      {
        property: "og:description",
        content: "Shows, open mics, showcases et rencontres autour de la culture urbaine.",
      },
    ],
  }),
  component: EventsPage,
});

const upcoming = [
  {
    title: "BBH LIVE Vol.2 — Lille Wazemmes",
    date: "11 juin 2026",
    location: "W Bar Terrasse, Lille",
    description:
      "Showcases internationaux, ambiance urbaine et artistes indépendants réunis autour de la scène BBH.",
    tone: "blue" as const,
  },
  {
    title: "Reverseflow Showcase",
    date: "22 mai 2026",
    location: "Maubeuge",
    description:
      "Performance live autour de l'univers Reverseflow et de la scène BBH.",
    tone: "red" as const,
  },
];

const past = [
  { title: "BBH LIVE Vol.1 — Maubeuge", tone: "purple" as const },
  { title: "Open Mic BBH", tone: "blue" as const },
  { title: "Rencontre artistes indépendants", tone: "red" as const },
];

const reasons = [
  {
    icon: Music,
    title: "Découvrir des artistes",
    text: "Une programmation qui met en avant la nouvelle scène urbaine, locale et internationale.",
  },
  {
    icon: Heart,
    title: "Vivre une ambiance authentique",
    text: "Des lieux choisis, une énergie brute, des soirées pensées pour la scène et le public.",
  },
  {
    icon: Users,
    title: "Rejoindre une communauté",
    text: "Un public fidèle, des artistes accessibles, un mouvement qui grandit ensemble.",
  },
];

function EventsPage() {
  return (
    <SiteShell>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:pt-32">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
            Programmation
          </div>
          <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
            Événements BBH
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Shows, open mics, showcases et rencontres autour de la culture urbaine.
          </p>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <ImageCard
            label="Format phare"
            title="BBH LIVE"
            subtitle="Concept signature"
            tone="mixed"
            aspect="aspect-[4/5]"
          />
          <div>
            <SectionHeading
              eyebrow="À la une"
              title="BBH LIVE"
              description="Un format pensé pour faire découvrir des artistes indépendants dans une ambiance intime, énergique et authentique."
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaButton to="/artistes" variant="secondary">
                Voir les artistes
              </CtaButton>
              <CtaButton to="/contact" variant="ghost">
                Devenir partenaire <ArrowRight className="size-4" />
              </CtaButton>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <SectionHeading eyebrow="À venir" title="Prochains événements" />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {upcoming.map((e) => (
            <article
              key={e.title}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-surface card-hover"
            >
              <ImageCard
                tone={e.tone}
                aspect="aspect-[16/10]"
                label="À venir"
                title=""
                overlay={false}
                className="rounded-none border-none"
              />
              <div className="p-7">
                <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="size-3.5 text-electric-glow" /> {e.date}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-3.5 text-electric-glow" /> {e.location}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-black tracking-tight">
                  {e.title}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">{e.description}</p>
                <div className="mt-6">
                  <CtaButton variant="secondary" href="#">
                    Voir l'événement <ArrowRight className="size-4" />
                  </CtaButton>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Past */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <SectionHeading eyebrow="Archives" title="Événements passés" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {past.map((p) => (
            <ImageCard
              key={p.title}
              label="Passé"
              title={p.title}
              tone={p.tone}
              aspect="aspect-[4/5]"
            />
          ))}
        </div>
      </section>

      {/* Why come */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <SectionHeading
          eyebrow="L'expérience"
          title="Pourquoi venir à un événement BBH&nbsp;?"
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reasons.map((r) => (
            <div
              key={r.title}
              className="rounded-2xl border border-white/10 bg-surface/60 p-7 card-hover"
            >
              <div className="grid size-12 place-items-center rounded-xl border border-electric/30 bg-electric/10 text-electric-glow">
                <r.icon className="size-5" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold tracking-tight">
                {r.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
