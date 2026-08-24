# Marketing approval fraction in Flow Governance card

Change the **Marketing approval** stage in the Automated Flows governance rail from a single pending number (`9`) to a fraction (`9/233`) so the denominator reflects the total signal corpus, not the product catalog.

## Changes

1. `src/components/tepilot/campaigns/data/flowGovernance.ts`
   - Add `marketing.total` set to `totalSignals` (the sum of all signals across `PRODUCT_FLOWS`, currently 233).
   - Change `marketing.approved` to `totalSignals - MARKETING_PENDING`.
   - Keep `marketing.pending` at 9.

2. `src/components/tepilot/campaigns/FlowGovernanceCard.tsx`
   - For the marketing stage, render the value as `{pending}/{total}` (e.g., `9/233`).
   - Update the marketing stage detail to read `{approved}/{total} approved · {lastReviewed}`.
   - Leave the other four stages and the live-coverage progress bar unchanged.

## Verification

- Typecheck passes.
- The governance card shows `9/233` under Marketing approval with the amber pending tone.
