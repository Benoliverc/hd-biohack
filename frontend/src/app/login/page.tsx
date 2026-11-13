"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, FlaskConical, Orbit, Eye, EyeOff, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { writeSessionToken } from "@/lib/session";
import { postSignInPath } from "@/lib/youChart";
import Link from "next/link";

type Mode = "signin" | "create" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const { setSessionUser } = useApp();
  const { t } = useI18n();
  const pillars = [
    { icon: Orbit, title: t("login.pillar.chart.title"), body: t("login.pillar.chart.body") },
    { icon: Activity, title: t("login.pillar.today.title"), body: t("login.pillar.today.body") },
    { icon: FlaskConical, title: t("login.pillar.protocols.title"), body: t("login.pillar.protocols.body") },
    { icon: Sparkles, title: t("login.pillar.soul.title"), body: t("login.pillar.soul.body") },
  ];
  const [mode, setMode] = useState<Mode>("signin");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function applySession(
    accessToken: string,
    user: Parameters<typeof setSessionUser>[0],
    intent: "create" | "signin"
  ) {
    writeSessionToken(accessToken);
    setSessionUser(user);
    // Create-account always lands on Chart. Sign-in checks /charts for a You natal;
    // if that check is unknown, land on /profile (returners with a You chart go to Today).
    if (intent === "create") {
      router.replace("/profile");
      return;
    }
    const path = await postSignInPath(user.id);
    router.replace(path);
  }

  async function onSignIn(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const u = identifier.trim();
    if (!u || !password) {
      setError(t("login.missingCreds"));
      return;
    }
    setLoading(true);
    try {
      const session = await api.login(u, password);
      await applySession(session.access_token, session.user, "signin");
    } catch {
      setError(t("login.genericAuthError"));
    } finally {
      setLoading(false);
    }
  }

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const em = email.trim();
    if (!em || !password) {
      setError(t("login.missingCreateFields"));
      return;
    }
    if (password.length < 8) {
      setError(t("login.passwordTooShort"));
      return;
    }
    setLoading(true);
    try {
      const session = await api.register({
        email: em,
        password,
        first_name: firstName.trim() || undefined,
      });
      await applySession(session.access_token, session.user, "create");
    } catch {
      setError(t("login.genericAuthError"));
    } finally {
      setLoading(false);
    }
  }

  async function onForgot(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const em = email.trim();
    if (!em) {
      setError(t("login.missingForgotEmail"));
      return;
    }
    setLoading(true);
    try {
      const res = await api.forgotPassword(em);
      setInfo(res.message || t("login.resetSent"));
    } catch {
      // Still generic success — no existence leak
      setInfo(t("login.resetSent"));
    } finally {
      setLoading(false);
    }
  }

  const betaNote = (
    <p
      className="mt-4 rounded-xl border border-growth/30 bg-growth-soft/60 px-3.5 py-3 type-body text-fg-secondary"
      data-testid="login-beta-note"
    >
      {t("login.betaNote")}
    </p>
  );

  const supportLine = (
    <p className="mt-4 type-caption text-fg-secondary">
      {t("login.supportPrefix")}{" "}
      <a className="text-growth underline-offset-2 hover:underline" href="mailto:baselineapp@proton.me">
        baselineapp@proton.me
      </a>
    </p>
  );

  return (
    <div className="relative min-h-[calc(100dvh-0px)] overflow-x-clip bg-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 10% 0%, var(--growth-soft), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 100%, color-mix(in srgb, var(--energy) 18%, transparent), transparent 50%)",
        }}
      />

      <div className="relative mx-auto grid min-h-[100dvh] max-w-6xl gap-8 px-4 py-6 lg:grid-cols-2 lg:items-start lg:gap-12 lg:py-10">
        <section className="order-2 space-y-6 lg:order-1 lg:pr-4">
          <p className="type-meta font-medium uppercase tracking-[0.14em] text-growth">{t("brand.name")}</p>
          <h1 className="max-w-lg text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {t("login.headline")}
            <span className="mt-2 block text-xl font-normal text-fg-secondary sm:text-2xl">
              {t("login.subhead")}
            </span>
          </h1>
          <p className="max-w-md type-body leading-relaxed text-fg-secondary">{t("login.intro")}</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {pillars.map(({ icon: Icon, title, body }) => (
              <li
                key={title}
                className="flex gap-3 rounded-xl border border-border/80 bg-elevated/60 p-3.5 backdrop-blur-sm"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-growth/15 text-growth">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-fg">{title}</p>
                  <p className="mt-0.5 type-body text-fg-secondary">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="order-1 w-full max-w-md justify-self-center lg:order-2 lg:justify-self-end">
          <div className="mb-6 lg:hidden" data-testid="login-mobile-brand">
            <p className="type-meta font-medium uppercase tracking-[0.14em] text-growth">{t("brand.name")}</p>
            <p className="mt-2 text-xl font-normal text-fg-secondary">{t("login.subhead")}</p>
          </div>
          <div className="rounded-2xl border border-border bg-elevated p-6 shadow-soft sm:p-8">
            {mode !== "forgot" && (
              <div className="flex gap-1 rounded-xl bg-canvas/80 p-1" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "signin"}
                  className={`min-h-11 flex-1 rounded-lg px-3 type-body font-medium transition ${
                    mode === "signin" ? "bg-elevated text-fg shadow-sm" : "text-fg-secondary hover:text-fg"
                  }`}
                  onClick={() => {
                    setMode("signin");
                    setError(null);
                    setInfo(null);
                  }}
                  data-testid="login-tab-signin"
                >
                  {t("login.title")}
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "create"}
                  className={`min-h-11 flex-1 rounded-lg px-3 type-body font-medium transition ${
                    mode === "create" ? "bg-elevated text-fg shadow-sm" : "text-fg-secondary hover:text-fg"
                  }`}
                  onClick={() => {
                    setMode("create");
                    setError(null);
                    setInfo(null);
                  }}
                  data-testid="login-tab-create"
                >
                  {t("login.createAccount")}
                </button>
              </div>
            )}

            {mode === "signin" && (
              <>
                <p className="mt-5 type-body text-fg-secondary">{t("login.hintEmail")}</p>
                <form className="mt-6 space-y-4" onSubmit={onSignIn} noValidate>
                  <label className="block space-y-1.5">
                    <span className="type-body font-medium text-fg-secondary">{t("login.email")}</span>
                    <input
                      autoComplete="username"
                      className="min-h-12 w-full rounded-xl border border-border bg-canvas px-3.5 text-base text-fg outline-none ring-growth/40 placeholder:text-fg-muted focus:border-growth focus:ring-2"
                      placeholder={t("login.emailPlaceholder")}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      disabled={loading}
                      data-testid="login-username"
                    />
                  </label>
                  <PasswordField
                    showPw={showPw}
                    setShowPw={setShowPw}
                    password={password}
                    setPassword={setPassword}
                    loading={loading}
                    t={t}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="inline-flex min-h-11 items-center type-body font-medium text-growth underline-offset-2 hover:underline"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                      setInfo(null);
                      setEmail(identifier.includes("@") ? identifier : "");
                    }}
                    data-testid="login-forgot-link"
                  >
                    {t("login.forgotPassword")}
                  </button>
                  {error && <AuthError message={error} />}
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="login-submit"
                    className="flex min-h-12 w-full items-center justify-center rounded-xl bg-growth px-4 text-base font-semibold text-fg-inverse transition hover:bg-growth-deep disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? t("login.submitting") : t("login.submit")}
                  </button>
                </form>
                {betaNote}
                {supportLine}
              </>
            )}

            {mode === "create" && (
              <>
                <form className="mt-6 space-y-4" onSubmit={onCreate} noValidate>
                  <label className="block space-y-1.5">
                    <span className="type-body font-medium text-fg-secondary">{t("login.email")}</span>
                    <input
                      autoComplete="email"
                      type="email"
                      className="min-h-12 w-full rounded-xl border border-border bg-canvas px-3.5 text-base text-fg outline-none ring-growth/40 placeholder:text-fg-muted focus:border-growth focus:ring-2"
                      placeholder={t("login.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      data-testid="create-email"
                    />
                  </label>
                  <label className="block space-y-1.5">
                    <span className="type-body font-medium text-fg-secondary">{t("login.firstNameOptional")}</span>
                    <input
                      autoComplete="given-name"
                      className="min-h-12 w-full rounded-xl border border-border bg-canvas px-3.5 text-base text-fg outline-none ring-growth/40 placeholder:text-fg-muted focus:border-growth focus:ring-2"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={loading}
                      data-testid="create-first-name"
                    />
                  </label>
                  <PasswordField
                    showPw={showPw}
                    setShowPw={setShowPw}
                    password={password}
                    setPassword={setPassword}
                    loading={loading}
                    t={t}
                    autoComplete="new-password"
                  />
                  {error && <AuthError message={error} />}
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="create-submit"
                    className="flex min-h-12 w-full items-center justify-center rounded-xl bg-growth px-4 text-base font-semibold text-fg-inverse transition hover:bg-growth-deep disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? t("login.creating") : t("login.createAccount")}
                  </button>
                </form>
                {betaNote}
                {supportLine}
              </>
            )}

            {mode === "forgot" && (
              <>
                <h2 className="text-xl font-semibold text-fg">{t("login.forgotPassword")}</h2>
                <p className="mt-1 type-body text-fg-secondary">{t("login.forgotHint")}</p>
                <form className="mt-6 space-y-4" onSubmit={onForgot} noValidate>
                  <label className="block space-y-1.5">
                    <span className="type-body font-medium text-fg-secondary">{t("login.email")}</span>
                    <input
                      autoComplete="email"
                      type="email"
                      className="min-h-12 w-full rounded-xl border border-border bg-canvas px-3.5 text-base text-fg outline-none ring-growth/40 placeholder:text-fg-muted focus:border-growth focus:ring-2"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      data-testid="forgot-email"
                    />
                  </label>
                  {error && <AuthError message={error} />}
                  {info && (
                    <p
                      role="status"
                      className="rounded-lg border border-growth/30 bg-growth/10 px-3 py-2 type-body text-fg-secondary"
                      data-testid="forgot-success"
                    >
                      {info}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    data-testid="forgot-submit"
                    className="flex min-h-12 w-full items-center justify-center rounded-xl bg-growth px-4 text-base font-semibold text-fg-inverse transition hover:bg-growth-deep disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? t("login.submitting") : t("login.sendResetLink")}
                  </button>
                </form>
                <button
                  type="button"
                  className="mt-4 type-body text-fg-secondary underline-offset-2 hover:underline"
                  onClick={() => {
                    setMode("signin");
                    setInfo(null);
                    setError(null);
                  }}
                >
                  {t("login.backToSignIn")}
                </button>
                {supportLine}
              </>
            )}
          </div>
          <p
            className="mt-4 text-center type-caption text-fg-secondary"
            data-testid="login-privacy-footer"
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
        </section>
      </div>
    </div>
  );
}

function AuthError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 type-body text-danger"
      data-testid="login-error"
    >
      {message}
    </p>
  );
}

function PasswordField({
  showPw,
  setShowPw,
  password,
  setPassword,
  loading,
  t,
  autoComplete,
}: {
  showPw: boolean;
  setShowPw: (v: boolean | ((p: boolean) => boolean)) => void;
  password: string;
  setPassword: (v: string) => void;
  loading: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: any) => string;
  autoComplete: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="type-body font-medium text-fg-secondary">{t("login.password")}</span>
      <div className="relative">
        <input
          type={showPw ? "text" : "password"}
          autoComplete={autoComplete}
          className="min-h-12 w-full rounded-xl border border-border bg-canvas px-3.5 pr-14 text-base text-fg outline-none ring-growth/40 placeholder:text-fg-muted focus:border-growth focus:ring-2"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          data-testid="login-password"
        />
        <button
          type="button"
          className="absolute right-1.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-fg-secondary hover:text-fg"
          onClick={() => setShowPw((v) => !v)}
          aria-label={showPw ? t("login.hidePassword") : t("login.showPassword")}
          data-testid="login-password-eye"
        >
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
