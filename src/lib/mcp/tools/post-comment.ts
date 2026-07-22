import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "post_song_comment",
  title: "Post a comment on a song",
  description:
    "Posts a comment on a published song as the signed-in BBH user. Comments are queued for admin moderation before appearing publicly.",
  inputSchema: {
    song_slug: z.string().min(1).describe("Slug of the song to comment on."),
    content: z.string().min(1).max(2000).describe("Comment body (plain text)."),
    author_name: z.string().min(1).max(80).optional().describe("Display name; defaults to your account email."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ song_slug, content, author_name }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    const { data: song, error: songErr } = await supabase
      .from("songs")
      .select("id,comments_enabled,published")
      .eq("slug", song_slug)
      .maybeSingle();
    if (songErr) return { content: [{ type: "text", text: songErr.message }], isError: true };
    if (!song || !song.published) {
      return { content: [{ type: "text", text: "Song not found" }], isError: true };
    }
    if (!song.comments_enabled) {
      return { content: [{ type: "text", text: "Comments are disabled for this song" }], isError: true };
    }
    const displayName = author_name?.trim() || ctx.getUserEmail() || "MCP user";
    const { error } = await supabase.from("comments").insert({
      song_id: song.id,
      author_name: displayName,
      content: content.trim(),
      visitor_key: `mcp:${ctx.getUserId()}`,
      status: "pending",
    });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [
        {
          type: "text",
          text: "Comment submitted — awaiting BBH moderation before it appears publicly.",
        },
      ],
      structuredContent: { status: "pending" },
    };
  },
});
