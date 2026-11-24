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
export const EDITORIAL_CENTERS = {
  Head: { kind: "triangle", cx: 120, cy: 26, width: 86, height: 44, tip: "up" },
  Ajna: {
    kind: "triangle",
    cx: 120,
    cy: 80,
    width: 88,
    height: 58,
    tip: "down",
  },
  Throat: { kind: "square", cx: 120, cy: 140, width: 60, height: 60 },
  G: { kind: "diamond", cx: 120, cy: 207, width: 106, height: 68 },
  Heart: {
    kind: "triangle",
    cx: 194,
    cy: 190,
    width: 80,
    height: 60,
    tip: "down",
  },
  Sacral: { kind: "square", cx: 120, cy: 274, width: 60, height: 60 },
  Root: { kind: "square", cx: 120, cy: 337, width: 60, height: 60 },
  Spleen: {
    kind: "triangle",
    cx: 46,
    cy: 265,
    width: 84,
    height: 86,
    tip: "up",
  },
  Solar_Plexus: {
    kind: "triangle",
    cx: 194,
    cy: 265,
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
      [x + w, 50],
      [x - w, 50],
    ];
  else
    points = [
      [x, y - h],
      [x + w, y + h],
      [x - w, y + h],
    ];
  return roundedPolygonPath(points, hit ? 0 : 6);
}

// A compact perimeter/grid packing: all64 gates retained, no smaller type.
const INSETS: Record<number, [number, number]> = {
  64: [-18, 13],
  61: [0, 13],
  63: [18, 13],
  47: [-18, -21.6],
  24: [0, -21.6],
  4: [18, -21.6],
  17: [-9, -7],
  11: [9, -7],
  43: [0, 7.6],
  62: [-18, -23.2],
  23: [0, -23.2],
  56: [18, -23.2],
  16: [-18, -8.6],
  35: [18, -8.6],
  20: [-18, 6],
  31: [0, 6],
  12: [18, 6],
  33: [-18, 20.6],
  8: [0, 20.6],
  45: [18, 20.6],
  7: [0, -22.5],
  13: [-17, -7.5],
  1: [0, -7.5],
  25: [17, -7.5],
  10: [-17, 7.5],
  15: [0, 7.5],
  46: [17, 7.5],
  2: [0, 22.15],
  21: [-10, -22.1],
  51: [10, -22.1],
  26: [-9, -7.5],
  40: [9, -7.5],
  5: [-18, -23.2],
  14: [0, -23.2],
  29: [18, -23.2],
  34: [-18, -8.6],
  27: [-18, 6],
  59: [18, 0],
  42: [-18, 20.6],
  3: [0, 20.6],
  9: [18, 20.6],
  36: [0, -17.5],
  37: [-9.25, 2],
  22: [9.25, 2],
  6: [0, 18],
  30: [-18, 33],
  55: [0, 33],
  49: [18, 33],
  48: [0, -17.5],
  57: [-9.25, 2],
  18: [9.25, 2],
  44: [0, 18],
  28: [-18, 33],
  32: [0, 33],
  50: [18, 33],
  53: [-18, -23.2],
  60: [0, -23.2],
  52: [18, -23.2],
  58: [-18, -8.6],
  38: [-18, 6],
  41: [18, -8.6],
  39: [18, 6],
  54: [-18, 20.6],
  19: [18, 20.6],
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

// Visible straight bridges are measured edge-to-edge. Including the hidden
// in-center length would swallow a 45% hanging stroke in the compact layout.
const outlines = new Map<CenterKey, Array<[number, number]>>();
function centerOutline(center: CenterKey) {
  const cached = outlines.get(center);
  if (cached) return cached;
  const tokens =
    editorialCenterPath(center).match(/[MLQZ]|-?\d+(?:\.\d+)?/g) ?? [];
  const points: Array<[number, number]> = [];
  let i = 0;
  while (i < tokens.length) {
    const command = tokens[i++];
    if (command === "M" || command === "L")
      points.push([Number(tokens[i++]), Number(tokens[i++])]);
    else if (command === "Q") {
      const start = points[points.length - 1];
      const cx = Number(tokens[i++]),
        cy = Number(tokens[i++]);
      const x = Number(tokens[i++]),
        y = Number(tokens[i++]);
      for (let step = 1; step <= 24; step++) {
        const t = step / 24,
          u = 1 - t;
        points.push([
          u * u * start[0] + 2 * u * t * cx + t * t * x,
          u * u * start[1] + 2 * u * t * cy + t * t * y,
        ]);
      }
    }
  }
  outlines.set(center, points);
  return points;
}
function boundaryPoint(
  center: CenterKey,
  start: { x: number; y: number },
  end: { x: number; y: number },
) {
  const polygon = centerOutline(center);
  let low = 0,
    high = 1;
  for (let step = 0; step < 24; step++) {
    const t = (low + high) / 2;
    const x = start.x + (end.x - start.x) * t,
      y = start.y + (end.y - start.y) * t;
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i],
        b = polygon[j];
      if (
        a[1] > y !== b[1] > y &&
        x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]
      )
        inside = !inside;
    }
    if (inside) low = t;
    else high = t;
  }
  return {
    x: start.x + (end.x - start.x) * high,
    y: start.y + (end.y - start.y) * high,
  };
}

export function editorialChannelPath(gates: readonly number[]): string {
  const [a, b] = gates;
  const start = editorialGateAnchor(a);
  const end = editorialGateAnchor(b);
  const lane = EDITORIAL_OUTER_LANES[bridgeKey(a, b)];
  if (lane !== undefined) {
    const dy = (end.y - start.y) / 4;
    return `M ${start.x} ${start.y} C ${lane} ${start.y + dy}, ${lane} ${end.y - dy}, ${end.x} ${end.y}`;
  }
  const from = boundaryPoint(GATE_TO_CENTER[a], start, end);
  const to = boundaryPoint(GATE_TO_CENTER[b], end, start);
  return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
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
