"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { catalogs, type MessageKey } from "./messages";
import {
  DEFAULT_LOCALE,
  LOCALE_NATIVE_LABELS,
  LOCALES,
  resolveLocale,
  type Locale,
} from "./types";

const STORAGE_KEY = "hd-biohack:preferred-locale";

type Vars = Record<string, string | number>;

type I18nValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Vars) => string;
  locales: typeof LOCALES;
  labels: typeof LOCALE_NATIVE_LABELS;
};

const Ctx = createContext<I18nValue | null>(null);

function format(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name: string) =>
    vars[name] != null ? String(vars[name]) : `{${name}}`
  );
}

/** Look up a key in an explicit locale (avoids stale `t` closure after setLocale). */
export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Vars
): string {
  const table = catalogs[locale] || catalogs.en;
  const raw = table[key] ?? catalogs.en[key] ?? String(key);
  return format(raw, vars);
}


function readStoredLocale(): Locale | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return resolveLocale(raw);
  } catch {
    return null;
  }
}

function writeStoredLocale(locale: Locale) {
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function I18nProvider({
  children,
  accountLocale,
}: {
  children: React.ReactNode;
  /** From session user.preferred_locale — null/undefined → stored or en */
  accountLocale?: string | null;
}) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Hydrate from account → localStorage → en once we know account preference.
  useEffect(() => {
    if (accountLocale != null && String(accountLocale).trim() !== "") {
      setLocaleState(resolveLocale(accountLocale));
      return;
    }
    const stored = readStoredLocale();
    if (stored) setLocaleState(stored);
    else setLocaleState(DEFAULT_LOCALE);
  }, [accountLocale]);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeStoredLocale(next);
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Vars) => {
      const table = catalogs[locale] || catalogs.en;
      const raw = table[key] ?? catalogs.en[key] ?? String(key);
      return format(raw, vars);
    },
    [locale]
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      locales: LOCALES,
      labels: LOCALE_NATIVE_LABELS,
    }),
    [locale, setLocale, t]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

export { LOCALES, LOCALE_NATIVE_LABELS, DEFAULT_LOCALE, resolveLocale };
export type { Locale, MessageKey };
