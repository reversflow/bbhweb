import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { moderateComment, deleteComment } from "@/lib/music.functions";
import { Check, Trash2, Clock, Loader2, MessageCircle, X } from "lucide-react";

type Row = {
  id: string;
  song_id: string | null;
  author_name: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  songs?: { title: string; slug: string } | null;
};

const FILTERS = [
  { key: "pending", label: "En attente", icon: Clock },
  { key: "approved", label: "Approuvés", icon: Check },
  { key: "rejected", label: "Rejetés", icon: X },
] as const;

export function CommentsManager() {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const { data } = await supabase
      .from("comments")
      .select("id, song_id, author_name, content, status, created_at, songs(title, slug)")
      .eq("status", status)
      .order("created_at", { ascending: false })
      .limit(200);
    setRows((data ?? []) as unknown as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function setState(id: string, next: "approved" | "rejected") {
    setBusyId(id);
    try {
      await moderateComment({ data: { id, status: next } });
      setRows((r) => r.filter((x) => x.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!confirm("Supprimer définitivement ?")) return;
    setBusyId(id);
    try {
      await deleteComment({ data: { id } });
      setRows((r) => r.filter((x) => x.id !== id));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        {FILTERS.map((f) => {
          const Icon = f.icon;
          const active = status === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                active ? "border-electric bg-electric/10 text-foreground" : "border-white/10 text-muted-foreground hover:bg-white/5"
              }`}
            >
              <Icon className="size-4" /> {f.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 p-12 text-center text-sm text-muted-foreground">Chargement…</div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center">
          <MessageCircle className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Aucun commentaire dans cette file.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => (
            <li key={c.id} className="rounded-2xl border border-white/10 bg-surface/40 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-display text-lg font-bold tracking-tight">{c.author_name}</span>
                  {c.songs && (
                    <span className="text-xs text-muted-foreground">
                      sur <span className="text-foreground/80">{c.songs.title}</span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {new Date(c.created_at).toLocaleString("fr-FR")}
                </span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-foreground/90">{c.content}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {status !== "approved" && (
                  <button
                    disabled={busyId === c.id}
                    onClick={() => setState(c.id, "approved")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-electric/15 px-3 py-1.5 text-xs font-semibold text-electric-glow hover:bg-electric/25 disabled:opacity-50"
                  >
                    {busyId === c.id ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                    Approuver
                  </button>
                )}
                {status !== "rejected" && (
                  <button
                    disabled={busyId === c.id}
                    onClick={() => setState(c.id, "rejected")}
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-white/5 disabled:opacity-50"
                  >
                    <X className="size-3.5" /> Rejeter
                  </button>
                )}
                <button
                  disabled={busyId === c.id}
                  onClick={() => remove(c.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-blood hover:bg-blood/10 disabled:opacity-50"
                >
                  <Trash2 className="size-3.5" /> Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
