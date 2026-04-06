
## Fix rollup click filtering so it selects the exact associated transactions

### Root cause
The new index-based logic is only being used inside `ExecDemoIntelPanel` for rollup display/collapse. The click path still sends only `r.pillar`, and `ExecDemoPage` still filters with `s.pillar === activePillarFilter`. So a rollup click currently:
- selects the whole pillar instead of the specific rolled-up categories, or
- selects nothing if the rollup pillar string does not exactly match the signal map.

### Implementation

**`src/pages/ExecDemoPage.tsx`**
- Keep the grouped category list used for persona synthesis as the source of truth.
- While building the `pillars` payload, also retain `txIndices` for each grouped category.
- When `category_indices` come back from the AI, convert them into concrete transaction indices and store them on each rollup as `txIndices`.
- Replace the string-based `activePillarFilter` with a rollup filter object (`pillar`, `label`, `txIndices`).
- Update `filteredIndices`, `activePillLabel`, and `activePillColor` to use that selected rollup object.
- Leave the existing single category-chip filter logic as-is.

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**
- Extend `PillarRollup` to include `txIndices?: number[]`.
- Change rollup clicks from `onPillarClick(r.pillar)` to `onRollupClick(r)`.
- Change rollup active-state logic to compare the selected rollup object (pillar + label), not a raw pillar string.
- Keep `categoryIndices` as the render/collapse matching mechanism.

### Safety
- If a rollup is missing usable `txIndices`, fall back to current pillar-level behavior instead of making the click a no-op.
- Ignore invalid/out-of-range `category_indices` when deriving rollup `txIndices`.

### Technical details
- No backend change is needed here; the function already returns `category_indices`.
- The real fix is making rollup selection use the same indexed rollup data that the UI already uses visually.

### Expected result
- Clicking a rollup pill highlights only the transactions that belong to that rollup.
- It no longer highlights unrelated same-pillar transactions.
- Clicking the same rollup again clears the filter.
- Individual category chip selection continues to work unchanged.
