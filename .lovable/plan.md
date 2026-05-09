## Add Budget tab to /demo iPad mock-up

### What gets built

1. **New phone view: `BudgetPhoneView.tsx`** (in `src/components/exec-demo/`)
   - Aggregates `enrichedTxs` by `pillar` (using existing `aggregateByPillar` from `src/lib/aggregations.ts`).
   - Picks top 4 pillars by total spend.
   - For each pillar, renders a Tepilot-style row:
     - Pillar dot + name (color from `PILLAR_COLORS` in `src/lib/sampleData.ts`).
     - Spend amount and budget amount.
     - Progress bar colored by `getBudgetStatus` (`src/lib/budgetUtils.ts`).
     - Status icon (under / on track / over).
   - Default budget per pillar = ceil(spend × 1.15 / 10) × 10 so the demo always shows a meaningful "x% used" number; user can leave it at that (read-only inside the iPad, no inputs — keeps the mock clean).
   - Header row: total spend vs total budget with overall status pill, mirroring the OverviewMetrics summary card.

2. **Wire into `ExecDemoPhoneView.tsx`**
   - Extend `ConsumerTab` union with `"budget"` and add a 4th entry to `CONSUMER_TABS` (label "Budget", icon `Wallet` from lucide-react, color `#0ea5e9`).
   - Add `case "budget"` in `renderContent()` returning `<BudgetPhoneView enrichedTxs={enrichedTxs} />`.
   - `TAB_MAP` is unchanged (Budget is reachable only via the bottom nav, consistent with how AI is reachable).

3. **No changes to** `ExecDemoPage.tsx` top-level `TabKey` flow, `RelationshipPhoneView`, or any backend / edge functions.

### Visual rules

- Strict light theme: white bg, `slate-200` borders, `Manrope` typography (per project memory).
- "Vaguely specific" tone: show pillar totals rounded to nearest dollar; no transaction counts.
- Reuse `PILLAR_COLORS` so it matches the rest of the demo.
- Layout fits the iPad zoom (1.1) with the same `px-3 py-3 space-y-2.5` rhythm used in `RelationshipPhoneView`.

### Files touched

- New: `src/components/exec-demo/BudgetPhoneView.tsx`
- Edit: `src/components/exec-demo/ExecDemoPhoneView.tsx` (4th tab + render branch)