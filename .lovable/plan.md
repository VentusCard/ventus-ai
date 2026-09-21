# Slide 3: animate the downward arrowhead with the line

## Problem

On "The Complete Picture" beat 2, the downward connector line grows (scale-y animation), but the arrowhead at its end only fades in while staying in place. Verified in the live preview: the arrow's opacity animates 0 → 1 between ~300ms and ~800ms, but its position never changes — so at presentation distance it reads as "the arrow has no animation" and feels disconnected from the extending line.

## Fix (DeckmoDeck.tsx only — LivingView, beat-2 connector arrowhead)

Give the ChevronDown the same motion language as the line it caps:

- Transition `opacity` **and** `transform` together, timed with the line growth (delay-150, duration-500 — the line's exact timing) instead of the current opacity-only delay-300.
- Start state: `opacity-0 -translate-y-2 scale-75` (small, pulled up toward the line's origin).
- End state (synthesized): `opacity-100 translate-y-0 scale-100`.
- Result: as the line extends downward, the arrowhead emerges at its tip, travels down with it, and settles onto the five-families card — one continuous cause-and-effect motion.
- Motion-reduced fallback: arrow fully visible immediately (opacity-100, no transform, no transition), matching the existing reduced-motion behavior.

Keep the `-mt-0.5` overlap, size (h-3.5 w-3.5), and deck-blue color unchanged. No copy, color, beat, navigation, or other-slide changes.

## Verification

- Playwright at 1540×855, 1024×768, 1920×1080: on beat 2 the arrowhead visibly moves down with the line and lands on the card; no clipping or overlap at any size.
- Reduced-motion: arrow static and fully visible.
- Clean typecheck and build.
