/** Format IANA timezone + UTC offset for a given local birth moment. */
export function formatTimezoneLabel(
  timeZone: string | null | undefined,
  birthDate?: string | null,
  birthTime?: string | null
): string | null {
  if (!timeZone) return null;
  const at = birthInstant(birthDate, birthTime) ?? new Date();
  const offset = utcOffsetLabel(timeZone, at);
  return offset ? `${timeZone} (${offset})` : timeZone;
}

function birthInstant(birthDate?: string | null, birthTime?: string | null): Date | null {
  if (!birthDate) return null;
  const t = (birthTime || "00:00").slice(0, 8);
  const hhmmss = t.length === 5 ? `${t}:00` : t;
  // Interpret as UTC wall-clock just for offset lookup; Intl uses the zone.
  const d = new Date(`${birthDate}T${hhmmss}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function utcOffsetLabel(timeZone: string, at: Date): string | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "shortOffset",
    }).formatToParts(at);
    const raw = parts.find((p) => p.type === "timeZoneName")?.value;
    if (!raw) return null;
    // GMT-4 / GMT+8 / GMT → UTC−4 / UTC+8 / UTC+0
    if (raw === "GMT" || raw === "UTC") return "UTC+0";
    return raw.replace(/^GMT/, "UTC").replace("-", "−");
  } catch {
    return null;
  }
}

/** Normalize API HH:MM:SS → HTML time input HH:MM */
export function toTimeInputValue(t: string | null | undefined): string {
  if (!t) return "";
  const m = t.trim().match(/^(\d{1,2}):(\d{2})/);
  if (!m) return t.slice(0, 5);
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}

/** Format an ISO instant in a natal IANA zone (or UTC fallback). */
export function formatAsOfInZone(
  isoUtc: string | null | undefined,
  timeZone?: string | null
): string | null {
  if (!isoUtc) return null;
  const at = new Date(isoUtc);
  if (Number.isNaN(at.getTime())) return null;
  const zone = timeZone?.trim() || "UTC";
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(at);
    const get = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === type)?.value ?? "";
    const wall = `${get("day")} ${get("month")} ${get("year")}, ${get("hour")}:${get("minute")}`;
    const offset = utcOffsetLabel(zone, at);
    const zoneLabel = zone === "UTC" ? "UTC" : zone;
    return offset
      ? `As of ${wall} · ${zoneLabel} (${offset})`
      : `As of ${wall} · ${zoneLabel}`;
  } catch {
    return `As of ${at.toISOString()} · UTC`;
  }
}

/** Novelty day bucket hour in Asia/Hong_Kong (matches backend BUCKET_HOUR). */
export const NOVELTY_BUCKET_HOUR_HKT = 7;

/** Asia/Hong_Kong is fixed UTC+8 (no DST). */
const HKT_OFFSET_MS = 8 * 60 * 60 * 1000;

/**
 * Next Daily Novelty reset instant: next 07:00 Asia/Hong_Kong.
 * If `now` is at or after today's 07:00 HKT, returns tomorrow's 07:00 HKT.
 */
export function nextNoveltyResetHkt(now: Date = new Date()): Date {
  const hktWall = new Date(now.getTime() + HKT_OFFSET_MS);
  const y = hktWall.getUTCFullYear();
  const m = hktWall.getUTCMonth();
  const d = hktWall.getUTCDate();

  let resetUtcMs =
    Date.UTC(y, m, d, NOVELTY_BUCKET_HOUR_HKT, 0, 0) - HKT_OFFSET_MS;

  if (now.getTime() >= resetUtcMs) {
    const nextDay = new Date(Date.UTC(y, m, d + 1));
    resetUtcMs =
      Date.UTC(
        nextDay.getUTCFullYear(),
        nextDay.getUTCMonth(),
        nextDay.getUTCDate(),
        NOVELTY_BUCKET_HOUR_HKT,
        0,
        0
      ) - HKT_OFFSET_MS;
  }
  return new Date(resetUtcMs);
}

/**
 * Warm relative countdown to the next Daily Novelty reset (07:00 HKT).
 * Approximate on purpose — no natal/Brussels absolute stamp.
 */
export function formatResetsInHkt(now: Date = new Date()): string {
  const ms = nextNoveltyResetHkt(now).getTime() - now.getTime();
  if (ms < 60_000) return "Resets soon";

  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) {
    return minutes === 1
      ? "Resets in ~1 minute"
      : `Resets in ~${minutes} minutes`;
  }
  if (minutes < 120) return "Resets in about an hour";

  const hours = Math.round(ms / 3_600_000);
  return hours === 1 ? "Resets in ~1 hour" : `Resets in ~${hours} hours`;
}
