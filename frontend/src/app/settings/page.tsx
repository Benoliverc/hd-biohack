"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { writeSessionToken } from "@/lib/session";
import { DEFAULT_PROTOCOLS_TZ } from "@/lib/protocolCompletions";
import { detectDeviceTimezone } from "@/lib/deviceTimezone";
import { useI18n, translate, type Locale, type MessageKey } from "@/lib/i18n";
import { Languages, Clock, UserRound, KeyRound, Eye, EyeOff } from "lucide-react";

function accountApiMessage(message: string, t: (key: MessageKey) => string) {
  if (message === "Choose a different password.") return t("settings.chooseDifferentPassword");
  if (message === "Type your account email to confirm.") return t("settings.deleteConfirmMismatch");
  if (
    message === "Password must be at least 8 characters" ||
    message === "Password must be at least 8 characters."
  ) {
    return t("login.passwordTooShort");
  }
  if (message.includes("Email or password") || /didn['’]t work/i.test(message)) {
    return t("login.genericAuthError");
  }
  return message;
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, setSessionUser, sessionReady, signOut } = useApp();
  const { t, locale, setLocale, locales, labels } = useI18n();
  const [langSelect, setLangSelect] = useState<Locale>(locale);
  const [firstName, setFirstName] = useState("");
  const [savingLang, setSavingLang] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deviceTz, setDeviceTz] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [savingDelete, setSavingDelete] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  useEffect(() => {
    const read = () => setDeviceTz(detectDeviceTimezone());
    read();
    const onVisibility = () => {
      if (document.visibilityState === "visible") read();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", read);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", read);
    };
  }, []);

  useEffect(() => {
    setLangSelect(locale);
  }, [locale]);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name?.trim() || "");
  }, [user?.id, user?.first_name]);

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

  const onChangePassword = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setError(null);
      setFeedback(null);
      if (newPassword.length < 8) {
        setError(t("login.passwordTooShort"));
        return;
      }
      if (newPassword !== confirmPassword) {
        setError(t("settings.passwordMismatch"));
        return;
      }
      setSavingPassword(true);
      try {
        const session = await api.changePassword(currentPassword, newPassword);
        writeSessionToken(session.access_token);
        setSessionUser(session.user);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setFeedback(t("settings.passwordUpdated"));
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(accountApiMessage(message, t));
      } finally {
        setSavingPassword(false);
      }
    },
    [user, currentPassword, newPassword, confirmPassword, setSessionUser, t]
  );

  const onDeleteAccount = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setError(null);
      setFeedback(null);
      if (deleteEmail.trim().toLowerCase() !== user.email.trim().toLowerCase()) {
        setError(t("settings.deleteConfirmMismatch"));
        return;
      }
      if (!deletePassword) {
        setError(t("login.genericAuthError"));
        return;
      }
      setSavingDelete(true);
      try {
        await api.deleteAccount(deletePassword, deleteEmail.trim());
        signOut();
        router.replace("/login");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(accountApiMessage(message, t));
        setSavingDelete(false);
      }
    },
    [user, deleteEmail, deletePassword, signOut, router, t]
  );

  const displayTz =
    deviceTz || user?.preferred_timezone?.trim() || DEFAULT_PROTOCOLS_TZ;

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
          <p className="mt-1 text-sm text-fg">{t("settings.timezoneHelp")}</p>
        </div>

        <p className="text-sm text-fg" data-testid="settings-tz-device">
          {t("settings.deviceTimezone", { tz: displayTz })}
        </p>
      </section>

      <section
        className="space-y-6 rounded-2xl border border-border bg-elevated p-5 shadow-soft"
        data-testid="settings-account"
      >
        <h2 className="flex items-center gap-2 text-base font-semibold text-fg">
          <KeyRound className="h-4 w-4 shrink-0 text-growth" aria-hidden />
          {t("settings.accountTitle")}
        </h2>

        <form
          className="space-y-3"
          data-testid="settings-change-password"
          onSubmit={(e) => void onChangePassword(e)}
          noValidate
        >
          <h3 className="text-sm font-semibold text-fg">{t("settings.changePasswordTitle")}</h3>

          <label className="block text-sm text-fg" htmlFor="current-password">
            {t("settings.currentPassword")}
          </label>
          <div className="relative">
            <input
              id="current-password"
              type={showCurrentPassword ? "text" : "password"}
              autoComplete="current-password"
              value={currentPassword}
              disabled={savingPassword}
              data-testid="settings-change-password-current"
              className="min-h-11 w-full rounded-xl border border-border bg-sunken px-3 py-2.5 pr-12 text-sm text-fg placeholder:text-fg-muted disabled:opacity-60"
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-fg"
              onClick={() => setShowCurrentPassword((v) => !v)}
              aria-label={showCurrentPassword ? t("login.hidePassword") : t("login.showPassword")}
              tabIndex={-1}
            >
              {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <label className="block text-sm text-fg" htmlFor="new-password">
            {t("settings.newPassword")}
          </label>
          <div className="relative">
            <input
              id="new-password"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              value={newPassword}
              disabled={savingPassword}
              data-testid="settings-change-password-new"
              className="min-h-11 w-full rounded-xl border border-border bg-sunken px-3 py-2.5 pr-12 text-sm text-fg placeholder:text-fg-muted disabled:opacity-60"
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-fg"
              onClick={() => setShowNewPassword((v) => !v)}
              aria-label={showNewPassword ? t("login.hidePassword") : t("login.showPassword")}
              tabIndex={-1}
            >
              {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <label className="block text-sm text-fg" htmlFor="confirm-password">
            {t("settings.confirmPassword")}
          </label>
          <div className="relative">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              disabled={savingPassword}
              data-testid="settings-change-password-confirm"
              className="min-h-11 w-full rounded-xl border border-border bg-sunken px-3 py-2.5 pr-12 text-sm text-fg placeholder:text-fg-muted disabled:opacity-60"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-fg"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? t("login.hidePassword") : t("login.showPassword")}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            data-testid="settings-change-password-submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 sm:w-auto"
          >
            {savingPassword ? t("common.saving") : t("settings.updatePassword")}
          </button>
        </form>

        <form
          className="space-y-3 border-t border-border pt-5"
          data-testid="settings-delete-account"
          onSubmit={(e) => void onDeleteAccount(e)}
          noValidate
        >
          <h3 className="text-sm font-semibold text-fg">{t("settings.deleteAccountTitle")}</h3>
          <p className="text-sm text-fg" data-testid="settings-delete-help">
            {t("settings.deleteAccountHelp")}
          </p>
          <p className="text-sm text-fg" data-testid="settings-delete-email-current">
            {user.email}
          </p>

          <label className="block text-sm text-fg" htmlFor="delete-email">
            {t("settings.deleteConfirmLabel")}
          </label>
          <input
            id="delete-email"
            type="email"
            autoComplete="off"
            value={deleteEmail}
            disabled={savingDelete}
            data-testid="settings-delete-email"
            className="min-h-11 w-full rounded-xl border border-border bg-sunken px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted disabled:opacity-60"
            onChange={(e) => setDeleteEmail(e.target.value)}
          />

          <label className="block text-sm text-fg" htmlFor="delete-password">
            {t("settings.currentPassword")}
          </label>
          <div className="relative">
            <input
              id="delete-password"
              type={showDeletePassword ? "text" : "password"}
              autoComplete="current-password"
              value={deletePassword}
              disabled={savingDelete}
              data-testid="settings-delete-password"
              className="min-h-11 w-full rounded-xl border border-border bg-sunken px-3 py-2.5 pr-12 text-sm text-fg placeholder:text-fg-muted disabled:opacity-60"
              onChange={(e) => setDeletePassword(e.target.value)}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-fg"
              onClick={() => setShowDeletePassword((v) => !v)}
              aria-label={showDeletePassword ? t("login.hidePassword") : t("login.showPassword")}
              tabIndex={-1}
            >
              {showDeletePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={savingDelete}
            data-testid="settings-delete-submit"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-danger bg-transparent px-4 py-2.5 text-sm font-semibold text-danger hover:bg-danger/5 disabled:opacity-50 sm:w-auto"
          >
            {savingDelete ? t("common.saving") : t("settings.deleteAccountSubmit")}
          </button>
        </form>
      </section>

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
