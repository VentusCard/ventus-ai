

## Show Personalized Rewards in Phone View on "Next-Offer" Tab

### Problem
The iPhone mockup in the exec demo always shows "Waiting for analysis..." — it never renders actual content. When the "Next-Offer" (rewards) tab is active, it should display the personalized rewards view with deals, AI-personalized messages, and location-based perks.

### Changes

**File: `src/pages/ExecDemoPage.tsx`** — 2 lines changed

1. Change `showContent={false}` to `showContent={activeTab === "rewards" && phase !== "idle"}` — this enables the phone content only when the rewards tab is selected and analysis has started.

**File: `src/components/exec-demo/ExecDemoPhoneView.tsx`** — ~5 lines changed

1. When `consumerTab === "rewards"`, pass the customer's enriched transactions (from `classifiedRef` if available) to `DemoRewardsView`. Since the phone view doesn't currently receive enriched data, and `DemoRewardsView` already gracefully handles the case with no enriched transactions (it uses `deriveCustomerProfile` from the customer's CSV data internally), the view will work immediately with deals, personalized messages via the edge function, and location perks based on the customer's zip code.

The `DemoRewardsView` component already:
- Derives a customer profile from enriched transactions (or works without them)
- Selects 11 relevant deals proportionally by pillar
- Calls the `deal-personalization` edge function for AI messages
- Shows location-based perks via `getCityFromZip` + `getPerksForCity`
- Renders hero deal, category filters, deal grid, and local perks section

Two files, ~7 lines changed.

