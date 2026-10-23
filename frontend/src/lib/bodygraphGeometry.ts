/**
 * Human Design bodygraph geometry — Grounded Vitality.
 * Channel list mirrors backend/app/hd/channels.py (36 channels).
 */

export type CenterKey =
  | "Head"
  | "Ajna"
  | "Throat"
  | "G"
  | "Heart"
  | "Sacral"
  | "Solar_Plexus"
  | "Spleen"
  | "Root";

export type CenterGeom = {
  kind: "triangle" | "diamond" | "square";
  cx: number;
  cy: number;
  s: number;
  tip?: "up" | "down";
};

/** viewBox 0 0 240 360 */
export const VB = { w: 240, h: 360 };

/** Corner radius for all geometric centers (Grounded Vitality rx≈8). */
export const CENTER_RX = 8;

export const CENTER_GEOM: Record<CenterKey, CenterGeom> = {
  // Crowded centers scale beyond ~25% so perimeter chips clear MIN_GATE_SPACING.
  // Head+Ajna raised ~8px so Ajna 43 ↔ Throat 23 clear ≥18px c2c.
  // Heart/SP/Spleen/Root enlarged so facing-wall chips fit without collisions.
  Head: { kind: "triangle", cx: 120, cy: 18, s: 28, tip: "up" },
  Ajna: { kind: "triangle", cx: 120, cy: 70, s: 32, tip: "down" },
  Throat: { kind: "square", cx: 120, cy: 138, s: 52 },
  G: { kind: "diamond", cx: 120, cy: 204, s: 32 },
  Heart: { kind: "triangle", cx: 182, cy: 182, s: 30, tip: "down" },
  Sacral: { kind: "square", cx: 120, cy: 268, s: 48 },
  Solar_Plexus: { kind: "triangle", cx: 190, cy: 270, s: 42, tip: "up" },
  Spleen: { kind: "triangle", cx: 50, cy: 270, s: 42, tip: "up" },
  Root: { kind: "square", cx: 120, cy: 328, s: 52 },
};


/** Motors get Terracotta; awareness / identity get Sage Fern. */
export const MOTOR_CENTERS = new Set<CenterKey>([
  "Root",
  "Sacral",
  "Solar_Plexus",
  "Heart",
]);

export const GATE_TO_CENTER: Record<number, CenterKey> = {};
const _CENTER_GATES: Record<CenterKey, number[]> = {
  Head: [64, 61, 63],
  Ajna: [47, 24, 4, 17, 43, 11],
  Throat: [62, 23, 56, 16, 20, 31, 8, 33, 35, 12, 45],
  G: [7, 1, 13, 10, 15, 2, 46, 25],
  Heart: [21, 40, 26, 51],
  Solar_Plexus: [36, 22, 37, 6, 49, 55, 30],
  Sacral: [5, 14, 29, 59, 9, 3, 42, 27, 34],
  Spleen: [48, 57, 44, 50, 32, 28, 18],
  Root: [58, 38, 54, 53, 60, 52, 19, 39, 41],
};
for (const [center, gates] of Object.entries(_CENTER_GATES) as [CenterKey, number[]][]) {
  for (const g of gates) GATE_TO_CENTER[g] = center;
}

/** Exact 36-channel lattice (gate_a, gate_b, name) — source of truth with backend. */
export const CHANNEL_LATTICE: Array<{ gates: [number, number]; name: string }> = [
  { gates: [1, 8], name: "Inspiration" },
  { gates: [2, 14], name: "The Beat" },
  { gates: [3, 60], name: "Mutation" },
  { gates: [4, 63], name: "Logic" },
  { gates: [5, 15], name: "Rhythm" },
  { gates: [6, 59], name: "Intimacy" },
  { gates: [7, 31], name: "The Alpha" },
  { gates: [9, 52], name: "Concentration" },
  { gates: [10, 20], name: "Awakening" },
  { gates: [10, 34], name: "Exploration" },
  { gates: [10, 57], name: "Perfected Form" },
  { gates: [11, 56], name: "Curiosity" },
  { gates: [12, 22], name: "Openness" },
  { gates: [13, 33], name: "The Prodigal" },
  { gates: [16, 48], name: "The Wavelength" },
  { gates: [17, 62], name: "Acceptance" },
  { gates: [18, 58], name: "Judgment" },
  { gates: [19, 49], name: "Synthesis" },
  { gates: [20, 34], name: "Charisma" },
  { gates: [20, 57], name: "The Brain Wave" },
  { gates: [21, 45], name: "The Money Line" },
  { gates: [23, 43], name: "Structuring" },
  { gates: [24, 61], name: "Awareness" },
  { gates: [25, 51], name: "Initiation" },
  { gates: [26, 44], name: "Surrender" },
  { gates: [27, 50], name: "Preservation" },
  { gates: [28, 38], name: "Struggle" },
  { gates: [29, 46], name: "Discovery" },
  { gates: [30, 41], name: "Recognition" },
  { gates: [32, 54], name: "Transformation" },
  { gates: [34, 57], name: "Power" },
  { gates: [35, 36], name: "Transitoriness" },
  { gates: [37, 40], name: "Community" },
  { gates: [39, 55], name: "Emoting" },
  { gates: [42, 53], name: "Maturation" },
  { gates: [47, 64], name: "Abstraction" },
];

