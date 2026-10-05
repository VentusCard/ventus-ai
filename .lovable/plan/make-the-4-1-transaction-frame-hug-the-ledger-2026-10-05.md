# Make the 4.1 transaction frame hug the ledger

## Change
- On slide 4.1, center the transaction panel at the ledger’s existing width and make the profile header, outer border, background, and shadow end at that same width.
- On slide 4.2, smoothly expand that same panel to the current full width while the unchanged ledger moves left and the enrichment columns appear on the right.
- Keep the ledger’s width, internal column positions, row heights, scroll position, and single right-edge scrollbar stable through the transition.
- Leave slide 4.3 unchanged.

## Verification
- Compare 4.1 and 4.2 at the current presentation viewport and a shorter desktop viewport.
- Confirm the 4.1 frame hugs the centered transaction ledger, 4.2 uses the current wide frame, and no text or rows shift internally.
