"use client";

import {
  useEffect,
  useId,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
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
};

type TabId =
  | "current"
  | "how-you-love"
  | "harmony-friction"
  | "decide-talk"
  | "when-its-hard";

type TabDef = {
  id: TabId;
  label: string;
  testId: string;
  panelTestId: string;
};

const TAB_DEFS: TabDef[] = [
  {
    id: "current",
    label: "The current",
    testId: "soul-love-tab-current",
    panelTestId: "soul-love-panel-current",
  },
  {
    id: "how-you-love",
    label: "How you love",
    testId: "soul-love-tab-how-you-love",
    panelTestId: "soul-love-panel-how-you-love",
  },
  {
    id: "harmony-friction",
    label: "Harmony & friction",
    testId: "soul-love-tab-harmony-friction",
    panelTestId: "soul-love-panel-harmony-friction",
  },
  {
    id: "decide-talk",
    label: "Decide & talk",
    testId: "soul-love-tab-decide-talk",
    panelTestId: "soul-love-panel-decide-talk",
  },
  {
    id: "when-its-hard",
    label: "When it's hard",
    testId: "soul-love-tab-when-its-hard",
    panelTestId: "soul-love-panel-when-its-hard",
  },
];

function hasText(value?: string | null): boolean {
  return Boolean(value && value.trim());
}

