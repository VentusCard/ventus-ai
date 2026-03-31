

## Plan

Update Beat 4 ("Purchase Patterns") in `DemoPasswordGate.tsx` to add a 5th phase and adjust pill content/styling.

### File: `src/components/demo/DemoPasswordGate.tsx`

1. **Increase beat4Phase max from 3 to 4** (line ~41): change `beat4Phase < 3` to `beat4Phase < 4`

2. **Phase 2 pill text** (~line 593): Change from full text to just `"Expecting a Baby"` when `beat4Phase === 2`

3. **Phase 3**: Keep current behavior (header changes, MCCs hide, merchants turn blue). Pill still shows "Expecting a Baby".

4. **Phase 4 (new)**: 
   - Pill text changes to `"Semantically Similar Purchase Patterns = Behavioral Indicators"`
   - Pill style reverses: blue background (`#3B82F6`) with white text instead of light blue bg with blue text

### Logic summary for the pill:
- `beat4Phase < 2`: hidden
- `beat4Phase === 2 or 3`: "Expecting a Baby", light style (`#EFF6FF` bg, `#3B82F6` text)
- `beat4Phase === 4`: "Semantically Similar Purchase Patterns = Behavioral Indicators", reversed style (`#3B82F6` bg, white text)

