/**
 * Humanize Vs yesterday from/to keys for user-facing pills.
 * API comparison keys may keep underscores and pipes; display must not.
 */

/** Centers: Solar_Plexus,Spleen → Solar Plexus, Spleen */
export function formatVsCentersKey(raw: string): string {
  const s = String(raw || "").trim();
  if (!s || s === "none") return s || "none";
  return s
    .split(",")
    .map((part) => part.trim().replace(/_/g, " "))
    .filter(Boolean)
    .join(", ");
}

/** Bridges: 10-20|28-38 → 10–20, 28–38 */
export function formatVsBridgeKey(raw: string): string {
  const s = String(raw || "").trim();
  if (!s || s === "none") return s || "none";
  return s
    .split("|")
    .map((part) => part.trim().replace(/-/g, "–"))
    .filter(Boolean)
    .join(", ");
}

/** Hanging gates stay numeric lists; normalize separators. */
export function formatVsHangingKey(raw: string): string {
  const s = String(raw || "").trim();
  if (!s || s === "none") return s || "none";
  return s
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .join(", ");
}

export type VsField =
  | "moon"
  | "sun"
  | "hanging_pressure"
  | "bridge"
  | "newly_defined"
  | "energy"
  | "space"
  | string;

/** Format one from/to value for a Vs yesterday field. */
export function formatVsYesterdayValue(field: VsField, raw: string): string {
  if (field === "newly_defined") return formatVsCentersKey(raw);
  if (field === "bridge") return formatVsBridgeKey(raw);
  if (field === "hanging_pressure") return formatVsHangingKey(raw);
  return String(raw ?? "");
}

/** Sky / weather deltas that mean Today is not "same weather" even if Energy/Space are quiet. */
export const VS_SKY_FIELDS = new Set([
  "moon",
  "sun",
  "hanging_pressure",
  "bridge",
  "newly_defined",
]);

export function vsYesterdayHasSkyChange(
  deltas: ReadonlyArray<{ field: string }> | null | undefined
): boolean {
  if (!deltas || deltas.length === 0) return false;
  return deltas.some((d) => VS_SKY_FIELDS.has(d.field));
}

/** Change-line / daily_signal sources that mean Moon/Sun/sky moved. */
export const SKY_CHANGE_SOURCES = new Set([
  "moon_gate",
  "moon_line",
  "sun_gate",
  "sun_line",
  "hanging_pressure",
  "conditioning",
]);

export function changeLineIsSkyChange(source: string | null | undefined): boolean {
  if (!source) return false;
  return SKY_CHANGE_SOURCES.has(source);
}

/** Planetary gates table: North_Node / South_Node and any leftover underscored tokens. */
export function formatPlanetLabel(raw: string): string {
  const s = String(raw || "").trim();
  if (!s) return s;
  if (s === "North_Node") return "North Node";
  if (s === "South_Node") return "South Node";
  return s.replace(/_/g, " ");
}
