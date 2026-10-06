# More signal pills for Ricky (/deckmo)

## Goal
Grow Ricky's "VENTUS CUSTOMER INTELLIGENCE" panel from 7 pills to 11 (~50% more) with bank-relevant signals, including real external destinations such as Marcus by Goldman Sachs.

## New pills (4, all external)

Each uses the existing external-signal shape (provider, detail, timing, confidence) and the violet external treatment, and appears on beat 2.5 with the other externals:

1. **Financial (emerald): "Idle cash at Marcus by Goldman Sachs"**
   - Source: Outside deposit account data · "Recurring transfers into an external high-yield savings account" · Monthly · ongoing · Likely
   - Bank takeaway: deposit leakage — a competitive HYSA or wealth offer can win the balances back.

2. **Life Events (amber): "Mortgage financed outside the bank"**
   - Source: Outside property & lending records · "The new home's mortgage originates with First Republic" · Recent · new loan · Likely
   - Bank takeaway: the bank sees the escrow and appraisal but lost the loan — refinance/win-back window.

3. **Demographics (violet): "Prime credit tier"**
   - Source: Outside credit bureau file · "Prime tier with long history and no derogatories" · Current · verified · Likely
   - Bank takeaway: qualifies for top-tier pricing — protect and expand the relationship.

4. **Risk (rose): "Recurring crypto exchange funding"**
   - Source: Outside exchange account data · "Regular transfers to Coinbase observed outside the bank" · Monthly · ongoing · Possible
   - Bank takeaway: digital-asset exposure and a custody/service opportunity.

Note: pill labels state the observation; the bank takeaways above live in the evidence card, not the pill text.

## Small enhancement to the external evidence card
Add a one-line "Opportunity" row to the violet External Intelligence card (Source / Timing grid gains a third line) so all six external pills carry a bank-facing takeaway. The two existing externals (High pet expenditure, Car loan expiring) get short opportunity lines too.

## Files
- `src/lib/deckmoScript.ts` — add 4 signal objects to `DECKMO.ricky.signals` with `externalEvidence` (plus `opportunity` fields on all 6 externals).
- `src/components/deckmo/DeckmoDeck.tsx` — render the Opportunity line in the external evidence card. No layout redesign; pills keep the same treatment.

## Constraints preserved
- Internal pills, transaction tagging, ledger roll, cascade animation, and pill filtering behavior unchanged.
- Strict light theme, five-family colors (red stays reserved for risk), 1560px canvas, desktop-only behavior.
- Institution mode wording swap still applies to any new copy.

## Validation
- Playwright on /deckmo (password gate bypassed via sessionStorage): beats 2.4 and 2.5.
- Verify all 11 pills render in the right families, externals show their evidence card with Source/Timing/Opportunity, internal filtering still works, and clicks don't advance the deck.
- Check 1376×855 and 1590×1024 for right-panel overflow/truncation; tighten compact styles only if needed.
- Confirm clean build.
