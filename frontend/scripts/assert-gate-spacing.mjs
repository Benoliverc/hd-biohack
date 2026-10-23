/**
 * Collision guard for BodyGraph gate anchors.
 * Fails if any pair is closer than MIN_GATE_SPACING (14.5),
 * or if Ajna 43 ↔ Throat 23 is under MIN_AJNA_THROAT_GAP (18).
 * Run: npx tsx frontend/scripts/assert-gate-spacing.mjs
 */
import {
  assertAjnaThroatGap,
  assertGateSpacing,
  GATE_CHIP_R,
  MIN_AJNA_THROAT_GAP,
  MIN_GATE_SPACING,
} from "../src/lib/bodygraphGeometry.ts";

const spacing = assertGateSpacing();
if (!spacing.ok) {
  console.error(
    `assertGateSpacing FAILED (chip r=${GATE_CHIP_R}, min=${MIN_GATE_SPACING}):`
  );
  for (const v of spacing.violations) {
    console.error(`  gates ${v.a} ↔ ${v.b}: ${v.dist.toFixed(2)}px`);
  }
  process.exit(1);
}
console.log(
  `assertGateSpacing PASS — all gate pairs ≥ ${MIN_GATE_SPACING}px (chip r=${GATE_CHIP_R})`
);

const gap = assertAjnaThroatGap();
if (!gap.ok) {
  console.error(
    `assertAjnaThroatGap FAILED: 43 ↔ 23 = ${gap.dist.toFixed(2)}px (min ${MIN_AJNA_THROAT_GAP})`
  );
  process.exit(1);
}
console.log(
  `assertAjnaThroatGap PASS — 43 ↔ 23 = ${gap.dist.toFixed(2)}px (≥ ${MIN_AJNA_THROAT_GAP})`
);
