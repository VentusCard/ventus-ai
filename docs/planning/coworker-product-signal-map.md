# Coworker product → signal map

Generated from `backend/shared/coworker/fixtures/product-catalog.json` v3. Fit counts are against the 28-household demo book (`adv_zoheb`).

## How a product gets chosen

`buildAudience` in `backend/shared/coworker/tasks.mjs`. Per household:

1. **Tokens** — every behavioral signal name, life-event type and risk type, plus four derived from the financial block: `idle_cash`, `home_equity`, `student_loan_balance`, `no_monthly_surplus`
2. **Blocked** — any `disqualifiers` token present and the household is out, regardless of fit
3. **Matched** — a `target_signals` hit. At least one is required. These are the reasons a product is relevant now
4. **Qualified** — a `qualifying_signals` hit adds to the score but can never create a match on its own
5. **Priced** — a fee-bearing product whose benefit does not clear the fee is dropped
6. **Corroborated** — the digest drops any row with fewer than two supporting signals

Matching is exact string equality. No fuzzy matching, no semantics — a typo silently produces zero matches.

## The map

| Product | Fits | Targets (create the match) | Qualifiers (corroborate only) | Blocks |
|---|---|---|---|---|
| `travel-card` | 5 | Travel-heavy spend<br>Dining-led discretionary | — | nsf_overdraft_cluster<br>thin_credit_file<br>aml_review<br>Cash-advance / gambling spend |
| `high-yield-savings` | 14 | idle_cash<br>Recurring savings transfers<br>Accelerating savings velocity<br>Building emergency fund | — | low_liquidity_buffer |
| `529-plan` | 4 | new_child_expected<br>Rising family spend | — | low_liquidity_buffer<br>no_monthly_surplus |
| `life-insurance` | 7 | new_child_expected<br>home_purchase_intent | — | — |
| `heloc` | 4 | home_renovation<br>Large discretionary outlays | home_equity | ltv_above_80<br>recent_late_mortgage<br>listing_active<br>thin_credit_file<br>Cash-advance / gambling spend |
| `managed-portfolio` | 7 | estate_inflow<br>Idle cash spike<br>retirement_horizon | idle_cash<br>Avoids liquidating investments | liquid_below_min |
| `trust-account` | 2 | estate_inflow<br>elder_care | — | liquid_below_min |
| `mortgage` | 4 | home_purchase_intent<br>relocation | — | dti_high<br>down_payment_short<br>residency_short<br>thin_credit_file |
| `home-insurance` | 7 | home_purchase_intent<br>home_renovation | — | address_flux |
| `student-loan-refi` | 1 | Steady student-loan servicing | student_loan_balance | income_instability<br>recent_delinquency<br>Volatile income |
| `ira` | 8 | retirement_horizon<br>Automated investing | Accelerating savings velocity | retirement_cap_met |
| `robo-advisor` | 7 | Idle cash accumulation<br>Automated investing | idle_cash | low_liquidity_buffer |
| `overdraft-protection` | 3 | nsf_overdraft_cluster<br>Volatile income<br>low_liquidity_buffer | — | — |

## The signal vocabulary

Everything a household can produce. A product can only reference these strings exactly.

**Behavioral (15)** — patterns in how they spend

- `Accelerating savings velocity`
- `Automated investing`
- `Avoids liquidating investments`
- `Building emergency fund`
- `Cash-advance / gambling spend`
- `Dining-led discretionary`
- `Idle cash accumulation`
- `Idle cash spike`
- `Large discretionary outlays`
- `Pays card in full`
- `Recurring savings transfers`
- `Rising family spend`
- `Steady student-loan servicing`
- `Travel-heavy spend`
- `Volatile income`

**Life events (7)** — something that happened, carries evidence and a date

- `elder_care`
- `estate_inflow`
- `home_purchase_intent`
- `home_renovation`
- `new_child_expected`
- `relocation`
- `retirement_horizon`

**Risk (3)** — used as blocks

- `low_liquidity_buffer`
- `nsf_overdraft_cluster`
- `thin_credit_file`

**Derived (4)** — standing financial attributes, no evidence and no date

- `idle_cash` (balance at or above the threshold)
- `home_equity`
- `student_loan_balance`
- `no_monthly_surplus`

## Signals no product uses

- `Pays card in full`

`Pays card in full` is deliberately unused. It is a creditworthiness trait, not a reason to pitch anything, and counting it as support let a one-signal row clear the digest's two-signal floor.

## Disqualifiers that can never fire

Listed as blocks, but no household signal produces them. Documentation of intent rather than live gates — they will do nothing until real data carries these tokens.

- `address_flux`
- `aml_review`
- `down_payment_short`
- `dti_high`
- `income_instability`
- `liquid_below_min`
- `listing_active`
- `ltv_above_80`
- `recent_delinquency`
- `recent_late_mortgage`
- `residency_short`
- `retirement_cap_met`
