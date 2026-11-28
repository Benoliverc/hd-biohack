"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { displayCenter } from "@/lib/hdCopy";
import { useSoulCopy } from "@/lib/soulCopy";
import {
  definedTogetherCenterKey,
  shouldSkipTheCurrent,
} from "@/lib/soulCenterCounts";
import type {
  SoulLoveGuidanceItem,
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
  /** Same sentence the Centers chapter renders. Null skips the Together line. */
  togetherCountText: string | null;
  /** Composite defined center keys. Null leaves bank copy unchanged. */
  compositeDefinedCenters?: readonly string[] | null;
};

function hasText(value?: string | null): boolean {
  return Boolean(value && value.trim());
}

function TryLine({ text, testId }: { text?: string | null; testId?: string }) {
  const { t } = useI18n();
  if (!hasText(text)) return null;
  return (
    <p className="mt-2 type-body text-fg max-w-prose" data-testid={testId}>
      <span className="font-semibold text-fg">{t("soul.partner.try")}:</span> {text}
    </p>
  );
}

function foldTitleIntoBody(titleRaw: string, bodyRaw: string): string {
  const title = titleRaw.trim();
  const body = bodyRaw.trim();
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
  definedCenters,
}: {
  testId: string;
  itemTestIdPrefix: string;
  heading: string;
  items: SoulLoveGuidanceItem[];
  definedCenters: readonly string[] | null;
}) {
  const { t } = useI18n();
  const sc = useSoulCopy();
  if (!items.length) return null;
  return (
    <section className="pt-0" data-testid={testId}>
      <h3 className="text-sm font-semibold text-fg">{heading}</h3>
      <ul className="mt-3 space-y-3">
        {items.map((item) => {
          const centerKey = definedTogetherCenterKey(item.id, definedCenters);
          const centerName = centerKey ? displayCenter(centerKey) : "";
          return (
            <li
              key={item.id}
              className="rounded-xl border border-border bg-elevated px-3.5 py-3"
              data-testid={`${itemTestIdPrefix}-${item.id}`}
            >
              <p className="text-sm font-semibold text-fg">
                {centerKey
                  ? t("soul.partner.definedTogether.title", { center: centerName })
                  : sc(item.title_part, item.title)}
              </p>
              <p className="mt-1.5 type-body text-fg max-w-prose">
                {centerKey
                  ? t("soul.partner.definedTogether.body")
                  : sc(item.body_part, item.body)}
              </p>
              {centerKey ? (
                <p className="mt-2 type-body text-fg max-w-prose">
                  {t("soul.partner.definedTogether.try")}
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/**
 * Partner-only Love guidance. Mount only when friend.role === "partner"
 * and partner_overview is present. One open chapter: hook, together count,
 * decide, talk, how you / they love, where you click / scrape, when it's hard.
 */
export default function PartnerOverviewCard({
  overview,
  partnerFirstName,
  yourType,
  theirType,
  reasonLine,
  togetherCountText,
  compositeDefinedCenters = null,
}: Props) {
  const { t } = useI18n();
  const sc = useSoulCopy();
  const hook = sc(overview.hook_part, overview.hook);
  const theCurrent = sc(overview.the_current_part, overview.the_current);
  const howYouLove = sc(overview.how_you_love_part, overview.how_you_love);
  const howTheyLove = sc(overview.how_they_love_part, overview.how_they_love);
  const whatThisAsks = sc(overview.what_this_asks_part, overview.what_this_asks);
  const tenderSpots = sc(overview.tender_spots_part, overview.tender_spots);
  const tryThis = sc(overview.try_this_part, overview.try_this);
  const decide = overview.how_you_decide;
  const communicate = overview.how_you_communicate;
  const decideTitle = decide ? sc(decide.title_part, decide.title) : "";
  const decideBody = decide ? sc(decide.body_part, decide.body) : "";
  const decideTry = decide ? sc(decide.try_part, decide.try) : "";
  const talkBody = communicate ? sc(communicate.body_part, communicate.body) : "";
  const talkVoice = communicate ? sc(communicate.voice_part, communicate.voice || "") : "";
  const talkTry = communicate ? sc(communicate.try_part, communicate.try) : "";
  const clashBody = overview.when_you_clash
    ? sc(overview.when_you_clash.body_part, overview.when_you_clash.body)
    : "";
  const clashTryText = overview.when_you_clash
    ? sc(overview.when_you_clash.try_part, overview.when_you_clash.try)
    : "";
  const title = partnerFirstName?.trim()
    ? t("soul.partner.youAnd", { name: partnerFirstName.trim() })
    : t("soul.partner.youTwo");
  const theyHeading = partnerFirstName?.trim()
    ? t("soul.partner.howNameLoves", { name: partnerFirstName.trim() })
    : t("soul.partner.howTheyLove");
  const typeLine =
    yourType && theirType
      ? t("soul.partner.typesAnd", { yourType, theirType })
      : null;
  const harmonies = overview.harmonies ?? [];
  const frictions = overview.frictions ?? [];
  const definedCenters = compositeDefinedCenters ?? null;

  const hasCurrent = hasText(theCurrent) && !shouldSkipTheCurrent(hook, theCurrent);
  const hasHowYouLove = hasText(howYouLove) || hasText(howTheyLove);
  const hasHarmonyFriction = harmonies.length > 0 || frictions.length > 0;
  const hasDecide = Boolean(decide);
  const hasCommunicate = Boolean(communicate);
  const hardWhy = hasText(clashBody)
    ? clashBody
    : hasText(whatThisAsks)
      ? whatThisAsks
      : tenderSpots;
  const hardTry = hasText(clashTryText) ? clashTryText : tryThis;
  const hasWhenItsHard = hasText(hardWhy) || hasText(hardTry);
  const hasMeetBand = hasDecide || hasCommunicate;
  const hasClickBand = hasHarmonyFriction || hasWhenItsHard;

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
        {hook}
      </p>
      {hasCurrent ? (
        <p
          className="mt-2 type-body text-fg max-w-prose"
          data-testid="soul-partner-the-current"
        >
          {theCurrent}
        </p>
      ) : null}
      {togetherCountText ? (
        <p
          className="mt-4 type-body text-fg max-w-prose"
          data-testid="soul-love-together-count"
        >
          {togetherCountText}
        </p>
      ) : null}

      <div className="mt-5 space-y-6">
        {hasMeetBand ? (
          <div className="space-y-4">
            {hasDecide && decide ? (
              <section
                className="rounded-xl border border-border bg-elevated px-4 py-3.5"
                data-testid="soul-love-decide"
              >
                <h3 className="text-sm font-semibold text-fg">{t("soul.partner.howYouDecide")}</h3>
                <p className="mt-1.5 type-body text-fg max-w-prose">
                  {foldTitleIntoBody(decideTitle, decideBody)}
                </p>
                <TryLine text={decideTry} />
              </section>
            ) : null}

            {hasCommunicate && communicate ? (
              <section
                className="rounded-xl border border-border bg-elevated px-4 py-3.5"
                data-testid="soul-love-communicate"
              >
                <h3 className="text-sm font-semibold text-fg">{t("soul.partner.howYouTalk")}</h3>
                <p className="mt-1.5 type-body text-fg max-w-prose">
                  {talkBody}
                </p>
                {hasText(talkVoice) ? (
                  <p
                    className="mt-1.5 type-body text-fg max-w-prose"
                    data-testid="soul-love-communicate-voice"
                  >
                    {talkVoice}
                  </p>
                ) : null}
                <TryLine text={talkTry} />
              </section>
            ) : null}
          </div>
        ) : null}

        {hasHowYouLove ? (
          <section className="grid gap-4 sm:grid-cols-2">
            {hasText(howYouLove) ? (
              <div className="rounded-xl border border-border bg-elevated px-4 py-3.5">
                <h3 className="text-sm font-semibold text-fg">{t("soul.partner.howYouLove")}</h3>
                <p
                  className="mt-1.5 type-body text-fg max-w-prose"
                  data-testid="soul-partner-how-you-love"
                >
                  {howYouLove}
                </p>
              </div>
            ) : null}
            {hasText(howTheyLove) ? (
              <div className="rounded-xl border border-border bg-elevated px-4 py-3.5">
                <h3 className="text-sm font-semibold text-fg">{theyHeading}</h3>
                <p
                  className="mt-1.5 type-body text-fg max-w-prose"
                  data-testid="soul-partner-how-they-love"
                >
                  {howTheyLove}
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        {hasClickBand ? (
          <div className="space-y-4">
            {hasHarmonyFriction ? (
              <div className="space-y-4" data-testid="soul-love-click-scrape">
                <GuidanceBlock
                  testId="soul-love-harmonies"
                  itemTestIdPrefix="soul-love-harmony"
                  heading={t("soul.partner.whereYouClick")}
                  items={harmonies}
                  definedCenters={definedCenters}
                />
                <GuidanceBlock
                  testId="soul-love-frictions"
                  itemTestIdPrefix="soul-love-friction"
                  heading={t("soul.partner.whereItScrapes")}
                  items={frictions}
                  definedCenters={definedCenters}
                />
              </div>
            ) : null}

            {hasWhenItsHard ? (
              <section
                className="rounded-xl border border-border bg-elevated px-4 py-3.5"
                data-testid="soul-love-hard"
              >
                <h3 className="text-sm font-semibold text-fg">{t("soul.partner.whenItsHard")}</h3>
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
                  testId={hasText(clashTryText) ? undefined : "soul-partner-try-this"}
                />
              </section>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
