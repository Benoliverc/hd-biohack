/** Independent rendered-path/font model, NOT an actual browser viewport stamp. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CHANNEL_LATTICE,
  GATE_TO_CENTER,
} from "../src/lib/bodygraphGeometry.ts";
import {
  EDITORIAL_CENTERS,
  EDITORIAL_MIN_WIDTH,
  EDITORIAL_FRAME_HEIGHT,
  editorialCenterPath,
  editorialGateAnchor,
  editorialChannelPath,
  editorialBadgeFontSize,
} from "../src/lib/editorialBodygraphGeometry.ts";
const metrics = JSON.parse(
  readFileSync(
    new URL("./fixtures/inter600-gate-bounds.json", import.meta.url),
  ),
);
// Parse emitted outlines independently of path generation; sample Q curves
// and include actual glyph AA + full underlines.
function polygon(path) {
  const points = [];
  for (const [, command, values] of path.matchAll(/([MLQZ])([^MLQZ]*)/g)) {
    const v = values.trim().split(/[ ,]+/).map(Number);
    if (command === "M" || command === "L") points.push(v);
    if (command === "Q") {
      const start = points.at(-1);
      for (let n = 1; n <= 32; n++) {
        const t = n / 32,
          u = 1 - t;
        points.push([
          u * u * start[0] + 2 * u * t * v[0] + t * t * v[2],
          u * u * start[1] + 2 * u * t * v[1] + t * t * v[3],
        ]);
      }
    }
  }
  return points;
}
function inside([x, y], points) {
  let result = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [ax, ay] = points[i],
      [bx, by] = points[j];
    if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax)
      result = !result;
  }
  return result;
}
const centers = Object.fromEntries(
  Object.keys(EDITORIAL_CENTERS).map((k) => [
    k,
    polygon(editorialCenterPath(k)),
  ]),
);
for (const points of Object.values(centers))
  for (const [x, y] of points)
    assert.ok(
      x >= 0 && x <= 240 && y >= 0 && y <= EDITORIAL_FRAME_HEIGHT,
      "full center stays inside compact frame",
    );
assert.equal(Object.keys(metrics.bounds).length, 64);
assert.equal(metrics.size, 12);
assert.equal(
  EDITORIAL_MIN_WIDTH,
  239,
  "font-derived floor cannot silently shrink",
);
for (const width of [
  239,
  243.2,
  254,
  264.34,
  (450 * 240) / EDITORIAL_FRAME_HEIGHT,
  274.56,
  288,
  300,
]) {
  const scale = width / 240,
    boxes = [];
  assert.ok(Math.abs(editorialBadgeFontSize(width) * scale - 12) < 1e-9);
  for (const [gate, bounds] of Object.entries(metrics.bounds)) {
    const a = editorialGateAnchor(Number(gate));
    const b = [
      a.x * scale + bounds[0] - 0.5,
      a.y * scale + bounds[1] - 0.5,
      a.x * scale + bounds[2] + 0.5,
      a.y * scale + bounds[3] + 0.5,
    ];
    const inset = Math.max(0.75, scale / 2);
    for (const x of [b[0] - inset, b[2] + inset])
      for (const y of [b[1] - inset, b[3] + inset])
        assert.ok(
          inside([x / scale, y / scale], centers[GATE_TO_CENTER[gate]]),
          `12px ink+full active underline+AA+border strictly inside ${gate} at ${width}px`,
        );
    for (const [other, c] of boxes) {
      const gap = Math.max(b[0] - c[2], c[0] - b[2], b[1] - c[3], c[1] - b[3]);
      assert.ok(
        gap >= 1,
        `separated padded badge rectangles ${gate}/${other} at ${width}px (${gap})`,
      );
    }
    boxes.push([gate, b]);
  }
}
// Actual exclusive center-hit polygons, not the old overlapping12uu slop.
// Bounding-box44px is a source/model check, not proof of finger usability.
const hits = Object.keys(EDITORIAL_CENTERS).map((k) => [
  k,
  polygon(editorialCenterPath(k, 0, true)),
]);
function cross(a, b, c) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}
for (let i = 0; i < hits.length; i++) {
  const [name, a] = hits[i],
    xs = a.map((p) => p[0]),
    ys = a.map((p) => p[1]);
  assert.ok(
    (Math.min(
      Math.max(...xs) - Math.min(...xs),
      Math.max(...ys) - Math.min(...ys),
    ) *
      EDITORIAL_MIN_WIDTH) /
      240 >=
      44,
    name + " center-hit bounds >=44CSSpx at minimum supported width",
  );
  for (const [other, b] of hits.slice(i + 1)) {
    assert.ok(
      !a.some((p) => inside(p, b)) && !b.some((p) => inside(p, a)),
      name + "/" + other + " center targets do not contain one another",
    );
    for (let ai = 0; ai < a.length; ai++)
      for (let bi = 0; bi < b.length; bi++) {
        const p = a[ai],
          q = a[(ai + 1) % a.length],
          r = b[bi],
          t = b[(bi + 1) % b.length];
        assert.ok(
          !(
            cross(p, q, r) * cross(p, q, t) < -1e-9 &&
            cross(r, t, p) * cross(r, t, q) < -1e-9
          ),
          name + "/" + other + " center target edges do not cross",
        );
      }
  }
}
// Exact line/outline crossings avoid claiming4px from a coarse sample interval.
function straightVisible(n, from, to) {
  const [x, y, bx, by] = n, dx = bx - x, dy = by - y;
  const cuts = [from, to];
  for (const outline of Object.values(centers))
    for (let i = 0; i < outline.length; i++) {
      const [ax, ay] = outline[i], [cx, cy] = outline[(i + 1) % outline.length];
      const ex = cx - ax, ey = cy - ay, den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-12) continue;
      const t = ((ax - x) * ey - (ay - y) * ex) / den;
      const u = ((ax - x) * dy - (ay - y) * dx) / den;
      if (t > from && t < to && u >= 0 && u <= 1) cuts.push(t);
    }
  cuts.sort((a, b) => a - b);
  let length = 0;
  for (let i = 1; i < cuts.length; i++) {
    const t = (cuts[i - 1] + cuts[i]) / 2;
    if (!Object.values(centers).some((p) => inside([x + t * dx, y + t * dy], p)))
      length += (cuts[i] - cuts[i - 1]) * Math.hypot(dx, dy);
  }
  return length;
}
// A compact node must not swallow its hanging stroke. Check actual unmasked
// ink over 45% ARC LENGTH for BOTH directions on ALL36 canonical routes.
for (const { gates } of CHANNEL_LATTICE) {
  const d = editorialChannelPath(gates),
    n = d.match(/-?\d+(?:\.\d+)?/g).map(Number),
    points = [],
    dist = [0];
  for (let i = 0; i <= 1000; i++) {
    const t = i / 1000,
      u = 1 - t;
    const p = d.includes(" C ")
      ? [
          u ** 3 * n[0] +
            3 * u * u * t * n[2] +
            3 * u * t * t * n[4] +
            t ** 3 * n[6],
          u ** 3 * n[1] +
            3 * u * u * t * n[3] +
            3 * u * t * t * n[5] +
            t ** 3 * n[7],
        ]
      : [n[0] + (n[2] - n[0]) * t, n[1] + (n[3] - n[1]) * t];
    points.push(p);
    if (i)
      dist.push(
        dist[i - 1] +
          Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]),
      );
  }
  for (let held = 0; held < 2; held++) {
    let visible = 0;
    for (let i = 1; i < points.length; i++) {
      const fraction = dist[i] / dist.at(-1);
      if (
        (held === 0 ? fraction <= 0.45 : fraction >= 0.55) &&
        !Object.values(centers).some((p) => inside(points[i], p))
      )
        visible += dist[i] - dist[i - 1];
    }
    if (d.includes(" L ")) visible = straightVisible(n, held ? 0.55 : 0, held ? 1 : 0.45);
    assert.ok(
      (visible * EDITORIAL_MIN_WIDTH) / 240 >= 4,
      `held ${gates[held]} has >=4CSSpx unmasked ink on ${gates}`,
    );
    if (d.includes(" L ")) {
      const t = held === 0 ? 0.45 : 0.55;
      assert.ok(
        !inside(
          [n[0] + (n[2] - n[0]) * t, n[1] + (n[3] - n[1]) * t],
          centers[GATE_TO_CENTER[gates[held]]],
        ),
        `45% leaves its held center: ${gates[held]}`,
      );
    }
  }
}
for (const { gates } of CHANNEL_LATTICE) {
  const n = editorialChannelPath(gates)
    .match(/-?\d+(?:\.\d+)?/g)
    .map(Number);
  for (const [gate, actual] of [
    [gates[0], n.slice(0, 2)],
    [gates[1], n.slice(-2)],
  ]) {
    const a = editorialGateAnchor(gate);
    assert.deepEqual(
      actual,
      [a.x, a.y],
      "canonical route preserves its actual held-gate origin/end",
    );
  }
}

console.log("PASS:64 true12CSSpx inside/separated glyph/full-underline bounds,36 literal gate-origin paths,72 hanging directions each >=4CSSpx exposed; browser readability/viewport/physical target usability still require review");
