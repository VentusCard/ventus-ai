

## Redesign `/demo` — 3-Column Layout

```text
┌──────────────────────────────────────────────────────────────────────┐
│  Ventus AI · Executive Demo                              Next → [X] │
├─────────────┬──────────────────────────┬────────────────────────────┤
│  Col 1      │  Col 2                   │  Col 3                     │
│             │                          │                            │
│  Customer   │  Dynamic Persona         │  ┌──────────────────┐     │
│  Selector   │  [pills...]              │  │  iPhone Frame     │     │
│  (from      │                          │  │                   │     │
│  /deckmo    │  ┌─────────────────────┐ │  │  /deckmo detail   │     │
│  sample     │  │[Analytics][Rewards] │ │  │  overlay pages    │     │
│  data —     │  │[Relationship]       │ │  │  (engagement,     │     │
│  DEMO_      │  │                     │ │  │   rewards,        │     │
│  CUSTOMERS) │  │  Tab content area   │ │  │   wealth, etc.)   │     │
│             │  │  (shared space)     │ │  │                   │     │
│  Txn Feed   │  └─────────────────────┘ │  └──────────────────┘     │
│  (animated) │                          │                            │
│             │                          │                            │
│  [Run]      │                          │                            │
├─────────────┴──────────────────────────┴────────────────────────────┤
└──────────────────────────────────────────────────────────────────────┘
```

### What changes

**1. Data source — swap to `/deckmo` sample data**
- Replace `execDemoData.ts` customer profiles with `DEMO_CUSTOMERS` from `src/lib/demoData.ts`
- Left panel shows the 6 `/deckmo` customers (name, segment, lifestyle type, txn count)
- Transaction feed pulls from `customer.sampleTransactions` instead of the current simplified array

**2. Column 2 — Intelligence panel (extracted from phone)**
- Move the persona card + 3 tabbed intelligence cards out of the phone frame into their own middle column
- This becomes a full-height panel with the persona at top and the tabbed Analytics/Rewards/Relationship content below
- Keep the same animation flow (pills reveal, tab auto-cycle)

**3. Column 3 — iPhone mockup with `/deckmo` pages**
- iPhone frame (same device chrome — notch, status bar, home indicator)
- Inside: render the actual `/deckmo` detail overlay views (`DemoEngagementView`, `DemoRewardsView`, `DemoWealthView`, etc.)
- The view shown syncs with the active tab in column 2:
  - Analytics tab → `DemoAnalyticsView` / `AnalyticsContainer`
  - Rewards tab → `DemoRewardsView`
  - Relationship tab → `DemoWealthView`
- These are the same components used in `DemoDetailOverlay.tsx`

### Files to modify

1. **`src/pages/ExecDemoPage.tsx`** — Change grid from 2-col to 3-col (`grid-cols-[340px_1fr_360px]`). Wire up `DEMO_CUSTOMERS` data. Add state for which `/deckmo` view shows in the phone. Pass enrichment data to phone column.

2. **`src/components/exec-demo/ExecDemoLeftPanel.tsx`** — Adapt customer selector to render `DEMO_CUSTOMERS` (6 cards with name, segment, lifestyle type). Update transaction feed to use `sampleTransactions` format.

3. **`src/components/exec-demo/ExecDemoPhoneView.tsx`** — Remove persona + tabs (moved to col 2). Replace with iPhone frame rendering the `/deckmo` detail views (`DemoRewardsView`, `DemoWealthView`, `DemoEngagementView`, etc.), synced to active tab.

4. **New: `src/components/exec-demo/ExecDemoIntelPanel.tsx`** — Column 2. Contains the Dynamic Persona card + 3-tab intelligence area (extracted from current phone view). Same animation logic, just rendered in a full panel instead of inside a phone frame.

5. **`src/components/exec-demo/execDemoData.ts`** — May keep for intelligence card definitions, but customer selection data will come from `DEMO_CUSTOMERS`. Need to map each `DemoCustomer` to intelligence cards (analytics/rewards/relationship content + txIndices).

