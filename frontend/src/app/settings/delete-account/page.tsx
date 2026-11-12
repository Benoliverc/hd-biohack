"use client";

import { FormEvent, useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { accountApiMessage } from "../accountApiMessage";

export default function SettingsDeleteAccountPage() {
  const router = useRouter();
  const { user, sessionReady, signOut } = useApp();
  const { t } = useI18n();
  const [deleteEmail, setDeleteEmail] = useState("");
  const [deletePassword, setDeletePassword] = useState("");
  const [savingDelete, setSavingDelete] = useState(false);
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div className="mx-auto max-w-lg space-y-6" data-testid="settings-delete-page">
      <div>
        <Link
          href="/settings"
          data-testid="settings-delete-back"
          className="inline-flex min-h-11 items-center gap-1 text-sm text-fg"
        >
          <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
          {t("settings.backToSettings")}
        </Link>
        <h1 className="type-title text-fg">{t("settings.deleteAccountTitle")}</h1>
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
        data-testid="settings-delete-account"
        onSubmit={(e) => void onDeleteAccount(e)}
        noValidate
      >
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
    </div>
  );
}
