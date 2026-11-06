"use client";

import type { SoulPartnerNuance } from "@/lib/api";

type Props = {
  nuance: SoulPartnerNuance;
  testId?: string;
};

/** Calm sub-section under a completed channel / gate mechanic. */
export default function PartnerNuanceBlock({
  nuance,
  testId = "soul-partner-nuance",
}: Props) {
  return (
    <div
      className="mt-2 space-y-1.5 rounded-lg border border-border/60 bg-growth/5 px-2.5 py-2"
      data-testid={testId}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-growth">
          Where this helps you
        </p>
        <p className="mt-0.5 text-xs text-fg-secondary">{nuance.romantic_synergy}</p>
      </div>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
          Where this can chafe
        </p>
        <p className="mt-0.5 text-xs text-fg-secondary">{nuance.romantic_friction}</p>
      </div>
    </div>
  );
}
