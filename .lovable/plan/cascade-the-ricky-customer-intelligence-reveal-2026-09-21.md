# Cascade the Ricky customer-intelligence reveal

## Experience
- Keep beat one unchanged: the right side remains empty.
- On beat two, reveal **VENTUS CUSTOMER INTELLIGENCE** first, then sweep through the five signal-family rows from top to bottom.
- Within each row, reveal its pills one after another from left to right, creating a clear cascading review rather than showing the whole row at once.
- Use a short fade, upward settle, and subtle scale-in for each pill. Keep the full sequence brisk and presentation-safe, without looping or distracting movement.
- Preserve every pill's size, color, label, layout, selection state, and transaction-filtering behavior.
- Under reduced-motion settings, show the intelligence label, family labels, and pills immediately without transforms.

## Technical details
- Extend the Ricky signal rendering so the family heading and each pill receive deterministic cumulative delays.
- Coordinate row and pill delays as one sequence, avoiding the current nested row-only reveal delay.
- Keep the animation scoped to the second beat's entrance so clicks do not replay the cascade.
- No changes to data, copy, navigation, other slides, or the first beat.

## Verification
- Check both Ricky beats at 1024×768, 1540×855, and 1920×1080.
- Confirm the complete cascade finishes promptly, no pills clip or shift the layout, and pill filtering still works.
- Confirm reduced-motion behavior and a clean preview build.
