"use client";

import type { ReactNode } from "react";
import type {
  SoulLoveGuidanceItem,
  SoulLoveGuidanceSection,
  SoulPartnerOverview,
} from "@/lib/api";

type Props = {
  overview: SoulPartnerOverview;
  /** Partner chart first name only (never full name / birth details). */
  partnerFirstName?: string | null;
  yourType?: string | null;
  theirType?: string | null;
  /** One-line reason + Chart link (optional — usually shown with pickers). */
  reasonLine?: ReactNode;
  /**
   * Kept for call-site compatibility. The chapter is now one open surface
   * with no inner subchapters, so this flag is unused.
   */
  chapterActive?: boolean;
};

function hasText(value?: string | null): boolean {
  return Boolean(value && value.trim());
}

function TryLine({ text, testId }: { text?: string | null; testId?: string }) {
  if (!hasText(text)) return null;
  return (
    <p className="mt-2 type-body text-fg max-w-prose" data-testid={testId}>
      <span className="font-semibold text-fg">Try</span> {text}
    </p>
  );
}

function foldTitleIntoBody(section: SoulLoveGuidanceSection): string {
  const title = section.title?.trim() ?? "";
  const body = section.body?.trim() ?? "";
  if (!title) return body;
  if (!body) return title.endsWith(".") ? title : `${title}.`;
  if (body.startsWith(title) || body.includes(title)) return body;
  const lead = title.endsWith(".") ? title : `${title}.`;
  return `${lead} ${body}`;
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
            className="rounded-xl border border-border bg-elevated px-3.5 py-3"
            data-testid={`${itemTestIdPrefix}-${item.id}`}
          >
            <p className="text-sm font-semibold text-fg">{item.title}</p>
            <p className="mt-1.5 type-body text-fg max-w-prose">{item.body}</p>
            <TryLine text={item.try} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Partner-only Love guidance. Mount only when friend.role === "partner"
 * and partner_overview is present. One open chapter: hook, decide, talk,
 * how you / they love, where you click / scrape, when it's hard.
 */
export default function PartnerOverviewCard({
  overview,
  partnerFirstName,
  yourType,
  theirType,
  reasonLine,
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
  const clashWhy = overview.when_you_clash?.body;
  const clashTry = overview.when_you_clash?.try;
  const hardWhy = hasText(clashWhy)
    ? clashWhy
    : hasText(overview.what_this_asks)
      ? overview.what_this_asks
      : overview.tender_spots;
  const hardTry = hasText(clashTry) ? clashTry : overview.try_this;
  const hasWhenItsHard = hasText(hardWhy) || hasText(hardTry);

  return (
    <div
      className="rounded-2xl bg-transparent p-5 sm:p-6"
      data-testid="soul-partner-overview"
      data-love-guidance="true"
    >
      <h2 className="text-2xl font-semibold text-fg" data-testid="soul-partner-pair-title">
        {title}
      </h2>
      {typeLine ? (
        <p className="mt-2 inline-block rounded-md bg-elevated px-2 py-0.5 text-sm font-medium text-fg">
          {typeLine}
        </p>
      ) : null}
      {reasonLine ? <div className="mt-2">{reasonLine}</div> : null}
      <p
        className="mt-4 type-section text-fg"
        data-testid="soul-partner-hook"
      >
        {overview.hook}
      </p>
      {hasCurrent ? (
        <p
          className="mt-2 type-body text-fg max-w-prose"
          data-testid="soul-partner-the-current"
        >
          {overview.the_current}
        </p>
      ) : null}

      <div className="mt-5 space-y-4">
        {hasDecide && overview.how_you_decide ? (
          <section
            className="rounded-xl border border-border bg-elevated px-4 py-3.5"
            data-testid="soul-love-decide"
          >
            <h3 className="text-sm font-semibold text-fg">How you decide</h3>
            <p className="mt-1.5 type-body text-fg max-w-prose">
              {foldTitleIntoBody(overview.how_you_decide)}
            </p>
            <TryLine text={overview.how_you_decide.try} />
          </section>
        ) : null}

        {hasCommunicate && overview.how_you_communicate ? (
          <section
            className="rounded-xl border border-border bg-elevated px-4 py-3.5"
            data-testid="soul-love-communicate"
          >
            <h3 className="text-sm font-semibold text-fg">How you talk</h3>
            <p className="mt-1.5 type-body text-fg max-w-prose">
              {overview.how_you_communicate.body}
            </p>
            {hasText(overview.how_you_communicate.voice) ? (
              <p
                className="mt-1.5 type-body text-fg max-w-prose"
                data-testid="soul-love-communicate-voice"
              >
                {overview.how_you_communicate.voice}
              </p>
            ) : null}
            <TryLine text={overview.how_you_communicate.try} />
          </section>
        ) : null}

        {hasHowYouLove ? (
          <section className="grid gap-4 sm:grid-cols-2">
            {hasText(overview.how_you_love) ? (
              <div className="rounded-xl border border-border bg-elevated px-4 py-3.5">
                <h3 className="text-sm font-semibold text-fg">How you love</h3>
                <p
                  className="mt-1.5 type-body text-fg max-w-prose"
                  data-testid="soul-partner-how-you-love"
                >
                  {overview.how_you_love}
                </p>
              </div>
            ) : null}
            {hasText(overview.how_they_love) ? (
              <div className="rounded-xl border border-border bg-elevated px-4 py-3.5">
                <h3 className="text-sm font-semibold text-fg">{theyHeading}</h3>
                <p
                  className="mt-1.5 type-body text-fg max-w-prose"
                  data-testid="soul-partner-how-they-love"
                >
                  {overview.how_they_love}
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        {hasHarmonyFriction ? (
          <div className="space-y-5" data-testid="soul-love-click-scrape">
            <GuidanceBlock
              testId="soul-love-harmonies"
              itemTestIdPrefix="soul-love-harmony"
              heading="Where you click"
              items={harmonies}
            />
            <GuidanceBlock
              testId="soul-love-frictions"
              itemTestIdPrefix="soul-love-friction"
              heading="Where it scrapes"
              items={frictions}
            />
          </div>
        ) : null}

        {hasWhenItsHard ? (
          <section
            className="rounded-xl border border-border bg-elevated px-4 py-3.5"
            data-testid="soul-love-hard"
          >
            <h3 className="text-sm font-semibold text-fg">When it&apos;s hard</h3>
            {hasText(hardWhy) ? (
              <p
                className="mt-1.5 type-body text-fg max-w-prose"
                data-testid="soul-love-clash"
              >
                {hardWhy}
              </p>
            ) : null}
            <TryLine
              text={hardTry}
              testId={hasText(clashTry) ? undefined : "soul-partner-try-this"}
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}
