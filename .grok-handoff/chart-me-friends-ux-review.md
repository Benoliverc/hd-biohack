# UX review — Chart Me vs Friends distinction (post PR #16)

**Date:** 2026-10-23 (Asia/Hong_Kong)  
**Route:** `/profile` (Chart)  
**Tip reviewed:** main `e8cd46b` (PR #16 copy present on Vercel fresh HTML + local)  
**Verdict:** **P0 follow-up** — create/update split shipped, but Me and Friends still look like one object. Benjamin’s “saves land on the same profile” will keep happening until IA/visual hierarchy changes.  
**Shots:** `/workspace/hd-biohack-ui-failures/ux-review-2026-10-23/chart-me-friends/`  
- `01-login-wall.png` — prod needs auth (no Dev switcher)  
- `02-me-selected.png` / `04-new-person.png` / `05-mobile-me.png` — local Dev Pro  
- No friend chip on Dev Pro (all 13 rows labeled “Me”; 13/10 over cap)

## What PR #16 fixed (keep)
- Explicit Update vs Save as new friend intents  
- Add new person clears edit target  
- Confirm before Update  
- Role frozen on update path  
- Cap copy when at limit  

## Why it still feels like one profile
1. **One chip soup.** Every saved row is the same pill chrome. Friend is only a 10px muted `· friend` (and Dev Pro data shows many `self` rows all titled “Me”). Empty/`label||"Me"` makes a nameless friend read as Me.  
2. **Overwrite is the green primary.** On Me selected: filled **Update “Me”** is the loudest control; **Save as new friend** is outline (and disabled at cap). Muscle memory hits Update.  
3. **Banner is not a banner.** `text-xs` beside Add new person — easy to miss. Me banner never says “your chart / Today & Protocols” stakes.  
4. **Same form for You and Friend.** No visual mode shift when adding someone else.  
5. **New person still offers Me.** Segment keeps Me clickable even when a self already exists → can create another “Me” (feeds the 13× Me mess).  
6. **Prod can’t be walked without login** — Vercel has PR #16 JS, but no Dev switcher on `/login`.

## Must-fix (concrete IA / layout / copy)

### 1. Split “You” from “Friends” (list IA)
- **You:** one dedicated card/row (not a removable pill in the friend wrap). Label **YOU** + display name + type/profile. Delete You only behind a separate “Remove your chart” confirm (or hide × on You).  
- **Friends:** heading **Friends** + chips under it only (`slot_kind=friend`). Never fallback label `"Me"` for friends — use `"Friend"` or require name.  
- If multiple `self` rows exist (legacy): show **You** as store-bound / preferred self; park extras under “Other charts (you)” or prompt pick-one — don’t render 13 identical Me pills.

### 2. Invert primary when Me is selected (action hierarchy)
When editing **You**:
- **Primary (growth):** `Save as new friend` — uses form fields as the *friend’s* birth; never sends `natal_chart_id`. Clear Friend’s name field (don’t reuse “Me”).  
- **Secondary (outline / danger-soft):** `Update your chart` — confirm copy must name stakes:  
  `Replace **your** chart (the one Today & Protocols use) with these birth details?`  
When editing a **Friend**: primary = `Update “Alex”`; secondary = `Save as another friend` (optional).  
At 10-cap: keep Update enabled; disable only create; show why.

### 3. Full-width state bar (not xs inline)
Replace quiet banner with a full-width bar above the form:
- You: energy/warning wash — **Editing your chart.** Friends are unchanged.  
- Friend: growth-soft — **Editing Alex.** Your chart stays as-is.  
- New: sunken — **New friend — nothing is overwritten.** (If no self yet: **New chart — save as You or a friend.**)

### 4. Lock “new” path when You already exists
- **Add new person** → always Friend role; **hide Me segment** if any `self` exists.  
- Primary label: **`Save friend`** (not generic Calculate & save).  
- Only show Me|Friend segment when user has **zero** self charts.

### 5. Copy / affordance polish
- Chip active styles: You = growth solid soft; Friend = energy soft (match Indication chip language).  
- Confirm Update-You ≠ Update-Friend (different sentences).  
- Cap warning: if over 10 from legacy, offer “Clean up duplicate Me charts” not only “delete someone.”  
- Disable Save as new friend when Friend’s name empty; don’t prefill with “Me”.

## Suggested AC add-ons (for next Ship Gate)
1. Given You selected, primary button label is Save as new friend (or Save friend), not Update.  
2. Given You selected + Save friend, Me row id/birth unchanged.  
3. Friends list never shows a chip titled Me.  
4. Add new person with existing self → no Me role control.  
5. State bar visible at 375 without scrolling past chips (sticky under Saved people optional).

## Out of this review
- Soul Bio-Sync flows (blocked until Friends are distinct)  
- Server slot_kind guard (still nice-to-have)  
- Cleaning Dev Pro’s 13/10 data (ops / optional cleanup tool)

## Next
1. PO accept must-fix → `@dev` implement on follow-up branch  
2. `@ui-ux` re-verify with ≥1 real friend chip + You  
3. `@qa` Ship Gate vs extended AC  
4. Prod walk needs signed-in session or non-prod Dev chrome on Vercel preview
