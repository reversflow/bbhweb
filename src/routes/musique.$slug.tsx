import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/SiteShell";
import { CommentSection } from "@/components/CommentSection";
import { usePlayer, formatTime } from "@/contexts/player-context";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { Play, Pause, ExternalLink, Share2 } from "lucide-react";

export const Route = createFileRoute("/musique/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Reverseflow · BBH` },
      { name: "description", content: "Écouter et découvrir ce morceau de Reverseflow." },
    ],
  }),
  component: SongPage,
});

type Song = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  genres: string[];
  duration_seconds: number | null;
  release_date: string | null;
  cover_url: string | null;
  audio_url: string | null;
  lyrics: string | null;
  credits: string | null;
  featured: boolean;
  comments_enabled: boolean;
  streaming_links: Record<string, string> | null;
  seo_title: string | null;
  seo_description: string | null;
};

function SongPage() {
  const { slug } = Route.useParams();
  const [song, setSong] = useState<Song | null>(null);
  const [related, setRelated] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const player = usePlayer();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from("songs").select("*").eq("slug", slug).eq("published", true).maybeSingle();
      setSong(data as Song | null);
      if (data) {
        const { data: rel } = await supabase
          .from("songs")
          .select("*")
          .eq("published", true)
          .neq("id", data.id)
          .order("release_date", { ascending: false })
          .limit(6);
        setRelated((rel ?? []) as Song[]);
      }
      setLoading(false);
    })();
  }, [slug]);

  const cover = useSignedUrl("song-artwork", song?.cover_url ?? null);

  if (loading) {
    return (
      <SiteShell>
        <div className="mx-auto max-w-4xl px-6 py-24 text-muted-foreground">Chargement…</div>
      </SiteShell>
    );
  }
  if (!song) throw notFound();

  const isCurrent = player.track?.id === song.id;
  const track = { id: song.id, slug: song.slug, title: song.title, artist: "REVERSEFLOW", cover_url: song.cover_url, audio_url: song.audio_url, duration_seconds: song.duration_seconds };

  return (
    <SiteShell>
      {/* Cinematic header */}
      <div className="relative border-b border-white/5">
        {cover && (
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <img src={cover} alt="" className="size-full object-cover opacity-30 blur-2xl" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>
        )}
        <div className="mx-auto grid max-w-7xl gap-10 px-6 pb-16 pt-16 md:grid-cols-[1fr_1.4fr] md:gap-16 md:pt-24">
          <div className="aspect-square overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-[0_50px_120px_-40px_oklch(0.72_0.22_250/0.6)]">
            {cover ? (
              <img src={cover} alt={song.title} className="size-full object-cover" />
            ) : (
              <div className="size-full bg-gradient-to-br from-electric/40 to-blood/40" />
            )}
          </div>

          <div className="flex flex-col justify-end">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-electric-glow">Reverseflow</p>
            <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl">
              {song.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
              {song.release_date && <span>{new Date(song.release_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</span>}
              {song.duration_seconds && <span>· {formatTime(song.duration_seconds)}</span>}
              {song.genres.length > 0 && <span>· {song.genres.join(" · ")}</span>}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => (isCurrent ? player.toggle() : player.play(track))}
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black hover:scale-[1.03]"
              >
                {isCurrent && player.playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4" fill="currentColor" />}
                {isCurrent && player.playing ? "Pause" : "Écouter"}
              </button>
              <button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({ title: song.title, url: window.location.href }).catch(() => {});
                  } else {
                    navigator.clipboard?.writeText(window.location.href);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm hover:bg-white/5"
              >
                <Share2 className="size-4" /> Partager
              </button>
            </div>

            {song.streaming_links && Object.values(song.streaming_links).some(Boolean) && (
              <div className="mt-6 flex flex-wrap gap-2 text-xs">
                {(["spotify", "apple", "deezer", "youtube"] as const).map((k) =>
                  song.streaming_links?.[k] ? (
                    <a key={k} href={song.streaming_links[k]} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 uppercase tracking-widest text-muted-foreground hover:text-foreground">
                      {k} <ExternalLink className="size-3" />
                    </a>
                  ) : null,
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-16 md:grid-cols-[2fr_1fr] md:gap-20">
        <div className="space-y-12">
          {song.description && (
            <section>
              <SubHead>Description</SubHead>
              <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-foreground/90">{song.description}</p>
            </section>
          )}

          {song.lyrics && (
            <section>
              <SubHead>Paroles</SubHead>
              <pre className="mt-4 whitespace-pre-wrap font-sans text-[15px] leading-8 text-foreground/85">{song.lyrics}</pre>
            </section>
          )}

          <CommentSection songId={song.id} enabled={song.comments_enabled} />
        </div>

        <aside className="space-y-8">
          {song.credits && (
            <div className="rounded-2xl border border-white/10 bg-surface/50 p-6">
              <SubHead>Crédits</SubHead>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-muted-foreground">{song.credits}</pre>
            </div>
          )}
          {related.length > 0 && (
            <div>
              <SubHead>À écouter aussi</SubHead>
              <ul className="mt-4 space-y-3">
                {related.map((r) => (
                  <li key={r.id}>
                    <Link to="/musique/$slug" params={{ slug: r.slug }} className="flex items-center gap-3 rounded-lg border border-white/5 p-2 hover:border-electric/40 hover:bg-white/5">
                      <RelatedCover path={r.cover_url} />
                      <div className="min-w-0">
                        <div className="truncate font-medium">{r.title}</div>
                        <div className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">
                          {r.genres[0] ?? "—"}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </SiteShell>
  );
}

function SubHead({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-2xl font-bold tracking-tight">{children}</h2>;
}
function RelatedCover({ path }: { path: string | null }) {
  const url = useSignedUrl("song-artwork", path);
  return (
    <div className="size-11 shrink-0 overflow-hidden rounded-md border border-white/10 bg-surface">
      {url ? <img src={url} alt="" className="size-full object-cover" /> : <div className="size-full bg-gradient-to-br from-electric/40 to-blood/40" />}
    </div>
  );
}