/** Chip radius used by BodyGraph (keep in sync with renderer). */
export const GATE_CHIP_R = 6.5;

/**
 * Minimum Euclidean distance between gate-chip anchors (assertGateSpacing).
 * Chips are r=6.5 → visual touch at 13; we keep ≥14.5 air so overlaps can’t regress.
 */
export const MIN_GATE_SPACING = 14.5;

/**
 * Gate chip anchors — SINGLE SOURCE OF TRUTH for chip (x,y).
 * channelPathD / channelEndpoints ALWAYS start & end at gateAnchor(gate).
 * Inner perimeter of each center, aligned toward channel partners
 * (Throat: top 62/23/56, right 35/12/45, bottom 8/31+33, left 16/20).
 * Spacing enforced by assertGateSpacing() ≥ MIN_GATE_SPACING.
 */
const GATE_OFFSETS: Record<number, { dx: number; dy: number }> = {
  // Head — tip up; 61 on BOTTOM edge between 64 (L) and 63 (R), above Ajna 24
  64: { dx: -16, dy: 14 },
  61: { dx: 0, dy: 16 },
  63: { dx: 16, dy: 14 },
  // Ajna — tip down; 43 inset up into apex for 43↔23 gap
  47: { dx: -16, dy: -14 },
  24: { dx: 0, dy: -16 },
  4: { dx: 16, dy: -14 },
  17: { dx: -14, dy: 10 },
  43: { dx: 0, dy: 14 },
  11: { dx: 14, dy: 10 },
  // Throat — 23 inset down on top rim for Ajna gap
  62: { dx: -14, dy: -23.5 },
  23: { dx: 4, dy: -16 },
  56: { dx: 18, dy: -23.5 },
  16: { dx: -23.5, dy: -10 },
  20: { dx: -23.5, dy: 5 },
  31: { dx: -8, dy: 23.5 },
  8: { dx: 8, dy: 23.5 },
  33: { dx: -23.5, dy: 20 },
  35: { dx: 23.5, dy: -10 },
  12: { dx: 23.5, dy: 6 },
  45: { dx: 23.5, dy: 22 },
  // G
  7: { dx: 0, dy: -29.5 },
  1: { dx: 14.8, dy: -14.7 },
  13: { dx: 29.5, dy: 0 },
  10: { dx: -14.7, dy: -14.7 },
  15: { dx: -0.2, dy: 29.3 },
  2: { dx: -14.7, dy: 14.8 },
  46: { dx: -29.5, dy: 0 },
  25: { dx: 14.8, dy: 14.8 },
  // Heart / Ego — face partner centers
  // 21 → Throat 45; 51 → G 25; 26 → Spleen 44; 40 → SP 37
  21: { dx: 0, dy: -18 },
  51: { dx: -22, dy: -6 },
  26: { dx: -18, dy: 16 },
  40: { dx: 18, dy: 16 },
  // Sacral — bottom faces Root; right faces SP; left faces Spleen
  5: { dx: -11.4, dy: -21.5 },
  14: { dx: 7, dy: -21.5 },
  29: { dx: 21.5, dy: -17.2 },
  59: { dx: 21.5, dy: 1.9 },
  9: { dx: 16, dy: 21.5 },
  3: { dx: 0, dy: 21.5 },
  42: { dx: -16, dy: 21.5 },
  27: { dx: -21.5, dy: 7.5 },
  34: { dx: -21.5, dy: -10.4 },
  // Solar Plexus — left/bottom-left slope toward Sacral / Root / Ego
  36: { dx: 2, dy: -40 },
  22: { dx: 32, dy: -15 },
  37: { dx: -22, dy: -32 },
  6: { dx: -30, dy: -12 },
  30: { dx: -36, dy: 18 },
  55: { dx: -20, dy: 34 },
  49: { dx: 5, dy: 34 },
  // Spleen — mirror facing Root / Sacral / Heart
  48: { dx: 0, dy: -40 },
  57: { dx: 20, dy: -18 },
  44: { dx: 28, dy: 12 },
  50: { dx: 18, dy: 34 },
  32: { dx: -6, dy: 34 },
  28: { dx: -32, dy: 16 },
  18: { dx: -28, dy: -10 },
  // Root — walls face partner centers (Benjamin map)
  // Left → Spleen 58/38/54 → 18/28/32; Right → SP 41/39/19 → 30/55/49;
  // Top → Sacral 53/60/52 → 42/3/9
  53: { dx: -16, dy: -23 },
  60: { dx: 0, dy: -23 },
  52: { dx: 16, dy: -23 },
  58: { dx: -23, dy: -8 },
  38: { dx: -23, dy: 7 },
  54: { dx: -23, dy: 22 },
  41: { dx: 23, dy: -8 },
  39: { dx: 23, dy: 7 },
  19: { dx: 23, dy: 22 },
};

