

## Plan: Add Signal Logic Pills to Each Deal Card

### Problem
The `SignalBadge` component exists but is unused. Each deal tile only shows a small icon — the `signalReason` text from the AI is never displayed.

### Fix — `src/components/exec-demo/NextOfferRationale.tsx`

**Inside each deal tile (lines 81-101)**, add a signal reason pill after the merchant name row:

- For **boost** deals: show a small emerald pill with "↑ {signalReason}"
- For **neutral** deals: show a small slate pill with the reason text

The pill should be compact (`text-[8px]`, `line-clamp-1`, `rounded-full`) to fit within the grid column. Place it between the merchant name and the reward value badge.

The `SignalBadge` component (lines 110-131) can be removed since it's unused elsewhere; the pill will be inlined directly in the tile for better sizing control.

### Single file changed
`src/components/exec-demo/NextOfferRationale.tsx` — add ~5 lines per deal tile for the signal reason pill.

