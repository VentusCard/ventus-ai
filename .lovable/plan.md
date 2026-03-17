

## Plan: Add click-to-reveal for MCC label in Beat 3

**File: `src/components/demo/DemoPasswordGate.tsx`**

**Current behavior:** Beat 3 ("MCCs are blind") shows the three icons, orange dashed lines, and "MCC 7922 · Sports and Entertainment" box all at once with staggered CSS animations.

**New behavior:** The three icons appear on entry. The orange SVG lines and MCC 7922 box only appear after the user clicks / presses right arrow, using the same phase pattern already used by beat4 and beat5.

### Changes:

1. **Add `beat3Phase` state** (initial 0), alongside existing `beat4Phase` / `beat5Phase`.

2. **Update `advance` callback** — when `step === 3` and `beat3Phase < 1`, increment `beat3Phase` and return `s` (stay on step 3). When phase is 1, reset and advance to step 4.

3. **In Beat 3 JSX (lines ~369-379)** — wrap the orange SVG lines and MCC 7922 box in a conditional `opacity`/`transform` transition gated on `beat3Phase >= 1`, replacing the current `animate-fade-slide` auto-animations.

