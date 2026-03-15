

## Plan: Add Introductory Beat as First Beat

**Goal**: Insert a new Beat 0 that introduces Ventus AI before the existing narrative begins. All current beats shift by one index.

### Changes in `src/components/demo/DemoPasswordGate.tsx`

1. **Increment `TOTAL_BEATS`** from 6 to 7

2. **Add a new intro beat summary** at index 0 in `BEAT_SUMMARIES` (e.g., "Ventus AI — Intelligence infrastructure for modern banking.")

3. **Shift all beat logic by +1**:
   - Beat 4 phase logic → beat index 4 becomes 5
   - Beat 5 phase logic → beat index 5 becomes 6
   - Final beat (password input, logo reveal) triggers at step 6 instead of 5
   - Cardless beats: indices 0, 1, 2 (new intro + original beats 1 & 2) — update the `if (i < 2)` check to `if (i < 3)` in the stacked card renderer
   - `displayStep >= 2` card styling checks become `displayStep >= 3`

4. **New Beat 0 content** (cardless, centered): Ventus AI logo prominently displayed, company tagline, and a brief one-liner positioning statement. Clean, confident intro — sets the stage before the "problem" narrative begins.

