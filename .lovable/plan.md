# Growth Opportunities: candidate tabs for /bankdemo

The current **Growth Opportunities** section contains two tabs:
- **Automated Flows** — always-on, per-product signal enrollment
- **Campaign Builder** — one-off product or signal-driven campaigns

For a prospect demo, the most natural additions are read-only intelligence views that show *where* growth is leaking or waiting to be captured, then let the user turn the finding into an automated flow or campaign.

## Candidate tabs

### 1. Merchant Partnership Opportunities
Surface behaviorally adjacent product extensions that MCC codes miss (e.g., pet owners → pet insurance, outdoor spend → bike shop financing).
- Uses existing `CategoryExtensionOpportunities.tsx`
- Shows estimated revenue, addressable users, confidence, and merchant partners
- Action: "Launch campaign" pre-fills Campaign Builder with the extension product

### 2. Wallet Share & Win-Back
Show deposit flight to competitors and recapture opportunities.
- Uses existing `WalletShareView.tsx` and win-back recommendations
- Highlights outbound ACH/wire patterns to neobanks, brokerages, BNPL, auto lenders
- Action: "Create win-back flow" creates an Automated Flow for the affected segment

### 3. Life Event Funnel
A pipeline view of detected life-event signals and how many convert to booked products.
- Uses existing life-event detection and `LifeEventFunnelReport.tsx`
- Stages: Signal detected → Enrolled → Engaged → Converted
- Action: "Build life-event campaign" opens Campaign Builder with the event pre-selected

### 4. Cross-Sell Matrix
Card-product-to-card-product opportunity heatmap.
- Uses existing `CrossSellReport.tsx` data
- Shows from/to product opportunity levels and estimated annual increase
- Action: "Activate cross-sell flow" enables the matching Automated Flow

### 5. Deposit & Funding Growth
Focus on HYSA, CD, and money-market opportunities based on cash-flow signals.
- Could reuse `PRODUCT_FLOWS` Deposits entries
- Adds a cash-hoarding signal view and rate-sensitive segment sizing
- Action: "Launch deposit flow"

## Recommended first build

Add **Merchant Partnership Opportunities** as the third tab in Growth Opportunities.
- It is visually distinct from the other two tabs (cards + table vs. flows/builder)
- It directly answers "where is the hidden revenue?"
- It creates a clean demo narrative: discover opportunity → build campaign → activate automated flow

## Implementation notes

- Add a new tab value `merchant-partnership-opportunities` to `TabValue` and `NAV_GROUPS` in `AnalyticsContainer.tsx`
- Reuse `CategoryExtensionOpportunities` component; wrap with `TabHeader`
- Add a "Launch campaign" CTA on each expanded opportunity card that writes to `sessionStorage` with the same prefill shape `ProductCampaignBuilderView` already reads (`ventus.campaignBuilder.prefill`)
- No backend or edge-function changes; all data is mocked
- Strict light theme, white cards, slate-200 borders

## Optional follow-ups

1. Add **Wallet Share & Win-Back** as a fourth tab
2. Add **Life Event Funnel** as a fifth tab
3. Rename the section from "Growth Opportunities" to "Growth & Partnerships" if Merchant Partnerships lands
