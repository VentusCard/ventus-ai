# Financial balance and monthly leftovers

## Section 4 additions
- Add two internal Financial signals immediately after income, before Fidelity, Marcus, Amex, and the external BMW signal.
- **Checking balance:** nested attributes for `Checking`, `Illustrative $85,000`, and `Demo balance · September 2026`. This is a proposed demo value, not an actual balance or a balance derived from transactions.
- **Monthly leftovers:** show both comparisons in one compact parent pill, with lighter nested attributes:
  - `After spending` → calculated monthly amount.
  - `After spending + saving + investing` → calculated monthly amount.
  - `Jan–Sep 2026 average` and `Based on sample transactions` to make the scope clear.
- Keep these distinct from the existing payroll and estimated household-income attributes.

## Calculation and evidence
- Use observed HP payroll as the income basis, consistent with the existing income signal; identify it explicitly as payroll rather than total household income. Show business receipts and refunds separately in the detailed explanation, not silently added to salary.
- Calculate each month’s observed expenses from purchases and other expense payments. Exclude savings transfers, investment transfers, and credit-card settlements from expenses; do not count purchases and their settlements twice. Review other funding/transfer rows before including them and show the inclusion/exclusion basis in the pop-up.
- First comparison: **payroll − observed expenses**.
- Second comparison: **payroll − observed expenses − Marcus savings − Fidelity investing**.
- Calculate January–September month-by-month, then use the average of those nine observed months in the compact signal. Do not claim the sample captures all spending or that September is a complete statement month.
- Keep exceptional expenses, including home-purchase outlays, in the relevant month; visibly identify them in the breakdown rather than excluding them to make leftovers look larger. Display negative amounts faithfully.

## Pop-ups
- Checking-balance pop-up: prominently label the balance illustrative; no supporting transaction table implying it proves the balance.
- Monthly-leftovers pop-up: a readable monthly table with Payroll, Spending, After spending, Savings, Investing, and After spending + saving + investing, plus the calculation basis and original/enriched supporting transactions using the existing scrollable table.
- Preserve family colors, nested-pill styling, internal-first ordering, both reveal steps, and click-to-open behavior. Keep other sections unchanged; leave BMW in Financial.

## Technical details
- Add a deck-scoped financial-summary helper using integer-cent arithmetic and explicit transaction inclusion/exclusion rules; keep the illustrative balance separate from calculated figures.
- Extend structured signal definitions, narrative segments, attributes, and detail rendering rather than changing transaction amounts or enrichment classifications.
- Document the calculation boundary and separate illustrative balance source in the project architecture rules; record the approved presentation requirements in project memory during implementation.

## Validation
- Add tests for both subtraction formulas, nine-month averaging, Marcus savings and Fidelity investing, card-settlement exclusion, exceptional expenses, negative results, and the separation of demo balance from calculated cash flow.
- Update signal coverage/order tests for 17 signals, then run the relevant deck tests.
- Verify both Section 4 beats, both new pop-ups, scrolling, readable values, unchanged navigation, and no reveal reflow at the current 1375×1011 size and smaller supported desktops.