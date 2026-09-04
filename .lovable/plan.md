# Update HELOC signals in Automated Flows

Rework the "Home Equity Line of Credit" flow so its signals cover the real reasons customers tap home equity, and surface more Financial and Demographic signals alongside Life Event / Behavioral / Risk.

## 1. Author richer Life Event / Behavioral signals on the HELOC flow

Edit the `heloc` entry in `src/lib/productAutomatedFlows.ts` (lines ~273–287). Replace the current four signals with a stronger set, ordered by family (Life Event first, Behavioral second — the expansion layer will then sort all signals into the five-family order).

Life Event:
- **Major home renovation underway** — large card charges at building-material retailers plus bank payments to contractors within a 90-day window.
- **Large medical bills expected** — recurring or large payments to hospitals, surgical centers, orthodontists, or out-of-network specialists signaling a financing need.
- **Large tuition payments starting** — new recurring tuition payments to academic institutions alongside a home-equity-rich profile.
- **Recent home purchase or sale with equity left behind** — sale proceeds or a new mortgage plus moving/renovation spend.


Behavioral:
- **Long-time homeowner with strong equity** — 5+ years of mortgage, property tax, and utility payments (equity-eligibility proxy).
- **High-interest card balances carried monthly** — persistent revolving balances with interest charges; prime consolidation candidate.
- **Funding projects from outside accounts** — incoming transfers from another bank followed by home-improvement spend.

Remove the weak standalone "Pays property taxes regularly" signal.

## 2. Add HELOC-specific Financial and Demographic seed signals

In `src/lib/flowSignalFamilies.ts`:

- Add new `FINANCIAL` seeds:
  - **Built meaningful home equity** — mortgage paid down over several years, property value appreciation inferred from tax/insurance bands.
  - **Carrying high-interest consumer debt** — recurring interest charges and revolving balances that a HELOC could consolidate.
  - **Large planned outflow ahead** — large tuition deposits, large medical payments, or renovation deposits already leaving the account.


- Add new `DEMOGRAPHIC` seeds:
  - **Long-tenure homeowner** — same property payments for 7+ years, strong equity position.
  - **Dual-income homeowner** — two payroll streams plus mortgage/property tax outflows.
  - **Pre-retiree homeowner** — age band 50–62 with a paid-down mortgage and rising discretionary home spend.

Wire these into `supplementalFor` for products tagged `"home"` (which includes HELOC and Mortgage) so they score as relevance 3 for HELOC and 2 for Mortgage.

## 3. Add personalization angles for the new seeds

Add entries to `ARCHETYPE_ANGLE` in `src/lib/flowSignalFamilies.ts` for each new seed label so the generated message is contextual, not a generic family fallback.

## 4. Show more Financial / Demographic signals per flow

Raise `FAMILY_CAP` so the richer HELOC catalog is visible:
- Financial: 3 → 4
- Demographic: 2 → 3

This affects all products, but only products with enough relevant supplemental seeds will fill the extra slots.

## 5. Verify ordering and rendering

- `expandFlowSignals` already sorts signals by `SIGNAL_FAMILY_ORDER` (life-event → behavioral → financial → demographic → risk), so the card will display them in family order regardless of array order in the catalog.
- The existing `SignalRow` UI already handles all five families via `SIGNAL_FAMILY_LABEL` and `SIGNAL_FAMILY_CLASS`.
- No changes to `ProductAutomatedFlowsView.tsx` UI structure are required.

## Out of scope

- No backend or edge-function changes; all data remains mocked.
- No changes to `productFlowBenefits.ts` — HELOC benefits copy is still accurate.
- Strict light theme and existing styling remain untouched.
