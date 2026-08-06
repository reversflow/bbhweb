import { useEffect, useState } from "react";
import { useMedia } from "@/hooks/use-site-images";
import { cn } from "@/lib/utils";

/**
 * BBH wordmark. Renders the admin-uploaded logo when one exists in the
 * `brand_logo` slot, otherwise keeps the original typographic logo.
 *
 * The image is only swapped in after hydration: the media list is fetched
 * client-side, so rendering it during SSR produced a hydration mismatch.
 */
export function BrandLogo({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  const media = useMedia("brand_logo");
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (hydrated && media.custom && media.src) {
    return (
      <img
        src={media.src}
        alt={media.alt || "Logo de BBH Association"}
        className={cn("w-auto object-contain", imgClassName)}
        decoding="async"
      />
    );
  }
  return <span className={cn("font-display font-black tracking-tighter", className)}>BBH</span>;
}
