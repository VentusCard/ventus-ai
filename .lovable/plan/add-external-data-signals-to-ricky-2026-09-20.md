# Add external data signals to Ricky

## Goal
Bring the external intelligence shown in `/bankdemo` into Ricky’s `/deckmo` profile while keeping the transaction-led signal experience intact.

## Changes
- Add the two Ricky-specific external signals already defined in `/bankdemo`:
  - **Annual tropical vacation in December** — outside travel booking history.
  - **Car loan expiring in ~4 months** — outside lender tradeline nearing maturity.
- Mark external pills with the same violet external-intelligence treatment used in `/bankdemo`, including a compact source indicator so they are clearly distinct from transaction-derived signals.
- Keep the existing five signal-family organization; place each external signal in its matching family rather than creating a sixth family:
  - Annual tropical vacation under Behavioral.
  - Car loan maturity under Financial.
- Extend Ricky’s static deck data with external evidence fields: source, observed signal, timing/detail, and confidence.
- When an external pill is selected, replace the left transaction ledger with a compact **External Intelligence** evidence row showing the outside source, signal detail, and confidence. No transaction rows will be shown for that selection.
- When an internal pill is selected, preserve the current supporting-transaction filtering. Clicking a selected pill again returns to all 76 transactions.
- Keep pill clicks isolated from deck navigation and preserve staged reveal behavior.

## Technical details
- Use frozen presentation fixtures only; do not connect `/deckmo` to live `/bankdemo` state or network requests.
- Extend the signal model with source type and optional external evidence, while retaining the existing transaction signal labels and tags.
- Give the left panel a shared internal/external evidence state so its heading, count/status control, columns, and content switch cleanly without changing the overall two-column composition.
- Preserve the strict light theme, existing family colors, 1560px canvas, deck header/footer, and desktop-only behavior.

## Validation
- Confirm both external pills render under the correct families and visibly identify external intelligence.
- Confirm each external pill shows its exact evidence row, source, and confidence on the left.
- Confirm all internal pills still filter the same supporting transactions and reset to all 76 rows.
- Verify pill clicks do not advance the deck.
- Check 1024×768, 1540×855, and 1920×1080 for truncation, spillover, and overlap.
- Confirm a clean build and no new network requests from `/deckmo`.
