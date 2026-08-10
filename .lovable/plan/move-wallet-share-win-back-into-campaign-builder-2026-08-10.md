# Move Wallet Share & Win-Back into Campaign Builder

Wallet Share & Win-Back currently sits as its own tab under Growth Opportunities. It becomes a third sub-tab inside Campaign Builder, alongside "Start from a product" and "Start from signals".

## What changes

- Campaign Builder gains a third toggle: **Start from outflow** (Wallet Share & Win-Back), rendering the existing wallet-share workspace (metrics, category chart, trend, competitor table, win-back recommendations) inline.
- The "Build win-back campaign" button on each recommendation now switches the builder to the product-first mode with the campaign pre-filled, instead of navigating away.
- The standalone "Wallet Share & Win-Back" item is removed from the Growth Opportunities sidebar group; Growth Opportunities keeps Automated Flows, Campaign Builder, and Merchant Partnerships.
- Existing links that point at wallet share (analyst dashboard cards, the Ventus AI welcome grid, demo overlay) still work — they land on Campaign Builder with the outflow sub-tab already selected.

## Technical notes

- `ProductCampaignBuilderView` gets a `BuilderMode` of `"product" | "signals" | "outflow"` plus an optional `initialMode` prop, and renders `<WalletShareView variant="growth" onLaunchCampaign={...} />` for the outflow mode. Its `onLaunchCampaign` sets local state (product, offers, step 3) and flips the mode to `product` rather than writing to sessionStorage.
- `AnalyticsContainer`: drop the `wallet-share` nav entry; keep `'wallet-share'` in `TabValue` and route it to `<ProductCampaignBuilderView initialMode="outflow" />` so existing deep links keep working.
- `ventusAiTabContext` entry for `wallet-share` stays as-is so the AI chat context still resolves for that route.