export function gateAnchor(gate: number, preferCenter?: CenterKey): { x: number; y: number } {
  const center = preferCenter || GATE_TO_CENTER[gate];
  if (!center) return { x: VB.w / 2, y: VB.h / 2 };
  const g = CENTER_GEOM[center];
  const off = GATE_OFFSETS[gate] || { dx: 0, dy: 0 };
  return { x: g.cx + off.dx, y: g.cy + off.dy };
}

/**
 * Absolute chip positions derived from GATE_OFFSETS + CENTER_GEOM.
 * Prefer gateAnchor(gate) at call sites; this map is for audit / tooling.
 */
export const GATE_POSITIONS: Record<number, { x: number; y: number }> = (() => {
  const out: Record<number, { x: number; y: number }> = {};
  for (const g of Object.keys(GATE_OFFSETS).map(Number)) {
    out[g] = gateAnchor(g);
  }
  return out;
})();

/**
 * Integration circuit (10-20-34-57) — shared trunk geometry.
 *
 * Approach: traditional HD Integration with central diagonal spine
 * **20 (Throat) ↔ 57 (Spleen)** and short tributaries from **10 (G)** and
 * **34 (Sacral)** into a join on that spine. Completed Personality+Design
 * channels paint along the SAME shared segments so black/orange halves meet
 * tip-to-tip. Hanging multi-gates prefer one trunk-oriented half instead of
 * three tentacles (see preferIntegrationHangingMissing).
 */
export const INTEGRATION_GATES = new Set([10, 20, 34, 57]);
export const INTEGRATION_SPINE: [number, number] = [20, 57];

/** Join where G(10) and Sacral(34) tributaries meet the 20↔57 spine. */
export function integrationJoinPoint(): { x: number; y: number } {
  const a = gateAnchor(20);
  const b = gateAnchor(57);
  // Slight bias toward G/Sacral (right of pure midpoint on this leftward spine)
  return {
    x: a.x * 0.45 + b.x * 0.55,
    y: a.y * 0.45 + b.y * 0.55,
  };
}

function isIntegrationPair(g0: number, g1: number): boolean {
  return INTEGRATION_GATES.has(g0) && INTEGRATION_GATES.has(g1);
}

/**
 * When an Integration gate hangs toward multiple partners, keep ONE primary
 * missing so the SVG does not sprout three tentacles.
 * - 20 / 57 → along spine toward each other
 * - 10 / 34 → into the join (prefer 57 as spine foot for pathLength orientation)
 */
export function preferIntegrationHangingMissing(
  held: number,
  candidates: number[]
): number | null {
  if (!INTEGRATION_GATES.has(held)) return null;
  const integ = candidates.filter((c) => INTEGRATION_GATES.has(c));
  if (integ.length === 0) return null;
  if (held === 20) return integ.includes(57) ? 57 : integ[0];
  if (held === 57) return integ.includes(20) ? 20 : integ[0];
  if (held === 10 || held === 34) {
    // Prefer spine foot 57, then 20, then 34/10 sibling
    for (const pref of [57, 20, held === 10 ? 34 : 10]) {
      if (integ.includes(pref)) return pref;
    }
    return integ[0];
  }
  return integ[0];
}

