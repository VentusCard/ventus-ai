

## Add Beat 2.1 — Life Event Signal (College Planning / 529 Opportunity)

### Narrative Script

Beat 4 showed MCCs can't see skiing across 3 codes. This new beat flips it: **if we enrich semantically, the category code doesn't matter anymore** — what matters is the pattern. Three merchants, revealed first, then their categories shown second (proving categories are irrelevant), then the life event insight.

### Transactions (Merchant + Amount → Category → Insight)

| # | Merchant | Amount | Category (revealed second) |
|---|----------|--------|---------------------------|
| 1 | Princeton Review — SAT Prep | $2,200 | Education Services |
| 2 | Common App Inc. | $350 | Education - Other |
| 3 | Magoosh — SAT Prep Guide | $65 | Education Services |

### 3-Phase Reveal (inverted from Beat 4)

- **Phase 0**: Merchant names + amounts animate in (staggered). No category shown.
- **Phase 1** (advance): Category chips fade in beside each row — showing they're all different codes but it doesn't matter.
- **Phase 2** (advance): Green insight pill appears: **"Life Event Detected: College Planning — 529 plan opportunity identified"**

### Technical Changes — `src/components/demo/DemoPasswordGate.tsx`

1. **`TOTAL_BEATS`**: 7 → 8
2. **`BEAT_SUMMARIES`**: Insert at index 5: `"Semantic enrichment reveals life events — category codes become irrelevant."`
3. **New state**: `beat5Phase` becomes the college beat (0/1/2). Rename current `beat5Phase` → `beat6Phase`.
4. **New beat at `displayStep === 5`**:
   - Section header: `"02"` (companion to skiing beat)
   - Title: "Semantic enrichment reveals life events."
   - Subtitle: "Three purchases across different category codes. The pattern is invisible to MCCs — but not to semantic intelligence."
   - 3 transaction rows: merchant name + amount visible immediately; category chip hidden until phase 1
   - Phase 2: insight pill with 🎓 icon
5. **Shift current beat 5 → `displayStep === 6`** (disconnected data) using `beat6Phase`
6. **Shift current beat 6 → `displayStep === 7`** (reveal + password)
7. **Update `advance()` / `goBack()`**: Add 3-phase sub-stepping for new beat 5, update references for shifted beats
8. **Update reveal timer**: `step === 6` → `step === 7`

### Files modified
- `src/components/demo/DemoPasswordGate.tsx`

