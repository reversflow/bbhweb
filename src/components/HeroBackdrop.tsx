import { useMedia } from "@/hooks/use-site-images";

/**
 * Optional editable background image for a page header.
 * Renders nothing when no image is configured, so the existing
 * `--gradient-hero` treatment stays exactly as designed.
 */
export function HeroBackdrop({ slot }: { slot: string }) {
  const media = useMedia(slot);
  if (!media.src) return null;
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
      <img
        src={media.src}
        alt=""
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="h-full w-full object-cover opacity-40"
        style={{ objectPosition: media.objectPosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background" />
    </div>
  );
}
