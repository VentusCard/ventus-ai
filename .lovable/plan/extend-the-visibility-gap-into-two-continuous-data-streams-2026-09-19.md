# Extend the Visibility Gap into two continuous data streams

## Goal
Redesign the `/deckmo` Visibility Gap page so both the inside-the-walls and outside-the-walls columns extend to the bottom of the presentation area and continuously roll, making the contrast feel active and persistent.

## Changes
- Replace the fixed left-side ledger list with a vertically scrolling transaction ticker that loops seamlessly.
- Turn the right-side life-context list into a matching continuous ticker, preserving its visually muted “not visible” treatment.
- Size both columns to the same available height beneath the heading and carry them cleanly to the footer boundary.
- Use edge fades and duplicated rows so each loop appears smooth without a visible jump.
- Keep the existing two-step narrative: the first state emphasizes the visibility gap, then the outside stream becomes legible on advance.
- Pause or simplify the movement when reduced-motion is enabled.

## Validation
- Check the full animation loop for jumps, gaps, and overlapping rows.
- Verify both columns align and avoid clipping at 1024×768, 1389×855, 1440×900, and 1920×1080.
- Confirm slide navigation, header, and footer remain unaffected.
