# Bring back the full rewards screen, keep the rotation visible

## The problem

To make the cycling deal collections visible, the rewards phone was switched into a focused mode that hides the savings bar, city perks, "Top Pick For You" and "Expiring Soon". You want all of those back — but if they simply return, the rotating card falls to the bottom again and gets cut off.

## The fix

Restore every element on the rewards screen, and move the rotating "Curated for Ricky" collection card to the top of the screen while it is cycling (deck slides only). Order becomes:

1. Curated for Ricky — rotating collection card with its image, message, merchant pills, and position dots
2. Savings bar ("Welcome, Ricky! / $785 saved this year")
3. Welcome to New York perks
4. Top Pick For You
5. Expiring Soon
6. Search bar pinned at the bottom, as today

Everything stays scrollable inside the phone, so the rest of the content is still reachable, and the part that moves is always in view.

## Technical notes

- `ExecDemoPhoneView.tsx`: revert `focusMode` to `false` for the rewards view (undo the change tied to `autoRotateCollections`).
- `GeneratedOffersPhoneView.tsx`: when `autoRotate` is true, render the collection carousel block (card + dots) above the savings/perks/top-pick/expiring blocks instead of after them; unchanged order otherwise.
- No change to rotation timing, the 6.1 start, images, slide order, or `/demo` and `/bankdemo`.
- Verify at 1540x855 and 1920x1080 on slide 6.1: all original blocks present, the rotating card and dots fully visible at the top, five collections cycle, build clean.
