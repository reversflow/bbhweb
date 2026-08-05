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