/**
 * Fail loudly if any two gate anchors are closer than MIN_GATE_SPACING.
 * Call from unit/script checks so overlaps can’t regress silently.
 */
export function assertGateSpacing(
  minDist: number = MIN_GATE_SPACING
): { ok: true } | { ok: false; violations: Array<{ a: number; b: number; dist: number }> } {
  const gates = Object.keys(GATE_OFFSETS).map(Number);
  const violations: Array<{ a: number; b: number; dist: number }> = [];
  for (let i = 0; i < gates.length; i++) {
    for (let j = i + 1; j < gates.length; j++) {
      const a = gateAnchor(gates[i]);
      const b = gateAnchor(gates[j]);
      const dist = Math.hypot(b.x - a.x, b.y - a.y);
      if (dist < minDist) {
        violations.push({ a: gates[i], b: gates[j], dist });
      }
    }
  }
  if (violations.length) return { ok: false, violations };
  return { ok: true };
}

/** Ajna 43 ↔ Throat 23 must keep a visible channel gap (≥18px c2c). */
export const MIN_AJNA_THROAT_GAP = 18;

export function assertAjnaThroatGap(
  minDist: number = MIN_AJNA_THROAT_GAP
): { ok: true; dist: number } | { ok: false; dist: number } {
  const a = gateAnchor(43);
  const b = gateAnchor(23);
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  if (dist < minDist) return { ok: false, dist };
  return { ok: true, dist };
}


export function centersForChannel(gates: [number, number] | number[]): [CenterKey, CenterKey] | null {
  const a = GATE_TO_CENTER[gates[0]];
  const b = GATE_TO_CENTER[gates[1]];
  if (!a || !b) return null;
  return [a, b];
}

export function channelEndpoints(
  gates: [number, number] | number[]
): { x1: number; y1: number; x2: number; y2: number; c1: CenterKey; c2: CenterKey } | null {
  const cents = centersForChannel(gates);
  if (!cents) return null;
  const [c1, c2] = cents;
  const g0 = gates[0];
  const g1 = gates[1];
  const a0 = gateAnchor(g0, c1);
  const a1 = gateAnchor(g1, c2);
  // Termini = exact chip centers; chips (r=6.5) render above so paths emerge under numbers
  return {
    x1: a0.x,
    y1: a0.y,
    x2: a1.x,
    y2: a1.y,
    c1,
    c2,
  };
}

/** Center-pair keys that should arc along the silhouette (not straight diagonals). */
function outerArcSide(c1: CenterKey, c2: CenterKey): "left" | "right" | null {
  const pair = new Set([c1, c2]);
  // Left perimeter: Throat/G/Sacral ↔ Spleen, Spleen ↔ Root (stay outside Spleen tip)
  if (
    pair.has("Spleen") &&
    (pair.has("Throat") || pair.has("G") || pair.has("Sacral") || pair.has("Root"))
  ) {
    return "left";
  }
  // Right perimeter: Throat/G/Heart ↔ SP, SP ↔ Root
  if (
    pair.has("Solar_Plexus") &&
    (pair.has("Throat") || pair.has("G") || pair.has("Heart") || pair.has("Root"))
  ) {
    return "right";
  }
  // Heart ↔ Spleen crosses torso — mild left bow
  if (pair.has("Heart") && pair.has("Spleen")) return "left";
  return null;
}

/**
 * SVG path `d` for a channel.
 * Endpoints ALWAYS equal gateAnchor(A/B) — never invent mid-air stubs.
 * Integration pairs use shared trunk (spine 20↔57 + tributaries via join).
 * Outer perimeter pairs use wide cubics routed OUTSIDE center fills
 * (esp. Spleen tip) so strokes do not slice unrelated corners.
 */
