import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Stable, cacheable public URL for an editable site image.
 * The `site-images` bucket is private, so this route streams the object after
 * verifying the path is actually referenced by a `site_images` row.
 * Storage paths contain a UUID, so responses are safely immutable.
 */
export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const { data: row } = await supabaseAdmin
          .from("site_images")
          .select("slot")
          .eq("storage_path", path)
          .maybeSingle();
        if (!row) return new Response("Not found", { status: 404 });

        const { data: file, error } = await supabaseAdmin.storage
          .from("site-images")
          .download(path);
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
