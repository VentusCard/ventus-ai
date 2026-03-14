

# Stacked Card Design for Demo Beats

## Current State
The beats currently render as: collapsed summary cards stacked at the top + one active beat content area below. The collapsed cards are thin one-line summaries, and only the active beat is shown in full.

## Proposed Design
Replace the current layout with a **full stacked card** approach inspired by the reference image:

- Each beat renders as a **full-width card** (rounded, white, shadow)
- When a new beat activates, the **previous beat's card stays visible** but shifts upward and slightly behind — creating a physical card stack effect
- Cards stack from top to bottom: oldest card is furthest back (smallest scale, most faded), newest previous card is just behind the active one
- The **active card** is always at the front/bottom of the stack, fully visible

## Implementation Details

**File**: `src/components/demo/DemoPasswordGate.tsx`

### Layout Changes
1. **Remove the separate collapsed summary stack** (lines 164-191) — no more thin summary bars
2. **Remove the split layout** (separate stack area + flex-1 content area) — replace with a single centered container that holds all cards in a `relative` positioned stack

### Card Stack Mechanics
- Use `position: absolute` for all previous beat cards, `position: relative` for the active card
- Each previous card gets:
  - `translateY(-N)` to shift upward (e.g., 20px per card from active)
  - `scale(1 - 0.03 * distance)` to shrink slightly
  - Decreasing `opacity` (e.g., 0.7 → 0.5 → 0.3)
  - Lower `z-index`
  - Only show the **top portion** of each previous card (clip or fixed height with overflow hidden)
- The active card sits at z-index top, full size, full opacity

### Card Wrapper
- Wrap each beat's content in a uniform card container: `rounded-2xl bg-white border border-slate-200 shadow-lg p-8 sm:p-10`
- For beats that already have their own card (beats 3, 4, 5), remove the inner border/rounded styling to avoid double-card nesting

### Transition
- Cards animate in with the existing `fadeSlideIn` animation
- Previous cards transition smoothly to their stacked position using CSS transitions

### Beat Content
- All beat content remains exactly as-is — only the outer wrapper/positioning changes
- Beat 6 (password reveal) also gets the card wrapper treatment

