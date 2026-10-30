"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, FlaskConical, Orbit, Eye, EyeOff, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";

const PILLARS = [
  {
    icon: Orbit,
    title: "Chart",
    body: "Your natal design — type, authority, and the channels that shape your energy.",
  },
  {
    icon: Activity,
    title: "Today",
    body: "What the sky is lighting up now, in plain language you can act on.",
  },
  {
    icon: FlaskConical,
    title: "Protocols",
    body: "A checkable Today's Move from today's sky — preferring what you already own.",
  },
  {
    icon: Sparkles,
    title: "Soul",
    body: "Aura Signature and one Playbook for how you wire with someone you've charted.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { setSessionUser, refreshUsers } = useApp();
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
      setError("Enter a username and password.");
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
      setError(err instanceof Error ? err.message : "Sign in failed");
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
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-growth">Baseline</p>
          <h1 className="max-w-lg text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Chart. Today. Protocols. Soul.
            <span className="mt-2 block text-xl font-normal text-fg-secondary sm:text-2xl">
              Human Design that turns into a day you can follow.
            </span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-fg-secondary sm:text-base">
            Sign in to calculate your natal chart, see what the sky is doing today, and get
            grounded protocols — no mysticism, just next steps.
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {PILLARS.map(({ icon: Icon, title, body }) => (
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
            <h2 className="text-xl font-semibold text-fg">Sign in</h2>
            <p className="mt-1 text-sm text-fg-muted">Enter your username and password.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-fg-secondary">Username</span>
                <input
                  autoComplete="username"
                  className="min-h-12 w-full rounded-xl border border-border bg-canvas px-3.5 text-base text-fg outline-none ring-growth/40 placeholder:text-fg-muted focus:border-growth focus:ring-2"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  data-testid="login-username"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-fg-secondary">Password</span>
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
                    aria-label={showPw ? "Hide password" : "Show password"}
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
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p
              className="mt-5 rounded-xl border border-border bg-canvas/60 px-3.5 py-3 text-sm text-fg-muted"
              data-testid="login-invite-only"
            >
              Invite-only for now — no self-serve signup. Ask your host for an account, or email{" "}
              <a
                className="font-medium text-growth underline-offset-2 hover:underline"
                href="mailto:benjaminlammens@gmail.com?subject=Baseline%20invite%20request"
              >
                benjaminlammens@gmail.com
              </a>{" "}
              to join the waitlist.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
