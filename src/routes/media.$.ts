import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

/**
 * Stable, cacheable public URL for an editable site media (image or MP4).
 * The `site-images` bucket is private, so this route streams the object after
 * verifying the path is actually referenced by a `site_images` row (either as
 * the media itself or as a video poster).
 * Storage paths contain a UUID, so responses are safely immutable.
 * Range requests are honoured so videos can be scrubbed.
 */
export const Route = createFileRoute("/media/$")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }

        const { supabaseAdmin } = await import(
          "@/integrations/supabase/client.server"
        );

        const { data: rows } = await supabaseAdmin
          .from("site_images")
          .select("slot, mime_type, storage_path, poster_path")
          .or(`storage_path.eq.${path},poster_path.eq.${path}`)
          .limit(1);
        const row = rows?.[0];
        if (!row) return new Response("Not found", { status: 404 });

        const { data: file, error } = await supabaseAdmin.storage
          .from("site-images")
          .download(path);
        if (error || !file) return new Response("Not found", { status: 404 });

        const isPoster = row.poster_path === path && row.storage_path !== path;
        const type =
          (!isPoster && row.mime_type) || file.type || guessType(path) || "application/octet-stream";
        const buffer = new Uint8Array(await file.arrayBuffer());
        const total = buffer.byteLength;

        const base = {
          "Content-Type": type,
          "Cache-Control": "public, max-age=31536000, immutable",
          "Accept-Ranges": "bytes",
        };

        const range = request.headers.get("range");
        const match = range?.match(/^bytes=(\d*)-(\d*)$/);
        if (match) {
          const start = match[1] ? Number(match[1]) : 0;
          const end = match[2] ? Math.min(Number(match[2]), total - 1) : total - 1;
          if (Number.isNaN(start) || Number.isNaN(end) || start > end || start >= total) {
            return new Response(null, {
              status: 416,
              headers: { ...base, "Content-Range": `bytes */${total}` },
            });
          }
          return new Response(buffer.slice(start, end + 1), {
            status: 206,
            headers: {
              ...base,
              "Content-Range": `bytes ${start}-${end}/${total}`,
              "Content-Length": String(end - start + 1),
            },
          });
        }

        return new Response(buffer, {
          headers: { ...base, "Content-Length": String(total) },
        });
      },
    },
  },
});

function guessType(path: string): string | null {
  const ext = path.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
    svg: "image/svg+xml",
  };
  return map[ext] ?? null;
}
