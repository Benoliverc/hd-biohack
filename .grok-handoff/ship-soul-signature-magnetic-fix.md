# Ship — Soul Aura Signature Magnetic over-trigger fix

**Status:** Ready for `@qa` / Ship Gate (not merged)  
**PR:** https://github.com/Benoliverc/hd-biohack/pull/19
**Branch:** `feat/soul-signature-magnetic-fix`  
**Date:** 2026-10-23 (HKT)  
**Do not merge / redeploy until PO ship call.**

## Bug
Soul Aura Signature was **always** `⚡ Magnetic Alchemy` for every saved profile pair on prod.

## Root cause
`detect_signatures` treated `len(electromagnetic) >= 2` as Magnetic (priority 1).  
Real natal charts (~17–20 activated gates) routinely form **2–7 EM channels**. On Benjamin + Achi prod charts: **9/9 pairs** were Magnetic. Classification itself was correct — the threshold was too low for natal density. 59-6 and mutual-split triggers were fine.

## Fix
- Raise EM density clause: `MAGNETIC_EM_MIN = 5` (was 2)
- Keep: EM Intimacy `{6,59}` **OR** `mutual_split_bridge`
- Spec + tests updated

## Real pairs after fix (local scorer on prod chart JSON)

| Pair | Signature | Why |
|---|---|---|
| Benjamin Test↔K | Magnetic Alchemy | EM=5 |
| Benjamin Test↔Me | Catalytic Growth | EM=4, 8-1 + compromise |
| Benjamin Test↔Achi | Magnetic Alchemy | EM=7 |
| Benjamin K↔Me | Magnetic Alchemy | 59-6 + mutual split |
| Benjamin K↔Achi | Magnetic Alchemy | 59-6 |
| Benjamin Me↔Achi | Integrated Flow | triad, EM=3 |
| Achi Kengnai↔Ben | Catalytic Growth | EM=4 |
| Achi Kengnai↔Me | Catalytic Growth | EM=2 |
| Achi Ben↔Me | Integrated Flow | triad |

**Counts:** Magnetic 4 · Catalytic 3 · Integrated 2 (≥3 distinct)

## Tests
`pytest tests/test_soul_sync.py` → **17 passed**  
New: modest EM≠Magnetic; diversify fixtures ≥3 signatures (Magnetic / Harmonic / Spacious / Integrated / Catalytic)

## AC for @qa
1. Modest EM (2–4) without 59-6 / mutual → **not** Magnetic
2. EM≥5 → Magnetic
3. Intimacy EM → Magnetic + intimacy_lock
4. Mutual Split→Single → Magnetic + badge (Integrated secondary OK)
5. Companionship-heavy fixture → Harmonic Sanctuary
6. Open-field fixture → Spacious Co-Explorers
7. Triad without Mag triggers → Integrated Flow
8. Real Benjamin Me↔Achi style → Integrated (or non-Magnetic)
9. No Fit % regression
10. pytest soul suite green

## Out of scope
FE copy unchanged (still reads signature from API). Redeploy Railway after merge (PO).
