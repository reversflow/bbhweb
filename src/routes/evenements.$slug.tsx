import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ImageCard } from "@/components/ImageCard";
import { CtaButton } from "@/components/CtaButton";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { getPublicEvent } from "@/lib/events.functions";
import {
  formatEventDate,
  formatEventLocation,
  eventPriceLabel,
  type EventRecord,
} from "@/lib/events.shared";
import { sanitizeRichText } from "@/lib/site-content.shared";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { SiteVideo } from "@/components/SiteVideo";
import { Calendar, MapPin, Clock, Ticket, Users, Mail, Phone, ArrowRight, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/evenements/$slug")({
  loader: async ({ context, params }) => {
    const [seo, data] = await Promise.all([
      context.queryClient.ensureQueryData(seoQueryOptions),
      getPublicEvent({ data: { slug: params.slug } }),
    ]);
    return { seo: seo as SeoConfig, ...data };
  },
  head: ({ loaderData, params }) => {
    const cfg = loaderData?.seo;
    const event = loaderData?.event as EventRecord | null | undefined;
    const base = cfg?.settings.baseUrl ?? "";
    const path = `/evenements/${params.slug}`;

    if (!event) {
      return pageHead(cfg, "events", {
        path,
        title: "Événement introuvable — BBH Association",
        description: "Cet événement n'est pas disponible.",
        noindex: true,
      });
    }

    const title = event.seo_title || `${event.title} — BBH Association`;
    const description =
      event.seo_description || event.short_description || cfg?.settings.defaultDescription;

    const jsonLd: unknown[] = [
      breadcrumbJsonLd(base, [
        { name: "Accueil", path: "/" },
        { name: "Événements", path: "/evenements" },
        { name: event.title, path },
      ]),
      {
        "@context": "https://schema.org",
        "@type": event.event_type === "concert" || event.event_type === "showcase" ? "MusicEvent" : "Event",
        name: event.title,
        url: absoluteUrl(base, path),
        description: event.short_description || undefined,
        startDate: event.start_date
          ? `${event.start_date}${event.start_time ? `T${event.start_time}` : ""}`
          : undefined,
        endDate: event.end_date
          ? `${event.end_date}${event.end_time ? `T${event.end_time}` : ""}`
          : undefined,
        eventStatus:
          event.status === "cancelled"
            ? "https://schema.org/EventCancelled"
            : "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location:
          event.venue_name || event.city
            ? {
                "@type": "Place",
                name: event.venue_name || event.city,
                address: {
                  "@type": "PostalAddress",
                  streetAddress: event.address || undefined,
                  addressLocality: event.city || undefined,
                  postalCode: event.postal_code || undefined,
                  addressCountry: event.country || "FR",
                },
                geo:
                  event.latitude != null && event.longitude != null
                    ? { "@type": "GeoCoordinates", latitude: event.latitude, longitude: event.longitude }
                    : undefined,
              }
            : undefined,
        performer: event.artists.length
          ? event.artists.map((a) => ({ "@type": "MusicGroup", name: a }))
          : undefined,
        organizer: event.organizer ? { "@type": "Organization", name: event.organizer } : undefined,
        maximumAttendeeCapacity: event.capacity ?? undefined,
        offers:
          event.is_free || event.ticket_price != null
            ? {
                "@type": "Offer",
                price: event.is_free ? 0 : event.ticket_price,
                priceCurrency: event.currency || "EUR",
                url: event.ticket_url || absoluteUrl(base, path),
                availability: "https://schema.org/InStock",
              }
            : undefined,
      },
    ];

    return pageHead(cfg, "events", {
      path,
      title,
      description,
      ogTitle: event.title,
      ogDescription: description,
      image: event.og_image || null,
      type: "article",
      aiSummary: event.ai_summary || undefined,
      noindex: event.noindex,
      jsonLd,
    });
  },
  component: EventDetailPage,
});

