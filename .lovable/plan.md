

# Smoother Transition Animations for Demo Page

## Problem
The current `fadeSlideIn` animation is 0.5s with a basic `ease` curve, and beat transitions feel abrupt because the active card re-mounts (conditional rendering via `step === N`), causing a hard cut rather than a smooth crossfade.

## Changes

**File**: `src/components/demo/DemoPasswordGate.tsx`

### 1. Upgrade the inline keyframes (lines 118-131)
- Replace `fadeSlideIn` with a slower, smoother animation using `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo), extending duration from 0.5s to 0.7s
- Add a `fadeOut` keyframe for exiting beats
- Add a `cardStackSlide` keyframe for smoother stacked-card repositioning

### 2. Add exit animation state
- Track `isTransitioning` state and previous step to briefly show exiting content with a fade-out before the new beat fades in
- Use a short 150ms exit delay before advancing, giving a crossfade feel

### 3. Smooth the stacked card transitions (lines 176-198)
- Increase `transition-all duration-500` to `duration-700` with a custom easing
- Add slight opacity fade on the stack reorder

### 4. Smooth the background ambient shift
- The `ambientShift` animation is already smooth; no changes needed

### 5. Beat content wrapper (line 202-208)
- Add a CSS `transition` on the active card's wrapper for `opacity` and `transform`
- Use a key based on `step` to trigger re-animation, but with the improved timing curve

## Summary of timing changes
| Element | Current | New |
|---------|---------|-----|
| Beat entrance | 0.5s ease | 0.7s cubic-bezier(0.16,1,0.3,1) |
| Stacked cards | 0.5s ease-out | 0.7s cubic-bezier(0.16,1,0.3,1) |
| Exit crossfade | none | 0.15s ease-out opacity fade |
| Sub-element staggers | unchanged | unchanged |

