import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/SiteShell";
import { HeroBackdrop } from "@/components/HeroBackdrop";
import { usePlayer, formatTime } from "@/contexts/player-context";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { Play, Pause, Disc3, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/musique")({
  head: () => ({
    meta: [
      { title: "Musique — REVERSEFLOW · BBH" },
      { name: "description", content: "L'archive vivante de Reverseflow : morceaux, sorties, sessions studio et paroles." },
      { property: "og:title", content: "Reverseflow — Musique · BBH" },
      { property: "og:description", content: "Découvrir, écouter et explorer l'univers de Reverseflow." },
    ],
  }),
  component: MusicPage,
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
  featured: boolean;
  streaming_links: Record<string, string> | null;
};

function MusicPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("songs")
        .select("id, slug, title, description, genres, duration_seconds, release_date, cover_url, audio_url, featured, streaming_links")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("release_date", { ascending: false });
      setSongs((data ?? []) as Song[]);
      setLoading(false);
    })();
  }, []);

  const featured = songs.find((s) => s.featured) ?? songs[0];
  const rest = songs.filter((s) => s.id !== featured?.id);

  return (
    <SiteShell>
      <div className="relative overflow-hidden border-b border-white/5 bg-[radial-gradient(ellipse_80%_50%_at_20%_0%,oklch(0.72_0.22_250/0.18),transparent_60%),radial-gradient(ellipse_60%_50%_at_100%_20%,oklch(0.62_0.24_25/0.15),transparent_65%)]">
        <HeroBackdrop slot="music_hero" />
        <div className="relative mx-auto max-w-7xl px-6 pb-6 pt-16">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-electric-glow">
                Reverseflow — Music
              </p>
              <h1 className="mt-3 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-7xl md:text-8xl">
                Une archive
                <br />
                <span className="italic text-muted-foreground">vivante.</span>
              </h1>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
                Sessions, sorties et carnets. Un catalogue indépendant, écouté depuis la source.
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-muted-foreground">Chargement du catalogue…</div>
      ) : songs.length === 0 ? (
        <EmptyCatalog />
      ) : (
        <>
          {featured && <FeaturedRelease song={featured} queue={songs} />}
          <ArchiveGrid songs={rest.length > 0 ? rest : songs} allQueue={songs} />
        </>
      )}
    </SiteShell>
  );
}

function EmptyCatalog() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <Disc3 className="mx-auto size-12 text-electric-glow" />
      <h2 className="mt-6 font-display text-3xl font-black">Bientôt en écoute</h2>
      <p className="mt-3 text-muted-foreground">
        Les premières sorties de Reverseflow arrivent. L'archive s'ouvrira ici, morceau par morceau.
      </p>
    </div>
  );
}

function FeaturedRelease({ song, queue }: { song: Song; queue: Song[] }) {
  const cover = useSignedUrl("song-artwork", song.cover_url);
  const player = usePlayer();
  const isCurrent = player.track?.id === song.id;

  return (
    <section className="border-b border-white/5">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:gap-16 md:py-24">
        <div className="relative">
          <div className="aspect-square overflow-hidden rounded-2xl border border-white/10 bg-surface shadow-[0_40px_120px_-40px_oklch(0.72_0.22_250/0.6)]">
            {cover ? (
              <img src={cover} alt={song.title} className="size-full object-cover" />
            ) : (
              <div className="size-full bg-gradient-to-br from-electric/40 via-purple-glow/30 to-blood/40" />
            )}
          </div>
          <div className="absolute -bottom-4 -right-4 rounded-full border border-electric/40 bg-black/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-electric-glow backdrop-blur">
            À la une
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">Nouvelle sortie</p>
          <h2 className="mt-3 font-display text-5xl font-black leading-[0.95] tracking-tighter sm:text-6xl">
            {song.title}
          </h2>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-widest text-muted-foreground">
            {song.release_date && <span>{new Date(song.release_date).getFullYear()}</span>}
            {song.duration_seconds && <span>· {formatTime(song.duration_seconds)}</span>}
            {song.genres.length > 0 && <span>· {song.genres.join(" · ")}</span>}
          </div>
          {song.description && <p className="mt-6 text-muted-foreground">{song.description}</p>}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => (isCurrent ? player.toggle() : player.play({ id: song.id, slug: song.slug, title: song.title, artist: "REVERSEFLOW", cover_url: song.cover_url, audio_url: song.audio_url, duration_seconds: song.duration_seconds }, queue.map(mapToTrack), queue.findIndex((q) => q.id === song.id)))}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:scale-[1.03]"
            >
              {isCurrent && player.playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4" fill="currentColor" />}
              {isCurrent && player.playing ? "Pause" : "Écouter"}
            </button>
            <Link to="/musique/$slug" params={{ slug: song.slug }} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm hover:bg-white/5">
              Voir le morceau
            </Link>
          </div>

          {song.streaming_links && (
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
    </section>
  );
}

function mapToTrack(s: Song) {
  return { id: s.id, slug: s.slug, title: s.title, artist: "REVERSEFLOW", cover_url: s.cover_url, audio_url: s.audio_url, duration_seconds: s.duration_seconds };
}

function ArchiveGrid({ songs, allQueue }: { songs: Song[]; allQueue: Song[] }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-8 flex items-end justify-between border-b border-white/10 pb-4">
        <h2 className="font-display text-3xl font-black tracking-tighter sm:text-4xl">L'archive</h2>
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{songs.length} morceau{songs.length > 1 ? "x" : ""}</p>
      </div>
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {songs.map((s) => (
          <SongCard key={s.id} song={s} queue={allQueue} />
        ))}
      </ul>
    </section>
  );
}

function SongCard({ song, queue }: { song: Song; queue: Song[] }) {
  const cover = useSignedUrl("song-artwork", song.cover_url);
  const player = usePlayer();
  const isCurrent = player.track?.id === song.id;

  return (
    <li className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface transition hover:border-electric/40">
      <Link to="/musique/$slug" params={{ slug: song.slug }} className="block">
        <div className="relative aspect-square overflow-hidden">
          {cover ? (
            <img src={cover} alt={song.title} className="size-full object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <div className="size-full bg-gradient-to-br from-electric/30 via-purple-glow/20 to-blood/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
      </Link>
      <button
        onClick={() =>
          isCurrent
            ? player.toggle()
            : player.play(mapToTrack(song), queue.map(mapToTrack), queue.findIndex((q) => q.id === song.id))
        }
        aria-label="Écouter"
        className={cn(
          "absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white text-black opacity-0 shadow-[0_10px_40px_-10px_oklch(0.72_0.22_250/0.8)] transition group-hover:opacity-100",
          isCurrent && "opacity-100",
        )}
      >
        {isCurrent && player.playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4" fill="currentColor" />}
      </button>
      <div className="p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="truncate font-display text-lg font-bold tracking-tight">{song.title}</h3>
          {song.release_date && <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{new Date(song.release_date).getFullYear()}</span>}
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted-foreground">
          {song.genres.slice(0, 2).map((g) => (
            <span key={g}>{g}</span>
          ))}
          {song.duration_seconds ? <span>· {formatTime(song.duration_seconds)}</span> : null}
        </div>
      </div>
    </li>
  );
}
