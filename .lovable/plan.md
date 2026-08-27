Remove grey-out from Customer Intelligence Core ticker

## Goal
Eliminate the opacity fade ("grey out") effect that happens while the signal-family ticker rows roll over in the System tab's Customer Intelligence Core card.

## Current behavior
In `src/components/tepilot/insights/CapabilitiesView.tsx`, the `SignalSection` ticker animates the outgoing row from `opacity: 1` to `opacity: 0.25` and the incoming row from `opacity: 0.25` to `opacity: 1` during the vertical roll. This makes the text look dim/grey while transitioning.

## Proposed change
- Keep the vertical `translate3d` roll animation intact.
- Remove the two opacity keyframe animations on `currentRowRef` and `nextRowRef` so rows stay fully visible during the transition.
- Ensure rows render at full opacity by default (no residual 0.25 opacity state).

## Files to change
- `src/components/tepilot/insights/CapabilitiesView.tsx` — `SignalSection` ticker animation block.

## Acceptance criteria
- Ticker still rolls vertically every interval.
- Incoming and outgoing text remains fully opaque during the roll; no grey-out/dim effect.
