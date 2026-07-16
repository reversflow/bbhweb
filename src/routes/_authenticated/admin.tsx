import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/SiteShell";
import { useIsAdmin } from "@/hooks/use-admin";
import { MusicManager } from "@/components/admin/MusicManager";
import { JournalManager } from "@/components/admin/JournalManager";
import { LogOut, Music, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Music Manager — BBH" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useIsAdmin();
  const [email, setEmail] = useState<string | null>(null);
  const [tab, setTab] = useState<"music" | "journal">("music");

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
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-xs uppercase tracking-widest text-electric-glow">Accès refusé</p>
          <h1 className="mt-3 font-display text-4xl font-black">Réservé à l'administrateur</h1>
          <p className="mt-4 text-muted-foreground">
            Le compte <span className="font-mono">{email}</span> n'a pas les droits nécessaires.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <button onClick={signOut} className="rounded-full border border-white/10 px-5 py-2 text-sm">
              Se déconnecter
            </button>
            <Link to="/" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black">
              Retour au site
            </Link>
          </div>
        </div>
      </SiteShell>
    );
  }

  return (
    <SiteShell>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-electric-glow">
              Espace privé · Admin
            </p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tighter sm:text-5xl">
              Music Manager
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Connecté en tant que {email}</p>
          </div>
          <button onClick={signOut} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
            <LogOut className="size-4" /> Déconnexion
          </button>
        </div>

        <div className="mt-8 flex gap-2">
          <TabBtn active={tab === "music"} onClick={() => setTab("music")} icon={<Music className="size-4" />}>
            Musique
          </TabBtn>
          <TabBtn active={tab === "journal"} onClick={() => setTab("journal")} icon={<BookOpen className="size-4" />}>
            Journal
          </TabBtn>
        </div>

        <div className="mt-8">
          {tab === "music" ? <MusicManager /> : <JournalManager />}
        </div>
      </div>
    </SiteShell>
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
