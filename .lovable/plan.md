## Issue

The previous edit changed `src/components/demo/DemoEnrichmentTableView.tsx`, but `/demo` is `ExecDemoPage` which renders `src/components/exec-demo/ExecDemoEnrichmentTable.tsx` — that's why nothing happened on click. Need to wire the right table.

## Plan

### 1. Revert `src/components/demo/DemoEnrichmentTableView.tsx`
Restore to original (no clickable badges, no filter chip). It's only used by `DemoDetailOverlay`, not the /demo initial table.

### 2. `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`
- Add new optional prop `onPillarClick?: (pillar: string) => void`.
- Wrap the Pillar `<span>` (line ~277) in a `<button>` when `onPillarClick` is provided. Add `cursor-pointer` and a hover ring; when `activePillLabel === tx.pillar` show a stronger ring using the pillar color.
- The existing `highlightedIndices` / `activePillLabel` / `onClearHighlight` props already drive the "bring to top + dim others + show 'Showing N of M' strip" behavior — reuse them as-is.

### 3. `src/pages/ExecDemoPage.tsx`
- Add a new handler `handleEnrichmentPillarClick(pillar)` that:
  - Computes all transaction indices where `signalMap[i].pillar === pillar`.
  - Calls existing `handleTriggerPillClick(pillar, indices, getColor(pillar).dot, "lifeEvent")` so it plugs into the same `activeTriggerPill` state already wired to `filteredIndices` → `highlightedIndices`.
  - Toggles off when the same pillar is clicked again (handleTriggerPillClick already toggles by label).
- Pass `onPillarClick={handleEnrichmentPillarClick}` to the `<ExecDemoEnrichmentTable>` instance(s) (lines ~1188 and ~1223 area).

### 4. `src/components/exec-demo/ExecDemoIntelPanel.tsx`
- Forward a new optional `onPillarClick` prop down to its internal `<ExecDemoEnrichmentTable>` (line ~762/774).

## Result
Clicking any pillar pill in the enrichment table sorts those rows to the top, dims the rest, and shows the existing "Showing N of M for 'Pets'" strip with a Clear button — using the exact pill-click mechanism already used elsewhere on the page.
