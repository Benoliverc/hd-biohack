# Current build — Today vs Protocols IA split (P0)

- **PR:** https://github.com/Benoliverc/hd-biohack/pull/45
- **Branch:** `feat/today-protocols-ia-split`
- **Tip SHA:** `67d3e6b` (`67d3e6be0b6853a2baa9488276f5a97186d2bd34`)
- **Feature commit:** `3b20bf3`
- **Handoff:** `.grok-handoff/today-protocols-ia-split.md`
- **Spec Page:** https://cursor.com/canvas/store-f5d34951-c924-450e-b54b-b19b5400da0d/cb29692c-348a-475d-a74f-8a71ee16c63b
- **Base:** main @ `7c1ec46` (PR #44 Meenakshi Pro)
- **Status:** PR open — awaiting UX UI Review → Ship Gate → Benjamin yes
- **Out of scope:** Pro Move N/M strip (P0.5), baseline-pause (P1)

## ACs
1. Today one primary do-statement; no competing “What to do today” — done
2. Protocols header blueprint language — done
3. WeatherStrip chips + Full sky link only — done
4. ≤1 What's-new on Protocols — done
5. Checkboxes only /biohack — done
6. Main action ≠ checklist #1 — preserved
7. preferred_timezone completions; HKT novelty — preserved
8. Me-only both tabs — preserved

## Verify
- frontend tsc clean
- assert:today-protocols-ia / assert:resets-in-hkt / assert:protocol-completions PASS
