"use client";

import { useState } from "react";
import { displayCenter } from "@/lib/hdCopy";
import {
  CENTER_GEOM,
  CENTER_LABELS,
  CHANNEL_LATTICE,
  GATE_CHIP_R,
  GATE_TO_CENTER,
  INTEGRATION_GATES,
  MOTOR_CENTERS,
  TORSO_PATH,
  VB,
  channelEndpoints,
  channelPathD,
  centerPath,
  gateAnchor,
  hangingHalfChannelDash,
  preferIntegrationHangingMissing,
  type CenterKey,
} from "@/lib/bodygraphGeometry";

export type BodyGraphChannel = {
  gates: [number, number] | number[];
  name?: string;
  centers?: string[];
};

export type BodyGraphProps = {
  definedCenters: string[];
  channels: BodyGraphChannel[];
  activatedGates?: number[];
  hangingGates?: Array<{ held?: number; missing?: number; channel?: string }>;
  /** Personality (conscious) gate numbers — Obsidian strokes/chips when set. */
  personalityGates?: number[];
  /** Design (unconscious) gate numbers — Terracotta strokes/chips when set. */
  designGates?: number[];
  /**
   * When true, paint center name labels and dim gate chips (~0.15).
   * Default false — names live on hover/focus pill only (zero label clutter).
   */
  showLabels?: boolean;
  className?: string;
};

/** Bodygraph palette — chips/channels pop on every center fill. */
const OBSIDIAN = "#1A1A1A"; // Conscious (Personality)
const TERRACOTTA = "#C45B38"; // Somatic (Design)
const ALABASTER = "#F5F2EB"; // Open centers
const OPEN_BORDER = "#CFC9BC";
const TRACK = "#D8D3C8"; // Inactive channel tracks
const LINEN = "#F7F6F2";
const CREAM_STROKE = "#FAF8F5";
const SAGE = "#3F624D"; // Defined non-motors
const MOTOR_FILL = "#D9B89C"; // Defined motors (amber/sand — not terracotta)
const MOTOR_BORDER = "#8C583A";

function norm(c: string): CenterKey | string {
  const map: Record<string, CenterKey> = {
    Solar_Plexus: "Solar_Plexus",
    "Solar Plexus": "Solar_Plexus",
    Ego: "Heart",
    "Ego / Heart": "Heart",
    Heart: "Heart",
    "G / Identity": "G",
    Identity: "G",
  };
  return map[c] || (c.replace(" ", "_") as CenterKey);
}

function gateKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

type ChipTone = "obsidian" | "terracotta" | "dual";

function chipToneForGate(
  gate: number,
  personality: Set<number>,
  design: Set<number>,
  hasSplit: boolean
): ChipTone {
  if (!hasSplit) return "obsidian";
  const p = personality.has(gate);
  const d = design.has(gate);
  if (p && d) return "dual";
  if (p) return "obsidian";
  if (d) return "terracotta";
  return "obsidian";
}

/**
 * Channel stroke from personality/design gate ownership.
 * Both personality → Obsidian; both design → Terracotta;
 * mixed → dual parallel strokes; no split data → Obsidian fallback.
 */
function channelStrokeKind(
  g0: number,
  g1: number,
  personality: Set<number>,
  design: Set<number>,
  hasSplit: boolean
): "personality" | "design" | "split" {
  if (!hasSplit) return "personality";
  const p0 = personality.has(g0);
  const p1 = personality.has(g1);
  const d0 = design.has(g0);
  const d1 = design.has(g1);
  const pScore = (p0 ? 1 : 0) + (p1 ? 1 : 0);
  const dScore = (d0 ? 1 : 0) + (d1 ? 1 : 0);
  if (pScore > 0 && dScore > 0 && pScore === dScore) return "split";
  if (dScore > pScore) return "design";
  return "personality";
}

