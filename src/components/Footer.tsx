import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/BrandLogo";
import { Instagram, Youtube, Music2, Mail } from "lucide-react";

const groups = [
  {
    title: "Navigation",
    links: [
      { to: "/", label: "Accueil" },
      { to: "/evenements", label: "Événements" },
      { to: "/ateliers", label: "Ateliers" },
      { to: "/artistes", label: "Artistes" },
      { to: "/a-propos", label: "À propos" },
      { to: "/contact", label: "Contact" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="mt-32 border-t border-white/5 bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <div><BrandLogo className="text-4xl" imgClassName="h-12" /></div>
          <p className="mt-3 max-w-sm text-lg font-medium text-foreground">
            All for the culture.
          </p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Association culturelle basée en Hauts-de-France. Événements, ateliers et
            accompagnement d'artistes autour de la culture urbaine.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="https://instagram.com/bbhassociation"
              className="grid size-10 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:border-electric/50 hover:text-foreground"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </a>
            <a
              href="#"
              className="grid size-10 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:border-electric/50 hover:text-foreground"
              aria-label="YouTube"
            >
              <Youtube className="size-4" />
            </a>
            <a
              href="#"
              className="grid size-10 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:border-electric/50 hover:text-foreground"
              aria-label="Spotify"
            >
              <Music2 className="size-4" />
            </a>
            <a
              href="mailto:contact@bbhassociation.com"
              className="grid size-10 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:border-electric/50 hover:text-foreground"
              aria-label="Email"
            >
              <Mail className="size-4" />
            </a>
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.title}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {g.title}
            </h4>
            <ul className="mt-4 space-y-2">
              {g.links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-muted-foreground transition hover:text-foreground"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Contact
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>contact@bbhassociation.com</li>
            <li>@bbhassociation</li>
            <li>Maubeuge / Hauts-de-France</li>
            <li className="pt-2 text-xs">SIREN&nbsp;: 100854637</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} BBH Association. Tous droits réservés.</span>
          <span>Élever la culture urbaine.</span>
        </div>
      </div>
    </footer>
  );
}
