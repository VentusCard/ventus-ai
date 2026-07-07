
## Goal

Mirror the "Revenue opportunities" list card on the Ventus AI Dashboard by adding a **Top 3 Recommended Actions** card at the top of the Relationship Intelligence tab. Each action jumps the user into the **Campaign Builder** with the right product (and default offer/link) already selected — so the action becomes an immediately-editable draft campaign.

## Scope

Frontend-only. No backend, no new data models. Three files touched, no new files.

## Files

### 1. `src/components/tepilot/insights/RelationshipIntelligenceView.tsx`
- Add `onNavigate?: (tab: TabValue) => void` to the props.
- Add a new module-agnostic `RecommendedActionsCard` component rendered as the first block on the page, above the Portfolio strip.
- Card style copies the "Revenue opportunities" pattern from `AnalystDashboardView` (priority dot, title, one-line context, right-side numeric) so it feels native to the Ventus dashboards.
- 3 hand-authored actions that map cleanly to what the tiles already show:
  1. **Cross-sell HELOC to mortgage holders** — high priority, ~$182M annual opportunity, 1.4M eligible → prefills `Home Mortgage`-relative HELOC campaign.
  2. **Win back deposit outflow with High-Yield Savings** — medium priority, ~$96M protected balances, 620K users → prefills `High-Yield Savings`.
  3. **Convert cashback holders with heavy travel to Premium Travel** — medium priority, ~$74M, 480K users → prefills `Premium Travel`.
- Each row is a button. On click:
  - Write a prefill payload to `sessionStorage` under key `ventus.campaignBuilder.prefill` (`{ productName, offers?, campaignLink? }`).
  - Call `onNavigate('targeting-campaign-builder')`.
- No changes to existing tiles or copy.

### 2. `src/components/tepilot/insights/AnalyticsContainer.tsx`
- Pass `onNavigate={setActiveTab}` to `<RelationshipIntelligenceView ... />` in the `life-events` case.

### 3. `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx`
- On mount, read `sessionStorage.getItem('ventus.campaignBuilder.prefill')`. If present:
  - `setProductName(payload.productName)`
  - If `payload.offers` → `setOffers(payload.offers)`
  - If `payload.campaignLink` → `setCampaignLink(payload.campaignLink)`
  - `setMode('product')` and `setVisibleStep(3)` so the user lands on the message previews with everything filled in.
  - Clear the sessionStorage key so it doesn't re-apply on next visit.

## Visual

```text
Relationship Intelligence
──────────────────────────────────────────────────────────
[ Top 3 Recommended Actions                     3 flagged ]
 ● Cross-sell HELOC to mortgage holders           $182M
    High-equity mortgage holders, no HELOC        1.4M users →
 ● Win back deposit outflow with HYSA              $96M
    Outbound to neobank rails, no HYSA            620K users →
 ● Convert cashback → Premium Travel               $74M
    Cashback holders w/ heavy travel spend        480K users →
──────────────────────────────────────────────────────────
[ Portfolio strip (unchanged)                             ]
[ Bento tiles (unchanged)                                 ]
```

## Notes / Constraints

- Strict light theme, no `dark:` utilities — matches existing bento tiles.
- Uses the same priority-dot color scale as the AnalystDashboard: high=amber-500, medium=blue-500, low=slate-300.
- `sessionStorage` handoff keeps the two views loosely coupled and avoids threading extra state through `AnalyticsContainer`.
- All 3 product names exist verbatim in `PRODUCT_CATALOG` (`Home Mortgage` → HELOC map targets the `HELOC` entry; `High-Yield Savings`; `Premium Travel`).
