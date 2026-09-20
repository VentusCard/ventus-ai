# Slow and synchronize the Visibility Gap rollers

## Goal
Make both Visibility Gap streams move more calmly and at exactly the same continuous speed.

## Changes
- Set the Inside the Walls ledger and Outside the Walls stream to one shared speed of 40 pixels per second, replacing their current 66 and 52 pixels per second rates.
- Keep the existing measured, seamless loop, restart-on-entry behavior, centered-to-split reveal, clipping, and reduced-motion fallback unchanged.

## Validation
- Confirm both columns advance by the same pixel distance over the same time interval.
- Check both reveal beats for smooth movement, seamless wrapping, and no gaps or spillover at the current presentation size and standard desktop sizes.
- Confirm the preview remains build-clean.
