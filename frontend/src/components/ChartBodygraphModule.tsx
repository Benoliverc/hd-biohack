"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { BodyGraphProps } from "@/components/BodyGraph";
import { useI18n, type MessageKey } from "@/lib/i18n";
import { displayCenter } from "@/lib/hdCopy";
import {
  CHANNEL_LATTICE,
  GATE_TO_CENTER,
  INTEGRATION_GATES,
  MOTOR_CENTERS,
  TORSO_PATH,
  centerPath,
  preferIntegrationHangingMissing,
  type CenterKey,
} from "@/lib/bodygraphGeometry";
import {
  EDITORIAL_CENTERS,
  bridgeKey,
  editorialBadgeFontSize,
  editorialChannelPath,
  editorialGateAnchor,
  editorialGateInk,
  editorialHangingDash,
} from "@/lib/editorialBodygraphGeometry";

const TYPES = [
  "Generator",
  "Manifesting Generator",
  "Manifestor",
  "Projector",
  "Reflector",
] as const;
type TypeName = (typeof TYPES)[number];
const ACCENTS = {
  Projector: ["#4a6b53", "#dce5de"],
  Generator: ["#cbad80", "#f2ece3"],
  "Manifesting Generator": ["#6d4f2c", "#f2ece3"],
  Manifestor: ["#8f4a3a", "#efece4"],
  Reflector: ["#5e645c", "#e8e4da"],
} satisfies Record<TypeName, [string, string]>;
const TABS = ["overview", "centers", "bridges", "hanging"] as const;
type Tab = (typeof TABS)[number];
type Selection =
  | { kind: "center"; center: CenterKey }
  | { kind: "bridge"; key: string };
const CENTER_KEYS = Object.keys(EDITORIAL_CENTERS).filter(
  (key): key is CenterKey => key in EDITORIAL_CENTERS,
);
const BRIDGE_SUMMARIES: Record<string, MessageKey> = {
  "1-8": "chart.bodygraphModule.bridge.1-8",
  "2-14": "chart.bodygraphModule.bridge.2-14",
  "3-60": "chart.bodygraphModule.bridge.3-60",
  "4-63": "chart.bodygraphModule.bridge.4-63",
  "5-15": "chart.bodygraphModule.bridge.5-15",
  "6-59": "chart.bodygraphModule.bridge.6-59",
  "7-31": "chart.bodygraphModule.bridge.7-31",
  "9-52": "chart.bodygraphModule.bridge.9-52",
  "10-20": "chart.bodygraphModule.bridge.10-20",
  "10-34": "chart.bodygraphModule.bridge.10-34",
  "10-57": "chart.bodygraphModule.bridge.10-57",
  "11-56": "chart.bodygraphModule.bridge.11-56",
  "12-22": "chart.bodygraphModule.bridge.12-22",
  "13-33": "chart.bodygraphModule.bridge.13-33",
  "16-48": "chart.bodygraphModule.bridge.16-48",
  "17-62": "chart.bodygraphModule.bridge.17-62",
  "18-58": "chart.bodygraphModule.bridge.18-58",
  "19-49": "chart.bodygraphModule.bridge.19-49",
  "20-34": "chart.bodygraphModule.bridge.20-34",
  "20-57": "chart.bodygraphModule.bridge.20-57",
  "21-45": "chart.bodygraphModule.bridge.21-45",
  "23-43": "chart.bodygraphModule.bridge.23-43",
  "24-61": "chart.bodygraphModule.bridge.24-61",
  "25-51": "chart.bodygraphModule.bridge.25-51",
  "26-44": "chart.bodygraphModule.bridge.26-44",
  "27-50": "chart.bodygraphModule.bridge.27-50",
  "28-38": "chart.bodygraphModule.bridge.28-38",
  "29-46": "chart.bodygraphModule.bridge.29-46",
  "30-41": "chart.bodygraphModule.bridge.30-41",
  "32-54": "chart.bodygraphModule.bridge.32-54",
  "34-57": "chart.bodygraphModule.bridge.34-57",
  "35-36": "chart.bodygraphModule.bridge.35-36",
  "37-40": "chart.bodygraphModule.bridge.37-40",
  "39-55": "chart.bodygraphModule.bridge.39-55",
  "42-53": "chart.bodygraphModule.bridge.42-53",
  "47-64": "chart.bodygraphModule.bridge.47-64",
};

