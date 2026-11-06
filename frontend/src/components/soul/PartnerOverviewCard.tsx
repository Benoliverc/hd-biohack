"use client";

import type { SoulPartnerOverview } from "@/lib/api";

type Props = {
  overview: SoulPartnerOverview;
  /** Partner chart first name only (never full name / birth details). */
  partnerFirstName?: string | null;
  yourType?: string | null;
  theirType?: string | null;
};

/**
 * Partner-only Love guidance hero. Render above Aura Signature when
 * friend.role === "partner" and partner_overview is present.
 */
export default function PartnerOverviewCard({
  overview,
  partnerFirstName,
  yourType,
  theirType,
}: Props) {
  const title = partnerFirstName?.trim()
    ? `You & ${partnerFirstName.trim()}`
    : "You two";
  const theyHeading = partnerFirstName?.trim()
    ? `How ${partnerFirstName.trim()} loves`
    : "How they love";
  const typeLine =
    yourType && theirType ? `${yourType} and ${theirType}` : null;

  return (
    <div
      className="rounded-2xl border border-energy/40 bg-energy-soft/60 p-6"
      data-testid="soul-partner-overview"
      data-love-guidance="true"
    >
      <span className="sr-only" data-testid="soul-love-guidance">
        Love guidance
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-energy/40 bg-energy/15 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-energy-ink">
          Love guidance
        </span>
      </div>
      <h2 className="mt-2 text-2xl font-semibold text-fg">{title}</h2>
      {typeLine ? (
        <p className="mt-1 text-sm text-fg-muted">{typeLine}</p>
      ) : null}
      <p
        className="mt-4 text-base text-fg sm:text-lg"
        data-testid="soul-partner-hook"
      >
        {overview.hook}
      </p>

      <div className="mt-6 space-y-5">
        <section className="border-t border-energy/20 pt-5">
          <h3 className="text-sm font-semibold text-fg">The current between you</h3>
          <p
            className="mt-1.5 text-sm text-fg-secondary"
            data-testid="soul-partner-the-current"
          >
            {overview.the_current}
          </p>
        </section>

        <section className="grid gap-5 border-t border-energy/20 pt-5 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-fg">How you love</h3>
            <p
              className="mt-1.5 text-sm text-fg-secondary"
              data-testid="soul-partner-how-you-love"
            >
              {overview.how_you_love}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-fg">{theyHeading}</h3>
            <p
              className="mt-1.5 text-sm text-fg-secondary"
              data-testid="soul-partner-how-they-love"
            >
              {overview.how_they_love}
            </p>
          </div>
        </section>

        <section className="border-t border-energy/20 pt-5">
          <h3 className="text-sm font-semibold text-fg">What this bond asks</h3>
          <p
            className="mt-1.5 text-sm text-fg-secondary"
            data-testid="soul-partner-what-this-asks"
          >
            {overview.what_this_asks}
          </p>
        </section>

        <section className="border-t border-energy/20 pt-5">
          <h3 className="text-sm font-semibold text-fg">The tender spots</h3>
          <p
            className="mt-1.5 text-sm text-fg-secondary"
            data-testid="soul-partner-tender-spots"
          >
            {overview.tender_spots}
          </p>
        </section>

        <section
          className="rounded-xl border border-energy/30 bg-energy/10 px-4 py-3.5"
          data-testid="soul-partner-try-this"
        >
          <h3 className="text-sm font-semibold text-energy-ink">Try this together</h3>
          <p className="mt-1.5 text-sm text-fg-secondary">{overview.try_this}</p>
        </section>
      </div>

      <p className="mt-5 text-xs text-fg-muted">
        This is how your designs meet in love — not a score, and not a verdict on the
        relationship.
      </p>
    </div>
  );
}
