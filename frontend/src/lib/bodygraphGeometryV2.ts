/**
 * Chart-only Field Notes geometry (v9).
 * Ports the locked v8 silhouette and v9 curve_route from the mockup generator.
 * Not used by Share / compact BodyGraph.
 */
import { SILHOUETTE_PATH } from "./bodygraphSilhouetteV2";

export type Pt = [number, number];

export const VBW = 420;
export const VBH = 720;
export const FIGURE_VIEWBOX = "-47 0 535 800";
export const FIGURE_VIEWBOX_TUPLE = [-47, 0, 535, 800] as const;

/** Full defined channel stroke. Hanging fades are thinner; unused paths are hairlines. */
export const CHANNEL_WEIGHT = 7.5;
export const HANGING_WEIGHT = 5;
export const HAIRLINE_WEIGHT = 1;
export const BOTH_CASING_EXTRA = 1.6;
export const BOTH_CORE_WEIGHT = 3;

export const CHANNELS: Array<[number, number]> = [
  [1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31], [9, 52],
  [10, 20], [10, 34], [10, 57], [11, 56], [12, 22], [13, 33], [16, 48], [17, 62],
  [18, 58], [19, 49], [20, 34], [20, 57], [21, 45], [23, 43], [24, 61], [25, 51],
  [26, 44], [27, 50], [28, 38], [29, 46], [30, 41], [32, 54], [34, 57], [35, 36],
  [37, 40], [39, 55], [42, 53], [47, 64],
];

export const CHANNEL_NAMES: Record<string, string> = {
  "1-8": "Inspiration",
  "2-14": "The Beat",
  "3-60": "Mutation",
  "4-63": "Logic",
  "5-15": "Rhythm",
  "6-59": "Intimacy",
  "7-31": "The Alpha",
  "9-52": "Concentration",
  "10-20": "Awakening",
  "10-34": "Exploration",
  "10-57": "Perfected Form",
  "11-56": "Curiosity",
  "12-22": "Openness",
  "13-33": "The Prodigal",
  "16-48": "The Wavelength",
  "17-62": "Acceptance",
  "18-58": "Judgment",
  "19-49": "Synthesis",
  "20-34": "Charisma",
  "20-57": "The Brain Wave",
  "21-45": "The Money Line",
  "23-43": "Structuring",
  "24-61": "Awareness",
  "25-51": "Initiation",
  "26-44": "Surrender",
  "27-50": "Preservation",
  "28-38": "Struggle",
  "29-46": "Discovery",
  "30-41": "Recognition",
  "32-54": "Transformation",
  "34-57": "Power",
  "35-36": "Transitoriness",
  "37-40": "Community",
  "39-55": "Emoting",
  "42-53": "Maturation",
  "47-64": "Abstraction",
};

export const CENTER_SHAPES: Record<string, Pt[]> = {
  Head: [[210, 14], [262, 88], [158, 88]],
  Ajna: [[158, 112], [262, 112], [210, 188]],
  Throat: [[158, 214], [262, 214], [262, 314], [158, 314]],
  G: [[210, 338], [266, 394], [210, 450], [154, 394]],
  Heart: [[312, 398], [358, 466], [266, 466]],
  Sacral: [[162, 488], [258, 488], [258, 584], [162, 584]],
  Spleen: [[28, 462], [136, 530], [28, 598]],
  Solar_Plexus: [[392, 462], [392, 598], [284, 530]],
  Root: [[162, 612], [258, 612], [258, 704], [162, 704]],
};

