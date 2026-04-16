

## Remove Reward Value and Quote from Next-Offer Deal Tiles

### What changes
Remove the `rewardValue` line (e.g., "$50 Credit") and the `message` quote (e.g., "Upgrade your travels...") from each deal tile in the Next-Offer tab.

### Fix — `src/components/exec-demo/NextOfferRationale.tsx`

Delete lines 93-101 in the `RollupCard` component — the `rewardValue` badge and the `message` italic quote. The remaining tile will show: merchant name, signal indicator, signal reason pill, and CTA button.

