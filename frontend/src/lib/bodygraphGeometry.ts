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
  Head: { kind: "triangle", cx: 120, cy: 38, s: 26, tip: "up" },
  Ajna: { kind: "triangle", cx: 120, cy: 84, s: 28, tip: "down" },
  Throat: { kind: "square", cx: 120, cy: 130, s: 30 },
  G: { kind: "diamond", cx: 120, cy: 184, s: 32 },
  Heart: { kind: "triangle", cx: 174, cy: 172, s: 20, tip: "down" },
  Sacral: { kind: "square", cx: 120, cy: 242, s: 36 },
  Solar_Plexus: { kind: "triangle", cx: 180, cy: 250, s: 28, tip: "up" },
  Spleen: { kind: "triangle", cx: 60, cy: 250, s: 28, tip: "up" },
  Root: { kind: "square", cx: 120, cy: 310, s: 34 },
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

/**
 * Gate chip anchors — offsets kept *inside* the center border so r=8 badges
 * never collide with edges or each other (Grounded Vitality).
 */
const GATE_OFFSETS: Record<number, { dx: number; dy: number }> = {
  // Head
  64: { dx: -11, dy: 6 },
  61: { dx: 0, dy: -10 },
  63: { dx: 11, dy: 6 },
  // Ajna
  47: { dx: -12, dy: -4 },
  24: { dx: -13, dy: 6 },
  4: { dx: -8, dy: 12 },
  17: { dx: 8, dy: 12 },
  43: { dx: 13, dy: 6 },
  11: { dx: 12, dy: -4 },
  // Throat
  62: { dx: -7, dy: -11 },
  23: { dx: 7, dy: -11 },
  56: { dx: -12, dy: -6 },
  16: { dx: 12, dy: -6 },
  20: { dx: -12, dy: 2 },
  31: { dx: 0, dy: -12 },
  8: { dx: 0, dy: 12 },
  33: { dx: 12, dy: 2 },
  35: { dx: 12, dy: 8 },
  12: { dx: -12, dy: 8 },
  45: { dx: 10, dy: 11 },
  // G
  7: { dx: 0, dy: -14 },
  1: { dx: -10, dy: -10 },
  13: { dx: 10, dy: -10 },
  10: { dx: -14, dy: 0 },
  15: { dx: 14, dy: 0 },
  2: { dx: 0, dy: 14 },
  46: { dx: -10, dy: 10 },
  25: { dx: 10, dy: 10 },
  // Heart / Ego
  21: { dx: 8, dy: -5 },
  40: { dx: 9, dy: 7 },
  26: { dx: 0, dy: 10 },
  51: { dx: -7, dy: 7 },
  // Sacral
  5: { dx: -8, dy: -13 },
  14: { dx: 8, dy: -13 },
  29: { dx: -13, dy: -5 },
  59: { dx: 13, dy: 6 },
  9: { dx: -13, dy: 6 },
  3: { dx: 0, dy: 14 },
  42: { dx: 9, dy: 13 },
  27: { dx: -9, dy: 13 },
  34: { dx: -14, dy: 0 },
  // Solar Plexus
  36: { dx: -10, dy: -7 },
  22: { dx: -4, dy: -12 },
  37: { dx: 5, dy: -11 },
  6: { dx: -12, dy: 4 },
  49: { dx: 11, dy: -3 },
  55: { dx: 10, dy: 8 },
  30: { dx: 0, dy: 12 },
  // Spleen
  48: { dx: 10, dy: -7 },
  57: { dx: 12, dy: 0 },
  44: { dx: 8, dy: 10 },
  50: { dx: 0, dy: 12 },
  32: { dx: -9, dy: 9 },
  28: { dx: -11, dy: 2 },
  18: { dx: -6, dy: -11 },
  // Root
  58: { dx: -12, dy: -8 },
  38: { dx: -13, dy: 3 },
  54: { dx: -9, dy: 11 },
  53: { dx: 0, dy: 13 },
  60: { dx: 9, dy: 11 },
  52: { dx: 13, dy: 3 },
  19: { dx: 12, dy: -8 },
  39: { dx: 8, dy: -12 },
  41: { dx: -6, dy: -12 },
};

export function gateAnchor(gate: number, preferCenter?: CenterKey): { x: number; y: number } {
  const center = preferCenter || GATE_TO_CENTER[gate];
  if (!center) return { x: VB.w / 2, y: VB.h / 2 };
  const g = CENTER_GEOM[center];
  const off = GATE_OFFSETS[gate] || { dx: 0, dy: 0 };
  return { x: g.cx + off.dx, y: g.cy + off.dy };
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
