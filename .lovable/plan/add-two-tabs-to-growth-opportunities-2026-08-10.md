# Add two tabs to Growth Opportunities

Extend the **Growth Opportunities** sidebar section on /bankdemo from two tabs to four:

```text
Growth Opportunities
  Automated Flows          (existing)
  Campaign Builder         (existing)
  Merchant Partnerships    (new)
  Wallet Share & Win-Back  (new)
```

## 1. Merchant Partnerships

Surfaces behaviorally adjacent product extensions that MCC codes cannot connect (pet spend → pet insurance, outdoor gear → bike financing, etc.).

- Reuses the existing `CategoryExtensionOpportunities` component, which today only lives inside the Rewards analytics dashboard.
- Wrapped in a `TabHeader` explaining how the bridge works and why it matters.
- Each expanded opportunity gains a **Launch campaign** action that writes the `ventus.campaignBuilder.prefill` sessionStorage payload (product name + offers + link) and jumps to Campaign Builder, which already reads that key.

## 2. Wallet Share & Win-Back

Shows deposit and payment flight to competitors, plus recapture plays.

- Reuses the existing `WalletShareView` component, which is currently only reachable by drilling in from the Dashboard — it becomes a first-class tab.
- Wrapped in a `TabHeader` framed as an opportunity/optimization view (recapture, not "risk").
- Win-back recommendations gain a **Build win-back campaign** action using the same Campaign Builder prefill handoff.

## Demo narrative

Discover the opportunity (Merchant Partnerships / Wallet Share) → build the campaign (Campaign Builder) → let it run always-on (Automated Flows).

## Technical notes

- `src/components/tepilot/insights/AnalyticsContainer.tsx`
  - Add `growth-merchant-partnerships` to `TabValue`; `wallet-share` already exists.
  - Add both items to the `Growth Opportunities` group in `NAV_GROUPS` (icons `Handshake` and `Wallet`).
  - Add the render case for the new merchant partnerships view; `wallet-share` already has a case.
- New wrapper `src/components/tepilot/insights/MerchantPartnershipsView.tsx` — `TabHeader` + `CategoryExtensionOpportunities`.
- Add an `onLaunchCampaign` optional callback to `CategoryExtensionOpportunities` and to the wallet-share win-back cards; the container passes a handler that writes the prefill payload and calls `setActiveTab('targeting-campaign-builder')`.
- Add tab context entries in `src/lib/ventusAiTabContext.ts` for the new tab so the Ventus AI chat panel has quick actions.
- All data stays mocked; no backend or edge-function changes.
- Strict light theme: white cards, slate-200 borders, no `dark:` classes.

## Validation

- Typecheck.
- Preview /bankdemo: confirm the four tabs render under Growth Opportunities and the launch-campaign handoff lands on Campaign Builder at step 3 with the product pre-selected.
