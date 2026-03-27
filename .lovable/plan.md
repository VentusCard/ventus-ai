

## Fix: Keep nested card text on one row in Beat 5 ("Behavioral Signal+") card

Several text elements in the three action cards (Personalized Rewards, Personalized Relationship, Personalized UX) are too large and wrap to multiple lines. Changes needed:

### File: `src/components/demo/DemoPasswordGate.tsx`

1. **Reduce grid item text size** — Change `text-base font-bold` to `text-sm font-semibold` on the inner card labels (lines 685, 720, 754) so items like "Pregnancy Books & Audiobooks" and "Parenting Milestone Alerts" stay on one row.

2. **Reduce description text size in headers** — The `<span className="text-sm text-slate-400">` descriptions after each card title (lines 670-672, 704-707, 739-741) can also overflow. Reduce to `text-xs` to keep them inline.

3. **Add `whitespace-nowrap`** to inner grid card spans to prevent wrapping, and reduce padding from `p-4` to `p-3` on those grid items for tighter fit.

4. **Reduce the "Behavioral Pattern" and "Demographic" pill text** — Lines 630, 649: change `text-base` to `text-sm` on those spans to keep the top pills on one row.

### Summary of changes
- Inner card labels: `text-base font-bold` → `text-sm font-semibold`, add `whitespace-nowrap`
- Grid items: `p-4` → `p-3`
- Header descriptions: `text-sm` → `text-xs`
- Top pills: `text-base` → `text-sm`