export function BodyGraph({
  definedCenters,
  channels,
  activatedGates = [],
  hangingGates = [],
  personalityGates,
  designGates,
  showLabels = false,
  className = "",
}: BodyGraphProps) {
  const defined = new Set(definedCenters.map((c) => norm(c) as string));
  const activated = new Set(activatedGates);
  const personality = new Set(personalityGates || []);
  const design = new Set(designGates || []);
  const hasSplit = personality.size > 0 || design.size > 0;
  const [focusCenter, setFocusCenter] = useState<CenterKey | null>(null);

  const activeKeySet = new Set(
    channels.map((ch) => {
      const g = ch.gates;
      if (!g || g.length < 2) return "";
      return gateKey(Number(g[0]), Number(g[1]));
    })
  );

  const nameByKey = new Map<string, string>();
  for (const row of CHANNEL_LATTICE) {
    nameByKey.set(gateKey(row.gates[0], row.gates[1]), row.name);
  }
  for (const ch of channels) {
    if (ch.gates?.length >= 2 && ch.name) {
      nameByKey.set(gateKey(Number(ch.gates[0]), Number(ch.gates[1])), ch.name);
    }
  }

  const activePaths = channels
    .map((ch, i) => {
      if (!ch.gates || ch.gates.length < 2) return null;
      const g0 = Number(ch.gates[0]);
      const g1 = Number(ch.gates[1]);
      const d = channelPathD([g0, g1]);
      const ep = channelEndpoints([g0, g1]);
      if (!d || !ep) return null;
      const name = ch.name || nameByKey.get(gateKey(g0, g1)) || "";
      const stroke = channelStrokeKind(g0, g1, personality, design, hasSplit);
      return {
        key: `act-${i}-${g0}-${g1}`,
        d,
        ep,
        name,
        gates: [g0, g1] as [number, number],
        stroke,
        title: name ? `Channel ${g0}–${g1}: ${name}` : `Channel ${g0}–${g1}`,
      };
    })
    .filter(Boolean) as Array<{
    key: string;
    d: string;
    ep: { x1: number; y1: number; x2: number; y2: number };
    name: string;
    gates: [number, number];
    stroke: "personality" | "design" | "split";
    title: string;
  }>;

  // Hanging half-channels: SAME lattice `d` + pathLength dash (no invented sticks).
  // Integration multi-gates: collapse to one trunk-oriented hang (no 3 tentacles).
  const hangingRaw = hangingGates
    .map((h, i) => {
      if (h.held == null || h.missing == null) return null;
      if (activeKeySet.has(gateKey(h.held, h.missing))) return null;
      return { ...h, held: h.held as number, missing: h.missing as number, i };
    })
    .filter(Boolean) as Array<{
    held: number;
    missing: number;
    channel?: string;
    i: number;
  }>;

  const hangingFiltered: typeof hangingRaw = [];
  const integHeldSeen = new Set<number>();
  // Group Integration hangings by held gate → keep preferred missing only
  const integByHeld = new Map<number, number[]>();
  for (const h of hangingRaw) {
    if (INTEGRATION_GATES.has(h.held) && INTEGRATION_GATES.has(h.missing)) {
      const arr = integByHeld.get(h.held) || [];
      arr.push(h.missing);
      integByHeld.set(h.held, arr);
    }
  }
  for (const h of hangingRaw) {
    if (INTEGRATION_GATES.has(h.held) && INTEGRATION_GATES.has(h.missing)) {
      if (integHeldSeen.has(h.held)) continue;
      const preferred =
        preferIntegrationHangingMissing(h.held, integByHeld.get(h.held) || []) ??
        h.missing;
      integHeldSeen.add(h.held);
      hangingFiltered.push({ ...h, missing: preferred });
      continue;
    }
    hangingFiltered.push(h);
  }

  const hangingHalves = hangingFiltered
    .map((h) => {
      const dash = hangingHalfChannelDash(h.held, h.missing);
      if (!dash) return null;
      const d = channelPathD(dash.gates);
      if (!d) return null;
      const tone: ChipTone = chipToneForGate(h.held, personality, design, hasSplit);
      const stroke =
        tone === "terracotta" ? TERRACOTTA : tone === "dual" ? TERRACOTTA : OBSIDIAN;
      return {
        key: `hang-${h.i}-${h.held}-${h.missing}`,
        d,
        stroke,
        dasharray: dash.dasharray,
        dashoffset: dash.dashoffset,
        held: h.held,
        missing: h.missing,
        title: `Hanging ${h.held} → ${h.missing}${h.channel ? ` · ${h.channel}` : ""}`,
      };
    })
    .filter(Boolean) as Array<{
    key: string;
    d: string;
    stroke: string;
    dasharray: string;
    dashoffset: number;
    held: number;
    missing: number;
    title: string;
  }>;

  const chipGates = Array.from(activated).sort((a, b) => a - b);
  const chipOpacity = showLabels ? 0.15 : 1;
  const focusLabel = focusCenter ? CENTER_LABELS[focusCenter] : null;
  const focusDefined = focusCenter ? defined.has(focusCenter) : false;
  const focusActiveGates = focusCenter
    ? chipGates.filter((g) => GATE_TO_CENTER[g] === focusCenter)
    : [];

  return (
    <div className={`relative flex flex-col items-center gap-3 ${className}`}>
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="h-auto w-full max-w-[300px]"
        role="img"
        aria-label="Human Design bodygraph"
      >
        <title>Human Design bodygraph</title>
        {/* Soft torso silhouette */}
        <path d={TORSO_PATH} fill={ALABASTER} opacity={0.95} />

        {/* Full inactive lattice — warm track under half-channels */}
        <g aria-hidden="true">
          {CHANNEL_LATTICE.map((row) => {
            const k = gateKey(row.gates[0], row.gates[1]);
            if (activeKeySet.has(k)) return null;
            const d = channelPathD(row.gates);
            if (!d) return null;
            return (
              <path
                key={`ghost-${k}`}
                d={d}
                fill="none"
                stroke={TRACK}
                strokeWidth={5}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: "none" }}
              />
            );
          })}
        </g>

        {/* Active channels — behind centers + chips; dual = two parallel strokes */}
        {activePaths.map((p) => {
          if (p.stroke === "split") {
            return (
              <g key={p.key} style={{ pointerEvents: "none" }}>
                <path
                  d={p.d}
                  fill="none"
                  stroke={OBSIDIAN}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 6"
                  strokeDashoffset={0}
                >
                  <title>{p.title}</title>
                </path>
                <path
                  d={p.d}
                  fill="none"
                  stroke={TERRACOTTA}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 6"
                  strokeDashoffset={6}
                />
              </g>
            );
          }
          const stroke = p.stroke === "design" ? TERRACOTTA : OBSIDIAN;
          return (
            <path
              key={p.key}
              d={p.d}
              fill="none"
              stroke={stroke}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pointerEvents: "none" }}
            >
              <title>{p.title}</title>
            </path>
          );
        })}

        {/* Hanging half-channels — pathLength dash on EXISTING channel d */}
        {hangingHalves.map((h) => (
          <path
            key={h.key}
            d={h.d}
            fill="none"
            stroke={h.stroke}
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={100}
            strokeDasharray={h.dasharray}
            strokeDashoffset={h.dashoffset}
            strokeOpacity={0.95}
            style={{ pointerEvents: "none" }}
          >
            <title>{h.title}</title>
          </path>
        ))}

        {/* Centers — no default name text; hover/focus → pill below */}
        {(Object.entries(CENTER_GEOM) as [CenterKey, (typeof CENTER_GEOM)[CenterKey]][]).map(
          ([key, g]) => {
            const isDef = defined.has(key);
            const motor = MOTOR_CENTERS.has(key);
            const d = centerPath(g.kind, g.cx, g.cy, g.s, g.tip);
            const fill = isDef ? (motor ? MOTOR_FILL : SAGE) : ALABASTER;
            const stroke = isDef ? (motor ? MOTOR_BORDER : "#2F4A38") : OPEN_BORDER;
            const strokeW = 1.5;
            const strokeOp = 1;
            const status = isDef ? `Defined ${displayCenter(key)}` : `Open ${displayCenter(key)}`;
            return (
              <g key={key}>
                <path
                  d={d}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeW}
                  strokeOpacity={strokeOp}
                  tabIndex={0}
                  role="button"
                  aria-label={status}
                  style={{ cursor: "pointer" }}
                  onMouseEnter={() => setFocusCenter(key)}
                  onMouseLeave={() => setFocusCenter((c) => (c === key ? null : c))}
                  onFocus={() => setFocusCenter(key)}
                  onBlur={() => setFocusCenter((c) => (c === key ? null : c))}
                >
                  <title>{status}</title>
                </path>
                {showLabels ? (
                  <text
                    x={g.cx}
                    y={g.cy + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={key === "Solar_Plexus" || key === "Spleen" ? 8 : 9}
                    fill={isDef ? LINEN : "#6B675E"}
                    opacity={0.85}
                    style={{ fontWeight: 600, pointerEvents: "none" }}
                  >
                    {CENTER_LABELS[key]}
                  </text>
                ) : null}
              </g>
            );
          }
        )}

        {/* Activated gate badges — r=6.5; dual = obsidian core + terracotta ring */}
        <g opacity={chipOpacity}>
          {chipGates.map((gate) => {
            const pos = gateAnchor(gate);
            const tone = chipToneForGate(gate, personality, design, hasSplit);
            const center = GATE_TO_CENTER[gate];
            const origin =
              hasSplit && personality.has(gate) && design.has(gate)
                ? "personality + design"
                : hasSplit && personality.has(gate)
                  ? "personality"
                  : hasSplit && design.has(gate)
                    ? "design"
                    : "activated";
            const fill = tone === "terracotta" ? TERRACOTTA : OBSIDIAN;
            const textFill = LINEN;
            return (
              <g key={`chip-${gate}`} style={{ pointerEvents: "none" }}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={GATE_CHIP_R}
                  fill={fill}
                  stroke={tone === "dual" ? TERRACOTTA : CREAM_STROKE}
                  strokeWidth={tone === "dual" ? 2 : 1.5}
                >
                  <title>{`Gate ${gate}${center ? ` · ${displayCenter(center)}` : ""} · ${origin}`}</title>
                </circle>
                <text
                  x={pos.x}
                  y={pos.y + 0.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={7.5}
                  fill={textFill}
                  style={{ fontWeight: 700, pointerEvents: "none" }}
                >
                  {gate}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating center pill — hover / keyboard focus */}
      {focusLabel && !showLabels ? (
        <div
          className="pointer-events-none absolute top-2 z-10 max-w-[90%] rounded-full px-3 py-1 text-center text-[11px] font-semibold shadow-sm"
          style={{
            background: focusDefined ? SAGE : ALABASTER,
            color: focusDefined ? LINEN : OBSIDIAN,
            border: focusDefined ? "none" : `1px solid ${OPEN_BORDER}`,
          }}
          aria-live="polite"
        >
          {focusDefined ? "Defined" : "Open"} · {displayCenter(focusCenter!)}
          {focusActiveGates.length > 0
            ? ` · ${focusActiveGates.join(" · ")}`
            : ""}
        </div>
      ) : null}

      {/* Biohacking pill legend — no basalt/terracotta/chalk jargon */}
      <div
        id="bodygraph-legend"
        className="flex w-full max-w-sm flex-col items-center gap-2"
      >
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas/80 px-2.5 py-1 text-[10px] font-medium text-fg"
            title="Conscious · Mind / Personality"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: OBSIDIAN }}
              aria-hidden
            />
            Conscious
            <span className="font-normal text-fg-muted">(Mind)</span>
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas/80 px-2.5 py-1 text-[10px] font-medium text-fg"
            title="Somatic · Body / Unconscious"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: TERRACOTTA }}
              aria-hidden
            />
            Somatic
            <span className="font-normal text-fg-muted">(Body)</span>
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas/80 px-2.5 py-1 text-[10px] font-medium text-fg"
            title="Integrated · Personality + Design"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{
                background: OBSIDIAN,
                boxShadow: `0 0 0 2px ${TERRACOTTA}`,
              }}
              aria-hidden
            />
            Integrated
            <span className="font-normal text-fg-muted">(Both)</span>
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas/80 px-2.5 py-1 text-[10px] font-medium text-fg"
            title="Defined · Consistent Baseline"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: SAGE }}
              aria-hidden
            />
            Defined
            <span className="font-normal text-fg-muted">(Baseline)</span>
          </span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-canvas/80 px-2.5 py-1 text-[10px] font-medium text-fg"
            title="Open · Amplifies Environment"
          >
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm border"
              style={{ background: ALABASTER, borderColor: OPEN_BORDER }}
              aria-hidden
            />
            Open
            <span className="font-normal text-fg-muted">(Amplifies)</span>
          </span>
        </div>
        <p className="text-center text-[10px] text-fg-muted">
          Tap any center to inspect its mechanics
        </p>
      </div>

      {activePaths.length > 0 && (
        <div className="w-full max-w-sm rounded-xl border border-border bg-canvas/60 px-3 py-2">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
            Active channels
          </div>
          <ul className="space-y-0.5 text-[11px] text-fg-secondary">
            {activePaths.map((p) => (
              <li key={`list-${p.key}`}>
                <span className="font-medium text-fg">
                  {p.gates[0]}–{p.gates[1]}
                </span>
                {p.name ? <span> · {p.name}</span> : null}
                {hasSplit ? (
                  <span className="text-fg-muted">
                    {" "}
                    ·{" "}
                    {p.stroke === "design"
                      ? "design"
                      : p.stroke === "split"
                        ? "both"
                        : "personality"}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hangingGates.length > 0 && (
        <div className="w-full max-w-sm rounded-xl border border-border px-3 py-2">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-fg-muted">
            Hanging gates
          </div>
          <ul className="space-y-0.5 text-[11px] text-fg-secondary">
            {hangingGates.slice(0, 8).map((h, i) => (
              <li key={`hlist-${i}-${h.held}-${h.missing}`}>
                <span className="font-medium text-fg">{h.held}</span>
                <span className="text-fg-muted"> → {h.missing}</span>
                {h.channel ? <span> · {h.channel}</span> : null}
              </li>
            ))}
            {hangingGates.length > 8 && (
              <li className="text-fg-muted">+{hangingGates.length - 8} more</li>
            )}
          </ul>
        </div>
      )}

      {definedCenters.length > 0 && (
        <p className="max-w-sm text-center text-[11px] text-fg-muted">
          Lit: {definedCenters.map((c) => displayCenter(c)).join(" · ")}
          {channels.length > 0
            ? ` · ${channels.length} channel${channels.length === 1 ? "" : "s"}`
            : ""}
          {activatedGates.length > 0 ? ` · ${activatedGates.length} gates` : ""}
        </p>
      )}
    </div>
  );
}