function EventDetailPage() {
  const { event, related, redirectTo } = Route.useLoaderData() as {
    event: EventRecord | null;
    related: EventRecord[];
    redirectTo: string | null;
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (!event && redirectTo) navigate({ to: redirectTo, replace: true });
  }, [event, redirectTo, navigate]);

  if (!event) {
    return (
      <SiteShell>
        <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
          <h1 className="font-display text-4xl font-black tracking-tighter sm:text-5xl">
            Événement introuvable
          </h1>
          <p className="mt-4 text-muted-foreground">
            {redirectTo
              ? "Redirection vers la nouvelle adresse…"
              : "Cet événement n'existe pas ou n'est plus publié."}
          </p>
          <div className="mt-8">
            <CtaButton to="/evenements" variant="secondary">
              <ArrowLeft className="size-4" /> Tous les événements
            </CtaButton>
          </div>
        </section>
      </SiteShell>
    );
  }

  const date = formatEventDate(event.start_date);
  const place = formatEventLocation(event);
  const price = eventPriceLabel(event);
  const address = [event.address, [event.postal_code, event.city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
  const time = [event.start_time, event.end_time].filter(Boolean).join(" – ");

  return (
    <SiteShell>
      <div className="mx-auto max-w-5xl px-6 pt-10">
        <Breadcrumbs
          items={[
            { name: "Accueil", path: "/" },
            { name: "Événements", path: "/evenements" },
            { name: event.title, path: `/evenements/${event.slug}` },
          ]}
        />
      </div>

      <article className="mx-auto max-w-5xl px-6 pb-24 pt-8">
        <header>
          <span className="inline-flex items-center rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-electric-glow">
            {event.status === "past" ? "Archive" : event.status === "cancelled" ? "Annulé" : "À venir"}
          </span>
          <h1 className="mt-5 font-display text-4xl font-black leading-[0.98] tracking-tighter sm:text-6xl">
            {event.title}
          </h1>
          {event.short_description && (
            <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{event.short_description}</p>
          )}
        </header>

        {event.hero_video ? (
          <div className="mt-10">
            <SiteVideo
              path={event.hero_video}
              poster={event.hero_video_poster || undefined}
              label={event.title}
              className="rounded-2xl border border-white/10"
            />
          </div>
        ) : (
        <div className="mt-10">
          <ImageCard
            slot={event.main_image || undefined}
            alt={event.image_alt || `${event.title}${place ? ` — ${place}` : ""}`}
            aspect="aspect-[16/9]"
            tone="mixed"
            overlay={false}
            title=""
            eager
          />
        </div>
        )}

        <dl className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-surface/60 p-6 sm:grid-cols-2">
          {date && (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Date</dt>
              <dd className="mt-1 inline-flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-electric-glow" aria-hidden="true" /> {date}
              </dd>
            </div>
          )}
          {time && (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Horaires</dt>
              <dd className="mt-1 inline-flex items-center gap-2 text-sm">
                <Clock className="size-4 text-electric-glow" aria-hidden="true" /> {time}
              </dd>
            </div>
          )}
          {place && (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Lieu</dt>
              <dd className="mt-1 inline-flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-electric-glow" aria-hidden="true" /> {place}
              </dd>
            </div>
          )}
          {address && (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Adresse</dt>
              <dd className="mt-1 text-sm">{address}</dd>
            </div>
          )}
          {price && (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Tarif</dt>
              <dd className="mt-1 inline-flex items-center gap-2 text-sm">
                <Ticket className="size-4 text-electric-glow" aria-hidden="true" /> {price}
              </dd>
            </div>
          )}
          {event.capacity != null && (
            <div>
              <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Capacité</dt>
              <dd className="mt-1 inline-flex items-center gap-2 text-sm">
                <Users className="size-4 text-electric-glow" aria-hidden="true" /> {event.capacity} places
              </dd>
            </div>
          )}
        </dl>

        {(event.ticket_url || event.registration_url || event.cta_url) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {event.ticket_url && (
              <CtaButton href={event.ticket_url} external variant="primary">
                Billetterie <ArrowRight className="size-4" />
              </CtaButton>
            )}
            {event.registration_url && (
              <CtaButton href={event.registration_url} external variant="secondary">
                S'inscrire
              </CtaButton>
            )}
            {event.cta_url && event.cta_label && (
              <CtaButton
                href={/^https?:\/\//.test(event.cta_url) ? event.cta_url : undefined}
                to={/^https?:\/\//.test(event.cta_url) ? undefined : event.cta_url}
                external={/^https?:\/\//.test(event.cta_url)}
                variant="ghost"
              >
                {event.cta_label}
              </CtaButton>
            )}
          </div>
        )}

        {event.full_description && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-black tracking-tight">À propos de l'événement</h2>
            <div
              className="prose-bbh mt-4 space-y-4 text-base leading-relaxed text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizeRichText(event.full_description) }}
            />
          </section>
        )}

        <BlockRenderer blocks={event.blocks} />


        {event.artists.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-black tracking-tight">Artistes</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {event.artists.map((a) => (
                <li
                  key={a}
                  className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-muted-foreground"
                >
                  {a}
                </li>
              ))}
            </ul>
          </section>
        )}

        {event.partners.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-black tracking-tight">Partenaires</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {event.partners.map((p) => (
                <li key={p} className="rounded-full border border-white/10 px-3.5 py-1.5 text-sm text-muted-foreground">
                  {p}
                </li>
              ))}
            </ul>
          </section>
        )}

        {(event.organizer || event.contact_email || event.contact_phone) && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-black tracking-tight">Informations pratiques</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {event.organizer && <li>Organisé par {event.organizer}</li>}
              {event.contact_email && (
                <li>
                  <a
                    href={`mailto:${event.contact_email}`}
                    className="inline-flex items-center gap-2 transition hover:text-foreground"
                  >
                    <Mail className="size-4" aria-hidden="true" /> {event.contact_email}
                  </a>
                </li>
              )}
              {event.contact_phone && (
                <li>
                  <a
                    href={`tel:${event.contact_phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2 transition hover:text-foreground"
                  >
                    <Phone className="size-4" aria-hidden="true" /> {event.contact_phone}
                  </a>
                </li>
              )}
            </ul>
          </section>
        )}

        {event.gallery.length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-black tracking-tight">Galerie</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {event.gallery.map((slot) => (
                <ImageCard key={slot} slot={slot} aspect="aspect-[4/3]" overlay={false} title="" tone="mixed" />
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display text-2xl font-black tracking-tight">Autres événements</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    to="/evenements/$slug"
                    params={{ slug: r.slug }}
                    className="block h-full rounded-2xl border border-white/10 bg-surface/60 p-5 transition hover:border-electric/40"
                  >
                    <span className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      {formatEventDate(r.start_date) || (r.status === "past" ? "Archive" : "Prochainement")}
                    </span>
                    <span className="mt-2 block font-display text-lg font-bold tracking-tight">{r.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </SiteShell>
  );
}
