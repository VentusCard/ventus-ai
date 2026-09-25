# Beat 8.4: Shift carousel down and enlarge phone headers

## What changes

Small visual adjustment to the rotating three-phone carousel (the long-term retention slide):

1. **Move everything down a bit.** The carousel currently hugs the top of the slide, right under the heading. Add vertical breathing room between the heading row and the phones so the whole carousel sits noticeably lower on the slide (larger top margin on the carousel container, phones vertically centered in the remaining space instead of pinned to the top).

2. **Bigger, bolder headers.** The small uppercase label above each phone ("AI ASSISTANT", "CREDIT SCORE UPDATE", etc.) is currently tiny (12px). Increase its size and weight — roughly doubling it to a bold statement-sized label (~18–20px, heavier weight, slightly stronger color) — applied to all three visible phones, including the Hawaii phone and every rotating item.

## What stays the same

- Three phones visible, 11:20 proportions, current size.
- Automatic rotation, pause-on-interaction, right-to-left transition, independent chat history.
- Section heading and subtitle copy.
- All other beats and /demo are untouched.

## Validation

- Playwright check at 1540×855 and 1920×1080: carousel sits lower, labels clearly larger, no clipping or overflow, rotation and navigation still work.
- Clean build.
