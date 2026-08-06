import { useEffect, useMemo, useState } from "react";
import { getSiteContent, updateSiteContent } from "@/lib/site-content.functions";
import { PAGE_LABELS, type SiteContentRow } from "@/lib/site-content.shared";

const field =
  "w-full rounded-xl border border-white/10 bg-background px-4 py-2.5 text-sm outline-none transition focus:border-electric/50";

export function ContentManager() {
  const [rows, setRows] = useState<SiteContentRow[]>([]);
  const [dirty, setDirty] = useState<Record<string, { text: string; link: string }>>({});
  const [page, setPage] = useState<string>("home");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function refresh() {
    const bundle = await getSiteContent();
    setRows(bundle.content);
    setDirty({});
  }
  useEffect(() => {
    refresh();
  }, []);

  const pages = useMemo(
    () => Array.from(new Set(rows.map((r) => r.page_key))).sort(),
    [rows],
  );
  const visible = rows.filter((r) => r.page_key === page);

  function value(row: SiteContentRow) {
    return dirty[row.content_key] ?? { text: row.text_value, link: row.link_value };
  }

  function edit(row: SiteContentRow, patch: Partial<{ text: string; link: string }>) {
    setDirty((prev) => ({
      ...prev,
      [row.content_key]: { ...value(row), ...patch },
    }));
  }

  async function save() {
    const items = Object.entries(dirty).map(([content_key, v]) => ({
      content_key,
      text_value: v.text,
      link_value: v.link,
    }));
    if (items.length === 0) return;
    setSaving(true);
    setStatus(null);
    try {
      await updateSiteContent({ data: { items } });
      await refresh();
      setStatus("Contenus enregistrés.");
    } catch (err) {
      setStatus("Erreur : " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-black tracking-tighter">Textes du site</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Modifie les titres, textes et boutons de chaque page, sans toucher au code.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => setPage(p)}
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] transition ${
              page === p
                ? "border-electric/50 bg-electric/10 text-electric-glow"
                : "border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            {PAGE_LABELS[p] ?? p}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {visible.map((row) => {
          const v = value(row);
          const long = v.text.length > 90 || row.content_type === "richtext";
          return (
            <div key={row.id} className="rounded-2xl border border-white/10 bg-surface/40 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {row.section_key} · {row.content_key}
              </p>
              {long ? (
                <textarea
                  rows={4}
                  className={`${field} mt-3`}
                  value={v.text}
                  onChange={(e) => edit(row, { text: e.target.value })}
                />
              ) : (
                <input
                  className={`${field} mt-3`}
                  value={v.text}
                  onChange={(e) => edit(row, { text: e.target.value })}
                />
              )}
              {(row.content_type === "link" || row.content_type === "button" || v.link) && (
                <input
                  className={`${field} mt-2`}
                  placeholder="Destination du bouton (/contact ou https://…)"
                  value={v.link}
                  onChange={(e) => edit(row, { link: e.target.value })}
                />
              )}
            </div>
          );
        })}
        {visible.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun contenu éditable sur cette page.</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving || Object.keys(dirty).length === 0}
          className="rounded-full bg-electric px-6 py-2.5 text-sm font-semibold text-background disabled:opacity-40"
        >
          {saving ? "Enregistrement…" : "Enregistrer les modifications"}
        </button>
        {status && <span className="text-sm text-muted-foreground">{status}</span>}
      </div>
    </div>
  );
}
