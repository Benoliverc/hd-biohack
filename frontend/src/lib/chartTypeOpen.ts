/**
 * Per-user, per-chart memory of whether the Chart Type box is open.
 * This browser only, same shape as kit setup dismiss. Brief 17353706….
 */
const PREFIX = "hd-biohack:chart-type-open:";

export function chartTypeOpenKey(userId: number, chartId: number): string {
  return `${PREFIX}${userId}:${chartId}`;
}

/** null = never set. */
export function readChartTypeOpen(userId: number, chartId: number): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(chartTypeOpenKey(userId, chartId));
    if (raw === "1") return true;
    if (raw === "0") return false;
    return null;
  } catch {
    return null;
  }
}

export function writeChartTypeOpen(userId: number, chartId: number, open: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(chartTypeOpenKey(userId, chartId), open ? "1" : "0");
  } catch {
    /* private mode / quota */
  }
}

/** First generation only: write open when this chart has no stored choice yet. */
export function writeChartTypeOpenIfNull(userId: number, chartId: number): void {
  if (readChartTypeOpen(userId, chartId) !== null) return;
  writeChartTypeOpen(userId, chartId, true);
}
