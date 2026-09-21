# Deckmo phones: personalize for Ricky, not Sarah

## Problem
The Rewards and Products (Membership) phone mockups on slides 6 and 7 greet "Sarah" because `src/lib/deckmoBankdemoFixture.ts` builds its customer from `DEMO_CUSTOMERS[0]` — Sarah Mitchell. The rest of the deck (Recent Transactions phone, 360° slide) is Ricky J #45275487.

## Change (one file: `src/lib/deckmoBankdemoFixture.ts`)
- Keep all of Sarah's data (offers, product cards, life events, enriched transactions — tennis/Hawaii/pets themes already match Ricky's established signals) but override the identity before export:
  - Clone the customer object and set `profile.name` to **"Ricky J"** so every greeting reads "Welcome, Ricky" / "Curated for Ricky" (both phone views derive the first name by splitting the full name).
- No changes to `demoData.ts`, `ExecDemoPhoneView`, or any other page — `/demo` and `/bankdemo` keep Sarah untouched.

## Verification
- Playwright at 1540×855 on slides 6.x and 7.x: phones show "Welcome, Ricky" and "Curated for Ricky"; no "Sarah" anywhere on deckmo.
- Confirm `/demo` still shows Sarah's phone (unchanged).
- Confirm build log clean.
