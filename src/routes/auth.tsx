import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/SiteShell";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Connexion — BBH Association" },
      { name: "description", content: "Espace administrateur BBH." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/_authenticated/admin" as never });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fn = mode === "signin"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    const { error } = await fn;
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/_authenticated/admin" as never });
  }

  return (
    <SiteShell>
      <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-6 py-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-electric-glow">
          Espace privé
        </p>
        <h1 className="mt-3 font-display text-4xl font-black tracking-tighter">
          {mode === "signin" ? "Connexion" : "Créer un compte"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Réservé à l'administration BBH.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            autoComplete="email"
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30"
          />
          {error && <p className="text-sm text-blood">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white py-3 text-sm font-semibold text-black disabled:opacity-50"
          >
            {loading ? "…" : mode === "signin" ? "Se connecter" : "Créer le compte"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "Créer un compte" : "J'ai déjà un compte"}
        </button>

        <Link to="/" className="mt-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          ← Retour au site
        </Link>
      </div>
    </SiteShell>
  );
}
