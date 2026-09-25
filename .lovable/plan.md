# Enlarge beat 5.2 transaction experience

## Goal
Make the transactions on beat 5.2 substantially larger and use the presentation canvas instead of confining them to the current narrow center column.

## Changes
- Give beat 5.2 a wide, page-filling transaction layout within the existing presentation header and footer.
- Enlarge transaction rows, merchant names, dates, amounts, rail labels, and purchase icons for boardroom readability.
- Increase row spacing and distribute the transaction list across the available height without introducing scrolling at standard deck sizes.
- Keep the existing transaction order, colors, click-to-open details, confirmation behavior, and arrow-only deck navigation unchanged.
- Preserve the current three-column presentation for the other beats in section 5 unless their content needs the same shared sizing to prevent a visual jump.

## Validation
- Check beat 5.2 at 1540×855 and 1920×1080.
- Confirm the transaction experience fills the slide cleanly, all rows remain visible, text does not wrap or clip, and transaction details still open correctly.
- Confirm adjacent beats and deck navigation remain unchanged and the preview builds cleanly.
