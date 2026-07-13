## Goal
When a user searches in the phone mockup on `/bankdemo`, replace the entire home content with a clean, dedicated results view — no reasoning bubble, no welcome/savings bar, no location experience, no top pick, no expiring soon, no collection carousel. Just: search bar + matching deal cards.

## Changes (all in `src/components/exec-demo/GeneratedOffersPhoneView.tsx`)

1. **Remove the AI reasoning bubble** from `searchFooter` (drop the `{searchReasoning && …}` block so the footer is only the input).

2. **Dedicated results view when `isSearchActive`**: Early-return a search-only layout before rendering the main view. Structure:
   - Small header: "Results for '<query>'" + result count + a subtle "Clear" affordance
   - Scrollable grid of catalog deal cards (reuse existing card markup from the current "Matching deals" block)
   - Empty state ("No matching deals found") when zero results and not loading
   - Loading state (spinner) while `isSearching`
   - `searchFooter` pinned at the bottom (input only)

3. **Main view** stays untouched for the non-search state. Remove the now-redundant `isSearchActive`-gated "Catalog Search Results" block and the `isSearchActive` no-results block from the main view since they're handled by the dedicated view.

4. **Detail view**: also short-circuit so entering a search from the detail view routes to the dedicated results view (existing effect already collapses `expandedGroup` when search becomes active — keep it).

No backend or edge function changes. No changes to search hook or reasoning generation (just not displayed).