export const LOCALES = ["en", "nl"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NATIVE_LABELS: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
};

/** Retired 27 Nov 2026: not selectable; resolve to en; content files kept on disk, not loaded. */
export const RETIRED_LOCALES = ["de", "fr", "es"] as const;
export type RetiredLocale = (typeof RETIRED_LOCALES)[number];
export type LocaleCopy<T = string> = Record<Locale, T> & Partial<Record<RetiredLocale, T>>;

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: string | null | undefined): value is Locale {
  return Boolean(value && (LOCALES as readonly string[]).includes(value));
}

/** null / empty / unknown → en */
export function resolveLocale(value: string | null | undefined): Locale {
  if (!value) return DEFAULT_LOCALE;
  const primary = value.trim().toLowerCase().replace("_", "-").split("-", 1)[0];
  return isLocale(primary) ? primary : DEFAULT_LOCALE;
}
