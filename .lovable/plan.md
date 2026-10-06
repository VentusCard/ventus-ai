# More signal pills for Ricky (/deckmo) — internal only

## Goal
Grow Ricky's "VENTUS CUSTOMER INTELLIGENCE" panel from 8 pills to 12 (~50% more), using only internal signals — things the bank can already see in Ricky's own transactions. No new external signals; the existing two (High pet expenditure, Car loan expiring) stay unchanged.

## New pills (4, all internal)

Each is backed by transactions already in Ricky's 91-row ledger (existing rows get an extra signal tag — no new rows, no count changes):

1. **Life Events (amber): "New pet in the household"**
   - Tagged rows: Chewy (01/19), Mid-Peninsula Animal Hospital (03/11), Petco (05/10), Chewy (08/27).
   - Pattern: pet spending began appearing this year and is now recurring — a classic first-pet life event.
   - Bank opportunity: pet insurance, new-household products; pairs with the external "High pet expenditure" pill on beat 2.5.

2. **Financial (emerald): "Growing surplus cash position"**
   - Tagged rows: the four Stripe payouts ($10,988–$13,206 monthly).
   - Pattern: business income consistently exceeds spending — cash is accumulating faster than it's being deployed.
   - Bank opportunity: deposit-gathering and wealth management (the brokerage transfers already show intent).

3. **Demographics (violet): "Premium lifestyle spending"**
   - Tagged rows: Whole Foods (3), Nordstrom, Four Seasons.
   - Pattern: consistently premium-tier merchants across grocery, retail, and dining.
   - Bank opportunity: premium card and lifestyle benefits positioning.

4. **Behavioral (blue): "Frequent rideshare usage"**
   - Tagged rows: Uber (02/21), Uber (08/03).
   - Pattern: rideshare is the visible mobility spend; no auto payments appear anywhere in the ledger.
   - Bank opportunity: auto-financing window — Ricky may not own a car.

Final family mix: Behavioral 4, Life Events 2, Financial 3, Demographics 2, Risk 1 — 12 pills total (10 internal, 2 external).

## Files
- `src/lib/deckmoRickyTransactions.ts` — add 4 keys to `RICKY_SIGNAL_LABELS`; add the signal tag to the listed transactions' `signals` arrays.
- `src/lib/deckmoScript.ts` — add 4 signal objects to `DECKMO.ricky.signals` (internal, matching family tones).

## Constraints preserved
- The two external pills, their evidence cards, and the 2.4→2.5 reveal order unchanged.
- Ledger roll, cascade animation, pill selection/filtering, and click-isolated navigation unchanged.
- Strict light theme, five-family colors (red stays reserved for risk), 1560px canvas, desktop-only behavior.
- Institution mode wording swap still applies to new labels.

## Deferred (external follow-up, not in this change)
External signals with real names (e.g., idle cash at Marcus by Goldman Sachs HYSA, mortgage financed elsewhere) can be added in a later pass.

## Validation
- Playwright on /deckmo (sessionStorage password bypass): beats 2.3, 2.4, 2.5.
- Verify all 12 pills render in the right families; each new pill filters to exactly its tagged rows; external pills unchanged; clicks don't advance the deck.
- Check 1376×855 and 1590×1024 for right-panel overflow/truncation with 12 pills; tighten compact styles only if needed.
- Confirm clean build.