export const CENTER_GATES: Record<string, number[]> = {
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

/** Top-to-bottom reading order. Side centers sit with the vessel, Spleen before Sacral. */
export const CENTER_READING_ORDER = [
  "Head", "Ajna", "Throat", "G", "Heart", "Spleen", "Sacral", "Solar_Plexus", "Root",
] as const;

export const MOTOR_CENTERS = new Set(["Sacral", "Solar_Plexus", "Heart"]);

export const GATE_TO_CENTER: Record<number, string> = {};
for (const [center, gates] of Object.entries(CENTER_GATES)) {
  for (const gate of gates) GATE_TO_CENTER[gate] = center;
}

/** Exact anchors from the locked 420-wide Field Notes geometry. */
export const GATES: Record<number, Pt> = {
  64: [182, 74], 61: [210, 74], 63: [238, 74],
  47: [182, 124], 24: [210, 124], 4: [238, 124],
  17: [191, 148], 11: [229, 148], 43: [210, 170],
  62: [184, 226], 23: [210, 226], 56: [236, 226],
  16: [170, 248], 20: [170, 280],
  35: [250, 244], 12: [250, 265], 45: [250, 286],
  31: [186, 302], 8: [210, 302], 33: [232, 302],
  1: [210, 354], 2: [210, 434], 10: [170, 394], 25: [250, 394],
  7: [189.778175, 373.778175], 13: [230.221825, 373.778175],
  15: [189.778175, 414.221825], 46: [230.221825, 414.221825],
  21: [312, 417], 51: [298.034046, 434.69451], 26: [292, 457], 40: [338, 454],
  5: [186, 500], 14: [210, 500], 29: [234, 500],
  34: [174, 520], 27: [174, 552], 59: [246, 540],
  42: [186, 572], 3: [210, 572], 9: [234, 572],
  53: [186, 624], 60: [210, 624], 52: [234, 624],
  54: [174, 645], 38: [174, 667], 58: [174, 689],
  19: [246, 645], 39: [246, 667], 41: [246, 689],
  48: [44.912448, 480.425386], 57: [65.753966, 497.124378],
  44: [83.964241, 509.920526], 50: [106.36624, 520.505494],
  18: [52.414818, 573.766242], 28: [72.33483, 557.551244], 32: [91.9296, 546.232588],
  36: [375.087552, 480.425386], 22: [354.246034, 497.124378],
  37: [336.035759, 509.920526], 6: [313.63376, 520.505494],
  30: [367.585182, 573.766242], 55: [347.66517, 557.551244], 49: [328.0704, 546.232588],
};

export const SILHOUETTE_D = SILHOUETTE_PATH;

/** V2 chip clearance. Classic assert:gate-spacing stays on V1. */
export const MIN_GATE_SPACING_V2 = 21;

const ROUTE_20_34: Pt[] = [[170, 280], [140, 300], [140, 500], [174, 520]];

/**
 * Throat-to-side routes drop below the planet columns before they arc out.
 * 26–44 takes a waist via so the hairline does not cut the Sacral.
 */
export const CURVE_VIAS: Record<string, Pt[]> = {
  "26-44": [[292, 457], [142, 472], [84, 510]],
  "16-48": [[170, 248], [155, 305], [70, 380], [44.91244815745596, 480.4253861867259]],
  "35-36": [[250, 244], [265, 305], [350, 380], [375.08755184254403, 480.4253861867259]],
};

const CURVE_HUB: Pt = [210, 410];
const CURVE_SPINE = 210;

export function channelKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export function normCenter(name: string): string {
  const map: Record<string, string> = {
    Solar_Plexus: "Solar_Plexus",
    "Solar Plexus": "Solar_Plexus",
    Ego: "Heart",
    "Ego / Heart": "Heart",
    Heart: "Heart",
    "G / Identity": "G",
    Identity: "G",
  };
  return map[name] || name.replace(/ /g, "_");
}

function dist(a: Pt, b: Pt): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function lerp(a: Pt, b: Pt, t: number): Pt {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function fmt1(n: number): string {
  const sign = n < 0 ? "-" : "";
  const v = Math.abs(n);
  const scaled = v * 10;
  const base = Math.floor(scaled);
  let frac = scaled - base;
  // Guard binary dust so 1.25 stays a true half.
  if (Math.abs(frac - 0.5) < 1e-8) frac = 0.5;
  if (Math.abs(frac) < 1e-8) frac = 0;
  let digit = base;
  if (frac > 0.5) digit = base + 1;
  else if (frac < 0.5) digit = base;
  else digit = base % 2 === 0 ? base : base + 1;
  const whole = Math.floor(digit / 10);
  const tenth = digit % 10;
  return `${sign}${whole}.${tenth}`;
}

function route(a: number, b: number): Pt[] {
  const key = channelKey(a, b);
  if (key === "20-34") {
    const pts = ROUTE_20_34;
    return a === 20 ? pts.map((p) => [p[0], p[1]] as Pt) : [...pts].reverse();
  }
  return [GATES[a], GATES[b]];
}

function polar(p: Pt, hub: Pt = CURVE_HUB): [number, number] {
  const dx = p[0] - hub[0];
  const dy = p[1] - hub[1];
  return [Math.hypot(dx, dy), Math.atan2(dy, dx)];
}

function fromPolar(r: number, a: number, hub: Pt = CURVE_HUB): Pt {
  return [hub[0] + r * Math.cos(a), hub[1] + r * Math.sin(a)];
}

function adiff(a0: number, a1: number): number {
  return ((a1 - a0 + Math.PI) % (2 * Math.PI)) - Math.PI;
}

type Cubic = [Pt, Pt, Pt, Pt];

function cubicPts(p0: Pt, c1: Pt, c2: Pt, p1: Pt, n = 28): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    out.push([
      u ** 3 * p0[0] + 3 * u ** 2 * t * c1[0] + 3 * u * t ** 2 * c2[0] + t ** 3 * p1[0],
      u ** 3 * p0[1] + 3 * u ** 2 * t * c1[1] + 3 * u * t ** 2 * c2[1] + t ** 3 * p1[1],
    ]);
  }
  return out;
}

