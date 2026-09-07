import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export const LOCALES = ["fr", "es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_STORAGE_KEY = "bbh.locale";

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

type Dict = Record<string, string>;

const fr: Dict = {
  "nav.home": "Accueil",
  "nav.music": "Musique",
  "nav.events": "Événements",
  "nav.workshops": "Ateliers",
  "nav.artists": "Artistes",
  "nav.journal": "Journal",
  "nav.about": "À propos",
  "nav.contact": "Contact",
  "nav.association": "Association",
  "cta.contactUs": "Nous contacter",
  "cta.viewMore": "Voir plus",
  "cta.profile": "Profil",
  "cta.listen": "Écouter",
  "cta.read": "Lire",
  "cta.book": "Réserver",
  "cta.back": "Retour",
  "auth.login": "Connexion",
  "auth.admin": "Admin",
  "auth.adminSpace": "Espace admin",
  "artist.roster": "Tout le roster",
  "artist.notFound": "Artiste introuvable",
  "artist.notFoundText": "Cet artiste n'existe pas ou n'est plus en ligne.",
  "artist.about": "À propos",
  "artist.universe": "Univers artistique",
  "artist.music": "Musique",
  "artist.videos": "Vidéos",
  "artist.gallery": "Galerie",
  "artist.events": "Événements",
  "artist.journal": "Journal",
  "artist.booking": "Booking / Contact",
  "artist.sendProfile": "Envoyer ton profil",
  "common.language": "Langue",
  "common.empty": "Aucun contenu pour le moment.",
  "event.info": "Informations pratiques",
  "event.artists": "Artistes",
  "music.tracks": "Morceaux",
};

const es: Dict = {
  "nav.home": "Inicio",
  "nav.music": "Música",
  "nav.events": "Eventos",
  "nav.workshops": "Talleres",
  "nav.artists": "Artistas",
  "nav.journal": "Diario",
  "nav.about": "Sobre nosotros",
  "nav.contact": "Contacto",
  "nav.association": "Asociación",
  "cta.contactUs": "Contactarnos",
  "cta.viewMore": "Ver más",
  "cta.profile": "Ver perfil",
  "cta.listen": "Escuchar",
  "cta.read": "Leer",
  "cta.book": "Reservar",
  "cta.back": "Volver",
  "auth.login": "Iniciar sesión",
  "auth.admin": "Admin",
  "auth.adminSpace": "Panel de administración",
  "artist.roster": "Todo el roster",
  "artist.notFound": "Artista no encontrado",
  "artist.notFoundText": "Este artista no existe o ya no está en línea.",
  "artist.about": "Sobre",
  "artist.universe": "Universo artístico",
  "artist.music": "Música",
  "artist.videos": "Vídeos",
  "artist.gallery": "Galería",
  "artist.events": "Eventos",
  "artist.journal": "Diario",
  "artist.booking": "Booking / Contacto",
  "artist.sendProfile": "Envía tu perfil",
  "common.language": "Idioma",
  "common.empty": "Todavía no hay contenido.",
  "event.info": "Información práctica",
  "event.artists": "Artistas",
  "music.tracks": "Canciones",
};

const en: Dict = {
  "nav.home": "Home",
  "nav.music": "Music",
  "nav.events": "Events",
  "nav.workshops": "Workshops",
  "nav.artists": "Artists",
  "nav.journal": "Journal",
  "nav.about": "About",
  "nav.contact": "Contact",
  "nav.association": "Association",
  "cta.contactUs": "Contact us",
  "cta.viewMore": "View more",
  "cta.profile": "View profile",
  "cta.listen": "Listen",
  "cta.read": "Read",
  "cta.book": "Book",
  "cta.back": "Back",
  "auth.login": "Sign in",
  "auth.admin": "Admin",
  "auth.adminSpace": "Admin area",
  "artist.roster": "Full roster",
  "artist.notFound": "Artist not found",
  "artist.notFoundText": "This artist doesn't exist or is no longer online.",
  "artist.about": "About",
  "artist.universe": "Artistic universe",
  "artist.music": "Music",
  "artist.videos": "Videos",
  "artist.gallery": "Gallery",
  "artist.events": "Events",
  "artist.journal": "Journal",
  "artist.booking": "Booking / Contact",
  "artist.sendProfile": "Send your profile",
  "common.language": "Language",
  "common.empty": "No content yet.",
  "event.info": "Practical information",
  "event.artists": "Artists",
  "music.tracks": "Tracks",
};

const DICTS: Record<Locale, Dict> = { fr, es, en };

/** Translate a UI key, falling back to French then to the key itself. */
export function translate(locale: Locale, key: string): string {
  return DICTS[locale]?.[key] ?? DICTS[DEFAULT_LOCALE][key] ?? key;
}

type Ctx = { locale: Locale; setLocale: (l: Locale) => void; t: (key: string) => string };

const LocaleContext = createContext<Ctx>({
  locale: DEFAULT_LOCALE,
  setLocale: () => undefined,
  t: (k) => translate(DEFAULT_LOCALE, k),
});

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Read the stored choice after hydration so SSR markup stays stable.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
      if (isLocale(saved)) setLocaleState(saved);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      /* storage unavailable */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({ locale, setLocale, t: (key: string) => translate(locale, key) }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

/** Shorthand hook returning only the translate function. */
export function useT() {
  return useContext(LocaleContext).t;
}

export type Translations = Partial<Record<Locale, Record<string, string>>>;

/** Parse the `translations` jsonb column into a safe shape. */
export function parseTranslations(v: unknown): Translations {
  if (!v || typeof v !== "object") return {};
  const out: Translations = {};
  for (const l of LOCALES) {
    const raw = (v as Record<string, unknown>)[l];
    if (raw && typeof raw === "object") {
      const fields: Record<string, string> = {};
      for (const [k, val] of Object.entries(raw as Record<string, unknown>)) {
        if (typeof val === "string" && val.trim().length > 0) fields[k] = val;
      }
      out[l] = fields;
    }
  }
  return out;
}

/**
 * Resolve a translated field with a clean fallback on the source value.
 * Never returns undefined/null so the UI can render it directly.
 */
export function tField(
  translations: Translations | undefined,
  locale: Locale,
  field: string,
  fallback: string | null | undefined,
): string {
  const value = translations?.[locale]?.[field];
  if (typeof value === "string" && value.trim().length > 0) return value;
  return typeof fallback === "string" ? fallback : "";
}

/**
 * Generic helper: return a copy of a record with the listed fields resolved
 * for the given locale, falling back to the stored (French) value.
 */
export function localizeFields<T extends object>(
  row: T,
  locale: Locale,
  fields: readonly string[],
): T {
  const tr = parseTranslations((row as { translations?: unknown }).translations);
  const out = { ...row } as Record<string, unknown>;
  for (const f of fields) {
    const current = out[f];
    if (typeof current === "string" || current == null) {
      const resolved = tField(tr, locale, f, current as string | null | undefined);
      if (resolved) out[f] = resolved;
    }
  }
  return out as T;
}
