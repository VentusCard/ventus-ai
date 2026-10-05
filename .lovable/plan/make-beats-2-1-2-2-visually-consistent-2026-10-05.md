# Make beats 2.1–2.2 visually consistent

## Goal
Use the existing **Meet Ricky** profile and transaction table from the start of section 2, instead of switching between two unrelated panel designs.

## Changes
- **2.1:** Replace the current generic visibility ledger with Ricky’s profile header and the same raw transaction rows used in the later Ricky beats. Center the compact transaction panel and keep the current visibility-gap message.
- **2.2:** Smoothly move that exact transaction panel to the left without changing its rows, column positions, row heights, or scroll position.
- Reveal the existing outside-the-bank events panel on the right, preserving the current 2.2 narrative and animation.
- **2.3 onward:** Keep the current enriched ledger, internal-signal, and external-signal sequence unchanged. The transition into 2.3 will continue from the same Ricky transaction data.
- Keep one consistent Ricky profile header, panel border, transaction header, and row treatment across the sequence.

## Technical details
- Reuse the Ricky transaction-table presentation rather than the separate generic `InsideLedger` rows.
- Share the 2.1/2.2 transaction element so navigation animates position instead of replacing or remounting it.
- Preserve the current section numbering, navigation, institution terminology switching, and all later deck interactions.

## Validation
- Check 2.1 through 2.5 at 1590×1024 and 1376×855.
- Confirm the transaction rows remain visually identical between 2.1 and 2.2, only the panel position changes, and the outside panel appears on the right.
- Confirm 2.3 still expands into enrichment, 2.4 shows internal signals only, and 2.5 adds external signals.
