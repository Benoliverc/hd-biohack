/** Assemble Today upcoming-sky rows from the structured /transits/upcoming payload. */

export const SIGNIFICANT_CHANGE_KINDS = [
  "sun_theme_turns",
  "bridge_on",
  "bridge_clears",
  "moon_leaves",
] as const;

export type UpcomingChangeKind = (typeof SIGNIFICANT_CHANGE_KINDS)[number];

export type UpcomingBridge = {
  name?: string;
  gates?: number[];
};

export type UpcomingChange = {
  kind: UpcomingChangeKind | string;
  text?: string;
  sun_gate?: number | null;
  sun_line?: number | null;
  from_sun_gate?: number | null;
  from_sun_line?: number | null;
  moon_gate?: number | null;
  moon_line?: number | null;
  from_moon_gate?: number | null;
  from_moon_line?: number | null;
  channel?: string | null;
  gates?: number[];
};

export type UpcomingDay = {
  day: string;
  sun_gate?: number | null;
  sun_line?: number | null;
  moon_gate?: number | null;
  moon_line?: number | null;
  bridges?: UpcomingBridge[];
  changes?: UpcomingChange[];
};

export type UpcomingSkyPayload = {
  today: string;
  horizon_days?: number;
  days: UpcomingDay[];
};

export type UpcomingLead = {
  kind: UpcomingChangeKind;
  weekday: string;
  label: string | null;
};

export type UpcomingRow =
  | { type: "changes"; day: string; leads: UpcomingLead[] }
  | { type: "hold"; throughDay: string; weekday: string };

const KIND_RANK: Record<UpcomingChangeKind, number> = {
  sun_theme_turns: 0,
  bridge_on: 1,
  bridge_clears: 2,
  moon_leaves: 3,
};

function isSignificant(kind: string): kind is UpcomingChangeKind {
  return (SIGNIFICANT_CHANGE_KINDS as readonly string[]).includes(kind);
}

export function officialLabel(change: UpcomingChange): string | null {
  if (change.kind === "sun_theme_turns" && change.sun_gate != null) {
    return change.sun_line != null
      ? `Gate ${change.sun_gate}.${change.sun_line}`
      : `Gate ${change.sun_gate}`;
  }
  if (change.kind === "moon_leaves" && change.from_moon_gate != null) {
    return change.from_moon_gate != null
      ? `Gate ${change.from_moon_gate}`
      : null;
  }
  if (change.kind === "bridge_on" || change.kind === "bridge_clears") {
    const gates = (change.gates || []).join("-");
    const name = (change.channel || "").trim();
    if (name && gates) return `${name} (${gates})`;
    if (name) return name;
    if (gates) return gates;
  }
  return null;
}

export function significantChanges(day: UpcomingDay): UpcomingChange[] {
  const raw = day.changes || [];
  const picked = raw.filter((c) => isSignificant(c.kind));
  return picked.sort(
    (a, b) =>
      KIND_RANK[a.kind as UpcomingChangeKind] -
      KIND_RANK[b.kind as UpcomingChangeKind]
  );
}

/** Weekday of an ISO novelty-bucket calendar date in the given locale. */
export function weekdayOf(isoDay: string, locale: string): string {
  const parts = isoDay.split("-").map((n) => Number(n));
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return isoDay;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  const label = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(dt);
  return label;
}

/**
 * Build renderable rows: change days stay visible, quiet hold days group
 * into one "holds through {weekday}" line. Tomorrow (the first day) is
 * never dropped — it is either a change row or the start of a hold.
 * If the whole horizon is a hold, one row is enough.
 */
export function buildUpcomingRows(
  days: UpcomingDay[],
  weekday: (isoDay: string) => string
): UpcomingRow[] {
  const rows: UpcomingRow[] = [];
  let holdRun: UpcomingDay[] = [];

  const flushHold = () => {
    if (!holdRun.length) return;
    const last = holdRun[holdRun.length - 1];
    rows.push({
      type: "hold",
      throughDay: last.day,
      weekday: weekday(last.day),
    });
    holdRun = [];
  };

  days.forEach((day) => {
    const changes = significantChanges(day);
    if (changes.length) {
      flushHold();
      rows.push({
        type: "changes",
        day: day.day,
        leads: changes.map((c) => ({
          kind: c.kind as UpcomingChangeKind,
          weekday: weekday(day.day),
          label: officialLabel(c),
        })),
      });
      return;
    }
    holdRun.push(day);
  });
  flushHold();
  return rows;
}
