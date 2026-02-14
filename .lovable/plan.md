

# Add Prominent Click Effect to "Prepare" Button During Animation

## Problem
When the demo auto-cycles through different client events, there's no visual indication of *which* row's "Prepare" button was clicked. Viewers can't follow the action.

## Solution
Add three visual cues when a row is auto-selected:

### 1. Active Row Highlight
- Track which event index is currently being "prepared" via a new `activeRowIdx` state
- The active row gets a glowing border, brighter background, and a subtle pulse animation
- CSS class `.vwm-alert-row.active` with a colored left border accent matching the event color

### 2. Prepare Button Ripple/Pulse Effect
- When auto-clicked, the "Prepare" button on the active row gets a `.clicking` class
- This triggers a scale-bounce animation (scale up to 1.15, back to 1.0) plus a bright glow ring
- A brief color flash (white to primary blue and back) draws the eye

### 3. Auto-Scroll to Active Row
- When the animation selects a row that may be off-screen, scroll it into view using `scrollIntoView({ behavior: 'smooth', block: 'nearest' })`

## Technical Details

### File: `src/components/technology/demos/VentusWealthDemo.tsx`

**New state:**
- `activeRowIdx: number | null` -- index of the row currently being auto-prepared

**Animation loop changes:**
- Before opening the detail overlay, set `activeRowIdx` to the event index
- After a 600ms delay (to let the highlight + button animation play), then open the detail overlay
- On close, clear `activeRowIdx` back to null

**New CSS:**
- `.vwm-alert-row.active` -- brighter background (`rgba(255,255,255,.12)`), glowing border (`box-shadow: 0 0 20px rgba(59,130,246,.25)`), left border accent
- `.vwm-row-btn.prepare.clicking` -- keyframe `vwm-btnPulse` that scales 1 to 1.15 to 1, with a glow ring (`box-shadow: 0 0 16px rgba(255,255,255,.5)`)
- `@keyframes vwm-btnPulse` -- 0%: scale(1), 40%: scale(1.15) + bright glow, 100%: scale(1)

**Scroll behavior:**
- Use a ref-based approach: give each alert row a `data-event-idx` attribute, and when `activeRowIdx` changes, query the container for that row and call `scrollIntoView`

