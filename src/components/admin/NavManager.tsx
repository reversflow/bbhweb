import { useEffect, useState } from "react";
import { getSiteContent, updateNavLinks } from "@/lib/site-content.functions";
import type { NavLink } from "@/lib/site-content.shared";
import { Plus, Trash2 } from "lucide-react";

const LOCATIONS: { value: NavLink["location"]; label: string }[] = [
  { value: "header", label: "Menu principal" },
  { value: "footer", label: "Pied de page" },
  { value: "legal", label: "Mentions légales" },
  { value: "social", label: "Réseaux sociaux" },
];

const field =
  "w-full rounded-xl border border-white/10 bg-background px-3 py-2 text-sm outline-none transition focus:border-electric/50";

type Draft = Omit<NavLink, "id"> & { id?: string };

export function NavManager() {
  const [items, setItems] = useState<Draft[]>([]);
  const [deleted, setDeleted] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function refresh() {
    const bundle = await getSiteContent();
    setItems(bundle.nav);
    setDeleted([]);
  }
  useEffect(() => {
    refresh();
  }, []);

  function update(index: number, patch: Partial<Draft>) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  }

  function add(location: NavLink["location"]) {
    setItems((prev) => [
      ...prev,
      {
        location,
        label: "Nouveau lien",
        url: "/",
        external: false,
        new_tab: false,
        enabled: true,
        sort_order: (prev.filter((p) => p.location === location).length + 1) * 10,
      },
    ]);
  }

  function remove(index: number) {
    const item = items[index];
    if (item.id) setDeleted((d) => [...d, item.id as string]);
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      await updateNavLinks({ data: { items, deleted } });
      await refresh();
      setStatus("Navigation enregistrée.");
    } catch (err) {
      setStatus("Erreur : " + (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-black tracking-tighter">Navigation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gère les liens du menu, du pied de page, des mentions légales et des réseaux sociaux.
        </p>
      </div>

      {LOCATIONS.map((loc) => (
        <section key={loc.value} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
              {loc.label}
            </h3>
            <button
              onClick={() => add(loc.value)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold hover:bg-white/5"
            >
              <Plus className="size-3.5" /> Ajouter
            </button>
          </div>

          {items.map((item, index) =>
            item.location !== loc.value ? null : (
              <div
                key={item.id ?? `new-${index}`}
                className="grid gap-3 rounded-2xl border border-white/10 bg-surface/40 p-4 sm:grid-cols-[1fr_1.4fr_auto]"
              >
                <input
                  className={field}
                  aria-label="Libellé"
                  value={item.label}
                  onChange={(e) => update(index, { label: e.target.value })}
                />
                <input
                  className={field}
                  aria-label="Destination"
                  value={item.url}
                  onChange={(e) =>
                    update(index, {
                      url: e.target.value,
                      external: /^(https?:|mailto:|tel:)/i.test(e.target.value),
                    })
                  }
                />
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <input
                    type="number"
                    aria-label="Ordre"
                    className="w-20 rounded-xl border border-white/10 bg-background px-2 py-2 text-sm"
                    value={item.sort_order}
                    onChange={(e) => update(index, { sort_order: Number(e.target.value) })}
                  />
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => update(index, { enabled: e.target.checked })}
                    />
                    Actif
                  </label>
                  <label className="inline-flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={item.new_tab}
                      onChange={(e) => update(index, { new_tab: e.target.checked })}
                    />
                    Nouvel onglet
                  </label>
                  <button
                    onClick={() => remove(index)}
                    aria-label={`Supprimer ${item.label}`}
                    className="grid size-8 place-items-center rounded-full border border-red-500/30 text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ),
          )}
        </section>
      ))}

      <div className="flex items-center gap-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-electric px-6 py-2.5 text-sm font-semibold text-background disabled:opacity-40"
        >
          {saving ? "Enregistrement…" : "Enregistrer la navigation"}
        </button>
        {status && <span className="text-sm text-muted-foreground">{status}</span>}
      </div>
    </div>
  );
}
