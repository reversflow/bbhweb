import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/SiteShell";
import { ShieldCheck, Loader2 } from "lucide-react";

type AuthorizationDetails = {
  client?: { name?: string; redirect_uri?: string } | null;
  scopes?: string[] | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
};

type OAuthNamespace = {
  getAuthorizationDetails: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (id: string) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

function oauthClient(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthClient().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <SiteShell>
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-3xl font-black tracking-tighter">Autorisation invalide</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </SiteShell>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clientName = details?.client?.name ?? "cette application";

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const { data, error } = approve
      ? await oauthClient().approveAuthorization(authorization_id)
      : await oauthClient().denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Le serveur d'autorisation n'a pas renvoyé d'URL de redirection.");
      return;
    }
    window.location.href = target;
  }

  return (
    <SiteShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="pointer-events-none absolute inset-x-0 top-16 -z-10 select-none text-center font-display text-[22vw] font-black leading-none tracking-tighter text-white/[0.035]">
          BBH
        </div>
        <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl flex-col justify-center px-6 py-16">
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-electric-glow">
            <ShieldCheck className="size-3.5" /> Autorisation
          </div>
          <h1 className="mt-6 font-display text-4xl font-black leading-tight tracking-tighter sm:text-5xl">
            Connecter {clientName} à ton compte BBH
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            {clientName} pourra utiliser les outils MCP de BBH Association en agissant en ton nom
            (lecture des morceaux et du journal, publication de commentaires modérés).
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Ça ne contourne pas les règles d'accès de l'app — les données admin restent réservées aux admins.
          </p>
          {details?.client?.redirect_uri && (
            <p className="mt-4 break-all rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-muted-foreground">
              Redirection : {details.client.redirect_uri}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 rounded-lg border border-blood/30 bg-blood/10 px-3 py-2 text-sm text-blood">
              {error}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              disabled={busy}
              onClick={() => decide(true)}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black disabled:opacity-50"
            >
              {busy && <Loader2 className="size-4 animate-spin" />} Autoriser
            </button>
            <button
              disabled={busy}
              onClick={() => decide(false)}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-6 py-3 text-sm hover:bg-white/5 disabled:opacity-50"
            >
              Refuser
            </button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
