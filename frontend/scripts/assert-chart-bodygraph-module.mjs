/** Focused Chart-only contract. Run with tsx; no browser or accounts required. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  CHANNEL_LATTICE,
  GATE_TO_CENTER,
  MIN_GATE_SPACING,
} from "../src/lib/bodygraphGeometry.ts";
import {
  EDITORIAL_CENTERS,
  editorialGateAnchor,
  editorialChannelPath,
  editorialHangingDash,
  editorialBadgeFontSize,
  editorialGateInk,
  bridgeKey,
} from "../src/lib/editorialBodygraphGeometry.ts";
import { messages as en } from "../src/lib/i18n/messages/en.ts";
import { messages as de } from "../src/lib/i18n/messages/de.ts";
import { messages as es } from "../src/lib/i18n/messages/es.ts";
import { messages as fr } from "../src/lib/i18n/messages/fr.ts";
import { messages as nl } from "../src/lib/i18n/messages/nl.ts";
const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const module = read("src/components/ChartBodygraphModule.tsx").replace(
  /\s+/g,
  " ",
);
const profile = read("src/app/profile/page.tsx");
const snapshot = profile.slice(
  profile.indexOf('<div id="snapshot"'),
  profile.indexOf("<ChartDeepDive"),
);
assert.equal(
  createHash("sha256").update(snapshot).digest("hex"),
  "0b29e9ea37b231aab12080b95763a90b93e27bf2836c604b7654c0ec6f87892b",
  "entire retained snapshot is byte-identical to approved base",
);
assert.match(profile, /id="bodygraph"[\s\S]*?<ChartBodygraphModule/);
assert.equal((profile.match(/<ChartBodygraphModule/g) || []).length, 1);
assert.match(
  profile,
  /onDeepDive=\{\(domain\) => jumpToSection\(domain, domain\)\}/,
);
assert.doesNotMatch(snapshot, /TYPE_COPY|TYPE_BATTERY|youreAType|theyreAType/);
for (const fact of ["Type", "Profile", "Authority", "Strategy", "Definition"])
  assert.ok(snapshot.includes(`["${fact}", chart.${fact.toLowerCase()}]`));
for (const pin of [
  'id="snapshot" className="space-y-4"',
  "first-run-natal-reveal",
  "first-run-see-todays-move",
  "chart-time-unknown-caveat",
  'id="snapshot-centers"',
  "chart.people.bodysYes",
  "AUTHORITY_PLAIN",
  "STRATEGY_COPY",
])
  assert.ok(snapshot.includes(pin), pin);
assert.match(
  profile,
  /<div className="order-2 sm:order-1">\s*<LiteracyCoach\s*variant="chart"/,
);
assert.doesNotMatch(
  module,
  /LiteracyCoach|How to read|localStorage|sessionStorage|fetch\(|router\.|history\.|location\.(hash|search)\s*=/,
);
assert.match(
  profile,
  /key=\{`\$\{viewMode\}:\$\{selectedSavedRow\?\.id \?\? "unsaved"\}:\$\{searchParams.toString\(\)\}`\}/,
);
assert.match(
  module,
  /setPreviewOpen\(!previewOpen\);\s*setTypeThemePreview\(null\)/,
);
assert.match(module, /setTypeThemePreview\(null\);\s*setPreviewOpen\(false\)/);
assert.match(module, /TYPES.filter\(\(name\) => name !== actual\)/);
assert.match(
  module,
  /const TABS = \["overview", "centers", "bridges", "hanging"\]/,
);
assert.match(module, /role="tablist"/);
assert.match(module, /href=\{`#\$\{domain\}`\}/);
assert.match(module, /onDeepDive\(domain\)/);
const hangingPanel = module.slice(
  module.indexOf('{tab === "hanging" && (hanging.length'),
  module.indexOf("{selection &&"),
);
assert.doesNotMatch(hangingPanel, /<button|<a\b|deepLink/);
assert.match(module, /data-layer="hanging"[^>]*pointerEvents="none"/);
assert.match(module, /<mask id=\{`\$\{id\}-outside-centers`\}/);
for (const layer of ["tracks", "bridges", "hanging"]) {
  assert.match(
    module,
    new RegExp(`data-layer="${layer}"[^>]*mask=`),
    `${layer} remains clipped under dimmed centers`,
  );
}
assert.match(module, /data-layer="badges" pointerEvents="none"/);
const hitboxes = module.slice(
  module.indexOf('data-layer="hitboxes"'),
  module.indexOf('<div role="tablist"'),
);
assert.match(hitboxes, /bridges.map/);
assert.match(hitboxes, /definedList.map/);
assert.match(hitboxes, /strokeWidth="24" pointerEvents="stroke"/);
assert.doesNotMatch(hitboxes, /CENTER_KEYS.map|hanging.map|hangingVisuals.map/);
assert.match(module, /prefers-reduced-motion: reduce/);
assert.match(module, /event.key === "Escape"/);
assert.match(module, /event.target === event.currentTarget/);
assert.match(module, /0\.18/);
assert.match(module, /220ms ease/);
assert.match(module, /h-\[40vh\]/);
assert.match(
  module,
  /fontFamily=\{svgFontFamily\} fontWeight="600" fontSize=\{badgeFontSize\}/,
);
assert.match(module, /ResizeObserver/);
assert.match(
  module,
  /setSvgFontFamily\(getComputedStyle\(document.body\).fontFamily\)/,
);
assert.match(module, /editorialBadgeFontSize\(entry.contentRect.width\)/);
assert.doesNotMatch(module, /bodyHint|useHdCopy/);

for (const pair of [
  [16, 48],
  [20, 57],
  [10, 57],
  [28, 38],
  [54, 32],
  [39, 55],
  [19, 49],
  [41, 30],
]) {
  const path = editorialChannelPath(pair);
  assert.match(path, /^M [\d. -]+ C /, `${pair} is cubic`);
  assert.doesNotMatch(path, /[LQ]/, `${pair} has no Integration kink`);
  const numbers = path.match(/-?\d+(?:\.\d+)?/g).map(Number);
  const a = editorialGateAnchor(pair[0]),
    b = editorialGateAnchor(pair[1]);
  assert.deepEqual(numbers.slice(0, 2), [a.x, a.y]);
  assert.deepEqual(numbers.slice(-2), [b.x, b.y]);
  assert.equal(numbers[2], numbers[4], "symmetric control lane");
}
for (const row of CHANNEL_LATTICE) {
  const [a, b] = row.gates;
  const fromA = editorialHangingDash(a, b),
    fromB = editorialHangingDash(b, a);
  assert.equal(fromA.dasharray, "45 100");
  assert.equal(fromB.dasharray, "45 100");
  assert.equal(fromA.dashoffset, 0);
  assert.equal(fromB.dashoffset, -55);
  assert.equal(
    editorialChannelPath(fromA.gates),
    editorialChannelPath(row.gates),
  );
  assert.equal(
    editorialChannelPath(fromB.gates),
    editorialChannelPath(row.gates),
  );
  assert.ok(
    module.includes(`"chart.bodygraphModule.bridge.${bridgeKey(a, b)}"`),
  );
}
// A correctly dashed short channel must emerge from beneath its held center.
// For internal straight routes, 45% arc length is exactly this interpolation.
for (const row of CHANNEL_LATTICE) {
  if (!editorialChannelPath(row.gates).includes(" L ")) continue;
  for (const held of row.gates) {
    const a = editorialGateAnchor(row.gates[0]),
      b = editorialGateAnchor(row.gates[1]);
    const t = held === row.gates[0] ? 0.45 : 0.55;
    const g = EDITORIAL_CENTERS[GATE_TO_CENTER[held]];
    const x = Math.abs(a.x + (b.x - a.x) * t - g.cx),
      y = a.y + (b.y - a.y) * t - g.cy;
    const hidden =
      g.kind === "square"
        ? Math.max(x, Math.abs(y)) <= g.s / 2
        : g.kind === "diamond"
          ? x + Math.abs(y) <= g.s
          : g.tip === "up"
            ? y <= g.s * 0.7 && x <= ((y + g.s) * 0.9) / 1.7
            : y >= -g.s * 0.7 && x <= ((g.s - y) * 0.9) / 1.7;
    assert.ok(
      !hidden,
      `held gate ${held} has a visible 45% stroke on ${row.gates}`,
    );
  }
}
assert.equal(editorialHangingDash(1, 64), null);
const gates = Object.keys(GATE_TO_CENTER).map(Number);
for (const width of [224, 240, 256, 286, 320, 343, 375, 640, 768, 1024]) {
  const font = editorialBadgeFontSize(width);
  assert.ok(
    Math.abs((font * width) / 240 - 12) < 1e-9,
    `rendered font at ${width}`,
  );
  for (const gate of gates) {
    const point = editorialGateAnchor(gate),
      geom = EDITORIAL_CENTERS[GATE_TO_CENTER[gate]];
    // Conservative 0.64em digits with full em height; all four corners inside.
    const halfWidth = String(gate).length * font * 0.32,
      halfHeight = font / 2;
    for (const dx of [-halfWidth, halfWidth])
      for (const dy of [-halfHeight, halfHeight]) {
        const x = Math.abs(point.x + dx - geom.cx),
          y = point.y + dy - geom.cy;
        const inside =
          geom.kind === "square"
            ? Math.max(x, Math.abs(y)) < geom.s / 2 - 1
            : geom.kind === "diamond"
              ? x + Math.abs(y) < geom.s - 1
              : geom.tip === "up"
                ? y < geom.s * 0.7 - 1 && x < ((y + geom.s) * 0.9) / 1.7 - 1
                : y > -geom.s * 0.7 + 1 && x < ((geom.s - y) * 0.9) / 1.7 - 1;
        assert.ok(
          inside,
          `gate ${gate} glyph interior at ${width}px SVG width`,
        );
      }
  }
}
for (const a of gates)
  for (const b of gates)
    if (a < b) {
      const p = editorialGateAnchor(a),
        q = editorialGateAnchor(b);
      assert.ok(
        Math.hypot(p.x - q.x, p.y - q.y) >= MIN_GATE_SPACING,
        `editorial gate spacing ${a}/${b}`,
      );
    }
// WCAG normal-text contrast, deterministic sRGB palette calculation. Threshold
// 4.5:1 applies at the normal, fully highlighted Overview/selected state.
function luminance(hex) {
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return channels.reduce(
    (sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i],
    0,
  );
}
for (const defined of [false, true])
  for (const motor of [false, true])
    for (const activated of [false, true]) {
      const ink = editorialGateInk({ defined, motor, activated });
      const surface = defined ? (motor ? "#cbad80" : "#4a6b53") : "#f7f6f2";
      const [low, high] = [luminance(ink), luminance(surface)].sort(
        (a, b) => a - b,
      );
      assert.ok(
        (high + 0.05) / (low + 0.05) >= 4.5,
        `${ink} contrasts against ${surface}`,
      );
    }
assert.match(module, /fill=\{editorialGateInk\(/);
assert.match(
  module,
  /textDecoration=\{activated.has\(gate\) \? "underline" : "none"\}/,
);
assert.match(module, /chart.bodygraph.originPersonality/);
assert.match(module, /chart.bodygraph.originDesign/);
assert.match(module, /chart.bodygraph.originBoth/);
assert.match(module, /onClick=\{clearSelection\}/);
assert.match(
  module,
  /if \(event.target === event.currentTarget\) clearSelection\(\)/,
);
assert.match(module, /await onDeepDive\(domain\)/);
assert.match(
  profile,
  /return scrollChartSectionIntoView\(targetId, "smooth"\)/,
);
assert.match(module, /document.querySelector<HTMLElement>\("#deep-dive h2"\)/);
assert.match(module, /target.focus\(\{ preventScroll: true \}\)/);
const prefix = "chart.bodygraphModule.";
const keys = Object.keys(en).filter((key) => key.startsWith(prefix));
assert.equal(keys.length, 88);
const types = [
  "Generator",
  "Manifesting Generator",
  "Manifestor",
  "Projector",
  "Reflector",
];
for (const [locale, catalog] of Object.entries({ en, de, es, fr, nl })) {
  assert.deepEqual(
    Object.keys(catalog)
      .filter((key) => key.startsWith(prefix))
      .sort(),
    keys.slice().sort(),
    locale,
  );
  for (const key of keys) {
    assert.ok(catalog[key]?.trim(), `${locale}:${key}`);
    assert.deepEqual(
      (catalog[key].match(/\{\w+\}/g) || []).sort(),
      (en[key].match(/\{\w+\}/g) || []).sort(),
      `${locale}:${key} interpolation`,
    );
    if (locale !== "en" && /type\.|center\.|bridge\./.test(key))
      assert.notEqual(
        catalog[key],
        en[key],
        `${locale}:${key} no essay fallback`,
      );
  }
  for (const type of types)
    for (const voice of ["you", "other"])
      for (const part of ["Lead", "Body"])
        assert.ok(catalog[`${prefix}type.${type}.${voice}${part}`]);
}
assert.equal(
  en[`${prefix}type.Projector.youLead`],
  "You’re a Projector — You see systems clearly — share that sight where you are invited in.",
);
assert.equal(
  en[`${prefix}type.Projector.youBody`],
  "You are built to guide, not to grind all day. Recognition and real invitations fill you; chasing drains you. Success is the green light; bitterness means you over-gave.",
);
for (const type of ["Generator", "Manifesting Generator"])
  for (const voice of ["you", "other"]) {
    const body = en[`${prefix}type.${type}.${voice}Body`];
    assert.match(body, /Authority/);
    assert.match(body, /Emotional/);
    assert.match(body, /first response is not always a final decision/);
    assert.match(body, /time/);
  }
const localizedTabs = {
  de: ["Überblick", "Zentren", "Brücken", "Hängende Tore"],
  es: ["Vista general", "Centros", "Puentes", "Puertas colgantes"],
  fr: ["Vue d’ensemble", "Centres", "Ponts", "Portes en suspens"],
  nl: ["Overzicht", "Centra", "Bruggen", "Hangende poorten"],
};
for (const [locale, catalog] of Object.entries({ de, es, fr, nl })) {
  assert.deepEqual(
    ["overview", "centers", "bridges", "hanging"].map(
      (key) => catalog[prefix + key],
    ),
    localizedTabs[locale],
  );
  for (const key of [
    "deepCenters",
    "deepBridges",
    "noCenters",
    "noBridges",
    "noHanging",
    "connections",
    "centerConnections",
    "chartLabel",
  ]) {
    assert.doesNotMatch(
      catalog[prefix + key],
      /Defined Centers|\bCenters\b|\bBridges\b|\bGates\b/,
    );
  }
}
assert.equal(en[`${prefix}previewMine`], "Preview — not your chart");
assert.equal(en[`${prefix}resetMine`], "Back to mine");
assert.equal(en[`${prefix}previewOther`], "Preview — not their chart");
assert.equal(en[`${prefix}resetOther`], "Back to {name}");
assert.match(
  read("src/components/share/ShareBaselineCard.tsx"),
  /<BodyGraph[\s\S]*?compact/,
);
// Byte pins make classic/share isolation auditable, not an informal claim.
const bytePins = {
  "src/components/BodyGraph.tsx":
    "f1f25d1e30c611454baf9aa5d10334fd5726225b9e223fe80ccc21aff4c7fae9",
  "src/lib/bodygraphGeometry.ts":
    "cc8c5433776ee2e8758f95f868597a5821f8077eec8a92ec7bcb6cad15f1b743",
  "src/components/share/ShareBaselineCard.tsx":
    "fdf24bb638d4c1b8930be2cbbe52387a7dcab790448ce6ccd3780595f260a298",
  "src/components/LiteracyCoach.tsx":
    "de1516e98e78401bb759597110698732876915f14339fe552ecafd0c2bdc9976",
  "src/components/ChartDeepDive.tsx":
    "4ae3d8ecb884c0df60f91d87ff52f897a329f98a32e10aaa233882cd59f442e0",
};
for (const [path, expected] of Object.entries(bytePins))
  assert.equal(
    createHash("sha256").update(read(path)).digest("hex"),
    expected,
    `${path} stays byte-stable`,
  );
console.log(
  "PASS: Chart Bodygraph module structure, copy, geometry, responsive badge math and isolation (non-browser)",
);
