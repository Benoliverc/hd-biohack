# Handoff — Today HD indication (P0)

## Status
- **SHIPPED** (frontend live; API blocked on Railway)
- Merge: [PR #12](https://github.com/Benoliverc/hd-biohack/pull/12) → `e03e605` on `main`
- Feature tip gated: `feat/today-hd-indication` @ `6b43b01` (impl polish `1e100bf`)
- Ship note: `.grok-handoff/ship-today-hd-indication.md`
- Spec: `.grok-handoff/current_spec.md` (HD-derived rewrite)
- Gate: `.grok-handoff/ship_gate_report.md` — PASS AC 1–9

## Production
- **Vercel:** https://hd-biohack.vercel.app — Ready (`dpl_6a3cy4xwWKHniMWfL8Q3GvncDZUs`) @ ~13:08 HKT 2026-10-22
- **Railway api:** Online host, but **builds paused** — redeploy failed (“Deploys have been paused temporarily”). Prod OpenAPI has `/transits/today` without `indication` field until builds resume + redeploy.

## What shipped
Read-only **Today's indication** on `/transits` above “What to do today”:
- Energy (Drained→Hyper) + preferred space as display chips (no questions, no taps)
- Main action + why + micro-move (deterministic)
- Payload on `GET /transits/today` → `indication` (once API redeploys)
- Free tier; chart-weather disclaimer; no-natal Steady/Charged + one save-chart CTA

## Hard no (verified at gate)
- No self-ask chips
- No `PUT /checkin` from UI
- No Variables engine / LLM / Protocol generate side effect
- Copy never claims Type/Authority changes

## Next
1. When Railway builds resume: `railway redeploy --from-source -y` on `api`, then smoke `GET /transits/today` for `indication`
2. Rotate Railway env secrets if not already done (incident notice)
