import { useLocale } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { ArrowRight, Calendar, MapPin, Users, Music, Heart } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { ImageCard } from "@/components/ImageCard";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaButton } from "@/components/CtaButton";
import { listPublicEvents } from "@/lib/events.functions";
import { getSiteContent } from "@/lib/site-content.functions";
import { formatEventDate, formatEventLocation, localizeEvent, type EventRecord } from "@/lib/events.shared";
import { contentText, contentLink, type SiteContentBundle } from "@/lib/site-content.shared";

export const Route = createFileRoute("/evenements")({
  loader: async ({ context }) => {
    const [seo, events, bundle] = await Promise.all([
      context.queryClient.ensureQueryData(seoQueryOptions),
      listPublicEvents(),
      getSiteContent(),
    ]);
    return { seo: seo as SeoConfig, events, bundle };
  },
  head: ({ loaderData }) => {
    const cfg = loaderData?.seo;
    const base = cfg?.settings.baseUrl ?? "";
    const upcoming = (loaderData?.events ?? []).filter((e) => e.status === "upcoming");
    return pageHead(cfg, "events", {
      path: "/evenements",
      jsonLd: [
        breadcrumbJsonLd(base, [
          { name: "Accueil", path: "/" },
          { name: "Événements", path: "/evenements" },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Prochains événements BBH Association",
          itemListElement: upcoming.map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(base, `/evenements/${e.slug}`),
            name: e.title,
          })),
        },
      ],
    });
  },
  component: EventsPage,
});

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
  const { locale } = useLocale();
  const { events: rawEvents, bundle } = Route.useLoaderData() as {
    events: EventRecord[];
    bundle: SiteContentBundle;
  };
  const events = rawEvents.map((e) => localizeEvent(e, locale));
  const upcoming = events.filter((e) => e.status !== "past");
  const past = events.filter((e) => e.status === "past");
  const artistsCta = contentLink(bundle, "events.cta.artists", "Voir les artistes", "/artistes");
  const partnerCta = contentLink(bundle, "events.cta.partner", "Devenir partenaire", "/contact");

  return (
    <SiteShell>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <HeroBackdrop slot="events_hero" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 md:pt-32">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
            {contentText(bundle, "events.hero.eyebrow", "Programmation")}
          </div>
          <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
            {contentText(bundle, "events.hero.title", "Événements BBH")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {contentText(
              bundle,
              "events.hero.intro",
              "Shows, open mics, showcases et rencontres autour de la culture urbaine.",
            )}
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
            slot="events_featured_bbhlive"
          />
          <div>
            <SectionHeading
              eyebrow={contentText(bundle, "events.featured.eyebrow", "À la une")}
              title={contentText(bundle, "events.featured.title", "BBH LIVE")}
              description={contentText(
                bundle,
                "events.featured.text",
                "Un format pensé pour faire découvrir des artistes indépendants dans une ambiance intime, énergique et authentique.",
              )}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <CtaButton to={artistsCta.url} variant="secondary">
                {artistsCta.label}
              </CtaButton>
              <CtaButton to={partnerCta.url} variant="ghost">
                {partnerCta.label} <ArrowRight className="size-4" />
              </CtaButton>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <SectionHeading
          eyebrow={contentText(bundle, "events.upcoming.eyebrow", "À venir")}
          title={contentText(bundle, "events.upcoming.title", "Prochains événements")}
        />
        {upcoming.length === 0 ? (
          <p className="mt-10 text-muted-foreground">
            Aucun événement programmé pour le moment. Reviens bientôt ou suis-nous sur les réseaux.
          </p>
        ) : (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {upcoming.map((e) => {
              const date = formatEventDate(e.start_date);
              const place = formatEventLocation(e);
              return (
                <article
                  key={e.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-surface card-hover"
                >
                  <Link to="/evenements/$slug" params={{ slug: e.slug }} tabIndex={-1} aria-hidden="true">
                    <ImageCard
                      tone="blue"
                      aspect="aspect-[16/10]"
                      label={e.status === "cancelled" ? "Annulé" : "À venir"}
                      title=""
                      overlay={false}
                      className="rounded-none border-none"
                      slot={e.main_image || undefined}
                      alt={e.image_alt || `${e.title}${place ? ` — ${place}` : ""}`}
                    />
                  </Link>
                  <div className="p-7">
                    <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      {date && (
                        <span className="inline-flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-electric-glow" aria-hidden="true" /> {date}
                        </span>
                      )}
                      {place && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3.5 text-electric-glow" aria-hidden="true" /> {place}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-black tracking-tight">
                      <Link to="/evenements/$slug" params={{ slug: e.slug }} className="transition hover:text-electric-glow">
                        {e.title}
                      </Link>
                    </h3>
                    {e.short_description && (
                      <p className="mt-3 text-sm text-muted-foreground">{e.short_description}</p>
                    )}
                    <div className="mt-6">
                      <CtaButton variant="secondary" to={`/evenements/${e.slug}`}>
                        Voir l'événement <ArrowRight className="size-4" />
                      </CtaButton>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-24">
          <SectionHeading
            eyebrow={contentText(bundle, "events.past.eyebrow", "Archives")}
            title={contentText(bundle, "events.past.title", "Événements passés")}
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {past.map((p) => (
              <Link
                key={p.id}
                to="/evenements/$slug"
                params={{ slug: p.slug }}
                className="block rounded-3xl transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-electric"
              >
                <ImageCard
                  label="Passé"
                  title={p.title}
                  tone="purple"
                  aspect="aspect-[4/5]"
                  slot={p.main_image || undefined}
                  alt={p.image_alt || `${p.title} — événement passé de BBH Association`}
                />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Why come */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <SectionHeading
          eyebrow={contentText(bundle, "events.why.eyebrow", "L'expérience")}
          title={contentText(bundle, "events.why.title", "Pourquoi venir à un événement BBH ?")}
        />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reasons.map((r) => (
            <div key={r.title} className="rounded-2xl border border-white/10 bg-surface/60 p-7 card-hover">
              <div className="grid size-12 place-items-center rounded-xl border border-electric/30 bg-electric/10 text-electric-glow">
                <r.icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 font-display text-xl font-bold tracking-tight">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
