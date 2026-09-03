import { BrandLogo } from "@/components/BrandLogo";
import { NavItem } from "@/components/NavItem";
import { useNavLinks, useSiteContentBundle } from "@/hooks/use-content";
import { useHydrated } from "@/hooks/use-hydrated";
import { contentText } from "@/lib/site-content.shared";
import type { NavLink } from "@/lib/site-content.shared";
import { Instagram, Youtube, Music2, Mail, Globe } from "lucide-react";
import { useLocale, useT, DEFAULT_LOCALE } from "@/lib/i18n";

const NAV_KEYS: Record<string, string> = {
  "/": "nav.home",
  "/musique": "nav.music",
  "/evenements": "nav.events",
  "/ateliers": "nav.workshops",
  "/artistes": "nav.artists",
  "/journal": "nav.journal",
  "/a-propos": "nav.about",
  "/contact": "nav.contact",
};

type SimpleLink = Pick<NavLink, "label" | "url" | "external" | "new_tab">;

const defaultFooterLinks: SimpleLink[] = [
  { url: "/", label: "Accueil", external: false, new_tab: false },
  { url: "/evenements", label: "Événements", external: false, new_tab: false },
  { url: "/ateliers", label: "Ateliers", external: false, new_tab: false },
  { url: "/artistes", label: "Artistes", external: false, new_tab: false },
  { url: "/a-propos", label: "À propos", external: false, new_tab: false },
  { url: "/contact", label: "Contact", external: false, new_tab: false },
];

const defaultSocial: SimpleLink[] = [
  { url: "https://instagram.com/bbhassociation", label: "Instagram", external: true, new_tab: true },
  { url: "mailto:contact@bbhassociation.com", label: "Email", external: true, new_tab: false },
];

function socialIcon(label: string) {
  const l = label.toLowerCase();
  if (l.includes("insta")) return Instagram;
  if (l.includes("you")) return Youtube;
  if (l.includes("spotify") || l.includes("music")) return Music2;
  if (l.includes("mail") || l.includes("@")) return Mail;
  return Globe;
}

export function Footer() {
  const hydrated = useHydrated();
  const { locale } = useLocale();
  const t = useT();
  const { data: bundle } = useSiteContentBundle();
  const cmsFooter = useNavLinks("footer");
  const cmsLegal = useNavLinks("legal");
  const cmsSocial = useNavLinks("social");

  const rawLinks = hydrated && cmsFooter.length > 0 ? cmsFooter : defaultFooterLinks;
  const links: SimpleLink[] =
    locale === DEFAULT_LOCALE
      ? rawLinks
      : rawLinks.map((l) => {
          const key = NAV_KEYS[l.url];
          return key ? { ...l, label: t(key) } : l;
        });
  const socials: SimpleLink[] = hydrated && cmsSocial.length > 0 ? cmsSocial : defaultSocial;
  const legal = hydrated ? cmsLegal : [];
  const cms = hydrated ? bundle : undefined;

  const tagline = contentText(cms, "global.footer.tagline", "All for the culture.");
  const about = contentText(
    cms,
    "global.footer.about",
    "Association culturelle basée en Hauts-de-France. Événements, ateliers et accompagnement d'artistes autour de la culture urbaine.",
  );
  const email = contentText(cms, "global.contact.email", "contact@bbhassociation.com");
  const handle = contentText(cms, "global.contact.handle", "@bbhassociation");
  const place = contentText(cms, "global.contact.place", "Maubeuge / Hauts-de-France");
  const siren = contentText(cms, "global.contact.siren", "100854637");
  const baseline = contentText(cms, "global.footer.baseline", "Élever la culture urbaine.");

  return (
    <footer className="mt-32 border-t border-white/5 bg-background">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <div>
            <BrandLogo className="text-4xl" imgClassName="h-12" />
          </div>
          <p className="mt-3 max-w-sm text-lg font-medium text-foreground">{tagline}</p>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{about}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {socials.map((s) => {
              const Icon = socialIcon(s.label);
              return (
                <a
                  key={`${s.url}-${s.label}`}
                  href={s.url}
                  aria-label={s.label}
                  {...(s.new_tab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="grid size-10 place-items-center rounded-full border border-white/10 text-muted-foreground transition hover:border-electric/50 hover:text-foreground"
                >
                  <Icon className="size-4" />
                </a>
              );
            })}
          </div>
        </div>

        <nav aria-label="Pied de page">
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Navigation
          </h4>
          <ul className="mt-4 space-y-2">
            {links.map((l) => (
              <li key={`${l.url}-${l.label}`}>
                <NavItem
                  link={l}
                  className="text-sm text-muted-foreground transition hover:text-foreground"
                />
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Contact
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={`mailto:${email}`} className="transition hover:text-foreground">
                {email}
              </a>
            </li>
            <li>{handle}</li>
            <li>{place}</li>
            <li className="pt-2 text-xs">SIREN&nbsp;: {siren}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-6 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} BBH Association. Tous droits réservés.</span>
          <div className="flex flex-wrap items-center gap-4">
            {legal.map((l) => (
              <NavItem key={l.id} link={l} className="transition hover:text-foreground" />
            ))}
            <span>{baseline}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
