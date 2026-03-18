

## Restructure Life Events + Wealth Nodes in /demo

### What changes

**1. "Wealth Management" node → show the current Life Event Detection content**

Move the `DemoLifeEventsView` (detected events with evidence, confidence, talking points, action buttons) to render when clicking "Wealth Management". This makes sense — wealth management advisors need life event intelligence to act on.

- In `DemoDetailOverlay.tsx`: when `node === "wealth"`, render `DemoLifeEventsView` instead of `DemoWealthView`
- Remove `wealth` from `SIMPLE_VIEW_MAP`
- Update title to "Wealth Management — Life Event Intelligence"

**2. "Life Event Detection" node → becomes "Financial Journey" with next-product predictions**

Rename the node label to "Financial Journey" in `DemoNetworkDiagram.tsx`. Rebuild the view to show:

- **Current Product Holdings**: what the customer already has (from `holdings` — deposit, credit, mortgage, investments)
- **Next Best Product Recommendations**: each with a % match score, derived from:
  - **Life-event signals**: detected events → product mapping (e.g., Home Purchase 87% → Mortgage Pre-Approval)
  - **Spending-pattern signals**: pillar concentration without matching product (e.g., 34% travel spend + no travel card → Travel Rewards Card 82%)
  - **Upgrade signals**: spend velocity vs. current tier (e.g., $12K annual → Premium Card Upgrade 74%)
- Each recommendation card shows: product name, match %, signal source badge (Life Event / Spending / Upgrade), rationale, estimated annual value

**3. Create new `DemoFinancialJourneyView.tsx`** replacing the life events content for that node. Side-by-side per customer, each showing current holdings and ranked product recommendations with match percentages.

### Files changed

- `src/components/demo/DemoNetworkDiagram.tsx` — rename "Life Event Detection" label to "Financial Journey"
- `src/components/demo/DemoFinancialJourneyView.tsx` — new component with next-product match % view
- `src/components/demo/DemoDetailOverlay.tsx` — swap rendering: `wealth` → `DemoLifeEventsView`, `lifeEvents` → `DemoFinancialJourneyView`; update titles

