import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { seoQueryOptions } from "@/hooks/use-seo";
import { updateSeoPage, updateSiteSettings, type SeoPage, type SiteSettings } from "@/lib/seo.functions";
import { Loader2, Save, Search, Globe, Sparkles } from "lucide-react";

const input =
  "w-full rounded-lg border border-white/10 bg-surface/60 px-3 py-2 text-sm text-foreground outline-none transition focus:border-electric/50";
const labelCls = "text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className={labelCls}>{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground/80">{hint}</span>}
    </label>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <span className={over ? "text-[11px] text-blood" : "text-[11px] text-muted-foreground/70"}>
      {value.length}/{max} caractères
    </span>
  );
}

export function SeoManager() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(seoQueryOptions);
  const [tab, setTab] = useState<"pages" | "site">("pages");

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Chargement du SEO…
      </div>
    );
  }

  const refresh = () => qc.invalidateQueries({ queryKey: ["seo-config"] });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-black tracking-tight">SEO & référencement</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Titres, descriptions, partage social et résumés pour les IA. Les modifications sont
          appliquées immédiatement sur le site public, le sitemap et les données structurées.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setTab("pages")}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${tab === "pages" ? "border-electric/50 bg-electric/10 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground"}`}
        >
          <Search className="size-4" /> Pages
        </button>
        <button
          onClick={() => setTab("site")}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm ${tab === "site" ? "border-electric/50 bg-electric/10 text-foreground" : "border-white/10 text-muted-foreground hover:text-foreground"}`}
        >
          <Globe className="size-4" /> Réglages du site
        </button>
      </div>

      {tab === "pages" ? (
        <div className="space-y-5">
          {data.pages.map((p) => (
            <PageEditor key={p.pageKey} page={p} baseUrl={data.settings.baseUrl} onSaved={refresh} />
          ))}
        </div>
      ) : (
        <SettingsEditor settings={data.settings} onSaved={refresh} />
      )}
    </div>
  );
}

