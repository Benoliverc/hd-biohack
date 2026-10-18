"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, FlaskConical, Orbit, UserRound } from "lucide-react";
import { useApp } from "@/lib/store";

const nav = [
  { href: "/", label: "Home", icon: Orbit },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/transits", label: "Transits", icon: Activity },
  { href: "/biohack", label: "Biohack", icon: FlaskConical },
];

export function Header() {
  const pathname = usePathname();
  const {
    users,
    user,
    setUserId,
    enforcePaywall,
    setEnforcePaywall,
    previewAsFree,
    setPreviewAsFree,
    biohackingUnlocked,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold tracking-tight text-violet-300">
            HD Biohack
          </Link>
          <nav className="flex gap-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm ${
                    active
                      ? "bg-violet-600/20 text-violet-200"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <label className="flex items-center gap-2">
            <span>Dev user</span>
            <select
              className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-slate-200"
              value={user?.id ?? ""}
              onChange={(e) => setUserId(Number(e.target.value))}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.display_name} ({u.subscription_tier})
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="rounded-lg border border-slate-700 px-2 py-1 hover:border-violet-500"
            onClick={() => alert("Google OAuth via Supabase Auth — stub UI. Wire SUPABASE_* keys to enable.")}
          >
            Sign in with Google
          </button>

          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={enforcePaywall}
              onChange={(e) => setEnforcePaywall(e.target.checked)}
            />
            Enforce paywall
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={previewAsFree}
              onChange={(e) => setPreviewAsFree(e.target.checked)}
              disabled={!enforcePaywall}
            />
            Preview as Free
          </label>
          <span
            className={`rounded-full px-2 py-0.5 ${
              biohackingUnlocked
                ? "bg-emerald-900/50 text-emerald-300"
                : "bg-amber-900/50 text-amber-300"
            }`}
          >
            {biohackingUnlocked ? "Pro unlocked" : "Free tier"}
          </span>
        </div>
      </div>
    </header>
  );
}
