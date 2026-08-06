import { useQuery } from "@tanstack/react-query";
import type { NavLink } from "@/lib/site-content.shared";
import { listPublicEvents, getPublicEvent } from "@/lib/events.functions";
import { getSiteContent } from "@/lib/site-content.functions";

export const eventsQueryOptions = {
  queryKey: ["public-events"] as const,
  queryFn: () => listPublicEvents(),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
};

export const eventQueryOptions = (slug: string) => ({
  queryKey: ["public-event", slug] as const,
  queryFn: () => getPublicEvent({ data: { slug } }),
  staleTime: 5 * 60_000,
});

export const siteContentQueryOptions = {
  queryKey: ["site-content"] as const,
  queryFn: () => getSiteContent(),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
};

export function useSiteContentBundle() {
  return useQuery(siteContentQueryOptions);
}

/** Enabled CMS links for one location, sorted; empty when the admin defined none. */
export function useNavLinks(location: NavLink["location"]): NavLink[] {
  const { data } = useSiteContentBundle();
  return (data?.nav ?? [])
    .filter((l) => l.location === location && l.enabled)
    .sort((a, b) => a.sort_order - b.sort_order);
}
