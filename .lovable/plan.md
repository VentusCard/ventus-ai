# System Tab: Guided Tour Overlay for the Ventus AI Workflow

## Goal
Replace the current button-bar walkthrough (3 pills + prev/next/reset) with a **guided tour overlay** in the style of the reference screenshot: dimmed backdrop, spotlight on the active column, and a floating tooltip card with narration, progress dots, Back / Next, and Skip.

## Why this format is better for the demo
- The presenter never hunts for the right button — one "Next" advances the story.
- Dimming + spotlight focuses the audience on exactly one column (Sources → Core → Activation).
- Each step gets a short narrative sentence, which the current pills can't carry.
- Skip lets a presenter bail out instantly; finishing the tour lands on the full live board (all columns colored).

## What changes (CapabilitiesView.tsx only)

**1. Keep existing walk state**
- Reuse `walkStep` (0|1|2) and the existing grayscale/pulse behavior of columns and connectors — that machinery stays exactly as-is.

**2. Replace the walkthrough control bar**
- The pill bar becomes a single **"Start guided tour"** button (plus keyboard arrows still work).
- Clicking it enters tour mode: `tourActive = true`, `walkStep = 0`.

**3. Tour overlay layer**
- Full-board dimmed backdrop (`bg-slate-900/55 backdrop-blur-[2px]`) with a **spotlight cutout** around the active column (implemented via a large `box-shadow: 0 0 0 9999px` on a positioned highlight ring, or four inset panels — whichever is simplest with the column's bounding box).
- Active column lifted above the dim with `relative z-10`, ring highlight (`ring-2 ring-blue-500`) and soft glow.

**4. Tooltip card (styled like the reference, Ventus light theme)**
- Floating card anchored to the **right of the active column** (for Activation, anchors to the left so it never overflows).
- Contents per step:
  - Step counter "1 of 3" (small, slate-500)
  - Title, e.g. "Every signal starts from evidence" / "The core reads the whole customer" / "Intelligence lands where bankers work"
  - 2–3 sentence narration in the same voice as the reference (what this column does, why it matters to the bank)
  - Progress dots (gold/active, slate/inactive)
  - Footer: **Skip tour** (text button) · **Back** (ghost) · **Next** (solid dark navy `bg-[#141432]`) — matches the left-nav accent color.
- Final Next becomes **"Done"**, closing the tour and setting `walkStep = 2` (full board live).

**5. Sizing rules**
- Card max-width ~340px, light-theme only (white bg, slate-200 border, no `dark:` classes).
- `Escape` closes the tour; clicking the dimmed backdrop does nothing (avoid accidental exits mid-presentation).

## Files
- `src/components/tepilot/insights/CapabilitiesView.tsx` — tour state, overlay, tooltip card, spotlight positioning (measured via refs + `getBoundingClientRect`, recalculated on resize).
- No new dependencies; no other tabs touched.
