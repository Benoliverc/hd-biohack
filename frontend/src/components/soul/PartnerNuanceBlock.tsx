"use client";

import type { SoulPartnerNuance } from "@/lib/api";

type Props = {
  nuance: SoulPartnerNuance;
  testId?: string;
};

/** Calm Love guidance aside under a completed channel / gate mechanic. */
export default function PartnerNuanceBlock({
  nuance,
  testId = "soul-partner-nuance",
}: Props) {
  const gift = nuance.gift_in_love?.trim() || nuance.romantic_synergy;
  const tender = nuance.tender_spot?.trim() || nuance.romantic_friction;

  return (
    <div
      className="mt-2 space-y-2 rounded-lg border border-energy/30 bg-energy-soft/50 px-2.5 py-2"
      data-testid={testId}
    >
      <div>
        <p className="text-[11px] font-semibold text-energy-ink">The gift in love</p>
        <p className="mt-0.5 text-xs text-fg-secondary" data-testid={`${testId}-gift`}>
          {gift}
        </p>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-fg-muted">The tender spot</p>
        <p className="mt-0.5 text-xs text-fg-secondary" data-testid={`${testId}-tender`}>
          {tender}
        </p>
      </div>
    </div>
  );
}
