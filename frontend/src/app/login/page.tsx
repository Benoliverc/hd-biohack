"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, FlaskConical, Orbit, Eye, EyeOff } from "lucide-react";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";

const DEMO_USERS: { username: string; password: string; tier: "Pro" | "Free" }[] = [
  { username: "Benjamin", password: "Wolkje", tier: "Pro" },
  { username: "Achi", password: "Kengnai", tier: "Pro" },
  { username: "Katherine", password: "Max", tier: "Pro" },
  { username: "Sam", password: "sam123", tier: "Free" },
  { username: "Alex", password: "alex123", tier: "Free" },
  { username: "Jordan", password: "jordan123", tier: "Pro" },
  { username: "Riley", password: "riley123", tier: "Free" },
  { username: "Casey", password: "casey123", tier: "Free" },
  { username: "Morgan", password: "morgan123", tier: "Pro" },
  { username: "Taylor", password: "taylor123", tier: "Free" },
];

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
    body: "A daily and weekly plan tuned to your chart and what you already take.",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUserId, refreshUsers } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const hintNames = useMemo(() => DEMO_USERS.map((u) => u.username).join(" · "), []);

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
      setUserId(user.id); // persists session + selects user
      await refreshUsers();
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(name: string, pw: string) {
    setUsername(name);
    setPassword(pw);
    setError(null);
    setDemoOpen(true);
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

      <div className="relative mx-auto grid min-h-[100dvh] max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-16">
        <section className="space-y-6 lg:pr-4">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-growth">HD Biohack</p>
          <h1 className="max-w-lg text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
            Chart. Today. Protocols.
            <span className="mt-2 block text-xl font-normal text-fg-secondary sm:text-2xl">
              Human Design that turns into a day you can follow.
            </span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-fg-secondary sm:text-base">
            Sign in to calculate your natal chart, see what the sky is doing today, and get a
            grounded biohacking plan — no mysticism, just next steps.
          </p>
          <ul className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
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

        <section className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="rounded-2xl border border-border bg-elevated p-6 shadow-soft sm:p-8">
            <h2 className="text-xl font-semibold text-fg">Sign in</h2>
            <p className="mt-1 text-sm text-fg-muted">Use a test account to explore the product.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-fg-secondary">Username</span>
                <input
                  autoComplete="username"
                  className="min-h-12 w-full rounded-xl border border-border bg-canvas px-3.5 text-base text-fg outline-none ring-growth/40 placeholder:text-fg-muted focus:border-growth focus:ring-2"
                  placeholder="e.g. Benjamin"
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

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center" aria-hidden>
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wide">
                <span className="bg-elevated px-2 text-fg-muted">or</span>
              </div>
            </div>

            <button
              type="button"
              className="flex min-h-12 w-full items-center justify-center rounded-xl border border-border bg-canvas px-4 text-sm font-medium text-fg-secondary hover:border-growth hover:text-fg"
              onClick={() =>
                alert("Google OAuth via Supabase Auth — stub UI. Wire SUPABASE_* keys to enable.")
              }
            >
              Sign in with Google
            </button>

            <p className="mt-5 text-center text-xs text-fg-muted">
              Test accounts: <span className="text-fg-secondary">{hintNames}</span>
            </p>

            <details
              className="mt-3 rounded-xl border border-border/80 bg-canvas/50 open:pb-2"
              open={demoOpen}
              onToggle={(e) => setDemoOpen((e.target as HTMLDetailsElement).open)}
            >
              <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-growth [&::-webkit-details-marker]:hidden">
                Demo users (for testing)
              </summary>
              <ul className="max-h-48 space-y-1 overflow-y-auto px-2 pb-2">
                {DEMO_USERS.map((u) => (
                  <li key={u.username}>
                    <button
                      type="button"
                      onClick={() => fillDemo(u.username, u.password)}
                      className="flex w-full min-h-10 items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-growth/10"
                    >
                      <span className="min-w-0 truncate">
                        <span className="font-medium text-fg">{u.username}</span>
                        <span className="text-fg-muted"> / {u.password}</span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          u.tier === "Pro"
                            ? "bg-growth/20 text-growth"
                            : "bg-sunken text-fg-muted"
                        }`}
                      >
                        {u.tier}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          </div>
          <p className="mt-4 text-center text-xs text-fg-muted">
            Local test login · passwords are for demo only
          </p>
        </section>
      </div>
    </div>
  );
}
