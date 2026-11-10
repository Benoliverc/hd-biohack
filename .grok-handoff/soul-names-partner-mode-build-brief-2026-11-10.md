# Soul names and partner-mode pass — build brief

Signed off by Benjamin (PO) via Grok Bot on 2026-11-10 in his own words: “Yes, build the Soul names and partner-mode pass: use first names in Soul copy when available, add Remove as Partner on Soul, and make Love guidance clearly partner-mode with a deeper copper-amber wash.”

## Intent
Soul should talk about people by name, not by Type, when a real first name is on the chart. You should be able to remove a Partner tag from Soul itself. Love guidance should be unmistakably partner-mode — a clearer title and a deeper copper-amber wash, still not pink or red.

## Current behavior
- Headings already use a first name when the chart label has one (`partnerFirstNameFromLabel` in `frontend/src/app/soul/page.tsx`): “You & Sarah”, “How Sarah loves.” Labels that are only Friend / Partner / Person / Me are treated as no name.
- Love guidance body, hooks, try-lines, and type-pair chapters in `backend/app/hd/partner_insights.py` and `backend/app/hd/partner_love_dynamics.py` still subject people as “the Generator”, “the Manifestor”, “the Projector”, “the Reflector”, or “the Manifesting Generator.” A few Playbook lines in `backend/app/hd/soul_sync.py` do the same.
- `TYPE_LOVE_BANK` is written in second person (“You love by…”). That is correct under “How you love,” but it is wrong under “How Sarah loves,” where the same bank text is used as `how_they_love`.
- Soul can Mark as Partner in place (`handleMarkAsPartner` → `api.renameChart(..., "partner")`). There is no unmark on Soul. When a partner is selected, the reason line only offers “Open Chart.” Chart already has a Person / Partner role control; the API already accepts `renameChart(id, label, "person")`.
- Love guidance mounts only when `friend.role === "partner"` and `partner_overview` is present. The chapter is titled “Love guidance” (`SoulChapterCard` accent="energy"). The open card uses `.soul-love-guidance-wash` (quiet sand-amber) and a small “Partner · Love guidance” chip. Easy to miss as partner-mode.

## Build (FE + BE)

### 1. Names in Soul copy when available
- In Soul running prose that currently uses a Type as the person (Love guidance, partner channel nuances, and Playbook lines that do this), use the person’s first name when a usable one exists.
- Usable name = same rule as `partnerFirstNameFromLabel`: first token of the chart label; ignore Friend / Partner / Person / Me and empty labels.
- In running prose, the Me chart stays “you,” not the user’s own first name.
- Keep official Type terms as a quiet secondary label — the existing type line, and/or a first mention like “Sarah (Projector).” Do not drop Types entirely; do not lead sentences with “the Manifestor” when a name is available.
- If there is no usable name, keep today’s Type wording.
- Same-Type pairs (two Generators, etc.) must use “you” and the partner’s name so the two people stay distinct. Do not naively replace “the Generator” globally.
- Replace longer Type names first (Manifesting Generator before Generator) when Types differ.
- Rewrite `how_they_love` so it is about the partner (e.g. “Sarah loves by…”), not leftover second-person “You love…” under their heading. “How you love” can stay second person.
- Try-lines such as “Generator: respond…” should address “You:” or “Sarah:” as appropriate; Type may stay as a quiet label.
- Keep source banks type-keyed. Personalize at apply time (pass chart labels into `apply_partner_layer` / overview builders). Gold type-pair copy without names should still match today’s strings. Add coverage for named output, including a same-Type pair and a Manifesting Generator + Generator pair.
- Meaning-first, term-second; everyday language; no scores; no soulmate / twin-flame language.

### 2. Remove as Partner on Soul
- When the selected person is already Partner, add a “Remove as Partner” control next to the partner reason line (same area as today’s Mark as Partner in the other state).
- Call the existing `api.renameChart(id, label, "person")`. Do not add a new endpoint.
- This only clears the Partner tag. It must not delete the person or change their label.
- On success: role becomes `person`, Love guidance and partner-only Aura Signature / nuances hide, the Mark as Partner prompt returns, and the same person stays selected (last-selected storage unchanged).
- Error handling should match Mark as Partner (inline error, control re-enabled).
- Chart’s Person / Partner save control stays as it is.

### 3. Clearer partner-mode Love guidance
- Rename the chapter (and the visible heading on the open card) to “Partner mode · Love guidance.”
- Deepen the existing copper-amber / sand-amber wash on this chapter only — the closed chapter shell and the open `.soul-love-guidance-wash` card. It must read clearly as a different surface from friend-mode chapters. Still not Valentine pink or red; stay in the energy / copper-amber family already used.
- Keep a short reason line that Love guidance is on because they marked {name} as Partner.
- The “Partner · Love guidance” chip may stay or be strengthened; do not rely on the chip alone.
- Do not re-wash the rest of the Soul page. The partner picker wash can stay as it is. Friend-mode chapters (Spectrums, Playbook, Channels, etc.) stay visually as they are.

## Acceptance
- With a usable first name on the person chart, Soul Love guidance (and any in-scope Playbook / nuance lines) refer to that person by name, not as “the Manifestor” / “the Generator” / etc. “You” still reads as “you.”
- “How {name} loves” is written about them, not as “You love…”
- Same-Type pairs remain unambiguous (you vs their name).
- With no usable name, Type wording is unchanged from today.
- Types still appear as secondary labels.
- Remove as Partner appears on Soul when the selected person is Partner; it clears only the Partner tag; Love guidance hides; Mark as Partner returns; the person remains selected and is not deleted.
- The Love guidance chapter is titled “Partner mode · Love guidance” and uses a deeper copper-amber wash than today, clearly distinct from friend-mode chapters, and not pink or red.
- Love guidance still appears only when the person is marked Partner.
- Last-selected person open, Dual prompt empty state, Aura Signature titles, dropdown order, Chart role control, and friend-mode chapter structure stay as they are.
- FE + BE: Vercel and Railway on ship (not this step — open a PR, do not merge).

## Out of scope
Aura Signature titles and hooks; Dual prompt empty-state copy; dropdown order; last-selected persistence; scoring or soulmate language; changing Chart’s Person / Partner control; a new unmark API; re-washing the whole Soul page; Valentine pink / red.
