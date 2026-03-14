

# Glassmorphism Redesign for /demo Page

## Concept
Transform the entire demo keynote into a frosted-glass, high-tech aesthetic inspired by the reference image. Cards use semi-transparent backgrounds with backdrop blur, and the collapsed previous-beat cards stack vertically directly on top of the active card (like the Monday/Tuesday/Wednesday stack in the reference).

## Changes

**File**: `src/components/demo/DemoPasswordGate.tsx`

### 1. Page Background
Add subtle colored orbs behind the content to make the glass effect visible against the gradient. Two or three absolutely-positioned blurred circles (blue, purple, cyan) with low opacity.

### 2. Collapsed Beat Stack (lines 166-191)
Transform into the reference's stacked card style:
- Each card: `backdrop-filter: blur(16px)`, bg `rgba(200,215,240,0.45)`, border `rgba(255,255,255,0.5)`, `box-shadow: 0 2px 12px rgba(0,0,0,0.06)`
- Cards overlap with negative margin (e.g. `marginTop: -6px`) so they peek behind the one below
- Cards further back progressively blur more, scale down slightly, reduce opacity — creating the exact stacked-day-planner effect from the reference
- The frontmost collapsed card sits directly on top of the active card

### 3. Active Beat Cards (Beats 3, 4, 5 — the bordered `rounded-xl` containers)
Replace flat white backgrounds with glassmorphism:
- `backdrop-filter: blur(20px)`, bg `rgba(200,215,240,0.35)`, border `rgba(255,255,255,0.5)`
- Soft layered shadow: `0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.4)`
- Two ghost cards stacked behind (vertical offset only):
  - Ghost 1: `translateY(-10px) scale(0.98)`, opacity 0.5, same glass style
  - Ghost 2: `translateY(-20px) scale(0.96)`, opacity 0.3, same glass style
  - No horizontal offset per user requirement

### 4. Inner Elements
- Transaction rows (Beat 4): Light glass — bg `rgba(255,255,255,0.5)`, `backdrop-filter: blur(8px)`, border `rgba(255,255,255,0.6)`
- Output items (Beat 5 right side): Same light glass treatment
- MCC badge (Beat 3): Keep amber styling but add subtle glass border
- Input boxes (Beat 5 left — Demographics/Transactions): Glass styling with the same frosted bg

### 5. Beat 6 (Reveal)
- Password input and button: Subtle glass container behind them
- Keep the clean centered layout

### 6. CSS Additions
Add to the inline `<style>` block:
- A `.glass-card-demo` utility class for consistent glass styling across all cards
- Background orb keyframes if animated

## File Changes

| File | Action |
|---|---|
| `src/components/demo/DemoPasswordGate.tsx` | **Edit** — Apply glassmorphism + vertical ghost stacks to all card elements, add background orbs |

