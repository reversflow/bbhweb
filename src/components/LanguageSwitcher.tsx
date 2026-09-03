import { LOCALES, useLocale, type Locale } from "@/lib/i18n";

const LABELS: Record<Locale, string> = { fr: "FR", es: "ES", en: "EN" };

/** Compact FR | ES | EN switcher, usable in the header and the mobile menu. */
export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  return (
    <div
      className={`inline-flex items-center rounded-full border border-white/10 p-0.5 ${className}`}
      role="group"
      aria-label="Langue / Idioma / Language"
    >
      {LOCALES.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] transition ${
            locale === l
              ? "bg-white/10 text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
