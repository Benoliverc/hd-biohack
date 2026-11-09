"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { writeSessionToken } from "@/lib/session";
import Link from "next/link";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = (params.get("token") || "").trim();
  const { setSessionUser } = useApp();
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError(t("reset.expired"));
      return;
    }
    if (password.length < 8) {
      setError(t("login.passwordTooShort"));
      return;
    }
    setLoading(true);
    try {
      const session = await api.resetPassword(token, password);
      writeSessionToken(session.access_token);
      setSessionUser(session.user);
      router.replace("/");
    } catch {
      setError(t("reset.expired"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-elevated p-6 shadow-soft sm:p-8">
      <h1 className="text-xl font-semibold text-fg">{t("reset.title")}</h1>
      <p className="mt-1 type-body text-fg-muted">{t("reset.hint")}</p>
      {!token ? (
        <div className="mt-6 space-y-3">
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 type-body text-danger">
            {t("reset.expired")}
          </p>
          <Link href="/login" className="inline-block font-medium text-growth underline-offset-2 hover:underline">
            {t("login.forgotPassword")}
          </Link>
        </div>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          <label className="block space-y-1.5">
            <span className="type-body font-medium text-fg-secondary">{t("login.password")}</span>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                className="min-h-12 w-full rounded-xl border border-border bg-canvas px-3.5 pr-12 text-base text-fg outline-none ring-growth/40 focus:border-growth focus:ring-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                data-testid="reset-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-fg-muted hover:text-fg"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? t("login.hidePassword") : t("login.showPassword")}
                tabIndex={-1}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
          {error && (
            <p role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 type-body text-danger">
              {error}{" "}
              <Link href="/login" className="font-medium underline-offset-2 hover:underline">
                {t("login.forgotPassword")}
              </Link>
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            data-testid="reset-submit"
            className="flex min-h-12 w-full items-center justify-center rounded-xl bg-growth px-4 text-base font-semibold text-fg-inverse transition hover:bg-growth-deep disabled:opacity-60"
          >
            {loading ? t("login.submitting") : t("reset.submit")}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[100dvh] items-start justify-center bg-canvas px-4 py-10">
      <Suspense fallback={<div className="type-body text-fg-muted">…</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
