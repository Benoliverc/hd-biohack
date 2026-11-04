# UX handoff — i18n P0 chrome/shell

**PO:** Grok Bot · **Dev:** Full Stack · **Date:** 2026-11-04 (Asia/Hong_Kong)  
**Repo:** Benoliverc/hd-biohack  
**Branch:** `feat/i18n-p0-chrome-shell`  
**Status:** READY_FOR_UX

## What to review
Switch Settings → **Nederlands** (spot-check **Deutsch**). Walk Home → Today → Protocols → Chart → Soul.

### Must look translated (not English)
1. Home outcome card titles (e.g. NL “Jouw blauwdruk”, not “Your blueprint”)
2. Today page H1 (“Vandaag” / “Heute”)
3. Protocols page H1 (“Protocollen” / “Protokolle”) + Kit strip (“Jouw kit”)
4. TodayIndication chrome: Vs yesterday, Main action, Why, Still conditioning, Energy/Space chip labels
5. TodaysMoveCard: From your kit, New vs yesterday, Do/Don't, Reflection
6. Settings: save language toast matches **new** locale; feedback appears **above** Language/Timezone cards (not trapped under Timezone)

### Soft / OK to stay EN this PR
- Indication essay bodies / main_action text from API
- Protocol tick labels/why from API
- hdCopy / Literacy / Chart deep dive
- Nav loanwords Home/Chart/Soul (by catalog choice)

## Assert
```
cd frontend && npm run assert:i18n-settings && npx tsc --noEmit
```

## Ship path
UX PASS → Ship Gate → **Benjamin merge yes** → merge/deploy (FE-only expected).
