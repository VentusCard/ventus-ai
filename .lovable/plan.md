

## Plan: Side-by-Side Dual User Comparison Mode

### Concept
Add a "Compare Two Customers" mode to TePilot where users load two different sample datasets simultaneously, enrich both in parallel, and then see side-by-side comparison views throughout the pipeline — showcasing how the same deals/rewards produce different personalizations for different customer profiles.

### Architecture

The comparison mode is activated at the **Setup tab** and carries through all downstream tabs.

**State Model**: Introduce a `comparisonMode` boolean and a parallel set of state for "User B" (transactions, enriched data, demographics, persona). User A uses existing state.

```text
┌─────────────────────────────────────────────┐
│  Setup Tab                                  │
│  ┌──────────────┐  ┌──────────────┐         │
│  │  Customer A   │  │  Customer B   │        │
│  │  [Sample ▾]   │  │  [Sample ▾]   │        │
│  └──────────────┘  └──────────────┘         │
│         [ Enrich Both → ]                   │
├─────────────────────────────────────────────┤
│  Dashboard / Insights Tab (side-by-side)    │
│  ┌──────────────┬──────────────┐            │
│  │  Customer A   │  Customer B  │            │
│  │  Pillar grid  │  Pillar grid │            │
│  │  Deals view   │  Deals view  │            │
│  └──────────────┴──────────────┘            │
└─────────────────────────────────────────────┘
```

### Changes

**1. `src/pages/TePilot.tsx` — Core state & flow**
- Add `comparisonMode` toggle and duplicate state for User B: `parsedTransactionsB`, `enrichedTransactionsB`, `userDemographicsB`, `anchorZipB`, `userPersonaB`
- Add a second `useSSEEnrichment()` hook instance for User B
- In Setup tab: when comparison mode is on, show two side-by-side sample data selectors (Customer A / Customer B)
- In Preview tab: show both previews stacked or side-by-side
- In Enrichment tab: enrich both simultaneously, show dual progress
- In Dashboard tab: render two `PillarExplorer` + `OverviewMetrics` side-by-side in a 2-column grid, each with its own data
- In Insights > Revenue tab: render two `TopPillarsAnalysis` and two `DealActivationPreview` side-by-side to showcase different personalizations for the same deals

**2. New `src/components/tepilot/ComparisonSetup.tsx`**
- Two-column card layout with Customer A and Customer B sample data selectors
- Each column shows the customer name/profile summary after selection
- Toggle to enable/disable comparison mode
- "Enrich Both" button that triggers both enrichment hooks

**3. New `src/components/tepilot/ComparisonDashboard.tsx`**
- Wraps two instances of `OverviewMetrics` + `PillarExplorer` in a responsive 2-column grid
- Header badges showing each customer's name and key profile info

**4. New `src/components/tepilot/ComparisonRewardsView.tsx`**
- Side-by-side `TopPillarsAnalysis` and `DealActivationPreview` components
- Highlights where the same deal renders differently for each customer
- Visual callouts for divergent personalization (e.g., "Same deal, different story")

**5. Minor updates**
- `UploadOrPasteContainer.tsx`: Add a "Compare Mode" toggle button in the header
- Tab labels: Show "A vs B" indicator when comparison mode is active
- The existing single-user flow remains completely unchanged when comparison mode is off

### Key Design Decisions
- Comparison mode is **sample-data only** (no paste/upload for dual mode) to keep the UX clean for demos
- Both enrichments run in parallel using two independent SSE hooks
- The same `DealActivationPreview` component is reused twice with different transaction data — this is the core "same product, different personalization" showcase
- No new backend changes needed; the existing enrichment edge function handles both independently

