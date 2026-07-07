## Audit

The "Regenerate" button in the "Micro-Segment Personalized Campaign Output" card (step 3, `MessagePreviewsSection.tsx`) increments a `regenSeed` state that flows into `buildMessageCards(product, variants, offers, campaignLink, seed)`. Two real bugs:

1. **Customer Choice Card products regenerate to identical output.** In `buildMessageCards.ts`, when `isCustomerChoiceCard(product)` is true, the function returns the hardcoded `CUSTOMER_CHOICE_CARDS` array without applying `seed` at all. Regenerate re-triggers the reveal animation but produces the exact same five cards — looks broken.
2. **Non-Customer-Choice path shifts instead of reshuffling.** BEHAVIOR slots 0 and 1 both call `pick(pool, slot, seed)` from the same pool, so on each click both slots advance by +1 together. Slot 0 after regen frequently equals slot 1 before regen — the deck appears to just "slide" by one card.

Additional UX issue: `featuredIdx` in `MessagePreviewsSection.tsx` is not reset on Regenerate, so if the user was viewing card 4 they may land on a card whose copy happens not to change, hiding the fact that content updated.

## Changes

### 1. `src/components/tepilot/campaigns/sections/buildMessageCards.ts`

- **Customer Choice branch (~line 324):** rotate `CUSTOMER_CHOICE_CARDS` by `seed` before slicing to 5, so each click yields a different 5-card window (the constant has more than 5 entries and covers each anchor family, so rotation preserves family coverage).
- **General path — BEHAVIOR slots (~lines 351–362):** decouple the two behavior slots. Use `pick(pool, 0, seed)` for slot 0 and `pick(pool, 0, seed + 1)` for slot 1 when both slots draw from the same pool, and if the resolved anchors collide, bump slot 1 to `pick(pool, 0, seed + 2)`. Keep the existing `PLAYS_BY_FAMILY.BEHAVIOR` rotation.

### 2. `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx`

- Extract the Regenerate `onClick` into a handler that both increments `regenSeed` and resets `featuredIdx` to `0`.
- Add a brief spin animation on the `RefreshCw` icon (200ms) tied to the click, so users get visible feedback even when copy differences are subtle.

## Out of scope

- No changes to `CUSTOMER_CHOICE_CARDS` content, anchor pools, or copy templates.
- No changes to `PersonalizationPreviewPanel` or `AICampaignPreview` (their Regenerate buttons already trigger real re-generation).
- No visual redesign of the panel beyond the tiny icon-spin feedback.
