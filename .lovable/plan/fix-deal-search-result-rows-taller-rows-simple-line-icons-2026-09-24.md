# Fix deal-search result rows: taller rows + simple line icons

## Context
On /deckmo slide 6, the phone's semantic search results were made very compact ("too short" per user) and use emoji icons from `DEAL_CATEGORIES` (🍕 ✈️ 💻 …). The user dislikes the emoji style and wants the simplistic Lucide line icons used in the section 5 Activity list (Dumbbell, House, Music, CupSoda, etc.).

## Changes

### 1. Replace emoji icons with Lucide line icons
- In `src/components/exec-demo/GeneratedOffersPhoneView.tsx`, add a category → Lucide icon map (e.g. Food & Dining → `UtensilsCrossed`, Travel → `Plane`, Style & Beauty → `Shirt`, Home & Living → `House`, Entertainment → `Clapperboard`, Health & Wellness → `HeartPulse`, Sports → `Dumbbell`, Technology → `Laptop`, Family → `Baby`, Pets → `Dog`, Financial → `Landmark`, Automotive → `Car`), with `ShoppingBag` as fallback.
- In the search-results row, render the Lucide component (currentColor, ~h-4 w-4) inside the tinted category tile instead of the emoji character. Keep the existing pastel category colors from `getColor`/`DEAL_CATEGORIES`.

### 2. Restore comfortable row height
- Increase the search-result row padding back up (roughly from `py-1.5` tile + 1-line description to `p-3`-style spacing) so each row is noticeably taller — in line with the one-deal-per-row collection card style, not the ultra-compact strip.
- Let the deal description show up to two lines (`line-clamp-2`) instead of one.
- Keep: one deal per row, colored left bar, reward pill, staggered fade-in, all existing behavior.

## Out of scope
- No changes to search logic, confidence filtering, main carousel, detail view, or /demo.

## Verification
- Playwright at 1540×855 and 1920×1080: open deck (password ventus2026), go to slide 6, search "coffee machine", screenshot results — rows taller, line icons rendering, no wrapping/overflow issues.
- Build log clean.
