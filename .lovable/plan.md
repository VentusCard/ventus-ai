

# Update Beat 3 Language: 3 Customers × 3 Entertainment Types

## Current Implementation

Beat 3 (labeled "01") currently shows:
- **Text**: "MCC 7922 — 'Entertainment.' That's a season pass to the symphony and a ticket to Monster Jam. Two completely different customers — invisible to the bank."
- **Visual**: 2 icons (Symphony + Monster Jam) with "MCC 7922" in the center

## Requested Change

Show **3 people buying 3 different tickets**, all under the same entertainment MCC:
1. Symphony Orchestra
2. Celtics tickets (sports event)
3. Monster Jam

## Implementation

**File**: `src/components/demo/DemoPasswordGate.tsx`

### Changes to Beat 3 (step === 2, lines 198-241)

1. **Update paragraph text** (lines 206-209):
   - New: "MCC 7922 — 'Entertainment.' Three customers. Three purchases: Symphony Orchestra, Celtics tickets, Monster Jam. Three completely different people — invisible to the bank."

2. **Update visual layout** (lines 210-238):
   - Change from 2 items to 3 items (Icon → MCC → Icon → MCC → Icon layout won't work)
   - Better layout: 3 customer icons in a row at top, all pointing down to a single centered "MCC 7922" badge below

3. **Add Celtics icon** (middle position):
   - Basketball SVG (simple circle with lines representing a basketball)
   - Label: "Celtics Tickets"

4. **Update existing icons**:
   - Keep Symphony icon (left position)
   - Keep Monster Jam icon (right position)
   - Update labels to be more specific: "Symphony Orchestra" and "Monster Jam"

5. **Update summary card** (BEAT_SUMMARIES array, line 13):
   - Current: "MCCs are blind — same code for symphony and monster trucks."
   - New: "MCCs are blind — same code for symphony, Celtics, and Monster Jam."

### Visual Structure
```text
[Symphony Icon]    [Basketball Icon]    [Monster Jam Icon]
     ↓                    ↓                      ↓
           ╲              ↓                    ╱
              ╲           ↓                 ╱
                  [MCC 7922 Badge]
                  "Same code for all"
```

