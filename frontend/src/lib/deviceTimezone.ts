import type { User } from "./api";

/** Trailing debounce for foreground / focus re-checks. First session-ready run is immediate. */
export const DEVICE_TZ_SYNC_DEBOUNCE_MS = 500;

/** True when `tz` is a real IANA name the runtime (and the API) can accept. */
export function isValidIanaTimezone(tz: string | null | undefined): tz is string {
  const cleaned = (tz || "").trim();
  if (!cleaned) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: cleaned }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/**
 * System IANA timezone from the browser / runtime.
 * Returns null when detection fails or the value is not a real IANA name.
 * Does not fall back to Asia/Hong_Kong and does not invent an offset or IP guess.
 */
export function detectDeviceTimezone(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return isValidIanaTimezone(tz) ? tz.trim() : null;
  } catch {
    return null;
  }
}

/**
 * PATCH only when the detected IANA name is valid and different from the stored account value.
 * A null / empty stored zone differs from a detected zone and should be written.
 */
export function needsPreferredTimezoneSync(
  detected: string | null,
  stored: string | null | undefined
): detected is string {
  if (!detected || !isValidIanaTimezone(detected)) return false;
  const current = (stored || "").trim();
  return detected !== current;
}

export type DeviceTimezoneSyncResult = {
  status: "patched" | "unchanged" | "skipped" | "failed";
  user: User;
  timezone: string | null;
};

export type PatchUserSettings = (
  userId: number,
  body: { preferred_timezone?: string | null }
) => Promise<User>;

type SyncOptions = {
  detect?: () => string | null;
  patch: PatchUserSettings;
};

/** In-flight PATCH shared by session bootstrap and the foreground hook. */
const inflight = new Map<number, Promise<DeviceTimezoneSyncResult>>();

/**
 * Keep `user.preferred_timezone` in sync with the device zone.
 * No PATCH when detection is missing/invalid or the stored value already matches.
 */
export async function syncDeviceTimezoneForUser(
  user: User,
  opts: SyncOptions
): Promise<DeviceTimezoneSyncResult> {
  const pending = inflight.get(user.id);
  if (pending) return pending;

  const run = (async (): Promise<DeviceTimezoneSyncResult> => {
    const detect = opts.detect ?? detectDeviceTimezone;
    let detected: string | null;
    try {
      detected = detect();
    } catch {
      detected = null;
    }
    if (!isValidIanaTimezone(detected)) {
      return { status: "skipped", user, timezone: null };
    }
    if (!needsPreferredTimezoneSync(detected, user.preferred_timezone)) {
      return { status: "unchanged", user, timezone: detected };
    }
    try {
      const updated = await opts.patch(user.id, {
        preferred_timezone: detected,
      });
      return { status: "patched", user: updated, timezone: detected };
    } catch {
      // Leave the last saved account timezone in place. Caller may retry later.
      return { status: "failed", user, timezone: detected };
    }
  })();

  inflight.set(user.id, run);
  try {
    return await run;
  } finally {
    inflight.delete(user.id);
  }
}

/** Offset + IANA signal used to notice a system timezone change. */
export function readDeviceTimezoneSignal(detect: () => string | null = detectDeviceTimezone): {
  tz: string | null;
  offset: number;
} {
  return {
    tz: detect(),
    offset: new Date().getTimezoneOffset(),
  };
}

export function deviceTimezoneSignalChanged(
  prev: { tz: string | null; offset: number } | null,
  next: { tz: string | null; offset: number }
): boolean {
  if (!prev) return true;
  return prev.tz !== next.tz || prev.offset !== next.offset;
}
