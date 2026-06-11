# Rebuild Next-product

## Concept

Next-product becomes the **customer-first roll-up of Automated Flows**. Automated Flows fires signals per product, one customer at a time. Next-product zooms out: across the entire book, **where are those flows concentrating, and which product wins per cohort?**

Read-only intelligence surface. No CampaignStudio, no FinancialJourneyHeader, no campaign authoring.

| Tab | Lens | Output |
|---|---|---|
| Automated Flows | Product → signal | "When X happens, enroll" |
| **Next-product** | **Cohort → ranked products** | **"For this cohort, what's next?"** |
| Campaign Builder | Product push | "Pick a product, see who qualifies" |

## UI

### 1. TabHeader (kept)
- Title: `Next-product`
- Subtitle: `Customer cohorts ranked by the product Automated Flows is most likely to fire next — read-only intelligence rolled up from live signals.`
- howItWorks: `Ventus aggregates every automated-flow signal across the book and scores each customer cohort against the product catalog. The heatmap shows the strongest next-product fit per cohort.`
- whyItMatters: `Bankers see where opportunity concentrates without authoring a single campaign — and which Automated Flows are doing the heavy lifting.`

### 2. KPI strip (new)
Four compact tiles above the heatmap:
- Customers with a next-product match
- Avg. signal strength (1–100)
- Top product this week (name + cohort count)
- Flows feeding this view (count, links to Automated Flows tab)

### 3. Cohort × Product heatmap (new — primary view)
- Rows: customer cohorts (life-stage × lifestyle pillar combos, ~10–14 rows e.g. "Young Professionals — Travel-led", "New Parents — Home-led", "Pre-Retirees — Wealth-led", "Small Biz Owners — Cards-led", etc.)
- Columns: ~8 BoA-style products (HELOC, Auto Refi, Premium Card, 529 Plan, HYSA, Wealth Advisory, Mortgage, Small Biz Line)
- Cell: shaded by score 0–100; numeric score + tiny audience count
- Top-1 cell per row outlined (the cohort's "next product")
- Click cell → side panel (see #4)

```text
                HELOC  Auto  Card  529   HYSA  Wealth Mort  SMB
New Parents       42    18   31   [88]   54     22     61    9
Pre-Retirees      71    12   28    8     49    [82]    18    6
Travel-led YPs    14    24  [76]   11    63     31     22   12
...
```

### 4. Cohort drill-down panel (new — right side, opens on row click)
Shows the cohort's ranked product ladder:
- Cohort name, audience size, dominant pillars
- Ranked products (top 5) with score, signal-strength bar, and the **list of Automated Flows feeding the score** (linked back to the Automated Flows tab — reinforces the "data from automated flows" framing)
- Top behavioral & life-event signals contributing
- No "send campaign" or "create campaign" CTAs — read-only

### 5. Cohort filter chips (above heatmap)
- Life-stage filter (Young Pros, Families, Pre-Retirees, Retirees, SMB)
- Pillar lens (Travel, Home, Wealth, Cards, Deposits…)
- Sort by: top score / audience size / momentum

## Files

**Edit**
- `src/components/tepilot/campaigns/SegmentTargetingView.tsx` — strip out `FinancialJourneyHeader` + `CampaignStudio`; render new components below the existing TabHeader; update subtitle/howItWorks/whyItMatters copy.

**New** (under `src/components/tepilot/campaigns/next-product/`)
- `NextProductKpiStrip.tsx`
- `CohortProductHeatmap.tsx`
- `CohortDrilldownPanel.tsx`
- `CohortFilters.tsx`
- `data/cohorts.ts` — cohort definitions + scoring rows (static demo data, derived in spirit from `PRODUCT_FLOWS`/`FLOW_MICROSEGMENTS` so the "rolled up from automated flows" story holds)

**Untouched**
- `CampaignStudio.tsx`, `FinancialJourneyHeader.tsx` — still used by Campaign Builder.
- `ProductAutomatedFlowsView.tsx`, `ProductCampaignBuilderView.tsx`, `AnalyticsContainer.tsx` — no changes.

## Out of scope
- No new edge functions, no live LLM calls — static demo data with deterministic scores.
- No changes to Automated Flows or Campaign Builder.
- No campaign authoring UI in Next-product.

## Memory
Add memory `mem://features/next-product/cohort-heatmap` describing: customer-first roll-up of Automated Flows, cohort × product heatmap, read-only, no CampaignStudio.
