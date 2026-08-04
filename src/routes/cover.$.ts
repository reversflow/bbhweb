import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const ALLOWED = {
  "song-artwork": { table: "songs", column: "cover_url" },
  "journal-media": { table: "journal_posts", column: "cover_url" },
} as const;

type Bucket = keyof typeof ALLOWED;

/**
 * Stable, cacheable public URL for a published song artwork / journal cover.
 * Those buckets are private, so this route streams the object only when it is
 * referenced by a published row. Paths contain a UUID → safely immutable.
 */
export const Route = createFileRoute("/cover/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const splat = (params as { _splat?: string })._splat ?? "";
        const slash = splat.indexOf("/");
        if (slash < 1 || splat.includes("..")) return new Response("Not found", { status: 404 });

        const bucket = splat.slice(0, slash) as Bucket;
        const path = splat.slice(slash + 1);
        const cfg = ALLOWED[bucket];
        if (!cfg || !path) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: row } = await supabaseAdmin
          .from(cfg.table)
          .select("id")
          .eq(cfg.column, path)
          .eq("published", true)
          .limit(1)
          .maybeSingle();
        if (!row) return new Response("Not found", { status: 404 });

        const { data: file, error } = await supabaseAdmin.storage.from(bucket).download(path);
        if (error || !file) return new Response("Not found", { status: 404 });

        return new Response(file, {
          headers: {
            "Content-Type": file.type || "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
