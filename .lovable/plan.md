

# Beat 4: Progressive Reveal — MCCs Can't Identify Patterns

## Current Behavior
Beat 4 (step 3) shows all 3 transactions with merchant names, MCC codes, and the "Pattern: Skiing" badge in one view.

## Requested Behavior
Split Beat 4 into 3 sub-steps within the same beat, each revealed on click:

1. **Click 1** — Show 3 transaction rows with only MCC category names and amounts (no merchant names):
   - `MCC 7941 · Sports and Entertainment` — $979.00
   - `MCC 5941 · Sporting Goods` — $649.00  
   - `MCC 5699 · Apparel` — $389.00

2. **Click 2** — Reveal the merchant names alongside the MCC codes:
   - Vail Resorts — EPIC Pass
   - Burton Snowboards
   - The North Face

3. **Click 3** — Reveal the "Pattern: Skiing" badge below, then advance to next beat on next click

## Implementation

**File**: `src/components/demo/DemoPasswordGate.tsx`

### 1. Add sub-step state
- Add `const [beat4Phase, setBeat4Phase] = useState(0)` — tracks which phase of Beat 4 we're in (0, 1, 2)
- Reset `beat4Phase` to 0 when navigating away (in `goBack` and when step changes away from 3)

### 2. Modify advance logic
- When `step === 3` and `beat4Phase < 2`, increment `beat4Phase` instead of advancing to step 4
- When `step === 3` and `beat4Phase === 2`, advance to step 4 normally

### 3. Modify goBack logic  
- When `step === 3` and `beat4Phase > 0`, decrement `beat4Phase` instead of going to step 2

### 4. Rewrite Beat 4 visual (step === 3)
- **Phase 0**: Show 3 rows with only MCC category badge + amount (merchant name hidden)
- **Phase 1**: Animate in merchant names to the left of MCC badges
- **Phase 2**: Animate in the "Pattern: Skiing" convergence badge below

### 5. Update text
- Update paragraph to match the progressive reveal narrative — initially just describe "three transactions across three different MCC codes" without giving away the pattern

### 6. Update BEAT_SUMMARIES[3]
- Adjust to: "MCCs can't see patterns — three ski purchases, three generic codes."

### 7. Update dot navigation
- Keep total dots at 6 (sub-steps are internal to beat 4, not separate dots)

