

## Remove Category Label Phase from Education Beat

### Problem
The education beat (Beat 5) currently has 3 phases:
- Phase 0: Show merchant names + amounts
- Phase 1: Reveal category labels ("Education Services", "Education - Other")
- Phase 2: Reveal life event insight

The user wants to remove Phase 1 (the category labels), going directly from merchants to the life event insight.

### Changes — `src/components/demo/DemoPasswordGate.tsx`

#### 1. Remove category label elements (lines 514–526)
Delete the `<span>` that renders `tx.category` with the yellow background. The transaction rows will only show merchant name and amount.

#### 2. Simplify beat5Phase from 3 phases to 2
- Change the click handler: `beat5Phase < 2` → `beat5Phase < 1` (line 51), so there's only one sub-phase (phase 0 → phase 1)
- Change the life event reveal condition: `beat5Phase >= 2` → `beat5Phase >= 1` (lines 537–538)
- The goBack handler for `beat5Phase > 0` stays the same but will now only step back one phase

### Files Modified
- `src/components/demo/DemoPasswordGate.tsx`

