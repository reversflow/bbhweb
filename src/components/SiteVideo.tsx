import { useEffect, useRef, useState } from "react";
import { mediaUrl } from "@/lib/site-images.functions";
import { Play } from "lucide-react";

type Props = {
  /** Storage path inside the media library bucket. */
  path: string;
  /** Optional storage path of the poster image. */
  poster?: string;
  className?: string;
  aspect?: string;
  autoplay?: boolean;
  loop?: boolean;
  /** Decorative background video: muted, no controls, no download. */
  ambient?: boolean;
  label?: string;
};

/**
 * Performance-first MP4 player.
 * Nothing is downloaded until the video enters the viewport (and, for
 * non-ambient videos, until the visitor presses play) — `preload="none"` plus a
 * poster image keeps the initial page weight untouched.
 */
export function SiteVideo({
  path,
  poster,
  className = "",
  aspect = "aspect-video",
  autoplay = false,
  loop = false,
  ambient = false,
  label,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!path) return null;
  const src = mediaUrl(path);
  const posterUrl = poster ? mediaUrl(poster) : undefined;
  const shouldAutoplay = (ambient || autoplay) && near;

  function play() {
    setStarted(true);
    requestAnimationFrame(() => videoRef.current?.play().catch(() => undefined));
  }

  return (
    <div ref={wrapRef} className={`relative overflow-hidden ${aspect} ${className}`}>
      <video
        ref={videoRef}
        className="size-full object-cover"
        poster={posterUrl}
        preload="none"
        playsInline
        muted={ambient || shouldAutoplay}
        loop={loop || ambient}
        controls={!ambient && started}
        autoPlay={shouldAutoplay}
        aria-label={label}
        {...(ambient ? { tabIndex: -1, "aria-hidden": true } : {})}
      >
        {near && <source src={src} type="video/mp4" />}
      </video>

      {!ambient && !started && (
        <button
          type="button"
          onClick={play}
          className="absolute inset-0 grid place-items-center bg-black/30 transition hover:bg-black/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
        >
          <span className="grid size-16 place-items-center rounded-full bg-white/90 text-black shadow-xl transition group-hover:scale-105">
            <Play className="size-6 translate-x-0.5 fill-current" />
          </span>
          <span className="sr-only">Lire la vidéo{label ? ` : ${label}` : ""}</span>
        </button>
      )}
    </div>
  );
}
