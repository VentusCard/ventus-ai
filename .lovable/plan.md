

## Fix Beat Numbers on Keynote Cards

### Problem
The beat/card numbers are inconsistent in two ways:

1. **Active card labels vs stacked card labels mismatch**: Active cards use hardcoded labels ("01", "02", "02", "03") while stacked cards behind use `String(i).padStart(2, "0")` which produces "03", "04", "05", "06" for steps 3–6.

2. **Duplicate number**: Beat 5 (Education/College) shows "02" — same as Beat 4 (Skiing). It should be "03".

### Current state
| Step | Active card label | Stacked card label | Should be |
|------|------------------|--------------------|-----------|
| 3    | 01               | 03                 | 01        |
| 4    | 02               | 04                 | 02        |
| 5    | 02 ❌            | 05                 | 03        |
| 6    | 03               | 06                 | 04        |

### Fix — `src/components/demo/DemoPasswordGate.tsx`

#### 1. Fix active card labels
- Line 487: Change `"02"` → `"03"` (Beat 5 / Education)
- Line 543: Change `"03"` → `"04"` (Beat 6 / Disconnected data)

#### 2. Fix stacked card labels
- Line 279: Change `{String(i).padStart(2, "0")}` → `{String(i - 2).padStart(2, "0")}` so step 3→"01", step 4→"02", step 5→"03", step 6→"04" — matching the active card labels.

#### 3. Fix `BEAT_SUMMARIES` indexing
The stacked cards access `BEAT_SUMMARIES[i]` where `i` is the step index (3–6), but the array only has 7 entries (indices 0–6). Verify each summary maps to the correct card content.

### Files Modified
- `src/components/demo/DemoPasswordGate.tsx`

