## Add "Offers" subsection to Step 1 (Campaign Builder)

Add a promotional **Offers** area inside `ProductPickerSection`, placed **between** the selected-product card and the addressable-population card in a single row.

### Layout (after a product is selected)

Three-column row, widths `50% / 25% / 25%`:

```text
┌─────────────────────────┬──────────────┬──────────────┐
│ Selected product (50%)  │ Offers (25%) │ Population   │
│ — name, mechanics       │ free-text +  │ (25%)        │
│   tagline, fee          │ chip list    │ users count  │
└─────────────────────────┴──────────────┴──────────────┘
```

Implementation in `ProductPickerSection.tsx`:
- The existing wrapper (currently `flex gap-3` at line 68) stays; product card becomes `w-1/2`, the new Offers card `w-1/4`, the population card changes from `w-[40%]` to `w-1/4`.
- Offers card: white bg, slate-200 border, header "Offers (optional)", small free-text `Input` + Add button (Enter submits), active offers render as removable chips below.
- Validation: trim, dedupe, cap 5 offers, 80 chars each.
- Strict light theme, no `dark:` classes.

### State lift

`ProductCampaignBuilderView.tsx` owns `offers: string[]`. Resets on product change. Passes to `ProductPickerSection` (controlled) and `MessagePreviewsSection`.

### Downstream effect

`MessagePreviewsSection` forwards `offers` to `buildMessageCards(product, variants, offers)`:
- If `offers.length > 0`, prepend one `MessageCard` with `anchorFamily: "USAGE"`, `play: "OFFER"`, `anchor: offers[0]`, copy that names the offer and the product, CTA "Claim offer".
- Append `" — ${offers[0]}"` tail to the STACK card body.
- Variant-count math unchanged (offer card is presentational).

### Files touched

- `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx` — restructure selected-state row to 50/25/25; add Offers card; new props `offers`, `onOffersChange`.
- `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx` — own `offers` state, reset on product change, pass down.
- `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx` — accept and forward `offers`.
- `src/components/tepilot/campaigns/sections/buildMessageCards.ts` — accept optional `offers`, prepend offer card, append STACK body tail.

### Out of scope

- No persistence, no edge functions, no schema changes.
- Step 2 funnel and the variant-count formula unchanged.
