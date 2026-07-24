import { useQuery } from "@tanstack/react-query";
import { getSiteImages, type SiteImageEntry, type SiteImageSlot } from "@/lib/site-images.functions";

export function useSiteImages() {
  return useQuery({
    queryKey: ["site-images"],
    queryFn: () => getSiteImages(),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });
}

export function useSiteImage(slot: SiteImageSlot): SiteImageEntry | undefined {
  const { data } = useSiteImages();
  return data?.find((d) => d.slot === slot);
}
