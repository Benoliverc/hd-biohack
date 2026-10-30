"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { DEFAULT_PROTOCOLS_TZ } from "@/lib/protocolCompletions";

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
  const [tzSelect, setTzSelect] = useState<string>("");
  const [tzCustom, setTzCustom] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const effectiveValue = useMemo(() => {
    if (useCustom) return tzCustom.trim();
    return tzSelect.trim();
  }, [useCustom, tzCustom, tzSelect]);

  const save = useCallback(async () => {
    if (!user) return;
    setSaving(true);
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
          ? `Saved · Protocols days use ${nextTz}`
          : `Saved · Protocols days fall back to ${DEFAULT_PROTOCOLS_TZ}`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }, [user, effectiveValue, setSessionUser]);

  if (!sessionReady) {
    return <p className="text-sm text-fg-muted">Loading…</p>;
  }

  if (!user) {
    return (
      <p className="text-sm text-fg-muted">
        <Link href="/login" className="underline">
          Sign in
        </Link>{" "}
        to manage settings.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6" data-testid="settings-page">
      <div>
        <h1 className="text-2xl font-semibold text-fg">Settings</h1>
        <p className="mt-1 text-sm text-fg-secondary">
          Account preferences — available on Free and Pro.
        </p>
      </div>

      <section
        className="space-y-3 rounded-2xl border border-border bg-elevated p-5"
        data-testid="settings-timezone"
      >
        <div>
          <h2 className="text-base font-semibold text-fg">Timezone</h2>
          <p className="mt-1 text-xs text-fg-muted">
            Used for Protocols week &amp; checklist days. Daily Novelty still resets at 07:00
            Asia/Hong_Kong.
          </p>
        </div>

        <label className="block text-sm text-fg-secondary" htmlFor="tz-select">
          Common zones
        </label>
        <select
          id="tz-select"
          disabled={useCustom || saving}
          className="min-h-11 w-full rounded-xl border border-border bg-sunken px-3 py-2.5 text-sm text-fg disabled:opacity-60"
          value={tzSelect}
          data-testid="settings-tz-select"
          onChange={(e) => {
            setTzSelect(e.target.value);
            setUseCustom(false);
          }}
        >
          <option value="">Default ({DEFAULT_PROTOCOLS_TZ})</option>
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
          Use a custom IANA timezone
        </label>

        {useCustom && (
          <div>
            <label className="block text-sm text-fg-secondary" htmlFor="tz-custom">
              IANA name
            </label>
            <input
              id="tz-custom"
              type="text"
              maxLength={128}
              placeholder="e.g. Pacific/Honolulu"
              value={tzCustom}
              disabled={saving}
              data-testid="settings-tz-custom"
              className="mt-1 min-h-11 w-full rounded-xl border border-border bg-sunken px-3 py-2.5 text-sm text-fg placeholder:text-fg-muted"
              onChange={(e) => setTzCustom(e.target.value)}
            />
          </div>
        )}

        <p className="text-xs text-fg-muted" data-testid="settings-tz-current">
          Current:{" "}
          <span className="font-medium text-fg">
            {user.preferred_timezone?.trim() || `Default (${DEFAULT_PROTOCOLS_TZ})`}
          </span>
        </p>

        <button
          type="button"
          disabled={saving}
          data-testid="settings-tz-save"
          onClick={() => void save()}
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-growth px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50 sm:w-auto"
        >
          {saving ? "Saving…" : "Save timezone"}
        </button>

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
      </section>

      <p className="text-xs text-fg-muted">
        Password and account deletion are not available here yet.
      </p>
    </div>
  );
}
