

## Per-Card Scroll + Accumulate Animation

### Current Behavior
During the card cycle, transactions are just collected one-by-one without any scrolling animation. The initial scroll phase only happens once at the beginning.

### New Behavior
For each intelligence card (Analytics, Smart Rewards, Relationship Intelligence):
1. **Scroll sub-phase**: The full transaction list scrolls (like the initial rapid-scroll animation), simulating "scanning" through the data
2. **Collect sub-phase**: After scrolling completes, matched transactions are identified one-by-one and float to the top of the list (the existing accumulate behavior)
3. **Reveal**: Card slides in on the right with its content
4. Reset and repeat for the next card

### Technical Changes (EnrichmentMockup.tsx only)

**1. Add a new `cardPhase` value: `"scanning"`**
- Card phases become: `"scanning" | "scroll" | "reveal"` (where "scanning" = scrolling animation, "scroll" = collecting/accumulating)

**2. Update `runCycle` timing per card**
- Each card now has 3 sub-phases:
  - `scanning` (800ms): Show the rapid-scroll animation through all transactions
  - `scroll`/collect (existing staggered collection logic): Transactions identified one-by-one, float to top
  - `reveal` (existing): Card content slides in on right panel

**3. Left panel rendering during `scanning` sub-phase**
- Show the full transaction list with the `orch-rapid-scroll` (or a shorter variant `orch-card-scroll`) animation
- All transactions shown at normal opacity (not dimmed) during the scan
- This creates the "scanning through data" visual before collection begins

**4. Left panel rendering during `scroll`/collect sub-phase**
- Same as current: collected transactions float to top highlighted, uncollected dimmed below

**5. Add a shorter scroll keyframe for per-card scanning**
- `orch-card-scroll`: ~800ms scroll animation (faster than the initial 2.8s scroll) to keep the pacing tight

**6. Timing adjustments**
- Add `cardScan: 800` to TIMINGS
- Each card's total duration = `cardScan + (txIndices.length * collectInterval) + collectBuffer + cardReveal`
