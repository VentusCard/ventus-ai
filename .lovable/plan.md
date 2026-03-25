

## Plan: Stagger the 3 personalized cards to appear one click at a time

Currently, all 3 cards (Personalized Rewards, Personalized Relationship, Personalized UX) appear together when `beat5Phase >= 1`. The change will make each card reveal on a separate click (3 sub-phases instead of 1).

### Changes in `src/components/demo/DemoPasswordGate.tsx`

**1. Update the beat5 click handler** (around line 46-51)
- Change the threshold from `beat5Phase < 1` to `beat5Phase < 3` so it takes 3 clicks to advance through all cards before moving to the next step.

**2. Update the goBack handler** (around line 79-81)
- Already handles `beat5Phase > 0` with decrement — no change needed.

**3. Update the 3 cards' visibility** (lines 658-749)
- Remove the shared wrapper's opacity/transform animation (or keep it always visible once beat5Phase >= 1).
- Card 1 (Personalized Rewards): visible when `beat5Phase >= 1`, with fade/slide transition.
- Card 2 (Personalized Relationship): visible when `beat5Phase >= 2`.
- Card 3 (Personalized UX): visible when `beat5Phase >= 3`.

Each card gets its own inline `opacity` and `transform` style based on the phase, with `transition-all duration-700` for smooth animation.

