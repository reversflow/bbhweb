import { BrandLogo } from "@/components/BrandLogo";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, ShieldCheck, LogIn } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-admin";
import { useNavLinks } from "@/hooks/use-content";
import { useHydrated } from "@/hooks/use-hydrated";
import { NavItem } from "@/components/NavItem";
import type { NavLink } from "@/lib/site-content.shared";

type SimpleLink = Pick<NavLink, "label" | "url" | "external" | "new_tab">;

const defaultLinks: SimpleLink[] = [
  { url: "/", label: "Accueil", external: false, new_tab: false },
  { url: "/musique", label: "Musique", external: false, new_tab: false },
  { url: "/evenements", label: "Événements", external: false, new_tab: false },
  { url: "/ateliers", label: "Ateliers", external: false, new_tab: false },
  { url: "/artistes", label: "Artistes", external: false, new_tab: false },
  { url: "/journal", label: "Journal", external: false, new_tab: false },
  { url: "/a-propos", label: "À propos", external: false, new_tab: false },
  { url: "/contact", label: "Contact", external: false, new_tab: false },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const { isAdmin } = useIsAdmin();
  const hydrated = useHydrated();
  const cmsLinks = useNavLinks("header");
  const links: SimpleLink[] = hydrated && cmsLinks.length > 0 ? cmsLinks : defaultLinks;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2" onClick={() => setOpen(false)}>
          <BrandLogo className="text-2xl" imgClassName="h-8" />
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.25em] text-muted-foreground sm:inline">
            Association
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavItem
              key={`${l.url}-${l.label}`}
              link={l}
              activeClassName="text-foreground"
              inactiveClassName="text-muted-foreground"
              className="rounded-full px-3.5 py-2 text-sm font-medium transition-colors hover:text-foreground"
            />
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {authed && isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-electric/40 bg-electric/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-electric-glow transition hover:bg-electric/20"
            >
              <ShieldCheck className="size-3.5" /> Admin
            </Link>
          ) : (
            <Link
              to="/auth"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground transition hover:border-white/30 hover:text-foreground"
            >
              <LogIn className="size-3.5" /> Connexion
            </Link>
          )}
          <Link
            to="/contact"
            className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-transform hover:scale-105"
          >
            Nous contacter
          </Link>
        </div>

        <button
          className="rounded-full border border-white/10 p-2 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/5 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {links.map((l) => (
              <NavItem
                key={`${l.url}-${l.label}`}
                link={l}
                onClick={() => setOpen(false)}
                activeClassName="bg-white/5 text-foreground"
                inactiveClassName="text-muted-foreground"
                className="rounded-lg px-4 py-3 text-base font-medium"
              />
            ))}
            <div className="mt-2 border-t border-white/5 pt-3">
              {authed && isAdmin ? (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-electric/40 bg-electric/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-electric-glow"
                >
                  <ShieldCheck className="size-3.5" /> Espace admin
                </Link>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
                >
                  <LogIn className="size-3.5" /> Connexion
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
