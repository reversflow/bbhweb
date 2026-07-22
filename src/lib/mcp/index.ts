import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listSongs from "./tools/list-songs";
import getSong from "./tools/get-song";
import listJournal from "./tools/list-journal";
import getJournalPost from "./tools/get-journal-post";
import listArtists from "./tools/list-artists";
import postComment from "./tools/post-comment";

// The OAuth issuer must be the direct Supabase host (not the .lovable.cloud proxy).
// Vite inlines VITE_SUPABASE_PROJECT_ID at build time as a literal string.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "bbh-mcp",
  title: "BBH Association MCP",
  version: "0.1.0",
  instructions:
    "Tools for BBH Association / REVERSEFLOW: browse published songs, journal posts and the artist roster, and post comments as the signed-in user (moderated).",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listSongs, getSong, listJournal, getJournalPost, listArtists, postComment],
});
