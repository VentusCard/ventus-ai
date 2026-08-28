# Activation Destinations: Add Navigation Buttons

## Goal

In `/bankdemo` → System tab, each of the 9 cards in the "Activation destinations" column gets a small navigation button (arrow) that jumps the user to the matching tab in the left nav.

## Destination → tab mapping

```text
Intelligence Database        → Intelligence Database   (ventus-ai-dashboard)
Ventus AI Coworker           → AI Coworker             (wm-copilot)
Personalized Relationship    → Personalized Relationship (personalized-relationship)
Automations Campaign         → Automated Flows         (targeting-automated-flows)
Custom Product Builder       → Campaign Builder        (targeting-campaign-builder)
Personalized Product Offer   → Personalized Product    (personalized-products)
Personalized Reward Program  → Personalized Deals      (personalized-deals)
Local Merchant Deals         → Rewards and Perks       (growth-merchant-partnerships)
Loyalty & Retention          → Rewards and Perks       (growth-merchant-partnerships)
```

## Changes

1. `src/components/tepilot/insights/CapabilitiesView.tsx`
  - Add a `tab: TabValue` field to each `DESTINATIONS` entry per the mapping above.
  - In the destination row (~line 1137), add a right-aligned circular arrow button (`ArrowUpRight` icon, `h-7 w-7`, slate tint, hover deepens to blue). Clicking it calls `onNavigate(d.tab)`.
  - Accept a new optional prop `onNavigate?: (tab: TabValue) => void`; render the button only when the prop is present.
2. `src/components/tepilot/insights/AnalyticsContainer.tsx`
  - Pass `onNavigate={setActiveTab}` to `<CapabilitiesView />` (line 369) — the same pattern already used by `VentusAIDashboardView`.
3. Interaction details
  - Button has `title="Open {tab label}"` tooltip.
  - Clicking the button does not trigger the walkthrough/grayscale logic; the whole row stays non-clickable except the arrow.
  - Strict light theme; no new colors beyond existing slate/blue tints.

## Verification

- Load `/bankdemo` → System tab, click each arrow and confirm the matching tab activates in the left nav.