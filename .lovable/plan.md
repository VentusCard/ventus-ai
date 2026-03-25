

## Plan: Convert Demo to Single-Customer Input

The demo currently supports two customers (A/B comparison). This plan converts it to a single-customer flow throughout.

### Scope of Changes

**8 files** need modification. All detail views already have null-safety for missing customers, so mostly we're removing Customer B state/UI.

### 1. `src/pages/DemoPage.tsx`
- Remove `customerB` state, `parsedB` memo
- Remove all `*B` props passed to child components
- Update `handleEnrich` to call `startEnrichment(customer, null)`
- Remove `customerB`/`enrichedB`/`personalizedDealsB`/`detectedEventB`/`tipB` from `DemoDetailOverlay` props

### 2. `src/components/demo/DemoCustomerPanel.tsx`
- Remove Customer B slot entirely (the second `CustomerSlot` + divider)
- Remove `customerB`, `parsedTransactionsB`, `onSelectB`, `excludeId` from props
- Rename remaining props: `customerA` → `customer`, `parsedTransactionsA` → `parsedTransactions`, `onSelectA` → `onSelect`
- Update subtitle: "Select a customer to enrich"
- Simplify button labels (remove "Both" variants)

### 3. `src/hooks/useDemoEnrichment.ts`
- Remove `enrichB` SSE hook instance
- Remove all `*B` state (`personalizedDealsB`, `detectedEventB`, `tipB`)
- Remove `classifiedResults.b` logic and dual-customer branching
- Simplify `startEnrichment` signature to `(customer: DemoCustomer | null)`
- Remove `apiPayloads.*B` entries
- Simplify `statusMessage` (no more "A: ... | B: ..." format)
- Return interface drops all `*B` fields

### 4. `src/components/demo/DemoNetworkDiagram.tsx`
- Remove Customer B `TxCard` and its SVG input line
- Remove `customerB` from props
- Show single centered TX card instead of two stacked cards
- Remove the second input bezier path (line to engine from B card)

### 5. `src/components/demo/DemoDetailOverlay.tsx`
- Remove `customerB`, `enrichedB`, `personalizedDealsB`, `detectedEventB`, `tipB` from props
- Remove "Side-by-side comparison" label
- Remove dual customer header row (grid-cols-2 with A/B avatars)
- Pass only single-customer data to child views

### 6. Detail view components (each gets simplified)
All these use `grid-cols-2` with A/B columns. Convert to single-column:
- **`DemoEngagementView.tsx`** — remove B column, single-column layout
- **`DemoRewardsView.tsx`** — remove B column
- **`DemoFinancialJourneyView.tsx`** — remove B column
- **`DemoEnrichmentTableView.tsx`** — remove B tab/column
- **`DemoPillarCodeView.tsx`** — remove B panel
- **`DemoEngineProfileView.tsx`** — remove B column
- **`DemoTravelView.tsx`** — remove B column
- **`DemoLifeEventsView.tsx`** — remove B column
- **`DemoWealthView.tsx`** — remove B column
- **`DemoAnalyticsView.tsx`** — remove B column

### 7. `src/lib/demoData.ts`
- No structural changes needed (customers list stays the same, just selection is single)

### Migration approach
- Rename all `customerA`/`enrichedA` etc. to `customer`/`enriched` throughout for clarity
- All detail views switch from `grid-cols-2` to full-width single-column layouts

