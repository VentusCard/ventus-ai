## Coordinate persona pill rollups with risk pills

### The bug

When the SF customer's CSV contains DraftKings, Stake.com, Bellagio, etc., the persona LLM (`synthesize-persona`) emits a **lifestyle rollup pill** like *"Occasional Sports Betting & Casino"* — surfacing gambling as if it were a hobby (Tennis, Skiing, Hawaiian vacations).

In parallel, `detect-risk-transactions` already classifies the same merchants under proper risk labels (`Sports Betting`, `Casino & Table Games`, `High-Risk / Offshore Gambling`, `BNPL`, `Payday Advance`, `Adult Entertainment`, etc.) which render in the Risk section of `ExecDemoIntelPanel`.

Result: the same transactions appear twice — once celebrated as a lifestyle, once flagged as a vice — with conflicting tone (violates our "avoid stress/risk terminology in customer copy; frame opportunity not risk" rule, while *also* breaking the inverse — risk content showing up as a customer-facing lifestyle).

### Root cause

`synthesize-persona` already defers to **detected_life_events** when there's a thematic overlap, but it has no knowledge of **risk_flags**. Categories the risk engine owns (gambling, vice, payday/BNPL, collections, offshore wires, adult) are free game for the persona LLM to package as cute lifestyle habits.

The orchestrator (`ExecDemoPage.firePersonaSynthesis`) currently fires `detect-risk-transactions` *after* persona synthesis completes (line 441), so even if the prompt accepted risk hints, none would be available yet.

### Fix — three coordinated changes

**1. `src/pages/ExecDemoPage.tsx` — fire risk detection in parallel with classification, gate persona synthesis on it**

`detect-risk-transactions` runs against the **raw CSV** (not enriched output), so it has no dependency on classification. Today it's gated behind persona synthesis for no real reason — it can start much earlier.

Restructure:
- In `fireClassification` (line 120), kick off `fireRiskDetection()` immediately alongside the SSE classification request — both run from the raw CSV in parallel.
- Change `firePersonaSynthesis` (line 202) to **await** the risk result before calling the `synthesize-persona` edge function. Use a small promise that resolves when `riskFlagsRef.current` is populated (or when `riskLoading` flips false with no flags). Add a 6-second timeout fallback so a slow risk call never blocks the demo entirely.
- Pass two new fields into the `synthesize-persona` body:
  - `riskCategoriesPresent: string[]` — distinct `category_label` values from `riskFlags.flags` (e.g. `["Sports Betting", "Casino & Table Games", "BNPL Activity"]`).
  - `riskTransactionIds: string[]` — the `transaction_id`s of every flagged transaction, so the LLM knows exactly which rows to keep out of any lifestyle rollup.
- Remove the duplicate `fireRiskDetection()` call at line 441 (it's now already in flight from `fireClassification`).

**2. `supabase/functions/synthesize-persona/index.ts` — accept and enforce risk awareness**

Mirror the existing `lifeEventSuppressionBlock` pattern with a new `riskSuppressionBlock`. When `riskCategoriesPresent` is non-empty, inject a `**CRITICAL — RISK SIGNALS WIN OVER LIFESTYLE PILLS:**` section listing the categories in scope and instructing:

- DROP any pillar_rollup that thematically maps to a present risk category. Examples:
  - Sports Betting / Casino / Gambling present → no `*Betting*`, `*Casino*`, `*Gambler*`, `*Sportsbook*`, `*Vegas Trips*` (when Vegas activity is gambling-driven), `*High Roller*`, `*Wagering*` rollups.
  - Adult Entertainment → no `*Adult*` or nightlife rollup built on those merchants.
  - BNPL / Payday Advance / Collections → no `*Smart Borrower*`, `*Buy-Now-Pay-Later Shopper*`, `*Cash Flow Manager*` rollups.
  - High-Risk / Offshore → no `*Crypto Trader*`, `*Global Money Mover*` rollup built on flagged rows.
- Add a permanent vocabulary ban (always enforced, regardless of whether risk fired this run) for these tokens in rollup labels: `Betting`, `Sportsbook`, `Casino`, `Wager`, `Wagering`, `Gambler`, `Gambling`, `High Roller`, `Cash Advance`, `Payday`, `BNPL`, `Collections`, `Adult`, `Vice`. These belong exclusively to the Risk surface.
- Forbid the LLM from including any transaction whose ID appears in `riskTransactionIds` inside `transaction_indices` for any lifestyle rollup. Those rows are owned by the Risk pill.

Add the new fields to the request schema, default them to empty arrays, and document them in the function header comments.

**3. `src/components/exec-demo/ExecDemoIntelPanel.tsx` — defensive client-side filter**

Even with prompt hardening, models drift. Add a final filter when assembling `rollupStats` and `availableSignals`:
- Build `riskTxIdSet = Set<string>` from `riskFlags.flags.map(f => f.transaction_id)`.
- For each persona `pillarRollup`, drop any `txIndex` whose underlying `enrichedTxs[idx].transaction_id` is in `riskTxIdSet`.
- If after filtering a rollup has < 2 remaining transactions, drop the rollup entirely.
- Additionally, regex-strip any rollup whose `label` matches `/betting|sportsbook|casino|wager|gambl|payday|bnpl|cash advance|adult/i`. Log a `console.warn` so we notice if it ever fires (the prompt should have caught it upstream).

This guarantees the UI never double-shows a transaction under both a lifestyle pill and a risk pill, regardless of LLM output.

### Tradeoff acknowledged

Gating persona synthesis on risk detection adds a small amount of perceived latency (whichever of the two LLM calls is slower becomes the critical path instead of just classification + persona). The 6-second timeout fallback bounds the worst case — if risk detection is slow or fails, persona still ships, just without the suppression hint, and the client-side filter (change #3) still prevents the double-display.

### Files affected

- `src/pages/ExecDemoPage.tsx` — kick off risk detection from `fireClassification`; await it in `firePersonaSynthesis`; pass `riskCategoriesPresent` + `riskTransactionIds`; remove duplicate post-synthesis risk call.
- `supabase/functions/synthesize-persona/index.ts` — accept the two new fields, build `riskSuppressionBlock`, append permanent vocabulary ban.
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — defensive filter on `rollupStats` / `availableSignals` against `riskFlags`.

### Validation

- Re-run executive demo with the SF customer (`SAMPLE_CSV` has DraftKings + Stake.com + Bellagio + Western Union) and the Chicago "Adventurer & Investor" set (BELLAGIO + BET365 + KRAKEN). Confirm:
  - "Occasional Sports Betting & Casino" no longer appears as a lifestyle pill.
  - The same transactions show up only under the Risk section.
  - No lifestyle rollup contains a flagged-risk `transaction_id` (verifiable via the rollup-click highlight strip — count should match risk-free filtered total).
- Console warning fires zero times across all six demo customers under normal LLM output.

### Out of scope

- Restructuring `detect-risk-transactions` output (categories already correct).
- Visual redesign of risk pills.
- Changing `generate-product-cards` risk handling (already accepts `risk_flags`).
