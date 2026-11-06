# current_build — daily-return PR 3 Evening Signature Close

- **Date:** 2026-11-06 (Asia/Hong_Kong)
- **Branch:** `feat/daily-return-evening-signature-close`
- **Worktree:** `/workspace/hd-biohack-wt-daily-return-pr3`
- **Base:** `e507886016fd1e4a6671a04a8f9bc1bc5945b545` (main after #75 merge)
- **Story:** Story 5 Evening Signature Close only (daily-return PR 3)
- **Do not merge** until Benjamin yes after UX → Ship Gate.

## Backend / deploy target
- **BE changed:** YES — extended `protocol-completions` `kind` with `"evening"` (schemas + upsert allowlist + model comment). Same PUT `/users/{id}/protocol-completions` endpoint; label encodes `Type|answer` (e.g. `Generator|yes`).
- **Also:** one-line SyntaxError fix in `backend/app/biohack/rules.py` (nested quotes) so the API module can import — pre-existing on main, already fixed in PR1 worktree.
- **Ship deploy:** Vercel **and** Railway.

## Persistence
- item_id: `today-evening-close`
- kind: `evening`
- label: `{HdType}|{answer}` where answer is `yes`/`no` or Projector `recognized`/`rest`
- note: optional ≤120 via existing `setCompletionNote` + putProtocolCompletion
- Free + Pro both persist same-day via existing completion plumbing (Pro history ready for later adaptive ranking; no ranking algorithm in this ticket)

## Evening visibility
- preferredTimezone with fallback `DEFAULT_PROTOCOLS_TZ = Asia/Hong_Kong`
- Visible when local hour ≥ 17, OR `indication.when_slot === "evening"`, OR already answered today
- Hidden before evening (does not block morning Move)

## Type copy (en)
- Generator / Manifesting Generator: "Did anything satisfy?"
- Manifestor: "Did you have peace to start — and did you inform?"
- Projector: "Were you recognized, or did you rest?"
- Reflector: "Did the place feel right?"

## data-testid
- `today-evening-close`, `today-evening-close-question`, `today-evening-close-choices`, `today-evening-close-{answer}`, `today-evening-close-receipt`, `today-evening-close-note`

## Preview
- FE: http://127.0.0.1:3018/ and /transits (port 3018)
- API: reuse default rewrite → :8000 if running; else FE-only smoke

## Tests
- `npx tsc --noEmit` — exit 0
- `npm run assert:evening-signature-close` — PASS
- quiet-move-closure, kind-show-up, protocol-completions, literacy-pulse, sky-story — PASS
- `assert-i18n-settings` — PASS, keys=270, parity ok
- `pytest tests/test_evening_signature_close.py` — PASS

## Placement
- Inside `main-action`, after Move/closure/show-up, before kit. Never above Move. Never Chart/Soul.
