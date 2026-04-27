## Goal

When the executive demo is in the **pre-synthesis enrichment-table state** (right after "Semantic Enrichment" finishes, before "Behavioral Intelligence" is clicked), hide the **left transactions panel** entirely and let the enriched transactions table fill the full available width and height of the workspace.

After the user clicks **"Behavioral Intelligence"**, the layout returns to the current 3-column behavior (left transactions panel reappears alongside the intel panel and phone view).

## Trigger condition

Hide left panel + expand table to full height when ALL of:
- `phase === "hold"` (analysis completed)
- `synthesisTriggered === false` (Behavioral Intelligence not yet clicked)
- `enrichedTxs?.length > 0` (we actually have an enriched table to show)

## Implementation

1. **Lift `synthesisTriggered` state** from `ExecDemoIntelPanel.tsx` to `ExecDemoPage.tsx` so the page can react to it for layout decisions.
   - Add `synthesisTriggered` state + setter in `ExecDemoPage.tsx`.
   - Pass `synthesisTriggered` and `onTriggerSynthesis` (or `onSynthesisChange`) as props to `ExecDemoIntelPanel`.
   - Reset to `false` when phase becomes `idle` (already handled inside the panel; move that effect up).

2. **In `ExecDemoPage.tsx`**, compute a derived flag:
   ```
   const showEnrichmentFullScreen =
     phase === "hold" && !synthesisTriggered && (enrichedTxs?.length ?? 0) > 0;
   ```
   - When true, do NOT render the left `ExecDemoLeftPanel` column (skip the entire `<div className="w-[400px] h-full relative">` block).
   - The intel panel column (`flex-1`) already expands to fill remaining width via flex, so removing the left column makes the table take the full width automatically.

3. **In `ExecDemoIntelPanel.tsx`**, when in this same full-screen enrichment state, let the table fill 100% height of the panel:
   - Remove the `maxHeight: 360` cap currently on the wrapper that holds `ExecDemoEnrichmentTable`.
   - Use `flex-1 min-h-0` so the table container stretches to fill the available vertical space (the panel itself is already a flex column).
   - Hide the section header "Semantic Enrichment: Reveal behavioral signals…" caption above the table only in this full-screen state, OR keep it but make it compact — keep it for context.

4. **Behavioral Intelligence button placement**: stays anchored at the bottom of the intel panel (no change). Clicking it sets `synthesisTriggered = true` in the parent, which:
   - Re-shows the left panel.
   - Collapses the table back to its in-panel size.
   - Triggers the existing rollup pills + tabs flow.

## What stays the same

- `ExecDemoEnrichmentTable.tsx` itself — unchanged.
- "Semantic Enrichment" button on the left panel during `idle` and `scroll` phases — unchanged (left panel still shown then).
- Persona synthesis, rollups, Next-Offer/Next-Product/Next-Conversation tabs, phone mockups — unchanged.
- All styling, animations, color tokens — unchanged.

## Files touched

- `src/pages/ExecDemoPage.tsx` — add `synthesisTriggered` state, conditionally hide the left panel column, pass new props.
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — accept `synthesisTriggered` + `onSynthesisChange` props (replacing internal state), make the enrichment table wrapper `flex-1 min-h-0` (removing the 360px cap) when pre-synthesis full-screen.

No backend, DB, or new component files needed.