function throughMid(p0: Pt, mid: Pt, p1: Pt): Cubic {
  const chordMid = lerp(p0, p1, 0.5);
  const v: Pt = [((mid[0] - chordMid[0]) * 4) / 3, ((mid[1] - chordMid[1]) * 4) / 3];
  const c1: Pt = [(2 * p0[0] + p1[0]) / 3 + v[0], (2 * p0[1] + p1[1]) / 3 + v[1]];
  const c2: Pt = [(p0[0] + 2 * p1[0]) / 3 + v[0], (p0[1] + 2 * p1[1]) / 3 + v[1]];
  return [p0, c1, c2, p1];
}

function catmull(pts: Pt[], tau = 1): Cubic[] {
  if (pts.length === 2) return [throughMid(pts[0], lerp(pts[0], pts[1], 0.5), pts[1])];
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  const segs: Cubic[] = [];
  for (let i = 1; i < P.length - 2; i++) {
    const p0 = P[i - 1];
    const p1 = P[i];
    const p2 = P[i + 1];
    const p3 = P[i + 2];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / (6 * tau), p1[1] + (p2[1] - p0[1]) / (6 * tau)];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / (6 * tau), p2[1] - (p3[1] - p1[1]) / (6 * tau)];
    segs.push([p1, c1, c2, p2]);
  }
  return segs;
}

function curveD(segs: Cubic[]): string {
  const f = (p: Pt) => `${fmt1(p[0])},${fmt1(p[1])}`;
  let d = `M${f(segs[0][0])}`;
  for (const [, c1, c2, p1] of segs) d += ` C${f(c1)} ${f(c2)} ${f(p1)}`;
  return d;
}

function sample(segs: Cubic[], n = 12): Pt[] {
  const pts: Pt[] = [];
  segs.forEach((seg, i) => {
    const s = cubicPts(seg[0], seg[1], seg[2], seg[3], n);
    pts.push(...(i === 0 ? s : s.slice(1)));
  });
  return pts;
}

function pointInPoly(p: Pt, poly: Pt[]): boolean {
  const [x, y] = p;
  let inside = false;
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    if ((y1 > y) !== (y2 > y) && x < ((x2 - x1) * (y - y1)) / (y2 - y1 || 1e-12) + x1) {
      inside = !inside;
    }
  }
  return inside;
}

