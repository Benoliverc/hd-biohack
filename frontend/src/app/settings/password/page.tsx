"use client";

import { FormEvent, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { writeSessionToken } from "@/lib/session";
import { useI18n } from "@/lib/i18n";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { accountApiMessage } from "../accountApiMessage";

export default function SettingsPasswordPage() {
  const router = useRouter();
  const { user, setSessionUser, sessionReady } = useApp();
  const { t } = useI18n();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        router.replace("/settings?password=updated");
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(accountApiMessage(message, t));
      } finally {
        setSavingPassword(false);
      }
    },
    [user, currentPassword, newPassword, confirmPassword, setSessionUser, router, t]
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
    <div className="mx-auto max-w-lg space-y-6" data-testid="settings-password-page">
      <div>
        <Link
          href="/settings"
          data-testid="settings-password-back"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-fg"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
          {t("settings.backToSettings")}
        </Link>
        <h1 className="type-title text-fg">{t("settings.changePasswordTitle")}</h1>
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

      <form
        className="space-y-3 rounded-2xl border border-border bg-elevated p-5 shadow-soft"
        data-testid="settings-change-password"
        onSubmit={(e) => void onChangePassword(e)}
        noValidate
      >
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
    </div>
  );
}
