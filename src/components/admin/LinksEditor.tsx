import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  adminGetLinks,
  adminListLinkables,
  setContentLinks,
  type ContentType,
  type LinkedContent,
} from "@/lib/content-links.functions";
import { Loader2, Plus, X, Search } from "lucide-react";

const LABELS: Record<ContentType, string> = {
  artist: "Artistes",
  event: "Événements",
  song: "Morceaux",
  journal: "Articles du Journal",
};

/**
 * "Contenus liés" panel. Relations are stored symmetrically in `content_links`,
 * so a link created here shows up on both sides of the site automatically.
 */
export function LinksEditor({
  sourceType,
  sourceId,
  allow,
}: {
  sourceType: ContentType;
  sourceId: string;
  allow: ContentType[];
}) {
  const [all, setAll] = useState<LinkedContent[]>([]);
  const [selected, setSelected] = useState<LinkedContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [openType, setOpenType] = useState<ContentType | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([adminListLinkables(), adminGetLinks({ data: { sourceType, sourceId } })])
      .then(([list, current]) => {
        if (!alive) return;
        setAll(list);
        setSelected(current);
      })
      .catch((e) => toast.error("Relations indisponibles : " + (e as Error).message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [sourceType, sourceId]);

  async function persist(next: LinkedContent[]) {
    setSelected(next);
    setSaving(true);
    try {
      await setContentLinks({
        data: { sourceType, sourceId, targets: next.map((n) => ({ type: n.type, id: n.id })) },
      });
    } catch (e) {
      toast.error("Enregistrement des relations impossible : " + (e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const candidates = useMemo(() => {
    if (!openType) return [];
    const needle = q.trim().toLowerCase();
    return all
      .filter((a) => a.type === openType)
      .filter((a) => !(a.type === sourceType && a.id === sourceId))
      .filter((a) => !selected.some((s) => s.id === a.id && s.type === a.type))
      .filter((a) => (needle ? a.title.toLowerCase().includes(needle) : true))
      .slice(0, 40);
  }, [all, openType, q, selected, sourceId, sourceType]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Chargement des relations…
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-electric-glow">
          Contenus liés
        </h3>
        {saving && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        La relation est enregistrée dans les deux sens : inutile de la créer une seconde fois.
      </p>

      <div className="mt-4 space-y-4">
        {allow.map((t) => {
          const rows = selected.filter((s) => s.type === t);
          return (
            <div key={t}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {LABELS[t]}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOpenType(openType === t ? null : t);
                    setQ("");
                  }}
                  className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[11px] hover:bg-white/5"
                >
                  <Plus className="size-3" /> Ajouter
                </button>
              </div>

              {rows.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2">
                  {rows.map((r) => (
                    <li
                      key={`${r.type}-${r.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-3 py-1 text-xs"
                    >
                      {r.title}
                      <button
                        type="button"
                        aria-label={`Retirer ${r.title}`}
                        onClick={() => persist(selected.filter((s) => !(s.id === r.id && s.type === r.type)))}
                        className="text-muted-foreground hover:text-blood"
                      >
                        <X className="size-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {openType === t && (
                <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      autoFocus
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder={`Rechercher dans ${LABELS[t].toLowerCase()}…`}
                      className="w-full rounded-full border border-white/10 bg-black/40 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-electric/50"
                    />
                  </div>
                  {candidates.length === 0 ? (
                    <p className="mt-3 text-xs text-muted-foreground">Aucun contenu disponible.</p>
                  ) : (
                    <ul className="mt-3 max-h-52 space-y-1 overflow-y-auto">
                      {candidates.map((c) => (
                        <li key={`${c.type}-${c.id}`}>
                          <button
                            type="button"
                            onClick={() => {
                              persist([...selected, c]);
                              setOpenType(null);
                            }}
                            className="w-full rounded-lg px-3 py-1.5 text-left text-xs hover:bg-white/5"
                          >
                            {c.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
