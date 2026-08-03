import { useQuery } from "@tanstack/react-query";
import { getSiteImages, type SiteImageEntry } from "@/lib/site-images.functions";
import { getMediaSlotDef } from "@/lib/media-slots";

export const siteImagesQueryOptions = {
  queryKey: ["site-images"] as const,
  queryFn: () => getSiteImages(),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
};

export function useSiteImages() {
  return useQuery(siteImagesQueryOptions);
}

export function useSiteImage(slot?: string): SiteImageEntry | undefined {
  const { data } = useSiteImages();
  if (!slot) return undefined;
  return data?.find((d) => d.slot === slot);
}

export type ResolvedMedia = {
  src?: string;
  alt: string;
  title: string;
  caption: string;
  objectPosition: string;
  /** true when the admin uploaded a custom image for this slot */
  custom: boolean;
};

/**
 * Resolves a slot to the admin image when it exists, otherwise to the
 * bundled default declared in the media registry. Never returns a broken URL.
 */
export function useMedia(slot?: string, override?: { src?: string; alt?: string }): ResolvedMedia {
  const entry = useSiteImage(slot);
  const def = slot ? getMediaSlotDef(slot) : undefined;
  return {
    src: entry?.url ?? override?.src ?? def?.fallback,
    alt: entry?.alt || override?.alt || def?.defaultAlt || "",
    title: entry?.title ?? "",
    caption: entry?.caption ?? "",
    objectPosition: entry?.objectPosition ?? "center center",
    custom: Boolean(entry),
  };
}
