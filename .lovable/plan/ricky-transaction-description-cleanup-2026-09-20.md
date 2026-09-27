# Ricky transaction description cleanup

## Goal
Make Ricky’s 76-row ledger read like a real bank transaction feed rather than a curated demo dataset.

## Changes
- Remove the secondary explanatory line from every transaction row.
- Replace each current clean merchant label with one realistic statement-style transaction description.
- Audit all 76 rows for consistent formatting by payment source:
  - Card purchases: abbreviated merchant, location or channel, and reference details where natural.
  - ACH: originator plus debit, credit, settlement, transfer, payroll, or bill-payment context.
  - Checks: check number plus payee.
  - Wires: inbound/outbound notation, beneficiary, and reference fragment.
  - Zelle: transfer direction plus abbreviated recipient.
- Preserve the current dates, sources, amounts, ordering, signal tags, and pill-filter behavior.
- Keep MCC code and category only for card transactions, displayed as compact inline metadata rather than a second description line.
- Tighten each ledger row to a single description line so more transactions remain visible without adding new scrolling behavior.

## Validation
- Review the complete 76-row dataset for natural, non-repetitive statement descriptors and correct source conventions.
- Confirm every signal pill still returns the same supporting transactions and the all-transactions view still shows 76 rows.
- Check `/deckmo` at 1024×768, 1540×855, and 1920×1080 for truncation, spillover, and unintended deck navigation when filters are clicked.
- Confirm the project builds cleanly and remains static/network-free.
