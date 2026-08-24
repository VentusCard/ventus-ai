# Approval-stage fractions in Flow Governance card

Change the **Marketing approval** and **Product owner approval** stages in the Automated Flows governance rail from single pending numbers to fractions (`9/233`, `4/233`) so each denominator reflects the total signal corpus, not the product catalog.

## Changes

1. `src/components/tepilot/campaigns/data/flowGovernance.ts`
   - Add `marketing.total` and `owner.total`, both set to `totalSignals` (the sum of all signals across `PRODUCT_FLOWS`, currently 233).
   - Change `marketing.approved` to `totalSignals - MARKETING_PENDING`.
   - Change `owner.approved` to `totalSignals - MARKETING_PENDING - OWNER_PENDING`.
   - Keep `marketing.pending` at 9 and `owner.pending` at 4.

2. `src/components/tepilot/campaigns/FlowGovernanceCard.tsx`
   - For the marketing stage, render the value as `{pending}/{total}` (e.g., `9/233`).
   - Update the marketing stage detail to read `{approved}/{total} approved · {lastReviewed}`.
   - For the owner stage, render the value as `{pending}/{total}` (e.g., `4/233`).
   - Update the owner stage detail to read `{approved}/{total} signed off · oldest: {oldestOwner}`.
   - Leave the first two stages and the live-coverage progress bar unchanged.

## Verification

- Typecheck passes.
- The governance card shows `9/233` under Marketing approval and `4/233` under Owner sign-off, both with the amber pending tone.
