"use client";

import Link from "next/link";
import { Fragment, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { displayCenter, type CenterKey } from "@/lib/hdCopy";
import { joiningGateLinkLabel } from "@/lib/essays/joiningGateDeepDive";
import { useHdCopy } from "@/lib/essays/resolveHdCopy";
import { useI18n } from "@/lib/i18n";
import {
  CENTER_SHAPES,
  CHANNEL_NAMES,
  CHANNELS,
  CHANNEL_WEIGHT,
  CURVE_BY_KEY,
  FIGURE_VIEWBOX,
  GATES,
  GATE_TO_CENTER,
  HAIRLINE_WEIGHT,
  HANGING_WEIGHT,
  HD_PLANET_ORDER,
  PLANET_GLYPH,
  SILHOUETTE_D,
  VBW,
  BOTH_CASING_EXTRA,
  BOTH_CORE_WEIGHT,
  centerFamily,
  channelKey,
  definitionAreas,
  joiningGates,
  normCenter,
  pointsPath,
  roundedPolyPath,
  splitRoute,
  type GraphChannel,
} from "@/lib/bodygraphGeometryV2";
const styles = {
  card: "chart-v9",
  inner: "chart-v9-inner",
  eyebrow: "chart-v9-eyebrow",
  title: "chart-v9-title",
  titleType: "chart-v9-title-type",
  titleProfile: "chart-v9-title-profile",
  rule: "chart-v9-rule",
  sub: "chart-v9-sub",
  sky: "chart-v9-sky",
  figure: "chart-v9-figure",
  svg: "chart-v9-svg",
  center: "chart-v9-center",
  focus: "chart-v9-center-focus",
  inspector: "chart-v9-inspector",
  highlight: "chart-v9-highlight",
  pill: "chart-v9-pill",
  pillOpen: "chart-v9-pill-open",
  note: "chart-v9-note",
  kicker: "chart-v9-kicker",
  grid: "chart-v9-grid",
  item: "chart-v9-item",
  name: "chart-v9-name",
  hint: "chart-v9-hint",
  swatch: "chart-v9-swatch",
  defined: "chart-v9-defined",
  open: "chart-v9-open",
  chip: "chart-v9-chip",
  chipP: "chart-v9-chip-p",
  chipD: "chart-v9-chip-d",
  chipBoth: "chart-v9-chip-both",
  bar: "chart-v9-bar",
  barD: "chart-v9-bar-d",
  barP: "chart-v9-bar-p",
  barBoth: "chart-v9-bar-both",
  barBothCore: "chart-v9-bar-both-core",
  barHang: "chart-v9-bar-hang",
  join: "chart-v9-join",
} as const;

type Activation = {
  planet?: unknown;
  gate?: unknown;
  line?: unknown;
  label?: unknown;
};

export type ChartBodygraphProps = {
  definedCenters: string[];
  channels: GraphChannel[];
  activatedGates?: number[];
  hangingGates?: Array<{ held?: number; missing?: number; channel?: string }>;
  personalityGates?: number[];
  designGates?: number[];
  personality?: Activation[];
  design?: Activation[];
  typeName?: string;
  profile?: string;
  authority?: string;
  definition?: string;
  /** A real first name or friend label. Empty means the self chart. */
  ownerName?: string;
  /** Sits under the figure and above the legend. Chart keeps one Type box here. */
  afterSvg?: ReactNode;
  /** Controlled center for the inspector. Omit to keep selection inside this card. */
  selectedCenter?: string | null;
  onSelectCenter?: (center: string | null) => void;
  /** "Read more in Deep dive" for the open inspector. */
  onInspectDeepDive?: (center: string) => void;
  /** Split-note joining gate. Opens Deep dive Definition. */
  onOpenJoiningGate?: () => void;
  className?: string;
};

const GLYPH_FONT = '"DejaVu Sans", "Apple Symbols", "Segoe UI Symbol", "Noto Sans Symbols", sans-serif';

function nums(values: number[] | undefined): number[] {
  return (values || []).map(Number).filter((n) => Number.isFinite(n) && n > 0);
}

function authorityShort(authority: string): string {
  if (authority.startsWith("Emotional")) return "Emotional";
  if (authority.startsWith("Mental")) return "Mental";
  if (authority.startsWith("Ego")) return "Ego";
  if (authority.startsWith("None")) return "Lunar";
  return authority;
}

function gateLine(row: Activation): { gate: string; line: string } | null {
  const label = String(row.label ?? "");
  if (label.includes(".")) {
    const [gate, line] = label.split(".");
    if (gate) return { gate, line: line || "" };
  }
  const gate = Number(row.gate);
  const line = Number(row.line);
  if (!Number.isFinite(gate) || gate <= 0) return null;
  return { gate: String(gate), line: Number.isFinite(line) ? String(line) : "" };
}

export function ChartBodygraph({
  definedCenters,
  channels,
  activatedGates = [],
  hangingGates = [],
  personalityGates,
  designGates,
  personality = [],
  design = [],
  typeName = "",
  profile = "",
  authority = "",
  definition = "",
  ownerName,
  afterSvg,
  selectedCenter,
  onSelectCenter,
  onInspectDeepDive,
  onOpenJoiningGate,
  className = "",
}: ChartBodygraphProps) {
  const { t } = useI18n();
  const uid = useId().replace(/:/g, "");
  const [focusCenter, setFocusCenter] = useState<string | null>(null);
  const [internalCenter, setInternalCenter] = useState<string | null>(null);
  const centerPathRefs = useRef<Record<string, SVGPathElement | null>>({});
  const previousCenter = useRef<string | null>(null);
  const selectRef = useRef<(next: string | null) => void>(() => {});
  const controlled = selectedCenter !== undefined;
  const activeCenter = (controlled ? selectedCenter : internalCenter) ?? null;
  const select = (next: string | null) => {
    if (!controlled) setInternalCenter(next);
    onSelectCenter?.(next);
  };
  selectRef.current = select;
  const activate = (key: string) => {
    select(activeCenter === key ? null : key);
  };

  useEffect(() => {
    const previous = previousCenter.current;
    previousCenter.current = activeCenter;
    if (previous && !activeCenter) centerPathRefs.current[previous]?.focus();
  }, [activeCenter]);

  useEffect(() => {
    if (!activeCenter) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      selectRef.current(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeCenter]);

  const personalitySet = useMemo(() => new Set(nums(personalityGates)), [personalityGates]);
  const designSet = useMemo(() => new Set(nums(designGates)), [designGates]);
  const activated = useMemo(() => {
    const set = new Set(nums(activatedGates));
    personalitySet.forEach((g) => set.add(g));
    designSet.forEach((g) => set.add(g));
    return set;
  }, [activatedGates, personalitySet, designSet]);

  const defined = useMemo(() => new Set(definedCenters.map(normCenter)), [definedCenters]);
  const areas = useMemo(() => definitionAreas(definedCenters, channels), [definedCenters, channels]);
  const joins = useMemo(
    () => joiningGates(definedCenters, channels, Array.from(activated)),
    [definedCenters, channels, activated],
  );
  const joinSet = useMemo(() => new Set(joins.map((j) => j.gate)), [joins]);

  const nameByKey = useMemo(() => {
    const map = new Map<string, string>();
    for (const ch of channels) {
      if (ch.gates && ch.gates.length >= 2 && ch.name) {
        map.set(channelKey(Number(ch.gates[0]), Number(ch.gates[1])), ch.name);
      }
    }
    return map;
  }, [channels]);

  const hangingName = useMemo(() => {
    const map = new Map<string, string>();
    for (const h of hangingGates) {
      if (h.held && h.missing) map.set(channelKey(Number(h.held), Number(h.missing)), h.channel || "");
    }
    return map;
  }, [hangingGates]);

  function ownerOf(gates: number[]): "both" | "p" | "d" {
    const p = gates.some((g) => personalitySet.has(g));
    const d = gates.some((g) => designSet.has(g));
    if (p && d) return "both";
    if (d && !p) return "d";
    return "p";
  }

  const lanes = (rows: Activation[], side: "design" | "personality") => {
    const byPlanet = new Map<string, Activation>();
    for (const row of rows) {
      const planet = String(row.planet || "");
      if (planet) byPlanet.set(planet, row);
    }
    const left = side === "design";
    const x = left ? 14 : VBW - 14;
    const head = left ? "DESIGN" : "PERSONALITY";
    const headFill = left ? "var(--v9-clay-chip)" : "var(--v9-fg)";
    const glyphFill = headFill;
    const out: ReactNode[] = [
      <text
        key="h"
        x={x}
        y={20}
        fontSize={8.6}
        fontWeight={700}
        letterSpacing={2.1}
        fill={headFill}
        textAnchor={left ? "start" : "end"}
      >
        {head}
      </text>,
      <line
        key="r"
        x1={left ? x : x - 22}
        x2={left ? x + 22 : x}
        y1={28}
        y2={28}
        stroke={headFill}
        strokeOpacity={0.55}
        strokeWidth={1}
      />,
    ];
    let y = 48;
    for (const planet of HD_PLANET_ORDER) {
      const row = byPlanet.get(planet);
      const parts = row ? gateLine(row) : null;
      if (!parts) {
        y += 19;
        continue;
      }
      const glyph = PLANET_GLYPH[planet] || "";
      if (left) {
        out.push(
          <text key={`${planet}-g`} x={x + 6} y={y} fontSize={12} fill={glyphFill} textAnchor="middle" fontFamily={GLYPH_FONT}>
            {glyph}
          </text>,
          <text key={`${planet}-v`} x={x + 20} y={y} fontSize={11.6} fill="var(--v9-fg)">
            <tspan fontWeight={650}>{parts.gate}</tspan>
            <tspan fill="var(--v9-fg2)" fontWeight={400}>
              .{parts.line}
            </tspan>
          </text>,
        );
      } else {
        out.push(
          <text key={`${planet}-v`} x={x - 20} y={y} fontSize={11.6} fill="var(--v9-fg)" textAnchor="end">
            <tspan fontWeight={650}>{parts.gate}</tspan>
            <tspan fill="var(--v9-fg2)" fontWeight={400}>
              .{parts.line}
            </tspan>
          </text>,
          <text key={`${planet}-g`} x={x - 6} y={y} fontSize={12} fill={glyphFill} textAnchor="middle" fontFamily={GLYPH_FONT}>
            {glyph}
          </text>,
        );
      }
      y += 19;
    }
    return out;
  };

  const hair: ReactNode[] = [];
  const bridges: ReactNode[] = [];
  const defs: ReactNode[] = [];
  let grad = 0;

  for (const [a, b] of CHANNELS) {
    const key = channelKey(a, b);
    const curve = CURVE_BY_KEY[key];
    if (!curve) continue;
    const onA = activated.has(a);
    const onB = activated.has(b);
    const title = nameByKey.get(key) || hangingName.get(key) || CHANNEL_NAMES[key] || "";
    if (!(onA && onB)) {
      hair.push(
        <path
          key={`hair-${key}`}
          d={curve.d}
          stroke="var(--v9-hair)"
          strokeOpacity="var(--v9-hair-op)"
          strokeWidth={HAIRLINE_WEIGHT}
        />,
      );
    }
    if (onA && onB) {
      const own = ownerOf([a, b]);
      const label = title ? `${a}–${b} ${title}` : `${a}–${b}`;
      if (own === "both") {
        bridges.push(
          <path key={`c-${key}`} d={curve.d} stroke="var(--v9-clay)" strokeWidth={CHANNEL_WEIGHT + BOTH_CASING_EXTRA}>
            <title>{label}</title>
          </path>,
          <path key={`k-${key}`} d={curve.d} stroke="var(--v9-ink)" strokeWidth={BOTH_CORE_WEIGHT} />,
        );
      } else {
        bridges.push(
          <path
            key={`f-${key}`}
            d={curve.d}
            stroke={own === "d" ? "var(--v9-clay)" : "var(--v9-ink)"}
            strokeWidth={CHANNEL_WEIGHT}
          >
            <title>{label}</title>
          </path>,
        );
      }
    } else if (onA || onB) {
      const held = onA ? a : b;
      const [first, second] = splitRoute(curve.samples);
      const half = onA ? first : [...second].reverse();
      const own = ownerOf([held]);
      const d = pointsPath(half);
      const start = half[0];
      const end = half[half.length - 1];
      const paint = (color: string, width: number, suffix: string) => {
        const id = `${uid}f${grad++}${suffix}`;
        defs.push(
          <linearGradient
            key={id}
            id={id}
            gradientUnits="userSpaceOnUse"
            x1={start[0]}
            y1={start[1]}
            x2={end[0]}
            y2={end[1]}
          >
            <stop offset="0" stopColor={color} />
            <stop offset="0.62" stopColor={color} />
            <stop offset="1" stopColor={color} stopOpacity={0} />
          </linearGradient>,
        );
        bridges.push(
          <path key={`${id}-p`} d={d} stroke={`url(#${id})`} strokeWidth={width}>
            <title>
              {t("chart.bodygraph.hangingTitle", { held, missing: onA ? b : a })}
            </title>
          </path>,
        );
      };
      if (own === "both") {
        paint("var(--v9-clay)", CHANNEL_WEIGHT - 0.8, "c");
        paint("var(--v9-ink)", 2.4, "k");
      } else {
        paint(own === "d" ? "var(--v9-clay)" : "var(--v9-ink)", HANGING_WEIGHT, "h");
      }
      if (joinSet.has(onA ? b : a)) {
        bridges.push(
          <path
            key={`join-${key}`}
            d={curve.d}
            stroke="var(--v9-growth)"
            strokeWidth={1.6}
            strokeDasharray="4 4"
          />,
        );
      }
    }
  }

  const areaLabels = areas.map((area) => area.map((c) => displayCenter(c)).join(" + "));
  const andWord = t("chart.v9.and");
  const areasText =
    areaLabels.length <= 1
      ? areaLabels[0] || ""
      : areaLabels.length === 2
        ? `${areaLabels[0]}, ${andWord} ${areaLabels[1]}`
        : `${areaLabels.slice(0, -1).join(", ")}, ${andWord} ${areaLabels[areaLabels.length - 1]}`;
  const areaCountKey =
    areas.length <= 2 ? "chart.v9.areasTwo" : areas.length === 3 ? "chart.v9.areasThree" : areas.length === 4 ? "chart.v9.areasFour" : "chart.v9.areasMany";
  const splitAreas =
    areas.length >= 2 ? t(areaCountKey, { areas: areasText, n: String(areas.length) }) : "";

  const focusDefined = focusCenter ? defined.has(focusCenter) : false;
  const name = (ownerName || "").trim();

  return (
    <section className={`${styles.card} ${className}`.trim()} data-testid="chart-bodygraph-v9">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>
          {name ? t("chart.v9.eyebrowNamed", { name }) : t("chart.v9.eyebrowYours")}
        </p>
        <h2 className={styles.title}>
          <span className={styles.titleType}>{typeName}</span>
          {profile ? <span className={styles.titleProfile}>{profile}</span> : null}
        </h2>
        <span className={styles.rule} aria-hidden="true" />
        <p className={styles.sub}>
          <span>
            {t("chart.v9.authorityLine", {
              authority: authorityShort(authority),
              definition,
            })}
          </span>
          <Link href="/transits" className={styles.sky}>
            {t("chart.v9.todaySky")} ›
          </Link>
        </p>

        <div className={styles.figure}>
          <svg
            viewBox={FIGURE_VIEWBOX}
            className={styles.svg}
            role="img"
            aria-label={t("chart.v9.aria")}
            fontFamily="inherit"
          >
            <title>{t("chart.v9.aria")}</title>
            <defs>
              <linearGradient id={`${uid}silf`} x1="0" y1="0" x2="0" y2="800" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="var(--v9-sil-fill)" stopOpacity="var(--v9-sil-top)" />
                <stop offset="0.84" stopColor="var(--v9-sil-fill)" stopOpacity="var(--v9-sil-mid)" />
                <stop offset="1" stopColor="var(--v9-sil-fill)" stopOpacity="0" />
              </linearGradient>
              <linearGradient id={`${uid}sill`} x1="0" y1="0" x2="0" y2="800" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="var(--v9-sil-line)" stopOpacity="var(--v9-sil-line-op)" />
                <stop offset="0.97" stopColor="var(--v9-sil-line)" stopOpacity="var(--v9-sil-line-op)" />
                <stop offset="1" stopColor="var(--v9-sil-line)" stopOpacity="0" />
              </linearGradient>
              <filter id={`${uid}sh`} x="-25%" y="-25%" width="150%" height="150%">
                <feDropShadow dx="0" dy="2.4" stdDeviation="3.2" floodColor="var(--v9-shadow)" floodOpacity="var(--v9-shadow-op)" />
              </filter>
              <filter id={`${uid}cs`} x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="0.8" stdDeviation="0.9" floodColor="#000" floodOpacity="var(--v9-chip-shadow-op)" />
              </filter>
              {(["sage", "clay", "sand", "open"] as const).map((fam) => (
                <linearGradient key={fam} id={`${uid}${fam}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={`var(--v9-${fam}-top)`} />
                  <stop offset="1" stopColor={fam === "clay" ? "var(--v9-clay-fill)" : `var(--v9-${fam})`} />
                </linearGradient>
              ))}
              {defs}
            </defs>

            <path
              d={SILHOUETTE_D}
              fill={`url(#${uid}silf)`}
              stroke={`url(#${uid}sill)`}
              strokeWidth={1.65}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              {hair}
              {bridges}
            </g>

            {Object.entries(CENTER_SHAPES).map(([key, pts]) => {
              const isDef = defined.has(key);
              const fam = isDef ? centerFamily(key) : "open";
              const d = roundedPolyPath(pts, 13);
              const label = isDef
                ? t("chart.bodygraph.definedCenter", { center: displayCenter(key) })
                : t("chart.bodygraph.openCenter", { center: displayCenter(key) });
              return (
                <g key={key}>
                  <path
                    className={styles.center}
                    d={d}
                    fill={`url(#${uid}${fam})`}
                    stroke={isDef ? `var(--v9-${fam}-stroke)` : "var(--v9-open-stroke)"}
                    strokeWidth={isDef ? 1.1 : 0.9}
                    filter={isDef ? `url(#${uid}sh)` : undefined}
                    tabIndex={0}
                    role="button"
                    aria-label={label}
                    aria-pressed={activeCenter === key}
                    ref={(node) => {
                      centerPathRefs.current[key] = node;
                    }}
                    onMouseEnter={() => setFocusCenter(key)}
                    onMouseLeave={() => setFocusCenter((c) => (c === key ? null : c))}
                    onFocus={() => setFocusCenter(key)}
                    onBlur={() => setFocusCenter((c) => (c === key ? null : c))}
                    onClick={() => activate(key)}
                    onKeyDown={(event) => {
                      if (event.key !== "Enter" && event.key !== " ") return;
                      event.preventDefault();
                      activate(key);
                    }}
                  >
                    <title>{label}</title>
                  </path>
                  <path
                    className={styles.focus}
                    d={d}
                    fill="none"
                    stroke="var(--focus)"
                    strokeWidth={2.2}
                    pointerEvents="none"
                    aria-hidden="true"
                  />
                  {isDef ? (
                    <path className={styles.highlight} d={d} fill="none" strokeWidth={0.8} transform="translate(0,0.9)" />
                  ) : null}
                </g>
              );
            })}

            <g textAnchor="middle" fontWeight={600} style={{ fontVariantNumeric: "tabular-nums" }}>
              {Object.entries(GATES).map(([id, [x, y]]) => {
                const gate = Number(id);
                const p = personalitySet.has(gate);
                const d = designSet.has(gate);
                if (!p && !d && !activated.has(gate)) {
                  if (!joinSet.has(gate)) return null;
                  return (
                    <g key={gate}>
                      <circle cx={x} cy={y} r={9.6} fill="var(--v9-bg)" stroke="var(--v9-growth)" strokeWidth={1.6} strokeDasharray="3 2.4" />
                      <text x={x} y={y} fontSize={9.8} fill="var(--v9-growth)" dominantBaseline="central">
                        {gate}
                      </text>
                    </g>
                  );
                }
                const origin =
                  p && d
                    ? t("chart.bodygraph.originBoth")
                    : p
                      ? t("chart.bodygraph.originPersonality")
                      : d
                        ? t("chart.bodygraph.originDesign")
                        : t("chart.bodygraph.originActivated");
                const center = GATE_TO_CENTER[gate];
                const title = center
                  ? t("chart.bodygraph.gateTitle", { gate, center: displayCenter(center), origin })
                  : t("chart.bodygraph.gateTitleNoCenter", { gate, origin });
                if (p && d) {
                  return (
                    <g key={gate} filter={`url(#${uid}cs)`}>
                      <circle cx={x} cy={y} r={10.6} fill="var(--v9-clay-chip)" stroke="var(--v9-bg)" strokeWidth={1.4} />
                      <circle cx={x} cy={y} r={7.4} fill="var(--v9-ink)" />
                      <text x={x} y={y} fontSize={9.6} fill="var(--v9-ink-text)" dominantBaseline="central">
                        <title>{title}</title>
                        {gate}
                      </text>
                    </g>
                  );
                }
                const designChip = d && !p;
                return (
                  <g key={gate} filter={`url(#${uid}cs)`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={10.6}
                      fill={designChip ? "var(--v9-clay-chip)" : "var(--v9-ink)"}
                      stroke="var(--v9-bg)"
                      strokeWidth={1.4}
                    />
                    <text
                      x={x}
                      y={y}
                      fontSize={10.4}
                      fill={designChip ? "var(--v9-clay-text)" : "var(--v9-ink-text)"}
                      dominantBaseline="central"
                    >
                      <title>{title}</title>
                      {gate}
                    </text>
                  </g>
                );
              })}
            </g>

            <g>{lanes(design, "design")}</g>
            <g>{lanes(personality, "personality")}</g>
          </svg>
          {focusCenter ? (
            <div className={`${styles.pill} ${focusDefined ? "" : styles.pillOpen}`} aria-live="polite">
              {focusDefined ? t("chart.deepDive.defined") : t("chart.deepDive.open")} · {displayCenter(focusCenter)}
            </div>
          ) : null}
        </div>

        {activeCenter ? (
          <ChartCenterInspector
            centerKey={activeCenter}
            defined={defined.has(activeCenter)}
            personName={name}
            onClose={() => select(null)}
            onDeepDive={() => onInspectDeepDive?.(activeCenter)}
          />
        ) : null}

        {afterSvg}

        {splitAreas ? (
          <p className={styles.note}>
            {splitAreas}{" "}
            {joins.length ? (
              <WouldJoinSentence gates={joins.map((join) => join.gate)} onOpen={onOpenJoiningGate} />
            ) : (
              t("chart.v9.splitNoJoin")
            )}
          </p>
        ) : null}

        <h3 className={styles.kicker}>{t("chart.v9.centers")}</h3>
        <div className={styles.grid}>
          <LegendItem swatch={<span className={`${styles.swatch} ${styles.defined}`} />} name={t("chart.v9.defined")} hint={t("chart.v9.definedHint")} />
          <LegendItem swatch={<span className={`${styles.swatch} ${styles.open}`} />} name={t("chart.v9.open")} hint={t("chart.v9.openHint")} />
        </div>

        <h3 className={styles.kicker}>{t("chart.v9.yourGates")}</h3>
        <div className={styles.grid}>
          <LegendItem swatch={<span className={`${styles.chip} ${styles.chipP}`}>55</span>} name="Personality" hint={t("chart.v9.personalityHint")} />
          <LegendItem swatch={<span className={`${styles.chip} ${styles.chipD}`}>9</span>} name="Design" hint={t("chart.v9.designHint")} />
          <LegendItem swatch={<span className={`${styles.chip} ${styles.chipBoth}`}>43</span>} name={t("chart.v9.both")} hint={t("chart.v9.bothHint")} />
        </div>

        <h3 className={styles.kicker}>{t("chart.v9.bridges")}</h3>
        <div className={styles.grid}>
          <LegendItem swatch={<span className={`${styles.bar} ${styles.barD}`} />} name={t("chart.v9.designBridge")} hint={t("chart.v9.gateToGate")} />
          <LegendItem swatch={<span className={`${styles.bar} ${styles.barP}`} />} name={t("chart.v9.personalityBridge")} hint={t("chart.v9.gateToGate")} />
          <LegendItem
            swatch={
              <span className={`${styles.bar} ${styles.barBoth}`}>
                <span className={styles.barBothCore} />
              </span>
            }
            name={t("chart.v9.both")}
            hint={t("chart.v9.bothBridgeHint")}
          />
          <LegendItem swatch={<span className={`${styles.bar} ${styles.barHang}`} />} name={t("chart.v9.hangingGate")} hint={t("chart.v9.hangingHint")} />
          <LegendItem swatch={<span className={styles.join} />} name={t("chart.v9.joiningGate")} hint={t("chart.v9.joiningHint")} />
        </div>
      </div>
    </section>
  );
}

function JoiningGateLink({
  gate,
  onOpen,
  children,
}: {
  gate: number;
  onOpen?: () => void;
  children: ReactNode;
}) {
  const { locale } = useI18n();
  return (
    <a
      href="#deep-dive-definition"
      data-testid={`chart-v9-joining-gate-${gate}`}
      aria-label={joiningGateLinkLabel(locale, gate)}
      onClick={(event) => {
        if (!onOpen) return;
        event.preventDefault();
        onOpen();
      }}
      onKeyDown={(event) => {
        if (event.key !== " " || !onOpen) return;
        event.preventDefault();
        onOpen();
      }}
    >
      {children}
    </a>
  );
}

/** Each gate number is its own link. Visible wording stays chart.v9.splitWouldJoin. */
function WouldJoinSentence({ gates, onOpen }: { gates: number[]; onOpen?: () => void }) {
  const { t } = useI18n();
  const parts = t("chart.v9.splitWouldJoin", { gates: "\u0000" }).split("\u0000");
  const before = parts[0] ?? "";
  const after = parts[1] ?? "";
  if (gates.length === 1) {
    const gate = gates[0];
    return (
      <>
        <JoiningGateLink gate={gate} onOpen={onOpen}>
          {before}
          {gate}
        </JoiningGateLink>
        {after}
      </>
    );
  }
  return (
    <>
      {before}
      {gates.map((gate, index) => (
        <Fragment key={`${gate}-${index}`}>
          {index > 0 ? ", " : null}
          <JoiningGateLink gate={gate} onOpen={onOpen}>
            {gate}
          </JoiningGateLink>
        </Fragment>
      ))}
      {after}
    </>
  );
}

function ChartCenterInspector({
  centerKey,
  defined,
  personName,
  onClose,
  onDeepDive,
}: {
  centerKey: string;
  defined: boolean;
  personName: string;
  onClose: () => void;
  onDeepDive: () => void;
}) {
  const { t } = useI18n();
  const { CENTER_COPY } = useHdCopy();
  const titleId = useId();
  const copy = CENTER_COPY[centerKey as CenterKey];
  if (!copy) return null;
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      data-testid="chart-center-inspector"
      className={`${styles.inspector} mt-4 rounded-2xl border border-border bg-elevated p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="type-caption uppercase tracking-wide text-fg-muted">
            {defined ? t("chart.deepDive.defined") : t("chart.deepDive.open")}
          </p>
          <h3 id={titleId} className="mt-1 font-semibold text-fg">
            {displayCenter(centerKey)}
          </h3>
        </div>
        <button
          type="button"
          aria-label={t("literacy.chrome.close")}
          onClick={onClose}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-fg hover:bg-sunken"
        >
          <span aria-hidden="true">×</span>
        </button>
      </div>
      <p className={`mt-2 text-xs ${defined ? "text-growth" : "text-fg-muted"}`}>
        {defined ? t("chart.deepDive.definedConsistent") : t("chart.deepDive.openAmplifies")}
      </p>
      <p className="mt-2 type-body text-fg-secondary">{defined ? copy.defined : copy.open}</p>
      <p className="mt-2 text-xs text-fg-muted">{t("chart.deepDive.bodyHint", { hint: copy.bodyHint })}</p>
      {personName ? (
        <p className="mt-3 text-xs text-fg-secondary">{t("chart.deepDive.otherPersonNote", { name: personName })}</p>
      ) : null}
      <button
        type="button"
        data-testid="chart-center-inspector-deep-dive"
        onClick={onDeepDive}
        className="mt-3 inline-flex min-h-11 items-center gap-1 type-caption text-growth underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        {t("chart.people.readMoreInDeepDive")}
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

function LegendItem({ swatch, name, hint }: { swatch: ReactNode; name: string; hint: string }) {
  return (
    <div className={styles.item}>
      {swatch}
      <div>
        <div className={styles.name}>{name}</div>
        <div className={styles.hint}>{hint}</div>
      </div>
    </div>
  );
}
