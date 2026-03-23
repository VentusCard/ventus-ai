

## Remove Education Beat (Beat 5) from Demo Opener

Beat 5 (College Planning / 529 Opportunity, lines 471-526) will be removed entirely. The subsequent beats will shift down by one.

### Changes to `src/components/demo/DemoPasswordGate.tsx`

1. **Reduce `TOTAL_BEATS`** from `8` to `7`

2. **Remove `BEAT_SUMMARIES[5]`** — the "Semantic enrichment reveals life events" entry. Renumber remaining entries.

3. **Remove `beat5Phase` state** and all references to it in `advance`, `goBack`, reset logic, and dependency arrays.

4. **Delete Beat 5 JSX block** (lines 471-526) — the College Planning card.

5. **Renumber remaining beats**:
   - Old Beat 6 (Disconnected data) → new Beat 5 (card label stays "04")
   - Old Beat 7 (Reveal / Enter Demo) → new Beat 6
   - Update all `displayStep === 6` checks to `5`, and `displayStep === 7` to `6`
   - Update `beat6Phase` references to `beat5Phase` (reuse the freed state variable name)

6. **Update card numbering** inside the remaining beats:
   - Beat 3 card: "01" (unchanged)
   - Beat 4 card: "02" (unchanged)  
   - New Beat 5 (was 6): change label from "04" to "03"

**File**: `src/components/demo/DemoPasswordGate.tsx`