export function channelPathD(gates: [number, number] | number[]): string | null {
  const g0 = Number(gates[0]);
  const g1 = Number(gates[1]);
  if (!GATE_TO_CENTER[g0] || !GATE_TO_CENTER[g1]) return null;

  // Integration trunk — shared geometry for all 6 lattice pairs among 10/20/34/57
  if (isIntegrationPair(g0, g1)) {
    return integrationChannelPathD(g0, g1);
  }

  const ep = channelEndpoints([g0, g1]);
  if (!ep) return null;
  const { x1, y1, x2, y2, c1, c2 } = ep;
  const side = outerArcSide(c1, c2);
  if (!side) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  // Wide outer cubic hugging silhouette; pull left of Spleen tip / right of SP tip
  const midY = (y1 + y2) / 2;
  const span = Math.abs(y2 - y1);
  const pull = span > 80 ? 56 : span > 40 ? 46 : 36;
  // Keep arcs outside triangular peaks (Spleen tip ~x50 y228; SP mirror)
  const edgeX = side === "left" ? 18 : VB.w - 18;
  const cpx1 =
    side === "left"
      ? Math.min(x1 - 10, edgeX + pull * 0.1)
      : Math.max(x1 + 10, edgeX - pull * 0.1);
  const cpx2 =
    side === "left"
      ? Math.min(x2 - 10, edgeX + pull * 0.1)
      : Math.max(x2 + 10, edgeX - pull * 0.1);
  const cpy1 = y1 + (midY - y1) * 0.5;
  const cpy2 = y2 - (y2 - midY) * 0.5;
  const out1 = side === "left" ? Math.min(cpx1, edgeX) : Math.max(cpx1, edgeX);
  const out2 = side === "left" ? Math.min(cpx2, edgeX) : Math.max(cpx2, edgeX);
  return `M ${x1} ${y1} C ${out1} ${cpy1}, ${out2} ${cpy2}, ${x2} ${y2}`;
}

/**
 * Integration path: always starts at gateAnchor(a) and ends at gateAnchor(b).
 * Spine segment 20↔57 is one shared curve; 10 and 34 enter at integrationJoinPoint.
 */
function integrationChannelPathD(a: number, b: number): string {
  const start = gateAnchor(a);
  const end = gateAnchor(b);
  const J = integrationJoinPoint();
  const pair = new Set([a, b]);

  // Pure spine — single shared curve (Personality + Design halves meet mid-path)
  if (pair.has(20) && pair.has(57)) {
    const midX = (start.x + end.x) / 2 - 8; // slight left bow clear of G diamond
    const midY = (start.y + end.y) / 2;
    return `M ${start.x} ${start.y} Q ${midX} ${midY}, ${end.x} ${end.y}`;
  }

  // Tributary ↔ spine foot/head: go via join so segments share J
  // 10-20, 10-57, 34-20, 34-57, 10-34, 20-34
  return `M ${start.x} ${start.y} L ${J.x} ${J.y} L ${end.x} ${end.y}`;
}

/**
 * Lattice-ordered gate pair for a channel (matches CHANNEL_LATTICE / ghost paths).
 * Returns null if the pair is not on the 36-channel lattice.
 */
export function latticeGatePair(
  a: number,
  b: number
): [number, number] | null {
  for (const row of CHANNEL_LATTICE) {
    const [g0, g1] = row.gates;
    if ((g0 === a && g1 === b) || (g0 === b && g1 === a)) return [g0, g1];
  }
  return null;
}

/**
 * pathLength dash params so a hanging half-channel hugs the EXISTING channel `d`
 * (never invent mid-segment sticks). Path is oriented latticeA → latticeB.
 * - held === latticeA (start): dashoffset 0
 * - held === latticeB (end): dashoffset -52
 */
export function hangingHalfChannelDash(
  held: number,
  missing: number
): { gates: [number, number]; dasharray: string; dashoffset: number } | null {
  const pair = latticeGatePair(held, missing);
  if (!pair) return null;
  const [g0, g1] = pair;
  if (held === g0) {
    return { gates: pair, dasharray: "48 100", dashoffset: 0 };
  }
  if (held === g1) {
    return { gates: pair, dasharray: "48 100", dashoffset: -52 };
  }
  return null;
}

/** @deprecated Use hangingHalfChannelDash + channelPathD — invented sticks removed. */
export function hangingHalfChannelPathD(held: number, missing: number): string | null {
  const dash = hangingHalfChannelDash(held, missing);
  if (!dash) return null;
  return channelPathD(dash.gates);
}


