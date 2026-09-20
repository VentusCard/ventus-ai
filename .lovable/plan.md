# Visibility Gap rolling-animation fix

## Confirmed diagnosis
- Both CSS animations are technically running, but they begin as soon as the deck mounts, while the Visibility Gap section is still off-screen.
- The current loops move three identical stacked copies by a percentage of the entire track. The content therefore changes position, but repeated rows and weak edge transitions make the movement easy to perceive as a static list.
- The inside ledger has only eight unique compact rows, leaving the lower part of its tall panel visually empty at points in the cycle; this undermines the intended full-height rolling-ledger effect.
- The outside stream uses taller cards and a different track height, so the two sides do not read as a coordinated pair.

## Changes
1. Start and reset both rollers when the Visibility Gap section becomes active, rather than letting them run off-screen from initial page load.
2. Rebuild each roller as a seamless two-track vertical marquee with enough repeated content to keep its visible window filled throughout the cycle.
3. Give both sides clearly perceptible, coordinated motion with slightly different speeds, while retaining the fixed ledger header and the existing centered-to-split reveal.
4. Strengthen the top and bottom clipping/fades so rows visibly enter and exit instead of appearing to shuffle in place.
5. Preserve the existing transaction copy, rail colors, MCC rules, outside-the-walls copy, header/footer, and all other deck slides.

## Validation
- Verify the first Visibility beat shows the centered ledger rolling immediately.
- Verify the second beat keeps the ledger rolling while the outside stream appears and rolls independently.
- Compare frames over time at the current presentation viewport and standard desktop sizes.
- Confirm no rows cross the ledger header, no empty track gap appears, no clipping occurs, and reduced-motion users receive a stable layout.