function GuidanceBlock({
  testId,
  itemTestIdPrefix,
  heading,
  items,
  flushTop,
}: {
  testId: string;
  itemTestIdPrefix: string;
  heading: string;
  items: SoulLoveGuidanceItem[];
  flushTop?: boolean;
}) {
  if (!items.length) return null;
  return (
    <section
      className={
        flushTop ? "pt-0" : "border-t border-energy/20 pt-5"
      }
      data-testid={testId}
    >
      <h3 className="text-sm font-semibold text-fg">{heading}</h3>
      <ul className="mt-3 space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-energy/30 bg-energy/10 px-3.5 py-3"
            data-testid={`${itemTestIdPrefix}-${item.id}`}
          >
            <p className="text-sm font-semibold text-fg">{item.title}</p>
            <p className="mt-1.5 text-sm text-fg-secondary">{item.body}</p>
            <p className="mt-2 text-xs text-fg-muted">{item.try}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SectionBlock({
  testId,
  heading,
  section,
  inset,
  flushTop,
}: {
  testId: string;
  heading: string;
  section?: SoulLoveGuidanceSection | null;
  inset?: boolean;
  flushTop?: boolean;
}) {
  if (!section) return null;
  if (inset) {
    return (
      <section
        className="rounded-xl border border-energy/35 bg-energy/15 px-4 py-3.5"
        data-testid={testId}
      >
        <h3 className="text-sm font-semibold text-energy-ink">{heading}</h3>
        <p className="mt-1.5 text-sm text-fg-secondary">{section.body}</p>
        <p className="mt-2 text-xs text-fg-muted">{section.try}</p>
      </section>
    );
  }
  return (
    <section
      className={
        flushTop ? "pt-0" : "border-t border-energy/20 pt-5"
      }
      data-testid={testId}
    >
      <h3 className="text-sm font-semibold text-fg">{heading}</h3>
      <p className="mt-1.5 text-sm text-fg-secondary">{section.body}</p>
      <p className="mt-2 text-xs text-fg-muted">{section.try}</p>
    </section>
  );
}

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
  const harmonies = overview.harmonies ?? [];
  const frictions = overview.frictions ?? [];
  const reactId = useId();

  const availableTabs = useMemo(() => {
    const hasCurrent = hasText(overview.the_current);
    const hasHowYouLove =
      hasText(overview.how_you_love) || hasText(overview.how_they_love);
    const hasHarmonyFriction = harmonies.length > 0 || frictions.length > 0;
    const hasDecideTalk = Boolean(
      overview.how_you_decide || overview.how_you_communicate,
    );
    const hasWhenItsHard =
      hasText(overview.what_this_asks) ||
      hasText(overview.tender_spots) ||
      Boolean(overview.when_you_clash) ||
      hasText(overview.try_this);

    const visibility: Record<TabId, boolean> = {
      current: hasCurrent,
      "how-you-love": hasHowYouLove,
      "harmony-friction": hasHarmonyFriction,
      "decide-talk": hasDecideTalk,
      "when-its-hard": hasWhenItsHard,
    };

    return TAB_DEFS.filter((tab) => visibility[tab.id]);
  }, [overview, harmonies.length, frictions.length]);

  const [activeTab, setActiveTab] = useState<TabId | null>(
    availableTabs[0]?.id ?? null,
  );

  useEffect(() => {
    if (!availableTabs.length) {
      setActiveTab(null);
      return;
    }
    if (!activeTab || !availableTabs.some((tab) => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, activeTab]);

  const selectTab = (id: TabId) => {
    setActiveTab(id);
  };

  const onTabKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (!availableTabs.length) return;
    let next = -1;
    if (e.key === "ArrowRight") next = (index + 1) % availableTabs.length;
    else if (e.key === "ArrowLeft")
      next = (index - 1 + availableTabs.length) % availableTabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = availableTabs.length - 1;
    else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectTab(availableTabs[index].id);
      return;
    } else return;
    e.preventDefault();
    const nextTab = availableTabs[next];
    selectTab(nextTab.id);
    document
      .getElementById(`${reactId}-tab-${nextTab.id}`)
      ?.focus();
  };

  let panelBody: ReactNode = null;
  if (activeTab === "current" && hasText(overview.the_current)) {
    panelBody = (
      <section>
        <h3 className="text-sm font-semibold text-fg">
          The current between you
        </h3>
        <p
          className="mt-1.5 text-sm text-fg-secondary"
          data-testid="soul-partner-the-current"
        >
          {overview.the_current}
        </p>
      </section>
    );
  } else if (activeTab === "how-you-love") {
    panelBody = (
      <section className="grid gap-5 sm:grid-cols-2">
        {hasText(overview.how_you_love) ? (
          <div>
            <h3 className="text-sm font-semibold text-fg">How you love</h3>
            <p
              className="mt-1.5 text-sm text-fg-secondary"
              data-testid="soul-partner-how-you-love"
            >
              {overview.how_you_love}
            </p>
          </div>
        ) : null}
        {hasText(overview.how_they_love) ? (
          <div>
            <h3 className="text-sm font-semibold text-fg">{theyHeading}</h3>
            <p
              className="mt-1.5 text-sm text-fg-secondary"
              data-testid="soul-partner-how-they-love"
            >
              {overview.how_they_love}
            </p>
          </div>
        ) : null}
      </section>
    );
  } else if (activeTab === "harmony-friction") {
    const harmonyFirst = harmonies.length > 0;
    panelBody = (
      <div className="space-y-5">
        <GuidanceBlock
          testId="soul-love-harmonies"
          itemTestIdPrefix="soul-love-harmony"
          heading="Where you harmonize"
          items={harmonies}
          flushTop
        />
        <GuidanceBlock
          testId="soul-love-frictions"
          itemTestIdPrefix="soul-love-friction"
          heading="Where friction shows up"
          items={frictions}
          flushTop={!harmonyFirst}
        />
      </div>
    );
  } else if (activeTab === "decide-talk") {
    const decideFirst = Boolean(overview.how_you_decide);
    panelBody = (
      <div className="space-y-5">
        <SectionBlock
          testId="soul-love-decide"
          heading="How you decide together"
          section={overview.how_you_decide}
          flushTop
        />
        <SectionBlock
          testId="soul-love-communicate"
          heading="How you talk"
          section={overview.how_you_communicate}
          flushTop={!decideFirst}
        />
      </div>
    );
  } else if (activeTab === "when-its-hard") {
    const blocks: ReactNode[] = [];
    if (hasText(overview.what_this_asks)) {
      blocks.push(
        <section key="asks">
          <h3 className="text-sm font-semibold text-fg">What this bond asks</h3>
          <p
            className="mt-1.5 text-sm text-fg-secondary"
            data-testid="soul-partner-what-this-asks"
          >
            {overview.what_this_asks}
          </p>
        </section>,
      );
    }
    if (hasText(overview.tender_spots)) {
      blocks.push(
        <section
          key="tender"
          className={blocks.length ? "border-t border-energy/20 pt-5" : undefined}
        >
          <h3 className="text-sm font-semibold text-fg">The tender spots</h3>
          <p
            className="mt-1.5 text-sm text-fg-secondary"
            data-testid="soul-partner-tender-spots"
          >
            {overview.tender_spots}
          </p>
        </section>,
      );
    }
    if (overview.when_you_clash) {
      blocks.push(
        <SectionBlock
          key="clash"
          testId="soul-love-clash"
          heading="When things get hard"
          section={overview.when_you_clash}
          inset
        />,
      );
    }
    if (hasText(overview.try_this)) {
      blocks.push(
        <section
          key="try"
          className="rounded-xl border border-energy/35 bg-energy/15 px-4 py-3.5"
          data-testid="soul-partner-try-this"
        >
          <h3 className="text-sm font-semibold text-energy-ink">
            Try this together
          </h3>
          <p className="mt-1.5 text-sm text-fg-secondary">{overview.try_this}</p>
        </section>,
      );
    }
    panelBody = <div className="space-y-5">{blocks}</div>;
  }

  const activeDef =
    availableTabs.find((tab) => tab.id === activeTab) ?? availableTabs[0];

  return (
    <div
      className="soul-love-guidance-wash rounded-2xl border border-energy/50 p-6"
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
        className="mt-4 text-xl font-semibold leading-snug text-fg sm:text-2xl"
        data-testid="soul-partner-hook"
      >
        {overview.hook}
      </p>

      {availableTabs.length > 0 && activeDef ? (
        <div className="mt-6">
          <div
            role="tablist"
            aria-label="Love guidance chapters"
            data-testid="soul-love-tabs"
            className="flex flex-nowrap gap-1 overflow-x-auto border-b border-energy/25 pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {availableTabs.map((tab, index) => {
              const selected = tab.id === activeTab;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`${reactId}-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`${reactId}-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  data-testid={tab.testId}
                  onClick={() => selectTab(tab.id)}
                  onKeyDown={(e) => onTabKeyDown(e, index)}
                  className={`relative shrink-0 whitespace-nowrap px-3 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
                    selected
                      ? "font-semibold text-energy-ink"
                      : "font-medium text-fg-secondary hover:text-fg"
                  }`}
                >
                  {tab.label}
                  {selected ? (
                    <span
                      className="pointer-events-none absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-energy"
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`${reactId}-panel-${activeDef.id}`}
            aria-labelledby={`${reactId}-tab-${activeDef.id}`}
            data-testid={activeDef.panelTestId}
            className="mt-5"
          >
            {panelBody}
          </div>
        </div>
      ) : null}

      <p className="mt-5 text-xs text-fg-muted">
        This is how your designs meet in love — not a score, and not a verdict on the
        relationship.
      </p>
    </div>
  );
}
