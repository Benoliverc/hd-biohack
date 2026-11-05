"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, FlaskConical, Orbit, Eye, EyeOff, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { setSessionUser, refreshUsers } = useApp();
  const { t } = useI18n();
  const pillars = [
    { icon: Orbit, title: t("login.pillar.chart.title"), body: t("login.pillar.chart.body") },
    { icon: Activity, title: t("login.pillar.today.title"), body: t("login.pillar.today.body") },
    { icon: FlaskConical, title: t("login.pillar.protocols.title"), body: t("login.pillar.protocols.body") },
    { icon: Sparkles, title: t("login.pillar.soul.title"), body: t("login.pillar.soul.body") },
  ];
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const u = username.trim();
    if (!u || !password) {
      setError(t("login.missingCreds"));
      return;
    }
    setLoading(true);
    try {
      const user = await api.login(u, password);
      // Seed session with login UserOut (is_admin) so Admin link appears even if
      // a subsequent GET /users is from an older API that omits the field.
      setSessionUser(user);
      await refreshUsers();
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("login.failed"));
    } finally {
      setLoading(false);
    }
  }

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
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-growth">{t("brand.name")}</p>
          <h1 className="max-w-lg text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            {t("login.headline")}
            <span className="mt-2 block text-xl font-normal text-fg-secondary sm:text-2xl">
              {t("login.subhead")}
            </span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-fg-secondary sm:text-base">
            {t("login.intro")}
          </p>
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
                  <p className="mt-0.5 text-sm text-fg-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="order-1 w-full max-w-md justify-self-center lg:order-2 lg:justify-self-end">
          <div className="rounded-2xl border border-border bg-elevated p-6 shadow-soft sm:p-8">
            <h2 className="text-xl font-semibold text-fg">{t("login.title")}</h2>
            <p className="mt-1 text-sm text-fg-muted">{t("login.hint")}</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-fg-secondary">{t("login.username")}</span>
                <input
                  autoComplete="username"
                  className="min-h-12 w-full rounded-xl border border-border bg-canvas px-3.5 text-base text-fg outline-none ring-growth/40 placeholder:text-fg-muted focus:border-growth focus:ring-2"
                  placeholder={t("login.usernamePlaceholder")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  data-testid="login-username"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-fg-secondary">{t("login.password")}</span>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    className="min-h-12 w-full rounded-xl border border-border bg-canvas px-3.5 pr-12 text-base text-fg outline-none ring-growth/40 placeholder:text-fg-muted focus:border-growth focus:ring-2"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    data-testid="login-password"
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
                <p
                  role="alert"
                  className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger"
                  data-testid="login-error"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                data-testid="login-submit"
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-growth px-4 text-base font-semibold text-fg-inverse transition hover:bg-growth-deep disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? t("login.submitting") : t("login.submit")}
              </button>
            </form>

            <p
              className="mt-5 rounded-xl border border-border bg-canvas/60 px-3.5 py-3 text-sm text-fg-muted"
              data-testid="login-invite-only"
            >
              {t("login.inviteOnly")}{" "}
              <a
                className="font-medium text-growth underline-offset-2 hover:underline"
                href="mailto:baselineapp@proton.me?subject=Baseline%20invite%20request"
              >
                baselineapp@proton.me
              </a>{" "}
              {t("login.waitlist")}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
