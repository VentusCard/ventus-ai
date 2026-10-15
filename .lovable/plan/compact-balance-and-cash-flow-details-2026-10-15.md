# Compact balance and cash-flow details

## Presentation
- In Section 4 Demographics, extend the existing KYC phrase after **Preferred tier** with: “his balance is **$25,000**.” Render the amount as a lighter nested pill, not a separate signal. Treat it as an illustrative customer-profile balance, not a transaction-derived value.
- In Financial, add one compact signal phrase: “his monthly cash flow **surplus** is **$X** and **idle cash** is **$Y**.” Use the existing nested-pill treatment for labels and amounts.
- No additional visible breakdowns, monthly grids, or explanatory sections. Keep the existing income details and other signals unchanged.

## Calculation
- Calculate X and Y from Ricky’s existing transactions using the January–September observed-month average.
- **Surplus:** payroll income minus observed spending.
- **Idle cash:** surplus minus contributions to Marcus savings and Fidelity investments; this is a monthly residual, not the $25,000 account balance.
- Exclude transfers and card settlements that would double-count spending. Retain exceptional expenses and negative results rather than forcing positive values.
- Keep calculation scope and the illustrative balance distinction in the existing pop-up only.

## Technical details and checks
- Update deck-scoped profile attributes and financial signal data; preserve original transactions and other scenes.
- Test the $25,000 balance, the two calculations, and exclusion of double-counted transfers/settlements.
- Verify both Section 4 beats at the current desktop size and a smaller supported desktop: natural wrapping, unchanged reveal, readable pop-ups, and no click-driven slide changes.