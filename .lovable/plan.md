# Weave more outside signals into the slide 2.2 ticker

## What changes

The right-hand "OUTSIDE THE WALLS" panel on slide 2.2 rolls a list of outside elements — 7 rows today, all life events. The new elements are woven through that list one at a time, so as it rolls a relationship held elsewhere sits next to a life event rather than arriving as a separate group.

Proposed rolling order (existing wording untouched, "And everything in between" still closes):

1. Bought a house
2. Credit card at another bank
3. Changed to a new job
4. Savings at another bank
5. Got married
6. Investments at another brokerage
7. Started a business
8. Mortgage with another lender
9. Took a trip overseas
10. Streaming and subscription spend
11. Children going to college
12. Auto loan at another bank
13. Second checking account elsewhere
14. Private school tuition
15. Insurance premiums paid elsewhere
16. Buy-now-pay-later balances
17. Donations to another charity
18. Childcare paid elsewhere
19. And everything in between

Tell me which rows to drop, rename, or swap positions and I'll adjust before building.

## How

- `src/lib/deckmoScript.ts` — rewrite `DECKMO.visibility.outside.rows` in the interleaved order above. This list drives the 2.2 ticker only; the living-view outside chips are untouched.
- `src/components/deckmo/DeckmoDeck.tsx` — extend `OUTSIDE_ICONS` so each new row gets its own icon (CreditCard, PiggyBank, TrendingUp, Landmark, Car, Wallet, ShieldCheck, MonitorPlay, CalendarClock, HeartHandshake, School, Baby), keeping the current `ExternalLink` fallback for anything unmapped.

No layout, animation, or speed changes: the ticker loops the same rows at the shared roller speed, so a longer list simply means a longer loop. Each row keeps the "not visible" label.

## Verification

- Playwright at 1375×1011: confirm every new row appears in the rolling list with its icon and in the intended interleaved order, row height and spacing unchanged, no horizontal overflow, no runtime errors.
- Check the build log is clean.
- Add and close out a roadmap item for this change.
