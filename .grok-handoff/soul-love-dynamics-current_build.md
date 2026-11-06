# Soul Love dynamics — current build

**Ticket:** Soul Love dynamics (harmony, friction, decide / communicate / clash) when Person is Partner  
**Handoff:** handoffs/soul-love-dynamics-2026-11-06.md  
**Branch:** feat/soul-love-dynamics  
**Worktree:** /workspace/hd-biohack-wt-soul-love-dynamics  
**Base SHA:** e507886016fd1e4a6671a04a8f9bc1bc5945b545 (main after #75)  
**Tip SHA:**   
**PR:** [#77](https://github.com/Benoliverc/hd-biohack/pull/77)  
**Independent of:** daily-return #76 (Evening Signature Close) — do not mix  
**Preview:** http://127.0.0.1:3019/soul (port 3019; #76 uses :3018)  
**Deploy later:** BE+FE — Vercel AND Railway after UX → Ship Gate → Benjamin own-words yes  
**Gates:** Hold merge. Ping UX first, then Ship Gate after UX PASS. No standing auto-ship.

## Scope
Keep #74 Love chapters verbatim. Add partner-only dynamics nested on `partner_overview`:
- `harmonies` / `frictions` (2–4 center-driven cards; Solar_Plexus mismatch always when present)
- `how_you_decide` (authority pair bank, 28 unordered pairs)
- `how_you_communicate` (Type-pair + Throat state)
- `when_you_clash` (Type-pair recipe; append tempo sentence for Emotional+Sacral/Splenic)

No scores, no compatible/incompatible, no soulmate/destiny language, no `--danger` chrome (copper energy only). Deterministic banks only. No Aura Alchemy / You=Me / Today / daily-return changes.

## Files changed
- `backend/app/hd/partner_love_dynamics.py` (new — banks + builder)
- `backend/app/hd/partner_insights.py` — `apply_partner_layer` accepts defined_a/b, auth_a/b
- `backend/app/hd/soul_sync.py` — pass those four args at call site (~1771)
- `backend/app/schemas.py` — SoulLoveGuidance* + fields on SoulPartnerOverviewOut only (ProtocolCompletionIn untouched)
- `backend/tests/test_soul_sync.py` — gold + forbidden + person-role omit
- `frontend/src/lib/api.ts` — SoulLoveGuidance* types on SoulPartnerOverview
- `frontend/src/components/soul/PartnerOverviewCard.tsx` — sections + testids
- `handoffs/soul-love-dynamics-2026-11-06.md` (copied into worktree)

## Untouched (do not mix with #76)
- TodayIndication.tsx, eveningSignatureClose.ts, protocolCompletions.ts, transits/page.tsx
- protocol-completion `kind` / `"evening"`, assert-evening-signature-close.mjs
- backend/tests/test_evening_signature_close.py, backend/app/biohack/rules.py
- `.grok-handoff/current_build.md` (belongs to #76) — this ticket writes `soul-love-dynamics-current_build.md` only

## Payload shape
Dynamics nested on `partner_overview` (same hero object), partner role only:
```
harmonies: [{ id, title, body, try }]
frictions: [{ id, title, body, try }]
how_you_decide: { title, body, try }
how_you_communicate: { title, body, try }
when_you_clash: { title, body, try }
```

## Gold samples verified
- Solar_Plexus you_open_they_defined → "Their emotional weather" (+ body/try)
- Solar_Plexus you_defined_they_open → "You set the emotional weather"
- Solar_Plexus both_defined → "Two emotional climates"
- Emotional|Sacral how_you_decide → "Different decision clocks"
- Generator|Projector when_you_clash → "When things get hard"
- Throat you_open_they_defined try → signing a voice that isn't yours
- Generator|Projector communicate Type-pair body → Generator engaging / Projector seeing

## Tests
- `pytest tests/test_soul_sync.py` — 32 passed
- `frontend tsc --noEmit` — clean
- Forbidden grep includes compatible/incompatible/soulmate/destiny; no `--danger` in Love blocks

## UI testids
- soul-love-harmonies / soul-love-harmony-{id}
- soul-love-frictions / soul-love-friction-{id}
- soul-love-decide
- soul-love-communicate
- soul-love-clash