function distToSeg(p: Pt, a: Pt, b: Pt): number {
  const vx = b[0] - a[0];
  const vy = b[1] - a[1];
  const L2 = vx * vx + vy * vy;
  if (L2 < 1e-9) return dist(p, a);
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * vx + (p[1] - a[1]) * vy) / L2));
  return Math.hypot(p[0] - (a[0] + t * vx), p[1] - (a[1] + t * vy));
}

function distToPoly(p: Pt, poly: Pt[]): number {
  if (pointInPoly(p, poly)) return 0;
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    best = Math.min(best, distToSeg(p, poly[i], poly[(i + 1) % poly.length]));
  }
  return best;
}

function clearance(samples: Pt[], a: number, b: number): number {
  const skip = new Set([GATE_TO_CENTER[a], GATE_TO_CENTER[b]]);
  const body = samples.length > 6 ? samples.slice(2, -2) : samples;
  let worst = 1e9;
  for (const [name, poly] of Object.entries(CENTER_SHAPES)) {
    if (skip.has(name)) continue;
    for (const p of body) worst = Math.min(worst, distToPoly(p, poly));
  }
  return worst;
}

function orbitalMid(p0: Pt, p1: Pt, outward = 1): [Pt, number, number] {
  const [r0, a0] = polar(p0);
  const [r1, a1] = polar(p1);
  const da = adiff(a0, a1);
  const span = Math.abs(da);
  const chord = dist(p0, p1);
  const midA = a0 + da / 2;
  let midR = 0.5 * (r0 + r1);
  const boost = Math.min(52, 8 + 0.22 * chord * Math.min(1, span / ((70 * Math.PI) / 180)));
  midR = Math.max(midR + boost * outward, Math.max(r0, r1) * 0.72);
  return [fromPolar(midR, midA), span, chord];
}

function perpMid(p0: Pt, p1: Pt, bulge: number, flip = false): Pt {
  const vx = p1[0] - p0[0];
  const vy = p1[1] - p0[1];
  const n = Math.hypot(vx, vy) || 1;
  let px = -vy / n;
  let py = vx / n;
  const mid = lerp(p0, p1, 0.5);
  if (Math.abs(mid[0] + px * 10 - CURVE_SPINE) < Math.abs(mid[0] - px * 10 - CURVE_SPINE)) {
    px = -px;
    py = -py;
  }
  if (flip) {
    px = -px;
    py = -py;
  }
  return [mid[0] + px * bulge, mid[1] + py * bulge];
}

export type CurveRoute = { d: string; samples: Pt[] };

/** Smooth gate-to-gate curve. Short stacks bow 4–10; long laterals arc outward. */
export function curveRoute(a: number, b: number): CurveRoute {
  const raw = route(a, b);
  const p0 = GATES[a];
  const p1 = GATES[b];
  const key = channelKey(a, b);
  if (CURVE_VIAS[key]) {
    const pts = a === Math.min(a, b) ? CURVE_VIAS[key] : [...CURVE_VIAS[key]].reverse();
    const segs = catmull(pts);
    return { d: curveD(segs), samples: sample(segs, 16) };
  }
  if (raw.length > 2) {
    const segs = catmull(raw);
    return { d: curveD(segs), samples: sample(segs, 16) };
  }
  const chord = dist(p0, p1);
  const dx = Math.abs(p1[0] - p0[0]);
  const dy = Math.abs(p1[1] - p0[1]);
  const stacked = chord < 90 || (dx < 30 && dy > dx * 1.6);
  const straight = Array.from({ length: 21 }, (_, i) => lerp(p0, p1, i / 20));
  const straightClr = clearance(straight, a, b);
  if (straightClr >= 8 && stacked) {
    const bulge = Math.min(10, Math.max(4, 0.08 * chord));
    const mid = perpMid(p0, p1, bulge);
    const segs = [throughMid(p0, mid, p1)];
    return { d: curveD(segs), samples: sample(segs, 20) };
  }
  const mid = orbitalMid(p0, p1, 1)[0];
  let segs: Cubic[] = [throughMid(p0, mid, p1)];
  let samples = sample(segs, 24);
  if (clearance(samples, a, b) < 10) {
    let found = false;
    for (const extra of [1.25, 1.5, 1.85, 2.2]) {
      const mid2 = orbitalMid(p0, p1, extra)[0];
      const segs2 = [throughMid(p0, mid2, p1)];
      const samp2 = sample(segs2, 24);
      if (clearance(samp2, a, b) >= 10) {
        segs = segs2;
        samples = samp2;
        found = true;
        break;
      }
    }
    if (!found) {
      const bulge = Math.min(36, Math.max(12, 0.16 * chord));
      let bestC = -1;
      let best: { segs: Cubic[]; samples: Pt[] } = { segs, samples };
      for (const flip of [false, true]) {
        const mid3 = perpMid(p0, p1, bulge, flip);
        const segs3 = [throughMid(p0, mid3, p1)];
        const samp3 = sample(segs3, 24);
        const c3 = clearance(samp3, a, b);
        if (c3 > bestC) {
          bestC = c3;
          best = { segs: segs3, samples: samp3 };
        }
      }
      segs = best.segs;
      samples = best.samples;
    }
  }
  return { d: curveD(segs), samples };
}

