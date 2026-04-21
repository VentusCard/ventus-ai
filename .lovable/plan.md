

## Short answer

**No, not really.** Financial-distress detection in `detect-risk-transactions` today is a single sentence in the LLM prompt — *"Payday/predatory loans, pawn shops, crypto mixing services"* — with no deterministic detector, no keyword surface, no severity scaling, and no coverage of debt collection, check cashing, money services, prepaid reloads, or early-wage-access apps. It's the same gap we just closed for Adult Entertainment and Gambling.

## Change

Add a **Financial Distress** category group that mirrors the gambling architecture: a deterministic merchant/MCC keyword pre-pass with a per-subcategory risk weight, and a weighted severity score. Update the LLM prompt and `LABEL_ALIASES` so model output collapses to canonical labels.

## Subcategory taxonomy (most-specific wins, highest FVI weight first)

| Label | Risk weight | Examples (merchant keyword surface) |
|---|---|---|
| **Pawn Shops & Short-Term Credit** | 5 | Payday: Check Into Cash, ACE Cash Express, Advance America, Speedy Cash, MoneyMutual, CashNetUSA, Check 'n Go, LendUp, Cash Store. Title loans: TitleMax, LoanMax, TMX Finance, 1-800LoanMart. Pawn: EZPawn, Cash America Pawn, First Cash Pawn, Pawn America, "PAWN SHOP", "PAWNBROKER". Early wage access: EarnIn, Dave (DAVE INC), Brigit, MoneyLion Instacash, Empower (EMPOWER FINANCE), Albert, Klover. MCC 6051 + payday/cash-advance keyword. |
| **Debt Collection & Debt Relief** | 5 | Collections: Portfolio Recovery, Midland Credit, Encore Capital, LVNV Funding, Cavalry Portfolio, ERC, Convergent Outsourcing, Resurgent Capital, "COLLECTION AGENCY", "COLLECTIONS DEPT". Debt settlement: National Debt Relief, Freedom Debt Relief, Accredited Debt Relief, CuraDebt, ClearOne Advantage, Pacific Debt. Bankruptcy: anything containing "BANKRUPTCY ATTY", "BANKRUPTCY LAW", "CH 7 ATTORNEY", "CH 13 ATTORNEY", "UPSOLVE". |
| **Check Cashing & Money Services** | 4 | Check cashing: ACE Check Cashing, PLS Check Cashing, "CHECK CASHING", "CHECK CASHERS". Remittance: Western Union (WU, WESTERN UNION), MoneyGram, Ria Money Transfer, Xoom, Remitly, WorldRemit. Prepaid reloads: GreenDot reload, NetSpend reload, "MONEYPAK", "RELOADIT", PayPal Reload, Vanilla Reload. MCC 4829 (wire transfer / money order) and MCC 6051 (non-FI quasi-cash) when paired with these keywords. |
| **Subprime Credit & Buy-Here-Pay-Here** | 3 | Credit-builder/subprime cards: Credit One Bank, First Premier Bank, Mission Lane, OpenSky, Indigo, Milestone, Reflex, Surge. BHPH auto: "BUY HERE PAY HERE", DriveTime, J.D. Byrider, Carvana subprime financing. Rent-to-own: Rent-A-Center, Aaron's, Buddy's Home Furnishings, "RENT TO OWN", "RTO". |
| **Overdraft & NSF Activity** | 4 | Bank-issued fees on the customer's own account: descriptions containing "OVERDRAFT FEE", "NSF FEE", "INSUFFICIENT FUNDS", "RETURNED ITEM FEE", "EXTENDED OVERDRAFT". Volume matters more than single occurrences — severity scales with count. |
| **Crypto Mixing & High-Risk Crypto** | 4 | Mixers/tumblers: "TORNADO CASH", "WASABI WALLET", "SAMOURAI", "COINJOIN". P2P-cash crypto: LocalBitcoins, Paxful. Privacy-coin-only desks. (Generic exchanges like Coinbase / Kraken / Gemini are NOT flagged here.) |
| **Financial Distress** (generic fallback) | 2 | MCC 6051 (quasi-cash) or MCC 4829 with no specific bucket match. |

## Detection rules

- **Disambiguation**: PayPal / Cash App by themselves are not flagged — only when descriptor contains "RELOAD", "MONEYPAK", or paired with MCC 6051. Coinbase / Kraken / Gemini → NEVER flagged in Crypto Mixing bucket.
- **Overdraft fees** are detected from `description` field (not `merchant_name`) since they're issued by the customer's own bank.
- **Severity scaling** (per customer, applied per flag):
  ```
  weightedScore = Σ (riskWeight × txCount per subcategory) + (totalSpend / 250)
                + bonus(+3) if first-time pawn/payday/title hit (cohort-level — flagged as "first observed")
                + bonus(+5) if any debt-collection / bankruptcy hit
  
  high   if any debt-collection/bankruptcy hit, OR weightedScore ≥ 10, OR ≥ 3 pawn/payday hits
  medium if weightedScore ≥ 4, OR ≥ 2 hits in any single bucket, OR ≥ 5 overdraft fees
  low    otherwise (e.g. one Western Union remittance, one EarnIn advance)
  ```
