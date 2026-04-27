## Goal

Make the **Behavioral Intelligence** tab keep the enrichment table visible and surface the persona/lifestyle pills directly above it, instead of swapping the central panel to the Purchase-Cycle Timeline view. Clicking a pill highlights the matching rows inside the enrichment table.

## Current behavior

When the user clicks **Behavioral Intelligence** (the `analytics` tab), the intel panel:
1. Hides the enrichment table.
2. Replaces the body with `PurchaseCycleTimeline`, which re-renders the rollup pills + a new visualization.

Pill highlighting today only affects the left transaction feed (`ExecDemoLeftPanel`), not the enrichment table.

## New behavior

Clicking **Behavioral Intelligence**:
1. Keeps the **enrichment table** mounted (same layout as the pre-synthesis enrichment view).
2. Renders the **rollup pills row** (the `PillarRollupChip` set, plus the existing life-event and risk pill rows when present) directly above the table, with a header like "Behavioral Intelligence: Personas = Multi-category spending patterns".
3. Clicking a pill **highlights the matching rows** in the enrichment table (subtle colored row background + colored left border using the pillar/event color). Clicking the same pill again clears the highlight. Non-matching rows dim slightly so the highlighted ones pop.
4. The other tabs (Next Product, Shared Customer Intelligence) are unchanged.

The left transaction feed continues to react to pill clicks exactly as it does today — this change only affects the central intel panel.

## Layout sketch

```text
┌─ Intel Panel (analytics tab) ─────────────────────────────┐
│ Header: Behavioral Intelligence — Personas …              │
│ [Lifestyle pill] [Lifestyle pill] [Lifestyle pill] …      │
│ [Life-event pill] [Life-event pill]                       │
│ [Risk pill]                                               │
│ ─────────────────────────────────────────────────────     │
│ Enrichment table                                          │
│   row …                                                   │
│   row … ◀ highlighted (matches active pill)               │
│   row …                                                   │
└───────────────────────────────────────────────────────────┘
```

## Technical changes

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**
- In the `activeTab === "analytics"` branch (line ~785), stop rendering `PurchaseCycleTimeline`. Instead render:
  - The existing rollup/life-event/risk pill block (the JSX already produced by the `chips.length > 0` section at lines ~373–600) with its current click handlers (`handleRollupForRel`, `handleLifeEventForRel`, `handleRiskForRel`) so the existing global pill state (`activeRollup`, `activeTriggerPill`) still drives highlights.
  - The `ExecDemoEnrichmentTable` (same instantiation already used at lines 707–719), passed two new props: `highlightIndices` and `highlightColor`.
- Adjust the `pillsExpanded` / `synthesisTriggered` gating so that, when `activeTab === "analytics"` and synthesis has been triggered, the enrichment table block stays mounted and the pills section uses the analytics header copy.
- Remove (or keep behind a flag) the analytics-tab call to `PurchaseCycleTimeline` so it no longer renders for that tab.

**`src/components/exec-demo/ExecDemoEnrichmentTable.tsx`**
- Add optional props:
  - `highlightIndices?: number[] | null`
  - `highlightColor?: string` (e.g. the pillar dot color or risk/life-event color)
- For each rendered row, compute `isHighlighted = highlightIndices?.includes(rowIndex)`.
- When a highlight set is active:
  - Highlighted rows: tinted background (`highlightColor` at ~12% opacity) + 3px left border in `highlightColor`.
  - Non-highlighted rows: `opacity-40` (matches the existing dimming pattern in `ExecDemoLeftPanel`).
- When `highlightIndices` is null/empty, render all rows at full opacity (current behavior).

**Index alignment**
- The rollup `txIndices` and life-event `matchedIndices` are already computed against the `transactions` array used to build the table. The enrichment table renders rows in the same order, so passing those indices directly works without remapping.

## Out of scope

- No change to the left transaction-feed panel.
- No change to the Next Product / Shared Customer Intelligence tabs.
- No change to selection-page descriptions or the MCC column ordering.
