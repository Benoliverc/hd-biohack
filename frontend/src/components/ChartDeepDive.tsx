"use client";

import {
  useEffect,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import {
  AUTHORITY_COPY,
  CENTER_COPY,
  DEFINITION_COPY,
  STRATEGY_COPY,
  TYPE_COPY,
  channelMeaning,
  displayCenter,
  profileLearnMore,
  type CenterKey,
} from "@/lib/hdCopy";

type Chart = Record<string, unknown>;

export type DeepDiveDomain = "core" | "centers" | "channels" | "planets";

const DOMAIN_TABS: { id: DeepDiveDomain; label: string; hash: string }[] = [
  { id: "core", label: "Core", hash: "core" },
  { id: "centers", label: "Centers", hash: "centers" },
  { id: "channels", label: "Channels", hash: "channels" },
  { id: "planets", label: "Planets", hash: "planets" },
];

function domainFromHash(hash: string): DeepDiveDomain | null {
  const h = hash.replace(/^#/, "");
  if (h === "core") return "core";
  if (h === "centers") return "centers";
  if (h === "channels") return "channels";
  if (h === "activations" || h === "planets") return "planets";
  return null;
}

function Accordion({
  title,
  subtitle,
  children,
  defaultOpen = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-border bg-elevated open:bg-elevated"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-4 py-3 text-left marker:content-none [&::-webkit-details-marker]:hidden">
        <div className="min-w-0 flex-1">
          <div className="font-medium text-fg">{title}</div>
          {subtitle && (
            <div className="mt-0.5 text-sm text-growth/90 break-words">{subtitle}</div>
          )}
        </div>
        <span className="mt-0.5 shrink-0 text-xs text-fg-muted group-open:hidden">Learn more</span>
        <span className="mt-0.5 hidden shrink-0 text-xs text-fg-muted group-open:inline">Hide</span>
      </summary>
      <div className="border-t border-border px-4 py-3 text-sm leading-relaxed text-fg-secondary whitespace-pre-wrap">
        {children}
      </div>
    </details>
  );
}

function ActivationTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<Record<string, unknown>>;
}) {
  return (
    <div className="overflow-x-auto overflow-hidden rounded-2xl border border-border">
      <div className="border-b border-border bg-elevated px-4 py-2 text-sm font-semibold">{title}</div>
      <table className="w-full text-left text-sm">
        <thead className="text-xs text-fg-muted">
          <tr>
            <th className="px-4 py-2">Planet</th>
            <th className="px-4 py-2">Gate.Line</th>
            <th className="px-4 py-2">Lon°</th>
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

function CentersMatrix({ defined }: { defined: Set<string> }) {
  const [filter, setFilter] = useState<CenterFilter>("all");
  const [expanded, setExpanded] = useState<CenterKey | null>(null);

  const matchesFilter = (key: CenterKey) => {
    const isDefined = defined.has(key);
    if (filter === "defined") return isDefined;
    if (filter === "open") return !isDefined;
    return true;
  };

  const visibleCount = CENTER_SLOTS.filter((s) => matchesFilter(s.key)).length;
  const expandedCopy = expanded ? CENTER_COPY[expanded] : null;
  const expandedDefined = expanded ? defined.has(expanded) : false;

  return (
    <div className="space-y-3">
      <p className="text-xs text-fg-muted">
        Defined = consistent energy. Open = where you take in and amplify life (wisdom potential +
        conditioning). Tap a cell for detail. Layout mirrors the bodygraph.
      </p>

      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter centers">
        {(
          [
            ["all", "All"],
            ["defined", "Defined"],
            ["open", "Open"],
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
              filter === id
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
        aria-label="Centers bodygraph matrix"
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
                    className={`mt-1 text-[10px] uppercase tracking-wide sm:text-xs ${
                      isDefined ? "text-growth" : "text-fg-muted"
                    }`}
                  >
                    {isDefined ? "Defined" : "Open"}
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
        <p className="text-sm text-fg-muted">No centers match this filter.</p>
      )}

      {expanded && expandedCopy && matchesFilter(expanded) && (
        <div
          className="rounded-xl border border-border bg-elevated px-4 py-3 text-sm leading-relaxed text-fg-secondary"
          role="region"
          aria-label={`${displayCenter(expanded)} detail`}
        >
          <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-semibold text-fg">{displayCenter(expanded)}</h3>
            <span className={`text-xs ${expandedDefined ? "text-growth" : "text-fg-muted"}`}>
              {expandedDefined ? "Defined — consistent" : "Open — takes in / amplifies"}
            </span>
          </div>
          <p className="mb-2">{expandedDefined ? expandedCopy.defined : expandedCopy.open}</p>
          <p className="text-xs text-fg-muted">Body / energy hint: {expandedCopy.bodyHint}</p>
          <button
            type="button"
            className="mt-3 text-xs text-fg-muted underline-offset-2 hover:text-fg hover:underline"
            onClick={() => setExpanded(null)}
          >
            Collapse
          </button>
        </div>
      )}
    </div>
  );
}

export function ChartDeepDive({
  chart,
  personality,
  design,
  domain,
  onDomainChange,
}: {
  chart: Chart;
  personality: Array<Record<string, unknown>>;
  design: Array<Record<string, unknown>>;
  /** Controlled domain tab; falls back to hash / internal state when omitted. */
  domain?: DeepDiveDomain;
  onDomainChange?: (domain: DeepDiveDomain) => void;
}) {
  const [internalDomain, setInternalDomain] = useState<DeepDiveDomain>("core");
  const active = domain ?? internalDomain;

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

  const defined = new Set((chart.defined_centers as string[]) || []);
  const channels = (chart.channels as Array<Record<string, unknown>>) || [];
  const hanging = (chart.hanging_gates as Array<Record<string, unknown>>) || [];
  const gates = ((chart.activated_gates as number[]) || []).slice().sort((a, b) => a - b);
  const hdType = String(chart.type || "");
  const strategy = String(chart.strategy || "");
  const authority = String(chart.authority || "");
  const profile = String(chart.profile || "");
  const definition = String(chart.definition || "");

  const typeInfo = TYPE_COPY[hdType];

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
          <h2 className="text-lg font-semibold text-fg">Deep dive</h2>
          <p className="text-xs text-fg-muted">Core blueprint, centers, channels, and planet tables.</p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Deep dive domains"
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
              {tab.label}
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
              Tap each row to expand. Short labels on the card; deeper context inside.
            </p>
            <Accordion title="Type" subtitle={hdType} defaultOpen>
              {typeInfo ? (
                <>
                  <p className="mb-2 text-fg">{typeInfo.summary}</p>
                  <p>{typeInfo.learnMore}</p>
                </>
              ) : (
                <p>Your energetic Role in how you correctly engage with life.</p>
              )}
            </Accordion>
            <Accordion title="Strategy" subtitle={strategy}>
              {STRATEGY_COPY[strategy] ||
                "How you correctly engage opportunities so resistance drops."}
            </Accordion>
            <Accordion title="Inner Authority" subtitle={authority}>
              {AUTHORITY_COPY[authority] ||
                "Your body's decision-making process — follow this over mental urgency."}
            </Accordion>
            <Accordion title="Profile" subtitle={profile}>
              {profileLearnMore(profile)}
            </Accordion>
            <Accordion title="Definition" subtitle={definition}>
              {DEFINITION_COPY[definition] ||
                "How your defined centers connect into one or more circuits."}
            </Accordion>
          </div>
        )}

        {active === "centers" && <CentersMatrix defined={defined} />}

        {active === "channels" && (
          <div className="space-y-2">
            <Accordion
              title="Active channels"
              subtitle={`${channels.length} defined`}
              defaultOpen={channels.length > 0 && channels.length <= 8}
            >
              {channels.length === 0 ? (
                <p>No full channels (Reflector or hanging-only activations).</p>
              ) : (
                <ul className="space-y-2">
                  {channels.map((ch) => {
                    const g = (ch.gates as number[]) || [];
                    const centers = ((ch.centers as string[]) || []).map(displayCenter).join(" ↔ ");
                    return (
                      <li
                        key={`${g.join("-")}-${String(ch.name)}`}
                        className="rounded-lg bg-sunken/80 px-3 py-2"
                      >
                        <div className="font-medium text-growth">
                          {g.join("–")} — {String(ch.name)}
                        </div>
                        <div className="text-xs text-fg-muted">{centers}</div>
                        <p className="mt-1.5 text-sm leading-relaxed text-fg-secondary">
                          {channelMeaning(g, String(ch.name || ""))}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Accordion>

            <Accordion title="Activated gates" subtitle={`${gates.length} gates`}>
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
                Personality (black) + Design (red) activations combined. See the Planets tab for
                planet and line detail.
              </p>
            </Accordion>

            <Accordion title="Hanging gates" subtitle={`${hanging.length} open channel halves`}>
              {hanging.length === 0 ? (
                <p>No hanging gates listed.</p>
              ) : (
                <>
                  <p className="mb-3 text-xs text-fg-muted">
                    You hold one gate of a channel; the missing half can feel magnetic when others
                    (or transits) bring it.
                  </p>
                  <ul className="space-y-2">
                    {hanging.map((h) => (
                      <li
                        key={`${h.held}-${h.missing}-${String(h.channel)}`}
                        className="rounded-lg bg-sunken/80 px-3 py-2 text-sm"
                      >
                        <span className="text-growth">Gate {String(h.held)}</span>
                        <span className="text-fg-muted"> waiting for </span>
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
            <ActivationTable title="Personality (Black)" rows={personality} />
            <ActivationTable title="Design (Red)" rows={design} />
          </div>
        )}
      </div>
    </section>
  );
}
