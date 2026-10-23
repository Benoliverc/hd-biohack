/**
 * Collision guard for BodyGraph gate anchors.
 * Fails if any pair is closer than MIN_GATE_SPACING (14.5).
 * Run: node --import tsx frontend/scripts/assert-gate-spacing.mjs
 *   or: npx tsx frontend/scripts/assert-gate-spacing.mjs
 */
import {
  assertGateSpacing,
  GATE_CHIP_R,
  MIN_GATE_SPACING,
} from "../src/lib/bodygraphGeometry.ts";

const result = assertGateSpacing();
if (!result.ok) {
  console.error(
    `assertGateSpacing FAILED (chip r=${GATE_CHIP_R}, min=${MIN_GATE_SPACING}):`
  );
  for (const v of result.violations) {
    console.error(`  gates ${v.a} ↔ ${v.b}: ${v.dist.toFixed(2)}px`);
  }
  process.exit(1);
}
console.log(
  `assertGateSpacing PASS — all gate pairs ≥ ${MIN_GATE_SPACING}px (chip r=${GATE_CHIP_R})`
);
