# Handoff — Batch A: Whole-app copy / You-chrome polish

## Status
- Ready for Ship Gate / PO review
- Branch: `feat/batch-a-copy-you-chrome`
- Specs: `.grok-handoff/app-deep-review-2026-10-23.md` + `.grok-handoff/app-deep-ux-critique.md` (UX PASS)
- Base: `main` @ `98e10f8` (PR #26)

## What changed (FE-only)
1. **B1 Aura** — Home Soul: Fit % bullet → `Aura Signature + one Playbook for this pair` + chemistry/weather bullet. Soul schema-lag: `older schema` (no Fit %). Playbook micro: drop double “Playbook”.
2. **B2 You chrome** — Shared `youChipLabel` (`frontend/src/lib/youChipLabel.ts`). Today + Protocols chips = label only (no 🔒, no `You · You`). Chart YOU row: no `YOU · You`. Today keeps one friends footnote; Protocols omits.
3. **Kit leftovers** — Add to kit / Loading kit… / From your kit / Pro unlocks Today’s Move + kit (API `inventory` / `in_inventory` unchanged).
4. **Paywall** — Natal baseline / Kit-aware Today’s Move / unlock live Today’s Move (no stacks/inventory/generate).
5. **Today** — Sky/Move secondary bullet; single Open Protocols (indication CTA only).
6. **Login** — H1 `Chart. Today. Protocols. Soul.`; Soul pillar; Protocols body = Today’s Move / kit.
7. **Nice** — Header nav → `Home · Chart · Today · Protocols · Soul`.

## Out of scope (verified)
- Zinc ranking API, Chart deep structure, OAuth/Stripe, Railway
- No rename of API inventory fields

## Files
- `frontend/src/lib/youChipLabel.ts` (new)
- `frontend/src/app/page.tsx`
- `frontend/src/app/transits/page.tsx`
- `frontend/src/app/biohack/page.tsx`
- `frontend/src/app/profile/page.tsx`
- `frontend/src/app/soul/page.tsx`
- `frontend/src/app/login/page.tsx`
- `frontend/src/components/BiohackingEntitlementGate.tsx`
- `frontend/src/components/Header.tsx`
- `.grok-handoff/app-deep-review-2026-10-23.md`
- `.grok-handoff/app-deep-ux-critique.md`
- `.grok-handoff/current_build.md`

## Verify
```bash
cd frontend && npx tsc --noEmit
```

## Smoke (for PO)
| Case | Expect |
|------|--------|
| home Soul | Aura Signature bullet; no Fit % |
| Me chart Today+Protocols | chip `You` only; no 🔒 You · You |
| Chart YOU row | no YOU · You |
| kit | Add to kit; Loading kit; From your kit |
| Free paywall | Today’s Move / kit; no stacks/generate |
| Today | one Open Protocols; sky/Move copy |
| login | Soul pillar + H1 |
