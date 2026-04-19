

## Goal

When a persona pill (e.g. "Annual Hawaiian Vacations") is clicked in the Next-Offer tab, the phone view should auto-navigate into that specific Curated Collection's deal-detail view (the same view triggered by tapping the carousel card).

## Current state

- `ExecDemoPage` owns `activeRollup` (label + pillar) when the user clicks a persona pill.
- It is passed into `ExecDemoIntelPanel` but **not** to `ExecDemoPhoneView`.
- `GeneratedOffersPhoneView` already has an internal `expandedGroup` state + a "Deal Detail View" render path (lines 169-230 of the file). Currently it only opens when the user clicks the Top Pick or a carousel card.

## Plan

### 1. `src/pages/ExecDemoPage.tsx` (~line 938)
Pass `activeRollupLabel={activeRollup?.label || null}` and `activeRollupPillar={activeRollup?.pillar || null}` into `<ExecDemoPhoneView>`.

### 2. `src/components/exec-demo/ExecDemoPhoneView.tsx`
- Add to `Props`: `activeRollupLabel?: string | null; activeRollupPillar?: string | null;`
- Forward both into `<GeneratedOffersPhoneView>`.

### 3. `src/components/exec-demo/GeneratedOffersPhoneView.tsx`
- Add to `Props`: `activeRollupLabel?: string | null; activeRollupPillar?: string | null;`
- Add a `useEffect` that watches `activeRollupLabel`. When it changes (and is non-null), find the matching group in `offerGroups` using the same fuzzy matching strategy as `NextOfferRationale` (exact → substring → token-overlap), then call `setExpandedGroup(matchedGroup)`.
- When `activeRollupLabel` becomes null (user deselects), call `setExpandedGroup(null)` to return to the carousel.
- Extract the fuzzy-match helpers into a small local function within the file (mirrors the NextOfferRationale logic).

### Verification

1. `/demo` → Next-Offer tab → click persona pill "Annual Hawaiian Vacations" → phone slides into the Hawaii collection detail view showing all related deals.
2. Click a different persona pill → phone navigates into that collection.
3. Click "Back" inside the phone OR clear the persona selection → returns to the rotating carousel.
4. Life-event / risk pill clicks (which also set a rollup label) likewise drive the phone to the matching collection.

## Files touched

- `src/pages/ExecDemoPage.tsx`
- `src/components/exec-demo/ExecDemoPhoneView.tsx`
- `src/components/exec-demo/GeneratedOffersPhoneView.tsx`

## Out of scope

Carousel internals, search behavior, other tabs, intel-panel rendering.

