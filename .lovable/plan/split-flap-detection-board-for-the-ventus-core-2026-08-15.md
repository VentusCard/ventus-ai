# Split-flap detection board for the Ventus Core

Replace the vertical roll on the five Customer Intelligence Core signal rows (`/bankdemo` → Systems) with a departure-board card flip, and raise the pacing so the card always has motion.

## The animation

Each signal's detection line becomes a flip card with two halves:

```text
  ┌───────────────────────────┐
  │  top half: outgoing text  │  ← rotates down on X axis
  ├───────────────────────────┤
  │  bottom half: incoming    │  ← rotates up into place
  └───────────────────────────┘
```

- The top half of the current detection folds down over a hinge line while the bottom half of the next detection folds up behind it — the classic split-flap motion.
- 3D perspective on the row, `rotateX` on each half, with a darkening shade on the folding face so the flap reads as a physical panel catching light.
- A thin hinge line across the middle in the signal's accent color.
- Duration ~420ms per flip with a sharp ease-out, so it snaps like a mechanical board rather than easing like a slide.
- Driven with the Web Animations API on refs (same reliable mechanism now in place), advancing the index on finish. No React style-transition timing dependency, no remounts.

## Pacing: alive

- Rows flip on short, uneven intervals (~1.6s–2.4s, each row different and prime-ish so they drift out of phase).
- Small per-row start offsets so flips overlap rather than fire in lockstep — at any moment at least one row is mid-flip.
- Occasional double-flip: a row advances two detections back-to-back, like a board catching up.

## Preserved

- Row click still drives the detail panel below; counts, basis chips (1P / Ext / Both), colors, and copy are unchanged.
- Fixed row height so nothing in the Core card shifts.
- `prefers-reduced-motion`: text swaps instantly with no flip, on the calmer end of the interval range.

## Technical

- `src/components/tepilot/insights/CapabilitiesView.tsx` — rewrite `SignalSection`'s ticker into a `FlipDetection` sub-component (perspective wrapper, two clipped halves, WAAPI flip sequence). Remove the current translate-track markup and its `will-change` track div.
- Flip shading and hinge via inline styles / Tailwind utilities on the existing dark Core palette — no new global keyframes.

## Verification

Drive `/bankdemo` → Systems in the live preview, sample the halves' `rotateX` every frame across several cycles, and confirm a continuous ramp through intermediate angles on multiple rows at overlapping times, with no console errors.
