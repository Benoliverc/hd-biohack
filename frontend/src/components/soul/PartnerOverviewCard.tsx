"use client";

import type { SoulPartnerOverview } from "@/lib/api";

type Props = {
  overview: SoulPartnerOverview;
};

/**
 * Partner-only overview block. Render above Aura Signature when
 * friend.role === "partner" and partner_overview is present.
 */
export default function PartnerOverviewCard({ overview }: Props) {
  return (
    <div
      className="rounded-2xl border border-border bg-elevated p-5"
      data-testid="soul-partner-overview"
    >
      <p className="text-xs uppercase tracking-wide text-fg-muted">Partner field</p>
      <h2 className="mt-1 text-lg font-semibold text-fg">How these types meet</h2>
      <p className="mt-1 text-xs text-fg-muted">
        Energy mechanics for awareness — not relationship advice or a compatibility score.
      </p>
      <ul className="mt-4 space-y-3">
        <li className="rounded-xl border border-border/70 bg-sunken/40 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
            Core dynamic
          </p>
          <p className="mt-1 text-sm text-fg-secondary" data-testid="soul-partner-core-dynamic">
            {overview.core_dynamic}
          </p>
        </li>
        <li className="rounded-xl border border-border/70 bg-growth/5 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-growth">
            Where this helps you
          </p>
          <p className="mt-1 text-sm text-fg-secondary" data-testid="soul-partner-mutual-growth">
            {overview.mutual_growth}
          </p>
        </li>
        <li className="rounded-xl border border-border/70 bg-sunken/40 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
            Where this can chafe
          </p>
          <p
            className="mt-1 text-sm text-fg-secondary"
            data-testid="soul-partner-relationship-challenges"
          >
            {overview.relationship_challenges}
          </p>
        </li>
      </ul>
    </div>
  );
}
