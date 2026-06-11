# Sharpen Every Flow Signal to Ventus-Unique Patterns

Rewrite the `signals` array on every flow in `src/lib/productAutomatedFlows.ts` so each `evidence` string reflects something **Ventus is uniquely positioned to detect** via multi-rail, semantically enriched transaction data — not patterns a generic bank analytics layer or Plaid-style aggregator could produce on its own.

## What "uniquely Ventus" means (the lens applied to every signal)
Sharpen evidence to lean on at least one of these capabilities:
1. **Cross-rail joins** — combining card + ACH + wire + bill-pay + P2P (Zelle/Venmo) to see a complete behavior no single rail reveals.
2. **Semantic merchant enrichment** — resolving obscured descriptors (e.g., `STRP*XYZ`, `WF8429*ACH`, `VEN*CASH`) to canonical entities, categories, life-stage tags, and counterparty identity.
3. **Recurring-payment graph** — clustering irregular but related outflows into named obligations (childcare, eldercare, alimony, tuition, club dues) that don't share a clean merchant name.
4. **Counterparty resolution** — turning anonymous wire/ACH lines into known entities (estate counsel, captive lender, foreign payroll provider, charity).
5. **Cross-rail life-stage inference** — combining signals across rails into a confident life event (e.g., baby retailer card + pediatric copay ACH + daycare bill-pay = newborn at month X).
6. **Wallet-share visibility** — detecting that a competitor product is doing what your bank could (external card paydown bill-pay, outbound brokerage ACH, neobank funding ACH).

Single-rail signals are kept only when no multi-rail version exists.

## Scope
- All 44 flows × ~3 signals each (~130 evidence lines) get rewritten.
- `label` may be tightened where the new evidence reframes it.
- `type` (`life-event` | `behavioral`) preserved per signal where appropriate.
- Signal *count* per flow stays at 3 (drop the occasional 4th to keep cards consistent) unless a strong cross-rail signal warrants a 4th.
- Constraints honored: no competitor merchant names in customer-facing text (signals are internal-facing, so descriptor patterns like `STRP*` are OK as evidence examples), "vaguely specific" tone preserved.

## Example transforms

Before → After (529 plan, newborn signal):
- Before: `"Buy Buy Baby, Carter's, pediatric copays within 90 days"`
- After: `"Card spend at baby-category merchants (resolved across 200+ DBAs) co-occurring with pediatrician HSA/copay ACH and new daycare bill-pay payee within 90 days"`

Before → After (HELOC, home renovation):
- Before: `"Home Depot, Lowe's, contractor ACH > $1,000"`
- After: `"Sustained card spend at home-improvement merchants combined with semantically resolved contractor Zelle/Venmo memos ('framing,' 'plumbing,' 'cabinets') above household baseline"`

Before → After (Wealth Management, RSU vest):
- Before: `"Quarterly RSU vest, ESPP buyback inflows"`
- After: `"Quarterly payroll-rail inflows from a brokerage transfer agent (resolved counterparty: Fidelity/Schwab equity-plan accounts) paired with same-day outbound ACH to retail brokerage"`

Before → After (Inherited IRA):
- Before: `"Single deposit from estate or trust counsel over $50k"`
- After: `"Wire inflow with descriptor resolved to estate-counsel IOLTA account, paired with prior recurring bill-pay to a probate attorney and a joint→single account state change"`

Before → After (Global Account, expat):
- Before: `"Recurring deposit from foreign-domiciled employer"`
- After: `"Wire payroll inflows with originating-bank BIC resolved to a non-US institution, plus FX card spend in the same country and outbound P2P memos in a non-English language"`

Before → After (Wedding Loan):
- Before: `"Jewelry purchase at premium retailer over $3k"`
- After: `"Single large card spend at fine-jewelry MCC, followed within 60 days by vendor-deposit bill-pay payees semantically tagged as wedding services (venue, catering, photography)"`

## How
One-shot per flow via the existing LLM script (`/tmp/regen-ms.py` updated to also rewrite signals) using the Ventus capabilities above as the system prompt. Output keyed by flow id with new `signals: [{label, evidence, type}, ...]`. Apply the patch to `productAutomatedFlows.ts`. Then re-run the microsegments regenerator so `productMicrosegments.ts` picks up the new `signalLabel`s (which encode label + evidence).

## Files touched
- `src/lib/productAutomatedFlows.ts` — `signals` arrays rewritten for all 44 flows (no schema, no UI changes)
- `src/lib/productMicrosegments.ts` — regenerated to match new signalLabels with the existing bright/non-surveillance tone

No component, routing, or styling changes.