/** Polyline of sampled points, one decimal, matching the hanging-fade drawing. */
export function pointsPath(pts: Pt[]): string {
  if (!pts.length) return "";
  return pts.map((p, i) => `${i === 0 ? "M" : "L"}${fmt1(p[0])},${fmt1(p[1])}`).join(" ");
}

/** Split a sampled curve at arc-length midpoint. First half starts at the first gate. */
export function splitRoute(pts: Pt[]): [Pt[], Pt[]] {
  if (pts.length < 2) return [pts, pts];
  const seg = [0];
  for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + dist(pts[i - 1], pts[i]));
  const mid = seg[seg.length - 1] / 2;
  let i = 1;
  while (i < seg.length && seg[i] < mid) i++;
  const span = seg[i] - seg[i - 1] || 1;
  const m = lerp(pts[i - 1], pts[i], (mid - seg[i - 1]) / span);
  return [pts.slice(0, i).concat([m]), [m].concat(pts.slice(i))];
}

export function roundedPolyPath(pts: Pt[], radius: number): string {
  const n = pts.length;
  const cmds: string[] = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i + n - 1) % n];
    const cur = pts[i];
    const next = pts[(i + 1) % n];
    const v1x = prev[0] - cur[0];
    const v1y = prev[1] - cur[1];
    const v2x = next[0] - cur[0];
    const v2y = next[1] - cur[1];
    const l1 = Math.hypot(v1x, v1y) || 1;
    const l2 = Math.hypot(v2x, v2y) || 1;
    const r = Math.min(radius, l1 / 2, l2 / 2);
    const inn: Pt = [cur[0] + (v1x / l1) * r, cur[1] + (v1y / l1) * r];
    const out: Pt = [cur[0] + (v2x / l2) * r, cur[1] + (v2y / l2) * r];
    const f = (p: Pt) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`;
    cmds.push(`${i === 0 ? "M" : "L"}${f(inn)}`);
    cmds.push(`Q${f(cur)} ${f(out)}`);
  }
  cmds.push("Z");
  return cmds.join(" ");
}

export function assertGateSpacingV2(minSep = MIN_GATE_SPACING_V2): Array<{ a: number; b: number; dist: number }> {
  const ids = Object.keys(GATES).map(Number).sort((a, b) => a - b);
  const bad: Array<{ a: number; b: number; dist: number }> = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const d = dist(GATES[ids[i]], GATES[ids[j]]);
      if (d < minSep - 1e-6) bad.push({ a: ids[i], b: ids[j], dist: d });
    }
  }
  return bad;
}

export type GraphChannel = { gates?: number[]; name?: string; centers?: string[] };

function channelCenters(ch: GraphChannel): [string, string] | null {
  if (ch.centers && ch.centers.length >= 2) {
    return [normCenter(ch.centers[0]), normCenter(ch.centers[1])];
  }
  if (!ch.gates || ch.gates.length < 2) return null;
  const a = GATE_TO_CENTER[Number(ch.gates[0])];
  const b = GATE_TO_CENTER[Number(ch.gates[1])];
  if (!a || !b) return null;
  return [a, b];
}

/** Connected defined areas, each center list in body reading order. */
export function definitionAreas(definedCenters: string[], channels: GraphChannel[]): string[][] {
  const defined = new Set(definedCenters.map(normCenter));
  const adj = new Map<string, Set<string>>();
  defined.forEach((c) => adj.set(c, new Set()));
  for (const ch of channels) {
    const ends = channelCenters(ch);
    if (!ends) continue;
    const [c0, c1] = ends;
    if (c0 !== c1 && defined.has(c0) && defined.has(c1)) {
      adj.get(c0)!.add(c1);
      adj.get(c1)!.add(c0);
    }
  }
  const seen = new Set<string>();
  const areas: string[][] = [];
  const seeds = CENTER_READING_ORDER.filter((c) => defined.has(c));
  for (const seed of seeds) {
    if (seen.has(seed)) continue;
    const stack: string[] = [seed];
    const comp: string[] = [];
    while (stack.length) {
      const n = stack.pop()!;
      if (seen.has(n)) continue;
      seen.add(n);
      comp.push(n);
      const nexts = adj.get(n);
      if (nexts) nexts.forEach((next) => { if (!seen.has(next)) stack.push(next); });
    }
    comp.sort((a, b) => CENTER_READING_ORDER.indexOf(a as (typeof CENTER_READING_ORDER)[number]) - CENTER_READING_ORDER.indexOf(b as (typeof CENTER_READING_ORDER)[number]));
    areas.push(comp);
  }
  areas.sort((a, b) => CENTER_READING_ORDER.indexOf(a[0] as (typeof CENTER_READING_ORDER)[number]) - CENTER_READING_ORDER.indexOf(b[0] as (typeof CENTER_READING_ORDER)[number]));
  return areas;
}

export type JoiningGate = { gate: number; from: number; to: number };

/**
 * A gate that would join two defined areas by itself.
 * Drawn only when the chart has one. A channel that needs both ends stays a non-join.
 */
export function joiningGates(
  definedCenters: string[],
  channels: GraphChannel[],
  activated: number[],
): JoiningGate[] {
  const areas = definitionAreas(definedCenters, channels);
  if (areas.length < 2) return [];
  const areaOf = new Map<string, number>();
  areas.forEach((area, i) => area.forEach((c) => areaOf.set(c, i)));
  const active = new Set(activated);
  const found: JoiningGate[] = [];
  for (const [a, b] of CHANNELS) {
    const ca = GATE_TO_CENTER[a];
    const cb = GATE_TO_CENTER[b];
    const ia = areaOf.get(ca);
    const ib = areaOf.get(cb);
    if (ia == null || ib == null || ia === ib) continue;
    const aa = active.has(a);
    const bb = active.has(b);
    if (aa && !bb) found.push({ gate: b, from: a, to: b });
    else if (bb && !aa) found.push({ gate: a, from: b, to: a });
  }
  return found;
}

export function centerFamily(center: string): "clay" | "sand" | "sage" {
  if (center === "Root") return "sand";
  if (MOTOR_CENTERS.has(center)) return "clay";
  return "sage";
}

export const HD_PLANET_ORDER = [
  "Sun", "Earth", "North_Node", "South_Node", "Moon",
  "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
  "Uranus", "Neptune", "Pluto",
] as const;

/** Static gate-to-gate curves. Geometry does not depend on the chart. */
export const CURVE_BY_KEY: Record<string, CurveRoute> = {};
for (const [a, b] of CHANNELS) CURVE_BY_KEY[channelKey(a, b)] = curveRoute(a, b);

export const PLANET_GLYPH: Record<string, string> = {
  Sun: "☉",
  Earth: "⊕",
  North_Node: "☊",
  South_Node: "☋",
  Moon: "☽",
  Mercury: "☿",
  Venus: "♀",
  Mars: "♂",
  Jupiter: "♃",
  Saturn: "♄",
  Uranus: "♅",
  Neptune: "♆",
  Pluto: "♇",
};
