# Redo the Visibility Gap motion

## Goal
Replace the current CSS ticker implementation with an unmistakable, reliable rolling ledger on both sides of the Visibility Gap slide.

## Changes
- Remove the current percentage-based duplicated ticker tracks and active/idle CSS classes.
- Build one reusable vertical roller that measures its rendered content and advances it by pixels with `requestAnimationFrame`.
- Render two identical copies of each list and wrap the offset at the measured copy height for a seamless loop without jumps or blank space.
- Start each roller only while the Visibility Gap section is active; reset it to the top whenever the section is re-entered.
- Give the inside and outside columns clearly visible but slightly different speeds, while keeping the ledger header fixed above the moving rows.
- Preserve the current first beat: the inside ledger starts centered, then moves left while the outside stream appears on the next beat.
- Keep the existing compact rows, rail colors, MCC descriptions, copy, and strict light presentation styling.

## Validation
- Verify the actual pixel offset changes over time on both columns at the current 1219×761 viewport.
- Verify re-entering the slide restarts both rollers from the top.
- Check the first and second reveal beats, fixed ledger header, seamless looping, and no clipping or spillover at 1024×768, 1219×761, 1440×900, and 1920×1080.
- Confirm reduced-motion users receive a stable, readable list and that the project remains build-clean.

## Technical note
The replacement will use measured pixel distances rather than `translateY(-50%)`, avoiding track-height and browser timing ambiguities in the current animation.