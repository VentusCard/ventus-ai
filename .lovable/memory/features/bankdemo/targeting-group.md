---
name: Bankdemo Targeting Group
description: New Targeting sidebar group below Analytics on /bankdemo with two product-first views (Automated Flows and Campaign Builder), independent from the legacy Next-Best Product Engine tab
type: feature
---
On /bankdemo `AnalyticsContainer`, the "Targeting" nav group sits directly below "Analytics" and contains:
- Automated Flows → `ProductAutomatedFlowsView` (product-first cards: 529, HELOC, Wealth, Auto, Mortgage, Personal Loan, HYSA, Travel Card, SBL, Term Life)
- Campaign Builder → `ProductCampaignBuilderView` (3-step flow: pick product → layer signals → generate segment + personalized output)

Catalogs:
- `src/lib/productAutomatedFlows.ts` — shared product catalog with signals/evidence per product
- `src/lib/lifestyleAssetSignals.ts` — mock Lifestyle Asset Signals (luxury auto, marine, country club, etc.) with `detectionRate` used by `estimateAssetSignalAudience`

All data is mocked; no edge functions or DB calls. The existing "Next-Best Product Engine" tab under Relationship is intentionally untouched. Strict light theme — white cards, slate-200 borders, no `dark:` classes.
