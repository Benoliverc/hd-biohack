# Current build — Thin self-betterment loop (READY FOR UX)

- **Branch:** `feat/self-betterment-loop`
- **Handoff:** `.grok-handoff/self-betterment-loop.md`
- **Base:** main @ `ae3c328` (PR #42 Free/Pro identity)
- **Status:** implementing complete — awaiting PR / UX UI Review
- **Out of scope:** password/delete-account, reminders/push/streaks, Daily Novelty HKT buckets, Stripe/signup

## ACs
1. Account `preferred_timezone` + Settings UI (fallback Asia/Hong_Kong) — done
2. Protocols day/week use account TZ; novelty stays HKT — done
3. Optional daily intention (server, per user+day) — done
4. Move reflection synced server-side — done
5. Trust/density; Settings free; Protocols extras Pro-gated — done
6. Tests + smoke — done (backend 3 new; FE assert NY day-key; full pytest 91)

## Smoke notes
- Settings → set America/New_York → Protocols week label is `Mon–Sun · America/New_York` (not HKT)
- Complete a Move + reflection → reload / other session shows same
- Novelty countdown still HKT (`formatResetsInHkt`)
- Free user can open Settings; intention/reflection live behind Pro Protocols gate