function typeName(value: string): TypeName | null {
  return TYPES.find((name) => name === value) ?? null;
}
function normalizeCenter(center: string) {
  if (["Ego", "Ego / Heart"].includes(center)) return "Heart";
  if (["G / Identity", "Identity"].includes(center)) return "G";
  return center.replaceAll(" ", "_");
}
export type ChartBodygraphModuleProps = Pick<
  BodyGraphProps,
  | "definedCenters"
  | "channels"
  | "activatedGates"
  | "hangingGates"
  | "personalityGates"
  | "designGates"
> & {
  actualType: string;
  personName?: string;
  onDeepDive: (domain: "centers" | "channels") => void | Promise<void>;
};

export function ChartBodygraphModule({
  actualType,
  personName,
  onDeepDive,
  definedCenters,
  channels,
  activatedGates = [],
  hangingGates = [],
  personalityGates = [],
  designGates = [],
}: ChartBodygraphModuleProps) {
  const { t } = useI18n();
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const peekRef = useRef<HTMLDivElement>(null);
  const selectionTrigger = useRef<SVGElement | HTMLButtonElement | null>(null);
  const [badgeFontSize, setBadgeFontSize] = useState(12);
  const [svgFontFamily, setSvgFontFamily] = useState("Inter, sans-serif");
  const [tab, setTab] = useState<Tab>("overview");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [typeThemePreview, setTypeThemePreview] = useState<TypeName | null>(
    null,
  );
  const actual = typeName(actualType);
  const displayedType = typeThemePreview ?? actual;
  const accent = displayedType ? ACCENTS[displayedType] : ACCENTS.Reflector;
  const defined = new Set(definedCenters.map(normalizeCenter));
  const definedList = CENTER_KEYS.filter((center) => defined.has(center));
  const activeKeys = new Set(
    channels
      .filter((channel) => channel.gates.length >= 2)
      .map((channel) => bridgeKey(channel.gates[0], channel.gates[1])),
  );
  const bridges = CHANNEL_LATTICE.filter((row) =>
    activeKeys.has(bridgeKey(...row.gates)),
  );
  const selectedBridge =
    selection?.kind === "bridge"
      ? bridges.find((bridge) => bridgeKey(...bridge.gates) === selection.key)
      : undefined;
  const selectedCenter =
    selection?.kind === "center" ? selection.center : undefined;
  const heldGates = new Set(
    hangingGates.flatMap((hang) => (hang.held == null ? [] : [hang.held])),
  );
  const activated = new Set([
    ...activatedGates,
    ...personalityGates,
    ...designGates,
    ...Array.from(heldGates),
  ]);
  const personality = new Set(personalityGates);
  const design = new Set(designGates);
  const hanging = hangingGates.flatMap((hang) => {
    const { held, missing } = hang;
    if (
      held == null ||
      missing == null ||
      activeKeys.has(bridgeKey(held, missing))
    )
      return [];
    const dash = editorialHangingDash(held, missing);
    if (!dash) return [];
    const lattice = CHANNEL_LATTICE.find(
      (row) => bridgeKey(...row.gates) === bridgeKey(held, missing),
    );
    return [{ ...dash, held, missing, name: lattice?.name ?? "" }];
  });
  const hangingVisuals = hanging.filter((hang, index) => {
    if (!INTEGRATION_GATES.has(hang.held)) return true;
    const candidates = hanging
      .filter((item) => item.held === hang.held)
      .map((item) => item.missing);
    const preferred = preferIntegrationHangingMissing(hang.held, candidates);
    return (
      hang.missing === preferred &&
      hanging.findIndex(
        (item) => item.held === hang.held && item.missing === preferred,
      ) === index
    );
  });
  const endpoints = new Set(
    bridges.flatMap((row) => row.gates.map((gate) => GATE_TO_CENTER[gate])),
  );
  const selectedEndpoints = new Set(
    selectedBridge?.gates.map((gate) => GATE_TO_CENTER[gate]) ?? [],
  );
  const connectedGatePairs = selectedCenter
    ? bridges
        .filter((row) =>
          row.gates.some((gate) => GATE_TO_CENTER[gate] === selectedCenter),
        )
        .map((row) => row.gates.join("–"))
        .join(", ")
    : "";
  const connectedCenters = selectedCenter
    ? Array.from(
        new Set(
          bridges
            .filter((row) =>
              row.gates.some((gate) => GATE_TO_CENTER[gate] === selectedCenter),
            )
            .flatMap((row) => row.gates.map((gate) => GATE_TO_CENTER[gate]))
            .filter((center) => center !== selectedCenter),
        ),
      )
    : Array.from(selectedEndpoints);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    // next/font registers Inter under a generated family, not the literal name.
    setSvgFontFamily(getComputedStyle(document.body).fontFamily);
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0)
        setBadgeFontSize(editorialBadgeFontSize(entry.contentRect.width));
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);
  const clearSelection = () => {
    if (!selection) return;
    setSelection(null);
    selectionTrigger.current?.focus({ preventScroll: true });
  };
  useEffect(() => {
    if (!selection) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelection(null);
        selectionTrigger.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", escape);
    const frame = requestAnimationFrame(() => {
      const rect = svgRef.current
        ?.querySelector('[data-selected="true"]')
        ?.getBoundingClientRect();
      if (rect)
        window.scrollBy({
          top: rect.top + rect.height / 2 - window.innerHeight * 0.3,
          behavior: "instant",
        });
      peekRef.current?.focus({ preventScroll: true });
    });
    return () => {
      window.removeEventListener("keydown", escape);
      cancelAnimationFrame(frame);
    };
  }, [selection]);

  // Chart keys this module by person/view/query. Preview never survives a route
  // or person change; neither preview nor tabs write URL, storage or chart data.
  const centerOpacity = (center: CenterKey) => {
    if (selection)
      return center === selectedCenter || selectedEndpoints.has(center)
        ? 1
        : 0.18;
    if (tab === "overview") return 1;
    if (tab === "centers") return defined.has(center) ? 1 : 0.2;
    if (tab === "bridges") return endpoints.has(center) ? 1 : 0.2;
    return 0.2;
  };
  const bridgeOpacity = (key: string) =>
    selection
      ? selection.kind === "bridge" && selection.key === key
        ? 1
        : 0.18
      : tab === "overview" || tab === "bridges"
        ? 1
        : 0.2;
  const hangingOpacity = selection
    ? 0.18
    : tab === "overview" || tab === "hanging"
      ? 1
      : 0.2;
  const choose = (next: Selection, trigger: SVGElement | HTMLButtonElement) => {
    selectionTrigger.current = trigger;
    setSelection(next);
  };
  const bridgeLabel = (row: (typeof CHANNEL_LATTICE)[number]) =>
    `${row.gates.join("–")} · ${row.name}`;
  const bridgeTone = (gates: number[]) => {
    const p = gates.filter((gate) => personality.has(gate)).length;
    const d = gates.filter((gate) => design.has(gate)).length;
    return p > 0 && p === d ? "integrated" : d > p ? "somatic" : "conscious";
  };
  const navigate = async (domain: "centers" | "channels") => {
    setSelection(null);
    setTypeThemePreview(null);
    setPreviewOpen(false);
    await onDeepDive(domain);
    requestAnimationFrame(() => {
      if (!svgRef.current) return;
      const target =
        document.querySelector<HTMLElement>("#deep-dive h2") ??
        document.getElementById("deep-dive");
      if (!target) return;
      const previousTabIndex = target.getAttribute("tabindex");
      target.setAttribute("tabindex", "-1");
      target.addEventListener(
        "blur",
        () => {
          if (previousTabIndex === null) target.removeAttribute("tabindex");
          else target.setAttribute("tabindex", previousTabIndex);
        },
        { once: true },
      );
      target.focus({ preventScroll: true });
    });
  };
  const deepLink = (domain: "centers" | "channels") => (
    <a
      href={`#${domain}`}
      className="flex min-h-11 items-center border-t border-border py-3 text-sm font-medium text-growth-ink"
      onClick={(event) => {
        event.preventDefault();
        navigate(domain);
      }}
    >
      {t(
        domain === "centers"
          ? "chart.bodygraphModule.deepCenters"
          : "chart.bodygraphModule.deepBridges",
      )}
    </a>
  );

  return (
    <div
      className="editorial-bodygraph space-y-4"
      data-testid="chart-bodygraph-module"
      style={selection ? { paddingBottom: "40vh" } : undefined}
      onClick={(event) => {
        if (event.target === event.currentTarget) clearSelection();
      }}
    >
      <div
        className="relative rounded-2xl border bg-elevated p-4 pt-8"
        data-testid="bodygraph-type-card"
        style={{
          borderColor: accent[0],
          backgroundColor: `color-mix(in srgb, ${accent[1]} 35%, var(--elevated))`,
        }}
      >
        <button
          type="button"
          className="absolute right-3 top-2 text-[11px] text-fg-secondary"
          aria-expanded={previewOpen}
          aria-controls={`${id}-preview`}
          onClick={() => {
            setPreviewOpen(!previewOpen);
            setTypeThemePreview(null);
          }}
        >
          {t("chart.bodygraphModule.preview")} <span aria-hidden="true">⌄</span>
        </button>
        {displayedType ? (
          <>
            <h3 className="type-section text-fg">
              {t(
                `chart.bodygraphModule.type.${displayedType}.${personName ? "otherLead" : "youLead"}`,
                { name: personName ?? "" },
              )}
            </h3>
            <p className="mt-3 type-body text-fg-secondary">
              {t(
                `chart.bodygraphModule.type.${displayedType}.${personName ? "otherBody" : "youBody"}`,
                { name: personName ?? "" },
              )}
            </p>
          </>
        ) : (
          <h3 className="type-section text-fg">{actualType}</h3>
        )}
        <div aria-live="polite">
          {typeThemePreview && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-border bg-elevated px-2 py-1 type-caption text-fg">
                {t(
                  personName
                    ? "chart.bodygraphModule.previewOther"
                    : "chart.bodygraphModule.previewMine",
                )}
              </span>
              <button
                type="button"
                className="min-h-11 text-sm font-medium text-growth-ink underline underline-offset-4"
                onClick={() => {
                  setTypeThemePreview(null);
                  setPreviewOpen(false);
                }}
              >
                {t(
                  personName
                    ? "chart.bodygraphModule.resetOther"
                    : "chart.bodygraphModule.resetMine",
                  { name: personName ?? "" },
                )}
              </button>
            </div>
          )}
        </div>
        {previewOpen && (
          <div id={`${id}-preview`} className="mt-3 flex flex-wrap gap-2">
            {TYPES.filter((name) => name !== actual).map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={typeThemePreview === name}
                className="min-h-11 rounded-full border border-border bg-elevated px-3 py-2 text-xs text-fg"
                onClick={() => setTypeThemePreview(name)}
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      <svg
        ref={svgRef}
        viewBox="0 -36 240 594"
        className="block h-auto w-full"
        aria-label={t("chart.bodygraphModule.chartLabel")}
        style={{ fontFamily: svgFontFamily }}
        onClick={clearSelection}
      >
        <defs>
          <mask
            id={`${id}-outside-centers`}
            maskUnits="userSpaceOnUse"
            x="0"
            y="-36"
            width="240"
            height="594"
          >
            <rect x="0" y="-36" width="240" height="594" fill="white" />
            <g fill="black">
              {CENTER_KEYS.map((center) => {
                const geom = EDITORIAL_CENTERS[center];
                return (
                  <path
                    key={center}
                    d={centerPath(
                      geom.kind,
                      geom.cx,
                      geom.cy,
                      geom.s,
                      geom.tip,
                      6,
                    )}
                  />
                );
              })}
            </g>
          </mask>
        </defs>
        <g
          data-layer="drafting"
          pointerEvents="none"
          fill="none"
          stroke="#ddd8ce"
          opacity="0.3"
        >
          <path d={TORSO_PATH} transform="scale(1 1.5)" strokeWidth="0.6" />
          <path d="M120 -32 V548" strokeWidth="0.4" />
        </g>
        <g
          data-layer="tracks"
          mask={`url(#${id}-outside-centers)`}
          pointerEvents="none"
          fill="none"
          stroke="#e8e4da"
          strokeWidth="3"
          opacity={selection ? 0.18 : tab === "overview" ? 1 : 0.2}
        >
          {CHANNEL_LATTICE.map((row) => (
            <path
              key={bridgeKey(...row.gates)}
              d={editorialChannelPath(row.gates)}
            />
          ))}
        </g>
        <g
          data-layer="bridges"
          mask={`url(#${id}-outside-centers)`}
          pointerEvents="none"
          fill="none"
          strokeLinecap="round"
        >
          {bridges.map((row) => {
            const key = bridgeKey(...row.gates);
            const tone = bridgeTone(row.gates);
            return (
              <g
                key={key}
                opacity={bridgeOpacity(key)}
                data-selected={
                  selection?.kind === "bridge" && selection.key === key
                }
              >
                <path
                  className="bridge-ink"
                  d={editorialChannelPath(row.gates)}
                  pathLength="100"
                  strokeWidth="3"
                  stroke={tone === "somatic" ? "#8f4a3a" : "#1c201d"}
                />
                {tone === "integrated" && (
                  <path
                    d={editorialChannelPath(row.gates)}
                    pathLength="100"
                    stroke="#8f4a3a"
                    strokeWidth="3"
                    strokeDasharray="5 5"
                  />
                )}
              </g>
            );
          })}
        </g>
        <g
          data-layer="hanging"
          mask={`url(#${id}-outside-centers)`}
          pointerEvents="none"
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          opacity={hangingOpacity}
        >
          {hangingVisuals.map((hang) => (
            <path
              key={`${hang.held}-${hang.missing}`}
              d={editorialChannelPath(hang.gates)}
              pathLength="100"
              strokeDasharray={hang.dasharray}
              strokeDashoffset={hang.dashoffset}
              stroke={
                design.has(hang.held) && !personality.has(hang.held)
                  ? "#8f4a3a"
                  : "#1c201d"
              }
            />
          ))}
        </g>
        <g data-layer="centers" pointerEvents="none" strokeWidth="1.5">
          {CENTER_KEYS.map((center) => {
            const geom = EDITORIAL_CENTERS[center];
            const isDefined = defined.has(center);
            return (
              <g
                key={center}
                opacity={centerOpacity(center)}
                data-selected={selectedCenter === center}
                role="img"
                aria-label={`${displayCenter(center)} · ${t(isDefined ? "chart.bodygraphModule.defined" : "chart.bodygraphModule.open")}`}
              >
                <path
                  d={centerPath(
                    geom.kind,
                    geom.cx,
                    geom.cy,
                    geom.s,
                    geom.tip,
                    6,
                  )}
                  fill={
                    isDefined
                      ? MOTOR_CENTERS.has(center)
                        ? "#cbad80"
                        : "#4a6b53"
                      : "#f7f6f2"
                  }
                  stroke={isDefined ? "#5e645c" : "#ddd8ce"}
                />
                {(selectedCenter === center ||
                  (tab === "bridges" && endpoints.has(center))) && (
                  <path
                    d={centerPath(
                      geom.kind,
                      geom.cx,
                      geom.cy,
                      geom.s + 4,
                      geom.tip,
                      6,
                    )}
                    fill="none"
                    stroke="#3a5642"
                    strokeWidth={selectedCenter === center ? 2 : 1}
                  />
                )}
              </g>
            );
          })}
        </g>
        <g
          data-layer="badges"
          pointerEvents="none"
          fontFamily={svgFontFamily}
          fontWeight="600"
          fontSize={badgeFontSize}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {Object.keys(GATE_TO_CENTER)
            .map(Number)
            .map((gate) => {
              const point = editorialGateAnchor(gate);
              const center = GATE_TO_CENTER[gate];
              const opacity =
                tab === "hanging" && !selection
                  ? heldGates.has(gate)
                    ? 1
                    : 0.2
                  : centerOpacity(center);
              return (
                <text
                  key={gate}
                  x={point.x}
                  y={point.y}
                  opacity={opacity}
                  fill={editorialGateInk({
                    defined: defined.has(center),
                    motor: MOTOR_CENTERS.has(center),
                    activated: activated.has(gate),
                  })}
                  textDecoration={activated.has(gate) ? "underline" : "none"}
                  aria-label={t("chart.bodygraph.gateTitle", {
                    gate,
                    center: displayCenter(center),
                    origin: t(
                      personality.has(gate) && design.has(gate)
                        ? "chart.bodygraph.originBoth"
                        : personality.has(gate)
                          ? "chart.bodygraph.originPersonality"
                          : design.has(gate)
                            ? "chart.bodygraph.originDesign"
                            : activated.has(gate)
                              ? "chart.bodygraph.originActivated"
                              : "chart.bodygraphModule.inactiveGate",
                    ),
                  })}
                >
                  {gate}
                </text>
              );
            })}
        </g>
        <g data-layer="effects" pointerEvents="none" className="ink-effects">
          {selectedCenter && (
            <g
              key={selectedCenter}
              transform={`translate(${EDITORIAL_CENTERS[selectedCenter].cx} ${EDITORIAL_CENTERS[selectedCenter].cy})`}
            >
              {[0, 0.16, 0.32].map((delay) => (
                <circle
                  key={delay}
                  className="ink-ripple"
                  r="12"
                  fill="none"
                  stroke="#3a5642"
                  strokeWidth="0.6"
                  style={{ animationDelay: `${delay}s` }}
                />
              ))}
            </g>
          )}
          {selectedBridge && (
            <g
              key={bridgeKey(...selectedBridge.gates)}
              mask={`url(#${id}-outside-centers)`}
            >
              <circle r="2" fill="#6d4f2c">
                <animateMotion
                  dur="2.4s"
                  repeatCount="indefinite"
                  path={editorialChannelPath(selectedBridge.gates)}
                />
              </circle>
              {[0, 0.16].map((delay) => (
                <circle
                  key={delay}
                  className="ink-ripple"
                  r="4"
                  fill="none"
                  stroke="#6d4f2c"
                  strokeWidth="0.6"
                  style={{ animationDelay: `${delay}s` }}
                >
                  <animateMotion
                    dur="2.4s"
                    repeatCount="indefinite"
                    path={editorialChannelPath(selectedBridge.gates)}
                  />
                </circle>
              ))}
            </g>
          )}
        </g>
        <g data-layer="hitboxes" fill="transparent" stroke="transparent">
          {bridges.map((row) => (
            <path
              key={bridgeKey(...row.gates)}
              d={editorialChannelPath(row.gates)}
              strokeWidth="24"
              pointerEvents="stroke"
              role="button"
              tabIndex={0}
              aria-label={bridgeLabel(row)}
              aria-pressed={
                selection?.kind === "bridge" &&
                selection.key === bridgeKey(...row.gates)
              }
              onClick={(event) => {
                event.stopPropagation();
                choose(
                  { kind: "bridge", key: bridgeKey(...row.gates) },
                  event.currentTarget,
                );
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  choose(
                    { kind: "bridge", key: bridgeKey(...row.gates) },
                    event.currentTarget,
                  );
                }
              }}
            />
          ))}
          {definedList.map((center) => {
            const geom = EDITORIAL_CENTERS[center];
            return (
              <path
                key={center}
                d={centerPath(geom.kind, geom.cx, geom.cy, geom.s, geom.tip, 6)}
                strokeWidth="12"
                pointerEvents="all"
                role="button"
                tabIndex={0}
                aria-pressed={selectedCenter === center}
                aria-label={`${displayCenter(center)} · ${t("chart.bodygraphModule.defined")}`}
                onClick={(event) => {
                  event.stopPropagation();
                  choose({ kind: "center", center }, event.currentTarget);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    choose({ kind: "center", center }, event.currentTarget);
                  }
                }}
              />
            );
          })}
        </g>
      </svg>

      <div
        role="tablist"
        aria-label={t("chart.people.bodygraph")}
        className="grid grid-cols-4 border-b border-border"
      >
        {TABS.map((value, index) => (
          <button
            type="button"
            key={value}
            role="tab"
            id={`${id}-${value}-tab`}
            aria-selected={tab === value}
            aria-controls={`${id}-panel`}
            tabIndex={tab === value ? 0 : -1}
            className={`min-h-11 border-b-2 px-1 py-2 text-xs text-fg ${tab === value ? "border-growth font-semibold" : "border-transparent"}`}
            onClick={() => {
              setTab(value);
              setSelection(null);
            }}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowRight"
                  ? TABS[(index + 1) % TABS.length]
                  : event.key === "ArrowLeft"
                    ? TABS[(index + TABS.length - 1) % TABS.length]
                    : event.key === "Home"
                      ? TABS[0]
                      : event.key === "End"
                        ? TABS[3]
                        : null;
              if (next) {
                event.preventDefault();
                setTab(next);
                setSelection(null);
                document.getElementById(`${id}-${next}-tab`)?.focus();
              }
            }}
          >
            {t(`chart.bodygraphModule.${value}`)}
          </button>
        ))}
      </div>
      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-${tab}-tab`}
        className="type-body text-fg-secondary"
      >
        {tab === "overview" && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 type-caption">
            <span>● {t("chart.bodygraph.legendConscious")}</span>
            <span style={{ color: "#8f4a3a" }}>
              ● {t("chart.bodygraph.legendSomatic")}
            </span>
            <span>◐ {t("chart.bodygraph.legendIntegrated")}</span>
            <span>
              {t("chart.bodygraphModule.defined")} /{" "}
              {t("chart.bodygraphModule.open")}
            </span>
          </div>
        )}
        {tab === "centers" && (
          <>
            {definedList.length ? (
              <ul>
                {definedList.map((center) => (
                  <li key={center}>
                    <button
                      type="button"
                      className="min-h-11 w-full rounded-xl px-2 py-2 text-left text-fg hover:bg-sunken"
                      aria-pressed={selectedCenter === center}
                      onClick={(event) =>
                        choose({ kind: "center", center }, event.currentTarget)
                      }
                    >
                      {displayCenter(center)} ·{" "}
                      {t("chart.bodygraphModule.defined")}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3">{t("chart.bodygraphModule.noCenters")}</p>
            )}
            {deepLink("centers")}
          </>
        )}
        {tab === "bridges" && (
          <>
            {bridges.length ? (
              <ul>
                {bridges.map((row) => (
                  <li key={bridgeKey(...row.gates)}>
                    <button
                      type="button"
                      className="min-h-11 w-full rounded-xl px-2 py-2 text-left text-fg hover:bg-sunken"
                      aria-pressed={
                        selection?.kind === "bridge" &&
                        selection.key === bridgeKey(...row.gates)
                      }
                      onClick={(event) =>
                        choose(
                          { kind: "bridge", key: bridgeKey(...row.gates) },
                          event.currentTarget,
                        )
                      }
                    >
                      {bridgeLabel(row)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3">{t("chart.bodygraphModule.noBridges")}</p>
            )}
            {deepLink("channels")}
          </>
        )}
        {tab === "hanging" &&
          (hanging.length ? (
            <ul className="space-y-2 py-3">
              {hanging.map((hang) => (
                <li key={`${hang.held}-${hang.missing}`}>
                  {hang.held} → {hang.missing} · {hang.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-3">{t("chart.bodygraphModule.noHanging")}</p>
          ))}
      </div>
      <p className="type-caption text-fg-secondary">
        {t("chart.bodygraphModule.activatedMark")}
      </p>
      {selection && (
        <div
          ref={peekRef}
          tabIndex={-1}
          role="region"
          aria-labelledby={`${id}-peek-title`}
          data-testid="bodygraph-peek"
          className="peek-sheet fixed inset-x-0 bottom-0 z-40 h-[40vh] overflow-auto rounded-t-3xl border border-border bg-elevated p-5 shadow-soft outline-none"
        >
          <div className="mx-auto max-w-2xl">
            <div className="flex items-start justify-between gap-3">
              <h3 id={`${id}-peek-title`} className="type-section text-fg">
                {selectedCenter
                  ? `${displayCenter(selectedCenter)} · ${t("chart.bodygraphModule.defined")}`
                  : selectedBridge
                    ? bridgeLabel(selectedBridge)
                    : ""}
              </h3>
              <button
                type="button"
                className="min-h-11 shrink-0 px-2 text-sm text-fg-secondary"
                onClick={clearSelection}
              >
                {t("chart.bodygraphModule.close")}
              </button>
            </div>
            <p className="mt-2 type-body text-fg">
              {selectedCenter
                ? t(`chart.bodygraphModule.center.${selectedCenter}`)
                : selectedBridge &&
                    BRIDGE_SUMMARIES[bridgeKey(...selectedBridge.gates)]
                  ? t(BRIDGE_SUMMARIES[bridgeKey(...selectedBridge.gates)])
                  : ""}
            </p>
            <p className="mt-3 type-meta text-fg-secondary">
              {selectedCenter
                ? t("chart.bodygraphModule.centerConnections", {
                    gates:
                      connectedGatePairs ||
                      t("chart.bodygraphModule.noConnections"),
                    centers:
                      connectedCenters.map(displayCenter).join(" ↔ ") ||
                      t("chart.bodygraphModule.noConnections"),
                  })
                : selectedBridge
                  ? t("chart.bodygraphModule.connections", {
                      centers: connectedCenters.map(displayCenter).join(" ↔ "),
                      gates: selectedBridge.gates.join("–"),
                    })
                  : ""}
            </p>
            <a
              href={selectedCenter ? "#centers" : "#channels"}
              className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-growth px-4 py-2 text-sm font-medium text-fg-inverse"
              onClick={(event) => {
                event.preventDefault();
                navigate(selectedCenter ? "centers" : "channels");
              }}
            >
              {t(
                selectedCenter
                  ? "chart.bodygraphModule.deepCenters"
                  : "chart.bodygraphModule.deepBridges",
              )}
            </a>
          </div>
        </div>
      )}
      <style jsx>{`
        svg g,
        svg text {
          transition: opacity 220ms ease;
        }
        svg [role="button"] {
          cursor: pointer;
        }
        svg [role="button"]:focus-visible {
          outline: 2px solid #3a5642;
          outline-offset: 2px;
        }
        .bridge-ink {
          animation: ink-draw 900ms ease-out both;
        }
        .ink-ripple {
          transform-box: fill-box;
          transform-origin: center;
          animation: ink-ripple 1100ms ease-out both;
        }
        .peek-sheet {
          animation: paper-rise 220ms ease-out;
        }
        @keyframes ink-draw {
          from {
            stroke-dasharray: 0 100;
          }
          to {
            stroke-dasharray: 100 100;
          }
        }
        @keyframes ink-ripple {
          from {
            opacity: 0.65;
            scale: 1;
          }
          to {
            opacity: 0;
            scale: 3;
          }
        }
        @keyframes paper-rise {
          from {
            transform: translateY(12%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          svg g,
          svg text {
            transition: none;
          }
          .ink-effects {
            display: none;
          }
          .bridge-ink,
          .ink-ripple,
          .peek-sheet {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
