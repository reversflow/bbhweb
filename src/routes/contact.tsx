import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Instagram, MapPin, FileText, Send } from "lucide-react";
import { SiteShell } from "@/components/SiteShell";
import { CtaButton } from "@/components/CtaButton";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & partenariats — BBH Association" },
      {
        name: "description",
        content:
          "Contacte BBH pour un événement, un atelier, un partenariat ou une collaboration artistique.",
      },
      { property: "og:title", content: "Contact & partenariats — BBH" },
      {
        property: "og:description",
        content: "Écris-nous pour construire un projet culturel ensemble.",
      },
    ],
  }),
  component: ContactPage,
});

const types = ["Événement", "Atelier", "Artiste", "Partenariat", "Presse / autre"];

const infos = [
  { icon: Instagram, label: "Instagram", value: "@bbhassociation" },
  { icon: Mail, label: "Email", value: "contact@bbhassociation.com" },
  { icon: MapPin, label: "Base", value: "Maubeuge / Hauts-de-France" },
  { icon: FileText, label: "SIREN", value: "100854637" },
];

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <SiteShell>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-16 md:pt-32">
          <div className="text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow">
            On échange
          </div>
          <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
            Contact & <br className="sm:hidden" /> partenariats
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Artiste, partenaire, lieu, école ou structure culturelle&nbsp;: contacte
            BBH pour construire un projet.
          </p>
        </div>
      </section>

      {/* Form + info */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
          {/* form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
            className="rounded-3xl border border-white/10 bg-surface/60 p-8 md:p-10"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nom">
                <input
                  required
                  type="text"
                  placeholder="Ton nom"
                  className="input-base"
                />
              </Field>
              <Field label="Email">
                <input
                  required
                  type="email"
                  placeholder="ton@email.com"
                  className="input-base"
                />
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Type de demande">
                <select required defaultValue="" className="input-base">
                  <option value="" disabled>
                    Choisir un type
                  </option>
                  {types.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-5">
              <Field label="Message">
                <textarea
                  required
                  rows={6}
                  placeholder="Parle-nous de ton projet…"
                  className="input-base resize-none"
                />
              </Field>
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              {sent ? (
                <span className="text-sm text-electric-glow">
                  Message envoyé — on te répond vite.
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Réponse sous 3 à 5 jours ouvrés.
                </span>
              )}
              <CtaButton type="submit" variant="primary">
                Envoyer <Send className="size-4" />
              </CtaButton>
            </div>

            <style>{`
              .input-base {
                width: 100%;
                background: color-mix(in oklab, white 4%, transparent);
                border: 1px solid color-mix(in oklab, white 10%, transparent);
                border-radius: 0.875rem;
                padding: 0.9rem 1rem;
                font-size: 0.95rem;
                color: inherit;
                outline: none;
                transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
              }
              .input-base::placeholder { color: color-mix(in oklab, white 40%, transparent); }
              .input-base:focus {
                border-color: oklch(0.72 0.22 250 / 0.6);
                box-shadow: 0 0 0 4px oklch(0.72 0.22 250 / 0.15);
              }
            `}</style>
          </form>

          {/* infos */}
          <aside className="space-y-3">
            {infos.map((i) => (
              <div
                key={i.label}
                className="flex items-start gap-4 rounded-2xl border border-white/10 bg-surface/60 p-6 card-hover"
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl border border-electric/30 bg-electric/10 text-electric-glow">
                  <i.icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {i.label}
                  </div>
                  <div className="mt-1 truncate text-base font-medium text-foreground">
                    {i.value}
                  </div>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </SiteShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
