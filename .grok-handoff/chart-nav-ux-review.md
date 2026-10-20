# UX review — Chart page nav (`feat/chart-page-nav` @ c4c1c15)

**Reviewer:** UX UI Review  
**Live:** http://127.0.0.1:3000/profile  
**Shots:** `/workspace/hd-biohack-ui-failures/ux-review-2026-10-20/chart-nav/`  
**Not a Ship Gate PASS.**

---

## High

### 1. Sticky section nav overlaps the header
Header ~109–113px; section nav `top-[5.75rem]` / `sm:top-[6.25rem]` (92/100px) → **13–17px tuck under header** even when primary nav does not wrap.  
**Fix:** one sticky stack (header + section nav) **or** CSS var `--app-header-h` measured/updated and used for `top` + `scroll-mt`.

### 2. Deep-link titles clip under the double sticky
`scroll-mt-36` (144px) < header+nav bottom (~154–161px). e.g. `#activations` parks “Deep dive” under the nav scrollbar.  
**Fix:** same height token for `scroll-margin-top` on all section/`#core|#centers|…` targets.

### 3. Centers 3×3 ≠ bodygraph; Defined/Open reflows
Row-major: Head Ajna Throat / G Heart Solar_Plexus / Sacral Spleen Root. Head top-left not top-center; Root bottom-right not bottom; filter **repacks** cells so positions jump.  
**Fix:** fixed bodygraph slots (spine Head→Ajna→Throat→G→Sacral→Root; Spleen left; Ego/Heart + Solar Plexus right). On filter, **hide in place** — do not reflow.

## Medium

### 4. Mobile section nav overflows horizontally
Six long labels → scrollbar; labels clip (“Snapshot”→“hot”, “Centers”→“Cent”).  
**Fix:** shorter labels or wrap to 2 rows — avoid `overflow-x` scroll under sticky.

### 5. Nav labels ≠ Deep dive tabs
Nav “Activations” vs tab “Planets”; no “Core” in sticky nav. Tabs themselves scan fine.  
**Fix:** align naming (Activations→Planets; add Core) or drop redundant sticky chips and keep one tab bar.

### 6. Edit/switch person clear; list confusing
Collapse/summary OK. Opened list **13/10** with near-duplicate “Me · MG · 2/4” rows.  
**Fix:** enforce cap; differentiate rows (city · date · name).

## Low
- No current-section state on sticky chips  
- `North_Node` raw ids in Planets  
- Snapshot vs Core tab duplicate meta  

## Suggested ship order for @dev
1. Sticky offset + scroll-mt shared token  
2. Centers bodygraph slots + no reflow on filter  
3. Mobile nav labels / wrap  
4. Align Activations↔Planets (+ Core)  
5. People list cap + row identity  

## Sign-off
**Conditional** — unblock after High #1–3. Medium can follow in same PR or fast follow.

---

## Re-review 2026-10-20 (feat/chart-page-nav @ 3cb7487)

**High #1–3: PASS** — cleared for Ship Gate handoff.

| Item | Result |
|------|--------|
| 1 Sticky vs header | PASS — flush under header; `--app-header-h` + `--chart-section-nav-h` |
| 2 Deep-link scroll-mt | PASS — `#activations` / `#centers` titles clear both stickies |
| 3 Centers bodygraph + no reflow | PASS — fixed slots; Defined hides in place |

Med remaining (non-blocking): 375 section nav still horizontal-scrolls last chips; sticky `bg-canvas/95` lets snapshot ghost under while scrolling.

Shots: `ux-review-2026-10-20/chart-nav/rereview/`
