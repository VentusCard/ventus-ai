# Expand the outside signals on slide 2.2

## What changes

The right-hand "OUTSIDE THE WALLS" panel on slide 2.2 rolls a list of outside elements — 7 rows today, all life events. The list grows to cover the other things a customer has away from the institution: other accounts, other credit, and spending habits the bank never sees.

Proposed rolling list (order shown; existing wording untouched):

Life events, as today:
- Bought a house
- Changed to a new job
- Got married
- Started a business
- Took a trip overseas
- Children going to college

Relationships held elsewhere:
- Credit card at another bank
- Savings at another bank
- Investments at another brokerage
- Mortgage with another lender
- Auto loan at another bank
- Second checking account elsewhere
- Insurance premiums paid elsewhere

Habits outside the ledger:
- Streaming and subscription spend
- Buy-now-pay-later balances
- Donations to another charity
- Private school tuition
- Childcare paid elsewhere

Closing line, as today:
- And everything in between

Tell me which of the new rows to drop, rename, or move and I'll adjust before building.

## How

- `src/lib/deckmoScript.ts` — extend `DECKMO.visibility.outside.rows` with the new strings (Title Case, matching existing rows). This list drives the 2.2 ticker only; the living-view outside chips are untouched.
- `src/components/deckmo/DeckmoDeck.tsx` — extend `OUTSIDE_ICONS` so each new row gets its own icon (CreditCard, PiggyBank, TrendingUp, Landmark, Car, Wallet, ShieldCheck, MonitorPlay, CalendarClock, HeartHandshake, School, Baby), keeping the current `ExternalLink` fallback for anything unmapped.

No layout, animation, or speed changes: the ticker loops the same rows at the shared roller speed, so a longer list simply means a longer loop. Each row keeps the "not visible" label.

## Verification

- Playwright at 1375×1011: confirm every new row appears in the rolling list with its icon, row height and spacing unchanged, no horizontal overflow, no runtime errors.
- Check the build log is clean.
- Add and close out a roadmap item for this change.
