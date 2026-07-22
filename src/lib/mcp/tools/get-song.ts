import { createClient } from "@supabase/supabase-js";
import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "get_song",
  title: "Get song",
  description:
    "Returns full details of a published song by its slug (description, lyrics, credits, streaming links).",
  inputSchema: { slug: z.string().min(1).describe("Song slug, e.g. 'reverseflow-intro'.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }) => {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase
      .from("songs")
      .select(
        "slug,title,description,genres,duration_seconds,release_date,cover_url,lyrics,credits,streaming_links,seo_description",
      )
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) return { content: [{ type: "text", text: "Song not found" }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { song: data },
    };
  },
});
