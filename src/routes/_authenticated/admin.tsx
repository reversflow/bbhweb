import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/SiteShell";
import { useIsAdmin } from "@/hooks/use-admin";
import { MusicManager } from "@/components/admin/MusicManager";
import { JournalManager } from "@/components/admin/JournalManager";
import { CommentsManager } from "@/components/admin/CommentsManager";
import { MediaManager } from "@/components/admin/MediaManager";
import { SeoManager } from "@/components/admin/SeoManager";
import { EventsManager } from "@/components/admin/EventsManager";
import { ContentManager } from "@/components/admin/ContentManager";
import { NavManager } from "@/components/admin/NavManager";
import { getAdminStats } from "@/lib/music.functions";
import { ArtistsManager } from "@/components/admin/ArtistsManager";
import { LibraryManager } from "@/components/admin/LibraryManager";
import { LogOut, Music, BookOpen, MessageCircle, LayoutDashboard, ShieldAlert, ArrowLeft, ImageIcon, Search, CalendarDays, Type, Link2, Users, Film } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin BBH — Espace privé" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

type Tab = "dashboard" | "events" | "music" | "journal" | "comments" | "images" | "content" | "nav" | "seo";

function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useIsAdmin();
  const [email, setEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("dashboard");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (loading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-6xl px-6 py-16 text-sm text-muted-foreground">Chargement…</div>
      </SiteShell>
    );
  }

  if (!isAdmin) {
    return (
      <SiteShell>
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10"
            style={{ background: "var(--gradient-hero)" }}
          />
          <div className="pointer-events-none absolute inset-x-0 top-24 -z-10 select-none text-center font-display text-[22vw] font-black leading-none tracking-tighter text-white/[0.035]">
            403
          </div>
          <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-blood/30 bg-blood/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-blood">
              <ShieldAlert className="size-3.5" /> Accès refusé
            </div>
            <h1 className="mt-6 font-display text-5xl font-black tracking-tighter sm:text-6xl">
              Zone interdite
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Le compte <span className="font-mono text-foreground/80">{email ?? "—"}</span> n'a pas les
              droits d'administration BBH. Si tu penses qu'il s'agit d'une erreur, contacte l'équipe.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm hover:bg-white/5">
                <LogOut className="size-4" /> Changer de compte
              </button>
              <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
                <ArrowLeft className="size-4" /> Retour au site
              </Link>
            </div>
          </div>
        </section>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="relative mx-auto max-w-7xl px-6 py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 select-none overflow-hidden">
          <div className="whitespace-nowrap text-center font-display text-[18vw] font-black leading-[0.8] tracking-tighter text-white/[0.03]">
            CONTROL
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-electric-glow">
              Espace privé · Admin
            </p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tighter sm:text-5xl">
              Control Room
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Connecté en tant que {email}</p>
          </div>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
            <LogOut className="size-4" /> Déconnexion
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <TabBtn active={tab === "dashboard"} onClick={() => setTab("dashboard")} icon={<LayoutDashboard className="size-4" />}>
            Dashboard
          </TabBtn>
          <TabBtn active={tab === "events"} onClick={() => setTab("events")} icon={<CalendarDays className="size-4" />}>
            Événements
          </TabBtn>
          <TabBtn active={tab === "music"} onClick={() => setTab("music")} icon={<Music className="size-4" />}>
            Musique
          </TabBtn>
          <TabBtn active={tab === "journal"} onClick={() => setTab("journal")} icon={<BookOpen className="size-4" />}>
            Journal
          </TabBtn>
          <TabBtn active={tab === "comments"} onClick={() => setTab("comments")} icon={<MessageCircle className="size-4" />}>
            Modération
          </TabBtn>
          <TabBtn active={tab === "images"} onClick={() => setTab("images")} icon={<ImageIcon className="size-4" />}>
            Site Images
          </TabBtn>
          <TabBtn active={tab === "content"} onClick={() => setTab("content")} icon={<Type className="size-4" />}>
            Textes
          </TabBtn>
          <TabBtn active={tab === "nav"} onClick={() => setTab("nav")} icon={<Link2 className="size-4" />}>
            Navigation
          </TabBtn>
          <TabBtn active={tab === "seo"} onClick={() => setTab("seo")} icon={<Search className="size-4" />}>
            SEO
          </TabBtn>
        </div>

        <div className="mt-8">
          {tab === "dashboard" && <Dashboard onOpen={setTab} />}
          {tab === "events" && <EventsManager />}
          {tab === "music" && <MusicManager />}
          {tab === "journal" && <JournalManager />}
          {tab === "comments" && <CommentsManager />}
          {tab === "images" && <MediaManager />}
          {tab === "content" && <ContentManager />}
          {tab === "nav" && <NavManager />}
          {tab === "seo" && <SeoManager />}
        </div>
      </div>
    </SiteShell>
  );
}

function Dashboard({ onOpen }: { onOpen: (t: Tab) => void }) {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getAdminStats>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => setError((e as Error).message));
  }, []);

  if (error) {
    return <div className="rounded-2xl border border-blood/30 bg-blood/10 p-6 text-sm text-blood">Erreur : {error}</div>;
  }

  const cards = [
    { label: "Morceaux publiés", value: stats ? `${stats.songsPublished}/${stats.songsTotal}` : "—", tab: "music" as Tab, hint: "Catalogue REVERSEFLOW" },
    { label: "Journal", value: stats ? `${stats.journalPublished}/${stats.journalTotal}` : "—", tab: "journal" as Tab, hint: "Articles publiés" },
    { label: "À modérer", value: stats ? String(stats.pendingComments) : "—", tab: "comments" as Tab, hint: "Commentaires en attente", accent: true },
    { label: "Approuvés", value: stats ? String(stats.approvedComments) : "—", tab: "comments" as Tab, hint: "Total public" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={() => onOpen(c.tab)}
            className={`group text-left rounded-2xl border p-5 transition ${
              c.accent
                ? "border-electric/40 bg-electric/[0.06] hover:bg-electric/[0.12]"
                : "border-white/10 bg-surface/40 hover:border-white/20"
            }`}
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              {c.label}
            </div>
            <div className="mt-3 font-display text-4xl font-black tracking-tighter">
              {c.value}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{c.hint}</div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-surface/30 p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-electric-glow">
          Bienvenue
        </p>
        <h3 className="mt-2 font-display text-2xl font-black tracking-tighter">
          Tout se pilote ici.
        </h3>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          Publie de la musique, gère le journal et modère la communauté. Chaque
          commentaire attend ton feu vert avant d'apparaître publiquement — tu
          gardes la main sur le ton du site.
        </p>
      </div>
    </div>
  );
}

function TabBtn({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        active ? "border-electric bg-electric/10 text-foreground" : "border-white/10 text-muted-foreground hover:bg-white/5"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
