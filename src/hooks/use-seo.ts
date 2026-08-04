import { getSeoConfig, type SeoConfig } from "@/lib/seo.functions";

export const seoQueryOptions = {
  queryKey: ["seo-config"] as const,
  queryFn: () => getSeoConfig(),
  staleTime: 5 * 60_000,
  gcTime: 30 * 60_000,
};

export type { SeoConfig };
