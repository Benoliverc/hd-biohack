"use client";

import { useI18n } from "@/lib/i18n";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import { DeepDiveEssayBody } from "@/components/DeepDiveEssayBody";
import { deepDiveTypeSections } from "@/lib/essays/deepDiveTypeCopy";
import {
  joiningGateDeepDiveCopy,
  type JoiningGateSpec,
} from "@/lib/essays/joiningGateDeepDive";
import { profilePresentation } from "@/lib/profilePresentation";
import { displayCenter, type CenterKey } from "@/lib/hdCopy";
import { useHdCopy } from "@/lib/essays/resolveHdCopy";
import {
  GATE_TO_CENTER,
  definitionAreas,
  joiningGates,
  type GraphChannel,
} from "@/lib/bodygraphGeometryV2";

type Chart = Record<string, unknown>;

export type DeepDiveDomain = "core" | "centers" | "channels" | "planets";

const DOMAIN_TABS: { id: DeepDiveDomain; labelKey: "chart.deepDive.tabCore" | "chart.deepDive.tabCenters" | "chart.deepDive.tabChannels" | "chart.deepDive.tabPlanets"; hash: string }[] = [
  { id: "core", labelKey: "chart.deepDive.tabCore", hash: "core" },
  { id: "centers", labelKey: "chart.deepDive.tabCenters", hash: "centers" },
  { id: "channels", labelKey: "chart.deepDive.tabChannels", hash: "channels" },
  { id: "planets", labelKey: "chart.deepDive.tabPlanets", hash: "planets" },
];

