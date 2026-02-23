
# Fix Semantic Deal Search: "coffee machine" Returns No Results

## Root Cause

Two issues are causing the "0 results" problem:

**Issue 1 -- Text fallback hides results during AI processing**

In `AvailableDealsGrid.tsx`, while the AI search is in-flight (1-5 seconds), the component falls through to a text-based search path that filters by `searchQuery`. Since no merchant name contains "coffee machine", it shows 0 results during the entire loading period. When/if the AI finally responds, results should appear -- but the user sees an empty state the whole time.

**Issue 2 -- Missing completion log suggests intermittent timeouts**

The edge function logs show the user's search started at 02:55:34 but never logged a completion ("Found X matches"). This indicates the AI gateway call may be timing out intermittently, meaning the frontend never receives results at all.

## Fix

### 1. Fix the loading-state filter in `AvailableDealsGrid.tsx`

When `isSearching` is true (AI search in progress), do NOT apply the text-based fallback filter. Instead, show all deals (or the category-filtered set) so the user sees content while waiting.

```text
Before:
  if (isSemanticActive) { ... semantic filter ... }
  return getAvailableDeals({ search: searchQuery, ... })   // <-- 0 results for "coffee machine"

After:
  if (isSemanticActive) { ... semantic filter ... }
  if (isSearching) {
    // AI search in progress -- show all deals, don't text-filter
    return getAvailableDeals({ category, search: "", sortBy })
  }
  return getAvailableDeals({ search: searchQuery, ... })
```

### 2. Add `isSearching` to the `filteredDeals` dependency array

Ensure the `useMemo` recalculates when the searching state changes.

### 3. Show a subtle "Searching..." indicator when `isSearching` is true (already exists via the spinner icon in the search input -- no new UI needed)

## Files Changed

- `src/components/tepilot/rewards-pipeline/AvailableDealsGrid.tsx` -- Fix the `filteredDeals` useMemo to avoid text fallback during AI search
