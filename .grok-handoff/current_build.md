# Current build — Thin self-betterment loop (READY FOR UX)

- **PR:** https://github.com/Benoliverc/hd-biohack/pull/43
- **Branch:** `feat/self-betterment-loop`
- **Tip SHA:** `52215bd` (`52215bd262718a4751dd9ed7c4025608e1777c9b`)
- **Feature commit:** `8e06b13`
- **Handoff:** `.grok-handoff/self-betterment-loop.md`
- **Base:** main @ `ae3c328` (PR #42 Free/Pro identity)
- **Status:** PR open — awaiting UX UI Review → Ship Gate → Benjamin yes
- **Out of scope:** password/delete-account, reminders/push/streaks, Daily Novelty HKT buckets, Stripe/signup

## ACs
1. Account `preferred_timezone` + Settings UI (fallback Asia/Hong_Kong) — done
2. Protocols day/week use account TZ; novelty stays HKT — done
3. Optional daily intention (server, per user+day) — done
4. Move reflection synced server-side — done
5. Trust/density; Settings free; Protocols extras Pro-gated — done
6. Tests + smoke — done (pytest 91; FE assert NY day-key; tsc clean)

## Smoke notes
- Settings → set America/New_York → Protocols week label is `Mon–Sun · America/New_York` (not HKT)
- Complete a Move + reflection → reload / other session shows same
- Novelty countdown still HKT (`formatResetsInHkt`)
- Free user can open Settings; intention/reflection live behind Pro Protocols gate
