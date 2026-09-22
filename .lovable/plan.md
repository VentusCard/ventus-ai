# Move the rotating deal card back to the bottom of the Rewards screen

## What you'll see
On the Rewards phone slides (6.1 onward), the rotating "Curated for Ricky" collection card goes back to the bottom of the screen — after Savings, Welcome to New York perks, Top Pick For You, and Expiring Soon — exactly where it was before. The cycling continues, now at a slower pace of one collection every 4 seconds.

## Changes
1. **Card position** — `src/components/exec-demo/GeneratedOffersPhoneView.tsx`
   - Remove the `autoRotate && carouselBlock` render at the top of the scroll area (line 568).
   - Change line 685 from `{!autoRotate && carouselBlock}` to just `{carouselBlock}` so the card always renders at the bottom, cycling or not.
2. **Slower rotation** — same file, line 340
   - Change the cycling interval from 2 seconds to 4 seconds: `autoRotate ? 4000 : 5000`.

Nothing else changes: all five collections still cycle (tennis, dog, December vacation, new home, brokerage), each with its own image, the dots and slide-in animation stay, and every other element on the rewards screen stays in its original place. The /demo phone is untouched.

## Verify
- Preview at 1540×855: rewards screen shows savings bar → perks → top pick → expiring soon → rotating card at the bottom; card changes collection every 4 seconds.
- Build log clean.