- Reason strings reference bucket + matched keyword + first-time / pattern context, e.g.:
  - `"Pawn Shops & Short-Term Credit — payday lender. Matched 'ACE CASH EXPRESS'. First observed in this period — strongest single-hit FVI signal."`
  - `"Debt Collection & Debt Relief — third-party collector. Matched 'PORTFOLIO RECOVERY'. Late-stage distress; pre-charge-off marker."`
  - `"Overdraft & NSF Activity — 7 overdraft fees totaling $245 in the analyzed period. Pattern of recurring liquidity shortfalls."`

## Files Changed

**`supabase/functions/detect-risk-transactions/index.ts`**
1. Add the seven keyword arrays + `detectFinancialDistress(merchant, description, mcc)` resolver alongside `detectGambling` and `detectAdultEntertainment`.
2. Add a new `category_group` value: `"financial_distress"` (extend the union type from three groups to four).
3. Insert a new pre-pass in `deterministicFlags` that runs after gambling and adult passes, skips already-flagged tx ids, aggregates per-subcategory counts/totals, computes `weightedScore` with the bonuses above, and emits one flag per matched transaction. Overdraft fees aggregate into a single "pattern" flag rather than per-transaction noise.
4. Update `SYSTEM_PROMPT`: replace the one-line payday/pawn mention with a new `4. **financial_distress**` section listing all seven subcategories and explicit "always pick the most specific subcategory" guidance. Add `"financial_distress"` to the `category_group` enum and the new labels to the `category_label` examples.
5. Extend `LABEL_ALIASES` so model variants collapse to canonical labels: `"payday loan"`, `"pawn"`, `"title loan"`, `"early wage access"`, `"cash advance"` → `"Pawn Shops & Short-Term Credit"`; `"debt collection"`, `"debt settlement"`, `"bankruptcy"`, `"collections"` → `"Debt Collection & Debt Relief"`; `"check cashing"`, `"money order"`, `"remittance"`, `"wire transfer service"`, `"prepaid reload"` → `"Check Cashing & Money Services"`; `"subprime card"`, `"buy here pay here"`, `"rent to own"` → `"Subprime Credit & Buy-Here-Pay-Here"`; `"overdraft"`, `"nsf"`, `"insufficient funds"` → `"Overdraft & NSF Activity"`; `"crypto mixer"`, `"tumbler"`, `"coinjoin"` → `"Crypto Mixing & High-Risk Crypto"`.

**`supabase/functions/generate-product-actions/index.ts`** + **`supabase/functions/generate-product-cards/index.ts`**
- Extend the risk-card label lists in both system prompts to include the seven new financial-distress labels so downstream cards render the specific subcategory.
- For the new financial-distress labels, action guidance follows the existing VICE risk-card tone (calm, discreet, never marketing): standard → "Notify Customer Care Team", "Suppress Credit-Card Marketing", "Flag for Wellness Review"; wow → "Hardship Program Outreach", "Confidential Financial Coaching", "Free Overdraft-Protection Setup", "Discreet Financial Counselor Referral". Forbidden labels list already covers "rewards/bonus/upgrade/celebration".

## Out of scope (intentionally)

- FVI dashboard already has its own distress taxonomy (`src/lib/fviData.ts`) — leave untouched.
- No CSV / sample-data changes.
- No client-side rendering changes — risk panels render `category_label` verbatim.

## Verification

- `/demo` → any customer with a payday / pawn / collections / Western Union / overdraft transaction → flags now show specific subcategory under the new financial_distress group.
- Insert `ACE CASH EXPRESS` MCC 6051 row → fires as **Pawn Shops & Short-Term Credit**, severity **high** (first-time bonus).
- Insert `PORTFOLIO RECOVERY ASSOC` row → fires as **Debt Collection & Debt Relief**, severity **high** (auto-high on any hit).
- Insert one `WESTERN UNION` row → fires as **Check Cashing & Money Services**, severity **low**; insert four → severity **medium**.
- Insert seven `OVERDRAFT FEE` description rows → single aggregated **Overdraft & NSF Activity** flag, severity **medium**.
- Insert `COINBASE` / `KRAKEN` rows → NOT flagged (excluded from Crypto Mixing bucket).
- Edge function logs: `weightedScore` math visible per customer; no duplicate flags per transaction across adult/gambling/distress passes.

