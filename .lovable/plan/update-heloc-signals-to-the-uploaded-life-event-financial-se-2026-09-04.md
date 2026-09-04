# Update HELOC signals to the uploaded Life Event + Financial set

Replace the HELOC signal catalog with the four Life Event signals and four Financial signals from the uploaded file. Remove the existing Behavioral signals for HELOC and leave Risk filters untouched.

## 1. Rewrite authored HELOC Life Event signals

In `src/lib/productAutomatedFlows.ts`, inside the `heloc` entry:

- Replace the current four life-event signals with the exact labels and evidence from the uploaded file:
  - **Major home renovation underway**
  - **Large tuition obligation starting**
  - **Large medical expense**
  - **Second property in progress**
- Remove the three current Behavioral signals (`Long-time homeowner with strong equity`, `High-interest card balances carried monthly`, `Funding projects from outside accounts`).
- Keep the flow's `estimatedAudience`, `penetration`, `defaultActive`, and positioning unchanged.

## 2. Add HELOC-specific Financial seed signals

In `src/lib/flowSignalFamilies.ts`:

- Add four new `FINANCIAL` seeds using the uploaded labels and evidence:
  - **Mortgage payment to an outside servicer**
  - **Existing HELOC at another lender**
  - **Carrying higher-cost debt**
  - **Reaching for liquidity**
- Assign them relevance `3` in `supplementalFor` for products tagged `"home"` (HELOC and Mortgage) so they surface for HELOC.
- Keep the existing home-related Financial seeds (`homeEquityBuilt`, `highInterestConsumerDebt`, `largePlannedOutflow`) but lower their relevance to `2` so the new HELOC seeds fill the Financial slots first while Mortgage still has fallback signals.
- Leave Risk eligibility logic exactly as-is.

## 3. Add contextual personalization angles

In `src/lib/flowSignalFamilies.ts`:

- Add `ARCHETYPE_ANGLE` entries for each new Financial seed label so `composeSignalMessage` produces contextual "What they get" copy instead of generic Financial fallback text.
- Add `ARCHETYPE_ANGLE` entries for each new Life Event authored label so the opened signal cards read like the rest of the /bankdemo personalization experience.

## 4. Refresh HELOC microsegments

In `src/lib/productMicrosegments.ts`:

- Rewrite the `heloc` array to match the new four Life Event signals by index, with titles, subjects, bodies, and CTAs aligned to each signal's moment (renovation, tuition, medical, second property).

## 5. Verify ordering and rendering

- `expandFlowSignals` already sorts by `SIGNAL_FAMILY_ORDER` (life-event → behavioral → financial → demographic → risk), so the card will display Life Event first, then Financial, then Demographic, then Risk.
- `FAMILY_CAP` already allows 4 Financial and 3 Demographic signals; with no authored Behavioral signals, the new Financial seeds will have room to appear.
- Run `bun run build` and use Playwright to open `/bankdemo` → Automated Flows → HELOC and confirm the signal list renders the new Life Event and Financial signals in family order.

## Out of scope

- No backend or edge-function changes; all data remains mocked.
- No changes to the HELOC product benefits in `productFlowBenefits.ts`.
- No changes to Risk filters, family caps, or UI structure.
- Strict light theme and existing styling remain untouched.
