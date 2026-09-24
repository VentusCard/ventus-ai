# Split the Complete Picture reveal into beats 3.2 and 3.3

## Experience
- Keep beat 3.1 unchanged with the living customer view and source panels.
- On beat 3.2, reveal the synthesis card with only the five signal families, centered vertically within the card.
- Do not show the three questions on beat 3.2.
- On beat 3.3, move the five signal families upward within the same card and reveal “Who they are · What they do · What do they need next?” beneath them.
- Animate the repositioning and question reveal smoothly, with an immediate final state for reduced-motion settings.

## Technical details
- Increase **The Insight** section from two beats to three so navigation and the slide counter expose 3.1, 3.2, and 3.3.
- Separate the synthesis-card state from the question state: the card and families appear at step 2, while the questions appear at step 3.
- Use stable card dimensions so the transition does not shift the surrounding source panels or customer view.
- Keep all existing copy, colors, signal-family labels, arrows, and other deck sections unchanged.

## Verification
- Check arrow-key navigation through 3.1 → 3.2 → 3.3 → 4.1 and backward.
- Confirm 3.2 shows the five families centered with no questions.
- Confirm 3.3 moves the families upward and reveals all three questions cleanly.
- Verify at 1024×768, 1540×855, and 1920×1080, including reduced motion and a clean preview build.
