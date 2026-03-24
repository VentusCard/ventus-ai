

## Plan: Remove Beat 7 and Add "Enter Demo" Button to Beat 6

### What changes
1. **Reduce `TOTAL_BEATS` from 8 to 7** (line 7)
2. **Remove Beat 7 block** (lines 738-769) — the "One AI-Native layer..." reveal section
3. **Remove Beat 7 useEffect** (lines 104-110) that controls `revealLogo`/`revealInput` timers
4. **Update keyboard handler** — remove the `step === 7` special case (lines 119-126); instead, when on step 6 and `beat6Phase >= 1`, pressing right/space/enter enters the demo
5. **Update click handler** — change `step < 7` to `step < 6` (line 180-182)
6. **Add "Enter Demo" button to Beat 6** — after the flow diagram in the `beat6Phase >= 1` state, add the blue "Enter Demo →" button that grants access
7. **Update `advance()` for step 6** — when `beat6Phase` reaches 1, stop advancing to next step (it's the last beat now); the "Enter Demo" button handles navigation forward

### Files modified
- `src/components/demo/DemoPasswordGate.tsx`

