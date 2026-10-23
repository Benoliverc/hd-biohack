"use client";

import { useState } from "react";
import { displayCenter } from "@/lib/hdCopy";
import {
  CENTER_GEOM,
  CENTER_LABELS,
  CHANNEL_LATTICE,
  GATE_CHIP_R,
  GATE_TO_CENTER,
  MOTOR_CENTERS,
  TORSO_PATH,
  VB,
  channelEndpoints,
  channelPathD,
  centerPath,
  gateAnchor,
  hangingHalfChannelPathD,
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
  /** Personality (conscious) gate numbers — Basalt strokes/chips when set. */
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

/** Spec hexes (also mirrored in CSS tokens for light theme). */
const BASALT = "#1C201D";
const TERRACOTTA = "#C87D55";
const CHALK = "#EFECE4";
const GHOST = "#82877E";
const LINEN = "#F7F6F2";
const CREAM_STROKE = "#FAF8F5";
const SAGE = "var(--growth)"; // #4A6B53 in tokens

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

type ChipTone = "basalt" | "terracotta" | "dual";

function chipToneForGate(
  gate: number,
  personality: Set<number>,
  design: Set<number>,
  hasSplit: boolean
): ChipTone {
  if (!hasSplit) return "basalt";
  const p = personality.has(gate);
  const d = design.has(gate);
  if (p && d) return "dual";
  if (p) return "basalt";
  if (d) return "terracotta";
  return "basalt";
}

/**
 * Channel stroke from personality/design gate ownership.
 * Both personality → Basalt; both design → Terracotta;
 * mixed → split gradient (documented); no split data → Basalt fallback.
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

  // Hanging half-channels: held gate → path midpoint (no naked ghost numbers)
  const hangingHalves = hangingGates
    .map((h, i) => {
      if (h.held == null || h.missing == null) return null;
      if (activeKeySet.has(gateKey(h.held, h.missing))) return null;
      const d = hangingHalfChannelPathD(h.held, h.missing);
      if (!d) return null;
      const tone: ChipTone = chipToneForGate(h.held, personality, design, hasSplit);
      const stroke =
        tone === "terracotta" ? TERRACOTTA : tone === "dual" ? TERRACOTTA : BASALT;
      return {
        key: `hang-${i}-${h.held}-${h.missing}`,
        d,
        stroke,
        held: h.held,
        missing: h.missing,
        title: `Hanging ${h.held} → ${h.missing}${h.channel ? ` · ${h.channel}` : ""}`,
      };
    })
    .filter(Boolean) as Array<{
    key: string;
    d: string;
    stroke: string;
    held: number;
    missing: number;
    title: string;
  }>;

  const chipGates = Array.from(activated).sort((a, b) => a - b);
  const chipOpacity = showLabels ? 0.15 : 1;
  const focusLabel = focusCenter ? CENTER_LABELS[focusCenter] : null;
  const focusDefined = focusCenter ? defined.has(focusCenter) : false;

  return (
    <div className={`relative flex flex-col items-center gap-3 ${className}`}>
      <svg
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        className="h-auto w-full max-w-[300px]"
        role="img"
        aria-label="Human Design bodygraph"
      >
        <title>Human Design bodygraph</title>
        <defs>
          {activePaths
            .filter((p) => p.stroke === "split")
            .map((p) => (
              <linearGradient
                key={`grad-${p.key}`}
                id={`grad-${p.key}`}
                gradientUnits="userSpaceOnUse"
                x1={p.ep.x1}
                y1={p.ep.y1}
                x2={p.ep.x2}
                y2={p.ep.y2}
              >
                <stop offset="0%" stopColor={BASALT} />
                <stop offset="100%" stopColor={TERRACOTTA} />
              </linearGradient>
            ))}
        </defs>

        {/* Soft chalk torso — #EFECE4, cubic Beziers */}
        <path d={TORSO_PATH} fill={CHALK} opacity={0.95} />

        {/* Full ghost lattice — solid faint, never dashed */}
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
                stroke={GHOST}
                strokeOpacity={0.18}
                strokeWidth={3.5}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        {/* Active channels — behind centers + chips */}
        {activePaths.map((p) => {
          const stroke =
            p.stroke === "design"
              ? TERRACOTTA
              : p.stroke === "split"
                ? `url(#grad-${p.key})`
                : BASALT;
          return (
            <path
              key={p.key}
              d={p.d}
              fill="none"
              stroke={stroke}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <title>{p.title}</title>
            </path>
          );
        })}

        {/* Hanging half-channels — held → midpoint */}
        {hangingHalves.map((h) => (
          <path
            key={h.key}
            d={h.d}
            fill="none"
            stroke={h.stroke}
            strokeWidth={4}
            strokeLinecap="round"
            strokeOpacity={0.85}
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
            const fill = isDef ? (motor ? TERRACOTTA : SAGE) : CHALK;
            const stroke = isDef
              ? motor
                ? "var(--energy-ink)"
                : "var(--growth-deep)"
              : GHOST;
            const strokeW = isDef ? 1.5 : 1;
            const strokeOp = isDef ? 1 : 0.35;
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
                    fill={isDef ? LINEN : GHOST}
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

        {/* Activated gate badges — r=6.5; dual = basalt core + terracotta ring */}
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
            const fill = tone === "terracotta" ? TERRACOTTA : BASALT;
            const textFill = LINEN;
            return (
              <g key={`chip-${gate}`}>
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
          className="pointer-events-none absolute top-2 z-10 rounded-full px-3 py-1 text-[11px] font-semibold shadow-sm"
          style={{
            background: focusDefined ? "var(--growth)" : CHALK,
            color: focusDefined ? LINEN : BASALT,
            border: focusDefined ? "none" : `1px solid ${GHOST}`,
          }}
          aria-live="polite"
        >
          {focusDefined ? "Defined" : "Open"} · {displayCenter(focusCenter!)}
        </div>
      ) : null}

      {/* Legend */}
      <ul className="w-full max-w-sm space-y-1 text-[11px] leading-snug text-fg-secondary">
        <li className="flex items-start gap-2">
          <span
            className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
            style={{ background: "var(--growth)" }}
            aria-hidden
          />
          <span>
            <span className="font-medium text-fg">Defined centers</span> — energy you came with,
            always on tap
            <span className="text-fg-muted"> (motors in terracotta)</span>. Hover a center for its
            name.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span
            className="mt-0.5 inline-block h-2.5 w-2.5 shrink-0 rounded-sm border"
            style={{ background: CHALK, borderColor: GHOST }}
            aria-hidden
          />
          <span>
            <span className="font-medium text-fg">Open centers</span> — chalk fill; where you pick
            up other people&apos;s energy.
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span
            className="mt-1 inline-block h-0.5 w-2.5 shrink-0 rounded-full"
            style={{ background: BASALT }}
            aria-hidden
          />
          <span>
            <span className="font-medium text-fg">Active channels</span>
            {hasSplit
              ? " — basalt = personality, terracotta = design (split = both)."
              : " — basalt talent lines; ghost lattice shows inactive routes."}
            {hangingHalves.length > 0
              ? " Hanging gates show a half-channel to the midpoint."
              : ""}
          </span>
        </li>
        <li className="flex items-start gap-2">
          <span
            className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold"
            style={{ background: BASALT, color: LINEN, boxShadow: `0 0 0 2px ${TERRACOTTA}` }}
            aria-hidden
          >
            #
          </span>
          <span>
            <span className="font-medium text-fg">Gate chips</span>
            {hasSplit
              ? " — basalt = personality, terracotta = design, basalt + terracotta ring = both."
              : " — numbered activations on the graph."}
          </span>
        </li>
      </ul>

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
