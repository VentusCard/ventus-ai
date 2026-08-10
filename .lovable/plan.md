# Customer Device Mockup as First Sub-Tab on the Personalized Pages

Add the customer-facing device mockup from the Demo tab as the first sub-tab on all three Personalized pages in /bankdemo, driven by whatever the Demo tab last produced in this session.

## What changes

Each of the three pages gets a sub-tab bar at the top:

- **Personalized Deals** — Customer View | Next-Deal Intelligence | Deals & Perks | Gamification
- **Personalized Product** — Customer View | Segment Targeting
- **Personalized Relationship** — Customer View | Customer Insights | Relationship Intelligence | AI Banking Assistant | WM Coworker

"Customer View" is selected by default and shows the same mockup rendered in the Demo tab, opened to the surface that matches the page:

- Deals → Rewards
- Product → Membership / product cards
- Relationship → AI assistant chat

The existing sections keep their current content and order; they just move from stacked cards into sub-tabs.

## Data

The mockup mirrors the live demo session: the selected customer, generated offers, product cards, detected life events, enriched transactions, and risk flags produced by the Demo tab. Since the Demo tab pre-fires and stays mounted, the mockup is populated as soon as that run finishes and stays in sync.

If the demo has not produced results yet, the mockup renders the default sample customer with a small note and a link to the Demo tab, rather than an empty frame.

```text
[ Customer View | Next-Deal Intelligence | Deals & Perks | Gamification ]
+------------------------------+-------------------------------------+
|                              |  What the customer sees             |
|      device mockup           |  short explainer + signal source    |
|      (live demo data)        |  link -> Demo tab                   |
+------------------------------+-------------------------------------+
```

## Technical notes

- New module `src/lib/execDemoSessionStore.ts`: a small module-level store (subscribe/snapshot via `useSyncExternalStore`) holding `customer`, `generatedOffers`, `productCards`, `detectedLifeEvents`, `enrichedTxs`, `riskFlags`, and a `hasRun` flag.
- `src/pages/ExecDemoPage.tsx` publishes into that store whenever those values change; no behavior change to the demo itself.
- New shared component `src/components/tepilot/insights/CustomerMockupPanel.tsx` reads the store and renders `ExecDemoPhoneView` with `activeTab` mapped per page (`rewards` | `product` | `relationship`), plus the explainer column and fallback state.
- `PersonalizedDealsView.tsx` and `PersonalizedRelationshipView.tsx` swap their stacked `Section` layout for a Tabs layout (shadcn `Tabs`, strict light theme) keeping the existing `TabHeader`.
- `AnalyticsContainer.tsx`: `targeting` renders a new `PersonalizedProductView` wrapper with the Customer View tab and `SegmentTargetingView`.
