import {
  CENTER_GEOM,
  GATE_TO_CENTER,
  gateAnchor,
  latticeGatePair,
  type CenterKey,
  type CenterGeom,
} from "./bodygraphGeometry";

// Chart-only insets: the classic perimeter chips and compact paths are untouched.
export const EDITORIAL_CENTERS = {
  ...CENTER_GEOM,
  Head: { ...CENTER_GEOM.Head, cy: 12, s: 44 },
  Ajna: { ...CENTER_GEOM.Ajna, cy: 94, s: 44 },
  Throat: { ...CENTER_GEOM.Throat, cy: 196, s: 74 },
  G: { ...CENTER_GEOM.G, cy: 290, s: 44 },
  Heart: { ...CENTER_GEOM.Heart, cx: 190, cy: 270, s: 44 },
  Sacral: { ...CENTER_GEOM.Sacral, cy: 382, s: 64 },
  Root: { ...CENTER_GEOM.Root, cy: 510, s: 64 },
  Spleen: { ...CENTER_GEOM.Spleen, cx: 49, cy: 418, s: 50 },
  Solar_Plexus: { ...CENTER_GEOM.Solar_Plexus, cx: 191, cy: 418, s: 50 },
} satisfies Record<CenterKey, CenterGeom>;

// The taller editorial layout makes room for real 12px labels on narrow phones.
// All glyph bounds (not just anchor points) stay inside their own center.
const INSETS: Record<number, [number, number]> = {
  64: [-17, 15],
  61: [0, 15],
  63: [17, 15],
  47: [-19, -18],
  24: [0, -18],
  4: [19, -18],
  17: [-10, 0],
  43: [0, 19],
  11: [10, 0],
  62: [-20, -26],
  23: [0, -26],
  56: [20, -26],
  16: [-26, -8],
  20: [-26, 10],
  33: [-26, 26],
  31: [-8, 26],
  8: [9, 26],
  35: [26, -8],
  12: [26, 10],
  45: [26, 26],
  7: [0, -27],
  1: [14, -11],
  13: [-14, -11],
  10: [-27, 0],
  15: [-14, 11],
  2: [0, 27],
  46: [14, 11],
  25: [27, 0],
  21: [5, -17],
  51: [-17, -17],
  26: [-9, 2],
  40: [9, 2],
  5: [-18, -24],
  14: [0, -24],
  29: [18, -24],
  27: [-22, 8],
  34: [-22, -8],
  59: [22, 0],
  42: [-18, 24],
  3: [0, 24],
  9: [18, 24],
  36: [0, -25],
  37: [-10, -6],
  22: [10, -6],
  6: [-18, 11],
  30: [-24, 27],
  55: [-6, 27],
  49: [13, 27],
  48: [0, -25],
  18: [12, 27],
  57: [10, -6],
  44: [18, 11],
  28: [-24, 27],
  32: [-6, 27],
  50: [28, 27],
  53: [-18, -24],
  60: [0, -24],
  52: [18, -24],
  58: [-22, -7],
  38: [-22, 9],
  54: [-18, 24],
  41: [22, -7],
  39: [22, 9],
  19: [18, 24],
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
