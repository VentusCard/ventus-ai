

## Plan: Require an extra click to reveal the "Enter Demo →" button

Currently, when the user clicks on step 6, `beat6Phase` advances from 0 to 1, simultaneously showing the "Ventus Innovates the Entire Stack" content **and** the "Enter Demo →" button.

**Change**: Add a `beat6Phase` value of 2, so:
- Phase 0 → "The Status Quo" (current)
- Phase 1 → "Ventus Innovates the Entire Stack" content appears, but **no button yet**
- Phase 2 → "Enter Demo →" button fades in

**File**: `src/components/demo/DemoPasswordGate.tsx`

1. Update the advance logic (line 54): change `beat6Phase < 1` to `beat6Phase < 2` so an extra click is needed
2. Update the goBack logic (line 83): adjust to handle the new phase count
3. Update the keyboard handler (line 108): change `beat6Phase >= 1` to `beat6Phase >= 2` for enter-demo behavior
4. Update the cursor/click guard (lines 172-174): change `beat6Phase >= 1` to `beat6Phase >= 2`
5. Change the button condition (line 956): from `beat6Phase >= 1` to `beat6Phase >= 2`

All existing visual transitions (phase 0→1 content changes) remain unchanged.

