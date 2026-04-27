# Show pills above the enrichment table & highlight rows on click

## What changes (user-facing)

Today, clicking the big blue **"Behavioral Intelligence: Ready"** button swaps the entire view: the enrichment table disappears and is replaced by the persona/rollup-pill view + the three "Next-..." action tabs.

After this change, clicking that button will **keep the enrichment table in place** and simply **reveal the three pill rows directly above it**:

```text
┌──────────────────────────────────────────────────┐
│  Behavioral Intelligence                          │
│  Spending Habits     [Aspiring Homeowner] [...]  │  ← rollups (cyan)
│  Life Event Detection [New Home Transition] [..] │  ← life events (amber)
│  Risk Factors        [Gambling] [...]            │  ← risk (red/amber)
├──────────────────────────────────────────────────┤
│  Date │ Merchant │ MCC │ Description │ Amount …  │
│  ...  │ WHOLE FOODS │ 5411 │ Grocery │ $84.21 …  │
│  ...  │ HOME DEPOT  │ 5200 │ Home    │ $312.40 … │  ← highlighted
└──────────────────────────────────────────────────┘
```

Clicking any pill **highlights the matching transaction rows** inside the table (and dims the rest). Clicking the same pill again, or pressing a "Clear" chip that appears next to the active pill, removes the highlight. Selecting a different pill swaps the highlight set. The three "Next-Offer / Next-Product / Next Conversation" action buttons stay anchored under the table — clicking one of those is still what hands off to the deeper rationale views.

## How it works

1. The "Behavioral Intelligence: Ready" button still toggles the same internal `synthesisTriggered` flag, but that flag no longer hides the enrichment table. The table stays mounted as long as `phase === "hold"`.
2. When `synthesisTriggered` is true, the pill block (Spending Habits / Life Event Detection / Risk Factors — the existing rendering at `ExecDemoIntelPanel.tsx` lines ~672–685) is rendered **above** the table inside the same full-width container, with a subtle divider between them.
3. Pill clicks already update `activeRollup` / `activeTriggerPill` / `activePillFilter` in `ExecDemoPage`, which already produces a `filteredIndices` array. We will pass `filteredIndices` + the active pill's accent color into `ExecDemoEnrichmentTable` and use it to:
   - Add a colored left border + light tinted background on matched rows.
   - Reduce opacity of unmatched rows to ~35%.
   - Render a small "Showing N of M for '<pill label>' · Clear" header strip directly above the table header row.
4. The three action buttons (Next-Offer / Next-Product / Next Conversation) remain visible under the table. Clicking one still switches into the existing tab view (the deeper rationale screens are unchanged).
5. The left-side transaction feed panel stays hidden in this state (matching today's pre-synthesis layout) so the table has full width to breathe. It returns when an action tab is opened, exactly as today.

## Files to edit

- `src/pages/ExecDemoPage.tsx`
  - Adjust `showEnrichmentFullScreen` so the table-only layout persists through `synthesisTriggered` (only collapses once `activeTab` is chosen).
- `src/components/exec-demo/ExecDemoIntelPanel.tsx`
  - When `fullWidthEnrichment` is true and `synthesisTriggered` is true, render the three pill rows above the `ExecDemoEnrichmentTable` instead of switching to the persona/tab layout.
  - Forward `filteredIndices` + active-pill color + `onClearFilter` into the table.
  - Keep the action-button row (`Next-Offer / Next-Product / Next Conversation`) anchored under the table.
- `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`
  - Accept new optional props: `highlightedIndices?: number[] | null`, `highlightColor?: string`, `activePillLabel?: string | null`, `onClearHighlight?: () => void`.
  - Render an "Showing N of M · Clear" strip above the header when a pill is active.
  - Style matched rows (border-left + tinted bg) and dim unmatched rows.

No data fetching, no new state, no schema changes — this purely re-routes the existing pill state into the table that's already on screen.
