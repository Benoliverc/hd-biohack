# Plain Move language — build brief

**Date:** 2026-11-08 (Asia/Hong Kong)
**Signed off by:** Benjamin, in his own words: “Yes build but create 5 options instead of 3 for every state.”
**Source of truth:** this file (also copied at `/workspace/hd-biohack/.grok-handoff/plain-move-language-current_build.md`).
**Product owner:** Grok Bot. Do not ask Benjamin for clarification — ship this brief.

This is **frontend + backend**. After dual-gate + Benjamin’s merge yes: **Vercel and Railway together**.

Branch from current `main` (after PR #84, merge SHA `5fb11b205eb2a10224755e1dee2945bccfd334dc`). Do **not** merge. Open a PR and tell Grok Bot the URL + tip SHA. Grok Bot routes UX UI Review → Ship Gate QA, then asks Benjamin.

---

## Goal

The Today Move sentence (`main_action_text`, from `MOMENT_MOVES` in `backend/app/checkin/prescription.py`) still uses metaphors that are hard to follow: sky, battery, wave, crest, charge, borrowed energy, “stack more inputs.” After someone checks the Move off, the receipt says “You met the sky — nice work,” which is easy to misread.

Rewrite every daily Move into a plain “do this” sentence, with **five options per moment** (not three). Change the done line to everyday language. Keep the Why collapsed and unchanged.

---

## Locked Move copy

Replace `MOMENT_MOVES` exactly with these strings. Do not paraphrase. Each line is already ≤20 words under the existing `_word_count` rule (hyphens split). First entry stays the Free / default pick; later entries keep rotating under existing Pro history in `select_move_text` (it already uses `len(options)`, so five lines just widen the pool — do not change selection logic).

### surplus
1. Skip the extra coffee. Take a 20-minute walk before you add more.
2. Put that extra energy into one task. Then leave the rest for later.
3. Start only one thing. Don't add coffee or extra tasks on top.
4. Go for a walk or stretch. Don't use the extra energy to take on more work.
5. Do one useful thing with the extra energy. Then pause before you start another.

### recover
1. Slow down today. Do less, take breaks, and keep the day easy.
2. Rest first. Only say yes to what you really want to do.
3. If work feels stuck, change rooms. Keep the day short.
4. Take a real break before you push again. Keep plans light today.
5. Sit quietly for a few minutes. Come back only when you feel ready.

### borrowed_fuel
1. You may feel extra energy today. Use it once, then take a real break.
2. Do one thing with this extra energy. Then stop and rest.
3. Use the extra energy for one clear task. Then stop before you pile on more.
4. Finish one thing while you feel up. Then rest, even if you want to keep going.
5. Do the one thing in front of you. Then stop before you add more.

### mental_pressure
1. Write down what's on your mind. Focus on one thing, then stop.
2. Skip the extra coffee. Take a twenty-minute walk before you add more.
3. Pick one hard thing and finish that. Leave the rest of the list.
4. Close extra tabs and chats. Work on one question only.
5. Step outside for a short walk before you try to solve everything.

### emotional_wave
1. Don't make a big decision while feelings are high. Wait until you feel steadier.
2. Take a breath before you reply. Wait until you feel steadier to choose.
3. Skip the extra coffee when you feel up and down. Slow down first.
4. Give yourself time before you answer or decide. Sleep on anything important.
5. Take a short walk or sit still until the strong feeling eases a little.

### quiet_sky
1. Keep today simple. Do one main thing, then leave some free time.
2. Keep today quiet. Don't add extra plans or noise.
3. Have a light day. Do one errand or one task, then stop.
4. Don't fill the empty space. Enjoy a slower day with one simple plan.
5. Do the one thing that matters. Leave the afternoon open.

Use straight apostrophes (`Don't`, `what's`) to match existing Python string style.

---

## Locked done-line copy

`today.moveComplete` in all five locale files:

| Locale | New string |
| --- | --- |
| `en.ts` | Nice work. That's enough for today. |
| `de.ts` | Gut gemacht. Das reicht für heute. |
| `es.ts` | Buen trabajo. Con eso basta por hoy. |
| `nl.ts` | Goed gedaan. Dat is genoeg voor vandaag. |
| `fr.ts` | Beau travail. Ça suffit pour aujourd'hui. |

Update `frontend/scripts/assert-quiet-move-closure.mjs` so it matches the new English line, not `/You met the sky/`.

Do **not** rewrite other “sky” marketing copy on Home or Login. Only the Move sentence bank and this completion receipt.

---

## What not to change

- Moment selection (`pick_dominant_moment`, `select_moment_with_history`)
- Kit rotation, When slots, Energy/Space chips, `SPACE_MICRO`
- `main_action_why` and other collapsed Why mechanics (HD detail stays there)
- Settled Day wash, Evening Close placement, Show-up, Share-card wiring (Share already uses `main_action_text` and will pick up the new lines)
- Type fallback banks in `backend/app/checkin/rules.py` (`TYPE_RECOVER_TEXT` and friends) — they are overwritten by `attach_prescription` on the live Today path
- Word cap (`MAIN_ACTION_MAX_WORDS` = 20), no-LLM rule, disclaimer
- No new UI chrome, no scores, no confetti

---

## Tests

- Keep `test_move_word_cap_all_templates` (it already walks every line).
- Add an assertion that every moment has **exactly five** options.
- Extend the Move-text jargon ban to every `MOMENT_MOVES` line (case-insensitive). Banned in the Move sentence itself: `sacral`, `gate`, `strategy`, `projector`, `manifestor`, `generator`, `reflector`, `authority`, `sky`, `wave`, `crest`, `battery`, `borrowed`, `charge`, `fuel`, `inputs`.
- Existing `test_hyper_surplus_no_jargon` should still pass.
- Frontend quiet-closure assert must pass against the new done line.

---

## Ship

Frontend + backend → after dual-gate + Benjamin’s yes: **Vercel and Railway together**.

---

## Status (builder)

- **Branch:** `feat/plain-move-language`
- **Base:** `5fb11b205eb2a10224755e1dee2945bccfd334dc` (origin/main after PR #84)
- **Worktree:** `/workspace/hd-biohack-wt-plain-move-language`
- **Files:** `backend/app/checkin/prescription.py` (MOMENT_MOVES → 5/moment), `backend/tests/test_today_prescription.py` (five-options + jargon-ban-every-line), `frontend/src/lib/i18n/messages/{en,de,es,nl,fr}.ts` (`today.moveComplete`), `frontend/scripts/assert-quiet-move-closure.mjs`
- **Tests:** pytest `test_today_prescription.py` 16 passed; `tsc --noEmit` clean; `assert-quiet-move-closure` PASS
- **PR:** https://github.com/Benoliverc/hd-biohack/pull/85
- **Tip SHA:** `154d662c59e45d7f3c0222c5e061ae841abfe9c4`
- **Not merged.** No deploy.