function PageEditor({
  page,
  baseUrl,
  onSaved,
}: {
  page: SeoPage;
  baseUrl: string;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(page);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => setForm(page), [page]);

  const set = <K extends keyof SeoPage>(k: K, v: SeoPage[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      await updateSeoPage({
        data: {
          pageKey: form.pageKey,
          title: form.title,
          description: form.description,
          ogTitle: form.ogTitle,
          ogDescription: form.ogDescription,
          aiSummary: form.aiSummary,
          keywords: form.keywords,
          noindex: form.noindex,
          priority: form.priority,
          changefreq: form.changefreq as never,
        },
      });
      setMsg("Enregistré ✓");
      onSaved();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface/50">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className="min-w-0">
          <span className="block font-display text-lg font-bold tracking-tight">{page.label || page.pageKey}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {baseUrl}
            {page.path} · {page.title || "sans titre"}
          </span>
        </span>
        <span className="shrink-0 text-xs uppercase tracking-widest text-muted-foreground">
          {open ? "Fermer" : "Modifier"}
        </span>
      </button>

      {open && (
        <div className="space-y-5 border-t border-white/10 p-5">
          {/* Google preview */}
          <div className="rounded-xl border border-white/10 bg-background/60 p-4">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Aperçu Google</p>
            <p className="mt-2 truncate text-xs text-emerald-400/80">
              {baseUrl}
              {page.path}
            </p>
            <p className="truncate text-[17px] text-[#8ab4f8]">{form.title || "Titre de la page"}</p>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {form.description || "Description de la page…"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Titre (balise title)" hint="Idéal : 50–60 caractères.">
              <input className={input} value={form.title} onChange={(e) => set("title", e.target.value)} maxLength={120} />
              <Counter value={form.title} max={60} />
            </Field>
            <Field label="Méta-description" hint="Idéal : 120–160 caractères.">
              <textarea className={`${input} min-h-[76px]`} value={form.description} onChange={(e) => set("description", e.target.value)} maxLength={320} />
              <Counter value={form.description} max={160} />
            </Field>
            <Field label="Titre de partage (réseaux sociaux)">
              <input className={input} value={form.ogTitle} onChange={(e) => set("ogTitle", e.target.value)} maxLength={160} />
            </Field>
            <Field label="Description de partage">
              <textarea className={`${input} min-h-[76px]`} value={form.ogDescription} onChange={(e) => set("ogDescription", e.target.value)} maxLength={320} />
            </Field>
          </div>

          <Field
            label="Résumé pour les IA (ChatGPT, Perplexity…)"
            hint="Texte factuel décrivant le contenu de la page. Utilisé par les moteurs de réponse."
          >
            <textarea className={`${input} min-h-[96px]`} value={form.aiSummary} onChange={(e) => set("aiSummary", e.target.value)} maxLength={2000} />
          </Field>

          <Field label="Mots-clés" hint="Séparés par des virgules.">
            <input
              className={input}
              value={form.keywords.join(", ")}
              onChange={(e) =>
                set(
                  "keywords",
                  e.target.value.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 30),
                )
              }
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Priorité (sitemap)">
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className={input}
                value={form.priority}
                onChange={(e) => set("priority", Math.min(1, Math.max(0, Number(e.target.value))))}
              />
            </Field>
            <Field label="Fréquence de mise à jour">
              <select className={input} value={form.changefreq} onChange={(e) => set("changefreq", e.target.value)}>
                {["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>
            <label className="flex items-end gap-2 pb-2 text-sm">
              <input type="checkbox" checked={form.noindex} onChange={(e) => set("noindex", e.target.checked)} />
              <span>Ne pas indexer cette page</span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Enregistrer
            </button>
            {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsEditor({ settings, onSaved }: { settings: SiteSettings; onSaved: () => void }) {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => setForm(settings), [settings]);

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      await updateSiteSettings({ data: form });
      setMsg("Enregistré ✓");
      onSaved();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 rounded-2xl border border-white/10 bg-surface/50 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nom du site">
          <input className={input} value={form.siteName} onChange={(e) => set("siteName", e.target.value)} />
        </Field>
        <Field label="URL du site" hint="Sert aux liens canoniques, au partage et au sitemap.">
          <input className={input} value={form.baseUrl} onChange={(e) => set("baseUrl", e.target.value)} />
        </Field>
        <Field label="Slogan">
          <input className={input} value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
        </Field>
        <Field label="Compte X / Twitter" hint="Format : @bbhassociation">
          <input className={input} value={form.twitterHandle} onChange={(e) => set("twitterHandle", e.target.value)} />
        </Field>
      </div>

      <Field label="Description par défaut" hint="Utilisée quand une page n'a pas sa propre description.">
        <textarea className={`${input} min-h-[80px]`} value={form.defaultDescription} onChange={(e) => set("defaultDescription", e.target.value)} maxLength={400} />
      </Field>

      <Field label="Résumé global pour les IA">
        <textarea className={`${input} min-h-[110px]`} value={form.aiSummary} onChange={(e) => set("aiSummary", e.target.value)} maxLength={2000} />
      </Field>

      <Field label="Mots-clés du site" hint="Séparés par des virgules.">
        <input
          className={input}
          value={form.keywords.join(", ")}
          onChange={(e) =>
            set("keywords", e.target.value.split(",").map((k) => k.trim()).filter(Boolean).slice(0, 30))
          }
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Email de contact">
          <input className={input} value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
        </Field>
        <Field label="Ville">
          <input className={input} value={form.locality} onChange={(e) => set("locality", e.target.value)} />
        </Field>
        <Field label="Région">
          <input className={input} value={form.region} onChange={(e) => set("region", e.target.value)} />
        </Field>
        <Field label="Pays" hint="Code à deux lettres, ex. FR.">
          <input className={input} value={form.country} onChange={(e) => set("country", e.target.value)} maxLength={4} />
        </Field>
      </div>

      <Field label="Réseaux sociaux" hint="Une URL complète par ligne (Instagram, YouTube, Spotify…).">
        <textarea
          className={`${input} min-h-[90px]`}
          value={form.socialLinks.join("\n")}
          onChange={(e) =>
            set("socialLinks", e.target.value.split("\n").map((v) => v.trim()).filter(Boolean).slice(0, 12))
          }
        />
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Vérification Google Search Console" hint="Uniquement le code, pas la balise complète.">
          <input className={input} value={form.googleSiteVerification} onChange={(e) => set("googleSiteVerification", e.target.value)} />
        </Field>
        <Field label="Vérification Bing">
          <input className={input} value={form.bingSiteVerification} onChange={(e) => set("bingSiteVerification", e.target.value)} />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Enregistrer
        </button>
        {msg && <span className="text-sm text-muted-foreground">{msg}</span>}
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3 text-electric-glow" /> sitemap.xml mis à jour automatiquement
        </span>
      </div>
    </div>
  );
}
