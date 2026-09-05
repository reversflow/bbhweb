import { useState } from "react";
import { LOCALES, DEFAULT_LOCALE, type Locale, type Translations } from "@/lib/i18n";

export type TranslatableField = {
  key: string;
  label: string;
  /** Number of textarea rows; 0 or undefined renders a single-line input. */
  rows?: number;
  /** French source value, shown as the fallback placeholder. */
  source: string;
};

const LABELS: Record<Locale, string> = { fr: "FR", es: "ES", en: "EN" };
const inputCls =
  "w-full rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-sm outline-none focus:border-electric/50";

/**
 * Per-locale editor for the translatable fields of any CMS record.
 * French stays the source of truth; ES/EN are stored in the `translations`
 * JSON column and fall back to French when left empty.
 */
export function TranslationsEditor({
  fields,
  value,
  onChange,
}: {
  fields: TranslatableField[];
  value: Translations;
  onChange: (next: Translations) => void;
}) {
  const targets = LOCALES.filter((l) => l !== DEFAULT_LOCALE);
  const [active, setActive] = useState<Locale>(targets[0]);

  const filled = (l: Locale) =>
    fields.some((f) => (value?.[l]?.[f.key] ?? "").trim().length > 0);

  function set(locale: Locale, key: string, v: string) {
    const next: Translations = { ...value, [locale]: { ...(value?.[locale] ?? {}) } };
    const bucket = next[locale] as Record<string, string>;
    if (v.trim().length === 0) delete bucket[key];
    else bucket[key] = v;
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          FR ✓ (source)
        </span>
        {targets.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setActive(l)}
            className={`rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.18em] transition ${
              active === l
                ? "border-electric/50 bg-electric/10 text-electric-glow"
                : "border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            {LABELS[l]} {filled(l) ? "✓" : "—"}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        {fields.map((f) => {
          const v = value?.[active]?.[f.key] ?? "";
          return (
            <label key={f.key} className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {f.label} — {LABELS[active]}
              </span>
              {f.rows && f.rows > 1 ? (
                <textarea
                  rows={f.rows}
                  className={inputCls}
                  value={v}
                  placeholder={f.source ? `FR : ${f.source.slice(0, 120)}` : "Vide → repli sur le français"}
                  onChange={(e) => set(active, f.key, e.target.value)}
                />
              ) : (
                <input
                  className={inputCls}
                  value={v}
                  placeholder={f.source ? `FR : ${f.source.slice(0, 120)}` : "Vide → repli sur le français"}
                  onChange={(e) => set(active, f.key, e.target.value)}
                />
              )}
            </label>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Un champ laissé vide utilise automatiquement la version française.
      </p>
    </div>
  );
}
