"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { DEFAULT_PROTOCOLS_TZ } from "@/lib/protocolCompletions";
import { useI18n, translate, type Locale } from "@/lib/i18n";
import { Languages, Clock, UserRound } from "lucide-react";

/** Curated common IANA zones — free-text still accepted below. */
const COMMON_TIMEZONES = [
  "Asia/Hong_Kong",
  "Asia/Tokyo",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Sao_Paulo",
  "Australia/Sydney",
  "Pacific/Auckland",
  "UTC",
] as const;

export default function SettingsPage() {
  const { user, setSessionUser, sessionReady } = useApp();
  const { t, locale, setLocale, locales, labels } = useI18n();
  const [tzSelect, setTzSelect] = useState<string>("");
  const [tzCustom, setTzCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [langSelect, setLangSelect] = useState<Locale>(locale);
  const [firstName, setFirstName] = useState("");
  const [savingTz, setSavingTz] = useState(false);
  const [savingLang, setSavingLang] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const current = (user.preferred_timezone || "").trim();
    if (current && !(COMMON_TIMEZONES as readonly string[]).includes(current)) {
      setUseCustom(true);
      setTzCustom(current);
      setTzSelect("");
    } else {
      setUseCustom(false);
      setTzSelect(current);
      setTzCustom("");
    }
  }, [user?.id, user?.preferred_timezone]);

  useEffect(() => {
    setLangSelect(locale);
  }, [locale]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name?.trim() || "");
  }, [user?.id, user?.first_name]);

  const effectiveValue = useMemo(() => {
    if (useCustom) return tzCustom.trim();
    return tzSelect.trim();
  }, [useCustom, tzCustom, tzSelect]);

  const saveFirstName = useCallback(async () => {
    if (!user) return;
    setSavingName(true);
    setError(null);
    setFeedback(null);
    try {
      const next = firstName.trim() || null;
      const updated = await api.patchUserSettings(user.id, {
        first_name: next,
      });
      setSessionUser(updated);
      setFirstName(updated.first_name?.trim() || "");
      setFeedback(
        next ? t("settings.savedName", { name: next }) : t("settings.savedNameCleared")
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingName(false);
    }
  }, [user, firstName, setSessionUser, t]);

  const saveTimezone = useCallback(async () => {
    if (!user) return;
    setSavingTz(true);
    setError(null);
    setFeedback(null);
    try {
      const nextTz = effectiveValue || null;
      const updated = await api.patchUserSettings(user.id, {
        preferred_timezone: nextTz,
      });
      setSessionUser(updated);
      setFeedback(
        nextTz
          ? t("settings.savedTz", { tz: nextTz })
          : t("settings.savedTzDefault", { tz: DEFAULT_PROTOCOLS_TZ })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingTz(false);
    }
  }, [user, effectiveValue, setSessionUser, t]);

  const saveLanguage = useCallback(async () => {
    if (!user) return;
    setSavingLang(true);
    setError(null);
    setFeedback(null);
    try {
      // Apply immediately so chrome switches without waiting on the round-trip.
      setLocale(langSelect);
      const updated = await api.patchUserSettings(user.id, {
        preferred_locale: langSelect,
      });
      setSessionUser(updated);
      // Use explicit locale so toast matches the language just applied (not stale `t`).
      setFeedback(
        translate(langSelect, "settings.savedLanguage", { label: labels[langSelect] })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingLang(false);
    }
  }, [user, langSelect, setLocale, setSessionUser, labels]);

  const onLanguageChange = useCallback(
    async (next: Locale) => {
      setLangSelect(next);
      // Soft apply on change (same UX as immediate chrome switch).
      setLocale(next);
      if (!user) return;
      setSavingLang(true);
      setError(null);
      setFeedback(null);
      try {
        const updated = await api.patchUserSettings(user.id, {
          preferred_locale: next,
        });
        setSessionUser(updated);
        setFeedback(
          translate(next, "settings.savedLanguage", { label: labels[next] })
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setSavingLang(false);
      }
    },
    [user, setLocale, setSessionUser, labels]
  );

  if (!sessionReady) {
    return <p className="text-sm text-fg-muted">{t("common.loading")}</p>;
  }

  if (!user) {
    return (
      <p className="text-sm text-fg-muted">
        <Link href="/login" className="underline">
          {t("empty.signInSettings")}
        </Link>{" "}
        {t("settings.signInPrompt")}
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6" data-testid="settings-page">
      <div>
        <h1 className="type-title text-fg">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-fg-secondary">{t("settings.subtitle")}</p>
      </div>

      {(feedback || error) && (
        <div className="space-y-1" data-testid="settings-feedback-banner">
          {feedback && (
            <p className="text-sm text-growth-ink" role="status" data-testid="settings-feedback">
              {feedback}
            </p>
          )}
          {error && (
            <p className="text-sm text-danger" role="alert" data-testid="settings-error">
              {error}
            </p>
          )}
        </div>
      )}

      <section
        className="space-y-3 rounded-2xl border border-border bg-elevated p-5 shadow-soft"
        data-testid="settings-first-name"
      >
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
            <UserRound className="h-4 w-4 shrink-0 text-growth" aria-hidden />
            {t("settings.nameTitle")}
          </h2>
          <p className="mt-1 text-xs text-fg-muted">{t("settings.nameHelp")}</p>
        </div>

        <label className="block text-sm text-fg-secondary" htmlFor="first-name">
          {t("settings.nameLabel")}
        </label>
        <input
          id="first-name"
          type="text"
          maxLength={64}
          autoComplete="given-name"
          placeholder={t("settings.namePlaceholder")}
          value={firstName}
          disabled={savingName}
          data-testid="settings-first-name-input"
          className="min-h-11 w-full rounded-xl border border-border bg-sunken px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted disabled:opacity-60"
          onChange={(e) => setFirstName(e.target.value)}
        />

        <button
          type="button"
          disabled={savingName}
          data-testid="settings-first-name-save"
          onClick={() => void saveFirstName()}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 sm:w-auto"
        >
          {savingName ? t("common.saving") : t("settings.saveName")}
        </button>
      </section>

      <section
        className="space-y-3 rounded-2xl border border-border bg-elevated p-5 shadow-soft"
        data-testid="settings-language"
      >
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
            <Languages className="h-4 w-4 shrink-0 text-growth" aria-hidden />
            {t("settings.languageTitle")}
          </h2>
          <p className="mt-1 text-xs text-fg-muted">{t("settings.languageHelp")}</p>
        </div>

        <label className="block text-sm text-fg-secondary" htmlFor="lang-select">
          {t("settings.languageLabel")}
        </label>
        <select
          id="lang-select"
          disabled={savingLang}
          className="min-h-11 w-full rounded-xl border border-border bg-sunken px-3 py-2.5 text-sm text-fg disabled:opacity-60"
          value={langSelect}
          data-testid="settings-lang-select"
          onChange={(e) => void onLanguageChange(e.target.value as Locale)}
        >
          {locales.map((code) => (
            <option key={code} value={code}>
              {labels[code]}
            </option>
          ))}
        </select>

        <p className="text-xs text-fg-muted">{t("gloss.hdTerms")}</p>

        <button
          type="button"
          disabled={savingLang}
          data-testid="settings-lang-save"
          onClick={() => void saveLanguage()}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-border bg-canvas px-4 py-2.5 text-sm font-semibold text-fg hover:border-growth disabled:opacity-50 sm:w-auto"
        >
          {savingLang ? t("common.saving") : t("settings.saveLanguage")}
        </button>
      </section>

      <section
        className="space-y-3 rounded-2xl border border-border bg-elevated p-5 shadow-soft"
        data-testid="settings-timezone"
      >
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
            <Clock className="h-4 w-4 shrink-0 text-growth" aria-hidden />
            {t("settings.timezoneTitle")}
          </h2>
          <p className="mt-1 text-xs text-fg-muted">{t("settings.timezoneHelp")}</p>
        </div>

        <label className="block text-sm text-fg-secondary" htmlFor="tz-select">
          {t("settings.commonZones")}
        </label>
        <select
          id="tz-select"
          disabled={useCustom || savingTz}
          className="min-h-11 w-full rounded-xl border border-border bg-sunken px-3 py-2.5 text-sm text-fg disabled:opacity-60"
          value={tzSelect}
          data-testid="settings-tz-select"
          onChange={(e) => {
            setTzSelect(e.target.value);
            setUseCustom(false);
          }}
        >
          <option value="">{t("settings.defaultTz", { tz: DEFAULT_PROTOCOLS_TZ })}</option>
          {COMMON_TIMEZONES.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>

        <label className="flex min-h-11 items-center gap-2 text-sm text-fg-secondary">
          <input
            type="checkbox"
            checked={useCustom}
            data-testid="settings-tz-custom-toggle"
            onChange={(e) => setUseCustom(e.target.checked)}
          />
          {t("settings.customTzToggle")}
        </label>

        {useCustom && (
          <div>
            <label className="block text-sm text-fg-secondary" htmlFor="tz-custom">
              {t("settings.ianaName")}
            </label>
            <input
              id="tz-custom"
              type="text"
              maxLength={128}
              placeholder="e.g. Pacific/Honolulu"
              value={tzCustom}
              disabled={savingTz}
              data-testid="settings-tz-custom"
              className="mt-1 min-h-11 w-full rounded-xl border border-border bg-sunken px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted"
              onChange={(e) => setTzCustom(e.target.value)}
            />
          </div>
        )}

        <p className="text-xs text-fg-muted" data-testid="settings-tz-current">
          {t("settings.current")}{" "}
          <span className="font-medium text-fg">
            {user.preferred_timezone?.trim() ||
              t("settings.defaultTz", { tz: DEFAULT_PROTOCOLS_TZ })}
          </span>
        </p>

        <button
          type="button"
          disabled={savingTz}
          data-testid="settings-tz-save"
          onClick={() => void saveTimezone()}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 sm:w-auto"
        >
          {savingTz ? t("common.saving") : t("settings.saveTimezone")}
        </button>

      </section>

      <p
        className="rounded-xl border border-border/80 bg-elevated/70 px-4 py-3 text-xs text-fg-muted shadow-soft"
        data-testid="settings-footer-account"
      >
        {t("settings.footerAccount")}
      </p>

      <p
        className="type-caption text-fg-muted"
        data-testid="settings-privacy-footer"
      >
        <Link
          href="/privacy"
          className="text-fg-secondary underline-offset-2 hover:underline"
        >
          {t("privacy.link")}
        </Link>
        <span aria-hidden className="mx-1.5">
          ·
        </span>
        <span>{t("privacy.copyrightShort")}</span>
      </p>
    </div>
  );
}
