

## Animate Persona as Row-Based Pill Accumulator with Live Counts

### Concept
Each **pillar/category** is a row. As transactions scroll, pills are added one at a time into the matching row, with counts incrementing on duplicates.

```text
TRAVEL & TRANSPORT     [Airlines 1x] [Hotels 1x]
                        ↓ new tx arrives
TRAVEL & TRANSPORT     [Airlines 1x] [Hotels 2x]  ← count pulses
FOOD & DINING          [Cafes 1x]                  ← new row appears
```

### Data changes — `execDemoData.ts`
- Add `signalMap` to each persona: an array mapping each transaction index to `{ pillar: string, label: string }` — e.g. `{ pillar: "Travel & Transport", label: "Airlines" }`
- This drives which row + pill to add/increment as each transaction is processed
- Keep existing `pills` array for backward compat, but persona display uses `signalMap`

### Intel panel changes — `ExecDemoIntelPanel.tsx`
- Replace the current pill-wrap display with a **row-based accumulator**:
  - Receive `processedSignals: { pillar: string; label: string }[]` prop
  - Derive: group by pillar → for each pillar, dedupe labels with counts
  - Each **pillar** is a row: uppercase muted label on the left
  - Each **pill** within the row: `[label Nx]` chip, appears with scale animation, count badge pulses on increment
  - New rows animate in (slide + fade) when a pillar is first seen
- During `idle`: empty
- During `scroll`: rows/pills build progressively
- During `cardCycle`/`hold`: all signals visible with final counts

### Page state changes — `ExecDemoPage.tsx`
- Replace `visiblePills: number` with `processedSignals: { pillar: string; label: string }[]`
- During scroll phase, each transaction tick (spaced ~400ms) appends the corresponding `signalMap` entry to the array
- Pass `processedSignals` to `ExecDemoIntelPanel` instead of `visiblePills`

### Files
1. **`src/components/exec-demo/execDemoData.ts`** — Add `signalMap` to `ExecPersona`, populate for all 6 profiles
2. **`src/components/exec-demo/ExecDemoIntelPanel.tsx`** — Row-based pill accumulator with per-pillar rows and animated count chips
3. **`src/pages/ExecDemoPage.tsx`** — Swap `visiblePills` for `processedSignals` array, schedule appends during scroll

