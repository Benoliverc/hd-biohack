import {
  GATE_TO_CENTER,
  gateAnchor,
  latticeGatePair,
  type CenterKey,
  roundedPolygonPath,
} from "./bodygraphGeometry";

// Chart-only compact layout. Classic/share geometry stays byte-identical.
// Width/height are explicit so legible in-center gates do not force a tall lattice.
type EditorialCenter = {
  kind: "triangle" | "diamond" | "square";
  cx: number;
  cy: number;
  width: number;
  height: number;
  tip?: "up" | "down";
};
export const EDITORIAL_MIN_WIDTH = 239;
export const EDITORIAL_FRAME_HEIGHT = 389.5;
export const EDITORIAL_CENTERS = {
  Head: { kind: "triangle", cx: 120, cy: 21, width: 96, height: 34, tip: "up" },
  Ajna: {
    kind: "triangle",
    cx: 120,
    cy: 75.5,
    width: 112,
    height: 52,
    tip: "down",
  },
  Throat: { kind: "square", cx: 120, cy: 142.5, width: 66, height: 56 },
  G: { kind: "diamond", cx: 120, cy: 214, width: 116, height: 64 },
  Heart: {
    kind: "triangle",
    cx: 194,
    cy: 201.2,
    width: 80,
    height: 60,
    tip: "down",
  },
  Sacral: { kind: "square", cx: 120, cy: 285.5, width: 66, height: 56 },
  Root: { kind: "square", cx: 120, cy: 354.3, width: 60, height: 56 },
  Spleen: {
    kind: "triangle",
    cx: 46,
    cy: 278.2,
    width: 84,
    height: 86,
    tip: "up",
  },
  Solar_Plexus: {
    kind: "triangle",
    cx: 197.5,
    cy: 278.2,
    width: 84,
    height: 86,
    tip: "up",
  },
} satisfies Record<CenterKey, EditorialCenter>;

export function editorialCenterPath(
  center: CenterKey,
  expand = 0,
  hit = false,
) {
  const g: EditorialCenter = EDITORIAL_CENTERS[center];
  const x = g.cx,
    y = g.cy;
  const w = g.width / 2 + expand,
    h = g.height / 2 + expand;
  let points: Array<[number, number]>;
  if (g.kind === "square")
    points = [
      [x - w, y - h],
      [x + w, y - h],
      [x + w, y + h],
      [x - w, y + h],
    ];
  else if (g.kind === "diamond")
    points = [
      [x, y - h],
      [x + w, y],
      [x, y + h],
      [x - w, y],
    ];
  else if (g.tip === "down")
    points = [
      [x - w, y - h],
      [x + w, y - h],
      [x, y + h],
    ];
  else if (hit && center === "Head")
    points = [
      [x, 0],
      [x + w, 45.5],
      [x - w, 45.5],
    ];
  else
    points = [
      [x, y - h],
      [x + w, y + h],
      [x - w, y + h],
    ];
  return roundedPolygonPath(points, hit ? 0 : 6);
}

// Denser12px label rows reclaim node height for real hanging-stroke corridors.
// All64 gates retain their own center and canonical channel-exit origins.
const INSETS: Record<number, [number, number]> = {
  64: [-18, 8.5],
  61: [0, 8.5],
  63: [18, 8.5],
  47: [-18, -18],
  24: [0, -18],
  4: [18, -18],
  17: [-9, -4.5],
  11: [9, -4.4],
  43: [0, 9],
  62: [-18, -20.4],
  23: [0, -11],
  56: [18, -20.4],
  16: [-18, -7],
  35: [18, -7],
  20: [-18, 6.4],
  31: [0, 18.7],
  12: [22, 6.4],
  33: [-18, 19.8],
  8: [18, 19.8],
  45: [0, 5.2],
  7: [0, -22.3],
  13: [-17, -7.5],
  1: [9, -16],
  25: [24.5, -7.1],
  10: [-32, 0],
  15: [-17, 7.8],
  46: [17, 7.8],
  2: [0, 20.7],
  21: [10, -22.1],
  51: [-17, -22.1],
  26: [9, -7.5],
  40: [-9, -7.5],
  5: [-18, -21.8],
  14: [0, -16.7],
  29: [18, -21.8],
  34: [-18, -8.3],
  27: [-19.5, 5.2],
  59: [18, 0],
  42: [-18, 19.8],
  3: [0, 19.8],
  9: [18, 19.8],
  36: [0, -17.5],
  37: [-11.25, 3.5],
  22: [9.25, 2],
  6: [-14, 18],
  30: [-18, 33],
  55: [0, 33],
  49: [18, 33],
  48: [0, -17.5],
  57: [9.25, 2],
  18: [18, 33],
  44: [-9.25, 2],
  28: [-18, 33],
  32: [0, 33],
  50: [15.5, 18],
  53: [-18, -21.8],
  60: [0, -21.8],
  52: [18, -21.8],
  58: [-18, -8.3],
  38: [-18, 5.2],
  41: [18, -8.3],
  39: [18, 5.2],
  54: [-18, 18.7],
  19: [18, 18.7],
};

export function editorialGateAnchor(gate: number) {
  const center = GATE_TO_CENTER[gate];
  const offset = INSETS[gate];
  if (!center || !offset) return gateAnchor(gate);
  const geom = EDITORIAL_CENTERS[center];
  return { x: geom.cx + offset[0], y: geom.cy + offset[1] };
}

export function bridgeKey(a: number, b: number) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

// Explicit, fixed-spacing outer lanes. Integration never overrides these cubics.
export const EDITORIAL_OUTER_LANES: Record<string, number> = {
  "16-48": 4,
  "20-57": 12,
  "10-57": 20,
  "28-38": 4,
  "32-54": 12,
  "39-55": 236,
  "19-49": 228,
  "30-41": 220,
};

export function editorialChannelPath(gates: readonly number[]): string {
  const [a, b] = gates;
  const start = editorialGateAnchor(a);
  const end = editorialGateAnchor(b);
  const lane = EDITORIAL_OUTER_LANES[bridgeKey(a, b)];
  if (lane !== undefined) {
    const dy = (end.y - start.y) / 4;
    return `M ${start.x} ${start.y} C ${lane} ${start.y + dy}, ${lane} ${end.y - dy}, ${end.x} ${end.y}`;
  }
  return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
}

export function editorialHangingDash(held: number, missing: number) {
  const gates = latticeGatePair(held, missing);
  if (!gates) return null;
  return {
    gates,
    dasharray: "45 100",
    dashoffset: held === gates[0] ? 0 : -55,
  };
}

export function editorialBadgeFontSize(renderedWidth: number) {
  return (12 * 240) / renderedWidth;
}

/** Contrast follows the actual center surface, not gate ownership/activation. */
export function editorialGateInk({
  defined,
  motor,
  activated,
}: {
  defined: boolean;
  motor: boolean;
  activated: boolean;
}) {
  if (defined && !motor) return activated ? "#f7f6f2" : "#e8e4da";
  if (defined && motor) return "#1c201d";
  return activated ? "#1c201d" : "#5e645c";
}
