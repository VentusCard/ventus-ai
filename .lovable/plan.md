## Goal
Make the **Delivery Channel** selector visually distinct from the 3 product cards by pairing it side-by-side with the **Creditworthiness** banner in a single row above the product columns.

## Changes (all in `src/components/exec-demo/NextProductRationale.tsx`)

### 1. Row layout
Replace the two stacked full-width blocks with one flex row:

```text
┌─────────────────────────────┬───────────────────────────┐
│  Delivery Channel (≈2/3)    │  Creditworthiness (≈1/3)  │
└─────────────────────────────┴───────────────────────────┘
┌──────────┬──────────┬──────────┐
│ Product 1│ Product 2│ Product 3│
└──────────┴──────────┴──────────┘
```

- Wrap `ProductDeliveryChannelCard` + `CreditworthinessBanner` in `<div className="flex items-stretch gap-3">`.
- Channel selector gets `flex-[2]`; creditworthiness gets `flex-[1]` so the channel options stay readable.
- If only one of the two is present, it spans full width.

### 2. Visual distinction for the channel selector
Make it read as an interactive "control strip" rather than another card:
- Swap the white card background for a subtle slate gradient (`bg-gradient-to-r from-slate-50 to-white`) with a thicker left accent bar in indigo to signal "delivery surface".
- Add a small header row: indigo `Send` icon + `DELIVERY CHANNEL` label + helper text "Preview the touchpoint" right-aligned.
- Active option gets a stronger ring + soft drop shadow; inactive options become flat ghost buttons (no border) so the selected one pops.
- Reduce option tile height a touch so the row matches the creditworthiness banner height visually.

### 3. Creditworthiness banner tweaks (minor)
Trim the inner padding from `py-6` to `py-4` and tighten the horizontal layout so it sits at the same height as the channel card in the new row.

No prop, state, or backend changes.

## Files touched
- `src/components/exec-demo/NextProductRationale.tsx` — wrap selector + credit banner in a flex row, slim padding.
- `src/components/exec-demo/ProductDeliveryChannelCard.tsx` — restyle (gradient bg, accent bar, header row, sharper active state).
