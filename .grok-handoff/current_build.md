# Current build — Visual density Option A — SHIPPED

- **PR:** https://github.com/Benoliverc/hd-biohack/pull/49 — **MERGED**
- **Branch tip:** `4573f91` (`4573f91b28b2fcb498a39941987600853c4c9fc5`) — docs tip; feat tip `88cd64e` confirmed at merge
- **Merge commit:** `48edf24` (`48edf242ff2aca520d099b463f5d43283296c53a`)
- **Handoff:** `.grok-handoff/visual-density-option-a.md`
- **Product handoff:** `.grok-handoff/visual-density-option-a-2026-11-04.md`
- **Status:** SHIPPED 2026-11-04 Asia/Hong_Kong — FE only. Soft residuals optional (0% progress ring vs first Move row; Settings dual Save weight).

## Deploy
- **Vercel:** READY `dpl_cZzqCJ6vBXm5eWKZPP6XQkMVjSyv` → https://hd-biohack.vercel.app (alias of https://hd-biohack-33nhp6u4t-hdbh1.vercel.app)
- **Railway:** skipped — FE-only (no API/schema paths in PR #49)
- **Smoke:** `/` 200 · `/settings` 200 · `/transits` 200 · `/biohack` 200 · `/login` 200. Hard-refresh advised for FE.

## Scope shipped
1. Hierarchy / one primary + card lift (`shadow-soft`)
2. Thin Lucide (~12) — Settings, Today signal/centers, Protocols kit/slots/chevrons
3. Status glyphs — progress strip, Main Action energy/space cluster, center chips
4. Emptiness hotspots — Settings denser; Today MAIN ACTION right pane; Home orphan labels; Protocols Shelf/Intention/kit affordance
5. AC5 tighter max-width — deferred (not needed)

## Soft / deferred
- Soft: 0% progress ring vs first Move row; Settings dual Save weight
- Chart / nav / login nits pre-existing
- Photos / illustration; BodyGraph; Move DO/DON'T; planet table; login pillars; nav icons; soft i18n / API bodies

## Prior shipped
- **PR #48** i18n P0 chrome/shell — MERGED `d633a3b` — FE live
- **PR #47** Settings language — MERGED `8351ee5`
- **PR #46** Morning Ritual Option A — MERGED `81d2de8`
