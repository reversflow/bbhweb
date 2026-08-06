import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/SiteShell";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CtaButton } from "@/components/CtaButton";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd, absoluteUrl } from "@/lib/seo";
import { findWorkshop } from "@/lib/workshops.data";
import { ArrowLeft, ArrowRight, Users, Clock } from "lucide-react";

export const Route = createFileRoute("/ateliers/$slug")({
  loader: ({ context }) => context.queryClient.ensureQueryData(seoQueryOptions),
  head: ({ loaderData, params }) => {
    const cfg = loaderData as SeoConfig | undefined;
    const base = cfg?.settings.baseUrl ?? "";
    const path = `/ateliers/${params.slug}`;
    const w = findWorkshop(params.slug);
    if (!w) {
      return pageHead(cfg, "workshops", {
        path,
        title: "Atelier introuvable — BBH Association",
        description: "Cet atelier n'est pas disponible.",
        noindex: true,
      });
    }
    return pageHead(cfg, "workshops", {
      path,
      title: `${w.title} — Ateliers BBH`,
      description: w.text,
      jsonLd: [
        breadcrumbJsonLd(base, [
          { name: "Accueil", path: "/" },
          { name: "Ateliers", path: "/ateliers" },
          { name: w.title, path },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "Course",
          name: w.title,
          description: w.detail,
          url: absoluteUrl(base, path),
          provider: {
            "@type": "Organization",
            name: cfg?.settings.siteName || "BBH Association",
          },
        },
      ],
    });
  },
  component: WorkshopDetail,
});

function WorkshopDetail() {
  const { slug } = Route.useParams();
  const w = findWorkshop(slug);

  if (!w) {
    return (
      <SiteShell>
        <section className="mx-auto max-w-3xl px-6 py-32 text-center">
          <h1 className="font-display text-5xl font-black tracking-tighter">Atelier introuvable</h1>
          <p className="mt-4 text-muted-foreground">Cet atelier n'existe pas.</p>
          <div className="mt-8 flex justify-center">
            <CtaButton to="/ateliers" variant="primary">
              <ArrowLeft className="size-4" /> Tous les ateliers
            </CtaButton>
          </div>
        </section>
      </SiteShell>
    );
  }

  const Icon = w.icon;

  return (
    <SiteShell>
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-4xl px-6 pt-10 pb-16">
          <Breadcrumbs
            items={[
              { name: "Accueil", path: "/" },
              { name: "Ateliers", path: "/ateliers" },
              { name: w.title, path: `/ateliers/${w.slug}` },
            ]}
          />
          <div className="mt-8 inline-flex size-12 items-center justify-center rounded-2xl border border-electric/30 bg-electric/10 text-electric-glow">
            <Icon className="size-5" />
          </div>
          <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-6xl">
            {w.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{w.text}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="font-display text-3xl font-black tracking-tighter">Le déroulé</h2>
        <p className="mt-4 text-base text-muted-foreground">{w.detail}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-surface/40 p-6">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              <Users className="size-3.5" /> Public
            </div>
            <p className="mt-3 text-sm text-foreground/90">{w.audience}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-surface/40 p-6">
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              <Clock className="size-3.5" /> Durée
            </div>
            <p className="mt-3 text-sm text-foreground/90">{w.duration}</p>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap gap-3">
          <CtaButton to="/contact" variant="primary">
            Organiser cet atelier <ArrowRight className="size-4" />
          </CtaButton>
          <CtaButton to="/ateliers" variant="secondary">
            <ArrowLeft className="size-4" /> Tous les ateliers
          </CtaButton>
        </div>
      </section>
    </SiteShell>
  );
}
