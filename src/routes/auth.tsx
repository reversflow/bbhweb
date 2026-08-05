import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/SiteShell";
import { ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { next?: string } =>
    typeof s.next === "string" && s.next ? { next: s.next } : {},

  head: () => ({
    meta: [
      { title: "Connexion — BBH Association" },
      { name: "description", content: "Espace administrateur BBH." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function safeNext(next: string): string | null {
  if (!next.startsWith("/") || next.startsWith("//")) return null;
  return next;
}

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const target = safeNext(next ?? "");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        if (target) window.location.replace(target);
        else navigate({ to: "/admin" });
      }
    });
  }, [navigate, target]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const emailRedirectTo = target
      ? `${window.location.origin}${target}`
      : window.location.origin;
    const fn = mode === "signin"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { emailRedirectTo } });
    const { error } = await fn;
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (target) window.location.replace(target);
    else navigate({ to: "/admin" });
  }

  return (
    <SiteShell>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-16 -z-10 select-none text-center font-display text-[22vw] font-black leading-none tracking-tighter text-white/[0.035]">
          BBH
        </div>

        <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-6xl gap-16 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-electric-glow">
              <ShieldCheck className="size-3.5" /> Espace privé
            </div>
            <h1 className="mt-6 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-6xl">
              {mode === "signin" ? "Control Room" : "Créer un compte"}
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground">
              Portail d'administration réservé à l'équipe BBH. Les accès admin
              sont attribués manuellement — un compte visiteur ne débloque
              rien du côté public.
            </p>
            <Link to="/" className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" /> Retour au site
            </Link>
          </div>

          <div className="rounded-3xl border border-white/10 bg-surface/40 p-8 backdrop-blur-xl md:p-10">
            <form onSubmit={onSubmit} className="space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Mot de passe</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30"
                />
              </label>
              {error && (
                <p className="rounded-lg border border-blood/30 bg-blood/10 px-3 py-2 text-sm text-blood">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-semibold text-black disabled:opacity-50"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {mode === "signin" ? "Se connecter" : "Créer le compte"}
              </button>
            </form>

            <button
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-6 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {mode === "signin" ? "Créer un compte" : "J'ai déjà un compte"}
            </button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
