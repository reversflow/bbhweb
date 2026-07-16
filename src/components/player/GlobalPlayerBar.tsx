import { Link } from "@tanstack/react-router";
import { Pause, Play, SkipBack, SkipForward, Shuffle, Repeat, Volume2 } from "lucide-react";
import { usePlayer, formatTime } from "@/contexts/player-context";
import { useSignedUrl } from "@/hooks/use-signed-url";
import { cn } from "@/lib/utils";

export function GlobalPlayerBar() {
  const p = usePlayer();
  const cover = useSignedUrl("song-artwork", p.track?.cover_url ?? null);
  if (!p.track) return null;
  const pct = p.duration > 0 ? (p.currentTime / p.duration) * 100 : 0;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/85 backdrop-blur-xl">
      {/* progress */}
      <div className="relative h-1 w-full bg-white/5">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-electric via-purple-glow to-blood"
          style={{ width: `${pct}%`, boxShadow: "0 0 12px oklch(0.72 0.22 250 / 0.8)" }}
        />
        <input
          type="range"
          min={0}
          max={Math.max(p.duration, 0.1)}
          value={p.currentTime}
          onChange={(e) => p.seek(Number(e.target.value))}
          className="absolute inset-0 w-full cursor-pointer opacity-0"
          aria-label="Progression"
        />
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-6 sm:px-6">
        <Link to="/musique/$slug" params={{ slug: p.track.slug }} className="flex min-w-0 items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md border border-white/10 bg-surface">
            {cover ? (
              <img src={cover} alt="" className="size-full object-cover" />
            ) : (
              <div className="size-full bg-gradient-to-br from-electric/40 to-blood/40" />
            )}
            {p.playing && (
              <div className="absolute inset-x-1 bottom-1 flex h-3 items-end justify-between gap-[2px]">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="w-[3px] rounded-full bg-electric-glow"
                    style={{
                      animation: `bbh-eq 1s ease-in-out ${i * 0.15}s infinite alternate`,
                      height: `${30 + i * 15}%`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{p.track.title}</div>
            <div className="truncate text-[11px] uppercase tracking-widest text-muted-foreground">
              {p.track.artist}
            </div>
          </div>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-4 text-muted-foreground sm:flex">
          <button onClick={p.toggleShuffle} aria-label="Aléatoire" className={cn("hover:text-foreground", p.shuffle && "text-electric-glow")}>
            <Shuffle className="size-4" />
          </button>
          <button onClick={p.prev} aria-label="Précédent" className="hover:text-foreground">
            <SkipBack className="size-5" />
          </button>
          <button
            onClick={p.toggle}
            aria-label={p.playing ? "Pause" : "Lecture"}
            className="grid size-11 place-items-center rounded-full bg-white text-black shadow-[0_0_30px_-6px_oklch(0.72_0.22_250/0.7)] transition hover:scale-105"
          >
            {p.playing ? <Pause className="size-5" fill="currentColor" /> : <Play className="size-5" fill="currentColor" />}
          </button>
          <button onClick={p.next} aria-label="Suivant" className="hover:text-foreground">
            <SkipForward className="size-5" />
          </button>
          <button onClick={p.cycleRepeat} aria-label="Répéter" className={cn("hover:text-foreground", p.repeat !== "off" && "text-electric-glow")}>
            <Repeat className="size-4" />
            {p.repeat === "one" && <span className="ml-0.5 text-[10px]">1</span>}
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3 text-xs tabular-nums text-muted-foreground">
          <span className="hidden sm:inline">
            {formatTime(p.currentTime)} / {formatTime(p.duration)}
          </span>
          <div className="hidden items-center gap-2 md:flex">
            <Volume2 className="size-4" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={p.volume}
              onChange={(e) => p.setVolume(Number(e.target.value))}
              className="h-1 w-20 cursor-pointer accent-electric"
            />
          </div>
          {/* mobile play */}
          <button
            onClick={p.toggle}
            aria-label={p.playing ? "Pause" : "Lecture"}
            className="grid size-9 place-items-center rounded-full bg-white text-black sm:hidden"
          >
            {p.playing ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4" fill="currentColor" />}
          </button>
        </div>
      </div>
      <style>{`@keyframes bbh-eq { 0%{transform:scaleY(0.4)} 100%{transform:scaleY(1)} }`}</style>
    </div>
  );
}
