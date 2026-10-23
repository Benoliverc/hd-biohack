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
  // Crowded centers (Throat/Sacral/Root) scale beyond ~25% so 7–11
  // perimeter chips clear MIN_GATE_SPACING (r=6.5 chips need ≥15px).
  Head: { kind: "triangle", cx: 120, cy: 26, s: 28, tip: "up" },
  Ajna: { kind: "triangle", cx: 120, cy: 78, s: 32, tip: "down" },
  Throat: { kind: "square", cx: 120, cy: 138, s: 52 },
  G: { kind: "diamond", cx: 120, cy: 204, s: 32 },
  Heart: { kind: "triangle", cx: 182, cy: 182, s: 24, tip: "down" },
  Sacral: { kind: "square", cx: 120, cy: 268, s: 48 },
  Solar_Plexus: { kind: "triangle", cx: 190, cy: 270, s: 32, tip: "up" },
  Spleen: { kind: "triangle", cx: 50, cy: 270, s: 32, tip: "up" },
  Root: { kind: "square", cx: 120, cy: 328, s: 46 },
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
 * Gate chip anchors — inner perimeter of each center, aligned toward channel
 * partners (Benjamin edge map for Throat: top 62/23/56, right 35/12/45,
 * bottom 8/31 + 33 near bottom-left, left 16/20).
 * Spacing enforced by assertGateSpacing() ≥ MIN_GATE_SPACING.
 */
const GATE_OFFSETS: Record<number, { dx: number; dy: number }> = {

  // Head — tip up: 61 tip, 64/63 base toward Ajna
  64: { dx: -12, dy: 12 },
  61: { dx: 0, dy: -14 },
  63: { dx: 12, dy: 12 },
  // Ajna — tip down: top base toward Head, tip toward Throat
  47: { dx: -16, dy: -14 },
  24: { dx: 0, dy: -16 },
  4: { dx: 16, dy: -14 },
  17: { dx: -14, dy: 12 },
  43: { dx: 0, dy: 20 },
  11: { dx: 14, dy: 12 },
  // Throat
  62: { dx: -14, dy: -23.5 },
  23: { dx: 3.4, dy: -23.5 },
  56: { dx: 18.4, dy: -23.5 },
  16: { dx: -23.5, dy: -11.9 },
  20: { dx: -23.5, dy: 3.2 },
  31: { dx: -9, dy: 23.5 },
  8: { dx: 7.4, dy: 23.5 },
  33: { dx: -23.5, dy: 19.6 },
  35: { dx: 23.5, dy: -9.4 },
  12: { dx: 23.5, dy: 5.6 },
  45: { dx: 23.5, dy: 22.5 },
  // G
  7: { dx: 0, dy: -29.5 },
  1: { dx: 14.8, dy: -14.7 },
  13: { dx: 29.5, dy: 0 },
  10: { dx: -14.7, dy: -14.7 },
  15: { dx: -0.2, dy: 29.3 },
  2: { dx: -14.7, dy: 14.8 },
  46: { dx: -29.5, dy: 0 },
  25: { dx: 14.8, dy: 14.8 },
  // Heart / Ego — toward Throat / SP / Spleen / G
  21: { dx: 10, dy: -10 },
  40: { dx: 10, dy: 10 },
  26: { dx: -10, dy: 10 },
  51: { dx: -10, dy: -10 },
  // Sacral
  5: { dx: -11.4, dy: -21.5 },
  14: { dx: 7, dy: -21.5 },
  29: { dx: 21.5, dy: -17.2 },
  59: { dx: 21.5, dy: 1.9 },
  9: { dx: 21.5, dy: 21 },
  3: { dx: 2.9, dy: 21.5 },
  42: { dx: -16.1, dy: 21.5 },
  27: { dx: -21.5, dy: 7.5 },
  34: { dx: -21.5, dy: -10.4 },
  // Solar Plexus
  36: { dx: 19.1, dy: 5.8 },
  22: { dx: 21.5, dy: 21.9 },
  37: { dx: -3.1, dy: 21.9 },
  6: { dx: 8.5, dy: -13.8 },
  49: { dx: -27.8, dy: 21.9 },
  55: { dx: -16.1, dy: 0.2 },
  30: { dx: -5.5, dy: -19.4 },
  // Spleen
  48: { dx: 0, dy: -29.5 },
  57: { dx: 11.7, dy: -7.8 },
  44: { dx: 22.8, dy: 12.7 },
  50: { dx: 11, dy: 21.9 },
  32: { dx: -11, dy: 21.9 },
  28: { dx: -22.8, dy: 12.7 },
  18: { dx: -11.7, dy: -7.8 },
  // Root
  58: { dx: -20.5, dy: -20.5 },
  38: { dx: -2.3, dy: -20.5 },
  54: { dx: 15.5, dy: -20.5 },
  53: { dx: 20.5, dy: -6.4 },
  60: { dx: 20.5, dy: 9.9 },
  52: { dx: 9.9, dy: 20.5 },
  19: { dx: -6.4, dy: 20.5 },
  39: { dx: -20.5, dy: 15.5 },
  41: { dx: -20.5, dy: -2.3 },
};


