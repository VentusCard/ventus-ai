

## Goal
Make ALL generated deals (rollup offers) AND product recommendation cards available to the AI chatbot in the phone mockup, so users can ask "what offers do I have?" or "what products are recommended for me?" and get accurate answers grounded in what's actually shown in the Rewards/Offers tabs.

## Current State
- `ConsumerAIChatView` already receives `personalizedDeals` and includes them in context, BUT:
  - The deals passed are flattened from `generatedOffers` and lose the rollup grouping/pillar context.
  - **Product cards (`productCards` from "Offers" tab) are NOT passed to the chatbot at all.**
- `consumer-chat` edge function reads `context.deals` (max 5) but has no awareness of product recommendations.

## Plan

### 1. `src/components/exec-demo/ExecDemoPhoneView.tsx`
In the `case "ai":` block, build a richer payload:
- **Deals**: pass full `generatedOffers` with rollup labels, pillars, merchant, product, message, deal type (boost/neutral) — not just flattened list of 5.
- **Product cards**: map `productCards` into a new `productRecommendations` array with `product_name`, `signal_label`, `theme`, `quote`, `offer_headline`, `benefits`, `eligibility`, `cta`.
- Pass both to `ConsumerAIChatView` via existing `personalizedDeals` prop (expand the type) plus a new `productRecommendations` prop.

### 2. `src/components/demo/ConsumerAIChatView.tsx`
- Add `productRecommendations?: ProductCard[]` to `Props`.
- Update `buildContext()` to:
  - Output deals with full grouping (pillar → rollup label → list of {merchant, product, message, type}).
  - Add a new `productRecommendations` section in context with name, theme, signal, headline, benefits, value.
- Pass both into the `context` object sent to `consumer-chat`.

### 3. `supabase/functions/consumer-chat/index.ts`
In `buildContextPrompt`:
- Replace the current `context.deals.slice(0, 5)` block with a richer rollup-grouped rendering (no slice — include all).
- Add a new section for `context.productRecommendations` listing each card's product name, headline, benefits, value, signal it was triggered by.
- Update the system prompt's "PRODUCT RECOMMENDATIONS" rule (line 36) to say: "If the customer asks about offers/deals/products, prioritize what's listed in PERSONALIZED DEALS or PRODUCT RECOMMENDATIONS. These are pre-generated for this customer — surface them directly with their actual headlines and benefits."

### 4. Quick action (optional polish)
Add "What offers do I have?" to `QUICK_ACTIONS` in `ConsumerAIChatView` so users discover the new capability.

## Verification
- Run /demo end-to-end → wait for Rewards + Offers tabs to populate → switch to AI tab.
- Ask: "What deals do I have?" → bot should list all rollup deals with merchant + product + message.
- Ask: "What products are you recommending for me?" → bot should list both product cards with their headlines and benefits.
- Ask: "Why are you recommending [product]?" → bot should reference the signal/theme.

## Out of scope
- Bankwide chat panel (`VentusAIChatPanel`) — separate context model.
- Other tabs/pages.
- Persisting chat history.

