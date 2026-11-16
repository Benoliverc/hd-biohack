"use client";

import type { SoulPartnerNuance } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { useSoulCopy } from "@/lib/soulCopy";

type Props = {
  nuance: SoulPartnerNuance;
  testId?: string;
};

/** Calm Love guidance aside under a completed channel / gate mechanic. */
export default function PartnerNuanceBlock({
  nuance,
  testId = "soul-partner-nuance",
}: Props) {
  const { t } = useI18n();
  const sc = useSoulCopy();
  const gift =
    sc(nuance.gift_in_love_part || nuance.romantic_synergy_part, nuance.gift_in_love?.trim() || nuance.romantic_synergy || "");
  const tender =
    sc(nuance.tender_spot_part || nuance.romantic_friction_part, nuance.tender_spot?.trim() || nuance.romantic_friction || "");

  return (
    <div
      className="soul-love-guidance-aside mt-2 space-y-2 rounded-lg border border-energy/25 px-2.5 py-2"
      data-testid={testId}
    >
      <div>
        <p className="type-caption font-semibold text-energy-ink">{t("soul.nuance.giftInLove")}</p>
        <p className="mt-0.5 text-xs text-fg-secondary" data-testid={`${testId}-gift`}>
          {gift}
        </p>
      </div>
      <div>
        <p className="type-caption font-semibold text-fg-secondary">{t("soul.nuance.tenderSpot")}</p>
        <p className="mt-0.5 text-xs text-fg-secondary" data-testid={`${testId}-tender`}>
          {tender}
        </p>
      </div>
    </div>
  );
}
