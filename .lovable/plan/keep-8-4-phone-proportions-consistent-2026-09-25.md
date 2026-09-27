# Keep 8.4 phone proportions consistent

## Change
- Give every phone on beat 8.4 one shared fixed aspect ratio matching the original 8.3 phone frame.
- Let height remain responsive to the available slide space, while deriving width from that ratio instead of sizing height and width independently.
- Apply the same sizing rule to the retained Hawaii phone and all three incoming AI phones so none appear stretched or compressed.

## Verification
- Check beats 8.3 and 8.4 at 1540×855 and 1920×1080.
- Confirm all four 8.4 phones have identical proportions, fit without clipping, and retain their existing animation and interactions.
- Confirm the preview build remains clean.
