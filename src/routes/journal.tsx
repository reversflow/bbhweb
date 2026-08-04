import { createFileRoute, Link } from "@tanstack/react-router";
import { seoQueryOptions, type SeoConfig } from "@/hooks/use-seo";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/SiteShell";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { useSignedUrl } from "@/hooks/use-signed-url";

export const Route = createFileRoute("/journal")({
  loader: ({ context }) => context.queryClient.ensureQueryData(seoQueryOptions),
  head: ({ loaderData }) => {
    const cfg = loaderData as SeoConfig | undefined;
    const base = cfg?.settings.baseUrl ?? "";
    return pageHead(cfg, "journal", {
      path: "/journal",
      jsonLd: [breadcrumbJsonLd(base, [{ name: "Accueil", path: "/" }, { name: "Journal", path: "/journal" }])],
    });
  },
  component: JournalIndex,
});

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  category: string | null;
  published_at: string;
};

function JournalIndex() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("journal_posts")
        .select("id, slug, title, excerpt, cover_url, category, published_at")
        .eq("published", true)
        .order("published_at", { ascending: false });
      setPosts((data ?? []) as Post[]);
      setLoading(false);
    })();
  }, []);

  return (
    <SiteShell>
      <div className="relative overflow-hidden">
        <HeroBackdrop slot="journal_hero" />
        <div className="mx-auto max-w-7xl px-6 pb-8 pt-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-electric-glow">Reverseflow · Journal</p>
        <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
          Le carnet de<br /><span className="italic text-muted-foreground">bord.</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Sessions studio, coulisses, dates, inspirations et sorties. Le journal d'artiste en accès libre.
        </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {loading ? (
          <p className="text-muted-foreground">Chargement…</p>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center text-muted-foreground">
            Le journal s'ouvrira ici avec les premiers billets.
          </div>
        ) : (
          <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} p={p} />
            ))}
          </ul>
        )}
      </div>
    </SiteShell>
  );
}

function PostCard({ p }: { p: Post }) {
  const url = useSignedUrl("journal-media", p.cover_url);
  return (
    <li>
      <Link to="/journal/$slug" params={{ slug: p.slug }} className="group block">
        <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-surface">
          {url ? (
            <img src={url} alt={p.title} className="size-full object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <div className="size-full bg-gradient-to-br from-electric/30 via-purple-glow/20 to-blood/30" />
          )}
        </div>
        <div className="mt-4">
          {p.category && <p className="text-[10px] uppercase tracking-[0.3em] text-electric-glow">{p.category}</p>}
          <h2 className="mt-1 font-display text-2xl font-bold leading-tight tracking-tight">{p.title}</h2>
          {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
          <p className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
            {new Date(p.published_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
      </Link>
    </li>
  );
}
