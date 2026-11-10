"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import type {
  SoulLoveGuidanceItem,
  SoulPartnerOverview,
} from "@/lib/api";

type LoveSubId = "current" | "harmony" | "decide" | "hard";

type Props = {
  overview: SoulPartnerOverview;
  /** Partner chart first name only (never full name / birth details). */
  partnerFirstName?: string | null;
  yourType?: string | null;
  theirType?: string | null;
  /** One-line reason + Chart link (optional — usually shown with pickers). */
  reasonLine?: ReactNode;
  /**
   * When true (Love chapter open on the map), prefer the first available
   * sub-chapter open so the hook/current is immediately readable.
   */
  chapterActive?: boolean;
};

function hasText(value?: string | null): boolean {
  return Boolean(value && value.trim());
}

function GuidanceBlock({
  testId,
  itemTestIdPrefix,
  heading,
  items,
}: {
  testId: string;
  itemTestIdPrefix: string;
  heading: string;
  items: SoulLoveGuidanceItem[];
}) {
  if (!items.length) return null;
  return (
    <section className="pt-0" data-testid={testId}>
      <h3 className="text-sm font-semibold text-fg">{heading}</h3>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-border bg-energy/5 px-3.5 py-3"
            data-testid={`${itemTestIdPrefix}-${item.id}`}
          >
            <p className="text-sm font-semibold text-fg">{item.title}</p>
            <p className="mt-1.5 type-body text-fg-secondary max-w-prose">{item.body}</p>
            <p className="mt-2 type-caption text-fg-secondary">{item.try}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CareInset({
  testId,
  heading,
  body,
  tryLine,
}: {
  testId: string;
  heading: string;
  body: string;
  tryLine?: string | null;
}) {
  return (
    <section
      className="rounded-xl border border-energy/25 bg-energy-soft/40 px-4 py-3.5"
      data-testid={testId}
    >
      <h3 className="text-sm font-semibold text-energy-ink">{heading}</h3>
      <p className="mt-1.5 type-body text-fg-secondary max-w-prose">{body}</p>
      {hasText(tryLine) ? (
        <p className="mt-2 type-caption text-fg-secondary">{tryLine}</p>
      ) : null}
    </section>
  );
}

function AccordionPanel({
  testId,
  summary,
  open,
  onOpenChange,
  children,
}: {
  testId: string;
  summary: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <details
      className="group rounded-xl border border-border bg-elevated/80 open:bg-elevated"
      data-testid={testId}
      open={open}
      onToggle={(e) => {
        const next = (e.currentTarget as HTMLDetailsElement).open;
        if (next !== open) onOpenChange(next);
      }}
    >
      <summary className="cursor-pointer list-none px-3.5 py-3 text-sm font-semibold text-fg outline-none marker:content-none [&::-webkit-details-marker]:hidden focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2">
        <span className="flex items-center justify-between gap-2">
          {summary}
          <span
            aria-hidden
            className="text-fg-muted transition group-open:rotate-180"
          >
            ▾
          </span>
        </span>
      </summary>
      <div className="border-t border-border/80 px-3.5 pb-3.5 pt-3">{children}</div>
    </details>
  );
}

function LoveSubChapter({
  testId,
  title,
  open,
  onToggle,
  children,
}: {
  testId: string;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div
      data-testid={testId}
      className="overflow-hidden rounded-xl border border-border/80 bg-elevated/60"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex min-h-11 w-full cursor-pointer items-center gap-3 px-3.5 py-2.5 text-left outline-none transition-colors hover:bg-elevated focus-visible:ring-2 focus-visible:ring-focus"
      >
        <span className="min-w-0 flex-1 text-sm font-semibold text-fg">
          {title}
        </span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 shrink-0 text-fg-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? (
        <div className="space-y-4 border-t border-border/70 px-3.5 py-3.5">
          {children}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Partner-only Love guidance. Mount only when friend.role === "partner"
 * and partner_overview is present. Magazine IA chunked into one-open
 * sub-chapters for the Soul Chapter Map.
 */
export default function PartnerOverviewCard({
  overview,
  partnerFirstName,
  yourType,
  theirType,
  reasonLine,
  chapterActive = true,
}: Props) {
  const title = partnerFirstName?.trim()
    ? `You & ${partnerFirstName.trim()}`
    : "You two";
  const theyHeading = partnerFirstName?.trim()
    ? `How ${partnerFirstName.trim()} loves`
    : "How they love";
  const typeLine =
    yourType && theirType ? `${yourType} and ${theirType}` : null;
  const harmonies = overview.harmonies ?? [];
  const frictions = overview.frictions ?? [];

  const hasCurrent = hasText(overview.the_current);
  const hasHowYouLove =
    hasText(overview.how_you_love) || hasText(overview.how_they_love);
  const hasHarmonyFriction = harmonies.length > 0 || frictions.length > 0;
  const hasDecide = Boolean(overview.how_you_decide);
  const hasCommunicate = Boolean(overview.how_you_communicate);
  const hasDecideTalk = hasDecide || hasCommunicate;
  const hasAsks = hasText(overview.what_this_asks);
  const hasTender = hasText(overview.tender_spots);
  const hasClash = Boolean(overview.when_you_clash);
  const hasTry = hasText(overview.try_this);
  const hasWhenItsHard = hasAsks || hasTender || hasClash || hasTry;

  const availableSubs = useMemo(() => {
    const ids: LoveSubId[] = [];
    if (hasCurrent || hasHowYouLove) ids.push("current");
    if (hasHarmonyFriction) ids.push("harmony");
    if (hasDecideTalk) ids.push("decide");
    if (hasWhenItsHard) ids.push("hard");
    return ids;
  }, [
    hasCurrent,
    hasHowYouLove,
    hasHarmonyFriction,
    hasDecideTalk,
    hasWhenItsHard,
  ]);

  const [openSub, setOpenSub] = useState<LoveSubId | null>(
    () => availableSubs[0] ?? null,
  );
  const [decideOpen, setDecideOpen] = useState(hasDecide);
  const [communicateOpen, setCommunicateOpen] = useState(
    !hasDecide && hasCommunicate,
  );

  useEffect(() => {
    if (!chapterActive) return;
    setOpenSub(availableSubs[0] ?? null);
  }, [chapterActive, availableSubs]);

  const toggleSub = (id: LoveSubId) => {
    setOpenSub((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="soul-love-guidance-wash rounded-2xl border border-energy/40 p-5 sm:p-6"
      data-testid="soul-partner-overview"
      data-love-guidance="true"
    >
      <span className="sr-only" data-testid="soul-love-guidance">
        Partner mode · Love guidance
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <span className="type-chip inline-flex items-center rounded-full border border-energy/40 bg-energy/10 px-2.5 py-0.5 tracking-wide text-energy-ink">
          Partner mode · Love guidance
        </span>
      </div>
      <h2
        className="mt-2 text-lg font-semibold text-energy-ink sm:text-xl"
        data-testid="soul-love-guidance-heading"
      >
        Partner mode · Love guidance
      </h2>
      <p className="mt-3 text-2xl font-semibold text-fg">{title}</p>
      {typeLine ? (
        <p className="mt-1 type-meta">{typeLine}</p>
      ) : null}
      {reasonLine ? <div className="mt-2">{reasonLine}</div> : null}
      <p
        className="mt-4 text-xl font-semibold leading-snug text-fg sm:text-2xl"
        data-testid="soul-partner-hook"
      >
        {overview.hook}
      </p>
      <p className="mt-2 type-caption text-fg-secondary">
        How your designs meet in love — not a score, not a verdict.
      </p>

      <div className="mt-5 space-y-3">
        {hasCurrent || hasHowYouLove ? (
          <LoveSubChapter
            testId="soul-love-sub-current"
            title="The current"
            open={openSub === "current"}
            onToggle={() => toggleSub("current")}
          >
            {hasCurrent ? (
              <section className="rounded-xl border border-border bg-elevated/70 px-4 py-3.5">
                <h3 className="text-sm font-semibold text-fg">
                  The current between you
                </h3>
                <p
                  className="mt-1.5 type-body text-fg-secondary max-w-prose"
                  data-testid="soul-partner-the-current"
                >
                  {overview.the_current}
                </p>
              </section>
            ) : null}

            {hasHowYouLove ? (
              <section className="grid gap-4 sm:grid-cols-2">
                {hasText(overview.how_you_love) ? (
                  <div className="rounded-xl border border-border bg-elevated/70 px-4 py-3.5">
                    <h3 className="text-sm font-semibold text-fg">
                      How you love
                    </h3>
                    <p
                      className="mt-1.5 type-body text-fg-secondary max-w-prose"
                      data-testid="soul-partner-how-you-love"
                    >
                      {overview.how_you_love}
                    </p>
                  </div>
                ) : null}
                {hasText(overview.how_they_love) ? (
                  <div className="rounded-xl border border-border bg-elevated/70 px-4 py-3.5">
                    <h3 className="text-sm font-semibold text-fg">
                      {theyHeading}
                    </h3>
                    <p
                      className="mt-1.5 type-body text-fg-secondary max-w-prose"
                      data-testid="soul-partner-how-they-love"
                    >
                      {overview.how_they_love}
                    </p>
                  </div>
                ) : null}
              </section>
            ) : null}
          </LoveSubChapter>
        ) : null}

        {hasHarmonyFriction ? (
          <LoveSubChapter
            testId="soul-love-sub-harmony"
            title="Where you harmonize · friction"
            open={openSub === "harmony"}
            onToggle={() => toggleSub("harmony")}
          >
            <div className="space-y-5">
              <GuidanceBlock
                testId="soul-love-harmonies"
                itemTestIdPrefix="soul-love-harmony"
                heading="Where you harmonize"
                items={harmonies}
              />
              <GuidanceBlock
                testId="soul-love-frictions"
                itemTestIdPrefix="soul-love-friction"
                heading="Where friction shows up"
                items={frictions}
              />
            </div>
          </LoveSubChapter>
        ) : null}

        {hasDecideTalk ? (
          <LoveSubChapter
            testId="soul-love-sub-decide"
            title="Decide & talk"
            open={openSub === "decide"}
            onToggle={() => toggleSub("decide")}
          >
            <section className="space-y-2" aria-label="Decide and talk">
              {hasDecide && overview.how_you_decide ? (
                <AccordionPanel
                  testId="soul-love-decide"
                  summary="How you decide together"
                  open={decideOpen}
                  onOpenChange={setDecideOpen}
                >
                  <p className="type-body font-medium text-fg">
                    {overview.how_you_decide.title}
                  </p>
                  <p className="mt-1.5 type-body text-fg-secondary max-w-prose">
                    {overview.how_you_decide.body}
                  </p>
                  <p className="mt-2 type-caption text-fg-secondary">
                    {overview.how_you_decide.try}
                  </p>
                </AccordionPanel>
              ) : null}
              {hasCommunicate && overview.how_you_communicate ? (
                <AccordionPanel
                  testId="soul-love-communicate"
                  summary="How you talk"
                  open={communicateOpen}
                  onOpenChange={setCommunicateOpen}
                >
                  <p className="type-body font-medium text-fg">
                    {overview.how_you_communicate.title}
                  </p>
                  <p className="mt-1.5 type-body text-fg-secondary max-w-prose">
                    {overview.how_you_communicate.body}
                  </p>
                  <p className="mt-2 type-caption text-fg-secondary">
                    {overview.how_you_communicate.try}
                  </p>
                </AccordionPanel>
              ) : null}
            </section>
          </LoveSubChapter>
        ) : null}

        {hasWhenItsHard ? (
          <LoveSubChapter
            testId="soul-love-sub-hard"
            title="When it's hard"
            open={openSub === "hard"}
            onToggle={() => toggleSub("hard")}
          >
            <section className="space-y-4">
              {hasAsks ? (
                <div>
                  <h4 className="text-sm font-medium text-fg">
                    What this bond asks
                  </h4>
                  <p
                    className="mt-1.5 type-body text-fg-secondary max-w-prose"
                    data-testid="soul-partner-what-this-asks"
                  >
                    {overview.what_this_asks}
                  </p>
                </div>
              ) : null}
              {hasTender ? (
                <div
                  className={
                    hasAsks ? "border-t border-border/70 pt-4" : undefined
                  }
                >
                  <h4 className="text-sm font-medium text-fg">
                    The tender spots
                  </h4>
                  <p
                    className="mt-1.5 type-body text-fg-secondary max-w-prose"
                    data-testid="soul-partner-tender-spots"
                  >
                    {overview.tender_spots}
                  </p>
                </div>
              ) : null}
              {hasClash && overview.when_you_clash ? (
                <CareInset
                  testId="soul-love-clash"
                  heading="When things get hard"
                  body={overview.when_you_clash.body}
                  tryLine={overview.when_you_clash.try}
                />
              ) : null}
              {hasTry ? (
                <CareInset
                  testId="soul-partner-try-this"
                  heading="Try this together"
                  body={overview.try_this}
                />
              ) : null}
            </section>
          </LoveSubChapter>
        ) : null}
      </div>
    </div>
  );
}
