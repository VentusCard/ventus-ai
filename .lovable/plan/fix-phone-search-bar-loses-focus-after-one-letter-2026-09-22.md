# Fix: phone search bar loses focus after one letter

## Root cause

In `src/components/exec-demo/GeneratedOffersPhoneView.tsx` the search input (`searchFooter`) is rendered in three separate places — the main view (line 691), the dedicated search-results view (line 483), and the deal detail view (line 401). Typing the first character flips `isSearchActive` from false to true, so the component swaps from the main view to the search-results view. That unmounts the input and mounts a fresh one in the new view — the new input has no focus, so the next keystroke goes nowhere. Each letter effectively kills the keyboard focus.

## Fix

Render the search bar exactly once, in a shared wrapper, so the input never unmounts when the view above it changes:

- Change the three early-return branches (deal detail view, search-results view) to return only their content, without their own `{searchFooter}`.
- Move the single `{searchFooter}` into one outer wrapper that renders `{viewContent}{searchFooter}` regardless of which view is active.
- Since the footer then sits at the same position in the same parent across renders, React keeps the same input element mounted — focus survives the switch from the main view to the results view, and typing continues uninterrupted.

No visual or behavioral change otherwise: same views, same styling, same search logic, same debounce.

## Technical notes

- Single file: `src/components/exec-demo/GeneratedOffersPhoneView.tsx` — restructure the render tail (lines ~344-486 early returns and the main return ~489-711) so the footer is hoisted into one wrapper. The expanded-view and main-view containers already end with the footer inside a `flex flex-col h-full` root, so the wrapper keeps identical layout classes per branch.
- Watch the per-branch `<style>` blocks — keep them attached to their own branch content.
- Verify with Playwright on the deck Rewards phone: type "coffee machine" letter by letter without re-clicking; the full query must land in the input, the results view must appear, and "No matching deals"/results render. Also confirm clicking away and clearing still works, and the deck arrow-key navigation is unaffected (input must not autofocus on slide entry).
