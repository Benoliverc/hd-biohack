export const LOCALES = ["en", "nl", "de", "fr", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_NATIVE_LABELS: Record<Locale, string> = {
  en: "English",
  nl: "Nederlands",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};

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
