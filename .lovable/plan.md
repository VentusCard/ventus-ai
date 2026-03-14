

# Fix: Beat 5 Card Refresh on Phase Change

## Problem
The active card's `key` on line 231 includes `beat5Phase`, causing React to re-mount the entire card when Beat 5 transitions from "Patterns can't be extended" to "Until they're connected." This triggers the fade-slide animation again instead of smoothly transitioning content in place.

## Fix

**File**: `src/components/demo/DemoPasswordGate.tsx`

### 1. Remove `beat5Phase` from the card key (line 231)
Change `key={`beat-${displayStep}-${beat5Phase}`}` to `key={`beat-${displayStep}`}`.

This was already done for `beat4Phase` — same fix applies here.

### 2. Use CSS transitions instead of conditional rendering for Beat 5 phase changes
The Beat 5 content already uses `transition-all duration-500` for colors/borders on the boxes (good). But the "Intent Data" overlay on line 440 uses conditional rendering (`{beat5Phase >= 1 && ...}`) with `animate-fade-slide`. Change this to always-rendered with opacity/transform transitions, matching the Beat 4 pattern:

- **Intent Data border overlay** (line 440-454): Always render, control with `opacity` and `transform` style transitions.
- **Title/description** (lines 417-423): These swap text via ternary — already fine since the element stays mounted.
- **Output labels** (lines 490-510): These swap via ternary array — the items re-render but the container stays stable. Use CSS transitions on label text changes.