/** @deprecated Prefer centerPath / channelPathD; kept for callers that need points. */
export function polyPoints(
  kind: "triangle" | "diamond" | "square",
  cx: number,
  cy: number,
  s: number,
  tip: "up" | "down" = "up"
): string {
  const h = s;
  if (kind === "square") {
    return `${cx - h / 2},${cy - h / 2} ${cx + h / 2},${cy - h / 2} ${cx + h / 2},${cy + h / 2} ${cx - h / 2},${cy + h / 2}`;
  }
  if (kind === "diamond") {
    return `${cx},${cy - h} ${cx + h},${cy} ${cx},${cy + h} ${cx - h},${cy}`;
  }
  if (tip === "up") {
    return `${cx},${cy - h} ${cx + h * 0.9},${cy + h * 0.7} ${cx - h * 0.9},${cy + h * 0.7}`;
  }
  return `${cx - h * 0.9},${cy - h * 0.7} ${cx + h * 0.9},${cy - h * 0.7} ${cx},${cy + h}`;
}

function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(bx - ax, by - ay);
}

/**
 * Closed path with rounded corners (quadratic fillets). Used for all 9 centers
 * so there are no sharp 90° / acute vertices (Grounded Vitality rx≈8).
 */
export function roundedPolygonPath(
  pts: Array<[number, number]>,
  radius: number = CENTER_RX
): string {
  const n = pts.length;
  if (n < 3) return "";
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    const d1 = dist(curr[0], curr[1], prev[0], prev[1]);
    const d2 = dist(curr[0], curr[1], next[0], next[1]);
    const r = Math.min(radius, d1 / 2.2, d2 / 2.2);
    const ux1 = (prev[0] - curr[0]) / (d1 || 1);
    const uy1 = (prev[1] - curr[1]) / (d1 || 1);
    const ux2 = (next[0] - curr[0]) / (d2 || 1);
    const uy2 = (next[1] - curr[1]) / (d2 || 1);
    const p1x = curr[0] + ux1 * r;
    const p1y = curr[1] + uy1 * r;
    const p2x = curr[0] + ux2 * r;
    const p2y = curr[1] + uy2 * r;
    if (i === 0) {
      parts.push(`M ${p1x} ${p1y}`);
    } else {
      parts.push(`L ${p1x} ${p1y}`);
    }
    parts.push(`Q ${curr[0]} ${curr[1]} ${p2x} ${p2y}`);
  }
  parts.push("Z");
  return parts.join(" ");
}

/** Rounded SVG path for a center shape. */
export function centerPath(
  kind: "triangle" | "diamond" | "square",
  cx: number,
  cy: number,
  s: number,
  tip: "up" | "down" = "up",
  radius: number = CENTER_RX
): string {
  const h = s;
  let pts: Array<[number, number]>;
  if (kind === "square") {
    pts = [
      [cx - h / 2, cy - h / 2],
      [cx + h / 2, cy - h / 2],
      [cx + h / 2, cy + h / 2],
      [cx - h / 2, cy + h / 2],
    ];
  } else if (kind === "diamond") {
    pts = [
      [cx, cy - h],
      [cx + h, cy],
      [cx, cy + h],
      [cx - h, cy],
    ];
  } else if (tip === "up") {
    pts = [
      [cx, cy - h],
      [cx + h * 0.9, cy + h * 0.7],
      [cx - h * 0.9, cy + h * 0.7],
    ];
  } else {
    pts = [
      [cx - h * 0.9, cy - h * 0.7],
      [cx + h * 0.9, cy - h * 0.7],
      [cx, cy + h],
    ];
  }
  return roundedPolygonPath(pts, radius);
}

/**
 * Soft chalk torso silhouette — organic head + shoulders + torso with
 * cubic Bezier curves (Grounded Vitality). Fill #EFECE4.
 */
export const TORSO_PATH =
  "M120 8 " +
  "C102 8 90 20 88 36 " +
  "C86 52 90 64 98 72 " +
  "C92 78 78 92 68 112 " +
  "C52 140 44 172 42 208 " +
  "C40 248 48 286 68 318 " +
  "C82 340 100 348 120 350 " +
  "C140 348 158 340 172 318 " +
  "C192 286 200 248 198 208 " +
  "C196 172 188 140 172 112 " +
  "C162 92 148 78 142 72 " +
  "C150 64 154 52 152 36 " +
  "C150 20 138 8 120 8 Z";

/** Full center display labels (no Hea/Thr truncations). */
export const CENTER_LABELS: Record<CenterKey, string> = {
  Head: "Head",
  Ajna: "Ajna",
  Throat: "Throat",
  G: "G",
  Heart: "Ego",
  Sacral: "Sacral",
  Solar_Plexus: "SP",
  Spleen: "Spl.",
  Root: "Root",
};
