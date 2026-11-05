import type { BodyGraphChannel } from "@/components/BodyGraph";
import type { ShareGraphProps } from "@/components/share/ShareBaselineCard";

/** Build share-graph props from a natal chart_json payload (no PII). */
export function graphFromChart(
  chart: Record<string, unknown> | null | undefined
): ShareGraphProps {
  const c = chart || {};
  const channels = ((c.channels as BodyGraphChannel[]) || []).map((ch) => ({
    gates: ch.gates,
    name: ch.name,
    centers: ch.centers,
  }));
  const personality = (c.personality as Array<Record<string, unknown>>) || [];
  const design = (c.design as Array<Record<string, unknown>>) || [];
  return {
    definedCenters: (c.defined_centers as string[]) || [],
    channels,
    activatedGates: (c.activated_gates as number[]) || [],
    hangingGates:
      (c.hanging_gates as Array<{
        held?: number;
        missing?: number;
        channel?: string;
      }>) || [],
    personalityGates: personality
      .map((a) => Number(a.gate))
      .filter((g) => Number.isFinite(g) && g > 0),
    designGates: design
      .map((a) => Number(a.gate))
      .filter((g) => Number.isFinite(g) && g > 0),
  };
}

export function typeFromChart(
  chart: Record<string, unknown> | null | undefined
): string {
  return String(chart?.type || "").trim();
}

export function profileFromChart(
  chart: Record<string, unknown> | null | undefined
): string {
  return String(chart?.profile || "").trim();
}

export function strategyFromChart(
  chart: Record<string, unknown> | null | undefined
): string {
  return String(chart?.strategy || "").trim();
}
