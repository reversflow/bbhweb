import { useEffect, useState } from "react";
import { Heart, MessageCircle, Reply } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVisitorKey } from "@/hooks/use-visitor-key";
import { cn } from "@/lib/utils";

type CommentRow = {
  id: string;
  parent_id: string | null;
  author_name: string;
  content: string;
  like_count: number;
  created_at: string;
};

export function CommentSection({ songId, enabled }: { songId: string; enabled: boolean }) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const visitorKey = useVisitorKey();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("comments")
        .select("id, parent_id, author_name, content, like_count, created_at")
        .eq("song_id", songId)
        .order("created_at", { ascending: false });
      setComments((data ?? []) as CommentRow[]);
      setLoading(false);
    })();
  }, [songId]);

  useEffect(() => {
    if (!visitorKey || comments.length === 0) return;
    (async () => {
      const { data } = await supabase
        .from("comment_likes")
        .select("comment_id")
        .eq("visitor_key", visitorKey)
        .in("comment_id", comments.map((c) => c.id));
      setLikedIds(new Set((data ?? []).map((r) => r.comment_id)));
    })();
  }, [visitorKey, comments]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !content.trim() || submitting) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from("comments")
      .insert({
        song_id: songId,
        parent_id: replyTo,
        author_name: name.trim().slice(0, 60),
        content: content.trim().slice(0, 2000),
        visitor_key: visitorKey,
      })
      .select()
      .single();
    setSubmitting(false);
    if (error) return;
    setComments((prev) => [data as CommentRow, ...prev]);
    setContent("");
    setReplyTo(null);
  }

  async function toggleLike(id: string) {
    if (!visitorKey) return;
    if (likedIds.has(id)) {
      await supabase.from("comment_likes").delete().eq("comment_id", id).eq("visitor_key", visitorKey);
      setLikedIds((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
      setComments((cs) => cs.map((c) => (c.id === id ? { ...c, like_count: Math.max(c.like_count - 1, 0) } : c)));
    } else {
      const { error } = await supabase.from("comment_likes").insert({ comment_id: id, visitor_key: visitorKey });
      if (error) return;
      setLikedIds((s) => new Set(s).add(id));
      setComments((cs) => cs.map((c) => (c.id === id ? { ...c, like_count: c.like_count + 1 } : c)));
    }
  }

  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = (id: string) => comments.filter((c) => c.parent_id === id);

  if (!enabled) {
    return (
      <div className="border-y border-white/10 py-8 text-sm text-muted-foreground">
        Les commentaires sont désactivés sur ce morceau.
      </div>
    );
  }

  return (
    <section className="border-t border-white/10 pt-10">
      <div className="mb-6 flex items-center gap-3">
        <MessageCircle className="size-5 text-electric-glow" />
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Commentaires <span className="text-muted-foreground">({comments.length})</span>
        </h2>
      </div>

      <form onSubmit={submit} className="mb-8 space-y-3 rounded-2xl border border-white/10 bg-surface/50 p-5">
        {replyTo && (
          <div className="flex items-center justify-between text-xs text-electric-glow">
            <span>Réponse à un commentaire</span>
            <button type="button" onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground">
              Annuler
            </button>
          </div>
        )}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Votre nom"
          maxLength={60}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrire un commentaire…"
          maxLength={2000}
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-2.5 text-sm outline-none focus:border-electric focus:ring-2 focus:ring-electric/30"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !name.trim() || !content.trim()}
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            {submitting ? "Envoi…" : "Publier"}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-sm text-muted-foreground">Chargement…</div>
      ) : topLevel.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-muted-foreground">
          Aucun commentaire pour l'instant.
        </div>
      ) : (
        <ul className="space-y-6">
          {topLevel.map((c) => (
            <li key={c.id} className="border-b border-white/5 pb-6 last:border-0">
              <CommentCard c={c} liked={likedIds.has(c.id)} onLike={() => toggleLike(c.id)} onReply={() => setReplyTo(c.id)} />
              {replies(c.id).length > 0 && (
                <ul className="mt-4 space-y-4 border-l border-white/10 pl-4">
                  {replies(c.id).map((r) => (
                    <li key={r.id}>
                      <CommentCard c={r} liked={likedIds.has(r.id)} onLike={() => toggleLike(r.id)} onReply={() => setReplyTo(c.id)} isReply />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function CommentCard({
  c,
  liked,
  onLike,
  onReply,
  isReply,
}: {
  c: CommentRow;
  liked: boolean;
  onLike: () => void;
  onReply: () => void;
  isReply?: boolean;
}) {
  return (
    <div className={cn(isReply && "text-sm")}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display font-bold tracking-tight">{c.author_name}</span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {new Date(c.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-line text-foreground/90">{c.content}</p>
      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
        <button onClick={onLike} className={cn("inline-flex items-center gap-1.5 hover:text-foreground", liked && "text-blood")}>
          <Heart className={cn("size-3.5", liked && "fill-current")} />
          {c.like_count}
        </button>
        {!isReply && (
          <button onClick={onReply} className="inline-flex items-center gap-1.5 hover:text-foreground">
            <Reply className="size-3.5" /> Répondre
          </button>
        )}
      </div>
    </div>
  );
}
