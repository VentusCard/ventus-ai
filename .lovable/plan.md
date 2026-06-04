## Fix Behavioral Intelligence tooltips (Life Events + Risk Factors)

**Problem:** Only the Spending Habits tooltip displays correctly. Life Event Detection and Risk Factors tooltips appear clipped/obscured because `TooltipContent` is rendered inline (no Portal), inside rows that have `fade-in` animations and sit within a scrollable/stacked container. `z-[9999]` can't escape those ancestors.

**Fix:** Render the three Behavioral Intelligence tooltips through a Radix Portal so they attach to `document.body` and bypass all ancestor `overflow`, `transform`, and stacking constraints.

### Change

In `src/components/exec-demo/ExecDemoIntelPanel.tsx` only, for each of the three `Tooltip` blocks (Spending Habits, Life Event Detection, Risk Factors):

- Import `TooltipPortal` from `@radix-ui/react-tooltip` (aliased) at the top of the file.
- Wrap each existing `<TooltipContent …>…</TooltipContent>` in `<TooltipPortal>…</TooltipPortal>`.
- Keep the existing classes (`side="bottom"`, `max-w-md`, `text-sm`, `p-3.5`, `z-[9999]`, white background, etc.) unchanged.

No edits to the shared `src/components/ui/tooltip.tsx` (avoids affecting other tooltips across the app).

### Result

All three tooltips render at the document root, appear below the cursor, above the table, with the wider/larger styling already in place.