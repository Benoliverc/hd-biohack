# Protocols kit variety + daily fact library

**Branch:** `feat/protocols-kit-variety-facts`  
**Base:** `main` @ `063a980` (post PR #40)  
**Status:** PR open · **awaiting UX** re-review (notes folded from `protocols-kit-variety-facts-ux-notes.md`) · **do not merge** · do not deploy · Ship Gate not pinged by executor  
**Date:** 2026-10-30 (Asia/Hong_Kong)

## Goal
Multi-item kits see varied “From your kit” Move leads across HKT days (moment-tagged action bank) + one owned-only daily fact. Empty kit → soft CTA, never fake facts.

## What shipped

### Data
- `backend/app/biohack/data/supplement_actions.json` — **119** supplements, **151** moment-tagged actions (avg **1.27**/supp; core kit items have multiple lines)
- `backend/app/biohack/data/supplement_facts.json` — **168** facts (avg **1.41**/supp) + empty CTA + fact foot

### Engine (`kit_variety.py` + `rules.py`)
- **Moment tags:** energy bands, preferred space, focus centers, `daily_signal.source`, themes (sleep / focus / sacral_yes / emotional_wave / motor / immune / calm / recovery…)
- **Lead pick:** score actions to today’s indication → **day-hash among owned qualified supplement ids** (fixes Mag/B stack[0] sticky when kit has 3+) → best action for that id
- **Anti-whiplash:** same `day_key` (HKT calendar day) → same lead + same fact on Refresh
- **`kit_fact`:** `{ supplement, body, source_id, foot }` or `null`; `kit_fact_cta` only when kit empty
- Kit lead `why` prefers sky/moment (“Matches today’s … weather”); `moment_chip` optional
- Trust: `fact_library_trust_violations()` grep-gate (cure/treat/disease/prescribe/mg…)

### FE (`biohack/page.tsx`)
- **IA:** Weather → **Kit strip** → **Kit fact callout** → **Today’s Move** → …
- Fact soft card between Kit strip and Move (not a 4th checkbox, not inside rows, not What’s new)
- Empty: `Add what you own — Move can prefer your shelf` + Edit kit
- Fact ≤2 lines (`line-clamp-2`) + foot `Informational — not medical advice`
- From your kit badge only when `in_inventory`; muted moment chip ≤1 and **not** stacked with New vs yesterday
- `sanitizeWhy` strips “already own…” even when badged

## Tests
`pytest tests/test_kit_variety.py tests/test_protocols_redesign.py tests/test_sky_rotation.py` → green  
`npx tsc --noEmit` → green  

Coverage: library size, fact owned-only, empty null+CTA, fact rotation, lead rotation, same-day stable, multi-moment not stuck on B/Mag, plain-English line length, alias match, trust grep gate.

## Example — B-heavy Head/Steady morning (kit: B, Omega-3, Mag Glycinate, Zinc, Creatine, Ashwagandha, L-Theanine)

| HKT day | Before (stack[0] sticky) | After (day-hash owned bank) |
|---------|--------------------------|-----------------------------|
| 2026-10-01 | B-Complex (pulse) | L-Theanine before the tab storm |
| 2026-10-02 | B-Complex (pulse) | Ashwagandha (moment line) |
| 2026-10-03 | B-Complex (pulse) | Creatine with your morning meal |
| Fact | — | Rotates among owned (e.g. Creatine / Ashwagandha / Zinc) |

## UX fold
Authoritative notes: `.grok-handoff/protocols-kit-variety-facts-ux-notes.md`  
Shots: `/workspace/hd-biohack-ui-failures/ux-review-2026-10-30/protocols-kit-fact/`

## Next
1. Parent → **UX UI Review** re-pass (density / trust / placement)
2. Then Ship Gate
3. Merge only on Benjamin yes — executor does **not** merge or deploy
