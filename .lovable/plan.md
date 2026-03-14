

# Make Beats 1 & 2 Cardless

## What
Beats 1 and 2 (the two full-screen text statements) should render without the white card wrapper — just centered text on the dark background, as they were before the stacked card redesign. Beats 3–6 keep the card treatment and stacking behavior.

## Changes

**File**: `src/components/demo/DemoPasswordGate.tsx`

### 1. Active beat card wrapper (lines ~200-209)
- Make the `rounded-2xl border bg-white shadow-lg` wrapper **conditional** — only apply it when `step >= 2`
- For steps 0 and 1, render the content directly without the card container (no border, no bg-white, no shadow, no padding from the card wrapper)

### 2. Stacked previous cards (lines ~168-198)
- Only render stacked background cards for beats index `>= 2` (skip beats 0 and 1 from the stack)
- Adjust the `distance` calculation to only count card-based beats

### 3. Margin adjustment (line ~207)
- Only apply the `marginTop` offset when `step >= 2` since there are no stacked cards behind beats 0–1

