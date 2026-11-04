# Current build — Nav clarity A+B (active chrome + reorder)

- **PR:** (pending — fill after `gh pr create`)
- **Branch:** `feat/nav-clarity-a-b`
- **Tip SHA:** (pending — fill after commit)
- **Handoff:** `.grok-handoff/nav-clarity-a-plus-b-2026-11-04.md`
- **Expert panel (context):** `.grok-handoff/nav-clarity-protocols-expert-panel-2026-11-04.md`
- **Benjamin:** “A+B ship”
- **Status:** READY FOR UX → Ship Gate → Benjamin merge yes. **Hold merge.**
- **Scope:** FE-only

## What changed
1. **A — Active chrome:** Primary tabs use opaque `bg-growth-soft` + `border-growth/40` + `font-medium text-growth` when active (replaces weak `bg-growth/20` color-only). Inactive stays `text-fg-muted` with transparent border; hover unchanged. Icons + labels kept. Light + dark via existing `growth-soft` / `growth` tokens.
2. **B — Reorder:** `Home · Protocols · Today · Chart · Soul` (Settings/Admin utility unchanged). Paths unchanged (`/biohack` still Protocols). Label stays Protocols (i18n keys unchanged).
3. **Optional mobile:** `flex-nowrap` + `overflow-x-auto` + hidden scrollbar — prevents Soul orphaning on wrap.

Skipped Option C soft Protocols inactive tint (would fight A).

## Files
- `frontend/src/components/Header.tsx`

## Assert
- `cd frontend && npx tsc --noEmit` → pass
- No hardcoded nav-order assert scripts to update

## Preview / smoke
Hard-refresh preview once Vercel builds the PR. Mentally: `/` `/biohack` `/transits` `/profile` `/soul` `/settings` — order + active pill paint.

## Open questions
- Await UX → Ship Gate → **Benjamin yes** before merge.
- Soft residuals from #49 still optional (out of scope here).

## Prior shipped
- **PR #49** Visual density Option A — MERGED `48edf24` — FE live
- **PR #48** i18n P0 chrome/shell — MERGED `d633a3b`
