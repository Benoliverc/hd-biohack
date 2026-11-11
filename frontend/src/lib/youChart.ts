import { api, type SavedChartRow } from "./api";

/** You / Me natal — friends never count. Matches Chart and store self-row rules. */
export function isYouChartRow(row: Pick<SavedChartRow, "slot_kind">): boolean {
  return row.slot_kind !== "friend";
}

export function rowsIncludeYouChart(rows: Pick<SavedChartRow, "slot_kind">[]): boolean {
  return rows.some(isYouChartRow);
}

/**
 * Post-sign-in landing from current /charts data (no new endpoint).
 * You natal → /transits (Today). Unknown (network/API failure) → /profile,
 * same safety as the first-run Chart path.
 */
export async function postSignInPath(userId: number): Promise<"/transits" | "/profile"> {
  try {
    const rows = await api.charts(userId);
    return rowsIncludeYouChart(rows) ? "/transits" : "/profile";
  } catch {
    return "/profile";
  }
}
