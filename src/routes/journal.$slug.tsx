import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/SiteShell";
import { useSignedUrl } from "@/hooks/use-signed-url";

export const Route = createFileRoute("/journal/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Journal · BBH` },
    ],
  }),
  component: JournalPost,
});

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  category: string | null;
  published_at: string;
};

function JournalPost() {
  const { slug } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("journal_posts").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      setPost(data as Post | null);
      setLoading(false);
    })();
  }, [slug]);

  const url = useSignedUrl("journal-media", post?.cover_url ?? null);

  if (loading) return <SiteShell><div className="px-6 py-16 text-muted-foreground">Chargement…</div></SiteShell>;
  if (!post) throw notFound();

  return (
    <SiteShell>
      <article className="mx-auto max-w-3xl px-6 py-16">
        <Link to="/journal" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          ← Journal
        </Link>
        {post.category && <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-electric-glow">{post.category}</p>}
        <h1 className="mt-2 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-6xl">
          {post.title}
        </h1>
        <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
          {new Date(post.published_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
        </p>
        {url && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
            <img src={url} alt="" className="w-full object-cover" />
          </div>
        )}
        <div className="prose prose-invert mt-10 max-w-none whitespace-pre-line text-[17px] leading-8 text-foreground/90">
          {post.content}
        </div>
      </article>
    </SiteShell>
  );
}
