# Redesign Inside the Walls as a rolling multi-rail ledger

## Goal
Turn the left side of the `/deckmo` Visibility Gap page into a realistic anonymized bank ledger that continuously streams transactions from every major rail.

## Ledger content
- Replace generic phrases such as “Some checks” with anonymized raw transaction entries across card, ACH, check, wire, bill pay, ATM, and P2P rails.
- Show each row as structured ledger data: masked customer/account reference, date or time, rail, raw description, and amount.
- Display an MCC field only on card transactions. Non-card rows will not show an MCC placeholder, reinforcing that this metadata is rail-specific.
- Keep descriptions generic and anonymized, with no identifiable customer or institution details.

## Visual redesign
- Restyle the left stream as a dense transaction table rather than a stack of cards.
- Add a fixed column header and a compact live-ledger status bar while transaction rows roll continuously beneath it.
- Use monospaced text for raw descriptions and identifiers, subtle row separators, debit/credit cues, and restrained rail labels.
- Preserve the existing full-height loop, edge fades, right-side animation, two-step narrative, and strict light presentation theme.
- Keep a static readable ledger when reduced-motion is enabled.

## Validation
- Confirm MCC values appear only on card rows.
- Check that long descriptions, amounts, and rail labels remain aligned without clipping.
- Verify smooth looping and readable density at 1024×768, 1389×855, 1440×900, and 1920×1080.
- Confirm slide navigation, the outside stream, header, and footer remain unchanged.