function domainFromHash(hash: string): DeepDiveDomain | null {
  const h = hash.replace(/^#/, "");
  if (h === "core") return "core";
  if (h === "centers") return "centers";
  if (h === "channels") return "channels";
  if (h === "activations" || h === "planets") return "planets";
  return null;
}

/** Layout effect in the browser (runs before paint); plain effect during server render. */
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * After any earlier row has collapsed, sit this summary just below the sticky stack.
 * Measures the post-collapse position. Does not use scrollIntoView.
 */
function placeOpenedSummary(details: HTMLDetailsElement | null, summary: HTMLElement | null) {
  if (!details || !summary || typeof summary.getBoundingClientRect !== "function") return;
  if (!details.open) return;
  const top = summary.getBoundingClientRect().top;
  const stickyBottom = parseFloat(window.getComputedStyle(details).scrollMarginTop);
  if (!Number.isFinite(stickyBottom)) return;
  const drift = top - stickyBottom;
  if (Math.abs(drift) >= 0.5 && typeof window.scrollBy === "function") {
    window.scrollBy({ top: drift, left: 0, behavior: "instant" });
  }
}

function Accordion({
  id,
  title,
  subtitle,
  children,
  open,
  onOpenChange,
  testId,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  testId?: string;
}) {
  const { t } = useI18n();
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const pinTopRef = useRef<number | null>(null);
  const anchorRef = useRef(false);

  useBrowserLayoutEffect(() => {
    const details = detailsRef.current;
    const summary = summaryRef.current;
    if (open && anchorRef.current) {
      anchorRef.current = false;
      placeOpenedSummary(details, summary);
      return;
    }
    if (!open && pinTopRef.current !== null && summary && typeof summary.getBoundingClientRect === "function") {
      const drift = summary.getBoundingClientRect().top - pinTopRef.current;
      pinTopRef.current = null;
      if (Math.abs(drift) >= 0.5 && typeof window.scrollBy === "function") {
        window.scrollBy({ top: drift, left: 0, behavior: "instant" });
      }
    }
  }, [open]);

  const onSummaryClick = (event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
    if (open) {
      const summary = summaryRef.current;
      if (summary && typeof summary.getBoundingClientRect === "function") {
        pinTopRef.current = summary.getBoundingClientRect().top;
      }
      anchorRef.current = false;
    } else {
      pinTopRef.current = null;
      anchorRef.current = true;
    }
    onOpenChange(!open);
  };

  return (
    <details
      ref={detailsRef}
      id={id}
      open={open}
      data-testid={testId}
      style={{ scrollMarginTop: "var(--chart-scroll-mt)" }}
      className="group rounded-xl border border-border bg-elevated open:bg-elevated"
    >
      <summary
        ref={summaryRef}
        onClick={onSummaryClick}
        className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-left marker:content-none [&::-webkit-details-marker]:hidden"
      >
        <div className="min-w-0 flex-1">
          <div className="font-medium text-fg">{title}</div>
          {subtitle && (
            <div className="mt-0.5 text-sm text-growth/90 break-words">{subtitle}</div>
          )}
        </div>
        <span className="mt-0.5 shrink-0 text-xs text-fg-muted group-open:hidden">{t("chart.deepDive.learnMore")}</span>
        <span className="mt-0.5 hidden shrink-0 text-xs text-fg-muted group-open:inline">{t("chart.deepDive.hide")}</span>
      </summary>
      <div className="border-t border-border px-4 py-3 type-body text-fg-secondary max-w-prose whitespace-pre-wrap">
        {children}
      </div>
    </details>
  );
}


function SummaryLearnMore({
  info,
  fallback,
}: {
  info?: { summary: string; learnMore: string };
  fallback: string;
}) {
  if (!info) return <p>{fallback}</p>;
  return (
    <>
      <p className="mb-2 text-fg">{info.summary}</p>
      {info.learnMore
        .split(/\n\n+/)
        .map((para) => para.trim())
        .filter(Boolean)
        .map((para, i) => (
          <p key={i} className={i === 0 ? undefined : "mt-3"}>
            {para}
          </p>
        ))}
    </>
  );
}

function finiteGates(values: unknown[]): number[] {
  const out: number[] = [];
  for (const value of values) {
    const gate = Number(value);
    if (Number.isFinite(gate) && gate > 0) out.push(gate);
  }
  return out;
}

/** Held-end area, then missing-end area, using the same labels as the v9 note. */
function joiningGateSpecs(
  definedCenters: string[],
  channels: GraphChannel[],
  activated: number[],
): JoiningGateSpec[] {
  const areas = definitionAreas(definedCenters, channels);
  return joiningGates(definedCenters, channels, activated).flatMap((join) => {
    const heldCenter = GATE_TO_CENTER[join.from];
    const missingCenter = GATE_TO_CENTER[join.to];
    const heldArea = heldCenter ? areas.find((area) => area.includes(heldCenter)) : undefined;
    const missingArea = missingCenter ? areas.find((area) => area.includes(missingCenter)) : undefined;
    if (!heldArea || !missingArea) return [];
    return [
      {
        gate: join.gate,
        areaA: heldArea.map((center) => displayCenter(center)).join(" + "),
        areaB: missingArea.map((center) => displayCenter(center)).join(" + "),
      },
    ];
  });
}

function JoiningGateBlock({
  personName,
  gates,
}: {
  personName?: string;
  gates: JoiningGateSpec[];
}) {
  const { t, locale } = useI18n();
  const copy = joiningGateDeepDiveCopy(locale, personName, gates);
  return (
    <section data-testid="deep-dive-joining-gate" className="mb-3">
      <h3 className="font-semibold">{t("chart.v9.joiningGate")}</h3>
      <p className="mt-1 font-normal">{copy.what}</p>
      {copy.specifics.map((paragraph, index) => (
        <p key={`${gates[index]?.gate ?? index}-${index}`} className="mt-3 font-normal">
          {paragraph}
        </p>
      ))}
      <p className="mt-3 font-normal">{copy.why}</p>
    </section>
  );
}

function ActivationTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<Record<string, unknown>>;
}) {
  const { t } = useI18n();
  return (
    <div className="overflow-x-auto overflow-hidden rounded-2xl border border-border">
      <div className="border-b border-border bg-elevated px-4 py-2 text-sm font-semibold">{title}</div>
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-fg-muted">
          <tr>
            <th className="px-4 py-2">{t("chart.deepDive.planet")}</th>
            <th className="px-4 py-2">{t("chart.deepDive.gateLine")}</th>
            <th className="px-4 py-2">{t("chart.deepDive.lon")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.planet)} className="border-t border-border">
              <td className="px-4 py-1.5">{String(r.planet)}</td>
              <td className="px-4 py-1.5 text-growth">{String(r.label)}</td>
              <td className="px-4 py-1.5 text-fg-muted">{Number(r.longitude).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type CenterFilter = "all" | "defined" | "open";

/** CSS grid slots mapped to bodygraph spatial layout (spine + side motors). */
const CENTER_SLOTS: { key: CenterKey; style: CSSProperties }[] = [
  { key: "Head", style: { gridColumn: 2, gridRow: 1 } },
  { key: "Ajna", style: { gridColumn: 2, gridRow: 2 } },
  { key: "Throat", style: { gridColumn: 2, gridRow: 3 } },
  { key: "G", style: { gridColumn: 2, gridRow: 4 } },
  { key: "Heart", style: { gridColumn: 3, gridRow: 4 } },
  { key: "Spleen", style: { gridColumn: 1, gridRow: 5 } },
  { key: "Sacral", style: { gridColumn: 2, gridRow: 5 } },
  { key: "Solar_Plexus", style: { gridColumn: 3, gridRow: 5 } },
  { key: "Root", style: { gridColumn: 2, gridRow: 6 } },
];

function CentersMatrix({
  defined,
  openCenter,
  onOpenCenter,
}: {
  defined: Set<string>;
  openCenter?: CenterKey | null;
  onOpenCenter?: (center: CenterKey | null) => void;
}) {
  const { t } = useI18n();
  const { CENTER_COPY } = useHdCopy();
  const controlled = openCenter !== undefined;
  const [filter, setFilter] = useState<CenterFilter>("all");
  const [internalExpanded, setInternalExpanded] = useState<CenterKey | null>(null);
  const expanded = controlled ? openCenter ?? null : internalExpanded;
  const activeFilter: CenterFilter = openCenter ? "all" : filter;

  useEffect(() => {
    if (openCenter) setFilter("all");
  }, [openCenter]);

  const setExpanded = (next: CenterKey | null) => {
    if (!controlled) setInternalExpanded(next);
    onOpenCenter?.(next);
  };

  const matchesFilter = (key: CenterKey) => {
    const isDefined = defined.has(key);
    if (activeFilter === "defined") return isDefined;
    if (activeFilter === "open") return !isDefined;
    return true;
  };

  const visibleCount = CENTER_SLOTS.filter((s) => matchesFilter(s.key)).length;
  const expandedCopy = expanded ? CENTER_COPY[expanded] : null;
  const expandedDefined = expanded ? defined.has(expanded) : false;

  return (
    <div className="space-y-3">
      <p className="text-xs text-fg-muted">
        {t("chart.deepDive.definedOpenHelp")}
      </p>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("chart.deepDive.filterCenters")}>
        {(
          [
            ["all", t("chart.deepDive.filterAll")],
            ["defined", t("chart.deepDive.defined")],
            ["open", t("chart.deepDive.open")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => {
              setFilter(id);
              setExpanded(null);
            }}
            className={`min-h-9 rounded-full border px-3 py-1.5 text-xs transition ${
              activeFilter === id
                ? "border-growth bg-growth-soft text-growth-ink ring-2 ring-growth/30"
                : "border-border bg-sunken text-fg-muted hover:border-growth/50 hover:text-fg"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        className="mx-auto grid max-w-md grid-cols-3 gap-2"
        style={{ gridTemplateRows: "repeat(6, minmax(0, auto))" }}
        role="list"
        aria-label={t("chart.deepDive.centersMatrix")}
      >
        {CENTER_SLOTS.map(({ key, style }) => {
          const isDefined = defined.has(key);
          const isOpen = expanded === key;
          const match = matchesFilter(key);
          return (
            <div
              key={key}
              role="listitem"
              style={style}
              className={`min-h-[4.5rem] transition ${
                match ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
              aria-hidden={!match}
            >
              {match ? (
                <button
                  type="button"
                  aria-pressed={isOpen}
                  onClick={() => setExpanded(isOpen ? null : key)}
                  className={`h-full w-full min-h-[4.5rem] rounded-xl border px-2 py-2.5 text-left transition ${
                    isOpen
                      ? "border-growth bg-growth-soft ring-2 ring-growth/30"
                      : isDefined
                        ? "border-growth/40 bg-elevated hover:border-growth/70"
                        : "border-border bg-sunken/80 hover:border-border"
                  }`}
                >
                  <div className="text-xs font-semibold leading-snug text-fg sm:text-sm">
                    {displayCenter(key)}
                  </div>
                  <div
                    className={`mt-1 type-caption uppercase tracking-wide ${
                      isDefined ? "text-growth" : "text-fg-muted"
                    }`}
                  >
                    {isDefined ? t("chart.deepDive.defined") : t("chart.deepDive.open")}
                  </div>
                </button>
              ) : (
                <div className="h-full min-h-[4.5rem]" aria-hidden />
              )}
            </div>
          );
        })}
      </div>

      {visibleCount === 0 && (
        <p className="text-sm text-fg-muted">{t("chart.deepDive.noCentersMatch")}</p>
      )}

      {expanded && expandedCopy && matchesFilter(expanded) && (
        <div
          className="rounded-xl border border-border bg-elevated px-4 py-3 type-body text-fg-secondary max-w-prose"
          role="region"
          aria-label={t("chart.deepDive.centerDetail", { center: displayCenter(expanded) })}
        >
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-semibold text-fg">{displayCenter(expanded)}</h3>
            <span className={`text-xs ${expandedDefined ? "text-growth" : "text-fg-muted"}`}>
              {expandedDefined ? t("chart.deepDive.definedConsistent") : t("chart.deepDive.openAmplifies")}
            </span>
          </div>
          <p className="mb-2">{expandedDefined ? expandedCopy.defined : expandedCopy.open}</p>
          <p className="text-xs text-fg-muted">{t("chart.deepDive.bodyHint", { hint: expandedCopy.bodyHint })}</p>
          <button
            type="button"
            className="mt-3 text-xs text-fg-muted underline-offset-2 hover:text-fg hover:underline"
            onClick={() => setExpanded(null)}
          >
            {t("chart.deepDive.collapse")}
          </button>
        </div>
      )}
    </div>
  );
}

export function ChartDeepDive({
  chart,
  personName,
  personality,
  design,
  domain,
  onDomainChange,
  openCoreRow,
  onOpenCoreRow,
  openCenter,
  onOpenCenter,
}: {
  chart: Chart;
  personName?: string;
  personality: Array<Record<string, unknown>>;
  design: Array<Record<string, unknown>>;
  /** Controlled domain tab; falls back to hash / internal state when omitted. */
  domain?: DeepDiveDomain;
  onDomainChange?: (domain: DeepDiveDomain) => void;
  /** Controlled Core row. Null leaves every Core row closed. Omitted uses internal state. */
  openCoreRow?: string | null;
  onOpenCoreRow?: (rowId: string | null) => void;
  /** Controlled Centers row. Null leaves every center collapsed. Omitted uses internal state. */
  openCenter?: CenterKey | null;
  onOpenCenter?: (center: CenterKey | null) => void;
}) {
  const { t, locale } = useI18n();
  const {
    STRATEGY_COPY,
    AUTHORITY_COPY,
    DEFINITION_COPY,
    profileLearnMore,
    channelMeaning,
  } = useHdCopy();
  const [internalDomain, setInternalDomain] = useState<DeepDiveDomain>("core");
  const active = domain ?? internalDomain;
  const coreControlled = openCoreRow !== undefined;
  const [internalCore, setInternalCore] = useState<string | null>(null);
  const coreOpen = coreControlled ? openCoreRow ?? null : internalCore;
  const [channelOpen, setChannelOpen] = useState<string | null>(null);

  const setCoreOpen = (id: string | null) => {
    if (!coreControlled) setInternalCore(id);
    onOpenCoreRow?.(id);
  };

  useEffect(() => {
    if (active !== "channels") setChannelOpen(null);
    if (active !== "core" && !coreControlled) setInternalCore(null);
  }, [active, coreControlled]);

  const setDomain = (next: DeepDiveDomain) => {
    onDomainChange?.(next);
    if (domain === undefined) setInternalDomain(next);
  };

  useEffect(() => {
    if (domain !== undefined) return;
    const apply = () => {
      const fromHash = domainFromHash(window.location.hash);
      if (fromHash) setInternalDomain(fromHash);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [domain]);

  const definedCenters = (chart.defined_centers as string[]) || [];
  const defined = new Set(definedCenters);
  const channels = (chart.channels as Array<Record<string, unknown>>) || [];
  const graphChannels: GraphChannel[] = channels.map((ch) => ({
    gates: Array.isArray(ch.gates) ? (ch.gates as number[]) : undefined,
    centers: Array.isArray(ch.centers) ? (ch.centers as string[]) : undefined,
    name: typeof ch.name === "string" ? ch.name : undefined,
  }));
  const hanging = (chart.hanging_gates as Array<Record<string, unknown>>) || [];
  const gates = ((chart.activated_gates as number[]) || []).slice().sort((a, b) => a - b);
  const hdType = String(chart.type || "");
  const strategy = String(chart.strategy || "");
  const authority = String(chart.authority || "");
  const profile = String(chart.profile || "");
  const definition = String(chart.definition || "");
  const activated = Array.from(
    new Set([
      ...finiteGates((chart.activated_gates as number[]) || []),
      ...finiteGates(personality.map((row) => row.gate)),
      ...finiteGates(design.map((row) => row.gate)),
    ]),
  );
  const joiningGateRows = joiningGateSpecs(definedCenters, graphChannels, activated);

  const selectTab = (tab: (typeof DOMAIN_TABS)[number]) => {
    setDomain(tab.id);
    if (typeof window !== "undefined") {
      const url = `${window.location.pathname}${window.location.search}#${tab.hash}`;
      window.history.replaceState(null, "", url);
    }
  };

  return (
    <section id="deep-dive" className="relative space-y-4">
      {/* Legacy hash targets — pinned to section top (avoid space-y offset on absolute siblings). */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-0 w-0 overflow-hidden"
        aria-hidden
      >
        <div id="core" />
        <div id="centers" />
        <div id="channels" />
        <div id="planets" />
        <div id="activations" />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-fg">{t("chart.deepDive.title")}</h2>
          <p className="text-xs text-fg-muted">{t("chart.deepDive.subtitle")}</p>
          {personName ? (
            <p className="mt-1 text-xs text-fg-secondary" data-testid="deep-dive-other-person-note">
              {t("chart.deepDive.otherPersonNote", { name: personName })}
            </p>
          ) : null}
        </div>
      </div>

      <div
        role="tablist"
        aria-label={t("chart.deepDive.domains")}
        className="flex w-full gap-1 rounded-xl border border-border bg-sunken p-1"
      >
        {DOMAIN_TABS.map((tab, index) => {
          const selected = active === tab.id;
          const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
            let next = -1;
            if (e.key === "ArrowRight") next = (index + 1) % DOMAIN_TABS.length;
            else if (e.key === "ArrowLeft")
              next = (index - 1 + DOMAIN_TABS.length) % DOMAIN_TABS.length;
            else if (e.key === "Home") next = 0;
            else if (e.key === "End") next = DOMAIN_TABS.length - 1;
            else return;
            e.preventDefault();
            const nextTab = DOMAIN_TABS[next];
            selectTab(nextTab);
            document.getElementById(`deep-dive-tab-${nextTab.id}`)?.focus();
          };
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              id={`deep-dive-tab-${tab.id}`}
              onClick={() => selectTab(tab)}
              onKeyDown={onTabKeyDown}
              className={`relative flex min-h-11 flex-1 basis-0 items-center justify-center rounded-lg px-2 py-2 text-center text-xs transition sm:px-3 sm:text-sm outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-sunken ${
                selected
                  ? "bg-elevated font-semibold text-fg shadow-soft ring-1 ring-border"
                  : "text-fg-secondary hover:bg-elevated/80 hover:text-fg"
              }`}
            >
              {t(tab.labelKey)}
              {selected && (
                <span
                  className="pointer-events-none absolute inset-x-2 bottom-0.5 h-0.5 rounded-full bg-growth"
                  aria-hidden
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        aria-labelledby={`deep-dive-tab-${active}`}
        className="space-y-3"
      >
        {active === "core" && (
          <div className="space-y-2">
            <p className="text-xs text-fg-muted">
              {t("chart.deepDive.tapToExpand")}
            </p>
            <Accordion title="Type" subtitle={hdType} testId="deep-dive-type" id="deep-dive-type"
              open={coreOpen === "deep-dive-type"}
              onOpenChange={(next) => setCoreOpen(next ? "deep-dive-type" : null)}
            >
              {deepDiveTypeSections(hdType, locale, personName).map(({ heading, body }, index) => (
                <section key={heading} className={index ? "mt-3" : undefined}>
                  <h3 className="font-semibold">{heading}</h3>
                  <p className="mt-1 font-normal">{body}</p>
                </section>
              ))}
            </Accordion>
            <Accordion title="Profile" subtitle={profilePresentation(profile).value} testId="deep-dive-profile" id="deep-dive-profile"
              open={coreOpen === "deep-dive-profile"}
              onOpenChange={(next) => setCoreOpen(next ? "deep-dive-profile" : null)}
            >
              <DeepDiveEssayBody text={profileLearnMore(profile)} />
            </Accordion>
            <Accordion title="Strategy" subtitle={strategy} testId="deep-dive-strategy" id="deep-dive-strategy"
              open={coreOpen === "deep-dive-strategy"}
              onOpenChange={(next) => setCoreOpen(next ? "deep-dive-strategy" : null)}
            >
              <SummaryLearnMore
                info={STRATEGY_COPY[strategy]}
                fallback={t("chart.deepDive.strategyBlurb")}
              />
            </Accordion>
            <Accordion
              title={t("chart.deepDive.innerAuthority")}
              subtitle={authority}
              testId="deep-dive-inner-authority"
              id="deep-dive-inner-authority"
              open={coreOpen === "deep-dive-inner-authority"}
              onOpenChange={(next) => setCoreOpen(next ? "deep-dive-inner-authority" : null)}
            >
              <SummaryLearnMore
                info={AUTHORITY_COPY[authority]}
                fallback={t("chart.deepDive.authorityBlurb")}
              />
            </Accordion>
            <Accordion title="Definition" subtitle={definition} testId="deep-dive-definition" id="deep-dive-definition"
              open={coreOpen === "deep-dive-definition"}
              onOpenChange={(next) => setCoreOpen(next ? "deep-dive-definition" : null)}
            >
              {joiningGateRows.length > 0 ? (
                <JoiningGateBlock personName={personName} gates={joiningGateRows} />
              ) : null}
              <SummaryLearnMore
                info={DEFINITION_COPY[definition]}
                fallback={t("chart.deepDive.definitionBlurb")}
              />
            </Accordion>
          </div>
        )}

        {active === "centers" && (
          <CentersMatrix defined={defined} openCenter={openCenter} onOpenCenter={onOpenCenter} />
        )}

        {active === "channels" && (
          <div className="space-y-2">
            {channels.length === 0 ? (
              <div className="rounded-xl border border-border bg-elevated px-4 py-3 text-sm text-fg-secondary">
                {t("chart.deepDive.noFullChannels")}
              </div>
            ) : (
              <>
                <p className="text-xs text-fg-muted">
                  {t("chart.deepDive.activeChannels", { n: channels.length })}
                </p>
                {channels.map((ch) => {
                  const g = (ch.gates as number[]) || [];
                  const centers = ((ch.centers as string[]) || []).map(displayCenter).join(" ↔ ");
                  const name = String(ch.name || "");
                  return (
                    <Accordion
                      key={`${g.join("-")}-${name}`}
                      id={`deep-dive-channel-${g.join("-")}`}
                      title={`${g.join("–")} — ${name}`}
                      subtitle={centers || undefined}
                      open={channelOpen === `deep-dive-channel-${g.join("-")}`}
                      onOpenChange={(next) => setChannelOpen(next ? `deep-dive-channel-${g.join("-")}` : null)}
                    >
                      <DeepDiveEssayBody text={channelMeaning(g, name)} />
                    </Accordion>
                  );
                })}
              </>
            )}

            <Accordion
              id="deep-dive-activated-gates"
              title={t("chart.deepDive.activatedGates")}
              subtitle={t("chart.deepDive.gatesCount", { n: gates.length })}
              open={channelOpen === "deep-dive-activated-gates"}
              onOpenChange={(next) => setChannelOpen(next ? "deep-dive-activated-gates" : null)}
            >
              <div className="flex flex-wrap gap-1.5">
                {gates.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-border bg-sunken px-2.5 py-0.5 text-xs text-fg"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs text-fg-muted">
                {t("chart.deepDive.activatedGatesHelp")}
              </p>
            </Accordion>

            <Accordion
              id="deep-dive-hanging-gates"
              title={t("chart.deepDive.hangingGates")}
              subtitle={t("chart.deepDive.openHalves", { n: hanging.length })}
              open={channelOpen === "deep-dive-hanging-gates"}
              onOpenChange={(next) => setChannelOpen(next ? "deep-dive-hanging-gates" : null)}
            >
              {hanging.length === 0 ? (
                <p>{t("chart.deepDive.noHanging")}</p>
              ) : (
                <>
                  <p className="mb-3 text-xs text-fg-muted">
                    {t("chart.deepDive.hangingHelp")}
                  </p>
                  <ul className="space-y-2">
                    {hanging.map((h) => (
                      <li
                        key={`${h.held}-${h.missing}-${String(h.channel)}`}
                        className="rounded-lg bg-sunken/80 px-3 py-2 text-sm"
                      >
                        <span className="text-growth">{t("chart.deepDive.gateHeld", { gate: String(h.held) })}</span>
                        <span className="text-fg-muted"> {t("chart.deepDive.waitingFor")} </span>
                        <span className="text-energy-ink/90">{String(h.missing)}</span>
                        <span className="text-fg-muted"> — {String(h.channel)}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Accordion>
          </div>
        )}

        {active === "planets" && (
          <div className="grid gap-4 md:grid-cols-2">
            <ActivationTable title={t("chart.deepDive.personalityBlack")} rows={personality} />
            <ActivationTable title={t("chart.deepDive.designRed")} rows={design} />
          </div>
        )}
      </div>
      <p className="type-caption text-fg-muted" data-testid="deep-dive-footer">{t("chart.deepDive.footer")}</p>
    </section>
  );
}