export function gateAnchor(gate: number, preferCenter?: CenterKey): { x: number; y: number } {
  const center = preferCenter || GATE_TO_CENTER[gate];
  if (!center) return { x: VB.w / 2, y: VB.h / 2 };
  const g = CENTER_GEOM[center];
  const off = GATE_OFFSETS[gate] || { dx: 0, dy: 0 };
  return { x: g.cx + off.dx, y: g.cy + off.dy };
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
  const A = CENTER_GEOM[c1];
  const B = CENTER_GEOM[c2];
  // Termini sit near gate badges (inside centers) so strokes meet chips cleanly
  const t = 0.72;
  return {
    x1: A.cx + (a0.x - A.cx) * t,
    y1: A.cy + (a0.y - A.cy) * t,
    x2: B.cx + (a1.x - B.cx) * t,
    y2: B.cy + (a1.y - B.cy) * t,
    c1,
    c2,
  };
}

/** Center-pair keys that should arc along the silhouette (not straight diagonals). */
function outerArcSide(c1: CenterKey, c2: CenterKey): "left" | "right" | null {
  const pair = new Set([c1, c2]);
  // Left perimeter: Throat/G/Sacral ↔ Spleen, Spleen ↔ Root
  if (pair.has("Spleen") && (pair.has("Throat") || pair.has("G") || pair.has("Root"))) {
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
 * SVG path `d` for a channel. Spine / inner links are straight; outer
 * Throat↔Spleen / Throat↔SP / side↔Root (etc.) use wide cubic Beziers
 * that follow the chalk silhouette perimeter.
 */
export function channelPathD(gates: [number, number] | number[]): string | null {
  const ep = channelEndpoints(gates);
  if (!ep) return null;
  const { x1, y1, x2, y2, c1, c2 } = ep;
  const side = outerArcSide(c1, c2);
  if (!side) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  // Wide outer cubic that hugs the chalk silhouette (shoulders → waist → hips)
  const midY = (y1 + y2) / 2;
  const span = Math.abs(y2 - y1);
  // Stronger pull for long vertical spans (Throat↔Spleen/SP); milder for Root sides
  const pull = span > 80 ? 52 : span > 40 ? 44 : 36;
  const edgeX = side === "left" ? 28 : VB.w - 28;
  const cpx1 = side === "left" ? Math.min(x1 - 8, edgeX + pull * 0.15) : Math.max(x1 + 8, edgeX - pull * 0.15);
  const cpx2 = side === "left" ? Math.min(x2 - 8, edgeX + pull * 0.15) : Math.max(x2 + 8, edgeX - pull * 0.15);
  // Bias first control toward upper third, second toward lower third of the span
  const cpy1 = y1 + (midY - y1) * 0.55;
  const cpy2 = y2 - (y2 - midY) * 0.55;
  // Nudge controls further outward at mid-height (widest torso)
  const out1 = side === "left" ? Math.min(cpx1, edgeX) : Math.max(cpx1, edgeX);
  const out2 = side === "left" ? Math.min(cpx2, edgeX) : Math.max(cpx2, edgeX);
  return `M ${x1} ${y1} C ${out1} ${cpy1}, ${out2} ${cpy2}, ${x2} ${y2}`;
}

/**
 * Half-channel for a hanging gate: from the held-side channel terminus
 * along the lattice toward the missing partner, stopping at the path midpoint.
 */
export function hangingHalfChannelPathD(held: number, missing: number): string | null {
  const ep = channelEndpoints([held, missing]);
  if (!ep) return null;
  const heldPos = gateAnchor(held);
  const d1 = Math.hypot(ep.x1 - heldPos.x, ep.y1 - heldPos.y);
  const d2 = Math.hypot(ep.x2 - heldPos.x, ep.y2 - heldPos.y);
  const fromHeld = d1 <= d2;
  const x0 = fromHeld ? ep.x1 : ep.x2;
  const y0 = fromHeld ? ep.y1 : ep.y2;
  const mx = (ep.x1 + ep.x2) / 2;
  const my = (ep.y1 + ep.y2) / 2;
  return `M ${x0} ${y0} L ${mx} ${my}`;
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
