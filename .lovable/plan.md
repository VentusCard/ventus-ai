# Fix the Ventus Core rolling animation

## Scope
Update only the Customer Intelligence Core signal rows on `/bankdemo` → Systems.

## Implementation
- Replace the current imperative class remove/re-add behavior in `SignalSection` with a deterministic keyed animation cycle so every evidence change reliably triggers motion.
- Render the outgoing and incoming detection as a clipped vertical track, producing a true upward roll rather than a single-item flash or static text replacement.
- Preserve the existing staggered timing across Behavioral, Life Event, Financial, Demographic, and Risk rows, plus the current reduced-motion behavior.
- Keep each row’s height fixed so rolling text does not shift the Ventus Core card layout.

## Verification
- Open the Systems tab at desktop size and observe multiple ticker cycles across all five rows.
- Confirm each row advances through its evidence examples, rolls vertically without clipping adjacent content, and remains clickable.
- Confirm reduced-motion mode changes the text without animation.